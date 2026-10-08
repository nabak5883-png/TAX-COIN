// js/admin/users.js
window.updateDashboardStats = function() {
    const userKeys = Object.keys(window.allUsers); document.getElementById('stat-total-users').innerText = userKeys.length;
    let totalTax = 0; userKeys.forEach(uid => { totalTax += (window.allUsers[uid].balance || 0); totalTax += (window.allUsers[uid].holdingBalance || 0); });
    document.getElementById('stat-total-tax').innerText = totalTax.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const pendingKeys = Object.keys(window.allWithdrawals).filter(k => window.allWithdrawals[k].status === 'Pending'); document.getElementById('stat-pending-wd').innerText = pendingKeys.length;
    const badge = document.getElementById('pending-badge'); const mobBadge = document.getElementById('mob-pending-badge');
    if(pendingKeys.length > 0) { badge.innerText = pendingKeys.length; badge.classList.remove('hidden'); mobBadge.innerText = pendingKeys.length; mobBadge.classList.remove('hidden'); } 
    else { badge.classList.add('hidden'); mobBadge.classList.add('hidden'); }
}

window.renderUsersTable = function() {
    const tbody = document.getElementById('users-table-body'); const search = document.getElementById('search-user')?.value.toLowerCase() || "";
    let html = '';
    for(const [uid, data] of Object.entries(window.allUsers)) {
        if(search && !uid.toLowerCase().includes(search)) continue;
        const bal = parseFloat(data.balance || 0).toFixed(4); const pph = parseInt(data.pph || 0);
        const verified = data.isVerified ? '<span class="text-emerald-400"><i class="fa-solid fa-check-circle"></i> Yes</span>' : '<span class="text-slate-500">No</span>';
        html += `<tr><td class="px-4 py-3 font-mono text-amber-300">${uid}</td><td class="px-4 py-3 font-bold">${bal} TAX</td><td class="px-4 py-3 text-emerald-400">+${pph}/hr</td><td class="px-4 py-3">${verified}</td><td class="px-4 py-3 text-right"><button onclick="editBalance('${uid}', ${bal})" class="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded text-xs font-bold border border-sky-500/30">Edit Coins</button></td></tr>`;
    }
    tbody.innerHTML = html || '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-500">No users found.</td></tr>';
}

if(document.getElementById('search-user')) { document.getElementById('search-user').addEventListener('input', window.renderUsersTable); }

window.editBalance = function(uid, currentBal) { 
    const newBal = prompt(`Enter new TAX balance for user ${uid}:`, currentBal); 
    if(newBal !== null && !isNaN(newBal)) { 
        window.dbUpdate(window.dbRef(window.db, `users/${uid}`), { balance: parseFloat(newBal) }).then(() => alert('Balance updated!')).catch(err => alert('Error: ' + err)); 
    } 
}

window.renderWithdrawalsTable = function() {
    const tbody = document.getElementById('withdraw-table-body'); let html = '';
    const requests = Object.entries(window.allWithdrawals).sort((a, b) => b[1].timestamp - a[1].timestamp);
    for(const [key, data] of requests) {
        let statusBadge = ''; let controls = '';
        if(data.status === 'Pending') { statusBadge = `<span class="bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-[10px] font-bold border border-amber-500/30">Pending ⏳</span>`; controls = `<button onclick="processWithdrawal('${key}', 'Approved')" class="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 rounded text-xs font-bold mr-1">Approve</button><button onclick="processWithdrawal('${key}', 'Rejected')" class="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded text-xs font-bold">Reject</button>`; } 
        else if(data.status === 'Approved') { statusBadge = `<span class="text-emerald-400 text-xs font-bold"><i class="fa-solid fa-check"></i> Paid</span>`; controls = `<span class="text-slate-500 text-[10px]">Closed</span>`; } 
        else { statusBadge = `<span class="text-rose-400 text-xs font-bold"><i class="fa-solid fa-xmark"></i> Rejected</span>`; controls = `<span class="text-slate-500 text-[10px]">Closed</span>`; }
        html += `<tr><td class="px-4 py-3 text-xs text-slate-400">${new Date(data.timestamp).toLocaleString()}</td><td class="px-4 py-3 font-mono text-amber-300">${data.userId}</td><td class="px-4 py-3"><span class="font-bold text-white uppercase text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">${data.method}</span><br><span class="text-[11px] text-sky-300 font-mono">${data.address}</span></td><td class="px-4 py-3 font-black text-emerald-400">${parseFloat(data.amount).toFixed(2)} TAX</td><td class="px-4 py-3">${statusBadge}</td><td class="px-4 py-3 text-right">${controls}</td></tr>`;
    }
    tbody.innerHTML = html || '<tr><td colspan="6" class="px-4 py-8 text-center text-slate-500">No withdrawal requests found.</td></tr>';
}

window.processWithdrawal = function(reqId, action) { 
    if(confirm(`Are you sure you want to mark this request as ${action}?`)) { 
        window.dbUpdate(window.dbRef(window.db, `withdrawals/${reqId}`), { status: action }).then(() => alert(`Withdrawal marked as ${action}!`)).catch(err => alert('Error: ' + err)); 
    } 
}
