import { useState, useEffect, useRef, useCallback } from 'react';
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
import StatusDropdownPortal from './components/StatusDropdownPortal';

const STATUS_OPTIONS = [
  { value: 'Publicado',  label: 'Activo / Publicado', icon: 'ri-checkbox-circle-fill', dotColor: 'text-emerald-500' },
  { value: 'Destacado',  label: 'Destacado',           icon: 'ri-star-fill',             dotColor: 'text-amber-500'  },
  { value: 'Borrador',   label: 'Inactivo / Borrador', icon: 'ri-draft-line',            dotColor: 'text-gray-400'   },
  { value: 'Vendido',    label: 'Vendido',              icon: 'ri-check-double-fill',     dotColor: 'text-red-500'    },
  { value: 'Arrendado',  label: 'Arrendado',            icon: 'ri-key-2-fill',            dotColor: 'text-sky-500'    },
] as const;

type StatusValue = typeof STATUS_OPTIONS[number]['value'];

function getStatusColor(status: string) {
  switch (status) {
    case 'Publicado':  return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    case 'Destacado':  return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'Borrador':   return 'bg-gray-100 text-gray-600 border border-gray-200';
    case 'Vendido':    return 'bg-red-100 text-red-700 border border-red-200';
    case 'Arrendado':  return 'bg-sky-100 text-sky-700 border border-sky-200';
    default:           return 'bg-gray-100 text-gray-600 border border-gray-200';
  }
}

function getStatusIcon(status: string) {
  const opt = STATUS_OPTIONS.find(o => o.value === status);
  return opt?.icon ?? 'ri-circle-line';
}

