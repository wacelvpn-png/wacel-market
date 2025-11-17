// js/admin.js - الإصدار المصحح بالكامل
console.log("🔄 تحميل لوحة التحكم للمنتجات...");

let products = [];
let currentEditingProduct = null;
let searchTerm = '';

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

// فتح نافذة التعديل
function openEditModal(product) {
    console.log("📝 فتح نافذة تعديل المنتج:", product.name);
    
    currentEditingProduct = product;
    
    // ملء النموذج ببيانات المنتج الحالية
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductDescription').value = product.description;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductOriginalPrice').value = product.originalPrice || '';
    document.getElementById('editProductStock').value = product.stock;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductBrand').value = product.brand || '';
    document.getElementById('editProductDiscount').value = product.discount || '';
    document.getElementById('editProductImageURL').value = product.images ? product.images[0] : '';
    document.getElementById('editProductFeatured').checked = product.featured || false;
    document.getElementById('editProductTrending').checked = product.trending || false;
    
    // معالجة المواصفات
    let specificationsText = '';
    if (product.specifications) {
        for (const [key, value] of Object.entries(product.specifications)) {
            specificationsText += `${key}: ${value}\n`;
        }
    }
    document.getElementById('editProductSpecifications').value = specificationsText;
    
    // إظهار النافذة
    document.getElementById('editProductModal').style.display = 'block';
}

// إغلاق نافذة التعديل
function closeEditModal() {
    document.getElementById('editProductModal').style.display = 'none';
    currentEditingProduct = null;
    console.log("📝 تم إغلاق نافذة التعديل");
}

// تحديث المنتج
async function updateProduct(e) {
    e.preventDefault();
    console.log("🔄 بدء تحديث المنتج...");
    
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) loadingModal.style.display = 'block';
    
    try {
        const productId = document.getElementById('editProductId').value;
        const productData = {
            name: document.getElementById('editProductName').value.trim(),
            description: document.getElementById('editProductDescription').value.trim(),
            price: parseFloat(document.getElementById('editProductPrice').value),
            stock: parseInt(document.getElementById('editProductStock').value),
            category: document.getElementById('editProductCategory').value,
            featured: document.getElementById('editProductFeatured').checked,
            trending: document.getElementById('editProductTrending').checked,
            updatedAt: new Date().toISOString()
        };

        // الحقول الاختيارية
        const originalPrice = document.getElementById('editProductOriginalPrice').value;
        const brand = document.getElementById('editProductBrand').value.trim();
        const discount = document.getElementById('editProductDiscount').value;
        const imageURL = document.getElementById('editProductImageURL').value.trim();
        const specificationsText = document.getElementById('editProductSpecifications').value.trim();

        if (originalPrice) productData.originalPrice = parseFloat(originalPrice);
        if (brand) productData.brand = brand;
        if (discount) productData.discount = parseInt(discount);
        if (imageURL) productData.images = [imageURL];

        // معالجة المواصفات
        if (specificationsText) {
            const specifications = {};
            const lines = specificationsText.split('\n');
            lines.forEach(line => {
                const [key, value] = line.split(':').map(part => part.trim());
                if (key && value) {
                    specifications[key] = value;
                }
            });
            productData.specifications = specifications;
        }

        console.log("📦 بيانات التحديث:", productData);

        // التحقق من البيانات
        if (!productData.name || !productData.description || isNaN(productData.price) || isNaN(productData.stock) || !productData.category) {
            throw new Error('البيانات غير مكتملة أو غير صالحة');
        }

        let updateSuccess = false;

        // تحديث المنتج في Firebase
        if (window.firebaseDb && typeof firebaseDb.collection === 'function') {
            console.log("🔥 جاري تحديث المنتج في Firebase...");
            await firebaseDb.doc(`products/${productId}`).update(productData);
            updateSuccess = true;
            console.log("✅ تم تحديث المنتج في Firebase بنجاح!");
        } else {
            // تحديث محلي للبيانات التجريبية
            console.log("💾 جاري تحديث المنتج محلياً...");
            const productIndex = products.findIndex(product => product.id === productId);
            if (productIndex !== -1) {
                products[productIndex] = { ...products[productIndex], ...productData };
                updateSuccess = true;
                console.log("✅ تم تحديث المنتج محلياً بنجاح!");
            }
        }
        
        if (updateSuccess) {
            showMessage('✅ تم تحديث المنتج بنجاح!', 'success');
            
            // إغلاق النافذة بعد نجاح التحديث
            setTimeout(() => {
                closeEditModal();
                loadAdminProducts();
            }, 1000);
        } else {
            throw new Error('فشل في تحديث المنتج');
        }

    } catch (error) {
        console.error("❌ خطأ في تحديث المنتج:", error);
        showMessage('❌ خطأ في تحديث المنتج: ' + error.message, 'error');
    } finally {
        if (loadingModal) loadingModal.style.display = 'none';
    }
}

