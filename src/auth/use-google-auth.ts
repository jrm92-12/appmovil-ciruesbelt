import {
  GoogleSignin,
  isCancelledResponse,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { useState } from 'react';
import { Alert } from 'react-native';

import { auth } from '@/src/firebase/firebase';

const WEB_CLIENT_ID = '1028583394125-vk3c3b45rup6k61ondnbh49av99465hn.apps.googleusercontent.com';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  offlineAccess: false,
  scopes: ['profile', 'email'],
});

type ErrorLike = {
  code?: string;
  message?: string;
};

function getFriendlyFirebaseError(error: unknown) {
  const candidate = error as ErrorLike;

  if (!candidate?.code && !candidate?.message) {
    return 'Intenta nuevamente en unos segundos.';
  }

  return [candidate.code, candidate.message].filter(Boolean).join(': ');
}

export async function signOutGoogleSession() {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    console.log(error);
  }
}

export function useGoogleAuth() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const promptGoogleAuth = async () => {
    try {
      setIsGoogleLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const response = await GoogleSignin.signIn();

      if (isCancelledResponse(response)) {
        return;
      }

      if (!isSuccessResponse(response)) {
        Alert.alert('Google no devolvio credenciales', 'Intenta nuevamente en unos segundos.');
        return;
      }

      const tokens = await GoogleSignin.getTokens();
      const idToken = response.data.idToken ?? tokens.idToken;
      const accessToken = tokens.accessToken;

      if (!idToken && !accessToken) {
        Alert.alert(
          'Google no devolvio credenciales',
          'Verifica tu cliente OAuth web y vuelve a reconstruir la app.'
        );
        return;
      }

      const credential = GoogleAuthProvider.credential(idToken ?? null, accessToken);
      await signInWithCredential(auth, credential);
    } catch (error) {
      console.log('Google auth error:', error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            Alert.alert('Google en proceso', 'Ya hay un inicio de sesion en curso.');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert(
              'Google Play Services no disponible',
              'Actualiza o habilita Google Play Services en tu telefono.'
            );
            break;
          default:
            Alert.alert('No se pudo ingresar con Google', getFriendlyFirebaseError(error));
        }
      } else {
        Alert.alert('No se pudo ingresar con Google', getFriendlyFirebaseError(error));
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return {
    isGoogleLoading,
    isGoogleReady: true,
    promptGoogleAuth,
    signOutGoogleSession,
  };
}
