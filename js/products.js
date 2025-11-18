// js/products.js - الإصدار المحدث مع نظام المشاركة
console.log("🔄 تحميل متجر المنتجات مع نظام المشاركة...");

let allProducts = [];
let currentFilter = 'all';
let visibleProductsCount = 8;
let currentDisplayedProducts = [];

// بيانات تجريبية للمنتجات
const sampleProducts = [
    {
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
            'المقاومة': 'IP68'
        },
        createdAt: new Date('2024-03-15').toISOString(),
        updatedAt: new Date('2024-03-15').toISOString()
    },
    {
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
            'المقاسات': '38-45'
        },
        createdAt: new Date('2024-03-14').toISOString(),
        updatedAt: new Date('2024-03-14').toISOString()
    }
];

// تحميل المنتجات
async function loadProducts() {
    try {
        console.log("🔄 بدء تحميل المنتجات...");
        
        const productsContainer = document.getElementById('products-list');
        if (productsContainer) {
            productsContainer.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل المنتجات...</p></div>';
        }

        // محاولة التحميل من Firebase
        if (window.firebaseDb && typeof firebaseDb.collection === 'function') {
            console.log("🔥 جاري تحميل المنتجات من Firebase...");
            const querySnapshot = await firebaseDb.collection("products").get();
            allProducts = [];
            
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    allProducts.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                console.log("✅ تم تحميل المنتجات من Firebase:", allProducts.length);
            } else {
                allProducts = sampleProducts;
                console.log("📝 استخدام البيانات التجريبية:", allProducts.length);
            }
        } else {
            allProducts = sampleProducts;
            console.log("💾 استخدام البيانات التجريبية (Firebase غير متوفر):", allProducts.length);
        }
        
        // الترتيب: المميزة أولاً، ثم الأكثر مبيعاً، ثم المحدثة حديثاً
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
        console.error("❌ خطأ في تحميل المنتجات:", error);
        
        allProducts = sampleProducts;
        displayProducts(allProducts.slice(0, visibleProductsCount));
        setupLoadMoreButton();
        
        const productsContainer = document.getElementById('products-list');
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

// عرض المنتجات
function displayProducts(products) {
    const productsContainer = document.getElementById('products-list');
    currentDisplayedProducts = products;
    
    if (!productsContainer) {
        console.error("❌ لم يتم العثور على عنصر products-list");
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
    
    console.log("✅ تم عرض المنتجات:", products.length);
}

// إنشاء بطاقة منتج
function createProductCard(product) {
    const iconClass = getProductIcon(product.category);
    const ratingStars = generateRatingStars(product.rating);
    const discountBadge = product.discount ? `<div class="discount-badge">-${product.discount}%</div>` : '';
    const originalPrice = product.originalPrice ? `<span class="original-price">${product.originalPrice} ر.س</span>` : '';
    
    const productImage = product.images && product.images.length > 0 
        ? `<img src="${product.images[0]}" alt="${product.name}" class="product-image" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\'${iconClass}\\'></i>'">`
        : `<i class="${iconClass}"></i>`;
    
    return `
        <div class="product-card" data-category="${product.category}" data-id="${product.id}">
            <div class="product-image-container">
                ${discountBadge}
                ${product.featured ? '<div class="featured-badge">⭐ مميز</div>' : ''}
                ${product.trending ? '<div class="trending-badge">🔥 الأكثر مبيعاً</div>' : ''}
                <div class="product-image-wrapper">
                    ${productImage}
                </div>
            </div>
            
            <div class="product-info">
                <h4 class="product-name">${product.name}</h4>
                <div class="product-category">${getCategoryName(product.category)}</div>
                
                <div class="product-description-container">
                    <p class="product-description">${product.description}</p>
                    ${product.description && product.description.length > 80 ? '<span class="show-more">عرض المزيد</span>' : ''}
                </div>
                
                <div class="product-brand">${product.brand || ''}</div>
                
                <div class="product-price">
                    <span class="current-price">${product.price} ر.س</span>
                    ${originalPrice}
                </div>
                
                <div class="product-meta">
                    <div class="product-rating">
                        ${ratingStars}
                        <span>${product.rating || 'غير مقيم'}</span>
                    </div>
                    <div class="product-sales">${product.sales || 0} عملية بيع</div>
                </div>
                
                <div class="product-stock">
                    ${product.stock > 0 ? 
                        `<span class="in-stock">✓ متوفر (${product.stock})</span>` : 
                        '<span class="out-of-stock">✗ غير متوفر</span>'
                    }
                </div>
            </div>
            
            <div class="product-actions">
                <button class="add-to-cart-btn" onclick="addToCart('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    أضف إلى السلة
                </button>
                <button class="buy-now-btn" onclick="buyNow('${product.id}')" ${product.stock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-bolt"></i>
                    شراء سريع
                </button>
                <button class="share-btn" onclick="shareProduct('${product.id}')">
                    <i class="fas fa-share-alt"></i>
                </button>
            </div>
        </div>
    `;
}

// مشاركة المنتج - الانتقال إلى صفحة المشاركة
function shareProduct(productId) {
    console.log("📤 مشاركة المنتج:", productId);
    
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        // الانتقال إلى صفحة مشاركة المنتج
        window.location.href = `share.html?product=${productId}`;
    } else {
        showTempMessage('❌ المنتج غير موجود', 'error');
    }
}

// الحصول على أيقونة المنتج حسب التصنيف
function getProductIcon(category) {
    const icons = {
        'electronics': 'fas fa-laptop',
        'fashion': 'fas fa-tshirt',
        'home': 'fas fa-home',
        'beauty': 'fas fa-spa',
        'sports': 'fas fa-running',
        'books': 'fas fa-book',
        'food': 'fas fa-utensils',
        'health': 'fas fa-heartbeat'
    };
    return icons[category] || 'fas fa-shopping-bag';
}

// الحصول على اسم التصنيف
function getCategoryName(category) {
    const categories = {
        'electronics': 'إلكترونيات',
        'fashion': 'موضة',
        'home': 'المنزل',
        'beauty': 'الجمال',
        'sports': 'رياضة',
        'books': 'كتب',
        'food': 'طعام',
        'health': 'صحة'
    };
    return categories[category] || category;
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

// في دالة addToCart في products.js - تحديث الجزء الخاص بإضافة المنتج
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product && product.stock > 0) {
        // التأكد من أن السعر رقم صحيح
        const productWithFixedPrice = {
            ...product,
            price: parseFloat(product.price) || 0,
            stock: parseInt(product.stock) || 0
        };
        
        // استدعاء دالة addToCart من cart.js
        if (typeof window.addToCart === 'function') {
            window.addToCart(productWithFixedPrice);
            showTempMessage('✅ تم إضافة المنتج إلى السلة', 'success');
        } else {
            showTempMessage('❌ نظام السلة غير متاح', 'error');
        }
    } else {
        showTempMessage('❌ المنتج غير متوفر', 'error');
    }
}
// شراء سريع
function buyNow(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product && product.stock > 0) {
        if (typeof window.addToCart === 'function') {
            window.addToCart(product);
            // فتح سلة التسوق
            const cartModal = document.getElementById('cartModal');
            if (cartModal) {
                cartModal.style.display = 'block';
                if (typeof window.updateCartDisplay === 'function') {
                    window.updateCartDisplay();
                }
            }
        } else {
            showTempMessage('❌ نظام السلة غير متاح', 'error');
        }
    } else {
        showTempMessage('❌ المنتج غير متوفر', 'error');
    }
}

