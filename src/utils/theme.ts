// Check if the user prefers dark mode
export const getInitialTheme = (): 'dark' | 'light' => {
  // Check if theme is stored in localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const storedTheme = window.localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
  }

  // Check system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }

  return 'light';
};

// Toggle theme and update localStorage and DOM
export const toggleTheme = (currentTheme: 'dark' | 'light'): 'dark' | 'light' => {
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Update localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('theme', newTheme);
  }

  // Update DOM
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return newTheme;
};
