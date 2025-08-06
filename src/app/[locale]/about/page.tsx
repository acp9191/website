'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

export default function AboutPage() {
  const t = useTranslations('About');
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Set up Intersection Observer for fade-in animation
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (contentRef.current) {
      observerRef.current.observe(contentRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

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
          src="https://res.cloudinary.com/acp/image/upload/v1754157313/acp_headshot_nhlged.jpg"
          alt={t('imageAlt')}
          width={400}
          height={400}
          className="rounded-xl shadow-md w-full h-auto"
          priority={true}
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
