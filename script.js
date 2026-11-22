// ================== НАСТРОЙКИ МАГАЗИНА ==================
// Номер WhatsApp магазина: только цифры, с кодом страны (7 — Казахстан).
// ЗАМЕНИТЕ на свой номер!
const WHATSAPP_NUMBER = "77000000000";

// Контакты (показываются на странице «Контакты» и внизу сайта).
// Пустую строку "" сайт просто не покажет. Впишите свои данные.
const SHOP = {
  city: "Уральск",
  address: "",            // например: "ул. Достык, 100"
  hours: "",              // например: "Ежедневно 9:00–21:00"
  instagram: "",          // например: "aruzhan.flowers" (без @)
};

const CATEGORIES = { flowers: "Букеты", bears: "Мишки", balloons: "Шары" };

const products = [
  { id: 1, cat: "flowers", name: "Розовые тюльпаны", desc: "15 махровых тюльпанов в нежной ленте", price: 15000, img: "images/b1.jpg" },
  { id: 2, cat: "flowers", name: "Нежность", desc: "Пионы, кустовые розы и эвкалипт", price: 28000, img: "images/b2.jpg" },
  { id: 3, cat: "flowers", name: "Пудровые розы", desc: "Пионовидные розы розовых и кремовых оттенков", price: 22000, img: "images/b3.jpg" },
  { id: 4, cat: "flowers", name: "Красные розы", desc: "Красные розы в нежной упаковке — классика любви", price: 25000, img: "images/roses-red.jpg" },
  { id: 5, cat: "flowers", name: "Осенний сад", desc: "Розы, гипериум и сезонная зелень", price: 32000, img: "images/b5.jpg" },
  { id: 6, cat: "flowers", name: "Солнечный день", desc: "Подсолнух, полевые цветы в крафте", price: 12000, img: "images/b6.jpg" },
  { id: 10, cat: "flowers", name: "Композиция в коробке", desc: "Лилии, розы и гвоздики в белой коробке с лентой", price: 20000, img: "images/box-lilies.jpg" },
  { id: 7, cat: "bears", name: "Мишки в шапках", desc: "Два мягких мишки в новогодних шапках и свитерах", price: 10000, img: "images/bears-xmas.jpg" },
  { id: 8, cat: "bears", name: "Мишка с сердечками", desc: "Большой мягкий мишка — отличный подарок", price: 10000, img: "images/bear-hearts.jpg" },
  { id: 9, cat: "balloons", name: "Розовые шары", desc: "Воздушные шары в нежных розовых оттенках", price: 5000, img: "images/balloons-pink.jpg" },
];

// Товары для блока «Популярное» на главной
const POPULAR_IDS = [2, 4, 10, 8];

// ================== ОБЩЕЕ ==================
const formatPrice = (n) => n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₸";
const page = document.body.dataset.page || "";
const findProduct = (id) => products.find((p) => String(p.id) === String(id));

