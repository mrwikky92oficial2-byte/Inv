// CRUD genérico: tabla + modal
class CrudPage {
  constructor({ entity, columns, formFields, endpoints }){
    this.entity = entity;
    this.columns = columns; // [{key, label}]
    this.formFields = formFields; // [{name, label, type, options?}]
    this.endpoints = endpoints;

    this.tableBody = null;
    this.modalEl = null;
    this.modal = null;
    this.formEl = null;
    this.submitBtn = null;
    this.currentId = null;
  }

  init(){
    this.tableBody = document.querySelector('#dataBody');
    this.modalEl = document.getElementById('crudModal');
    this.modal = new bootstrap.Modal(this.modalEl);
    this.formEl = document.getElementById('crudForm');
    this.submitBtn = document.getElementById('submitBtn');

    this.renderTableHead();
    this.renderFormFields();

    document.getElementById('createBtn').addEventListener('click', ()=> this.openCreate());
    this.formEl.addEventListener('submit', (e)=> this.onSubmit(e));

    this.load();
  }

  renderTableHead(){
    const thead = document.querySelector('#dataHead');
    thead.innerHTML = `
      <tr>
        ${this.columns.map(c=>`<th>${c.label}</th>`).join('')}
        <th class="text-end">Acciones</th>
      </tr>`;
  }

  renderFormFields(){
    const container = document.getElementById('formFields');
    container.innerHTML = this.formFields.map(f => {
      if(f.type === 'select'){
        const opts = (f.options||[]).map(o=>`<option value="${o.value}">${o.label}</option>`).join('');
        return `<div class="col-12 col-md-6">
          <label class="form-label">${f.label}</label>
          <select class="form-select" name="${f.name}" required>${opts}</select>
        </div>`;
      }
      return `<div class="col-12 col-md-6">
        <label class="form-label">${f.label}</label>
        <input class="form-control" name="${f.name}" type="${f.type||'text'}" required />
      </div>`;
    }).join('');
  }

  async load(){
    this.tableBody.innerHTML = `<tr><td colspan="${this.columns.length+1}" class="text-center text-muted">Cargando...</td></tr>`;
    const { data } = await api.get(this.endpoints.list);
    this.renderRows(data);
  }

  renderRows(rows){
    if(!Array.isArray(rows) || rows.length === 0){
      this.tableBody.innerHTML = `<tr><td colspan="${this.columns.length+1}" class="text-center text-muted">Sin datos</td></tr>`;
      return;
    }

    this.tableBody.innerHTML = rows.map(row => {
      const tds = this.columns.map(c => `<td>${this.escapeHtml(row[c.key])}</td>`).join('');
      return `<tr>
        ${tds}
        <td class="text-end">
          <button class="btn btn-sm btn-outline-secondary me-2" data-action="edit" data-id="${row.id}">Editar</button>
          <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${row.id}">Eliminar</button>
        </td>
      </tr>`;
    }).join('');

    this.tableBody.querySelectorAll('button[data-action]').forEach(btn => {
      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      if(action === 'edit') btn.addEventListener('click', ()=> this.openEdit(id));
      if(action === 'delete') btn.addEventListener('click', ()=> this.remove(id));
    });
  }

  openCreate(){
    this.currentId = null;
    this.formEl.reset();
    this.submitBtn.textContent = 'Crear';
    this.modal.show();
  }

  async openEdit(id){
    const { data } = await api.get(this.endpoints.get(id));
    this.currentId = id;
    for(const f of this.formFields){
      const input = this.formEl.querySelector(`[name="${f.name}"]`);
      if(!input) continue;
      input.value = data[f.name] ?? '';
    }
    this.submitBtn.textContent = 'Actualizar';
    this.modal.show();
  }

  async remove(id){
    if(!confirm('¿Eliminar registro?')) return;
    await api.delete(this.endpoints.remove(id));
    this.load();
  }

  async onSubmit(e){
    e.preventDefault();
    const formData = new FormData(this.formEl);
    const payload = Object.fromEntries(formData.entries());

    if(this.currentId){
      await api.put(this.endpoints.update(this.currentId), payload);
    }else{
      await api.post(this.endpoints.create, payload);
    }
    this.modal.hide();
    this.load();
  }

  escapeHtml(value){
    if(value === undefined || value === null) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
