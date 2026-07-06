import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/src/providers/auth-provider';

export default function LandingScreen() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.hero}>
        <ThemedText style={styles.kicker}>Clinica Ciruesbelt</ThemedText>
        <ThemedText type="title" style={styles.title}>
          Agenda tu cita con nosotros!
        </ThemedText>
        <ThemedText style={styles.copy}>
          Al ingresar en nuestra plataforma podras ver las citas en tiempo real por dia.
        </ThemedText>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/login' as never)}>
          <ThemedText style={styles.primaryButtonText}>Adelante!</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/register' as never)}>
          <ThemedText style={styles.secondaryButtonText}>Aun no te decides? conocenos!</ThemedText>
        </TouchableOpacity>

        {user ? (
          <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/(tabs)')}>
            <ThemedText style={styles.linkText}>Entrar al panel de citas</ThemedText>
          </TouchableOpacity>
        ) : null}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
    justifyContent: 'space-between',
    backgroundColor: '#fff3f8',
  },
  hero: {
    marginTop: 36,
    padding: 24,
    borderRadius: 28,
    backgroundColor: '#f08bb1',
  },
  kicker: {
    color: '#f8f8f8',
    fontSize: 29,
    marginBottom: 24,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    color: '#ffffff',
    fontSize: 30,
    lineHeight: 40,
    marginBottom: 14,
  },
  copy: {
    color: '#fff6fb',
    fontSize: 17,
    lineHeight: 26,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    gap: 14,
    borderWidth: 1,
    borderColor: '#f7c9db',
  },
  primaryButton: {
    backgroundColor: '#d45d8c',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#d45d8c',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#fff8fb',
  },
  secondaryButtonText: {
    color: '#d45d8c',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    paddingTop: 4,
    alignItems: 'center',
  },
  linkText: {
    color: '#c04d7c',
    fontSize: 15,
    fontWeight: '600',
  },
});