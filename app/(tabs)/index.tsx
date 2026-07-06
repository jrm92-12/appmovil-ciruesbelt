import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth } from '@/src/firebase/firebase';
import { signOutGoogleSession } from '@/src/auth/use-google-auth';
import { useAuth } from '@/src/providers/auth-provider';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOutGoogleSession();
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.log(error);
      Alert.alert('No se pudo cerrar sesion', 'Intenta nuevamente.');
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.banner}>
          <ThemedText style={styles.kicker}>Clinica Ciruesbelt</ThemedText>
          <ThemedText type="title" style={styles.title}>
            Panel de atencion y cola de espera
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Visualiza y solicita tu cita del dia con alegria!
          </ThemedText>
        </View>

        <View style={styles.cards}>
          <View style={styles.card}>
            <ThemedText type="subtitle">Ingresaste con:</ThemedText>
            <ThemedText style={styles.cardText}>{user?.email ?? 'Sin correo disponible'}</ThemedText>
          </View>

          <View style={styles.card}>
            <ThemedText type="subtitle">Importante:</ThemedText>
            <ThemedText style={styles.cardText}>
              Las citas se podran programar en distancias de 30 minutos, a las ya registradas.
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/citas' as never)}>
          <ThemedText style={styles.primaryButtonText}>Registrar una cita</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={() => void handleSignOut()}>
          <ThemedText style={styles.signOutText}>Me largo!</ThemedText>
        </TouchableOpacity>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff3f8',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  banner: {
    padding: 24,
    borderRadius: 28,
    backgroundColor: '#f08bb1',
    marginBottom: 22,
    
  },
  kicker: {
    color: '#fff2f8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
    fontSize: 29,
    lineHeight: 34,
    
  },
  title: {
    color: '#ffffff',
    marginBottom: 10,
    fontSize: 24,
    lineHeight: 20,
  },
  subtitle: {
    color: '#fff6fb',
    fontSize: 16,
    lineHeight: 24,
  },
  cards: {
    gap: 14,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f5c8d8',
  },
  cardText: {
    marginTop: 8,
    color: '#85566f',
  },
  primaryButton: {
    backgroundColor: '#df84a8',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  signOutButton: {
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#ffe5ef',
    borderWidth: 1,
    borderColor: '#f1bfd3',
  },
  signOutText: {
    color: '#fc3584',
    fontWeight: '700',
  },
});
