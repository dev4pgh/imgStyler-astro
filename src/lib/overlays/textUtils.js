function wrapText(context, text, maxWidth) {
  const words = String(text || "").split(" ");
  const lines = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + " " + word;
    const metrics = context.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  lines.push(currentLine);
  return lines;
}

export function applyTextOverlay(
  ctx,
  overlayConfig,
  currentCrop,
  scaleX = 1,
  scaleY = 1
) {
  if (
    !ctx ||
    !overlayConfig ||
    overlayConfig.type !== "text" ||
    !currentCrop ||
    scaleX <= 0 ||
    scaleY <= 0
  ) {
    console.error("Invalid arguments for applyTextOverlay", {
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
    text,
    fontSize: baseFontSize,
    color,
    fontFamily,
    textAlign = "left",
  } = overlayConfig;

  const relX = absX - currentCrop.x;
  const relY = absY - currentCrop.y;
  const drawX = Math.round(relX * scaleX);
  const drawY = Math.round(relY * scaleY);
  const drawWidth = Math.round(absWidth * scaleX);
  const drawHeight = Math.round(absHeight * scaleY);
  const drawFontSize = Math.max(8, baseFontSize * Math.sqrt(scaleX * scaleY));

  if (
    drawWidth <= 0 ||
    drawHeight <= 0 ||
    drawX + drawWidth <= 0 ||
    drawX >= ctx.canvas.width ||
    drawY + drawHeight <= 0 ||
    drawY >= ctx.canvas.height
  ) {
    return;
  }

  ctx.save();
  try {
    ctx.beginPath();
    ctx.rect(drawX, drawY, drawWidth, drawHeight);
    ctx.clip();

    ctx.font = `${drawFontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textAlign = textAlign;
    ctx.textBaseline = "top";

    const lines = wrapText(ctx, text, drawWidth);
    let currentY = drawY;
    const lineHeight = Math.round(drawFontSize * 1.2);

    let adjustedDrawX = drawX;
    if (textAlign === "center") {
      adjustedDrawX = drawX + drawWidth / 2;
    } else if (textAlign === "right") {
      adjustedDrawX = drawX + drawWidth;
    }

    for (const line of lines) {
      if (currentY >= drawY + drawHeight) {
        break;
      }

      ctx.fillText(line, adjustedDrawX, currentY);
      currentY += lineHeight;
    }
  } catch (error) {
    console.error("Error applying text overlay:", error, overlayConfig);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      drawX + 1,
      drawY + 1,
      Math.max(10, drawWidth - 2),
      Math.max(10, drawHeight - 2)
    );
  } finally {
    ctx.restore();
  }
}
