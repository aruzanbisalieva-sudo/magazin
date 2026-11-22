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
  { id: 7, name: "Мишки в шапках", desc: "Два мягких мишки в новогодних шапках и свитерах", price: 10000, img: "images/bears-xmas.jpg" },
  { id: 8, name: "Мишка с сердечками", desc: "Большой мягкий мишка — отличный подарок", price: 10000, img: "images/bear-hearts.jpg" },
  { id: 9, name: "Розовые шары", desc: "Воздушные шары в нежных розовых оттенках", price: 5000, img: "images/balloons-pink.jpg" },
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

// Способ получения: самовывоз или курьер
const DELIVERY_NAMES = { pickup: "Самовывоз", courier: "Курьер" };
const DELIVERY_CONFIRM = { pickup: "Подтверждаем самовывоз ✓", courier: "Подтверждаем курьера ✓" };
const DELIVERY_SUB = {
  pickup: "Добавьте товары в корзину и нажмите «Заказать в WhatsApp».",
  courier: "Добавьте товары в корзину и нажмите «Заказать в WhatsApp». Адрес мы передадим в заказе."
};
const addressInput2 = document.getElementById("addressInput2");
const addressInput = document.getElementById("addressInput");
const deliveryHint = document.getElementById("deliveryHint");
let delivery = "";
let address = "";
try {
  delivery = localStorage.getItem("delivery") || "";
  address = localStorage.getItem("address") || "";
} catch (e) {}
if (!DELIVERY_NAMES[delivery]) delivery = "";
addressInput.value = address;
addressInput2.value = address;

function renderDelivery() {
  document.querySelectorAll("[data-delivery]").forEach((b) => {
    const on = b.dataset.delivery === delivery;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  document.querySelectorAll(".delivery-card").forEach((card) => {
    const mark = card.querySelector(".delivery-mark");
    mark.textContent = card.classList.contains("active") ? DELIVERY_CONFIRM[card.dataset.delivery] : "Выбрать";
  });
  const confirmBox = document.getElementById("deliveryConfirm");
  confirmBox.hidden = !delivery;
  if (delivery) {
    document.getElementById("deliveryConfirmText").textContent = DELIVERY_CONFIRM[delivery];
    document.getElementById("deliveryConfirmSub").textContent = DELIVERY_SUB[delivery];
  }
  document.getElementById("deliveryAddressWrap").hidden = delivery !== "courier";
  addressInput.hidden = delivery !== "courier";
  deliveryHint.hidden = true;
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-delivery]");
  if (!b) return;
  delivery = b.dataset.delivery;
  try { localStorage.setItem("delivery", delivery); } catch (err) {}
  renderDelivery();
});

function onAddressInput(src, other) {
  address = src.value;
  other.value = address;
  try { localStorage.setItem("address", address); } catch (e) {}
  deliveryHint.hidden = true;
}
addressInput.addEventListener("input", () => onAddressInput(addressInput, addressInput2));
addressInput2.addEventListener("input", () => onAddressInput(addressInput2, addressInput));

function showHint(text) {
  deliveryHint.textContent = text;
  deliveryHint.hidden = false;
}

// Заказ в WhatsApp
orderBtn.addEventListener("click", () => {
  const items = cartList();
  if (!items.length) return;
  if (!delivery) { showHint("Выберите способ получения: самовывоз или курьер"); return; }
  if (delivery === "courier" && !address.trim()) { showHint("Напишите адрес доставки"); addressInput.focus(); return; }
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const lines = items.map((i) => `• ${i.name} × ${i.qty} — ${formatPrice(i.price * i.qty)}`);
  const text = `Здравствуйте! Хочу заказать в «Аружан Flowers»:\n\n${lines.join("\n")}\n\nИтого: ${formatPrice(total)}\nПолучение: ${DELIVERY_NAMES[delivery]}${delivery === "courier" ? "\nАдрес: " + address.trim() : ""}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank");
});

renderCart();
renderDelivery();
