// js/admin.js - الإصدار المصحح لإدارة المنتجات
console.log("تحميل لوحة إدارة المنتجات...");

let products = [];
let currentEditingProduct = null;
let searchTerm = '';

// تنسيق السعر
function formatPrice(price) {
    return new Intl.NumberFormat('ar-YE', {
        style: 'currency',
        currency: 'YER'
    }).format(price);
}

// إنشاء رابط المشاركة
function generateShareLink(productId) {
    const baseUrl = window.location.origin + window.location.pathname.replace('admin.html', '');
    return `${baseUrl}share.html?product=${productId}`;
}

// فتح نافذة التعديل
function openEditModal(product) {
    currentEditingProduct = product;
    
    // ملء النموذج ببيانات المنتج الحالية
    document.getElementById('editAppId').value = product.id;
    document.getElementById('editAppName').value = product.name;
    document.getElementById('editAppDescription').value = product.description;
    document.getElementById('editAppVersion').value = product.version;
    document.getElementById('editAppSize').value = product.size;
    document.getElementById('editAppCategory').value = product.category;
    document.getElementById('editAppDownloadURL').value = product.downloadURL;
    document.getElementById('editAppRating').value = product.rating || '';
    document.getElementById('editAppIconURL').value = product.iconURL || '';
    document.getElementById('editAppFeatured').checked = product.featured || false;
    document.getElementById('editAppTrending').checked = product.trending || false;
    
    // إضافة حقول السعر إذا كانت موجودة
    const priceInput = document.getElementById('editAppPrice');
    const originalPriceInput = document.getElementById('editAppOriginalPrice');
    
    if (priceInput) priceInput.value = product.price || '';
    if (originalPriceInput) originalPriceInput.value = product.originalPrice || '';
    
    // إظهار النافذة
    document.getElementById('editAppModal').style.display = 'block';
}

// إغلاق نافذة التعديل
function closeEditModal() {
    document.getElementById('editAppModal').style.display = 'none';
    currentEditingProduct = null;
}

// تحديث المنتج
async function updateApp(e) {
    e.preventDefault();
    
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) loadingModal.style.display = 'block';
    
    const productId = document.getElementById('editAppId').value;
    const productData = {
        name: document.getElementById('editAppName').value.trim(),
        description: document.getElementById('editAppDescription').value.trim(),
        version: document.getElementById('editAppVersion').value.trim(),
        size: document.getElementById('editAppSize').value.trim(),
        category: document.getElementById('editAppCategory').value,
        downloadURL: document.getElementById('editAppDownloadURL').value.trim(),
        rating: document.getElementById('editAppRating').value || null,
        featured: document.getElementById('editAppFeatured').checked,
        trending: document.getElementById('editAppTrending').checked,
        updatedAt: new Date().toISOString()
    };

    // إضافة السعر إذا كان الحقل موجوداً
    const priceInput = document.getElementById('editAppPrice');
    const originalPriceInput = document.getElementById('editAppOriginalPrice');
    
    if (priceInput) productData.price = parseFloat(priceInput.value) || 0;
    if (originalPriceInput && originalPriceInput.value) {
        productData.originalPrice = parseFloat(originalPriceInput.value);
    }

    // الحصول على رابط الأيقونة إذا تم إدخاله
    const iconURL = document.getElementById('editAppIconURL').value.trim();
    if (iconURL) {
        productData.iconURL = iconURL;
    }

    try {
        // تحديث المنتج في Firebase
        if (window.firebaseDb) {
            await firebaseDb.doc(`products/${productId}`).update(productData);
            showMessage('تم تحديث المنتج بنجاح!', 'success');
        } else {
            // تحديث محلي للبيانات التجريبية
            const productIndex = products.findIndex(product => product.id === productId);
            if (productIndex !== -1) {
                products[productIndex] = { ...products[productIndex], ...productData };
                showMessage('تم تحديث المنتج بنجاح (محلي)!', 'success');
            }
        }
        
        // إغلاق النافذة
        closeEditModal();
        
        // إعادة تحميل القائمة
        await loadAdminProducts();

    } catch (error) {
        console.error("Error updating product:", error);
        showMessage('خطأ في تحديث المنتج: ' + error.message, 'error');
    } finally {
        if (loadingModal) loadingModal.style.display = 'none';
    }
}

