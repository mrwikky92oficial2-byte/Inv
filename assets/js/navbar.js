(function(){
  const links = [
    { file: 'index.html', key: 'home', text: 'Inicio', icon: 'bi-house-fill' },
    { file: 'productos.html', key: 'productos', text: 'Productos', icon: 'bi-box-seam' },
    { file: 'categorias.html', key: 'categorias', text: 'Categorías', icon: 'bi-tags-fill' },
    { file: 'almacenes.html', key: 'almacenes', text: 'Almacenes', icon: 'bi-building' },
    { file: 'inventario.html', key: 'inventario', text: 'Inventario', icon: 'bi-graph-up' },
    { file: 'entregas.html', key: 'entregas', text: 'Despachos', icon: 'bi-truck' },
    { file: 'restablecimientos.html', key: 'restablecimientos', text: 'Recibir', icon: 'bi-arrow-repeat' },
    { file: 'gestiones.html', key: 'gestiones', text: 'Gestiones', icon: 'bi-check2-circle' }
  ];

  function isInPagesDir(){
    return /\/pages\//.test(location.pathname);
  }
  function resolveHref(file){
    if (file === 'index.html') return isInPagesDir() ? '../index.html' : 'index.html';
    return isInPagesDir() ? file : `pages/${file}`;
  }
  function currentKey(){
    const path = location.pathname.split('/').pop() || 'index.html';
    if (path === 'index.html') return 'home';
    const match = links.find(l => l.file === path);
    return match ? match.key : 'home';
  }

  function renderNavbar(){
    const container = document.getElementById('app-navbar');
    if (!container) return;
    const activeKey = currentKey();
    const navItems = links.map(l => `<li class="nav-item">
        <a class="nav-link ${activeKey===l.key?'active':''}" href="${resolveHref(l.file)}">
          <i class="${l.icon} me-1"></i>${l.text}
        </a>
      </li>`).join('');

    container.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-gradient navbar-dark shadow-sm">
      <div class="container">
        <a class="navbar-brand fw-bold" href="${resolveHref('index.html')}">
          <i class="bi-bag-check-fill me-2"></i>InventarioApp
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
            ${navItems}
          </ul>
        </div>
      </div>
    </nav>`;
  }

  document.addEventListener('DOMContentLoaded', renderNavbar);
})();
