import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-l6UdZo44qqM-p_F7V3k63MREL0TSL0U",
  authDomain: "guess-size-finder.firebaseapp.com",
  projectId: "guess-size-finder",
  storageBucket: "guess-size-finder.firebasestorage.app",
  messagingSenderId: "754245376911",
  appId: "1:754245376911:web:fe585f2ec6c63354c189fa"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);