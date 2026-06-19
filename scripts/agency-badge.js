(function () {
  const css = `
#nf-badge{position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:12px}
.nf-trigger{position:relative;width:80px;height:80px;border-radius:50%;border:none;background:transparent;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 8px rgba(0,0,0,.35))}
.nf-ring{position:absolute;inset:0;width:100%;height:100%;animation:nf-spin 12s linear infinite}
.nf-ring-text{font-size:10.5px;font-weight:700;letter-spacing:.05em;fill:#ffffff;font-family:system-ui,sans-serif}
@keyframes nf-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.nf-photo{width:54px;height:54px;border-radius:50%;object-fit:cover;border:2px solid #fff;position:relative;z-index:1}
.nf-photo-fallback{display:none;width:54px;height:54px;border-radius:50%;background:#e0e0e0;color:#555;font-size:16px;font-weight:700;align-items:center;justify-content:center;border:2px solid #fff;position:relative;z-index:1}
.nf-card{background:#fff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,.18);width:280px;overflow:hidden;transform-origin:bottom right;animation:nf-card-in .2s ease}
.nf-card[hidden]{display:none!important}
@keyframes nf-card-in{from{opacity:0;transform:scale(.9) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}
.nf-close{position:absolute;top:10px;right:12px;background:rgba(255,255,255,.25);border:none;color:#fff;font-size:14px;cursor:pointer;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;line-height:1}
.nf-card-header{background:#e8521a;padding:16px 36px 16px 16px;color:#fff;position:relative}
.nf-card-header strong{display:block;font-size:13px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;margin-bottom:2px}
.nf-card-header span{font-size:12px;opacity:.9}
.nf-card-body{display:flex;align-items:center;gap:14px;padding:16px}
.nf-card-photo{width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid #f0f0f0;flex-shrink:0}
.nf-card-info{display:flex;flex-direction:column;gap:2px}
.nf-card-info strong{font-size:15px;font-weight:700;color:#111}
.nf-card-info span{font-size:12px;color:#666}
.nf-card-actions{display:flex;gap:8px;padding:0 16px 16px}
.nf-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;cursor:pointer}
.nf-btn-web{background:#1a1a1a;color:#fff}
.nf-btn-wa{background:#25d366;color:#fff}
.nf-btn:hover{opacity:.88}
#nf-overlay{display:none;position:fixed;inset:0;z-index:9998}
#nf-overlay.active{display:block}
`;

  const base = (function () {
    const scripts = document.querySelectorAll('script[src]');
    for (const s of scripts) {
      if (s.src.includes('agency-badge')) {
        return s.src.replace(/scripts\/agency-badge\.js.*$/, '');
      }
    }
    return '';
  })();

  const html = `
<div id="nf-badge">
  <button class="nf-trigger" aria-label="Kontakt Nik Frühschulz" onclick="nfToggle()">
    <svg class="nf-ring" viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <path id="nf-circle" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/>
      </defs>
      <text class="nf-ring-text">
        <textPath href="#nf-circle" startOffset="0%">FRÜHSCHULZ WEB PERFORMANCE · WEB DESIGN · MARKETING · VOICE AGENTS ·</textPath>
      </text>
    </svg>
    <img class="nf-photo" src="${base}assets/nf-logo.webp" alt="Nik Frühschulz"
         onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
    <span class="nf-photo-fallback" aria-hidden="true">NF</span>
  </button>
  <div class="nf-card" id="nf-card" role="dialog" aria-label="Kontakt Nik Frühschulz" hidden>
    <button class="nf-close" onclick="nfToggle()" aria-label="Schließen">&#x2715;</button>
    <div class="nf-card-header">
      <strong>SIE BRAUCHEN EINE WEBSITE?</strong>
      <span>Fragen Sie mich gerne unverbindlich an</span>
    </div>
    <div class="nf-card-body">
      <img class="nf-card-photo" src="${base}assets/nik-photo.webp" alt="Nik Frühschulz"
           onerror="this.style.display='none'">
      <div class="nf-card-info">
        <strong>Nick Frühschulz</strong>
        <span>Web Performance · Web Design · Marketing · Voice Agents</span>
      </div>
    </div>
    <div class="nf-card-actions">
      <a class="nf-btn nf-btn-web" href="https://fruehschulz.net/" target="_blank" rel="noopener">🌐 fruehschulz.net</a>
      <a class="nf-btn nf-btn-wa" href="https://wa.me/4921519288542?text=Hallo%20Nik%2C%20ich%20interessiere%20mich%20f%C3%BCr%20eine%20Website." target="_blank" rel="noopener">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.523 5.855L.057 23.868l6.162-1.438A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.007-1.371l-.359-.214-3.72.868.938-3.63-.234-.373A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
        WhatsApp
      </a>
    </div>
  </div>
</div>
<div id="nf-overlay" onclick="nfClose()"></div>
`;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', html);

  // Badge nur sichtbar wenn Footer im Viewport
  const badge = document.getElementById('nf-badge');
  badge.style.opacity = '0';
  badge.style.pointerEvents = 'none';
  badge.style.transition = 'opacity .3s ease';

  const footer = document.querySelector('footer');
  if (footer && window.IntersectionObserver) {
    const observer = new IntersectionObserver(function (entries) {
      const visible = entries[0].isIntersecting;
      badge.style.opacity = visible ? '1' : '0';
      badge.style.pointerEvents = visible ? 'auto' : 'none';
    }, { threshold: 0.05 });
    observer.observe(footer);
  }

  window.nfToggle = function () {
    const card = document.getElementById('nf-card');
    const overlay = document.getElementById('nf-overlay');
    const isOpen = !card.hidden;
    card.hidden = isOpen;
    overlay.classList.toggle('active', !isOpen);
  };
  window.nfClose = function () {
    document.getElementById('nf-card').hidden = true;
    document.getElementById('nf-overlay').classList.remove('active');
  };
})();
