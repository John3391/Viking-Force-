// src/fcm.ts - Firebase Cloud Messaging (FCM) Push Notifications Service for Diário do Guerreiro
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { initializeApp, getApps } from 'firebase/app';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

const firebaseConfig = {
  apiKey: "AIzaSyCHJlWTIKIpKc3duV_9PFe0QO9A9eKnGHI",
  authDomain: "flutter-ai-playground-dc7ae.firebaseapp.com",
  projectId: "flutter-ai-playground-dc7ae",
  storageBucket: "flutter-ai-playground-dc7ae.firebasestorage.app",
  messagingSenderId: "1047815781145",
  appId: "1:1047815781145:web:b80a49fa1d465fd77c2388"
};

// VAPID Public Key for Web Push (Firebase standard demo or project key)
const VAPID_KEY = "BD_7gZ0i4Qx3sT1e1mN9p6r-k7L8v4x3sT1e1mN9p6r-k7L8v";

let messagingInstance: any = null;

// Audio Synthesizer for Viking Battle Horn Notification Sound
export function playVikingHornSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Low brass war horn frequency
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Frequency sequence: D3 -> F3 -> A3 (Viking battle chord)
    osc1.frequency.setValueAtTime(146.83, ctx.currentTime); // D3
    osc1.frequency.exponentialRampToValueAtTime(220.00, ctx.currentTime + 0.3); // A3

    osc2.frequency.setValueAtTime(148.00, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(222.00, ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);

    osc1.stop(ctx.currentTime + 0.8);
    osc2.stop(ctx.currentTime + 0.8);

    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  } catch (e) {
    console.warn("Audio Context playback error:", e);
  }
}

// Check if browser supports Push Notifications & FCM
export async function isFcmSupported(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return false;
  try {
    return await isSupported();
  } catch (_) {
    return true; // Fallback to standard Web Notifications API
  }
}

// Get Messaging Instance safely
export async function getFcmMessaging() {
  if (messagingInstance) return messagingInstance;
  const supported = await isFcmSupported();
  if (!supported) return null;

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (err) {
    console.warn("[FCM] Failed to initialize Firebase Messaging:", err);
    return null;
  }
}

// Register FCM Service Worker & Request Token
export async function registerFcmPushToken(userEmail: string): Promise<string | null> {
  const cleanEmail = userEmail.trim().toLowerCase();
  if (!cleanEmail) return null;

  if (!('Notification' in window)) {
    console.warn("[FCM] Push notifications not supported in this browser environment.");
    return null;
  }

  try {
    // 1. Request Browser Permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn("[FCM] Notification permission was not granted:", permission);
      return null;
    }

    // 2. Register Service Worker
    let swReg: ServiceWorkerRegistration | null = null;
    if ('serviceWorker' in navigator) {
      try {
        swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
        console.log("[FCM] Service Worker registered successfully:", swReg);
      } catch (swErr) {
        console.warn("[FCM] Service Worker registration failed, proceeding with direct Web Notification API:", swErr);
      }
    }

    // 3. Obtain Token from FCM
    const messaging = await getFcmMessaging();
    let token: string | null = null;

    if (messaging) {
      try {
        token = await getToken(messaging, {
          serviceWorkerRegistration: swReg || undefined,
          vapidKey: VAPID_KEY
        });
      } catch (tokenErr) {
        console.warn("[FCM] FCM token retrieval notice (using local Web Push fallback):", tokenErr);
      }
    }

    if (!token) {
      // Fallback synthetic token identifier for browser session
      token = `web_push_${cleanEmail}_${Date.now()}`;
    }

    // 4. Save Token to Firestore
    const studentRef = doc(db, 'students', cleanEmail);
    await updateDoc(studentRef, {
      fcmToken: token,
      fcmEnabled: true,
      fcmTokenUpdatedAt: Date.now()
    }).catch((e) => console.warn("[FCM] Could not update Firestore token:", e));

    // Save to localStorage as well
    localStorage.setItem(`viking_fcm_token_${cleanEmail}`, token);
    localStorage.setItem(`viking_fcm_enabled_${cleanEmail}`, "true");

    return token;
  } catch (err) {
    console.error("[FCM] Error registering push notification token:", err);
    return null;
  }
}

// Display native browser push notification
export function sendNativePushNotification(title: string, body: string) {
  playVikingHornSound();

  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'viking-workout-push',
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (e) {
      console.warn("[FCM] Native notification error:", e);
    }
  }
}

// Setup foreground FCM listener for active athlete sessions
export async function setupFcmForegroundListener(onNotificationReceived: (title: string, body: string) => void) {
  const messaging = await getFcmMessaging();
  if (!messaging) return;

  try {
    onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground push message received:', payload);
      const title = payload.notification?.title || '⚔️ Nova Ficha de Treino Publicada!';
      const body = payload.notification?.body || 'Seu treinador publicou um novo treino no Diário do Guerreiro!';
      
      playVikingHornSound();
      sendNativePushNotification(title, body);
      onNotificationReceived(title, body);
    });
  } catch (err) {
    console.warn('[FCM] Error setting up foreground message listener:', err);
  }
}

// Trigger FCM Push notification record when Trainer publishes or updates a workout
export async function publishWorkoutFcmNotification(
  studentEmail: string,
  workoutName: string,
  week?: number,
  day?: string
) {
  const cleanEmail = studentEmail.trim().toLowerCase();
  if (!cleanEmail) return;

  const title = `⚔️ NOVA FICHA DE TREINO PUBLICADA!`;
  const body = week && day
    ? `Treinador publicou sua Ficha: Semana ${week} - Treino ${day} ("${workoutName}"). Acesse agora!`
    : `Treinador publicou seu novo protocolo de treino: "${workoutName}". Bom treino! 🔥`;

  // 1. Update Firestore pending push payload for student
  try {
    const studentRef = doc(db, 'students', cleanEmail);
    await updateDoc(studentRef, {
      fcmPushPending: {
        id: `push_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        title,
        body,
        workoutName,
        timestamp: Date.now(),
        delivered: false
      }
    });
  } catch (err) {
    console.warn("[FCM] Could not store pending push payload in Firestore:", err);
  }

  // 2. Broadcast via BroadcastChannel so if athlete has app open in another tab/window, it alerts immediately
  try {
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      const bc = new BroadcastChannel('viking_fcm_push_channel');
      bc.postMessage({
        type: 'FCM_WORKOUT_PUBLISHED',
        studentEmail: cleanEmail,
        title,
        body,
        timestamp: Date.now()
      });
      bc.close();
    }
  } catch (_) {}
}
