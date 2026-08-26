// ========================================
// PRODUCT DATA
// ========================================

const products = [
  {
    id: 1,
    name: "Waffle with Berries",
    category: "Waffle",
    price: 6.50,
    image: "assets/images/image-waffle-desktop.jpg"
  },
  {
    id: 2,
    name: "Vanilla Bean Crème Brûlée",
    category: "Crème Brûlée",
    price: 7.00,
    image: "assets/images/image-creme-brulee-desktop.jpg"
  },
  {
    id: 3,
    name: "Macaron Mix of Five",
    category: "Macaron",
    price: 8.00,
    image: "assets/images/image-macaron-desktop.jpg"
  },
  {
    id: 4,
    name: "Classic Tiramisu",
    category: "Tiramisu",
    price: 5.50,
    image: "assets/images/image-tiramisu-desktop.jpg"
  },
  {
    id: 5,
    name: "Pistachio Baklava",
    category: "Baklava",
    price: 4.00,
    image: "assets/images/image-baklava-desktop.jpg"
  },
  {
    id: 6,
    name: "Lemon Meringue Pie",
    category: "Pie",
    price: 5.00,
    image: "assets/images/image-meringue-desktop.jpg"
  },
  {
    id: 7,
    name: "Red Velvet Cake",
    category: "Cake",
    price: 4.50,
    image: "assets/images/image-cake-desktop.jpg"
  },
  {
    id: 8,
    name: "Salted Caramel Brownie",
    category: "Brownie",
    price: 4.50,
    image: "assets/images/image-brownie-desktop.jpg"
  },
  {
    id: 9,
    name: "Vanilla Panna Cotta",
    category: "Panna Cotta",
    price: 6.50,
    image: "assets/images/image-panna-cotta-desktop.jpg"
  }
];


// ========================================
// CART
// ========================================

// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ========================================
// SAVE CART TO LOCALSTORAGE
// ========================================

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}


// ========================================
// HTML ELEMENTS
// ========================================

const productGrid = document.getElementById("product-grid");

const cartContent = document.getElementById("cart-content");
const cartCount = document.getElementById("cart-count");

const cartSubtotal = document.getElementById("cart-subtotal");
const cartTax = document.getElementById("cart-tax");

const checkoutBtn = document.getElementById("checkout-btn");

const modalBackdrop = document.getElementById("modal-backdrop");
const modalOrderSummary = document.getElementById(
  "modal-order-summary"
);


// ========================================
// CREATE START NEW ORDER BUTTON
// ========================================

const newOrderBtn = document.createElement("button");

newOrderBtn.id = "new-order-btn";
newOrderBtn.className = "new-order-btn";
newOrderBtn.type = "button";
newOrderBtn.textContent = "Start New Order";

modalOrderSummary.insertAdjacentElement(
  "afterend",
  newOrderBtn
);


// ========================================
// ADD PRODUCT TO CART
// ========================================

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".product-button");

  if (!button) return;

  // Ignore clicks on the + and - buttons here.
  if (event.target.closest(".btn-qty-action")) {
    return;
  }

  const productId = Number(button.dataset.productId);

  addToCart(productId);
});


function addToCart(productId) {
  const existingItem = cart.find(
    item => item.id === productId
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    const product = products.find(
      item => item.id === productId
    );

    if (!product) return;

    cart.push({
      ...product,
      quantity: 1
    });
  }

  // Save cart after adding item
  saveCart();

  updateProductButtons();
  renderCart();
}


// ========================================
// UPDATE PRODUCT BUTTONS
// ========================================

function updateProductButtons() {
  const productCards =
    document.querySelectorAll(".product-card");

  productCards.forEach(card => {
    const button =
      card.querySelector(".product-button");

    if (!button) return;

    const productId =
      Number(button.dataset.productId);

    const cartItem = cart.find(
      item => item.id === productId
    );

    if (cartItem) {
      card.classList.add("selected");

      button.classList.add("btn-quantity");

      button.innerHTML = `
        <span
          class="btn-qty-action decrease"
          data-id="${productId}"
          role="button"
          aria-label="Decrease quantity"
        >
          −
        </span>

        <span class="quantity">
          ${cartItem.quantity}
        </span>

        <span
          class="btn-qty-action increase"
          data-id="${productId}"
          role="button"
          aria-label="Increase quantity"
        >
          +
        </span>
      `;

    } else {
      card.classList.remove("selected");

      button.classList.remove("btn-quantity");

      button.innerHTML = "Add to Cart";
    }
  });
}


// ========================================
// PLUS / MINUS BUTTONS
// ========================================

