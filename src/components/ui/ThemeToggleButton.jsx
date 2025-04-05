import React, { useState, useEffect, useCallback } from "react";

const getInitialClientDarkMode = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    const storedPreference = localStorage.getItem('isDarkMode');
    return storedPreference ? JSON.parse(storedPreference) : true;
}

const ThemeToggleButton = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const storedPreference = localStorage.getItem('isDarkMode');
            return storedPreference ? JSON.parse(storedPreference) : true;
        }
        return true;
    });

    useEffect(() => {
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);


    return (
        <button
            onClick={toggleDarkMode}
            className="bg-gray-600 dark:bg-gray-500 px-3 py-1 rounded text-sm"
            aria-label={isDarkMode ? 'Activate Light Mode' : 'Activate Dark Mode'}
        >
            {isMounted ? (isDarkMode ? 'Light Mode' : 'Dark Mode') : 'Light Mode'}
        </button>
    );
};

export default ThemeToggleButton;