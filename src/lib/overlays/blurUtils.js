import { preconnect } from "react-dom";

export function applyBlurOverlay(
  ctx,
  overlayConfig,
  currentCrop,
  scaleX = 1,
  scaleY = 1
) {
  if (
    !ctx ||
    !overlayConfig ||
    overlayConfig.type !== "blur" ||
    !currentCrop ||
    scaleX <= 0 ||
    scaleY <= 0
  ) {
    console.error("Invalid arguments for applyBlurOverlay", {
      overlayConfig,
      currentCrop,
      scaleX,
      scaleY,
    });
    return;
  }

  const {
    x: absX,
    y: absY,
    width: absWidth,
    height: absHeight,
    intensity: percentIntensity,
  } = overlayConfig;

  const relX = absX - currentCrop.x;
  const relY = absY - currentCrop.y;
  const drawX = Math.round(relX * scaleX);
  const drawY = Math.round(relY * scaleY);
  const drawWidth = Math.round(absWidth * scaleX);
  const drawHeight = Math.round(absHeight * scaleY);

  if (
    drawX + drawWidth <= 0 ||
    drawX >= ctx.canvas.width ||
    drawY + drawHeight <= 0 ||
    drawY >= ctx.canvas.height
  ) {
    console.warn(
      "Skipping blur overlay: completely outside target canvas bounds."
    );
    return;
  }

  const avgDimension = (drawWidth + drawHeight) / 2;
  const blurRadiusPx = Math.max(1, avgDimension * (percentIntensity / 100.0));
  const finalBlurRadius = blurRadiusPx.toFixed(2);

  if (drawWidth <= 0 || drawHeight <= 0) {
    console.warn("Skipping blur overlay with non-positive draw dimensions:", {
      drawWidth,
      drawHeight,
      overlayConfig,
    });
    return;
  }

  ctx.save();

  try {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = Math.max(1, drawWidth);
    tempCanvas.height = Math.max(1, drawHeight);
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) {
      throw new Error("Failed to get 2D context from temporary canvas.");
    }

    try {
      const intersectX = Math.max(0, drawX);
      const intersectY = Math.max(0, drawY);
      const intersectWidth = Math.max(
        1,
        Math.min(drawX + drawWidth, ctx.canvas.width) - intersectX
      );
      const intersectHeight = Math.max(
        1,
        Math.min(drawY + drawHeight, ctx.canvas.height) - intersectY
      );

      if (intersectWidth <= 0 || intersectHeight <= 0) {
        console.warn("Blur overlay intersection with canvas has zero size.");
        ctx.restore();
        return;
      }

      const imageData = ctx.getImageData(
        intersectX,
        intersectY,
        intersectWidth,
        intersectHeight
      );
      const tempDestX = intersectX - drawX;
      const tempDestY = intersectY - drawY;
      tempCtx.putImageData(imageData, tempDestX, tempDestY);
    } catch (e) {
      console.error(
        "Error getting image data for blur (potential CORS issue or invalid coords?):",
        e,
        { drawX, drawY, drawWidth, drawHeight }
      );
      ctx.fillStyle = "rgba(128, 128, 128, 0.5)";
      ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
      ctx.restore();
      return;
    }
    tempCtx.filter = `blur(${finalBlurRadius}px)`;
    tempCtx.drawImage(tempCanvas, 0, 0);
    tempCtx.filter = "none";
    ctx.drawImage(tempCanvas, drawX, drawY);
  } catch (error) {
    console.error("Error applying blur overlay:", error, overlayConfig);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.strokeRect(drawX + 1, drawY + 1, drawWidth - 2, drawHeight - 2);
  } finally {
    ctx.restore();
  }
}
