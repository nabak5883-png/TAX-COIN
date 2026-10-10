// js/games/aviator.js

window.aviator = { state: "WAITING", multiplier: 1.00, crashPoint: 2.00, flightStartTime: 0, hasBet: false, betAmount: 50, hasCashedOut: false, cashedOutAt: 0, animFrameId: null, recentMultipliers: [1.32, 2.15, 1.08, 3.42, 1.77, 8.56, 1.26], particles: [], fakeBets: [] };
        
        window.resizeAviatorCanvas = function() { 
            const canvas = document.getElementById('aviator-canvas'); 
            if (!canvas) return; 
            const rect = canvas.parentElement.getBoundingClientRect(); 
            canvas.width = rect.width; canvas.height = rect.height; 
        };
        window.addEventListener('resize', window.resizeAviatorCanvas);

        window.generateFakeBets = function() {
            window.aviator.fakeBets = [];
            const names = ['Guest_7612', 'LuckyMan', 'StarGirl', 'Rider88', 'CryptoKing', 'MoonBoy', 'Whale99', 'GamerX'];
            const avatars = ['emerald', 'blue', 'pink', 'amber', 'purple', 'sky', 'rose', 'indigo'];
            const bets = [10, 20, 50, 100, 250, 500];
            
            for(let i=0; i<12; i++) {
                window.aviator.fakeBets.push({
                    name: names[Math.floor(Math.random()*names.length)],
                    avatar: avatars[Math.floor(Math.random()*avatars.length)],
                    bet: bets[Math.floor(Math.random()*bets.length)],
                    cashOutAt: (Math.random() < 0.65) ? (1.05 + Math.random() * 4) : 0, 
                    cashedOut: false,
                    payout: 0
                });
            }
            window.renderFakeBets();
        };

        window.renderFakeBets = function() {
            const tbody = document.getElementById('aviator-live-table');
            if(!tbody) return;
            let html = '';
            window.aviator.fakeBets.forEach(fb => {
                let statusColor = "text-slate-500";
                let multText = "-";
                let payoutText = "-";
                
                if (fb.cashedOut) {
                    statusColor = "text-emerald-400";
                    multText = fb.cashOutAt.toFixed(2) + "x";
                    payoutText = fb.payout.toFixed(2);
                } else if (window.aviator.state === "CRASHED") {
                    statusColor = "text-rose-500";
                    multText = "Crashed";
                    payoutText = "0.00";
                }

                html += `
                <div class="grid grid-cols-4 sm:grid-cols-5 items-center bg-[#171e28] rounded-lg px-2 py-1.5 hover:bg-[#1a232f] transition">
                    <div class="col-span-2 sm:col-span-2 flex items-center gap-2">
                        <div class="w-5 h-5 rounded-full bg-${fb.avatar}-500/20 text-${fb.avatar}-400 flex items-center justify-center text-[10px]"><i class="fa-solid fa-user"></i></div>
                        <span class="text-[11px] text-slate-300 font-medium truncate">${fb.name}</span>
                    </div>
                    <div class="text-right text-[11px] text-white font-mono">${fb.bet.toFixed(2)}</div>
                    <div class="text-right text-[11px] font-bold ${statusColor}">${multText}</div>
                    <div class="text-right text-[11px] font-bold ${statusColor} hidden sm:block">${payoutText}</div>
                </div>`;
            });
            tbody.innerHTML = html;
        };

        window.getSafeJetPosition = function(multiplier, width, height) { 
            const m = Math.max(1.00, multiplier); 
            const progress = Math.min(1.0, Math.max(0.0, Math.log(m) / Math.log(5.0))); 
            const startX = 10; const endX = width - 40; const startY = height - 10; const endY = 40; 
            const x = startX + (endX - startX) * progress; 
            const y = startY - (startY - endY) * Math.sin((progress * Math.PI) / 2); 
            return { x, y, startX, startY }; 
        };

        window.drawGrid = function(ctx, w, h) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for(let i=1; i<5; i++) {
                let y = h - (h/5)*i;
                ctx.moveTo(0, y); ctx.lineTo(w, y);
            }
            for(let i=1; i<6; i++) {
                let x = (w/6)*i;
                ctx.moveTo(x, 0); ctx.lineTo(x, h);
            }
            ctx.stroke();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = '9px Arial';
            ctx.fillText('1.0x', 5, h-5); ctx.fillText('2.0x', 5, h - h/2.5); ctx.fillText('5.0x', 5, 15);
            ctx.fillText('0s', 15, h-5); ctx.fillText('5s', w/2, h-5); ctx.fillText('10s', w-20, h-5);
        };

        window.renderAviatorFrame = function() { 
            const canvas = document.getElementById('aviator-canvas'); 
            const ctx = canvas ? canvas.getContext('2d') : null; 
            if (!canvas || !ctx) return; 
            const w = canvas.width; const h = canvas.height; 
            ctx.clearRect(0, 0, w, h); 
            window.drawGrid(ctx, w, h);

            const pos = window.getSafeJetPosition(Math.max(1.00, window.aviator.multiplier), w, h); 
            
            if (window.aviator.state === "FLYING" || window.aviator.state === "CRASHED") { 
                ctx.beginPath(); ctx.moveTo(pos.startX, pos.startY); 
                ctx.quadraticCurveTo(pos.startX + (pos.x - pos.startX) * 0.5, pos.startY, pos.x, pos.y); 
                ctx.strokeStyle = (window.aviator.state === "CRASHED") ? '#ef4444' : '#e11d48'; 
                ctx.lineWidth = 4; ctx.shadowColor = (window.aviator.state === "CRASHED") ? '#ef4444' : '#e11d48'; ctx.shadowBlur = 15; 
                ctx.stroke(); ctx.shadowBlur = 0; 
                
                ctx.lineTo(pos.x, h); ctx.lineTo(pos.startX, h); ctx.closePath();
                const grad = ctx.createLinearGradient(0, h, 0, pos.y);
                grad.addColorStop(0, 'rgba(225, 29, 72, 0.0)'); grad.addColorStop(1, 'rgba(225, 29, 72, 0.3)');
                ctx.fillStyle = grad; ctx.fill();

                if (window.aviator.state === "FLYING") { 
                    ctx.save(); ctx.translate(pos.x, pos.y); ctx.rotate(-0.35);
                    ctx.fillStyle = '#e11d48'; ctx.shadowColor = '#e11d48'; ctx.shadowBlur = 10;
                    ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(-10, -8); ctx.lineTo(-5, 0); ctx.lineTo(-10, 8); ctx.fill();
                    ctx.restore();
                }
            }
            
            if (window.aviator.state === "FLYING") { 
                const elapsedSec = (performance.now() - window.aviator.flightStartTime) / 1000; 
                window.aviator.multiplier = Math.max(1.00, Math.floor((1.00 + Math.pow(elapsedSec * 0.42, 1.45)) * 100) / 100); 
                
                const autoToggle = document.getElementById('aviator-auto-toggle'); 
                const autoVal = parseFloat(document.getElementById('aviator-auto-val').value) || 2.0; 
                if (autoToggle && autoToggle.checked && window.aviator.hasBet && !window.aviator.hasCashedOut && window.aviator.multiplier >= autoVal) {
                    window.forceCashout(autoVal); 
                }

                let tableNeedsUpdate = false;
                window.aviator.fakeBets.forEach(fb => {
                    if(!fb.cashedOut && fb.cashOutAt > 0 && window.aviator.multiplier >= fb.cashOutAt) {
                        fb.cashedOut = true; fb.payout = fb.bet * fb.cashOutAt; tableNeedsUpdate = true;
                    }
                });
                if(tableNeedsUpdate) window.renderFakeBets();

                if (window.aviator.multiplier >= window.aviator.crashPoint) { window.triggerAviatorCrash(); } 
                else { window.updateAviatorUI(); } 
            } 
            window.aviator.animFrameId = requestAnimationFrame(window.renderAviatorFrame); 
        };

        window.triggerAviatorCrash = function() { 
            window.aviator.state = "CRASHED"; window.aviator.multiplier = window.aviator.crashPoint; 
            if(window.playSound) window.playSound('error'); 
            
            window.aviator.recentMultipliers.unshift(window.aviator.crashPoint); 
            if (window.aviator.recentMultipliers.length > 7) window.aviator.recentMultipliers.pop(); 
            window.renderAviatorHistoryPills(); 
            window.renderFakeBets();

            document.getElementById('aviator-multiplier-display').className = "font-bold text-7xl text-rose-500 tracking-tighter drop-shadow-[0_2px_15px_rgba(225,29,72,0.8)]"; 
            document.getElementById('aviator-status-text').innerText = "💥 FLEW AWAY!";
            
            const betBtn = document.getElementById('aviator-action-btn'); 
            const cashBtn = document.getElementById('aviator-cashout-btn');
            cashBtn.className = "w-full py-4 rounded-xl bg-slate-800 text-slate-500 font-black text-lg uppercase shadow-none opacity-50 cursor-not-allowed flex items-center justify-center gap-2";

            if (window.aviator.hasBet && !window.aviator.hasCashedOut) { 
                betBtn.className = "w-full py-4 rounded-xl bg-rose-900/80 border border-rose-500/50 text-rose-400 text-lg font-black transition"; 
                document.getElementById('aviator-btn-label').innerText = `LOST`; 
            } else { 
                betBtn.className = "w-full py-4 rounded-xl bg-slate-800 text-slate-400 text-lg font-black transition cursor-not-allowed"; 
                document.getElementById('aviator-btn-label').innerText = `NEXT ROUND...`; 
            } 
            setTimeout(window.startAviatorWaitingRound, 3500); 
        };

        window.startAviatorWaitingRound = function() { 
            window.aviator.state = "WAITING"; window.aviator.multiplier = 1.00; window.aviator.hasBet = false; window.aviator.hasCashedOut = false; 
            
            document.getElementById('aviator-multiplier-display').className = "font-bold text-7xl text-white tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"; 
            document.getElementById('aviator-multiplier-display').innerText = "1.00x"; 
            document.getElementById('aviator-status-text').innerText = "⏳ WAITING...";
            document.getElementById('aviator-round-id').innerText = "ROUND #" + Math.floor(1000 + Math.random()*9000);
            document.getElementById('aviator-live-players').innerText = Math.floor(150 + Math.random()*200);

            window.generateFakeBets();
            window.updateAviatorUI(); 
            window.updateAviatorActionButton(); 
            setTimeout(() => { if (window.aviator.state === "WAITING") window.startAviatorFlight(); }, 4000); 
        };

        window.startAviatorFlight = function() { 
            window.aviator.state = "FLYING"; window.aviator.multiplier = 1.00; 
            const rand = Math.random(); 
            window.aviator.crashPoint = rand < 0.05 ? 1.00 : Math.max(1.01, Math.min(100.00, Math.floor((0.96 / (1 - rand)) * 100) / 100)); 
            
            window.aviator.flightStartTime = performance.now();
            document.getElementById('aviator-status-text').innerText = "FLIGHT IN PROGRESS";
            window.updateAviatorActionButton(); 
        };

        window.updateAviatorUI = function() { 
            document.getElementById('aviator-multiplier-display').innerText = `${window.aviator.multiplier.toFixed(2)}x`; 
            const betAmt = parseFloat(document.getElementById('aviator-bet-input').value) || 0;
            document.getElementById('stat-curr-bet').innerText = (window.aviator.hasBet ? window.aviator.betAmount.toFixed(2) : betAmt.toFixed(2));
            
            if (window.aviator.hasBet && !window.aviator.hasCashedOut) { 
                document.getElementById('stat-pot-win').innerText = `${(window.aviator.betAmount * window.aviator.multiplier).toFixed(2)}`; 
                document.getElementById('stat-pot-win-at').innerText = `(at ${window.aviator.multiplier.toFixed(2)}x)`; 
            } else { 
                document.getElementById('stat-pot-win').innerText = `0.00`; 
                document.getElementById('stat-pot-win-at').innerText = `(at 1.00x)`; 
            } 
        };

        window.updateAviatorActionButton = function() { 
            const betBtn = document.getElementById('aviator-action-btn'); 
            const cashBtn = document.getElementById('aviator-cashout-btn');
            
            if (window.aviator.state === "WAITING") { 
                cashBtn.className = "w-full py-4 rounded-xl bg-slate-800 text-slate-500 font-black text-lg uppercase shadow-none opacity-50 cursor-not-allowed flex items-center justify-center gap-2";
                if (window.aviator.hasBet) { 
                    betBtn.className = "w-full py-4 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 text-lg font-black transition"; 
                    document.getElementById('aviator-btn-label').innerText = `CANCEL BET`; 
                } else { 
                    betBtn.className = "w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition flex items-center justify-center gap-2"; 
                    document.getElementById('aviator-btn-label').innerText = `BET`; 
                } 
            } else if (window.aviator.state === "FLYING") { 
                betBtn.className = "w-full py-4 rounded-xl bg-slate-800 text-slate-500 text-lg font-black transition cursor-not-allowed";
                document.getElementById('aviator-btn-label').innerText = `WAITING...`;
                
                if (window.aviator.hasBet && !window.aviator.hasCashedOut) { 
                    cashBtn.className = "w-full py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-lg uppercase tracking-wider shadow-[0_0_15px_rgba(225,29,72,0.3)] active:scale-95 transition flex items-center justify-center gap-2";
                } else {
                    cashBtn.className = "w-full py-4 rounded-xl bg-slate-800 text-slate-500 font-black text-lg uppercase shadow-none opacity-50 cursor-not-allowed flex items-center justify-center gap-2";
                }
            } 
        };

        window.handleAviatorAction = function() { 
            if (window.aviator.state === "WAITING") { 
                if (window.aviator.hasBet) { 
                    if(window.state) window.state.balance += window.aviator.betAmount; 
                    window.aviator.hasBet = false; 
                    if(window.showToast) window.showToast("↩️ Bet Cancelled & refunded."); 
                    window.updateAviatorActionButton(); 
                } else { 
                    const betVal = parseFloat(document.getElementById('aviator-bet-input').value) || 0; 
                    if (betVal <= 0) return window.showToast && window.showToast("Enter a valid bet!", true); 
                    if (window.state && betVal > window.state.balance) { if(window.playSound) window.playSound('error'); return window.showToast && window.showToast("Insufficient Balance!", true); } 
                    
                    if(window.state) window.state.balance -= betVal; 
                    window.aviator.hasBet = true; window.aviator.betAmount = betVal; 
                    if(window.playSound) window.playSound('tap'); 
                    window.updateAviatorActionButton(); 
                } 
                if(window.state) document.getElementById('aviator-pool-bal').innerText = window.state.balance.toFixed(2);
            } 
        };

        window.forceCashout = function(overrideMult = null) {
            const mult = overrideMult || window.aviator.multiplier;
            if (!window.aviator.hasBet || window.aviator.hasCashedOut || window.aviator.state !== "FLYING") return; 
            
            window.aviator.hasCashedOut = true; window.aviator.cashedOutAt = mult; 
            const winTotal = window.aviator.betAmount * mult; 
            if(window.state) window.state.balance += winTotal; 
            
            if(window.playSound) window.playSound('upgrade'); 
            if(window.showToast) window.showToast(`🎉 CASHOUT! Won +${winTotal.toFixed(2)} TAX`); 
            
            if(window.state) document.getElementById('aviator-pool-bal').innerText = window.state.balance.toFixed(2);
            window.updateAviatorActionButton(); 
        };

        window.changeAviatorBet = function(delta) { const i = document.getElementById('aviator-bet-input'); let v = parseFloat(i.value)||0; v+=delta; i.value = Math.max(10, v); window.updateAviatorUI(); };
        window.setAviatorBet = function(amt) { document.getElementById('aviator-bet-input').value = amt; window.updateAviatorUI(); };
        window.changeAviatorAuto = function(delta) { const i = document.getElementById('aviator-auto-val'); let v = parseFloat(i.value)||1.5; v+=delta; i.value = Math.max(1.1, v).toFixed(2); document.getElementById('stat-auto-val').innerText = i.value + 'x'; };
        window.setAviatorAuto = function(amt) { document.getElementById('aviator-auto-val').value = amt.toFixed(2); document.getElementById('stat-auto-val').innerText = amt.toFixed(2) + 'x'; };

        window.renderAviatorHistoryPills = function() { 
            document.getElementById('aviator-history-bar').innerHTML = window.aviator.recentMultipliers.map(m => { 
                let colorClass = m >= 5.0 ? "bg-fuchsia-900/50 text-fuchsia-400 border-fuchsia-500/30" : 
                                 (m >= 2.0 ? "bg-emerald-900/50 text-emerald-400 border-emerald-500/30" : 
                                 "bg-blue-900/50 text-blue-400 border-blue-500/30"); 
                return `<div class="px-2.5 py-0.5 rounded-full border ${colorClass} text-[10px] font-black shrink-0 shadow-sm">${m.toFixed(2)}x</div>`; 
            }).join(''); 
        };

        window.openAviatorModal = function() { 
            document.getElementById('aviator-modal').classList.remove('hidden'); document.getElementById('aviator-modal').classList.add('flex'); 
            if(window.state) document.getElementById('aviator-pool-bal').innerText = window.state.balance.toFixed(2); 
            window.renderAviatorHistoryPills(); 
            setTimeout(() => { 
                window.resizeAviatorCanvas(); 
                if (!window.aviator.animFrameId) { window.startAviatorWaitingRound(); window.renderAviatorFrame(); } 
            }, 50); 
        };
        
        window.closeAviatorModal = function() { 
            document.getElementById('aviator-modal').classList.add('hidden'); document.getElementById('aviator-modal').classList.remove('flex'); 
            if(window.updateTopStatsUI) window.updateTopStatsUI(); 
        };
        
        document.getElementById('aviator-auto-val').addEventListener('input', (e) => {
            document.getElementById('stat-auto-val').innerText = parseFloat(e.target.value||1.5).toFixed(2) + 'x';
        });
    </script>