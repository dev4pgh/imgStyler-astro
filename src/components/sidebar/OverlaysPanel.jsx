import React from "react";
import { useEditingContext } from "../../context/EditingContext";
import { FONT_FAMILY_OPTIONS } from "../../constants/textOptions";

const OverlaysPanel = () => {
    const context = useEditingContext();
    if (!context) {
        return (
            <div className="p-2 text-sm text-gray-500 dark:text-gray-400">
                Loading...
            </div>
        );
    }
    const {
        overlays,
        setOverlays,
        hasImage,
        setOverlayInteractionState,
        isCropping,
        selectedOverlayId,
        setSelectedOverlayId,
    } = context;
    const isDisabled = !hasImage;
    const isAddDisabled = isDisabled || isCropping;

    const startOverlayDraw = (type) => {
        if (isAddDisabled) return;
        setOverlayInteractionState({ active: true, type: type, step: "drawing" });
    };

    const deleteOverlay = (idToDelete) => {
        setOverlays((prevOverlays) =>
            prevOverlays.filter((overlay) => overlay.id !== idToDelete)
        );
    };

    const updateOverlayProperty = (idToUpdate, propertyName, value) => {
        setOverlays((prevOverlays) =>
            prevOverlays.map((overlay) =>
                overlay.id === idToUpdate
                    ? { ...overlay, [propertyName]: value }
                    : overlay
            )
        );
    };

    const updateBlurIntensity = (idToUpdate, newIntensity) => {
        const intensityValue = Math.max(1, parseInt(newIntensity, 10) || 1);
        updateOverlayProperty(idToUpdate, "intensity", intensityValue);
    };

    const updateFontSize = (idToUpdate, newSize) => {
        const sizeValue = Math.max(8, parseInt(newSize, 10) || 8);
        updateOverlayProperty(idToUpdate, "fontSize", sizeValue);
    };

    return (
        <div className="p-2 space-y-4">
            <div className="flex gap-2">
                <button
                    title={
                        isCropping
                            ? "Finish cropping before adding a new overlay"
                            : "Draw a new blur region"
                    }
                    onClick={() => startOverlayDraw("blur")}
                    className={`flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded text-sm ${isAddDisabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    disabled={isAddDisabled}
                >
                    Add Blur
                </button>
                <button
                    title={
                        isCropping
                            ? "Finish cropping before adding a new overlay"
                            : "Draw a new text box"
                    }
                    onClick={() => startOverlayDraw("text")}
                    className={`flex-1 bg-teal-500 hover:bg-teal-600 text-white py-1.5 rounded text-sm ${isAddDisabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    disabled={isAddDisabled}
                >
                    Add Text
                </button>
            </div>

            <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active Overlays ({overlays.length})
                </h3>
                {isCropping && (
                    <div className="mt-1 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-200">
                        Cropping is active — please confirm or cancel the crop to add or modify overlays.
                    </div>
                )}
                <div
                    className="mt-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 overflow-y-auto"
                    style={{ maxHeight: "calc(100vh - 150px)" }}
                >
                    <ul className="space-y-3 px-2 py-1 sm:max-h-[calc(100vh-150px)] md:max-h-[calc(100vh-300px)]">
                        {overlays.length === 0 && !isDisabled && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                No overlays added yet.
                            </p>
                        )}
                        {isDisabled && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                                Load an image to add overlays.
                            </p>
                        )}
                        {overlays.map((overlay, index) => {
                            const isSelected = overlay.id === selectedOverlayId;
                            return (
                                <li
                                    key={overlay.id}
                                    className={`text-xs border rounded p-2 space-y-1.5 ${isSelected
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                                        }`}
                                    onClick={() => setSelectedOverlayId(overlay.id)}
                                >
                                    <div className="flex justify-between items-center pb-1 mb-1 border-b border-gray-200 dark:border-gray-600">
                                        <span className="font-medium text-gray-700 dark:text-gray-200 capitalize">
                                            {overlay.type} {index + 1}
                                        </span>
                                        <button
                                            onClick={() => deleteOverlay(overlay.id)}
                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-1 rounded"
                                            title="Delete Overlay"
                                            disabled={isDisabled}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {overlay.type === "blur" && (
                                        <div>
                                            <label className="block text-xs mb-0.5 text-gray-600 dark:text-gray-300">
                                                Intensity: {overlay.intensity}%
                                            </label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="25"
                                                step="1"
                                                value={overlay.intensity}
                                                onChange={(e) =>
                                                    updateBlurIntensity(overlay.id, e.target.value)
                                                }
                                                className={`w-full accent-blue-500 cursor-pointer ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                                disabled={isDisabled}
                                                aria-label={`Blur intensity for overlay ${index + 1}`}
                                            />
                                        </div>
                                    )}

                                    {overlay.type === "text" && (
                                        <div className="space-y-2">
                                            <div>
                                                <label className="block text-xs mb-0.5 text-gray-600 dark:text-gray-300">
                                                    Text:
                                                </label>
                                                <textarea
                                                    value={overlay.text}
                                                    onChange={(e) =>
                                                        updateOverlayProperty(overlay.id, "text", e.target.value)
                                                    }
                                                    rows={2}
                                                    className={`w-full text-xs rounded px-2 py-1 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    disabled={isDisabled}
                                                    aria-label={`Text content for overlay ${index + 1}`}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 items-center">
                                                <div>
                                                    <label className="block text-xs mb-0.5 text-gray-600 dark:text-gray-300">
                                                        Size: {overlay.fontSize}px
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="8"
                                                        step="1"
                                                        value={overlay.fontSize}
                                                        onChange={(e) =>
                                                            updateFontSize(overlay.id, e.target.value)
                                                        }
                                                        className={`w-full text-xs rounded px-2 py-1 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                                        disabled={isDisabled}
                                                        aria-label={`Font size for overlay ${index + 1}`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs mb-0.5 text-gray-600 dark:text-gray-300">
                                                        Color:
                                                    </label>
                                                    <input
                                                        type="color"
                                                        value={overlay.color}
                                                        onChange={(e) =>
                                                            updateOverlayProperty(overlay.id, "color", e.target.value)
                                                        }
                                                        className={`w-full h-8 rounded border border-gray-300 dark:border-gray-500 ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                                        disabled={isDisabled}
                                                        aria-label={`Text color for overlay ${index + 1}`}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-300">
                                                    Alignment:
                                                </label>
                                                <div className="flex space-x-1">
                                                    {["left", "center", "right"].map((align) => (
                                                        <button
                                                            key={align}
                                                            onClick={() =>
                                                                updateOverlayProperty(overlay.id, "textAlign", align)
                                                            }
                                                            className={`flex-1 px-2 py-1 text-xs rounded border transition-colors ${overlay.textAlign === align
                                                                ? "bg-blue-500 border-blue-600 text-white font-medium"
                                                                : "bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-500"
                                                                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                                            disabled={isDisabled}
                                                            title={`Align text ${align}`}
                                                            aria-label={`Align text ${align}`}
                                                        >
                                                            {align.charAt(0).toUpperCase() + align.slice(1)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs mb-0.5 text-gray-600 dark:text-gray-300">
                                                    Font:
                                                </label>
                                                <select
                                                    value={overlay.fontFamily}
                                                    onChange={(e) =>
                                                        updateOverlayProperty(overlay.id, "fontFamily", e.target.value)
                                                    }
                                                    className={`w-full text-xs rounded px-2 py-1 border border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-400 ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                                                    disabled={isDisabled}
                                                    aria-label={`Font family for overlay ${index + 1}`}
                                                >
                                                    {FONT_FAMILY_OPTIONS.map((font) => (
                                                        <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                                            {font.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default OverlaysPanel;
