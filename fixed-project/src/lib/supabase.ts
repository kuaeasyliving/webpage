import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

// Singleton — una sola instancia en toda la app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─────────────────────────────────────────────────────────
// INTERFACES
// ─────────────────────────────────────────────────────────

export interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  photo_url: string | null;
  position: string | null;
  username: string | null;
  password_hash: string | null;
  role: 'Administrador' | 'Agente externo' | 'Editor';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string | null;
  operation: string;
  type: string;
  price: number;
  currency: string;
  country: string | null;
  department: string | null;
  city: string | null;
  neighborhood: string | null;
  images: string[];
  status: 'Publicado' | 'Destacado' | 'Borrador' | 'Vendido' | 'Arrendado';
  bedrooms: number;
  bathrooms: number;
  parking: number;
  area_built: number;
  area_private: number;
  features_internal: string[];
  features_external: string[];
  description: string | null;
  agent: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Representa una imagen almacenada en property_images.
 * path = ruta en Storage: properties-media/{property_id}/cover.jpg
 *                         properties-media/{property_id}/gallery/img1.jpg
 */
export interface PropertyImage {
  id: string;
  property_id: string;
  path: string;
  url: string;
  type: 'cover' | 'gallery';
  sort_order: number;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  created_at: string;
}

export interface PropertyComment {
  id: string;
  property_id: string;
  agent_id: string;
  comment: string;
  tag: string | null;
  created_at: string;
  updated_at: string;
  agent?: Agent;
}

// ─────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────

/** Campos mínimos para listados públicos — evita traer datos innecesarios */
export const PROPERTY_LIST_FIELDS = [
  'id', 'title', 'slug', 'operation', 'type',
  'price', 'currency', 'city', 'neighborhood', 'department',
  'images', 'status', 'bedrooms', 'bathrooms', 'parking',
  'area_built', 'area_private',
].join(',');

/** Campos completos para detalle de propiedad */
export const PROPERTY_DETAIL_FIELDS = '*';
