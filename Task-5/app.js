// ======= Data (mock "API" fetch) =======
const PRODUCTS = [
  { id: 1, title: "Classic Tee", category: "fashion", price: 899, rating: 4.2, img: "https://picsum.photos/400/300?random=1" },
  { id: 2, title: "Denim Jacket", category: "fashion", price: 2599, rating: 4.6, img: "https://picsum.photos/400/300?random=2" },
  { id: 3, title: "Smartphone XS", category: "electronics", price: 18999, rating: 4.5, img: "https://picsum.photos/400/300?random=3" },
  { id: 4, title: "Bluetooth Headphones", category: "electronics", price: 3499, rating: 4.3, img: "https://picsum.photos/400/300?random=4" },
  { id: 5, title: "Coffee Grinder", category: "home", price: 2199, rating: 4.1, img: "https://picsum.photos/400/300?random=5" },
  { id: 6, title: "Ceramic Vase", category: "home", price: 1299, rating: 4.0, img: "https://picsum.photos/400/300?random=6" },
  { id: 7, title: "Running Shoes", category: "fashion", price: 3299, rating: 4.4, img: "https://picsum.photos/400/300?random=7" },
  { id: 8, title: "Gaming Mouse", category: "electronics", price: 1499, rating: 4.2, img: "https://picsum.photos/400/300?random=8" },
  { id: 9, title: "Table Lamp", category: "home", price: 999, rating: 4.3, img: "https://picsum.photos/400/300?random=9" },
  { id: 10, title: "Wireless Charger", category: "electronics", price: 1299, rating: 4.1, img: "https://picsum.photos/400/300?random=10" },
];

// ======= Utilities =======
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const formatINR = (n) => new Intl.NumberFormat('en-IN').format(n);

// ======= State =======
const state = {
  products: [],
  filtered: [],
  cart: JSON.parse(localStorage.getItem('apexshop_cart') || '[]'),
  filters: {
    search: '',
    categories: new Set(['fashion','electronics','home']),
    maxPrice: 5000,
    sort: 'default'
  },
  carousel: { index: 0, timer: null }
};

// ======= Init =======
document.addEventListener('DOMContentLoaded', () => {
  // Mock fetch products
  loadProducts();

  // Bind UI
  initNavbar();
  initFilters();
  initCart();
  initContactForm();
  initCarousel();
  $('#year').textContent = new Date().getFullYear();
});

function loadProducts(){
  // Simulate async fetch
  Promise.resolve(PRODUCTS).then(data => {
    state.products = data;
    applyFilters();
  });
}

// ======= Navbar (mobile) =======
function initNavbar(){
  const toggle = $('#navToggle');
  const menu = $('#navMenu');
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// ======= Filters & Sorting =======
function initFilters(){
  const search = $('#searchInput');
  const price = $('#priceRange');
  const priceVal = $('#priceVal');
  const sort = $('#sortSelect');
  const clear = $('#clearFilters');
  const catBoxes = $$('input[name="cat"]');

  search.addEventListener('input', (e) => {
    state.filters.search = e.target.value.trim().toLowerCase();
    applyFilters();
  });

  price.addEventListener('input', (e) => {
    state.filters.maxPrice = Number(e.target.value);
    priceVal.textContent = e.target.value;
    applyFilters();
  });

  sort.addEventListener('change', (e) => {
    state.filters.sort = e.target.value;
    applyFilters();
  });

  catBoxes.forEach(cb => cb.addEventListener('change', () => {
    const set = state.filters.categories;
    set.clear();
    $$('input[name="cat"]:checked').forEach(x => set.add(x.value));
    applyFilters();
  }));

  clear.addEventListener('click', () => {
    search.value = '';
    state.filters.search = '';
    $('#priceRange').value = 5000;
    $('#priceVal').textContent = 5000;
    state.filters.maxPrice = 5000;
    state.filters.categories = new Set(['fashion','electronics','home']);
    $$('input[name="cat"]').forEach(x => x.checked = true);
    $('#sortSelect').value = 'default';
    state.filters.sort = 'default';
    applyFilters();
  });
}

function applyFilters(){
  const { search, categories, maxPrice, sort } = state.filters;
  let list = state.products.filter(p => 
    p.title.toLowerCase().includes(search) &&
    categories.has(p.category) &&
    p.price <= maxPrice
  );

  switch(sort){
    case 'price-asc': list.sort((a,b)=>a.price-b.price); break;
    case 'price-desc': list.sort((a,b)=>b.price-a.price); break;
    case 'rating-desc': list.sort((a,b)=>b.rating-a.rating); break;
  }

  state.filtered = list;
  renderCatalog();
}

function renderCatalog(){
  const grid = $('.catalog');
  grid.setAttribute('aria-busy','true');
  grid.innerHTML = state.filtered.map(cardHTML).join('');
  grid.setAttribute('aria-busy','false');

  // Bind Add-to-cart buttons
  $$('.add-btn', grid).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      addToCart(id);
    });
  });
}

