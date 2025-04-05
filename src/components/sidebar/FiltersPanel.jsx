import React from "react";
import { useEditingContext } from "../../context/EditingContext";

import { filtersList } from "../../constants/filters";

const FiltersPanel = () => {
    const { selectedFilter, setSelectedFilter, hasImage } = useEditingContext();
    const isDisabled = !hasImage;

    return (
        <div className="p-2">
            <div className="flex flex-wrap gap-2">
                {filtersList.map((filter) => (
                    <button
                        key={filter.name}
                        className={`${filter.className} ${selectedFilter === filter.name ? "ring-2 ring-blue-500" : ""
                            } ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={() => setSelectedFilter(filter.name)}
                    >
                        {filter.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default FiltersPanel;
