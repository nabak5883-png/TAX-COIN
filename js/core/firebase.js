// js/core/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, set, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDi53ScdpGIF1u2rRuGavDwlQoTvbaxRNc",
    authDomain: "tax-coin-ce652.firebaseapp.com",
    databaseURL: "https://tax-coin-ce652-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tax-coin-ce652",
    storageBucket: "tax-coin-ce652.firebasestorage.app",
    messagingSenderId: "488249450837",
    appId: "1:488249450837:web:b763e7d392288fcf6d0fdc"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

onValue(ref(db, 'settings'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        if (data.tokenPrice) window.TAX_TO_USD_RATE = data.tokenPrice;
        if (data.requireWalletToMine !== undefined) window.requireWalletToMine = data.requireWalletToMine;
        
        if(typeof window.updateTopStatsUI === 'function') window.updateTopStatsUI();
        if(typeof window.updateWithdrawPreview === 'function') window.updateWithdrawPreview();
    }
});

window.saveToFirebase = function() {
    if(window.state && window.state.numericUid) {
        update(ref(db, 'users/' + window.state.numericUid), { 
            balance: window.state.balance, 
            holdingBalance: window.state.holdingBalance || 0, 
            isVerified: window.state.isVerified || false 
        });
    }
};

window.sendWithdrawalToAdmin = function(txRecord) {
    set(ref(db, 'withdrawals/' + txRecord.id), { 
        ...txRecord, 
        userId: window.state.numericUid, 
        timestamp: Date.now() 
    });
};

setTimeout(() => { if (window.saveToFirebase) window.saveToFirebase(); }, 3000);
