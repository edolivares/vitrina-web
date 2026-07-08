import apiClient from './apiClient';

function normalizeImageItem(image, index = 0) {
  if (typeof image === 'string') {
    return { id: null, url: image, sortOrder: index };
  }

  return {
    id: image.id || image.mediaId || null,
    url: image.url,
    sortOrder: Number.isInteger(image.sortOrder) ? image.sortOrder : index,
  };
}

function normalizeImages(images = []) {
  return images.map(normalizeImageItem).filter((image) => image.url);
}

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error.response?.data?.message ||
    error.response?.data?.details?.join(', ') ||
    error.message ||
    fallbackMessage
  );
}

/**
 * Normaliza el ID de comuna asegurando que sea un entero positivo válido.
 * 
 * @param {string|number} cityId - ID de la comuna.
 * @throws {Error} Si el ID no es válido.
 * @returns {number} ID de la comuna normalizado numéricamente.
 */
function normalizeCityId(cityId) {
  const numericCityId = Number(cityId);
  if (!Number.isInteger(numericCityId) || numericCityId <= 0) {
    throw new Error('Debes seleccionar una comuna válida.');
  }
  return numericCityId;
}

/**
 * Sube un archivo de imagen real y lo asocia a una publicación.
 */
export async function uploadPostImage(postId, file, sortOrder = 0) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sortOrder', String(sortOrder));

  try {
    const response = await apiClient.post(`/api/posts/${postId}/media`, formData);
    return normalizeImageItem(response.data.data, sortOrder);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'No se pudo subir la imagen.'), { cause: error });
  }
}

