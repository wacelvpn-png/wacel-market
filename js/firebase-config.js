// js/firebase-config.js - النسخة المعدلة للعمل بدون import
console.log("تحميل إعدادات Firebase...");

// إعدادات Firebase الجديدة
const firebaseConfig = {
    apiKey: "AIzaSyBQ0u4oHiGcaXxNflOCOC27rjw7t1Flqng",
    authDomain: "wacel-play.firebaseapp.com",
    projectId: "wacel-play",
    storageBucket: "wacel-play.firebasestorage.app",
    messagingSenderId: "848007358914",
    appId: "1:848007358914:web:f9797be0bd9a96c7230e5b"
};

// التحقق من تحميل Firebase SDK
if (typeof firebase === 'undefined') {
    console.error("Firebase SDK لم يتم تحميله بشكل صحيح");
} else {
    console.log("Firebase SDK محمل بنجاح");
}

// تهيئة Firebase
let app, db, auth;

try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("تم تهيئة Firebase بنجاح");
} catch (error) {
    console.error("خطأ في تهيئة Firebase:", error);
    // استخدام قيم افتراضية للاختبار
    app = { name: "[DEFAULT]" };
    db = {
        collection: () => ({ 
            get: () => Promise.resolve({ empty: true, forEach: () => {} }),
            add: () => Promise.resolve({ id: 'test-id' })
        }),
        doc: () => ({ 
            delete: () => Promise.resolve(),
            update: () => Promise.resolve()
        })
    };
    auth = {
        signInWithEmailAndPassword: () => Promise.reject({ code: 'auth/not-supported' }),
        signOut: () => Promise.resolve(),
        onAuthStateChanged: () => () => {}
    };
}

// جعل المتغيرات متاحة عالمياً
window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseAuth = auth;

console.log("تم تحميل إعدادات Firebase بنجاح");