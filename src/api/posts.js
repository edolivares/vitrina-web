import { postSchema, filterSchema } from '@/schemas/post.schema';
import { FREE_ACCOUNT_LIMITS, MOCK_USER_IDS, STORAGE_KEYS } from '@/config/constants';

const INITIAL_POSTS = [
  {
    id: '7bcb4b49-45f2-4d95-9005-7f0583b2f3a1',
    title: 'Bicicleta Trek Marlin 5 Aro 29',
    price: 420000,
    description: 'Bicicleta de montaña Trek Marlin 5 en excelente estado. Marco de aluminio talla M, transmisión Shimano de 2x8 velocidades, frenos de disco hidráulicos Tektro. Mantención recién hecha. Lista para pedalear.',
    region: 'Región de Coquimbo',
    comuna: 'La Serena',
    images: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.RODRIGO,
    sellerName: 'Rodrigo Araya',
    sellerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'PUBLISHED',
    condition: 'Usado'
  },
  {
    id: '587cd88e-e6bd-4d83-aa91-6f1c88de96e5',
    title: 'Mesa de centro madera rústica',
    price: 850000,
    description: 'Mesa de centro fabricada a mano con madera de roble reciclada. Acabado con barniz poliuretano mate para alta resistencia. Medidas: 100cm de largo x 60cm de ancho x 45cm de alto. Patas metálicas estilo hairpin.',
    region: 'Región de Coquimbo',
    comuna: 'Coquimbo',
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.PAULA,
    sellerName: 'Paula Espinoza',
    sellerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: 'PUBLISHED',
    condition: 'Nuevo'
  },
  {
    id: '413765db-1349-40d3-b70e-a48dcba2e999',
    title: 'Teclado Mecánico Keychron K2 v2',
    price: 90000,
    description: 'Teclado mecánico inalámbrico formato 75%. Switch Gateron Brown lubricados de fábrica, keycaps de PBT adicionales. Retroiluminación RGB. Compatible con Mac, Windows y Android. Conexión Bluetooth o cable tipo C. Caja y accesorios originales completos.',
    region: 'Región Metropolitana',
    comuna: 'Providencia',
    images: [
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.VALENTINA,
    sellerName: 'Nicolás Silva',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    status: 'PUBLISHED',
    condition: 'Nuevo'
  },
  {
    id: '611522b0-d6bc-4a6d-9442-3834951bc246',
    title: 'Guitarra Electroacústica Fender FA-125CE',
    price: 130000,
    description: 'Guitarra electroacústica Fender con cutaway. Tapa de abeto laminado, aros y fondo de caoba. Preamplificador Fishman integrado con afinador. Incluye funda acolchada, correa y set de uñetas. Excelente sonido, ideal para principiantes e intermedios.',
    region: 'Región Metropolitana',
    comuna: 'Santiago',
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.DIEGO,
    sellerName: 'Diego Valdivia',
    sellerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    status: 'PUBLISHED',
    condition: 'Usado'
  },
  {
    id: 'a58c381c-2b33-4db2-9dc8-7fcb7f1b011d',
    title: 'Silla Gamer Ergonómica Cougar Armor',
    price: 150000,
    description: 'Silla gamer Cougar modelo Armor One. Reclinable hasta 180 grados, reposabrazos 2D regulables en altura y rotación. Soporte de pistón clase 4 de alta resistencia. Incluye cojín lumbar y cervical. Sin detalles estéticos, muy poco uso.',
    region: 'Región de Valparaíso',
    comuna: 'Viña del Mar',
    images: [
      'https://images.unsplash.com/photo-1598550476439-6847785fce6e?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.MARTIN,
    sellerName: 'Gonzalo Muñoz',
    sellerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    status: 'PUBLISHED',
    condition: 'Nuevo'
  },
  {
    id: '0d26e43c-3102-4822-ad22-5b621403822e',
    title: 'Cámara Sony Alpha a6000 con lente kit',
    price: 380000,
    description: 'Cámara mirrorless Sony Alpha a6000 con lente 16-50mm. Incluye batería, cargador, correa y bolso compacto. Ideal para fotografía de viajes, retratos y contenido para redes.',
    region: 'Región Metropolitana',
    comuna: 'Las Condes',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.CAMILA,
    sellerName: 'Camila Torres',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    status: 'PUBLISHED',
    condition: 'Usado'
  },
  {
    id: 'e39f1994-c0f7-41b2-8bb6-fccf861270de',
    title: 'Monitor LG UltraWide 29 pulgadas',
    price: 210000,
    description: 'Monitor LG UltraWide de 29 pulgadas, resolución 2560x1080, panel IPS y entrada HDMI. Muy cómodo para trabajar con varias ventanas o editar contenido.',
    region: 'Región Metropolitana',
    comuna: 'Santiago',
    images: [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.TOMAS,
    sellerName: 'Matías Rojas',
    sellerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    status: 'PUBLISHED',
    condition: 'Usado'
  },
  {
    id: '3eea6e4e-b119-426a-9c40-5828bca3e688',
    title: 'Set de comedor nórdico 4 sillas',
    price: 260000,
    description: 'Mesa redonda de estilo nórdico con cuatro sillas tapizadas. Buen estado general, firme y lista para uso diario en departamento o comedor pequeño.',
    region: 'Región de Valparaíso',
    comuna: 'Valparaíso',
    images: [
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.IGNACIA,
    sellerName: 'Fernanda López',
    sellerAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    status: 'PUBLISHED',
    condition: 'Usado'
  },
  {
    id: '811f36db-ae54-4d3d-9f46-6013232e87cd',
    title: 'Audífonos Sony WH-1000XM4',
    price: 190000,
    description: 'Audífonos inalámbricos con cancelación de ruido activa. Incluye estuche, cable de carga y cable auxiliar. Batería en excelente estado.',
    region: 'Región de Coquimbo',
    comuna: 'La Serena',
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.SEBASTIAN,
    sellerName: 'Ignacia Pizarro',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    status: 'PUBLISHED',
    condition: 'Usado'
  },
  {
    id: '8121e705-62b8-488b-bb2b-b52a5dc3fd59',
    title: 'Notebook Lenovo IdeaPad Ryzen 5',
    price: 450000,
    description: 'Notebook Lenovo IdeaPad con procesador Ryzen 5, 16GB RAM y SSD de 512GB. Equipo rápido para estudios, oficina y navegación intensiva.',
    region: 'Región de Ñuble',
    comuna: 'Chillán',
    images: [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.CATALINA,
    sellerName: 'Tomás Herrera',
    sellerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    status: 'PUBLISHED',
    condition: 'Nuevo'
  },
  {
    id: '57c5f5d5-87fa-4c16-b43a-e7ef198749b3',
    title: 'Coche bebé compacto plegable',
    price: 115000,
    description: 'Coche de bebé liviano, plegable y fácil de transportar. Incluye capota, canasto inferior y freno trasero. Tapiz limpio y sin roturas.',
    region: 'Región del Biobío',
    comuna: 'Concepción',
    images: [
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.FRANCISCO,
    sellerName: 'Daniela Fuentes',
    sellerAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 42).toISOString(),
    status: 'PUBLISHED',
    condition: 'Usado'
  },
  {
    id: '9f8af67a-f5da-4ff0-8dbd-a6a0908d248c',
    title: 'Parlante JBL Charge 5 azul',
    price: 125000,
    description: 'Parlante Bluetooth resistente al agua, sonido potente y batería de larga duración. Se entrega con cable USB-C y caja original.',
    region: 'Región de la Araucanía',
    comuna: 'Temuco',
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.JAVIERA,
    sellerName: 'Sebastián Vidal',
    sellerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 50).toISOString(),
    status: 'PUBLISHED',
    condition: 'Nuevo'
  },
  {
    id: '2c74fda6-aa0b-4d0e-a615-058965c8c825',
    title: 'Mochila The North Face Borealis',
    price: 68000,
    description: 'Mochila urbana de 28 litros con compartimento para notebook, bolsillos laterales y espalda acolchada. Perfecta para universidad o trabajo.',
    region: 'Región de Los Ríos',
    comuna: 'Valdivia',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.BENJAMIN,
    sellerName: 'Antonia Salgado',
    sellerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    status: 'PUBLISHED',
    condition: 'Usado'
  },
  {
    id: 'c7496e35-47cf-4303-86f2-c2b32543fa50',
    title: 'Aspiradora robot Xiaomi Mi Robot',
    price: 175000,
    description: 'Aspiradora robot Xiaomi con mapeo inteligente, app móvil y base de carga. Funciona correctamente y se entrega con repuestos de filtro.',
    region: 'Región de Los Lagos',
    comuna: 'Puerto Montt',
    images: [
      'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.ANTONIA,
    sellerName: 'Javiera Contreras',
    sellerAvatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 68).toISOString(),
    status: 'PUBLISHED',
    condition: 'Usado'
  },
  {
    id: '08fe2041-15e7-41a7-8e77-9dab7b97669b',
    title: 'Patines Rollerblade Zetrablade talla 42',
    price: 95000,
    description: 'Patines recreativos Rollerblade talla 42, ruedas en buen estado y botín cómodo. Ideales para retomar actividad física al aire libre.',
    region: 'Región de Tarapacá',
    comuna: 'Iquique',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800'
    ],
    seller: MOCK_USER_IDS.NICOLAS,
    sellerName: 'Cristóbal Medina',
    sellerAvatar: 'https://images.unsplash.com/photo-1530268729831-4b0b9e170218?auto=format&fit=crop&q=80&w=200',
    createdAt: new Date(Date.now() - 3600000 * 80).toISOString(),
    status: 'PUBLISHED',
    condition: 'Usado'
  }
];

function createPostId() {
  return crypto.randomUUID();
}

function hydrateInitialPosts() {
  const storedPosts = JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
  const hydratedPosts = [...storedPosts];

  INITIAL_POSTS.forEach((seedPost) => {
    const index = hydratedPosts.findIndex(post => post.id === seedPost.id);

    if (index === -1) {
      hydratedPosts.push(seedPost);
      return;
    }

    hydratedPosts[index] = seedPost;
  });

  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(hydratedPosts));
}

if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(INITIAL_POSTS));
} else {
  hydrateInitialPosts();
}

