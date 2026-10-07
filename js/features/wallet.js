// js/features/wallet.js

window.openWalletModal = function() {
    if (window.state.walletAddress && window.state.walletAddress.startsWith("UQ")) { 
        window.showToast("Wallet already connected!"); return; 
    }
    document.getElementById('wallet-connect-modal').style.display = 'flex'; 
    setTimeout(() => document.getElementById('wallet-sheet-1').classList.add('open'), 10);
}

window.closeWalletModal = function() { 
    document.getElementById('wallet-sheet-1').classList.remove('open'); 
    setTimeout(() => document.getElementById('wallet-connect-modal').style.display = 'none', 300); 
}

window.openAllWallets = function() { 
    window.closeWalletModal(); 
    setTimeout(() => { 
        document.getElementById('all-wallets-modal').style.display = 'flex'; 
        setTimeout(() => document.getElementById('wallet-sheet-2').classList.add('open'), 10); 
    }, 350); 
}

window.closeAllWallets = function() { 
    document.getElementById('wallet-sheet-2').classList.remove('open'); 
    setTimeout(() => { 
        document.getElementById('all-wallets-modal').style.display = 'none'; 
        window.openWalletModal(); 
    }, 300); 
}

window.connectDummyWallet = function(walletName) {
    window.showToast(`Connecting to ${walletName}...`);
    setTimeout(() => {
        // Generate Dummy Wallet Address
        const dummyAddr = "UQ" + Math.random().toString(36).substring(2, 10).toUpperCase() + "..." + Math.random().toString(36).substring(2, 6).toUpperCase();
        window.state.walletAddress = dummyAddr;
        window.state.isVerified = true; 
        window.state.balance += 250; 
        
        window.playSound('upgrade');
        window.showToast(`✅ Connected! +250 TAX Verification Bonus added!`);
        
        document.getElementById('wallet-sheet-1').classList.remove('open'); 
        document.getElementById('wallet-sheet-2').classList.remove('open');
        
        setTimeout(() => { 
            document.getElementById('wallet-connect-modal').style.display = 'none'; 
            document.getElementById('all-wallets-modal').style.display = 'none'; 
            if(window.updateAllUI) window.updateAllUI(); 
            window.saveGameState(); 
        }, 300);
    }, 1200);
}