// البحث في المنتجات (لوحة التحكم)
function searchAdminProducts() {
    const searchInput = document.getElementById('adminSearchInput');
    searchTerm = searchInput.value.toLowerCase().trim();
    
    console.log("🔍 البحث عن:", searchTerm);
    
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
    console.log("🧹 تم مسح البحث");
}

// تحديث إحصائيات البحث
function updateSearchStats() {
    const productsCount = document.getElementById('productsCount');
    
    if (searchTerm) {
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            getCategoryName(product.category).toLowerCase().includes(searchTerm) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm))
        );
        if (productsCount) productsCount.textContent = `(${filteredProducts.length} منتج - نتائج البحث)`;
    } else {
        if (productsCount) productsCount.textContent = `(${products.length} منتج)`;
    }
}

// تحميل المنتجات مع الترتيب الجديد
async function loadAdminProducts() {
    try {
        console.log("🔄 بدء تحميل المنتجات...");
        
        const adminProductsList = document.getElementById('adminProductsList');
        if (adminProductsList) {
            adminProductsList.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i><p>جاري تحميل المنتجات...</p></div>';
        }

        // محاولة التحميل من Firebase
        if (window.firebaseDb && typeof firebaseDb.collection === 'function') {
            console.log("🔥 جاري تحميل المنتجات من Firebase...");
            const querySnapshot = await firebaseDb.collection("products").get();
            products = [];
            
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    products.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                console.log("✅ تم تحميل المنتجات من Firebase:", products.length);
            } else {
                // استخدام بيانات تجريبية إذا لم يكن هناك منتجات في Firebase
                products = getSampleProducts();
                console.log("📝 استخدام البيانات التجريبية:", products.length);
            }
        } else {
            // استخدام بيانات تجريبية إذا كان Firebase غير متوفر
            products = getSampleProducts();
            console.log("💾 استخدام البيانات التجريبية (Firebase غير متوفر):", products.length);
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
        
        console.log("✅ تم تحميل المنتجات:", products.length);
        updateStats();
        displayAdminProducts();
        
    } catch (error) {
        console.error("❌ خطأ في تحميل المنتجات:", error);
        
        // استخدام بيانات تجريبية في حالة الخطأ
        products = getSampleProducts();
        displayAdminProducts();
        
        const adminProductsList = document.getElementById('adminProductsList');
        if (adminProductsList) {
            adminProductsList.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>تم تحميل بيانات تجريبية للعرض</p>
                    <small>${error.message}</small>
                </div>
            `;
        }
    }
}

// بيانات تجريبية
function getSampleProducts() {
    return [
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
}

// تحديث الإحصائيات
function updateStats() {
    const totalProducts = document.getElementById('totalProducts');
    const activeProducts = document.getElementById('activeProducts');
    const totalSales = document.getElementById('totalSales');
    const totalStock = document.getElementById('totalStock');
    
    if (totalProducts) totalProducts.textContent = products.length;
    if (activeProducts) activeProducts.textContent = products.length;
    
    // حساب إجمالي المبيعات والمخزون
    const totalSalesCount = products.reduce((sum, product) => sum + (product.sales || 0), 0);
    const totalStockCount = products.reduce((sum, product) => sum + (product.stock || 0), 0);
    
    if (totalSales) totalSales.textContent = totalSalesCount;
    if (totalStock) totalStock.textContent = totalStockCount;
    
    updateSearchStats();
    console.log("📊 تم تحديث الإحصائيات:", { products: products.length, sales: totalSalesCount, stock: totalStockCount });
}

// عرض المنتجات في لوحة التحكم
function displayAdminProducts() {
    const container = document.getElementById('adminProductsList');
    if (!container) {
        console.error("❌ لم يتم العثور على عنصر adminProductsList");
        return;
    }
    
    // تصفية المنتجات حسب البحث
    let filteredProducts = products;
    if (searchTerm) {
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            getCategoryName(product.category).toLowerCase().includes(searchTerm) ||
            (product.brand && product.brand.toLowerCase().includes(searchTerm))
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
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-box-open"></i>
                    <p>لا توجد منتجات مضافة بعد</p>
                    <small>استخدم النموذج أعلاه لإضافة منتج جديد</small>
                </div>
            `;
        }
        console.log("📭 لا توجد منتجات للعرض");
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => `
        <div class="admin-product-card">
            <div class="product-header">
                ${product.images && product.images.length > 0 ? 
                    `<div class="product-image"><img src="${product.images[0]}" alt="${product.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=\\'${getProductIcon(product.category)}\\'></i>'"></div>` : 
                    `<div class="product-image"><i class="${getProductIcon(product.category)}"></i></div>`
                }
                <div class="product-info">
                    <h4>${product.name}</h4>
                    <div class="product-meta">
                        <span class="price">${product.price} ر.س</span>
                        ${product.originalPrice ? `<span class="original-price">${product.originalPrice} ر.س</span>` : ''}
                        ${product.discount ? `<span class="discount">${product.discount}%</span>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="product-description-container">
                <p class="product-description">${product.description}</p>
                ${product.description && product.description.length > 100 ? '<span class="show-more">عرض المزيد</span>' : ''}
            </div>
            
            <div class="product-details">
                <div class="detail-item">
                    <strong>التصنيف:</strong>
                    <span>${getCategoryName(product.category)}</span>
                </div>
                ${product.brand ? `
                <div class="detail-item">
                    <strong>العلامة التجارية:</strong>
                    <span>${product.brand}</span>
                </div>
                ` : ''}
                <div class="detail-item">
                    <strong>المخزون:</strong>
                    <span class="${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">${product.stock}</span>
                </div>
                <div class="detail-item">
                    <strong>المبيعات:</strong>
                    <span>${product.sales || 0}</span>
                </div>
                ${product.rating ? `
                <div class="detail-item">
                    <strong>التقييم:</strong>
                    <span>${product.rating}/5</span>
                </div>
                ` : ''}
            </div>

            ${product.specifications ? `
            <div class="product-specifications">
                <strong>المواصفات:</strong>
                <div class="specs-list">
                    ${Object.entries(product.specifications).map(([key, value]) => `
                        <div class="spec-item">
                            <span class="spec-key">${key}:</span>
                            <span class="spec-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="product-badges">
                ${product.featured ? '<span class="badge featured">⭐ مميز</span>' : ''}
                ${product.trending ? '<span class="badge trending">🔥 الأكثر مبيعاً</span>' : ''}
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
            
            <div class="admin-product-actions">
                <button class="btn-edit" onclick="openEditModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    <i class="fas fa-edit"></i>
                    تعديل
                </button>
                <button class="btn-delete" onclick="deleteAdminProduct('${product.id}')">
                    <i class="fas fa-trash"></i>
                    حذف
                </button>
            </div>
        </div>
    `).join('');
    
    // إضافة مستمعات الأحداث لعرض المزيد
    document.querySelectorAll('.show-more').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
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
    
    console.log("✅ تم عرض المنتجات في لوحة التحكم:", filteredProducts.length);
}

// إضافة منتج جديد - النسخة المصححة بالكامل
function initializeAddProductForm() {
    const form = document.getElementById('addProductForm');
    const messageDiv = document.getElementById('formMessage');
    const loadingModal = document.getElementById('loadingModal');

    if (!form) {
        console.error('❌ لم يتم العثور على النموذج!');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log("🔄 بدء إضافة منتج جديد...");
        
        // إظهار نافذة التحميل
        if (loadingModal) loadingModal.style.display = 'block';
        
        try {
            // الحصول على البيانات من النموذج
            const productData = {
                name: document.getElementById('productName').value.trim(),
                description: document.getElementById('productDescription').value.trim(),
                price: parseFloat(document.getElementById('productPrice').value),
                stock: parseInt(document.getElementById('productStock').value),
                category: document.getElementById('productCategory').value,
                featured: document.getElementById('productFeatured').checked,
                trending: document.getElementById('productTrending').checked,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                sales: 0,
                rating: null
            };

            // الحقول الاختيارية
            const originalPrice = document.getElementById('productOriginalPrice').value;
            const brand = document.getElementById('productBrand').value.trim();
            const discount = document.getElementById('productDiscount').value;
            const imageURL = document.getElementById('productImageURL').value.trim();
            const specificationsText = document.getElementById('productSpecifications').value.trim();

            if (originalPrice) productData.originalPrice = parseFloat(originalPrice);
            if (brand) productData.brand = brand;
            if (discount) productData.discount = parseInt(discount);
            if (imageURL) productData.images = [imageURL];

            // معالجة المواصفات
            if (specificationsText) {
                const specifications = {};
                const lines = specificationsText.split('\n');
                lines.forEach(line => {
                    const [key, value] = line.split(':').map(part => part.trim());
                    if (key && value) {
                        specifications[key] = value;
                    }
                });
                productData.specifications = specifications;
            }

            console.log("📦 بيانات المنتج المدخل:", productData);

            // التحقق من الحقول المطلوبة
            const requiredFields = [
                { field: productData.name, name: 'اسم المنتج' },
                { field: productData.description, name: 'وصف المنتج' },
                { field: productData.price, name: 'السعر' },
                { field: productData.stock, name: 'المخزون' },
                { field: productData.category, name: 'التصنيف' },
                { field: imageURL, name: 'صورة المنتج' }
            ];

            for (let req of requiredFields) {
                if (!req.field) {
                    throw new Error(`حقل ${req.name} مطلوب`);
                }
            }

            // التحقق من الأرقام
            if (isNaN(productData.price) || productData.price <= 0) {
                throw new Error('السعر يجب أن يكون رقماً صحيحاً أكبر من الصفر');
            }
            if (isNaN(productData.stock) || productData.stock < 0) {
                throw new Error('المخزون يجب أن يكون رقماً صحيحاً');
            }

            let newProductId;
            let addSuccess = false;

            // إضافة المنتج إلى Firebase
            if (window.firebaseDb && typeof firebaseDb.collection === 'function') {
                console.log("🔥 جاري إضافة المنتج إلى Firebase...");
                try {
                    const docRef = await firebaseDb.collection("products").add(productData);
                    newProductId = docRef.id;
                    addSuccess = true;
                    console.log("✅ تم إضافة المنتج إلى Firebase بنجاح! ID:", newProductId);
                } catch (firebaseError) {
                    console.error("❌ خطأ في إضافة المنتج إلى Firebase:", firebaseError);
                    throw new Error('فشل في إضافة المنتج إلى قاعدة البيانات: ' + firebaseError.message);
                }
            } else {
                // إضافة محلية للبيانات التجريبية
                console.log("💾 جاري إضافة المنتج محلياً...");
                newProductId = 'product-' + Date.now();
                const newProduct = {
                    ...productData,
                    id: newProductId
                };
                products.push(newProduct);
                addSuccess = true;
                console.log("✅ تم إضافة المنتج محلياً:", newProduct);
            }

            if (addSuccess) {
                // إظهار رسالة النجاح
                showMessage('✅ تم إضافة المنتج بنجاح!', 'success');

                // إعادة تعيين النموذج بعد نجاح الإضافة
                setTimeout(() => {
                    form.reset();
                    if (loadingModal) loadingModal.style.display = 'none';
                    
                    // إعادة تحميل القائمة
                    loadAdminProducts().then(() => {
                        console.log("🔄 تم تحديث قائمة المنتجات بعد الإضافة");
                    });
                }, 1500);
            }

        } catch (error) {
            console.error("❌ خطأ في إضافة المنتج:", error);
            showMessage('❌ خطأ في إضافة المنتج: ' + error.message, 'error');
            if (loadingModal) loadingModal.style.display = 'none';
        }
    });

    console.log("✅ تم تهيئة نموذج إضافة المنتج");
}

// دالة اختبار إضافة منتج
function testAddProduct() {
    console.log("🧪 بدء اختبار إضافة منتج...");
    
    // تعبئة النموذج ببيانات اختبار
    document.getElementById('productName').value = 'منتج تجريبي ' + new Date().getTime();
    document.getElementById('productDescription').value = 'هذا منتج تجريبي للاختبار تم إنشاؤه تلقائياً';
    document.getElementById('productPrice').value = '149.99';
    document.getElementById('productOriginalPrice').value = '199.99';
    document.getElementById('productStock').value = '25';
    document.getElementById('productCategory').value = 'electronics';
    document.getElementById('productImageURL').value = 'https://via.placeholder.com/300x300?text=منتج+تجريبي';
    document.getElementById('productBrand').value = 'علامة تجارية تجريبية';
    document.getElementById('productDiscount').value = '25';
    document.getElementById('productSpecifications').value = 'اللون: أسود\nالحجم: كبير\nالمادة: بلاستيك';
    document.getElementById('productFeatured').checked = true;
    
    console.log("✅ تم تعبئة النموذج ببيانات اختبار");
    showMessage('تم تعبئة النموذج ببيانات اختبار، يمكنك الآن الضغط على "إضافة المنتج"', 'success');
}

// تهيئة نموذج التعديل
function initializeEditProductForm() {
    const form = document.getElementById('editProductForm');
    if (form) {
        form.addEventListener('submit', updateProduct);
        console.log("✅ تم تهيئة نموذج تعديل المنتج");
    } else {
        console.error("❌ لم يتم العثور على نموذج التعديل");
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
    if (!confirm('⚠️ هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.')) {
        console.log("❌ تم إلغاء حذف المنتج");
        return;
    }
    
    try {
        console.log("🗑️ جاري حذف المنتج:", productId);
        
        let deleteSuccess = false;

        if (window.firebaseDb && typeof firebaseDb.collection === 'function') {
            await firebaseDb.doc(`products/${productId}`).delete();
            deleteSuccess = true;
            console.log("✅ تم حذف المنتج من Firebase");
        } else {
            // حذف محلي للبيانات التجريبية
            products = products.filter(product => product.id !== productId);
            deleteSuccess = true;
            console.log("✅ تم حذف المنتج محلياً");
        }
        
        if (deleteSuccess) {
            showMessage('✅ تم حذف المنتج بنجاح', 'success');
            await loadAdminProducts(); // إعادة تحميل القائمة
        }
    } catch (error) {
        console.error("❌ خطأ في حذف المنتج:", error);
        showMessage('❌ خطأ في حذف المنتج: ' + error.message, 'error');
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

// عرض الرسائل المحسنة
function showMessage(text, type) {
    console.log(`📢 ${type}: ${text}`);
    
    const messageDiv = document.getElementById('formMessage');
    if (messageDiv) {
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        const bgColor = type === 'success' ? '#d4edda' : '#f8d7da';
        const textColor = type === 'success' ? '#155724' : '#721c24';
        const borderColor = type === 'success' ? '#c3e6cb' : '#f5c6cb';
        
        messageDiv.innerHTML = `
            <div style="
                padding: 12px 16px;
                margin: 10px 0;
                border-radius: 8px;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                background: ${bgColor};
                color: ${textColor};
                border: 1px solid ${borderColor};
            ">
                <i class="fas ${icon}"></i>
                ${text}
            </div>
        `;
        
        // إخفاء الرسالة بعد 5 ثواني
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 5000);
    }
    
    // أيضاً عرض تنبيه للمستخدم للرسائل الهامة
    if (type === 'error') {
        alert(text);
    }
}

// التحقق من تسجيل الدخول
function checkAdminAuth() {
    const user = localStorage.getItem('user');
    const isAdmin = localStorage.getItem('isAdmin');
    
    console.log("🔐 التحقق من المصادقة:", { user: !!user, isAdmin: !!isAdmin });
    
    if (!user || !isAdmin) {
        console.log("❌ المستخدم غير مسجل - إعادة التوجيه إلى الصفحة الرئيسية");
        
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
    
    console.log("✅ تم تهيئة البحث في لوحة التحكم");
}

// تهيئة لوحة التحكم
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 بدء تهيئة لوحة التحكم...");
    
    // التحقق من تسجيل الدخول أولاً
    if (!checkAdminAuth()) {
        console.log("❌ لم يتم التحقق من المصادقة، إيقاف التهيئة");
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
    
    console.log("✅ تم تهيئة لوحة التحكم بالكامل");
});

// جعل الدوال متاحة globally
window.goToLogin = goToLogin;
window.goToHome = goToHome;
window.deleteAdminProduct = deleteAdminProduct;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.updateProduct = updateProduct;
window.searchAdminProducts = searchAdminProducts;
window.clearAdminSearch = clearAdminSearch;
window.testAddProduct = testAddProduct;
