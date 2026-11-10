// Номер WhatsApp магазина: только цифры, с кодом страны (7 — Казахстан).
// ЗАМЕНИТЕ на свой номер!
const WHATSAPP_NUMBER = "77000000000";

const products = [
  { id: 1, name: "Розовые тюльпаны", desc: "15 махровых тюльпанов в нежной ленте", price: 15000, img: "images/b1.jpg" },
  { id: 2, name: "Нежность", desc: "Пионы, кустовые розы и эвкалипт", price: 28000, img: "images/b2.jpg" },
  { id: 3, name: "Пудровые розы", desc: "Пионовидные розы розовых и кремовых оттенков", price: 22000, img: "images/b3.jpg" },
  { id: 4, name: "Красные розы", desc: "25 красных роз — классика любви", price: 25000, img: "images/b4.jpg" },
  { id: 5, name: "Осенний сад", desc: "Розы, гипериум и сезонная зелень", price: 32000, img: "images/b5.jpg" },
  { id: 6, name: "Солнечный день", desc: "Подсолнух, полевые цветы в крафте", price: 12000, img: "images/b6.jpg" },
];

const formatPrice = (n) => n.toLocaleString("ru-RU").replace(/ /g, " ") + " ₸";

// Корзина хранится в браузере, чтобы не терялась при перезагрузке
let cart = {};
try { cart = JSON.parse(localStorage.getItem("cart")) || {}; } catch (e) { cart = {}; }

function saveCart() {
  try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) {}
}

// Каталог
const productsEl = document.getElementById("products");
productsEl.innerHTML = products.map((p) => `
  <article class="card">
    <img src="${p.img}" alt="${p.name}" loading="lazy">
    <div class="card-body">
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="card-bottom">
        <span class="price">${formatPrice(p.price)}</span>
        <button class="add-btn" data-id="${p.id}">В корзину</button>
      </div>
    </div>
  </article>
`).join("");

productsEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  const id = btn.dataset.id;
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
  btn.textContent = "Добавлено ✓";
  btn.classList.add("added");
  setTimeout(() => { btn.textContent = "В корзину"; btn.classList.remove("added"); }, 1200);
});

// Корзина
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const orderBtn = document.getElementById("orderBtn");

function cartList() {
  return Object.entries(cart)
    .map(([id, qty]) => ({ ...products.find((p) => p.id == id), qty }))
    .filter((item) => item.name && item.qty > 0);
}

function renderCart() {
  const items = cartList();
  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  cartCountEl.textContent = count;
  cartTotalEl.textContent = formatPrice(total);
  orderBtn.disabled = items.length === 0;

  if (!items.length) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Корзина пуста 🌸</p>`;
    return;
  }

  cartItemsEl.innerHTML = items.map((i) => `
    <div class="cart-item">
      <img src="${i.img}" alt="${i.name}">
      <div>
        <h4>${i.name}</h4>
        <div class="item-price">${formatPrice(i.price * i.qty)}</div>
        <div class="qty">
          <button data-action="minus" data-id="${i.id}" aria-label="Меньше">−</button>
          <span>${i.qty}</span>
          <button data-action="plus" data-id="${i.id}" aria-label="Больше">+</button>
        </div>
      </div>
      <button class="remove" data-action="remove" data-id="${i.id}" aria-label="Удалить">&times;</button>
    </div>
  `).join("");
}

cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (action === "plus") cart[id]++;
  if (action === "minus") cart[id]--;
  if (action === "remove" || cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
});

// Открыть / закрыть корзину
const openCart = () => document.body.classList.add("cart-open");
const closeCart = () => document.body.classList.remove("cart-open");
document.getElementById("cartOpen").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
document.getElementById("overlay").addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

// Заказ в WhatsApp
orderBtn.addEventListener("click", () => {
  const items = cartList();
  if (!items.length) return;
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const lines = items.map((i) => `• ${i.name} × ${i.qty} — ${formatPrice(i.price * i.qty)}`);
  const text = `Здравствуйте! Хочу заказать в «Аружан Flowers»:\n\n${lines.join("\n")}\n\nИтого: ${formatPrice(total)}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
});

renderCart();
