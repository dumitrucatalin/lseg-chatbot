import { useEffect, useState } from "react";
import {
    FaMoon, FaSun
} from "react-icons/fa"; // Import icons from react-icons

const DarkModeToggle = () => {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

    useEffect(() => {
        // Load theme from local storage or default to light mode
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            document.documentElement.classList.add("dark-mode");
            setIsDarkMode(true);
        }
    }, []);

    const toggleTheme = (): void => {
        if (isDarkMode) {
            document.documentElement.classList.remove("dark-mode");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.classList.add("dark-mode");
            localStorage.setItem("theme", "dark");
        }
        setIsDarkMode(!isDarkMode);
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded transition flex items-center space-x-2"
        >
            {isDarkMode ? (
                <><FaMoon />
                    {/* Sun Icon for Light Mode */}
                    {/* <span>Light Mode</span> */}
                </>
            ) : (
                <>
                    <FaSun /> {/* Moon Icon for Dark Mode */}
                    {/* <span>Dark Mode</span> */}
                </>
            )}
        </button>
    );
};

export default DarkModeToggle;