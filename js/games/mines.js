// js/games/mines.js

window.mines = { active: false, betAmount: 25, mineCount: 3, grid: Array(25).fill(false), revealed: Array(25).fill(false), gemsFound: 0, currentMultiplier: 1.00, nextMultiplier: 1.10 };

window.calculateMinesMultiplier = function(mineCount, gemsFound) { 
    if (gemsFound <= 0) return 1.00; const totalTiles = 25; const safeTiles = totalTiles - mineCount; if (gemsFound > safeTiles) return 1.00; 
    let prob = 1.0; for (let i = 0; i < gemsFound; i++) prob *= (safeTiles - i) / (totalTiles - i); 
    return prob <= 0 ? 1.00 : Math.max(1.01, Math.floor((0.97 / prob) * 100) / 100); 
}

window.initMinesGrid = function() { 
    const container = document.getElementById('mines-grid'); container.innerHTML = ''; 
    for (let i = 0; i < 25; i++) { 
        const btn = document.createElement('button'); btn.type = 'button'; btn.id = `mines-tile-${i}`; 
        btn.onclick = () => window.onMinesTileClicked(i); 
        btn.className = "mines-tile w-full aspect-square rounded-xl bg-slate-800/90 border border-white/10 hover:border-emerald-400/50 flex items-center justify-center text-lg font-black text-slate-300 shadow-md"; 
        btn.innerHTML = `<span class="tile-icon text-slate-600 text-xs"><i class="fa-solid fa-cube"></i></span>`; 
        container.appendChild(btn); 
    } 
}

window.openMinesModal = function() { 
    document.getElementById('mines-modal').classList.remove('hidden'); document.getElementById('mines-modal').classList.add('flex'); 
    window.safeSetText('mines-pool-bal', `${window.formatTax(window.state.balance)} TAX`); window.initMinesGrid(); window.updateMinesUI(); 
};
window.closeMinesModal = function() { document.getElementById('mines-modal').classList.add('hidden'); document.getElementById('mines-modal').classList.remove('flex'); if(window.updateTopStatsUI) window.updateTopStatsUI(); };

window.changeMinesCount = function() { if (!window.mines.active) { window.mines.mineCount = parseInt(document.getElementById('mines-count-select').value) || 3; window.updateMinesUI(); } };
window.setMinesBet = function(val) { if (!window.mines.active) { document.getElementById('mines-bet-input').value = val; window.updateMinesUI(); } };
window.setMinesBetMax = function() { if (!window.mines.active) { document.getElementById('mines-bet-input').value = Math.max(1, Math.floor(window.state.balance)); window.updateMinesUI(); } };
window.halveMinesBet = function() { if (!window.mines.active) { const cur = parseFloat(document.getElementById('mines-bet-input').value) || 25; document.getElementById('mines-bet-input').value = Math.max(1, Math.floor(cur / 2)); window.updateMinesUI(); } };
window.doubleMinesBet = function() { if (!window.mines.active) { const cur = parseFloat(document.getElementById('mines-bet-input').value) || 25; document.getElementById('mines-bet-input').value = Math.min(Math.floor(window.state.balance), Math.max(1, cur * 2)); window.updateMinesUI(); } };

window.handleMinesAction = function() {
    if (!window.mines.active) {
        const betVal = parseFloat(document.getElementById('mines-bet-input')?.value) || 25;
        if (betVal <= 0) return window.showToast("Enter a valid bet amount!", true); 
        if (betVal > window.state.balance) { window.playSound('error'); return window.showToast("Insufficient Pool Wallet balance!", true); }
        
        window.state.balance -= betVal; window.mines.active = true; window.mines.betAmount = betVal; window.mines.gemsFound = 0; 
        window.mines.revealed = Array(25).fill(false); window.mines.grid = Array(25).fill(false);
        
        let placed = 0; 
        while (placed < window.mines.mineCount) { 
            const randIdx = Math.floor(Math.random() * 25); 
            if (!window.mines.grid[randIdx]) { window.mines.grid[randIdx] = true; placed++; } 
        }
        
        window.playSound('tap'); window.showToast(`💣 Game Started with ${window.mines.mineCount} Mines! Find the gems!`); 
        document.getElementById('mines-bet-input').disabled = true; document.getElementById('mines-count-select').disabled = true;
        window.initMinesGrid(); window.updateMinesUI(); if(window.updateTopStatsUI) window.updateTopStatsUI(); window.saveGameState();
    } else { window.cashOutMines(); }
};

window.onMinesTileClicked = function(idx) {
    if (!window.mines.active || window.mines.revealed[idx]) return;
    window.mines.revealed[idx] = true; const tileBtn = document.getElementById(`mines-tile-${idx}`);
    
    if (window.mines.grid[idx]) { 
        tileBtn.className = "mines-tile revealed-bomb w-full aspect-square rounded-xl border flex items-center justify-center text-xl text-white"; 
        tileBtn.innerHTML = `<i class="fa-solid fa-bomb text-red-100"></i>`; window.playSound('error'); window.triggerMinesGameOver(idx); 
    } else {
        window.mines.gemsFound++; 
        tileBtn.className = "mines-tile revealed-gem w-full aspect-square rounded-xl border flex items-center justify-center text-xl text-emerald-200"; 
        tileBtn.innerHTML = `<i class="fa-solid fa-gem text-emerald-300"></i>`; window.playSound('tap');
        if (window.mines.gemsFound >= (25 - window.mines.mineCount)) window.cashOutMines(true); else window.updateMinesUI();
    }
}

