/**
 * Componente de optimización de imágenes con indicador de progreso
 * 
 * Muestra el progreso de optimización de imágenes en tiempo real
 * con estadísticas de compresión y mensajes informativos
 */

import { OptimizationProgress } from '../utils/imageOptimizer';

interface ImageOptimizationProgressProps {
  fileName: string;
  progress: OptimizationProgress;
  originalSize?: number;
  optimizedSize?: number;
}

export default function ImageOptimizationProgress({
  fileName,
  progress,
  originalSize,
  optimizedSize,
}: ImageOptimizationProgressProps) {
  const getStageIcon = (stage: OptimizationProgress['stage']) => {
    switch (stage) {
      case 'validating':
        return 'ri-shield-check-line';
      case 'converting':
        return 'ri-refresh-line';
      case 'resizing':
        return 'ri-aspect-ratio-line';
      case 'compressing':
        return 'ri-file-reduce-line';
      case 'complete':
        return 'ri-checkbox-circle-line';
      default:
        return 'ri-loader-4-line';
    }
  };

  const getStageColor = (stage: OptimizationProgress['stage']) => {
    switch (stage) {
      case 'validating':
        return 'text-blue-600';
      case 'converting':
        return 'text-purple-600';
      case 'resizing':
        return 'text-orange-600';
      case 'compressing':
        return 'text-teal-600';
      case 'complete':
        return 'text-green-600';
      default:
        return 'text-slate-600';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const compressionRatio = originalSize && optimizedSize
    ? Math.round(((originalSize - optimizedSize) / originalSize) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          progress.stage === 'complete' ? 'bg-green-100' : 'bg-teal-100'
        }`}>
          <i className={`${getStageIcon(progress.stage)} ${getStageColor(progress.stage)} text-xl ${
            progress.stage !== 'complete' ? 'animate-spin' : ''
          }`}></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{fileName}</p>
          <p className="text-xs text-slate-500">{progress.message}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-teal-600">{progress.progress}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-300 ease-out"
          style={{ width: `${progress.progress}%` }}
        ></div>
      </div>

      {/* Stats */}
      {originalSize && optimizedSize && progress.stage === 'complete' && (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Original</p>
            <p className="text-sm font-bold text-slate-700">{formatBytes(originalSize)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Optimizado</p>
            <p className="text-sm font-bold text-teal-600">{formatBytes(optimizedSize)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-1">Reducción</p>
            <p className="text-sm font-bold text-green-600">{compressionRatio}%</p>
          </div>
        </div>
      )}
    </div>
  );
}