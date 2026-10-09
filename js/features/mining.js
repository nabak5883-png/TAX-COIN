window.spawnFloatingTap = function(x, y, text) { 
    const el = document.createElement('div'); 
    el.className = `floating-tap ${window.state.turboActive ? 'text-red-400' : 'text-amber-300'}`; 
    el.textContent = text; el.style.left = `${x - 20}px`; el.style.top = `${y - 30}px`; 
    document.body.appendChild(el); setTimeout(() => el.remove(), 800); 
}

document.addEventListener("DOMContentLoaded", () => {
    const coinArea = document.getElementById('coin-touch-area');
    if (coinArea) {
        coinArea.addEventListener('pointerdown', (e) => {
        
        // 1000 Taps Lock System & Energy Check
        if (window.state.energy <= 0) {
            if (window.showToast) window.showToast("⏳ Energy depleted! Wait for the cooldown.", true);
            if (window.playSound) window.playSound('error');
            return; 
        }
        window.state.energy -= 1; // প্রতি ট্যাপে ১ করে এনার্জি কমবে

        if (window.requireWalletToMine && (!window.state.walletAddress || !window.state.walletAddress.startsWith("UQ"))) {
            if(window.playSound) window.playSound('error');
            if(window.showToast) window.showToast("⚠️ Connect Wallet first to start mining!", true); return;
        }

        const effectivePower = window.state.turboActive ? window.state.tapPower * 5 : window.state.tapPower;
        if (window.state.energy < window.state.tapPower && !window.state.turboActive) {
            if(window.playSound) window.playSound('error');
            if(window.showToast) window.showToast("⚡ Not enough energy!", true); return;
        }

            const rect = coinArea.getBoundingClientRect(); 
            const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches.length > 0 ? e.touches[0].clientX : rect.left + rect.width / 2);
            const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches.length > 0 ? e.touches[0].clientY : rect.top + rect.height / 2);
            
            const deltaX = (clientX - (rect.left + rect.width / 2)) / (rect.width / 2); const deltaY = (clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
            coinArea.style.transform = `rotateX(${-deltaY * 18}deg) rotateY(${deltaX * 18}deg) scale(0.95)`; 
            setTimeout(() => { coinArea.style.transform = `rotateX(0deg) rotateY(0deg) scale(1)`; }, 100);

            window.state.balance += effectivePower; 
            if (!window.state.turboActive) window.state.energy = Math.max(0, window.state.energy - window.state.tapPower);
            
            if(window.playSound) window.playSound('tap'); 
            if (window.tg && window.tg.HapticFeedback) { try { window.tg.HapticFeedback.impactOccurred('light'); } catch (err) {} }
            
            window.spawnFloatingTap(clientX, clientY, `+${effectivePower}`); 
            if(window.updateTopStatsUI) window.updateTopStatsUI();
            if(window.saveGameState) window.saveGameState();
        });
    }
});
