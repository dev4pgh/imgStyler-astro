import React, { useState, useEffect } from 'react';

// Key to remember if the user has dismissed the notes at least once
const LOCAL_STORAGE_KEY = 'imgstyler-notes-dismissed-once';

function UsageNotes() {
    // State tracks if the notes are currently expanded or collapsed
    // Default to expanded, unless user has previously dismissed it
    const [isExpanded, setIsExpanded] = useState(true);

    // Check localStorage only once on initial client mount
    useEffect(() => {
        if (localStorage.getItem(LOCAL_STORAGE_KEY) === 'true') {
            // If previously dismissed, start in collapsed state
            setIsExpanded(false);
        }
        // Intentionally empty dependency array [] to run only once on mount
    }, []);

    const handleClose = () => {
        setIsExpanded(false);
        // Remember that the user dismissed it at least once
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
        } catch (error) {
            console.error('Could not save preference to localStorage', error);
        }
    };

    const handleOpen = () => {
        setIsExpanded(true);
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, 'false');
        } catch (error) {
            console.error('Could not save preference to localStorage', error);
        }
    };

    // --- Render Collapsed State ---
    if (!isExpanded) {
        return (
            // Container to maintain spacing and alignment
            <div className="max-w-6xl mx-auto mb-2 flex justify-end" title="Show usage notes">
                <button
                    type="button"
                    onClick={handleOpen}
                    className="p-0 text-sm text-sky-700 bg-sky-100 border border-sky-300 rounded-full shadow-sm hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 dark:bg-gray-700/80 dark:text-sky-300 dark:border-sky-500/50 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-900"
                    aria-label="Show usage notes"
                >
                    {/* Info Icon SVG */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </button>
            </div>
        );
    }

    // --- Render Expanded State ---
    return (
        <div
            className="relative max-w-6xl mx-auto mb-4 p-3 pl-4 pr-8 text-sm text-sky-800 bg-sky-100 border border-sky-300 rounded-lg dark:bg-gray-800/60 dark:text-sky-300 dark:border-sky-500/50"
            role="alert"
        >
            {/* Close Button */}
            <button
                type="button"
                onClick={handleClose}
                className="absolute top-1.5 right-1.5 text-sky-600 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-400 rounded-md p-1"
                aria-label="Dismiss usage notes"
            >
                {/* 'X' icon SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Content */}
            <span className="font-medium">ℹ️ Usage Notes:</span>
            <ul className="mt-1 list-disc list-inside space-y-0.5">
                <li>
                    <strong className="font-semibold">Screen Size:</strong> Optimized for wider displays (desktop/tablet) for an ideal side-by-side editing view.
                </li>
                <li>
                    <strong className="font-semibold">Compatibility:</strong> Chrome or Firefox recommended for full feature support; some limitations possible in Safari.
                </li>
            </ul>
        </div>
    );
}

export default UsageNotes;