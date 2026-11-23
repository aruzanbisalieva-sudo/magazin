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
  { id: 1, cat: "flowers", name: "Розовые тюльпаны", desc: "15 махровых тюльпанов в нежной ленте", price: 15000, img: "images/b1.jpg", tags: ["розовый", "весна", "нежный"] },
  { id: 2, cat: "flowers", name: "Нежность", desc: "Пионы, кустовые розы и эвкалипт", price: 28000, img: "images/b2.jpg", tags: ["розовый", "нежный", "свадьба", "премиум"] },
  { id: 3, cat: "flowers", name: "Пудровые розы", desc: "Пионовидные розы розовых и кремовых оттенков", price: 22000, img: "images/b3.jpg", tags: ["розовый", "нежный", "розы", "любовь"] },
  { id: 4, cat: "flowers", name: "Красные розы", desc: "Красные розы в нежной упаковке — классика любви", price: 25000, img: "images/roses-red.jpg", tags: ["красный", "розы", "любовь"] },
  { id: 5, cat: "flowers", name: "Осенний сад", desc: "Розы, гипериум и сезонная зелень", price: 32000, img: "images/b5.jpg", tags: ["яркий", "розы", "премиум"] },
  { id: 6, cat: "flowers", name: "Солнечный день", desc: "Подсолнух, полевые цветы в крафте", price: 12000, img: "images/b6.jpg", tags: ["яркий", "весна", "друзьям"] },
  { id: 10, cat: "flowers", name: "Композиция в коробке", desc: "Лилии, розы и гвоздики в белой коробке с лентой", price: 20000, img: "images/box-lilies.jpg", tags: ["нежный", "премиум", "маме"] },
  { id: 7, cat: "bears", name: "Мишки в шапках", desc: "Два мягких мишки в новогодних шапках и свитерах", price: 10000, img: "images/bears-xmas.jpg", tags: ["красный", "новый год", "друзьям"] },
  { id: 8, cat: "bears", name: "Мишка с сердечками", desc: "Большой мягкий мишка — отличный подарок", price: 10000, img: "images/bear-hearts.jpg", tags: ["любовь", "нежный", "красный"] },
  { id: 9, cat: "balloons", name: "Розовые шары", desc: "Воздушные шары в нежных розовых оттенках", price: 5000, img: "images/balloons-pink.jpg", tags: ["розовый", "нежный", "праздник"] },
];

// Дата текущей версии политики конфиденциальности (обновите, если поменяете текст privacy.html)
const PRIVACY_VERSION = "23.11.2026";

// Товары для блока «Популярное» на главной
const POPULAR_IDS = [2, 4, 10, 8];

// ================== ХРАНИЛИЩЕ ==================
// Учебный проект: все данные (аккаунты, заказы, избранное) хранятся в браузере (localStorage).
// Для настоящего магазина нужен сервер и база данных, например Supabase или Firebase.
const load = (key, def) => {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? def; } catch (e) { return def; }
};
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} };

