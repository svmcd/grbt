"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "dark" | "light";

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Default to light mode
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    // Update CSS variables based on theme
    const root = document.documentElement;

    if (theme === "light") {
      root.style.setProperty("--background", "#ffffff");
      root.style.setProperty("--foreground", "#000000");
      root.style.setProperty("--muted", "#666666");
      root.style.setProperty("--white", "#000000");
      root.style.setProperty("--black", "#ffffff");
      root.style.setProperty("--white-10", "rgba(0, 0, 0, 0.1)");
      root.style.setProperty("--white-20", "rgba(0, 0, 0, 0.2)");
      root.style.setProperty("--white-70", "rgba(0, 0, 0, 0.7)");
      root.style.setProperty("--white-80", "rgba(0, 0, 0, 0.8)");
      root.style.setProperty("--white-90", "rgba(0, 0, 0, 0.9)");
      root.style.setProperty("--white-05", "rgba(0, 0, 0, 0.05)");
      root.style.setProperty("--white-02", "rgba(0, 0, 0, 0.02)");
    } else {
      root.style.setProperty("--background", "#000000");
      root.style.setProperty("--foreground", "#ffffff");
      root.style.setProperty("--muted", "#888888");
      root.style.setProperty("--white", "#ffffff");
      root.style.setProperty("--black", "#000000");
      root.style.setProperty("--white-10", "rgba(255, 255, 255, 0.1)");
      root.style.setProperty("--white-20", "rgba(255, 255, 255, 0.2)");
      root.style.setProperty("--white-70", "rgba(255, 255, 255, 0.7)");
      root.style.setProperty("--white-80", "rgba(255, 255, 255, 0.8)");
      root.style.setProperty("--white-90", "rgba(255, 255, 255, 0.9)");
      root.style.setProperty("--white-05", "rgba(255, 255, 255, 0.05)");
      root.style.setProperty("--white-02", "rgba(255, 255, 255, 0.02)");
    }

    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