const NAV = [
  { href: "index.html", key: "home", label: "Главная" },
  { href: "catalog.html", key: "catalog", label: "Каталог" },
  { href: "delivery.html", key: "delivery", label: "Доставка" },
  { href: "contacts.html", key: "contacts", label: "Контакты" },
];
const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}${text ? "?text=" + encodeURIComponent(text) : ""}`;

// Шапка, подвал и корзина одинаковые на всех страницах — вставляем их отсюда
function renderLayout() {
  const navHtml = NAV.map((n) =>
    `<a href="${n.href}"${n.key === page ? ' class="active" aria-current="page"' : ""}>${n.label}</a>`
  ).join("");

  document.body.insertAdjacentHTML("afterbegin", `
  <header class="header">
    <a href="index.html" class="logo"><img class="logo-ava" src="images/ava.jpg" alt="">Аружан <span>Flowers</span></a>
    <nav class="nav">${navHtml}</nav>
    <button class="cart-btn" id="cartOpen" aria-label="Открыть корзину">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>
      <span class="cart-count" id="cartCount">0</span>
    </button>
  </header>
  <nav class="nav-mobile">${navHtml}</nav>`);

  const contactBits = [SHOP.city, SHOP.address, SHOP.hours].filter(Boolean).join(" · ");
  document.body.insertAdjacentHTML("beforeend", `
  <footer class="footer">
    <p class="logo">Аружан <span>Flowers</span></p>
    <nav class="footer-nav">${NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join("")}</nav>
    ${contactBits ? `<p>${contactBits}</p>` : ""}
    <p><a class="footer-wa" href="${waLink()}" target="_blank" rel="noopener">Написать в WhatsApp</a></p>
    <p>© 2026 Аружан Flowers</p>
  </footer>

  <div class="overlay" id="overlay"></div>
  <aside class="cart" id="cart" aria-label="Корзина">
    <div class="cart-head">
      <h3>Корзина</h3>
      <button class="cart-close" id="cartClose" aria-label="Закрыть">&times;</button>
    </div>
    <div class="cart-items" id="cartItems"></div>
    <div class="cart-foot">
      <div class="cart-delivery">
        <p class="cart-delivery-title">Как получить заказ?</p>
        <div class="cart-delivery-btns">
          <button type="button" data-delivery="pickup" aria-pressed="false">Самовывоз</button>
          <button type="button" data-delivery="courier" aria-pressed="false">Курьер</button>
        </div>
        <input type="text" id="addressInput" class="cart-address" placeholder="Адрес доставки" hidden>
        <p class="cart-delivery-hint" id="deliveryHint" hidden></p>
      </div>
      <div class="cart-total">
        <span>Итого:</span>
        <strong id="cartTotal">0 ₸</strong>
      </div>
      <button class="btn btn-wa" id="orderBtn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4C2.7 15.6 2.2 13.8 2.2 12 2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9 1.8 1.8 2.9 4.3 2.9 6.9 0 5.4-4.4 9.8-9.8 9.8zM20.5 3.5C18.2 1.2 15.2 0 12 0 5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.4z"/></svg>
        Заказать в WhatsApp
      </button>
    </div>
  </aside>`);
}
renderLayout();

// ================== КОРЗИНА (хранится в браузере, общая для всех страниц) ==================
let cart = {};
try { cart = JSON.parse(localStorage.getItem("cart")) || {}; } catch (e) { cart = {}; }
function saveCart() { try { localStorage.setItem("cart", JSON.stringify(cart)); } catch (e) {} }

function addToCart(id, qty = 1, btn) {
  cart[id] = (cart[id] || 0) + qty;
  saveCart();
  renderCart();
  if (btn) {
    const old = btn.textContent;
    btn.textContent = "Добавлено ✓";
    btn.classList.add("added");
    setTimeout(() => { btn.textContent = old; btn.classList.remove("added"); }, 1200);
  }
}

// Карточка товара (используется на главной, в каталоге и на странице товара)
const cardHtml = (p) => `
  <article class="card">
    <a href="product.html?id=${p.id}" class="card-img"><img src="${p.img}" alt="${p.name}" loading="lazy"></a>
    <div class="card-body">
      <span class="card-cat">${CATEGORIES[p.cat]}</span>
      <h3><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <p>${p.desc}</p>
      <div class="card-bottom">
        <span class="price">${formatPrice(p.price)}</span>
        <button class="add-btn" data-id="${p.id}">В корзину</button>
      </div>
    </div>
  </article>`;

// Кнопки «В корзину» на любой странице
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (btn) addToCart(btn.dataset.id, 1, btn);
});

const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const orderBtn = document.getElementById("orderBtn");

function cartList() {
  return Object.entries(cart)
    .map(([id, qty]) => ({ ...findProduct(id), qty }))
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
    cartItemsEl.innerHTML = `<p class="cart-empty">Корзина пуста 🌸<br><a href="catalog.html">Перейти в каталог</a></p>`;
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
    </div>`).join("");
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

