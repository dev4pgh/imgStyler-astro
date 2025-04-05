import React from "react";
import { useEditingContext } from "../../context/EditingContext";
import { adjustmentConfigs, initialAdjustments } from "../../constants/adjustments";

const AdjustmentsPanel = () => {
    const { adjustments, setAdjustments, hasImage } = useEditingContext();
    const isDisabled = !hasImage;
    const handleChange = (key, value) => {
        setAdjustments((prev) => ({ ...prev, [key]: value }));
    };

    const handleReset = () => {
        setAdjustments(initialAdjustments);
    };

    return (
        <div className="p-2 space-y-4">
            {adjustmentConfigs.map(config => (
                <div key={config.key}>
                    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                        {config.label} ({adjustments[config.key]}{config.unit})
                    </label>
                    <input
                        type="range"
                        min={config.min}
                        max={config.max}
                        value={adjustments[config.key]}
                        onChange={(e) => handleChange(config.key, parseInt(e.target.value))}
                        className={`w-full accent-blue-500 cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isDisabled}
                    />
                </div>
            ))}
            <button
                onClick={handleReset}
                className={`w-full bg-red-500 hover:bg-red-600 text-white py-1 rounded ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isDisabled}
            >
                Reset Adjustments
            </button>
        </div>
    );
};

export default AdjustmentsPanel;
