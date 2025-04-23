import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

// Default theme values and callback for theme toggling
let currentTheme: Theme = 'dark';
let themeChangeCallbacks: Array<(theme: Theme) => void> = [];

// Initialize theme from localStorage or system preference
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme') as Theme | null;
  
  if (savedTheme) {
    currentTheme = savedTheme;
  } else {
    currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  
  // Apply initial theme
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(currentTheme);
}

// Function to toggle theme
function toggleTheme() {
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  currentTheme = newTheme;
  
  // Apply theme to document
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  }
  
  // Notify all subscribers
  themeChangeCallbacks.forEach(callback => callback(newTheme));
}

// Theme Provider component (simplified pass-through now)
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return children;
}

// Hook to access and modify theme
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(currentTheme);
  
  useEffect(() => {
    // Register callback to update state when theme changes
    const callback = (newTheme: Theme) => setTheme(newTheme);
    themeChangeCallbacks.push(callback);
    
    // Apply current theme on mount
    setTheme(currentTheme);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Only update if no explicit user preference is saved
      if (!localStorage.getItem('theme')) {
        const newTheme = mediaQuery.matches ? 'dark' : 'light';
        currentTheme = newTheme;
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(newTheme);
        setTheme(newTheme);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Cleanup
    return () => {
      themeChangeCallbacks = themeChangeCallbacks.filter(cb => cb !== callback);
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  return { theme, toggleTheme };
}
