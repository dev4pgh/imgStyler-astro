import React from "react";
import ThemeToggleButton from "./ThemeToggleButton";

const Header = () => {
    return (
        <header className="bg-gray-800 dark:bg-gray-700 text-white py-2 px-4 shadow-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-2 justify-center sm:justify-between">
                <a
                    href="/"
                    className="inline-flex items-center text-xl sm:text-2xl font-semibold leading-none hover:opacity-90"
                    style={{ transform: "translateY(-2px)" }}   // I am not happy with this hack, but it was the only way I could get the text to look correctly lined up.
                >
                    imgStyler
                </a>
                <nav className="flex items-center space-x-4 mx-4">
                    <a href="/" className="text-lg hover:text-blue-300 transition-colors">
                        Home
                    </a>
                    <a href="/features" className="text-lg hover:text-blue-300 transition-colors">
                        Features
                    </a>
                    <a href="/about" className="text-lg hover:text-blue-300 transition-colors">
                        About
                    </a>
                    <a href="/contact" className="text-lg hover:text-blue-300 transition-colors">
                        Contact
                    </a>
                </nav>
                <ThemeToggleButton client:idle />
            </div>
        </header>
    );
};

export default Header;
