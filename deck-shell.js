/* ============================================================
deck-shell.js v2.0 — UI Shell & PPTX Export
Depends on: standard-deck.js, deck-layouts.js, pptxgen.bundle.js
============================================================ */

(function () {
'use strict';

var SD = window.StandardDeck;
if (!SD) {
 console.error('[deck-shell] standard-deck.js must load first');
 return;
}

var _D             = [];
var _config        = {};
var _currentSlide  = 0;
var _totalSlides   = 0;
var _customLogo    = null;
var _noLogo        = false;
var _imageMode     = false;

function injectStyles() {
 if (document.getElementById('sd-shell-css')) return;
 var css = document.createElement('style');
 css.id = 'sd-shell-css';
 css.textContent = [
   '*, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }',
   'body { background:#111; font-family:DM Sans,sans-serif; display:flex; flex-direction:column; align-items:center; min-height:100vh; overflow-x:hidden; }',
   '#sd-viewport { position:relative; width:1920px; height:1200px; transform-origin:top center; margin:20px auto 0; }',
   '.slide { position:absolute; top:0; left:0; width:1920px; height:1200px; overflow:hidden; opacity:0; transition:opacity 0.3s ease; pointer-events:none; }',
   '.slide.active { opacity:1; pointer-events:auto; }',
   '#sd-navbar { display:flex; align-items:center; gap:12px; padding:14px 24px; background:#1a1a1a; border-top:2px solid #333; width:100%; max-width:1200px; margin:0 auto; border-radius:0 0 8px 8px; }',
   '#sd-navbar button { background:#2a2a2a; color:#ddd; border:none; padding:8px 16px; border-radius:6px; cursor:pointer; font-size:14px; transition:background 0.2s; }',
   '#sd-navbar button:hover { background:#3a3a3a; }',
   '#sd-navbar button:disabled { opacity:0.3; cursor:default; }',
   '#sd-navbar .spacer { flex:1; }',
   '#sd-counter { color:#aaa; font-size:15px; min-width:70px; text-align:center; }',
   '#btn-download { background:#D50032 !important; color:white !important; font-weight:600; }',
   '#btn-download:hover { background:#B5002A !important; }',
   '.sd-panel { max-width:1200px; width:100%; margin:0 auto; max-height:0; overflow:hidden; transition:max-height 0.3s ease; background:#1e1e1e; border-radius:0 0 8px 8px; }',
   '.sd-panel.open { max-height:400px; overflow-y:auto; }',
   '#sd-notes { padding:0; }',
   '#sd-notes.open { padding:20px 28px; }',
   '#sd-notes-content { color:#bbb; font-size:15px; line-height:1.6; }',
   '#sd-colors { padding:0; }',
   '#sd-colors.open { padding:20px 28px; }',
   '.swatch-row { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; }',
   '.swatch { width:44px; height:44px; border-radius:8px; cursor:pointer; border:3px solid transparent; transition:border-color 0.2s, transform 0.15s; }',
   '.swatch:hover { transform:scale(1.1); }',
   '.swatch.active { border-color:#fff; }',
   '.hex-row { display:flex; align-items:center; gap:10px; }',
   '.hex-row input { background:#2a2a2a; border:1px solid #444; color:#eee; padding:8px 12px; border-radius:6px; font-size:14px; width:110px; }',
   '.hex-row button { background:#333; color:#ccc; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; font-size:13px; }',
   '#sd-logo { padding:0; }',
   '#sd-logo.open { padding:20px 28px; }',
   '#sd-logo-preview { width:120px; height:80px; background:#2a2a2a; border-radius:6px; display:flex; align-items:center; justify-content:center; margin-bottom:12px; overflow:hidden; }',
   '#sd-logo-preview img { max-width:100%; max-height:100%; }',
   '.logo-controls { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-top:12px; }',
   '.logo-controls label { color:#aaa; font-size:13px; }',
   '.logo-controls input[type=range] { width:150px; }',
   '.logo-controls select { background:#2a2a2a; color:#ddd; border:1px solid #444; padding:6px; border-radius:4px; }',
 ''].join('\n');
 document.head.appendChild(css);
}

function scaleViewport() {
 var vp = document.getElementById('sd-viewport');
 if (!vp) return;
 var navH = 120;
 var availW = window.innerWidth - 40;
 var availH = window.innerHeight - navH;
 var scale = Math.min(availW / 1920, availH / 1200);
 scale = Math.min(scale, 1);
 vp.style.transform = 'scale(' + scale + ')';
 vp.style.marginBottom = -(1200 * (1 - scale)) + 'px';
}

function showSlide(index) {
 if (index < 0 || index >= _totalSlides) return;
 _currentSlide = index;
 var slides = document.querySelectorAll('#sd-viewport .slide');
 slides.forEach(function (s) { s.classList.remove('active'); });
 if (slides[index]) slides[index].classList.add('active');
 var counter = document.getElementById('sd-counter');
 if (counter) counter.textContent = (index + 1) + ' / ' + _totalSlides;
 var prev = document.getElementById('btn-prev');
 var next = document.getElementById('btn-next');
 if (prev) prev.disabled = (index === 0);
 if (next) next.disabled = (index === _totalSlides - 1);
 updateNotes();
}

function buildNavBar() {
 var existing = document.getElementById('sd-navbar');
 if (existing) existing.remove();
 var nav = document.createElement('div');
 nav.id = 'sd-navbar';
 nav.innerHTML = [
   '<button id="btn-prev" title="Previous">◀</button>',
   '<span id="sd-counter">1 / ' + _totalSlides + '</span>',
   '<button id="btn-next" title="Next">▶</button>',
   '<span class="spacer"></span>',
   '<button id="btn-notes" title="Speaker Notes">📝</button>',
   '<button id="btn-color" title="Change Color">🎨</button>',
   '<button id="btn-logo" title="Manage Logo">🖼️</button>',
   '<button id="btn-download" title="Download PPTX">⬇️ Download</button>'
 ].join('');
 document.body.appendChild(nav);
 document.getElementById('btn-prev').addEventListener('click', function () { showSlide(_currentSlide - 1); });
 document.getElementById('btn-next').addEventListener('click', function () { showSlide(_currentSlide + 1); });
 document.getElementById('btn-notes').addEventListener('click', function () { togglePanel('sd-notes'); });
 document.getElementById('btn-color').addEventListener('click', function () { togglePanel('sd-colors'); });
 document.getElementById('btn-logo').addEventListener('click', function () { togglePanel('sd-logo'); });
 document.getElementById('btn-download').addEventListener('click', function () { exportPPTX(); });
}

var PANEL_IDS = ['sd-notes', 'sd-colors', 'sd-logo'];

function togglePanel(panelId) {
 var target = document.getElementById(panelId);
 if (!target) return;
 var isOpen = target.classList.contains('open');
 PANEL_IDS.forEach(function (id) {
   var p = document.getElementById(id);
   if (p) p.classList.remove('open');
 });
 if (!isOpen) target.classList.add('open');
}

function buildNotesPanel() {
 var existing = document.getElementById('sd-notes');
 if (existing) existing.remove();
 var panel = document.createElement('div');
 panel.id = 'sd-notes';
 panel.className = 'sd-panel';
 panel.innerHTML = '<div id="sd-notes-content">No speaker notes for this slide.</div>';
 document.body.appendChild(panel);
}

function updateNotes() {
 var content = document.getElementById('sd-notes-content');
 if (!content) return;
 var slide = _D[_currentSlide];
 if (slide && slide.notes) {
   content.textContent = slide.notes;
   content.style.fontStyle = 'normal';
   content.style.color = '#bbb';
 } else {
   content.textContent = 'No speaker notes for this slide.';
   content.style.fontStyle = 'italic';
   content.style.color = '#666';
 }
}

function buildColorPicker() {
 var existing = document.getElementById('sd-colors');
 if (existing) existing.remove();
 var panel = document.createElement('div');
 panel.id = 'sd-colors';
 panel.className = 'sd-panel';
 var swatchRow = document.createElement('div');
 swatchRow.className = 'swatch-row';
 var families = SD.ACCENT_FAMILIES;
 var currentAccent = SD.getAccent().mid;
 Object.keys(families).forEach(function (name) {
   var fam = families[name];
   var swatch = document.createElement('div');
   swatch.className = 'swatch' + (fam.mid === currentAccent ? ' active' : '');
   swatch.style.backgroundColor = fam.mid;
   swatch.setAttribute('data-family', name);
   swatch.title = name.charAt(0).toUpperCase() + name.slice(1);
   swatch.addEventListener('click', function () { applyColorFamily(name); });
   swatchRow.appendChild(swatch);
 });
 panel.appendChild(swatchRow);
 var hexRow = document.createElement('div');
 hexRow.className = 'hex-row';
 hexRow.innerHTML = [
   '<label style="color:#999;font-size:13px;">Custom:</label>',
   '<input type="text" id="sd-hex-input" placeholder="#D50032" maxlength="7">',
   '<button id="btn-apply-hex">Apply</button>',
   '<button id="btn-reset-color">Reset</button>'
 ].join('');
 panel.appendChild(hexRow);
 document.body.appendChild(panel);
 document.getElementById('btn-apply-hex').addEventListener('click', function () {
   var hex = document.getElementById('sd-hex-input').value.trim();
   if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
     SD.setAccent(hex);
     rerenderAll();
     updateSwatchStates();
   }
 });
 document.getElementById('btn-reset-color').addEventListener('click', function () {
   SD.setAccent('red');
   rerenderAll();
   updateSwatchStates();
   document.getElementById('sd-hex-input').value = '';
 });
}

function applyColorFamily(familyName) {
 SD.setAccent(familyName);
 rerenderAll();
 updateSwatchStates();
}

function updateSwatchStates() {
 var current = SD.getAccent().name;
 document.querySelectorAll('.swatch').forEach(function (s) {
   s.classList.toggle('active', s.getAttribute('data-family') === current);
 });
}

function rerenderAll() {
 var vp = document.getElementById('sd-viewport');
 if (!vp || _imageMode) return;
 SD.renderAll(_D, vp);
 _totalSlides = _D.length;
 showSlide(_currentSlide);
}

function buildLogoManager() {
 var existing = document.getElementById('sd-logo');
 if (existing) existing.remove();
 var panel = document.createElement('div');
 panel.id = 'sd-logo';
 panel.className = 'sd-panel';
 panel.innerHTML = [
   '<div id="sd-logo-preview"><span style="color:#666;font-size:13px;">No logo uploaded</span></div>',
   '<button id="btn-upload-logo" style="background:#2a2a2a;color:#ddd;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:13px;">📁 Upload Logo</button>',
   '<input type="file" id="sd-logo-file" accept=".png,.jpg,.jpeg,.svg" style="display:none;">',
   '<div class="logo-controls" id="sd-logo-controls" style="display:none;">',
   '  <label>Size:</label>',
   '  <input type="range" id="sd-logo-size" min="40" max="200" value="80">',
   '  <span id="sd-logo-size-lbl">80px</span>',
   '  <label>Position:</label>',
   '  <select id="sd-logo-pos">',
   '    <option value="top-right">Top Right</option>',
   '    <option value="top-left">Top Left</option>',
   '    <option value="bottom-right">Bottom Right</option>',
   '    <option value="bottom-left">Bottom Left</option>',
   '  </select>',
   '  <button id="btn-apply-logo">Apply to All</button>',
   '  <button id="btn-remove-logo">Remove</button>',
   '</div>'
 ].join('');
 document.body.appendChild(panel);
 document.getElementById('btn-upload-logo').addEventListener('click', function () { document.getElementById('sd-logo-file').click(); });
 document.getElementById('sd-logo-file').addEventListener('change', function (e) {
   var file = e.target.files[0];
   if (!file) return;
   if (file.size > 2 * 1024 * 1024) {
     alert('Logo must be under 2MB.');
     return;
   }
   var reader = new FileReader();
   reader.onload = function (ev) {
     var dataUri = ev.target.result;
     document.getElementById('sd-logo-preview').innerHTML = '<img src="' + dataUri + '">';
     document.getElementById('sd-logo-controls').style.display = 'flex';
     _customLogo = { src: dataUri, width: 80, position: 'top-right' };
   };
   reader.readAsDataURL(file);
 });
 document.getElementById('sd-logo-size').addEventListener('input', function (e) {
   var val = e.target.value;
   document.getElementById('sd-logo-size-lbl').textContent = val + 'px';
   if (_customLogo) _customLogo.width = parseInt(val);
 });
 document.getElementById('sd-logo-pos').addEventListener('change', function (e) { if (_customLogo) _customLogo.position = e.target.value; });
 document.getElementById('btn-apply-logo').addEventListener('click', function () { if (_customLogo) applyLogoToSlides(); });
 document.getElementById('btn-remove-logo').addEventListener('click', function () {
   _customLogo = null;
   removeLogoFromSlides();
   document.getElementById('sd-logo-preview').innerHTML = '<span style="color:#666;font-size:13px;">No logo uploaded</span>';
   document.getElementById('sd-logo-controls').style.display = 'none';
 });
}

function applyLogoToSlides() {
 removeLogoFromSlides();
 if (!_customLogo) return;
 var slides = document.querySelectorAll('#sd-viewport .slide');
 slides.forEach(function (slide) {
   var img = document.createElement('img');
   img.src = _customLogo.src;
   img.className = 'logo-custom';
   img.style.position = 'absolute';
   img.style.width = _customLogo.width + 'px';
   img.style.height = 'auto';
   var pos = _customLogo.position || 'top-right';
   if (pos.indexOf('top') > -1)    img.style.top = '30px';
   if (pos.indexOf('bottom') > -1) img.style.bottom = '30px';
   if (pos.indexOf('right') > -1)  img.style.right = '50px';
   if (pos.indexOf('left') > -1)   img.style.left = '50px';
   slide.appendChild(img);
 });
}

function removeLogoFromSlides() {
 document.querySelectorAll('.logo-custom').forEach(function (el) { el.remove(); });
}

function setupKeyboard() {
 document.addEventListener('keydown', function (e) {
   if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
   switch (e.key) {
     case 'ArrowLeft': e.preventDefault(); showSlide(_currentSlide - 1); break;
     case 'ArrowRight': e.preventDefault(); showSlide(_currentSlide + 1); break;
     case 'n': case 'N': togglePanel('sd-notes'); break;
     case 'Escape': PANEL_IDS.forEach(function(id) { var p = document.getElementById(id); if (p) p.classList.remove('open'); }); break;
   }
 });
}

function exportPPTX() {
 if (typeof PptxGenJS === 'undefined') {
   alert('PptxGenJS library not loaded. Cannot export.');
   return;
 }
 var pptx = new PptxGenJS();
 pptx.defineLayout({ name: 'SD_LAYOUT', width: 13.33, height: 7.5 });
 pptx.layout = 'SD_LAYOUT';
 pptx.author = 'Standard Presentation Builder';
 pptx.subject = _config.title || 'Presentation';
 var accent = SD.getAccent();
 pptx.defineSlideMaster({
   title: 'SD_DARK',
   background: { color: '191919' },
   objects: [
     { rect: { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: accent.mid.replace('#', '') } } },
     { text: { text: 'Confidential', options: { x: 0.3, y: 7.1, w: 4, h: 0.3, fontSize: 8, color: '8B8C81', fontFace: 'Mazda Type, Classico URW, Montserrat, sans-serif' } } }
   ]
 });
 pptx.defineSlideMaster({
   title: 'SD_LIGHT',
   background: { color: 'F5F5F5' },
   objects: [
     { rect: { x: 0, y: 0, w: 0.06, h: 7.5, fill: { color: accent.mid.replace('#', '') } } },
     { text: { text: 'Confidential', options: { x: 0.3, y: 7.1, w: 4, h: 0.3, fontSize: 8, color: '53544A', fontFace: 'Mazda Type, Classico URW, Montserrat, sans-serif' } } }
   ]
 });
 _D.forEach(function (slideData, index) {
   var isDark = !!slideData.dark;
   var master = isDark ? 'SD_DARK' : 'SD_LIGHT';
   var slide = pptx.addSlide({ masterName: master });
   var els;
   if (slideData.layout && window.DeckLayouts) {
     els = window.DeckLayouts.dispatch(slideData);
   } else {
     els = slideData.els || [];
   }
   els = SD.enforceWidthRule(els);
   els.forEach(function (el) { exportElement(slide, el, isDark, accent); });
   if (slideData.num) {
     slide.addText(slideData.num, { x: 12.3, y: 0.15, w: 0.8, h: 0.3, fontSize: 10, fontFace: 'Mazda Type, Classico URW, Montserrat, sans-serif', bold: true, color: isDark ? 'F5F5F5' : '191919', align: 'right' });
   }
   if (slideData.notes) slide.addNotes(slideData.notes);
   if (_customLogo && !_noLogo) {
     var logoPos = getLogoPosition(_customLogo);
     slide.addImage({ data: _customLogo.src, x: logoPos.x, y: logoPos.y, w: _customLogo.width / 144, h: (_customLogo.width * 0.5) / 144 });
   }
 });
 var title = sanitizeFileName(_config.title || 'Presentation');
 var fileName = title + '_' + _D.length + 'slides.pptx';
 pptx.writeFile({ fileName: fileName });
}

