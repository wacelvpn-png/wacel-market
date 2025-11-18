// js/cart.js - الإصدار المصحح بالكامل
console.log("🔄 تحميل نظام سلة التسوق المصحح...");

let cart = JSON.parse(localStorage.getItem('cart')) || [];

// إضافة منتج إلى السلة - الإصدار المصحح
function addToCart(product) {
    // التأكد من أن السعر والكمية أرقام
    const price = parseFloat(product.price) || 0;
    const stock = parseInt(product.stock) || 0;
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        const currentQuantity = parseInt(existingItem.quantity) || 0;
        if (currentQuantity < stock) {
            existingItem.quantity = currentQuantity + 1;
        } else {
            showTempMessage('الكمية المتاحة غير كافية', 'error');
            return;
        }
    } else {
        cart.push({
            ...product,
            price: price,
            stock: stock,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showTempMessage('تم إضافة المنتج إلى السلة', 'success');
}

// تحديث عرض السلة - الإصدار المصحح
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>سلة التسوق فارغة</p></div>';
        if (cartTotal) cartTotal.textContent = '0.00';
        return;
    }
    
    let total = 0;
    let itemsHTML = '';
    
    cart.forEach(item => {
        // التأكد من أن السعر والكمية أرقام
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.quantity) || 0;
        const itemTotal = price * quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    ${item.images && item.images.length > 0 ? 
                        `<img src="${item.images[0]}" alt="${item.name}">` : 
                        `<i class="${getProductIcon(item.category)}"></i>`
                    }
                </div>
                <div class="cart-item-info">
                    <h5>${item.name}</h5>
                    <div class="cart-item-price">${price.toFixed(2)} ر.س</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="quantity">${quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                    <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-total">${itemTotal.toFixed(2)} ر.س</div>
            </div>
        `;
    });
    
    cartItems.innerHTML = itemsHTML;
    if (cartTotal) cartTotal.textContent = total.toFixed(2);
}

// تحديث كمية المنتج - الإصدار المصحح
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const currentQuantity = parseInt(item.quantity) || 0;
        const stock = parseInt(item.stock) || 0;
        const newQuantity = currentQuantity + change;
        
        if (newQuantity < 1) {
            removeFromCart(productId);
        } else if (newQuantity > stock) {
            showTempMessage('الكمية المتاحة غير كافية', 'error');
        } else {
            item.quantity = newQuantity;
            saveCart();
            updateCartDisplay();
            updateCartCount();
        }
    }
}

// إزالة منتج من السلة
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    updateCartCount();
    showTempMessage('تم إزالة المنتج من السلة', 'success');
}

// تفريغ السلة
function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('هل تريد تفريغ سلة التسوق؟')) {
        cart = [];
        saveCart();
        updateCartDisplay();
        updateCartCount();
        showTempMessage('تم تفريغ سلة التسوق', 'success');
    }
}

// إتمام الشراء - الإصدار المصحح
function checkout() {
    if (cart.length === 0) {
        showTempMessage('سلة التسوق فارغة', 'error');
        return;
    }
    
    // التوجيه إلى صفحة الدفع
    window.location.href = 'checkout.html';
}

// حفظ السلة في localStorage - الإصدار المصحح
function saveCart() {
    // التأكد من أن جميع البيانات رقمية قبل الحفظ
    const cartToSave = cart.map(item => ({
        ...item,
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 0,
        stock: parseInt(item.stock) || 0
    }));
    
    localStorage.setItem('cart', JSON.stringify(cartToSave));
}

// تحديث عداد السلة - الإصدار المصحح
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((total, item) => {
        const quantity = parseInt(item.quantity) || 0;
        return total + quantity;
    }, 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// الحصول على أيقونة المنتج
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

// التهيئة المحسنة
document.addEventListener('DOMContentLoaded', function() {
    console.log("🔄 تهيئة سلة التسوق...");
    
    // تحميل السلة من localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            // التأكد من أن البيانات رقمية
            cart = cart.map(item => ({
                ...item,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity) || 0,
                stock: parseInt(item.stock) || 0
            }));
        } catch (error) {
            console.error("❌ خطأ في تحميل سلة التسوق:", error);
            cart = [];
        }
    }
    
    updateCartCount();
    console.log("✅ تم تحميل سلة التسوق:", cart);
});

// جعل الدوال متاحة عالمياً
window.addToCart = addToCart;
window.updateCartDisplay = updateCartDisplay;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.checkout = checkout;
