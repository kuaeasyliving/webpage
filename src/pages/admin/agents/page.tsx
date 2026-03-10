import { useState } from 'react';
import { useAgents } from '../../../hooks/useAgents';
import { Agent } from '../../../lib/supabase';
import { isAdmin } from '../../../utils/auth';

export default function AgentsPage() {
  const {
    agents,
    loading,
    fetchAgents: refetch,
    createAgent,
    updateAgent,
    deleteAgent,
    updateAgentStatus,
    uploadAgentPhoto,
    deleteAgentPhoto,
  } = useAgents();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [deletingAgent, setDeletingAgent] = useState<Agent | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    position: '',
    role: 'Agente externo' as 'Administrador' | 'Agente externo' | 'Editor',
    is_active: true,
    photo_url: null as string | null,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (agent?: Agent) => {
    if (agent) {
      setEditingAgent(agent);
      setFormData({
        username: agent.username || '',
        password: '',
        first_name: agent.first_name,
        last_name: agent.last_name,
        phone: agent.phone,
        email: agent.email || '',
        position: agent.position || '',
        role: agent.role as 'Administrador' | 'Agente externo' | 'Editor',
        is_active: agent.is_active ?? true,
        photo_url: agent.photo_url,
      });
      setPhotoPreview(agent.photo_url);
    } else {
      setEditingAgent(null);
      setFormData({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        position: '',
        role: 'Agente externo',
        is_active: true,
        photo_url: null,
      });
      setPhotoPreview(null);
    }
    setPhotoFile(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAgent(null);
    setFormData({
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      position: '',
      role: 'Agente externo',
      is_active: true,
      photo_url: null,
    });
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name || !formData.last_name || !formData.phone || !formData.username || !formData.position) {
      showToast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    if (!editingAgent && !formData.password) {
      showToast('La contraseña es obligatoria al crear un agente', 'error');
      return;
    }

    if (formData.username.length < 3) {
      showToast('El usuario debe tener al menos 3 caracteres', 'error');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    // Validar que no se elimine el último administrador
    if (editingAgent && editingAgent.role === 'Administrador' && formData.role !== 'Administrador') {
      const adminCount = agents.filter(a => a.role === 'Administrador').length;
      if (adminCount <= 1) {
        showToast('No se puede quitar el rol de administrador. Debe existir al menos un administrador en el sistema', 'error');
        return;
      }
    }

    setSaving(true);

    try {
      let photoUrl = formData.photo_url;

      if (photoFile) {
        photoUrl = await uploadAgentPhoto(photoFile);
        
        if (editingAgent?.photo_url) {
          await deleteAgentPhoto(editingAgent.photo_url);
        }
      }

      const agentData = {
        username: formData.username,
        password: formData.password || undefined,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        email: formData.email || undefined,
        position: formData.position,
        role: formData.role,
        is_active: formData.is_active,
        photo_url: photoUrl,
      };

      if (editingAgent) {
        await updateAgent(editingAgent.id, agentData);
        showToast('Agente actualizado exitosamente', 'success');
      } else {
        await createAgent(agentData);
        showToast('Agente creado exitosamente', 'success');
      }

      handleCloseModal();
      refetch();
    } catch (error) {
      console.error('Error saving agent:', error);
      if (error instanceof Error && error.message.includes('duplicate')) {
        showToast('El nombre de usuario ya existe', 'error');
      } else {
        showToast('Error al guardar el agente', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (agent: Agent) => {
    // Validar que no se elimine el último administrador
    if (agent.role === 'Administrador') {
      const adminCount = agents.filter(a => a.role === 'Administrador').length;
      if (adminCount <= 1) {
        showToast('No se puede eliminar al único administrador del sistema', 'error');
        return;
      }
    }
    setDeletingAgent(agent);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAgent) return;

    setSaving(true);

    try {
      if (deletingAgent.photo_url) {
        await deleteAgentPhoto(deletingAgent.photo_url);
      }

      await deleteAgent(deletingAgent.id);
      showToast('Agente eliminado exitosamente', 'success');
      setShowDeleteModal(false);
      setDeletingAgent(null);
      refetch();
    } catch (error) {
      console.error('Error deleting agent:', error);
      showToast('Error al eliminar el agente', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (agent: Agent) => {
    // Validar que no se desactive el último administrador
    if (agent.role === 'Administrador' && agent.is_active) {
      const activeAdminCount = agents.filter(a => a.role === 'Administrador' && a.is_active).length;
      if (activeAdminCount <= 1) {
        showToast('No se puede desactivar al único administrador activo del sistema', 'error');
        return;
      }
    }

    try {
      await updateAgentStatus(agent.id, !agent.is_active);
      showToast(`Agente ${!agent.is_active ? 'activado' : 'desactivado'} exitosamente`, 'success');
      refetch();
    } catch (error) {
      console.error('Error updating agent status:', error);
      showToast('Error al actualizar el estado del agente', 'error');
    }
  };

  const filteredAgents = agents.filter(agent => {
    const matchesRole = filterRole === 'all' || agent.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && agent.is_active) || 
      (filterStatus === 'inactive' && !agent.is_active);
    const matchesSearch = searchQuery === '' || 
      agent.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.username && agent.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (agent.position && agent.position.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesRole && matchesStatus && matchesSearch;
  });

  const stats = {
    total: agents.length,
    admins: agents.filter(a => a.role === 'Administrador').length,
    external: agents.filter(a => a.role === 'Agente externo').length,
    editors: agents.filter(a => a.role === 'Editor').length,
    active: agents.filter(a => a.is_active).length,
  };

  const adminUser = isAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Agentes</h1>
            <p className="text-sm text-gray-600 mt-1">Administra los agentes y sus accesos al sistema</p>
          </div>
          {adminUser && (
            <button
              onClick={() => handleOpenModal()}
              className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <i className="ri-add-line text-lg"></i>
              Agregar Agente
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <i className="ri-team-line text-2xl text-teal-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.admins}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="ri-shield-star-line text-2xl text-orange-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Agentes Externos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.external}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-user-star-line text-2xl text-blue-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Editores</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.editors}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-edit-box-line text-2xl text-green-600"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-2xl text-emerald-600"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nombre, usuario o cargo..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Rol</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              >
                <option value="all">Todos los roles</option>
                <option value="Administrador">Administrador</option>
                <option value="Agente externo">Agente externo</option>
                <option value="Editor">Editor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrar por Estado</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-user-line text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery || filterRole !== 'all' || filterStatus !== 'all' 
                ? 'No se encontraron agentes' 
                : 'No hay agentes registrados'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterRole !== 'all' || filterStatus !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer agente'}
            </p>
            {adminUser && !searchQuery && filterRole === 'all' && filterStatus === 'all' && (
              <button
                onClick={() => handleOpenModal()}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center gap-2 whitespace-nowrap"
              >
                <i className="ri-add-line text-lg"></i>
                Agregar Primer Agente
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <div key={agent.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0 relative">
                      {agent.photo_url ? (
                        <img
                          src={agent.photo_url}
                          alt={`${agent.first_name} ${agent.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="ri-user-line text-3xl text-gray-400"></i>
                        </div>
                      )}
                      {!agent.is_active && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">Inactivo</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {agent.first_name} {agent.last_name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          agent.role === 'Administrador' 
                            ? 'bg-orange-100 text-orange-700'
                            : agent.role === 'Agente externo'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {agent.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <i className="ri-user-line text-sm w-4"></i>
                      <span className="text-sm truncate">{agent.username || 'Sin usuario'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <i className="ri-briefcase-line text-sm w-4"></i>
                      <span className="text-sm truncate">{agent.position || 'Sin cargo'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <i className="ri-phone-line text-sm w-4"></i>
                      <span className="text-sm">{agent.phone}</span>
                    </div>
                    {agent.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <i className="ri-mail-line text-sm w-4"></i>
                        <span className="text-sm truncate">{agent.email}</span>
                      </div>
                    )}
                  </div>

                  {adminUser && (
                    <>
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Estado</span>
                        <button
                          onClick={() => handleToggleStatus(agent)}
                          disabled={agent.role === 'Administrador'}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            agent.is_active ? 'bg-teal-600' : 'bg-gray-300'
                          } ${agent.role === 'Administrador' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              agent.is_active ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenModal(agent)}
                          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <i className="ri-edit-line"></i>
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteClick(agent)}
                          disabled={agent.role === 'Administrador'}
                          className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap ${
                            agent.role === 'Administrador'
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                        >
                          <i className="ri-delete-bin-line"></i>
                          Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAgent ? 'Editar Agente' : 'Agregar Agente'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotografía
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Vista previa"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <i className="ri-user-line text-3xl text-gray-400"></i>
                      </div>
                    )}
                  </div>
                  <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    Seleccionar Foto
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="Ingresa el nombre"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="Ingresa los apellidos"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="+57 300 123 4567"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  placeholder="Ej: Agente Inmobiliario, Asesor Comercial..."
                  required
                />
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Credenciales de Acceso</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Usuario <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      placeholder="Nombre de usuario"
                      required
                      minLength={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 3 caracteres</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña {!editingAgent && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      placeholder={editingAgent ? 'Dejar vacío para mantener actual' : 'Contraseña'}
                      required={!editingAgent}
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {editingAgent ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rol <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Administrador' | 'Agente externo' | 'Editor' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      required
                    >
                      {adminUser && <option value="Administrador">Administrador</option>}
                      <option value="Agente externo">Agente externo</option>
                      <option value="Editor">Editor</option>
                    </select>
                    {adminUser && (
                      <p className="text-xs text-gray-500 mt-1">Solo administradores pueden asignar el rol de Administrador</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <div className="flex items-center gap-3 h-10">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.is_active ? 'bg-teal-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className="text-sm text-gray-700">
                        {formData.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  disabled={saving}
                >
                  {saving ? 'Guardando...' : editingAgent ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && deletingAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-alert-line text-3xl text-red-600"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
              ¿Eliminar Agente?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              ¿Estás seguro de eliminar a <strong>{deletingAgent.first_name} {deletingAgent.last_name}</strong>? Esta acción no se puede deshacer y se eliminará su acceso al sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingAgent(null);
                }}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                disabled={saving}
              >
                {saving ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div
            className={`px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white`}
          >
            <i className={`${toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} text-xl`}></i>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}