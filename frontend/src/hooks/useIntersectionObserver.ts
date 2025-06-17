// src/hooks/useIntersectionObserver.ts
import { useEffect, useRef, useState } from 'react';

export interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    root = null,
    triggerOnce = true,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<Element | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);

        if (isElementIntersecting && !hasIntersected) {
          setHasIntersected(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        }
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, root, triggerOnce, hasIntersected]);

  return {
    ref,
    isIntersecting,
    hasIntersected,
  };
};

export const useMultipleIntersectionObserver = (
  elementsCount: number,
  options: UseIntersectionObserverOptions = {}
) => {
  const [intersections, setIntersections] = useState<boolean[]>(
    new Array(elementsCount).fill(false)
  );
  const refs = useRef<(Element | null)[]>(new Array(elementsCount).fill(null));

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = refs.current.indexOf(entry.target);
          if (index !== -1) {
            setIntersections((prev) => {
              const newIntersections = [...prev];
              newIntersections[index] = entry.isIntersecting;
              return newIntersections;
            });
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
        root: options.root || null,
      }
    );

    refs.current.forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      refs.current.forEach((element) => {
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [options.threshold, options.rootMargin, options.root]);

  const setRef = (index: number) => (element: Element | null) => {
    refs.current[index] = element;
  };

  return {
    intersections,
    setRef,
  };
};