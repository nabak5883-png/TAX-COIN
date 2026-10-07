// js/features/mining.js

window.formatTax = function(num) { return Number(num || 0).toFixed(4); }

window.spawnFloatingTap = function(x, y, text) { 
    const el = document.createElement('div'); 
    el.className = `floating-tap ${window.state.turboActive ? 'text-red-400' : 'text-amber-300'}`; 
    el.textContent = text; 
    el.style.left = `${x - 20}px`; 
    el.style.top = `${y - 30}px`; 
    document.body.appendChild(el); 
    setTimeout(() => el.remove(), 800); 
}

const coinArea = document.getElementById('coin-touch-area');
if (coinArea) {
    coinArea.addEventListener('pointerdown', (e) => {
        // WALLET CONNECTION CHECK
        if (window.requireWalletToMine && (!window.state.walletAddress || !window.state.walletAddress.startsWith("UQ"))) {
            if(window.playSound) window.playSound('error'); 
            if(window.showToast) window.showToast("⚠️ Connect Wallet first to start mining!", true); 
            return;
        }

        const effectivePower = window.state.turboActive ? window.state.tapPower * 5 : window.state.tapPower;
        
        if (window.state.energy < window.state.tapPower && !window.state.turboActive) { 
            if(window.playSound) window.playSound('error'); 
            if(window.showToast) window.showToast("⚡ Low Energy! Tap Free Refill or wait.", true); 
            return; 
        }

        const rect = coinArea.getBoundingClientRect(); 
        const deltaX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2); 
        const deltaY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        coinArea.style.transform = `rotateX(${-deltaY * 18}deg) rotateY(${deltaX * 18}deg) scale(0.95)`; 
        setTimeout(() => { coinArea.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`; }, 100);

        window.state.balance += effectivePower; 
        if (!window.state.turboActive) window.state.energy = Math.max(0, window.state.energy - window.state.tapPower);
        
        if(window.playSound) window.playSound('tap'); 
        if (window.tg && window.tg.HapticFeedback) { try { window.tg.HapticFeedback.impactOccurred('light'); } catch (err) {} }
        
        window.spawnFloatingTap(e.clientX, e.clientY, `+${effectivePower}`); 
        if(window.updateTopStatsUI) window.updateTopStatsUI();
    });
}
