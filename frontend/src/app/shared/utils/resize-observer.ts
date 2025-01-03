import { Observable } from 'rxjs';

export const resizeObserver = (
  target: HTMLElement,
  options: { observe: 'width' | 'height' },
) => {
  return new Observable<void>((observer) => {
    let previousSize =
      options.observe === 'width' ? target.clientWidth : target.clientHeight;

    const resizeObserver = new ResizeObserver((entries: any[]) => {
      entries.forEach((entry) => {
        if (entry.contentRect) {
          const currentSize =
            options.observe === 'width'
              ? entry.contentRect.width
              : entry.contentRect.height;

          if (previousSize !== currentSize) {
            previousSize = currentSize;
            observer.next();
          }
        }
      });
    });

    resizeObserver.observe(target);

    const unsubscribe = () => {
      resizeObserver.disconnect();
    };

    return unsubscribe;
  });
};
