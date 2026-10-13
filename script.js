
"use strict";

// VAULT mobile navigation
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
    menuToggle.textContent = isOpen ? "✕" : "☰";
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      menuToggle.textContent = "☰";
    });
  });
}

// Load saved cart safely
const STORAGE_KEY = "vault-demo-cart";

function loadCart() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) =>
      item &&
      ["leather", "wool"].includes(item.id) &&
      ["S", "M", "L", "XL"].includes(item.size) &&
      Number.isFinite(item.price) &&
      typeof item.name === "string"
    );
  } catch {
    return [];
  }
}

let cart = loadCart();

const cartBadge = document.getElementById("cart-badge");
const cartHeadingCount = document.getElementById("cart-heading-count");
const cartItems = document.getElementById("cart-items");
const cartSubtotal = document.getElementById("cart-subtotal");
const clearCartButton = document.getElementById("clear-cart");

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // The cart still works for the current page if storage is unavailable.
  }
}

function formatPrice(price) {
  return "EGP " + price.toLocaleString("en-US");
}


function renderCart() {
  const count = cart.length;

  cartBadge.textContent = count;
  cartHeadingCount.textContent = `(${count})`;
  cartItems.replaceChildren();

  if (count === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-cart";
    emptyMessage.textContent =
      "Your bag is empty. Explore the collection.";
    cartItems.appendChild(emptyMessage);
  } else {
    cart.forEach((item, index) => {
      const row = document.createElement("article");
      row.className = "cart-item";

     
      // Product image
      const image = document.createElement("img");
image.className = "cart-item-image";
image.src = item.image || (
  item.id === "leather"
    ? "./Imagies/burgundy-jacket.png.png"
    : "./Imagies/wool-jacket.png.png"
);
image.alt = item.name;
image.loading = "lazy";
      image.addEventListener("error", () => {
        image.style.display = "none";
      });

      // Product details
      const details = document.createElement("div");
      details.className = "cart-item-details";

      const name = document.createElement("p");
      name.className = "cart-item-name";
      name.textContent = item.name;

      const meta = document.createElement("p");
      meta.className = "cart-item-meta";
      meta.textContent = `Size: ${item.size}`;

      details.append(name, meta);

      // Price
      const price = document.createElement("p");
      price.className = "cart-item-price";
      price.textContent = formatPrice(item.price);

      // Remove button
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "remove-item";
      removeButton.textContent = "REMOVE";
      removeButton.setAttribute(
        "aria-label",
        `Remove ${item.name}, size ${item.size}`
      );

      removeButton.addEventListener("click", () => {
        cart.splice(index, 1);
        saveCart();
        renderCart();
      });

      row.append(image, details, price, removeButton);
      cartItems.appendChild(row);
    });
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  cartSubtotal.textContent = formatPrice(subtotal);
}


// Add products to the cart
document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const sizeSelect = document.getElementById(
      button.dataset.sizeId
    );

    if (!sizeSelect) return;

    const product = {
  id: button.dataset.id,
  name: button.dataset.name,
  price: Number(button.dataset.price),
  size: sizeSelect.value,
  image: button.dataset.image
};

    if (
      !["leather", "wool"].includes(product.id) ||
      !Number.isFinite(product.price) ||
      product.price <= 0
    ) {
      return;
    }

    cart.push(product);
    saveCart();
    renderCart();

    const originalText = button.innerHTML;
    button.textContent = "ADDED ✓";
    button.disabled = true;

    window.setTimeout(() => {
      button.innerHTML = originalText;
      button.disabled = false;
    }, 800);
  });
});

// Clear the entire cart
if (clearCartButton) {
  clearCartButton.addEventListener("click", () => {
    cart = [];
    saveCart();
    renderCart();
  });
}

// Render the cart when the page opens
renderCart();
