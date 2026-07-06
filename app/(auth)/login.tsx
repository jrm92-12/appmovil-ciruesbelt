import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth } from '@/src/firebase/firebase';
import { useGoogleAuth } from '@/src/auth/use-google-auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isGoogleLoading, promptGoogleAuth } = useGoogleAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos incompletos', 'Ingresa tu correo y tu contrasena.');
      return;
    }

    try {
      setIsSubmitting(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)');
    } catch (error) {
      console.log(error);
      Alert.alert('No se pudo iniciar sesion', 'Verifica tus credenciales e intenta otra vez.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.wrapper}>
        <View style={styles.header}>
          <ThemedText style={styles.badge}>Gestion de citas ciruesbelt</ThemedText>
          <ThemedText type="title" style={styles.title}>
            Bienvenido , inicia sesion para continuar.
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            En el panel de control podras visualizar disponibilidad y reservar ingresando con tu correo o con tu cuenta de Google.
          </ThemedText>
        </View>

        <View style={styles.form}>
          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Correo electronico"
            placeholderTextColor="#b3869a"
            style={styles.input}
            value={email}
          />
          <TextInput
            onChangeText={setPassword}
            placeholder="Contrasena"
            placeholderTextColor="#b3869a"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <TouchableOpacity disabled={isSubmitting} onPress={handleLogin} style={styles.primaryButton}>
            <ThemedText style={styles.primaryButtonText}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar con correo'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            disabled={isGoogleLoading}
            onPress={() => void promptGoogleAuth()}
            style={styles.googleButton}>
            <ThemedText style={styles.googleButtonText}>
              {isGoogleLoading ? 'Conectando con Google...' : 'Ingresar con Google'}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/register' as never)} style={styles.linkButton}>
            <ThemedText style={styles.linkText}>Crear una cuenta</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/')} style={styles.backButton}>
            <ThemedText style={styles.backText}>Volver al inicio</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff3f8',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 28,
  },
  badge: {
    color: '#d45d8c',
    fontSize: 39,
    fontWeight: '700',
    marginBottom: 10,
    lineHeight: 35,
  },
  title: {
    fontSize: 24,
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#8a6476',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    gap: 14,
    borderWidth: 1,
    borderColor: '#f5c8d8',
  },
  input: {
    borderWidth: 1,
    borderColor: '#f0c5d6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fffafb',
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: '#d45d8c',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  googleButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#fce8f1',
    borderWidth: 1,
    borderColor: '#ebb2c9',
  },
  googleButtonText: {
    color: '#b03e6d',
    fontSize: 16,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkText: {
    color: '#c14a79',
    fontWeight: '600',
  },
  backButton: {
    alignItems: 'center',
  },
  backText: {
    color: '#8d7180',
  },
});