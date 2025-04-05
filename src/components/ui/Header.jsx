import React, { useState, useEffect } from "react";
import ThemeToggleButton from "./ThemeToggleButton";

const Header = () => {
    return (
        <header className="bg-gray-800 dark:bg-gray-700 text-white py-3 px-4 shadow-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto text-center flex flex-col sm:flex-row gap-3 justify-between items-center">
                <a href="/" className="text-2xl font-semibold hover:opacity-90">
                    imgStyler
                </a>
                <nav className="flex items-center space-x-4 md:space-x-6">
                    <a
                        href="/"
                        className="text-lg md:text-base hover:text-blue-300 transition-colors"
                    >
                        Home
                    </a>
                    <a
                        href="/features"
                        className="text-lg md:text-base hover:text-blue-300 transition-colors"
                    >
                        Features
                    </a>
                    <a
                        href="/about"
                        className="text-lg md:text-base hover:text-blue-300 transition-colors"
                    >
                        About
                    </a>
                    <a
                        href="/contact"
                        className="text-lg md:text-base hover:text-blue-300 transition-colors"
                    >
                        Contact
                    </a>
                </nav>
                <ThemeToggleButton client:idle />
            </div>
        </header>
    );
};

export default Header;