function getPostsFromStorage() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS) || '[]');
}

function savePostsToStorage(posts) {
  localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
}

function getDraftsFromStorage() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.DRAFTS) || '[]');
}

function saveDraftsToStorage(drafts) {
  localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function mockGetPosts(filters = {}) {

  filterSchema.parse(filters);

  await delay(400);
  const posts = getPostsFromStorage();

  const normalizedPosts = posts.map(post => {
    if (!post.condition) {
      post.condition = 'Nuevo';
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

    if (filters.seller) {
      if (post.seller !== filters.seller) return false;
    }

    return true;
  });
}

export async function mockGetPostById(id) {
  await delay(300);
  const posts = getPostsFromStorage();
  const post = posts.find(p => p.id === id);
  if (!post) {
    throw new Error('Publicación no encontrada');
  }
  if (!post.condition) {
    post.condition = 'Nuevo';
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
    id: createPostId(),
    title: postData.title,
    price: Number(postData.price),
    description: postData.description,
    region: postData.region,
    comuna: postData.comuna,
    images: postData.images,
    seller: currentUser.id,
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

export async function mockCreateDraft(currentUser) {
  if (!currentUser) {
    throw new Error('Debe iniciar sesión para crear un borrador');
  }

  await delay(500);

  const drafts = getDraftsFromStorage();

  if (drafts.length >= FREE_ACCOUNT_LIMITS.MAX_DRAFTS) {
    throw new Error(`La cuenta gratuita permite hasta ${FREE_ACCOUNT_LIMITS.MAX_DRAFTS} borradores. Elimina uno antes de crear otra publicación.`);
  }

  const newDraft = {
    id: `draft-${Math.random().toString(36).substring(2, 9)}`,
    title: '',
    price: 0,
    description: '',
    region: '',
    comuna: '',
    images: [],
    status: 'DRAFT',
    seller: currentUser.id,
    createdAt: new Date().toISOString()
  };

  saveDraftsToStorage([newDraft, ...drafts]);

  return newDraft;
}

export async function mockUpdatePost(id, postData, currentUser) {
  postSchema.parse(postData);

  if (!currentUser) {
    throw new Error('Debe iniciar sesión para editar una publicación');
  }

  await delay(600);

  const posts = getPostsFromStorage();
  const index = posts.findIndex(post => post.id === id);

  if (index === -1) {
    throw new Error('Publicación no encontrada');
  }

  if (posts[index].seller !== currentUser.id) {
    throw new Error('No tienes permisos para editar esta publicación');
  }

  posts[index] = {
    ...posts[index],
    title: postData.title,
    price: Number(postData.price),
    description: postData.description,
    region: postData.region,
    comuna: postData.comuna,
    images: postData.images,
    condition: postData.condition || posts[index].condition || 'Nuevo',
    updatedAt: new Date().toISOString()
  };

  savePostsToStorage(posts);

  return posts[index];
}

export async function mockGetPostsBySeller(seller) {
  await delay(300);
  const posts = getPostsFromStorage();
  return posts.filter(post => post.seller === seller).map(post => {
    if (!post.condition) {
      post.condition = 'Nuevo';
    }
    return post;
  });
}

export async function mockGetPublicProfile(profileId) {
  await delay(300);
  const posts = getPostsFromStorage().filter(post => post.seller === profileId);
  const activePosts = posts.filter(post => post.status === 'PUBLISHED');
  const referencePost = posts[0];
  const profileBio = {
    [MOCK_USER_IDS.DIEGO]: 'Publico artículos cuidados y respondo rápido para coordinar sin vueltas.',
    [MOCK_USER_IDS.RODRIGO]: 'Vendo barato y seguro. Prefiero coordinar entregas claras y en lugares cómodos.',
    [MOCK_USER_IDS.PAULA]: 'Me gusta vender cosas útiles, bien cuidadas y con información transparente.',
    [MOCK_USER_IDS.VALENTINA]: 'Publico productos de tecnología y hogar en buen estado.',
    [MOCK_USER_IDS.MARTIN]: 'Vendo artículos seleccionados, limpios y listos para usar.',
    [MOCK_USER_IDS.CAMILA]: 'Siempre intento responder con detalle y coordinar de forma simple.',
    [MOCK_USER_IDS.TOMAS]: 'Publico ofertas puntuales y prefiero tratos rápidos, claros y seguros.',
    [MOCK_USER_IDS.IGNACIA]: 'Vendo cosas de casa en buen estado, con fotos reales y precio justo.',
    [MOCK_USER_IDS.SEBASTIAN]: 'Me interesa que cada venta sea clara desde el primer mensaje.',
    [MOCK_USER_IDS.CATALINA]: 'Publico productos que todavía tienen mucha vida útil.',
    [MOCK_USER_IDS.FRANCISCO]: 'Vendo artículos usados bien cuidados y con entrega coordinada.',
    [MOCK_USER_IDS.JAVIERA]: 'Me gusta mantener publicaciones simples, honestas y actualizadas.',
    [MOCK_USER_IDS.BENJAMIN]: 'Publico cosas prácticas para uso diario y respondo consultas con calma.',
    [MOCK_USER_IDS.ANTONIA]: 'Vendo productos en buen estado y coordino entregas de forma ordenada.',
    [MOCK_USER_IDS.NICOLAS]: 'Publico artículos deportivos y de uso personal con precios conversables.'
  };
  const profileReviews = [
    {
      id: 'review-1',
      author: 'María José',
      rating: 5,
      date: '2026-06-10T12:00:00.000Z',
      comment: 'Respondió rápido y el producto estaba tal como se veía en las fotos.'
    },
    {
      id: 'review-2',
      author: 'Felipe R.',
      rating: 5,
      date: '2026-05-28T12:00:00.000Z',
      comment: 'Buena coordinación para la entrega, todo claro desde el primer mensaje.'
    },
    {
      id: 'review-3',
      author: 'Camila T.',
      rating: 4,
      date: '2026-05-02T12:00:00.000Z',
      comment: 'El artículo estaba en buen estado y el precio fue justo.'
    }
  ];

  if (!referencePost) {
    throw new Error('Perfil no encontrado');
  }

  return {
    profile: {
      id: profileId,
      name: referencePost.sellerName,
      avatarUrl: referencePost.sellerAvatar,
      reviewScore: 4.8,
      reviewCount: 37,
      reviewSummary: [
        { rating: 5, count: 30 },
        { rating: 4, count: 5 },
        { rating: 3, count: 1 },
        { rating: 2, count: 1 },
        { rating: 1, count: 0 }
      ],
      reviews: profileReviews,
      joinedAt: '2024-05-12T12:00:00.000Z',
      bio: profileBio[profileId] || 'Publico artículos con información clara y coordinación directa.'
    },
    posts: activePosts
  };
}

export async function mockUpdatePostStatus(id, status) {
  await delay(400);
  const posts = getPostsFromStorage();
  const index = posts.findIndex(p => p.id === id);
  if (index === -1) {
    throw new Error('Publicación no encontrada');
  }
  posts[index].status = status;
  savePostsToStorage(posts);
  return posts[index];
}
