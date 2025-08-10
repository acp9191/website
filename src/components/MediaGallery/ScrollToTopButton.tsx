import clsx from 'clsx';

interface ScrollToTopButtonProps {
  show: boolean;
  onClick: () => void;
}

export function ScrollToTopButton({ show, onClick }: ScrollToTopButtonProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'fixed bottom-6 right-6 p-3 rounded-full bg-black hover:bg-gray-800 text-white shadow-lg transition-all duration-300 z-30 cursor-pointer',
        {
          'opacity-100 translate-y-0': show,
          'opacity-0 translate-y-4 pointer-events-none': !show,
        }
      )}
      aria-label="Scroll to top"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 10l7-7m0 0l7 7m-7-7v18"
        />
      </svg>
    </button>
  );
}
