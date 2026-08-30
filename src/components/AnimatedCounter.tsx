'use client';

import { useState, useEffect, useRef } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 800 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);

  // The currently displayed number, tracked in a ref so the effect can read it
  // without depending on it. Depending on `displayValue` would re-run the
  // effect on every animated frame, each run starting another rAF chain on top
  // of the ones already running.
  const displayRef = useRef(value);

  useEffect(() => {
    const startValue = displayRef.current;
    if (startValue === value) return;

    const difference = value - startValue;
    const startTime = performance.now();
    let frame: number;

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);

      // More pronounced easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      const currentValue = Math.round(startValue + difference * easeOutQuart);
      displayRef.current = currentValue;
      setDisplayValue(currentValue);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      } else {
        displayRef.current = value; // Ensure final value is exact
        setDisplayValue(value);
      }
    };

    frame = requestAnimationFrame(animate);

    // Cancel in flight when `value` changes again mid-animation, or on unmount.
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

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
