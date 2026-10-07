// js/features/boost.js

window.buyUpgrade = function(type) {
    if (type === 'multitap') { 
        if (window.state.balance < window.state.multitapCost) { window.playSound('error'); return window.showToast("Not enough TAX in Pool Wallet!", true); } 
        window.state.balance -= window.state.multitapCost; window.state.tapPower += 1; window.state.multitapLvl += 1; window.state.multitapCost = Math.floor(window.state.multitapCost * 1.7); window.showToast("👆 Multitap Upgraded!"); 
    }
    else if (type === 'energy') { 
        if (window.state.balance < window.state.energyCost) { window.playSound('error'); return window.showToast("Not enough TAX in Pool Wallet!", true); } 
        window.state.balance -= window.state.energyCost; window.state.maxEnergy += 500; window.state.energy += 500; window.state.energyLvl += 1; window.state.energyCost = Math.floor(window.state.energyCost * 1.7); window.showToast("🔋 Max Energy Upgraded!"); 
    }
    else if (type === 'regen') { 
        if (window.state.balance < window.state.regenCost) { window.playSound('error'); return window.showToast("Not enough TAX in Pool Wallet!", true); } 
        window.state.balance -= window.state.regenCost; window.state.regenRate += 1; window.state.regenLvl += 1; window.state.regenCost = Math.floor(window.state.regenCost * 1.8); window.showToast("⚡ Recharge Speed Upgraded!"); 
    }
    window.playSound('upgrade'); 
    if(window.updateAllUI) window.updateAllUI(); 
    window.saveGameState();
};

window.useFreeRefill = function() { 
    if (window.state.refillsLeft <= 0) { window.playSound('error'); return window.showToast("No free refills left today!", true); } 
    window.state.refillsLeft -= 1; window.state.energy = window.state.maxEnergy; 
    window.playSound('upgrade'); window.showToast("🔋 Energy 100% Refilled!"); 
    if(window.updateAllUI) window.updateAllUI(); 
};

window.activateTurbo = function() { 
    if (window.state.turboActive) return window.showToast("🔥 5x Turbo is already active!"); 
    if (window.state.turbosLeft <= 0) { window.playSound('error'); return window.showToast("No free Turbo boosts left today!", true); } 
    
    window.state.turbosLeft -= 1; window.state.turboActive = true; 
    
    const badge = document.getElementById('turbo-badge');
    if(badge) badge.classList.remove('hidden'); 
    
    const cArea = document.getElementById('coin-touch-area');
    if(cArea) cArea.classList.add('turbo-glow'); 
    
    window.playSound('upgrade'); window.showToast("🔥 5x TURBO MODE ACTIVE FOR 15 SECONDS!"); 
    if(window.updateAllUI) window.updateAllUI(); 
    
    setTimeout(() => { 
        window.state.turboActive = false; 
        if(badge) badge.classList.add('hidden'); 
        if(cArea) cArea.classList.remove('turbo-glow'); 
        if(window.updateTopStatsUI) window.updateTopStatsUI(); 
        window.showToast("Turbo Mode ended."); 
    }, 15000); 
};