function exportElement(slide, el, isDark, accent) {
 var exporters = { t: exportText, s: exportShape, o: exportOval, d: exportDivider, p: exportPill, b: exportBar, chart: exportChart, tbl: exportTable, i: exportIcon, img: exportImage };
 var fn = exporters[el.type];
 if (fn) fn(slide, el, isDark, accent);
}

function exportText(slide, el, isDark) {
 slide.addText(el.text || '', {
   x: el.x, y: el.y, w: el.w, h: el.h,
   fontSize: el.size, fontFace: 'Mazda Type, Classico URW, Montserrat, sans-serif',
   bold: el.font === 'H' || el.bold, italic: !!el.italic,
   color: SD.colorForPptx(el.color || 'body', isDark),
   align: el.align || 'left', valign: el.valign || 'top',
   lineSpacingMultiple: 1.35, wrap: true
 });
}

function exportShape(slide, el, isDark) {
 var opts = { x: el.x, y: el.y, w: el.w, h: el.h, fill: { color: SD.colorForPptx(el.fill || 'cardBg', isDark) } };
 if (el.border) opts.line = { color: SD.colorForPptx(el.border, isDark), width: 1 };
 if (el.transparency) opts.fill.transparency = el.transparency;
 slide.addShape(pptx.shapes.RECTANGLE, opts);
}

