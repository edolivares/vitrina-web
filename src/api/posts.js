import apiClient from './apiClient';

function normalizeCityId(cityId) {
  const numericCityId = Number(cityId);
  if (!Number.isInteger(numericCityId) || numericCityId <= 0) {
    throw new Error('Debes seleccionar una comuna válida.');
  }
  return numericCityId;
}

async function uploadRemoteImageUrl(postId, url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';
    const file = new File([blob], 'post_image.jpg', { type: mimeType });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sortOrder', '0');
    
    await apiClient.post(`/api/posts/${postId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.error('Error al subir la imagen remota:', error);
  }
}

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
    seller: post.seller.id,
    sellerName: post.seller.name,
    sellerAvatar: post.seller.avatarUrl || null,
    createdAt: post.createdAt,
  };
}

export async function createPost(postData) {
  // Read draftId from URL
  const searchParams = new URLSearchParams(window.location.search);
  const draftId = searchParams.get('draftId');
  if (!draftId) {
    throw new Error('No se encontró el ID del borrador activo.');
  }

  for (const imgUrl of postData.images) {
    await uploadRemoteImageUrl(draftId, imgUrl);
  }

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

export async function createDraft() {
  const response = await apiClient.post('/api/posts/draft');
  return response.data.data;
}

export async function updatePost(id, postData) {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  for (const imgUrl of postData.images) {
    if (!imgUrl.startsWith(baseUrl) && !imgUrl.startsWith('/uploads')) {
      await uploadRemoteImageUrl(id, imgUrl);
    }
  }

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

export async function updateDraft(id, postData) {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  for (const imgUrl of postData.images) {
    if (!imgUrl.startsWith(baseUrl) && !imgUrl.startsWith('/uploads')) {
      await uploadRemoteImageUrl(id, imgUrl);
    }
  }

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

export async function getPostsBySeller(sellerId) {
  const response = await apiClient.get('/api/posts/me');
  const posts = response.data.data;
  
  // Filter out drafts from the active/archived posts list
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
  }));
}

export async function getDraftsBySeller() {
  const response = await apiClient.get('/api/posts/me');
  const posts = response.data.data;
  
  // Get draft posts
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

export async function deletePost(id) {
  const response = await apiClient.delete(`/api/posts/${id}`);
  return response.data;
}
