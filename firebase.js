import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
  getDatabase,
  ref,
  get,
  set,
  update,
  onValue
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import {
  getAuth,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const firebaseConfig = {

  apiKey: "AIzaSyAa9NumsNv8tCPm50e2GmNIvL7g1T01Boo",

  authDomain: "han-tracker.firebaseapp.com",

  databaseURL: "https://han-tracker-default-rtdb.firebaseio.com",

  projectId: "han-tracker",

  storageBucket: "han-tracker.firebasestorage.app",

  messagingSenderId: "1056623787129",

  appId: "1:1056623787129:web:68434d059b4be07e5468a8",

  measurementId: "G-XYVJRDEMYK"

};


const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);


export const auth = getAuth(app);


export function getCurrentUser() {

  return auth.currentUser;

}

export const anonymousUser =
  signInAnonymously(auth)
    .then(result => {

      alert(
        "✅ AUTH FUNCIONA\n\nUID:\n" +
        result.user.uid
      );

      console.log(
        "Firebase Anonymous UID:",
        result.user.uid
      );

      return result.user;

    })
    .catch(error => {

      alert(
        "❌ ERROR DE AUTH\n\n" +
        error.code +
        "\n\n" +
        error.message
      );

      console.error(
        "Anonymous authentication error:",
        error
      );

      throw error;

    });

export {
  ref,
  get,
  set,
  update,
  onValue
};
