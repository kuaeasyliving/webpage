import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { supabase } from '../../lib/supabase';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAgents } from '../../hooks/useAgents';
import { useImageOptimization } from '../../hooks/useImageOptimization';
import ImageOptimizationProgress from '../../components/base/ImageOptimizationProgress';
import ImageOptimizationToast from '../../components/base/ImageOptimizationToast';
import { OptimizedImage } from '../../utils/imageOptimizer';
import { generatePropertySlug, generateUniqueSlug, isValidSlug, PropertySlugData } from '../../utils/slugGenerator';

interface FormData {
  title: string;
  operationType: string;
  propertyType: string;
  country: string;
  department: string;
  city: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  description: string;
  price: string;
  currency: string;
  administrationFee: string;
  builtArea: string;
  privateArea: string;
  bedrooms: number;
  bathrooms: number;
  parkingSpots: number;
  propertyStatus: string;
  age: string;
  floor: string;
  internalAmenities: string[];
  externalAmenities: string[];
  images: File[];
  coverImageIndex: number;
  videoUrl: string;
  assignedAgent: string;
  publicationStatus: string;
}

interface SortableImageProps {
  id: string;
  preview: string;
  index: number;
  isCover: boolean;
  onSetCover: (index: number) => void;
  onRemove: (index: number) => void;
  isOptimizing?: boolean;
  optimizationProgress?: number;
}

function SortableImage({ id, preview, index, isCover, onSetCover, onRemove, isOptimizing, optimizationProgress }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
        isCover ? 'border-yellow-400 shadow-lg' : 'border-slate-200 hover:border-teal-400'
      } ${isDragging ? 'shadow-2xl' : ''}`}
    >
      {/* Drag handle */}
      {!isOptimizing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/60 text-white rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          title="Arrastrar para reordenar"
        >
          <i className="ri-drag-move-2-line text-sm"></i>
        </div>
      )}

      <div className="w-full h-40">
        <img
          src={preview}
          alt={`Foto ${index + 1}`}
          className="w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Optimization overlay */}
      {isOptimizing && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-xs font-semibold">Optimizando...</p>
          {optimizationProgress !== undefined && (
            <p className="text-white text-xs">{optimizationProgress}%</p>
          )}
        </div>
      )}

      {/* Overlay actions */}
      {!isOptimizing && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onSetCover(index)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              isCover
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-slate-700 hover:bg-yellow-500 hover:text-white'
            }`}
            title="Marcar como portada"
          >
            <i className="ri-star-fill"></i>
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all flex items-center justify-center"
            title="Eliminar"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      )}

      {/* Cover badge */}
      {isCover && (
        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow">
          <i className="ri-star-fill"></i>
          Portada
        </div>
      )}

      {/* Index badge */}
      {!isCover && !isOptimizing && (
        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-medium">
          {index + 1}
        </div>
      )}
    </div>
  );
}