function exportOval(slide, el, isDark) {
 slide.addShape(pptx.shapes.OVAL, { x: el.x, y: el.y, w: el.w, h: el.h, fill: { color: SD.colorForPptx(el.fill || 'accent', isDark) } });
}

function exportDivider(slide, el, isDark) {
 slide.addShape(pptx.shapes.RECTANGLE, { x: el.x, y: el.y, w: el.w, h: 0.015, fill: { color: SD.colorForPptx(el.color || 'ltGray', isDark) } });
}

function exportPill(slide, el, isDark) {
 slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, { x: el.x, y: el.y, w: el.w, h: el.h, fill: { color: SD.colorForPptx(el.fill || 'accent', isDark) }, rectRadius: 0.15 });
 slide.addText(el.text || '', { x: el.x, y: el.y, w: el.w, h: el.h, fontSize: el.size || 9, fontFace: 'Mazda Type, Classico URW, Montserrat, sans-serif', bold: true, color: SD.colorForPptx(el.color || 'white', isDark), align: 'center', valign: 'middle' });
}

function exportBar(slide, el, isDark) {
 slide.addShape(pptx.shapes.RECTANGLE, { x: el.x, y: el.y, w: el.w, h: el.h, fill: { color: SD.colorForPptx(el.fill || 'accent', isDark) } });
}

