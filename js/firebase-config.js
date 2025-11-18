// js/firebase-config.js - الإصدار المصحح بالكامل مع دعم نظام المشاركة
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

// بيانات تجريبية للمنتجات لنظام المشاركة
const sampleProducts = {
    '1': {
        id: '1',
        name: 'ساعة ذكية',
        description: 'ساعة ذكية متطورة مع شاشة AMOLED ومقاومة للماء، تتبع اللياقة البدنية وإشعارات الهاتف.',
        price: 299.99,
        originalPrice: 399.99,
        category: 'electronics',
        images: ['https://via.placeholder.com/300x300?text=ساعة+ذكية'],
        stock: 15,
        rating: 4.5,
        sales: 150,
        featured: true,
        trending: true,
        discount: 25,
        brand: 'Samsung',
        specifications: {
            'الشاشة': '1.3 بوصة AMOLED',
            'البطارية': '7 أيام',
            'المقاومة': 'IP68',
            'الشحن': 'لاسلكي',
            'التطبيقات': 'iOS & Android'
        },
        createdAt: new Date('2024-03-15').toISOString(),
        updatedAt: new Date('2024-03-15').toISOString()
    },
    '2': {
        id: '2',
        name: 'حذاء رياضي',
        description: 'حذاء رياضي مريح مصمم للركض والتمارين الرياضية، يوفر دعماً ممتازاً للقدم.',
        price: 199.99,
        originalPrice: 249.99,
        category: 'sports',
        images: ['https://via.placeholder.com/300x300?text=حذاء+رياضي'],
        stock: 30,
        rating: 4.2,
        sales: 89,
        trending: true,
        discount: 20,
        brand: 'Nike',
        specifications: {
            'المادة': 'شبكة قابلة للتنفس',
            'النعل': 'رغوة الذاكرة',
            'المقاسات': '38-45',
            'اللون': 'أسود وأبيض',
            'الوزن': '280 جرام'
        },
        createdAt: new Date('2024-03-14').toISOString(),
        updatedAt: new Date('2024-03-14').toISOString()
    },
    '3': {
        id: '3',
        name: 'سماعات لاسلكية',
        description: 'سماعات رأس لاسلكية مع إلغاء الضوضاء النشط وجودة صوت عالية الدقة.',
        price: 449.99,
        category: 'electronics',
        images: ['https://via.placeholder.com/300x300?text=سماعات+لاسلكية'],
        stock: 20,
        rating: 4.7,
        sales: 67,
        featured: true,
        brand: 'Sony',
        specifications: {
            'البطارية': '30 ساعة',
            'الإلغاء': 'ضجيج نشط',
            'الاتصال': 'بلوتوث 5.0',
            'المقاومة': 'IPX4',
            'الوزن': '254 جرام'
        },
        createdAt: new Date('2024-03-13').toISOString(),
        updatedAt: new Date('2024-03-13').toISOString()
    }
};

// التحقق من تحميل Firebase SDK
if (typeof firebase === 'undefined') {
    console.error("❌ Firebase SDK لم يتم تحميله بشكل صحيح");
    console.log("💡 تأكد من إضافة سكريبت Firebase في head:");
    console.log("<script src=\"https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js\"></script>");
    console.log("<script src=\"https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js\"></script>");
    console.log("<script src=\"https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js\"></script>");
} else {
    console.log("✅ Firebase SDK محمل بنجاح");
    console.log("📦 إصدار Firebase:", firebase.SDK_VERSION);
}

// تهيئة Firebase
let app, db, auth;

try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    
    console.log("✅ تم تهيئة Firebase بنجاح للمتجر الإلكتروني");
    console.log("🔗 مشروع Firebase:", firebaseConfig.projectId);
    
    // اختبار الاتصال مع Firebase
    testFirebaseConnection();
    
} catch (error) {
    console.error("❌ خطأ في تهيئة Firebase:", error);
    console.log("💾 استخدام وضع الاختبار (بدون Firebase)");
    
    // استخدام قيم افتراضية للاختبار
    initializeMockFirebase();
}

// اختبار اتصال Firebase
async function testFirebaseConnection() {
    try {
        console.log("🔍 اختبار اتصال Firebase...");
        
        // اختبار بسيط للاتصال بمجموعة المنتجات
        const testQuery = await db.collection("products").limit(1).get();
        console.log("✅ اتصال Firebase يعمل بشكل صحيح");
        console.log(`📊 عدد المنتجات في قاعدة البيانات: ${testQuery.size}`);
        
        if (testQuery.empty) {
            console.log("💡 قاعدة البيانات فارغة، سيتم استخدام البيانات التجريبية عند الحاجة");
        }
        
    } catch (error) {
        console.error("❌ خطأ في اتصال Firebase:", error);
        console.log("💡 تأكد من:");
        console.log("   1. إعدادات Firebase صحيحة");
        console.log("   2. قاعدة البيانات مفعلة في Firebase Console");
        console.log("   3. قواعد الأمان تسمح بالقراءة/الكتابة");
    }
}

