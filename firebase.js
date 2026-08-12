import {
    initializeApp
    } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

    import {
      getDatabase,
        ref,
          get,
            set,
              onValue
              } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

              import {
                getAuth,
                  signInAnonymously
                  } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


                  const firebaseConfig = {

                    apiKey: "AIzaSyAa9NumsNv8tCPm50e2GmNIvL7gT01Boo",

                      authDomain: "han-tracker.firebaseapp.com",

                        databaseURL: "https://han-tracker-default-rtdb.firebaseio.com",

                          projectId: "han-tracker",

                            storageBucket: "han-tracker.firebasestorage.app",

                              messagingSenderId: "1056623787129",

                                appId: "1:1056623787129:web:68434d059b4be07e5468a8",

                                  measurementId: "G-XYVJRDEMYK"

                                  };


                                  const app = initializeApp(firebaseConfig);


                                  // ============================================================
                                  // FIREBASE DATABASE
                                  // ============================================================

                                  export const db = getDatabase(app);


                                  // ============================================================
                                  // FIREBASE AUTHENTICATION
                                  // ============================================================

                                  export const auth = getAuth(app);


                                  // Crear / recuperar sesión anónima
                                  alert("Intentando iniciar sesión anónima...");

export const anonymousUser =
  signInAnonymously(auth)
    .then(result => {

      alert(
        "UID creado correctamente:\n\n" +
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
        "ERROR DE AUTH:\n\n" +
        error.code +
        "\n\n" +
        error.message
      );

      console.error(
        "Anonymous authentication error:",
        error
      );

      throw error;

    })
                                                                              
  .catch(error => {

  console.error(
    "Anonymous authentication error:",
    error
  );

  alert(
    "ERROR DE AUTENTICACIÓN:\n\n" +
    error.code +
    "\n\n" +
    error.message
  );

  throw error;

});
                                                                                                                        // ============================================================
                                                                                                                        // EXPORTS
                                                                                                                        // ============================================================

                                                                                                                        export {
                                                                                                                          ref,
                                                                                                                            get,
                                                                                                                              set,
                                                                                                                                onValue
                                                                                                                               };