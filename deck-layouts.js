/* ============================================================
   deck-layouts.js v5.1.1 -- Layout Shortcut Library
   Depends on: standard-deck.js (for SD_CONST, getTitleMetrics)
   ============================================================ */

(function () {
  'use strict';

  // Ensure the base StandardDeck object and its constants are loaded.
  var SD = window.StandardDeck;
  if (!SD || !SD.SD_CONST) {
    console.error('[deck-layouts] FATAL: standard-deck.js v5.1+ must load first.');
    return;
  }

  var C = SD.SD_CONST;

  // ============================================================
  // V5.1.1: SHARED HEADER RENDERER
  // ============================================================

  /**
   * Generates element objects for the standard header (tag + title).
   * This is the universal starting point for almost all layouts.
   *
   * @param {object} slide - The slide data object from the D array.
   * @returns {object} An object containing the element array `els`
   *                   and the calculated `contentY` to start content.
   */
  function renderHeader(slide) {
    var els = [];
    var metrics = SD.getTitleMetrics(slide.title);

    // Create Tag element if it exists
    if (slide.tag) {
      els.push({
        type: 't',
        text: slide.tag,
        x:     C.SAFE_X_MIN,
        y:     C.TAG_Y,
        w:     11.00,
        h:     C.TAG_H,
        font:  'H',
        size:  11,
        color: 'accent' // Color token is resolved by the renderer
      });
    }

    // Create Title element if it exists
    if (slide.title) {
      els.push({
        type: 't',
        text:  slide.title,
        x:     C.SAFE_X_MIN,
        y:     C.TITLE_Y,
        w:     11.00,
        h:     metrics.titleH, // Dynamically 0.55" or 0.90"
        font:  'H',
        size:  33,
        color: 'title'
      });
    }

    // Return the header elements and the correct starting Y for content
    return {
      els:      els,
      contentY: metrics.contentY // Dynamically 2.10" or 2.30"
    };
  }

  // ============================================================
  // GRID HELPER
  // ============================================================
  function getGrid(colCount) {
    var key = 'col' + colCount;
    return C.GRID[key] || C.GRID.col3; // Default to 3 columns if invalid
  }


  // ============================================================
  // LAYOUT: COVER (unique positioning, always dark)
  // ============================================================
  function layoutCover(cfg) {
    var els = [];
    // Cover does not use renderHeader(), but does use its constants and logic
    var metrics = SD.getTitleMetrics(cfg.title);

    if (cfg.tag) {
      els.push({
        type: 't', text: cfg.tag, x: C.SAFE_X_MIN, y: C.TAG_Y,
        w: 11.00, h: C.TAG_H, font: 'H', size: 11, color: 'accent'
      });
    }

    els.push({
      type: 't', text: cfg.title, x: C.SAFE_X_MIN, y: C.TITLE_Y,
      w: 11.00, h: metrics.titleH,
      font: 'H', size: 42, color: 'title'
    });

    var subY = C.TITLE_Y + metrics.titleH + 0.15;
    if (cfg.subtitle) {
      els.push({
        type: 't', text: cfg.subtitle, x: C.SAFE_X_MIN, y: subY,
        w: 11.00, h: 0.40, font: 'H', size: 22, color: 'sub'
      });
    }

    var dateY = subY + 0.50;
    if (cfg.date) {
      els.push({
        type: 't', text: cfg.date, x: C.SAFE_X_MIN, y: dateY,
        w: 11.00, h: 0.30, font: 'B', size: 13, color: 'body'
      });
    }
    return els;
  }

  // ============================================================
  // LAYOUT: CLOSING (unique positioning, always dark)
  // ============================================================
  function layoutClosing(cfg) {
    var els = [];
    var metrics = SD.getTitleMetrics(cfg.title);

    els.push({
      type: 't', text: cfg.title, x: C.SAFE_X_MIN, y: C.TITLE_Y,
      w: 11.00, h: metrics.titleH,
      font: 'H', size: 42, color: 'title'
    });

    var subY = C.TITLE_Y + metrics.titleH + 0.15;
    if (cfg.subtitle) {
      els.push({
        type: 't', text: cfg.subtitle, x: C.SAFE_X_MIN, y: subY,
        w: 11.00, h: 0.40, font: 'H', size: 22, color: 'sub'
      });
    }

    if (cfg.attribution) {
      els.push({
        type: 't', text: cfg.attribution, x: C.SAFE_X_MIN,
        y: subY + 0.50, w: 11.00, h: 0.30,
        font: 'B', size: 11, color: 'body'
      });
    }
    return els;
  }

  // ============================================================
  // LAYOUT: DIVIDER (unique positioning, always dark)
  // ============================================================
  function layoutDivider(cfg) {
    var centerY = (C.SLIDE_H - 1.50) / 2;
    var els = [{
      type: 't', text: cfg.title, x: C.SAFE_X_MIN, y: centerY,
      w: 11.00, h: 0.70, font: 'H', size: 42,
      color: 'title', valign: 'middle'
    }];

    if (cfg.subtitle) {
      els.push({
        type: 't', text: cfg.subtitle, x: C.SAFE_X_MIN,
        y: centerY + 0.80, w: 11.00, h: 0.40,
        font: 'B', size: 18, color: 'sub'
      });
    }
    return els;
  }

  // ============================================================
  // LAYOUT: CARDS (2/3/4 columns)
  // ============================================================
  function layoutCards(cfg) {
    var header = renderHeader(cfg);
    var els = header.els;
    var startY = header.contentY;
    var isDark = cfg.dark === 1;

    var items = cfg.items || [];
    var cols = cfg.columns || 3;
    var grid = getGrid(cols);
    var rows = Math.ceil(items.length / cols);

    var availH = C.CONTENT_END - startY;
    var cardH = (availH - (C.GAP * (rows - 1))) / rows;

    items.forEach(function(item, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var cx = grid.cols[col].x;
      var cw = grid.cols[col].w;
      var cy = startY + row * (cardH + C.GAP);

      els.push({
        type: 's', x: cx, y: cy, w: cw, h: cardH,
        fill: 'cardBg', border: isDark ? null : 'cardBorder'
      });

      var textW = cw * C.TEXT_RATIO;
      var textX = cx + (cw - textW) / 2;
      var innerY = cy + 0.20;

      if (item.icon) {
        els.push({ type: 'i', icon: item.icon, x: textX, y: innerY, w: 0.50, h: 0.50 });
        innerY += 0.60;
      }
      if (item.title) {
        els.push({ type: 't', text: item.title, x: textX, y: innerY, w: textW, h: 0.30, font: 'H', size: 15, color: 'title' });
        innerY += 0.40;
      }
      if (item.text) {
        els.push({ type: 't', text: item.text, x: textX, y: innerY, w: textW, h: cardH - (innerY - cy) - 0.60, font: 'B', size: 13, color: 'body' });
      }
      if (item.pill) {
        els.push({ type: 'p', text: item.pill, x: textX, y: cy + cardH - 0.45, w: 1.50, h: 0.30, fill: item.pillColor || 'accent', color: '#FFFFFF', size: 9 });
      }
    });
    return els;
  }

  // ============================================================
  // LAYOUT: STATS (big number grid)
  // ============================================================
  function layoutStats(cfg) {
    var header = renderHeader(cfg);
    var els = header.els;
    var startY = header.contentY;
    var isDark = cfg.dark === 1;

    var items = cfg.items || [];
    var cols = cfg.columns || 3;
    var rows = cfg.rows || 2;
    var grid = getGrid(cols);

    var availH = C.CONTENT_END - startY;
    var cellH = (availH - (C.GAP * (rows - 1))) / rows;

    items.forEach(function(item, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var cx = grid.cols[col].x;
      var cw = grid.cols[col].w;
      var cy = startY + row * (cellH + C.GAP);
      var textW = cw * C.TEXT_RATIO;
      var textX = cx + (cw - textW) / 2;

      els.push({ type: 's', x: cx, y: cy, w: cw, h: cellH, fill: 'cardBg', border: isDark ? null : 'cardBorder' });
      els.push({ type: 't', text: item.value, x: textX, y: cy + 0.20, w: textW, h: 0.60, font: 'H', size: 44, color: 'accent' });
      els.push({ type: 't', text: item.label, x: textX, y: cy + 0.90, w: textW, h: 0.25, font: 'H', size: 13, color: 'title' });
      if (item.text) {
        els.push({ type: 't', text: item.text, x: textX, y: cy + 1.25, w: textW, h: cellH - 1.55, font: 'B', size: 11, color: 'body' });
      }
    });
    return els;
  }

  // ============================================================
  // LAYOUT: METRICS (KPI dashboard with trends)
  // ============================================================
  function layoutMetrics(cfg) {
    var header = renderHeader(cfg);
    var els = header.els;
    var startY = header.contentY;
    var isDark = cfg.dark === 1;

    var items = cfg.items || [];
    var cols = Math.min(items.length, 4);
    var rows = Math.ceil(items.length / cols);
    var grid = getGrid(cols);

    var availH = C.CONTENT_END - startY;
    var cellH = (availH - (C.GAP * (rows - 1))) / rows;

    items.forEach(function(item, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var cx = grid.cols[col].x;
      var cw = grid.cols[col].w;
      var cy = startY + row * (cellH + C.GAP);
      var textW = cw * C.TEXT_RATIO;
      var textX = cx + (cw - textW) / 2;

      els.push({ type: 's', x: cx, y: cy, w: cw, h: cellH, fill: 'cardBg', border: isDark ? null : 'cardBorder' });
      els.push({ type: 't', text: item.value, x: textX, y: cy + 0.30, w: textW * 0.60, h: 0.60, font: 'H', size: 44, color: 'title' });

      if (item.trend) {
        var trendColor = item.trendDir === 'up' ? 'ok' : 'bad';
        var arrow = item.trendDir === 'up' ? 'â–²' : 'â–¼';
        els.push({ type: 'p', text: arrow + ' ' + item.trend, x: textX + (textW * 0.60) + 0.15, y: cy + 0.40, w: 1.20, h: 0.30, fill: trendColor, color: '#FFFFFF', size: 10 });
      }
      els.push({ type: 't', text: item.label, x: textX, y: cy + 1.05, w: textW, h: 0.25, font: 'B', size: 13, color: 'body' });
    });
    return els;
  }

  // ============================================================
  // LAYOUT: SPLIT (two-column comparison)
  // ============================================================
  function layoutSplit(cfg) {
    var header = renderHeader(cfg);
    var els = header.els;
    var startY = header.contentY;
    var isDark = cfg.dark === 1;

    var items = cfg.items || [];
    var grid = C.GRID.col2;
    var availH = C.CONTENT_END - startY;

    items.forEach(function(item, i) {
      if (i > 1) return;
      var cx = grid.cols[i].x;
      var cw = grid.cols[i].w;
      var textW = cw * C.TEXT_RATIO;
      var textX = cx + (cw - textW) / 2;

      els.push({ type: 's', x: cx, y: startY, w: cw, h: availH, fill: 'cardBg', border: isDark ? null : 'cardBorder' });
      els.push({ type: 't', text: item.title, x: textX, y: startY + 0.25, w: textW, h: 0.35, font: 'H', size: 18, color: 'title' });
      els.push({ type: 'd', x: textX, y: startY + 0.70, w: textW, color: 'ltGray' });
      els.push({ type: 't', text: item.text, x: textX, y: startY + 0.90, w: textW, h: availH - 1.20, font: 'B', size: 13, color: 'body' });
    });
    return els;
  }

  // ============================================================
  // LAYOUT: ROWS (full-width items)
  // ============================================================
  function layoutRows(cfg) {
    var header = renderHeader(cfg);
    var els = header.els;
    var startY = header.contentY;
    var isDark = cfg.dark === 1;

    var items = cfg.items || [];
    var numbered = !!cfg.numbered;
    var availH = C.CONTENT_END - startY;
    var rowH = Math.min(0.90, (availH - (C.GAP * (items.length - 1))) / items.length);

    items.forEach(function(item, i) {
      var ry = startY + i * (rowH + C.GAP);
      els.push({ type: 's', x: C.SAFE_X_MIN, y: ry, w: C.SAFE_W, h: rowH, fill: 'cardBg' });

      var textStartX = C.SAFE_X_MIN + 0.20;
      if (numbered) {
        var num = String(i + 1).padStart(2, '0');
        els.push({ type: 't', text: num, x: C.SAFE_X_MIN + 0.20, y: ry, w: 1.00, h: rowH, font: 'H', size: 22, color: 'accent', valign: 'middle' });
        textStartX = C.SAFE_X_MIN + 1.30;
      }

      els.push({ type: 't', text: item.title, x: textStartX, y: ry, w: 3.50, h: rowH, font: 'H', size: 13, color: 'title', valign: 'middle' });
      els.push({ type: 't', text: item.text, x: textStartX + 3.70, y: ry, w: C.SAFE_W - textStartX - 3.70 + C.SAFE_X_MIN - 0.20, h: rowH, font: 'B', size: 11, color: 'body', valign: 'middle' });
    });
    return els;
  }

  // ============================================================
  // LAYOUT: AGENDA (a special case of Rows)
  // ============================================================
  function layoutAgenda(cfg) {
    // Default to numbered unless explicitly false
    cfg.numbered = cfg.numbered !== false;
    return layoutRows(cfg);
  }

  // ============================================================
  // LAYOUT: DETAIL (centered key-value card)
  // ============================================================
  function layoutDetail(cfg) {
    var header = renderHeader(cfg);
    var els = header.els;
    var startY = header.contentY;
    var isDark = cfg.dark === 1;

    var items = cfg.items || [];
    var availH = C.CONTENT_END - startY;
    var cardW = 8.00;
    var cardX = C.SAFE_X_MIN + (C.SAFE_W - cardW) / 2;
    var cardH = Math.min(availH, items.length * 0.60 + 0.40);
    var cardY = startY + (availH - cardH) / 2;

    els.push({ type: 's', x: cardX, y: cardY, w: cardW, h: cardH, fill: 'cardBg', border: isDark ? null : 'cardBorder' });

    var textW = cardW * C.TEXT_RATIO;
    var innerX = cardX + (cardW - textW) / 2;
    var rowH = 0.50;

    items.forEach(function(item, i) {
      var iy = cardY + 0.20 + i * rowH;
      if (item.icon) {
        els.push({ type: 'i', icon: item.icon, x: innerX, y: iy, w: 0.40, h: 0.40 });
      }
      els.push({ type: 't', text: item.label, x: innerX + 0.60, y: iy, w: 2.50, h: 0.40, font: 'H', size: 13, color: 'muted', valign: 'middle' });
      els.push({ type: 't', text: item.value, x: innerX + 3.30, y: iy, w: textW - 3.30, h: 0.40, font: 'B', size: 13, color: 'title', valign: 'middle' });

      if (i < items.length - 1) {
        els.push({ type: 'd', x: innerX, y: iy + 0.48, w: textW, color: 'ltGray' });
      }
    });
    return els;
  }

  // ============================================================
  // LAYOUT: BULLETS (simple list)
  // ============================================================
  function layoutBullets(cfg) {
    var header = renderHeader(cfg);
    var els = header.els;
    var startY = header.contentY;
    var items = cfg.items || [];

    var bulletH = 0.55;
    var bulletX = C.SAFE_X_MIN + 0.40;
    var bulletW = 10.00;

    items.forEach(function(item, i) {
      var by = startY + i * bulletH;
      els.push({ type: 'o', x: C.SAFE_X_MIN + 0.10, y: by + 0.18, w: 0.12, h: 0.12, fill: 'accent' });
      els.push({ type: 't', text: item, x: bulletX, y: by, w: bulletW, h: bulletH, font: 'B', size: 15, color: 'body', valign: 'middle' });
    });
    return els;
  }

  // ============================================================
  // LAYOUT DISPATCHER
  // ============================================================
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

  /**
   * Main entry point for this module. Takes slide data and returns
   * an array of `els` to be rendered.
   * @param {object} slideData - A slide object from the D array.
   * @returns {Array} An array of element objects for rendering.
   */
  function dispatch(slideData) {
    var fn = LAYOUT_MAP[slideData.layout];
    if (fn) {
      return fn(slideData);
    }
    // If layout is unknown, but `els` are provided, pass them through.
    if (slideData.els) {
      return slideData.els;
    }
    console.warn('[deck-layouts] Unknown layout without fallback `els`: "' + slideData.layout + '"');
    return []; // Return empty array if layout is not found.
  }

  // ============================================================
  // PUBLIC API
  // ============================================================
  window.DeckLayouts = {
    dispatch: dispatch
  };

})();
