// -----------------------------
// Product data
// -----------------------------

const products = [
  {
    id: 1,
    name: "Waffle with Berries",
    category: "Waffle",
    price: 6.5,
    image: "assets/images/image-waffle-desktop.jpg",
  },
  {
    id: 2,
    name: "Vanilla Bean Crème Brûlée",
    category: "Crème Brûlée",
    price: 7.0,
    image: "assets/images/image-creme-brulee-desktop.jpg",
  },
  {
    id: 3,
    name: "Macaron Mix of Five",
    category: "Macaron",
    price: 8.0,
    image: "assets/images/image-macaron-desktop.jpg",
  },
  {
    id: 4,
    name: "Classic Tiramisu",
    category: "Tiramisu",
    price: 5.5,
    image: "assets/images/image-tiramisu-desktop.jpg",
  },
  {
    id: 5,
    name: "Pistachio Baklava",
    category: "Baklava",
    price: 4.0,
    image: "assets/images/image-baklava-desktop.jpg",
  },
  {
    id: 6,
    name: "Lemon Meringue Pie",
    category: "Pie",
    price: 5.0,
    image: "assets/images/image-meringue-desktop.jpg",
  },
  {
    id: 7,
    name: "Red Velvet Cake",
    category: "Cake",
    price: 4.5,
    image: "assets/images/image-cake-desktop.jpg",
  },
  {
    id: 8,
    name: "Salted Caramel Brownie",
    category: "Brownie",
    price: 4.5,
    image: "assets/images/image-brownie-desktop.jpg",
  },
  {
    id: 9,
    name: "Vanilla Panna Cotta",
    category: "Panna Cotta",
    price: 6.5,
    image: "assets/images/image-panna-cotta-desktop.jpg",
  },
];

// Cart and storage

const cart = new Map();
const STORAGE_KEY = "shopping_cart_data_v1";

// Get elements from the HTML

const productGrid = document.getElementById("product-grid");
const cartContent = document.getElementById("cart-content");
const cartCount = document.getElementById("cart-count");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartTax = document.getElementById("cart-tax");
const checkoutButton = document.getElementById("checkout-btn");
const resetButton = document.getElementById("reset-btn");

const modalBackdrop = document.getElementById("modal-backdrop");
const modalSummary = document.getElementById("modal-order-summary");
const closeModalButton = document.getElementById("close-modal-btn");

// Local storage

function saveCart() {
  const cartItems = Array.from(cart.values());

  localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
}

function loadCart() {
  const savedCart = localStorage.getItem(STORAGE_KEY);

  if (!savedCart) {
    return;
  }

  try {
    const cartItems = JSON.parse(savedCart);

    cartItems.forEach((item) => {
      cart.set(item.id, item);
    });
  } catch (error) {
    console.error("Could not load the saved cart:", error);
  }
}

// Helper functions

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}


function findProduct(productId) {
  return products.find((product) => product.id === productId);
}

// Display products

