import { useState, useEffect, useCallback } from "react";

const getInitialCrop = (image) => {
  if (!image) return null;
  return { x: 0, y: 0, width: image.width, height: image.height };
};

export function useCroppingState(originalImage) {
  const [crop, setCrop] = useState(() => getInitialCrop(originalImage));
  const [isCropping, setIsCropping] = useState(false);
  const [cropSessionStartCrop, setCropSessionStartCrop] = useState(null);

  const [aspectRatio, setAspectRatio] = useState(null);
  const [cropRounding, setCropRounding] = useState(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  useEffect(() => {
    const initialCrop = getInitialCrop(originalImage);
    setCrop(initialCrop);
    setIsCropping(false);
    setCropSessionStartCrop(null);
    setAspectRatio(null);
    setCropRounding(0);
    setLockAspectRatio(true);
  }, [originalImage]);

  const startCroppingSession = useCallback(() => {
    if (!crop) return;
    setCropSessionStartCrop(crop);
    setIsCropping(true);
  }, [crop]);

  /**
   * Confirms the interactive crop session.
   * Calculates the final crop in original image coordinates based on the
   * interactive overlay state and the display scale.
   *
   * @param {object} currentInteractiveCrop - The {x, y, width, height} from the overlay in *display* pixels.
   * @param {number} currentScale - The scale factor between the display canvas and the *original image portion shown at the start of the session*.
   */
  const confirmCrop = useCallback(
    (currentInteractiveCrop, currentScale) => {
      if (
        !currentInteractiveCrop ||
        !cropSessionStartCrop ||
        !currentScale ||
        currentScale <= 0
      ) {
        console.error("Cannot confirm crop - missing state or invalid scale", {
          currentInteractiveCrop,
          cropSessionStartCrop,
          currentScale,
        });
        setIsCropping(false);
        setCropSessionStartCrop(null);
        return;
      }

      console.log("[useCroppingState.confirmCrop] Inputs:", {
        currentInteractiveCrop,
        currentScale,
        cropSessionStartCrop,
      });

      const finalX_offset_from_start_orig =
        currentInteractiveCrop.x / currentScale;
      const finalY_offset_from_start_orig =
        currentInteractiveCrop.y / currentScale;

      const finalX_orig =
        cropSessionStartCrop.x + finalX_offset_from_start_orig;
      const finalY_orig =
        cropSessionStartCrop.y + finalY_offset_from_start_orig;

      const finalWidth_orig = currentInteractiveCrop.width / currentScale;
      const finalHeight_orig = currentInteractiveCrop.height / currentScale;

      const newCrop = {
        x: Math.round(Math.max(0, finalX_orig)),
        y: Math.round(Math.max(0, finalY_orig)),
        width: Math.round(Math.max(1, finalWidth_orig)),
        height: Math.round(Math.max(1, finalHeight_orig)),
      };

      console.log("Calculated new crop (original coords):", newCrop);

      console.log(
        "[useCroppingState.confirmCrop] Calculated newCrop (original coords):",
        newCrop
      );
      console.log("[useCroppingState.confirmCrop] About to call setCrop.");
      setCrop(newCrop);

      setIsCropping(false);
      setCropSessionStartCrop(null);
    },
    [cropSessionStartCrop]
  );

  const cancelCrop = useCallback(() => {
    setIsCropping(false);
    setCropSessionStartCrop(null);
  }, []);

  return {
    crop,
    isCropping,
    aspectRatio,
    setAspectRatio,
    cropRounding,
    setCropRounding,
    lockAspectRatio,
    setLockAspectRatio,
    startCroppingSession,
    confirmCrop,
    cancelCrop,
  };
}
