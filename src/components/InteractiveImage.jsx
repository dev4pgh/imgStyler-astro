import React, { useState, useRef, useCallback } from "react";
import FileUpload from "./ui/FileUpload";
import ImageCanvas from "./canvas/ImageCanvas";
import ExportControls from "./controls/ExportControls";
import Sidebar from "./sidebar/Sidebar";
import { useImageLoader } from "../hooks/useImageLoader";
import { useCroppingState } from "../hooks/useCroppingState";
import { useExportManager } from "../hooks/useExportManager";
import { initialAdjustments } from "../constants/adjustments";
import { EditingProvider } from "../context/EditingContext";

const InteractiveImage = () => {
    const [selectedFilter, setSelectedFilter] = useState("None")
    const [adjustments, setAdjustments] = useState(initialAdjustments);
    const { file, setFile, originalImage, isLoading, imageLoadError } = useImageLoader();
    const {
        crop, isCropping, aspectRatio, setAspectRatio, cropRounding, setCropRounding,
        lockAspectRatio, setLockAspectRatio, startCroppingSession, confirmCrop, cancelCrop
    } = useCroppingState(originalImage);
    const exportManager = useExportManager();
    const imageCanvasRef = useRef(null);

    const handleConfirmCrop = useCallback(() => {
        const confirmationData = imageCanvasRef.current?.getConfirmationData();
        if (confirmationData?.interactiveCrop && confirmationData?.scale > 0) {
            confirmCrop(confirmationData.interactiveCrop, confirmationData.scale);
        } else {
            cancelCrop();
        }
    }, [confirmCrop, cancelCrop]);

    const handleCancelCrop = useCallback(() => {
        cancelCrop();
    }, [cancelCrop]);

    const editingContextValue = {
        crop,
        originalImage,
        file,
        hasImage: !!originalImage && !isLoading && !imageLoadError,
        selectedFilter,
        setSelectedFilter,
        adjustments,
        setAdjustments,
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
    };

    return (
        <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto space-y-6 md:space-y-0 md:space-x-6">
            <div className="flex-1">
                <div className={`relative ${isCropping ? 'pointer-events-none' : ''}`}>
                    <FileUpload onFileSelected={setFile} clickable={true} hideBorder={!!originalImage}>
                        {originalImage && crop ? (
                            <ImageCanvas
                                ref={imageCanvasRef}
                                imageObject={originalImage}
                                crop={crop}
                                filter={selectedFilter}
                                adjustments={adjustments}
                                format={exportManager.format}
                                quality={exportManager.quality}
                                lossless={exportManager.lossless}
                                isCropping={isCropping}
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
                    </FileUpload>
                    {originalImage && !isLoading && !imageLoadError && !isCropping && (
                        <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                            Click image or drag in a new file to replace.
                        </p>
                    )}

                    <div className={!originalImage || isLoading || imageLoadError ? 'opacity-50 pointer-events-none' : ''}>
                        <EditingProvider value={editingContextValue}>
                            {originalImage && !isLoading && !imageLoadError && (
                                <ExportControls />
                            )}
                        </EditingProvider>
                    </div>

                </div>
            </div>

            <EditingProvider value={editingContextValue}>
                <Sidebar />
            </EditingProvider>
        </div>
    );
};

export default InteractiveImage;