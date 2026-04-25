/**
 * particles.js — Lightweight interactive canvas particle system
 * Creates an animated particle field with constellation-style connections
 * and mouse interactivity for premium hero backgrounds.
 */

class ParticleField {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        // Configuration
        this.particleCount = options.count || 80;
        this.colors = options.colors || ['#4fffb0', '#7b61ff', '#61b3ff', '#ff6baa'];
        this.maxDistance = options.maxDistance || 120;
        this.speed = options.speed || 0.4;
        this.mouseRadius = options.mouseRadius || 150;
        this.glowIntensity = options.glowIntensity || 0.6;

        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.animationId = null;

        this._init();
    }

    _init() {
        this._resize();
        this._createParticles();
        this._bindEvents();
        this._animate();
    }

    _resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent ? parent.clientWidth : window.innerWidth;
        this.canvas.height = parent ? parent.clientHeight : window.innerHeight;
    }

    _createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.speed,
                vy: (Math.random() - 0.5) * this.speed,
                radius: Math.random() * 2.5 + 0.8,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                alpha: Math.random() * 0.5 + 0.3,
                pulseSpeed: Math.random() * 0.02 + 0.005,
                pulseOffset: Math.random() * Math.PI * 2
            });
        }
    }

    _bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = -1000;
            this.mouse.y = -1000;
        });

        window.addEventListener('resize', () => {
            this._resize();
            this._createParticles();
        });
    }

    _animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const time = Date.now() * 0.001;

        // Update & draw particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Move
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around edges
            if (p.x < -10) p.x = this.canvas.width + 10;
            if (p.x > this.canvas.width + 10) p.x = -10;
            if (p.y < -10) p.y = this.canvas.height + 10;
            if (p.y > this.canvas.height + 10) p.y = -10;

            // Mouse repulsion
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < this.mouseRadius) {
                const force = (this.mouseRadius - dist) / this.mouseRadius;
                p.x += (dx / dist) * force * 2;
                p.y += (dy / dist) * force * 2;
            }

            // Pulse alpha
            const pulse = Math.sin(time * p.pulseSpeed * 60 + p.pulseOffset) * 0.2 + 0.8;
            const alpha = p.alpha * pulse;

            // Draw glow
            this.ctx.save();
            this.ctx.globalAlpha = alpha * this.glowIntensity;
            this.ctx.shadowBlur = 12;
            this.ctx.shadowColor = p.color;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const cdx = p.x - p2.x;
                const cdy = p.y - p2.y;
                const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

                if (cdist < this.maxDistance) {
                    const lineAlpha = (1 - cdist / this.maxDistance) * 0.15;
                    this.ctx.save();
                    this.ctx.globalAlpha = lineAlpha;
                    this.ctx.strokeStyle = p.color;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
        }

        this.animationId = requestAnimationFrame(() => this._animate());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Auto-initialize if canvas exists
document.addEventListener('DOMContentLoaded', () => {
    const heroCanvas = document.getElementById('hero-particles');
    if (heroCanvas) {
        new ParticleField('hero-particles', {
            count: 90,
            maxDistance: 130,
            speed: 0.3,
            mouseRadius: 160,
            glowIntensity: 0.7,
            colors: ['#4fffb0', '#7b61ff', '#61b3ff', '#ff6baa', '#ffd166']
        });
    }
});