// إعداد زر "عرض المزيد"
function setupLoadMoreButton() {
    const loadMoreContainer = document.getElementById('load-more-container');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    const totalProducts = currentFilter === 'all' ? allProducts.length : 
        allProducts.filter(product => product.category === currentFilter).length;
    
    if (totalProducts > visibleProductsCount) {
        if (loadMoreContainer) loadMoreContainer.style.display = 'block';
        if (loadMoreBtn) loadMoreBtn.onclick = showMoreProducts;
    } else {
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
    }
}

// عرض المزيد من المنتجات
function showMoreProducts() {
    visibleProductsCount += 8;
    const productsToShow = currentFilter === 'all' 
        ? allProducts.slice(0, visibleProductsCount)
        : allProducts.filter(product => product.category === currentFilter).slice(0, visibleProductsCount);
    
    displayProducts(productsToShow);
    setupLoadMoreButton();
}

// تصفية المنتجات حسب الفئة
function filterProducts(category) {
    console.log("🔍 تصفية المنتجات حسب الفئة:", category);
    
    currentFilter = category;
    visibleProductsCount = 8;
    
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
    
    const productsList = document.getElementById('products-list');
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
    console.log("🔍 البحث عن:", searchTerm);
    
    const searchModal = document.getElementById('searchModal');
    if (searchModal) {
        searchModal.style.display = 'none';
    }
    
    if (!searchTerm) {
        visibleProductsCount = 8;
        displayProducts(allProducts.slice(0, visibleProductsCount));
        setupLoadMoreButton();
        return;
    }
    
    const filteredProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm) ||
        getCategoryName(product.category).toLowerCase().includes(searchTerm) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm))
    );
    
    visibleProductsCount = filteredProducts.length;
    displayProducts(filteredProducts);
    setupLoadMoreButton();
    
    const productsContainer = document.getElementById('products-list');
    if (productsContainer && filteredProducts.length > 0) {
        const resultsHeader = document.createElement('div');
        resultsHeader.className = 'search-results-header';
        resultsHeader.innerHTML = `<p>عرض ${filteredProducts.length} نتيجة للبحث عن: "${searchTerm}"</p>`;
        productsContainer.insertBefore(resultsHeader, productsContainer.firstChild);
    }
}

// البحث المباشر
function performSearch() {
    searchProducts();
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
            case 'discount':
                specialProducts = allProducts.filter(product => product.discount);
                break;
        }
        
        const productsContainer = document.getElementById(`${section}-products`);
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

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 تهيئة صفحة المتجر...");
    
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
    
    console.log("✅ تم تهيئة صفحة المتجر بالكامل");
});

// جعل الدوال متاحة globally
window.filterProducts = filterProducts;
window.searchProducts = searchProducts;
window.performSearch = performSearch;
window.addToCart = addToCart;
window.buyNow = buyNow;
window.shareProduct = shareProduct;
window.displaySpecialSection = displaySpecialSection;

// تحسين نظام المشاركة في products.js
function shareProduct(productId) {
    console.log("📤 مشاركة المنتج:", productId);
    
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        // حفظ المنتج في localStorage للوصول السريع في صفحة المشاركة
        localStorage.setItem('sharedProduct_' + productId, JSON.stringify(product));
        
        // فتح صفحة المشاركة في نافذة جديدة
        const shareUrl = `share.html?product=${productId}`;
        window.open(shareUrl, '_blank', 'width=600,height=800');
        
        showTempMessage('📤 جاري فتح صفحة المشاركة...', 'success');
    } else {
        showTempMessage('❌ المنتج غير موجود', 'error');
    }
}
