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
  ctx.drawImage(image, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  const { data } = imageData;
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
  const result = new ImageData(output, width, height);
  ctx.putImageData(result, 0, 0);
};

function _calculateDrawRects(image, crop, targetWidth, targetHeight) {
  let sx = 0,
    sy = 0,
    sWidth = image.width,
    sHeight = image.height;
  let dx = 0,
    dy = 0,
    dWidth = targetWidth,
    dHeight = targetHeight;

  if (crop && crop.width > 0 && crop.height > 0) {
    sx = Math.max(0, crop.x);
    sy = Math.max(0, crop.y);
    sWidth = Math.min(crop.width, image.width - sx);
    sHeight = Math.min(crop.height, image.height - sy);

    if (sWidth <= 0 || sHeight <= 0) {
      sx = 0;
      sy = 0;
      sWidth = image.width;
      sHeight = image.height;
    }
    dx = 0;
    dy = 0;
    dWidth = targetWidth;
    dHeight = targetHeight;
  } else {
    sx = 0;
    sy = 0;
    sWidth = image.width;
    sHeight = image.height;
    dx = 0;
    dy = 0;
    dWidth = targetWidth;
    dHeight = targetHeight;
  }
  return { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight };
}

function _applyRoundingClip(ctx, x, y, width, height, radiusPercent) {
  if (!radiusPercent || radiusPercent <= 0) return false;
  const cornerRadius = Math.min(width, height) * (radiusPercent / 100.0);
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
  if (sharpnessValue >= 0) {
    const weight = sharpnessValue / 100;
    const kCenter = 1 + 4 * weight;
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);
    const w4 = width * 4;

    for (let y = 1, rowOffset = w4; y < height - 1; y++, rowOffset += w4) {
      for (let x = 1; x < width - 1; x++) {
        const i = rowOffset + x * 4;
        const i_tl = i - w4 - 4;
        const i_tc = i - w4;
        const i_tr = i - w4 + 4;
        const i_ml = i - 4;
        const i_m = i;
        const i_mr = i + 4;
        const i_bl = i + w4 - 4;
        const i_bc = i + w4;
        const i_br = i + w4 + 4;

        let r =
          0 * data[i_tl] +
          -weight * data[i_tc] +
          0 * data[i_tr] +
          -weight * data[i_ml] +
          kCenter * data[i_m] +
          -weight * data[i_mr] +
          0 * data[i_bl] +
          -weight * data[i_bc] +
          0 * data[i_br];
        let g =
          0 * data[i_tl + 1] +
          -weight * data[i_tc + 1] +
          0 * data[i_tr + 1] +
          -weight * data[i_ml + 1] +
          kCenter * data[i_m + 1] +
          -weight * data[i_mr + 1] +
          0 * data[i_bl + 1] +
          -weight * data[i_bc + 1] +
          0 * data[i_br + 1];
        let b =
          0 * data[i_tl + 2] +
          -weight * data[i_tc + 2] +
          0 * data[i_tr + 2] +
          -weight * data[i_ml + 2] +
          kCenter * data[i_m + 2] +
          -weight * data[i_mr + 2] +
          0 * data[i_bl + 2] +
          -weight * data[i_bc + 2] +
          0 * data[i_br + 2];

        output[i] = Math.min(255, Math.max(0, r));
        output[i + 1] = Math.min(255, Math.max(0, g));
        output[i + 2] = Math.min(255, Math.max(0, b));
        output[i + 3] = data[i + 3];
      }
    }
    ctx.putImageData(new ImageData(output, width, height), 0, 0);
  } else {
    const blurRadius = Math.abs(sharpnessValue) * 0.025;
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.drawImage(canvas, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = `blur(${blurRadius}px)`;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = "none";
  }
};

const applyTemperatureAndTint = (ctx, canvas, temperature, tint) => {
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const t = temperature;
  const ti = tint;

  for (let i = 0, len = data.length; i < len; i += 4) {
    let r = data[i] + t;
    data[i] = r < 0 ? 0 : r > 255 ? 255 : r;

    let g = data[i + 1] + ti;
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;

    let b = data[i + 2] - t;
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }
  ctx.putImageData(imageData, 0, 0);
};

export const applyAllEffects = (
  ctx,
  image,
  canvas,
  filter,
  adjustments,
  crop = null,
  cropRounding = 0
) => {
  const targetWidth = canvas.width;
  const targetHeight = canvas.height;
  ctx.clearRect(0, 0, targetWidth, targetHeight);

  const { sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight } =
    _calculateDrawRects(image, crop, targetWidth, targetHeight);

  if (sWidth <= 0 || sHeight <= 0 || dWidth <= 0 || dHeight <= 0) {
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
  tempEffectCtx.drawImage(canvas, 0, 0);

  ctx.clearRect(0, 0, targetWidth, targetHeight);

  if (filter === "Sketch") {
    applySketchEffect(tempEffectCtx, tempEffectCanvas, tempEffectCanvas);
    ctx.drawImage(tempEffectCanvas, 0, 0);
  } else {
    const cssFilters = [];
    if (filterMap[filter]) {
      cssFilters.push(filterMap[filter]);
    }
    if (adjustments.brightness !== undefined) {
      cssFilters.push(adjustmentMap.brightness(adjustments.brightness));
    }
    if (adjustments.contrast !== undefined) {
      cssFilters.push(adjustmentMap.contrast(adjustments.contrast));
    }
    if (adjustments.saturation !== undefined) {
      cssFilters.push(adjustmentMap.saturation(adjustments.saturation));
    }
    if (adjustments.hue !== undefined) {
      cssFilters.push(adjustmentMap.hue(adjustments.hue));
    }

    if (cssFilters.length > 0) {
      tempEffectCtx.filter = cssFilters.join(" ");
      tempEffectCtx.drawImage(tempEffectCanvas, 0, 0);
      tempEffectCtx.filter = "none";
    }
    ctx.drawImage(tempEffectCanvas, 0, 0);
  }

  if (adjustments.sharpness !== undefined && adjustments.sharpness !== 0) {
    applySharpness(ctx, canvas, adjustments.sharpness);
  }
  if (
    (adjustments.temperature && adjustments.temperature !== 0) ||
    (adjustments.tint && adjustments.tint !== 0)
  ) {
    applyTemperatureAndTint(
      ctx,
      canvas,
      adjustments.temperature || 0,
      adjustments.tint || 0
    );
  }
};
