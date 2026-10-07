// js/core/state.js

// Safe text setter
window.safeSetText = function(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

// Telegram WebApp Setup
window.tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;
if (window.tg) { try { window.tg.expand(); window.tg.ready(); } catch (e) {} }

// Primary Game State (Data Storage)
window.state = {
    balance: 0,
    holdingBalance: 0,
    tapPower: 1,
    multitapLvl: 1,
    multitapCost: 100,
    maxEnergy: 1000,
    energy: 1000,
    energyLvl: 1,
    energyCost: 150,
    regenRate: 2,
    regenLvl: 1,
    regenCost: 200,
    refillsLeft: 3,
    turbosLeft: 3,
    turboActive: false,
    lastFreeSpin: 0,
    invitedCount: 0,
    walletAddress: "",
    isVerified: false,
    numericUid: "8683090550",
    skin: "gold",
    soundEnabled: true,
    withdrawMethod: "TON",
    withdrawHistory: [],
    completedTasks: {}
};

window.TAX_TO_USD_RATE = 0.00063633;
window.requireWalletToMine = true; // Admin Control

// AUTO-SAVE SYSTEM (Fixed Firebase Quota Overload)
window.saveGameState = function() {
    // 1. Save to local phone storage instantly
    localStorage.setItem('taxCoinSavedState', JSON.stringify(window.state));
}

// 2. Cloud Sync: Send to Firebase safely
window.cloudSync = function() {
    if (window.saveToFirebase) window.saveToFirebase();
}

window.loadGameState = function() {
    const savedData = localStorage.getItem('taxCoinSavedState');
    if (savedData) { 
        try { 
            const parsedData = JSON.parse(savedData); 
            Object.assign(window.state, parsedData); 
        } catch (e) { console.error("Save file error."); } 
    }
}
window.loadGameState();

// Trigger saving before closing the app
window.triggerCloudSave = () => { window.saveGameState(); window.cloudSync(); };
window.addEventListener('beforeunload', window.triggerCloudSave);
window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') window.triggerCloudSave(); });

// Background loop for safe Firebase sync every 15 seconds
setInterval(() => {
    window.cloudSync();
}, 15000);

// SOUND SYSTEM
window.audioCtx = null;
window.playSound = function(type) {
    if (!window.state.soundEnabled) return;
    try {
        if (!window.audioCtx) { const AudioContextClass = window.AudioContext || window.webkitAudioContext; if (AudioContextClass) window.audioCtx = new AudioContextClass(); }
        if (!window.audioCtx) return; if (window.audioCtx.state === 'suspended') window.audioCtx.resume();
        const osc = window.audioCtx.createOscillator(); const gain = window.audioCtx.createGain(); osc.connect(gain); gain.connect(window.audioCtx.destination); const now = window.audioCtx.currentTime;
        if (type === 'tap') { osc.type = 'sine'; osc.frequency.setValueAtTime(540, now); osc.frequency.exponentialRampToValueAtTime(880, now + 0.055); gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06); osc.start(now); osc.stop(now + 0.065); }
        else if (type === 'upgrade') { osc.type = 'triangle'; osc.frequency.setValueAtTime(440, now); osc.frequency.setValueAtTime(880, now + 0.16); gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28); osc.start(now); osc.stop(now + 0.29); }
        else if (type === 'error') { osc.type = 'sawtooth'; osc.frequency.setValueAtTime(190, now); osc.frequency.setValueAtTime(130, now + 0.1); gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18); osc.start(now); osc.stop(now + 0.19); }
    } catch (e) {}
}

// TOAST NOTIFICATIONS
window.toastTimer = null;
window.showToast = function(message, isError = false) {
    const box = document.getElementById('toast-box'); const msgEl = document.getElementById('toast-msg'); const iconEl = document.getElementById('toast-icon');
    if (!box || !msgEl || !iconEl) return; msgEl.textContent = message; iconEl.className = isError ? "fa-solid fa-circle-exclamation text-red-400" : "fa-solid fa-circle-check text-amber-400";
    box.classList.remove('opacity-0', '-translate-y-4'); box.classList.add('opacity-100', 'translate-y-0');
    if (window.toastTimer) clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => { box.classList.add('opacity-0', '-translate-y-4'); box.classList.remove('opacity-100', 'translate-y-0'); }, 2500);
}

// Telegram User Initialization
if (window.tg && window.tg.initDataUnsafe && window.tg.initDataUnsafe.user) {
    if (window.tg.initDataUnsafe.user.first_name) {
        window.safeSetText('player-name', window.tg.initDataUnsafe.user.first_name);
    }
    if (window.tg.initDataUnsafe.user.id) window.state.numericUid = String(window.tg.initDataUnsafe.user.id);
}
