// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDfXZEkneS7amzVLPsVG3YvZeHl1ZiHT64",
  authDomain: "livechat-ba9c7.firebaseapp.com",
  databaseURL: "https://livechat-ba9c7-default-rtdb.firebaseio.com",
  projectId: "livechat-ba9c7",
  storageBucket: "livechat-ba9c7.firebasestorage.app",
  messagingSenderId: "122459761635",
  appId: "1:122459761635:web:b47aa45b8576c7fdf38ed6",
  measurementId: "G-7S9SSRV3FJ"
};
//   Firebase seting
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);