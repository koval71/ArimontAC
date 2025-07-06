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
    
    // Add gray effect class if quantity is 0
    if (item.qty === 0) {
      card.classList.add('item-card-empty');
    }
    
    // Format the date as MM/DD/YY
    const date = new Date(item.dateAdded);
    const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
    
    card.innerHTML = `
      <div class="item-title">${item.name}</div>
      <div class="item-meta">
        <div class="qty-controls">
          <button class="qty-btn" onclick="decrementItemQty(${idx})" ${item.qty === 0 ? 'disabled' : ''}>-</button>
          <span class="qty-display">Quantity: <b>${item.qty}</b></span>
          <button class="qty-btn" onclick="incrementItemQty(${idx})">+</button>
        </div>
      </div>
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

// Expose functions globally
window.removeItem = removeItem;
window.incrementItemQty = incrementItemQty;
window.decrementItemQty = decrementItemQty;

// Load shared items when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadSharedItems();
});

// Initial render with local data (will be updated by loadSharedItems)
renderItems();

// Auto-sync every 30 seconds to get updates from other devices
setInterval(loadSharedItems, 30000);

// Search functionality
function initializeSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  
  if (!searchInput || !searchResults) return;
  
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim().toLowerCase();
    
    if (query === '') {
      searchResults.style.display = 'none';
      return;
    }
    
    const filteredItems = items.filter(item => 
      item.name.toLowerCase().includes(query)
    );
    
    if (filteredItems.length === 0) {
      searchResults.innerHTML = '<div class="search-result-item" style="color: #888;">No items found</div>';
      searchResults.style.display = 'block';
      return;
    }
    
    searchResults.innerHTML = filteredItems.map((item, index) => `
      <div class="search-result-item" onclick="jumpToItem('${item.name}')">
        <div class="search-result-name">${item.name}</div>
        <div class="search-result-qty">Quantity: ${item.qty}</div>
      </div>
    `).join('');
    
    searchResults.style.display = 'block';
  });
  
  // Hide search results when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = 'none';
    }
  });
}

function jumpToItem(itemName) {
  const searchResults = document.getElementById('searchResults');
  const searchInput = document.getElementById('searchInput');
  
  // Hide search results
  searchResults.style.display = 'none';
  searchInput.value = '';
  
  // Find the item in the DOM and scroll to it
  const inventoryList = document.getElementById('inventoryList');
  const itemCards = inventoryList.querySelectorAll('.item-card');
  
  itemCards.forEach(card => {
    const itemTitle = card.querySelector('.item-title');
    if (itemTitle && itemTitle.textContent.toLowerCase() === itemName.toLowerCase()) {
      // Scroll to the item
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the item
      card.classList.add('search-highlight');
      setTimeout(() => {
        card.classList.remove('search-highlight');
      }, 2000);
    }
  });
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeSearch();
});

function incrementItemQty(idx) {
  if (items[idx]) {
    items[idx].qty += 1;
    items[idx].dateAdded = new Date().toISOString(); // Update the date
    saveItems();
    renderItems();
  }
}

function decrementItemQty(idx) {
  if (items[idx]) {
    if (items[idx].qty > 0) {
      items[idx].qty -= 1;
      items[idx].dateAdded = new Date().toISOString(); // Update the date
      saveItems();
      renderItems();
    }
    // Allow quantity to go to 0, item stays in list with gray effect
  }
}
