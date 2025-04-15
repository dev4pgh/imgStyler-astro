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
    const [selectedFilter, setSelectedFilter] = useState("None");
    const [adjustments, setAdjustments] = useState(initialAdjustments);
    const [overlayInteractionState, setOverlayInteractionState] = useState({
        active: false,
        type: null,
        step: null,
    });
    const [selectedOverlayId, setSelectedOverlayId] = useState(null);
    const [lastInteractionEndTime, setLastInteractionEndTime] = useState(0);
    const containerRef = useRef(null);
    const [overlays, setOverlays] = useState([]);
    const { file, setFile, originalImage, isLoading, imageLoadError } = useImageLoader();
    const {
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
    } = useCroppingState(originalImage);
    const { width: displayWidth, height: displayHeight, scale: displayScale } = useCanvasDisplaySize(
        containerRef,
        crop,
        originalImage
    );
    const { interactiveCrop, overlayProps: cropOverlayProps, handleProps: cropHandleProps } =
        useInteractiveCrop({
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
        if (currentInteractiveCrop && displayScale > 0) {
            confirmCrop(currentInteractiveCrop, displayScale);
        } else {
            cancelCrop();
        }
    }, [confirmCrop, cancelCrop, displayScale, interactiveCrop]);

    const handleCancelCrop = useCallback(() => {
        cancelCrop();
    }, [cancelCrop]);

    const editingContextValue = useMemo(
        () => ({
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
        }),
        [
            originalImage,
            file,
            isLoading,
            imageLoadError,
            displayWidth,
            displayHeight,
            displayScale,
            crop,
            isCropping,
            aspectRatio,
            cropRounding,
            lockAspectRatio,
            selectedFilter,
            adjustments,
            overlays,
            selectedOverlayId,
            lastInteractionEndTime,
            overlayInteractionState,
            exportManager,
            handleConfirmCrop,
            handleCancelCrop,
        ]
    );

    const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
    const toggleBottomSheet = () => {
        setIsBottomSheetExpanded((prev) => !prev);
    };

    return (
        <EditingProvider value={editingContextValue}>
            <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto space-y-6 md:space-y-0 md:space-x-6">
                <div className="flex-1">
                    <div
                        ref={containerRef}
                        className={`relative ${isCropping ? "pointer-events-none" : ""} bg-gray-100 dark:bg-gray-900 overflow-hidden`}
                    >
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
                                <OverlayInteractionLayer containerRef={containerRef} />
                            )}
                        </FileUpload>

                        {originalImage && !isLoading && !imageLoadError && !isCropping && !overlayInteractionState.active && (
                            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                                Click image or drag in a new file to replace.
                            </p>
                        )}

                        <div className={!originalImage || isLoading || imageLoadError ? "opacity-50 pointer-events-none" : ""}>
                            {originalImage && !isLoading && !imageLoadError && <ExportControls />}
                        </div>
                    </div>
                </div>

                <div className="hidden md:block">
                    <Sidebar />
                </div>
            </div>
            <div
                className="md:hidden fixed inset-x-0 bottom-0 z-50 transition-all duration-300"
                style={{ height: isBottomSheetExpanded ? "40vh" : "15vh" }}
            >
                <div className="h-full bg-white dark:bg-gray-800 shadow-lg rounded-t-lg flex flex-col border-t border-gray-300 dark:border-gray-700">
                    <div
                        className="flex items-center justify-center p-2 cursor-pointer"
                        onClick={toggleBottomSheet}
                    >
                        {isBottomSheetExpanded ? (
                            <svg
                                className="w-6 h-6 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        ) : (
                            <svg
                                className="w-6 h-6 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <Sidebar />
                    </div>
                </div>
            </div>
        </EditingProvider>
    );
};

export default InteractiveImage;
