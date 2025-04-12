import * as UTIF from "utif";
import { applyBlurOverlay } from "./overlays/blurUtils";
import { applyTextOverlay } from "./overlays/textUtils";

export const filterMap = {
  None: "",
  Grayscale: "grayscale(1)",
  Vintage: "sepia(0.5) contrast(1.2) brightness(0.9)",
  Vibrant: "saturate(1.5)",
  "Soft Focus": "blur(2px)",
  Noir: "grayscale(1) contrast(1.5)",
  Sepia: "sepia(1)",
  Invert: "invert(1)",
  Polaroid: "contrast(0.9) brightness(1.1)",
};

export const adjustmentMap = {
  brightness: (value) => `brightness(${value}%)`,
  contrast: (value) => `contrast(${value}%)`,
  saturation: (value) => `saturate(${value}%)`,
  hue: (value) => `hue-rotate(${value}deg)`,
};

const applySketchEffect = (ctx, image, canvas) => {
  const width = canvas.width;
  const height = canvas.height;
  if (width <= 0 || height <= 0) return;

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) return;
  tempCtx.drawImage(image, 0, 0, width, height);

  const imageData = tempCtx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const grayscale = new Uint8ClampedArray(width * height);
  for (let i = 0; i < data.length; i += 4) {
    grayscale[i / 4] =
      0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const output = new Uint8ClampedArray(data.length);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx;
          const py = y + ky;
          const idx = py * width + px;
          const weightX = sobelX[(ky + 1) * 3 + (kx + 1)];
          const weightY = sobelY[(ky + 1) * 3 + (kx + 1)];
          gx += weightX * grayscale[idx];
          gy += weightY * grayscale[idx];
        }
      }
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const intensity = 255 - Math.min(255, magnitude);
      const outIdx = (y * width + x) * 4;
      output[outIdx] = output[outIdx + 1] = output[outIdx + 2] = intensity;
      output[outIdx + 3] = 255;
    }
  }
  ctx.clearRect(0, 0, width, height);
  ctx.putImageData(new ImageData(output, width, height), 0, 0);
};

function _calculateDrawRects(image, crop, targetWidth, targetHeight) {
  let sx = 0,
    sy = 0,
    sWidth = 1,
    sHeight = 1;
  let dx = 0,
    dy = 0,
    dWidth = targetWidth,
    dHeight = targetHeight;

  const imageWidth = image.naturalWidth || image.width || 1;
  const imageHeight = image.naturalHeight || image.height || 1;

  if (crop && crop.width > 0 && crop.height > 0) {
    sx = Math.max(0, crop.x);
    sy = Math.max(0, crop.y);
    sWidth = Math.max(1, Math.min(crop.width, imageWidth - sx));
    sHeight = Math.max(1, Math.min(crop.height, imageHeight - sy));
  } else {
    sx = 0;
    sy = 0;
    sWidth = imageWidth;
    sHeight = imageHeight;
  }

  dx = 0;
  dy = 0;
  dWidth = targetWidth;
  dHeight = targetHeight;

  return { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight };
}

function _applyRoundingClip(ctx, x, y, width, height, radiusPercent) {
  if (!radiusPercent || radiusPercent <= 0 || width <= 0 || height <= 0)
    return false;

  const clampedPercent = Math.max(0, Math.min(50, radiusPercent));
  const cornerRadius =
    Math.min(width / 2, height / 2) * (clampedPercent / 50.0);

  if (cornerRadius <= 0) return false;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + cornerRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, cornerRadius);
  ctx.arcTo(x + width, y + height, x, y + height, cornerRadius);
  ctx.arcTo(x, y + height, x, y, cornerRadius);
  ctx.arcTo(x, y, x + width, y, cornerRadius);
  ctx.closePath();
  ctx.clip();
  return true;
}

export const applySharpness = (ctx, canvas, sharpnessValue) => {
  if (!sharpnessValue || sharpnessValue === 0) return;

  const width = canvas.width;
  const height = canvas.height;
  if (width <= 0 || height <= 0) return;

  if (sharpnessValue > 0) {
    const weight = sharpnessValue / 100.0;
    const kCenter = 1 + 4 * weight;
    const kCross = -weight;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);
    const w4 = width * 4;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        const i_tc = i - w4;
        const i_ml = i - 4;
        const i_mr = i + 4;
        const i_bc = i + w4;

        for (let channel = 0; channel < 3; channel++) {
          const result =
            kCenter * copy[i + channel] +
            kCross * copy[i_tc + channel] +
            kCross * copy[i_ml + channel] +
            kCross * copy[i_mr + channel] +
            kCross * copy[i_bc + channel];

          data[i + channel] = Math.min(255, Math.max(0, result));
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
  } else {
    const blurRadius = Math.abs(sharpnessValue) * 0.03;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    tempCtx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.filter = `blur(${blurRadius}px)`;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = "none";
  }
};

const applyTemperatureAndTint = (ctx, canvas, temperature, tint) => {
  if ((!temperature || temperature === 0) && (!tint || tint === 0)) return;
  const width = canvas.width;
  const height = canvas.height;
  if (width <= 0 || height <= 0) return;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const t = temperature * 0.3;
  const ti = tint * 0.3;

  for (let i = 0, len = data.length; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    r += t;
    b -= t;
    g += ti;
    data[i] = r < 0 ? 0 : r > 255 ? 255 : r;
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }
  ctx.putImageData(imageData, 0, 0);
};

