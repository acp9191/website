'use client';

import { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 800 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    // Initialize displayValue on first render
    if (displayValue === 0 && value > 0) {
      setDisplayValue(value);
      return;
    }

    if (value !== displayValue) {
      const startValue = displayValue;
      const difference = value - startValue;
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // More pronounced easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        const currentValue = Math.round(startValue + difference * easeOutQuart);
        setDisplayValue(currentValue);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(value); // Ensure final value is exact
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, displayValue, duration]);

  return (
    <span
      className="inline-block"
      style={{
        minWidth: '2ch', // Ensures consistent width
        textAlign: 'center',
      }}
    >
      {displayValue}
    </span>
  );
}