// البحث في المنتجات (لوحة التحكم)
function searchAdminApps() {
    const searchInput = document.getElementById('adminSearchInput');
    searchTerm = searchInput.value.toLowerCase().trim();
    
    // إظهار زر إعادة الضبط إذا كان هناك بحث
    const clearSearchBtn = document.querySelector('.clear-search-btn');
    if (clearSearchBtn) {
        if (searchTerm) {
            clearSearchBtn.style.display = 'flex';
        } else {
            clearSearchBtn.style.display = 'none';
        }
    }
    
    displayAdminProducts();
    updateSearchStats();
}

// مسح البحث
function clearAdminSearch() {
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    searchTerm = '';
    
    // إخفاء زر إعادة الضبط
    const clearSearchBtn = document.querySelector('.clear-search-btn');
    if (clearSearchBtn) {
        clearSearchBtn.style.display = 'none';
    }
    
    displayAdminProducts();
    updateSearchStats();
}

// تحديث إحصائيات البحث
function updateSearchStats() {
    const searchResultsCount = document.getElementById('searchResultsCount');
    const appsCount = document.getElementById('appsCount');
    
    if (searchTerm) {
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            getCategoryName(product.category).toLowerCase().includes(searchTerm)
        );
        if (searchResultsCount) searchResultsCount.textContent = filteredProducts.length;
        if (appsCount) appsCount.textContent = `(${filteredProducts.length} منتج - نتائج البحث)`;
    } else {
        if (searchResultsCount) searchResultsCount.textContent = '-';
        if (appsCount) appsCount.textContent = `(${products.length} منتج)`;
    }
}

// نسخ رابط المشاركة
function copyShareLink(productId) {
    const shareInput = document.getElementById(`shareLink-${productId}`);
    if (shareInput) {
        shareInput.select();
        shareInput.setSelectionRange(0, 99999);
        
        try {
            navigator.clipboard.writeText(shareInput.value).then(() => {
                showMessage('تم نسخ رابط المشاركة إلى الحافظة', 'success');
            }).catch(() => {
                // Fallback for older browsers
                document.execCommand('copy');
                showMessage('تم نسخ رابط المشاركة إلى الحافظة', 'success');
            });
        } catch (error) {
            document.execCommand('copy');
            showMessage('تم نسخ رابط المشاركة إلى الحافظة', 'success');
        }
    }
}

// تحميل المنتجات
async function loadAdminProducts() {
    try {
        console.log("بدء تحميل المنتجات...");
        
        // محاولة التحميل من Firebase
        if (window.firebaseDb) {
            const querySnapshot = await firebaseDb.collection("products").get();
            products = [];
            
            querySnapshot.forEach((doc) => {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log("تم تحميل المنتجات من Firebase:", products.length);
        } else {
            // استخدام بيانات تجريبية
            products = [
                {
                    id: '1',
                    name: 'هاتف ذكي - Samsung Galaxy S23',
                    description: 'هاتف ذكي بمواصفات عالية، شاشة 6.1 بوصة، كاميرا 50 ميجابكسل، ذاكرة 128GB، معالج سريع.',
                    version: '2024',
                    size: '180',
                    category: 'electronics',
                    price: 2500,
                    originalPrice: 2800,
                    downloadURL: 'https://wa.me/967735981122?text=' + encodeURIComponent('أريد شراء المنتج: هاتف ذكي - Samsung Galaxy S23 - السعر: 2500 ريال'),
                    rating: 4.5,
                    downloads: 1500,
                    featured: true,
                    trending: true,
                    shareCount: 45,
                    iconURL: '',
                    createdAt: new Date('2024-03-15').toISOString(),
                    updatedAt: new Date('2024-03-15').toISOString()
                },
                {
                    id: '2',
                    name: 'لابتوب - Dell XPS 13',
                    description: 'لابتوب محمول بشاشة 13.4 بوصة، معالج Intel Core i7، ذاكرة 16GB، مساحة تخزين 512GB.',
                    version: '2024',
                    size: '1200',
                    category: 'electronics',
                    price: 4200,
                    originalPrice: 4800,
                    downloadURL: 'https://wa.me/967735981122?text=' + encodeURIComponent('أريد شراء المنتج: لابتوب - Dell XPS 13 - السعر: 4200 ريال'),
                    rating: 4.2,
                    downloads: 2300,
                    trending: true,
                    shareCount: 67,
                    iconURL: '',
                    createdAt: new Date('2024-03-14').toISOString(),
                    updatedAt: new Date('2024-03-14').toISOString()
                }
            ];
            console.log("استخدام البيانات التجريبية (Firebase غير متوفر):", products.length);
        }
        
        // الترتيب المخصص: المميزة أولاً، ثم الشائعة، ثم المحدثة حديثاً
        products.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            
            if (a.trending && !b.trending) return -1;
            if (!a.trending && b.trending) return 1;
            
            const aDate = a.updatedAt || a.createdAt;
            const bDate = b.updatedAt || b.createdAt;
            return new Date(bDate) - new Date(aDate);
        });
        
        console.log("تم تحميل المنتجات:", products.length);
        updateStats();
        displayAdminProducts();
    } catch (error) {
        console.error("Error loading products:", error);
        const adminProductsList = document.getElementById('adminAppsList');
        if (adminProductsList) {
            adminProductsList.innerHTML = '<p style="color: red;">خطأ في تحميل المنتجات: ' + error.message + '</p>';
        }
    }
}

