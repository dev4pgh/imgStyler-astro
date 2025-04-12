import { useState, useEffect, useCallback } from "react";
import { useEditingContext } from "../context/EditingContext";

const HANDLE_BASE_SIZE = 8;
const HANDLE_BORDER_WIDTH = 1;
const HANDLE_VISUAL_SIZE = HANDLE_BASE_SIZE + 2 * HANDLE_BORDER_WIDTH;
const MIN_OVERLAY_SIZE_DISPLAY = 20;

function getDrawBounds(overlay, currentCrop, scaleX, scaleY) {
  if (!overlay || !currentCrop || scaleX <= 0 || scaleY <= 0) return null;
  const relX = overlay.x - currentCrop.x;
  const relY = overlay.y - currentCrop.y;
  const drawX = Math.round(relX * scaleX);
  const drawY = Math.round(relY * scaleY);
  const drawW = Math.round(overlay.width * scaleX);
  const drawH = Math.round(overlay.height * scaleY);
  return { x: drawX, y: drawY, width: drawW, height: drawH };
}

const handleDefs = {
  nw: { cursor: "nwse-resize", xMul: 0, yMul: 0 },
  n: { cursor: "ns-resize", xMul: 0.5, yMul: 0 },
  ne: { cursor: "nesw-resize", xMul: 1, yMul: 0 },
  w: { cursor: "ew-resize", xMul: 0, yMul: 0.5 },
  e: { cursor: "ew-resize", xMul: 1, yMul: 0.5 },
  sw: { cursor: "nesw-resize", xMul: 0, yMul: 1 },
  s: { cursor: "ns-resize", xMul: 0.5, yMul: 1 },
  se: { cursor: "nwse-resize", xMul: 1, yMul: 1 },
};

