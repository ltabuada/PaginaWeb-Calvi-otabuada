import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Estos valores NO son secretos: van al bundle del navegador por diseño.
// La seguridad viene de Firebase Auth + las reglas de Firestore (firestore.rules).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey) {
  console.error(
    '[firebase] Falta la config (VITE_FIREBASE_*). Completá el .env y ' +
    'REINICIÁ el dev server: Vite lee las variables solo al arrancar.'
  )
}

// Storage no se inicializa: el proyecto está en plan Spark, donde Cloud Storage
// no está disponible. Las imágenes y videos van a Cloudinary (src/lib/cloudinary.js).
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const auth = getAuth(app)
