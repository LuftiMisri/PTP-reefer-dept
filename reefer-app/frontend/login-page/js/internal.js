// fetch current user from server
fetch('/me').then(r => r.json()).then(data => {
    if (data.user) {
        document.getElementById('userName').textContent = data.user;
    }
});

const trainingList = document.getElementById('trainingList');
const procedureList = document.getElementById('procedureList');
const isoList = document.getElementById('isoList');
const hrList = document.getElementById('hrList');

function renderDocs(listEl, docs, emptyMessage) {
    listEl.innerHTML = '';
    if (!docs.length) {
        listEl.innerHTML = `<li class="text-slate-500">${emptyMessage}</li>`;
        return;
    }

    docs.forEach((doc) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = doc.path;
        link.className = 'text-blue-600 hover:underline';
        link.textContent = doc.title;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        li.appendChild(link);
        listEl.appendChild(li);
    });
}

async function loadCategory(category, listEl, emptyMessage, errorMessage) {
    try {
        const response = await fetch(`/api/docs?category=${encodeURIComponent(category)}`);
        if (!response.ok) {
            throw new Error('Unable to load documents');
        }

        const docs = await response.json();
        renderDocs(listEl, docs, emptyMessage);
    } catch (error) {
        listEl.innerHTML = `<li class="text-red-600">${errorMessage}</li>`;
    }
}

loadCategory('training', trainingList, 'No training documents available.', 'Failed to load training documents.');
loadCategory('procedures', procedureList, 'No SOP/procedure documents available.', 'Failed to load SOP documents.');
loadCategory('iso', isoList, 'No ISO documents available.', 'Failed to load ISO documents.');
loadCategory('hr', hrList, 'No HR documents available.', 'Failed to load HR documents.');
