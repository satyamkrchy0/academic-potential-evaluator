/**
 * charts.js — Dashboard Charts using Chart.js
 * Renders placement trend line chart and score distribution doughnut
 * with gradient fills, enhanced tooltips, and contextual insight badges.
 */

let trendChart = null;
let doughnutChart = null;

/**
 * Get theme-appropriate chart colors
 */
function getChartColors() {
    const isDark = getCurrentTheme() === 'dark';
    return {
        accent: isDark ? '#4fffb0' : '#10b981',
        accentAlt: isDark ? '#7b61ff' : '#6d4aff',
        warn: isDark ? '#ff6b6b' : '#e74c3c',
        gold: isDark ? '#ffd166' : '#f59e0b',
        info: isDark ? '#61b3ff' : '#3b82f6',
        grid: isDark ? 'rgba(42,48,69,0.5)' : 'rgba(200,205,220,0.5)',
        text: isDark ? '#6b7694' : '#7a8098',
        bg: isDark ? '#161a24' : '#ffffff',
        cardBg: isDark ? '#1c2030' : '#f0f1f5'
    };
}

/**
 * Initialize dashboard charts from history data
 * @param {Array} predictions - Array of prediction objects from history API
 */
function initDashboardCharts(predictions) {
    if (!predictions || predictions.length === 0) {
        renderEmptyCharts();
        return;
    }

    const colors = getChartColors();
    const sorted = [...predictions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // ── Trend Line Chart ──────────────────────────────────────
    const trendCtx = document.getElementById('trend-chart');
    if (trendCtx) {
        const labels = sorted.map((_, i) => `#${i + 1}`);
        const scores = sorted.map(p => p.result?.placement_score || p.result?.placement_probability * 100 || 0);

        // Create gradient fill
        const ctx2d = trendCtx.getContext('2d');
        const gradient = ctx2d.createLinearGradient(0, 0, 0, 240);
        gradient.addColorStop(0, hexToRgba(colors.accent, 0.2));
        gradient.addColorStop(0.5, hexToRgba(colors.accent, 0.05));
        gradient.addColorStop(1, hexToRgba(colors.accent, 0));

        if (trendChart) trendChart.destroy();
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Placement Score',
                    data: scores,
                    borderColor: colors.accent,
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.45,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointBackgroundColor: colors.accent,
                    pointBorderColor: colors.bg,
                    pointBorderWidth: 2.5,
                    pointHoverBorderWidth: 3,
                    borderWidth: 2.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: colors.cardBg,
                        titleColor: colors.text,
                        bodyColor: colors.accent,
                        borderColor: colors.grid,
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 10,
                        displayColors: false,
                        titleFont: { weight: '600', size: 11 },
                        bodyFont: { weight: '700', size: 14 },
                        callbacks: {
                            title: (items) => `Evaluation ${items[0].label}`,
                            label: ctx => {
                                const val = ctx.parsed.y.toFixed(1);
                                const idx = ctx.dataIndex;
                                let insight = '';
                                if (idx > 0) {
                                    const prev = scores[idx - 1];
                                    const diff = (val - prev).toFixed(1);
                                    insight = diff >= 0 ? ` (↑ ${diff}%)` : ` (↓ ${Math.abs(diff)}%)`;
                                }
                                return `Score: ${val}%${insight}`;
                            },
                            afterLabel: ctx => {
                                if (ctx.parsed.y === Math.max(...scores)) return '⭐ Best score';
                                if (ctx.parsed.y === Math.min(...scores)) return '📉 Lowest score';
                                return '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: colors.text, font: { size: 11, weight: '500' } }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        grid: { color: colors.grid, lineWidth: 0.5 },
                        ticks: {
                            color: colors.text,
                            font: { size: 11 },
                            callback: v => v + '%',
                            stepSize: 25
                        }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });

        // Render contextual insight badge
        renderTrendInsight(scores);
    }

    // ── Doughnut Chart ────────────────────────────────────────
    const doughnutCtx = document.getElementById('doughnut-chart');
    if (doughnutCtx) {
        const placed = predictions.filter(p => p.result?.prediction === 'Placed').length;
        const notPlaced = predictions.length - placed;

        if (doughnutChart) doughnutChart.destroy();
        doughnutChart = new Chart(doughnutCtx, {
            type: 'doughnut',
            data: {
                labels: ['Placed', 'Not Placed'],
                datasets: [{
                    data: [placed, notPlaced],
                    backgroundColor: [hexToRgba(colors.accent, 0.8), hexToRgba(colors.warn, 0.5)],
                    borderColor: [colors.accent, colors.warn],
                    borderWidth: 1.5,
                    hoverOffset: 8,
                    hoverBorderWidth: 2
                }]
            },
            plugins: [doughnutCenterTextPlugin],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '72%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: colors.text,
                            padding: 18,
                            usePointStyle: true,
                            pointStyleWidth: 10,
                            font: { size: 12, weight: '500' }
                        }
                    },
                    tooltip: {
                        backgroundColor: colors.cardBg,
                        titleColor: colors.text,
                        bodyColor: colors.accent,
                        borderColor: colors.grid,
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 10,
                        callbacks: {
                            label: ctx => {
                                const total = placed + notPlaced;
                                const pct = ((ctx.parsed / total) * 100).toFixed(0);
                                return `${ctx.label}: ${ctx.parsed} (${pct}%)`;
                            }
                        }
                    }
                }
            }
        });

        // Render doughnut insight
        renderDoughnutInsight(placed, notPlaced);
    }
}

