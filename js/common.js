// common.js - navbar, helpers y elementos compartidos
import { formatCurrency } from './data.js';

function navLink(href, label, current) {
  const active = location.pathname.endsWith(href) || (href === 'index.html' && (location.pathname.endsWith('/') || location.pathname.endsWith('/index.html')));
  return `<a href="${href}" class="${active ? 'active' : ''}">${label}</a>`;
}

export function renderNavbar() {
  const el = document.getElementById('app-header');
  if (!el) return;
  el.innerHTML = `
    <div class="navbar">
      <div class="navbar-inner">
        <div class="brand">
          <div class="brand-logo">IN</div>
          <div class="brand-name">Inventario</div>
        </div>
        <nav class="nav-links">
          ${navLink('index.html', 'Inicio', location.pathname)}
          ${navLink('inventario.html', 'Inventario', location.pathname)}
          ${navLink('recepcion.html', 'Recepción', location.pathname)}
          ${navLink('transferencias.html', 'Transferencias', location.pathname)}
          ${navLink('compras.html', 'Compras', location.pathname)}
          ${navLink('productos.html', 'Productos', location.pathname)}
          ${navLink('ubicaciones.html', 'Ubicaciones', location.pathname)}
        </nav>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
});
