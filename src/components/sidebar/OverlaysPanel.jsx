import React from "react";
import { useEditingContext } from "../../context/EditingContext";

const OverlaysPanel = () => {
    const context = useEditingContext();
    if (!context) {
        return <div className="p-2 text-sm text-gray-500 dark:text-gray-400">Loading...</div>;
    }
    const { overlays, setOverlays, hasImage, setOverlayInteractionState, isCropping } = context;
    const isDisabled = !hasImage;
    const isAddDisabled = isDisabled || isCropping;
    const addBlurOverlay = () => {
        if (isAddDisabled) return;

        const newOverlay = {
            // Simple ID generation for now, consider uuid library for more robustness
            id: `blur-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            type: 'blur',
            x: 50,
            y: 50,
            width: 100,
            height: 100,
            intensity: 5,
        };

        setOverlayInteractionState({ active: true, type: 'blur', step: 'drawing' });
    };

    const deleteOverlay = (idToDelete) => {
        setOverlays(prevOverlays => prevOverlays.filter(overlay => overlay.id !== idToDelete));
    };

    const updateOverlayIntensity = (idToUpdate, newIntensity) => {
        setOverlays(prevOverlays =>
            prevOverlays.map(overlay =>
                overlay.id === idToUpdate
                    ? { ...overlay, intensity: Math.max(1, parseInt(newIntensity, 10) || 1) }
                    : overlay
            )
        );
    };

    return (
        <div className="p-2 space-y-4">
            <button
                title={isCropping ? "Confirm or cancel crop first" : "Draw a new blur region on the image"}
                onClick={addBlurOverlay}
                className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded text-sm ${isAddDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isAddDisabled}
            >
                Add Blur Region
            </button>

            <div className="space-y-3 border-t border-gray-300 dark:border-gray-600 pt-3 mt-3">
                <h3 className={`text-sm font-medium ${isDisabled ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    Active Overlays ({overlays.length})
                </h3>
                {overlays.length === 0 && !isDisabled && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">No overlays added yet.</p>
                )}
                {isDisabled && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">Load an image to add overlays.</p>
                )}

                <ul className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {overlays.map((overlay, index) => (
                        <li key={overlay.id} className="text-xs border border-gray-200 dark:border-gray-700 rounded p-2 space-y-1.5 bg-gray-50 dark:bg-gray-700/50">
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-gray-700 dark:text-gray-200 capitalize">
                                    {overlay.type} {index + 1}
                                </span>
                                <button
                                    onClick={() => deleteOverlay(overlay.id)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-1 rounded"
                                    title="Delete Overlay"
                                    disabled={isDisabled}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            {overlay.type === 'blur' && (
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
                                        onChange={(e) => updateOverlayIntensity(overlay.id, e.target.value)}
                                        className={`w-full accent-blue-500 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={isDisabled}
                                        aria-label={`Blur intensity for overlay ${index + 1}`}
                                    />
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default OverlaysPanel;