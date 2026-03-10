import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getAuthUser } from '../../../utils/auth';
import {
  useProperties,
  deleteProperty,
  updatePropertyStatus,
  formatPriceSupabase,
} from '../../../hooks/useProperties';
import type { PropertyStatus } from '../../../hooks/useProperties';
import type { Property, Agent, PropertyComment } from '../../../lib/supabase';
import { supabase } from '../../../lib/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const adminUser = authUser?.username || null;
  const isAdminRole = authUser?.role === 'Administrador';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus>('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [statusMenuId, setStatusMenuId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'properties' | 'agents'>('properties');
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [previewAgent, setPreviewAgent] = useState<Agent | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [currentPreviewImage, setCurrentPreviewImage] = useState(0);
  
  // Comments state
  const [comments, setComments] = useState<PropertyComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newCommentTag, setNewCommentTag] = useState<string>('');
  const [addingComment, setAddingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [editCommentTag, setEditCommentTag] = useState<string>('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const itemsPerPage = 6;

  const { properties, loading, error, stats, refetch } = useProperties({
    status: statusFilter,
    search: searchTerm,
  });

  // Get current user ID from agents table
  useEffect(() => {
    const getCurrentUser = async () => {
      if (!authUser?.username) {
        setCurrentUserId(null);
        return;
      }
      
      const { data } = await supabase
        .from('agents')
        .select('id')
        .eq('username', authUser.username)
        .maybeSingle();
      
      setCurrentUserId(data?.id || null);
    };
    getCurrentUser();
  }, [authUser]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Paginación
  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = properties.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Publicado':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'Destacado':
        return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'Borrador':
        return 'bg-gray-100 text-gray-600 border border-gray-200';
      case 'Vendido':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'Arrendado':
        return 'bg-sky-100 text-sky-700 border border-sky-200';
      default:
        return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Publicado':
        return 'ri-checkbox-circle-fill';
      case 'Destacado':
        return 'ri-star-fill';
      case 'Borrador':
        return 'ri-draft-line';
      case 'Vendido':
        return 'ri-home-check-fill';
      case 'Arrendado':
        return 'ri-key-fill';
      default:
        return 'ri-circle-line';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'Publicado':
        return 'text-emerald-500';
      case 'Destacado':
        return 'text-amber-500';
      case 'Borrador':
        return 'text-gray-400';
      case 'Vendido':
        return 'text-red-500';
      case 'Arrendado':
        return 'text-sky-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Publicado':
        return 'Activo / Publicado';
      case 'Destacado':
        return 'Destacado';
      case 'Borrador':
        return 'Inactivo / Borrador';
      case 'Vendido':
        return 'Vendido';
      case 'Arrendado':
        return 'Arrendado';
      default:
        return status;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    const { error: deleteError } = await deleteProperty(confirmDelete.id);
    if (deleteError) {
      showToast('Error al eliminar la propiedad', 'error');
    } else {
      showToast('Propiedad eliminada correctamente', 'success');
      refetch();
    }
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const handleStatusChange = async (
    id: string,
    newStatus: Property['status'],
  ) => {
    setUpdatingId(id);
    setStatusMenuId(null);
    const { error: updateError } = await updatePropertyStatus(id, newStatus);
    if (updateError) {
      showToast('Error al actualizar el estado', 'error');
    } else {
      showToast(`Estado actualizado a "${newStatus}"`, 'success');
      refetch();
    }
    setUpdatingId(null);
  };

  const handleToggleFeatured = async (property: Property) => {
    setTogglingFeaturedId(property.id);
    const newStatus: Property['status'] = property.status === 'Destacado' ? 'Publicado' : 'Destacado';
    const { error: updateError } = await updatePropertyStatus(property.id, newStatus);
    if (updateError) {
      showToast('Error al actualizar destacado', 'error');
    } else {
      showToast(
        newStatus === 'Destacado' ? 'Inmueble marcado como destacado' : 'Inmueble desmarcado como destacado',
        'success'
      );
      refetch();
    }
    setTogglingFeaturedId(null);
  };

  const loadComments = async (propertyId: string) => {
    setCommentsLoading(true);
    const { data, error } = await supabase
      .from('property_comments')
      .select(`
        *,
        agent:agents(*)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading comments:', error);
      showToast('Error al cargar comentarios', 'error');
    } else {
      setComments(data as PropertyComment[]);
    }
    setCommentsLoading(false);
  };

  const handleOpenPreview = async (property: Property) => {
    setPreviewLoading(true);
    setPreviewProperty(property);
    setCurrentPreviewImage(0);
    
    // Cargar datos del agente si existe
    if (property.agent) {
      const { data: agentData } = await supabase
        .from('agents')
        .select('*')
        .eq('id', property.agent)
        .maybeSingle();
      setPreviewAgent(agentData as Agent | null);
    } else {
      setPreviewAgent(null);
    }
    
    // Cargar comentarios
    await loadComments(property.id);
    
    setPreviewLoading(false);
  };

  const handleClosePreview = () => {
    setPreviewProperty(null);
    setPreviewAgent(null);
    setCurrentPreviewImage(0);
    setComments([]);
    setNewComment('');
    setNewCommentTag('');
    setEditingCommentId(null);
  };

  const handleAddComment = async () => {
    if (!previewProperty || !newComment.trim() || !currentUserId) {
      if (!currentUserId) {
        showToast('Error: No se pudo identificar el usuario', 'error');
      }
      return;
    }
    
    setAddingComment(true);
    const { error } = await supabase
      .from('property_comments')
      .insert({
        property_id: previewProperty.id,
        agent_id: currentUserId,
        comment: newComment.trim(),
        tag: newCommentTag || null,
      });

    if (error) {
      console.error('Error adding comment:', error);
      showToast('Error al agregar el comentario', 'error');
    } else {
      showToast('Comentario agregado correctamente', 'success');
      setNewComment('');
      setNewCommentTag('');
      await loadComments(previewProperty.id);
    }
    setAddingComment(false);
  };

  const handleStartEdit = (comment: PropertyComment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.comment);
    setEditCommentTag(comment.tag || '');
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditCommentText('');
    setEditCommentTag('');
  };

  const handleDeleteComment = async (commentId: string, commentAgentId: string) => {
    // Verificar permisos: solo el autor o un administrador pueden eliminar
    if (commentAgentId !== currentUserId && !isAdminRole) {
      showToast('No tienes permisos para eliminar este comentario', 'error');
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;

    const { error } = await supabase
      .from('property_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      showToast('Error al eliminar comentario', 'error');
    } else {
      showToast('Comentario eliminado correctamente', 'success');
      if (previewProperty) {
        await loadComments(previewProperty.id);
      }
    }
  };

  const handleSaveEdit = async (commentId: string, commentAgentId: string) => {
    // Verificar permisos: solo el autor o un administrador pueden editar
    if (commentAgentId !== currentUserId && !isAdminRole) {
      showToast('No tienes permisos para editar este comentario', 'error');
      return;
    }

    if (!editCommentText.trim()) return;

    const { error } = await supabase
      .from('property_comments')
      .update({
        comment: editCommentText.trim(),
        tag: editCommentTag || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', commentId);

    if (error) {
      console.error('Error updating comment:', error);
      showToast('Error al actualizar comentario', 'error');
    } else {
      showToast('Comentario actualizado correctamente', 'success');
      setEditingCommentId(null);
      if (previewProperty) {
        await loadComments(previewProperty.id);
      }
    }
  };

  const canEditComment = (commentAgentId: string) => {
    return commentAgentId === currentUserId || isAdminRole;
  };

  const commentTags = [
    { value: 'cliente-interesado', label: 'Cliente interesado', color: 'bg-blue-100 text-blue-700' },
    { value: 'pendiente-visita', label: 'Pendiente de visita', color: 'bg-purple-100 text-purple-700' },
    { value: 'negociacion', label: 'Negociación', color: 'bg-orange-100 text-orange-700' },
    { value: 'reservado', label: 'Reservado', color: 'bg-green-100 text-green-700' },
  ];

  const getTagColor = (tag: string | null) => {
    if (!tag) return '';
    const tagObj = commentTags.find(t => t.value === tag);
    return tagObj?.color || 'bg-gray-100 text-gray-700';
  };

  const getTagLabel = (tag: string | null) => {
    if (!tag) return '';
    const tagObj = commentTags.find(t => t.value === tag);
    return tagObj?.label || tag;
  };

  const formatCommentDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  const statusOptions: Property['status'][] = [
    'Publicado',
    'Destacado',
    'Borrador',
    'Vendido',
    'Arrendado',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-600'
              : 'bg-red-600'
          }`}
        >
          <i
            className={`text-lg ${
              toast.type === 'success'
                ? 'ri-checkbox-circle-line'
                : 'ri-error-warning-line'
            }`}
          ></i>
          {toast.message}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-delete-bin-line text-red-600 text-3xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¿Eliminar propiedad?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Esta acción no se puede deshacer. Se eliminará permanentemente:
                <br />
                <strong className="text-gray-900">
                  "{confirmDelete.title}"
                </strong>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingId !== null}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  {deletingId ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="ri-loader-4-line animate-spin"></i>
                      Eliminando...
                    </span>
                  ) : (
                    'Sí, eliminar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewProperty && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl z-10 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <i className="ri-eye-line text-teal-600"></i>
                  Vista Previa del Inmueble
                </h3>
                <p className="text-sm text-gray-500 mt-1">Información completa del inmueble</p>
              </div>
              <button
                onClick={handleClosePreview}
                className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {previewLoading ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando información...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Image Gallery */}
                  {previewProperty.images && previewProperty.images.length > 0 && (
                    <div className="relative rounded-2xl overflow-hidden bg-gray-900">
                      <div className="relative w-full" style={{ minHeight: '400px', maxHeight: '500px' }}>
                        <img
                          src={previewProperty.images[currentPreviewImage]}
                          alt={`${previewProperty.title} - Imagen ${currentPreviewImage + 1}`}
                          className="max-w-full max-h-[500px] w-auto h-auto object-contain mx-auto"
                        />
                        
                        {/* Image counter */}
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium">
                          {currentPreviewImage + 1} / {previewProperty.images.length}
                        </div>

                        {/* Navigation arrows */}
                        {previewProperty.images.length > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentPreviewImage((prev) => (prev === 0 ? previewProperty.images!.length - 1 : prev - 1))}
                              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer"
                            >
                              <i className="ri-arrow-left-s-line text-2xl text-gray-900"></i>
                            </button>
                            <button
                              onClick={() => setCurrentPreviewImage((prev) => (prev === previewProperty.images!.length - 1 ? 0 : prev + 1))}
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer"
                            >
                              <i className="ri-arrow-right-s-line text-2xl text-gray-900"></i>
                            </button>
                          </>
                        )}
                      </div>

                      {/* Thumbnails */}
                      {previewProperty.images.length > 1 && (
                        <div className="flex gap-2 p-3 bg-gray-800 overflow-x-auto">
                          {previewProperty.images.map((img, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentPreviewImage(index)}
                              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                currentPreviewImage === index ? 'border-teal-500' : 'border-transparent opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt={`Miniatura ${index + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Property Info */}
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4 flex-wrap">
                      {previewProperty.status === 'Destacado' && (
                        <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          <i className="ri-star-fill text-xs"></i> Destacado
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        previewProperty.operation.includes('Arriendo') ? 'bg-[#d4816f] text-white' : 'bg-emerald-500 text-white'
                      }`}>
                        {previewProperty.operation}
                      </span>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        {previewProperty.type}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(previewProperty.status)}`}>
                        {previewProperty.status}
                      </span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-900 mb-3">{previewProperty.title}</h2>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <i className="ri-map-pin-line text-teal-600"></i>
                      <span className="text-sm">
                        {previewProperty.neighborhood}, {previewProperty.city}, {previewProperty.department}
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Código de Referencia</p>
                      <p className="text-lg font-bold text-gray-900">REF-{previewProperty.id.slice(0, 8).toUpperCase()}</p>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="text-sm text-gray-500 mb-1">Precio</p>
                      <p className="text-4xl font-bold text-gray-900">
                        {formatPriceSupabase(previewProperty.price, previewProperty.currency)}
                      </p>
                    </div>
                  </div>

                  {/* Characteristics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewProperty.area_built > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                            <i className="ri-ruler-line text-teal-600 text-xl"></i>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Área Construida</p>
                            <p className="text-base font-bold text-gray-900">{previewProperty.area_built}m²</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {previewProperty.area_private > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                            <i className="ri-layout-line text-teal-600 text-xl"></i>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Área Privada</p>
                            <p className="text-base font-bold text-gray-900">{previewProperty.area_private}m²</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {previewProperty.bedrooms > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                            <i className="ri-hotel-bed-line text-teal-600 text-xl"></i>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Habitaciones</p>
                            <p className="text-base font-bold text-gray-900">{previewProperty.bedrooms}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {previewProperty.bathrooms > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                            <i className="ri-drop-line text-teal-600 text-xl"></i>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Baños</p>
                            <p className="text-base font-bold text-gray-900">{previewProperty.bathrooms}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {previewProperty.parking > 0 && (
                      <div className="bg-white border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                            <i className="ri-car-line text-teal-600 text-xl"></i>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Parqueaderos</p>
                            <p className="text-base font-bold text-gray-900">{previewProperty.parking}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {previewProperty.description && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <i className="ri-file-text-line text-teal-600"></i>
                        Descripción
                      </h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">{previewProperty.description}</p>
                    </div>
                  )}

                  {/* Features */}
                  {((previewProperty.features_internal && previewProperty.features_internal.length > 0) ||
                    (previewProperty.features_external && previewProperty.features_external.length > 0)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {previewProperty.features_internal && previewProperty.features_internal.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <i className="ri-home-smile-line text-teal-600"></i>
                            Características Internas
                          </h3>
                          <div className="space-y-2">
                            {previewProperty.features_internal.map((feat, i) => {
                              const label = feat.replace(/-/g, ' ');
                              const formatted = label.charAt(0).toUpperCase() + label.slice(1);
                              return (
                                <div key={i} className="flex items-center gap-2">
                                  <i className="ri-check-line text-teal-600 text-lg"></i>
                                  <span className="text-sm text-gray-700">{formatted}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {previewProperty.features_external && previewProperty.features_external.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <i className="ri-building-line text-teal-600"></i>
                            Características Externas
                          </h3>
                          <div className="space-y-2">
                            {previewProperty.features_external.map((feat, i) => {
                              const label = feat.replace(/-/g, ' ');
                              const formatted = label.charAt(0).toUpperCase() + label.slice(1);
                              return (
                                <div key={i} className="flex items-center gap-2">
                                  <i className="ri-check-line text-teal-600 text-lg"></i>
                                  <span className="text-sm text-gray-700">{formatted}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Agent Info */}
                  {previewAgent && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="ri-user-star-line text-teal-600"></i>
                        Agente Asignado
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-teal-500 bg-gray-100 flex-shrink-0">
                          {previewAgent.photo_url ? (
                            <img src={previewAgent.photo_url} alt={`${previewAgent.first_name} ${previewAgent.last_name}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-teal-100">
                              <i className="ri-user-line text-teal-600 text-2xl"></i>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {previewAgent.first_name} {previewAgent.last_name}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                            <i className="ri-phone-line text-teal-600"></i>
                            {previewAgent.phone}
                          </p>
                          {previewAgent.email && (
                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                              <i className="ri-mail-line text-teal-600"></i>
                              {previewAgent.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Internal Comments Section */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="ri-chat-3-line text-teal-600"></i>
                      Comentarios Internos
                      <span className="text-xs font-normal text-gray-500 ml-2">
                        (Solo visible en BackOffice)
                      </span>
                    </h3>

                    {/* Add Comment Form */}
                    <div className="mb-6 bg-gray-50 rounded-xl p-4">
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Etiqueta (opcional)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setNewCommentTag('')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                              newCommentTag === '' 
                                ? 'bg-gray-700 text-white' 
                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            Sin etiqueta
                          </button>
                          {commentTags.map((tag) => (
                            <button
                              key={tag.value}
                              onClick={() => setNewCommentTag(tag.value)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                newCommentTag === tag.value 
                                  ? tag.color + ' ring-2 ring-offset-1 ring-gray-400' 
                                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                              }`}
                            >
                              {tag.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Escribe un comentario interno sobre este inmueble..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                        rows={3}
                        maxLength={500}
                      />
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-gray-500">
                          {newComment.length}/500 caracteres
                        </span>
                        <button
                          onClick={handleAddComment}
                          disabled={!newComment.trim() || addingComment || !currentUserId}
                          className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer flex items-center gap-2"
                        >
                          {addingComment ? (
                            <>
                              <i className="ri-loader-4-line animate-spin"></i>
                              Agregando...
                            </>
                          ) : (
                            <>
                              <i className="ri-send-plane-fill"></i>
                              Agregar Comentario
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-4">
                      {commentsLoading ? (
                        <div className="text-center py-8">
                          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                          <p className="text-sm text-gray-600">Cargando comentarios...</p>
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <i className="ri-chat-3-line text-gray-400 text-2xl"></i>
                          </div>
                          <p className="text-sm text-gray-600">
                            Aún no hay comentarios para este inmueble
                          </p>
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                                  {comment.agent?.photo_url ? (
                                    <img
                                      src={comment.agent.photo_url}
                                      alt={`${comment.agent.first_name} ${comment.agent.last_name}`}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <i className="ri-user-line text-teal-600 text-lg"></i>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {comment.agent
                                      ? `${comment.agent.first_name} ${comment.agent.last_name}`
                                      : 'Usuario'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatCommentDate(comment.created_at)}
                                    {comment.updated_at !== comment.created_at && ' (editado)'}
                                  </p>
                                </div>
                              </div>
                              {canEditComment(comment.agent_id) && (
                                <div className="flex items-center gap-1">
                                  {editingCommentId === comment.id ? (
                                    <>
                                      <button
                                        onClick={() => handleSaveEdit(comment.id, comment.agent_id)}
                                        className="w-8 h-8 flex items-center justify-center text-green-600 hover:bg-green-50 rounded-lg transition-all cursor-pointer"
                                        title="Guardar"
                                      >
                                        <i className="ri-check-line text-lg"></i>
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-lg transition-all cursor-pointer"
                                        title="Cancelar"
                                      >
                                        <i className="ri-close-line text-lg"></i>
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => handleStartEdit(comment)}
                                        className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                        title="Editar"
                                      >
                                        <i className="ri-edit-line text-base"></i>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(comment.id, comment.agent_id)}
                                        className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                        title="Eliminar"
                                      >
                                        <i className="ri-delete-bin-line text-base"></i>
                                      </button>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            {editingCommentId === comment.id ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Etiqueta
                                  </label>
                                  <div className="flex flex-wrap gap-2">
                                    <button
                                      onClick={() => setEditCommentTag('')}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                        editCommentTag === '' 
                                          ? 'bg-gray-700 text-white' 
                                          : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                                      }`}
                                    >
                                      Sin etiqueta
                                    </button>
                                    {commentTags.map((tag) => (
                                      <button
                                        key={tag.value}
                                        onClick={() => setEditCommentTag(tag.value)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                          editCommentTag === tag.value 
                                            ? tag.color + ' ring-2 ring-offset-1 ring-gray-400' 
                                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                                        }`}
                                      >
                                        {tag.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <textarea
                                  value={editCommentText}
                                  onChange={(e) => setEditCommentText(e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                                  rows={3}
                                  maxLength={500}
                                />
                                <span className="text-xs text-gray-500">
                                  {editCommentText.length}/500 caracteres
                                </span>
                              </div>
                            ) : (
                              <>
                                {comment.tag && (
                                  <div className="mb-2">
                                    <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${getTagColor(comment.tag)}`}>
                                      {getTagLabel(comment.tag)}
                                    </span>
                                  </div>
                                )}
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                  {comment.comment}
                                </p>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-2xl flex items-center justify-between">
              <button
                onClick={handleClosePreview}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white transition-all whitespace-nowrap cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  handleClosePreview();
                  navigate(`/add-property?edit=${previewProperty.id}`);
                }}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
              >
                <i className="ri-edit-line"></i>
                Editar Propiedad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <i className="ri-building-4-line text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Panel de Administración
                </h1>
                <p className="text-sm text-gray-500">Gestión de Propiedades</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {adminUser?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {adminUser}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-logout-box-line mr-2"></i>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'properties'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-home-4-line mr-2"></i>
              Propiedades
            </button>
            <button
              onClick={() => {
                setActiveTab('agents');
                navigate('/admin/agents');
              }}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'agents'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-user-line mr-2"></i>
              Agentes
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Propiedades</p>
                {loading ? (
                  <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                )}
              </div>
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                <i className="ri-home-4-line text-teal-600 text-2xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Publicadas</p>
                {loading ? (
                  <div className="h-9 w-12 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-emerald-600">
                    {stats.publicadas}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <i className="ri-checkbox-circle-line text-emerald-600 text-2xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Destacadas</p>
                {loading ? (
                  <div className="h-9 w-12 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-amber-600">
                    {stats.destacadas}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                <i className="ri-star-line text-amber-600 text-2xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Vendidas</p>
                {loading ? (
                  <div className="h-9 w-12 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-red-600">
                    {stats.vendidas}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <i className="ri-check-double-line text-red-600 text-2xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
              <div className="relative flex-1 min-w-[280px]">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                <input
                  type="text"
                  placeholder="Buscar por título, ubicación o referencia (REF-XXXXXXXX)..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="relative min-w-[180px]">
                <i className="ri-filter-3-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as PropertyStatus);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Publicado">Publicado</option>
                  <option value="Destacado">Destacado</option>
                  <option value="Borrador">Borrador</option>
                  <option value="Vendido">Vendido</option>
                  <option value="Arrendado">Arrendado</option>
                </select>
                <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
            </div>
            <button
              onClick={() => navigate('/add-property')}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-sm hover:shadow-md whitespace-nowrap cursor-pointer"
            >
              <i className="ri-add-line mr-2"></i>
              Cargar Nueva Propiedad
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Mostrando{' '}
              <span className="font-semibold text-gray-900">
                {paginatedProperties.length}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-gray-900">
                {properties.length}
              </span>{' '}
              propiedades
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6 flex items-center gap-4">
            <i className="ri-error-warning-line text-red-600 text-2xl"></i>
            <div>
              <p className="font-semibold text-red-800">
                Error al cargar propiedades
              </p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Properties Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Propiedad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Destacado
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                            <div className="space-y-2">
                              <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-12 bg-gray-200 rounded-full animate-pulse mx-auto"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-8 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
                        </td>
                      </tr>
                    ))
                  : paginatedProperties.map((property) => (
                      <tr
                        key={property.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              {property.images && property.images.length > 0 ? (
                                <img
                                  src={property.images[0]}
                                  alt={property.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <i className="ri-image-line text-gray-400 text-2xl"></i>
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                                {property.title}
                              </h3>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                {property.bedrooms > 0 && (
                                  <span className="flex items-center gap-1">
                                    <i className="ri-hotel-bed-line"></i>
                                    {property.bedrooms}
                                  </span>
                                )}
                                {property.bathrooms > 0 && (
                                  <span className="flex items-center gap-1">
                                    <i className="ri-drop-line"></i>
                                    {property.bathrooms}
                                  </span>
                                )}
                                {property.parking > 0 && (
                                  <span className="flex items-center gap-1">
                                    <i className="ri-car-line"></i>
                                    {property.parking}
                                  </span>
                                )}
                                {property.area_built > 0 && (
                                  <span className="flex items-center gap-1">
                                    <i className="ri-ruler-line"></i>
                                    {property.area_built}m²
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {formatPriceSupabase(
                                property.price,
                                property.currency,
                              )}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {property.operation}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {property.city || '—'}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {property.neighborhood || '—'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <button
                              onClick={() =>
                                setStatusMenuId(
                                  statusMenuId === property.id ? null : property.id,
                                )
                              }
                              disabled={updatingId === property.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer hover:opacity-90 transition-all shadow-sm ${getStatusColor(
                                property.status,
                              )}`}
                            >
                              {updatingId === property.id ? (
                                <i className="ri-loader-4-line animate-spin text-sm"></i>
                              ) : (
                                <i className={`${getStatusIcon(property.status)} text-sm`}></i>
                              )}
                              <span>{property.status}</span>
                              {updatingId !== property.id && (
                                <i className="ri-arrow-down-s-line text-sm opacity-60"></i>
                              )}
                            </button>

                            {statusMenuId === property.id && (
                              <div className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-52 z-20 overflow-hidden">
                                <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Cambiar estado
                                  </p>
                                </div>
                                {statusOptions.map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => handleStatusChange(property.id, s)}
                                    className={`w-full px-4 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer flex items-center gap-3 ${
                                      s === property.status
                                        ? 'bg-gray-50'
                                        : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    <span className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${getStatusDotColor(s)}`}>
                                      <i className={`${getStatusIcon(s)} text-base`}></i>
                                    </span>
                                    <span className="flex-1 text-gray-700">
                                      {getStatusLabel(s)}
                                    </span>
                                    {s === property.status && (
                                      <i className="ri-check-line text-emerald-500 text-sm flex-shrink-0"></i>
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggleFeatured(property)}
                              disabled={togglingFeaturedId === property.id}
                              className={`relative w-12 h-7 rounded-full transition-all cursor-pointer ${
                                property.status === 'Destacado'
                                  ? 'bg-amber-500'
                                  : 'bg-gray-300'
                              } ${togglingFeaturedId === property.id ? 'opacity-60' : ''}`}
                              title={property.status === 'Destacado' ? 'Desmarcar como destacado' : 'Marcar como destacado'}
                            >
                              <span
                                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform flex items-center justify-center ${
                                  property.status === 'Destacado' ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              >
                                {togglingFeaturedId === property.id ? (
                                  <i className="ri-loader-4-line animate-spin text-xs text-gray-600"></i>
                                ) : (
                                  <i className={`ri-star-${property.status === 'Destacado' ? 'fill' : 'line'} text-xs ${property.status === 'Destacado' ? 'text-amber-500' : 'text-gray-400'}`}></i>
                                )}
                              </span>
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenPreview(property)}
                              className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Vista previa"
                            >
                              <i className="ri-eye-line text-lg"></i>
                            </button>
                            <button
                              onClick={() =>
                                navigate(
                                  `/add-property?edit=${property.id}`,
                                )
                              }
                              className="w-8 h-8 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <i className="ri-edit-line text-lg"></i>
                            </button>
                            <button
                              onClick={() =>
                                setConfirmDelete({
                                  id: property.id,
                                  title: property.title,
                                })
                              }
                              className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <i className="ri-delete-bin-line text-lg"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!loading && paginatedProperties.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-home-4-line text-gray-400 text-3xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'Todos'
                  ? 'No se encontraron propiedades'
                  : 'Aún no hay propiedades'}
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                {searchTerm || statusFilter !== 'Todos'
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza cargando tu primera propiedad'}
              </p>
              {searchTerm || statusFilter !== 'Todos' ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('Todos');
                  }}
                  className="px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  Limpiar filtros
                </button>
              ) : (
                <button
                  onClick={() => navigate('/add-property')}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all whitespace-nowrap cursor-pointer"
                >
                  <i className="ri-add-line mr-2"></i>
                  Cargar Primera Propiedad
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.max(1, prev - 1))
                }
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              >
                <i className="ri-arrow-left-s-line mr-1"></i>
                Anterior
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-emerald-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              >
                Siguiente
                <i className="ri-arrow-right-s-line ml-1"></i>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Close status menu on outside click */}
      {statusMenuId && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setStatusMenuId(null)}
        ></div>
      )}
    </div>
  );
}