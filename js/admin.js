// js/admin.js - الإصدار المعدل لإدارة المنتجات
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

// تنسيق التاريخ والوقت للعرض
function formatDateTime(dateString) {
    if (!dateString) return 'غير محدد';
    try {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            calendar: 'gregory'
        };
        return date.toLocaleDateString('ar-SA', options);
    } catch (error) {
        return 'غير محدد';
    }
}

function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    try {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            calendar: 'gregory'
        };
        return date.toLocaleDateString('ar-SA', options);
    } catch (error) {
        return 'غير محدد';
    }
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
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductDescription').value = product.description;
    document.getElementById('editProductVersion').value = product.version;
    document.getElementById('editProductSize').value = product.size;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductOriginalPrice').value = product.originalPrice || '';
    document.getElementById('editProductDownloadURL').value = product.downloadURL;
    document.getElementById('editProductRating').value = product.rating || '';
    document.getElementById('editProductIconURL').value = product.iconURL || '';
    document.getElementById('editProductFeatured').checked = product.featured || false;
    document.getElementById('editProductTrending').checked = product.trending || false;
    
    // إظهار النافذة
    document.getElementById('editProductModal').style.display = 'block';
}

// إغلاق نافذة التعديل
function closeEditModal() {
    document.getElementById('editProductModal').style.display = 'none';
    currentEditingProduct = null;
}

// تحديث المنتج
async function updateProduct(e) {
    e.preventDefault();
    
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) loadingModal.style.display = 'block';
    
    const productId = document.getElementById('editProductId').value;
    const productData = {
        name: document.getElementById('editProductName').value.trim(),
        description: document.getElementById('editProductDescription').value.trim(),
        version: document.getElementById('editProductVersion').value.trim(),
        size: document.getElementById('editProductSize').value.trim(),
        category: document.getElementById('editProductCategory').value,
        price: parseFloat(document.getElementById('editProductPrice').value),
        originalPrice: document.getElementById('editProductOriginalPrice').value ? parseFloat(document.getElementById('editProductOriginalPrice').value) : null,
        downloadURL: document.getElementById('editProductDownloadURL').value.trim(),
        rating: document.getElementById('editProductRating').value || null,
        featured: document.getElementById('editProductFeatured').checked,
        trending: document.getElementById('editProductTrending').checked,
        updatedAt: new Date().toISOString()
    };

    // الحصول على رابط الأيقونة إذا تم إدخاله
    const iconURL = document.getElementById('editProductIconURL').value.trim();
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
function searchAdminProducts() {
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
    const productsCount = document.getElementById('productsCount');
    
    if (searchTerm) {
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            getCategoryName(product.category).toLowerCase().includes(searchTerm)
        );
        if (searchResultsCount) searchResultsCount.textContent = filteredProducts.length;
        if (productsCount) productsCount.textContent = `(${filteredProducts.length} منتج - نتائج البحث)`;
    } else {
        if (searchResultsCount) searchResultsCount.textContent = '-';
        if (productsCount) productsCount.textContent = `(${products.length} منتج)`;
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

// إنشاء رابط مشاركة جديد
async function generateNewShareLink(productId) {
    try {
        showMessage('تم تحديث رابط المشاركة', 'success');
        displayAdminProducts(); // إعادة تحميل القائمة
    } catch (error) {
        console.error("Error updating share link:", error);
        showMessage('خطأ في تحديث رابط المشاركة: ' + error.message, 'error');
    }
}

// تحميل المنتجات مع الترتيب الجديد
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
        const adminProductsList = document.getElementById('adminProductsList');
        if (adminProductsList) {
            adminProductsList.innerHTML = '<p style="color: red;">خطأ في تحميل المنتجات: ' + error.message + '</p>';
        }
    }
}

// تحديث الإحصائيات
function updateStats() {
    const totalProducts = document.getElementById('totalProducts');
    const activeProducts = document.getElementById('activeProducts');
    
    if (totalProducts) totalProducts.textContent = products.length;
    if (activeProducts) activeProducts.textContent = products.length;
    updateSearchStats();
    console.log("تم تحديث الإحصائيات:", products.length);
}