/* ─── Individual row actions ─── */
interface PropertyRowProps {
  property: Property;
  updatingId: string | null;
  togglingFeaturedId: string | null;
  onStatusChange: (id: string, status: Property['status']) => void;
  onToggleFeatured: (property: Property) => void;
  onPreview: (property: Property) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

function PropertyRow({
  property,
  updatingId,
  togglingFeaturedId,
  onStatusChange,
  onToggleFeatured,
  onPreview,
  onEdit,
  onDelete,
}: PropertyRowProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Propiedad */}
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-16 sm:w-20 h-14 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {property.images && property.images.length > 0 ? (
              <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <i className="ri-image-line text-gray-400 text-xl sm:text-2xl"></i>
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-1">{property.title}</h3>
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 flex-wrap">
              {property.bedrooms > 0 && <span className="flex items-center gap-1"><i className="ri-hotel-bed-line"></i>{property.bedrooms}</span>}
              {property.bathrooms > 0 && <span className="flex items-center gap-1"><i className="ri-drop-line"></i>{property.bathrooms}</span>}
              {property.area_built > 0 && <span className="flex items-center gap-1"><i className="ri-ruler-line"></i>{property.area_built}m²</span>}
            </div>
          </div>
        </div>
      </td>

      {/* Precio */}
      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
        <p className="font-bold text-gray-900 text-sm">{formatPriceSupabase(property.price, property.currency)}</p>
        <p className="text-xs text-gray-500 mt-0.5">{property.operation}</p>
      </td>

      {/* Ubicación */}
      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
        <p className="font-medium text-gray-900 text-sm">{property.city || '—'}</p>
        <p className="text-xs text-gray-500 mt-0.5">{property.neighborhood || '—'}</p>
      </td>

      {/* Estado */}
      <td className="px-4 sm:px-6 py-4">
        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => setOpen(v => !v)}
            disabled={updatingId === property.id}
            className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer hover:opacity-90 transition-all ${getStatusColor(property.status)}`}
          >
            {updatingId === property.id
              ? <i className="ri-loader-4-line animate-spin text-sm"></i>
              : <i className={`${getStatusIcon(property.status)} text-sm`}></i>}
            <span className="hidden sm:inline">{property.status}</span>
            {updatingId !== property.id && <i className="ri-arrow-down-s-line text-sm opacity-60"></i>}
          </button>
          <StatusDropdownPortal
            propertyId={property.id}
            currentStatus={property.status}
            isOpen={open}
            anchorRef={btnRef}
            options={STATUS_OPTIONS.map(o => ({ ...o, value: o.value }))}
            getStatusColor={getStatusColor}
            onSelect={(s) => onStatusChange(property.id, s as Property['status'])}
            onClose={() => setOpen(false)}
          />
        </div>
      </td>

      {/* Destacado */}
      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
        <div className="flex items-center justify-center">
          <button
            onClick={() => onToggleFeatured(property)}
            disabled={togglingFeaturedId === property.id}
            className={`relative w-10 sm:w-12 h-6 sm:h-7 rounded-full transition-all cursor-pointer ${
              property.status === 'Destacado' ? 'bg-amber-500' : 'bg-gray-300'
            } ${togglingFeaturedId === property.id ? 'opacity-60' : ''}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 sm:w-6 h-5 sm:h-6 bg-white rounded-full shadow-md transition-transform flex items-center justify-center ${
              property.status === 'Destacado' ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0'
            }`}>
              {togglingFeaturedId === property.id
                ? <i className="ri-loader-4-line animate-spin text-xs text-gray-600"></i>
                : <i className={`ri-star-${property.status === 'Destacado' ? 'fill' : 'line'} text-xs ${property.status === 'Destacado' ? 'text-amber-500' : 'text-gray-400'}`}></i>}
            </span>
          </button>
        </div>
      </td>

      {/* Acciones */}
      <td className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-center gap-1 sm:gap-2">
          <button onClick={() => onPreview(property)} className="w-8 h-8 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer" title="Vista previa">
            <i className="ri-eye-line text-base sm:text-lg"></i>
          </button>
          <button onClick={() => onEdit(property.id)} className="w-8 h-8 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer" title="Editar">
            <i className="ri-edit-line text-base sm:text-lg"></i>
          </button>
          <button onClick={() => onDelete(property.id, property.title)} className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Eliminar">
            <i className="ri-delete-bin-line text-base sm:text-lg"></i>
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ─── Mobile card ─── */
type PropertyMobileCardProps = PropertyRowProps;

function PropertyMobileCard({
  property,
  updatingId,
  togglingFeaturedId,
  onStatusChange,
  onToggleFeatured,
  onPreview,
  onEdit,
  onDelete,
}: PropertyMobileCardProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 mb-3">
      <div className="flex gap-3 mb-3">
        <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {property.images && property.images.length > 0 ? (
            <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><i className="ri-image-line text-gray-400 text-xl"></i></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">{property.title}</h3>
          <p className="text-xs text-gray-500">{property.city}{property.neighborhood ? `, ${property.neighborhood}` : ''}</p>
          <p className="text-sm font-bold text-gray-900 mt-1">{formatPriceSupabase(property.price, property.currency)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/* Status button */}
        <div className="relative">
          <button
            ref={btnRef}
            onClick={() => setOpen(v => !v)}
            disabled={updatingId === property.id}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer hover:opacity-90 transition-all ${getStatusColor(property.status)}`}
          >
            {updatingId === property.id
              ? <i className="ri-loader-4-line animate-spin text-sm"></i>
              : <i className={`${getStatusIcon(property.status)} text-sm`}></i>}
            <span>{property.status}</span>
            {updatingId !== property.id && <i className="ri-arrow-down-s-line text-sm opacity-60"></i>}
          </button>
          <StatusDropdownPortal
            propertyId={property.id}
            currentStatus={property.status}
            isOpen={open}
            anchorRef={btnRef}
            options={STATUS_OPTIONS.map(o => ({ ...o, value: o.value }))}
            getStatusColor={getStatusColor}
            onSelect={(s) => onStatusChange(property.id, s as Property['status'])}
            onClose={() => setOpen(false)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => onPreview(property)} className="w-9 h-9 flex items-center justify-center text-teal-600 bg-teal-50 rounded-lg cursor-pointer" title="Ver detalles">
            <i className="ri-eye-line text-base"></i>
          </button>
          <button onClick={() => onEdit(property.id)} className="w-9 h-9 flex items-center justify-center text-emerald-600 bg-emerald-50 rounded-lg cursor-pointer" title="Editar">
            <i className="ri-edit-line text-base"></i>
          </button>
          <button onClick={() => onDelete(property.id, property.title)} className="w-9 h-9 flex items-center justify-center text-red-600 bg-red-50 rounded-lg cursor-pointer" title="Eliminar">
            <i className="ri-delete-bin-line text-base"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const adminUser = authUser?.username || null;
  const isAdminRole = authUser?.role === 'Administrador';

  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus>('Todos');
  const [currentPage, setCurrentPage]   = useState(1);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [updatingId, setUpdatingId]     = useState<string | null>(null);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab]       = useState<'properties' | 'agents'>('properties');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [previewProperty, setPreviewProperty]   = useState<Property | null>(null);
  const [previewAgent, setPreviewAgent]         = useState<Agent | null>(null);
  const [previewLoading, setPreviewLoading]     = useState(false);
  const [currentPreviewImage, setCurrentPreviewImage] = useState(0);

  const [comments, setComments]           = useState<PropertyComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment]       = useState('');
  const [newCommentTag, setNewCommentTag] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentText, setEditCommentText]   = useState('');
  const [editCommentTag, setEditCommentTag]     = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const itemsPerPage = 6;

  const { properties, loading, error, stats, refetch } = useProperties({
    status: statusFilter,
    search: searchTerm,
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      if (!authUser?.username) { setCurrentUserId(null); return; }
      const { data } = await supabase.from('agents').select('id').eq('username', authUser.username).maybeSingle();
      setCurrentUserId(data?.id || null);
    };
    getCurrentUser();
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const totalPages = Math.ceil(properties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProperties = properties.slice(startIndex, startIndex + itemsPerPage);

  /* ─── Handlers ─── */
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    const { error: deleteError } = await deleteProperty(confirmDelete.id);
    if (deleteError) showToast('Error al eliminar la propiedad', 'error');
    else { showToast('Propiedad eliminada correctamente', 'success'); refetch(); }
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const handleStatusChange = async (id: string, newStatus: Property['status']) => {
    setUpdatingId(id);
    const { error: updateError } = await updatePropertyStatus(id, newStatus);
    if (updateError) showToast(`Error al actualizar el estado: ${updateError}`, 'error');
    else { showToast(`Estado actualizado a "${newStatus}"`, 'success'); refetch(); }
    setUpdatingId(null);
  };

  const handleToggleFeatured = async (property: Property) => {
    setTogglingFeaturedId(property.id);
    const newStatus: Property['status'] = property.status === 'Destacado' ? 'Publicado' : 'Destacado';
    const { error: updateError } = await updatePropertyStatus(property.id, newStatus);
    if (updateError) showToast('Error al actualizar destacado', 'error');
    else { showToast(newStatus === 'Destacado' ? 'Inmueble destacado' : 'Inmueble desmarcado', 'success'); refetch(); }
    setTogglingFeaturedId(null);
  };

  const loadComments = async (propertyId: string) => {
    setCommentsLoading(true);
    const { data, error: e } = await supabase
      .from('property_comments')
      .select('*, agent:agents(*)')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true });
    if (e) showToast('Error al cargar comentarios', 'error');
    else setComments(data as PropertyComment[]);
    setCommentsLoading(false);
  };

  const handleOpenPreview = async (property: Property) => {
    setPreviewLoading(true);
    setPreviewProperty(property);
    setCurrentPreviewImage(0);
    if (property.agent) {
      const { data: agentData } = await supabase.from('agents').select('*').eq('id', property.agent).maybeSingle();
      setPreviewAgent(agentData as Agent | null);
    } else { setPreviewAgent(null); }
    await loadComments(property.id);
    setPreviewLoading(false);
  };

  const handleClosePreview = () => {
    setPreviewProperty(null); setPreviewAgent(null); setCurrentPreviewImage(0);
    setComments([]); setNewComment(''); setNewCommentTag(''); setEditingCommentId(null);
  };

  const handleAddComment = async () => {
    if (!previewProperty || !newComment.trim() || !currentUserId) {
      if (!currentUserId) showToast('No se pudo identificar el usuario', 'error');
      return;
    }
    setAddingComment(true);
    const { error: e } = await supabase.from('property_comments').insert({
      property_id: previewProperty.id, agent_id: currentUserId,
      comment: newComment.trim(), tag: newCommentTag || null,
    });
    if (e) showToast('Error al agregar el comentario', 'error');
    else { showToast('Comentario agregado', 'success'); setNewComment(''); setNewCommentTag(''); await loadComments(previewProperty.id); }
    setAddingComment(false);
  };

  const handleDeleteComment = async (commentId: string, commentAgentId: string) => {
    if (commentAgentId !== currentUserId && !isAdminRole) {
      showToast('Sin permisos para eliminar este comentario', 'error'); return;
    }
    if (!confirm('¿Eliminar este comentario?')) return;
    const { error: e } = await supabase.from('property_comments').delete().eq('id', commentId);
    if (e) showToast('Error al eliminar comentario', 'error');
    else { showToast('Comentario eliminado', 'success'); if (previewProperty) await loadComments(previewProperty.id); }
  };

  const handleSaveEdit = async (commentId: string, commentAgentId: string) => {
    if (commentAgentId !== currentUserId && !isAdminRole) {
      showToast('Sin permisos para editar este comentario', 'error'); return;
    }
    if (!editCommentText.trim()) return;
    const { error: e } = await supabase.from('property_comments').update({
      comment: editCommentText.trim(), tag: editCommentTag || null, updated_at: new Date().toISOString(),
    }).eq('id', commentId);
    if (e) showToast('Error al actualizar comentario', 'error');
    else { showToast('Comentario actualizado', 'success'); setEditingCommentId(null); if (previewProperty) await loadComments(previewProperty.id); }
  };

  const commentTags = [
    { value: 'cliente-interesado', label: 'Cliente interesado', color: 'bg-teal-100 text-teal-700' },
    { value: 'pendiente-visita',   label: 'Pendiente de visita', color: 'bg-amber-100 text-amber-700' },
    { value: 'negociacion',        label: 'Negociación',          color: 'bg-orange-100 text-orange-700' },
    { value: 'reservado',          label: 'Reservado',            color: 'bg-green-100 text-green-700'  },
  ];

  const getTagColor = (tag: string | null) => commentTags.find(t => t.value === tag)?.color || 'bg-gray-100 text-gray-700';
  const getTagLabel = (tag: string | null) => commentTags.find(t => t.value === tag)?.label || tag || '';

  const formatCommentDate = (d: string) => {
    const date = new Date(d);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hrs  = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return 'Hace un momento';
    if (mins < 60) return `Hace ${mins} min`;
    if (hrs < 24)  return `Hace ${hrs}h`;
    if (days < 7)  return `Hace ${days}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const sharedRowProps = {
    updatingId,
    togglingFeaturedId,
    onStatusChange: handleStatusChange,
    onToggleFeatured: handleToggleFeatured,
    onPreview: handleOpenPreview,
    onEdit: (id: string) => navigate(`/add-property?edit=${id}&step=6`),
    onDelete: (id: string, title: string) => setConfirmDelete({ id, title }),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 left-4 sm:left-auto z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl text-white text-sm font-medium ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <i className={`text-lg ${toast.type === 'success' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}`}></i>
          {toast.message}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-delete-bin-line text-red-600 text-2xl"></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">¿Eliminar propiedad?</h3>
              <p className="text-gray-600 text-sm mb-6">Esta acción no se puede deshacer. Se eliminará: <strong className="text-gray-900">"{confirmDelete.title}"</strong></p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">Cancelar</button>
                <button onClick={handleDeleteConfirm} disabled={deletingId !== null} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-60 whitespace-nowrap cursor-pointer">
                  {deletingId ? <span className="flex items-center justify-center gap-2"><i className="ri-loader-4-line animate-spin"></i>Eliminando...</span> : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewProperty && (
        <div className="fixed inset-0 bg-black/60 flex items-start sm:items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-none sm:rounded-2xl shadow-2xl w-full sm:max-w-5xl sm:my-6 min-h-screen sm:min-h-0 sm:max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-8 py-4 sm:py-6 z-10 flex items-center justify-between flex-shrink-0 rounded-t-none sm:rounded-t-2xl">
              <div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <i className="ri-eye-line text-teal-600"></i> Vista Previa
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Información completa del inmueble</p>
              </div>
              <button onClick={handleClosePreview} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer">
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              {previewLoading ? (
                <div className="text-center py-16">
                  <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando...</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Gallery */}
                  {previewProperty.images && previewProperty.images.length > 0 && (
                    <div className="relative rounded-xl overflow-hidden bg-gray-900">
                      <div className="relative w-full" style={{ minHeight: '200px', maxHeight: '400px' }}>
                        <img src={previewProperty.images[currentPreviewImage]} alt={`${previewProperty.title} - Imagen ${currentPreviewImage + 1}`} className="w-full h-auto max-h-96 object-contain mx-auto" />
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">{currentPreviewImage + 1} / {previewProperty.images.length}</div>
                        {previewProperty.images.length > 1 && (
                          <>
                            <button onClick={() => setCurrentPreviewImage(p => p === 0 ? previewProperty.images!.length - 1 : p - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center cursor-pointer"><i className="ri-arrow-left-s-line text-xl text-gray-900"></i></button>
                            <button onClick={() => setCurrentPreviewImage(p => p === previewProperty.images!.length - 1 ? 0 : p + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center cursor-pointer"><i className="ri-arrow-right-s-line text-xl text-gray-900"></i></button>
                          </>
                        )}
                      </div>
                      {previewProperty.images.length > 1 && (
                        <div className="flex gap-2 p-2.5 bg-gray-800 overflow-x-auto">
                          {previewProperty.images.map((img, idx) => (
                            <button key={idx} onClick={() => setCurrentPreviewImage(idx)} className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${currentPreviewImage === idx ? 'border-teal-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                              <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info */}
                  <div className="bg-gray-50 rounded-2xl p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${previewProperty.operation.includes('rriendo') ? 'bg-[#d4816f] text-white' : 'bg-emerald-500 text-white'}`}>{previewProperty.operation}</span>
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">{previewProperty.type}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(previewProperty.status)}`}>{previewProperty.status}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{previewProperty.title}</h2>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-3"><i className="ri-map-pin-line text-teal-600"></i>{previewProperty.neighborhood}, {previewProperty.city}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatPriceSupabase(previewProperty.price, previewProperty.currency)}</p>
                    <p className="text-xs text-gray-500 mt-1">REF-{previewProperty.id.slice(0, 8).toUpperCase()}</p>
                  </div>

                  {/* Characteristics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {previewProperty.area_built > 0 && <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2"><i className="ri-ruler-line text-teal-600"></i><div><p className="text-xs text-gray-500">Área</p><p className="text-sm font-bold">{previewProperty.area_built}m²</p></div></div>}
                    {previewProperty.bedrooms > 0 && <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2"><i className="ri-hotel-bed-line text-teal-600"></i><div><p className="text-xs text-gray-500">Habitaciones</p><p className="text-sm font-bold">{previewProperty.bedrooms}</p></div></div>}
                    {previewProperty.bathrooms > 0 && <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2"><i className="ri-drop-line text-teal-600"></i><div><p className="text-xs text-gray-500">Baños</p><p className="text-sm font-bold">{previewProperty.bathrooms}</p></div></div>}
                    {previewProperty.parking > 0 && <div className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-2"><i className="ri-car-line text-teal-600"></i><div><p className="text-xs text-gray-500">Parqueaderos</p><p className="text-sm font-bold">{previewProperty.parking}</p></div></div>}
                  </div>

                  {/* Description */}
                  {previewProperty.description && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2"><i className="ri-file-text-line text-teal-600"></i>Descripción</h3>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{previewProperty.description}</p>
                    </div>
                  )}

                  {/* Agent */}
                  {previewAgent && (
                    <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                      <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2"><i className="ri-user-star-line text-teal-600"></i>Agente Asignado</h3>
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-teal-500 bg-gray-100 flex-shrink-0">
                          {previewAgent.photo_url ? <img src={previewAgent.photo_url} alt={`${previewAgent.first_name}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-teal-100"><i className="ri-user-line text-teal-600 text-xl"></i></div>}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{previewAgent.first_name} {previewAgent.last_name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1"><i className="ri-phone-line text-teal-600"></i>{previewAgent.phone}</p>
                          {previewAgent.email && <p className="text-sm text-gray-600 flex items-center gap-1"><i className="ri-mail-line text-teal-600"></i>{previewAgent.email}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <i className="ri-chat-3-line text-teal-600"></i>Comentarios Internos
                      <span className="text-xs font-normal text-gray-500">(Solo visible en BackOffice)</span>
                    </h3>
                    {/* Add comment */}
                    <div className="mb-5 bg-gray-50 rounded-xl p-3 sm:p-4">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <button onClick={() => setNewCommentTag('')} className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${newCommentTag === '' ? 'bg-gray-700 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>Sin etiqueta</button>
                        {commentTags.map(tag => (
                          <button key={tag.value} onClick={() => setNewCommentTag(tag.value)} className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${newCommentTag === tag.value ? tag.color + ' ring-2 ring-offset-1 ring-gray-300' : 'bg-white text-gray-600 border border-gray-300'}`}>{tag.label}</button>
                        ))}
                      </div>
                      <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Escribe un comentario interno..." className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" rows={3} maxLength={500} />
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{newComment.length}/500</span>
                        <button onClick={handleAddComment} disabled={!newComment.trim() || addingComment || !currentUserId} className="px-3 py-2 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 disabled:opacity-50 cursor-pointer flex items-center gap-1 whitespace-nowrap">
                          {addingComment ? <><i className="ri-loader-4-line animate-spin"></i>Agregando...</> : <><i className="ri-send-plane-fill"></i>Agregar</>}
                        </button>
                      </div>
                    </div>
                    {/* List */}
                    <div className="space-y-3">
                      {commentsLoading ? (
                        <div className="text-center py-6"><div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div></div>
                      ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-400"><i className="ri-chat-3-line text-3xl mb-2"></i><p className="text-sm">Sin comentarios aún</p></div>
                      ) : comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                                {comment.agent?.photo_url ? <img src={comment.agent.photo_url} alt="" className="w-full h-full rounded-full object-cover" /> : <i className="ri-user-line text-teal-600 text-sm"></i>}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{comment.agent ? `${comment.agent.first_name} ${comment.agent.last_name}` : 'Usuario'}</p>
                                <p className="text-xs text-gray-500">{formatCommentDate(comment.created_at)}{comment.updated_at !== comment.created_at ? ' (editado)' : ''}</p>
                              </div>
                            </div>
                            {(comment.agent_id === currentUserId || isAdminRole) && (
                              <div className="flex gap-1">
                                {editingCommentId === comment.id ? (
                                  <>
                                    <button onClick={() => handleSaveEdit(comment.id, comment.agent_id)} className="w-7 h-7 flex items-center justify-center text-green-600 hover:bg-green-50 rounded-lg cursor-pointer"><i className="ri-check-line"></i></button>
                                    <button onClick={() => setEditingCommentId(null)} className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-lg cursor-pointer"><i className="ri-close-line"></i></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => { setEditingCommentId(comment.id); setEditCommentText(comment.comment); setEditCommentTag(comment.tag || ''); }} className="w-7 h-7 flex items-center justify-center text-teal-600 hover:bg-teal-50 rounded-lg cursor-pointer"><i className="ri-edit-line text-sm"></i></button>
                                    <button onClick={() => handleDeleteComment(comment.id, comment.agent_id)} className="w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"><i className="ri-delete-bin-line text-sm"></i></button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          {editingCommentId === comment.id ? (
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-1.5">
                                <button onClick={() => setEditCommentTag('')} className={`px-2 py-1 rounded-lg text-xs cursor-pointer ${editCommentTag === '' ? 'bg-gray-700 text-white' : 'bg-white text-gray-600 border border-gray-300'}`}>Sin etiqueta</button>
                                {commentTags.map(t => <button key={t.value} onClick={() => setEditCommentTag(t.value)} className={`px-2 py-1 rounded-lg text-xs cursor-pointer ${editCommentTag === t.value ? t.color : 'bg-white text-gray-600 border border-gray-300'}`}>{t.label}</button>)}
                              </div>
                              <textarea value={editCommentText} onChange={e => setEditCommentText(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" rows={3} maxLength={500} />
                            </div>
                          ) : (
                            <>
                              {comment.tag && <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium mb-1.5 ${getTagColor(comment.tag)}`}>{getTagLabel(comment.tag)}</span>}
                              <p className="text-sm text-gray-700 whitespace-pre-line">{comment.comment}</p>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-between gap-3 flex-shrink-0 rounded-b-none sm:rounded-b-2xl">
              <button onClick={handleClosePreview} className="px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-white transition-all whitespace-nowrap cursor-pointer text-sm">Cerrar</button>
              <button onClick={() => { handleClosePreview(); navigate(`/add-property?edit=${previewProperty.id}&step=6`); }} className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 text-sm">
                <i className="ri-edit-line"></i> Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Header ─── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-building-4-line text-white text-lg sm:text-xl"></i>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">Panel de Administración</h1>
                <p className="text-xs text-gray-500">Gestión de Propiedades</p>
              </div>
              <h1 className="sm:hidden text-base font-bold text-gray-900">Admin</h1>
            </div>

            {/* Desktop actions */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{adminUser?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{adminUser}</span>
              </div>
              <button onClick={handleLogout} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap cursor-pointer">
                <i className="ri-logout-box-line mr-1.5"></i>Cerrar Sesión
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="sm:hidden w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              <i className={`text-xl ${mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
            </button>
          </div>

          {/* Mobile dropdown menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{adminUser?.charAt(0).toUpperCase()}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">{adminUser}</span>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-red-600 font-medium cursor-pointer">
                <i className="ri-logout-box-line"></i>Salir
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ─── Tabs ─── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1">
            <button onClick={() => setActiveTab('properties')} className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'properties' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              <i className="ri-home-4-line mr-1.5"></i>Propiedades
            </button>
            <button onClick={() => { setActiveTab('agents'); navigate('/admin/agents'); }} className={`px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${activeTab === 'agents' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>
              <i className="ri-user-line mr-1.5"></i>Agentes
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main content ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {([
            { label: 'Total',       value: stats.total,      icon: 'ri-home-4-line',           bg: 'bg-teal-50',    text: 'text-teal-600',   statusKey: 'Todos'     },
            { label: 'Publicadas',  value: stats.publicadas, icon: 'ri-checkbox-circle-line',   bg: 'bg-emerald-50', text: 'text-emerald-600', statusKey: 'Publicado' },
            { label: 'Destacadas',  value: stats.destacadas, icon: 'ri-star-line',              bg: 'bg-amber-50',   text: 'text-amber-600',  statusKey: 'Destacado' },
            { label: 'Vendidas',    value: stats.vendidas,   icon: 'ri-check-double-line',      bg: 'bg-red-50',     text: 'text-red-600',    statusKey: 'Vendido'   },
            { label: 'Arrendadas',  value: stats.arrendadas, icon: 'ri-key-line',               bg: 'bg-sky-50',     text: 'text-sky-600',    statusKey: 'Arrendado' },
            { label: 'Borradores',  value: stats.borradores, icon: 'ri-draft-line',             bg: 'bg-gray-100',   text: 'text-gray-500',   statusKey: 'Borrador'  },
          ] as const).map(stat => (
            <div
              key={stat.label}
              onClick={() => { setStatusFilter(stat.statusKey as PropertyStatus); setCurrentPage(1); }}
              className={`bg-white rounded-xl p-4 sm:p-5 border transition-all cursor-pointer ${statusFilter === stat.statusKey ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-gray-100 hover:border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  {loading
                    ? <div className="h-7 w-10 bg-gray-200 rounded animate-pulse mt-1"></div>
                    : <p className="text-2xl font-bold text-gray-900">{stat.value}</p>}
                </div>
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <i className={`${stat.icon} ${stat.text} text-xl`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 mb-5 sm:mb-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base"></i>
                <input type="text" placeholder="Buscar por título, ubicación o REF..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
              <div className="relative sm:w-48">
                <i className="ri-filter-3-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base"></i>
                <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as PropertyStatus); setCurrentPage(1); }} className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none bg-white cursor-pointer">
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
            <button onClick={() => navigate('/add-property')} className="w-full sm:w-auto self-start px-4 sm:px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all whitespace-nowrap cursor-pointer text-sm">
              <i className="ri-add-line mr-1.5"></i>Cargar Propiedad
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
            Mostrando <strong className="text-gray-900">{paginatedProperties.length}</strong> de <strong className="text-gray-900">{properties.length}</strong> propiedades
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 flex items-center gap-3">
            <i className="ri-error-warning-line text-red-600 text-xl flex-shrink-0"></i>
            <div className="flex-1 min-w-0"><p className="font-semibold text-red-800 text-sm">Error al cargar propiedades</p><p className="text-xs text-red-600 mt-0.5">{error}</p></div>
            <button onClick={refetch} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 whitespace-nowrap cursor-pointer">Reintentar</button>
          </div>
        )}

        {/* ─── Desktop: Table ─── */}
        <div className="hidden sm:block bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Propiedad</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:table-cell">Precio</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Ubicación</th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  <th className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Destacado</th>
                  <th className="px-4 sm:px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><div className="flex items-center gap-4"><div className="w-20 h-16 bg-gray-200 rounded-lg animate-pulse"></div><div className="space-y-2"><div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div><div className="h-3 w-28 bg-gray-200 rounded animate-pulse"></div></div></div></td>
                        <td className="px-6 py-4 hidden sm:table-cell"><div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div></td>
                        <td className="px-6 py-4 hidden md:table-cell"><div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div></td>
                        <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div></td>
                        <td className="px-6 py-4 hidden lg:table-cell"><div className="h-7 w-12 bg-gray-200 rounded-full animate-pulse mx-auto"></div></td>
                        <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div></td>
                      </tr>
                    ))
                  : paginatedProperties.map(property => (
                      <PropertyRow key={property.id} property={property} {...sharedRowProps} />
                    ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {!loading && paginatedProperties.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-home-4-line text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{searchTerm || statusFilter !== 'Todos' ? 'No se encontraron propiedades' : 'Aún no hay propiedades'}</h3>
              <p className="text-gray-500 text-sm mb-5">{searchTerm || statusFilter !== 'Todos' ? 'Ajusta los filtros de búsqueda' : 'Comienza cargando tu primera propiedad'}</p>
              {(searchTerm || statusFilter !== 'Todos') ? (
                <button onClick={() => { setSearchTerm(''); setStatusFilter('Todos'); }} className="text-sm text-emerald-600 font-medium cursor-pointer">Limpiar filtros</button>
              ) : (
                <button onClick={() => navigate('/add-property')} className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap"><i className="ri-add-line mr-1"></i>Cargar propiedad</button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 cursor-pointer whitespace-nowrap"><i className="ri-arrow-left-s-line mr-1"></i>Anterior</button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium cursor-pointer transition-colors ${currentPage === page ? 'bg-emerald-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>{page}</button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 whitespace-nowrap cursor-pointer">Siguiente<i className="ri-arrow-right-s-line ml-1"></i></button>
            </div>
          )}
        </div>

        {/* ─── Mobile: Cards ─── */}
        <div className="sm:hidden">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 mb-3 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-20 h-16 rounded-lg bg-gray-200 flex-shrink-0"></div>
                  <div className="flex-1 space-y-2"><div className="h-4 bg-gray-200 rounded w-3/4"></div><div className="h-3 bg-gray-200 rounded w-1/2"></div></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
                  <div className="flex gap-2"><div className="w-9 h-9 bg-gray-200 rounded-lg"></div><div className="w-9 h-9 bg-gray-200 rounded-lg"></div><div className="w-9 h-9 bg-gray-200 rounded-lg"></div></div>
                </div>
              </div>
            ))
          ) : paginatedProperties.length === 0 && !error ? (
            <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
              <i className="ri-home-4-line text-gray-300 text-4xl mb-3"></i>
              <p className="text-gray-600 font-medium mb-4">{searchTerm || statusFilter !== 'Todos' ? 'Sin resultados' : 'Aún no hay propiedades'}</p>
              {(searchTerm || statusFilter !== 'Todos') ? (
                <button onClick={() => { setSearchTerm(''); setStatusFilter('Todos'); }} className="text-sm text-emerald-600 font-medium cursor-pointer">Limpiar filtros</button>
              ) : (
                <button onClick={() => navigate('/add-property')} className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg text-sm font-medium cursor-pointer whitespace-nowrap"><i className="ri-add-line mr-1"></i>Cargar propiedad</button>
              )}
            </div>
          ) : (
            <>
              {paginatedProperties.map(property => (
                <PropertyMobileCard key={property.id} property={property} {...sharedRowProps} />
              ))}
              {/* Mobile pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between py-3">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg disabled:opacity-50 cursor-pointer whitespace-nowrap"><i className="ri-arrow-left-s-line mr-1"></i>Ant.</button>
                  <span className="text-sm text-gray-600 font-medium">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg disabled:opacity-50 cursor-pointer whitespace-nowrap">Sig.<i className="ri-arrow-right-s-line ml-1"></i></button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
