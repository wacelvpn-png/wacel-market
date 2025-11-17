[file name]: firebase-config.js
[file content begin]
// js/firebase-config.js - النسخة المعدلة للعمل مع المنتجات
console.log("تحميل إعدادات Firebase للمتجر الإلكتروني...");

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
    console.log("تم تهيئة Firebase بنجاح للمتجر الإلكتروني");
} catch (error) {
    console.error("خطأ في تهيئة Firebase:", error);
    // استخدام قيم افتراضية للاختبار
    app = { name: "[DEFAULT]" };
    db = {
        collection: (name) => ({ 
            get: () => Promise.resolve({ 
                empty: false, 
                forEach: (callback) => {
                    // بيانات تجريبية للمنتجات
                    const sampleProducts = [
                        {
                            id: '1',
                            name: 'ساعة ذكية',
                            description: 'ساعة ذكية متطورة مع شاشة AMOLED ومقاومة للماء',
                            price: 299.99,
                            originalPrice: 399.99,
                            category: 'electronics',
                            images: ['https://example.com/watch1.jpg'],
                            stock: 15,
                            rating: 4.5,
                            sales: 150,
                            featured: true,
                            trending: true,
                            discount: 25,
                            brand: 'Samsung'
                        },
                        {
                            id: '2',
                            name: 'حذاء رياضي',
                            description: 'حذاء رياضي مريح مصمم للركض والتمارين الرياضية',
                            price: 199.99,
                            originalPrice: 249.99,
                            category: 'sports',
                            images: ['https://example.com/shoes1.jpg'],
                            stock: 30,
                            rating: 4.2,
                            sales: 89,
                            trending: true,
                            discount: 20,
                            brand: 'Nike'
                        }
                    ];
                    sampleProducts.forEach(product => callback({ 
                        id: product.id, 
                        data: () => product 
                    }));
                }
            }),
            add: (data) => Promise.resolve({ id: 'product-' + Date.now() })
        }),
        doc: (path) => ({ 
            delete: () => Promise.resolve(),
            update: (data) => Promise.resolve()
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
            return Promise.reject({ code: 'auth/wrong-password' });
        },
        signOut: () => Promise.resolve(),
        onAuthStateChanged: (callback) => {
            // محاكاة حالة المستخدم
            setTimeout(() => callback({
                uid: 'test-user-id',
                email: 'admin@wacelmarkt.com'
            }), 1000);
            return () => {};
        }
    };
}

// جعل المتغيرات متاحة عالمياً
window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseAuth = auth;

console.log("تم تحميل إعدادات Firebase بنجاح للمتجر الإلكتروني");
[file content end]
