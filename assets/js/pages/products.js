(function(window, document) {
  'use strict';

  function refreshTable() {
    const tbody = document.querySelector('#productsTable tbody');
    const rows = [];
    const list = App.listProducts();
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Sin productos</td></tr>';
      return;
    }
    for (const p of list) {
      rows.push(`
        <tr>
          <td>${p.name}</td>
          <td class="text-end">${p.minStock}</td>
          <td class="text-end">${p.maxStock}</td>
          <td class="text-end">${App.formatCurrency(p.purchasePrice)}</td>
          <td class="text-end">${App.formatCurrency(p.salePrice)}</td>
        </tr>
      `);
    }
    tbody.innerHTML = rows.join('');
  }

  function onSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    try {
      App.addProduct({
        name: data.name,
        minStock: Number(data.minStock || 0),
        maxStock: Number(data.maxStock || 0),
        purchasePrice: Number(data.purchasePrice || 0),
        salePrice: Number(data.salePrice || 0)
      });
      form.reset();
      refreshTable();
    } catch (err) {
      alert(err.message || 'Error al agregar');
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    App.ensureInitialized();
    refreshTable();
    const form = document.getElementById('productForm');
    form.addEventListener('submit', onSubmit);
  });

})(window, document);
