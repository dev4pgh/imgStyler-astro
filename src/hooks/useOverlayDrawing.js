import { useState, useEffect, useCallback } from "react";
import { useEditingContext } from "../context/EditingContext";

const MIN_OVERLAY_SIZE_DISPLAY = 10;

export function useOverlayDrawing({
  setOverlayInteractionState,
  setOverlays,
  containerRef,
}) {
  const context = useEditingContext();
  const {
    overlayInteractionState = { active: false },
    displayScale = 1,
    crop,
    setLastInteractionEndTime,
  } = context || {};

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);

  const getRelativeCoords = useCallback(
    (event) => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    [containerRef]
  );

  const handleInteractionStart = useCallback(
    (event) => {
      if (!overlayInteractionState.active || isDrawing) return;

      const coords = getRelativeCoords(event);
      if (!coords) return;

      event.preventDefault();
      setIsDrawing(true);
      setStartPoint(coords);
      setCurrentRect({ x: coords.x, y: coords.y, width: 0, height: 0 });
    },
    [overlayInteractionState.active, isDrawing, getRelativeCoords]
  );

  const handleInteractionMove = useCallback(
    (event) => {
      if (!isDrawing || !startPoint) return;

      const coords = getRelativeCoords(event);
      if (!coords) return;
      event.preventDefault();
      const width = Math.abs(coords.x - startPoint.x);
      const height = Math.abs(coords.y - startPoint.y);
      const newX = Math.min(coords.x, startPoint.x);
      const newY = Math.min(coords.y, startPoint.y);
      setCurrentRect({ x: newX, y: newY, width, height });
    },
    [isDrawing, startPoint, getRelativeCoords]
  );

  const handleInteractionEnd = useCallback(
    (event) => {
      if (!isDrawing || !currentRect) return;
      event.preventDefault();
      event.stopPropagation();
      setIsDrawing(false);
      setStartPoint(null);
      const finalDisplayRect = currentRect;
      if (
        finalDisplayRect.width >= MIN_OVERLAY_SIZE_DISPLAY &&
        finalDisplayRect.height >= MIN_OVERLAY_SIZE_DISPLAY &&
        displayScale > 0 &&
        crop
      ) {
        const offsetX_from_crop_orig = finalDisplayRect.x / displayScale;
        const offsetY_from_crop_orig = finalDisplayRect.y / displayScale;
        const width_orig = finalDisplayRect.width / displayScale;
        const height_orig = finalDisplayRect.height / displayScale;
        const absoluteX_orig = crop.x + offsetX_from_crop_orig;
        const absoluteY_orig = crop.y + offsetY_from_crop_orig;

        const newOverlayBase = {
          id: `${overlayInteractionState.type}-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 7)}`,
          type: overlayInteractionState.type,
          x: absoluteX_orig,
          y: absoluteY_orig,
          width: width_orig,
          height: height_orig,
        };

        let newOverlay;

        if (overlayInteractionState.type === "text") {
          newOverlay = {
            ...newOverlayBase,
            text: "Enter Text",
            fontSize: 48,
            color: "#FFFFFF",
            fontFamily: "Arial",
            textAlign: "left",
          };
        } else if (overlayInteractionState.type === "blur") {
          newOverlay = {
            ...newOverlayBase,
            intensity: 5,
          };
        } else {
          console.warn(
            "Unhandled overlay type in useOverlayDrawing:",
            overlayInteractionState.type
          );
          newOverlay = newOverlayBase;
        }

        console.log(
          `Adding new ${newOverlay.type} overlay (absolute original coords):`,
          newOverlay
        );
        setOverlays((prev) => [...prev, newOverlay]);
      } else {
        console.log(
          "Overlay draw cancelled (too small, invalid scale, or missing crop).",
          { displayScale, crop }
        );
      }

      setCurrentRect(null);
      setOverlayInteractionState({ active: false, type: null, step: null });
      if (setLastInteractionEndTime) {
        setLastInteractionEndTime(Date.now());
      }
    },
    [
      isDrawing,
      currentRect,
      overlayInteractionState.type,
      setOverlays,
      setOverlayInteractionState,
      displayScale,
      crop,
      setLastInteractionEndTime,
    ]
  );

  useEffect(() => {
    if (!isDrawing) return;
    window.addEventListener("mousemove", handleInteractionMove);
    window.addEventListener("mouseup", handleInteractionEnd);
    window.addEventListener("touchmove", handleInteractionMove, {
      passive: false,
    });
    window.addEventListener("touchend", handleInteractionEnd);

    return () => {
      window.removeEventListener("mousemove", handleInteractionMove);
      window.removeEventListener("mouseup", handleInteractionEnd);
      window.removeEventListener("touchmove", handleInteractionMove);
      window.removeEventListener("touchend", handleInteractionEnd);
    };
  }, [isDrawing, handleInteractionMove, handleInteractionEnd]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        (isDrawing || overlayInteractionState.active)
      ) {
        console.log("Overlay draw cancelled by Escape key");
        setIsDrawing(false);
        setStartPoint(null);
        setCurrentRect(null);
        setOverlayInteractionState({ active: false, type: null, step: null });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawing, overlayInteractionState.active, setOverlayInteractionState]);

  const interactionLayerProps = overlayInteractionState.active
    ? {
        onMouseDown: handleInteractionStart,
        onTouchStart: handleInteractionStart,
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: "crosshair",
          zIndex: 50,
          touchAction: "none",
        },
      }
    : { style: { display: "none" } };

  const drawingRect = isDrawing ? currentRect : null;
  return { interactionLayerProps, drawingRect };
}
