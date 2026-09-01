'use client';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import clsx from 'clsx';
import { useRevealOnScroll } from '@/src/hooks/useRevealOnScroll';
import {
  getOptimizedImageUrl,
  BLUR_PLACEHOLDER,
  HEADSHOT_URL,
} from '@/src/utils/imageOptimization';
export default function AboutContent() {
  const t = useTranslations('About');
  const { visible: isVisible, ref: contentRef } = useRevealOnScroll<HTMLElement>();

  return (
    <section
      ref={contentRef}
      className={clsx('space-y-6 px-4 transition-all duration-700 ease-out', {
        'opacity-100 translate-y-0': isVisible,
        'opacity-0 translate-y-8': !isVisible,
      })}
    >
      <div
        className={clsx(
          'mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md transition-all duration-700 ease-out',
          {
            'opacity-100 translate-y-0': isVisible,
            'opacity-0 translate-y-4': !isVisible,
          }
        )}
        style={{ transitionDelay: '100ms' }}
      >
        <Image
          src={getOptimizedImageUrl(HEADSHOT_URL)}
          alt={t('imageAlt')}
          width={400}
          height={400}
          className="rounded-xl shadow-md w-full h-auto"
          priority={true}
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
        />
      </div>

      <h1
        className={clsx('text-4xl font-bold text-center transition-all duration-700 ease-out', {
          'opacity-100 translate-y-0': isVisible,
          'opacity-0 translate-y-4': !isVisible,
        })}
        style={{ transitionDelay: '200ms' }}
      >
        {t('title')}
      </h1>

      <p
        className={clsx(
          'text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center transition-all duration-700 ease-out',
          {
            'opacity-100 translate-y-0': isVisible,
            'opacity-0 translate-y-4': !isVisible,
          }
        )}
        style={{ transitionDelay: '300ms' }}
      >
        {t('description1')}
      </p>

      <p
        className={clsx(
          'text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center transition-all duration-700 ease-out',
          {
            'opacity-100 translate-y-0': isVisible,
            'opacity-0 translate-y-4': !isVisible,
          }
        )}
        style={{ transitionDelay: '400ms' }}
      >
        {t('description2')}
      </p>

      <p
        className={clsx(
          'text-lg text-gray-700 dark:text-gray-300 leading-relaxed text-center transition-all duration-700 ease-out',
          {
            'opacity-100 translate-y-0': isVisible,
            'opacity-0 translate-y-4': !isVisible,
          }
        )}
        style={{ transitionDelay: '500ms' }}
      >
        {t('description3')}
      </p>
    </section>
  );
}
