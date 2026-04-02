/**
 * Componente de notificación de optimización de imágenes
 * 
 * Muestra notificaciones toast con información sobre el proceso de optimización
 */

interface ImageOptimizationToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  details?: string;
  onClose: () => void;
}

export default function ImageOptimizationToast({
  type,
  message,
  details,
  onClose,
}: ImageOptimizationToastProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'ri-checkbox-circle-fill';
      case 'error':
        return 'ri-error-warning-fill';
      case 'warning':
        return 'ri-alert-fill';
      case 'info':
        return 'ri-information-fill';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          text: 'text-green-900',
          details: 'text-green-700',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          text: 'text-red-900',
          details: 'text-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          text: 'text-amber-900',
          details: 'text-amber-700',
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          text: 'text-blue-900',
          details: 'text-blue-700',
        };
    }
  };

  const colors = getColors();

  return (
    <div className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4 shadow-lg flex items-start gap-3 animate-slide-in-right`}>
      <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
        <i className={`${getIcon()} ${colors.icon} text-xl`}></i>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${colors.text} mb-1`}>{message}</p>
        {details && (
          <p className={`text-xs ${colors.details}`}>{details}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className={`w-8 h-8 flex items-center justify-center ${colors.icon} hover:bg-white/50 rounded-lg transition-all flex-shrink-0 cursor-pointer`}
      >
        <i className="ri-close-line text-lg"></i>
      </button>
    </div>
  );
}