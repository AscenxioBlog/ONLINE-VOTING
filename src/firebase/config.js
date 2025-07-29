import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// const firebaseConfig = {
//   apiKey: "your-api-key-here",
//   authDomain: "your-project-id.firebaseapp.com",
//   projectId: "your-project-id",
//   storageBucket: "your-project-id.appspot.com",
//   messagingSenderId: "your-sender-id",
//   appId: "your-app-id"
// };

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPmEY68w21KCOOh9xKU_TnZp3RpaEFFRU",
  authDomain: "student-e-voting.firebaseapp.com",
  projectId: "student-e-voting",
  storageBucket: "student-e-voting.firebasestorage.app",
  messagingSenderId: "674905578271",
  appId: "1:674905578271:web:8317c05d347a86a4eaae2a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Ensure auth persistence
auth.settings = {
  appVerificationDisabledForTesting: false
};

export default app;