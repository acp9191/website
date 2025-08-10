import clsx from 'clsx';

interface ImageModalProps {
  image: string | null;
  show: boolean;
  animation: 'entering' | 'visible' | 'leaving';
  onClose: () => void;
}

export function ImageModal({ image, show, animation, onClose }: ImageModalProps) {
  if (!image || !show) return null;

  return (
    <div
      onClick={onClose}
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out',
        {
          'backdrop-blur-sm bg-black/60': animation === 'visible',
          'backdrop-blur-none bg-black/0': animation === 'entering' || animation === 'leaving',
        }
      )}
    >
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
