import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface StatusOption {
  value: string;
  label: string;
  icon: string;
  dotColor: string;
}

interface StatusDropdownPortalProps {
  propertyId: string;
  currentStatus: string;
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onSelect: (status: string) => void;
  onClose: () => void;
  options: StatusOption[];
  getStatusColor: (s: string) => string;
}

export default function StatusDropdownPortal({
  propertyId,
  currentStatus,
  isOpen,
  anchorRef,
  onSelect,
  onClose,
  options,
  getStatusColor,
}: StatusDropdownPortalProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, openUpward: false });

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;

    const updatePosition = () => {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 240;
      const spaceBelow = viewportHeight - rect.bottom;
      const openUpward = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setPosition({
        top: openUpward ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
        left: rect.left,
        openUpward,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, anchorRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999,
      }}
      className="bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 w-52 overflow-hidden"
    >
      <div className="px-4 py-2 border-b border-gray-100 mb-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Cambiar estado
        </p>
      </div>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => {
            onSelect(opt.value);
            onClose();
          }}
          className={`w-full px-4 py-2.5 text-left text-xs font-medium transition-colors cursor-pointer flex items-center gap-3 ${
            opt.value === currentStatus ? 'bg-gray-50' : 'hover:bg-gray-50'
          }`}
        >
          <span className={`w-5 h-5 flex items-center justify-center flex-shrink-0 ${opt.dotColor}`}>
            <i className={`${opt.icon} text-base`}></i>
          </span>
          <span className="flex-1 text-gray-700">{opt.label}</span>
          {opt.value === currentStatus && (
            <i className="ri-check-line text-emerald-500 text-sm flex-shrink-0"></i>
          )}
        </button>
      ))}
    </div>,
    document.body
  );
}
