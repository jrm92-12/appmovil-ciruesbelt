import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  endAt,
  get,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  serverTimestamp,
  startAt,
  type DataSnapshot,
} from "firebase/database";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { realtimeDatabase } from "@/src/firebase/firebase";
import { useAuth } from "@/src/providers/auth-provider";

type Cita = {
  id: string;
  fecha: string;
  hora: string;
  motivo: string;
  paciente: string;
  fechaHoraMs: number;
  creadoEn?: number | object | null;
  creadoPor?: string | null;
  correoCreador?: string | null;
};

function parseAppointmentDate(fecha: string, hora: string) {
  const normalizedDate = fecha.trim();
  const normalizedTime = hora.trim();

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate) ||
    !/^\d{2}:\d{2}$/.test(normalizedTime)
  ) {
    return null;
  }

  const scheduledAt = new Date(`${normalizedDate}T${normalizedTime}:00`);

  if (Number.isNaN(scheduledAt.getTime())) {
    return null;
  }

  return scheduledAt;
}

function formatScheduledAt(item: Cita) {
  return new Date(item.fechaHoraMs).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTimeValue(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${hours}:${minutes}`;
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTimeLabel(date: Date) {
  return date.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapSnapshotToCitas(snapshot: DataSnapshot) {
  const rawValue = snapshot.val() as Record<string, Omit<Cita, "id">> | null;

  if (!rawValue) {
    return [] as Cita[];
  }

  return Object.entries(rawValue)
    .map(([id, value]) => ({
      id,
      ...value,
    }))
    .sort((a, b) => a.fechaHoraMs - b.fechaHoraMs);
}

export default function CitasScreen() {
  const { user } = useAuth();
  const [paciente, setPaciente] = useState("");
  const [motivo, setMotivo] = useState("");
  const [appointmentDate, setAppointmentDate] = useState<Date | null>(null);
  const [showIosDatePicker, setShowIosDatePicker] = useState(false);
  const [showIosTimePicker, setShowIosTimePicker] = useState(false);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fecha = appointmentDate ? formatDateValue(appointmentDate) : "";
  const hora = appointmentDate ? formatTimeValue(appointmentDate) : "";

  useEffect(() => {
    const citasRef = query(
      ref(realtimeDatabase, "citas"),
      orderByChild("fechaHoraMs"),
    );

    const unsubscribe = onValue(citasRef, (snapshot) => {
      setCitas(mapSnapshotToCitas(snapshot));
    });

    return unsubscribe;
  }, []);

  const getBaseAppointmentDate = () => {
    if (appointmentDate) {
      return new Date(appointmentDate);
    }

    const now = new Date();
    now.setSeconds(0, 0);
    return now;
  };

  const handleDateChange = (selectedDate: Date) => {
    const base = getBaseAppointmentDate();
    base.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );
    setAppointmentDate(base);
  };

  const handleTimeChange = (selectedDate: Date) => {
    const base = getBaseAppointmentDate();
    base.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
    setAppointmentDate(base);
  };

  const openDatePicker = () => {
    const base = getBaseAppointmentDate();

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: base,
        mode: "date",
        minimumDate: new Date(),
        onChange: (event, selectedDate) => {
          if (event.type !== "set" || !selectedDate) {
            return;
          }

          handleDateChange(selectedDate);
        },
      });
      return;
    }

    setShowIosTimePicker(false);
    setShowIosDatePicker((current) => !current);
  };

  const openTimePicker = () => {
    const base = getBaseAppointmentDate();

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: base,
        mode: "time",
        is24Hour: true,
        onChange: (event, selectedDate) => {
          if (event.type !== "set" || !selectedDate) {
            return;
          }

          handleTimeChange(selectedDate);
        },
      });
      return;
    }

    setShowIosDatePicker(false);
    setShowIosTimePicker((current) => !current);
  };

  const handleIosDateChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (!selectedDate) {
      return;
    }

    handleDateChange(selectedDate);
  };

  const handleIosTimeChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (!selectedDate) {
      return;
    }

    handleTimeChange(selectedDate);
  };

  const resetForm = () => {
    setPaciente("");
    setMotivo("");
    setAppointmentDate(null);
    setShowIosDatePicker(false);
    setShowIosTimePicker(false);
  };

  const registrarCita = async () => {
    if (!paciente || !motivo || !fecha || !hora) {
      Alert.alert(
        "Campos incompletos",
        "Completa los datos del paciente, fecha y hora.",
      );
      return;
    }

    const scheduledDate = parseAppointmentDate(fecha, hora);

    if (!scheduledDate) {
      Alert.alert("Formato invalido", "Selecciona una fecha y hora validas.");
      return;
    }

    const fechaHoraMs = scheduledDate.getTime();
    const minDateMs = fechaHoraMs - 30 * 60 * 1000;
    const maxDateMs = fechaHoraMs + 30 * 60 * 1000;

    try {
      setIsSubmitting(true);

      const conflictingSnapshot = await get(
        query(
          ref(realtimeDatabase, "citas"),
          orderByChild("fechaHoraMs"),
          startAt(minDateMs),
          endAt(maxDateMs),
        ),
      );

      if (conflictingSnapshot.exists()) {
        setIsSubmitting(false);
        Alert.alert(
          "Horario ocupado",
          "Ya existe una cita dentro del intervalo de 30 minutos para ese horario.",
        );
        return;
      }

      await push(ref(realtimeDatabase, "citas"), {
        paciente: paciente.trim(),
        motivo: motivo.trim(),
        fecha,
        hora,
        fechaHoraMs,
        creadoEn: serverTimestamp(),
        creadoPor: user?.uid ?? null,
        correoCreador: user?.email ?? null,
      });

      resetForm();
      setIsSubmitting(false);

      setTimeout(() => {
        Alert.alert(
          "Cita registrada",
          "La cita fue guardada correctamente en Realtime Database.",
        );
      }, 0);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
      Alert.alert(
        "No se pudo registrar",
        "Verifica las reglas de Realtime Database e intenta otra vez.",
      );
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formCard}>
            <ThemedText style={styles.kicker}>Clinica ciruesbelt</ThemedText>
            <ThemedText type="title" style={styles.title}>
              Agenda tu cita con nosotros!
            </ThemedText>
            <ThemedText style={styles.helper}>
              Elige tu cita, en la seccion de abajo visualizaras disponibilidad,
              recuerda tramos de 30 min por paciente!
            </ThemedText>

            <TextInput
              onChangeText={setPaciente}
              placeholder="Paciente"
              placeholderTextColor="#b3869a"
              style={styles.input}
              value={paciente}
            />
            <TextInput
              onChangeText={setMotivo}
              placeholder="Motivo de la cita"
              placeholderTextColor="#b3869a"
              style={[styles.input, styles.multilineInput]}
              value={motivo}
              multiline
            />

            <TouchableOpacity
              onPress={openDatePicker}
              style={styles.selectorButton}
            >
              <ThemedText style={styles.selectorLabel}>
                Fecha de la cita
              </ThemedText>
              <ThemedText style={styles.selectorValue}>
                {appointmentDate
                  ? formatDateLabel(appointmentDate)
                  : "Seleccionar fecha"}
              </ThemedText>
            </TouchableOpacity>

            {Platform.OS === "ios" && showIosDatePicker ? (
              <View style={styles.pickerCard}>
                <DateTimePicker
                  value={getBaseAppointmentDate()}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={handleIosDateChange}
                />
              </View>
            ) : null}

            <TouchableOpacity
              onPress={openTimePicker}
              style={styles.selectorButton}
            >
              <ThemedText style={styles.selectorLabel}>
                Hora de la cita
              </ThemedText>
              <ThemedText style={styles.selectorValue}>
                {appointmentDate
                  ? formatTimeLabel(appointmentDate)
                  : "Seleccionar hora"}
              </ThemedText>
            </TouchableOpacity>

            {Platform.OS === "ios" && showIosTimePicker ? (
              <View style={styles.pickerCard}>
                <DateTimePicker
                  value={getBaseAppointmentDate()}
                  mode="time"
                  display="spinner"
                  is24Hour
                  onChange={handleIosTimeChange}
                />
              </View>
            ) : null}

            <TouchableOpacity
              disabled={isSubmitting}
              onPress={registrarCita}
              style={styles.primaryButton}
            >
              <ThemedText style={styles.primaryButtonText}>
                {isSubmitting ? "Guardando cita..." : "Guardar cita"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.listCard}>
            <ThemedText type="subtitle">Lista de citas</ThemedText>
            <FlatList
              data={citas}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <ThemedText style={styles.emptyState}>
                  Aun no hay citas registradas. La primera aparecera aqui.
                </ThemedText>
              }
              renderItem={({ item }) => (
                <View style={styles.citaCard}>
                  <ThemedText style={styles.citaPaciente}>
                    {item.paciente}
                  </ThemedText>
                  <ThemedText style={styles.citaMeta}>
                    {formatScheduledAt(item)}
                  </ThemedText>
                  <ThemedText style={styles.citaMotivo}>
                    {item.motivo}
                  </ThemedText>
                </View>
              )}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff3f8",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 18,
  },
  formCard: {
    backgroundColor: "#f08bb1",
    borderRadius: 28,
    padding: 22,
  },
  kicker: {
    color: "#fff2f8",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  title: {
    color: "#ffffff",
    marginBottom: 10,
  },
  helper: {
    color: "#fff7fb",
    marginBottom: 18,
    lineHeight: 22,
  },
  input: {
    backgroundColor: "#fffafb",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f6c5d8",
  },
  multilineInput: {
    minHeight: 86,
    textAlignVertical: "top",
  },
  selectorButton: {
    backgroundColor: "#fffafb",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f6c5d8",
  },
  selectorLabel: {
    color: "#b03e6d",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  selectorValue: {
    color: "#55313f",
    fontSize: 16,
  },
  pickerCard: {
    backgroundColor: "#fffafb",
    borderRadius: 16,
    marginTop: -4,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#f6c5d8",
    overflow: "hidden",
  },
  primaryButton: {
    backgroundColor: "#d45d8c",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "800",
  },
  listCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f5c8d8",
  },
  list: {
    gap: 12,
    paddingTop: 14,
  },
  emptyState: {
    color: "#875f72",
    lineHeight: 22,
  },
  citaCard: {
    backgroundColor: "#fff0f6",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#f8d2e1",
  },
  citaPaciente: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  citaMeta: {
    color: "#c24e7d",
    fontWeight: "600",
    marginBottom: 6,
  },
  citaMotivo: {
    color: "#7a5868",
    lineHeight: 22,
  },
});
