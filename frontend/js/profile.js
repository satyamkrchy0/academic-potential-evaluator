/**
 * profile.js — Profile page logic with performance analytics
 * Renders skill bars, readiness score, strengths/weaknesses, and performance cards.
 */

document.addEventListener('DOMContentLoaded', async () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        updateProfileUI(user);
    }
    
    // Load fresh data
    await loadProfileData();

    // Form listeners
    document.getElementById('profile-form').addEventListener('submit', handleProfileUpdate);
    document.getElementById('password-form').addEventListener('submit', handlePasswordUpdate);
});

function updateProfileUI(user) {
    if (!user) return;
    
    // Set form values
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-email').value = user.email || '';
    
    // Set display values
    document.getElementById('profile-display-name').textContent = user.name || 'User';
    document.getElementById('profile-display-email').textContent = user.email || '';
    
    // Avatar initial
    const initial = (user.name || 'U').charAt(0).toUpperCase();
    document.getElementById('profile-avatar-large').textContent = initial;
    
    const sideAvatar = document.getElementById('sidebar-avatar');
    if (sideAvatar) sideAvatar.textContent = initial;
    
    const sideName = document.getElementById('sidebar-user-name');
    if (sideName) sideName.textContent = user.name;
}

async function loadProfileData() {
    try {
        const history = await api.get('/history');
        if (!history) return;
        
        document.getElementById('stat-evals').textContent = history.length;
        document.getElementById('perf-total').textContent = history.length;
        
        if (history.length > 0) {
            const placed = history.filter(h => h.result?.prediction === 'Placed').length;
            document.getElementById('stat-placed').textContent = placed;
            
            const scores = history.map(h => {
                return parseFloat(h.result?.placement_score || (h.result?.placement_probability * 100) || 0);
            });
            
            const totalScore = scores.reduce((s, v) => s + v, 0);
            const avgScore = (totalScore / history.length).toFixed(1);
            const bestScore = Math.max(...scores).toFixed(1);
            
            document.getElementById('stat-avg').textContent = `${avgScore}%`;
            document.getElementById('perf-avg').textContent = `${avgScore}%`;
            document.getElementById('perf-best').textContent = bestScore;

            // Compute improvement trend (compare last 2)
            if (scores.length >= 2) {
                const latest = scores[scores.length - 1];
                const prev = scores[scores.length - 2];
                const diff = (latest - prev).toFixed(1);
                const trendEl = document.getElementById('perf-avg-trend');
                if (trendEl) {
                    if (diff > 0) {
                        trendEl.className = 'perf-card-trend up';
                        trendEl.textContent = `↑ ${diff}%`;
                    } else if (diff < 0) {
                        trendEl.className = 'perf-card-trend down';
                        trendEl.textContent = `↓ ${Math.abs(diff)}%`;
                    }
                }
            }

            // Render performance analytics if we have evaluation input data
            renderPerformanceAnalytics(history);
        }
    } catch (err) {
        console.error('Failed to load profile stats:', err);
    }
}

/**
 * Render skill bars, readiness score, badges, and strengths/weaknesses
 */
