/**
 * toast.js — Toast Notification System (Enhanced)
 * Usage: showToast('Title', 'Message', 'success|error|warning|info')
 * Features: max 3 stacking, hover-to-pause auto-dismiss, smooth animations
 */

const MAX_TOASTS = 3;

(function initToastContainer() {
    if (document.getElementById('toast-container')) return;
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
})();

/**
 * Show a toast notification
 * @param {string} title - Toast title
 * @param {string} message - Toast message body
 * @param {'success'|'error'|'warning'|'info'} type - Toast variant
 * @param {number} duration - Auto-dismiss duration in ms (default 4000)
 */
function showToast(title, message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Enforce max stack limit — remove oldest if needed
    const existing = container.querySelectorAll('.toast:not(.removing)');
    if (existing.length >= MAX_TOASTS) {
        dismissToast(existing[existing.length - 1]);
    }

    const icons = {
        success: '✅',
        error:   '❌',
        warning: '⚠️',
        info:    'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.style.setProperty('--toast-duration', `${duration}ms`);
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="dismissToast(this.parentElement)" aria-label="Close">✕</button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    // Auto dismiss timer
    const timer = setTimeout(() => dismissToast(toast), duration);
    toast._timer = timer;
    toast._duration = duration;
    toast._startTime = Date.now();

    // Hover-to-pause: pause auto-dismiss on hover
    toast.addEventListener('mouseenter', () => {
        clearTimeout(toast._timer);
        const progressBar = toast.querySelector('.toast-progress');
        if (progressBar) {
            progressBar.style.animationPlayState = 'paused';
        }
        toast._elapsed = Date.now() - toast._startTime;
    });

    toast.addEventListener('mouseleave', () => {
        const remaining = toast._duration - (toast._elapsed || 0);
        if (remaining > 0) {
            toast._startTime = Date.now() - (toast._elapsed || 0);
            toast._timer = setTimeout(() => dismissToast(toast), remaining);
            const progressBar = toast.querySelector('.toast-progress');
            if (progressBar) {
                progressBar.style.animationPlayState = 'running';
            }
        }
    });
}

/**
 * Dismiss a toast notification with animation
 * @param {HTMLElement} toast - The toast element to remove
 */
function dismissToast(toast) {
    if (!toast || toast._dismissed) return;
    toast._dismissed = true;
    clearTimeout(toast._timer);
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
    // Fallback removal
    setTimeout(() => toast.remove(), 400);
}
