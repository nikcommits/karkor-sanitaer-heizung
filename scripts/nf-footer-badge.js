(function () {
  const css = `
.nf-card-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 9999; }
.nf-card { background: #fff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,.2); width: 290px; overflow: hidden; transform-origin: bottom right; animation: nf-in .2s ease; }
.nf-card[hidden] { display: none !important; }
@keyframes nf-in { from { opacity:0; transform:scale(.9) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
.nf-card-header { background: #e8521a; padding: 16px 36px 16px 16px; color: #fff; position: relative; }
.nf-card-header strong { display: block; font-size: 12px; font-weight: 800; letter-spacing: .03em; text-transform: uppercase; line-height: 1.4; margin-bottom: 4px; }
.nf-card-header span { font-size: 12px; opacity: .85; }
.nf-card-close { position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,.25); border: none; color: #fff; font-size: 13px; cursor: pointer; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; }
.nf-card-body { display: flex; align-items: center; gap: 14px; padding: 16px; }
.nf-card-avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #f0f0f0; flex-shrink: 0; }
.nf-card-info strong { display: block; font-size: 14px; font-weight: 700; color: #111; }
.nf-card-info span { font-size: 12px; color: #666; }
.nf-card-actions { display: flex; gap: 8px; padding: 0 16px 16px; }
.nf-card-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 10px 8px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none; }
.nf-card-btn-web { background: #1a1a1a; color: #fff; }
.nf-card-btn-wa { background: #25d366; color: #fff; }
.nf-card-btn:hover { opacity: .88; }
.nf-overlay { display: none; position: fixed; inset: 0; z-index: 9998; }
.nf-overlay.active { display: block; }
`;

  const html = `
<div class="nf-card-wrap">
  <div class="nf-card" id="nf-popup" hidden>
    <div class="nf-card-header">
      <button class="nf-card-close" onclick="nfClose()" aria-label="Schließen">&#x2715;</button>
      <strong>Website · Voice Agent · Prozesse optimieren?</strong>
      <span>Melden Sie sich gerne unverbindlich bei mir.</span>
    </div>
    <div class="nf-card-body">
      <img class="nf-card-avatar" src="assets/nik-photo.webp" alt="Nik Frühschulz">
      <div class="nf-card-info">
        <img src="assets/nf-logo-text.webp" alt="Nik Frühschulz Web Performance" style="max-width:150px;height:auto;display:block;">
      </div>
    </div>
    <div class="nf-card-actions">
      <a class="nf-card-btn nf-card-btn-web" href="https://fruehschulz.net/" target="_blank" rel="noopener">🌐 fruehschulz.net</a>
      <a class="nf-card-btn nf-card-btn-wa" href="https://wa.me/4921519288542?text=Hallo%20Nick%2C%20ich%20interessiere%20mich%20f%C3%BCr%20deine%20Leistungen." target="_blank" rel="noopener">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.553 4.122 1.523 5.855L.057 23.868l6.162-1.438A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.007-1.371l-.359-.214-3.72.868.938-3.63-.234-.373A9.818 9.818 0 0 1 2.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/></svg>
        WhatsApp
      </a>
    </div>
  </div>
</div>
<div class="nf-overlay" id="nf-overlay" onclick="nfClose()"></div>
`;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', html);

  // Klick auf den Footer-Ring öffnet die Karte
  document.addEventListener('DOMContentLoaded', function () {
    const trigger = document.querySelector('.nf-footer-badge');
    if (trigger) {
      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        nfOpen();
      });
    }
  });

  window.nfOpen = function () {
    document.getElementById('nf-popup').hidden = false;
    document.getElementById('nf-overlay').classList.add('active');
  };
  window.nfClose = function () {
    document.getElementById('nf-popup').hidden = true;
    document.getElementById('nf-overlay').classList.remove('active');
  };
})();
