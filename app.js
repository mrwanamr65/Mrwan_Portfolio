const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = id => document.getElementById(id);
const FALLBACK = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#dcdbd3"/></svg>');
const pad = n => String(n).padStart(2, '0');
const yearOf = s => (String(s).match(/20\d\d/g) || []).slice(-1)[0] || 'Other';
const imgTag = (src, alt, extra = '') => `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" draggable="false" ${extra} onerror="this.onerror=null;this.src='${FALLBACK}'">`;

/* ---------- viewer (native dialog, arrow keys) ---------- */
const viewer = $('viewer'), vImg = $('viewer-img'), vCap = $('viewer-cap'), vPos = $('viewer-pos');
let vSet = [], vIdx = 0;
function show() {
    const it = vSet[vIdx]; if (!it) return;
    vImg.src = it.src; vImg.alt = it.cap; vCap.textContent = it.cap; vPos.textContent = pad(vIdx + 1) + ' / ' + pad(vSet.length);
    $('v-prev').hidden = $('v-next').hidden = vSet.length < 2;
}
function openViewer(set, i) {
    vSet = set; vIdx = i; show();
    if (typeof viewer.showModal === 'function') { if (!viewer.open) viewer.showModal(); } else viewer.setAttribute('open', '');
}
const step = d => { if (vSet.length > 1) { vIdx = (vIdx + d + vSet.length) % vSet.length; show(); } };
$('v-prev').onclick = () => step(-1); $('v-next').onclick = () => step(1);
$('v-close').onclick = () => viewer.close();
viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
addEventListener('keydown', e => { if (!viewer.open) return; if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
document.addEventListener('click', e => {
    const b = e.target.closest('[data-set]'); if (!b) return;
    openViewer(window.__sets[b.dataset.set], +b.dataset.i);
});
window.__sets = {};

/* ---------- render ---------- */
const TECH = ['LightGBM', 'TensorFlow', 'Keras', 'OpenCV', 'Arduino', 'Computer vision'];
function renderHero(data) {
    const p = data.personal, c0 = data.competitions[0];
    $('hero-title').textContent = p.title;
    $('hero-summary').textContent = p.summary;
    $('main-github-btn').href = p.links.github;
    const firsts = data.competitions.filter(c => /1st/i.test(c.role)).length;
    $('stats').innerHTML = [[data.competitions.length, 'Competitions'], [firsts, 'First places'], [data.projects.length, 'Projects'], [data.certificates.length, 'Certificates']]
        .map(([n, l]) => `<li><b>${n}</b><span class="mono">${l}</span></li>`).join('');
    if (c0 && c0.images && c0.images.length) {
        window.__sets.hero = [{ src: c0.images[0], cap: 'FIG. 01. ' + c0.title }];
        $('hero-fig').innerHTML = `<button type="button" data-set="hero" data-i="0" aria-label="Enlarge photo">${imgTag(c0.images[0], c0.title, 'fetchpriority="high"')}</button><figcaption class="mono">FIG. 01. ${esc(c0.title)}</figcaption>`;
    }
}
function renderBuilds(data) {
    $('dynamic-projects').innerHTML = data.projects.map((pr, i) => {
        const tags = TECH.filter(t => pr.description.toLowerCase().includes(t.toLowerCase()));
        return `<li class="build">
            <span class="b-num mono">P-${pad(i + 1)}</span>
            <div class="b-main"><h3>${esc(pr.title)}</h3><p>${esc(pr.description)}</p></div>
            <dl class="b-spec mono">
                ${tags.length ? `<div><dt>Stack</dt><i></i><dd>${esc(tags.join(', '))}</dd></div>` : ''}
                <div><dt>Source</dt><i></i><dd><a class="ulink" href="${esc(pr.github_link)}" target="_blank" rel="noopener noreferrer">GitHub</a></dd></div>
            </dl></li>`;
    }).join('');
}
function renderRecord(data) {
    $('dynamic-competitions').innerHTML = data.competitions.map((c, i) => {
        const key = 'c' + i, imgs = c.images || [];
        window.__sets[key] = imgs.map((s, j) => ({ src: s, cap: `FIG. ${pad(i + 2)}.${j + 1}. ${c.title}` }));
        const first = /1st/i.test(c.role);
        const roles = String(c.role || '').split('|').map(s => s.trim()).filter(Boolean);
        const figs = imgs.map((s, j) => `<figure class="fig"><button type="button" data-set="${key}" data-i="${j}" aria-label="Enlarge photo ${j + 1} of ${imgs.length}">${imgTag(s, c.title)}</button><figcaption class="mono">FIG. ${pad(i + 2)}.${j + 1}</figcaption></figure>`).join('');
        return `<article class="rec ${imgs.length > 2 ? 'rec-wide' : ''}">
            <div class="rec-text">
                <p class="mono rec-idx">C-${pad(data.competitions.length - i)}${c.timeline ? ' &middot; ' + esc(c.timeline) : ''}</p>
                <h3>${esc(c.title)}</h3>
                ${first ? `<span class="stamp">${esc(roles[0])}</span>` : `<p class="role mono">${esc(roles[0] || '')}</p>`}
                ${roles.length > 1 ? `<p class="role mono">${esc(roles.slice(1).join(' / '))}</p>` : ''}
                ${c.project ? `<p class="proj mono">Project: ${esc(c.project)}</p>` : ''}
                <p>${esc(c.description || '')}</p>
            </div>
            <div class="rec-figs n${Math.min(imgs.length, 4)}">${figs}</div>
        </article>`;
    }).join('');
}
function renderCaps(data) {
    $('skills-grid').innerHTML = Object.values(data.skills).map((s, i) => `
        <section class="cap"><h3><span class="mono">${pad(i + 1)}</span>${esc(s.title.replace(/\s*\(Foundational\)/, ''))}</h3>
        <p>${esc(s.description)}</p>
        <dl>${(s.items || []).map(t => { const k = t.indexOf(': '); return `<div><dt>${esc(k > 0 ? t.slice(0, k) : '')}</dt><dd>${esc(k > 0 ? t.slice(k + 2) : t)}</dd></div>`; }).join('')}</dl></section>`).join('');
}
function renderArchive(data) {
    const certs = data.certificates;
    $('archive-count').textContent = `${certs.length} documented credentials. Click a row to view the scan.`;
    window.__sets.certs = certs.map(c => ({ src: c.image, cap: `${c.title} (${c.date})` }));
    const groups = {};
    certs.forEach((c, i) => (groups[yearOf(c.date)] ||= []).push([c, i]));
    const years = Object.keys(groups).sort((a, b) => b - a);
    $('dynamic-certs').innerHTML = years.map((y, k) => `
        <details class="year" ${k < 2 ? 'open' : ''}><summary><span>${esc(y)}</span><em class="mono">${groups[y].length}</em></summary>
        <ul>${groups[y].map(([c, i]) => `<li><button type="button" data-set="certs" data-i="${i}"><span class="th">${imgTag(c.image, '')}</span><span class="t">${esc(c.title)}</span><span class="d mono">${esc(c.date)}</span></button></li>`).join('')}</ul></details>`).join('');
    $('dynamic-yt').innerHTML = (data.youtube_courses || []).map(v => `<li><a class="ulink" href="${esc(v.link)}" target="_blank" rel="noopener noreferrer">${esc(v.title)}</a></li>`).join('');
}
$('email-link').addEventListener('click', e => {
    e.preventDefault(); const t = $('toast'), email = 'mrwanamr.dev@gmail.com';
    const msg = m => { t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2500); };
    (navigator.clipboard ? navigator.clipboard.writeText(email) : Promise.reject()).then(() => msg('Email copied: ' + email)).catch(() => { location.href = 'mailto:' + email; });
});
(async function run() {
    try {
        const data = await (await fetch('data.json')).json();
        document.title = `${data.personal.name} | AI & Embedded Systems`;
        renderHero(data); renderBuilds(data); renderRecord(data); renderCaps(data); renderArchive(data);
    } catch (err) {
        console.error('Could not load portfolio data:', err);
        $('hero-summary').textContent = 'Content failed to load. Please refresh the page.';
    }
})();
