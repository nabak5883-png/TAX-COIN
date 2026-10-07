// js/features/profile.js

window.copyUserId = function() { 
    const temp = document.createElement('textarea'); temp.value = window.state.numericUid; 
    document.body.appendChild(temp); temp.select(); document.execCommand('copy'); document.body.removeChild(temp); 
    window.playSound('tap'); window.showToast(`📋 User ID (${window.state.numericUid}) Copied!`); 
};

window.openVerifyModal = function() { 
    if (window.state.isVerified) return window.showToast("✅ Your account is already verified!"); 
    document.getElementById('verify-modal').classList.remove('hidden'); document.getElementById('verify-modal').classList.add('flex'); 
};
window.closeVerifyModal = function() { document.getElementById('verify-modal').classList.add('hidden'); document.getElementById('verify-modal').classList.remove('flex'); };
window.quickFillVerify = function() { document.getElementById('verify-wallet-input').value = "UQA7xTaxCoinOfficialVault" + window.state.numericUid.slice(-4); };
window.completeAccountVerification = function() { 
    let val = document.getElementById('verify-wallet-input').value.trim(); 
    if (!val) val = "UQA7xTaxCoinVerified" + window.state.numericUid.slice(-4); 
    window.state.isVerified = true; window.state.walletAddress = val; window.state.balance += 250; 
    window.playSound('upgrade'); window.closeVerifyModal(); window.showToast("✅ Account Verified! +250.0000 TAX Bonus Added!"); 
    if(window.updateAllUI) window.updateAllUI(); window.saveGameState(); 
};

window.openVipModal = function() { if(window.updateTopStatsUI) window.updateTopStatsUI(); document.getElementById('vip-modal').classList.remove('hidden'); document.getElementById('vip-modal').classList.add('flex'); };
window.closeVipModal = function() { document.getElementById('vip-modal').classList.add('hidden'); document.getElementById('vip-modal').classList.remove('flex'); };
window.lockCoinsInVipVault = function(amount) { 
    const lockAmt = amount || 200; 
    if (window.state.balance < lockAmt) { window.playSound('error'); return window.showToast(`⚠️ Need at least ${lockAmt} TAX in Pool Wallet!`, true); } 
    window.state.balance -= lockAmt; const bonusAmt = lockAmt * 1.25; window.state.holdingBalance = (window.state.holdingBalance || 0) + bonusAmt; 
    window.playSound('upgrade'); window.showToast(`💎 Locked ${lockAmt} TAX! Holding Wallet +${bonusAmt.toFixed(2)} TAX!`); 
    if(window.updateAllUI) window.updateAllUI(); window.saveGameState(); 
};
window.unlockVipVault = function() { 
    if (!window.state.holdingBalance || window.state.holdingBalance <= 0) { window.playSound('error'); return window.showToast("⚠️ Holding Wallet is currently empty!", true); } 
    const unlocked = window.state.holdingBalance; window.state.balance += unlocked; window.state.holdingBalance = 0; 
    window.playSound('upgrade'); window.showToast(`🔓 Transferred ${unlocked.toFixed(4)} TAX to Pool Wallet!`); 
    if(window.updateAllUI) window.updateAllUI(); window.saveGameState(); 
};

window.openWithdrawModal = function() { if(window.updateAllUI) window.updateAllUI(); document.getElementById('withdraw-modal').classList.remove('hidden'); document.getElementById('withdraw-modal').classList.add('flex'); };
window.closeWithdrawModal = function() { document.getElementById('withdraw-modal').classList.add('hidden'); document.getElementById('withdraw-modal').classList.remove('flex'); };
window.openHistoryModal = function() { if(window.renderWithdrawHistory) window.renderWithdrawHistory(); document.getElementById('history-modal').classList.remove('hidden'); document.getElementById('history-modal').classList.add('flex'); };
window.closeHistoryModal = function() { document.getElementById('history-modal').classList.add('hidden'); document.getElementById('history-modal').classList.remove('flex'); };

