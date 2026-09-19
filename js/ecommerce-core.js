/**
 * E-commerce Core System
 * Implementa Programación Orientada a Objetos Avanzada, Recursión y Promesas
 */

// ==========================================
// 1. MOCK DATABASE CONTEXT (Simulador asíncrono)
// ==========================================
class DatabaseContext {
  constructor() {
    this.storageKey = 'hunterGames_CartDB';
  }

  // Simula latencia de red de base de datos
  async _simulateNetworkLatency(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveCart(cartItems) {
    await this._simulateNetworkLatency();
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cartItems));
      return true;
    } catch (error) {
      console.error("Database Error (Save):", error);
      return false;
    }
  }

  async loadCart() {
    await this._simulateNetworkLatency();
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Database Error (Load):", error);
      return [];
    }
  }

  async clearCart() {
    await this._simulateNetworkLatency();
    localStorage.removeItem(this.storageKey);
  }
}

// ==========================================
// 2. MODELOS DE DATOS (Con Validación Estricta)
// ==========================================
class CartItem {
  constructor(id, title, price, image, platform) {
    // Validación estricta de tipos
    if (typeof id !== 'string') throw new TypeError("CartItem.id debe ser string");
    if (typeof title !== 'string') throw new TypeError("CartItem.title debe ser string");
    if (typeof price !== 'number' || price < 0) throw new RangeError("CartItem.price debe ser número positivo");

    this.id = id;
    this.title = title;
    this.price = price;
    this.image = image;
    this.platform = platform;
    this.quantity = 1;
  }

  get total() {
    return this.price * this.quantity;
  }
}

// ==========================================
// 3. GESTOR DEL CARRITO (POO & Recursión)
// ==========================================
class ShoppingCart {
  constructor() {
    this.items = [];
    this.db = new DatabaseContext();
    this.taxRate = 0.16; // 16% IVA
    this.isReady = false;
    
    // Callbacks para UI
    this.onCartUpdated = null;
  }

  async initialize() {
    const rawItems = await this.db.loadCart();
    // Rehidratar objetos JSON a instancias de CartItem para mantener métodos
    this.items = rawItems.map(raw => {
      const item = new CartItem(raw.id, raw.title, raw.price, raw.image, raw.platform);
      item.quantity = raw.quantity;
      return item;
    });
    this.isReady = true;
    this._notifyUpdate();
  }

  async addItem(game) {
    if (!game || !game.id) throw new Error("Juego inválido para agregar al carrito");

    const existingItem = this.items.find(item => item.id === game.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      const price = game.price || 69.99; // Precio por defecto si no tiene
      this.items.push(new CartItem(game.id, game.title, price, game.imageUrl, game.platforms[0] || 'Digital'));
    }

    await this.db.saveCart(this.items);
    this._notifyUpdate();
  }

  async removeItem(itemId) {
    this.items = this.items.filter(item => item.id !== itemId);
    await this.db.saveCart(this.items);
    this._notifyUpdate();
  }

  async updateQuantity(itemId, newQty) {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty < 1) return;

    const item = this.items.find(i => i.id === itemId);
    if (item) {
      item.quantity = qty;
      await this.db.saveCart(this.items);
      this._notifyUpdate();
    }
  }

  async clear() {
    this.items = [];
    await this.db.clearCart();
    this._notifyUpdate();
  }

  // --- Algoritmo Recursivo para Cálculo de Totales ---
  // Se usa recursión en lugar de un bucle for/reduce estándar 
  // para cumplir con el requerimiento estricto del usuario.
  _calculateSubtotalRecursively(index = 0) {
    // Caso base: si llegamos al final del arreglo, el subtotal es 0
    if (index >= this.items.length) {
      return 0;
    }
    // Paso recursivo: sumar el total del ítem actual + el subtotal del resto del arreglo
    return this.items[index].total + this._calculateSubtotalRecursively(index + 1);
  }

  getTotals() {
    const subtotal = this._calculateSubtotalRecursively();
    const taxes = subtotal * this.taxRate;
    const total = subtotal + taxes;

    return {
      subtotal: subtotal.toFixed(2),
      taxes: taxes.toFixed(2),
      total: total.toFixed(2),
      itemCount: this.items.reduce((acc, item) => acc + item.quantity, 0)
    };
  }

  _notifyUpdate() {
    if (this.onCartUpdated && typeof this.onCartUpdated === 'function') {
      this.onCartUpdated(this.items, this.getTotals());
    }
  }
}

// ==========================================
// 4. CONTROLADOR DE UI DEL CARRITO
// ==========================================
class CartUIController {
  constructor(cartInstance) {
    this.cart = cartInstance;
    this.cart.onCartUpdated = this.render.bind(this);
  }

