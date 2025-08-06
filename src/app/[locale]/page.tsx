'use client';
import { useTranslations } from 'next-intl';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

export default function Home() {
  const t = useTranslations('Home');
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Parse the title to find and replace the wave emoji with animated version
  const animatedTitle = () => {
    const title = t('title');
    // Replace the wave emoji with animated version
    return title.replace('👋', '<span class="inline-block animate-wave select-none">👋</span>');
  };

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
          alt="Avery Peterson headshot"
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
        dangerouslySetInnerHTML={{ __html: animatedTitle() }}
      />

      <p
        className={clsx(
          'text-lg text-gray-600 dark:text-gray-400 text-center transition-all duration-700 ease-out',
          {
            'opacity-100 translate-y-0': isVisible,
            'opacity-0 translate-y-4': !isVisible,
          }
        )}
        style={{ transitionDelay: '300ms' }}
      >
        {t('description')}
      </p>
    </section>
  );
}
