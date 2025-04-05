import { useState, useEffect, useMemo } from "react";

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
      if (container) {
        observer.unobserve(container);
      }
      observer.disconnect();
    };
  }, [containerRef]);

  useEffect(() => {
    if (!crop || !imageObject || containerWidth <= 0) {
      setDisplaySize(DEFAULT_SIZE);
      return;
    }

    const cropWidth = crop.width || 1;
    const cropHeight = crop.height || 1;
    const imageWidth = imageObject.width || imageObject.naturalWidth || 1;
    const imageHeight = imageObject.height || imageObject.naturalHeight || 1;

    let cropAspectRatio = cropWidth / cropHeight;
    if (
      isNaN(cropAspectRatio) ||
      !isFinite(cropAspectRatio) ||
      cropAspectRatio <= 0
    ) {
      cropAspectRatio = imageWidth / imageHeight;
      if (
        isNaN(cropAspectRatio) ||
        !isFinite(cropAspectRatio) ||
        cropAspectRatio <= 0
      ) {
        cropAspectRatio = 1;
      }
    }

    let targetWidth = containerWidth;
    let targetHeight = targetWidth / cropAspectRatio;
    targetWidth = Math.max(1, Math.round(targetWidth));
    targetHeight = Math.max(1, Math.round(targetHeight));
    const scale = targetWidth / cropWidth;

    setDisplaySize({
      width: targetWidth,
      height: targetHeight,
      scale: isFinite(scale) ? scale : 1,
    });
  }, [containerWidth, crop, imageObject]);

  return displaySize;
}
