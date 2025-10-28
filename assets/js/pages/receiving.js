(function(window, document) {
  'use strict';

  let currentItems = [];

  function fillSelects() {
    const locSel = document.getElementById('rcvLocation');
    const prodSel = document.getElementById('rcvProduct');
    const locs = App.listLocations();
    const prods = App.listProducts();
    locSel.innerHTML = '<option value="">Seleccione ubicación...</option>' + locs.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    prodSel.innerHTML = '<option value="">Seleccione producto...</option>' + prods.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  }

  function renderTable() {
    const tbody = document.querySelector('#rcvTable tbody');
    if (!currentItems.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Agregue productos para recibir</td></tr>';
      document.getElementById('rcvSummary').textContent = '0 ítems';
      return;
    }
    const prods = App.listProducts();
    const rows = [];
    let totalItems = 0;
    for (const it of currentItems) {
      totalItems += it.quantity;
      const prod = prods.find(p => p.id === it.productId);
      const name = prod ? prod.name : it.productId;
      rows.push(`
        <tr>
          <td>${name}</td>
          <td class="text-end">${it.quantity}</td>
          <td class="text-end">${App.formatCurrency(it.unitCost)}</td>
          <td class="text-end">${App.formatCurrency(it.quantity * it.unitCost)}</td>
          <td class="text-end"><button class="btn btn-sm btn-outline-danger" data-id="${it.productId}">Quitar</button></td>
        </tr>
      `);
    }
    document.getElementById('rcvSummary').textContent = `${currentItems.length} productos, ${totalItems} unidades`;
    tbody.innerHTML = rows.join('');
    tbody.querySelectorAll('button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => removeItem(btn.getAttribute('data-id')));
    });
  }

  function addItem() {
    const prodId = document.getElementById('rcvProduct').value;
    const qty = Number(document.getElementById('rcvQty').value || 0);
    const cost = Number(document.getElementById('rcvCost').value || 0);
    if (!prodId || qty <= 0) return;
    const idx = currentItems.findIndex(i => i.productId === prodId);
    if (idx >= 0) {
      currentItems[idx].quantity += qty;
      currentItems[idx].unitCost = cost; // last cost wins
    } else {
      currentItems.push({ productId: prodId, quantity: qty, unitCost: cost });
    }
    renderTable();
  }

  function removeItem(productId) {
    currentItems = currentItems.filter(i => i.productId !== productId);
    renderTable();
  }

  function postReceipt() {
    const locId = document.getElementById('rcvLocation').value;
    if (!locId) { alert('Seleccione ubicación'); return; }
    if (!currentItems.length) { alert('Agregue productos'); return; }
    try {
      App.recordReceipt(locId, currentItems);
      currentItems = [];
      renderTable();
      alert('Recepción registrada');
    } catch (err) {
      alert(err.message || 'Error al registrar');
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    App.ensureInitialized();
    fillSelects();
    renderTable();
    document.getElementById('addItemBtn').addEventListener('click', addItem);
    document.getElementById('postReceiptBtn').addEventListener('click', postReceipt);
  });

})(window, document);
