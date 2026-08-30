'use client';

import { useEffect } from 'react';

/**
 * Deliberately not translated. If the failure being caught is in the i18n
 * provider itself, calling `useTranslations` here would throw inside the error
 * boundary and take the fallback down with it.
 */
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-gray-600 dark:text-gray-400">
        An unexpected error occurred. Try again, or head back to the homepage.
      </p>
      <button
        onClick={reset}
        className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
      >
        Try again
      </button>
    </section>
  );
}
