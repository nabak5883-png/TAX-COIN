// js/admin/games.js

window.setAviatorCrash = function() {
    const val = parseFloat(document.getElementById('aviator-next-crash').value);
    
    if (val && val >= 1.00) {
        window.dbUpdate(window.dbRef(window.db, 'settings/games/aviator'), { nextCrash: val })
            .then(() => {
                alert(`SUCCESS! The plane will now crash exactly at ${val}x in the next round.`);
                document.getElementById('aviator-next-crash').value = '';
            })
            .catch(err => alert("Database Error: " + err));
    } else {
        alert("⚠️ Please enter a valid multiplier (minimum 1.00)");
    }
}

window.clearAviatorCrash = function() {
    window.dbUpdate(window.dbRef(window.db, 'settings/games/aviator'), { nextCrash: null })
        .then(() => {
            alert("✅ Aviator game is now back to Auto/Random mode!");
        })
        .catch(err => alert("Database Error: " + err));
}
