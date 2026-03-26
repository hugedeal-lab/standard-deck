/* ============================================================
deck-layouts.js v2.0 — Layout Shortcut Library
Depends on: standard-deck.js (for constants only)
============================================================ */

(function () {
'use strict';

var SD = window.StandardDeck;
if (!SD) {
 console.error('[deck-layouts] standard-deck.js must load first');
 return;
}

var TAG_Y     = 0.56;
var TAG_H     = 0.25;
var TITLE_Y   = 0.85;
var TITLE_H   = 0.45;
var CONTENT_Y = 1.55;
var LEFT_X    = 0.50;
var RIGHT_X   = 12.83;
var FULL_W    = RIGHT_X - LEFT_X;

function tagTitle(tag, title, isDark) {
 var els = [];
 if (tag) {
   els.push({
     type: 't', text: tag.toUpperCase(), x: LEFT_X, y: TAG_Y,
     w: FULL_W, h: TAG_H, font: 'H', size: 11, color: 'accent'
   });
 }
 if (title) {
   els.push({
     type: 't', text: title, x: LEFT_X, y: TITLE_Y,
     w: FULL_W, h: TITLE_H, font: 'H', size: 33, color: 'title'
   });
 }
 return els;
}

function colPositions(count, gap) {
 gap = gap || 0.25;
 var totalGap = gap * (count - 1);
 var colW = (FULL_W - totalGap) / count;
 var cols = [];
 for (var i = 0; i < count; i++) {
   cols.push({ x: LEFT_X + i * (colW + gap), w: colW });
 }
 return cols;
}

function layoutCover(cfg) {
 var els = [];
 if (cfg.tag) {
   els.push({
     type: 't', text: cfg.tag.toUpperCase(),
     x: LEFT_X, y: 2.20, w: FULL_W, h: 0.30,
     font: 'H', size: 11, color: 'accent'
   });
 }
 var titleSize = (cfg.title && cfg.title.length > 30) ? 38 : 42;
 els.push({
   type: 't', text: cfg.title || 'Untitled',
   x: LEFT_X, y: 2.55, w: FULL_W, h: 0.80,
   font: 'H', size: titleSize, color: 'title'
 });
 if (cfg.subtitle) {
   els.push({
     type: 't', text: cfg.subtitle,
     x: LEFT_X, y: 3.45, w: FULL_W, h: 0.45,
     font: 'H', size: 18, color: 'sub'
   });
 }
 if (cfg.date || cfg.description) {
   els.push({
     type: 't', text: cfg.date || cfg.description,
     x: LEFT_X, y: 4.00, w: FULL_W, h: 0.35,
     font: 'B', size: 12, color: 'body'
   });
 }
 return els;
}

function layoutClosing(cfg) {
 var els = [];
 var titleSize = (cfg.title && cfg.title.length > 30) ? 38 : 42;
 els.push({
   type: 't', text: cfg.title || 'Thank You',
   x: LEFT_X, y: 2.60, w: FULL_W, h: 0.80,
   font: 'H', size: titleSize, color: 'title'
 });
 if (cfg.subtitle) {
   els.push({
     type: 't', text: cfg.subtitle,
     x: LEFT_X, y: 3.50, w: FULL_W, h: 0.45,
     font: 'H', size: 18, color: 'sub'
   });
 }
 if (cfg.attribution) {
   els.push({
     type: 't', text: cfg.attribution,
     x: LEFT_X, y: 4.10, w: FULL_W, h: 0.30,
     font: 'B', size: 11, color: 'muted'
   });
 }
 return els;
}

function layoutDivider(cfg) {
 var els = [];
 els.push({
   type: 't', text: cfg.title || '',
   x: LEFT_X, y: 2.80, w: FULL_W, h: 0.65,
   font: 'H', size: 36, color: 'title'
 });
 if (cfg.subtitle) {
   els.push({
     type: 't', text: cfg.subtitle,
     x: LEFT_X, y: 3.55, w: FULL_W, h: 0.40,
     font: 'B', size: 16, color: 'sub'
   });
 }
 return els;
}

function layoutAgenda(cfg) {
 var items = cfg.items || [];
 var els = tagTitle(cfg.tag, cfg.title);
 var rowH = 0.70;
 var gap  = 0.18;
 var startY = CONTENT_Y;
 items.forEach(function (item, i) {
   if (i >= SD.LIMITS.rows + 1) return;
   var ry = startY + i * (rowH + gap);
   els.push({
     type: 's', x: LEFT_X, y: ry,
     w: FULL_W, h: rowH, fill: 'cardBg', border: 'cardBorder'
   });
   if (cfg.numbered) {
     els.push({
       type: 't', text: String(i + 1).padStart(2, '0'),
       x: LEFT_X + 0.20, y: ry, w: 0.80, h: rowH,
       font: 'H', size: 18, color: 'accent', valign: 'middle'
     });
   }
   var textX = cfg.numbered ? LEFT_X + 1.20 : LEFT_X + 0.25;
   var textW = cfg.numbered ? FULL_W * 0.80 - 1.0 : FULL_W * 0.80;
   els.push({
     type: 't', text: item.title || '',
     x: textX, y: ry, w: textW * 0.35, h: rowH,
     font: 'H', size: 14, color: 'title', valign: 'middle'
   });
   if (item.text) {
     els.push({
       type: 't', text: item.text,
       x: textX + textW * 0.38, y: ry, w: textW * 0.55, h: rowH,
       font: 'B', size: 12, color: 'body', valign: 'middle'
     });
   }
 });
 return els;
}

function layoutCards(cfg) {
 var items   = cfg.items || [];
 var cols    = colPositions(cfg.columns || 3);
 var els     = tagTitle(cfg.tag, cfg.title);
 var cardH   = 3.50;
 var cardY   = CONTENT_Y;
 items.forEach(function (item, i) {
   if (i >= SD.LIMITS.cards) return;
   var col = cols[i % cols.length];
   var cy  = cardY + Math.floor(i / cols.length) * (cardH + 0.25);
   var iw  = col.w * 0.80;
   var ix  = col.x + (col.w - iw) / 2;
   els.push({
     type: 's', x: col.x, y: cy,
     w: col.w, h: cardH, fill: 'cardBg', border: 'cardBorder'
   });
   var curY = cy + 0.30;
   if (item.icon) {
     els.push({ type: 'i', icon: item.icon, x: ix, y: curY, w: 0.45, h: 0.45 });
     curY += 0.55;
   }
   if (item.title) {
     els.push({ type: 't', text: item.title, x: ix, y: curY, w: iw, h: 0.35, font: 'H', size: 15, color: 'title' });
     curY += 0.45;
   }
   els.push({ type: 'd', x: ix, y: curY, w: iw, color: 'ltGray' });
   curY += 0.20;
   if (item.text) {
     els.push({ type: 't', text: item.text, x: ix, y: curY, w: iw, h: 1.20, font: 'B', size: 12, color: 'body' });
     curY += 1.30;
   }
   if (item.sub) {
     els.push({ type: 't', text: item.sub, x: ix, y: curY, w: iw, h: 0.30, font: 'B', size: 10, color: 'muted' });
   }
   if (item.pill) {
     var pillColor = item.pillColor || 'accent';
     els.push({ type: 'p', text: item.pill, x: ix, y: cy + cardH - 0.50, w: 1.30, h: 0.30, fill: pillColor, color: 'white', size: 9 });
   }
 });
 return els;
}

function layoutStats(cfg) {
 var items    = cfg.items || [];
 var numCols  = cfg.columns || 3;
 var numRows  = cfg.rows || 1;
 var cols     = colPositions(numCols);
 var els      = tagTitle(cfg.tag, cfg.title);
 var cellH = numRows > 1 ? 2.20 : 3.50;
 var cellGap = 0.25;
 items.forEach(function (item, i) {
   if (i >= SD.LIMITS.stats) return;
   var ci  = i % numCols;
   var ri  = Math.floor(i / numCols);
   var col = cols[ci];
   var cy  = CONTENT_Y + ri * (cellH + cellGap);
   var iw  = col.w * 0.80;
   var ix  = col.x + (col.w - iw) / 2;
   els.push({ type: 's', x: col.x, y: cy, w: col.w, h: cellH, fill: 'cardBg', border: 'cardBorder' });
   els.push({ type: 't', text: item.value || '—', x: ix, y: cy + 0.30, w: iw, h: 0.80, font: 'H', size: 42, color: 'accent' });
   if (item.label) {
     els.push({ type: 't', text: item.label, x: ix, y: cy + 1.15, w: iw, h: 0.30, font: 'H', size: 13, color: 'title' });
   }
   if (item.text) {
     els.push({ type: 'd', x: ix, y: cy + 1.55, w: iw, color: 'ltGray' });
     els.push({ type: 't', text: item.text, x: ix, y: cy + 1.70, w: iw, h: 0.80, font: 'B', size: 11, color: 'body' });
   }
 });
 return els;
}

function layoutMetrics(cfg) {
 var items   = cfg.items || [];
 var numCols = Math.min(items.length, 3);
 var cols    = colPositions(numCols);
 var els     = tagTitle(cfg.tag, cfg.title);
 var cellH = 2.00;
 var cellGap = 0.25;
 items.forEach(function (item, i) {
   if (i >= SD.LIMITS.stats) return;
   var ci  = i % numCols;
   var ri  = Math.floor(i / numCols);
   var col = cols[ci];
   var cy  = CONTENT_Y + ri * (cellH + cellGap);
   var iw  = col.w * 0.80;
   var ix  = col.x + (col.w - iw) / 2;
   els.push({ type: 's', x: col.x, y: cy, w: col.w, h: cellH, fill: 'cardBg', border: 'cardBorder' });
   els.push({ type: 't', text: item.value || '—', x: ix, y: cy + 0.20, w: iw * 0.65, h: 0.65, font: 'H', size: 36, color: 'title' });
   if (item.trend) {
     var trendColor = item.trendDir === 'up' ? 'ok' : item.trendDir === 'down' ? 'bad' : 'warn';
     var arrow = item.trendDir === 'up' ? '▲' : item.trendDir === 'down' ? '▼' : '●';
     els.push({ type: 'p', text: arrow + ' ' + item.trend, x: ix + iw * 0.65 + 0.10, y: cy + 0.35, w: 1.10, h: 0.30, fill: trendColor, color: 'white', size: 9 });
   }
   if (item.label) {
     els.push({ type: 't', text: item.label, x: ix, y: cy + 1.05, w: iw, h: 0.30, font: 'B', size: 12, color: 'body' });
   }
 });
 return els;
}

function layoutSplit(cfg) {
 var items = cfg.items || [{}, {}];
 var cols  = colPositions(2, 0.30);
 var els   = tagTitle(cfg.tag, cfg.title);
 items.forEach(function (item, i) {
   if (i > 1) return;
   var col = cols[i];
   var iw  = col.w * 0.80;
   var ix  = col.x + (col.w - iw) / 2;
   els.push({ type: 's', x: col.x, y: CONTENT_Y, w: col.w, h: 4.80, fill: 'cardBg', border: 'cardBorder' });
   if (item.title) {
     els.push({ type: 't', text: item.title, x: ix, y: CONTENT_Y + 0.25, w: iw, h: 0.35, font: 'H', size: 18, color: 'accent' });
     els.push({ type: 'd', x: ix, y: CONTENT_Y + 0.70, w: iw, color: 'accent' });
   }
   if (item.text) {
     els.push({ type: 't', text: item.text, x: ix, y: CONTENT_Y + 0.90, w: iw, h: 3.60, font: 'B', size: 13, color: 'body' });
   }
 });
 return els;
}

function layoutRows(cfg) {
 var items = cfg.items || [];
 var els   = tagTitle(cfg.tag, cfg.title);
 var rowH  = 0.85;
 var gap   = 0.18;
 items.forEach(function (item, i) {
   if (i >= SD.LIMITS.rows) return;
   var ry = CONTENT_Y + i * (rowH + gap);
   els.push({ type: 's', x: LEFT_X, y: ry, w: FULL_W, h: rowH, fill: 'cardBg', border: 'cardBorder' });
   if (cfg.numbered) {
     els.push({ type: 't', text: String(i + 1).padStart(2, '0'), x: LEFT_X + 0.20, y: ry, w: 0.80, h: rowH, font: 'H', size: 18, color: 'accent', valign: 'middle' });
   }
   var textX = cfg.numbered ? LEFT_X + 1.20 : LEFT_X + 0.25;
   var maxW  = FULL_W * 0.80;
   els.push({ type: 't', text: item.title || '', x: textX, y: ry, w: maxW * 0.30, h: rowH, font: 'H', size: 14, color: 'title', valign: 'middle' });
   if (item.text) {
     els.push({ type: 't', text: item.text, x: textX + maxW * 0.33, y: ry, w: maxW * 0.60, h: rowH, font: 'B', size: 12, color: 'body', valign: 'middle' });
   }
 });
 return els;
}

function layoutDetail(cfg) {
 var items = cfg.items || [];
 var els   = tagTitle(cfg.tag, cfg.title);
 var cardW = 8.00;
 var cardX = (13.33 - cardW) / 2;
 var rowH  = 0.60;
 var cardH = 0.50 + items.length * rowH + 0.30;
 els.push({ type: 's', x: cardX, y: CONTENT_Y, w: cardW, h: cardH, fill: 'cardBg', border: 'cardBorder' });
 var iw = cardW * 0.80;
 var ix = cardX + (cardW - iw) / 2;
 items.forEach(function (item, i) {
   var ry = CONTENT_Y + 0.30 + i * rowH;
   if (item.icon) {
     els.push({ type: 'i', icon: item.icon, x: ix, y: ry + 0.05, w: 0.35, h: 0.35 });
   }
   var labelX = item.icon ? ix + 0.45 : ix;
   els.push({ type: 't', text: item.label || '', x: labelX, y: ry, w: iw * 0.35, h: rowH, font: 'H', size: 12, color: 'muted', valign: 'middle' });
   els.push({ type: 't', text: item.value || '', x: labelX + iw * 0.38, y: ry, w: iw * 0.55, h: rowH, font: 'B', size: 13, color: 'title', valign: 'middle' });
   if (i < items.length - 1) {
     els.push({ type: 'd', x: ix, y: ry + rowH - 0.02, w: iw, color: 'ltGray' });
   }
 });
 return els;
}

function layoutBullets(cfg) {
 var items = cfg.items || [];
 var els   = tagTitle(cfg.tag, cfg.title);
 var bulletH = 0.45;
 var bulletGap = 0.10;
 items.forEach(function (text, i) {
   if (i >= SD.LIMITS.bullets) return;
   var by = CONTENT_Y + i * (bulletH + bulletGap);
   els.push({ type: 'o', x: LEFT_X + 0.10, y: by + 0.15, w: 0.12, h: 0.12, fill: 'accent' });
   els.push({ type: 't', text: text, x: LEFT_X + 0.40, y: by, w: FULL_W - 0.50, h: bulletH, font: 'B', size: 15, color: 'body', valign: 'middle' });
 });
 return els;
}

var LAYOUT_MAP = {
 cover:    layoutCover,
 closing:  layoutClosing,
 divider:  layoutDivider,
 agenda:   layoutAgenda,
 cards:    layoutCards,
 stats:    layoutStats,
 metrics:  layoutMetrics,
 split:    layoutSplit,
 rows:     layoutRows,
 detail:   layoutDetail,
 bullets:  layoutBullets
};

function dispatch(slideData) {
 var fn = LAYOUT_MAP[slideData.layout];
 if (!fn) {
   console.warn('[deck-layouts] Unknown layout: ' + slideData.layout);
   return [];
 }
 return fn(slideData);
}

window.DeckLayouts = {
 dispatch: dispatch,
 layouts:  LAYOUT_MAP,
 cover: layoutCover, closing: layoutClosing,
 divider: layoutDivider, agenda: layoutAgenda,
 cards: layoutCards, stats: layoutStats,
 metrics: layoutMetrics, split: layoutSplit,
 rows: layoutRows, detail: layoutDetail,
 bullets: layoutBullets
};

})();