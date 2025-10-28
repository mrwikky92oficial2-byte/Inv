// data.js - dominio de inventario (productos, ubicaciones, inventario, transferencias, compras)
import { getAll, setAll, seedIfEmpty, getItem, setItem } from './storage.js';

seedIfEmpty();

function getState() { return getAll(); }
function setState(patch) { setAll({ ...getAll(), ...patch }); }

function generateId() { return crypto.randomUUID(); }

// Utilidades
export function formatCurrency(value) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
}

export function findProduct(products, productId) { return products.find(p => p.id === productId) || null; }
export function findLocation(locations, locationId) { return locations.find(l => l.id === locationId) || null; }

// Productos
export function getProducts() { return getState().products; }
export function addProduct(product) {
  const products = [...getState().products];
  products.push({ id: generateId(), ...product });
  setState({ products });
}
export function updateProduct(productId, patch) {
  const products = getState().products.map(p => p.id === productId ? { ...p, ...patch } : p);
  setState({ products });
}
export function deleteProduct(productId) {
  const state = getState();
  const products = state.products.filter(p => p.id !== productId);
  const inventory = state.inventory.filter(i => i.productId !== productId);
  setState({ products, inventory });
}

// Ubicaciones
export function getLocations() { return getState().locations; }
export function addLocation(location) {
  const locations = [...getState().locations];
  locations.push({ id: generateId(), esCentral: false, ...location });
  setState({ locations });
}
export function updateLocation(locationId, patch) {
  const locations = getState().locations.map(l => l.id === locationId ? { ...l, ...patch } : l);
  setState({ locations });
}
export function deleteLocation(locationId) {
  const state = getState();
  const locations = state.locations.filter(l => l.id !== locationId);
  const inventory = state.inventory.filter(i => i.locationId !== locationId);
  const transfers = state.transfers.filter(t => t.fromLocationId !== locationId && t.toLocationId !== locationId);
  const purchaseOrders = state.purchaseOrders.filter(o => o.locationId !== locationId);
  setState({ locations, inventory, transfers, purchaseOrders });
}

// Inventario
export function getInventoryEntries() { return getState().inventory; }
export function getQty(locationId, productId) {
  const entry = getInventoryEntries().find(e => e.locationId === locationId && e.productId === productId);
  return entry ? entry.qty : 0;
}
export function setQty(locationId, productId, newQty) {
  const state = getState();
  const found = state.inventory.find(e => e.locationId === locationId && e.productId === productId);
  if (found) {
    found.qty = Math.max(0, Number(newQty) || 0);
  } else {
    state.inventory.push({ locationId, productId, qty: Math.max(0, Number(newQty) || 0) });
  }
  setState({ inventory: [...state.inventory] });
}
export function adjustQty(locationId, productId, delta) {
  const current = getQty(locationId, productId);
  setQty(locationId, productId, current + Number(delta));
}
export function getInventoryByLocation(locationId) {
  const state = getState();
  if (locationId === 'ALL') {
    // Agregado por producto
    const totals = new Map();
    for (const e of state.inventory) {
      totals.set(e.productId, (totals.get(e.productId) || 0) + e.qty);
    }
    return Array.from(totals.entries()).map(([productId, qty]) => ({ productId, qty }));
  }
  return state.inventory.filter(e => e.locationId === locationId);
}
export function getAggregatedValueCLP() {
  const state = getState();
  let sum = 0;
  for (const e of state.inventory) {
    const p = findProduct(state.products, e.productId);
    if (!p) continue;
    sum += (p.precioCompra || 0) * e.qty;
  }
  return sum * 1000; // ejemplo: precios base en miles (CLP)
}

// Recepción
export function receiveInventory({ locationId, productId, qty, nuevoCosto }) {
  adjustQty(locationId, productId, qty);
  if (nuevoCosto != null && !Number.isNaN(Number(nuevoCosto))) {
    updateProduct(productId, { precioCompra: Number(nuevoCosto) });
  }
}

// Transferencias
export function createTransfer({ fromLocationId, toLocationId, items }) {
  const state = getState();
  const transfer = {
    id: generateId(),
    fromLocationId,
    toLocationId,
    items: items.map(i => ({ productId: i.productId, qty: Number(i.qty) || 0 })),
    status: 'Completada',
    createdAt: new Date().toISOString()
  };
  // Ejecutar inmediatamente
  for (const it of transfer.items) {
    adjustQty(fromLocationId, it.productId, -it.qty);
    adjustQty(toLocationId, it.productId, it.qty);
  }
  const transfers = [...state.transfers, transfer];
  setState({ transfers });
}
export function getTransfers() { return getState().transfers; }

// Órdenes de compra
export function createPurchaseOrder({ locationId, items, notas }) {
  const state = getState();
  const order = {
    id: generateId(),
    locationId,
    items: items.map(i => ({ productId: i.productId, qty: Number(i.qty) || 0, unitCost: Number(i.unitCost) || 0 })),
    notas: notas || '',
    status: 'Pendiente',
    createdAt: new Date().toISOString()
  };
  const purchaseOrders = [...state.purchaseOrders, order];
  setState({ purchaseOrders });
}
export function getPurchaseOrders() { return getState().purchaseOrders; }
export function receivePurchaseOrder(orderId) {
  const state = getState();
  const order = state.purchaseOrders.find(o => o.id === orderId);
  if (!order || order.status === 'Recibida') return;
  for (const it of order.items) {
    adjustQty(order.locationId, it.productId, it.qty);
    if (!Number.isNaN(Number(it.unitCost)) && Number(it.unitCost) > 0) {
      updateProduct(it.productId, { precioCompra: Number(it.unitCost) });
    }
  }
  order.status = 'Recibida';
  setState({ purchaseOrders: [...state.purchaseOrders] });
}

// Bajo stock (por ubicación)
export function getLowStockEntries({ includeNear = true } = {}) {
  const state = getState();
  const results = [];
  for (const loc of state.locations) {
    for (const p of state.products) {
      const qty = getQty(loc.id, p.id);
      const min = Number(p.minQty) || 0;
      if (qty <= min) {
        results.push({ locationId: loc.id, productId: p.id, qty, minQty: min, status: 'Bajo' });
      } else if (includeNear && min > 0 && qty <= Math.ceil(min * 1.2)) {
        results.push({ locationId: loc.id, productId: p.id, qty, minQty: min, status: 'Cerca' });
      }
    }
  }
  return results;
}

export function searchProducts(term) {
  const t = (term || '').toLowerCase();
  if (!t) return getProducts();
  return getProducts().filter(p =>
    (p.nombre || '').toLowerCase().includes(t) ||
    (p.sku || '').toLowerCase().includes(t)
  );
}
