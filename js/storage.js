// storage.js - capa simple sobre localStorage + inicialización de demo

const STORAGE_KEYS = {
  products: 'inv_products',
  locations: 'inv_locations',
  inventory: 'inv_inventory',
  transfers: 'inv_transfers',
  purchaseOrders: 'inv_purchase_orders',
  meta: 'inv_meta'
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error leyendo localStorage', key, err);
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Error guardando localStorage', key, err);
  }
}

export function getAll() {
  return {
    products: load(STORAGE_KEYS.products, []),
    locations: load(STORAGE_KEYS.locations, []),
    inventory: load(STORAGE_KEYS.inventory, []),
    transfers: load(STORAGE_KEYS.transfers, []),
    purchaseOrders: load(STORAGE_KEYS.purchaseOrders, []),
    meta: load(STORAGE_KEYS.meta, { seeded: false })
  };
}

export function setAll(state) {
  save(STORAGE_KEYS.products, state.products ?? []);
  save(STORAGE_KEYS.locations, state.locations ?? []);
  save(STORAGE_KEYS.inventory, state.inventory ?? []);
  save(STORAGE_KEYS.transfers, state.transfers ?? []);
  save(STORAGE_KEYS.purchaseOrders, state.purchaseOrders ?? []);
  save(STORAGE_KEYS.meta, state.meta ?? { seeded: true });
}

export function setItem(key, value) { save(key, value); }
export function getItem(key, fallback) { return load(key, fallback); }

export function seedIfEmpty() {
  const current = getAll();
  if (current.meta?.seeded) return; // ya hay datos

  const centralId = crypto.randomUUID();
  const tienda1Id = crypto.randomUUID();
  const tienda2Id = crypto.randomUUID();

  const prod1Id = crypto.randomUUID();
  const prod2Id = crypto.randomUUID();
  const prod3Id = crypto.randomUUID();

  const products = [
    { id: prod1Id, sku: 'SKU-1001', nombre: 'Arroz 1Kg', minQty: 20, maxQty: 200, precioCompra: 0.8, precioVenta: 1.25 },
    { id: prod2Id, sku: 'SKU-1002', nombre: 'Aceite 1L', minQty: 15, maxQty: 150, precioCompra: 2.1, precioVenta: 3.2 },
    { id: prod3Id, sku: 'SKU-1003', nombre: 'Azúcar 1Kg', minQty: 10, maxQty: 120, precioCompra: 0.7, precioVenta: 1.15 }
  ];

  const locations = [
    { id: centralId, nombre: 'Bodega Central', tipo: 'Bodega', esCentral: true },
    { id: tienda1Id, nombre: 'Tienda Norte', tipo: 'Tienda', esCentral: false },
    { id: tienda2Id, nombre: 'Tienda Centro', tipo: 'Tienda', esCentral: false }
  ];

  const inventory = [
    { locationId: centralId, productId: prod1Id, qty: 120 },
    { locationId: centralId, productId: prod2Id, qty: 80 },
    { locationId: centralId, productId: prod3Id, qty: 60 },
    { locationId: tienda1Id, productId: prod1Id, qty: 18 },
    { locationId: tienda1Id, productId: prod2Id, qty: 10 },
    { locationId: tienda2Id, productId: prod3Id, qty: 8 }
  ];

  const transfers = [];
  const purchaseOrders = [];

  setAll({ products, locations, inventory, transfers, purchaseOrders, meta: { seeded: true } });
}