function applyAllOverlays(
  ctx,
  overlays = [],
  currentCrop,
  scaleFactors = { scaleX: 1, scaleY: 1 }
) {
  if (!ctx || !overlays || overlays.length === 0 || !currentCrop) {
    return;
  }
  const scaleX = scaleFactors?.scaleX > 0 ? scaleFactors.scaleX : 1;
  const scaleY = scaleFactors?.scaleY > 0 ? scaleFactors.scaleY : 1;

  console.log(
    `Applying ${overlays.length} overlays relative to crop:`,
    currentCrop,
    `with scales:`,
    { scaleX, scaleY }
  );

  overlays.forEach((overlay) => {
    try {
      switch (overlay.type) {
        case "blur":
          applyBlurOverlay(ctx, overlay, currentCrop, scaleX, scaleY);
          break;
        case "text":
          applyTextOverlay(ctx, overlay, currentCrop, scaleX, scaleY);
          break;
        default:
          console.warn(`Unsupported overlay type: ${overlay.type}`);
      }
    } catch (error) {
      console.error(
        `Error applying overlay (ID: ${overlay.id || "N/A"}, Type: ${
          overlay.type
        }):`,
        error
      );
    }
  });
}

export const applyAllEffects = (
  ctx,
  image,
  canvas,
  filter,
  adjustments,
  crop = null,
  cropRounding = 0,
  overlays = []
) => {
  const targetWidth = canvas.width;
  const targetHeight = canvas.height;
  if (targetWidth <= 0 || targetHeight <= 0) {
    console.error("applyAllEffects: Target canvas dimensions are invalid.");
    return;
  }

  ctx.clearRect(0, 0, targetWidth, targetHeight);
  const { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } =
    _calculateDrawRects(image, crop, targetWidth, targetHeight);

  if (sWidth <= 0 || sHeight <= 0 || dWidth <= 0 || dHeight <= 0) {
    console.error("applyAllEffects: Calculated draw dimensions are invalid.", {
      sWidth,
      sHeight,
      dWidth,
      dHeight,
    });
    return;
  }

  const clipped = _applyRoundingClip(
    ctx,
    dx,
    dy,
    dWidth,
    dHeight,
    cropRounding
  );
  ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  if (clipped) {
    ctx.restore();
  }

  const tempEffectCanvas = document.createElement("canvas");
  tempEffectCanvas.width = targetWidth;
  tempEffectCanvas.height = targetHeight;
  const tempEffectCtx = tempEffectCanvas.getContext("2d");
  if (!tempEffectCtx) {
    console.error("Failed to get context for temp effect canvas.");
    return;
  }

  tempEffectCtx.drawImage(canvas, 0, 0);

  if (filter === "Sketch") {
    applySketchEffect(ctx, tempEffectCanvas, canvas);
    tempEffectCtx.clearRect(0, 0, targetWidth, targetHeight);
    tempEffectCtx.drawImage(canvas, 0, 0);
  } else {
    const cssFilters = [];
    if (filter && filterMap[filter]) {
      cssFilters.push(filterMap[filter]);
    }
    if (
      adjustments.brightness !== undefined &&
      adjustments.brightness !== 100
    ) {
      cssFilters.push(adjustmentMap.brightness(adjustments.brightness));
    }
    if (adjustments.contrast !== undefined && adjustments.contrast !== 100) {
      cssFilters.push(adjustmentMap.contrast(adjustments.contrast));
    }
    if (
      adjustments.saturation !== undefined &&
      adjustments.saturation !== 100
    ) {
      cssFilters.push(adjustmentMap.saturation(adjustments.saturation));
    }
    if (adjustments.hue !== undefined && adjustments.hue !== 0) {
      cssFilters.push(adjustmentMap.hue(adjustments.hue));
    }

    if (cssFilters.length > 0) {
      tempEffectCtx.filter = cssFilters.join(" ");
      tempEffectCtx.drawImage(tempEffectCanvas, 0, 0);
      tempEffectCtx.filter = "none";
    }
    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.drawImage(tempEffectCanvas, 0, 0);
  }

  if (adjustments.sharpness !== undefined && adjustments.sharpness !== 0) {
    applySharpness(ctx, canvas, adjustments.sharpness);
  }
  if (
    (adjustments.temperature !== undefined && adjustments.temperature !== 0) ||
    (adjustments.tint !== undefined && adjustments.tint !== 0)
  ) {
    applyTemperatureAndTint(
      ctx,
      canvas,
      adjustments.temperature || 0,
      adjustments.tint || 0
    );
  }

  if (
    overlays &&
    overlays.length > 0 &&
    crop &&
    crop.width > 0 &&
    crop.height > 0
  ) {
    const targetScaleX = targetWidth / crop.width;
    const targetScaleY = targetHeight / crop.height;

    if (
      Number.isFinite(targetScaleX) &&
      targetScaleX > 0 &&
      Number.isFinite(targetScaleY) &&
      targetScaleY > 0
    ) {
      const scaleFactors = { scaleX: targetScaleX, scaleY: targetScaleY };
      applyAllOverlays(ctx, overlays, crop, scaleFactors);
    } else {
      console.warn("Invalid scale factors calculated for overlays, skipping.", {
        targetScaleX,
        targetScaleY,
        crop,
      });
    }
  }
};
