import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyABmBZt0BESOfyuP6xGFPQYo81GwYkAv2s",
  authDomain: "calvinotabuadapropiedade-9ace4.firebaseapp.com",
  projectId: "calvinotabuadapropiedade-9ace4",
  storageBucket: "calvinotabuadapropiedade-9ace4.firebasestorage.app",
  messagingSenderId: "457202492744",
  appId: "1:457202492744:web:9d97dff0de1262b02bff7d"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