// Если корзину изменили в другой вкладке — обновляем
window.addEventListener("storage", (e) => {
  if (e.key !== "cart") return;
  try { cart = JSON.parse(e.newValue) || {}; } catch (err) { cart = {}; }
  renderCart();
});

const openCart = () => document.body.classList.add("cart-open");
const closeCart = () => document.body.classList.remove("cart-open");
document.getElementById("cartOpen").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
document.getElementById("overlay").addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeCart(); });

// ================== СПОСОБ ПОЛУЧЕНИЯ ==================
const DELIVERY_NAMES = { pickup: "Самовывоз", courier: "Курьер" };
const DELIVERY_CONFIRM = { pickup: "Подтверждаем самовывоз ✓", courier: "Подтверждаем курьера ✓" };
const DELIVERY_SUB = {
  pickup: "Добавьте товары в корзину и нажмите «Заказать в WhatsApp».",
  courier: "Добавьте товары в корзину и нажмите «Заказать в WhatsApp». Адрес мы передадим в заказе.",
};
const addressInput = document.getElementById("addressInput");
const addressInput2 = document.getElementById("addressInput2"); // есть только на странице «Доставка»
const deliveryHint = document.getElementById("deliveryHint");
let delivery = "";
let address = "";
try {
  delivery = localStorage.getItem("delivery") || "";
  address = localStorage.getItem("address") || "";
} catch (e) {}
if (!DELIVERY_NAMES[delivery]) delivery = "";
addressInput.value = address;
if (addressInput2) addressInput2.value = address;

function renderDelivery() {
  document.querySelectorAll("[data-delivery]").forEach((b) => {
    const on = b.dataset.delivery === delivery;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", on ? "true" : "false");
  });
  document.querySelectorAll(".delivery-card").forEach((card) => {
    const mark = card.querySelector(".delivery-mark");
    if (mark) mark.textContent = card.classList.contains("active") ? DELIVERY_CONFIRM[card.dataset.delivery] : "Выбрать";
  });
  const confirmBox = document.getElementById("deliveryConfirm");
  if (confirmBox) {
    confirmBox.hidden = !delivery;
    if (delivery) {
      document.getElementById("deliveryConfirmText").textContent = DELIVERY_CONFIRM[delivery];
      document.getElementById("deliveryConfirmSub").textContent = DELIVERY_SUB[delivery];
    }
    document.getElementById("deliveryAddressWrap").hidden = delivery !== "courier";
  }
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
  if (other) other.value = address;
  try { localStorage.setItem("address", address); } catch (e) {}
  deliveryHint.hidden = true;
}
addressInput.addEventListener("input", () => onAddressInput(addressInput, addressInput2));
if (addressInput2) addressInput2.addEventListener("input", () => onAddressInput(addressInput2, addressInput));

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
  window.open(waLink(text), "_blank");
});

// ================== СТРАНИЦЫ ==================

// Главная: популярные товары
const popularEl = document.getElementById("popular");
if (popularEl) popularEl.innerHTML = POPULAR_IDS.map(findProduct).filter(Boolean).map(cardHtml).join("");

// Каталог: фильтр по категориям (ссылка вида catalog.html?cat=bears тоже работает)
const productsEl = document.getElementById("products");
const filtersEl = document.getElementById("filters");
if (productsEl && filtersEl) {
  let current = new URLSearchParams(location.search).get("cat");
  if (!CATEGORIES[current]) current = "all";

  const renderCatalog = () => {
    filtersEl.innerHTML = [["all", "Все"], ...Object.entries(CATEGORIES)].map(([key, label]) => {
      const n = key === "all" ? products.length : products.filter((p) => p.cat === key).length;
      return `<button type="button" class="filter${key === current ? " active" : ""}" data-cat="${key}" aria-pressed="${key === current}">${label} <span>${n}</span></button>`;
    }).join("");
    const list = current === "all" ? products : products.filter((p) => p.cat === current);
    productsEl.innerHTML = list.map(cardHtml).join("");
  };

  filtersEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    current = b.dataset.cat;
    const url = current === "all" ? "catalog.html" : `catalog.html?cat=${current}`;
    history.replaceState(null, "", url);
    renderCatalog();
  });
  renderCatalog();
}