export async function deletePostImage(mediaId) {
  if (!mediaId) return;
  try {
    await apiClient.delete(`/api/media/${mediaId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'No se pudo eliminar la imagen.'), { cause: error });
  }
}

export async function syncPostImages(postId, images = []) {
  const normalizedImages = normalizeImages(images);

  await Promise.all(
    normalizedImages
      .filter((image) => image.id)
      .map((image, index) =>
        apiClient.post(`/api/posts/${postId}/media`, {
          mediaId: image.id,
          sortOrder: index,
        })
      )
  );
}

/**
 * Obtiene el listado de publicaciones públicas aplicando filtros opcionales.
 * 
 * @param {Object} [filters={}] - Filtros de búsqueda.
 * @param {string} [filters.search] - Texto de búsqueda.
 * @param {string} [filters.regionId] - ID de la región.
 * @param {string} [filters.comuna] - Nombre o ID de la comuna.
 * @param {string|number} [filters.minPrice] - Precio mínimo.
 * @param {string|number} [filters.maxPrice] - Precio máximo.
 * @param {string} [filters.condition] - Estado físico (Nuevo/Usado).
 * @returns {Promise<Array<Object>>} Listado de publicaciones normalizadas.
 */
export async function getPosts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.regionId) params.append('regionId', filters.regionId);
  if (filters.comuna) params.append('comuna', filters.comuna);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.condition) params.append('condition', filters.condition);

  const response = await apiClient.get(`/api/posts?${params.toString()}`);
  const posts = response.data.data;
  
  return posts.map((post) => ({
    id: post.id,
    title: post.title,
    price: Number(post.price),
    condition: post.condition === 'NEW' ? 'Nuevo' : 'Usado',
    comuna: post.cityName,
    images: post.coverImage?.url ? [post.coverImage.url] : [],
    seller: post.userId,
    createdAt: post.createdAt,
  }));
}

/**
 * Obtiene el detalle completo de una publicación por su ID.
 * 
 * @param {string} id - UUID de la publicación.
 * @returns {Promise<Object>} Detalle normalizado de la publicación.
 */
export async function getPostById(id) {
  const response = await apiClient.get(`/api/posts/${id}`);
  const post = response.data.data;
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    price: Number(post.price),
    condition: post.condition === 'NEW' ? 'Nuevo' : 'Usado',
    cityId: post.city.id?.toString() || '',
    regionId: post.city.region?.id?.toString() || '',
    comuna: post.city.name,
    region: post.city.region?.shortName || post.city.region?.name || '',
    status: post.status,
    images: post.gallery.length > 0 ? post.gallery.map((g) => g.url) : [],
    imageItems: normalizeImages(post.gallery || []),
    seller: post.seller.id,
    sellerName: post.seller.name,
    sellerAvatar: post.seller.avatarUrl || null,
    sellerEmail: post.seller.email,
    latitude: post.latitude ? Number(post.latitude) : null,
    longitude: post.longitude ? Number(post.longitude) : null,
    createdAt: post.createdAt,
  };
}

/**
 * Confirma y publica un borrador de publicación existente en el servidor.
 * 
 * @param {Object} postData - Datos del formulario de publicación.
 * @param {string} postData.title - Título.
 * @param {string} postData.description - Descripción.
 * @param {number} postData.price - Precio.
 * @param {string|number} postData.cityId - ID de la comuna.
 * @param {string} postData.condition - Estado físico.
 * @param {Array<Object>} postData.images - Imágenes ya subidas y asociadas al borrador.
 * @throws {Error} Si no se encuentra un ID de borrador activo en la URL.
 * @returns {Promise<Object>} Datos del post publicado.
 */
export async function createPost(postData) {
  const searchParams = new URLSearchParams(window.location.search);
  const draftId = searchParams.get('draftId');
  if (!draftId) {
    throw new Error('No se encontró el ID del borrador activo.');
  }

  await syncPostImages(draftId, postData.images);

  const payload = {
    title: postData.title,
    description: postData.description,
    price: Number(postData.price),
    cityId: normalizeCityId(postData.cityId),
    condition: postData.condition === 'Nuevo' ? 'NEW' : 'USED',
    status: 'PUBLISHED',
  };

  const response = await apiClient.put(`/api/posts/${draftId}`, payload);
  return response.data.data;
}

/**
 * Crea un borrador vacío inicial para el usuario autenticado.
 * 
 * @returns {Promise<Object>} Datos del borrador creado en el servidor.
 */
export async function createDraft() {
  const response = await apiClient.post('/api/posts/draft');
  return response.data.data;
}

/**
 * Actualiza los datos de una publicación activa.
 * 
 * @param {string} id - UUID de la publicación.
 * @param {Object} postData - Nuevos datos de la publicación.
 * @returns {Promise<Object>} Datos de la publicación actualizada.
 */
export async function updatePost(id, postData) {
  await syncPostImages(id, postData.images);

  const payload = {
    title: postData.title,
    description: postData.description,
    price: Number(postData.price),
    cityId: normalizeCityId(postData.cityId),
    condition: postData.condition === 'Nuevo' ? 'NEW' : 'USED',
    status: 'PUBLISHED',
  };

  const response = await apiClient.put(`/api/posts/${id}`, payload);
  return response.data.data;
}

/**
 * Actualiza el contenido de un borrador sin publicarlo definitivamente.
 * 
 * @param {string} id - UUID del borrador.
 * @param {Object} postData - Datos del borrador.
 * @returns {Promise<Object>} Datos del borrador actualizado.
 */
export async function updateDraft(id, postData) {
  await syncPostImages(id, postData.images);

  const payload = {
    title: postData.title || 'Sin Título',
    description: postData.description || '',
    price: Number(postData.price || 0),
    cityId: normalizeCityId(postData.cityId),
    condition: postData.condition === 'Nuevo' ? 'NEW' : 'USED',
    status: 'DRAFT',
  };

  const response = await apiClient.put(`/api/posts/${id}`, payload);
  return response.data.data;
}

/**
 * Obtiene todas las publicaciones activas y archivadas del usuario autenticado.
 * 
 * @param {string} sellerId - UUID del vendedor (usuario actual).
 * @returns {Promise<Array<Object>>} Listado de publicaciones de su perfil.
 */
export async function getPostsBySeller(sellerId) {
  const response = await apiClient.get('/api/posts/me');
  const posts = response.data.data;
  
  const activeAndArchived = posts.filter((post) => post.status !== 'DRAFT');

  return activeAndArchived.map((post) => ({
    id: post.id,
    title: post.title,
    price: Number(post.price),
    status: post.status,
    condition: post.condition === 'NEW' ? 'Nuevo' : 'Usado',
    comuna: post.cityName,
    images: post.coverImage?.url ? [post.coverImage.url] : [],
    seller: sellerId,
    createdAt: post.createdAt,
    viewsCount: post.viewsCount || 0,
  }));
}

/**
 * Obtiene únicamente las publicaciones en estado borrador (DRAFT) del usuario autenticado.
 * 
 * @returns {Promise<Array<Object>>} Listado de borradores del usuario.
 */
export async function getDraftsBySeller() {
  const response = await apiClient.get('/api/posts/me');
  const posts = response.data.data;
  
  const drafts = posts.filter((post) => post.status === 'DRAFT');

  return drafts.map((post) => ({
    id: post.id,
    title: post.title === 'Sin Título' ? '' : post.title,
    price: Number(post.price),
    status: post.status,
    condition: post.condition === 'NEW' ? 'Nuevo' : 'Usado',
    comuna: post.cityName,
    images: post.coverImage?.url ? [post.coverImage.url] : [],
    createdAt: post.createdAt,
  }));
}

/**
 * Obtiene el perfil público de otro usuario vendedor, incluyendo sus publicaciones activas.
 * 
 * @param {string} profileId - UUID del vendedor.
 * @returns {Promise<Object>} Información de perfil y array de publicaciones asociadas.
 */
export async function getPublicProfile(profileId) {
  const response = await apiClient.get(`/api/profiles/${profileId}`);
  const { profile, posts } = response.data.data;
  return {
    profile: {
      id: profile.id,
      name: profile.name,
      avatarUrl: profile.avatar?.url || null,
      bio: profile.bio || 'Este vendedor no ha agregado una biografía.',
      joinedAt: profile.joinedAt,
      reviewScore: 4.8,
      reviewCount: 3,
      reviewSummary: [
        { rating: 5, count: 3 }
      ],
      reviews: []
    },
    posts: posts.map((post) => ({
      id: post.id,
      title: post.title,
      price: Number(post.price),
      condition: post.condition === 'NEW' ? 'Nuevo' : 'Usado',
      comuna: post.cityName,
      images: post.coverImage?.url ? [post.coverImage.url] : [],
      seller: profile.id,
      createdAt: post.createdAt,
    })),
  };
}

/**
 * Actualiza el estado lógico (publicado, archivado) de una publicación.
 * 
 * @param {string} id - UUID de la publicación.
 * @param {string} status - Estado destino ('PUBLISHED' o 'ARCHIVED').
 * @returns {Promise<Object>} Datos devueltos por el servidor.
 */
export async function updatePostStatus(id, status) {
  if (status === 'ARCHIVED') {
    const response = await apiClient.patch(`/api/posts/${id}/archive`);
    return response.data.data;
  } else if (status === 'PUBLISHED') {
    const response = await apiClient.patch(`/api/posts/${id}/reactivate`);
    return response.data.data;
  } else {
    const response = await apiClient.put(`/api/posts/${id}`, { status });
    return response.data.data;
  }
}

/**
 * Elimina (físicamente o de forma lógica) una publicación/borrador del servidor.
 * 
 * @param {string} id - UUID de la publicación.
 * @returns {Promise<Object>} Respuesta del servidor.
 */
export async function deletePost(id) {
  const response = await apiClient.delete(`/api/posts/${id}`);
  return response.data;
}

/**
 * Obtiene el listado de publicaciones guardadas en favoritos por el usuario autenticado.
 * 
 * @returns {Promise<Array<Object>>} Listado de publicaciones marcadas como favoritas.
 */
export async function getSavedPosts() {
  const response = await apiClient.get('/api/saved');
  return response.data.data;
}

/**
 * Guarda una publicación en favoritos para el usuario autenticado.
 * 
 * @param {string} postId - UUID de la publicación a guardar.
 * @returns {Promise<Object>} Respuesta del servidor.
 */
export async function savePost(postId) {
  const response = await apiClient.post('/api/saved', { postId });
  return response.data;
}

/**
 * Elimina una publicación de la lista de favoritos del usuario autenticado.
 * 
 * @param {string} postId - UUID de la publicación a quitar.
 * @returns {Promise<Object>} Respuesta del servidor.
 */
export async function unsavePost(postId) {
  const response = await apiClient.delete(`/api/saved/${postId}`);
  return response.data;
}

/**
 * Obtiene las métricas reales de la base de datos para una publicación específica.
 * 
 * @param {string} postId - UUID de la publicación.
 * @returns {Promise<Object>} Datos reales de vistas, favoritos, chats y conversión.
 */
export async function getPostMetricsFromApi(postId) {
  const response = await apiClient.get(`/api/posts/${postId}/metrics`);
  return response.data.data;
}
