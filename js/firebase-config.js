// js/firebase-config.js
console.log("تحميل إعدادات Firebase...");

const firebaseConfig = {
    apiKey: "AIzaSyBQ0u4oHiGcaXxNflOCOC27rjw7t1Flqng",
    authDomain: "wacel-play.firebaseapp.com",
    projectId: "wacel-play",
    storageBucket: "wacel-play.firebasestorage.app",
    messagingSenderId: "848007358914",
    appId: "1:848007358914:web:f9797be0bd9a96c7230e5b"
};

// تهيئة Firebase
let app, db, auth;

try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("✅ تم تهيئة Firebase بنجاح");
} catch (error) {
    console.error("❌ خطأ في تهيئة Firebase:", error);
}

// جعل المتغيرات متاحة عالمياً
window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseAuth = auth;