function cardHTML(p){
  return `
  <article class="card" aria-label="${p.title}">
    <div class="card__img">
      <img loading="lazy" src="${p.img}" alt="${p.title}" width="400" height="300">
    </div>
    <h4 class="card__title">${p.title}</h4>
    <div class="card__rating">★ ${p.rating.toFixed(1)}</div>
    <div class="card__price">₹ ${formatINR(p.price)}</div>
    <div class="card__actions">
      <button class="btn add-btn" data-id="${p.id}">Add to Cart</button>
      <button class="btn btn--ghost" onclick="alert('Thanks for exploring!')">Details</button>
    </div>
  </article>`;
}

// ======= Cart with localStorage =======
function initCart(){
  $('#cartOpenBtn').addEventListener('click', openCart);
  $('#cartCloseBtn').addEventListener('click', closeCart);
  $('#backdrop').addEventListener('click', closeCart);
  $('#checkoutBtn').addEventListener('click', checkout);

  renderCart();
}

function openCart(){
  $('#cartDrawer').classList.add('cart--open');
  $('#backdrop').hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeCart(){
  $('#cartDrawer').classList.remove('cart--open');
  $('#backdrop').hidden = true;
  document.body.style.overflow = '';
}

function addToCart(id){
  const item = state.cart.find(x => x.id === id);
  if(item){ item.qty += 1; }
  else {
    const p = state.products.find(x => x.id === id);
    state.cart.push({ id: p.id, title: p.title, price: p.price, img: p.img, qty: 1 });
  }
  persistCart();
  renderCart();
}

function changeQty(id, delta){
  const item = state.cart.find(x => x.id === id);
  if(!item) return;
  item.qty += delta;
  if(item.qty <= 0){
    state.cart = state.cart.filter(x => x.id !== id);
  }
  persistCart();
  renderCart();
}

function persistCart(){
  localStorage.setItem('apexshop_cart', JSON.stringify(state.cart));
}

function renderCart(){
  const list = $('#cartItems');
  const count = state.cart.reduce((s,x)=>s+x.qty,0);
  $('#cartCount').textContent = count;

  if(state.cart.length === 0){
    list.innerHTML = `<li class="cart__item">Your cart is empty.</li>`;
    $('#cartTotal').textContent = '0';
    return;
  }

  list.innerHTML = state.cart.map(item => `
    <li class="cart__item">
      <img src="${item.img}" alt="${item.title}">
      <div>
        <strong>${item.title}</strong>
        <div>₹ ${formatINR(item.price)}</div>
        <div class="cart__qty">
          <button class="btn btn--ghost" aria-label="Decrease" onclick="changeQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button class="btn btn--ghost" aria-label="Increase" onclick="changeQty(${item.id}, 1)">+</button>
        </div>
      </div>
      <div>₹ ${formatINR(item.price * item.qty)}</div>
    </li>
  `).join('');

  const total = state.cart.reduce((s,x)=>s + x.price * x.qty, 0);
  $('#cartTotal').textContent = formatINR(total);
}

function checkout(){
  if(state.cart.length === 0){
    alert('Your cart is empty.');
    return;
  }
  alert('Demo checkout: Thank you for your purchase!');
  state.cart = [];
  persistCart();
  renderCart();
  closeCart();
}

// ======= Contact Form Validation =======
function initContactForm(){
  const form = $('#contactForm');
  const name = $('#name');
  const email = $('#email');
  const message = $('#message');
  const status = $('#formStatus');

  function setError(input, msg){
    input.closest('.field').querySelector('.error').textContent = msg;
  }
  function clearError(input){
    input.closest('.field').querySelector('.error').textContent = '';
  }
  function isEmail(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;

    if(name.value.trim().length < 2){ setError(name, 'Please enter your full name.'); ok = false; } else clearError(name);
    if(!isEmail(email.value)){ setError(email, 'Please enter a valid email.'); ok = false; } else clearError(email);
    if(message.value.trim().length < 10){ setError(message, 'Please provide at least 10 characters.'); ok = false; } else clearError(message);

    if(ok){
      status.textContent = 'Thanks! Your message has been sent.';
      form.reset();
      setTimeout(()=> status.textContent = '', 3000);
    }
  });
}

// ======= Carousel =======
function initCarousel(){
  const track = document.getElementById('carouselTrack');
  const slides = $$('.carousel__slide', track);
  const prev = document.getElementById('prevSlide');
  const next = document.getElementById('nextSlide');
  const dotsWrap = document.getElementById('carouselDots');

  // dots
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Go to slide ' + (i+1));
    if(i === 0) b.classList.add('is-active');
    b.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(b);
  });

  function goTo(i){
    state.carousel.index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${state.carousel.index * 100}%)`;
    $$('.carousel__slide', track).forEach((el, idx) => el.classList.toggle('is-active', idx === state.carousel.index));
    $$('#carouselDots button').forEach((el, idx) => el.classList.toggle('is-active', idx === state.carousel.index));
  }

  prev.addEventListener('click', () => goTo(state.carousel.index - 1));
  next.addEventListener('click', () => goTo(state.carousel.index + 1));

  // auto-play
  state.carousel.timer = setInterval(() => goTo(state.carousel.index + 1), 5000);

  // pause on hover
  $('.carousel').addEventListener('mouseenter', () => clearInterval(state.carousel.timer));
  $('.carousel').addEventListener('mouseleave', () => state.carousel.timer = setInterval(() => goTo(state.carousel.index + 1), 5000));
}

// ======= Small A11Y & UX =======
window.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeCart();
});
