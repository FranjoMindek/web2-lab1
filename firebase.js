// For Firebase JS SDK v7.20.0 and later, measurementId is optional
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDZg0uCtCuWUuiMYGFqkpzCy4X83oVNFCM",
    authDomain: "web2-lab1.firebaseapp.com",
    projectId: "web2-lab1",
    storageBucket: "web2-lab1.appspot.com",
    messagingSenderId: "182807370134",
    appId: "1:182807370134:web:0dc948c55fad32afc7e5b7",
    measurementId: "G-HFG8SB3MBT"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
