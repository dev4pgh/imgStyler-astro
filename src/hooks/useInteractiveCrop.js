import { useState, useEffect, useCallback } from "react";

const MIN_CROP_SIZE_DISPLAY = 20;
const HANDLE_SIZE = 12;

export function useInteractiveCrop({
  containerRef,
  canvasWidth,
  canvasHeight,
  aspectRatio,
  lockAspectRatio,
  isCropping,
  cropRounding,
  disabled = false,
}) {
  const [interactiveCrop, setInteractiveCrop] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startCropData, setStartCropData] = useState(null);

  useEffect(() => {
    if (isCropping && !disabled) {
      if (canvasWidth <= 0 || canvasHeight <= 0) {
        console.warn(
          "Cannot initialize interactive crop: Canvas size unknown or invalid."
        );
        setInteractiveCrop(null);
        onCropChange?.(null);
        return;
      }

      let initialWidth = canvasWidth;
      let initialHeight = canvasHeight;
      let initialX = 0;
      let initialY = 0;

      if (aspectRatio) {
        const displayRatio = canvasWidth / canvasHeight;
        if (aspectRatio > displayRatio) {
          initialHeight = initialWidth / aspectRatio;
        } else {
          initialWidth = initialHeight * aspectRatio;
        }
        initialX = (canvasWidth - initialWidth) / 2;
        initialY = (canvasHeight - initialHeight) / 2;
      }

      const initialCropData = {
        x: Math.round(initialX),
        y: Math.round(initialY),
        width: Math.round(Math.max(MIN_CROP_SIZE_DISPLAY, initialWidth)),
        height: Math.round(Math.max(MIN_CROP_SIZE_DISPLAY, initialHeight)),
      };
      setInteractiveCrop(initialCropData);
    } else {
      setInteractiveCrop(null);
      setIsDragging(false);
      setIsResizing(false);
      setStartPos({ x: 0, y: 0 });
      setStartCropData(null);
    }
  }, [isCropping, aspectRatio, canvasWidth, canvasHeight, disabled]);

  const getMousePos = useCallback(
    (e) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    [containerRef]
  );

  const handleInteractionStart = useCallback(
    (e) => {
      if (disabled || !isCropping || !interactiveCrop) return;
      const mousePos = getMousePos(e);
      const handleX =
        interactiveCrop.x + interactiveCrop.width - HANDLE_SIZE / 2;
      const handleY =
        interactiveCrop.y + interactiveCrop.height - HANDLE_SIZE / 2;
      const handleArea = {
        x: handleX - HANDLE_SIZE,
        y: handleY - HANDLE_SIZE,
        width: HANDLE_SIZE * 2,
        height: HANDLE_SIZE * 2,
      };
      let interactionType = null;
      if (
        mousePos.x >= handleArea.x &&
        mousePos.x <= handleArea.x + handleArea.width &&
        mousePos.y >= handleArea.y &&
        mousePos.y <= handleArea.y + handleArea.height
      ) {
        interactionType = "resize";
      } else if (
        mousePos.x >= interactiveCrop.x &&
        mousePos.x <= interactiveCrop.x + interactiveCrop.width &&
        mousePos.y >= interactiveCrop.y &&
        mousePos.y <= interactiveCrop.y + interactiveCrop.height
      ) {
        interactionType = "drag";
      }

      if (interactionType) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(interactionType === "drag");
        setIsResizing(interactionType === "resize");
        setStartPos(mousePos);
        setStartCropData(interactiveCrop);
      }
    },
    [disabled, isCropping, interactiveCrop, getMousePos]
  );

  const handleInteractionMove = useCallback(
    (e) => {
      if (disabled || (!isDragging && !isResizing) || !startCropData) return;

      e.preventDefault();
      e.stopPropagation();

      const mousePos = getMousePos(e);
      const dx = mousePos.x - startPos.x;
      const dy = mousePos.y - startPos.y;

      let newCropData = { ...startCropData };
      const bounds = { width: canvasWidth || 0, height: canvasHeight || 0 };

      if (bounds.width <= 0 || bounds.height <= 0) return;

      if (isDragging) {
        newCropData.x = startCropData.x + dx;
        newCropData.y = startCropData.y + dy;
        newCropData.x = Math.max(
          0,
          Math.min(newCropData.x, bounds.width - newCropData.width)
        );
        newCropData.y = Math.max(
          0,
          Math.min(newCropData.y, bounds.height - newCropData.height)
        );
      } else if (isResizing) {
        let newWidth = startCropData.width + dx;
        let newHeight = startCropData.height + dy;
        newWidth = Math.max(MIN_CROP_SIZE_DISPLAY, newWidth);
        newHeight = Math.max(MIN_CROP_SIZE_DISPLAY, newHeight);
        newWidth = Math.min(newWidth, bounds.width - newCropData.x);
        newHeight = Math.min(newHeight, bounds.height - newCropData.y);
        if (lockAspectRatio && aspectRatio && aspectRatio > 0) {
          let adjustedHeight = newWidth / aspectRatio;
          if (newCropData.y + adjustedHeight > bounds.height) {
            adjustedHeight = bounds.height - newCropData.y;
            newWidth = adjustedHeight * aspectRatio;
          }
          if (newWidth < MIN_CROP_SIZE_DISPLAY) {
            newWidth = MIN_CROP_SIZE_DISPLAY;
            adjustedHeight = newWidth / aspectRatio;
            if (newCropData.y + adjustedHeight > bounds.height) {
              adjustedHeight = bounds.height - newCropData.y;
            }
          }
          if (adjustedHeight < MIN_CROP_SIZE_DISPLAY) {
            adjustedHeight = MIN_CROP_SIZE_DISPLAY;
            newWidth = adjustedHeight * aspectRatio;
            if (newCropData.x + newWidth > bounds.width) {
              newWidth = bounds.width - newCropData.x;
            }
          }
          newHeight = adjustedHeight;
        }
        newCropData.width = Math.max(
          MIN_CROP_SIZE_DISPLAY,
          Math.min(newWidth, bounds.width - newCropData.x)
        );
        newCropData.height = Math.max(
          MIN_CROP_SIZE_DISPLAY,
          Math.min(newHeight, bounds.height - newCropData.y)
        );
      }

      const finalCrop = {
        x: Math.round(newCropData.x),
        y: Math.round(newCropData.y),
        width: Math.round(newCropData.width),
        height: Math.round(newCropData.height),
      };
      setInteractiveCrop(finalCrop);
    },
    [
      disabled,
      isDragging,
      isResizing,
      startCropData,
      startPos,
      canvasWidth,
      canvasHeight,
      lockAspectRatio,
      aspectRatio,
      getMousePos,
    ]
  );

  const handleInteractionEnd = useCallback(
    (e) => {
      if (disabled) return;
      if (isDragging || isResizing) {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        setIsResizing(false);
        setStartPos({ x: 0, y: 0 });
        setStartCropData(null);
      }
    },
    [disabled, isDragging, isResizing]
  );

  useEffect(() => {
    if (disabled || (!isDragging && !isResizing)) {
      return;
    }
    window.addEventListener("mousemove", handleInteractionMove);
    window.addEventListener("mouseup", handleInteractionEnd);
    window.addEventListener("touchmove", handleInteractionMove, {
      passive: false,
    });
    window.addEventListener("touchend", handleInteractionEnd);
    window.addEventListener("mouseleave", handleInteractionEnd);

    return () => {
      window.removeEventListener("mousemove", handleInteractionMove);
      window.removeEventListener("mouseup", handleInteractionEnd);
      window.removeEventListener("touchmove", handleInteractionMove);
      window.removeEventListener("touchend", handleInteractionEnd);
      window.removeEventListener("mouseleave", handleInteractionEnd);
    };
  }, [
    disabled,
    isDragging,
    isResizing,
    handleInteractionMove,
    handleInteractionEnd,
  ]);

  const overlayStyle =
    interactiveCrop && isCropping && !disabled
      ? {
          position: "absolute",
          border: "2px solid rgb(59, 130, 246)",
          cursor: isDragging ? "grabbing" : isResizing ? "nwse-resize" : "grab",
          left: `${interactiveCrop.x}px`,
          top: `${interactiveCrop.y}px`,
          width: `${interactiveCrop.width}px`,
          height: `${interactiveCrop.height}px`,
          pointerEvents: "auto",
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
          boxSizing: "border-box",
          borderRadius: `${cropRounding || 0}%`,
          touchAction: "none",
        }
      : { display: "none" };

  const handleStyle =
    interactiveCrop && isCropping && !disabled
      ? {
          position: "absolute",
          width: `${HANDLE_SIZE}px`,
          height: `${HANDLE_SIZE}px`,
          background: "rgb(59, 130, 246)",
          right: `-${HANDLE_SIZE / 2}px`,
          bottom: `-${HANDLE_SIZE / 2}px`,
          cursor: "nwse-resize",
          borderRadius: "2px",
          border: "1px solid white",
          boxSizing: "border-box",
          pointerEvents: "auto",
          touchAction: "none",
        }
      : { display: "none" };

  const overlayProps = {
    style: overlayStyle,
    onMouseDown: handleInteractionStart,
    onTouchStart: handleInteractionStart,
    onClick: (e) => e.stopPropagation(),
  };

  const handleProps = {
    style: handleStyle,
    onMouseDown: handleInteractionStart,
    onTouchStart: handleInteractionStart,
    onClick: (e) => e.stopPropagation(),
  };

  return {
    interactiveCrop,
    overlayProps,
    handleProps,
    isInteracting: isDragging || isResizing,
    isResizing,
  };
}
