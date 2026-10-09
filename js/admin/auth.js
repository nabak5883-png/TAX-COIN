window.checkLogin = function() {
    const pass = document.getElementById('admin-pass').value;
    if(pass === "admin123") { document.getElementById('login-overlay').style.display = 'none'; window.startListeningToDatabase(); } 
    else { document.getElementById('login-error').classList.remove('hidden'); }
}

window.switchTab = function(tab) {
    ['dashboard', 'users', 'tasks', 'withdrawals', 'games'].forEach(t => {
        document.getElementById(`view-${t}`).classList.add('hidden');
        const btn = document.getElementById(`btn-${t}`);
        if(btn) { btn.className = (t === tab) ? "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/20 text-amber-400 font-bold transition" : "w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white font-bold transition"; }
        const mobBtn = document.getElementById(`mob-btn-${t}`);
        if(mobBtn) { mobBtn.className = (t === tab) ? "flex flex-col items-center p-2 text-amber-400 transition" : "flex flex-col items-center p-2 text-slate-400 transition"; }
    });
    document.getElementById(`view-${tab}`).classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.startListeningToDatabase = function() {
    window.dbOnValue(window.dbRef(window.db, 'users'), (snapshot) => { window.allUsers = snapshot.val() || {}; window.updateDashboardStats(); window.renderUsersTable(); });
    window.dbOnValue(window.dbRef(window.db, 'withdrawals'), (snapshot) => { window.allWithdrawals = snapshot.val() || {}; window.updateDashboardStats(); window.renderWithdrawalsTable(); });
    window.dbOnValue(window.dbRef(window.db, 'tasks'), (snapshot) => { window.allTasks = snapshot.val() || {}; window.renderTasksTable(); });
    
    window.dbOnValue(window.dbRef(window.db, 'settings'), (snapshot) => { 
        const settings = snapshot.val() || {}; 
        
        // 1. Settings & Maintenance
        const currentPrice = settings.tokenPrice || 0.00063633; 
        document.getElementById('input-token-price').value = currentPrice; document.getElementById('display-token-price').innerText = currentPrice; 
        const maint = settings.maintenance || {};
        ['global', 'withdraw', 'aviator', 'mines', 'coinflip', 'spin'].forEach(key => { const checkbox = document.getElementById(`maint-${key}`); if (checkbox) checkbox.checked = !!maint[key]; });

        // 2. Aviator Games Controls
        const games = settings.games || {};
        const aviatorDisplay = document.getElementById('display-aviator-crash');
        if (aviatorDisplay) {
            if (games.aviator && games.aviator.nextCrash) { aviatorDisplay.innerText = games.aviator.nextCrash + "x"; aviatorDisplay.className = "text-red-400 text-sm font-black"; } 
            else { aviatorDisplay.innerText = "Auto (Random)"; aviatorDisplay.className = "text-emerald-400 text-sm font-bold"; }
        }

        // 3. Aviator TIME Schedules Render
        const schedList = document.getElementById('aviator-schedules-list');
        if (schedList) {
            let html = '';
            if (games.aviator && games.aviator.scheduled) {
                const times = Object.keys(games.aviator.scheduled).sort();
                times.forEach(t => {
                    const val = games.aviator.scheduled[t];
                    html += `
                        <div class="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-700">
                            <div class="flex items-center gap-3">
                                <span class="bg-amber-500/20 text-amber-400 px-2 py-1 rounded font-mono text-xs font-bold"><i class="fa-regular fa-clock"></i> ${t}</span>
                                <span class="text-emerald-400 font-black">${val}x</span>
                            </div>
                            <button onclick="deleteAviatorSchedule('${t}')" class="text-rose-500 hover:text-rose-400 p-1"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    `;
                });
            }
            schedList.innerHTML = html || '<p class="text-xs text-slate-500 italic text-center py-2">No schedules set.</p>';
        }
    });
}

window.setTokenPrice = function() { const newPrice = parseFloat(document.getElementById('input-token-price').value); if(newPrice > 0) { window.dbUpdate(window.dbRef(window.db, 'settings'), { tokenPrice: newPrice }).then(() => alert('Price updated!')).catch(err => alert('Error: ' + err)); } }
window.toggleMaintenance = function(key, isEnabled) { window.dbUpdate(window.dbRef(window.db, `settings/maintenance`), { [key]: isEnabled }).catch(err => alert("Error: " + err)); }
