import firebase from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBFeV8uVuTGL3Bjd4v6PUzDzBHRG8hTAJI",
  authDomain: "tenedores-1234d.firebaseapp.com",
  projectId: "tenedores-1234d",
  storageBucket: "tenedores-1234d.appspot.com",
  messagingSenderId: "254101519312",
  appId: "1:254101519312:web:074141205d5950e7b017d5",
};

export const firebaseApp = firebase.initializeApp(firebaseConfig);
