(function(){
  const tbody = () => document.getElementById('categoriasTbody');

  function renderRows(items){
    tbody().innerHTML = items.map(c => `<tr>
      <td>${c.id}</td>
      <td>${c.nombre}</td>
      <td>${c.descripcion ?? ''}</td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-outline-primary me-1" data-edit="${c.id}"><i class="bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-danger" data-del="${c.id}"><i class="bi-trash"></i></button>
      </td>
    </tr>`).join('');
  }

  async function load(){
    try {
      const items = await API.Categorias.list();
      renderRows(Array.isArray(items) ? items : []);
    } catch (e) {
      tbody().innerHTML = `<tr><td colspan="4" class="text-danger">Error: ${e.message}</td></tr>`;
    }
  }

  function openModal(cat){
    document.getElementById('modalCategoriaTitle').textContent = cat ? 'Editar categoría' : 'Nueva categoría';
    document.getElementById('categoriaId').value = cat?.id || '';
    document.getElementById('categoriaNombre').value = cat?.nombre || '';
    document.getElementById('categoriaDescripcion').value = cat?.descripcion || '';
    new bootstrap.Modal(document.getElementById('modalCategoria')).show();
  }

  async function save(){
    const id = document.getElementById('categoriaId').value;
    const data = {
      nombre: document.getElementById('categoriaNombre').value,
      descripcion: document.getElementById('categoriaDescripcion').value || undefined
    };
    if (id) await API.Categorias.update(id, data);
    else await API.Categorias.create(data);
  }

  async function onTableClick(e){
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.edit || btn.dataset.del;
    if (!id) return;
    if (btn.dataset.edit){
      const cat = await API.Categorias.getById(id);
      openModal(cat);
    } else if (btn.dataset.del){
      if (confirm('¿Eliminar categoría?')){
        await API.Categorias.remove(id);
        await load();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    load();
    tbody().addEventListener('click', onTableClick);
    document.getElementById('btnSaveCategoria').addEventListener('click', async () => {
      try { await save(); bootstrap.Modal.getInstance(document.getElementById('modalCategoria')).hide(); await load(); }
      catch(e){ alert(e.message); }
    });
  });
})();
