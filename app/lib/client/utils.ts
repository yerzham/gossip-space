type ThrottledFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => void;

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ThrottledFunction<T> {
  let lastFunc: NodeJS.Timeout | null = null;
  let lastRan: number | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (!lastRan) {
      func(...args);
      lastRan = now;
    } else {
      if (lastFunc) clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (now - (lastRan ?? 0) >= limit) {
          func(...args);
          lastRan = now;
        }
      }, limit - (now - (lastRan ?? 0)));
    }
  };
}
