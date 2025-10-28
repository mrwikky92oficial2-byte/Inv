(function(window, document) {
  'use strict';

  function renderLowStock() {
    const tbody = document.querySelector('#lowStockTable tbody');
    if (!tbody) return;

    const rows = [];
    const items = App.computeLowStockProducts();

    if (!items.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay productos en mínimo</td></tr>';
      return;
    }

    for (const it of items) {
      rows.push(`
        <tr>
          <td>${it.name}</td>
          <td class="text-center">${it.totalQty}</td>
          <td class="text-center">${it.minStock}</td>
          <td class="text-center">${it.maxStock}</td>
        </tr>
      `);
    }

    tbody.innerHTML = rows.join('');
  }

  document.addEventListener('DOMContentLoaded', function() {
    App.ensureInitialized();
    renderLowStock();
  });

})(window, document);
