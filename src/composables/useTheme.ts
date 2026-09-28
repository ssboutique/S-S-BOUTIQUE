import { ref, computed } from 'vue';

const THEME_KEY = 'vendpro_theme';

type Theme = 'light' | 'dark';

// Global reactive state shared across all components
const currentTheme = ref<Theme>('light');

/**
 * Initializes the theme based on localStorage or system preferences.
 */
export function initTheme() {
  if (typeof window === 'undefined') return;

  const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;

  if (savedTheme === 'dark' || savedTheme === 'light') {
    applyTheme(savedTheme);
  } else {
    // Detect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  // Listen for system changes if no manual preference saved
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

function applyTheme(theme: Theme) {
  currentTheme.value = theme;
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

export function useTheme() {
  const isDark = computed(() => currentTheme.value === 'dark');

  function toggleTheme() {
    const nextTheme: Theme = currentTheme.value === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  }

  function setTheme(theme: Theme) {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  return {
    currentTheme,
    isDark,
    toggleTheme,
    setTheme,
  };
}
