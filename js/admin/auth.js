// js/admin/auth.js

window.checkLogin = function() {
    const pass = document.getElementById('admin-pass').value;
    if(pass === "admin123") { 
        document.getElementById('login-overlay').style.display = 'none'; 
        window.startListeningToDatabase(); 
    } else { 
        document.getElementById('login-error').classList.remove('hidden'); 
    }
}

window.switchTab = function(tab) {
    ['dashboard', 'users', 'tasks', 'withdrawals'].forEach(t => {
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
    
    // Listen for Settings (Token Price & Maintenance)
    window.dbOnValue(window.dbRef(window.db, 'settings'), (snapshot) => { 
        const settings = snapshot.val() || {}; 
        
        // 1. Update Token Price UI
        const currentPrice = settings.tokenPrice || 0.00063633; 
        document.getElementById('input-token-price').value = currentPrice; 
        document.getElementById('display-token-price').innerText = currentPrice; 
        
        // 2. Update Maintenance Switches UI
        const maint = settings.maintenance || {};
        ['global', 'withdraw', 'aviator', 'mines', 'coinflip', 'spin'].forEach(key => {
            const checkbox = document.getElementById(`maint-${key}`);
            if (checkbox) checkbox.checked = !!maint[key]; // True if maintenance is ON
        });
    });
}

window.setTokenPrice = function() {
    const newPrice = parseFloat(document.getElementById('input-token-price').value);
    if(newPrice > 0) { window.dbUpdate(window.dbRef(window.db, 'settings'), { tokenPrice: newPrice }).then(() => alert('Token Price updated successfully!')).catch(err => alert('Error updating price: ' + err)); }
}

// Function to handle Maintenance Toggles from Admin Panel
window.toggleMaintenance = function(key, isEnabled) {
    window.dbUpdate(window.dbRef(window.db, `settings/maintenance`), {
        [key]: isEnabled
    }).then(() => {
        // Option specific toast/alert (Silent update is fine, but we can log it)
        console.log(`Maintenance for ${key} set to ${isEnabled}`);
    }).catch(err => alert("Error updating maintenance mode: " + err));
}