// تهيئة Firebase التجريبي للوضع المحلي
function initializeMockFirebase() {
    console.log("🔧 تهيئة Firebase التجريبي...");
    
    app = { 
        name: "[DEFAULT]",
        options: firebaseConfig
    };
    
    // إنشاء محاكاة لـ Firestore مع دعم كامل لنظام المشاركة
    db = {
        collection: (name) => {
            console.log(`📁 الوصول إلى المجموعة: ${name}`);
            
            return {
                // للحصول على جميع المستندات
                get: () => {
                    console.log(`📖 جاري جلب جميع المستندات من ${name}`);
                    
                    if (name === "products") {
                        return Promise.resolve({
                            empty: false,
                            forEach: (callback) => {
                                Object.values(sampleProducts).forEach(product => {
                                    callback({
                                        id: product.id,
                                        data: () => product
                                    });
                                });
                            },
                            docs: Object.values(sampleProducts).map(product => ({
                                id: product.id,
                                data: () => product
                            }))
                        });
                    }
                    
                    return Promise.resolve({
                        empty: true,
                        forEach: () => {}
                    });
                },
                
                // للحصول على مستند محدد (لصفحة المشاركة)
                doc: (id) => {
                    console.log(`📄 الوصول إلى المستند: ${name}/${id}`);
                    
                    return {
                        get: () => {
                            if (name === "products" && sampleProducts[id]) {
                                console.log(`✅ تم العثور على المنتج: ${sampleProducts[id].name}`);
                                return Promise.resolve({
                                    exists: true,
                                    id: id,
                                    data: () => sampleProducts[id]
                                });
                            } else {
                                console.log(`❌ المنتج غير موجود: ${id}`);
                                return Promise.resolve({
                                    exists: false,
                                    data: () => null
                                });
                            }
                        },
                        
                        // للتحديث (زيادة عداد التنزيلات/المبيعات)
                        update: (data) => {
                            console.log(`✏️ تحديث المستند: ${name}/${id}`, data);
                            
                            if (name === "products" && sampleProducts[id]) {
                                // تحديث البيانات المحلية
                                Object.assign(sampleProducts[id], data);
                                console.log(`✅ تم تحديث المنتج: ${sampleProducts[id].name}`);
                            }
                            
                            return Promise.resolve();
                        },
                        
                        // للحذف
                        delete: () => {
                            console.log(`🗑️ حذف المستند: ${name}/${id}`);
                            
                            if (name === "products" && sampleProducts[id]) {
                                delete sampleProducts[id];
                                console.log(`✅ تم حذف المنتج: ${id}`);
                            }
                            
                            return Promise.resolve();
                        }
                    };
                },
                
                // لإضافة مستند جديد
                add: (data) => {
                    console.log(`➕ إضافة مستند جديد إلى ${name}:`, data);
                    
                    const newId = 'product-' + Date.now();
                    const newProduct = {
                        ...data,
                        id: newId,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    
                    if (name === "products") {
                        sampleProducts[newId] = newProduct;
                        console.log(`✅ تم إضافة منتج جديد: ${newProduct.name} (${newId})`);
                    }
                    
                    return Promise.resolve({ id: newId });
                },
                
                // للاستعلام مع where (للبحث والتصفية)
                where: (field, operator, value) => {
                    console.log(`🔍 استعلام: ${name} حيث ${field} ${operator} ${value}`);
                    
                    return {
                        get: () => {
                            let filteredProducts = Object.values(sampleProducts);
                            
                            if (name === "products") {
                                // محاكاة الاستعلامات البسيطة
                                if (field === "category" && operator === "==") {
                                    filteredProducts = filteredProducts.filter(product => 
                                        product.category === value
                                    );
                                } else if (field === "featured" && operator === "==") {
                                    filteredProducts = filteredProducts.filter(product => 
                                        product.featured === value
                                    );
                                } else if (field === "trending" && operator === "==") {
                                    filteredProducts = filteredProducts.filter(product => 
                                        product.trending === value
                                    );
                                }
                            }
                            
                            return Promise.resolve({
                                empty: filteredProducts.length === 0,
                                forEach: (callback) => {
                                    filteredProducts.forEach(product => {
                                        callback({
                                            id: product.id,
                                            data: () => product
                                        });
                                    });
                                },
                                docs: filteredProducts.map(product => ({
                                    id: product.id,
                                    data: () => product
                                }))
                            });
                        }
                    };
                },
                
                // للترتيب والحد
                orderBy: (field, direction = 'asc') => {
                    console.log(`🔢 ترتيب ${name} حسب ${field} ${direction}`);
                    
                    return {
                        limit: (limitCount) => {
                            console.log(`📏 تحديد النتائج إلى ${limitCount}`);
                            
                            return {
                                get: () => {
                                    let products = Object.values(sampleProducts);
                                    
                                    // محاكاة الترتيب
                                    if (field === "createdAt" || field === "updatedAt") {
                                        products.sort((a, b) => {
                                            const dateA = new Date(a[field]);
                                            const dateB = new Date(b[field]);
                                            return direction === 'desc' ? dateB - dateA : dateA - dateB;
                                        });
                                    } else if (field === "price") {
                                        products.sort((a, b) => {
                                            return direction === 'desc' ? b.price - a.price : a.price - b.price;
                                        });
                                    } else if (field === "sales") {
                                        products.sort((a, b) => {
                                            return direction === 'desc' ? (b.sales || 0) - (a.sales || 0) : (a.sales || 0) - (b.sales || 0);
                                        });
                                    }
                                    
                                    // تطبيق الحد
                                    const limitedProducts = products.slice(0, limitCount);
                                    
                                    return Promise.resolve({
                                        empty: limitedProducts.length === 0,
                                        forEach: (callback) => {
                                            limitedProducts.forEach(product => {
                                                callback({
                                                    id: product.id,
                                                    data: () => product
                                                });
                                            });
                                        },
                                        docs: limitedProducts.map(product => ({
                                            id: product.id,
                                            data: () => product
                                        }))
                                    });
                                }
                            };
                        },
                        
                        get: () => {
                            let products = Object.values(sampleProducts);
                            
                            // محاكاة الترتيب بدون حد
                            if (field === "createdAt" || field === "updatedAt") {
                                products.sort((a, b) => {
                                    const dateA = new Date(a[field]);
                                    const dateB = new Date(b[field]);
                                    return direction === 'desc' ? dateB - dateA : dateA - dateB;
                                });
                            }
                            
                            return Promise.resolve({
                                empty: products.length === 0,
                                forEach: (callback) => {
                                    products.forEach(product => {
                                        callback({
                                            id: product.id,
                                            data: () => product
                                        });
                                    });
                                },
                                docs: products.map(product => ({
                                    id: product.id,
                                    data: () => product
                                }))
                            });
                        }
                    };
                },
                
                // للحد فقط
                limit: (limitCount) => {
                    console.log(`📏 تحديد النتائج إلى ${limitCount}`);
                    
                    return {
                        get: () => {
                            const products = Object.values(sampleProducts).slice(0, limitCount);
                            
                            return Promise.resolve({
                                empty: products.length === 0,
                                forEach: (callback) => {
                                    products.forEach(product => {
                                        callback({
                                            id: product.id,
                                            data: () => product
                                        });
                                    });
                                },
                                docs: products.map(product => ({
                                    id: product.id,
                                    data: () => product
                                }))
                            });
                        }
                    };
                }
            };
        }
    };
    
    // إنشاء محاكاة لـ Authentication
    auth = {
        // تسجيل الدخول
        signInWithEmailAndPassword: (email, password) => {
            console.log(`🔐 محاولة تسجيل الدخول: ${email}`);
            
            if (email === 'admin@wacelmarkt.com' && password === 'Admin123456') {
                const user = {
                    uid: 'test-user-id',
                    email: email,
                    displayName: 'مسؤول النظام',
                    emailVerified: true
                };
                
                console.log("✅ تسجيل الدخول نجح (وضع الاختبار)");
                return Promise.resolve({ user });
            } else {
                console.log("❌ تسجيل الدخول فشل: بيانات غير صحيحة");
                return Promise.reject({ 
                    code: 'auth/wrong-password', 
                    message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
                });
            }
        },
        
        // تسجيل الخروج
        signOut: () => {
            console.log("🚪 تسجيل الخروج");
            return Promise.resolve();
        },
        
        // مراقبة حالة المصادقة
        onAuthStateChanged: (callback) => {
            console.log("👀 بدء مراقبة حالة المصادقة");
            
            // محاكاة حالة المستخدم المسجل
            const checkAuthState = () => {
                const userData = localStorage.getItem('user');
                if (userData) {
                    try {
                        const user = JSON.parse(userData);
                        console.log("✅ تم اكتشاف مستخدم مسجل:", user.email);
                        callback(user);
                    } catch (e) {
                        console.log("❌ لا يوجد مستخدم مسجل");
                        callback(null);
                    }
                } else {
                    console.log("❌ لا يوجد مستخدم مسجل");
                    callback(null);
                }
            };
            
            // التحقق فوراً
            setTimeout(checkAuthState, 100);
            
            // إرجاع دالة لإلغاء الاشتراك
            return () => {
                console.log("👋 إيقاف مراقبة حالة المصادقة");
            };
        },
        
        // المستخدم الحالي
        currentUser: (() => {
            const userData = localStorage.getItem('user');
            return userData ? JSON.parse(userData) : null;
        })()
    };
    
    console.log("✅ تم تهيئة Firebase التجريبي بنجاح");
    console.log("📋 المنتجات المتاحة:", Object.keys(sampleProducts).length);
}

// وظائف مساعدة لنظام المشاركة
window.firebaseHelpers = {
    // زيادة عداد المشاهدات أو المبيعات للمنتج
    incrementProductCounter: async (productId, field = 'sales') => {
        try {
            if (window.firebaseDb && sampleProducts[productId]) {
                const currentValue = sampleProducts[productId][field] || 0;
                const newValue = currentValue + 1;
                
                if (typeof firebaseDb.collection === 'function') {
                    await firebaseDb.collection('products').doc(productId).update({
                        [field]: newValue,
                        updatedAt: new Date().toISOString()
                    });
                } else {
                    // تحديث محلي
                    sampleProducts[productId][field] = newValue;
                    sampleProducts[productId].updatedAt = new Date().toISOString();
                }
                
                console.log(`📈 تم زيادة ${field} للمنتج ${productId} إلى ${newValue}`);
                return true;
            }
        } catch (error) {
            console.error(`❌ خطأ في زيادة ${field}:`, error);
        }
        return false;
    },
    
    // الحصول على منتج بواسطة ID (لصفحة المشاركة)
    getProductById: async (productId) => {
        try {
            if (window.firebaseDb) {
                if (typeof firebaseDb.collection === 'function') {
                    const doc = await firebaseDb.collection('products').doc(productId).get();
                    if (doc.exists) {
                        return {
                            id: doc.id,
                            ...doc.data()
                        };
                    }
                } else if (sampleProducts[productId]) {
                    // استخدام البيانات المحلية
                    return sampleProducts[productId];
                }
            }
        } catch (error) {
            console.error('❌ خطأ في جلب المنتج:', error);
        }
        return null;
    },
    
    // الحصول على جميع المنتجات
    getAllProducts: async () => {
        try {
            if (window.firebaseDb) {
                if (typeof firebaseDb.collection === 'function') {
                    const querySnapshot = await firebaseDb.collection('products').get();
                    const products = [];
                    querySnapshot.forEach((doc) => {
                        products.push({
                            id: doc.id,
                            ...doc.data()
                        });
                    });
                    return products;
                } else {
                    // استخدام البيانات المحلية
                    return Object.values(sampleProducts);
                }
            }
        } catch (error) {
            console.error('❌ خطأ في جلب جميع المنتجات:', error);
        }
        return [];
    },
    
    // البحث في المنتجات
    searchProducts: async (searchTerm) => {
        try {
            const allProducts = await window.firebaseHelpers.getAllProducts();
            return allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        } catch (error) {
            console.error('❌ خطأ في البحث:', error);
        }
        return [];
    }
};

// جعل المتغيرات متاحة عالمياً
window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseAuth = auth;

console.log("✅ تم تحميل إعدادات Firebase بنجاح للمتجر الإلكتروني");
console.log("🎯 الميزات المتاحة:");
console.log("   📖 قراءة المنتجات");
console.log("   ✏️ تحديث المنتجات"); 
console.log("   ➕ إضافة منتجات جديدة");
console.log("   🗑️ حذف المنتجات");
console.log("   🔍 البحث والتصفية");
console.log("   🔗 نظام المشاركة الكامل");
console.log("   📈 إحصائيات المنتجات");

// اختبار الوظائف الأساسية
setTimeout(() => {
    console.log("🧪 اختبار الوظائف الأساسية...");
    
    // اختبار جلب المنتجات
    window.firebaseHelpers.getAllProducts().then(products => {
        console.log(`📦 عدد المنتجات المتاحة: ${products.length}`);
    });
    
    // اختبار جلب منتج محدد
    window.firebaseHelpers.getProductById('1').then(product => {
        if (product) {
            console.log(`✅ اختبار جلب المنتج: ${product.name}`);
        }
    });
}, 1000);
