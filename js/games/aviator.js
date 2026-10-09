// js/games/aviator.js

window.aviator = { state: "WAITING", multiplier: 1.00, crashPoint: 2.00, flightStartTime: 0, hasBet: false, betAmount: 25, hasCashedOut: false, cashedOutAt: 0, animFrameId: null, recentMultipliers: [1.85, 1.14, 3.42, 1.08, 6.20, 2.15], particles: [] };

window.resizeAviatorCanvas = function() { 
    const canvas = document.getElementById('aviator-canvas');
    if (!canvas || !canvas.parentElement) return; 
    const rect = canvas.parentElement.getBoundingClientRect(); 
    if (rect.width > 0 && rect.height > 0) { canvas.width = rect.width; canvas.height = rect.height; } 
}
window.addEventListener('resize', window.resizeAviatorCanvas);

window.generateAviatorCrashPoint = function() { const rand = Math.random(); if (rand < 0.04) return 1.00; let point = 0.96 / (1 - rand); return Math.max(1.01, Math.min(100.00, Math.floor(point * 100) / 100)); }

// Check if Admin has forced a crash point
if (window.adminGameControls && window.adminGameControls.aviator && window.adminGameControls.aviator.nextCrash) {
    crashPoint = parseFloat(window.adminGameControls.aviator.nextCrash); // 'crashPoint' এর জায়গায় আপনার গেমের ভেরিয়েবলের নাম দিন
}

window.getSafeJetPosition = function(multiplier, width, height) { 
    const safeW = (isFinite(width) && width > 0) ? width : 320; const safeH = (isFinite(height) && height > 0) ? height : 260; 
    const m = (typeof multiplier === 'number' && isFinite(multiplier)) ? Math.max(1.00, multiplier) : 1.00; 
    const progress = Math.min(1.0, Math.max(0.0, isFinite(Math.log(m) / Math.log(10.0)) ? Math.log(m) / Math.log(10.0) : 0)); 
    const startX = 25; const endX = safeW - 45; const startY = safeH - 30; const endY = 40; 
    const x = startX + (endX - startX) * progress; const y = startY - (startY - endY) * Math.sin((progress * Math.PI) / 2); 
    return { x: isFinite(x) ? Math.max(10, Math.min(safeW, x)) : startX, y: isFinite(y) ? Math.max(10, Math.min(safeH, y)) : startY, startX, startY }; 
}

window.drawJet = function(ctx, x, y, angle) { 
    ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 15; 
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-12, -7); ctx.lineTo(-6, 0); ctx.lineTo(-12, 7); ctx.closePath(); ctx.fill(); 
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-6, -15); ctx.lineTo(-1, -15); ctx.lineTo(5, 0); ctx.lineTo(-1, 15); ctx.lineTo(-6, 15); ctx.closePath(); ctx.fill(); 
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(4, 0, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.restore(); 
}