// ================== ОБЩЕЕ ==================
const formatPrice = (n) => n.toLocaleString("ru-RU").replace(/\s/g, " ") + " ₸";
const page = document.body.dataset.page || "";
const findProduct = (id) => products.find((p) => String(p.id) === String(id));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}${text ? "?text=" + encodeURIComponent(text) : ""}`;

const NAV = [
  { href: "index.html", key: "home", label: "Главная" },
  { href: "catalog.html", key: "catalog", label: "Каталог" },
  { href: "delivery.html", key: "delivery", label: "Доставка" },
  { href: "contacts.html", key: "contacts", label: "Контакты" },
];

// ================== АККАУНТЫ ==================
const getUsers = () => load("users", {});
const currentUser = () => {
  const email = load("session", null);
  return email ? getUsers()[email] || null : null;
};
function saveUser(user) {
  const users = getUsers();
  users[user.email] = user;
  save("users", users);
}

// Пароль храним не открытым текстом, а в виде хеша SHA-256
async function hashPassword(email, pass) {
  const text = email + ":" + pass + ":aruzhan-flowers";
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
    return "h" + h;
  }
}

async function register({ name, email, phone, pass, consent, personalize }) {
  email = email.trim().toLowerCase();
  if (!name.trim()) return "Введите имя";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Проверьте адрес почты";
  if (pass.length < 6) return "Пароль должен быть не короче 6 символов";
  if (getUsers()[email]) return "Такая почта уже зарегистрирована. Войдите.";
  if (!consent) return "Чтобы зарегистрироваться, нужно согласие на обработку персональных данных";
  saveUser({
    name: name.trim(), email, phone: phone.trim(), address: "", pass: await hashPassword(email, pass), created: Date.now(),
    consent: { date: Date.now(), version: PRIVACY_VERSION, personalize: !!personalize },
  });
  save("session", email);
  mergeGuestActivity(email);
  return "";
}

async function login(email, pass, consent) {
  email = email.trim().toLowerCase();
  const user = getUsers()[email];
  if (!user || user.pass !== (await hashPassword(email, pass))) return "Неверная почта или пароль";
  if (!consent) return "Чтобы войти, нужно согласие на обработку персональных данных";
  user.consent = { personalize: true, ...(user.consent || {}), date: Date.now(), version: PRIVACY_VERSION };
  saveUser(user);
  save("session", email);
  mergeGuestActivity(email);
  return "";
}

// Удаление аккаунта = отзыв согласия: стираем все данные пользователя
function deleteAccount() {
  const email = load("session", null);
  if (!email) return;
  const users = getUsers();
  delete users[email];
  save("users", users);
  try {
    localStorage.removeItem(actKey(email));
    localStorage.removeItem("session");
    localStorage.removeItem("address");
  } catch (e) {}
  location.href = "index.html";
}

// Можно ли использовать просмотры и заказы для рекомендаций.
// Гость — да (данные не покидают его браузер), пользователь — только с его разрешения.
const canPersonalize = () => {
  const u = currentUser();
  return !u || u.consent?.personalize !== false;
};

function logout() {
  try { localStorage.removeItem("session"); } catch (e) {}
  location.href = "index.html";
}

// ================== АКТИВНОСТЬ (для рекомендаций) ==================
// У каждого пользователя свои просмотры, избранное и заказы. У гостя — свои.
const actKey = (email) => "activity:" + (email || "guest");
const emptyActivity = () => ({ views: {}, favs: [], orders: [] });
const getActivity = () => ({ ...emptyActivity(), ...load(actKey(load("session", null)), {}) });
const setActivity = (a) => save(actKey(load("session", null)), a);

// Что гость смотрел до входа — переносим в аккаунт
function mergeGuestActivity(email) {
  const guest = { ...emptyActivity(), ...load(actKey(null), {}) };
  const mine = { ...emptyActivity(), ...load(actKey(email), {}) };
  for (const [id, n] of Object.entries(guest.views)) mine.views[id] = (mine.views[id] || 0) + n;
  mine.favs = [...new Set([...mine.favs, ...guest.favs])];
  save(actKey(email), mine);
  save(actKey(null), emptyActivity());
}

function trackView(id) {
  if (!canPersonalize()) return;
  const a = getActivity();
  a.views[id] = (a.views[id] || 0) + 1;
  setActivity(a);
}

const isFav = (id) => getActivity().favs.map(String).includes(String(id));
function toggleFav(id) {
  const a = getActivity();
  a.favs = isFav(id) ? a.favs.filter((x) => String(x) !== String(id)) : [...a.favs, Number(id)];
  setActivity(a);
  return isFav(id);
}

// ================== РЕКОМЕНДАЦИИ ==================
// Похожесть двух товаров: та же категория +2, каждый общий тег +1
function similarity(a, b) {
  let s = a.cat === b.cat ? 2 : 0;
  for (const t of a.tags) if (b.tags.includes(t)) s += 1;
  return s;
}

// Насколько пользователю интересен каждый товар:
// просмотр = 1, в корзине = 2, в избранном = 3, заказывал = 4
function interestWeights() {
  const a = getActivity();
  const w = {};
  const add = (id, n) => { w[id] = (w[id] || 0) + n; };
  for (const [id, n] of Object.entries(a.views)) add(id, Math.min(n, 3));
  for (const [id, qty] of Object.entries(cart)) if (qty > 0) add(id, 2);
  for (const id of a.favs) add(id, 3);
  for (const o of a.orders) for (const it of o.items) add(it.id, 4);
  return w;
}

// Персональные рекомендации: товары, похожие на то, что человек смотрел и любит
function recommend(limit = 4, exclude = []) {
  const w = canPersonalize() ? interestWeights() : {};
  const seen = Object.keys(w);
  if (!seen.length) return { personal: false, items: POPULAR_IDS.map(findProduct).filter(Boolean).slice(0, limit) };
  const skip = new Set([...exclude, ...Object.keys(cart)].map(String));
  const scored = products
    .filter((p) => !skip.has(String(p.id)))
    .map((p) => {
      let score = 0;
      for (const id of seen) {
        const q = findProduct(id);
        if (q && q.id !== p.id) score += w[id] * similarity(q, p);
      }
      if (seen.includes(String(p.id))) score *= 0.6; // уже знакомые товары чуть ниже новых
      return { p, score };
    })
    .sort((x, y) => y.score - x.score || POPULAR_IDS.indexOf(y.p.id) - POPULAR_IDS.indexOf(x.p.id));
  return { personal: true, items: scored.slice(0, limit).map((x) => x.p) };
}

// «Дополните подарок»: к цветам — мишки и шары, к мишкам и шарам — цветы
function complements(p, limit = 3) {
  const other = products.filter((x) => (p.cat === "flowers" ? x.cat !== "flowers" : x.cat === "flowers"));
  return other.sort((a, b) => similarity(p, b) - similarity(p, a)).slice(0, limit);
}

// Похожие на конкретный товар
const similarTo = (p, limit = 3) =>
  products.filter((x) => x.id !== p.id).sort((a, b) => similarity(p, b) - similarity(p, a)).slice(0, limit);

// ================== ШАПКА, ПОДВАЛ, КОРЗИНА ==================
function renderLayout() {
  const user = currentUser();
  const navHtml = NAV.map((n) =>
    `<a href="${n.href}"${n.key === page ? ' class="active" aria-current="page"' : ""}>${n.label}</a>`
  ).join("");
  const userBtn = user
    ? `<a href="account.html" class="user-btn${page === "account" ? " active" : ""}" title="Личный кабинет"><span class="user-ava">${esc(user.name[0].toUpperCase())}</span><span class="user-name">${esc(user.name.split(" ")[0])}</span></a>`
    : `<a href="login.html" class="user-btn${page === "login" ? " active" : ""}" title="Войти"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg><span class="user-name">Войти</span></a>`;

  document.body.insertAdjacentHTML("afterbegin", `
  <header class="header">
    <a href="index.html" class="logo"><img class="logo-ava" src="images/ava.jpg" alt="">Аружан <span>Flowers</span></a>
    <nav class="nav">${navHtml}</nav>
    <div class="header-actions">
      <a href="favorites.html" class="fav-head${page === "favorites" ? " active" : ""}" aria-label="Избранное" title="Избранное">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20.5s-7.5-4.6-9.6-9.2C.9 7.8 3 4 6.8 4c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.8 0 5.9 3.8 4.4 7.3-2.1 4.6-9.6 9.2-9.6 9.2z"/></svg>
        <span class="cart-count fav-count" id="favCount" hidden>0</span>
      </a>
      ${userBtn}
      <button class="cart-btn" id="cartOpen" aria-label="Открыть корзину">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7V5a3 3 0 0 1 6 0v2"/></svg>
        <span class="cart-count" id="cartCount">0</span>
      </button>
    </div>
  </header>
  <nav class="nav-mobile">${navHtml}</nav>`);

  const contactBits = [SHOP.city, SHOP.address, SHOP.hours].filter(Boolean).join(" · ");
  document.body.insertAdjacentHTML("beforeend", `
  <footer class="footer">
    <p class="logo">Аружан <span>Flowers</span></p>
    <nav class="footer-nav">${NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join("")}<a href="${user ? "account.html" : "login.html"}">${user ? "Личный кабинет" : "Войти"}</a><a href="favorites.html">Избранное</a><a href="privacy.html">Конфиденциальность</a></nav>
    ${contactBits ? `<p>${esc(contactBits)}</p>` : ""}
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
      <p class="cart-login-hint" id="cartLoginHint"></p>
      <p class="cart-privacy">Нажимая «Заказать», вы соглашаетесь с <a href="privacy.html">обработкой персональных данных</a></p>
    </div>
  </aside>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`);
}
renderLayout();

function renderFavCount() {
  const n = getActivity().favs.filter((id) => findProduct(id)).length;
  const el = document.getElementById("favCount");
  el.textContent = n;
  el.hidden = n === 0;
}

function toast(text) {
  const t = document.getElementById("toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 2200);
}

// ================== КОРЗИНА ==================
let cart = load("cart", {});
if (typeof cart !== "object" || Array.isArray(cart)) cart = {};
const saveCart = () => save("cart", cart);

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

const heartSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.8 0 5.9 3.8 4.4 7.3C19.5 16.4 12 21 12 21z"/></svg>`;
const favBtnHtml = (id, extra = "") =>
  `<button type="button" class="fav-btn${isFav(id) ? " on" : ""}${extra}" data-fav="${id}" aria-pressed="${isFav(id)}" aria-label="В избранное" title="В избранное">${heartSvg}</button>`;

