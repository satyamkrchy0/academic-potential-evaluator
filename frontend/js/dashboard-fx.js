/**
 * dashboard-fx.js — Elite Dashboard Micro-Interactions & Effects
 * Production-grade interactive feedback layer
 */

(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        initKPICounters();
        initPillRipple();
        initStarGlow();
        initSliderTooltips();
        initFormProgress();
        initCardTilt();
        initPageTransition();
    });

    // ── Animated KPI Counters ────────────────────────────────
    function initKPICounters() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const text = el.textContent.trim();
                    // Only animate numeric values
                    const num = parseFloat(text);
                    if (!isNaN(num) && num > 0) {
                        animateValue(el, 0, num, 1200, text.includes('%') ? '%' : '');
                    }
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.kpi-value').forEach(el => observer.observe(el));
    }

    function animateValue(el, start, end, duration, suffix) {
        const startTime = performance.now();
        const isFloat = String(end).includes('.');

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // ease-out quart
            const current = start + (end - start) * eased;
            el.textContent = (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // ── Pill Button Ripple Effect ─────────────────────────────
    function initPillRipple() {
        document.querySelectorAll('.pill-select .pill').forEach(pill => {
            pill.addEventListener('click', function (e) {
                // Create ripple
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.cssText = `
                    position: absolute; border-radius: 50%; pointer-events: none;
                    width: ${size}px; height: ${size}px;
                    left: ${e.clientX - rect.left - size / 2}px;
                    top: ${e.clientY - rect.top - size / 2}px;
                    background: rgba(79,255,176,0.3);
                    transform: scale(0); animation: rippleOut 0.5s ease forwards;
                `;
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 500);
            });
        });

        // Add keyframes
        if (!document.getElementById('fx-keyframes')) {
            const style = document.createElement('style');
            style.id = 'fx-keyframes';
            style.textContent = `
                @keyframes rippleOut {
                    to { transform: scale(2.5); opacity: 0; }
                }
                @keyframes tooltipIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ── Star Rating Glow ─────────────────────────────────────
    function initStarGlow() {
        document.querySelectorAll('.star-row .star').forEach(star => {
            star.addEventListener('mouseenter', function () {
                const val = parseInt(this.dataset.val);
                const row = this.parentElement;
                row.querySelectorAll('.star').forEach(s => {
                    const sv = parseInt(s.dataset.val);
                    if (sv <= val) {
                        s.style.textShadow = '0 0 12px rgba(255,209,102,0.6)';
                        s.style.transform = 'scale(1.15)';
                    }
                });
            });

            star.addEventListener('mouseleave', function () {
                this.parentElement.querySelectorAll('.star').forEach(s => {
                    s.style.textShadow = '';
                    s.style.transform = '';
                });
            });
        });
    }

    // ── Slider Live Tooltip ──────────────────────────────────
    function initSliderTooltips() {
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            const tooltip = document.createElement('div');
            tooltip.className = 'slider-tooltip';
            tooltip.style.cssText = `
                position: absolute; top: -32px; padding: 3px 8px;
                background: var(--bg-elevated); border: 1px solid var(--border-default);
                border-radius: 6px; font-size: 11px; font-weight: 700;
                color: var(--accent-primary); pointer-events: none;
                opacity: 0; transition: opacity 0.2s; z-index: 10;
                font-family: var(--font-mono);
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;
            slider.parentElement.style.position = 'relative';
            slider.parentElement.appendChild(tooltip);

            function updateTooltip() {
                const pct = (slider.value - slider.min) / (slider.max - slider.min);
                const thumbX = pct * slider.offsetWidth;
                tooltip.textContent = slider.value;
                tooltip.style.left = (thumbX - tooltip.offsetWidth / 2) + 'px';
            }

            slider.addEventListener('input', updateTooltip);
            slider.addEventListener('mouseenter', () => { tooltip.style.opacity = '1'; updateTooltip(); });
            slider.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });
            slider.addEventListener('touchstart', () => { tooltip.style.opacity = '1'; updateTooltip(); });
            slider.addEventListener('touchend', () => { tooltip.style.opacity = '0'; });
        });
    }

    // ── Form Completion Progress Bar ─────────────────────────
    function initFormProgress() {
        const form = document.getElementById('prediction-form');
        if (!form) return;

        // Create progress bar
        const bar = document.createElement('div');
        bar.className = 'form-progress-bar';
        bar.innerHTML = '<div class="form-progress-fill"></div>';
        bar.style.cssText = `
            position: sticky; top: 0; z-index: 10;
            height: 3px; background: var(--border-default);
            border-radius: 2px; margin-bottom: var(--space-4);
            overflow: hidden;
        `;
        bar.querySelector('.form-progress-fill').style.cssText = `
            height: 100%; width: 0%;
            background: var(--gradient-brand);
            border-radius: 2px;
            transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 0 8px rgba(79,255,176,0.3);
        `;

        const firstFieldset = form.querySelector('.form-fieldset');
        if (firstFieldset) form.insertBefore(bar, firstFieldset);

        function updateProgress() {
            const fields = form.querySelectorAll('input[type="hidden"], input[type="number"], select');
            let filled = 0;
            fields.forEach(f => {
                if (f.value && f.value !== '' && f.value !== '0') filled++;
            });
            const pct = Math.min(100, (filled / fields.length) * 100);
            bar.querySelector('.form-progress-fill').style.width = pct + '%';
        }

        form.addEventListener('input', updateProgress);
        form.addEventListener('change', updateProgress);
        // Watch for pill clicks
        form.addEventListener('click', (e) => {
            if (e.target.classList.contains('pill') || e.target.classList.contains('star')) {
                setTimeout(updateProgress, 50);
            }
        });
        updateProgress();
    }

    // ── Card Tilt Effect on KPI Cards ────────────────────────
    function initCardTilt() {
        document.querySelectorAll('.kpi-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `
                    perspective(600px) 
                    rotateX(${-y * 6}deg) 
                    rotateY(${x * 6}deg) 
                    translateY(-4px) 
                    scale(1.02)
                `;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                setTimeout(() => card.style.transition = '', 400);
            });
        });
    }

    // ── Page Entry Transition ─────────────────────────────────
    function initPageTransition() {
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.4s ease';
        requestAnimationFrame(() => {
            document.body.style.opacity = '1';
        });
    }
})();
