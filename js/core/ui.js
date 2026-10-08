// js/core/ui.js

window.formatTax = function(num) { return Number(num || 0).toFixed(4); };

window.leagues = [
    { name: "Bronze Auditor", min: 0, next: 5000 }, { name: "Silver Inspector", min: 5000, next: 25000 },
    { name: "Gold Commissioner", min: 25000, next: 100000 }, { name: "Platinum Minister", min: 100000, next: 500000 },
    { name: "Diamond Chancellor", min: 500000, next: 2000000 }, { name: "Supreme Tax Boss", min: 2000000, next: 10000000 }
];

window.getRefMessage = function() {
    return `🔥 Join TAX COIN and earn free crypto!\n\n👑 Play games, mine coins, and unlock daily rewards.\n💎 Click my link below to get an instant startup bonus!\n\n👇 Play Now:`;
};

window.copyRefLink = function() { 
    const link = `https://t.me/TaxCoinArcadeBot?start=ref_${window.state.numericUid}`; 
    const fullText = `${window.getRefMessage()}\n${link}`;
    const tempInput = document.createElement('textarea'); tempInput.value = fullText; 
    document.body.appendChild(tempInput); tempInput.select(); document.execCommand('copy'); document.body.removeChild(tempInput); 
    window.playSound('tap'); window.showToast("📋 Professional Message & Link Copied!"); 
};

