/**
 * predict.js — Handles the ML prediction form submission, UI updates,
 * KPI animations, loading skeletons, and premium result rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Pill selection logic
    document.querySelectorAll('.pill-select').forEach(group => {
        const pills = group.querySelectorAll('.pill');
        const hiddenInput = group.nextElementSibling;
        
        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                if (hiddenInput) hiddenInput.value = pill.dataset.val;
            });
        });
    });

    // Star rating logic
    document.querySelectorAll('.star-row').forEach(group => {
        const stars = group.querySelectorAll('.star');
        const hiddenInput = document.getElementById(group.dataset.target);
        
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const val = parseInt(star.dataset.val);
                stars.forEach(s => {
                    if (parseInt(s.dataset.val) <= val) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
                if (hiddenInput) hiddenInput.value = val;
            });
        });
    });

    // Form submission
    const form = document.getElementById('prediction-form');
    if (form) {
        form.addEventListener('submit', handlePredictionSubmit);
    }

    // Initialize slider fills
    initSliderFills();

    // Button ripple effect
    initButtonRipples();

    // Load initial data for charts/KPIs
    loadDashboardData();
});

let currentPredictionData = null; // Store for PDF export

/* ═══════════════════════════════════════════════════════════════
   SLIDER FILL ENHANCEMENT
   ═══════════════════════════════════════════════════════════════ */

function initSliderFills() {
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        slider.classList.add('has-fill');
        updateSliderFill(slider);
        slider.addEventListener('input', () => updateSliderFill(slider));
    });
}

function updateSliderFill(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const val = parseFloat(slider.value) || 0;
    const percent = ((val - min) / (max - min)) * 100;
    slider.style.setProperty('--fill-percent', percent + '%');
}

/* ═══════════════════════════════════════════════════════════════
   BUTTON RIPPLE EFFECT
   ═══════════════════════════════════════════════════════════════ */

function initButtonRipples() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('btn-ripple');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
            this.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    });
}

/* ═══════════════════════════════════════════════════════════════
   COUNT-UP ANIMATION
   ═══════════════════════════════════════════════════════════════ */

