import { useState, useEffect, useRef, RefObject } from 'react';

interface IntersectionOptions extends IntersectionObserverInit {
  triggerOnce?: boolean;
  delay?: number;
}

export function useInView<T extends Element = Element>(
  options: IntersectionOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0, root = null, rootMargin = '0px', triggerOnce = false, delay = 0 } = options;
  
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [element, setElement] = useState<Element | null>(null);
  const savedCallback = useRef<typeof setIsIntersecting>(setIsIntersecting);
  const observer = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<T>(null);
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save the latest callback
  useEffect(() => {
    savedCallback.current = setIsIntersecting;
  }, []);

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;
    
    setElement(node);

    observer.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        const updateState = () => {
          savedCallback.current(entry.isIntersecting);
          
          // Cleanup observer if triggerOnce is true and element is intersecting
          if (triggerOnce && entry.isIntersecting && observer.current) {
            observer.current.disconnect();
          }
        };
        
        // Handle delay if specified
        if (delay > 0) {
          if (delayTimer.current) clearTimeout(delayTimer.current);
          
          delayTimer.current = setTimeout(updateState, delay);
        } else {
          updateState();
        }
      },
      { threshold, root, rootMargin }
    );
    
    const { current: currentObserver } = observer;
    
    if (currentObserver) {
      currentObserver.observe(node);
    }
    
    return () => {
      if (delayTimer.current) {
        clearTimeout(delayTimer.current);
      }
      
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [threshold, root, rootMargin, triggerOnce, delay, element]);
  
  return [elementRef, isIntersecting];
}
