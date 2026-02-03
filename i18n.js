function detectLang() {
  const url = new URLSearchParams(window.location.search).get('lang');
  if (url === 'ja' || url === 'en') return url;
  const stored = localStorage.getItem('lang');
  if (stored === 'ja' || stored === 'en') return stored;
  return navigator.language.startsWith('en') ? 'en' : 'ja';
}

async function loadTranslations(lang) {
  const res = await fetch(`lang/${lang}.json`);
  return res.json();
}

function applyTranslations(data) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = key.split('.').reduce((o, k) => o?.[k], data);
    if (val != null) {
      if (Array.isArray(val)) {
        const items = el.querySelectorAll('li');
        val.forEach((text, i) => { if (items[i]) items[i].textContent = text; });
      } else {
        el.textContent = val;
      }
    }
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.getAttribute('data-i18n-html');
    const val = key.split('.').reduce((o, k) => o?.[k], data);
    if (val != null) el.innerHTML = val;
  });
  if (data.meta) {
    document.title = data.meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', data.meta.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', data.meta.ogTitle);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', data.meta.ogDescription);
  }
}

function updateSwitcher(lang) {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('lang-btn-active', btn.dataset.lang === lang);
  });
}

async function switchLang(lang) {
  const data = await loadTranslations(lang);
  applyTranslations(data);
  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);
  const url = new URL(window.location);
  url.searchParams.set('lang', lang);
  history.replaceState(null, '', url);
  updateSwitcher(lang);
}

document.addEventListener('DOMContentLoaded', () => {
  const lang = detectLang();
  switchLang(lang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => switchLang(btn.dataset.lang));
  });
});
