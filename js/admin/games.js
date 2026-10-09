window.setAviatorCrash = function() {
    const val = parseFloat(document.getElementById('aviator-next-crash').value);
    if (val && val >= 1.00) { window.dbUpdate(window.dbRef(window.db, 'settings/games/aviator'), { nextCrash: val }).then(() => { alert(`SUCCESS! The plane will crash at ${val}x in the next round.`); document.getElementById('aviator-next-crash').value = ''; }).catch(err => alert("Error: " + err)); } 
    else { alert("⚠️ Please enter a valid multiplier (minimum 1.00)"); }
}

window.clearAviatorCrash = function() { window.dbUpdate(window.dbRef(window.db, 'settings/games/aviator'), { nextCrash: null }).then(() => { alert("✅ Aviator is now in Auto/Random mode!"); }).catch(err => alert("Error: " + err)); }

// NEW: TIME-BASED SCHEDULE
window.addAviatorSchedule = function() {
    const timeVal = document.getElementById('aviator-time').value;
    const crashVal = parseFloat(document.getElementById('aviator-time-crash').value);
    if (!timeVal) return alert("Please select a time!");
    if (!crashVal || crashVal < 1.00) return alert("Please enter a valid multiplier (min 1.00)!");
    window.dbUpdate(window.dbRef(window.db, `settings/games/aviator/scheduled`), { [timeVal]: crashVal }).then(() => {
        alert(`SUCCESS! Plane will crash at ${crashVal}x at exactly ${timeVal}.`);
        document.getElementById('aviator-time').value = ''; document.getElementById('aviator-time-crash').value = '';
    }).catch(err => alert("Error: " + err));
}

window.deleteAviatorSchedule = function(timeKey) {
    if(confirm(`Delete schedule for ${timeKey}?`)) { window.dbUpdate(window.dbRef(window.db, `settings/games/aviator/scheduled`), { [timeKey]: null }).catch(err => alert("Error: " + err)); }
}
