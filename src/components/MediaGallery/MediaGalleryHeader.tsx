import type { Ref } from 'react';
import clsx from 'clsx';

interface MediaGalleryHeaderProps {
  visible: boolean;
  title: string;
  subtitle: string;
  /* React 19 passes `ref` to function components as an ordinary prop, so this
     no longer needs forwardRef (and no longer needs a displayName to survive
     the wrapper). */
  ref?: Ref<HTMLDivElement>;
}

export function MediaGalleryHeader({ visible, title, subtitle, ref }: MediaGalleryHeaderProps) {
  return (
    <div
      ref={ref}
      className={clsx('text-center transition-all duration-700 ease-out', {
        'opacity-100 translate-y-0': visible,
        'opacity-0 translate-y-8': !visible,
      })}
    >
      <h1
        className={clsx(
          'text-4xl font-bold text-gray-900 dark:text-white mb-3 transition-all duration-700 ease-out',
          {
            'opacity-100 translate-y-0': visible,
            'opacity-0 translate-y-4': !visible,
          }
        )}
        style={{ transitionDelay: '100ms' }}
      >
        {title}
      </h1>
      <p
        className={clsx(
          'text-xl text-gray-600 dark:text-gray-400 font-light transition-all duration-700 ease-out',
          {
            'opacity-100 translate-y-0': visible,
            'opacity-0 translate-y-4': !visible,
          }
        )}
        style={{ transitionDelay: '200ms' }}
      >
        {subtitle}
      </p>
    </div>
  );
}
