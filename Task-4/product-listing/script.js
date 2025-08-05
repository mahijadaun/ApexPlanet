const products = [
  { name: "Smartphone", category: "electronics", price: 799, rating: 4.5 },
  { name: "T-shirt", category: "clothing", price: 299, rating: 4.2 },
  { name: "Laptop", category: "electronics", price: 1200, rating: 4.8 },
  { name: "Jeans", category: "clothing", price: 599, rating: 4.1 },
  { name: "Novel", category: "books", price: 199, rating: 4.7 },
  { name: "Tablet", category: "electronics", price: 499, rating: 4.0 },
  { name: "Jacket", category: "clothing", price: 899, rating: 4.6 },
  { name: "Biography", category: "books", price: 399, rating: 3.9 }
];

const categoryRadios = document.getElementsByName("category");
const priceSlider = document.getElementById("price-range");
const priceDisplay = document.getElementById("price-display");
const sortDropdown = document.getElementById("sort-rating");
const productContainer = document.getElementById("product-container");

function renderProducts(list) {
  productContainer.innerHTML = "";

  if (list.length === 0) {
    productContainer.innerHTML = "<p>No matching products found.</p>";
    return;
  }

  list.forEach(product => {
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
      <h3>${product.name}</h3>
      <p>Category: ${product.category}</p>
      <p>Rating: ⭐ ${product.rating}</p>
      <p class="price">₹${product.price}</p>
    `;
    productContainer.appendChild(div);
  });
}

function getSelectedCategory() {
  for (let radio of categoryRadios) {
    if (radio.checked) return radio.value;
  }
  return "all";
}

function applyFilters() {
  const category = getSelectedCategory();
  const maxPrice = parseInt(priceSlider.value);
  const sort = sortDropdown.value;

  let filtered = [...products];

  if (category !== "all") {
    filtered = filtered.filter(p => p.category === category);
  }

  filtered = filtered.filter(p => p.price <= maxPrice);

  if (sort === "high") {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sort === "low") {
    filtered.sort((a, b) => a.rating - b.rating);
  }

  renderProducts(filtered);
}

categoryRadios.forEach(radio => {
  radio.addEventListener("change", applyFilters);
});

priceSlider.addEventListener("input", () => {
  priceDisplay.textContent = priceSlider.value;
  applyFilters();
});

sortDropdown.addEventListener("change", applyFilters);

// Initial render
renderProducts(products);