// تحديث الإحصائيات
function updateStats() {
    const totalApps = document.getElementById('totalApps');
    const activeApps = document.getElementById('activeApps');
    
    if (totalApps) totalApps.textContent = products.length;
    if (activeApps) activeApps.textContent = products.length;
    updateSearchStats();
    console.log("تم تحديث الإحصائيات:", products.length);
}

// عرض المنتجات في لوحة التحكم
function displayAdminProducts() {
    const container = document.getElementById('adminAppsList');
    if (!container) return;
    
    // تصفية المنتجات حسب البحث
    let filteredProducts = products;
    if (searchTerm) {
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            getCategoryName(product.category).toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredProducts.length === 0) {
        if (searchTerm) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-search"></i>
                    <p>لم يتم العثور على منتجات تطابق البحث</p>
                    <small>بحثت عن: "${searchTerm}"</small>
                </div>
            `;
        } else {
            container.innerHTML = '<p>لا توجد منتجات مضافة بعد</p>';
        }
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => {
        const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        
        return `
        <div class="admin-app-card">
            <div class="app-header">
                ${product.iconURL ? `<div class="app-icon"><img src="${product.iconURL}" alt="${product.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\'${getProductIcon(product.category)}\\'></i>'"></div>` : 
                  `<div class="app-icon"><i class="${getProductIcon(product.category)}"></i></div>`}
                <div class="app-info">
                    <h4>${product.name}</h4>
                    <div class="app-meta">
                        <span>الموديل: ${product.version}</span>
                        <span>الوزن: ${product.size} جرام</span>
                    </div>
                </div>
            </div>
            <div class="app-description-container">
                <p class="app-description">${product.description}</p>
                ${product.description && product.description.length > 100 ? '<span class="show-more">عرض المزيد</span>' : ''}
            </div>
            <div class="product-pricing-admin">
                <div class="current-price-admin">${formatPrice(product.price)}</div>
                ${product.originalPrice ? `
                    <div class="original-price-admin">${formatPrice(product.originalPrice)}</div>
                    <div class="discount-admin">${discount}% خصم</div>
                ` : ''}
            </div>
            <div class="app-meta">
                <span>التصنيف: ${getCategoryName(product.category)}</span>
                ${product.rating ? `<span>التقييم: ${product.rating}/5</span>` : ''}
            </div>
            <div class="app-meta">
                ${product.featured ? '<span class="badge featured">⭐ مميز</span>' : ''}
                ${product.trending ? '<span class="badge trending">🔥 شائع</span>' : ''}
                <span class="downloads">${product.downloads || 0} طلب</span>
            </div>
            <div class="share-link-section">
                <label>رابط المنتج:</label>
                <div class="share-link-container">
                    <a href="${generateShareLink(product.id)}" target="_blank" class="share-link-preview">فتح صفحة المنتج</a>
                    <input type="text" id="shareLink-${product.id}" value="${generateShareLink(product.id)}" readonly class="share-link-input">
                    <button class="btn-copy" onclick="copyShareLink('${product.id}')">نسخ</button>
                </div>
            </div>
            
            <div class="admin-app-actions">
                <button class="btn-edit" onclick="openEditModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">تعديل</button>
                <button class="btn-delete" onclick="deleteAdminApp('${product.id}')">حذف المنتج</button>
            </div>
        </div>
    `}).join('');
    
    // إضافة مستمعات الأحداث لعرض المزيد
    document.querySelectorAll('.show-more').forEach(btn => {
        btn.addEventListener('click', function() {
            const description = this.previousElementSibling;
            if (description.classList.contains('expanded')) {
                description.classList.remove('expanded');
                this.textContent = 'عرض المزيد';
            } else {
                description.classList.add('expanded');
                this.textContent = 'عرض أقل';
            }
        });
    });
    
    console.log("تم عرض المنتجات في لوحة التحكم");
}

// إضافة منتج جديد
function initializeAddAppForm() {
    const form = document.getElementById('addAppForm');
    const messageDiv = document.getElementById('formMessage');
    const loadingModal = document.getElementById('loadingModal');

    if (!form) {
        console.error('لم يتم العثور على النموذج!');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("تم الضغط على إضافة منتج");
        
        // إظهار نافذة التحميل
        if (loadingModal) loadingModal.style.display = 'block';
        
        // الحصول على البيانات من النموذج
        const productData = {
            name: document.getElementById('appName').value.trim(),
            description: document.getElementById('appDescription').value.trim(),
            version: document.getElementById('appVersion').value.trim(),
            size: document.getElementById('appSize').value.trim(),
            category: document.getElementById('appCategory').value,
            downloadURL: document.getElementById('appDownloadURL').value.trim(),
            rating: document.getElementById('appRating').value || null,
            featured: document.getElementById('appFeatured').checked,
            trending: document.getElementById('appTrending').checked,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            downloads: 0,
            shareCount: 0
        };

        // إضافة السعر افتراضياً
        productData.price = 1000; // سعر افتراضي
        productData.originalPrice = null;

        // إنشاء رابط واتساب تلقائي إذا لم يتم توفيره
        if (!productData.downloadURL) {
            const message = `أريد شراء المنتج: ${productData.name}`;
            productData.downloadURL = `https://wa.me/967735981122?text=${encodeURIComponent(message)}`;
        }

        // الحصول على رابط الأيقونة إذا تم إدخاله
        const iconURL = document.getElementById('appIconURL').value.trim();
        if (iconURL) {
            productData.iconURL = iconURL;
        }

        console.log("بيانات المنتج:", productData);

        // التحقق من الحقول المطلوبة
        if (!productData.name || !productData.description || !productData.version || 
            !productData.size || !productData.category || !productData.downloadURL) {
            showMessage('يرجى ملء جميع الحقول المطلوبة', 'error');
            if (loadingModal) loadingModal.style.display = 'none';
            return;
        }

        try {
            // إضافة المنتج إلى Firebase
            if (window.firebaseDb) {
                console.log("جاري إضافة المنتج إلى Firebase...");
                const docRef = await firebaseDb.collection("products").add(productData);
                console.log("تم إضافة المنتج بنجاح! ID:", docRef.id);
                showMessage('تم إضافة المنتج بنجاح!', 'success');
            } else {
                // إضافة محلية للبيانات التجريبية
                const newProduct = {
                    ...productData,
                    id: 'product-' + Date.now()
                };
                products.push(newProduct);
                showMessage('تم إضافة المنتج بنجاح (محلي)!', 'success');
            }

            // إعادة تعيين النموذج
            form.reset();

            // إعادة تحميل القائمة
            await loadAdminProducts();

        } catch (error) {
            console.error("Error adding product:", error);
            showMessage('خطأ في إضافة المنتج: ' + error.message, 'error');
        } finally {
            // إخفاء نافذة التحميل
            if (loadingModal) loadingModal.style.display = 'none';
        }
    });

    console.log("تم تهيئة نموذج إضافة المنتج");
}

