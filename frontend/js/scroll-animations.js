/**
 * scroll-animations.js — Production-grade scroll reveal system
 * Uses IntersectionObserver for performant scroll-triggered animations
 * with stagger effects, counters, and parallax-lite features.
 */

(function () {
    'use strict';

    // ─── Scroll Reveal ───────────────────────────────────────────
    const revealElements = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Stagger children if element has data-stagger
                    if (entry.target.hasAttribute('data-stagger')) {
                        const children = entry.target.querySelectorAll('.stagger-child');
                        children.forEach((child, i) => {
                            child.style.transitionDelay = `${i * 80}ms`;
                            child.classList.add('revealed');
                        });
                    }

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        document.querySelectorAll('.scroll-reveal').forEach(el => {
            observer.observe(el);
        });
    };

    // ─── Counter Animation ───────────────────────────────────────
    const animateCounters = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.getAttribute('data-count'));
                    const suffix = el.getAttribute('data-suffix') || '';
                    const prefix = el.getAttribute('data-prefix') || '';
                    const duration = parseInt(el.getAttribute('data-duration')) || 2000;
                    const isFloat = String(target).includes('.');

                    let startTime = null;

                    function step(timestamp) {
                        if (!startTime) startTime = timestamp;
                        const progress = Math.min((timestamp - startTime) / duration, 1);
                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = target * eased;
                        el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
                        if (progress < 1) requestAnimationFrame(step);
                    }

                    requestAnimationFrame(step);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('[data-count]').forEach(el => {
            observer.observe(el);
        });
    };

    // ─── Parallax-Lite ───────────────────────────────────────────
    const initParallax = () => {
        const elements = document.querySelectorAll('[data-parallax]');
        if (elements.length === 0) return;

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            elements.forEach(el => {
                const speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
                const offset = scrollY * speed;
                el.style.transform = `translateY(${offset}px)`;
            });
        }, { passive: true });
    };

    // ─── Navbar Scroll Effect ────────────────────────────────────
    const initNavScroll = () => {
        const nav = document.querySelector('.landing-nav');
        if (!nav) return;

        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            
            if (currentScroll > 80) {
                nav.classList.add('nav-scrolled');
            } else {
                nav.classList.remove('nav-scrolled');
            }

            if (currentScroll > 600 && currentScroll > lastScroll) {
                nav.classList.add('nav-hidden');
            } else {
                nav.classList.remove('nav-hidden');
            }

            lastScroll = currentScroll;
        }, { passive: true });
    };

    // ─── Magnetic Button Effect ──────────────────────────────────
    const initMagneticButtons = () => {
        document.querySelectorAll('.btn-magnetic').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0, 0)';
            });
        });
    };

    // ─── Text Split Animation ────────────────────────────────────
    const initTextSplit = () => {
        document.querySelectorAll('.text-split-reveal').forEach(el => {
            const text = el.textContent;
            el.textContent = '';
            el.style.visibility = 'visible';
            
            text.split('').forEach((char, i) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.animationDelay = `${i * 30}ms`;
                span.className = 'split-char';
                el.appendChild(span);
            });
        });
    };

    // ─── Smooth Anchor Scrolling ─────────────────────────────────
    const initSmoothAnchors = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    };

    // ─── Mobile Hamburger Menu ───────────────────────────────────
    const initMobileMenu = () => {
        const toggle = document.getElementById('mobile-menu-toggle');
        const menu = document.querySelector('.nav-links');
        if (!toggle || !menu) return;

        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            menu.classList.toggle('mobile-open');
        });

        // Close on link click
        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                menu.classList.remove('mobile-open');
            });
        });
    };

    // ─── Initialize All ──────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', () => {
        revealElements();
        animateCounters();
        initParallax();
        initNavScroll();
        initMagneticButtons();
        initSmoothAnchors();
        initMobileMenu();
    });
})();