function renderProducts() {
  productGrid.innerHTML = products
    .map((product) => {
      return `
        <article class="product-card">
          <div
            class="product-image"
            style="background-image: url('${product.image}')"
          ></div>

          <div class="product-body">
            <p class="product-title">${product.name}</p>
            <p class="product-category">${product.category}</p>
            <p class="product-price">${formatMoney(product.price)}</p>

            <button
              class="product-button"
              type="button"
              data-product-id="${product.id}"
            >
              Add to Cart
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  // Add a click event to every "Add to Cart" button.
  const addButtons = productGrid.querySelectorAll(".product-button");

  addButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.productId);

      addToCart(productId);
    });
  });
}

// Cart calculations-

function getCartItems() {
  return Array.from(cart.values());
}

function getCartItemCount() {
  return getCartItems().reduce((total, item) => {
    return total + item.quantity;
  }, 0);
}

function getCartSubtotal() {
  return getCartItems().reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

function getCartTax() {
  return getCartSubtotal() * 0.08;
}

// Update cart information

function updateCartSummary() {
  const itemCount = getCartItemCount();
  const subtotal = getCartSubtotal();
  const tax = getCartTax();

  cartCount.textContent = itemCount;
  cartSubtotal.textContent = formatMoney(subtotal);
  cartTax.textContent = formatMoney(tax);

  // Disable checkout when there are no items.
  checkoutButton.disabled = itemCount === 0;
}

// Display cart items

function renderCart() {
  const cartItems = getCartItems();

  // Show the empty-cart message.
  if (cartItems.length === 0) {
    cartContent.innerHTML = `
      <div class="cart-empty">
        Your added items will appear here.
      </div>
    `;

    return;
  }

  cartContent.innerHTML = cartItems
    .map((item) => {
      const itemTotal = item.price * item.quantity;

      return `
        <div class="cart-item">

          <div class="item-info">
            <div
              class="item-image"
              style="background-image: url('${item.image}')"
            ></div>

            <div class="item-meta">
              <p class="item-name">${item.name}</p>

              <div class="item-controls">
                <button
                  type="button"
                  data-action="decrease"
                  data-id="${item.id}"
                >
                  −
                </button>

                <span>${item.quantity}</span>

                <button
                  type="button"
                  data-action="increase"
                  data-id="${item.id}"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div class="item-total">
            ${formatMoney(itemTotal)}
          </div>

        </div>
      `;
    })
    .join("");

  // Add events to the + and − buttons.
  const cartButtons = cartContent.querySelectorAll(
    "button[data-action]"
  );

  cartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.dataset.id);
      const action = button.dataset.action;

      if (action === "increase") {
        addToCart(productId);
      } else {
        removeFromCart(productId);
      }
    });
  });
}

// Add an item to the cart

function addToCart(productId) {
  const product = findProduct(productId);

  if (!product) {
    return;
  }

  // Check if the product is already in the cart.
  const existingItem = cart.get(productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.set(productId, {
      ...product,
      quantity: 1,
    });
  }

  saveCart();
  renderCart();
  updateCartSummary();
}

// Remove an item from the cart

function removeFromCart(productId) {
  const cartItem = cart.get(productId);

  if (!cartItem) {
    return;
  }

  cartItem.quantity -= 1;

  // Remove the product completely when its quantity reaches zero.
  if (cartItem.quantity <= 0) {
    cart.delete(productId);
  }

  saveCart();
  renderCart();
  updateCartSummary();
}

// Empty the entire cart

function resetCart() {
  cart.clear();

  saveCart();
  renderCart();
  updateCartSummary();
}

// Checkout modal

function openCheckoutModal() {
  const cartItems = getCartItems();

  const subtotal = getCartSubtotal();
  const tax = getCartTax();
  const total = subtotal + tax;

  modalSummary.innerHTML = `
    <ul>
      ${cartItems
        .map((item) => {
          const itemTotal = item.price * item.quantity;

          return `
            <li>
              ${item.quantity} × ${item.name}
              — ${formatMoney(itemTotal)}
            </li>
          `;
        })
        .join("")}
    </ul>

    <div class="footer-row">
      <span>Subtotal</span>
      <strong>${formatMoney(subtotal)}</strong>
    </div>

    <div class="footer-row">
      <span>Tax</span>
      <strong>${formatMoney(tax)}</strong>
    </div>

    <div class="footer-row">
      <span>Total</span>
      <strong>${formatMoney(total)}</strong>
    </div>
  `;

  modalBackdrop.style.display = "flex";
  modalBackdrop.setAttribute("aria-hidden", "false");
}

function closeCheckoutModal() {
  modalBackdrop.style.display = "none";
  modalBackdrop.setAttribute("aria-hidden", "true");
}

// Event listeners

checkoutButton.addEventListener("click", () => {
  // Don't open checkout if the cart is empty.
  if (cart.size === 0) {
    return;
  }

  openCheckoutModal();

  // Clear the cart after the order has been placed.
  resetCart();
});

resetButton.addEventListener("click", resetCart);

closeModalButton.addEventListener("click", closeCheckoutModal);

// Close the modal when clicking outside of it.
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeCheckoutModal();
  }
});

// Close the modal when pressing Escape.
window.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    modalBackdrop.style.display === "flex"
  ) {
    closeCheckoutModal();
  }
});

// Start the application

loadCart();
renderProducts();
renderCart();
updateCartSummary();