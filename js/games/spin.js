// js/games/spin.js

window.wheelDeg = 0;

window.openSpinModal = function() {
    document.getElementById('spin-modal').classList.remove('hidden'); 
    document.getElementById('spin-modal').classList.add('flex');
    const now = Date.now();
    const desc = document.getElementById('spin-desc');
    
    if (now - window.state.lastFreeSpin >= (12 * 60 * 60 * 1000)) {
        desc.innerHTML = `<span class="text-emerald-400 font-black">🎁 FREE SPIN AVAILABLE (Worth 50 TAX Bet)</span>`;
        window.safeSetText('btn-spin-action', `SPIN FREE!`);
        document.getElementById('btn-spin-action').className = "w-full py-3.5 rounded-xl bg-emerald-500 text-slate-900 font-black tracking-wide shadow-lg shadow-emerald-500/40";
    } else {
        desc.innerHTML = `Cost: <strong class="text-amber-400">25 TAX</strong> | <span class="text-emerald-400 font-bold">1 Free Spin Every 12 Hours!</span>`;
        window.safeSetText('btn-spin-action', `SPIN (25 TAX)`);
        document.getElementById('btn-spin-action').className = "w-full py-3.5 rounded-xl gold-pill-btn text-sm font-black tracking-wide";
    }
};

window.closeSpinModal = function() { 
    document.getElementById('spin-modal').classList.add('hidden'); 
    document.getElementById('spin-modal').classList.remove('flex'); 
};

window.spinWheelNow = function() {
    const btn = document.getElementById('btn-spin-action');
    if(btn.disabled) return;

    const now = Date.now();
    const isFree = (now - window.state.lastFreeSpin >= (12 * 60 * 60 * 1000));
    let bet = 25;

    if (isFree) {
        window.state.lastFreeSpin = now;
        bet = 50; 
        window.showToast("🎁 Using Free Spin (Worth 50 TAX)!");
    } else {
        if (window.state.balance < 25) { window.playSound('error'); return window.showToast("⚠️ Not enough TAX in Pool Wallet!", true); }
        window.state.balance -= 25;
    }

    btn.disabled = true; window.safeSetText('btn-spin-action', "SPINNING...");
    if(window.updateAllUI) window.updateAllUI(); window.saveGameState();

    const multipliers = [0, 0.5, 1, 1.5, 2, 3, 5, 7.5, 10];
    const randomIndex = Math.floor(Math.random() * 9);
    const winMult = multipliers[randomIndex];
    
    const sliceAngle = 360 / 9; 
    const targetRotation = 360 - (randomIndex * sliceAngle + (sliceAngle / 2));
    window.wheelDeg += 1800; 
    const finalDeg = window.wheelDeg + targetRotation;

    document.getElementById('wheel-el').style.transform = `rotate(${finalDeg}deg)`;
    window.playSound('tap');

    setTimeout(() => {
        btn.disabled = false;
        const winAmount = bet * winMult;
        if (winAmount > 0) { 
            window.state.balance += winAmount; window.playSound('upgrade'); 
            window.showToast(`🎰 WON! ${winMult}x Multiplier! +${winAmount.toFixed(4)} TAX!`); 
        } else { 
            window.playSound('error'); window.showToast(`❌ Bad Luck! Landed on 0x.`, true); 
        }
        if(window.updateAllUI) window.updateAllUI(); window.saveGameState(); window.openSpinModal(); 
    }, 4200);
};