function exportIcon(slide, el) {
 slide.addText(el.icon || '', { x: el.x, y: el.y, w: el.w, h: el.h, fontSize: Math.min(el.w, el.h) * 72 * 0.55, align: 'center', valign: 'middle' });
}

function exportChart(slide, el, isDark, accent) {
 var chartTypeMap = { bar: 'BAR', line: 'LINE', pie: 'PIE', doughnut: 'DOUGHNUT', area: 'AREA' };
 var pptxType = pptx.charts[chartTypeMap[el.chartType] || 'BAR'];
 var opts = el.opts || {};
 var resolvedColors = (opts.chartColors || ['accent', 'dkGray']).map(function (token) { return SD.colorForPptx(token, isDark); });
 var chartOpts = {
   x: el.x, y: el.y, w: el.w, h: el.h,
   chartColors: resolvedColors,
   showValue: opts.showValue !== false, showTitle: !!opts.showTitle, title: opts.title || '', titleColor: SD.colorForPptx('title', isDark), titleFontSize: 12,
   showLegend: opts.showLegend || false, legendPos: opts.legendPos || 'b', legendColor: SD.colorForPptx('body', isDark)
 };
 if (el.chartType === 'bar') {
   chartOpts.barGrouping = opts.barGrouping || 'clustered';
   chartOpts.barDir = opts.barDir || 'bar';
   chartOpts.valAxisHidden = opts.valAxisHidden || false;
   chartOpts.catAxisFontSize = 10;
   chartOpts.valAxisFontSize = 10;
   chartOpts.dataLabelPosition = opts.dataLabelPosition || 'outEnd';
   chartOpts.dataLabelColor = SD.colorForPptx(opts.dataLabelColor || 'title', isDark);
 }
 if (el.chartType === 'pie' || el.chartType === 'doughnut') {
   chartOpts.showPercent = opts.showPercent !== false;
   chartOpts.showValue = opts.showValue || false;
   chartOpts.dataLabelColor = SD.colorForPptx(opts.dataLabelColor || 'white', isDark);
   if (el.chartType === 'doughnut') chartOpts.holeSize = opts.holeSize || 70;
 }
 slide.addChart(pptxType, el.data, chartOpts);
}

