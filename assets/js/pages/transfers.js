(function(window, document) {
  'use strict';

  let currentItems = [];

  function fillSelects() {
    const locs = App.listLocations();
    const prods = App.listProducts();
    const from = document.getElementById('trFrom');
    const to = document.getElementById('trTo');
    const prodSel = document.getElementById('trProduct');
    const opts = '<option value="">Seleccione...</option>' + locs.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    from.innerHTML = opts;
    to.innerHTML = opts;
    prodSel.innerHTML = '<option value="">Seleccione producto...</option>' + prods.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  }

  function renderTable() {
    const tbody = document.querySelector('#trTable tbody');
    if (!currentItems.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">Agregue productos para trasladar</td></tr>';
      document.getElementById('trSummary').textContent = '0 ítems';
      return;
    }
    const prods = App.listProducts();
    const rows = [];
    let total = 0;
    for (const it of currentItems) {
      total += it.quantity;
      const prod = prods.find(p => p.id === it.productId);
      rows.push(`
        <tr>
          <td>${prod ? prod.name : it.productId}</td>
          <td class="text-end">${it.quantity}</td>
          <td class="text-end"><button class="btn btn-sm btn-outline-danger" data-id="${it.productId}">Quitar</button></td>
        </tr>
      `);
    }
    document.getElementById('trSummary').textContent = `${currentItems.length} productos, ${total} unidades`;
    tbody.innerHTML = rows.join('');
    tbody.querySelectorAll('button[data-id]').forEach(btn => btn.addEventListener('click', () => removeItem(btn.getAttribute('data-id'))));
  }

  function addItem() {
    const prodId = document.getElementById('trProduct').value;
    const qty = Number(document.getElementById('trQty').value || 0);
    if (!prodId || qty <= 0) return;
    const idx = currentItems.findIndex(i => i.productId === prodId);
    if (idx >= 0) {
      currentItems[idx].quantity += qty;
    } else {
      currentItems.push({ productId: prodId, quantity: qty });
    }
    renderTable();
  }

  function removeItem(productId) {
    currentItems = currentItems.filter(i => i.productId !== productId);
    renderTable();
  }

  function postTransfer() {
    const from = document.getElementById('trFrom').value;
    const to = document.getElementById('trTo').value;
    if (!from || !to) { alert('Seleccione ambas ubicaciones'); return; }
    if (!currentItems.length) { alert('Agregue productos'); return; }
    try {
      App.createTransfer(from, to, currentItems);
      currentItems = [];
      renderTable();
      refreshHistory();
      alert('Traslado registrado');
    } catch (err) {
      alert(err.message || 'Error al registrar');
    }
  }

  function refreshHistory() {
    const tbody = document.querySelector('#trHistory tbody');
    const moves = App.listTransfers();
    if (!moves.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Sin movimientos</td></tr>';
      return;
    }
    const locs = App.listLocations();
    const prods = App.listProducts();
    const rows = [];
    for (const m of moves.slice().reverse()) {
      const from = locs.find(l => l.id === m.fromLocationId);
      const to = locs.find(l => l.id === m.toLocationId);
      const detail = m.items.map(it => {
        const p = prods.find(pp => pp.id === it.productId);
        return `${p ? p.name : it.productId} x ${it.quantity}`;
      }).join(', ');
      rows.push(`
        <tr>
          <td>${App.toHumanDate(m.date)}</td>
          <td>${from ? from.name : m.fromLocationId}</td>
          <td>${to ? to.name : m.toLocationId}</td>
          <td>${detail}</td>
        </tr>
      `);
    }
    tbody.innerHTML = rows.join('');
  }

  document.addEventListener('DOMContentLoaded', function() {
    App.ensureInitialized();
    fillSelects();
    renderTable();
    refreshHistory();
    document.getElementById('trAddBtn').addEventListener('click', addItem);
    document.getElementById('trPostBtn').addEventListener('click', postTransfer);
  });

})(window, document);
