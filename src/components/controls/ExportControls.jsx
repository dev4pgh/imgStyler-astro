import React, { useEffect } from "react";
import { FORMAT_OPTIONS } from "../../constants/exportOptions";
import { useEditingContext } from "../../context/EditingContext";

const ExportControls = () => {
    const {
        format, quality, lossless, isExporting,
        setFormat, setQuality, setLossless,
        startExport,
        originalImage, crop, selectedFilter, adjustments, cropRounding, file, hasImage,
        overlays,
        enableResizing, setEnableResizing,
        targetWidth, setTargetWidth,
        targetHeight, setTargetHeight,
        keepAspectRatio, setKeepAspectRatio,
    } = useEditingContext();
    if (!hasImage) return null;

    const currentFormat = FORMAT_OPTIONS.find((f) => f.value === format);
    const getOriginalDims = () => {
        if (!originalImage) return null;
        if (originalImage instanceof HTMLImageElement) {
            return { w: originalImage.naturalWidth, h: originalImage.naturalHeight };
        } else if (originalImage instanceof HTMLCanvasElement) {
            return { w: originalImage.width, h: originalImage.height };
        }
        return null;
    }
    const originalDims = getOriginalDims();

    const getFiletypeDisplay = () => {
        if (!file) return '';
        return file.type || file.name.split('.').pop()?.toUpperCase() || 'Unknown';
    };

    const showQuality = currentFormat.lossy && (!currentFormat.supportsLossless || !lossless);
    const showLossless = currentFormat.supportsLossless;

    const handleDimensionChange = (dimension, value) => {
        const numValue = parseInt(value, 10);
        const isValidNum = !isNaN(numValue) && numValue > 0;
        const canCalculateRatio = crop?.width > 0 && crop?.height > 0;

        if (dimension === 'width') {
            setTargetWidth(value);
            if (keepAspectRatio && isValidNum && canCalculateRatio) {
                const ratio = crop.height / crop.width;
                setTargetHeight(String(Math.round(numValue * ratio)));
            }
        } else if (dimension === 'height') {
            setTargetHeight(value);
            if (keepAspectRatio && isValidNum && canCalculateRatio) {
                const ratio = crop.width / crop.height;
                setTargetWidth(String(Math.round(numValue * ratio)));
            }
        }
    };

    useEffect(() => {
        if (enableResizing && crop) {
            if (targetWidth === '') setTargetWidth(String(Math.round(crop.width)));
            if (targetHeight === '') setTargetHeight(String(Math.round(crop.height)));
        }
    }, [enableResizing, crop, targetWidth, targetHeight, setTargetWidth, setTargetHeight]);

    const handleExportClick = () => {
        if (!originalImage || !crop || !file) {
            return;
        }
        startExport({
            image: originalImage,
            crop,
            filter: selectedFilter,
            adjustments,
            rounding: cropRounding,
            overlays,
            originalFilename: file.name,
        });
    };

    return (
        <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-xl shadow-md mt-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Export Format:
                </label>
                <select
                    className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-gray-100"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                >
                    {FORMAT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {(originalDims || file) && (
                <div className="text-xs text-gray-600 dark:text-gray-300 border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                    {originalDims && `Original Size: ${originalDims.w} x ${originalDims.h} px`}
                    {originalDims && file && ' | '}
                    {file && `Type: ${getFiletypeDisplay()}`}
                    <br />
                    {crop && `Current Crop Size: ${Math.round(crop.width)}  x ${Math.round(crop.height)} px`}
                </div>
            )}

            <div className="border-t border-gray-300 dark:border-gray-600 pt-4 space-y-3">
                <div className="flex items-center">
                    <input
                        id="enableResize"
                        type="checkbox"
                        checked={enableResizing}
                        onChange={(e) => setEnableResizing(e.target.checked)}
                        className="mr-2 h-4 w-4 rounnded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                        disabled={isExporting}
                    />
                    <label htmlFor="enableResize" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Resize Output Image
                    </label>
                </div>

                {enableResizing && (
                    <div className="space-y-3 pl-6 border-l-2 border-gray-300 dark:border-gray-500 ml-2">
                        <div className="grid grid-cols-[auto_1fr_auto] gap-x-2 gap-y-3 items-center">
                            <label htmlFor="targetWidth" className="text-xs text-gray-600 dark:text-gray-400">W:</label>
                            <input
                                id="targetWidth"
                                type="number"
                                min="1"
                                placeholder={crop ? String(Math.round(crop.width)) : 'auto'}
                                value={targetWidth}
                                onChange={(e) => handleDimensionChange('width', e.target.value)}
                                className="w-full text-sm rounded px-2 py-1 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed"
                                disabled={isExporting}
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">px</span>

                            <label htmlFor="targetHeight" className="text-xs text-gray-600 dark:text-gray-400">H:</label>
                            <input
                                id="targetHeight"
                                type="number"
                                min="1"
                                placeholder={crop ? String(Math.round(crop.height)) : 'auto'}
                                value={targetHeight}
                                onChange={(e) => handleDimensionChange('height', e.target.value)}
                                className="w-full text-sm rounded px-2 py-1 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed"
                                disabled={isExporting}
                            />
                            <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
                        </div>
                        <div className="flex items-center pt-1">
                            <input
                                id="keepRatio"
                                type="checkbox"
                                checked={keepAspectRatio}
                                onChange={(e) => setKeepAspectRatio(e.target.checked)}
                                className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                                disabled={isExporting}
                            />
                            <label htmlFor="keepRatio" className="text-xs font-medium text-gray-600 dark:text-gray-400">Keep Aspect Ratio</label>
                            <button
                                onClick={() => {
                                    if (crop) {
                                        setTargetWidth(String(Math.round(crop.width)));
                                        setTargetHeight(String(Math.round(crop.height)));
                                    }
                                }}
                                className="ml-auto text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                                title="Reset dimensions to current crop size"
                                disabled={isExporting || !crop}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {showLossless && (
                <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Lossless:
                    </label>
                    <input
                        type="checkbox"
                        checked={lossless}
                        onChange={(e) => setLossless(e.target.checked)}
                    />
                </div>
            )}

            {showQuality && (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quality: {Math.round(quality)}%
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={100}
                        step={1}
                        className="w-full accent-blue-500 cursor-pointer"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value, 10))}
                    />
                </div>
            )}

            <button
                className={`w-full text-white py-2 rounded-lg transition shadow-sm ${isExporting ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                onClick={handleExportClick}
                disabled={isExporting}
            >
                {isExporting ? 'Exporting...' : 'Download Edited Image'}
            </button>
        </div>
    );
};

export default ExportControls;
