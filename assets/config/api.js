// Configuración de API y utilidades HTTP
const API_CONFIG = {
  // TODO: Actualizar baseURL según el documento del usuario
  baseURL: localStorage.getItem('api_base_url') || 'http://localhost:3000',
  timeout: 15000
};

const api = axios.create({ baseURL: API_CONFIG.baseURL, timeout: API_CONFIG.timeout });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error.message || 'Error de red';
    console.error('API Error:', message);
    return Promise.reject(error);
  }
);

function setApiBaseUrl(url){
  API_CONFIG.baseURL = url;
  localStorage.setItem('api_base_url', url);
  api.defaults.baseURL = url;
}

// Endpoints (actualizar con el documento proporcionado)
const Endpoints = {
  almacenes: {
    list: '/almacenes',
    get: (id) => `/almacenes/${id}`,
    create: '/almacenes',
    update: (id) => `/almacenes/${id}`,
    remove: (id) => `/almacenes/${id}`
  },
  productos: {
    list: '/productos',
    get: (id) => `/productos/${id}`,
    create: '/productos',
    update: (id) => `/productos/${id}`,
    remove: (id) => `/productos/${id}`
  },
  inventario: {
    list: '/inventario',
    get: (id) => `/inventario/${id}`,
    create: '/inventario',
    update: (id) => `/inventario/${id}`,
    remove: (id) => `/inventario/${id}`,
    lowStock: '/inventario/low-stock'
  },
  categorias: {
    list: '/categorias',
    get: (id) => `/categorias/${id}`,
    create: '/categorias',
    update: (id) => `/categorias/${id}`,
    remove: (id) => `/categorias/${id}`
  },
  despacho: {
    list: '/despachos',
    get: (id) => `/despachos/${id}`,
    create: '/despachos',
    update: (id) => `/despachos/${id}`,
    remove: (id) => `/despachos/${id}`
  },
  recepcion: {
    list: '/recepciones',
    get: (id) => `/recepciones/${id}`,
    create: '/recepciones',
    update: (id) => `/recepciones/${id}`,
    remove: (id) => `/recepciones/${id}`
  }
};
