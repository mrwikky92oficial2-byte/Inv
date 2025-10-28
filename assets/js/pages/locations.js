(function(window, document) {
  'use strict';

  function refreshTable() {
    const tbody = document.querySelector('#locationsTable tbody');
    const rows = [];
    const list = App.listLocations();
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="2" class="text-center text-muted">Sin ubicaciones</td></tr>';
      return;
    }
    for (const l of list) {
      rows.push(`
        <tr>
          <td>${l.name}</td>
          <td>${l.type === 'warehouse' ? 'Bodega' : 'Tienda'}</td>
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
      App.addLocation(data.name, data.type);
      form.reset();
      refreshTable();
    } catch (err) {
      alert(err.message || 'Error al agregar');
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    App.ensureInitialized();
    refreshTable();
    document.getElementById('locationForm').addEventListener('submit', onSubmit);
  });

})(window, document);