// تهيئة نموذج التعديل
function initializeEditAppForm() {
    const form = document.getElementById('editAppForm');
    if (form) {
        form.addEventListener('submit', updateApp);
    }
    
    // إغلاق النافذة عند النقر على X
    const closeBtn = document.querySelector('#editAppModal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEditModal);
    }
    
    // إغلاق النافذة عند النقر خارجها
    const modal = document.getElementById('editAppModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEditModal();
            }
        });
    }
}

// حذف المنتج
async function deleteAdminApp(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
        console.log("جاري حذف المنتج:", productId);
        
        if (window.firebaseDb) {
            await firebaseDb.doc(`products/${productId}`).delete();
        } else {
            // حذف محلي للبيانات التجريبية
            products = products.filter(product => product.id !== productId);
        }
        
        showMessage('تم حذف المنتج بنجاح', 'success');
        await loadAdminProducts(); // إعادة تحميل القائمة
    } catch (error) {
        console.error("Error deleting product:", error);
        showMessage('خطأ في حذف المنتج: ' + error.message, 'error');
    }
}

// الحصول على أيقونة المنتج حسب التصنيف
function getProductIcon(category) {
    const icons = {
        'electronics': 'fas fa-mobile-alt',
        'fashion': 'fas fa-tshirt',
        'home': 'fas fa-home',
        'sports': 'fas fa-basketball-ball',
        'books': 'fas fa-book',
        'beauty': 'fas fa-spa'
    };
    return icons[category] || 'fas fa-shopping-bag';
}