window.cashOutMines = function(allCleared = false) { 
    if (!window.mines.active || window.mines.gemsFound === 0) return; 
    const winTotal = window.mines.betAmount * window.mines.currentMultiplier; window.state.balance += winTotal; window.playSound('upgrade'); 
    window.showToast(allCleared ? `🏆 ALL GEMS CLEARED! Jackpot +${winTotal.toFixed(4)} TAX!` : `🎉 CASHOUT! Won +${winTotal.toFixed(4)} TAX (${window.mines.currentMultiplier.toFixed(2)}x)!`); 
    
    for (let i = 0; i < 25; i++) { 
        const btn = document.getElementById(`mines-tile-${i}`); 
        if (btn) { 
            btn.disabled = true; 
            if (!window.mines.revealed[i]) { 
                if (window.mines.grid[i]) { 
                    btn.className = "mines-tile w-full aspect-square rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-center text-base text-red-400 opacity-80"; 
                    btn.innerHTML = `<i class="fa-solid fa-bomb text-red-400"></i>`; 
                } else { 
                    btn.className = "mines-tile w-full aspect-square rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center text-sm text-emerald-500 opacity-60"; 
                    btn.innerHTML = `<i class="fa-solid fa-gem text-emerald-600"></i>`; 
                } 
            } 
        } 
    } 
    window.mines.active = false; document.getElementById('mines-bet-input').disabled = false; document.getElementById('mines-count-select').disabled = false; 
    window.updateMinesUI(); if(window.updateTopStatsUI) window.updateTopStatsUI(); window.saveGameState(); 
}

window.triggerMinesGameOver = function(hitIndex) { 
    window.mines.active = false; window.showToast(`💥 BOOM! Hit a mine. Lost ${window.mines.betAmount} TAX`, true); 
    for (let i = 0; i < 25; i++) { 
        const btn = document.getElementById(`mines-tile-${i}`); 
        if (btn) { 
            btn.disabled = true; 
            if (!window.mines.revealed[i]) { 
                if (window.mines.grid[i]) { 
                    btn.className = "mines-tile w-full aspect-square rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-center text-base text-red-400 opacity-80"; 
                    btn.innerHTML = `<i class="fa-solid fa-bomb text-red-400"></i>`; 
                } else { 
                    btn.className = "mines-tile w-full aspect-square rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-center text-sm text-emerald-500 opacity-60"; 
                    btn.innerHTML = `<i class="fa-solid fa-gem text-emerald-600"></i>`; 
                } 
            } 
        } 
    } 
    document.getElementById('mines-bet-input').disabled = false; document.getElementById('mines-count-select').disabled = false; 
    window.updateMinesUI(); if(window.updateTopStatsUI) window.updateTopStatsUI(); window.saveGameState(); 
}

window.updateMinesUI = function() { 
    window.mines.currentMultiplier = window.calculateMinesMultiplier(window.mines.mineCount, window.mines.gemsFound); 
    window.mines.nextMultiplier = window.calculateMinesMultiplier(window.mines.mineCount, window.mines.gemsFound + 1); 
    window.safeSetText('mines-gems-count', `${window.mines.gemsFound} / ${25 - window.mines.mineCount}`); 
    window.safeSetText('mines-current-mult', `${window.mines.currentMultiplier.toFixed(2)}x`); 
    window.safeSetText('mines-next-mult', `${window.mines.nextMultiplier.toFixed(2)}x`); 
    window.safeSetText('mines-pool-bal', `${window.formatTax(window.state.balance)} TAX`); 
    
    const btn = document.getElementById('mines-action-btn'); 
    if (window.mines.active) { 
        if (window.mines.gemsFound > 0) { 
            btn.className = "w-full py-3.5 rounded-xl aviator-cashout-btn text-sm font-black tracking-wide flex items-center justify-center gap-2 transition"; 
            document.getElementById('mines-btn-label').innerHTML = `CASH OUT <span class="text-slate-900">${(window.mines.betAmount * window.mines.currentMultiplier).toFixed(2)} TAX</span> (${window.mines.currentMultiplier.toFixed(2)}x)`; 
        } else { 
            btn.className = "w-full py-3.5 rounded-xl bg-slate-800 text-slate-400 text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed"; 
            window.safeSetText('mines-btn-label', `PICK A TILE (0 / ${25 - window.mines.mineCount})`); 
        } 
    } else { 
        btn.className = "w-full py-3.5 rounded-xl gold-pill-btn text-sm font-black tracking-wide flex items-center justify-center gap-2 transition"; 
        window.safeSetText('mines-btn-label', `START GAME (${parseFloat(document.getElementById('mines-bet-input')?.value) || 25} TAX)`); 
    } 
}
