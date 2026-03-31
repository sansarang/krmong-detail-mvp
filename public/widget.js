(function() {
  var BASE = 'https://pagebeer.beer';
  var lang = (document.documentElement.lang || navigator.language || 'ko').slice(0, 2);
  var label = lang === 'ko' ? '금칙어 검사' : 'Prohibited Words';

  // floating button
  var btn = document.createElement('button');
  btn.innerHTML = '🔍 ' + label;
  btn.style.cssText = [
    'position:fixed','bottom:24px','right:24px','z-index:99999',
    'background:#3b82f6','color:#fff','border:none','border-radius:12px',
    'padding:12px 18px','font-size:13px','font-weight:700','cursor:pointer',
    'box-shadow:0 4px 20px rgba(59,130,246,0.4)','transition:transform 0.15s',
  ].join(';');
  btn.onmouseenter = function() { btn.style.transform = 'scale(1.05)'; };
  btn.onmouseleave = function() { btn.style.transform = 'scale(1)'; };

  // overlay + iframe
  var overlay = document.createElement('div');
  overlay.style.cssText = [
    'display:none','position:fixed','inset:0','z-index:99998',
    'background:rgba(0,0,0,0.7)','backdrop-filter:blur(4px)',
    'align-items:center','justify-content:center',
  ].join(';');

  var modal = document.createElement('div');
  modal.style.cssText = [
    'background:#0B1120','border:1px solid rgba(255,255,255,0.08)',
    'border-radius:16px','width:min(540px,92vw)','height:460px',
    'overflow:hidden','position:relative',
  ].join(';');

  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕';
  closeBtn.style.cssText = [
    'position:absolute','top:10px','right:14px','z-index:1',
    'background:transparent','border:none','color:#94a3b8',
    'font-size:16px','cursor:pointer','line-height:1',
  ].join(';');

  var iframe = document.createElement('iframe');
  iframe.src = BASE + '/widget/keyword-checker';
  iframe.style.cssText = 'width:100%;height:100%;border:none;';
  iframe.allow = 'clipboard-write';

  modal.appendChild(closeBtn);
  modal.appendChild(iframe);
  overlay.appendChild(modal);
  overlay.style.display = 'flex';
  overlay.style.display = 'none';

  btn.onclick = function() { overlay.style.display = 'flex'; };
  closeBtn.onclick = function() { overlay.style.display = 'none'; };
  overlay.onclick = function(e) { if (e.target === overlay) overlay.style.display = 'none'; };

  document.body.appendChild(btn);
  document.body.appendChild(overlay);
})();