// Страница товара: product.html?id=3
const productEl = document.getElementById("product");
if (productEl) {
  const p = findProduct(new URLSearchParams(location.search).get("id"));
  if (!p) {
    productEl.innerHTML = `<div class="not-found"><h1>Товар не найден</h1><p>Возможно, его уже нет в наличии.</p><a href="catalog.html" class="btn">Вернуться в каталог</a></div>`;
  } else {
    document.title = `${p.name} — Аружан Flowers`;
    let qty = 1;
    productEl.innerHTML = `
      <nav class="crumbs"><a href="index.html">Главная</a> / <a href="catalog.html?cat=${p.cat}">${CATEGORIES[p.cat]}</a> / <span>${p.name}</span></nav>
      <div class="product">
        <div class="product-img"><img src="${p.img}" alt="${p.name}"></div>
        <div class="product-info">
          <span class="card-cat">${CATEGORIES[p.cat]}</span>
          <h1>${p.name}</h1>
          <p class="product-desc">${p.desc}</p>
          <p class="product-price">${formatPrice(p.price)}</p>
          <div class="product-buy">
            <div class="qty qty-lg">
              <button type="button" id="qMinus" aria-label="Меньше">−</button>
              <span id="qVal">1</span>
              <button type="button" id="qPlus" aria-label="Больше">+</button>
            </div>
            <button type="button" class="btn" id="buyBtn">В корзину</button>
          </div>
          <a class="product-wa" href="${waLink(`Здравствуйте! Хочу узнать про «${p.name}» (${formatPrice(p.price)}).`)}" target="_blank" rel="noopener">Задать вопрос в WhatsApp</a>
          <ul class="product-notes">
            <li>Соберём заказ заранее и красиво упакуем</li>
            <li>Самовывоз или доставка курьером — <a href="delivery.html">подробнее</a></li>
          </ul>
        </div>
      </div>`;
    const qVal = document.getElementById("qVal");
    document.getElementById("qMinus").addEventListener("click", () => { qty = Math.max(1, qty - 1); qVal.textContent = qty; });
    document.getElementById("qPlus").addEventListener("click", () => { qty++; qVal.textContent = qty; });
    document.getElementById("buyBtn").addEventListener("click", (e) => { addToCart(p.id, qty, e.currentTarget); });

    const related = products.filter((x) => x.cat === p.cat && x.id !== p.id).slice(0, 3);
    const more = related.length ? related : products.filter((x) => x.id !== p.id).slice(0, 3);
    document.getElementById("related").innerHTML = more.map(cardHtml).join("");
  }
}

// Контакты
const contactsEl = document.getElementById("contactsList");
if (contactsEl) {
  const rows = [
    ["WhatsApp", `<a href="${waLink()}" target="_blank" rel="noopener">+${WHATSAPP_NUMBER}</a>`],
    ["Город", SHOP.city],
    ["Адрес", SHOP.address],
    ["Часы работы", SHOP.hours],
    ["Instagram", SHOP.instagram && `<a href="https://instagram.com/${SHOP.instagram}" target="_blank" rel="noopener">@${SHOP.instagram}</a>`],
  ].filter(([, v]) => v);
  contactsEl.innerHTML = rows.map(([k, v]) => `<div class="contact-row"><span>${k}</span><strong>${v}</strong></div>`).join("");
  document.getElementById("contactsWa").href = waLink("Здравствуйте! У меня вопрос по заказу.");
}

renderCart();
renderDelivery();
