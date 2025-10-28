(function(window, document) {
  'use strict';

  let currentItems = [];

  function fillSelects() {
    const locSel = document.getElementById('poLocation');
    const prodSel = document.getElementById('poProduct');
    const locs = App.listLocations();
    const prods = App.listProducts();
    locSel.innerHTML = '<option value="">Seleccione ubicación...</option>' + locs.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    prodSel.innerHTML = '<option value="">Seleccione producto...</option>' + prods.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  }

  function renderTable() {
    const tbody = document.querySelector('#poTable tbody');
    if (!currentItems.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Agregue productos al pedido</td></tr>';
      document.getElementById('poSummary').textContent = '0 ítems';
      return;
    }
    const prods = App.listProducts();
    const rows = [];
    let total = 0;
    for (const it of currentItems) {
      total += it.quantity * it.unitCost;
      const p = prods.find(pp => pp.id === it.productId);
      rows.push(`
        <tr>
          <td>${p ? p.name : it.productId}</td>
          <td class="text-end">${it.quantity}</td>
          <td class="text-end">${App.formatCurrency(it.unitCost)}</td>
          <td class="text-end">${App.formatCurrency(it.quantity * it.unitCost)}</td>
          <td class="text-end"><button class="btn btn-sm btn-outline-danger" data-id="${it.productId}">Quitar</button></td>
        </tr>
      `);
    }
    document.getElementById('poSummary').textContent = `${currentItems.length} productos, total ${App.formatCurrency(total)}`;
    tbody.innerHTML = rows.join('');
    tbody.querySelectorAll('button[data-id]').forEach(btn => btn.addEventListener('click', () => removeItem(btn.getAttribute('data-id'))));
  }

  function addItem() {
    const prodId = document.getElementById('poProduct').value;
    const qty = Number(document.getElementById('poQty').value || 0);
    const cost = Number(document.getElementById('poCost').value || 0);
    if (!prodId || qty <= 0) return;
    const idx = currentItems.findIndex(i => i.productId === prodId);
    if (idx >= 0) {
      currentItems[idx].quantity += qty;
      currentItems[idx].unitCost = cost;
    } else {
      currentItems.push({ productId: prodId, quantity: qty, unitCost: cost });
    }
    renderTable();
  }

  function removeItem(productId) {
    currentItems = currentItems.filter(i => i.productId !== productId);
    renderTable();
  }

  function createOrder() {
    const locId = document.getElementById('poLocation').value;
    if (!locId) { alert('Seleccione ubicación'); return; }
    if (!currentItems.length) { alert('Agregue productos'); return; }
    try {
      App.createPurchaseOrder(locId, currentItems);
      currentItems = [];
      renderTable();
      refreshOrders();
      alert('Orden creada');
    } catch (err) {
      alert(err.message || 'Error al crear');
    }
  }

  function refreshOrders() {
    const tbody = document.querySelector('#poList tbody');
    const orders = App.listPurchaseOrders();
    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sin órdenes</td></tr>';
      return;
    }
    const locs = App.listLocations();
    const prods = App.listProducts();
    const rows = [];
    for (const o of orders.slice().reverse()) {
      const loc = locs.find(l => l.id === o.locationId);
      const detail = o.items.map(it => {
        const p = prods.find(pp => pp.id === it.productId);
        return `${p ? p.name : it.productId} x ${it.quantity}`;
      }).join(', ');
      rows.push(`
        <tr>
          <td>${App.toHumanDate(o.date)}</td>
          <td>${loc ? loc.name : o.locationId}</td>
          <td><span class="badge ${o.status === 'open' ? 'bg-warning' : 'bg-success'}">${o.status}</span></td>
          <td>${detail}</td>
          <td class="text-end">
            ${o.status === 'open' ? `<button class="btn btn-sm btn-success" data-id="${o.id}">Recibir</button>` : ''}
          </td>
        </tr>
      `);
    }
    tbody.innerHTML = rows.join('');
    tbody.querySelectorAll('button[data-id]').forEach(btn => btn.addEventListener('click', () => receive(btn.getAttribute('data-id'))));
  }

  function receive(poId) {
    try {
      App.receivePurchaseOrder(poId);
      refreshOrders();
      alert('Orden recibida');
    } catch (err) {
      alert(err.message || 'Error al recibir');
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    App.ensureInitialized();
    fillSelects();
    renderTable();
    refreshOrders();
    document.getElementById('poAddBtn').addEventListener('click', addItem);
    document.getElementById('poCreateBtn').addEventListener('click', createOrder);
  });

})(window, document);
