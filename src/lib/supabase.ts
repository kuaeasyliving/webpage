import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Agent {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  title: string;
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