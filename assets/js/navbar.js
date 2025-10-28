(function(window, document) {
  'use strict';

  function renderNavbar(active) {
    const links = [
      { href: 'index.html', key: 'dashboard', label: 'Inicio' },
      { href: 'products.html', key: 'products', label: 'Productos' },
      { href: 'locations.html', key: 'locations', label: 'Ubicaciones' },
      { href: 'inventory.html', key: 'inventory', label: 'Inventario' },
      { href: 'receiving.html', key: 'receiving', label: 'Recepción' },
      { href: 'transfers.html', key: 'transfers', label: 'Traslados' },
      { href: 'purchases.html', key: 'purchases', label: 'Compras' }
    ];

    const nav = document.getElementById('navbar-container');
    if (!nav) return;

    const itemsHtml = links.map(l => `
      <li class="nav-item">
        <a class="nav-link ${active === l.key ? 'active' : ''}" href="${l.href}">${l.label}</a>
      </li>
    `).join('');

    nav.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-purple navbar-dark">
        <div class="container">
          <a class="navbar-brand fw-bold" href="index.html">Inventario</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="mainNavbar">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              ${itemsHtml}
            </ul>
          </div>
        </div>
      </nav>`;
  }

  document.addEventListener('DOMContentLoaded', function() {
    const active = window.ACTIVE_PAGE || '';
    renderNavbar(active);
  });

})(window, document);