export default function AddPropertyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Estado para el slug generado
  const [generatedSlug, setGeneratedSlug] = useState<string>('');
  const [isSlugValid, setIsSlugValid] = useState<boolean>(true);
  const [slugError, setSlugError] = useState<string>('');

  const [formData, setFormData] = useState<FormData>({
    title: '',
    operationType: '',
    propertyType: '',
    country: 'Colombia',
    department: '',
    city: '',
    neighborhood: '',
    latitude: 4.8133,
    longitude: -75.6961,
    description: '',
    price: '',
    currency: 'COP',
    administrationFee: '',
    builtArea: '',
    privateArea: '',
    bedrooms: 0,
    bathrooms: 0,
    parkingSpots: 0,
    propertyStatus: '',
    age: '',
    floor: '',
    internalAmenities: [],
    externalAmenities: [],
    images: [],
    coverImageIndex: 0,
    videoUrl: '',
    assignedAgent: '',
    publicationStatus: 'borrador',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Estados para optimización de imágenes
  const [optimizedImages, setOptimizedImages] = useState<OptimizedImage[]>([]);
  const [optimizingImages, setOptimizingImages] = useState<Set<number>>(new Set());
  const [optimizationProgress, setOptimizationProgress] = useState<Map<number, number>>(new Map());
  const [showOptimizationProgress, setShowOptimizationProgress] = useState(false);
  const [currentOptimizingIndex, setCurrentOptimizingIndex] = useState<number>(-1);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'warning' | 'info'; message: string } | null>(null);

  const { optimizeAndUpload } = useImageOptimization();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    if (editId) {
      loadPropertyData(editId);
    }
  }, [editId]);

  const loadPropertyData = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        navigate('/admin/dashboard');
        return;
      }

      setFormData({
        title: data.title || '',
        operationType: data.operation || '',
        propertyType: data.type || '',
        country: data.country || 'Colombia',
        department: data.department || '',
        city: data.city || '',
        neighborhood: data.neighborhood || '',
        latitude: 4.8133,
        longitude: -75.6961,
        description: data.description || '',
        price: data.price?.toString() || '',
        currency: data.currency || 'COP',
        administrationFee: '',
        builtArea: data.area_built?.toString() || '',
        privateArea: data.area_private?.toString() || '',
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        parkingSpots: data.parking || 0,
        propertyStatus: '',
        age: '',
        floor: '',
        internalAmenities: data.features_internal || [],
        externalAmenities: data.features_external || [],
        images: [],
        coverImageIndex: 0,
        videoUrl: '',
        assignedAgent: data.agent || '',
        publicationStatus: data.status?.toLowerCase() || 'borrador',
      });

      if (data.images && data.images.length > 0) {
        setExistingImageUrls(data.images);
        setImagePreviews(data.images);
      }
    } catch (error) {
      console.error('Error cargando propiedad:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const internalAmenitiesList = [
    { id: 'aire-acondicionado', label: 'Aire Acondicionado', icon: 'ri-temp-cold-line' },
    { id: 'balcon', label: 'Balcón', icon: 'ri-door-open-line' },
    { id: 'cocina-integral', label: 'Cocina Integral', icon: 'ri-restaurant-line' },
    { id: 'estudio', label: 'Estudio', icon: 'ri-book-open-line' },
    { id: 'zona-lavanderia', label: 'Zona de Lavandería', icon: 'ri-shirt-line' },
    { id: 'calentador', label: 'Calentador', icon: 'ri-fire-line' },
    { id: 'closets', label: 'Clósets', icon: 'ri-door-line' },
    { id: 'walk-in-closet', label: 'Walk-in Closet', icon: 'ri-handbag-line' },
  ];

  const externalAmenitiesList = [
    { id: 'ascensor', label: 'Ascensor', icon: 'ri-arrow-up-down-line' },
    { id: 'club-house', label: 'Club House', icon: 'ri-home-heart-line' },
    { id: 'piscina', label: 'Piscina', icon: 'ri-water-flash-line' },
    { id: 'vigilancia', label: 'Vigilancia 24/7', icon: 'ri-shield-check-line' },
    { id: 'porteria', label: 'Portería', icon: 'ri-door-lock-line' },
    { id: 'salon-comunal', label: 'Salón Comunal', icon: 'ri-community-line' },
    { id: 'zonas-verdes', label: 'Zonas Verdes', icon: 'ri-plant-line' },
    { id: 'gimnasio', label: 'Gimnasio', icon: 'ri-run-line' },
    { id: 'parque-infantil', label: 'Parque Infantil', icon: 'ri-riding-line' },
    { id: 'bbq', label: 'Zona BBQ', icon: 'ri-fire-fill' },
  ];

  const { agents, loading: loadingAgents } = useAgents();

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
      if (!formData.operationType) newErrors.operationType = 'Selecciona el tipo de operación';
      if (!formData.propertyType) newErrors.propertyType = 'Selecciona el tipo de inmueble';
      if (!formData.country.trim()) newErrors.country = 'El país es obligatorio';
      if (!formData.department.trim()) newErrors.department = 'El departamento es obligatorio';
      if (!formData.city.trim()) newErrors.city = 'La ciudad es obligatoria';
      if (!formData.neighborhood.trim()) newErrors.neighborhood = 'El barrio es obligatorio';
    }

    if (step === 2) {
      if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'El precio es obligatorio';
      if (!formData.builtArea || Number(formData.builtArea) <= 0) newErrors.builtArea = 'El área construida es obligatoria';
    }

    if (step === 6) {
      if (!formData.assignedAgent) newErrors.assignedAgent = 'Debes asignar un agente';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    uploadedUrls.push(...existingImageUrls);

    // Subir imágenes optimizadas
    for (let i = 0; i < optimizedImages.length; i++) {
      const optimized = optimizedImages[i];
      try {
        setCurrentOptimizingIndex(i);
        setShowOptimizationProgress(true);

        const urls = await optimizeAndUpload(
          optimized,
          undefined,
          (progress) => {
            setOptimizationProgress(prev => new Map(prev).set(i, progress.progress));
          }
        );

        // Usar la versión large como imagen principal
        uploadedUrls.push(urls.large);
      } catch (error) {
        console.error('Error subiendo imagen optimizada:', error);
        setToastMessage({
          type: 'error',
          message: `Error al subir imagen ${i + 1}`
        });
      }
    }

    setShowOptimizationProgress(false);
    setCurrentOptimizingIndex(-1);
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    // Validar que el slug sea válido
    if (!generatedSlug || !isSlugValid) {
      setToastMessage({
        type: 'error',
        message: 'No se pudo generar un slug válido. Verifica los datos del inmueble.'
      });
      return;
    }

    setIsSaving(true);

    try {
      // Validar unicidad del slug
      const isUnique = await validateSlugUniqueness(generatedSlug);
      let finalSlug = generatedSlug;

      if (!isUnique) {
        // Generar slug único agregando sufijo numérico
        finalSlug = await ensureUniqueSlug(generatedSlug);
        setToastMessage({
          type: 'info',
          message: `El slug fue ajustado a: ${finalSlug}`
        });
      }

      const imageUrls = await uploadImages();

      const statusMap: Record<string, string> = {
        'borrador': 'Borrador',
        'publicado': 'Publicado',
        'vendido': 'Vendido',
        'destacado': 'Destacado',
      };

      const propertyData = {
        title: formData.title,
        operation: formData.operationType,
        type: formData.propertyType,
        price: Number(formData.price),
        currency: formData.currency,
        country: formData.country,
        department: formData.department,
        city: formData.city,
        neighborhood: formData.neighborhood,
        images: imageUrls,
        status: statusMap[formData.publicationStatus] || 'Borrador',
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        parking: formData.parkingSpots,
        area_built: Number(formData.builtArea),
        area_private: formData.privateArea ? Number(formData.privateArea) : null,
        features_internal: formData.internalAmenities,
        features_external: formData.externalAmenities,
        description: formData.description.trim() || null,
        agent: formData.assignedAgent,
        slug: finalSlug, // Agregar el slug generado
        updated_at: new Date().toISOString(),
      };

      if (editId) {
        const { error } = await supabase
          .from('properties')
          .update(propertyData)
          .eq('id', editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('properties')
          .insert([{ ...propertyData, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }

      setShowSuccessModal(true);
      setToastMessage({
        type: 'success',
        message: editId ? 'Propiedad actualizada exitosamente' : 'Propiedad guardada exitosamente'
      });
    } catch (error) {
      console.error('Error guardando propiedad:', error);
      setToastMessage({
        type: 'error',
        message: 'Error al guardar la propiedad. Intenta nuevamente.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/admin/dashboard');
  };

  const handleOpenPreview = () => {
    if (validateStep(currentStep)) setShowPreviewModal(true);
  };

  const handleClosePreview = () => setShowPreviewModal(false);

  const handleSubmitFromPreview = async () => {
    setShowPreviewModal(false);
    await handleSubmit();
  };

  const incrementCounter = (field: 'bedrooms' | 'bathrooms' | 'parkingSpots') => {
    setFormData((prev) => ({ ...prev, [field]: prev[field] + 1 }));
  };

  const decrementCounter = (field: 'bedrooms' | 'bathrooms' | 'parkingSpots') => {
    setFormData((prev) => ({ ...prev, [field]: Math.max(0, prev[field] - 1) }));
  };

  const formatNumber = (value: string) => {
    const num = value.replace(/\D/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handlePriceChange = (value: string) => {
    handleInputChange('price', value.replace(/,/g, ''));
  };

  const handleAdminFeeChange = (value: string) => {
    handleInputChange('administrationFee', value.replace(/,/g, ''));
  };

  const toggleAmenity = (type: 'internal' | 'external', amenityId: string) => {
    const field = type === 'internal' ? 'internalAmenities' : 'externalAmenities';
    const current = formData[field];
    setFormData((prev) => ({
      ...prev,
      [field]: current.includes(amenityId)
        ? current.filter((id) => id !== amenityId)
        : [...current, amenityId],
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    const startIndex = imagePreviews.length;

    // Mostrar previews inmediatamente
    fileArray.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);

      // Marcar como optimizando
      setOptimizingImages(prev => new Set(prev).add(startIndex + idx));
    });

    // Optimizar imágenes en segundo plano
    const { optimizeImage } = await import('../../utils/imageOptimizer');
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const imageIndex = startIndex + i;

      try {
        const optimized = await optimizeImage(file, (progress) => {
          setOptimizationProgress(prev => new Map(prev).set(imageIndex, progress.progress));
        });

        setOptimizedImages(prev => [...prev, optimized]);
        
        setToastMessage({
          type: 'success',
          message: `Imagen ${i + 1} optimizada correctamente`
        });
      } catch (error) {
        console.error('Error optimizando imagen:', error);
        setToastMessage({
          type: 'error',
          message: `Error al optimizar imagen ${i + 1}`
        });
      } finally {
        setOptimizingImages(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageIndex);
          return newSet;
        });
        setOptimizationProgress(prev => {
          const newMap = new Map(prev);
          newMap.delete(imageIndex);
          return newMap;
        });
      }
    }
  };

  const removeImage = (index: number) => {
    const existingCount = existingImageUrls.length;
    
    if (index < existingCount) {
      // Es una imagen existente
      setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Es una imagen nueva optimizada
      const optimizedIndex = index - existingCount;
      setOptimizedImages((prev) => prev.filter((_, i) => i !== optimizedIndex));
    }
    
    // Remover del array de previews
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    
    // Ajustar el índice de la portada si es necesario
    if (formData.coverImageIndex === index) {
      setFormData((prev) => ({ ...prev, coverImageIndex: 0 }));
    } else if (formData.coverImageIndex > index) {
      setFormData((prev) => ({ ...prev, coverImageIndex: prev.coverImageIndex - 1 }));
    }
  };

  const setCoverImage = (index: number) => {
    setFormData((prev) => ({ ...prev, coverImageIndex: index }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = imagePreviews.findIndex((_, i) => `img-${i}` === active.id);
    const newIndex = imagePreviews.findIndex((_, i) => `img-${i}` === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const existingCount = existingImageUrls.length;
    
    // Reordenar previews
    const newPreviews = arrayMove(imagePreviews, oldIndex, newIndex);
    setImagePreviews(newPreviews);

    // Determinar si ambas imágenes son existentes o nuevas
    const oldIsExisting = oldIndex < existingCount;
    const newIsExisting = newIndex < existingCount;

    if (oldIsExisting && newIsExisting) {
      // Ambas son imágenes existentes
      const newExisting = arrayMove(existingImageUrls, oldIndex, newIndex);
      setExistingImageUrls(newExisting);
    } else if (!oldIsExisting && !newIsExisting) {
      // Ambas son imágenes nuevas
      const oldOptimizedIndex = oldIndex - existingCount;
      const newOptimizedIndex = newIndex - existingCount;
      setOptimizedImages((prev) => arrayMove(prev, oldOptimizedIndex, newOptimizedIndex));
    } else {
      // Mezcla entre existentes y nuevas - reorganizar todo
      const allImages: Array<{ type: 'existing' | 'new'; data: string | OptimizedImage; originalIndex: number }> = [];
      
      // Mapear imágenes existentes
      existingImageUrls.forEach((url, i) => {
        allImages.push({ type: 'existing', data: url, originalIndex: i });
      });
      
      // Mapear imágenes nuevas
      optimizedImages.forEach((optimized, i) => {
        allImages.push({ type: 'new', data: optimized, originalIndex: i });
      });
      
      // Reordenar según el movimiento
      const reordered = arrayMove(allImages, oldIndex, newIndex);
      
      // Separar de nuevo en existentes y nuevas
      const newExistingUrls: string[] = [];
      const newOptimized: OptimizedImage[] = [];
      
      reordered.forEach((item) => {
        if (item.type === 'existing') {
          newExistingUrls.push(item.data as string);
        } else {
          newOptimized.push(item.data as OptimizedImage);
        }
      });
      
      setExistingImageUrls(newExistingUrls);
      setOptimizedImages(newOptimized);
    }

    // Actualizar índice de portada
    const coverIdx = formData.coverImageIndex;
    let newCoverIdx = coverIdx;
    if (coverIdx === oldIndex) {
      newCoverIdx = newIndex;
    } else if (oldIndex < coverIdx && newIndex >= coverIdx) {
      newCoverIdx = coverIdx - 1;
    } else if (oldIndex > coverIdx && newIndex <= coverIdx) {
      newCoverIdx = coverIdx + 1;
    }
    setFormData((prev) => ({ ...prev, coverImageIndex: newCoverIdx }));
  };

  const getStepTitle = (step: number) => {
    const titles: Record<number, string> = {
      1: 'Información Básica',
      2: 'Precios y Áreas',
      3: 'Distribución',
      4: 'Amenidades',
      5: 'Multimedia',
      6: 'Publicación',
    };
    return titles[step] || '';
  };

  // Generar slug automáticamente cuando cambien los datos relevantes
  useEffect(() => {
    if (formData.operationType && formData.propertyType && formData.city) {
      const slugData: PropertySlugData = {
        operation: formData.operationType,
        type: formData.propertyType,
        neighborhood: formData.neighborhood,
        city: formData.city,
        bedrooms: formData.bedrooms,
        title: formData.title,
      };
      
      const newSlug = generatePropertySlug(slugData);
      setGeneratedSlug(newSlug);
      setIsSlugValid(isValidSlug(newSlug));
      
      if (!isValidSlug(newSlug)) {
        setSlugError('El slug generado no es válido. Verifica los datos ingresados.');
      } else {
        setSlugError('');
      }
    }
  }, [
    formData.operationType,
    formData.propertyType,
    formData.city,
    formData.neighborhood,
    formData.bedrooms,
    formData.title,
  ]);

  // Validar unicidad del slug antes de guardar
  const validateSlugUniqueness = async (slug: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, slug')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error validando slug:', error);
        return false;
      }

      // Si estamos editando, permitir el mismo slug si es de la misma propiedad
      if (editId && data && data.id === editId) {
        return true;
      }

      // Si existe otro inmueble con el mismo slug, no es válido
      return !data;
    } catch (error) {
      console.error('Error validando slug:', error);
      return false;
    }
  };

  // Generar slug único si ya existe
  const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
    const { data, error } = await supabase
      .from('properties')
      .select('slug')
      .like('slug', `${baseSlug}%`);

    if (error) {
      console.error('Error obteniendo slugs existentes:', error);
      return baseSlug;
    }

    const existingSlugs = data?.map((p) => p.slug) || [];
    return generateUniqueSlug(baseSlug, existingSlugs);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando propiedad...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Toast notifications */}
      {toastMessage && (
        <ImageOptimizationToast
          type={toastMessage.type}
          message={toastMessage.message}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Optimization progress modal */}
      {showOptimizationProgress && currentOptimizingIndex >= 0 && (
        <ImageOptimizationProgress
          currentImage={currentOptimizingIndex + 1}
          totalImages={optimizedImages.length}
          progress={optimizationProgress.get(currentOptimizingIndex) || 0}
          stage="compressing"
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
            <i className="ri-home-4-line text-white text-3xl"></i>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            {editId ? 'Editar Propiedad' : 'Registrar Nueva Propiedad'}
          </h1>
          <p className="text-slate-600 text-base max-w-2xl mx-auto">
            Completa el formulario paso a paso para {editId ? 'actualizar' : 'publicar'} tu inmueble en el portal
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                      currentStep > step
                        ? 'bg-teal-500 text-white shadow-lg'
                        : currentStep === step
                        ? 'bg-teal-500 text-white shadow-lg ring-4 ring-teal-100'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {currentStep > step ? <i className="ri-check-line text-lg"></i> : step}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-semibold transition-colors ${currentStep >= step ? 'text-teal-600' : 'text-slate-400'}`}>
                      {getStepTitle(step)}
                    </p>
                  </div>
                </div>
                {step < 6 && (
                  <div className={`h-1 flex-1 mx-1 rounded-full transition-all duration-300 ${currentStep > step ? 'bg-teal-500' : 'bg-slate-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="relative">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500 transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${(currentStep / 6) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm font-medium text-slate-600">Paso {currentStep} de 6</span>
            <span className="text-sm font-bold text-teal-600">{Math.round((currentStep / 6) * 100)}% Completado</span>
          </div>
        </div>

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="ri-home-4-line text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Información Básica</h2>
                  <p className="text-sm text-slate-500 mt-1">Datos principales del inmueble</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <i className="ri-text text-teal-600 mr-1"></i>
                    Título del Inmueble <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ej: Hermoso apartamento con vista panorámica en Condina"
                    className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all ${errors.title ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
                  />
                  {errors.title && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors.title}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      <i className="ri-exchange-line text-teal-600 mr-1"></i>
                      Tipo de Operación <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.operationType}
                        onChange={(e) => handleInputChange('operationType', e.target.value)}
                        className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none cursor-pointer ${errors.operationType ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <option value="">Seleccionar operación...</option>
                        <option value="venta">Venta</option>
                        <option value="arriendo-tradicional">Arriendo Tradicional</option>
                        <option value="arriendo-renta-corta">Arriendo Renta Corta</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                    </div>
                    {errors.operationType && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors.operationType}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      <i className="ri-building-line text-teal-600 mr-1"></i>
                      Tipo de Inmueble <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.propertyType}
                        onChange={(e) => handleInputChange('propertyType', e.target.value)}
                        className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none cursor-pointer ${errors.propertyType ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        <option value="">Seleccionar tipo...</option>
                        <option value="apartamento">Apartamento</option>
                        <option value="casa">Casa</option>
                        <option value="lote">Lote</option>
                        <option value="local">Local</option>
                        <option value="bodega">Bodega</option>
                        <option value="finca">Finca</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                    </div>
                    {errors.propertyType && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors.propertyType}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <i className="ri-file-text-line text-teal-600 mr-1"></i>
                    Descripción / Observaciones
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => { if (e.target.value.length <= 2000) handleInputChange('description', e.target.value); }}
                    placeholder="Describe las características principales del inmueble..."
                    rows={6}
                    maxLength={2000}
                    className="w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all border-slate-200 hover:border-slate-300 resize-none"
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-xs text-slate-500"><i className="ri-information-line mr-1"></i>Esta descripción aparecerá en la página pública</p>
                    <p className="text-xs text-slate-500 font-medium">{formData.description.length}/2000</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="ri-map-pin-line text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Geolocalización</h2>
                  <p className="text-sm text-slate-500 mt-1">Define dónde se encuentra el inmueble</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { field: 'country' as keyof FormData, label: 'País', icon: 'ri-global-line', placeholder: 'Ej: Colombia' },
                    { field: 'department' as keyof FormData, label: 'Departamento', icon: 'ri-map-2-line', placeholder: 'Ej: Risaralda' },
                    { field: 'city' as keyof FormData, label: 'Ciudad', icon: 'ri-building-2-line', placeholder: 'Ej: Pereira' },
                    { field: 'neighborhood' as keyof FormData, label: 'Barrio / Sector', icon: 'ri-map-pin-2-line', placeholder: 'Ej: Condina' },
                  ].map(({ field, label, icon, placeholder }) => (
                    <div key={field}>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        <i className={`${icon} text-teal-600 mr-1`}></i>
                        {label} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData[field] as string}
                        onChange={(e) => handleInputChange(field, e.target.value)}
                        placeholder={placeholder}
                        className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all ${errors[field] ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
                      />
                      {errors[field] && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors[field]}</p>}
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    <i className="ri-map-pin-range-line text-teal-600 mr-1"></i>
                    Mapa Interactivo
                  </label>
                  <div className="rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm">
                    <iframe
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(formData.city + ', ' + formData.department + ', ' + formData.country)}`}
                      width="100%"
                      height="350"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview del Slug SEO */}
            {generatedSlug && (
              <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <i className="ri-links-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">URL Optimizada para SEO</h2>
                    <p className="text-sm text-slate-500 mt-1">Vista previa de la URL que tendrá este inmueble</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      <i className="ri-link text-purple-600 mr-1"></i>
                      URL Generada Automáticamente
                    </label>
                    <div className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl ${
                      isSlugValid 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-red-300 bg-red-50'
                    }`}>
                      <div className="flex items-center gap-2">
                        {isSlugValid ? (
                          <i className="ri-checkbox-circle-fill text-green-600 text-lg"></i>
                        ) : (
                          <i className="ri-error-warning-fill text-red-600 text-lg"></i>
                        )}
                        <span className="font-mono text-slate-700">
                          /{formData.operationType || 'operacion'}/{generatedSlug}
                        </span>
                      </div>
                    </div>
                    {slugError && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <i className="ri-error-warning-line"></i>
                        {slugError}
                      </p>
                    )}
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
                    <i className="ri-information-line text-purple-600 text-xl mt-0.5"></i>
                    <div>
                      <p className="text-sm font-semibold text-purple-900 mb-1">¿Qué es esto?</p>
                      <p className="text-xs text-purple-700 mb-2">
                        Esta URL se genera automáticamente a partir de los datos del inmueble y está optimizada para aparecer en Google.
                      </p>
                      <p className="text-xs text-purple-700">
                        <strong>Ejemplo:</strong> Si alguien busca "apartamento en venta en Pereira", tu inmueble tendrá más posibilidades de aparecer.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs font-bold text-slate-600 mb-2">
                        <i className="ri-check-line text-green-600 mr-1"></i>
                        Beneficios SEO
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Mejor posicionamiento en Google</li>
                        <li>• URL descriptiva y profesional</li>
                        <li>• Fácil de compartir en redes sociales</li>
                      </ul>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-xs font-bold text-slate-600 mb-2">
                        <i className="ri-refresh-line text-blue-600 mr-1"></i>
                        Actualización Automática
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        <li>• Se actualiza al cambiar los datos</li>
                        <li>• Sin caracteres especiales</li>
                        <li>• Formato optimizado para web</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="ri-money-dollar-circle-line text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Precios y Áreas</h2>
                  <p className="text-sm text-slate-500 mt-1">Información económica y dimensiones</p>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      <i className="ri-price-tag-3-line text-teal-600 mr-1"></i>
                      Precio <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formatNumber(formData.price)}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      placeholder="Ej: 350,000,000"
                      className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all ${errors.price ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
                    />
                    {errors.price && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors.price}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Moneda</label>
                    <div className="relative">
                      <select
                        value={formData.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none cursor-pointer border-slate-200 hover:border-slate-300"
                      >
                        <option value="COP">COP</option>
                        <option value="USD">USD</option>
                      </select>
                      <i className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Valor de Administración (Opcional)</label>
                  <input
                    type="text"
                    value={formatNumber(formData.administrationFee)}
                    onChange={(e) => handleAdminFeeChange(e.target.value)}
                    placeholder="Ej: 150,000"
                    className="w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all border-slate-200 hover:border-slate-300"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Área Construida (m²) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      value={formData.builtArea}
                      onChange={(e) => handleInputChange('builtArea', e.target.value)}
                      placeholder="Ej: 85"
                      className={`w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all ${errors.builtArea ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
                    />
                    {errors.builtArea && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors.builtArea}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Área Privada (m²)</label>
                    <input
                      type="number"
                      value={formData.privateArea}
                      onChange={(e) => handleInputChange('privateArea', e.target.value)}
                      placeholder="Ej: 75"
                      className="w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all border-slate-200 hover:border-slate-300"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="ri-layout-grid-line text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Distribución y Detalles</h2>
                  <p className="text-sm text-slate-500 mt-1">Características internas del inmueble</p>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="text-base font-bold text-slate-700 mb-4"><i className="ri-home-gear-line text-teal-600 mr-1"></i>Distribución de Espacios</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { field: 'bedrooms' as const, label: 'Habitaciones', icon: 'ri-hotel-bed-line' },
                      { field: 'bathrooms' as const, label: 'Baños', icon: 'ri-drop-line' },
                      { field: 'parkingSpots' as const, label: 'Parqueaderos', icon: 'ri-parking-box-line' },
                    ].map(({ field, label, icon }) => (
                      <div key={field} className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                        <label className="block text-sm font-bold text-slate-700 mb-4 text-center">
                          <i className={`${icon} text-teal-600 text-xl`}></i>
                          <span className="block mt-2">{label}</span>
                        </label>
                        <div className="flex items-center justify-center gap-4">
                          <button type="button" onClick={() => decrementCounter(field)} className="w-12 h-12 bg-white border-2 border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all flex items-center justify-center cursor-pointer">
                            <i className="ri-subtract-line text-xl"></i>
                          </button>
                          <div className="w-20 h-12 bg-white border-2 border-teal-500 rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-teal-600">{formData[field]}</span>
                          </div>
                          <button type="button" onClick={() => incrementCounter(field)} className="w-12 h-12 bg-white border-2 border-slate-300 rounded-lg text-slate-700 font-bold hover:bg-teal-500 hover:text-white hover:border-teal-500 transition-all flex items-center justify-center cursor-pointer">
                            <i className="ri-add-line text-xl"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-700 mb-4"><i className="ri-information-line text-teal-600 mr-1"></i>Información Adicional</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Estado del Inmueble</label>
                      <div className="relative">
                        <select value={formData.propertyStatus} onChange={(e) => handleInputChange('propertyStatus', e.target.value)} className="w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all appearance-none cursor-pointer border-slate-200 hover:border-slate-300">
                          <option value="">Seleccionar...</option>
                          <option value="nuevo">Nuevo</option>
                          <option value="usado">Usado</option>
                          <option value="en-construccion">En Construcción</option>
                          <option value="remodelado">Remodelado</option>
                        </select>
                        <i className="ri-arrow-down-s-line absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"></i>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Antigüedad (años)</label>
                      <input type="number" value={formData.age} onChange={(e) => handleInputChange('age', e.target.value)} placeholder="Ej: 5" className="w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all border-slate-200 hover:border-slate-300" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Piso / Nivel</label>
                      <input type="number" value={formData.floor} onChange={(e) => handleInputChange('floor', e.target.value)} placeholder="Ej: 8" className="w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all border-slate-200 hover:border-slate-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="ri-home-smile-line text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Amenidades Internas</h2>
                  <p className="text-sm text-slate-500 mt-1">Características dentro del inmueble</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {internalAmenitiesList.map((amenity) => (
                  <button key={amenity.id} type="button" onClick={() => toggleAmenity('internal', amenity.id)} className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 cursor-pointer ${formData.internalAmenities.includes(amenity.id) ? 'bg-teal-50 border-teal-500 shadow-md' : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'}`}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${formData.internalAmenities.includes(amenity.id) ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <i className={`${amenity.icon} text-2xl`}></i>
                    </div>
                    <span className={`text-xs font-semibold text-center ${formData.internalAmenities.includes(amenity.id) ? 'text-teal-700' : 'text-slate-700'}`}>{amenity.label}</span>
                    {formData.internalAmenities.includes(amenity.id) && <i className="ri-checkbox-circle-fill text-teal-500 text-lg"></i>}
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="ri-community-line text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Amenidades Externas</h2>
                  <p className="text-sm text-slate-500 mt-1">Características del conjunto o edificio</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {externalAmenitiesList.map((amenity) => (
                  <button key={amenity.id} type="button" onClick={() => toggleAmenity('external', amenity.id)} className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 cursor-pointer ${formData.externalAmenities.includes(amenity.id) ? 'bg-teal-50 border-teal-500 shadow-md' : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'}`}>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${formData.externalAmenities.includes(amenity.id) ? 'bg-teal-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <i className={`${amenity.icon} text-2xl`}></i>
                    </div>
                    <span className={`text-xs font-semibold text-center ${formData.externalAmenities.includes(amenity.id) ? 'text-teal-700' : 'text-slate-700'}`}>{amenity.label}</span>
                    {formData.externalAmenities.includes(amenity.id) && <i className="ri-checkbox-circle-fill text-teal-500 text-lg"></i>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5 - Multimedia con optimización automática */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="ri-image-line text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Multimedia</h2>
                  <p className="text-sm text-slate-500 mt-1">Fotos y videos del inmueble</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* Upload zone */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">
                    <i className="ri-gallery-line text-teal-600 mr-1"></i>
                    Fotografías del Inmueble
                  </label>
                  
                  {/* Info banner sobre optimización */}
                  <div className="mb-4 bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
                    <i className="ri-information-line text-teal-600 text-xl mt-0.5"></i>
                    <div>
                      <p className="text-sm font-semibold text-teal-900 mb-1">Optimización Automática Activada</p>
                      <p className="text-xs text-teal-700">Las imágenes se optimizarán automáticamente al subirlas. Soportamos JPG, PNG, WebP, HEIC y HEIF. Tamaño máximo: 10MB por imagen.</p>
                    </div>
                  </div>

                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${dragActive ? 'border-teal-500 bg-teal-50' : 'border-slate-300 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/50'}`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*,.heic,.heif"
                      onChange={handleFileInput}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="pointer-events-none">
                      <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-upload-cloud-2-line text-teal-600 text-4xl"></i>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">Arrastra y suelta tus imágenes aquí</h3>
                      <p className="text-sm text-slate-500 mb-4">o haz clic para seleccionar archivos</p>
                      <p className="text-xs text-slate-400">Formatos: JPG, PNG, WEBP, HEIC, HEIF (Máx. 10MB por imagen)</p>
                    </div>
                  </div>

                  {/* Sortable image grid */}
                  {imagePreviews.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-bold text-slate-700">
                          Imágenes Cargadas ({imagePreviews.length})
                        </h4>
                        <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5">
                          <i className="ri-drag-move-2-line text-teal-600 text-sm"></i>
                          <span className="text-xs text-teal-700 font-medium">Arrastra las fotos para reordenarlas</span>
                        </div>
                      </div>

                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={imagePreviews.map((_, i) => `img-${i}`)}
                          strategy={rectSortingStrategy}
                        >
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {imagePreviews.map((preview, index) => (
                              <SortableImage
                                key={`img-${index}`}
                                id={`img-${index}`}
                                preview={preview}
                                index={index}
                                isCover={formData.coverImageIndex === index}
                                onSetCover={setCoverImage}
                                onRemove={removeImage}
                                isOptimizing={optimizingImages.has(index)}
                                optimizationProgress={optimizationProgress.get(index)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>

                      <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                        <i className="ri-information-line"></i>
                        Pasa el cursor sobre una foto para ver las opciones. Usa el ícono <i className="ri-drag-move-2-line mx-1"></i> para arrastrar y cambiar el orden.
                      </p>
                    </div>
                  )}
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    <i className="ri-video-line text-teal-600 mr-1"></i>
                    Video o Tour Virtual (Opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3.5 text-sm border-2 rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all border-slate-200 hover:border-slate-300"
                  />
                  <p className="text-xs text-slate-500 mt-2"><i className="ri-information-line mr-1"></i>Pega el enlace de YouTube, Vimeo o Matterport</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                  <i className="ri-send-plane-line text-white text-2xl"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Publicación y Contacto</h2>
                  <p className="text-sm text-slate-500 mt-1">Asignación y estado de publicación</p>
                </div>
              </div>
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">
                    <i className="ri-user-star-line text-teal-600 mr-1"></i>
                    Asignar Agente <span className="text-red-500">*</span>
                  </label>
                  {loadingAgents ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-6 rounded-xl border-2 border-slate-200 flex items-center gap-4 animate-pulse">
                          <div className="w-16 h-16 rounded-full bg-slate-200"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : agents.length === 0 ? (
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-8 text-center">
                      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-user-add-line text-amber-600 text-3xl"></i>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">No hay agentes registrados</h3>
                      <p className="text-sm text-slate-600 mb-4">Debes registrar al menos un agente antes de publicar una propiedad</p>
                      <button type="button" onClick={() => navigate('/admin/agents')} className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-all whitespace-nowrap cursor-pointer">
                        <i className="ri-user-settings-line"></i>
                        Gestionar Agentes
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {agents.map((agent) => (
                        <button key={agent.id} type="button" onClick={() => handleInputChange('assignedAgent', agent.id)} className={`p-6 rounded-xl border-2 transition-all duration-300 flex items-center gap-4 cursor-pointer ${formData.assignedAgent === agent.id ? 'bg-teal-50 border-teal-500 shadow-md' : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'}`}>
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-slate-100">
                            {agent.photo_url ? (
                              <img src={agent.photo_url} alt={`${agent.first_name} ${agent.last_name}`} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-teal-100">
                                <i className="ri-user-line text-teal-600 text-xl"></i>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <h4 className="font-bold text-slate-800">{agent.first_name} {agent.last_name}</h4>
                            <p className="text-xs text-slate-500 mt-1"><i className="ri-phone-line mr-1"></i>{agent.phone}</p>
                          </div>
                          {formData.assignedAgent === agent.id && <i className="ri-checkbox-circle-fill text-teal-500 text-2xl"></i>}
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.assignedAgent && <p className="text-xs text-red-600 mt-3 flex items-center gap-1"><i className="ri-error-warning-line"></i>{errors.assignedAgent}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-4">
                    <i className="ri-eye-line text-teal-600 mr-1"></i>
                    Estado de Publicación
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: 'borrador', label: 'Borrador', icon: 'ri-draft-line', color: 'slate' },
                      { value: 'publicado', label: 'Publicado', icon: 'ri-global-line', color: 'green' },
                      { value: 'vendido', label: 'Vendido', icon: 'ri-check-double-line', color: 'red' },
                      { value: 'destacado', label: 'Destacado', icon: 'ri-star-line', color: 'yellow' },
                    ].map((status) => (
                      <button key={status.value} type="button" onClick={() => handleInputChange('publicationStatus', status.value)} className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-3 cursor-pointer ${formData.publicationStatus === status.value ? `bg-${status.color}-50 border-${status.color}-500 shadow-md` : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'}`}>
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${formData.publicationStatus === status.value ? `bg-${status.color}-500 text-white` : 'bg-slate-100 text-slate-600'}`}>
                          <i className={`${status.icon} text-2xl`}></i>
                        </div>
                        <span className={`text-sm font-semibold ${formData.publicationStatus === status.value ? `text-${status.color}-700` : 'text-slate-700'}`}>{status.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-slate-200">
          {currentStep > 1 ? (
            <button type="button" onClick={() => { setCurrentStep(currentStep - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={isSaving} className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all duration-300 whitespace-nowrap disabled:opacity-50 cursor-pointer">
              <i className="ri-arrow-left-line"></i>Anterior
            </button>
          ) : <div></div>}

          {currentStep < totalSteps ? (
            <button type="button" onClick={handleNext} disabled={isSaving || !isSlugValid} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 whitespace-nowrap disabled:opacity-50 cursor-pointer">
              Siguiente<i className="ri-arrow-right-line"></i>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleOpenPreview} disabled={isSaving || !isSlugValid} className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-teal-500 text-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-all duration-300 whitespace-nowrap disabled:opacity-50 cursor-pointer">
                <i className="ri-eye-line text-lg"></i>Vista Previa
              </button>
              <button type="button" onClick={handleSubmit} disabled={isSaving || !isSlugValid} className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-base hover:shadow-xl transition-all duration-300 hover:scale-105 whitespace-nowrap disabled:opacity-50 cursor-pointer">
                {isSaving ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Guardando...</>
                ) : (
                  <><i className="ri-save-line text-xl"></i>{editId ? 'Actualizar Propiedad' : 'Guardar y Publicar'}</>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-6 rounded-t-2xl z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      <i className="ri-eye-line text-teal-600"></i>Vista Previa de la Propiedad
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Así se verá tu propiedad en la página pública</p>
                  </div>
                  <button onClick={handleClosePreview} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer">
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden shadow-lg">
                  <div className="relative w-full h-80 bg-slate-100">
                    {imagePreviews.length > 0 ? (
                      <img src={imagePreviews[formData.coverImageIndex] || imagePreviews[0]} alt="Vista previa" className="w-full h-full object-cover object-top" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <i className="ri-image-line text-slate-300 text-6xl mb-3"></i>
                          <p className="text-slate-400 text-sm">Sin imagen</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      {formData.publicationStatus === 'destacado' && (
                        <span className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <i className="ri-star-fill"></i> Destacado
                        </span>
                      )}
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${formData.operationType.includes('arriendo') ? 'bg-[#d4816f] text-white' : 'bg-emerald-500 text-white'}`}>
                        {formData.operationType || 'Sin tipo'}
                      </span>
                      <span className="bg-white/95 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        {formData.propertyType || 'Sin tipo'}
                      </span>
                    </div>
                    {imagePreviews.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                        {imagePreviews.length} fotos
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="text-2xl font-bold text-slate-900 mb-3">{formData.title || 'Sin título'}</h4>
                    <div className="flex items-center gap-2 text-slate-600 mb-4">
                      <i className="ri-map-pin-line text-[#d4816f]"></i>
                      <span className="text-sm">{formData.neighborhood || 'Sin barrio'}, {formData.city || 'Sin ciudad'}, {formData.department || 'Sin departamento'}</span>
                    </div>
                    <div className="mb-6">
                      <p className="text-3xl font-bold text-slate-900">
                        {formData.price ? `$ ${formatNumber(formData.price)}` : 'Sin precio'}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">{formData.currency}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {formData.builtArea && Number(formData.builtArea) > 0 && (
                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                          <div className="w-10 h-10 bg-[#d4816f]/10 rounded-lg flex items-center justify-center"><i className="ri-ruler-line text-[#d4816f] text-lg"></i></div>
                          <div><p className="text-xs text-slate-500">Área</p><p className="text-sm font-bold text-slate-900">{formData.builtArea}m²</p></div>
                        </div>
                      )}
                      {formData.bedrooms > 0 && (
                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                          <div className="w-10 h-10 bg-[#d4816f]/10 rounded-lg flex items-center justify-center"><i className="ri-hotel-bed-line text-[#d4816f] text-lg"></i></div>
                          <div><p className="text-xs text-slate-500">Habitaciones</p><p className="text-sm font-bold text-slate-900">{formData.bedrooms}</p></div>
                        </div>
                      )}
                      {formData.bathrooms > 0 && (
                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                          <div className="w-10 h-10 bg-[#d4816f]/10 rounded-lg flex items-center justify-center"><i className="ri-shower-line text-[#d4816f] text-lg"></i></div>
                          <div><p className="text-xs text-slate-500">Baños</p><p className="text-sm font-bold text-slate-900">{formData.bathrooms}</p></div>
                        </div>
                      )}
                      {formData.parkingSpots > 0 && (
                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                          <div className="w-10 h-10 bg-[#d4816f]/10 rounded-lg flex items-center justify-center"><i className="ri-car-line text-[#d4816f] text-lg"></i></div>
                          <div><p className="text-xs text-slate-500">Parqueaderos</p><p className="text-sm font-bold text-slate-900">{formData.parkingSpots}</p></div>
                        </div>
                      )}
                    </div>
                    {formData.description && formData.description.trim() && (
                      <div className="mb-6">
                        <h5 className="text-base font-bold text-slate-900 mb-2">Descripción</h5>
                        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line line-clamp-4">{formData.description}</p>
                      </div>
                    )}
                    {formData.assignedAgent && (
                      <div className="border-t border-slate-200 pt-6 mt-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#d4816f]/20 bg-slate-100">
                            {agents.find(a => a.id === formData.assignedAgent)?.photo_url ? (
                              <img src={agents.find(a => a.id === formData.assignedAgent)?.photo_url || ''} alt="Agente" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-teal-100"><i className="ri-user-line text-teal-600 text-xl"></i></div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Agente asignado</p>
                            <p className="text-sm font-bold text-slate-900">
                              {(() => { const a = agents.find(ag => ag.id === formData.assignedAgent); return a ? `${a.first_name} ${a.last_name}` : 'Agente'; })()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
                  <i className="ri-information-line text-teal-600 text-xl mt-0.5"></i>
                  <div>
                    <p className="text-sm font-semibold text-teal-900 mb-1">Esta es una vista previa aproximada</p>
                    <p className="text-xs text-teal-700">Puedes cerrar esta vista y hacer ajustes antes de guardar.</p>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-8 py-6 rounded-b-2xl">
                <div className="flex items-center justify-end gap-3">
                  <button onClick={handleClosePreview} className="px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-white transition-all whitespace-nowrap cursor-pointer">
                    Cerrar Vista Previa
                  </button>
                  <button onClick={handleSubmitFromPreview} disabled={isSaving} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap disabled:opacity-50 cursor-pointer">
                    {isSaving ? (
                      <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Guardando...</>
                    ) : (
                      <><i className="ri-save-line text-xl"></i>{editId ? 'Actualizar Propiedad' : 'Guardar y Publicar'}</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-checkbox-circle-fill text-green-500 text-5xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {editId ? '¡Propiedad Actualizada!' : '¡Propiedad Guardada!'}
                </h3>
                <p className="text-slate-600 mb-6">
                  {editId ? 'Los cambios se han guardado exitosamente.' : 'La propiedad se ha guardado exitosamente y está lista para ser gestionada.'}
                </p>
                <button onClick={handleCloseSuccessModal} className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 whitespace-nowrap cursor-pointer">
                  Ir al Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
