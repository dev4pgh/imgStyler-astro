import { useState, useEffect } from "react";

const DEFAULT_SIZE = { width: 0, height: 0, scale: 1 };

export function useCanvasDisplaySize(containerRef, crop, imageObject) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [displaySize, setDisplaySize] = useState(DEFAULT_SIZE);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setContainerWidth(0);
      return;
    }

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    observer.observe(container);
    setContainerWidth(container.clientWidth);

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  useEffect(() => {
    if (!crop || !imageObject || containerWidth <= 0 || !containerRef.current) {
      setDisplaySize(DEFAULT_SIZE);
      return;
    }

    const cropWidth = crop.width;
    const cropHeight = crop.height;

    if (cropWidth <= 0 || cropHeight <= 0) {
      console.warn("useCanvasDisplaySize: Invalid crop dimensions", crop);
      setDisplaySize(DEFAULT_SIZE);
      return;
    }

    const cropAspectRatio = cropWidth / cropHeight;

    let targetWidth = containerWidth;
    let targetHeight = targetWidth / cropAspectRatio;

    targetWidth = Math.max(1, Math.round(targetWidth));
    targetHeight = Math.max(1, Math.round(targetHeight));

    const scale = targetWidth / cropWidth;

    setDisplaySize({
      width: targetWidth,
      height: targetHeight,
      scale: Number.isFinite(scale) && scale > 0 ? scale : 1,
    });
  }, [containerWidth, crop, imageObject, containerRef]);

  return displaySize;
}
