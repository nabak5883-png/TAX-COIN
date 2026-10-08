// js/features/wallet.js

// Initialize Real TON Connect
window.tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json'
});

// যখন ইউজার Connect Wallet বাটনে ক্লিক করবে
window.openWalletModal = function() {
    if (window.tonConnectUI.connected) {
        // যদি আগে থেকেই কানেক্ট থাকে, তাহলে Disconnect পপআপ দেখাবে
        window.safeSetText('connected-wallet-address', "Wallet Connected");
        document.getElementById('disconnect-modal').classList.remove('hidden');
        document.getElementById('disconnect-modal').classList.add('flex');
    } else {
        // কানেক্ট না থাকলে আসল TON Connect এর অফিশিয়াল পপআপ খুলবে
        window.tonConnectUI.openModal();
    }
}

// Disconnect ফাংশন
window.disconnectWallet = async function() {
    try {
        await window.tonConnectUI.disconnect();
        window.state.walletAddress = "";
        window.state.isVerified = false; 
        window.playSound('error'); 
        window.showToast("🔌 Wallet Disconnected!");
        window.closeDisconnectModal();
        if(window.updateAllUI) window.updateAllUI();
        window.saveGameState();
    } catch(e) {
        console.log(e);
    }
}

// Cancel বাটন
window.closeDisconnectModal = function() {
    document.getElementById('disconnect-modal').classList.add('hidden');
    document.getElementById('disconnect-modal').classList.remove('flex');
}

// ওয়ালেটের স্ট্যাটাস পরিবর্তন (কানেক্ট/ডিসকানেক্ট) হলে যা হবে
window.tonConnectUI.onStatusChange(wallet => {
    if (wallet) {
        // আসল ওয়ালেট কানেক্ট হয়েছে!
        window.state.walletAddress = "UQ" + wallet.account.address.substring(0, 10); // আসল এড্রেস সেভ করা
        window.state.isVerified = true; 
        
        // প্রথমবার কানেক্ট করলে বোনাস
        if (!window.state.completedTasks['wallet_bonus']) {
            window.state.holdingBalance += 250; 
            if (!window.state.lastUnlockTime) window.state.lastUnlockTime = Date.now();
            window.state.completedTasks['wallet_bonus'] = true;
            window.showToast(`✅ Connected! +250 TAX Bonus added to Holding Wallet!`);
        } else {
            window.showToast(`✅ Wallet Connected Successfully!`);
        }
        
        window.playSound('upgrade');
        if(window.updateAllUI) window.updateAllUI(); 
        window.saveGameState(); 
    } else {
        // ওয়ালেট ডিসকানেক্ট হয়ে গেলে
        window.state.walletAddress = "";
        window.state.isVerified = false;
        if(window.updateAllUI) window.updateAllUI(); 
        window.saveGameState();
    }
});
