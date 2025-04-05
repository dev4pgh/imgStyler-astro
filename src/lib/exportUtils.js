import * as UTIF from "utif";
import { applyAllEffects } from "./EffectEngine";

/**
 * Exports the processed image based on provided options.
 * @param {object} options
 * @param {HTMLImageElement} options.image - The original image element.
 * @param {object} options.crop - The crop parameters {x, y, width, height}.
 * @param {string} options.filter - The name of the selected filter.
 * @param {object} options.adjustments - Object with adjustment values.
 * @param {number} options.rounding - Crop rounding percentage (0-50).
 * @param {string} options.format - The desired mime type (e.g., 'image/png').
 * @param {number} options.quality - Quality setting (0-100).
 * @param {boolean} options.lossless - Lossless setting for WebP.
 * @param {string} options.originalFilename - The original filename for naming the export.
 * @param {number} options.outputWidth - The desired output width in pixels.
 * @param {number} options.outputHeight - The desired output height in pixels.
 * @returns {Promise<void>} A promise that resolves when the download is initiated or rejects on error.
 */
export async function exportImage({
  image,
  crop,
  filter,
  adjustments,
  rounding,
  format,
  quality,
  lossless,
  originalFilename = "image.png",
  outputWidth,
  outputHeight,
}) {
  if (!image || !crop || crop.width <= 0 || crop.height <= 0) {
    console.error("Export failed: Invalid image or crop data.", {
      image,
      crop,
    });
    throw new Error("Cannot export: Missing image or invalid crop dimensions.");
  }

  if (!outputWidth || !outputHeight || outputWidth <= 0 || outputHeight <= 0) {
    throw new Error("Cannot export: Invalid output dimensions calculated.");
  }

  const exportCanvas = document.createElement("canvas");
  const exportCtx = exportCanvas.getContext("2d");

  exportCanvas.width = Math.round(outputWidth);
  exportCanvas.height = Math.round(outputHeight);

  try {
    applyAllEffects(
      exportCtx,
      image,
      exportCanvas,
      filter,
      adjustments,
      crop,
      rounding
    );
  } catch (error) {
    console.error("Error applying effects during export:", error);
    throw new Error("Failed to apply image effects during export.");
  }

  const mimeType = format;
  let exportQualityArg = undefined;
  if (mimeType === "image/jpeg" || (mimeType === "image/webp" && !lossless)) {
    exportQualityArg = Math.min(1, Math.max(0, quality / 100));
  }

  let blob;
  if (mimeType === "image/tiff") {
    try {
      const imageData = exportCtx.getImageData(
        0,
        0,
        exportCanvas.width,
        exportCanvas.height
      );
      const rgbaBuffer = imageData.data.buffer;
      const tiffArrayBuffer = UTIF.encodeImage(
        rgbaBuffer,
        exportCanvas.width,
        exportCanvas.height
      );
      blob = new Blob([tiffArrayBuffer], { type: "image/tiff" });
    } catch (encodeError) {
      throw new Error(`Failed to encode TIFF: ${encodeError.message}`);
    }
  } else {
    blob = await new Promise((resolve, reject) => {
      exportCanvas.toBlob(
        (b) => {
          if (b) {
            resolve(b);
          } else {
            reject(
              new Error("Canvas toBlob returned null. Check format/quality.")
            );
          }
        },
        mimeType,
        exportQualityArg
      );
    });
  }

  if (!blob) {
    throw new Error("Failed to create image blob.");
  }

  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const baseName =
      originalFilename.split(".").slice(0, -1).join(".") || "image";
    const formatSuffix = mimeType.split("/")[1] || "bin";
    const filename = `${baseName}_edited.${formatSuffix}`;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (downloadError) {
    console.error("Error triggering download:", downloadError);
  }
}
