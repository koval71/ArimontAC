// inventory.js for Home Inventory
// Load items from localStorage or start with empty array
let items = JSON.parse(localStorage.getItem('homeInventory') || '[]');

function saveItems() {
  localStorage.setItem('homeInventory', JSON.stringify(items));
}

function renderItems() {
  const list = document.getElementById('inventoryList');
  list.innerHTML = '';
  if (items.length === 0) {
    list.innerHTML = '<div style="color:#b76e79;text-align:center;">No items yet.</div>';
    return;
  }
  items.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-title">${item.name}</div>
      <div class="item-meta">Quantity: <b>${item.qty}</b></div>
      <button class="remove-btn" onclick="removeItem(${idx})">Remove</button>
    `;
    list.appendChild(card);
  });
}

function removeItem(idx) {
  items.splice(idx, 1);
  saveItems();
  renderItems();
}

// Quantity increment/decrement logic
document.addEventListener('DOMContentLoaded', function() {
  const qtyInput = document.getElementById('itemQty');
  document.getElementById('incrementQty').onclick = function() {
    qtyInput.value = parseInt(qtyInput.value) + 1;
  };
  document.getElementById('decrementQty').onclick = function() {
    if (parseInt(qtyInput.value) > 1) qtyInput.value = parseInt(qtyInput.value) - 1;
  };
});


const qtyInput = document.getElementById('itemQty');
// Allow direct editing again
qtyInput.readOnly = false;

document.getElementById('itemForm').onsubmit = function(e) {
  e.preventDefault();
  const name = document.getElementById('itemName').value.trim();
  const qty = parseInt(qtyInput.value) || 1;
  if (!name) return;
  items.push({ name, qty });
  saveItems();
  renderItems();
  document.getElementById('itemForm').reset();
  qtyInput.value = 1;
  document.getElementById('itemName').focus();
};

// Expose removeItem globally
window.removeItem = removeItem;

// Initial render
renderItems();