window.shareRefLink = function() {
    const link = `https://t.me/TaxCoinArcadeBot?start=ref_${window.state.numericUid}`;
    const text = window.getRefMessage();
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`;
    if (window.tg && window.tg.openTelegramLink) { window.tg.openTelegramLink(shareUrl); } else { window.open(shareUrl, '_blank'); }
    window.playSound('tap');
};

window.toggleSound = function() { window.state.soundEnabled = !window.state.soundEnabled; if (window.state.soundEnabled) window.playSound('tap'); window.updateAllUI(); window.saveGameState(); window.showToast(window.state.soundEnabled ? "🔊 Sound Effects ON" : "🔇 Sound Effects Muted"); };

window.switchTab = function(tabName) {
    document.querySelectorAll('.tab-page').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(`tab-${tabName}`); if (target) target.classList.remove('hidden');
    const statsStrip = document.getElementById('top-stats-strip');
    if (statsStrip) { if (tabName === 'profile' || tabName === 'games' || tabName === 'boost' || tabName === 'friends') { statsStrip.classList.add('hidden'); } else { statsStrip.classList.remove('hidden'); } }
    ['mine', 'games', 'tasks', 'boost', 'friends', 'profile'].forEach(t => {
        const btn = document.getElementById(`nav-${t}`); if (!btn) return;
        if (t === 'boost') { btn.className = (t === tabName) ? "nav-btn flex flex-col items-center py-1 rounded-xl text-amber-400 transition" : "nav-btn flex flex-col items-center py-1 rounded-xl text-slate-300 transition"; } 
        else { btn.className = (t === tabName) ? "nav-btn flex flex-col items-center py-1.5 rounded-xl text-amber-400 transition" : "nav-btn flex flex-col items-center py-1.5 rounded-xl text-slate-400 hover:text-white transition"; }
    });
    window.updateAllUI();
};

window.setSkin = function(skinName) { window.state.skin = skinName; window.applySkinColors(skinName); window.saveGameState(); };
window.applySkinColors = function(skinName) { 
    ['gold', 'cyber', 'royal'].forEach(s => { const btn = document.getElementById(`skin-${s}`); if (!btn) return; btn.className = (s === skinName) ? "px-3 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 transition" : "px-3 py-0.5 rounded-full text-[10px] font-bold text-slate-400 hover:text-white transition"; }); 
    const f1 = document.getElementById('stop-face-1'); const f2 = document.getElementById('stop-face-2'); const f3 = document.getElementById('stop-face-3'); if (!f1 || !f2 || !f3) return; 
    if (skinName === 'cyber') { f1.setAttribute('stop-color', '#67e8f9'); f2.setAttribute('stop-color', '#7c3aed'); f3.setAttribute('stop-color', '#1e1b4b'); } 
    else if (skinName === 'royal') { f1.setAttribute('stop-color', '#6ee7b7'); f2.setAttribute('stop-color', '#059669'); f3.setAttribute('stop-color', '#064e3b'); } 
    else { f1.setAttribute('stop-color', '#fde047'); f2.setAttribute('stop-color', '#d97706'); f3.setAttribute('stop-color', '#451a03'); } 
}

// ==========================================
// DYNAMIC TASKS SYSTEM (Admin Controlled)
// ==========================================
window.dynamicTasks = [];

window.renderTasks = async function() {
    const container = document.getElementById('tasks-container'); 
    if (!container) return;

    if (window.dynamicTasks.length === 0) {
        container.innerHTML = `<div class="text-center py-5 text-[11px] text-slate-400">Loading missions... <i class="fa-solid fa-circle-notch fa-spin ml-1 text-amber-500"></i></div>`;
        try {
            const res = await fetch("https://tax-coin-ce652-default-rtdb.asia-southeast1.firebasedatabase.app/tasks.json");
            const data = await res.json();
            window.dynamicTasks = [];
            if(data) {
                for(const key in data) { window.dynamicTasks.push({ id: key, ...data[key] }); }
            }
        } catch(e) { console.log("Task Load Error", e); }
    }

    container.innerHTML = '';
    
    if(window.dynamicTasks.length === 0) {
        container.innerHTML = '<div class="text-center py-6 text-slate-500 text-xs font-bold border border-white/5 rounded-xl bg-slate-900/50">No new missions available right now. Check back later!</div>';
        return;
    }

    window.dynamicTasks.forEach(task => {
        const isDone = !!window.state.completedTasks[task.id];
        const isClicked = !!window.state.completedTasks[task.id + "_clicked"];
        
        let buttonText = task.btnText || "Claim";
        let buttonClass = "gold-pill-btn";
        
        if (isDone) {
            buttonText = "Done ✅";
            buttonClass = "bg-slate-800 text-emerald-400 cursor-not-allowed";
        } else if (task.link && isClicked) {
            buttonText = "Check & Claim";
            buttonClass = "bg-sky-500 text-white shadow-lg shadow-sky-500/30";
        }

        const div = document.createElement('div'); 
        div.className = "glass-card rounded-2xl p-3.5 flex items-center justify-between transition hover:border-white/20";
        div.innerHTML = `
            <div>
                <div class="text-xs font-extrabold text-white">${task.title}</div>
                <div class="text-xs font-bold text-emerald-400 mt-0.5">+${Number(task.reward).toFixed(4)} TAX</div>
            </div>
            <button type="button" onclick="claimTaskReward('${task.id}')" ${isDone ? 'disabled' : ''} class="px-4 py-2 rounded-full text-xs font-extrabold transition ${buttonClass}">
                ${buttonText}
            </button>
        `; 
        container.appendChild(div);
    });
};

window.claimTaskReward = function(taskId) {
    const task = window.dynamicTasks.find(t => t.id === taskId); 
    if (!task || window.state.completedTasks[taskId]) return;
    
    // Check verification requirement
    if (task.reqVerified && !window.state.isVerified) { 
        window.playSound('error'); 
        window.switchTab('profile'); 
        window.openVerifyModal(); 
        return window.showToast("⚠️ Verify your account in Profile first!", true); 
    }

    // Link/Action logic
    if (task.link && !window.state.completedTasks[taskId + "_clicked"]) {
        window.open(task.link, '_blank');
        window.state.completedTasks[taskId + "_clicked"] = true;
        window.saveGameState();
        window.renderTasks(); // update button to "Check & Claim"
        window.playSound('tap');
        return window.showToast("⏳ Please complete the task and return to claim!");
    }

    // Give Reward
    window.state.balance += Number(task.reward);
    window.state.completedTasks[taskId] = true;
    window.playSound('upgrade'); 
    window.showToast(`🎉 Mission Completed! +${task.reward} TAX Added!`);
    window.updateAllUI(); 
    window.cloudSync();
};

// ==========================================
// LEADERBOARD UI 
// ==========================================
window.leaderboardCache = null;
window.isFetchingLeaderboard = false;

window.renderLeaderboard = async function() {
    const list = document.getElementById('leaderboard-list'); 
    if (!list) return;

    if (!window.leaderboardCache && !window.isFetchingLeaderboard) {
        list.innerHTML = `<div class="text-center py-5 text-[11px] text-slate-400">Loading top players from Database... <i class="fa-solid fa-circle-notch fa-spin ml-1 text-amber-500"></i></div>`;
        window.isFetchingLeaderboard = true;
        try {
            const res = await fetch("https://tax-coin-ce652-default-rtdb.asia-southeast1.firebasedatabase.app/users.json");
            const data = await res.json();
            if (data && !data.error) {
                let usersArray = [];
                for (const uid in data) {
                    const u = data[uid];
                    const totalBal = (parseFloat(u.balance) || 0) + (parseFloat(u.holdingBalance) || 0);
                    let uname = u.name || u.firstName || u.username || ("User_" + uid.toString().slice(-4));
                    usersArray.push({ uid: uid, name: uname, balance: totalBal });
                }
                usersArray.sort((a, b) => b.balance - a.balance);
                window.leaderboardCache = usersArray.slice(0, 100); 
            }
        } catch (e) {}
        window.isFetchingLeaderboard = false;
    }

    let playersToShow = [];
    const pName = document.getElementById('player-name')?.textContent || "Tax Collector";

    if (window.leaderboardCache && window.leaderboardCache.length > 0) {
        playersToShow = window.leaderboardCache.map(p => {
            const isMe = String(p.uid) === String(window.state.numericUid);
            const displayName = isMe ? `${pName}` : p.name;
            const initials = displayName.charAt(0).toUpperCase();
            const pic = `https://ui-avatars.com/api/?name=${initials}&background=0f172a&color=fbbf24&size=128&bold=true`;
            return { name: displayName, balance: p.balance, pic: pic, isYou: isMe };
        });
    } else {
        const initials = pName.charAt(0).toUpperCase();
        playersToShow = [{ name: pName, balance: window.state.balance + (window.state.holdingBalance || 0), pic: `https://ui-avatars.com/api/?name=${initials}&background=0f172a&color=fbbf24&size=128&bold=true`, isYou: true }];
    }

    list.innerHTML = playersToShow.map((p, idx) => `
        <div class="flex items-center justify-between py-3 px-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition rounded-xl">
            <div class="flex items-center gap-4">
                <span class="font-black text-amber-500 w-4 text-center text-sm">${idx + 1}</span>
                <img src="${p.pic}" class="w-11 h-11 rounded-full border-[1.5px] border-slate-700 object-cover shadow-md">
                <div>
                    <div class="text-sm font-bold text-white leading-tight">${p.name} ${p.isYou ? '<span class="text-[10px] text-emerald-400 font-normal ml-1">(You)</span>' : ''}</div>
                    <div class="text-[11px] text-slate-400 mt-0.5">Assets Score</div>
                </div>
            </div>
            <div class="text-[15px] font-black text-sky-400">${Number(p.balance || 0).toFixed(0)}</div>
        </div>
    `).join('');
};