/**
 * Doughnut center text plugin — shows total count in center
 */
const doughnutCenterTextPlugin = {
    id: 'centerText',
    afterDraw(chart) {
        const { ctx, chartArea: { top, bottom, left, right } } = chart;
        const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        const colors = getChartColors();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = '800 22px "Space Grotesk", sans-serif';
        ctx.fillStyle = colors.accent;
        ctx.fillText(total, centerX, centerY - 6);

        ctx.font = '500 10px "Inter", sans-serif';
        ctx.fillStyle = colors.text;
        ctx.fillText('Total', centerX, centerY + 12);

        ctx.restore();
    }
};

/**
 * Render contextual insight badge for trend chart
 */
function renderTrendInsight(scores) {
    const container = document.getElementById('trend-insight');
    if (!container || scores.length < 2) return;

    const latest = scores[scores.length - 1];
    const previous = scores[scores.length - 2];
    const diff = (latest - previous).toFixed(1);
    const best = Math.max(...scores).toFixed(1);

    let html = '';
    if (diff > 0) {
        html = `<div class="chart-insight chart-insight--positive">↑ Improved by ${diff}% from last evaluation</div>`;
    } else if (diff < 0) {
        html = `<div class="chart-insight chart-insight--negative">↓ Decreased by ${Math.abs(diff)}% from last evaluation</div>`;
    } else {
        html = `<div class="chart-insight chart-insight--neutral">→ Same score as last evaluation</div>`;
    }

    if (latest >= parseFloat(best)) {
        html += ` <div class="chart-insight chart-insight--positive">⭐ This is your best score!</div>`;
    }

    container.innerHTML = html;
}

/**
 * Render contextual insight badge for doughnut chart
 */
function renderDoughnutInsight(placed, notPlaced) {
    const container = document.getElementById('doughnut-insight');
    if (!container) return;

    const total = placed + notPlaced;
    const rate = total > 0 ? ((placed / total) * 100).toFixed(0) : 0;

    let cls = 'chart-insight--neutral';
    let msg = `${rate}% placement rate across ${total} evaluations`;
    if (rate >= 70) { cls = 'chart-insight--positive'; msg = `🎉 Strong ${rate}% placement rate!`; }
    else if (rate <= 30) { cls = 'chart-insight--negative'; msg = `${rate}% — Room for improvement`; }

    container.innerHTML = `<div class="chart-insight ${cls}">${msg}</div>`;
}

/**
 * Render empty state for charts
 */
function renderEmptyCharts() {
    const trendCtx = document.getElementById('trend-chart');
    const doughnutCtx = document.getElementById('doughnut-chart');

    const emptyHTML = (icon, msg) => `
        <div class="empty-state" style="padding: var(--space-8) var(--space-4);">
            <div class="empty-state-icon">${icon}</div>
            <div class="empty-state-title">No data yet</div>
            <div class="empty-state-desc">${msg}</div>
        </div>`;

    if (trendCtx) {
        trendCtx.parentElement.innerHTML = emptyHTML('📊', 'Submit evaluations to see your score trend over time');
    }
    if (doughnutCtx) {
        doughnutCtx.parentElement.innerHTML = emptyHTML('📈', 'Your placement distribution will appear here');
    }
}

/**
 * Update chart colors when theme changes
 */
function updateChartTheme() {
    if (typeof loadDashboardData === 'function') {
        loadDashboardData();
    }
}

/**
 * Convert hex to rgba
 */
function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}
