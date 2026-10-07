// js/games/coinflip.js

window.coinFlipState = { choice: 'heads', isFlipping: false };

window.openCoinFlipModal = function() { 
    document.getElementById('coinflip-modal').classList.remove('hidden'); 
    document.getElementById('coinflip-modal').classList.add('flex'); 
    window.updateFlipWinPreview(); 
};
window.closeCoinFlipModal = function() { 
    document.getElementById('coinflip-modal').classList.add('hidden'); 
    document.getElementById('coinflip-modal').classList.remove('flex'); 
    if(window.updateTopStatsUI) window.updateTopStatsUI(); 
};

window.setCoinFlipChoice = function(choice) { 
    if (window.coinFlipState.isFlipping) return; 
    window.coinFlipState.choice = choice; window.playSound('tap'); 
    document.getElementById('flip-choice-heads').className = choice === 'heads' ? "py-2.5 rounded-xl border border-amber-400 bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center gap-1.5 transition" : "py-2.5 rounded-xl border border-white/10 bg-slate-900 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"; 
    document.getElementById('flip-choice-tails').className = choice === 'tails' ? "py-2.5 rounded-xl border border-cyan-400 bg-cyan-500/20 text-cyan-300 font-black text-xs flex items-center justify-center gap-1.5 transition" : "py-2.5 rounded-xl border border-white/10 bg-slate-900 text-slate-400 font-bold text-xs flex items-center justify-center gap-1.5 transition"; 
};

window.setFlipBet = function(amt) { document.getElementById('flip-bet-input').value = amt; window.updateFlipWinPreview(); };
window.setFlipBetMax = function() { document.getElementById('flip-bet-input').value = Math.max(1, Math.floor(window.state.balance)); window.updateFlipWinPreview(); };

window.updateFlipWinPreview = function() { 
    const betVal = parseFloat(document.getElementById('flip-bet-input')?.value) || 25; 
    window.safeSetText('flip-win-preview', `${(betVal * 1.95).toFixed(2)} TAX`); 
    if (!window.coinFlipState.isFlipping) window.safeSetText('flip-btn-label', `FLIP COIN (${betVal} TAX)`); 
};

window.flipCoinNow = function() { 
    if (window.coinFlipState.isFlipping) return; 
    const betVal = parseFloat(document.getElementById('flip-bet-input')?.value) || 25; 
    if (betVal <= 0) return window.showToast("Enter a valid bet amount!", true); 
    if (betVal > window.state.balance) { window.playSound('error'); return window.showToast("Insufficient Pool Wallet balance!", true); } 
    
    window.state.balance -= betVal; window.coinFlipState.isFlipping = true; 
    if(window.updateTopStatsUI) window.updateTopStatsUI(); window.saveGameState(); 
    
    const actionBtn = document.getElementById('flip-action-btn'); actionBtn.disabled = true; 
    window.safeSetText('flip-btn-label', "FLIPPING..."); window.playSound('tap'); 
    
    const visual = document.getElementById('flip-coin-visual'); visual.style.transform = "rotateY(1800deg) scale(1.15)"; 
    
    setTimeout(() => { 
        const outcome = Math.random() < 0.5 ? 'heads' : 'tails'; 
        visual.style.transform = "rotateY(0deg) scale(1)"; 
        if (outcome === 'heads') { window.safeSetText('flip-coin-symbol', "TAX"); window.safeSetText('flip-coin-sub', "HEADS"); } 
        else { window.safeSetText('flip-coin-symbol', "🛡️"); window.safeSetText('flip-coin-sub', "TAILS"); } 
        
        if (outcome === window.coinFlipState.choice) { 
            const winTotal = betVal * 1.95; window.state.balance += winTotal; window.playSound('upgrade'); 
            window.showToast(`🎉 WON! ${outcome.toUpperCase()}! +${winTotal.toFixed(4)} TAX!`); 
        } else { 
            window.playSound('error'); window.showToast(`❌ Lost ${betVal} TAX! Result was ${outcome.toUpperCase()}`, true); 
        } 
        
        window.coinFlipState.isFlipping = false; actionBtn.disabled = false; 
        window.updateFlipWinPreview(); if(window.updateTopStatsUI) window.updateTopStatsUI(); window.saveGameState(); 
    }, 1200); 
};
