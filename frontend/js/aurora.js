document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("aurora-bg");
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Get container dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(
        75,
        width / height,
        0.1,
        1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0c10, 1);
    
    // Absolute position to stay behind other content
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.zIndex = '0';

    container.appendChild(renderer.domElement);

    // Mouse tracking for subtle camera movement
    const mouse = new THREE.Vector2(0, 0);

    window.addEventListener("mousemove", (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // 🌌 AURORA PLANE
    const geometry = new THREE.PlaneGeometry(20, 10, 100, 50);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
        },
        vertexShader: `
            varying vec2 vUv;
            uniform float uTime;

            void main() {
                vUv = uv;
                vec3 pos = position;

                // Create wave effect
                pos.z += sin(pos.x * 2.0 + uTime) * 0.3;
                pos.z += cos(pos.y * 2.0 + uTime) * 0.3;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float uTime;

            void main() {
                vec3 color = vec3(0.0);

                float wave = sin(vUv.y * 10.0 + uTime * 0.5);

                // Premium SaaS Colors (Teal / Purple / Blue)
                color.r = 0.2 + 0.3 * wave;
                color.g = 0.5 + 0.4 * sin(uTime + vUv.x * 5.0);
                color.b = 0.8;

                gl_FragColor = vec4(color * 0.4, 0.3);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
    });

    const aurora = new THREE.Mesh(geometry, material);
    aurora.position.z = -3;
    scene.add(aurora);

    // ✨ PARTICLES
    const count = 1500;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
        color: 0x88ccff,
        size: 0.02,
        transparent: true,
        opacity: 0.7,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();
        material.uniforms.uTime.value = time;

        // Subtle camera move based on mouse
        camera.position.x += (mouse.x * 1.5 - camera.position.x) * 0.02;
        camera.position.y += (-mouse.y * 1.5 - camera.position.y) * 0.02;

        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    window.addEventListener("resize", () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
});
