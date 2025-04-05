import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import { applyAllEffects } from "../../lib/EffectEngine";
import { useInteractiveCrop } from "../../hooks/useInteractiveCrop";
import { useCanvasDisplaySize } from "../../hooks/useCanvasDisplaySize";

const ImageCanvas = forwardRef(({
    imageObject, crop, filter, adjustments, format, quality, lossless,
    isCropping, aspectRatio, cropRounding, lockAspectRatio,
}, ref) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const previewImageRef = useRef(new Image());
    const { width: canvasWidth, height: canvasHeight, scale: currentScale } = useCanvasDisplaySize(containerRef, crop, imageObject);

    const {
        interactiveCrop: currentInteractiveCropFromHook,
        overlayProps,
        handleProps,
        isInteracting,
        isResizing,
    } = useInteractiveCrop({
        containerRef,
        canvasWidth: canvasWidth,
        canvasHeight: canvasHeight,
        aspectRatio,
        lockAspectRatio,
        isCropping,
        cropRounding,
        disabled: !isCropping,
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        let isImageReady = false;
        if (imageObject instanceof HTMLImageElement) {
            isImageReady = imageObject.complete && imageObject.naturalWidth > 0;
        } else if (imageObject instanceof HTMLCanvasElement) {
            isImageReady = imageObject.width > 0 && imageObject.height > 0;
        }
        if (!imageObject || !isImageReady || !crop || !canvas || canvasWidth <= 0 || canvasHeight <= 0) {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (canvas.width !== 0) canvas.width = 0;
                if (canvas.height !== 0) canvas.height = 0;
            }
            return;
        }

        const ctx = canvas.getContext("2d");
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const tmpCanvas = document.createElement("canvas");
        tmpCanvas.width = canvasWidth;
        tmpCanvas.height = canvasHeight;
        const tmpCtx = tmpCanvas.getContext("2d");
        const roundingForDisplay = isCropping ? 0 : cropRounding;
        applyAllEffects(tmpCtx, imageObject, tmpCanvas, filter, adjustments, crop, roundingForDisplay);

        const requiresPreview = format === "image/jpeg" || (format === "image/webp" && !lossless);
        if (requiresPreview) {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(tmpCanvas, 0, 0, canvasWidth, canvasHeight);

            const blobOptions = { quality: quality / 100 };
            tmpCanvas.toBlob((blob) => {
                if (!blob) { /* ... error handling ... */ return; }
                const compressedUrl = URL.createObjectURL(blob);
                const previewImg = previewImageRef.current;
                previewImg.onload = () => {
                    ctx.drawImage(previewImg, 0, 0, canvasWidth, canvasHeight);
                    URL.revokeObjectURL(compressedUrl);
                };
                previewImg.onerror = () => { /* ... error handling ... */ ctx.drawImage(tmpCanvas, 0, 0, canvasWidth, canvasHeight); URL.revokeObjectURL(compressedUrl); }
                previewImg.src = compressedUrl;
            }, format, blobOptions.quality);
        } else {
            ctx.drawImage(tmpCanvas, 0, 0, canvasWidth, canvasHeight);
        }

    }, [imageObject, crop, filter, adjustments, format, quality, lossless,
        isCropping, cropRounding, canvasWidth, canvasHeight]);

    useImperativeHandle(ref, () => ({
        getConfirmationData: () => {
            return {
                interactiveCrop: currentInteractiveCropFromHook,
                scale: currentScale,
            };
        }
    }), [currentInteractiveCropFromHook, currentScale])

    return (
        <div
            ref={containerRef}
            style={{ width: "100%", position: "relative", minHeight: "100px", overflow: "hidden" }}
            className="bg-gray-100 dark:bg-gray-900"
        >
            <canvas
                ref={canvasRef}
                className="block w-full h-auto shadow-md"
                style={{ display: 'block' }}
            />
            <div
                ref={overlayRef}
                {...overlayProps}
            >
                <div
                    {...handleProps}
                ></div>
                {isResizing && lockAspectRatio && (
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
                            x1="0"
                            y1="0"
                            x2="100%"
                            y2="100%"
                            stroke="rgba(255, 255, 255, 0.85)"
                            strokeWidth="3"
                            strokeDasharray="4 4"
                        />
                        <line
                            x1="0"
                            y1="0"
                            x2="100%"
                            y2="100%"
                            stroke="rgb(59, 130, 246)"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                        />
                    </svg>
                )}
            </div>
        </div>
    );
});

export default ImageCanvas;