// Карточка товара (главная, каталог, страница товара, кабинет)
const cardHtml = (p) => `
  <article class="card">
    <a href="product.html?id=${p.id}" class="card-img"><img src="${p.img}" alt="${esc(p.name)}" loading="lazy"></a>
    ${favBtnHtml(p.id, " card-fav")}
    <div class="card-body">
      <span class="card-cat">${CATEGORIES[p.cat]}</span>
      <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
      <p>${esc(p.desc)}</p>
      <div class="card-bottom">
        <span class="price">${formatPrice(p.price)}</span>
        <button class="add-btn" data-id="${p.id}">В корзину</button>
      </div>
    </div>
  </article>`;

document.addEventListener("click", (e) => {
  const add = e.target.closest(".add-btn");
  if (add) addToCart(add.dataset.id, 1, add);

  const fav = e.target.closest("[data-fav]");
  if (fav) {
    const on = toggleFav(fav.dataset.fav);
    document.querySelectorAll(`[data-fav="${fav.dataset.fav}"]`).forEach((b) => {
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on);
    });
    toast(on ? "Добавлено в избранное ❤" : "Убрано из избранного");
    renderFavCount();
    if (page === "account") renderAccount();
    if (page === "favorites") renderFavorites();
  }
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
  cartCountEl.textContent = items.reduce((s, i) => s + i.qty, 0);
  cartTotalEl.textContent = formatPrice(items.reduce((s, i) => s + i.qty * i.price, 0));
  orderBtn.disabled = items.length === 0;
  const user = currentUser();
  document.getElementById("cartLoginHint").innerHTML = user
    ? `Заказ сохранится в <a href="account.html">личном кабинете</a>`
    : `<a href="login.html">Войдите</a>, чтобы заказы сохранялись в кабинете`;

  if (!items.length) {
    cartItemsEl.innerHTML = `<p class="cart-empty">Корзина пуста 🌸<br><a href="catalog.html">Перейти в каталог</a></p>`;
    return;
  }
  cartItemsEl.innerHTML = items.map((i) => `
    <div class="cart-item">
      <img src="${i.img}" alt="${esc(i.name)}">
      <div>
        <h4>${esc(i.name)}</h4>
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

window.addEventListener("storage", (e) => {
  if (e.key !== "cart") return;
  cart = load("cart", {});
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
const addressInput2 = document.getElementById("addressInput2"); // только на странице «Доставка»
const deliveryHint = document.getElementById("deliveryHint");
let delivery = load("delivery", "");
let address = load("address", "") || currentUser()?.address || "";
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
  save("delivery", delivery);
  renderDelivery();
});

function onAddressInput(src, other) {
  address = src.value;
  if (other) other.value = address;
  save("address", address);
  deliveryHint.hidden = true;
}
addressInput.addEventListener("input", () => onAddressInput(addressInput, addressInput2));
if (addressInput2) addressInput2.addEventListener("input", () => onAddressInput(addressInput2, addressInput));

function showHint(text) {
  deliveryHint.textContent = text;
  deliveryHint.hidden = false;
}

// Заказ в WhatsApp + сохранение в историю заказов
orderBtn.addEventListener("click", () => {
  const items = cartList();
  if (!items.length) return;
  if (!delivery) { showHint("Выберите способ получения: самовывоз или курьер"); return; }
  if (delivery === "courier" && !address.trim()) { showHint("Напишите адрес доставки"); addressInput.focus(); return; }
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);
  const user = currentUser();
  const lines = items.map((i) => `• ${i.name} × ${i.qty} — ${formatPrice(i.price * i.qty)}`);
  const who = user ? `\nИмя: ${user.name}${user.phone ? "\nТелефон: " + user.phone : ""}` : "";
  const text = `Здравствуйте! Хочу заказать в «Аружан Flowers»:\n\n${lines.join("\n")}\n\nИтого: ${formatPrice(total)}\nПолучение: ${DELIVERY_NAMES[delivery]}${delivery === "courier" ? "\nАдрес: " + address.trim() : ""}${who}`;

  const a = getActivity();
  a.orders.unshift({
    date: Date.now(),
    items: items.map((i) => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
    total, delivery, address: delivery === "courier" ? address.trim() : "",
  });
  setActivity(a);
  cart = {};
  saveCart();
  renderCart();
  closeCart();
  toast(user ? "Заказ отправлен и сохранён в кабинете" : "Заказ отправлен в WhatsApp");

  // открываем WhatsApp обычной ссылкой — так её не блокирует браузер
  const link = document.createElement("a");
  link.href = waLink(text);
  link.target = "_blank";
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (page === "account") renderAccount();
});

// ================== СТРАНИЦЫ ==================

// Главная: персональные рекомендации (или популярное, если человек ещё ничего не смотрел)
const popularEl = document.getElementById("popular");
if (popularEl) {
  const rec = recommend(4);
  popularEl.innerHTML = rec.items.map(cardHtml).join("");
  document.getElementById("popularTitle").textContent = rec.personal ? "Подобрано для вас" : "Популярное";
  const sub = document.getElementById("popularSub");
  sub.textContent = rec.personal ? "На основе того, что вы смотрели, добавляли в корзину и избранное" : "";
  sub.hidden = !rec.personal;
}

// Кнопка «Регистрация» на главной: если клиент уже вошёл — ведёт в кабинет
const heroRegister = document.getElementById("heroRegister");
if (heroRegister && currentUser()) {
  heroRegister.textContent = "Личный кабинет";
  heroRegister.href = "account.html";
}

// Каталог: фильтр по категориям и сортировка
const productsEl = document.getElementById("products");
const filtersEl = document.getElementById("filters");
if (productsEl && filtersEl) {
  let current = new URLSearchParams(location.search).get("cat");
  if (!CATEGORIES[current]) current = "all";
  const sortEl = document.getElementById("sort");
  let sortBy = "rec";

  const renderCatalog = () => {
    filtersEl.innerHTML = [["all", "Все"], ...Object.entries(CATEGORIES)].map(([key, label]) => {
      const n = key === "all" ? products.length : products.filter((p) => p.cat === key).length;
      return `<button type="button" class="filter${key === current ? " active" : ""}" data-cat="${key}" aria-pressed="${key === current}">${label} <span>${n}</span></button>`;
    }).join("");
    let list = current === "all" ? [...products] : products.filter((p) => p.cat === current);
    if (sortBy === "cheap") list.sort((a, b) => a.price - b.price);
    if (sortBy === "expensive") list.sort((a, b) => b.price - a.price);
    if (sortBy === "rec") {
      const order = recommend(products.length).items.map((p) => p.id);
      list.sort((a, b) => {
        const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });
    }
    productsEl.innerHTML = list.map(cardHtml).join("");
  };

  filtersEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    current = b.dataset.cat;
    history.replaceState(null, "", current === "all" ? "catalog.html" : `catalog.html?cat=${current}`);
    renderCatalog();
  });
  sortEl.addEventListener("change", () => { sortBy = sortEl.value; renderCatalog(); });
  renderCatalog();
}

// Страница товара: product.html?id=3
const productEl = document.getElementById("product");
if (productEl) {
  const p = findProduct(new URLSearchParams(location.search).get("id"));
  if (!p) {
    productEl.innerHTML = `<div class="not-found"><h1>Товар не найден</h1><p>Возможно, его уже нет в наличии.</p><a href="catalog.html" class="btn">Вернуться в каталог</a></div>`;
    document.querySelectorAll(".related").forEach((s) => (s.hidden = true));
  } else {
    trackView(p.id);
    document.title = `${p.name} — Аружан Flowers`;
    let qty = 1;
    productEl.innerHTML = `
      <nav class="crumbs"><a href="index.html">Главная</a> / <a href="catalog.html?cat=${p.cat}">${CATEGORIES[p.cat]}</a> / <span>${esc(p.name)}</span></nav>
      <div class="product">
        <div class="product-img"><img src="${p.img}" alt="${esc(p.name)}"></div>
        <div class="product-info">
          <span class="card-cat">${CATEGORIES[p.cat]}</span>
          <h1>${esc(p.name)}</h1>
          <p class="product-desc">${esc(p.desc)}</p>
          <div class="product-tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
          <p class="product-price">${formatPrice(p.price)}</p>
          <div class="product-buy">
            <div class="qty qty-lg">
              <button type="button" id="qMinus" aria-label="Меньше">−</button>
              <span id="qVal">1</span>
              <button type="button" id="qPlus" aria-label="Больше">+</button>
            </div>
            <button type="button" class="btn" id="buyBtn">В корзину</button>
            ${favBtnHtml(p.id, " fav-lg")}
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
    document.getElementById("buyBtn").addEventListener("click", (e) => addToCart(p.id, qty, e.currentTarget));

    document.getElementById("complements").innerHTML = complements(p).map(cardHtml).join("");
    document.getElementById("related").innerHTML = similarTo(p).map(cardHtml).join("");
  }
}

