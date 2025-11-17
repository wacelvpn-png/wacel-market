// js/app.js - الإصدار المعدل لمتجر المنتجات
console.log("تحميل متجر المنتجات...");

let allProducts = [];
let currentFilter = 'all';
let visibleProductsCount = 5;
let currentDisplayedProducts = [];

// بيانات تجريبية للاختبار
const sampleProducts = [
    {
        id: '1',
        name: 'هاتف ذكي - Samsung Galaxy S23',
        description: 'هاتف ذكي بمواصفات عالية، شاشة 6.1 بوصة، كاميرا 50 ميجابكسل، ذاكرة 128GB، معالج سريع. مناسب للألعاب والتصوير المحترف.',
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
        description: 'لابتوب محمول بشاشة 13.4 بوصة، معالج Intel Core i7، ذاكرة 16GB، مساحة تخزين 512GB. مثالي للعمل والدراسة.',
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
    },
    {
        id: '3',
        name: 'سماعات لاسلكية - Sony WH-1000XM4',
        description: 'سماعات رأس لاسلكية مع إلغاء ضوضاء نشط، بطارية تعمل حتى 30 ساعة، جودة صوت استثنائية.',
        version: '2023',
        size: '250',
        category: 'electronics',
        price: 1200,
        originalPrice: 1500,
        downloadURL: 'https://wa.me/967735981122?text=' + encodeURIComponent('أريد شراء المنتج: سماعات لاسلكية - Sony WH-1000XM4 - السعر: 1200 ريال'),
        rating: 4.7,
        downloads: 3200,
        featured: true,
        shareCount: 89,
        iconURL: '',
        createdAt: new Date('2024-03-13').toISOString(),
        updatedAt: new Date('2024-03-13').toISOString()
    }
];

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
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl.replace('index.html', '')}share.html?product=${productId}`;
}

// الانتقال إلى صفحة المنتج
function goToProductPage(productId) {
    window.location.href = `share.html?product=${productId}`;
}

// مشاركة المنتج
async function shareProduct(productId, productName) {
    goToProductPage(productId);
}

// تحميل المنتجات من Firebase أو استخدام البيانات التجريبية
async function loadProducts() {
    try {
        console.log("بدء تحميل المنتجات...");
        
        const productsContainer = document.getElementById('apps-list');
        if (productsContainer) {
            productsContainer.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل المنتجات...</p></div>';
        }

        // محاولة التحميل من Firebase
        if (window.firebaseDb) {
            const querySnapshot = await firebaseDb.collection("products").get();
            allProducts = [];
            
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    allProducts.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                console.log("تم تحميل المنتجات من Firebase:", allProducts.length);
            } else {
                allProducts = sampleProducts;
                console.log("تم استخدام البيانات التجريبية:", allProducts.length);
            }
        } else {
            allProducts = sampleProducts;
            console.log("استخدام البيانات التجريبية (Firebase غير متوفر):", allProducts.length);
        }
        
        // الترتيب: المميزة أولاً، ثم الشائعة، ثم المحدثة حديثاً
        allProducts.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            
            if (a.trending && !b.trending) return -1;
            if (!a.trending && b.trending) return 1;
            
            const aDate = a.updatedAt || a.createdAt;
            const bDate = b.updatedAt || b.createdAt;
            return new Date(bDate) - new Date(aDate);
        });
        
        displayProducts(allProducts.slice(0, visibleProductsCount));
        setupLoadMoreButton();
        
    } catch (error) {
        console.error("خطأ في تحميل المنتجات:", error);
        
        allProducts = sampleProducts;
        allProducts.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            
            if (a.trending && !b.trending) return -1;
            if (!a.trending && b.trending) return 1;
            
            const aDate = a.updatedAt || a.createdAt;
            const bDate = b.updatedAt || b.createdAt;
            return new Date(bDate) - new Date(aDate);
        });
        
        displayProducts(allProducts.slice(0, visibleProductsCount));
        setupLoadMoreButton();
        
        const productsContainer = document.getElementById('apps-list');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>تم تحميل بيانات تجريبية للعرض</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
}

// عرض المنتجات الرئيسية
function displayProducts(products) {
    const productsContainer = document.getElementById('apps-list');
    currentDisplayedProducts = products;
    
    if (!productsContainer) {
        console.error("لم يتم العثور على عنصر apps-list");
        return;
    }
    
    if (products.length === 0) {
        productsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>لا توجد منتجات متاحة</p></div>';
        return;
    }
    
    let html = '';
    products.forEach((product) => {
        html += createProductCard(product);
    });
    
    productsContainer.innerHTML = html;
    setupDescriptionToggle();
    
    console.log("تم عرض المنتجات الرئيسية:", products.length);
}

// إنشاء بطاقة منتج
function createProductCard(product) {
    const iconClass = getProductIcon(product.category);
    const ratingStars = generateRatingStars(product.rating);
    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
    
    const productIcon = product.iconURL 
        ? `<div class="app-icon"><img src="${product.iconURL}" alt="${product.name}" onerror="this.style.display=\\'none\\'; this.parentNode.innerHTML=\\'<i class=\\'${iconClass}\\'></i>\\''"></div>`
        : `<div class="app-icon"><i class="${iconClass}"></i></div>`;
    
    return `
        <div class="app-card" data-category="${product.category}" data-id="${product.id}" onclick="goToProductPage('${product.id}')" style="cursor: pointer;">
            <div class="app-header">
                ${productIcon}
                <div class="app-info">
                    <h4>${product.name}</h4>
                    <div class="app-category">${getCategoryName(product.category)}</div>
                </div>
            </div>
            <div class="app-description-container">
                <p class="app-description">${product.description}</p>
                ${product.description && product.description.length > 100 ? '<span class="show-more">عرض المزيد</span>' : ''}
            </div>
            <div class="product-pricing">
                <div class="current-price">${formatPrice(product.price)}</div>
                ${product.originalPrice ? `
                    <div class="original-price">${formatPrice(product.originalPrice)}</div>
                    <div class="discount">${discount}% خصم</div>
                ` : ''}
            </div>
            <div class="app-meta">
                <div class="app-rating">
                    ${ratingStars}
                    <span>${product.rating || 'غير مقيم'}</span>
                </div>
                <div class="app-downloads">${product.downloads || 0} طلب</div>
            </div>
            <div class="app-date-info">
                <div class="date-item">
                    <i class="fas fa-calendar-plus"></i>
                    <span>أضيف في: ${formatDate(product.createdAt)}</span>
                </div>
            </div>
            ${product.featured ? '<div class="featured-badge">⭐ مميز</div>' : ''}
            ${product.trending ? '<div class="trending-badge">🔥 شائع</div>' : ''}
            <div class="app-actions">
                <button class="download-btn" onclick="buyProduct('${product.downloadURL}', '${product.id}', '${product.name}', ${product.price}); event.stopPropagation()">
                    <i class="fas fa-shopping-cart"></i>
                    شراء الآن
                </button>
                <button class="share-btn" onclick="goToProductPage('${product.id}'); event.stopPropagation()">
                    <i class="fas fa-share-alt"></i>
                    مشاركة
                </button>
                ${isAdmin() ? `
                    <button class="delete-btn" onclick="deleteProduct('${product.id}'); event.stopPropagation()">
                        <i class="fas fa-trash"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// تنسيق السعر
function formatPrice(price) {
    return new Intl.NumberFormat('ar-YE', {
        style: 'currency',
        currency: 'YER'
    }).format(price);
}

// إعداد زر "عرض المزيد"
function setupLoadMoreButton() {
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    if (allProducts.length > visibleProductsCount) {
        if (loadMoreContainer) loadMoreContainer.style.display = 'block';
        if (loadMoreBtn) loadMoreBtn.onclick = showMoreProducts;
    } else {
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    }
}

// عرض المزيد من المنتجات
function showMoreProducts() {
    visibleProductsCount += 5;
    const productsToShow = currentFilter === 'all' 
        ? allProducts.slice(0, visibleProductsCount)
        : allProducts.filter(product => product.category === currentFilter).slice(0, visibleProductsCount);
    
    displayProducts(productsToShow);
    setupLoadMoreButton();
}

// تحديث العرض الحالي
function updateCurrentDisplay() {
    if (currentDisplayedProducts.length > 0) {
        displayProducts(currentDisplayedProducts);
    }
}

// إضافة مستمعات الأحداث لعرض المزيد
function setupDescriptionToggle() {
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
}

// توليد نجوم التقييم
function generateRatingStars(rating) {
    if (!rating) return '<span style="color: var(--text-light);">غير مقيم</span>';
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
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

// تصفية المنتجات حسب الفئة
function filterProducts(category) {
    console.log("تصفية المنتجات حسب الفئة:", category);
    
    currentFilter = category;
    visibleProductsCount = 5;
    
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    const filteredProducts = category === 'all' 
        ? allProducts 
        : allProducts.filter(product => product.category === category);
    
    displayProducts(filteredProducts.slice(0, visibleProductsCount));
    setupLoadMoreButton();
    
    const productsList = document.getElementById('apps-list');
    if (productsList) {
        productsList.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// البحث في المنتجات
function searchProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    console.log("البحث عن:", searchTerm);
    
    const searchModal = document.getElementById('searchModal');
    if (searchModal) {
        searchModal.style.display = 'none';
    }
    
    if (!searchTerm) {
        visibleProductsCount = 5;
        displayProducts(allProducts.slice(0, visibleProductsCount));
        setupLoadMoreButton();
        return;
    }
    
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        getCategoryName(product.category).toLowerCase().includes(searchTerm)
    );
    
    visibleProductsCount = filteredProducts.length;
    displayProducts(filteredProducts);
    setupLoadMoreButton();
    
    const productsContainer = document.getElementById('apps-list');
    if (productsContainer && filteredProducts.length > 0) {
        const resultsHeader = document.createElement('div');
        resultsHeader.className = 'search-results-header';
        resultsHeader.innerHTML = `<p>عرض ${filteredProducts.length} نتيجة للبحث عن: "${searchTerm}"</p>`;
        productsContainer.insertBefore(resultsHeader, productsContainer.firstChild);
    }
}

// البحث المباشر (عند الضغط على Enter)
function performSearch() {
    searchProducts();
}

// شراء المنتج
function buyProduct(buyURL, productId, productName, productPrice) {
    console.log("شراء المنتج:", productId);
    
    const product = allProducts.find(product => product.id === productId);
    if (product) {
        product.downloads = (product.downloads || 0) + 1;
        updateCurrentDisplay();
    }
    
    // فتح رابط واتساب للطلب
    if (buyURL && buyURL.includes('wa.me')) {
        window.open(buyURL, '_blank');
    } else {
        // إنشاء رابط واتساب افتراضي
        const message = `أريد شراء المنتج: ${productName} - السعر: ${formatPrice(productPrice)}`;
        const whatsappURL = `https://wa.me/967735981122?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
    }
    
    showTempMessage('جاري فتح واتساب لإكمال الطلب...', 'success');
}

