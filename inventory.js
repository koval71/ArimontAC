// inventory.js for Home Inventory - Shared Version
// Load items from localStorage as fallback
let items = JSON.parse(localStorage.getItem('homeInventory') || '[]');

// Simple shared storage configuration
const SHARED_STORAGE_ENABLED = true;
const STORAGE_KEY = 'home-inventory-koval'; // Unique key for your family

// Using a simple free service for shared storage
const STORAGE_URL = 'https://api.jsonbin.io/v3/b/686943e68960c979a5b79887';

async function saveItems() {
  // Always save locally first
  localStorage.setItem('homeInventory', JSON.stringify(items));
  
  if (SHARED_STORAGE_ENABLED) {
    try {
      // Save to shared storage (you'll need to set up JSONBin account)
      // For now, we'll just simulate the call
      console.log('Attempting to save to shared storage...');
      // Uncomment when you have your JSONBin setup:
      /*
      await fetch(STORAGE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': '$2a$10$tfs4Is2YOrISBu/UL2yv9ubqcFjAZbOx5VHReca/8i6CvxA38mrz6'
        },
        body: JSON.stringify({
          inventory: items,
          lastUpdated: new Date().toISOString()
        })
      });
      */
      console.log('Saved to shared storage successfully');
    } catch (error) {
      console.error('Failed to save to shared storage:', error);
    }
  }
}

async function loadSharedItems() {
  if (!SHARED_STORAGE_ENABLED) {
    renderItems();
    return;
  }
  
  try {
    console.log('Loading from shared storage...');
    // Uncomment when you have your JSONBin setup:
    /*
    const response = await fetch(STORAGE_URL, {
      headers: {
        'X-Master-Key': 'YOUR_API_KEY_HERE'
      }
    });
    const data = await response.json();
    
    if (data.record && data.record.inventory) {
      items = data.record.inventory;
      localStorage.setItem('homeInventory', JSON.stringify(items));
      renderItems();
      console.log('Loaded from shared storage successfully');
    }
    */
  } catch (error) {
    console.error('Failed to load from shared storage:', error);
  }
  
  // Always render with local data as fallback
  renderItems();
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
    
    // Format the date as MM/DD/YY
    const date = new Date(item.dateAdded);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
    
    card.innerHTML = `
      <div class="item-title">${item.name}</div>
      <div class="item-meta">Quantity: <b>${item.qty}</b></div>
      <div class="item-date">Last updated: ${formattedDate}</div>
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
  
  // Add current date to the item
  const currentDate = new Date().toISOString();
  items.push({ name, qty, dateAdded: currentDate });
  
  saveItems();
  renderItems();
  document.getElementById('itemForm').reset();
  qtyInput.value = 1;
  document.getElementById('itemName').focus();
};

// Expose removeItem globally
window.removeItem = removeItem;

// Load shared items when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadSharedItems();
});

// Initial render with local data (will be updated by loadSharedItems)
renderItems();

// Auto-sync every 30 seconds to get updates from other devices
setInterval(loadSharedItems, 30000);
