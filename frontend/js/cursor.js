document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursorContainer = document.createElement('div');
    cursorContainer.id = 'interactive-cursor';
    cursorContainer.innerHTML = `
        <div class="cursor-ambient" id="cursor-ambient"></div>
        <div class="cursor-ring" id="cursor-ring"></div>
        <div class="cursor-dot" id="cursor-dot"></div>
    `;
    document.body.appendChild(cursorContainer);

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const ambient = document.getElementById('cursor-ambient');

    let mouseX = -100;
    let mouseY = -100;
    
    let dotX = -100, dotY = -100;
    let ringX = -100, ringY = -100;
    let ambientX = -100, ambientY = -100;

    let isVisible = false;

    // Linear interpolation for smooth spring-like following
    const lerp = (start, end, factor) => start + (end - start) * factor;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!isVisible) {
            cursorContainer.classList.add('visible');
            isVisible = true;
            // Snap to initial position immediately
            dotX = mouseX; dotY = mouseY;
            ringX = mouseX; ringY = mouseY;
            ambientX = mouseX; ambientY = mouseY;
        }
    });

    // Detect hovering over interactive elements
    window.addEventListener('mouseover', (e) => {
        const target = e.target;
        if (
            target.tagName.toLowerCase() === 'button' ||
            target.tagName.toLowerCase() === 'a' ||
            target.closest('button') ||
            target.closest('a') ||
            target.closest('.interactive-element') ||
            target.closest('.kpi-card') ||
            target.closest('.pill') ||
            target.closest('.star') ||
            window.getComputedStyle(target).cursor === 'pointer'
        ) {
            cursorContainer.classList.add('hovering');
        } else {
            cursorContainer.classList.remove('hovering');
        }
    });

    const render = () => {
        // Dot follows fast
        dotX = lerp(dotX, mouseX, 0.4);
        dotY = lerp(dotY, mouseY, 0.4);
        
        // Ring follows slower (magnetic feel)
        ringX = lerp(ringX, mouseX, 0.15);
        ringY = lerp(ringY, mouseY, 0.15);

        // Ambient follows very slowly (cinematic background)
        ambientX = lerp(ambientX, mouseX, 0.05);
        ambientY = lerp(ambientY, mouseY, 0.05);

        dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        ambient.style.transform = `translate3d(${ambientX}px, ${ambientY}px, 0) translate(-50%, -50%)`;

        requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursorContainer.classList.remove('visible');
        isVisible = false;
    });
});