// الحصول على اسم التصنيف
function getCategoryName(category) {
    const categories = {
        'electronics': 'إلكترونيات',
        'fashion': 'أزياء',
        'home': 'منزل',
        'sports': 'رياضة',
        'books': 'كتب',
        'beauty': 'جمال'
    };
    return categories[category] || category;
}

// عرض الرسائل
function showMessage(text, type) {
    const messageDiv = document.getElementById('formMessage');
    if (messageDiv) {
        messageDiv.textContent = text;
        messageDiv.style.color = type === 'success' ? 'green' : 'red';
        messageDiv.style.padding = '10px';
        messageDiv.style.margin = '10px 0';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.backgroundColor = type === 'success' ? '#e8f5e8' : '#ffe8e8';
        messageDiv.style.border = type === 'success' ? '1px solid #27ae60' : '1px solid #e74c3c';
        
        // إخفاء الرسالة بعد 5 ثواني
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.style.backgroundColor = 'transparent';
            messageDiv.style.border = 'none';
        }, 5000);
    }
    
    // أيضاً عرض في الكونسول
    console.log(type.toUpperCase() + ":", text);
}

// التحقق من تسجيل الدخول
function checkAdminAuth() {
    const user = localStorage.getItem('user');
    const isAdmin = localStorage.getItem('isAdmin');
    
    console.log("التحقق من المصادقة:", { user, isAdmin });
    
    if (!user || !isAdmin) {
        console.log("المستخدم غير مسجل - إعادة التوجيه إلى الصفحة الرئيسية");
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// إعداد البحث في لوحة التحكم
function setupAdminSearch() {
    const searchInput = document.getElementById('adminSearchInput');
    const searchBtn = document.querySelector('.search-bar-admin .search-btn');
    
    if (searchInput) {
        // البحث عند الضغط على Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchAdminApps();
            }
        });
        
        // البحث أثناء الكتابة (بحث فوري)
        searchInput.addEventListener('input', function() {
            if (this.value.trim() === '') {
                clearAdminSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchAdminApps);
    }
}

// تهيئة لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    console.log("تم تحميل صفحة لوحة التحكم");
    
    // التحقق من تسجيل الدخول أولاً
    if (!checkAdminAuth()) {
        return;
    }
    
    // تهيئة النماذج
    initializeAddAppForm();
    initializeEditAppForm();
    
    // إعداد البحث
    setupAdminSearch();
    
    // تحميل المنتجات
    loadAdminProducts();
    
    // إعداد زر تسجيل الخروج
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('هل تريد تسجيل الخروج؟')) {
                localStorage.removeItem('user');
                localStorage.removeItem('isAdmin');
                window.location.href = 'index.html';
            }
        });
    }
    
    console.log("تم تهيئة لوحة التحكم بالكامل");
});

// جعل الدوال متاحة globally
window.deleteAdminApp = deleteAdminApp;
window.copyShareLink = copyShareLink;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.updateApp = updateApp;
window.searchAdminApps = searchAdminApps;
window.clearAdminSearch = clearAdminSearch;
