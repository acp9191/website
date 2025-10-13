import { useEffect } from 'react';
import clsx from 'clsx';

interface ImageModalProps {
  image: string | null;
  show: boolean;
  animation: 'entering' | 'visible' | 'leaving';
  onClose: () => void;
}

export function ImageModal({ image, show, animation, onClose }: ImageModalProps) {
  // Handle Escape key to close modal
  useEffect(() => {
    if (!show) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [show, onClose]);

  if (!image || !show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview"
      onClick={onClose}
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out',
        {
          'backdrop-blur-sm bg-black/60': animation === 'visible',
          'backdrop-blur-none bg-black/0': animation === 'entering' || animation === 'leaving',
        }
      )}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
        aria-label="Close image preview"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div
        className={clsx('relative transition-all duration-300 ease-out', {
          'scale-100 opacity-100': animation === 'visible',
          'scale-75 opacity-0': animation === 'entering',
          'scale-90 opacity-0': animation === 'leaving',
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image}
          alt="Cover enlarged view"
          className="rounded-xl object-contain shadow-2xl max-w-[70vw] max-h-[70vh] w-auto h-auto"
        />
      </div>
    </div>
  );
}
