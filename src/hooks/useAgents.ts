import { useState, useEffect } from 'react';
import { supabase, Agent } from '../lib/supabase';

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setAgents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar agentes');
      console.error('Error fetching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  return { agents, loading, error, refetch: fetchAgents };
};

export const uploadAgentPhoto = async (file: File): Promise<string> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('agent-photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('agent-photos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading agent photo:', error);
    throw error;
  }
};

export const createAgent = async (agentData: {
  first_name: string;
  last_name: string;
  phone: string;
  photo_url?: string | null;
}): Promise<Agent> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .insert([{
        ...agentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating agent:', error);
    throw error;
  }
};

export const updateAgent = async (
  id: string,
  agentData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    photo_url?: string | null;
  }
): Promise<Agent> => {
  try {
    const { data, error } = await supabase
      .from('agents')
      .update({
        ...agentData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error updating agent:', error);
    throw error;
  }
};

export const deleteAgent = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting agent:', error);
    throw error;
  }
};

export const deleteAgentPhoto = async (photoUrl: string): Promise<void> => {
  try {
    const fileName = photoUrl.split('/').pop();
    if (!fileName) return;

    const { error } = await supabase.storage
      .from('agent-photos')
      .remove([fileName]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting agent photo:', error);
    throw error;
  }
};