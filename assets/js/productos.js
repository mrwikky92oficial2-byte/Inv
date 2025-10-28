(function(){
  const tbody = () => document.getElementById('productosTbody');
  const categoriaSelect = () => document.getElementById('filterCategoria');

  function mapProductoForForm(p){
    return {
      id: p.id ?? p.productoId,
      nombre: p.nombre ?? '',
      descripcion: p.descripcion ?? '',
      precio: typeof p.precio === 'number' ? p.precio : (typeof p.price === 'number' ? p.price : 0),
      stock: typeof p.stock === 'number' ? p.stock : (typeof p.cantidad === 'number' ? p.cantidad : 0),
      categoriaId: p.categoria?.id ?? p.categoriaId ?? null,
      activo: p.activo ?? true
    };
  }

  function fillCategorias(selectEl, categorias){
    selectEl.innerHTML = '<option value="">Todas</option>' + categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  }

  async function loadCategorias(){
    try {
      const categorias = await API.Categorias.list();
      fillCategorias(categoriaSelect(), categorias);
      // Also fill modal select
      const modalCat = document.getElementById('productoCategoria');
      if (modalCat) modalCat.innerHTML = categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
    } catch (e) {
      console.error('Error cargando categorías', e);
    }
  }

  function renderRows(productos){
    tbody().innerHTML = productos.map(p => {
      const m = mapProductoForForm(p);
      return `<tr>
        <td>${m.id ?? ''}</td>
        <td>${m.nombre}</td>
        <td>${m.categoriaId ?? '-'}</td>
        <td>${m.stock}</td>
        <td>${m.activo ? '<span class="badge bg-success">Sí</span>' : '<span class="badge bg-secondary">No</span>'}</td>
        <td class="text-nowrap">
          <button class="btn btn-sm btn-outline-primary me-1" data-edit="${m.id}"><i class="bi-pencil"></i></button>
          <button class="btn btn-sm btn-outline-danger me-1" data-del="${m.id}"><i class="bi-trash"></i></button>
          <button class="btn btn-sm btn-outline-success me-1" data-activate="${m.id}"><i class="bi-check2"></i></button>
          <button class="btn btn-sm btn-outline-secondary" data-deactivate="${m.id}"><i class="bi-x"></i></button>
        </td>
      </tr>`;
    }).join('');
  }

  async function loadProductos(){
    try {
      let productos = await API.Productos.list();
      const cat = categoriaSelect().value;
      if (cat) {
        productos = await API.Productos.byCategoria(cat);
      }
      renderRows(Array.isArray(productos) ? productos : []);
    } catch (e) {
      tbody().innerHTML = `<tr><td colspan="6" class="text-danger">Error: ${e.message}</td></tr>`;
    }
  }

  function openModal(producto){
    const modalTitle = document.getElementById('modalProductoTitle');
    const idEl = document.getElementById('productoId');
    const nombreEl = document.getElementById('productoNombre');
    const descEl = document.getElementById('productoDescripcion');
    const precioEl = document.getElementById('productoPrecio');
    const stockEl = document.getElementById('productoStock');
    const catEl = document.getElementById('productoCategoria');
    const activoEl = document.getElementById('productoActivo');

    if (producto) {
      modalTitle.textContent = 'Editar producto';
      const m = mapProductoForForm(producto);
      idEl.value = m.id ?? '';
      nombreEl.value = m.nombre ?? '';
      descEl.value = m.descripcion ?? '';
      precioEl.value = m.precio ?? 0;
      stockEl.value = m.stock ?? 0;
      catEl.value = m.categoriaId ?? '';
      activoEl.checked = !!m.activo;
    } else {
      modalTitle.textContent = 'Nuevo producto';
      idEl.value = '';
      nombreEl.value = '';
      descEl.value = '';
      precioEl.value = '';
      stockEl.value = '';
      catEl.value = '';
      activoEl.checked = true;
    }

    const modal = new bootstrap.Modal(document.getElementById('modalProducto'));
    modal.show();
  }

  async function saveProducto(){
    const id = document.getElementById('productoId').value;
    const payload = {
      nombre: document.getElementById('productoNombre').value,
      descripcion: document.getElementById('productoDescripcion').value || undefined,
      precio: Number(document.getElementById('productoPrecio').value || 0),
      stock: Number(document.getElementById('productoStock').value || 0),
      categoria: document.getElementById('productoCategoria').value ? { id: Number(document.getElementById('productoCategoria').value) } : undefined,
      activo: document.getElementById('productoActivo').checked
    };

    // API expects certain field names; we send flexible payload
    const data = {
      nombre: payload.nombre,
      descripcion: payload.descripcion,
      precio: payload.precio,
      stock: payload.stock,
      categoria: payload.categoria,
      activo: payload.activo
    };

    if (id) {
      await API.Productos.update(id, data);
    } else {
      await API.Productos.create(data);
    }
  }

  async function onTableClick(e){
    const id = e.target.closest('button')?.dataset?.edit || e.target.closest('button')?.dataset?.del || e.target.closest('button')?.dataset?.activate || e.target.closest('button')?.dataset?.deactivate;
    if (!id) return;
    const btn = e.target.closest('button');
    if (btn.dataset.edit){
      const prod = await API.Productos.getById(id);
      openModal(prod);
    } else if (btn.dataset.del){
      if (confirm('¿Eliminar producto?')){
        await API.Productos.remove(id);
        await loadProductos();
      }
    } else if (btn.dataset.activate){
      await API.Productos.activar(id);
      await loadProductos();
    } else if (btn.dataset.deactivate){
      await API.Productos.desactivar(id);
      await loadProductos();
    }
  }

  async function onApplyStock(deltaSign){
    const qty = Number(document.getElementById('stockQty').value || 0);
    const selected = tbody().querySelector('tr.table-active');
    if (!selected){ alert('Selecciona un producto (clic en la fila)'); return; }
    const id = selected.firstElementChild.textContent.trim();
    if (!id) return;
    if (deltaSign > 0) {
      await API.Productos.increaseStock(id, qty);
    } else {
      await API.Productos.decreaseStock(id, qty);
    }
    await loadProductos();
  }

  function enableRowSelection(){
    tbody().addEventListener('click', (e) => {
      const tr = e.target.closest('tr');
      if (!tr) return;
      tbody().querySelectorAll('tr').forEach(r => r.classList.remove('table-active'));
      tr.classList.add('table-active');
    });
  }

  async function init(){
    await loadCategorias();
    await loadProductos();
    enableRowSelection();
    document.getElementById('btnSaveProducto').addEventListener('click', async () => {
      try {
        await saveProducto();
        bootstrap.Modal.getInstance(document.getElementById('modalProducto')).hide();
        await loadProductos();
      } catch (e) { alert(e.message); }
    });
    categoriaSelect().addEventListener('change', loadProductos);

    document.getElementById('btnSearch').addEventListener('click', async () => {
      const name = document.getElementById('searchName').value.trim();
      const res = name ? await API.Productos.searchByName(name) : await API.Productos.list();
      renderRows(Array.isArray(res) ? res : (res ? [res] : []));
    });

    document.getElementById('btnIncStock').addEventListener('click', () => onApplyStock(1));
    document.getElementById('btnDecStock').addEventListener('click', () => onApplyStock(-1));
  }

  document.addEventListener('DOMContentLoaded', init);
})();