// Контакты
const contactsEl = document.getElementById("contactsList");
if (contactsEl) {
  const rows = [
    ["WhatsApp", `<a href="${waLink()}" target="_blank" rel="noopener">+${WHATSAPP_NUMBER}</a>`],
    ["Город", esc(SHOP.city)],
    ["Адрес", esc(SHOP.address)],
    ["Часы работы", esc(SHOP.hours)],
    ["Instagram", SHOP.instagram && `<a href="https://instagram.com/${esc(SHOP.instagram)}" target="_blank" rel="noopener">@${esc(SHOP.instagram)}</a>`],
  ].filter(([, v]) => v);
  contactsEl.innerHTML = rows.map(([k, v]) => `<div class="contact-row"><span>${k}</span><strong>${v}</strong></div>`).join("");
  document.getElementById("contactsWa").href = waLink("Здравствуйте! У меня вопрос по заказу.");
}

// Вход и регистрация
const authEl = document.getElementById("auth");
if (authEl) {
  if (currentUser()) location.replace("account.html");
  const tabs = authEl.querySelectorAll("[data-tab]");
  const forms = { login: document.getElementById("loginForm"), register: document.getElementById("registerForm") };
  const showTab = (name) => {
    tabs.forEach((t) => { const on = t.dataset.tab === name; t.classList.toggle("active", on); t.setAttribute("aria-selected", on); });
    for (const [k, f] of Object.entries(forms)) f.hidden = k !== name;
  };
  tabs.forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));
  if (location.hash === "#register") showTab("register");

  const withError = (form, fn) => async (e) => {
    e.preventDefault();
    const err = form.querySelector(".form-error");
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    const msg = await fn(new FormData(form));
    btn.disabled = false;
    err.textContent = msg;
    err.hidden = !msg;
    if (!msg) location.href = "account.html";
  };
  forms.login.addEventListener("submit", withError(forms.login, (d) => login(d.get("email"), d.get("pass"), d.get("consent") === "on")));
  forms.register.addEventListener("submit", withError(forms.register, (d) =>
    register({ name: d.get("name"), email: d.get("email"), phone: d.get("phone"), pass: d.get("pass"), consent: d.get("consent") === "on", personalize: d.get("personalize") === "on" })));
}

