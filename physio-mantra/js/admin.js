/* js/admin.js */
// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://rfbkfoabjwxfjldefcor.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmYmtmb2Fiand4ZmpsZGVmY29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MTQ5OTUsImV4cCI6MjA5NTE5MDk5NX0.Gqj0hOdf5Oe83nBYPTGEb5Hnv2IYeRkSaufIW6fW69Y';
const ADMIN_PASSWORD = 'Silver@300';

let currentView = 'dashboard';
let currentPage = 1;
let allRequests = [];
let filteredRequests = [];

function checkAuth() {
    const isAuth = localStorage.getItem('pm_admin_auth');
    if (!isAuth || isAuth !== 'true') {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('pm_admin_auth');
    window.location.href = 'login.html';
}

async function fetchRequests() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/requests?order=created_at.desc`, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch requests');
        allRequests = await response.json();
        filterRequests();
    } catch (error) {
        console.error('Error fetching requests:', error);
        document.getElementById('adminContent').innerHTML = '<div style="text-align: center; padding: 2rem; color: red;">Failed to load requests. Please check your Supabase configuration.</div>';
    }
}

function filterRequests() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const serviceFilter = document.getElementById('serviceFilter')?.value || '';
    
    filteredRequests = allRequests.filter(req => {
        const matchesSearch = searchTerm === '' || req.name.toLowerCase().includes(searchTerm) || req.phone.includes(searchTerm);
        const matchesStatus = statusFilter === '' || req.status === statusFilter;
        const matchesService = serviceFilter === '' || req.service === serviceFilter;
        return matchesSearch && matchesStatus && matchesService;
    });
    
    renderCurrentView();
}

async function updateStatus(id, newStatus) {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/requests?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) throw new Error('Failed to update status');
        
        const updated = await response.json();
        const index = allRequests.findIndex(r => r.id === id);
        if (index !== -1) {
            allRequests[index] = updated[0];
            filterRequests();
        }
    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status. Please try again.');
    }
}

function getStatusBadge(status) {
    const badges = {
        'new': 'badge-new',
        'called': 'badge-called',
        'confirmed': 'badge-confirmed',
        'dispatched': 'badge-dispatched',
        'completed': 'badge-completed'
    };
    return `<span class="badge ${badges[status] || 'badge-new'}">${status.toUpperCase()}</span>`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function renderDashboard() {
    const stats = {
        total: allRequests.length,
        new: allRequests.filter(r => r.status === 'new').length,
        inProgress: allRequests.filter(r => ['called', 'confirmed', 'dispatched'].includes(r.status)).length,
        completed: allRequests.filter(r => r.status === 'completed').length
    };
    
    let html = `
        <div class="stat-cards">
            <div class="stat-card-admin"><h4><i class="ti ti-inbox"></i> Total Requests</h4><div class="stat-number-admin">${stats.total}</div></div>
            <div class="stat-card-admin"><h4><i class="ti ti-bell"></i> New</h4><div class="stat-number-admin" style="color: var(--saffron);">${stats.new}</div></div>
            <div class="stat-card-admin"><h4><i class="ti ti-loader"></i> In Progress</h4><div class="stat-number-admin" style="color: var(--gold);">${stats.inProgress}</div></div>
            <div class="stat-card-admin"><h4><i class="ti ti-check"></i> Completed</h4><div class="stat-number-admin" style="color: #16a34a;">${stats.completed}</div></div>
        </div>
        <h3>Recent Requests</h3>
        <table class="requests-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Service</th><th>Visit Type</th><th>Status</th><th>Submitted</th></tr></thead>
            <tbody>
    `;
    
    const recent = filteredRequests.slice(0, 10);
    recent.forEach(req => {
        html += `<tr onclick="openDetailPanel(${JSON.stringify(req).replace(/"/g, '&quot;')})">
            <td>${req.name}</td>
            <td>${req.phone}</td>
            <td>${req.service.substring(0, 30)}${req.service.length > 30 ? '...' : ''}</td>
            <td>${req.visit_type}</td>
            <td>${getStatusBadge(req.status)}</td>
            <td>${formatDate(req.created_at)}</td>
        </tr>`;
    });
    
    html += `</tbody></table>`;
    document.getElementById('adminContent').innerHTML = html;
}

function renderRequests() {
    const itemsPerPage = 20;
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const pageRequests = filteredRequests.slice(start, start + itemsPerPage);
    
    let html = `
        <div class="filters-bar">
            <input type="text" id="searchInput" placeholder="Search by name or phone..." class="filter-input" onkeyup="filterRequests()">
            <select id="statusFilter" class="filter-select" onchange="filterRequests()">
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="called">Called</option>
                <option value="confirmed">Confirmed</option>
                <option value="dispatched">Dispatched</option>
                <option value="completed">Completed</option>
            </select>
            <select id="serviceFilter" class="filter-select" onchange="filterRequests()">
                <option value="">All Services</option>
                <option value="Neuro Rehabilitation">Neuro Rehabilitation</option>
                <option value="Sports Physiotherapy">Sports Physiotherapy</option>
                <option value="Cardiac Rehabilitation">Cardiac Rehabilitation</option>
                <option value="Home Visits">Home Visits</option>
            </select>
        </div>
        <table class="requests-table">
            <thead><tr><th>Name</th><th>Phone</th><th>Address</th><th>Service</th><th>Visit Type</th><th>Status</th><th>Preferred Time</th><th>Submitted</th><th>Actions</th></tr></thead>
            <tbody>
    `;
    
    pageRequests.forEach(req => {
        html += `<tr>
            <td onclick="openDetailPanel(${JSON.stringify(req).replace(/"/g, '&quot;')})" style="cursor: pointer;">${req.name}</td>
            <td onclick="openDetailPanel(${JSON.stringify(req).replace(/"/g, '&quot;')})" style="cursor: pointer;">${req.phone}</td>
            <td onclick="openDetailPanel(${JSON.stringify(req).replace(/"/g, '&quot;')})" style="cursor: pointer;">${req.address.substring(0, 40)}${req.address.length > 40 ? '...' : ''}</td>
            <td onclick="openDetailPanel(${JSON.stringify(req).replace(/"/g, '&quot;')})" style="cursor: pointer;">${req.service.substring(0, 25)}${req.service.length > 25 ? '...' : ''}</td>
            <td onclick="openDetailPanel(${JSON.stringify(req).replace(/"/g, '&quot;')})" style="cursor: pointer;">${req.visit_type}</td>
            <td><select onchange="updateStatus(${req.id}, this.value)" class="filter-select" style="padding: 0.25rem 0.5rem;">
                <option value="new" ${req.status === 'new' ? 'selected' : ''}>New</option>
                <option value="called" ${req.status === 'called' ? 'selected' : ''}>Called</option>
                <option value="confirmed" ${req.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                <option value="dispatched" ${req.status === 'dispatched' ? 'selected' : ''}>Dispatched</option>
                <option value="completed" ${req.status === 'completed' ? 'selected' : ''}>Completed</option>
            </select></td>
            <td onclick="openDetailPanel(${JSON.stringify(req).replace(/"/g, '&quot;')})" style="cursor: pointer;">${req.preferred_date} ${req.preferred_time}</td>
            <td onclick="openDetailPanel(${JSON.stringify(req).replace(/"/g, '&quot;')})" style="cursor: pointer;">${formatDate(req.created_at)}</td>
            <td>
                <a href="tel:${req.phone}" style="color: var(--saffron); margin-right: 0.5rem;"><i class="ti ti-phone-call"></i></a>
                <button onclick="copyToClipboard(${JSON.stringify(req).replace(/"/g, '&quot;')})" style="background: none; border: none; cursor: pointer; color: var(--gold); margin-right: 0.5rem;"><i class="ti ti-copy"></i></button>
                <button onclick="openWhatsApp(${JSON.stringify(req).replace(/"/g, '&quot;')})" style="background: none; border: none; cursor: pointer; color: #25D366;"><i class="ti ti-brand-whatsapp"></i></button>
            </td>
        </tr>`;
    });
    
    html += `</tbody></table><div class="pagination"><button onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>Previous</button><span>Page ${currentPage} of ${totalPages || 1}</span><button onclick="changePage(1)" ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}>Next</button></div>`;
    document.getElementById('adminContent').innerHTML = html;
    
    if (document.getElementById('searchInput')) {
        document.getElementById('searchInput').value = '';
    }
}

function changePage(direction) {
    const itemsPerPage = 20;
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderCurrentView();
    }
}

function renderCurrentView() {
    if (currentView === 'dashboard') {
        renderDashboard();
    } else {
        renderRequests();
    }
}

function openDetailPanel(request) {
    const panel = document.getElementById('detailPanel');
    const content = document.getElementById('detailPanelContent');
    content.innerHTML = `
        <p><strong>Name:</strong> ${request.name}</p>
        <p><strong>Phone:</strong> <a href="tel:${request.phone}">${request.phone}</a></p>
        <p><strong>Address:</strong> ${request.address}</p>
        <p><strong>Service:</strong> ${request.service}</p>
        <p><strong>Visit Type:</strong> ${request.visit_type}</p>
        <p><strong>Preferred Date:</strong> ${request.preferred_date}</p>
        <p><strong>Preferred Time:</strong> ${request.preferred_time}</p>
        <p><strong>Notes:</strong> ${request.notes || 'None'}</p>
        <p><strong>Status:</strong> ${request.status}</p>
        <p><strong>Submitted:</strong> ${formatDate(request.created_at)}</p>
        <hr style="margin: 1rem 0;">
        <button onclick="closeDetailPanel()" class="btn-secondary" style="width: 100%;">Close</button>
    `;
    panel.classList.add('active');
}

function closeDetailPanel() {
    document.getElementById('detailPanel').classList.remove('active');
}

function copyToClipboard(request) {
    const text = `Name: ${request.name}\nPhone: ${request.phone}\nService: ${request.service}\nAddress: ${request.address}\nVisit Type: ${request.visit_type}\nPreferred Time: ${request.preferred_date} ${request.preferred_time}\nNotes: ${request.notes || 'None'}`;
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
}

function openWhatsApp(request) {
    const message = `*New Physio Request*\n\nName: ${request.name}\nPhone: ${request.phone}\nService: ${request.service}\nAddress: ${request.address}\nVisit Type: ${request.visit_type}\nTime: ${request.preferred_date} ${request.preferred_time}\nNotes: ${request.notes || 'None'}`;
    const url = `https://wa.me/${request.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
        checkAuth();
        fetchRequests();
        
        document.querySelectorAll('[data-view]').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                currentView = this.getAttribute('data-view');
                currentPage = 1;
                document.querySelectorAll('.admin-nav-item').forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                document.getElementById('pageTitle').textContent = this.querySelector('i + text').textContent || this.textContent.trim();
                renderCurrentView();
            });
        });
        
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
    } else if (window.location.pathname.includes('login.html')) {
        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const password = document.getElementById('password').value;
                if (password === ADMIN_PASSWORD) {
                    localStorage.setItem('pm_admin_auth', 'true');
                    window.location.href = 'dashboard.html';
                } else {
                    document.getElementById('loginError').textContent = 'Incorrect password. Please try again.';
                }
            });
        }
    }
});