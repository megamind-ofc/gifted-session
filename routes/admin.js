
const express = require('express');
const { connectDB } = require('../db');
let router = express.Router();

router.get('/', async (req, res) => {
    try {
        const database = await connectDB();
        const sessions = database.collection('sessions');
        
        const allSessions = await sessions.find({}).sort({ createdAt: -1 }).toArray();
        
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Session Manager</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #000;
            color: #fff;
            padding: 20px;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.05);
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        h1 {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .stat-card h3 {
            color: #9ca3af;
            font-size: 0.875rem;
            margin-bottom: 8px;
        }
        
        .stat-card p {
            font-size: 2rem;
            font-weight: 700;
        }
        
        .search-box {
            width: 100%;
            padding: 12px 20px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #fff;
            font-size: 1rem;
            margin-bottom: 20px;
        }
        
        .search-box:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.3);
        }
        
        .table-container {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        thead {
            background: rgba(255, 255, 255, 0.1);
        }
        
        th {
            padding: 15px;
            text-align: left;
            font-weight: 600;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        td {
            padding: 15px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        tr:hover {
            background: rgba(255, 255, 255, 0.03);
        }
        
        .session-id {
            font-family: 'Courier New', monospace;
            background: rgba(255, 255, 255, 0.1);
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.875rem;
        }
        
        .copy-btn {
            background: #fff;
            color: #000;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .copy-btn:hover {
            background: #e5e7eb;
            transform: translateY(-2px);
        }
        
        .date {
            color: #9ca3af;
            font-size: 0.875rem;
        }
        
        .data-preview {
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-family: 'Courier New', monospace;
            font-size: 0.75rem;
            color: #6b7280;
        }
        
        .no-data {
            text-align: center;
            padding: 60px 20px;
            color: #6b7280;
        }
        
        .expired {
            color: #ef4444;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        .active {
            color: #10b981;
            font-size: 0.75rem;
            font-weight: 600;
        }
        
        @media (max-width: 768px) {
            .table-container {
                overflow-x: auto;
            }
            
            table {
                min-width: 800px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Session Manager</h1>
            <p style="color: #9ca3af; margin-top: 10px;">View and manage all SUBZERO MD sessions</p>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Total Sessions</h3>
                <p>${allSessions.length}</p>
            </div>
            <div class="stat-card">
                <h3>Active Sessions</h3>
                <p>${allSessions.filter(s => new Date(s.expiresAt) > new Date()).length}</p>
            </div>
            <div class="stat-card">
                <h3>Expired Sessions</h3>
                <p>${allSessions.filter(s => new Date(s.expiresAt) <= new Date()).length}</p>
            </div>
        </div>
        
        <input type="text" class="search-box" id="searchBox" placeholder="Search by Session ID...">
        
        <div class="table-container">
            ${allSessions.length > 0 ? `
            <table id="sessionTable">
                <thead>
                    <tr>
                        <th>Session ID</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Expires At</th>
                        <th>Data Size</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${allSessions.map(session => {
                        const isExpired = new Date(session.expiresAt) <= new Date();
                        const dataSize = session.b64Data ? (session.b64Data.length / 1024).toFixed(2) : '0';
                        
                        return `
                        <tr data-session-id="${session.sessionId}">
                            <td>
                                <span class="session-id">Darex~${session.sessionId}</span>
                            </td>
                            <td>
                                <span class="${isExpired ? 'expired' : 'active'}">
                                    ${isExpired ? '⚠️ EXPIRED' : '✅ ACTIVE'}
                                </span>
                            </td>
                            <td class="date">${new Date(session.createdAt).toLocaleString()}</td>
                            <td class="date">${new Date(session.expiresAt).toLocaleString()}</td>
                            <td>${dataSize} KB</td>
                            <td>
                                <button class="copy-btn" onclick="copySessionId('Darex~${session.sessionId}')">
                                    Copy ID
                                </button>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            ` : `
            <div class="no-data">
                <p style="font-size: 3rem; margin-bottom: 10px;">📭</p>
                <p>No sessions found</p>
            </div>
            `}
        </div>
    </div>
    
    <script>
        function copySessionId(sessionId) {
            navigator.clipboard.writeText(sessionId).then(() => {
                const btn = event.target;
                const originalText = btn.textContent;
                btn.textContent = '✓ Copied!';
                btn.style.background = '#10b981';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                }, 2000);
            });
        }
        
        const searchBox = document.getElementById('searchBox');
        const table = document.getElementById('sessionTable');
        
        if (searchBox && table) {
            searchBox.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const rows = table.querySelectorAll('tbody tr');
                
                rows.forEach(row => {
                    const sessionId = row.getAttribute('data-session-id').toLowerCase();
                    if (sessionId.includes(searchTerm) || searchTerm === '') {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        }
    </script>
</body>
</html>
        `;
        
        res.send(html);
    } catch (error) {
        console.error('Admin route error:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            details: error.message
        });
    }
});

module.exports = router;