// Личный кабинет
function renderAccount() {
  const user = currentUser();
  const a = getActivity();
  document.getElementById("accHello").textContent = `Здравствуйте, ${user.name}!`;
  document.getElementById("accSince").textContent = `В магазине с ${new Date(user.created).toLocaleDateString("ru-RU")}`;

  const ordersEl = document.getElementById("accOrders");
  ordersEl.innerHTML = a.orders.length
    ? a.orders.map((o) => `
      <div class="order">
        <div class="order-head"><strong>${new Date(o.date).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</strong><span>${formatPrice(o.total)}</span></div>
        <p>${o.items.map((i) => `${esc(i.name)} × ${i.qty}`).join(", ")}</p>
        <div class="order-foot"><span>${DELIVERY_NAMES[o.delivery] || ""}${o.address ? " · " + esc(o.address) : ""}</span>
          <button type="button" class="link-btn" data-repeat="${o.date}">Повторить заказ</button></div>
      </div>`).join("")
    : `<p class="empty">Заказов пока нет. <a href="catalog.html">Перейти в каталог</a></p>`;

  const favs = a.favs.map(findProduct).filter(Boolean);
  document.getElementById("accFavs").innerHTML = favs.length
    ? favs.map(cardHtml).join("")
    : `<p class="empty">Нажимайте ❤ на товарах, и они появятся здесь.</p>`;

  document.getElementById("accRecs").innerHTML = recommend(4).items.map(cardHtml).join("");
  document.getElementById("accRecsSub").textContent = canPersonalize()
    ? "Подобрано по вашим просмотрам, избранному и заказам"
    : "Персональные рекомендации выключены — показываем популярное";

  const c = user.consent || {};
  document.getElementById("consentInfo").innerHTML = c.date
    ? `Согласие на обработку персональных данных дано <b>${new Date(c.date).toLocaleDateString("ru-RU")}</b> (политика от ${PRIVACY_VERSION}).`
    : `Согласие не зафиксировано.`;
  document.getElementById("personalizeToggle").checked = c.personalize !== false;
}

