import { useState, useEffect } from 'react';
import { supabase, Agent } from '../lib/supabase';

export const useAgents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const createAgent = async (agentData: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    position: string;
    username: string;
    password: string;
    role: 'Agente externo' | 'Editor';
    is_active: boolean;
    photo_url?: string | null;
  }) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .insert([{
          first_name: agentData.first_name,
          last_name: agentData.last_name,
          phone: agentData.phone,
          email: agentData.email,
          position: agentData.position,
          username: agentData.username,
          password_hash: agentData.password,
          role: agentData.role,
          is_active: agentData.is_active,
          photo_url: agentData.photo_url || null
        }])
        .select()
        .single();

      if (error) throw error;
      await fetchAgents();
      return { success: true, data };
    } catch (error: any) {
      console.error('Error creating agent:', error);
      return { success: false, error: error.message };
    }
  };

  const updateAgent = async (id: string, agentData: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    position?: string;
    username?: string;
    password?: string;
    role?: 'Administrador' | 'Agente externo' | 'Editor';
    is_active?: boolean;
    photo_url?: string | null;
  }) => {
    try {
      const updateData: any = { ...agentData };
      
      // Si se proporciona password, actualizar password_hash
      if (agentData.password) {
        updateData.password_hash = agentData.password;
        delete updateData.password;
      }

      const { data, error } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchAgents();
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating agent:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchAgents();
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting agent:', error);
      return { success: false, error: error.message };
    }
  };

  const updateAgentStatus = async (id: string, is_active: boolean) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchAgents();
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating agent status:', error);
      return { success: false, error: error.message };
    }
  };

  const validateAgentCredentials = async (username: string, password: string) => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('username', username)
        .eq('password_hash', password)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        return { success: false, error: 'Credenciales inválidas o usuario inactivo' };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error validating credentials:', error);
      return { success: false, error: error.message };
    }
  };

  const uploadAgentPhoto = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `agents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('agent-photos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('[Storage] Error subiendo foto de agente:', uploadError);
      throw new Error(`No se pudo subir la foto: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('agent-photos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const deleteAgentPhoto = async (photoUrl: string): Promise<void> => {
    try {
      // Extraer el path del archivo desde la URL pública
      const marker = '/agent-photos/';
      const markerIndex = photoUrl.indexOf(marker);
      if (markerIndex === -1) return;

      const filePath = photoUrl.substring(markerIndex + marker.length);

      const { error } = await supabase.storage
        .from('agent-photos')
        .remove([filePath]);

      if (error) {
        console.warn('[Storage] No se pudo eliminar foto del agente:', error.message);
      }
    } catch (err) {
      console.warn('[Storage] Error en deleteAgentPhoto:', err);
    }
  };

  return {
    agents,
    loading,
    fetchAgents,
    createAgent,
    updateAgent,
    deleteAgent,
    updateAgentStatus,
    validateAgentCredentials,
    uploadAgentPhoto,
    deleteAgentPhoto
  };
};