function animateCountUp(element, target, suffix = '', duration = 800) {
    if (!element) return;
    const start = 0;
    const startTime = performance.now();
    const isFloat = String(target).includes('.');

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (target - start) * eased;
        element.textContent = (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

/* ═══════════════════════════════════════════════════════════════
   PREDICTION SUBMISSION
   ═══════════════════════════════════════════════════════════════ */

async function handlePredictionSubmit(e) {
    e.preventDefault();
    
    const btn = document.getElementById('btn-predict');
    const spinner = document.getElementById('predict-spinner');
    const btnText = btn.querySelector('span');
    
    // Collect data
    const inputData = {
        gender: document.getElementById('gender').value,
        degree: document.getElementById('degree').value,
        branch: document.getElementById('branch').value,
        cgpa: parseFloat(document.getElementById('cgpa').value),
        internships: parseInt(document.getElementById('internships').value),
        projects: parseInt(document.getElementById('projects').value),
        certifications: parseInt(document.getElementById('certifications').value),
        backlogs: parseInt(document.getElementById('backlogs').value),
        coding_skills: parseInt(document.getElementById('coding_skills').value),
        communication_skills: parseInt(document.getElementById('communication_skills').value),
        soft_skills_rating: parseInt(document.getElementById('soft_skills_rating').value),
        aptitude_test_score: parseInt(document.getElementById('aptitude_test_score').value)
    };

    try {
        btn.disabled = true;
        spinner.classList.remove('hidden');
        if (btnText) btnText.textContent = 'Analyzing...';
        
        // Show loading state in results panel
        const resultsPanel = document.getElementById('results-content');
        const placeholder = document.querySelector('.results-placeholder');
        if (placeholder) placeholder.classList.add('hidden');
        if (resultsPanel) {
            resultsPanel.classList.remove('hidden');
            resultsPanel.style.opacity = '0.4';
            resultsPanel.style.filter = 'blur(2px)';
        }

        // Call backend API
        const response = await api.post('/predict', inputData);
        
        if (response.success && response.data) {
            currentPredictionData = {
                result: response.data.result,
                input: inputData,
                explanation: response.data.ai_explanation
            };
            
            updateResultsUI(response.data);
            showToast('Prediction Complete', 'Your profile has been analyzed successfully', 'success');
            
            // 🎉 Confetti celebration for Placed results
            if (response.data.result.prediction === 'Placed') {
                launchConfetti();
            }
            
            // Refresh dashboard data
            loadDashboardData();
        } else {
            throw new Error('Invalid response from server');
        }

    } catch (error) {
        console.error('Prediction Error:', error);
        showToast('Analysis Failed', error.message || 'An error occurred during prediction', 'error');
        
        const resultsPanel = document.getElementById('results-content');
        if (resultsPanel) resultsPanel.classList.add('hidden');
        const placeholder = document.querySelector('.results-placeholder');
        if (placeholder) placeholder.classList.remove('hidden');

    } finally {
        btn.disabled = false;
        spinner.classList.add('hidden');
        if (btnText) btnText.textContent = 'Analyze Profile';
        const resultsPanel = document.getElementById('results-content');
        if (resultsPanel) {
            resultsPanel.style.opacity = '1';
            resultsPanel.style.filter = 'none';
        }
    }
}

/* ═══════════════════════════════════════════════════════════════
   RESULTS UI — Premium Hero Panel
   ═══════════════════════════════════════════════════════════════ */

function updateResultsUI(data) {
    const { result, ai_explanation } = data;
    const isPlaced = result.prediction === 'Placed';
    const score = parseFloat(result.placement_score || (result.placement_probability * 100).toFixed(1));
    const prob = (result.placement_probability * 100).toFixed(1);

    const resultsContent = document.getElementById('results-content');

    // Add entrance animation class
    resultsContent.classList.remove('results-content-enter');
    void resultsContent.offsetWidth; // force reflow
    resultsContent.classList.add('results-content-enter');

    // 1. Circular Progress Ring
    renderCircularProgress(score);

    // 2. Verdict Banner
    const banner = document.getElementById('verdict-banner');
    const verdictIcon = document.getElementById('res-verdict-icon');
    const verdictText = document.getElementById('res-verdict');
    
    banner.className = `verdict-banner ${isPlaced ? 'verdict-banner--placed' : 'verdict-banner--not-placed'}`;
    verdictIcon.textContent = isPlaced ? '✅' : '❌';
    verdictText.textContent = isPlaced ? 'Placed' : 'Not Placed';

    // 3. Confidence Meter
    const rawConfidence = result.confidence || 'Moderate (60.0%)';
    const confEl = document.getElementById('res-confidence');
    const confFill = document.getElementById('confidence-fill');
    confEl.textContent = rawConfidence;

    // Parse 'High (95.0%)' -> 'High' and 95.0
    let baseConfidence = 'Moderate';
    let confPercent = 60;
    const match = rawConfidence.match(/([a-zA-Z]+)(?:\s*\(([\d.]+)%\))?/);
    if (match) {
        baseConfidence = match[1];
        if (match[2]) confPercent = parseFloat(match[2]);
    }

    const confClass = baseConfidence.toLowerCase();
    confFill.className = `confidence-meter-fill ${confClass}`;
    confFill.style.setProperty('--bar-width', confPercent + '%');
    // Trigger animation
    confFill.style.width = '0%';
    requestAnimationFrame(() => {
        confFill.style.width = confPercent + '%';
    });

    // 4. Score Cards
    document.getElementById('res-prob').textContent = `${prob}%`;
    const resBadge = document.getElementById('res-badge');
    resBadge.textContent = result.prediction;
    
    const resConfText = document.getElementById('res-conf-text');
    resConfText.textContent = rawConfidence;

    // 5. Risk Factors
    const riskContainer = document.getElementById('risk-factors-container');
    const riskList = document.getElementById('risk-list');
    if (result.risk_factors && result.risk_factors.length > 0) {
        riskList.innerHTML = result.risk_factors.map(r => `<li>${r}</li>`).join('');
        riskContainer.classList.remove('hidden');
    } else {
        riskContainer.classList.add('hidden');
    }

    // 6. AI Advice with typewriter effect
    const aiContainer = document.getElementById('ai-advice-container');
    const aiText = document.getElementById('ai-advice');
    if (ai_explanation) {
        aiContainer.classList.remove('hidden');
        typewriterReveal(aiText, ai_explanation);
    } else {
        aiContainer.classList.add('hidden');
    }
    
    // Scroll to results on mobile
    if (window.innerWidth < 768) {
        document.getElementById('results-panel').scrollIntoView({ behavior: 'smooth' });
    }
}

/* ═══════════════════════════════════════════════════════════════
   SVG CIRCULAR PROGRESS
   ═══════════════════════════════════════════════════════════════ */

function renderCircularProgress(score) {
    const ring = document.getElementById('progress-ring');
    const scoreEl = document.getElementById('res-score');
    if (!ring || !scoreEl) return;

    const radius = 42;
    const circumference = 2 * Math.PI * radius; // ≈ 264
    const percentage = Math.min(Math.max(score / 100, 0), 1);
    const offset = circumference - (percentage * circumference);

    // Reset for animation
    ring.style.transition = 'none';
    ring.setAttribute('stroke-dasharray', circumference);
    ring.setAttribute('stroke-dashoffset', circumference);

    // Animate after a frame
    requestAnimationFrame(() => {
        ring.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0, 0, 0.2, 1)';
        ring.setAttribute('stroke-dashoffset', offset);
    });

    // Animate score number
    animateCountUp(scoreEl, score, '', 1000);
}

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER REVEAL / HTML INJECTION
   ═══════════════════════════════════════════════════════════════ */

function typewriterReveal(element, text) {
    if (!element) return;
    
    // Check if the text contains HTML tags
    if (/<[a-z][\s\S]*>/i.test(text)) {
        // It's HTML, just inject it with a fade-in effect
        element.style.opacity = '0';
        element.innerHTML = text;
        element.style.transition = 'opacity 0.5s ease-in';
        setTimeout(() => { element.style.opacity = '1'; }, 50);
        return;
    }

    // Otherwise, do the normal text typewriter
    element.textContent = '';
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    element.appendChild(cursor);

    let i = 0;
    const speed = 12; // ms per character

    function type() {
        if (i < text.length) {
            element.insertBefore(document.createTextNode(text.charAt(i)), cursor);
            i++;
            setTimeout(type, speed);
        } else {
            // Remove cursor after typing completes
            setTimeout(() => cursor.remove(), 1500);
        }
    }
    type();
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD DATA LOADING WITH ANIMATIONS
   ═══════════════════════════════════════════════════════════════ */

async function loadDashboardData() {
    try {
        const history = await api.get('/history');
        if (!history) return;
        
        // Animate KPI Cards with count-up
        animateCountUp(document.getElementById('kpi-total-evals'), history.length, '', 600);
        
        if (history.length > 0) {
            const placed = history.filter(h => h.result?.prediction === 'Placed').length;
            const placeRate = parseFloat((placed / history.length * 100).toFixed(0));
            
            const totalScore = history.reduce((sum, h) => {
                const s = h.result?.placement_score || (h.result?.placement_probability * 100) || 0;
                return sum + parseFloat(s);
            }, 0);
            const avgScore = parseFloat((totalScore / history.length).toFixed(1));
            
            animateCountUp(document.getElementById('kpi-avg-score'), avgScore, '%', 800);
            animateCountUp(document.getElementById('kpi-placement-rate'), placeRate, '%', 800);
            
            // Last eval time (friendly format)
            const lastDate = new Date(history[history.length - 1].createdAt);
            const now = new Date();
            const diffHours = Math.round((now - lastDate) / (1000 * 60 * 60));
            document.getElementById('kpi-last-eval').textContent = diffHours === 0 ? 'Just now' : `${diffHours}h ago`;
            
            // Initialize charts
            if (typeof initDashboardCharts === 'function') {
                initDashboardCharts(history);
            }
        }
    } catch (err) {
        console.error('Failed to load dashboard KPIs:', err);
    }
}

function downloadReport() {
    if (currentPredictionData) {
        exportPDF(
            currentPredictionData.result, 
            currentPredictionData.input, 
            currentPredictionData.explanation
        );
    } else {
        showToast('Error', 'No prediction data available to download', 'warning');
    }
}

/* ═══════════════════════════════════════════════════════════════
   CONFETTI CELEBRATION EFFECT
   ═══════════════════════════════════════════════════════════════ */

function launchConfetti() {
    const colors = ['#4fffb0', '#7b61ff', '#61b3ff', '#ff6baa', '#ffd166', '#ffffff'];
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);

    for (let i = 0; i < 60; i++) {
        const particle = document.createElement('div');
        const color = colors[Math.floor(Math.random() * colors.length)];
        const size = Math.random() * 8 + 4;
        const startX = 50 + (Math.random() - 0.5) * 30;
        const drift = (Math.random() - 0.5) * 200;
        const delay = Math.random() * 300;
        const duration = 1200 + Math.random() * 1000;
        const shape = Math.random() > 0.5 ? '50%' : '2px';

        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: ${shape};
            left: ${startX}%;
            top: 40%;
            opacity: 1;
            pointer-events: none;
            animation: confettiFall ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms forwards;
            --drift: ${drift}px;
            --spin: ${Math.random() * 720 - 360}deg;
        `;
        container.appendChild(particle);
    }

    // Add confetti keyframes if not already added
    if (!document.getElementById('confetti-keyframes')) {
        const style = document.createElement('style');
        style.id = 'confetti-keyframes';
        style.textContent = `
            @keyframes confettiFall {
                0% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); opacity: 1; }
                100% { transform: translateY(100vh) translateX(var(--drift)) rotate(var(--spin)) scale(0.3); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => container.remove(), 3000);
}