const accEl = document.getElementById("account");
if (accEl) {
  const user = currentUser();
  if (!user) {
    location.replace("login.html");
  } else {
    const form = document.getElementById("profileForm");
    form.name.value = user.name;
    form.email.value = user.email;
    form.phone.value = user.phone || "";
    form.address.value = user.address || "";
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = currentUser();
      u.name = form.name.value.trim() || u.name;
      u.phone = form.phone.value.trim();
      u.address = form.address.value.trim();
      saveUser(u);
      if (u.address && !address) { address = u.address; save("address", address); addressInput.value = address; }
      toast("Данные сохранены");
      renderAccount();
      document.querySelectorAll(".user-name").forEach((el) => (el.textContent = u.name.split(" ")[0]));
    });
    document.getElementById("logoutBtn").addEventListener("click", logout);
    document.getElementById("personalizeToggle").addEventListener("change", (e) => {
      const u = currentUser();
      u.consent = { ...(u.consent || { date: Date.now(), version: PRIVACY_VERSION }), personalize: e.target.checked };
      saveUser(u);
      if (!e.target.checked) { const a = getActivity(); a.views = {}; setActivity(a); }
      toast(e.target.checked ? "Персональные рекомендации включены" : "Выключено. История просмотров удалена");
      renderAccount();
    });
    const delBox = document.getElementById("deleteConfirm");
    document.getElementById("deleteBtn").addEventListener("click", () => { delBox.hidden = false; });
    document.getElementById("deleteCancel").addEventListener("click", () => { delBox.hidden = true; });
    document.getElementById("deleteYes").addEventListener("click", deleteAccount);
    document.getElementById("accOrders").addEventListener("click", (e) => {
      const b = e.target.closest("[data-repeat]");
      if (!b) return;
      const o = getActivity().orders.find((x) => String(x.date) === b.dataset.repeat);
      if (!o) return;
      for (const it of o.items) if (findProduct(it.id)) cart[it.id] = (cart[it.id] || 0) + it.qty;
      saveCart();
      renderCart();
      openCart();
    });
    renderAccount();
  }
}

