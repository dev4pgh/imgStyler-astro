import React, { useState, useRef, useCallback, useMemo } from "react";
import FileUpload from "./ui/FileUpload";
import ImageCanvas from "./canvas/ImageCanvas";
import ExportControls from "./controls/ExportControls";
import Sidebar from "./sidebar/Sidebar";
import OverlayInteractionLayer from "./canvas/OverlayInteractionLayer";
import { useImageLoader } from "../hooks/useImageLoader";
import { useCroppingState } from "../hooks/useCroppingState";
import { useExportManager } from "../hooks/useExportManager";
import { useCanvasDisplaySize } from "../hooks/useCanvasDisplaySize";
import { useInteractiveCrop } from "../hooks/useInteractiveCrop";
import { initialAdjustments } from "../constants/adjustments";
import { EditingProvider } from "../context/EditingContext";


const InteractiveImage = () => {
    const [selectedFilter, setSelectedFilter] = useState("None")
    const [adjustments, setAdjustments] = useState(initialAdjustments);
    const [overlayInteractionState, setOverlayInteractionState] = useState({ active: false, type: null, step: null });
    const [selectedOverlayId, setSelectedOverlayId] = useState(null);
    const [lastInteractionEndTime, setLastInteractionEndTime] = useState(0);    // We need this so letting go of the mouse button when creating an overlay box does not trigger a click to open the file upload dialog
    const containerRef = useRef(null);

    const [overlays, setOverlays] = useState([]);
    const { file, setFile, originalImage, isLoading, imageLoadError } = useImageLoader();
    const {
        crop, isCropping, aspectRatio, setAspectRatio, cropRounding, setCropRounding,
        lockAspectRatio, setLockAspectRatio, startCroppingSession, confirmCrop, cancelCrop
    } = useCroppingState(originalImage);

    const { width: displayWidth, height: displayHeight, scale: displayScale } = useCanvasDisplaySize(
        containerRef,
        crop,
        originalImage
    );

    const {
        interactiveCrop,
        overlayProps: cropOverlayProps,
        handleProps: cropHandleProps,
    } = useInteractiveCrop({
        containerRef,
        canvasWidth: displayWidth,
        canvasHeight: displayHeight,
        aspectRatio,
        lockAspectRatio,
        isCropping,
        cropRounding,
        disabled: !isCropping,
    });

    const exportManager = useExportManager();

    const handleConfirmCrop = useCallback(() => {
        const currentInteractiveCrop = interactiveCrop;

        console.log("[handleConfirmCrop] Received confirmationData:", currentInteractiveCrop);

        if (currentInteractiveCrop && displayScale > 0) {
            console.log("[handleConfirmCrop] Data valid. Calling confirmCrop (from useCroppingState)...");
            confirmCrop(currentInteractiveCrop, displayScale);
        } else {
            console.warn("[handleConfirmCrop] Cannot confirm crop - invalid interactiveCrop state or display scale.", { currentInteractiveCrop, displayScale });
            cancelCrop();
        }
    }, [confirmCrop, cancelCrop, displayScale, interactiveCrop]);

    const handleCancelCrop = useCallback(() => {
        cancelCrop();
    }, [cancelCrop]);

    const editingContextValue = useMemo(() => ({
        originalImage,
        file,
        hasImage: !!originalImage && !isLoading && !imageLoadError,
        displayWidth,
        displayHeight,
        displayScale,
        crop,
        isCropping,
        aspectRatio,
        setAspectRatio,
        cropRounding,
        setCropRounding,
        lockAspectRatio,
        setLockAspectRatio,
        startCroppingSession,
        confirmCrop: handleConfirmCrop,
        cancelCrop: handleCancelCrop,
        selectedFilter,
        setSelectedFilter,
        adjustments,
        setAdjustments,
        overlays,
        setOverlays,
        selectedOverlayId,
        setSelectedOverlayId,
        lastInteractionEndTime,
        setLastInteractionEndTime,
        overlayInteractionState,
        setOverlayInteractionState,
        format: exportManager.format,
        setFormat: exportManager.setFormat,
        quality: exportManager.quality,
        setQuality: exportManager.setQuality,
        lossless: exportManager.lossless,
        setLossless: exportManager.setLossless,
        isExporting: exportManager.isExporting,
        startExport: exportManager.startExport,
        exportError: exportManager.exportError,
        clearExportError: exportManager.clearExportError,
        enableResizing: exportManager.enableResizing,
        setEnableResizing: exportManager.setEnableResizing,
        targetWidth: exportManager.targetWidth,
        setTargetWidth: exportManager.setTargetWidth,
        targetHeight: exportManager.targetHeight,
        setTargetHeight: exportManager.setTargetHeight,
        keepAspectRatio: exportManager.keepAspectRatio,
        setKeepAspectRatio: exportManager.setKeepAspectRatio,
    }), [
        originalImage, file, isLoading, imageLoadError,
        displayWidth, displayHeight, displayScale,
        crop, isCropping, aspectRatio, setAspectRatio, cropRounding, setCropRounding, lockAspectRatio, setLockAspectRatio, startCroppingSession, handleConfirmCrop, handleCancelCrop,
        selectedFilter, setSelectedFilter, adjustments, setAdjustments,
        overlays, setOverlays, overlayInteractionState, setOverlayInteractionState,
        selectedOverlayId, setSelectedOverlayId,
        lastInteractionEndTime,
        exportManager
    ]);

    return (
        <EditingProvider value={editingContextValue}>
            <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto space-y-6 md:space-y-0 md:space-x-6">
                <div className="flex-1">
                    <div ref={containerRef} className={`relative ${isCropping ? 'pointer-events-none' : ''} bg-gray-100 dark:bg-gray-900 overflow-hidden`}>
                        <FileUpload
                            onFileSelected={setFile}
                            clickable={!overlayInteractionState.active && !isCropping}
                            hideBorder={!!originalImage}
                        >
                            {originalImage && crop ? (
                                <ImageCanvas
                                    imageObject={originalImage}
                                    crop={crop}
                                    filter={selectedFilter}
                                    adjustments={adjustments}
                                    format={exportManager.format}
                                    quality={exportManager.quality}
                                    lossless={exportManager.lossless}
                                    overlays={overlays}
                                    canvasWidth={displayWidth}
                                    canvasHeight={displayHeight}
                                    scale={displayScale}
                                    isCropping={isCropping}
                                    cropOverlayProps={cropOverlayProps}
                                    cropHandleProps={cropHandleProps}
                                    aspectRatio={aspectRatio}
                                    cropRounding={cropRounding}
                                    lockAspectRatio={lockAspectRatio}
                                />
                            ) : isLoading ? (
                                <div className="flex items-center justify-center p-10 rounded-lg text-center min-h-[300px] bg-gray-100 dark:bg-gray-900">
                                    Loading image...
                                </div>
                            ) : imageLoadError ? (
                                <div className="flex flex-col items-center justify-center p-10 rounded-lg text-center min-h-[300px] bg-red-100 dark:bg-red-900 border border-red-500 text-red-700 dark:text-red-200">
                                    <p className="font-semibold">Image Load Error</p>
                                    <p className="mt-2">{imageLoadError}</p>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="mt-4 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
                                    >
                                        Clear Selection
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-10 rounded-lg text-center min-h-[300px] cursor-pointer bg-gray-100 dark:bg-gray-900">
                                    <p className="mb-4 text-lg text-gray-800 dark:text-gray-100">
                                        Drag & Drop an image here, or click to select a file
                                    </p>
                                    <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 pointer-events-none">
                                        Choose File
                                    </button>
                                </div>
                            )}
                            {originalImage && !isCropping && (
                                <OverlayInteractionLayer
                                    containerRef={containerRef}
                                />
                            )}
                        </FileUpload>

                        {originalImage && !isLoading && !imageLoadError && !isCropping && !overlayInteractionState.active && (
                            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                                Click image or drag in a new file to replace.
                            </p>
                        )}

                        <div className={!originalImage || isLoading || imageLoadError ? 'opacity-50 pointer-events-none' : ''}>
                            {originalImage && !isLoading && !imageLoadError && (
                                <ExportControls />
                            )}
                        </div>

                    </div>
                </div>
                <Sidebar />
            </div>
        </EditingProvider>
    );
};

export default InteractiveImage;