window.selectWithdrawMethod = function(method) { 
    window.state.withdrawMethod = method; 
    ['TON', 'USDT', 'UPI'].forEach(m => { 
        const btn = document.getElementById(`method-${m}`); if (!btn) return; 
        btn.className = (m === method) ? "py-2 px-2 rounded-xl text-xs font-extrabold border border-amber-400 bg-amber-500/20 text-amber-300 flex items-center justify-center gap-1.5 transition" : "py-2 px-2 rounded-xl text-xs font-bold border border-white/10 bg-slate-900/80 text-slate-400 flex items-center justify-center gap-1.5 transition"; 
    }); 
    const lbl = document.getElementById('withdraw-address-label'); const inp = document.getElementById('withdraw-address-input'); 
    if (method === 'TON') { lbl.textContent = "2. Destination TON Wallet Address"; inp.placeholder = "Enter UQ... / EQ... TON Address"; if (window.state.walletAddress && !inp.value) inp.value = window.state.walletAddress; } 
    else if (method === 'USDT') { lbl.textContent = "2. USDT Address (BEP-20 / TRC-20)"; inp.placeholder = "Enter 0x... or T... USDT Address"; } 
    else { lbl.textContent = "2. UPI ID / Bank Account"; inp.placeholder = "Enter yourname@upi"; } 
    if(window.updateWithdrawPreview) window.updateWithdrawPreview(); 
};

window.setWithdrawPercent = function(pct) { 
    const amt = (window.state.balance * pct).toFixed(4); const inp = document.getElementById('withdraw-amount-input'); 
    if (inp) { inp.value = parseFloat(amt) > 0 ? amt : ''; if(window.updateWithdrawPreview) window.updateWithdrawPreview(); } 
};

window.updateWithdrawPreview = function() { 
    const inp = document.getElementById('withdraw-amount-input'); const out = document.getElementById('withdraw-estimate-display'); 
    if (!inp || !out) return; 
    const taxAmt = parseFloat(inp.value) || 0; const usdVal = taxAmt * window.TAX_TO_USD_RATE; 
    if (window.state.withdrawMethod === 'TON') { const tonVal = usdVal / 5.0; out.textContent = `${tonVal.toFixed(3)} TON (≈ $${usdVal.toFixed(3)})`; } 
    else if (window.state.withdrawMethod === 'USDT') { out.textContent = `${usdVal.toFixed(3)} USDT`; } 
    else { const inrVal = usdVal * 86; out.textContent = `₹${inrVal.toFixed(2)} INR (≈ $${usdVal.toFixed(3)})`; } 
};
    
window.submitWithdrawal = function() {
    const addrInput = document.getElementById('withdraw-address-input'); const amtInput = document.getElementById('withdraw-amount-input'); 
    const address = addrInput.value.trim(); const amount = parseFloat(amtInput.value) || 0;
    
    if (!address || address.length < 4) { window.playSound('error'); return window.showToast("⚠️ Enter valid destination Wallet or UPI ID!", true); }
    if (amount < 100) { window.playSound('error'); return window.showToast("⚠️ Minimum withdrawal is 100 TAX!", true); }
    if (amount > window.state.balance) { window.playSound('error'); return window.showToast("⚠️ Insufficient Pool Wallet balance!", true); }
    
    window.state.balance = Math.max(0, window.state.balance - amount);
    const txRecord = { 
        id: "TX-" + Math.floor(100000 + Math.random() * 900000), 
        method: window.state.withdrawMethod, 
        address: address, 
        amountTax: amount.toFixed(4), 
        payout: document.getElementById('withdraw-estimate-display').textContent, 
        status: "Processing ⏳", 
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    window.state.withdrawHistory.unshift(txRecord);
    if (window.sendWithdrawalToAdmin) window.sendWithdrawalToAdmin(txRecord);
    
    amtInput.value = ''; window.playSound('upgrade'); window.closeWithdrawModal(); window.showToast(`✅ Withdrawn ${amount.toFixed(2)} TAX! Check History.`); 
    if(window.updateAllUI) window.updateAllUI(); window.saveGameState();
};

window.renderWithdrawHistory = function() {
    const list = document.getElementById('withdraw-history-list'); const badge = document.getElementById('withdraw-count-badge'); 
    if (!list || !badge) return; 
    const history = window.state.withdrawHistory || []; badge.textContent = `${history.length} Requests`;
    if (history.length === 0) { list.innerHTML = `<div class="text-center py-5 text-xs text-slate-400">No withdrawals yet. Click Withdraw in Controls to transfer Pool to Wallet!</div>`; return; }
    list.innerHTML = history.map(item => `<div class="bg-slate-900/90 border border-white/10 rounded-xl p-3 flex items-center justify-between"><div><div class="flex items-center gap-1.5"><span class="text-xs font-black text-amber-400">-${item.amountTax} TAX</span><span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-sky-400 font-bold">${item.method}</span></div><div class="text-[10px] text-slate-400 font-mono mt-0.5">${item.id} • ${item.address.slice(0, 12)}...</div></div><div class="text-right"><div class="text-xs font-extrabold text-emerald-400">${item.payout}</div><div class="text-[10px] text-amber-300 font-semibold">${item.status} • ${item.date}</div></div></div>`).join('');
};
