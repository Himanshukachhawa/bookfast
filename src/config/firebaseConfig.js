import Firebase from "firebase";

var config = {
  apiKey: "AIzaSyA3GfFqfSjITAXoeaK_kDce__LJa8iCK7M",
  authDomain: "bookfast-cabs.firebaseapp.com",
  databaseURL:
    "https://bookfast-cabs-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bookfast-cabs",
  storageBucket: "bookfast-cabs.appspot.com",
  messagingSenderId: "4775156353",
  appId: "1:4775156353:web:e3ae6bed8e82988d914b80",
};

let app = Firebase.initializeApp(config);
export const fb = app.database();
