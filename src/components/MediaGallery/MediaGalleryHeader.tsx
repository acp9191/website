interface MediaGalleryHeaderProps {
  title: string;
  subtitle: string;
}

/*
  Animated in CSS, like the home and about pages. It used to be revealed by an
  IntersectionObserver, which kept the page's <h1> at opacity 0 in the server
  HTML until hydration, and forever without JavaScript.
*/
export function MediaGalleryHeader({ title, subtitle }: MediaGalleryHeaderProps) {
  return (
    <div className="text-center">
      <h1
        className="text-4xl font-bold text-gray-900 dark:text-white mb-3 animate-fade-up"
        style={{ animationDelay: '100ms' }}
      >
        {title}
      </h1>
      <p
        className="text-xl text-gray-600 dark:text-gray-400 font-light animate-fade-up"
        style={{ animationDelay: '200ms' }}
      >
        {subtitle}
      </p>
    </div>
  );
}