// Страница «Избранное»
function renderFavorites() {
  const favs = getActivity().favs.map(findProduct).filter(Boolean);
  const grid = document.getElementById("favGrid");
  const empty = document.getElementById("favEmpty");
  const actions = document.getElementById("favActions");
  grid.innerHTML = favs.map(cardHtml).join("");
  empty.hidden = favs.length > 0;
  actions.hidden = favs.length === 0;
  document.getElementById("favSub").textContent = favs.length
    ? `${favs.length} ${favs.length === 1 ? "товар" : favs.length < 5 ? "товара" : "товаров"} · сумма ${formatPrice(favs.reduce((s, p) => s + p.price, 0))}`
    : "";
  const hint = document.getElementById("favLoginHint");
  hint.hidden = !!currentUser();
}
if (document.getElementById("favGrid")) {
  renderFavorites();
  document.getElementById("favAllToCart").addEventListener("click", () => {
    for (const p of getActivity().favs.map(findProduct).filter(Boolean)) cart[p.id] = (cart[p.id] || 0) + 1;
    saveCart();
    renderCart();
    openCart();
  });
  document.getElementById("favClear").addEventListener("click", () => {
    const a = getActivity();
    a.favs = [];
    setActivity(a);
    renderFavorites();
    renderFavCount();
    toast("Избранное очищено");
  });
}

renderFavCount();
renderCart();
renderDelivery();
