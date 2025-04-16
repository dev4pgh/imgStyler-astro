import React, { useState } from "react";
import { useEditingContext } from "../../context/EditingContext";
import CropPanel from "./CropPanel";
import AdjustmentsPanel from "./AdjustmentsPanel";
import FiltersPanel from "./FiltersPanel";
import OverlaysPanel from "./OverlaysPanel";

const Sidebar = () => {
    const {
        isCropping,
        confirmCrop,
        cancelCrop
    } = useEditingContext();

    const [activeTab, setActiveTab] = useState("crop");

    const renderActivePanel = () => {
        switch (activeTab) {
            case "crop":
                return <CropPanel />;
            case "adjustments":
                return <AdjustmentsPanel />;
            case "filters":
                return <FiltersPanel />;
            case "overlays":
                return <OverlaysPanel />;
            default:
                return null;
        }
    };

    return (
        <div className="w-full md:w-80">
            <div className="bg-white dark:bg-gray-800 p-2 shadow-md rounded">
                <div className="flex border-b border-gray-300 dark:border-gray-600 mb-2">
                    <button
                        className={`flex-1 py-2 text-center text-sm ${activeTab === "crop"
                            ? "border-b-2 border-blue-500 text-blue-400 font-medium"
                            : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                            }`}
                        onClick={() => setActiveTab("crop")}
                    >
                        Crop
                    </button>
                    <button
                        className={`flex-1 py-2 text-center text-sm ${activeTab === "adjustments"
                            ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                            : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                            }`}
                        onClick={() => setActiveTab("adjustments")}
                    >
                        Adjustments
                    </button>
                    <button
                        className={`flex-1 py-2 text-center text-sm ${activeTab === "filters"
                            ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                            : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                            }`}
                        onClick={() => setActiveTab("filters")}
                    >
                        Filters
                    </button>
                    <button
                        className={`flex-1 py-2 text-center text-sm ${activeTab === "overlays"
                            ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                            : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
                            }`}
                        onClick={() => setActiveTab("overlays")}
                    >
                        Overlays
                    </button>
                </div>

                {isCropping && (
                    <div className="mb-2 p-2 border border-blue-500 rounded bg-blue-50 dark:bg-blue-900/30">
                        <p className="text-sm text-blue-500 font-medium mb-2 text-center">
                            Cropping in Progress
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={confirmCrop}
                                className="flex-1 bg-green-500 text-white py-1 rounded hover:bg-green-600 text-sm"
                            >
                                Confirm Crop
                            </button>
                            <button
                                onClick={cancelCrop}
                                className="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600 text-sm"
                            >
                                Cancel Crop
                            </button>
                        </div>
                    </div>
                )}

                <div className="p-2 min-h-[100px]">
                    {renderActivePanel()}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
