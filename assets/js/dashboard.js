(function(){
  async function loadLowStock(){
    const tbody = document.querySelector('#lowStockTable tbody');
    try{
      const { data } = await api.get(Endpoints?.inventario?.lowStock || '/inventario/low-stock');
      const rows = Array.isArray(data) ? data : [];
      document.getElementById('lowStockCount').textContent = rows.length;
      if(rows.length === 0){
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Sin productos en bajo stock</td></tr>`;
        return;
      }
      tbody.innerHTML = rows.map(p => `
        <tr>
          <td>${escapeHtml(p.nombre || p.producto || '—')}</td>
          <td>${escapeHtml(p.sku || '—')}</td>
          <td><span class="badge text-bg-warning">${escapeHtml(p.stock)}</span></td>
          <td>${escapeHtml(p.umbral || p.threshold || '—')}</td>
        </tr>
      `).join('');
    }catch(err){
      tbody.innerHTML = `<tr><td colspan="4" class="text-danger text-center">Error: no se pudo cargar.</td></tr>`;
    }
  }

  function escapeHtml(value){
    if(value === undefined || value === null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function mount(){
    document.getElementById('refreshDashboard')?.addEventListener('click', loadLowStock);
    loadLowStock();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mount);
  }else{ mount(); }
})();
