(function(){
  const tbody = () => document.getElementById('gestionesTbody');

  function render(items){
    tbody().innerHTML = items.map(g => `<tr>
      <td>${g.id}</td>
      <td>${g.restablecimiento?.id ?? ''}</td>
      <td>${g.observacion ?? ''}</td>
      <td><span class="badge ${g.estado==='APROBADO'?'bg-success': g.estado==='RECHAZADO'?'bg-danger':'bg-secondary'}">${g.estado ?? 'PENDIENTE'}</span></td>
      <td class="text-nowrap">
        <button class="btn btn-sm btn-outline-primary me-1" data-edit="${g.id}"><i class="bi-pencil"></i></button>
        <button class="btn btn-sm btn-outline-success me-1" data-approve="${g.id}"><i class="bi-check2"></i> Aprobar</button>
        <button class="btn btn-sm btn-outline-danger me-1" data-reject="${g.id}"><i class="bi-x"></i> Rechazar</button>
        <button class="btn btn-sm btn-outline-secondary" data-del="${g.id}"><i class="bi-trash"></i></button>
      </td>
    </tr>`).join('');
  }

  async function load(){
    try {
      const items = await API.Gestiones.list();
      render(Array.isArray(items) ? items : []);
    } catch (e) {
      tbody().innerHTML = `<tr><td colspan="5" class="text-danger">Error: ${e.message}</td></tr>`;
    }
  }

  async function loadRestablecimientos(){
    const rests = await API.Restablecimientos.list();
    const select = document.getElementById('gestionRest');
    select.innerHTML = (rests||[]).map(r => `<option value="${r.id}">#${r.id} • ${r.producto?.nombre ?? r.producto?.productoId ?? ''} (${r.cantidad})</option>`).join('');
  }

  function openModal(obj){
    document.getElementById('modalGestionTitle').textContent = obj ? 'Editar gestión' : 'Nueva gestión';
    document.getElementById('gestionId').value = obj?.id || '';
    document.getElementById('gestionRest').value = obj?.restablecimiento?.id || '';
    document.getElementById('gestionObs').value = obj?.observacion || '';
    new bootstrap.Modal(document.getElementById('modalGestion')).show();
  }

  async function save(){
    const id = document.getElementById('gestionId').value;
    const data = {
      restablecimiento: { id: Number(document.getElementById('gestionRest').value) },
      observacion: document.getElementById('gestionObs').value || undefined
    };
    if (id) await API.Gestiones.update(id, data);
    else await API.Gestiones.create(data);
  }

  async function onTableClick(e){
    const btn = e.target.closest('button');
    if (!btn) return;
    const id = btn.dataset.edit || btn.dataset.del || btn.dataset.approve || btn.dataset.reject;
    if (!id) return;
    if (btn.dataset.edit){
      const item = await API.Gestiones.getById(id);
      openModal(item);
    } else if (btn.dataset.approve){
      await API.Gestiones.aprobar(id);
      await load();
    } else if (btn.dataset.reject){
      await API.Gestiones.rechazar(id);
      await load();
    } else if (btn.dataset.del){
      if (confirm('¿Eliminar gestión?')){
        await API.Gestiones.remove(id);
        await load();
      }
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([load(), loadRestablecimientos()]);
    tbody().addEventListener('click', onTableClick);
    document.getElementById('btnSaveGestion').addEventListener('click', async () => {
      try { await save(); bootstrap.Modal.getInstance(document.getElementById('modalGestion')).hide(); await load(); }
      catch(e){ alert(e.message); }
    });
  });
})();