window.updateTopStatsUI = function() {
    try {
        const poolBal = window.state.balance || 0; const holdingBal = window.state.holdingBalance || 0; 
        const totalAssets = poolBal + holdingBal; const usdVal = totalAssets * (window.TAX_TO_USD_RATE || 0.00063633);
        
        window.safeSetText('balance-display', window.formatTax(poolBal));
        const effectiveTap = window.state.turboActive ? window.state.tapPower * 5 : window.state.tapPower;
        window.safeSetText('stat-tap', `+${effectiveTap}`); window.safeSetText('stat-usd-val', `≈ $${usdVal.toFixed(3)}`);
        window.safeSetText('energy-display', `${Math.floor(window.state.energy)} / ${window.state.maxEnergy}`); window.safeSetText('regen-rate-display', window.state.regenRate);
        
        const energyBar = document.getElementById('energy-bar'); if(energyBar) energyBar.style.width = `${Math.min(100, (window.state.energy / window.state.maxEnergy) * 100)}%`;
        window.safeSetText('aviator-pool-bal', `${window.formatTax(poolBal)} TAX`); window.safeSetText('mines-pool-bal', `${window.formatTax(poolBal)} TAX`);
        
        let currentLeagueIdx = 0; for (let i = 0; i < window.leagues.length; i++) { if (poolBal >= window.leagues[i].min) currentLeagueIdx = i; }
        const lg = window.leagues[currentLeagueIdx]; 
        if(lg) {
            window.safeSetText('league-name', lg.name); window.safeSetText('league-progress-label', `${lg.name} (${currentLeagueIdx + 1}/${window.leagues.length})`); 
            const pct = Math.min(100, Math.floor((poolBal / lg.next) * 100)); window.safeSetText('league-percent', `${pct}%`); 
            const lgBar = document.getElementById('league-bar'); if(lgBar) lgBar.style.width = `${Math.max(4, pct)}%`;
        }
        
        window.safeSetText('profile-assets-tax', `${window.formatTax(totalAssets)} TAX`); window.safeSetText('profile-assets-usd', `≈ ${usdVal.toFixed(3)}$`);
        window.safeSetText('profile-holding-tax', holdingBal > 0 ? `${window.formatTax(holdingBal)} TAX` : `0 TAX`);
        window.safeSetText('profile-pool-tax', `${window.formatTax(poolBal)} TAX`); window.safeSetText('vip-modal-pool', `${window.formatTax(poolBal)} TAX`);
        window.safeSetText('vip-modal-holding', holdingBal > 0 ? `${window.formatTax(holdingBal)} TAX` : `0 TAX`);
        window.safeSetText('withdraw-avail-bal', `${window.formatTax(poolBal)} TAX`); window.safeSetText('withdraw-live-rate', `$${(1000 * (window.TAX_TO_USD_RATE || 0.00063633)).toFixed(3)}`);

        const wBtnText = document.getElementById('wallet-btn-text'); const walletBtn = document.getElementById('btn-connect-wallet');
        if (wBtnText && walletBtn) {
            if (window.state.walletAddress && window.state.walletAddress.startsWith("UQ")) {
                wBtnText.textContent = window.state.walletAddress.substring(0, 4) + "..." + window.state.walletAddress.substring(window.state.walletAddress.length - 4);
                walletBtn.classList.remove('bg-blue-500', 'hover:bg-blue-400', 'shadow-blue-500/20'); walletBtn.classList.add('bg-slate-800', 'shadow-slate-500/20');
                window.state.isVerified = true; 
            } else {
                wBtnText.textContent = "Connect Wallet";
                walletBtn.classList.add('bg-blue-500', 'hover:bg-blue-400', 'shadow-blue-500/20'); walletBtn.classList.remove('bg-slate-800', 'shadow-slate-500/20');
            }
        }
    } catch(e) { }
};

