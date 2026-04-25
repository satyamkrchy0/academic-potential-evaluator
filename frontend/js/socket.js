/**
 * socket.js — Real-time connection logic for dashboard updates
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are logged in, otherwise don't connect
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to backend Socket.IO
    const socket = io('http://localhost:4000', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity
    });

    const statusBadge = document.getElementById('connection-status');
    const indicator = statusBadge ? statusBadge.querySelector('.socket-indicator') : null;

    function updateStatus(isOnline) {
        if (!statusBadge || !indicator) return;
        
        if (isOnline) {
            statusBadge.classList.replace('badge--danger', 'badge--success');
            statusBadge.innerHTML = '<div class="socket-indicator online"></div> Live';
            if (typeof showToast === 'function') showToast('Connected', 'Real-time updates active', 'success');
        } else {
            statusBadge.classList.replace('badge--success', 'badge--danger');
            statusBadge.innerHTML = '<div class="socket-indicator offline"></div> Disconnected';
            if (typeof showToast === 'function') showToast('Disconnected', 'Lost connection to server, retrying...', 'warning');
        }
    }

    socket.on('connect', () => updateStatus(true));
    socket.on('disconnect', () => updateStatus(false));

    socket.on('new_prediction', (data) => {
        // If a new prediction happens globally or for this user, refresh dashboard
        if (typeof loadDashboardData === 'function') {
            loadDashboardData();
        }
    });
});