window.renderAviatorFrame = function() {
    const canvas = document.getElementById('aviator-canvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (!canvas || !ctx) return; 
    const w = canvas.width; const h = canvas.height; ctx.clearRect(0, 0, w, h);
    const pos = window.getSafeJetPosition(Math.max(1.00, Number(window.aviator.multiplier) || 1.00), w, h);
    
    if (window.aviator.state === "FLYING" || window.aviator.state === "CRASHED") {
        if (isFinite(pos.startX) && isFinite(pos.startY) && isFinite(pos.x) && isFinite(pos.y)) { 
            try { 
                const grad = ctx.createLinearGradient(pos.startX, pos.startY, pos.x, pos.y); 
                grad.addColorStop(0, 'rgba(239, 68, 68, 0.05)'); grad.addColorStop(0.6, 'rgba(245, 158, 11, 0.22)'); grad.addColorStop(1, 'rgba(250, 204, 21, 0.45)'); 
                ctx.beginPath(); ctx.moveTo(pos.startX, pos.startY); ctx.quadraticCurveTo(pos.startX + (pos.x - pos.startX) * 0.4, pos.startY, pos.x, pos.y); ctx.lineTo(pos.x, pos.startY); ctx.closePath(); ctx.fillStyle = grad; ctx.fill(); 
            } catch (e) { ctx.fillStyle = 'rgba(245, 158, 11, 0.2)'; } 
            ctx.beginPath(); ctx.moveTo(pos.startX, pos.startY); ctx.quadraticCurveTo(pos.startX + (pos.x - pos.startX) * 0.4, pos.startY, pos.x, pos.y); 
            ctx.strokeStyle = (window.aviator.state === "CRASHED") ? '#ef4444' : '#f59e0b'; ctx.lineWidth = 3.5; ctx.shadowColor = (window.aviator.state === "CRASHED") ? '#ef4444' : '#f59e0b'; ctx.shadowBlur = 10; ctx.stroke(); ctx.shadowBlur = 0; 
        }
        if (window.aviator.state === "FLYING") { 
            window.drawJet(ctx, pos.x, pos.y, -0.32); 
            if (Math.random() > 0.3) window.aviator.particles.push({ x: pos.x - 12, y: pos.y + 4, vx: -1.5 - Math.random(), vy: 0.5 - Math.random(), life: 0.7, size: 2.5 + Math.random() * 3, color: 'rgba(250, 204, 21, 0.6)' }); 
        }
    }
    
    for (let i = window.aviator.particles.length - 1; i >= 0; i--) { 
        const p = window.aviator.particles[i]; p.x += p.vx; p.y += p.vy; p.life -= 0.03; 
        if (p.life <= 0) { window.aviator.particles.splice(i, 1); continue; } 
        ctx.save(); ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill(); ctx.restore(); 
    }
    
    if (window.aviator.state === "FLYING") { 
        const elapsedSec = (performance.now() - window.aviator.flightStartTime) / 1000; 
        window.aviator.multiplier = Math.max(1.00, Math.floor((1.00 + Math.pow(elapsedSec * 0.42, 1.45)) * 100) / 100); 
        const autoToggle = document.getElementById('aviator-auto-toggle'); 
        const autoVal = parseFloat(document.getElementById('aviator-auto-val')?.value) || 2.0; 
        
        if (autoToggle && autoToggle.checked && window.aviator.hasBet && !window.aviator.hasCashedOut && window.aviator.multiplier >= autoVal) window.cashOutAviator(autoVal); 
        if (window.aviator.multiplier >= window.aviator.crashPoint) { window.triggerAviatorCrash(); } else { window.updateAviatorUI(); } 
    }
    window.aviator.animFrameId = requestAnimationFrame(window.renderAviatorFrame);
}

window.triggerAviatorCrash = function() { 
    window.aviator.state = "CRASHED"; window.aviator.multiplier = window.aviator.crashPoint; window.playSound('error'); 
    const canvas = document.getElementById('aviator-canvas');
    const pos = window.getSafeJetPosition(window.aviator.crashPoint, canvas.width, canvas.height); 
    for (let i = 0; i < 24; i++) window.aviator.particles.push({ x: pos.x, y: pos.y, vx: Math.cos(Math.random() * Math.PI * 2) * (1 + Math.random() * 5), vy: Math.sin(Math.random() * Math.PI * 2) * (1 + Math.random() * 5), life: 1.0, size: 3 + Math.random() * 4, color: Math.random() > 0.5 ? '#ef4444' : '#f59e0b' }); 
    window.aviator.recentMultipliers.unshift(window.aviator.crashPoint); if (window.aviator.recentMultipliers.length > 7) window.aviator.recentMultipliers.pop(); window.renderAviatorHistoryPills(); 
    
    document.getElementById('aviator-status-badge').className = "text-xs font-black uppercase tracking-widest text-red-500 mb-1 flex items-center gap-1.5"; 
    window.safeSetText('aviator-status-text', "💥 FLEW AWAY!"); 
    document.getElementById('aviator-multiplier-display').className = "font-cyber font-black text-5xl sm:text-6xl text-red-500 tracking-tight drop-shadow-[0_4px_25px_rgba(239,68,68,0.7)]"; 
    
    const btn = document.getElementById('aviator-action-btn'); 
    if (window.aviator.hasBet && !window.aviator.hasCashedOut) { 
        window.safeSetText('aviator-btn-label', `LOST -${window.aviator.betAmount} TAX`); 
        btn.className = "w-full py-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 text-sm font-black"; 
    } else if (window.aviator.hasCashedOut) { 
        window.safeSetText('aviator-btn-label', `WON +${(window.aviator.betAmount * window.aviator.cashedOutAt).toFixed(2)} TAX!`); 
        btn.className = "w-full py-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-sm font-black"; 
    } else { 
        window.safeSetText('aviator-btn-label', `NEXT ROUND IN 3s...`); 
        btn.className = "w-full py-3.5 rounded-xl bg-slate-800 text-slate-400 text-sm font-bold"; 
    } 
    setTimeout(window.startAviatorWaitingRound, 3500); 
}

window.startAviatorWaitingRound = function() { 
    window.aviator.state = "WAITING"; window.aviator.multiplier = 1.00; window.aviator.hasBet = false; window.aviator.hasCashedOut = false; window.aviator.particles = []; 
    document.getElementById('aviator-status-badge').className = "text-xs font-bold uppercase tracking-widest text-amber-400 mb-1 flex items-center gap-1.5 drop-shadow"; 
    window.safeSetText('aviator-status-text', "⏳ PREPARING FLIGHT..."); 
    document.getElementById('aviator-multiplier-display').className = "font-cyber font-black text-5xl sm:text-6xl text-white tracking-tight drop-shadow-[0_4px_25px_rgba(245,158,11,0.5)]"; 
    window.safeSetText('aviator-multiplier-display', "1.00x"); window.safeSetText('aviator-potential-win', "Win: +0.0000 TAX"); 
    window.updateAviatorActionButton(); setTimeout(() => { if (window.aviator.state === "WAITING") window.startAviatorFlight(); }, 4000); 
}

window.startAviatorFlight = function() { 
    window.aviator.state = "FLYING"; window.aviator.multiplier = 1.00; window.aviator.crashPoint = window.generateAviatorCrashPoint(); window.aviator.flightStartTime = performance.now(); 
    document.getElementById('aviator-status-badge').className = "text-xs font-bold uppercase tracking-widest text-amber-400 mb-1 flex items-center gap-1.5 drop-shadow"; 
    window.safeSetText('aviator-status-text', "FLIGHT IN PROGRESS"); window.updateAviatorActionButton(); 
}

window.updateAviatorUI = function() { 
    window.safeSetText('aviator-multiplier-display', `${window.aviator.multiplier.toFixed(2)}x`); 
    if (window.aviator.hasBet && !window.aviator.hasCashedOut) { 
        window.safeSetText('aviator-potential-win', `Win: +${(window.aviator.betAmount * window.aviator.multiplier).toFixed(4)} TAX`); 
        window.safeSetText('aviator-btn-label', `CASH OUT ${(window.aviator.betAmount * window.aviator.multiplier).toFixed(2)} TAX`); 
    } else { window.safeSetText('aviator-potential-win', `Win: +0.0000 TAX`); } 
}

window.updateAviatorActionButton = function() { 
    const btn = document.getElementById('aviator-action-btn'); 
    const betVal = parseFloat(document.getElementById('aviator-bet-input')?.value) || 25; 
    if (window.aviator.state === "WAITING") { 
        if (window.aviator.hasBet) { 
            btn.className = "w-full py-3.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-sm font-black"; 
            window.safeSetText('aviator-btn-label', `BET PLACED (${window.aviator.betAmount} TAX)`); 
        } else { 
            btn.className = "w-full py-3.5 rounded-xl gold-pill-btn text-sm font-black"; window.safeSetText('aviator-btn-label', `BET ${betVal} TAX`); 
        } 
    } else if (window.aviator.state === "FLYING") { 
        if (window.aviator.hasBet && !window.aviator.hasCashedOut) { 
            btn.className = "w-full py-3.5 rounded-xl aviator-cashout-btn text-sm font-black"; 
            window.safeSetText('aviator-btn-label', `CASH OUT ${(window.aviator.betAmount * window.aviator.multiplier).toFixed(2)} TAX`); 
        } else if (window.aviator.hasCashedOut) { 
            btn.className = "w-full py-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-sm font-black"; 
            window.safeSetText('aviator-btn-label', `CASHED OUT (${(window.aviator.betAmount * window.aviator.cashedOutAt).toFixed(2)} TAX)`); 
        } else { 
            btn.className = "w-full py-3.5 rounded-xl bg-slate-800 text-slate-400 text-sm font-bold cursor-not-allowed"; window.safeSetText('aviator-btn-label', "WAITING FOR NEXT FLIGHT..."); 
        } 
    } 
}

window.handleAviatorAction = function() { 
    if (window.aviator.state === "WAITING") { 
        if (window.aviator.hasBet) { 
            window.state.balance += window.aviator.betAmount; window.aviator.hasBet = false; window.showToast("↩️ Bet Cancelled & refunded to Pool."); window.updateAviatorActionButton(); window.updateTopStatsUI(); 
        } else { 
            const betVal = parseFloat(document.getElementById('aviator-bet-input')?.value) || 25; 
            if (betVal <= 0) return window.showToast("Enter a valid bet amount!", true); 
            if (betVal > window.state.balance) { window.playSound('error'); return window.showToast("Insufficient Pool Wallet balance!", true); } 
            window.state.balance -= betVal; window.aviator.hasBet = true; window.aviator.betAmount = betVal; window.playSound('tap'); window.showToast(`✈️ Bet ${betVal} TAX placed for next flight!`); window.updateAviatorActionButton(); window.updateTopStatsUI(); window.saveGameState(); 
        } 
    } else if (window.aviator.state === "FLYING") { 
        if (window.aviator.hasBet && !window.aviator.hasCashedOut) window.cashOutAviator(window.aviator.multiplier); 
    } 
};

window.cashOutAviator = function(multiplierLocked) { 
    if (!window.aviator.hasBet || window.aviator.hasCashedOut) return; 
    window.aviator.hasCashedOut = true; window.aviator.cashedOutAt = multiplierLocked; 
    const winTotal = window.aviator.betAmount * multiplierLocked; window.state.balance += winTotal; 
    window.playSound('upgrade'); window.showToast(`🎉 CASHOUT! Won +${winTotal.toFixed(4)} TAX (${multiplierLocked.toFixed(2)}x)!`); 
    window.updateAviatorActionButton(); window.updateTopStatsUI(); window.saveGameState(); 
}

window.halveAviatorBet = function() { const inp = document.getElementById('aviator-bet-input'); const cur = parseFloat(inp.value) || 25; inp.value = Math.max(1, Math.floor(cur / 2)); window.updateAviatorActionButton(); };
window.doubleAviatorBet = function() { const inp = document.getElementById('aviator-bet-input'); const cur = parseFloat(inp.value) || 25; inp.value = Math.min(Math.floor(window.state.balance), Math.max(1, cur * 2)); window.updateAviatorActionButton(); };
window.setAviatorBet = function(amt) { document.getElementById('aviator-bet-input').value = amt; window.updateAviatorActionButton(); };
window.setAviatorBetMax = function() { document.getElementById('aviator-bet-input').value = Math.max(1, Math.floor(window.state.balance)); window.updateAviatorActionButton(); };

window.renderAviatorHistoryPills = function() { 
    window.safeSetText('aviator-history-bar', ''); 
    document.getElementById('aviator-history-bar').innerHTML = window.aviator.recentMultipliers.map(m => { 
        const val = Number(m).toFixed(2); let colorClass = m >= 3.0 ? "bg-purple-950/80 border-purple-400/40 text-purple-400" : (m >= 2.0 ? "bg-emerald-950/80 border-emerald-400/40 text-emerald-400" : "bg-sky-950/80 border-sky-400/40 text-sky-400"); return `<span class="px-2.5 py-1 rounded-lg text-xs font-black border ${colorClass}">${val}x</span>`; 
    }).join(''); 
}

window.openAviatorModal = function() { 
    document.getElementById('aviator-modal').classList.remove('hidden'); document.getElementById('aviator-modal').classList.add('flex'); 
    window.safeSetText('aviator-pool-bal', `${window.formatTax(window.state.balance)} TAX`); window.renderAviatorHistoryPills(); 
    setTimeout(() => { window.resizeAviatorCanvas(); if (!window.aviator.animFrameId) { window.startAviatorWaitingRound(); window.renderAviatorFrame(); } }, 50); 
};
window.closeAviatorModal = function() { document.getElementById('aviator-modal').classList.add('hidden'); document.getElementById('aviator-modal').classList.remove('flex'); if(window.updateTopStatsUI) window.updateTopStatsUI(); };
