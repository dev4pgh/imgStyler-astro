import React, { useEffect, useRef, forwardRef } from "react";
import { applyAllEffects } from "../../lib/EffectEngine";

const ImageCanvas = forwardRef(({
    imageObject,
    crop,
    filter,
    adjustments,
    format,
    quality,
    lossless,
    isCropping,
    aspectRatio,
    cropRounding,
    isResizing,
    lockAspectRatio,
    overlays = [],
    canvasWidth,
    canvasHeight,
    scale: displayScale,
    cropOverlayProps,
    cropHandleProps,
}, forwardedRef) => {

    const canvasRef = useRef(null);
    const previewImageRef = useRef(new Image());

    useEffect(() => {
        const canvas = canvasRef.current;
        let isImageReady = false;

        if (imageObject instanceof HTMLImageElement) {
            isImageReady = imageObject.complete && imageObject.naturalWidth > 0;
        } else if (imageObject instanceof HTMLCanvasElement) {
            isImageReady = imageObject.width > 0 && imageObject.height > 0;
        }

        if (!imageObject || !isImageReady || !crop || !canvas || canvasWidth <= 0 || canvasHeight <= 0) {
            if (canvas) {
                const ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (canvas.width !== 0) canvas.width = 0;
                if (canvas.height !== 0) canvas.height = 0;
            }
            return;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext("2d");
        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = canvasWidth;
        tmpCanvas.height = canvasHeight;
        const tmpCtx = tmpCanvas.getContext("2d");

        const roundingForDisplay = isCropping ? 0 : cropRounding;

        applyAllEffects(
            tmpCtx,
            imageObject,
            tmpCanvas,
            filter,
            adjustments,
            crop,
            roundingForDisplay,
            overlays,
            displayScale
        );

        const requiresPreview = format === "image/jpeg" || (format === "image/webp" && !lossless);

        if (requiresPreview) {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(tmpCanvas, 0, 0, canvasWidth, canvasHeight);

            const blobOptions = { quality: quality / 100 };
            tmpCanvas.toBlob((blob) => {
                if (!blob) {
                    console.error("Failed to generate blob for preview.");
                    return;
                }
                const compressedUrl = URL.createObjectURL(blob);
                const previewImg = previewImageRef.current;

                previewImg.onload = () => {
                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                    ctx.drawImage(previewImg, 0, 0, canvasWidth, canvasHeight);
                    URL.revokeObjectURL(compressedUrl);
                };
                previewImg.onerror = () => {
                    console.error("Failed to load compressed preview image.");
                    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
                    ctx.drawImage(tmpCanvas, 0, 0, canvasWidth, canvasHeight);
                    URL.revokeObjectURL(compressedUrl);
                }
                previewImg.src = compressedUrl;
            }, format, blobOptions.quality);

        } else {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(tmpCanvas, 0, 0, canvasWidth, canvasHeight);
        }

    }, [
        imageObject, crop, filter, adjustments, format, quality, lossless,
        isCropping, cropRounding, canvasWidth, canvasHeight, overlays, displayScale
    ]);


    return (
        <div
            style={{ width: "100%", height: canvasHeight > 0 ? `${canvasHeight}px` : 'auto', minHeight: '100px', position: "relative", overflow: "hidden" }}
            className="bg-gray-100 dark:bg-gray-900"
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-auto shadow-md"
                style={{ display: 'block', width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
            />

            {isCropping && cropOverlayProps && cropHandleProps && (
                <div {...cropOverlayProps}>
                    <div {...cropHandleProps}></div>

                    {isResizing && lockAspectRatio && aspectRatio && (
                        <svg
                            width="100%"
                            height="100%"
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                pointerEvents: 'none'
                            }}
                        >
                            <line
                                x1="0" y1="0" x2="100%" y2="100%"
                                stroke="rgba(255, 255, 255, 0.85)"
                                strokeWidth="3"
                                strokeDasharray="4 4"
                            />
                            <line
                                x1="0" y1="0" x2="100%" y2="100%"
                                stroke="rgb(59, 130, 246)"
                                strokeWidth="2"
                                strokeDasharray="4 4"
                            />
                        </svg>
                    )}
                </div>

            )}


        </div>
    );
});

export default ImageCanvas;