  // Inyecta el HTML del carrito Offcanvas en el body para no repetir código en cada página
  injectCartUI() {
    const cartHTML = `
      <div class="offcanvas offcanvas-end hg-offcanvas-cart" tabindex="-1" id="cartOffcanvas" aria-labelledby="cartOffcanvasLabel">
        <div class="offcanvas-header" style="border-bottom: 1px solid var(--hg-border);">
          <h5 class="offcanvas-title" id="cartOffcanvasLabel" style="color: #fff; font-family: var(--font-heading);">
            <i class="bi bi-cart3 me-2" style="color: var(--hg-primary);"></i>Mi Carrito
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body d-flex flex-column" style="background: var(--hg-bg);">
          
          <div id="cartItemsContainer" class="flex-grow-1 overflow-auto pe-2 custom-scrollbar">
            <!-- Items del carrito -->
            <div class="text-center mt-5 text-muted-hg">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
          </div>

          <div class="cart-summary-box mt-3 p-3 rounded" style="background: rgba(255,255,255,0.02); border: 1px solid var(--hg-border);">
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted-hg">Subtotal</span>
              <span class="text-white" id="cartSubtotal">$0.00</span>
            </div>
            <div class="d-flex justify-content-between mb-2">
              <span class="text-muted-hg">Impuestos (16%)</span>
              <span class="text-white" id="cartTaxes">$0.00</span>
            </div>
            <hr class="border-secondary opacity-25">
            <div class="d-flex justify-content-between mb-3">
              <strong class="text-white">Total</strong>
              <strong style="color: var(--hg-primary); font-size: 1.2rem;" id="cartTotal">$0.00</strong>
            </div>
            <a href="checkout.html" class="btn-hg-primary w-100 text-center d-block" id="btnCheckout" style="padding: 0.8rem;">
              <i class="bi bi-credit-card-fill me-2"></i>Proceder al Pago
            </a>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', cartHTML);
    this.container = document.getElementById('cartItemsContainer');
    this.badgeRenderers = [];
  }

  // Permite enlazar iconos de carrito en el Navbar de cualquier página
  bindCartIcon(iconElementId) {
    const icon = document.getElementById(iconElementId);
    if (!icon) return;
    
    // Add badge if not exists
    if (!icon.querySelector('.cart-badge')) {
      icon.innerHTML += '<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-badge" style="font-size:0.65rem; border:2px solid var(--hg-bg-nav);">0</span>';
    }
    this.badgeRenderers.push(icon.querySelector('.cart-badge'));
    
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      const offcanvasElement = document.getElementById('cartOffcanvas');
      if (offcanvasElement) {
        // Usar Bootstrap offcanvas API nativa
        const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement);
        bsOffcanvas.toggle();
      }
    });
  }

  render(items, totals) {
    if (!this.container) return;

    // Actualizar badges numéricos
    this.badgeRenderers.forEach(badge => {
      badge.textContent = totals.itemCount;
      // Pequeña animación pop
      badge.style.transform = 'scale(1.2)';
      setTimeout(() => badge.style.transform = 'scale(1) translate(-50%, -50%)', 200); // revert to bootstap default translate
    });

    // Actualizar Resumen
    document.getElementById('cartSubtotal').textContent = '$' + totals.subtotal;
    document.getElementById('cartTaxes').textContent = '$' + totals.taxes;
    document.getElementById('cartTotal').textContent = '$' + totals.total;

    const btnCheckout = document.getElementById('btnCheckout');
    if (totals.itemCount === 0) {
      btnCheckout.classList.add('disabled');
      btnCheckout.style.pointerEvents = 'none';
      this.container.innerHTML = `
        <div class="text-center mt-5">
          <i class="bi bi-cart-x text-muted-hg mb-3" style="font-size: 3rem;"></i>
          <h5 class="text-white">Tu carrito está vacío</h5>
          <p class="text-muted-hg" style="font-size: 0.9rem;">Descubre juegos increíbles en nuestro catálogo y equípate.</p>
        </div>
      `;
      return;
    }

    btnCheckout.classList.remove('disabled');
    btnCheckout.style.pointerEvents = 'auto';

    // Renderizar Items
    let html = '';
    items.forEach(item => {
      html += `
        <div class="cart-item d-flex gap-3 mb-3 pb-3" style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <img src="${item.image}" alt="${item.title}" class="rounded" style="width: 70px; height: 90px; object-fit: cover;" onerror="this.onerror=null; this.src='img/predator.jpg';">
          <div class="flex-grow-1">
            <h6 class="text-white mb-1" style="font-size: 0.95rem; line-height: 1.2;">${item.title}</h6>
            <span class="badge bg-secondary bg-opacity-25 text-light mb-2" style="font-size: 0.7rem;">${item.platform}</span>
            <div class="d-flex justify-content-between align-items-center">
              <span style="color: var(--hg-primary); font-weight: 600;">$${item.price.toFixed(2)}</span>
              
              <div class="d-flex align-items-center bg-dark rounded px-2" style="border: 1px solid var(--hg-border);">
                <button class="btn btn-sm text-white border-0 py-0 px-1" onclick="window.ecommerceApp.cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                <span class="text-white px-2" style="font-size: 0.85rem;">${item.quantity}</span>
                <button class="btn btn-sm text-white border-0 py-0 px-1" onclick="window.ecommerceApp.cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
              </div>
            </div>
          </div>
          <button class="btn btn-sm text-danger border-0 h-25 p-0" onclick="window.ecommerceApp.cart.removeItem('${item.id}')" title="Eliminar">
            <i class="bi bi-trash3-fill"></i>
          </button>
        </div>
      `;
    });

    this.container.innerHTML = html;
  }
}

// Inicialización global segura
window.ecommerceApp = {};
document.addEventListener('DOMContentLoaded', async () => {
  const cart = new ShoppingCart();
  const cartUI = new CartUIController(cart);
  
  cartUI.injectCartUI();
  
  window.ecommerceApp = { cart, cartUI };
  await cart.initialize(); // Carga desde BD y renderiza
});