productGrid.addEventListener("click", (event) => {
  const quantityButton =
    event.target.closest(".btn-qty-action");

  if (!quantityButton) return;

  const productId =
    Number(quantityButton.dataset.id);

  const cartItem = cart.find(
    item => item.id === productId
  );

  if (!cartItem) return;


  // Increase quantity
  if (
    quantityButton.classList.contains("increase")
  ) {
    cartItem.quantity += 1;
  }


  // Decrease quantity
  if (
    quantityButton.classList.contains("decrease")
  ) {
    cartItem.quantity -= 1;

    if (cartItem.quantity <= 0) {
      cart = cart.filter(
        item => item.id !== productId
      );
    }
  }


  // Save updated cart
  saveCart();

  updateProductButtons();
  renderCart();
});


// ========================================
// RENDER CART
// ========================================

function renderCart() {

  // Empty cart
  if (cart.length === 0) {

    cartContent.innerHTML = `
      <div class="cart-empty">
        <p>Your added items will appear here.</p>
      </div>
    `;

    checkoutBtn.disabled = true;

    updateCartTotals();

    return;
  }


  // Cart has items
  cartContent.innerHTML = cart.map(item => {

    const itemTotal =
      item.price * item.quantity;

    return `
      <div class="cart-item">

        <div class="cart-item-info">

          <p class="cart-item-name">
            ${item.name}
          </p>

          <div class="cart-item-details">

            <span class="cart-item-qty">
              ${item.quantity}x
            </span>

            <span class="cart-item-unit">
              @ $${item.price.toFixed(2)}
            </span>

            <span class="cart-item-total">
              $${itemTotal.toFixed(2)}
            </span>

          </div>

        </div>

        <button
          class="btn-remove"
          type="button"
          data-id="${item.id}"
          aria-label="Remove ${item.name}"
        >
          ×
        </button>

      </div>
    `;
  }).join("");


  checkoutBtn.disabled = false;

  updateCartTotals();
}


// ========================================
// REMOVE CART ITEM
// ========================================

cartContent.addEventListener("click", (event) => {

  const removeButton =
    event.target.closest(".btn-remove");

  if (!removeButton) return;

  const productId =
    Number(removeButton.dataset.id);

  cart = cart.filter(
    item => item.id !== productId
  );

  // Save updated cart
  saveCart();

  updateProductButtons();
  renderCart();
});


// ========================================
// UPDATE CART TOTALS
// ========================================

function updateCartTotals() {

  // Total number of items
  const totalItems = cart.reduce(
    (total, item) =>
      total + item.quantity,
    0
  );


  // Subtotal
  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );


  // 10% tax
  const tax = subtotal * 0.10;


  // Update HTML
  cartCount.textContent = totalItems;

  cartSubtotal.textContent =
    `$${subtotal.toFixed(2)}`;

  cartTax.textContent =
    `$${tax.toFixed(2)}`;
}


// ========================================
// CHECKOUT
// ========================================

checkoutBtn.addEventListener("click", () => {

  if (cart.length === 0) return;

  renderOrderConfirmation();

  openModal();
});


// ========================================
// ORDER CONFIRMATION
// ========================================

function renderOrderConfirmation() {

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const tax = subtotal * 0.10;

  const total = subtotal + tax;


  modalOrderSummary.innerHTML = `

    <div class="modal-order-summary">

      <div class="order-items">

        ${cart.map(item => {

          const itemTotal =
            item.price * item.quantity;

          return `
            <div class="order-item">

              <img
                src="${item.image}"
                alt="${item.name}"
              >

              <div class="order-item-info">

                <strong>
                  ${item.name}
                </strong>

                <p>
                  ${item.quantity} ×
                  $${item.price.toFixed(2)}
                </p>

              </div>

              <strong class="order-item-total">
                $${itemTotal.toFixed(2)}
              </strong>

            </div>
          `;

        }).join("")}

      </div>

      <div class="order-total">

        <span>
          Order Total
        </span>

        <strong>
          $${total.toFixed(2)}
        </strong>

      </div>

    </div>
  `;
}


// ========================================
// OPEN MODAL
// ========================================

function openModal() {

  modalBackdrop.classList.add("active");

  modalBackdrop.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow = "hidden";
}


// ========================================
// CLOSE MODAL
// ========================================

function closeModal() {

  modalBackdrop.classList.remove("active");

  modalBackdrop.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow = "";
}


// ========================================
// CLICK OUTSIDE MODAL
// ========================================

modalBackdrop.addEventListener(
  "click",
  (event) => {

    if (event.target === modalBackdrop) {
      closeModal();
    }

  }
);


// ========================================
// ESCAPE KEY
// ========================================

document.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Escape") {
      closeModal();
    }

  }
);


// ========================================
// START NEW ORDER
// ========================================

newOrderBtn.addEventListener(
  "click",
  () => {

    // Empty the cart
    cart = [];

    // Remove cart from localStorage
    localStorage.removeItem("cart");

    // Update everything
    updateProductButtons();
    renderCart();

    // Close confirmation modal
    closeModal();

    // Scroll back to products
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);


// ========================================
// INITIAL STATE
// ========================================

updateProductButtons();
renderCart();