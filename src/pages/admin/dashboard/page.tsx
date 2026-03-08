import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getAdminUser } from '../../../utils/auth';
import {
  useProperties,
  deleteProperty,
  updatePropertyStatus,
  formatPriceSupabase,
} from '../../../hooks/useProperties';
import type { PropertyStatus } from '../../../hooks/useProperties';
import type { Property } from '../../../lib/supabase';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const adminUser = getAdminUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus>('Todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
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
  const itemsPerPage = 6;

  const { properties, loading, error, stats, refetch } = useProperties({
    status: statusFilter,
    search: searchTerm,
  });

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
                          <div className="flex items-center justify-center gap-2">
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