function exportTable(slide, el, isDark, accent) {
 var headers = el.headers || [];
 var rows = el.rows || [];
 var tableRows = [];
 if (headers.length) {
   tableRows.push(headers.map(function(h) { 
     return { 
       text: h, 
       options: { 
         bold: true, 
         fill: { color: SD.colorForPptx('accent', isDark) }, 
         color: 'FFFFFF', 
         fontSize: 11, 
         fontFace: 'Mazda Type, Classico URW, Montserrat, sans-serif' 
       }
     }; 
   }));
 }
 rows.forEach(function (row, ri) {
   tableRows.push((Array.isArray(row) ? row : [row]).map(function(cell) { 
     return { 
       text: String(cell), 
       options: { 
         fontSize: 10, 
         fontFace: 'Mazda Type, Classico URW, Montserrat, sans-serif', 
         color: SD.colorForPptx('body', isDark), 
         fill: ri % 2 === 0 ? { color: isDark ? '363732' : 'F5F5F5' } : { color: isDark ? '2A2A2A' : 'FFFFFF' } 
       }
     }; 
   }));
 });
 slide.addTable(tableRows, { x: el.x, y: el.y, w: el.w, fontSize: 10, fontFace: 'Mazda Type, Classico URW, Montserrat, sans-serif', border: { type: 'solid', color: 'C2C4B8', pt: 0.5 }, colW: el.colW || undefined });
}

