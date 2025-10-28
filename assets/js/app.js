(function(window) {
  'use strict';

  const STORAGE_KEYS = {
    initialized: 'inv_initialized',
    locations: 'inv_locations',
    products: 'inv_products',
    stock: 'inv_stock', // array of { productId, locationId, quantity }
    receipts: 'inv_receipts',
    transfers: 'inv_transfers',
    purchaseOrders: 'inv_purchase_orders'
  };

  function parseNumber(value, fallback = 0) {
    if (value === undefined || value === null || value === '') return fallback;
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  function read(key, fallback) {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function generateId(prefix) {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${Date.now()}-${random}`;
  }

  function ensureInitialized() {
    if (localStorage.getItem(STORAGE_KEYS.initialized) === '1') return;

    const defaultLocations = [
      { id: 'L-WH-1', name: 'Bodega Central', type: 'warehouse' },
      { id: 'L-ST-1', name: 'Tienda 1', type: 'store' }
    ];

    const defaultProducts = [
      { id: 'P-001', name: 'Camiseta Básica', minStock: 10, maxStock: 100, purchasePrice: 5.00, salePrice: 10.00 },
      { id: 'P-002', name: 'Pantalón Jeans', minStock: 5, maxStock: 50, purchasePrice: 12.00, salePrice: 25.00 },
      { id: 'P-003', name: 'Zapatos Deportivos', minStock: 3, maxStock: 30, purchasePrice: 20.00, salePrice: 45.00 }
    ];

    const defaultStock = [];
    for (const p of defaultProducts) {
      for (const l of defaultLocations) {
        const baseQty = l.id === 'L-WH-1' ? 20 : 8;
        defaultStock.push({ productId: p.id, locationId: l.id, quantity: baseQty });
      }
    }

    write(STORAGE_KEYS.locations, defaultLocations);
    write(STORAGE_KEYS.products, defaultProducts);
    write(STORAGE_KEYS.stock, defaultStock);
    write(STORAGE_KEYS.receipts, []);
    write(STORAGE_KEYS.transfers, []);
    write(STORAGE_KEYS.purchaseOrders, []);

    localStorage.setItem(STORAGE_KEYS.initialized, '1');
  }

  // Locations
  function listLocations() { return read(STORAGE_KEYS.locations, []); }
  function saveLocations(list) { write(STORAGE_KEYS.locations, list); }
  function addLocation(name, type) {
    const trimmed = String(name || '').trim();
    const t = (type === 'warehouse' || type === 'store') ? type : 'store';
    if (!trimmed) throw new Error('Nombre de ubicación requerido');
    const locations = listLocations();
    if (locations.some(l => l.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error('Ya existe una ubicación con ese nombre');
    }
    const id = generateId(t === 'warehouse' ? 'L-WH' : 'L-ST');
    const newLoc = { id, name: trimmed, type: t };
    locations.push(newLoc);
    saveLocations(locations);

    // Initialize stock entries at 0 for all products
    const products = listProducts();
    const stock = listStock();
    for (const p of products) {
      stock.push({ productId: p.id, locationId: id, quantity: 0 });
    }
    saveStock(stock);

    return newLoc;
  }

  // Products
  function listProducts() { return read(STORAGE_KEYS.products, []); }
  function saveProducts(list) { write(STORAGE_KEYS.products, list); }
  function addProduct(productInput) {
    const name = String(productInput.name || '').trim();
    if (!name) throw new Error('Nombre de producto requerido');
    const minStock = parseNumber(productInput.minStock, 0);
    const maxStock = parseNumber(productInput.maxStock, minStock);
    const purchasePrice = parseNumber(productInput.purchasePrice, 0);
    const salePrice = parseNumber(productInput.salePrice, 0);

    const products = listProducts();
    if (products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Ya existe un producto con ese nombre');
    }

    const id = generateId('P');
    const product = { id, name, minStock, maxStock, purchasePrice, salePrice };
    products.push(product);
    saveProducts(products);

    // Initialize stock entries at 0 for all locations
    const locations = listLocations();
    const stock = listStock();
    for (const l of locations) {
      stock.push({ productId: id, locationId: l.id, quantity: 0 });
    }
    saveStock(stock);

    return product;
  }

  // Stock helpers
  function listStock() { return read(STORAGE_KEYS.stock, []); }
  function saveStock(list) { write(STORAGE_KEYS.stock, list); }

  function getStock(productId, locationId) {
    const s = listStock().find(r => r.productId === productId && r.locationId === locationId);
    return s ? parseNumber(s.quantity, 0) : 0;
  }

  function setStock(productId, locationId, quantity) {
    const stock = listStock();
    const idx = stock.findIndex(r => r.productId === productId && r.locationId === locationId);
    if (idx >= 0) {
      stock[idx].quantity = parseNumber(quantity, 0);
    } else {
      stock.push({ productId, locationId, quantity: parseNumber(quantity, 0) });
    }
    saveStock(stock);
  }

  function adjustStock(productId, locationId, delta) {
    const current = getStock(productId, locationId);
    setStock(productId, locationId, current + parseNumber(delta, 0));
  }

  function sumStockByProduct(productId) {
    return listStock()
      .filter(r => r.productId === productId)
      .reduce((acc, r) => acc + parseNumber(r.quantity, 0), 0);
  }

  // Receipts
  function listReceipts() { return read(STORAGE_KEYS.receipts, []); }
  function saveReceipts(list) { write(STORAGE_KEYS.receipts, list); }
  function recordReceipt(locationId, items) {
    const locations = listLocations();
    if (!locations.some(l => l.id === locationId)) throw new Error('Ubicación no válida');
    const products = listProducts();
    const normalizedItems = (items || []).map(it => ({
      productId: it.productId,
      quantity: parseNumber(it.quantity, 0),
      unitCost: parseNumber(it.unitCost, 0)
    })).filter(it => it.productId && it.quantity > 0);
    if (normalizedItems.length === 0) throw new Error('No hay ítems válidos');

    for (const it of normalizedItems) {
      if (!products.some(p => p.id === it.productId)) {
        throw new Error('Producto no válido en la recepción');
      }
      adjustStock(it.productId, locationId, it.quantity);
    }

    const receipt = {
      id: generateId('RCPT'),
      date: new Date().toISOString(),
      locationId,
      items: normalizedItems
    };
    const receipts = listReceipts();
    receipts.push(receipt);
    saveReceipts(receipts);
    return receipt;
  }

  // Transfers
  function listTransfers() { return read(STORAGE_KEYS.transfers, []); }
  function saveTransfers(list) { write(STORAGE_KEYS.transfers, list); }
  function createTransfer(fromLocationId, toLocationId, items) {
    if (fromLocationId === toLocationId) throw new Error('Las ubicaciones deben ser diferentes');
    const locations = listLocations();
    if (!locations.some(l => l.id === fromLocationId) || !locations.some(l => l.id === toLocationId)) {
      throw new Error('Ubicación no válida');
    }
    const products = listProducts();
    const normalizedItems = (items || []).map(it => ({
      productId: it.productId,
      quantity: parseNumber(it.quantity, 0)
    })).filter(it => it.productId && it.quantity > 0);
    if (normalizedItems.length === 0) throw new Error('No hay ítems válidos');

    // Validate stock availability
    for (const it of normalizedItems) {
      const available = getStock(it.productId, fromLocationId);
      if (available < it.quantity) {
        const prod = products.find(p => p.id === it.productId);
        throw new Error(`Stock insuficiente de ${prod ? prod.name : it.productId} en origen`);
      }
    }

    // Apply movement
    for (const it of normalizedItems) {
      adjustStock(it.productId, fromLocationId, -it.quantity);
      adjustStock(it.productId, toLocationId, it.quantity);
    }

    const transfer = {
      id: generateId('TRF'),
      date: new Date().toISOString(),
      fromLocationId,
      toLocationId,
      items: normalizedItems
    };
    const transfers = listTransfers();
    transfers.push(transfer);
    saveTransfers(transfers);
    return transfer;
  }

  // Purchase Orders
  function listPurchaseOrders() { return read(STORAGE_KEYS.purchaseOrders, []); }
  function savePurchaseOrders(list) { write(STORAGE_KEYS.purchaseOrders, list); }
  function createPurchaseOrder(locationId, items) {
    const locations = listLocations();
    if (!locations.some(l => l.id === locationId)) throw new Error('Ubicación no válida');
    const normalizedItems = (items || []).map(it => ({
      productId: it.productId,
      quantity: parseNumber(it.quantity, 0),
      unitCost: parseNumber(it.unitCost, 0)
    })).filter(it => it.productId && it.quantity > 0);
    if (normalizedItems.length === 0) throw new Error('No hay ítems válidos');

    const po = {
      id: generateId('PO'),
      date: new Date().toISOString(),
      locationId,
      status: 'open',
      items: normalizedItems
    };
    const orders = listPurchaseOrders();
    orders.push(po);
    savePurchaseOrders(orders);
    return po;
  }

  function receivePurchaseOrder(poId) {
    const orders = listPurchaseOrders();
    const po = orders.find(o => o.id === poId);
    if (!po) throw new Error('Orden no encontrada');
    if (po.status === 'received') return po;
    for (const it of po.items) {
      adjustStock(it.productId, po.locationId, parseNumber(it.quantity, 0));
    }
    po.status = 'received';
    savePurchaseOrders(orders);
    return po;
  }

  function computeLowStockProducts() {
    const products = listProducts();
    const result = [];
    for (const p of products) {
      const total = sumStockByProduct(p.id);
      if (total <= parseNumber(p.minStock, 0)) {
        result.push({ productId: p.id, name: p.name, totalQty: total, minStock: parseNumber(p.minStock, 0), maxStock: parseNumber(p.maxStock, 0) });
      }
    }
    return result;
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parseNumber(amount, 0));
  }

  function toHumanDate(iso) {
    try { return new Date(iso).toLocaleString(); } catch (e) { return iso; }
  }

  window.App = {
    ensureInitialized,
    // locations
    listLocations, addLocation,
    // products
    listProducts, addProduct,
    // stock
    listStock, getStock, setStock, adjustStock, sumStockByProduct,
    // receipts
    listReceipts, recordReceipt,
    // transfers
    listTransfers, createTransfer,
    // purchase orders
    listPurchaseOrders, createPurchaseOrder, receivePurchaseOrder,
    // utils
    computeLowStockProducts, formatCurrency, toHumanDate
  };

})(window);
