"use client";
import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState("light");
    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem("theme");
        if (stored === "dark" || stored === "light") {
            setTheme(stored);
        }
    }, []);
    if (!mounted) {
        return null;
    }
    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    };
    return (<button onClick={toggleTheme} className="btn btn-ghost btn-circle" aria-label="Toggle theme">
      {theme === "dark" ? (<FaSun className="w-5 h-5"/>) : (<FaMoon className="w-5 h-5"/>)}
    </button>);
}
