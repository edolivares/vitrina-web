import { postSchema, filterSchema } from '@/schemas/post.schema';
import { STORAGE_KEYS } from '@/config/constants';

const INITIAL_POSTS = [
  {
    id: 1,
    title: 'Bicicleta Trek Marlin 5 Aro 29',
    price: 420000,
    description: 'Bicicleta de montaña Trek Marlin 5 en excelente estado. Marco de aluminio talla M, transmisión Shimano de 2x8 velocidades, frenos de disco hidráulicos Tektro. Mantención recién hecha. Lista para pedalear.',
    region: 'Región de Coquimbo',
    comuna: 'La Serena',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&q=80&w=800'
    ],
    sellerId: 'user-999',
    sellerName: 'Rodrigo Araya',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'PUBLISHED',
    condition: 'Usado'
  },
  {
    id: 2,
    title: 'Mesa de centro madera rústica',
    price: 850000,
    description: 'Mesa de centro fabricada a mano con madera de roble reciclada. Acabado con barniz poliuretano mate para alta resistencia. Medidas: 100cm de largo x 60cm de ancho x 45cm de alto. Patas metálicas estilo hairpin.',
    region: 'Región de Coquimbo',
    comuna: 'Coquimbo',
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800'
    ],
    sellerId: 'user-888',
    sellerName: 'Paula Espinoza',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: 'PUBLISHED',
    condition: 'Nuevo'
  },
  {
    id: 3,
    title: 'Teclado Mecánico Keychron K2 v2',
    price: 90000,
    description: 'Teclado mecánico inalámbrico formato 75%. Switch Gateron Brown lubricados de fábrica, keycaps de PBT adicionales. Retroiluminación RGB. Compatible con Mac, Windows y Android. Conexión Bluetooth o cable tipo C. Caja y accesorios originales completos.',
    region: 'Región Metropolitana',
    comuna: 'Providencia',
    images: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800'
    ],
    sellerId: 'user-777',
    sellerName: 'Nicolás Silva',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'PUBLISHED',
    condition: 'Nuevo'
  },
  {
    id: 4,
    title: 'Guitarra Electroacústica Fender FA-125CE',
    price: 130000,
    description: 'Guitarra electroacústica Fender con cutaway. Tapa de abeto laminado, aros y fondo de caoba. Preamplificador Fishman integrado con afinador. Incluye funda acolchada, correa y set de uñetas. Excelente sonido, ideal para principiantes e intermedios.',
    region: 'Región Metropolitana',
    comuna: 'Santiago',
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800'
    ],
    sellerId: 'user-123',
    sellerName: 'Diego Valdivia',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'PUBLISHED',
    condition: 'Usado'
  },
  {
    id: 5,
    title: 'Silla Gamer Ergonómica Cougar Armor',
    price: 150000,
    description: 'Silla gamer Cougar modelo Armor One. Reclinable hasta 180 grados, reposabrazos 2D regulables en altura y rotación. Soporte de pistón clase 4 de alta resistencia. Incluye cojín lumbar y cervical. Sin detalles estéticos, muy poco uso.',
    region: 'Región de Valparaíso',
    comuna: 'Viña del Mar',
    images: [
      'https://images.unsplash.com/photo-1598550476439-6847785fce6e?auto=format&fit=crop&q=80&w=800'
    ],
    sellerId: 'user-666',
    sellerName: 'Gonzalo Muñoz',
    sellerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: 'PUBLISHED',
    condition: 'Nuevo'
  }
];

if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
}

function getPostsFromStorage() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
}

function savePostsToStorage(posts) {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockGetPosts(filters = {}) {

  filterSchema.parse(filters);

  await delay(400);
  const posts = getPostsFromStorage();

  const normalizedPosts = posts.map(post => {
    if (!post.condition) {
      post.condition = (post.id === 1 || post.id === 4) ? 'Usado' : 'Nuevo';
    }
    return post;
  });

  return normalizedPosts.filter(post => {

    if (post.status !== 'PUBLISHED') return false;

    if (filters.search) {
      const query = filters.search.toLowerCase();
      const matchTitle = post.title.toLowerCase().includes(query);
      const matchDesc = post.description.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc) return false;
    }

    if (filters.region && post.region !== filters.region) {
      return false;
    }

    if (filters.comuna && post.comuna !== filters.comuna) {
      return false;
    }

    if (filters.minPrice !== undefined && filters.minPrice !== '') {
      if (post.price < Number(filters.minPrice)) return false;
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== '') {
      if (post.price > Number(filters.maxPrice)) return false;
    }

    if (filters.condition) {
      if (post.condition !== filters.condition) return false;
    }

    return true;
  });
}

export async function mockGetPostById(id) {
  await delay(300);
  const posts = getPostsFromStorage();
  const post = posts.find(p => p.id === Number(id));
  if (!post) {
    throw new Error('Publicación no encontrada');
  }
  if (!post.condition) {
    post.condition = (post.id === 1 || post.id === 4) ? 'Usado' : 'Nuevo';
  }
  return post;
}

export async function mockCreatePost(postData, currentUser) {
  postSchema.parse(postData);

  if (!currentUser) {
    throw new Error('Debe iniciar sesión para realizar una publicación');
  }

  await delay(800);

  const posts = getPostsFromStorage();
  const newPost = {
    id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
    title: postData.title,
    price: Number(postData.price),
    description: postData.description,
    region: postData.region,
    comuna: postData.comuna,
    images: postData.images,
    sellerId: currentUser.id,
    sellerName: currentUser.name,
    sellerAvatar: currentUser.avatarUrl,
    createdAt: new Date().toISOString(),
    status: 'PUBLISHED',
    condition: postData.condition || 'Nuevo'
  };

  posts.unshift(newPost);
  savePostsToStorage(posts);

  return newPost;
}

export async function mockGetPostsBySeller(sellerId) {
  await delay(300);
  const posts = getPostsFromStorage();
  return posts.filter(post => post.sellerId === sellerId).map(post => {
    if (!post.condition) {
      post.condition = (post.id === 1 || post.id === 4) ? 'Usado' : 'Nuevo';
    }
    return post;
  });
}

export async function mockUpdatePostStatus(id, status) {
  await delay(400);
  const posts = getPostsFromStorage();
  const index = posts.findIndex(p => p.id === Number(id));
  if (index === -1) {
    throw new Error('Publicación no encontrada');
  }
  posts[index].status = status;
  savePostsToStorage(posts);
  return posts[index];
}
