(function(){
  const navbar = `
  <nav class="navbar navbar-expand-lg navbar-purple navbar-dark">
    <div class="container">
      <a class="navbar-brand d-flex align-items-center gap-2" href="/index.html">
        <span class="badge rounded-pill text-bg-light text-purple">INV</span>
        <span>Sistema de Inventario</span>
      </a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
          <li class="nav-item"><a class="nav-link" href="/index.html">Inicio</a></li>
          <li class="nav-item"><a class="nav-link" href="/pages/almacenes.html">Almacenes</a></li>
          <li class="nav-item"><a class="nav-link" href="/pages/productos.html">Productos</a></li>
          <li class="nav-item"><a class="nav-link" href="/pages/inventario.html">Inventario</a></li>
          <li class="nav-item"><a class="nav-link" href="/pages/categorias.html">Categorías</a></li>
          <li class="nav-item"><a class="nav-link" href="/pages/despacho.html">Despacho</a></li>
          <li class="nav-item"><a class="nav-link" href="/pages/recepcion.html">Recibir Mercadería</a></li>
        </ul>
      </div>
    </div>
  </nav>`;

  const mount = () => {
    const container = document.getElementById('navbar');
    if(!container) return;
    container.innerHTML = navbar;

    // active link
    const current = location.pathname.replace(/\/$/, '/index.html');
    document.querySelectorAll('.navbar .nav-link').forEach(a=>{
      const href = a.getAttribute('href');
      if(href && current.endsWith(href)){
        a.classList.add('active');
      }
    });
  };

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mount);
  }else{ mount(); }
})();
