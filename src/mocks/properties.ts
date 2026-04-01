
export interface AdminProperty {
  id: number;
  title: string;
  operation: string;
  type: string;
  price: number;
  currency: string;
  location: {
    country: string;
    department: string;
    city: string;
    neighborhood: string;
  };
  image: string;
  status: 'Publicado' | 'Destacado' | 'Borrador' | 'Vendido';
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area: {
    built: number;
    private: number;
  };
  features: {
    internal: string[];
    external: string[];
  };
  agent: string;
  createdAt: string;
}

export const adminProperties: AdminProperty[] = [
  {
    id: 1,
    title: 'Apartamento Moderno en Condina',
    operation: 'Venta',
    type: 'Apartamento',
    price: 450000000,
    currency: 'COP',
    location: {
      country: 'Colombia',
      department: 'Risaralda',
      city: 'Pereira',
      neighborhood: 'Condina'
    },
    image:
      'https://readdy.ai/api/search-image?query=Modern%20luxury%20apartment%20exterior%20building%20facade%20with%20contemporary%20architecture%2C%20glass%20balconies%2C%20elegant%20residential%20tower%2C%20neutral%20beige%20and%20white%20colors%2C%20simple%20clean%20background%2C%20professional%20real%20estate%20photography%2C%20natural%20daylight%2C%20urban%20residential%20development&width=800&height=600&seq=admin1&orientation=landscape',
    status: 'Publicado',
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    area: {
      built: 95,
      private: 85
    },
    features: {
      internal: ['Balcón', 'Cocina integral', 'Aire acondicionado', 'Closets'],
      external: ['Ascensor', 'Piscina', 'Gimnasio', 'Vigilancia 24/7']
    },
    agent: 'María González',
    createdAt: '2025-01-15'
  },
  {
    id: 2,
    title: 'Casa Campestre en Santa Rosa',
    operation: 'Venta',
    type: 'Casa',
    price: 850000000,
    currency: 'COP',
    location: {
      country: 'Colombia',
      department: 'Risaralda',
      city: 'Santa Rosa de Cabal',
      neighborhood: 'Vereda La Estrella'
    },
    image:
      'https://readdy.ai/api/search-image?query=Beautiful%20country%20house%20exterior%20with%20mountain%20views%2C%20modern%20rural%20architecture%2C%20spacious%20property%20with%20gardens%2C%20warm%20earth%20tones%20and%20natural%20materials%2C%20simple%20clean%20background%2C%20professional%20real%20estate%20photography%20%2C%20natural%20daylight%2C%20peaceful%20countryside%20setting&width=800&height=600&seq=admin2&orientation=landscape',
    status: 'Destacado',
    bedrooms: 4,
    bathrooms: 3,
    parking: 3,
    area: {
      built: 280,
      private: 250
    },
    features: {
      internal: ['Chimenea', 'Cocina integral', 'Estudio', 'Zona de lavandería'],
      external: ['Jardín privado', 'BBQ', 'Piscina', 'Zona verde amplia']
    },
    agent: 'Carlos Ramírez',
    createdAt: '2025-01-10'
  },
  {
    id: 3,
    title: 'Lote Urbano en Dosquebradas',
    operation: 'Venta',
    type: 'Lote',
    price: 180000000,
    currency: 'COP',
    location: {
      country: 'Colombia',
      department: 'Risaralda',
      city: 'Dosquebradas',
      neighborhood: 'La Badea'
    },
    image:
      'https://readdy.ai/api/search-image?query=Urban%20residential%20lot%20ready%20for%20construction%2C%20flat%20terrain%20with%20city%20infrastructure%2C%20development%20potential%2C%20neutral%20earth%20tones%2C%20simple%20clean%20background%2C%20professional%20real%20estate%20photography%2C%20clear%20daylight%2C%20urban%20planning%20perspective&width=800&height=600&seq=admin3&orientation=landscape',
    status: 'Publicado',
    bedrooms: 0,
    bathrooms: 0,
    parking: 0,
    area: {
      built: 0,
      private: 350
    },
    features: {
      internal: [],
      external: ['Servicios públicos', 'Vía pavimentada', 'Zona residencial']
    },
    agent: 'Ana Martínez',
    createdAt: '2025-01-12'
  },
  {
    id: 4,
    title: 'Apartamento en Arriendo Centro',
    operation: 'Arriendo Tradicional',
    type: 'Apartamento',
    price: 1800000,
    currency: 'COP',
    location: {
      country: 'Colombia',
      department: 'Risaralda',
      city: 'Pereira',
      neighborhood: 'Centro'
    },
    image:
      'https://readdy.ai/api/search-image?query=Downtown%20apartment%20building%20exterior%20with%20urban%20location%2C%20modern%20residential%20architecture%20%2C%20convenient%20city%20center%20access%2C%20neutral%20gray%20and%20beige%20tones%2C%20simple%20clean%20background%2C%20professional%20real%20estate%20photography%20%2C%20natural%20daylight%2C%20metropolitan%20living&width=800&height=600&seq=admin4&orientation=landscape',
    status: 'Publicado',
    bedrooms: 2,
    bathrooms: 1,
    parking: 1,
    area: {
      built: 65,
      private: 58
    },
    features: {
      internal: ['Cocina integral', 'Closets', 'Zona de lavandería'],
      external: ['Portería', 'Ascensor', 'Vigilancia']
    },
    agent: 'Luis Fernández',
    createdAt: '2025-01-18'
  },
  {
    id: 5,
    title: 'Local Comercial Avenida Principal',
    operation: 'Arriendo Tradicional',
    type: 'Local',
    price: 3500000,
    currency: 'COP',
    location: {
      country: 'Colombia',
      department: 'Risaralda',
      city: 'Pereira',
      neighborhood: 'Circunvalar'
    },
    image:
      'https://readdy.ai/api/search-image?query=Commercial%20retail%20space%20storefront%20on%20main%20avenue%2C%20modern%20business%20location%2C%20large%20display%20windows%2C%20professional%20commercial%20architecture%20%2C%20neutral%20colors%20with%20glass%20facade%2C%20simple%20clean%20background%2C%20real%20estate%20photography%2C%20bright%20daylight%2C%20high%20traffic%20area&width=800&height=600&seq=admin5&orientation=landscape',
    status: 'Publicado',
    bedrooms: 0,
    bathrooms: 2,
    parking: 2,
    area: {
      built: 120,
      private: 115
    },
    features: {
      internal: ['Aire acondicionado', 'Baños privados', 'Depósito'],
      external: ['Parqueadero visitantes', 'Zona comercial', 'Transporte público']
    },
    agent: 'Patricia Gómez',
    createdAt: '2025-01-08'
  },
  {
    id: 6,
    title: 'Penthouse Exclusivo Pinares',
    operation: 'Venta',
    type: 'Apartamento',
    price: 1200000000,
    currency: 'COP',
    location: {
      country: 'Colombia',
      department: 'Risaralda',
      city: 'Pereira',
      neighborhood: 'Pinares'
    },
    image:
      'https://readdy.ai/api/search-image?query=Exclusive%20penthouse%20luxury%20building%20exterior%20with%20premium%20architecture%2C%20high-rise%20residential%20tower%2C%20sophisticated%20design%2C%20elegant%20neutral%20tones%20with%20modern%20glass%20elements%2C%20simple%20clean%20background%2C%20professional%20real%20estate%20photography%20%2C%20natural%20daylight%2C%20upscale%20urban%20living&width=800&height=600&seq=admin6&orientation=landscape',
    status: 'Destacado',
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    area: {
      built: 220,
      private: 200
    },
    features: {
      internal: ['Terraza privada', 'Jacuzzi', 'Cocina gourmet', 'Walk-in closet', 'Estudio'],
      external: ['Ascensor privado', 'Piscina', 'Gimnasio', 'Salón social', 'Vigilancia 24/7']
    },
    agent: 'Roberto Silva',
    createdAt: '2025-01-05'
  },
  {
    id: 7,
    title: 'Apartaestudio Renta Corta',
    operation: 'Arriendo Renta Corta',
    type: 'Apartamento',
    price: 150000,
    currency: 'COP',
    location: {
      country: 'Colombia',
      department: 'Risaralda',
      city: 'Pereira',
      neighborhood: 'Cuba'
    },
    image:
      'https://readdy.ai/api/search-image?query=Modern%20studio%20apartment%20building%20exterior%20for%20short-term%20rental%2C%20contemporary%20residential%20architecture%2C%20compact%20efficient%20design%2C%20neutral%20beige%20and%20white%20colors%2C%20simple%20clean%20background%2C%20professional%20real%20estate%20photography%20%2C%20natural%20daylight%2C%20urban%20convenience&width=800&height=600&seq=admin7&orientation=landscape',
    status: 'Publicado',
    bedrooms: 1,
    bathrooms: 1,
    parking: 1,
    area: {
      built: 45,
      private: 42
    },
    features: {
      internal: ['Cocina integral', 'Aire acondicionado', 'WiFi', 'Amoblado'],
      external: ['Portería', 'Ascensor', 'Zona de parqueadero']
    },
    agent: 'Sandra López',
    createdAt: '2025-01-20'
  },
  {
    id: 8,
    title: 'Casa en Construcción La Julita',
    operation: 'Venta',
    type: 'Casa',
    price: 320000000,
    currency: 'COP',
    location: {
      country: 'Colombia',
      department: 'Risaralda',
      city: 'Pereira',
      neighborhood: 'La Julita'
    },
    image:
      'https://readdy.ai/api/search-image?query=House%20under%20construction%20residential%20development%2C%20modern%20home%20architecture%20in%20progress%2C%20new%20construction%20site%2C%20neutral%20concrete%20and%20earth%20tones%2C%20simple%20clean%20background%2C%20professional%20real%20estate%20photography%20%2C%20natural%20daylight%2C%20future%20family%20home&width=800&height=600&seq=admin8&orientation=landscape',
    status: 'Borrador',
    bedrooms: 3,
    bathrooms: 2,
    parking: 2,
    area: {
      built: 140,
      private: 130
    },
    features: {
      internal: ['Cocina integral', 'Closets', 'Zona de lavandería'],
      external: ['Patio', 'Garaje cubierto', 'Antejardín']
    },
    agent: 'Diego Torres',
    createdAt: '2025-01-22'
  },
  {
    id: 9,
    title: 'Bodega Industrial Zona Franca',
    operation: 'Arriendo Tradicional',
    type: 'Bodega',
    price: 8500000,
    currency: 'COP',
    location: {
      country: 'Colombia',
      department: 'Risaralda',
      city: 'Dosquebradas',
      neighborhood: 'Zona Industrial'
    },
    image:
      'https://readdy.ai/api/search-image?query=Industrial%20warehouse%20exterior%20in%20free%20trade%20zone%2C%20modern%20commercial%20storage%20facility%2C%20large%20loading%20docks%2C%20neutral%20gray%20and%20metal%20tones%2C%20simple%20clean%20background%2C%20professional%20real%20estate%20photography%20%2C%20clear%20daylight%2C%20logistics%20infrastructure&width=800&height=600&seq=admin9&orientation=landscape',
    status: 'Publicado',
    bedrooms: 0,
    bathrooms: 2,
    parking: 5,
    area: {
      built: 850,
      private: 850
    },
    features: {
      internal: ['Oficina administrativa', 'Baños', 'Zona de carga'],
      external: ['Muelle de carga', 'Patio de maniobras', 'Vigilancia', 'Cerca perimetral']
    },
    agent: 'Andrés Mejía',
    createdAt: '2025-01-14'
  },
  {
    id: 10,
    title: 'Apartamento Vendido Álamos',
    operation: 'Venta',
    type: 'Apartamento',
    price: 380000000,
    currency: 'COP',
    location: {
      country: 'Colombia',
      department: 'Risaralda',
      city: 'Pereira',
      neighborhood: 'Álamos'
    },
    image:
      'https://readdy.ai/api/search-image?query=Residential%20apartment%20building%20exterior%20in%20established%20neighborhood%2C%20modern%20family-friendly%20architecture%20%2C%20well-maintained%20property%2C%20neutral%20warm%20tones%20%2C%20simple%20clean%20background%2C%20professional%20real%20estate%20photography%20%2C%20natural%20daylight%2C%20comfortable%20urban%20living&width=800&height=600&seq=admin10&orientation=landscape',
    status: 'Vendido',
    bedrooms: 3,
    bathrooms: 2,
    parking: 1,
    area: {
      built: 88,
      private: 78
    },
    features: {
      internal: ['Balcón', 'Cocina integral', 'Closets'],
      external: ['Ascensor', 'Portería', 'Zona social', 'Parque infantil']
    },
    agent: 'María González',
    createdAt: '2025-01-03'
  }
];

// Solo propiedades activas (Publicado o Destacado) para mostrar en la web pública
export const activeProperties = adminProperties.filter(
  (p) => p.status === 'Publicado' || p.status === 'Destacado'
);

// Propiedades destacadas
export const featuredProperties = adminProperties.filter(
  (p) => p.status === 'Destacado'
);

// Formatear precio en COP
export const formatPriceCOP = (price: number): string => {
  if (price >= 1000000000) {
    return `$${(price / 1000000000).toFixed(1)} Mil M`;
  }
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  // Añadimos una verificación de tipo para evitar posibles errores en tiempo de ejecución
  if (typeof price !== 'number' || isNaN(price)) {
    console.error('Invalid price value:', price);
    return '$0';
  }
  return `$${price.toLocaleString('es-CO')}`;
};