// حذف المنتج (للمسؤول فقط)
async function deleteProduct(productId) {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
        console.log("جاري حذف المنتج:", productId);
        
        const product = allProducts.find(product => product.id === productId);
        if (product && window.firebaseDb && !sampleProducts.some(sample => sample.id === productId)) {
            await firebaseDb.doc(`products/${productId}`).delete();
        }
        
        allProducts = allProducts.filter(product => product.id !== productId);
        currentDisplayedProducts = currentDisplayedProducts.filter(product => product.id !== productId);
        
        displayProducts(currentDisplayedProducts);
        setupLoadMoreButton();
        
        showTempMessage('تم حذف المنتج بنجاح', 'success');
        
    } catch (error) {
        console.error("خطأ في حذف المنتج:", error);
        showTempMessage('خطأ في حذف المنتج', 'error');
    }
}

// التحقق إذا كان المستخدم مسؤولاً
function isAdmin() {
    return localStorage.getItem('isAdmin') === 'true';
}

// عرض رسالة مؤقتة
function showTempMessage(text, type) {
    // إزالة أي رسائل سابقة
    const existingMessages = document.querySelectorAll('.temp-message');
    existingMessages.forEach(msg => msg.remove());
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `temp-message ${type}`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle"></i>
        <span>${text}</span>
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// عرض الأقسام الخاصة
function displaySpecialSection(section) {
    document.querySelectorAll('.special-section-content').forEach(el => {
        el.style.display = 'none';
    });
    
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const activeTab = document.querySelector(`.section-tab[data-section="${section}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    const sectionElement = document.getElementById(`${section}-section`);
    if (sectionElement) {
        sectionElement.style.display = 'block';
        
        let specialProducts = [];
        
        switch(section) {
            case 'featured':
                specialProducts = allProducts.filter(product => product.featured);
                break;
            case 'trending':
                specialProducts = allProducts.filter(product => product.trending);
                break;
            case 'top':
                specialProducts = allProducts.filter(product => product.rating >= 4.5);
                break;
        }
        
        const productsContainer = document.getElementById(`${section}-apps`);
        if (productsContainer) {
            if (specialProducts.length === 0) {
                productsContainer.innerHTML = '<div class="empty-state"><i class="fas fa-star"></i><p>لا توجد منتجات في هذا القسم</p></div>';
            } else {
                let html = '';
                specialProducts.forEach((product) => {
                    html += createProductCard(product);
                });
                productsContainer.innerHTML = html;
                setupDescriptionToggle();
            }
        }
        
        sectionElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// إعداد التنقل في الشريط السفلي
function setupBottomNavigation() {
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    
    bottomNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            bottomNavItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const target = this.getAttribute('href');
            console.log("النقر على:", target);
            
            switch(target) {
                case '#electronics':
                    filterProducts('electronics');
                    break;
                case '#products':
                    filterProducts('all');
                    break;
                case '#search':
                    document.getElementById('searchModal').style.display = 'block';
                    break;
            }
        });
    });
}

// إعداد أحداث الفئات للشريط الأفقي
function setupCategoryEvents() {
    const categoryFilters = document.querySelectorAll('.category-filter');
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            categoryFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// إعداد أزرار الأقسام الخاصة
function setupSectionTabs() {
    const sectionTabs = document.querySelectorAll('.section-tab');
    
    sectionTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const section = this.dataset.section;
            displaySpecialSection(section);
        });
    });
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log("تهيئة صفحة المتجر...");
    
    // تحميل المنتجات
    loadProducts();
    
    // إعداد مستمعات الأحداث للبحث
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    // إعداد التنقل في الشريط السفلي
    setupBottomNavigation();
    
    // إعداد أحداث الفئات
    setupCategoryEvents();
    
    // إعداد أزرار الأقسام الخاصة
    setupSectionTabs();
    
    console.log("تم تهيئة صفحة المتجر بالكامل");
});

// جعل الدوال متاحة globally
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.performSearch = performSearch;
window.buyProduct = buyProduct;
window.deleteProduct = deleteProduct;
window.shareProduct = shareProduct;
window.displaySpecialSection = displaySpecialSection;
window.goToProductPage = goToProductPage;
