
'use client';

import { useEffect, useState, useRef } from 'react';

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

interface AnimatedNumberProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  formatOptions?: Intl.NumberFormatOptions;
}

export function AnimatedNumber({ 
  value, 
  decimals = 4, 
  prefix = '',
  suffix = '',
  formatOptions,
  className, 
  ...rest 
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animationRef = useRef<number>();

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    const duration = 1500; // Animation duration in ms

    const animate = (startTime: number) => {
      const now = Date.now();
      const elapsedTime = now - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easeOutExpo(progress);
      
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(() => animate(startTime));
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };
    
    animationRef.current = requestAnimationFrame(() => animate(Date.now()));

    return () => {
      if(animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      prevValueRef.current = value;
    };
  }, [value]);

  const formatValue = (num: number): string => {
    if (formatOptions) {
      return new Intl.NumberFormat('en-US', formatOptions).format(num);
    }
    return num.toFixed(decimals);
  };

  return (
    <span className={className} {...rest}>
      {prefix}{formatValue(displayValue)}{suffix}
    </span>
  );
}
