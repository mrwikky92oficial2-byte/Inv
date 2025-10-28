(function(window, document) {
  'use strict';

  function fillLocations() {
    const select = document.getElementById('locationSelect');
    const locs = App.listLocations();
    select.innerHTML = '<option value="">Seleccione...</option>' + locs.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
  }

  function renderInventory(locationId) {
    const tbody = document.querySelector('#inventoryTable tbody');
    if (!locationId) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Seleccione una ubicación</td></tr>';
      return;
    }

    const products = App.listProducts();
    const rows = [];
    let totalUnits = 0;
    let totalSkus = 0;

    for (const p of products) {
      const qty = App.getStock(p.id, locationId);
      totalUnits += qty;
      if (qty > 0) totalSkus += 1;
      rows.push(`
        <tr>
          <td>${p.name}</td>
          <td class="text-end">${qty}</td>
          <td class="text-end">${p.minStock}</td>
          <td class="text-end">${p.maxStock}</td>
        </tr>
      `);
    }

    document.getElementById('totalSkus').textContent = `${totalSkus} SKUs`;
    document.getElementById('totalUnits').textContent = `${totalUnits} unidades`;
    tbody.innerHTML = rows.join('');
  }

  document.addEventListener('DOMContentLoaded', function() {
    App.ensureInitialized();
    fillLocations();
    const select = document.getElementById('locationSelect');
    select.addEventListener('change', () => renderInventory(select.value));
  });

})(window, document);