export function useOverlayEditing({
  containerRef,
  setOverlays,
  setLastInteractionEndTime,
}) {
  const context = useEditingContext();
  const { selectedOverlayId, overlays, crop, displayScale } = context || {};

  const [interactionType, setInteractionType] = useState("idle");
  const [activeHandleId, setActiveHandleId] = useState(null);
  const [startInteractionPos, setStartInteractionPos] = useState({
    x: 0,
    y: 0,
  });
  const [startOverlayData, setStartOverlayData] = useState(null);
  const [currentEditData, setCurrentEditData] = useState(null);

  const isEditing = interactionType !== "idle";
  const isMoving = interactionType === "move";
  const isResizing = interactionType === "resize";

  const getRelativeCoords = useCallback(
    (event) => {
      if (!containerRef.current) return null;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const clientY = event.touches ? event.touches[0].clientY : event.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    },
    [containerRef]
  );

  const handleInteractionStart = useCallback(
    (event, type, overlay, handleId = null) => {
      event.preventDefault();
      event.stopPropagation();

      if (!displayScale || displayScale <= 0 || !overlay) return;
      const coords = getRelativeCoords(event);
      if (!coords) return;

      console.log(
        `Overlay ${type} Start:`,
        overlay.id,
        handleId ? `Handle: ${handleId}` : ""
      );
      setInteractionType(type);
      setActiveHandleId(handleId);
      setStartInteractionPos(coords);
      setStartOverlayData(overlay);
      setCurrentEditData(overlay);
    },
    [displayScale, getRelativeCoords]
  );

  const handleInteractionMove = useCallback(
    (event) => {
      if (!isEditing || !startOverlayData || !displayScale || displayScale <= 0)
        return;

      event.preventDefault();
      event.stopPropagation();

      const coords = getRelativeCoords(event);
      if (!coords) return;

      const dx_display = coords.x - startInteractionPos.x;
      const dy_display = coords.y - startInteractionPos.y;
      const dx_orig = dx_display / displayScale;
      const dy_orig = dy_display / displayScale;

      let newX_orig = startOverlayData.x;
      let newY_orig = startOverlayData.y;
      let newW_orig = startOverlayData.width;
      let newH_orig = startOverlayData.height;

      if (isMoving) {
        newX_orig += dx_orig;
        newY_orig += dy_orig;
      } else if (isResizing && activeHandleId) {
        const minW_orig = MIN_OVERLAY_SIZE_DISPLAY / displayScale;
        const minH_orig = MIN_OVERLAY_SIZE_DISPLAY / displayScale;

        if (activeHandleId.includes("e")) {
          newW_orig = Math.max(minW_orig, startOverlayData.width + dx_orig);
        }
        if (activeHandleId.includes("w")) {
          const deltaW = startOverlayData.width - dx_orig;
          newW_orig = Math.max(minW_orig, deltaW);
          if (Math.abs(newW_orig - deltaW) < 0.1 / displayScale) {
            newX_orig = startOverlayData.x + dx_orig;
          } else {
            newX_orig = startOverlayData.x + startOverlayData.width - newW_orig;
          }
        }
        if (activeHandleId.includes("s")) {
          newH_orig = Math.max(minH_orig, startOverlayData.height + dy_orig);
        }
        if (activeHandleId.includes("n")) {
          const deltaH = startOverlayData.height - dy_orig;
          newH_orig = Math.max(minH_orig, deltaH);
          if (Math.abs(newH_orig - deltaH) < 0.1 / displayScale) {
            newY_orig = startOverlayData.y + dy_orig;
          } else {
            newY_orig =
              startOverlayData.y + startOverlayData.height - newH_orig;
          }
        }
      }

      setCurrentEditData((prev) => ({
        ...prev,
        x: newX_orig,
        y: newY_orig,
        width: newW_orig,
        height: newH_orig,
      }));
    },
    [
      isEditing,
      isMoving,
      isResizing,
      activeHandleId,
      startOverlayData,
      startInteractionPos,
      displayScale,
      getRelativeCoords,
    ]
  );

  const handleInteractionEnd = useCallback(
    (event) => {
      if (!isEditing || !currentEditData) return;

      event.preventDefault();
      event.stopPropagation();

      console.log("Overlay Interaction End. Final data:", currentEditData);

      const finalData = {
        ...currentEditData,
        x: Number(currentEditData.x) || 0,
        y: Number(currentEditData.y) || 0,
        width: Math.max(
          1 / displayScale,
          Number(currentEditData.width) || 1 / displayScale
        ),
        height: Math.max(
          1 / displayScale,
          Number(currentEditData.height) || 1 / displayScale
        ),
      };

      setOverlays((prevOverlays) =>
        prevOverlays.map((ov) => (ov.id === finalData.id ? finalData : ov))
      );

      if (setLastInteractionEndTime) {
        setLastInteractionEndTime(Date.now());
      }

      setInteractionType("idle");
      setActiveHandleId(null);
      setStartInteractionPos({ x: 0, y: 0 });
      setStartOverlayData(null);
      setCurrentEditData(null);
    },
    [
      isEditing,
      currentEditData,
      setOverlays,
      setLastInteractionEndTime,
      displayScale,
    ]
  );

  useEffect(() => {
    if (!isEditing) return;
    const moveHandler = handleInteractionMove;
    const endHandler = handleInteractionEnd;

    window.addEventListener("mousemove", moveHandler);
    window.addEventListener("mouseup", endHandler);
    window.addEventListener("touchmove", moveHandler, { passive: false });
    window.addEventListener("touchend", endHandler);

    return () => {
      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseup", endHandler);
      window.removeEventListener("touchmove", moveHandler);
      window.removeEventListener("touchend", endHandler);
    };
  }, [isEditing, handleInteractionMove, handleInteractionEnd]);

  let overlayBoundingBoxProps = {};
  let handles = [];

  const selectedOverlay = overlays?.find((ov) => ov.id === selectedOverlayId);
  const sourceDataForBounds =
    isEditing && currentEditData ? currentEditData : selectedOverlay;

  if (sourceDataForBounds && crop && displayScale > 0) {
    const bounds = getDrawBounds(
      sourceDataForBounds,
      crop,
      displayScale,
      displayScale
    );

    if (
      bounds &&
      Number.isFinite(bounds.x) &&
      Number.isFinite(bounds.y) &&
      Number.isFinite(bounds.width) &&
      Number.isFinite(bounds.height)
    ) {
      if (!isEditing) {
        overlayBoundingBoxProps = {
          onMouseDown: (e) =>
            handleInteractionStart(e, "move", selectedOverlay),
          onTouchStart: (e) =>
            handleInteractionStart(e, "move", selectedOverlay),
          style: { cursor: "move" },
        };
      } else if (isMoving) {
        overlayBoundingBoxProps = { style: { cursor: "grabbing" } };
      } else {
        overlayBoundingBoxProps = { style: { cursor: "default" } };
      }

      if (selectedOverlay) {
        const handleCenterOffset = HANDLE_VISUAL_SIZE / 2;
        handles = Object.entries(handleDefs).map(([id, def]) => ({
          id,
          x: bounds.width * def.xMul - handleCenterOffset,
          y: bounds.height * def.yMul - handleCenterOffset,
          cursor: def.cursor,
          props: {
            onMouseDown: (e) =>
              handleInteractionStart(e, "resize", selectedOverlay, id),
            onTouchStart: (e) =>
              handleInteractionStart(e, "resize", selectedOverlay, id),
          },
        }));
      }
    }
  }

  return {
    isEditing,
    isResizing,
    editingOverlayData: currentEditData,
    overlayBoundingBoxProps,
    handles,
  };
}
