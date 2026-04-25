/**
 * theme.js — Dark/Light Theme Toggle
 * Persists preference in localStorage, respects system preference on first visit.
 * Provides smooth cross-fade transition between themes.
 */

(function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'dark'); // default dark
    document.documentElement.setAttribute('data-theme', theme);
})();

/**
 * Toggle between dark and light themes with smooth transition
 */
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';

    // Add smooth transition class
    document.body.classList.add('theme-transitioning');

    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);

    // Update toggle icon
    const icon = document.getElementById('theme-icon');
    if (icon) icon.textContent = next === 'dark' ? '🌙' : '☀️';

    // Re-render charts with new theme colors if available
    if (typeof updateChartTheme === 'function') updateChartTheme();

    // Remove transition class after animation completes
    setTimeout(() => {
        document.body.classList.remove('theme-transitioning');
    }, 500);
}

/**
 * Get current theme
 * @returns {'dark'|'light'}
 */
function getCurrentTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
}
