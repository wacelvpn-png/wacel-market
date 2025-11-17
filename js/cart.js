// js/cart.js - إدارة سلة التسوق
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// إضافة منتج إلى السلة
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity += 1;
        } else {
            showTempMessage('الكمية المتاحة غير كافية', 'error');
            return;
        }
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    showTempMessage('تم إضافة المنتج إلى السلة', 'success');
}

// تحديث عرض السلة
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
        const itemTotal = item.price * item.quantity;
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
                    <div class="cart-item-price">${item.price} ر.س</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
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

// تحديث كمية المنتج
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const newQuantity = item.quantity + change;
        
        if (newQuantity < 1) {
            removeFromCart(productId);
        } else if (newQuantity > item.stock) {
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

// إتمام الشراء
function checkout() {
    if (cart.length === 0) {
        showTempMessage('سلة التسوق فارغة', 'error');
        return;
    }
    
    // هنا يمكنك إضافة منطق إتمام الشراء
    // مثل التوجيه إلى صفحة الدفع أو فتح نموذج الدفع
    
    alert('سيتم توجيهك إلى صفحة الدفع...');
    // window.location.href = 'checkout.html';
}

// حفظ السلة في localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// تحديث عداد السلة
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (cartCount) {
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// التهيئة
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