window.updateAllUI = function() {
    if(window.updateTopStatsUI) window.updateTopStatsUI();
    window.safeSetText('turbo-left', window.state.turbosLeft); window.safeSetText('turbo-left-boost', window.state.turbosLeft); 
    window.safeSetText('refill-left', window.state.refillsLeft); window.safeSetText('refill-left-Quick', window.state.refillsLeft);
    window.safeSetText('multitap-lvl', `Lvl ${window.state.multitapLvl}`); window.safeSetText('multitap-cost-display', `🪙 ${window.state.multitapCost.toLocaleString()} TAX (+1/tap)`); 
    window.safeSetText('energy-lvl', `Lvl ${window.state.energyLvl}`); window.safeSetText('energy-cost-display', `🪙 ${window.state.energyCost.toLocaleString()} TAX (+500 Max)`); 
    window.safeSetText('regen-lvl', `Lvl ${window.state.regenLvl}`); window.safeSetText('regen-cost-display', `🪙 ${window.state.regenCost.toLocaleString()} TAX (+1/sec)`);
    window.safeSetText('invited-count', `${window.state.invitedCount} Friends`); 
    window.safeSetText('profile-uid-text', window.state.numericUid); window.safeSetText('uid-display', `ID: ${window.state.numericUid}`);

    const verifyStatus = document.getElementById('profile-verify-status'); const verifyBtn = document.getElementById('profile-verify-btn'); const miniBadge = document.getElementById('verified-mini-icon');
    if (window.state.isVerified) { 
        if(verifyStatus) { verifyStatus.textContent = "Verified ✅"; verifyStatus.className = "text-xs text-emerald-400 font-bold mt-0.5"; }
        if(verifyBtn) { verifyBtn.textContent = "Verified"; verifyBtn.className = "px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold text-xs"; }
        if (miniBadge) miniBadge.classList.remove('hidden'); 
    } else { 
        if(verifyStatus) { verifyStatus.textContent = "Unverified"; verifyStatus.className = "text-xs text-slate-400 mt-0.5"; }
        if(verifyBtn) { verifyBtn.textContent = "Verify"; verifyBtn.className = "px-5 py-2 rounded-full gold-pill-btn text-xs transition"; }
        if (miniBadge) miniBadge.classList.add('hidden');
    }

    const pSoundStatus = document.getElementById('profile-sound-status'); const pSoundIcon = document.getElementById('profile-sound-icon'); const hSoundIcon = document.getElementById('sound-icon');
    if (pSoundStatus && pSoundIcon) { pSoundStatus.textContent = window.state.soundEnabled ? "On — tap to mute" : "Off — tap to unmute"; pSoundIcon.className = window.state.soundEnabled ? "fa-solid fa-volume-high text-sky-300" : "fa-solid fa-volume-xmark text-slate-500"; }
    if (hSoundIcon) { hSoundIcon.className = window.state.soundEnabled ? "fa-solid fa-volume-high text-[11px] text-amber-400" : "fa-solid fa-volume-xmark text-[11px] text-slate-500"; }

    if (window.applySkinColors) window.applySkinColors(window.state.skin);
    window.renderTasks(); window.renderLeaderboard(); 
    if(window.renderWithdrawHistory) window.renderWithdrawHistory(); 
    if(window.updateWithdrawPreview) window.updateWithdrawPreview();
};

setInterval(() => {
    if (window.state.energy < window.state.maxEnergy) { window.state.energy = Math.min(window.state.maxEnergy, window.state.energy + window.state.regenRate); }
    const now = Date.now();
    if (window.state.holdingBalance > 0) {
        if (!window.state.lastUnlockTime) window.state.lastUnlockTime = now;
        if (now - window.state.lastUnlockTime >= 86400000) {
            const unlockAmt = window.state.holdingBalance * 0.02;
            window.state.holdingBalance -= unlockAmt; window.state.balance += unlockAmt; window.state.lastUnlockTime = now;
            if (window.playSound) window.playSound('upgrade');
            if (window.showToast) window.showToast(`🔓 Daily Unlock: +${unlockAmt.toFixed(4)} TAX moved to Pool Wallet!`);
        }
    }
    if(window.updateTopStatsUI) window.updateTopStatsUI(); window.saveGameState(); 
}, 1000);

document.addEventListener("DOMContentLoaded", () => { setTimeout(() => { window.updateAllUI(); }, 500); });
