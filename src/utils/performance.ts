import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { createCompatibleImage } from './web-polyfills';

export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const lastRun = useRef<number>(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  );
};

export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
) => {
  return useMemo(() => callback, deps);
};

export const usePlatformSpecificValue = <T>(options: {
  ios?: T;
  android?: T;
  default: T;
}) => {
  return useMemo(() => {
    if (Platform.OS === 'ios' && options.ios !== undefined) {
      return options.ios;
    }
    if (Platform.OS === 'android' && options.android !== undefined) {
      return options.android;
    }
    return options.default;
  }, [options]);
};

export const useLazyLoad = <T>(
  data: T[],
  initialCount: number,
  increment: number
) => {
  const [displayCount, setDisplayCount] = useState(initialCount);

  const loadMore = useCallback(() => {
    setDisplayCount((prev) => prev + increment);
  }, [increment]);

  const displayedData = useMemo(() => {
    return data.slice(0, displayCount);
  }, [data, displayCount]);

  const hasMore = useMemo(() => {
    return displayCount < data.length;
  }, [displayCount, data.length]);

  return {
    displayedData,
    loadMore,
    hasMore,
  };
};

export const useImageCache = (url: string) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const image = createCompatibleImage();
    image.src = url;
    image.onload = () => setIsLoaded(true);
    image.onerror = (e) => setError(e instanceof Error ? e : new Error('Failed to load image'));
  }, [url]);

  return { isLoaded, error };
};

export const usePerformanceMonitor = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(
        `Performance [${componentName}]: ${(endTime - startTime).toFixed(2)}ms`
      );
    };
  }, [componentName]);
}; 