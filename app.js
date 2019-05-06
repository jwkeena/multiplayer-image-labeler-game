  // Firebase configuration
  var firebaseConfig = {
    apiKey: "AIzaSyCQcBuXgvKhbiNs4a2FTO3fEzhd_4G7J9M",
    authDomain: "multiplayer-fa27c.firebaseapp.com",
    databaseURL: "https://multiplayer-fa27c.firebaseio.com",
    projectId: "multiplayer-fa27c",
    storageBucket: "multiplayer-fa27c.appspot.com",
    messagingSenderId: "89411635735",
    appId: "1:89411635735:web:757a31e9fce84ddf"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  // Shorthand firebase variable
  const database = firebase.database();