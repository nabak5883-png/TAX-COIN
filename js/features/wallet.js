window.openWalletModal = function() {
    if (window.state.walletAddress && window.state.walletAddress.startsWith("UQ")) { 
        window.safeSetText('connected-wallet-address', window.state.walletAddress);
        document.getElementById('disconnect-modal').classList.remove('hidden'); document.getElementById('disconnect-modal').classList.add('flex');
        return; 
    }
    document.getElementById('wallet-connect-modal').style.display = 'flex'; 
    setTimeout(() => document.getElementById('wallet-sheet-1').classList.add('open'), 10);
}

window.closeDisconnectModal = function() { document.getElementById('disconnect-modal').classList.add('hidden'); document.getElementById('disconnect-modal').classList.remove('flex'); }

window.disconnectWallet = function() {
    window.state.walletAddress = ""; window.state.isVerified = false; 
    window.playSound('error'); window.showToast("🔌 Wallet Disconnected!");
    window.closeDisconnectModal(); if(window.updateAllUI) window.updateAllUI(); window.saveGameState();
}

window.closeWalletModal = function() { document.getElementById('wallet-sheet-1').classList.remove('open'); setTimeout(() => document.getElementById('wallet-connect-modal').style.display = 'none', 300); }

window.openAllWallets = function() { window.closeWalletModal(); setTimeout(() => { document.getElementById('all-wallets-modal').style.display = 'flex'; setTimeout(() => document.getElementById('wallet-sheet-2').classList.add('open'), 10); }, 350); }

window.closeAllWallets = function() { document.getElementById('wallet-sheet-2').classList.remove('open'); setTimeout(() => { document.getElementById('all-wallets-modal').style.display = 'none'; window.openWalletModal(); }, 300); }

window.connectDummyWallet = function(walletName) {
    window.showToast(`Connecting to ${walletName}...`);
    setTimeout(() => {
        const dummyAddr = "UQ" + Math.random().toString(36).substring(2, 10).toUpperCase() + "..." + Math.random().toString(36).substring(2, 6).toUpperCase();
        window.state.walletAddress = dummyAddr; window.state.isVerified = true; 
        
        if (!window.state.completedTasks['wallet_bonus']) {
            window.state.holdingBalance += 250; 
            if (!window.state.lastUnlockTime) window.state.lastUnlockTime = Date.now();
            window.state.completedTasks['wallet_bonus'] = true;
            window.showToast(`✅ Connected! +250 TAX Bonus added to Holding Wallet!`);
        } else { window.showToast(`✅ Wallet Connected Successfully!`); }
        
        window.playSound('upgrade');
        document.getElementById('wallet-sheet-1').classList.remove('open'); document.getElementById('wallet-sheet-2').classList.remove('open');
        setTimeout(() => { document.getElementById('wallet-connect-modal').style.display = 'none'; document.getElementById('all-wallets-modal').style.display = 'none'; if(window.updateAllUI) window.updateAllUI(); window.saveGameState(); }, 300);
    }, 1200);
}
