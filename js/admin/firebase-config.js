// js/admin/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, update, remove, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
window.db = getDatabase(app);
window.dbRef = ref;
window.dbOnValue = onValue;
window.dbUpdate = update;
window.dbRemove = remove;
window.dbSet = set;

window.allUsers = {};
window.allWithdrawals = {};
window.allTasks = {};
