// js/firebase-config.js - النسخة المحسنة
console.log("🔥 تحميل إعدادات Firebase للمتجر الإلكتروني...");

// إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
    apiKey: "AIzaSyC6h-oOG7xteSiJt2jDpSyGitiPp0aDimI",
    authDomain: "wacelmarkt.firebaseapp.com",
    projectId: "wacelmarkt",
    storageBucket: "wacelmarkt.firebasestorage.app",
    messagingSenderId: "662446208797",
    appId: "1:662446208797:web:a3cc83551d42761e4753f4"
};

// التحقق من تحميل Firebase SDK
if (typeof firebase === 'undefined') {
    console.error("❌ Firebase SDK لم يتم تحميله بشكل صحيح");
    console.log("💡 تأكد من إضافة سكريبت Firebase في head");
} else {
    console.log("✅ Firebase SDK محمل بنجاح");
}

// تهيئة Firebase
let app, db, auth;

try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("✅ تم تهيئة Firebase بنجاح للمتجر الإلكتروني");
    
    // اختبار الاتصال
    db.collection("test").get().then(() => {
        console.log("✅ اتصال Firebase يعمل بشكل صحيح");
    }).catch(error => {
        console.warn("⚠️  اتصال Firebase به مشكلة طفيفة:", error.message);
    });
    
} catch (error) {
    console.error("❌ خطأ في تهيئة Firebase:", error);
    console.log("💾 استخدام وضع الاختبار (بدون Firebase)");
    
    // استخدام قيم افتراضية للاختبار
    app = { name: "[DEFAULT]" };
    db = {
        collection: (name) => ({ 
            get: () => Promise.resolve({ 
                empty: true, 
                forEach: () => {} 
            }),
            add: (data) => {
                console.log("💾 محاكاة إضافة مستند إلى:", name, data);
                return Promise.resolve({ id: 'local-' + Date.now() });
            }
        }),
        doc: (path) => ({ 
            delete: () => {
                console.log("💾 محاكاة حذف مستند:", path);
                return Promise.resolve();
            },
            update: (data) => {
                console.log("💾 محاكاة تحديث مستند:", path, data);
                return Promise.resolve();
            }
        })
    };
    auth = {
        signInWithEmailAndPassword: (email, password) => {
            if (email === 'admin@wacelmarkt.com' && password === 'Admin123456') {
                return Promise.resolve({
                    user: {
                        uid: 'test-user-id',
                        email: email
                    }
                });
            }
            return Promise.reject({ code: 'auth/wrong-password', message: 'كلمة المرور خاطئة' });
        },
        signOut: () => Promise.resolve(),
        onAuthStateChanged: (callback) => {
            // محاكاة حالة المستخدم المسجل
            const user = localStorage.getItem('user');
            if (user) {
                setTimeout(() => callback(JSON.parse(user)), 100);
            } else {
                setTimeout(() => callback(null), 100);
            }
            return () => {};
        }
    };
}

// جعل المتغيرات متاحة عالمياً
window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseAuth = auth;

console.log("✅ تم تحميل إعدادات Firebase بنجاح للمتجر الإلكتروني");
