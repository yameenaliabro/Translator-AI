// src/app/components/DarkModeToggle.tsx

'use client';

import { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

const DarkModeToggle: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        // Check for saved user preference, else use system preference
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            setIsDarkMode(storedTheme === 'dark');
            toggleClass(storedTheme === 'dark');
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
            toggleClass(prefersDark);
        }
    }, []);

    const toggleClass = (darkMode: boolean) => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);
        toggleClass(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    return (
        <button
            onClick={toggleDarkMode}
            className="fixed top-4 right-4 bg-gray-200 dark:bg-gray-700 p-3 rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Toggle Dark Mode"
        >
            {isDarkMode ? (
                <FaSun className="h-6 w-6 text-yellow-400" />
            ) : (
                <FaMoon className="h-6 w-6 text-gray-800" />
            )}
        </button>
    );
};

export default DarkModeToggle;
