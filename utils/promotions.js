const { randomUUID } = require('crypto');
const DatabaseManager = require('./database');

let db = null;
let promos = {};
let initialized = false;

async function initDatabase() {
  if (!db) {
    db = new DatabaseManager();
    
    // Wait for database connection and load promotions
    const waitForConnection = () => {
      return new Promise((resolve) => {
        const checkConnection = async () => {
          if (db.connected) {
            try {
              promos = await db.getPromotions();
              initialized = true;
              console.log(`✅ Loaded ${Object.keys(promos).length} promotions from database`);
              resolve();
            } catch (error) {
              console.error('Error loading promotions:', error);
              setTimeout(checkConnection, 1000);
            }
          } else {
            setTimeout(checkConnection, 500);
          }
        };
        checkConnection();
      });
    };
    
    await waitForConnection();
  }
}

async function create(name, endISO, casino, color, emoji) {
  await ensureInitialized();
  const id = randomUUID().slice(0, 8);
  const promo = { name, end: endISO, casino, color, emoji, active: true, created: Date.now() };
  
  promos[id] = promo;
  await db.savePromotion(id, promo);
  
  console.log(`✅ Created promotion: ${name} (ID: ${id})`);
  return id;
}

async function close(id) {
  await ensureInitialized();
  if (promos[id]) {
    promos[id].active = false;
    await db.savePromotion(id, promos[id]);
    console.log(`✅ Closed promotion: ${promos[id].name} (ID: ${id})`);
  }
}

async function refreshExpired() {
  await ensureInitialized();
  const now = Date.now();
  let changed = false;
  
  for (const [id, p] of Object.entries(promos)) {
    if (p.active && now > new Date(p.end).getTime()) {
      p.active = false;
      await db.savePromotion(id, p);
      changed = true;
      console.log(`⏰ Expired promotion: ${p.name} (ID: ${id})`);
    }
  }
  
  return changed;
}

async function list() {
  await refreshExpired();
  return Object.entries(promos).sort((a, b) => b[1].created - a[1].created);
}

async function ensureInitialized() {
  if (!initialized) {
    await initDatabase();
  }
}

async function refreshPromotions() {
  if (db && db.connected) {
    try {
      promos = await db.getPromotions();
      await refreshExpired(); // Also check for expired ones
      console.log(`🔄 Refreshed ${Object.keys(promos).length} promotions from database`);
    } catch (error) {
      console.error('Error refreshing promotions:', error);
    }
  }
}

// Initialize on module load
initDatabase();

module.exports = { promos, create, close, list, refreshExpired, refreshPromotions, ensureInitialized };