// عرض المنتجات في لوحة التحكم
function displayAdminProducts() {
    const container = document.getElementById('adminProductsList');
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
        <div class="admin-product-card">
            <div class="product-header">
                ${product.iconURL ? `<div class="product-icon"><img src="${product.iconURL}" alt="${product.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\'${getProductIcon(product.category)}\\'></i>'"></div>` : 
                  `<div class="product-icon"><i class="${getProductIcon(product.category)}"></i></div>`}
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <div class="product-meta">
                        <span>الموديل: ${product.version}</span>
                        <span>الوزن: ${product.size} جرام</span>
                    </div>
                </div>
            </div>
            <div class="product-description-container">
                <p class="product-description">${product.description}</p>
                ${product.description && product.description.length > 100 ? '<span class="show-more">عرض المزيد</span>' : ''}
            </div>
            <div class="product-pricing">
                <div class="current-price">${formatPrice(product.price)}</div>
                ${product.originalPrice ? `
                    <div class="original-price">${formatPrice(product.originalPrice)}</div>
                    <div class="discount">${discount}% خصم</div>
                ` : ''}
            </div>
            <div class="product-meta">
                <span>التصنيف: ${getCategoryName(product.category)}</span>
                ${product.rating ? `<span>التقييم: ${product.rating}/5</span>` : ''}
            </div>
            <div class="product-meta">
                ${product.featured ? '<span class="badge featured">⭐ مميز</span>' : ''}
                ${product.trending ? '<span class="badge trending">🔥 شائع</span>' : ''}
                <span class="downloads">${product.downloads || 0} طلب</span>
            </div>
            <div class="product-date-info">
                <div class="date-item">
                    <i class="fas fa-calendar-plus"></i>
                    <span>أضيف في: ${formatDateTime(product.createdAt)}</span>
                </div>
                ${product.updatedAt && product.updatedAt !== product.createdAt ? `
                    <div class="date-item">
                        <i class="fas fa-edit"></i>
                        <span>عدل في: ${formatDateTime(product.updatedAt)}</span>
                    </div>
                ` : ''}
            </div>
            <div class="share-link-section">
                <label>رابط المنتج:</label>
                <div class="share-link-container">
                    <a href="${generateShareLink(product.id)}" target="_blank" class="share-link-preview">فتح صفحة المنتج</a>
                    <input type="text" id="shareLink-${product.id}" value="${generateShareLink(product.id)}" readonly class="share-link-input">
                    <button class="btn-copy" onclick="copyShareLink('${product.id}')">نسخ</button>
                </div>
            </div>
            
            <div class="admin-product-actions">
                <button class="btn-edit" onclick="openEditModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">تعديل</button>
                <button class="btn-share" onclick="generateNewShareLink('${product.id}')">تحديث رابط المنتج</button>
                <button class="btn-delete" onclick="deleteAdminProduct('${product.id}')">حذف المنتج</button>
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
function initializeAddProductForm() {
    const form = document.getElementById('addProductForm');
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
            name: document.getElementById('productName').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            version: document.getElementById('productVersion').value.trim(),
            size: document.getElementById('productSize').value.trim(),
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            originalPrice: document.getElementById('productOriginalPrice').value ? parseFloat(document.getElementById('productOriginalPrice').value) : null,
            downloadURL: document.getElementById('productDownloadURL').value.trim(),
            rating: document.getElementById('productRating').value || null,
            featured: document.getElementById('productFeatured').checked,
            trending: document.getElementById('productTrending').checked,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            downloads: 0,
            shareCount: 0
        };

        // إنشاء رابط واتساب تلقائي إذا لم يتم توفيره
        if (!productData.downloadURL) {
            const message = `أريد شراء المنتج: ${productData.name} - السعر: ${formatPrice(productData.price)}`;
            productData.downloadURL = `https://wa.me/967735981122?text=${encodeURIComponent(message)}`;
        }

        // الحصول على رابط الأيقونة إذا تم إدخاله
        const iconURL = document.getElementById('productIconURL').value.trim();
        if (iconURL) {
            productData.iconURL = iconURL;
        }

        console.log("بيانات المنتج:", productData);

        // التحقق من الحقول المطلوبة
        if (!productData.name || !productData.description || !productData.version || 
            !productData.size || !productData.category || !productData.price) {
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
function initializeEditProductForm() {
    const form = document.getElementById('editProductForm');
    if (form) {
        form.addEventListener('submit', updateProduct);
    }
    
    // إغلاق النافذة عند النقر على X
    const closeBtn = document.querySelector('#editProductModal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeEditModal);
    }
    
    // إغلاق النافذة عند النقر خارجها
    const modal = document.getElementById('editProductModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeEditModal();
            }
        });
    }
}

// حذف المنتج
async function deleteAdminProduct(productId) {
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
        
        // عرض رسالة للمستخدم
        const adminContainer = document.querySelector('.admin-container');
        if (adminContainer) {
            adminContainer.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2 style="color: #e74c3c;">يجب تسجيل الدخول أولاً</h2>
                    <p>يجب أن تكون مسجلاً الدخول للوصول إلى لوحة التحكم</p>
                    <button onclick="goToLogin()" style="
                        background: #3498db;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 10px;
                    ">تسجيل الدخول</button>
                    <button onclick="goToHome()" style="
                        background: #95a5a6;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 10px;
                    ">العودة للصفحة الرئيسية</button>
                </div>
            `;
        }
        
        return false;
    }
    return true;
}

// الانتقال لتسجيل الدخول
function goToLogin() {
    window.location.href = 'index.html';
}

// الانتقال للصفحة الرئيسية
function goToHome() {
    window.location.href = 'index.html';
}

// إعداد البحث في لوحة التحكم
function setupAdminSearch() {
    const searchInput = document.getElementById('adminSearchInput');
    const searchBtn = document.querySelector('.search-bar-admin .search-btn');
    
    if (searchInput) {
        // البحث عند الضغط على Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchAdminProducts();
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
        searchBtn.addEventListener('click', searchAdminProducts);
    }
}

// تهيئة لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    console.log("تم تحميل صفحة لوحة التحكم");
    
    // تحديث عناوين الصفحة لعكس المنتجات
    document.title = "لوحة التحكم - إدارة المنتجات";
    const pageTitle = document.querySelector('.admin-container h2');
    if (pageTitle) pageTitle.textContent = "إدارة المنتجات";
    
    const sectionTitle = document.querySelector('.add-product-section h3');
    if (sectionTitle) sectionTitle.textContent = "إضافة منتج جديد";
    
    const managementTitle = document.querySelector('.products-management h3');
    if (managementTitle) managementTitle.textContent = "المنتجات المضافة";
    
    // التحقق من تسجيل الدخول أولاً
    if (!checkAdminAuth()) {
        return;
    }
    
    // تهيئة النماذج
    initializeAddProductForm();
    initializeEditProductForm();
    
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
window.goToLogin = goToLogin;
window.goToHome = goToHome;
window.deleteAdminProduct = deleteAdminProduct;
window.copyShareLink = copyShareLink;
window.generateNewShareLink = generateNewShareLink;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.updateProduct = updateProduct;
window.searchAdminProducts = searchAdminProducts;
window.clearAdminSearch = clearAdminSearch;