function exportImage(slide, el) {
 var imgEl = document.getElementById(el.ref);
 if (!imgEl) return;
 var img = imgEl.querySelector('img');
 if (img && img.src && img.src.indexOf('data:') === 0) {
   slide.addImage({ data: img.src, x: el.x, y: el.y, w: el.w, h: el.h });
 }
}

function getLogoPosition(logo) {
 var pos = logo.position || 'top-right';
 var wInches = logo.width / 144;
 return { x: pos.indexOf('right') > -1 ? 13.33 - wInches - 0.3 : 0.3, y: pos.indexOf('bottom') > -1 ? 7.0 : 0.15 };
}

function sanitizeFileName(title) {
 return title.replace(/[^a-zA-Z0-9\s_-]/g, '').replace(/\s+/g, '_').substring(0, 40);
}

function deckInit(config) {
 config = config || {};
 _config = config;
 _D = window.D || [];
 _totalSlides = _D.length;
 _noLogo = !!config.noLogo;
 _imageMode = !!config.imageMode;
 injectStyles();
 if (config.accent) {
   SD.setAccent(config.accent);
 } else if (window.AH) {
   SD.setAccent(window.AH, window.AL, window.AD);
 }
 var vp = document.getElementById('sd-viewport');
 if (!vp) {
   vp = document.createElement('div');
   vp.id = 'sd-viewport';
   document.body.appendChild(vp);
 }
 if (!_imageMode) {
   SD.renderAll(_D, vp);
 }
 buildNavBar();
 buildNotesPanel();
 buildColorPicker();
 buildLogoManager();
 setupKeyboard();
 window.addEventListener('resize', scaleViewport);
 scaleViewport();
 showSlide(0);
}

window.StandardShell = {
 init: deckInit,
 showSlide: showSlide,
 exportPPTX: exportPPTX,
 rerenderAll: rerenderAll,
 getConfig: function () { return _config; },
 getState: function () { return { currentSlide: _currentSlide, totalSlides: _totalSlides, customLogo: _customLogo, noLogo: _noLogo, imageMode: _imageMode }; }
};
window.deckInit = deckInit;

})();