// js/admin/tasks.js
window.saveTask = function() {
    const id = document.getElementById('t-id').value.trim();
    const title = document.getElementById('t-title').value.trim();
    const reward = parseFloat(document.getElementById('t-reward').value) || 0;
    const btnText = document.getElementById('t-btn').value.trim();
    const link = document.getElementById('t-link').value.trim();
    const reqVerified = document.getElementById('t-req-verify').checked;
    const isPinned = document.getElementById('t-is-pinned').checked;

    if(!id || !title || reward <= 0) return alert("Task ID, Title, and Reward are required!");
    if(id.includes(" ") || id.includes(".")) return alert("Task ID cannot contain spaces or dots!");

    const taskData = { title, reward, btnText: btnText || "Claim", link, reqVerified, isPinned };
    
    window.dbSet(window.dbRef(window.db, `tasks/${id}`), taskData).then(() => {
        alert('Task saved successfully!');
        window.clearTaskForm();
    }).catch(err => alert('Error saving task: ' + err));
}

window.clearTaskForm = function() {
    document.getElementById('t-id').value = ''; document.getElementById('t-title').value = '';
    document.getElementById('t-reward').value = ''; document.getElementById('t-btn').value = '';
    document.getElementById('t-link').value = ''; document.getElementById('t-req-verify').checked = false;
    document.getElementById('t-is-pinned').checked = false;
}

window.editTask = function(id) {
    const task = window.allTasks[id]; if(!task) return;
    document.getElementById('t-id').value = id; document.getElementById('t-title').value = task.title || "";
    document.getElementById('t-reward').value = task.reward || ""; document.getElementById('t-btn').value = task.btnText || "";
    document.getElementById('t-link').value = task.link || ""; document.getElementById('t-req-verify').checked = task.reqVerified || false;
    document.getElementById('t-is-pinned').checked = task.isPinned || false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.deleteTask = function(id) {
    if(confirm(`Are you sure you want to permanently delete task "${id}"?`)) {
        window.dbRemove(window.dbRef(window.db, `tasks/${id}`)).then(() => alert('Task deleted!')).catch(err => alert('Error deleting: ' + err));
    }
}

window.renderTasksTable = function() {
    const tbody = document.getElementById('tasks-table-body'); let html = '';
    for(const [id, data] of Object.entries(window.allTasks)) {
        const reqBadge = data.reqVerified ? '<span class="text-emerald-400 text-[10px] px-2 py-1 bg-emerald-900/40 rounded mr-1">Verified Only</span>' : '';
        const pinBadge = data.isPinned ? '<span class="text-amber-400 text-[10px] px-2 py-1 bg-amber-900/40 rounded"><i class="fa-solid fa-thumbtack"></i> Pinned</span>' : '';
        const linkBadge = data.link ? `<a href="${data.link}" target="_blank" class="text-sky-400 text-xs hover:underline">Link <i class="fa-solid fa-up-right-from-square text-[10px]"></i></a>` : '<span class="text-slate-500 text-xs">No Link</span>';
        
        html += `<tr class="hover:bg-slate-800/30 transition">
            <td class="px-4 py-3 font-mono text-amber-300">${id}</td>
            <td class="px-4 py-3 font-bold text-white">${data.isPinned ? '📌 ' : ''}${data.title}</td>
            <td class="px-4 py-3 text-emerald-400 font-bold">+${data.reward} TAX</td>
            <td class="px-4 py-3 flex items-center gap-1 flex-wrap">${reqBadge} ${pinBadge} <span class="ml-2">${linkBadge}</span></td>
            <td class="px-4 py-3 text-right">
                <button onclick="editTask('${id}')" class="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded text-xs font-bold mr-1 transition"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteTask('${id}')" class="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 rounded text-xs font-bold transition"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>`;
    }
    tbody.innerHTML = html || '<tr><td colspan="5" class="px-4 py-8 text-center text-slate-500">No tasks created yet.</td></tr>';
}
