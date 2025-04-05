import React, { useState, useEffect } from "react";
import { useEditingContext } from "../../context/EditingContext";
import { cropPresets } from "../../constants/cropPresets";

const CropPanel = () => {
    const {
        aspectRatio, setAspectRatio, isCropping, startCroppingSession,
        cropRounding, setCropRounding, lockAspectRatio, setLockAspectRatio,
        confirmCrop, cancelCrop, hasImage
    } = useEditingContext();

    const [customRatioW, setCustomRatioW] = useState(1);
    const [customRatioH, setCustomRatioH] = useState(1);

    useEffect(() => {
        if (aspectRatio) {
            setCustomRatioW(aspectRatio.toFixed(2));
            setCustomRatioH((1).toFixed(2));
        } else {
            setCustomRatioW(1);
            setCustomRatioH(1);
        }
    }, [aspectRatio]);

    const handlePresetClick = (ratio) => {
        setAspectRatio(ratio);
        setLockAspectRatio(true);
        if (hasImage) {
            startCroppingSession();
        }
    };

    const handleFreeformClick = () => {
        setAspectRatio(null);
        setLockAspectRatio(false);
        if (hasImage) {
            startCroppingSession();
        }
    }

    const handleCustomRatioChange = (w, h) => {
        const width = parseFloat(w) || 0;
        const height = parseFloat(h) || 0;
        setCustomRatioW(w);
        setCustomRatioH(h);

        if (width > 0 && height > 0) {
            setAspectRatio(width / height);
            if (hasImage) {
                startCroppingSession();
            }
        } else {
            setAspectRatio(null);
        }
    };

    const handleRoundingChange = (e) => { const value = parseInt(e.target.value, 10); setCropRounding(Math.max(0, Math.min(50, value || 0))); };
    const handleRoundingInputChange = (e) => { const value = parseInt(e.target.value, 10); setCropRounding(Math.max(0, Math.min(50, value || 0))); };

    const controlsDisabled = !hasImage;
    const roundingDisabled = !isCropping || !hasImage;
    const lockDisabled = !isCropping || !hasImage || aspectRatio === null;
    const customRatioDisabled = (lockAspectRatio && aspectRatio !== null) || !hasImage;


    return (
        <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Presets</p>
            <div className="flex flex-wrap gap-2">
                {cropPresets.map((preset) => (
                    <button
                        key={preset.name}
                        onClick={() => handlePresetClick(preset.ratio)}
                        className={`px-2 py-1 text-white rounded ${preset.color} ${aspectRatio === preset.ratio && isCropping ? 'ring-2 ring-offset-1 ring-offset-gray-800 ring-white' : ''} disabled:opacity-70 disabled:cursor-not-allowed`}
                        disabled={controlsDisabled}
                    >
                        {preset.name}
                    </button>
                ))}
                <button
                    onClick={handleFreeformClick}
                    className={`px-2 py-1 rounded bg-gray-500 hover:bg-gray-600 text-white ${aspectRatio === null && isCropping ? 'ring-2 ring-offset-1 ring-offset-gray-800 ring-white' : ''} disabled:opacity-70 disabled:cursor-not-allowed`}
                    disabled={controlsDisabled}
                >
                    Freeform
                </button>
            </div>
            <div className="flex items-center gap-2">
                <span className={`text-sm ${customRatioDisabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>Custom Ratio:</span>
                <input
                    type="number" step="0.1" min="0.1"
                    value={customRatioW}
                    onChange={(e) => handleCustomRatioChange(e.target.value, customRatioH)}
                    className="w-16 text-center rounded px-1 py-0.5 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={customRatioDisabled}
                    aria-label="Custom ratio width"
                />
                <span className={`text-sm ${customRatioDisabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>:</span>
                <input
                    type="number" step="0.1" min="0.1"
                    value={customRatioH}
                    onChange={(e) => handleCustomRatioChange(customRatioW, e.target.value)}
                    className="w-16 text-center rounded px-1 py-0.5 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed"
                    disabled={customRatioDisabled}
                    aria-label="Custom ratio height"
                />
            </div>
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label htmlFor="cropRoundingInput" className={`block text-sm font-medium ${roundingDisabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>Crop Rounding (%)</label>
                    <input
                        type="number" min="0" max="50" step="1"
                        value={cropRounding}
                        onChange={handleRoundingInputChange}
                        className="w-16 text-center rounded px-1 py-0.5 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:text-gray-500 disabled:cursor-not-allowed"
                        disabled={roundingDisabled}
                        aria-label="Crop rounding percentage"
                    />
                </div>
                <input
                    type="range" min="0" max="50" step="1"
                    value={cropRounding}
                    onChange={handleRoundingChange}
                    className="w-full accent-blue-500 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={roundingDisabled}
                    aria-label="Crop rounding slider"
                />
            </div>
            <div className="flex items-center">
                <input
                    id="lockAspect" type="checkbox"
                    checked={lockAspectRatio}
                    onChange={(e) => setLockAspectRatio(e.target.checked)}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-600 dark:ring-offset-gray-800 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={lockDisabled}
                />
                <label htmlFor="lockAspect" className={`text-sm ${lockDisabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>Lock Aspect Ratio</label>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-300 dark:border-gray-600">
                <button
                    onClick={confirmCrop}
                    className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 text-sm transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-green-500"
                    disabled={!isCropping}
                >
                    Confirm Crop
                </button>
                <button
                    onClick={cancelCrop}
                    className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 text-sm transition duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-red-500"
                    disabled={!isCropping}
                >
                    Cancel Crop
                </button>
            </div>
        </div>
    );
};

export default CropPanel;