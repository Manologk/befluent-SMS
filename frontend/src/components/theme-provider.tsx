import React, { createContext, useContext, useEffect, useState } from "react";
import { TooltipProvider } from "./ui/tooltip";
import { lightTheme, darkTheme, blueTheme, greenTheme, purpleTheme } from "@/styles/themes";

type Theme = 'light' | 'dark' | 'system' | 'blue' | 'green' | 'purple';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme: Theme;
  storageKey: string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children, defaultTheme, storageKey }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem(storageKey) as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(defaultTheme);
    }
  }, [defaultTheme, storageKey]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
      localStorage.setItem(storageKey, newTheme);
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={theme}>
        <TooltipProvider>{children}</TooltipProvider>
        <style>{`
          :root {
            ${lightTheme}
          }
          .dark {
            ${darkTheme}
          }
          .blue {
            ${blueTheme}
          }
          .green {
            ${greenTheme}
          }
          .purple {
            ${purpleTheme}
          }
        `}</style>
      </div>
    </ThemeContext.Provider>
  );
}