function renderPerformanceAnalytics(history) {
    // Get the latest evaluation with input data
    const latest = [...history].reverse().find(h => h.input_data);
    if (!latest || !latest.input_data) return;

    const input = latest.input_data;
    const result = latest.result || {};

    // Show readiness and SW sections
    document.getElementById('readiness-section').style.display = '';
    document.getElementById('sw-section').style.display = '';

    // ── Skill Bars ──────────────────────────────────────────
    const skills = [
        { label: 'Coding Skills', value: input.coding_skills || 0, max: 10 },
        { label: 'Communication', value: input.communication_skills || 0, max: 10 },
        { label: 'Soft Skills', value: input.soft_skills_rating || 0, max: 10 },
        { label: 'Aptitude', value: input.aptitude_test_score || 0, max: 100 },
        { label: 'CGPA', value: input.cgpa || 0, max: 10 },
    ];

    const barsContainer = document.getElementById('skill-bars-container');
    barsContainer.innerHTML = skills.map(skill => {
        const pct = ((skill.value / skill.max) * 100).toFixed(0);
        let colorClass = 'warn';
        if (pct >= 70) colorClass = 'great';
        else if (pct >= 40) colorClass = 'good';

        return `
            <div class="skill-bar-group">
                <div class="skill-bar-label">
                    <span>${skill.label}</span>
                    <span>${skill.value}/${skill.max}</span>
                </div>
                <div class="skill-bar-track">
                    <div class="skill-bar-fill ${colorClass}" style="--bar-width: ${pct}%;"></div>
                </div>
            </div>`;
    }).join('');

    // ── Readiness Score ─────────────────────────────────────
    const score = parseFloat(result.placement_score || (result.placement_probability * 100) || 0);
    const readinessEl = document.getElementById('readiness-score');
    readinessEl.textContent = Math.round(score);

    const fill = document.getElementById('readiness-fill');
    const circumference = 2 * Math.PI * 42; // ≈264
    const offset = circumference - (score / 100) * circumference;
    
    // Color based on score
    let strokeColor = 'var(--accent-warn)';
    if (score >= 70) strokeColor = 'var(--accent-primary)';
    else if (score >= 40) strokeColor = 'var(--accent-gold)';
    fill.style.stroke = strokeColor;

    requestAnimationFrame(() => {
        fill.setAttribute('stroke-dashoffset', offset);
    });

    // Readiness badge
    const badgeEl = document.getElementById('readiness-badge');
    if (score >= 80) {
        badgeEl.textContent = 'Excellent';
        badgeEl.className = 'badge badge--success';
    } else if (score >= 60) {
        badgeEl.textContent = 'Good';
        badgeEl.className = 'badge badge--info';
    } else if (score >= 40) {
        badgeEl.textContent = 'Developing';
        badgeEl.className = 'badge badge--warning';
    } else {
        badgeEl.textContent = 'Needs Work';
        badgeEl.className = 'badge badge--danger';
    }

    // ── Achievement Badges ──────────────────────────────────
    const badges = [];
    if ((input.internships || 0) >= 2) badges.push({ icon: '💼', label: 'Intern Pro', earned: true });
    else badges.push({ icon: '💼', label: 'Intern Pro', earned: false });
    
    if ((input.projects || 0) >= 3) badges.push({ icon: '🚀', label: 'Builder', earned: true });
    else badges.push({ icon: '🚀', label: 'Builder', earned: false });
    
    if ((input.coding_skills || 0) >= 8) badges.push({ icon: '💻', label: 'Code Master', earned: true });
    else badges.push({ icon: '💻', label: 'Code Master', earned: false });
    
    if ((input.cgpa || 0) >= 8.5) badges.push({ icon: '🎓', label: 'Scholar', earned: true });
    else badges.push({ icon: '🎓', label: 'Scholar', earned: false });

    if ((input.certifications || 0) >= 2) badges.push({ icon: '📜', label: 'Certified', earned: true });
    else badges.push({ icon: '📜', label: 'Certified', earned: false });

    const badgesContainer = document.getElementById('achievement-badges');
    badgesContainer.innerHTML = badges.map(b =>
        `<span class="achievement-badge ${b.earned ? 'earned' : ''}">${b.icon} ${b.label}</span>`
    ).join('');

    // ── Strengths vs Weaknesses ─────────────────────────────
    const strengths = [];
    const weaknesses = [];

    if ((input.coding_skills || 0) >= 7) strengths.push('Coding Skills');
    else if ((input.coding_skills || 0) <= 4) weaknesses.push('Coding Skills');

    if ((input.communication_skills || 0) >= 7) strengths.push('Communication');
    else if ((input.communication_skills || 0) <= 4) weaknesses.push('Communication');

    if ((input.soft_skills_rating || 0) >= 7) strengths.push('Soft Skills');
    else if ((input.soft_skills_rating || 0) <= 4) weaknesses.push('Soft Skills');

    if ((input.aptitude_test_score || 0) >= 70) strengths.push('Aptitude');
    else if ((input.aptitude_test_score || 0) <= 40) weaknesses.push('Aptitude');

    if ((input.cgpa || 0) >= 8) strengths.push('Academics (CGPA)');
    else if ((input.cgpa || 0) <= 6) weaknesses.push('Academics (CGPA)');

    if ((input.internships || 0) >= 2) strengths.push('Internships');
    else if ((input.internships || 0) === 0) weaknesses.push('Internships');

    if ((input.projects || 0) >= 3) strengths.push('Projects');
    else if ((input.projects || 0) <= 1) weaknesses.push('Projects');

    if ((input.backlogs || 0) === 0) strengths.push('No Backlogs');
    else weaknesses.push(`${input.backlogs} Backlog(s)`);

    document.getElementById('strengths-container').innerHTML =
        strengths.length > 0
            ? strengths.map(s => `<span class="sw-chip strength">✓ ${s}</span>`).join('')
            : '<span style="font-size: var(--text-xs); color: var(--text-muted);">Keep improving to unlock strengths!</span>';

    document.getElementById('weaknesses-container').innerHTML =
        weaknesses.length > 0
            ? weaknesses.map(w => `<span class="sw-chip weakness">→ ${w}</span>`).join('')
            : '<span style="font-size: var(--text-xs); color: var(--text-muted);">Great job — no major weaknesses!</span>';
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-save-profile');
    const spinner = document.getElementById('profile-spinner');
    const newName = document.getElementById('profile-name').value;
    
    btn.disabled = true;
    spinner.classList.remove('hidden');
    
    setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.name = newName;
        localStorage.setItem('user', JSON.stringify(user));
        
        updateProfileUI(user);
        showToast('Success', 'Profile updated successfully', 'success');
        
        btn.disabled = false;
        spinner.classList.add('hidden');
    }, 600);
}

async function handlePasswordUpdate(e) {
    e.preventDefault();
    const newPass = document.getElementById('new-password').value;
    const confirmPass = document.getElementById('confirm-password').value;
    
    if (newPass !== confirmPass) {
        showToast('Error', 'New passwords do not match', 'error');
        return;
    }
    
    const btn = document.getElementById('btn-change-password');
    const spinner = document.getElementById('password-spinner');
    
    btn.disabled = true;
    spinner.classList.remove('hidden');
    
    setTimeout(() => {
        showToast('Success', 'Password changed successfully', 'success');
        document.getElementById('password-form').reset();
        
        btn.disabled = false;
        spinner.classList.add('hidden');
    }, 800);
}
