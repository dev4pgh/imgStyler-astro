import { useState, useCallback, useEffect } from "react";
import { exportImage } from "../lib/exportUtils";

export function useExportManager(
  defaultFormat = "image/png",
  defaultQuality = 92
) {
  const [format, setFormat] = useState(defaultFormat);
  const [quality, setQuality] = useState(defaultQuality);
  const [lossless, setLossless] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const [enableResizing, setEnableResizing] = useState(false);
  const [targetWidth, setTargetWidth] = useState("");
  const [targetHeight, setTargetHeight] = useState("");
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);

  useEffect(() => {
    if (!enableResizing) {
      setTargetWidth("");
      setTargetHeight("");
    }
  }, [enableResizing]);

  useEffect(() => {
    if (format !== "image/webp") {
      setLossless(false);
    }
  }, [format]);

  const startExport = useCallback(
    async ({
      image,
      crop,
      filter,
      adjustments,
      rounding,
      originalFilename,
      overlays,
    }) => {
      if (!image || !crop) {
        setExportError("Cannot export: Image or crop data missing.");
        return;
      }

      let finalExportWidth = Math.round(crop.width);
      let finalExportHeight = Math.round(crop.height);

      if (enableResizing) {
        const parsedW = parseInt(targetWidth, 10);
        const parsedH = parseInt(targetHeight, 10);
        const isValidW = parsedW > 0;
        const isValidH = parsedH > 0;

        if (isValidW || isValidH) {
          if (keepAspectRatio) {
            const cropRatio = crop.width / crop.height;
            if (isValidW && !isValidH) {
              finalExportWidth = parsedW;
              finalExportHeight = Math.round(parsedW / cropRatio);
            } else if (!isValidW && isValidH) {
              finalExportHeight = parsedH;
              finalExportWidth = Math.round(parsedH * cropRatio);
            } else {
              finalExportWidth = parsedW || finalExportWidth;
              finalExportHeight = Math.round(finalExportWidth / cropRatio);
            }
          } else {
            finalExportWidth = isValidW ? parsedW : finalExportWidth;
            finalExportHeight = isValidH ? parsedH : finalExportHeight;
          }
        }
      }
      finalExportWidth = Math.max(1, finalExportWidth);
      finalExportHeight = Math.max(1, finalExportHeight);

      setIsExporting(true);
      setExportError(null);

      const exportOptions = {
        image,
        crop,
        filter,
        adjustments,
        rounding,
        format,
        quality,
        lossless,
        originalFilename,
        outputWidth: finalExportWidth,
        outputHeight: finalExportHeight,
        overlays,
      };

      try {
        await exportImage(exportOptions);
      } catch (err) {
        setExportError(
          err.message || "An unknown error occurred during export."
        );
      } finally {
        setIsExporting(false);
      }
    },
    [
      format,
      quality,
      lossless,
      enableResizing,
      targetWidth,
      targetHeight,
      keepAspectRatio,
    ]
  );

  return {
    format,
    quality,
    lossless,
    isExporting,
    exportError,
    enableResizing,
    targetWidth,
    targetHeight,
    keepAspectRatio,
    setFormat,
    setQuality,
    setLossless,
    setEnableResizing,
    setTargetWidth,
    setTargetHeight,
    setKeepAspectRatio,
    startExport,
    clearExportError: () => setExportError(null),
  };
}
