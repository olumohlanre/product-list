const productGrid = document.querySelector("#product-grid");
const cartContent = document.querySelector("#cart-content");
const cartCount = document.querySelector("#cart-count");
const modal = document.querySelector("#confirmation-modal");
const confirmationItems = document.querySelector("#confirmation-items");
const storageKey = "sweet-crumbs-cart";
const cart = loadCart();
let products = [];

const money = (value) => `$${value.toFixed(2)}`;
const getProduct = (name) => products.find((product) => product.name === name);

function loadCart() {
	try {
		const savedCart = JSON.parse(localStorage.getItem(storageKey) || "[]");
		if (!Array.isArray(savedCart)) return new Map();
		return new Map(savedCart.filter((entry) => Array.isArray(entry) && typeof entry[0] === "string" && Number.isInteger(entry[1]) && entry[1] > 0));
	} catch {
		return new Map();
	}
}

function saveCart() {
	try {
		localStorage.setItem(storageKey, JSON.stringify([...cart]));
	} catch {
	}
}

function getCartAction(product) {
	const quantity = cart.get(product.name) || 0;
	return quantity
		? `<div class="cart-action quantity-control" aria-label="Quantity for ${product.name}">
				<button type="button" data-action="decrement" data-name="${product.name}" aria-label="Remove one ${product.name}"><img src="./assets/images/icon-decrement-quantity.svg" alt=""></button>
				<span>${quantity}</span>
				<button type="button" data-action="increment" data-name="${product.name}" aria-label="Add one ${product.name}"><img src="./assets/images/icon-increment-quantity.svg" alt=""></button>
			</div>`
		: `<button class="cart-action" type="button" data-action="add" data-name="${product.name}"><img src="./assets/images/icon-add-to-cart.svg" alt="">Add to Cart</button>`;
}

function renderProducts() {
	productGrid.innerHTML = products.map((product, index) => {
		return `<article class="product-card" data-product-name="${product.name}">
			<div class="product-image-wrap">
				<picture><source media="(max-width: 400px)" srcset="${product.image.mobile}"><source media="(max-width: 720px)" srcset="${product.image.tablet}"><img class="product-image" src="${product.image.desktop}" alt="${product.name}" loading="${index > 2 ? "lazy" : "eager"}"></picture>
				<div class="cart-action-slot">${getCartAction(product)}</div>
			</div>
			<div class="product-meta"><p class="product-category">${product.category}</p><h3 class="product-name">${product.name}</h3><p class="product-price">${money(product.price)}</p></div>
		</article>`;
	}).join("");
	products.forEach(updateProductCard);
}

function updateProductCard(product) {
	const card = [...productGrid.children].find((element) => element.dataset.productName === product.name);
	if (!card) return;
	card.classList.toggle("is-selected", cart.has(product.name));
	card.querySelector(".cart-action-slot").innerHTML = getCartAction(product);
}

function getCartItems() {
	return [...cart.entries()].map(([name, quantity]) => ({ ...getProduct(name), quantity }));
}

function getCartTotal(items) {
	return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

function renderCart() {
	const items = getCartItems();
	const count = items.reduce((total, item) => total + item.quantity, 0);
	cartCount.textContent = `(${count})`;
	if (!items.length) {
		cartContent.innerHTML = `<div class="empty-cart"><img src="./assets/images/illustration-empty-cart.svg" alt=""><p>Your added items will appear here</p></div>`;
		return;
	}
	cartContent.innerHTML = `<ul class="cart-list">${items.map((item) => `<li class="cart-item"><div><p class="cart-item-name">${item.name}</p><div class="cart-item-detail"><span class="cart-item-quantity">${item.quantity}x</span><span class="cart-item-price">@ ${money(item.price)}</span><strong class="cart-item-total">${money(item.price * item.quantity)}</strong></div></div><button class="remove-item" type="button" data-action="remove" data-name="${item.name}" aria-label="Remove ${item.name}"><img src="./assets/images/icon-remove-item.svg" alt=""></button></li>`).join("")}</ul><div class="cart-total"><span>Order total</span><strong>${money(getCartTotal(items))}</strong></div><div class="carbon-neutral"><img src="./assets/images/icon-carbon-neutral.svg" alt="">This is a <strong>carbon-neutral</strong> delivery</div><button class="confirm-button" type="button" data-action="confirm">Confirm Order</button>`;
}

function updateCart(action, name) {
	const quantity = cart.get(name) || 0;
	if (action === "add" || action === "increment") cart.set(name, quantity + 1);
	if (action === "decrement") quantity > 1 ? cart.set(name, quantity - 1) : cart.delete(name);
	if (action === "remove") cart.delete(name);
	saveCart();
	updateProductCard(getProduct(name));
	renderCart();
}

function showConfirmation() {
	const items = getCartItems();
	confirmationItems.innerHTML = `${items.map((item) => `<div class="confirmation-row"><img src="${item.image.thumbnail}" alt=""><div><strong>${item.name}</strong><span>${item.quantity}x&nbsp;&nbsp; @ ${money(item.price)}</span></div><b>${money(item.price * item.quantity)}</b></div>`).join("")}<div class="confirmation-total"><span>Order total</span><strong>${money(getCartTotal(items))}</strong></div>`;
	modal.hidden = false;
	document.body.classList.add("modal-open");
	document.querySelector("#start-new-order").focus();
}

document.addEventListener("click", (event) => {
	const target = event.target.closest("[data-action]");
	if (!target) return;
	if (target.dataset.action === "confirm") showConfirmation();
	else updateCart(target.dataset.action, target.dataset.name);
});

document.querySelector("#start-new-order").addEventListener("click", () => {
	cart.clear();
	saveCart();
	modal.hidden = true;
	document.body.classList.remove("modal-open");
	renderProducts();
	renderCart();
});

fetch("./data.json")
	.then((response) => {
		if (!response.ok) throw new Error("Menu unavailable");
		return response.json();
	})
	.then((data) => {
		products = data;
		for (const name of cart.keys()) {
			if (!getProduct(name)) cart.delete(name);
		}
		saveCart();
		renderProducts();
		renderCart();
	})
	.catch(() => {
		productGrid.innerHTML = "<p class=\"load-error\">We couldn't load the menu right now.</p>";
	});
