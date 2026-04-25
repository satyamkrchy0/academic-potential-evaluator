/**
 * pdf-export.js — Premium PDF Report using jsPDF (direct generation)
 * Fixed: blank pages caused by oversized text blocks and profile grid y-tracking.
 */

function exportPDF(result, inputData, explanation) {
    if (!result) {
        showToast('Error', 'No prediction result available to export', 'error');
        return;
    }
    if (!inputData) inputData = {};

    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => _buildPDF(result, inputData, explanation);
        script.onerror = () => showToast('Error', 'Failed to load PDF library', 'error');
        document.head.appendChild(script);
    } else {
        _buildPDF(result, inputData, explanation);
    }
}

function _buildPDF(result, inputData, explanation) {
    showToast('Info', 'Generating PDF report...', 'info');

    try {
        const { jsPDF } = window.jspdf || window;
        const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

        const W = doc.internal.pageSize.getWidth();   // 210
        const H = doc.internal.pageSize.getHeight();   // 297
        const M = 18;
        const contentW = W - M * 2;
        let y = M;
        const LINE_H = 5;          // line height for body text
        const PAGE_BOTTOM = H - 20; // usable bottom before footer

        const isPlaced = result.prediction === 'Placed';
        const accentR = isPlaced ? 30 : 220;
        const accentG = isPlaced ? 180 : 70;
        const accentB = isPlaced ? 120 : 70;
        const prob = result.placement_probability != null
            ? (result.placement_probability * 100).toFixed(1) : '—';
        const score = result.placement_score != null ? result.placement_score : '—';
        const confidence = result.confidence || '—';

        // ── Helpers ──────────────────────────────────────────
        function newPageIfNeeded(needed) {
            if (y + needed > PAGE_BOTTOM) {
                addNewPage();
            }
        }

        function addNewPage() {
            doc.addPage();
            // Light background on every page
            doc.setFillColor(250, 251, 253);
            doc.rect(0, 0, W, H, 'F');
            y = M;
        }

        function drawSectionTitle(title, r, g, b) {
            newPageIfNeeded(16);
            doc.setFillColor(r, g, b);
            doc.rect(M, y, 4, 10, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(14);
            doc.setTextColor(30, 30, 40);
            doc.text(title, M + 10, y + 7);
            y += 16;
        }

        function drawFooter() {
            const fy = H - 12;
            doc.setDrawColor(220, 225, 235);
            doc.setLineWidth(0.3);
            doc.line(M, fy - 6, W - M, fy - 6);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            doc.setTextColor(150, 155, 165);
            doc.text('Powered by EmployEdge AI • Deep Learning Placement Analytics', M, fy);
            doc.text('Confidential Report', W - M, fy, { align: 'right' });
        }

        // ── PAGE 1 BACKGROUND ────────────────────────────────
        doc.setFillColor(250, 251, 253);
        doc.rect(0, 0, W, H, 'F');

        // ── HEADER BAR ───────────────────────────────────────
        doc.setFillColor(15, 18, 25);
        doc.rect(0, 0, W, 42, 'F');

        doc.setFillColor(accentR, accentG, accentB);
        doc.roundedRect(M, 10, 22, 22, 4, 4, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('EE', M + 6, 24);

        doc.setFontSize(20);
        doc.text('EmployEdge', M + 28, 20);
        doc.setFontSize(9);
        doc.setTextColor(160, 165, 180);
        doc.text('Student Placement Prediction Report', M + 28, 28);

        doc.setFontSize(8);
        doc.setTextColor(130, 135, 150);
        doc.text('Report Generated', W - M - 40, 18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(180, 185, 195);
        doc.text(new Date().toLocaleString(), W - M - 40, 24);

        y = 54;

        // ── PREDICTION SUMMARY ───────────────────────────────
        drawSectionTitle('Prediction Summary', accentR, accentG, accentB);

        doc.setDrawColor(accentR, accentG, accentB);
        doc.setLineWidth(2.5);
        doc.circle(M + 22, y + 18, 18, 'S');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(24);
        doc.setTextColor(30, 30, 40);
        doc.text(String(score), M + 22, y + 16, { align: 'center' });
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 130);
        doc.text('/100', M + 22, y + 24, { align: 'center' });

        const badgeX = M + 52;
        doc.setFillColor(accentR, accentG, accentB);
        doc.roundedRect(badgeX, y, 50, 12, 3, 3, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text(result.prediction || '—', badgeX + 25, y + 8, { align: 'center' });

        const metricY = y + 18;
        doc.setFillColor(240, 242, 248);
        doc.roundedRect(badgeX, metricY, 50, 18, 3, 3, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 110);
        doc.text('PROBABILITY', badgeX + 25, metricY + 6, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(30, 30, 40);
        doc.text(prob + '%', badgeX + 25, metricY + 14, { align: 'center' });

        doc.setFillColor(240, 242, 248);
        doc.roundedRect(badgeX + 56, metricY, 50, 18, 3, 3, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 110);
        doc.text('CONFIDENCE', badgeX + 81, metricY + 6, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(30, 30, 40);
        doc.text(confidence.split('(')[0].trim(), badgeX + 81, metricY + 14, { align: 'center' });

        y += 48;

        // ── STUDENT PROFILE ──────────────────────────────────
        drawSectionTitle('Student Profile', 100, 110, 130);

        const profileData = [
            ['Gender', inputData.gender],
            ['Degree', inputData.degree],
            ['Branch', inputData.branch],
            ['CGPA', inputData.cgpa],
            ['Internships', inputData.internships],
            ['Projects', inputData.projects],
            ['Coding Skills', inputData.coding_skills != null ? inputData.coding_skills + '/10' : null],
            ['Communication', inputData.communication_skills != null ? inputData.communication_skills + '/10' : null],
            ['Aptitude Score', inputData.aptitude_test_score],
            ['Soft Skills', inputData.soft_skills_rating != null ? inputData.soft_skills_rating + '/10' : null],
            ['Certifications', inputData.certifications],
            ['Backlogs', inputData.backlogs]
        ];

        // Draw profile as simple two-column key-value rows
        const rowH = 8;
        for (let i = 0; i < profileData.length; i += 2) {
            newPageIfNeeded(rowH + 2);

            // Alternating row background
            if (Math.floor(i / 2) % 2 === 0) {
                doc.setFillColor(245, 247, 252);
                doc.rect(M, y - 2, contentW, rowH, 'F');
            }

            // Left column
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(100, 100, 110);
            doc.text(profileData[i][0], M + 4, y + 4);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(30, 30, 40);
            doc.text(String(profileData[i][1] ?? '—'), M + 42, y + 4);

            // Right column
            if (i + 1 < profileData.length) {
                const colR = M + contentW / 2 + 4;
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(100, 100, 110);
                doc.text(profileData[i + 1][0], colR, y + 4);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(30, 30, 40);
                doc.text(String(profileData[i + 1][1] ?? '—'), colR + 38, y + 4);
            }

            y += rowH;
        }

        y += 8;

        // ── AI CAREER ADVISOR (paginated line-by-line) ────────
        if (explanation) {
            drawSectionTitle('AI Career Advisor', 80, 100, 220);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);
            const lines = doc.splitTextToSize(explanation, contentW - 12);

            // Draw a subtle left border accent for the advice block
            doc.setDrawColor(80, 100, 220);
            doc.setLineWidth(0.8);

            for (let i = 0; i < lines.length; i++) {
                newPageIfNeeded(LINE_H + 2);

                // Light background band for first line or after page break
                if (i === 0 || y === M) {
                    doc.setFillColor(238, 242, 255);
                    const remaining = Math.min(lines.length - i, Math.floor((PAGE_BOTTOM - y) / LINE_H));
                    const bandH = remaining * LINE_H + 6;
                    doc.roundedRect(M, y - 3, contentW, bandH, 2, 2, 'F');
                    doc.setDrawColor(80, 100, 220);
                    doc.setLineWidth(0.8);
                    doc.line(M + 1, y - 3, M + 1, y - 3 + bandH);
                }

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9.5);
                doc.setTextColor(40, 45, 65);
                doc.text(lines[i], M + 6, y + 3);
                y += LINE_H;
            }

            y += 6;
        }

        // ── RISK FACTORS (paginated) ─────────────────────────
        if (result.risk_factors && result.risk_factors.length > 0) {
            drawSectionTitle('Risk Factors & Improvement Areas', 220, 80, 80);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9.5);

            for (let i = 0; i < result.risk_factors.length; i++) {
                const riskLines = doc.splitTextToSize('• ' + result.risk_factors[i], contentW - 12);
                const blockH = riskLines.length * LINE_H + 2;
                newPageIfNeeded(blockH);

                // Background for each risk item
                doc.setFillColor(255, 243, 243);
                doc.rect(M, y - 1, contentW, blockH, 'F');

                doc.setTextColor(180, 50, 50);
                for (let j = 0; j < riskLines.length; j++) {
                    doc.text(riskLines[j], M + 6, y + 4 + j * LINE_H);
                }
                y += blockH + 1;
            }

            y += 6;
        }

        // ── FOOTER on every page ─────────────────────────────
        const totalPages = doc.internal.getNumberOfPages();
        for (let p = 1; p <= totalPages; p++) {
            doc.setPage(p);
            drawFooter();
            // Page number
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7);
            doc.setTextColor(170, 175, 185);
            doc.text(`Page ${p} of ${totalPages}`, W / 2, H - 8, { align: 'center' });
        }

        // ── SAVE ─────────────────────────────────────────────
        doc.save(`EmployEdge_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
        showToast('Success', 'PDF report downloaded successfully!', 'success');

    } catch (err) {
        console.error('PDF generation failed:', err);
        showToast('Error', 'Failed to generate PDF: ' + err.message, 'error');
    }
}
