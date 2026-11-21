/**
 * SHUVO BRAND STUDIO — CANVAS RENDER ENGINE
 * Swiss-inspired Editorial Design System
 * Zero AI clutter • Pure typography, whitespace, and precision grids
 */

(function() {
  'use strict';

  // ── Typography & Layout Helpers ─────────────────────────────

  function setFont(ctx, size, weight, family) {
    var fam = family || 'Manrope';
    ctx.font = (weight || '400') + ' ' + size + 'px "' + fam + '", "Inter", -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
  }

  function wrapTextLines(ctx, text, maxW) {
    text = String(text || '').trim();
    if (!text) return [];
    var words = text.split(/\s+/);
    var lines = [];
    var current = '';
    for (var i = 0; i < words.length; i++) {
      var trial = current ? current + ' ' + words[i] : words[i];
      if (ctx.measureText(trial).width > maxW && current) {
        lines.push(current);
        current = words[i];
      } else {
        current = trial;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function drawHeadline(ctx, text, x, y, maxW, preferredSize, minSize, lineHMult, color, weight, family, maxLines) {
    text = String(text || '').trim();
    if (!text) return { height: 0, linesDrawn: 0, overflow: false };
    maxLines = maxLines || 3;
    var size = preferredSize;
    var lines = [];

    while (size >= minSize) {
      setFont(ctx, size, weight || '800', family);
      lines = wrapTextLines(ctx, text, maxW);
      if (lines.length <= maxLines) break;
      size -= 4;
    }

    setFont(ctx, size, weight || '800', family);
    var lineH = Math.round(size * (lineHMult || 1.18));
    ctx.fillStyle = color;
    for (var j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], x, y + j * lineH);
    }

    return {
      height: lines.length * lineH,
      linesDrawn: lines.length,
      fontSize: size,
      overflow: lines.length > maxLines
    };
  }

  function drawParagraph(ctx, text, x, y, maxW, fontSize, lineHMult, color, weight, family) {
    text = String(text || '').trim();
    if (!text) return { height: 0, linesDrawn: 0 };
    setFont(ctx, fontSize, weight || '400', family);
    var lineH = Math.round(fontSize * (lineHMult || 1.55));
    var lines = wrapTextLines(ctx, text, maxW);
    ctx.fillStyle = color;
    for (var j = 0; j < lines.length; j++) {
      ctx.fillText(lines[j], x, y + j * lineH);
    }
    return {
      height: lines.length * lineH,
      linesDrawn: lines.length
    };
  }

  function drawHRule(ctx, x, y, w, color, thickness) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, thickness || 1);
  }

  function drawFlag(ctx, code, x, y, w, h, state) {
    if (state && state.flagsImg && state.flagsImg.complete && state.flagsImg.naturalWidth) {
      window.drawCountryFlag(ctx, code, x, y, w, h, state.flagsImg, 2);
    } else {
      ctx.fillStyle = '#E8E9E7';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMonitor(ctx, image, x, y, width, height, fit, zoom, offset) {
    if (width <= 0 || height <= 0) return y;
    var hasImage = image && image.complete && image.naturalWidth;
    var aspect = hasImage && fit !== 'cover' ? image.naturalWidth / image.naturalHeight : 16 / 9;
    var bezel = 7;
    var screenWidth = Math.max(1, Math.min(width - 24, (height - 30) * aspect));
    var screenHeight = screenWidth / aspect;
    var scale = (zoom || 100) / 100;
    var outerHeight = screenHeight + 2 * bezel + 3;
    var top = y + (height - outerHeight * scale) / 2 + (offset || 0);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.translate(x + width / 2, top);
    ctx.scale(scale, scale);
    var left = -screenWidth / 2;
    ctx.fillStyle = '#171c1c';
    ctx.strokeStyle = '#818d87';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(left - bezel, 0, screenWidth + 2 * bezel, outerHeight, 10);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.roundRect(left, bezel, screenWidth, screenHeight, 3);
    ctx.clip();
    if (hasImage) {
      var fitScale = Math.max(screenWidth / image.naturalWidth, screenHeight / image.naturalHeight);
      var imgW = fitScale * image.naturalWidth;
      var imgH = fitScale * image.naturalHeight;
      ctx.drawImage(image, -imgW / 2, bezel + (screenHeight - imgH) / 2, imgW, imgH);
    } else {
      ctx.fillStyle = '#20352d';
      ctx.fillRect(left, bezel, screenWidth, screenHeight);
      setFont(ctx, 22, '500', 'Manrope');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#d9eee3';
      ctx.fillText('Upload a screenshot', 0, bezel + screenHeight / 2, screenWidth);
    }
    ctx.restore();
    return Math.min(y + height, Math.max(y, top + outerHeight * scale));
  }

  // ── Template 01: Client Meeting ─────────────────────────────

  // The complete motif fits inside its own repaint area on the meeting header.
  function drawServiceNetwork(ctx, width, phase) {
    ctx.save();
    ctx.translate(width - 265, 0);
    var wash = ctx.createLinearGradient(0, 0, 265, 200);
    wash.addColorStop(0, '#06392e');
    wash.addColorStop(1, '#0c513c');
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, 265, 303);
    var nodes = [[60, 75], [173, 150], [70, 230]];
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#439578';
    ctx.beginPath();
    ctx.moveTo(...nodes[0]);
    ctx.lineTo(...nodes[1]);
    ctx.lineTo(...nodes[2]);
    ctx.stroke();

    var travel = phase * 2;
    var segment = Math.min(1, Math.floor(travel));
    var t = travel - segment;
    var start = nodes[segment], end = nodes[segment + 1];
    ctx.fillStyle = '#b0ffd8';
    ctx.beginPath();
    ctx.arc(start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t, 4, 0, 2 * Math.PI);
    ctx.fill();

    nodes.forEach(function(point, i) {
      ctx.save();
      ctx.translate(...point);
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, 2 * Math.PI);
      ctx.fillStyle = '#084333';
      ctx.fill();
      ctx.strokeStyle = '#469774';
      ctx.stroke();
      ctx.strokeStyle = '#9eeac6';
      ctx.lineWidth = 2.7;
      ctx.beginPath();
      if (i === 0) {
        // Message bubble with a short reply.
        ctx.moveTo(-12, 9);
        ctx.bezierCurveTo(-27, -15, 5, -23, 15, -9);
        ctx.bezierCurveTo(26, 8, 6, 19, -5, 12);
        ctx.lineTo(-16, 16);
        ctx.closePath();
        ctx.moveTo(-7, -4); ctx.lineTo(8, -4);
        ctx.moveTo(-7, 2); ctx.lineTo(3, 2);
      } else if (i === 1) {
        ctx.rect(-17, -13, 34, 26);
        ctx.moveTo(-16, -5); ctx.lineTo(16, -5);
        ctx.moveTo(-9, 3); ctx.lineTo(0, 3);
        ctx.moveTo(-9, 8); ctx.lineTo(8, 8);
      } else {
        // A prospect entering the contact list.
        ctx.arc(-4, -7, 6, 0, 2 * Math.PI);
        ctx.moveTo(-17, 13);
        ctx.bezierCurveTo(-17, 0, 8, 0, 8, 13);
        ctx.moveTo(15, -4); ctx.lineTo(15, 8);
        ctx.moveTo(9, 2); ctx.lineTo(21, 2);
      }
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }

  var postText = {
    primary: '#FCFAF2',
    accent: '#B3FFD3',
    secondary: '#D9EEE3'
  };

  var landmark = new Image();
  landmark.src = window.LANDMARK_ATLAS;

  function drawPostBackground(ctx, W, H, state) {
    var header = Math.round(H * .36);
    var ground = ctx.createLinearGradient(0, 0, W, H);
    var dark = state.bgColor === '#003912' ? '#002713' : '#00251a';
    ground.addColorStop(0, dark);
    ground.addColorStop(1, state.bgColor === '#F4F5F3' ? '#183a30' : '#003b29');
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, W, H);

    // Keep the map visible beneath a meeting screenshot and behind text-only posts.
    var isMeeting = state.templateId === 'meeting';
    var mapWidth = isMeeting ? W * .30 : W * .93;
    var mapScale = mapWidth / 360;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, header, W, H - header);
    ctx.clip();
    ctx.translate((W - mapWidth) / 2, H - 144 * mapScale - (isMeeting ? 5 : 32));
    ctx.scale(mapScale, mapScale);
    ctx.fillStyle = isMeeting ? 'rgba(133,220,173,.26)' : 'rgba(133,220,173,.14)';
    ctx.fill(window.WORLD_LAND, 'evenodd');
    ctx.restore();

    var country = window.COUNTRIES.find(function(item) { return item.code === state.countryCode; });
    if (country && landmark.naturalWidth) {
      // Each tile is a continuous photographic banner. Use a cover crop
      // at the canvas aspect ratio and keep off-centre landmarks in frame.
      var tileW = 960, tileH = 330;
      var scale = Math.max(W / tileW, header / tileH);
      var cropW = W / scale, cropH = header / scale;
      var focusX = country.code === 'fr' ? .92 : .5;
      var srcX = (country.idx % 8) * tileW + (tileW - cropW) * focusX;
      var srcY = Math.floor(country.idx / 8) * tileH + (tileH - cropH) * .22;
      ctx.save();
      ctx.drawImage(landmark, srcX, srcY, cropW, cropH, 0, 0, W, header);
      var veil = ctx.createLinearGradient(0, 0, W, 0);
      veil.addColorStop(0, 'rgba(0,33,23,.36)');
      veil.addColorStop(.5, 'rgba(0,33,23,.48)');
      veil.addColorStop(1, 'rgba(0,33,23,.36)');
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, W, header);
      var bottomFade = ctx.createLinearGradient(0, header * .8, 0, header);
      bottomFade.addColorStop(0, 'transparent');
      bottomFade.addColorStop(1, dark);
      ctx.fillStyle = bottomFade;
      ctx.fillRect(0, header * .8, W, header * .2);
      ctx.restore();
    }
  }

  function drawPostFooter(ctx, W, H, state) {
    var family = state.fontFamily;
    var author = state.showAuthor && (state.authorName || '').trim();
    var footerX = 44;
    var footerY = H - (author ? 89 : 58);
    drawHRule(ctx, footerX, footerY, W - 2 * footerX, '#37604f', 1);
    if (author) {
      var iconX = footerX + 13;
      var iconY = footerY + 43;
      ctx.save();
      ctx.strokeStyle = '#91eabe';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(iconX, iconY, 11, 0, Math.PI * 2);
      ctx.moveTo(iconX + 8, iconY + 8);
      ctx.lineTo(iconX + 18, iconY + 18);
      ctx.stroke();
      ctx.restore();
      setFont(ctx, 21, '600', family);
      ctx.fillStyle = postText.secondary;
      ctx.fillText('Search on Google', footerX + 48, footerY + 13);
      setFont(ctx, 31, '700', family);
      ctx.fillStyle = postText.primary;
      ctx.fillText(author, footerX + 48, footerY + 38, W * .56);
    }
    setFont(ctx, 29, '700', family);
    ctx.textAlign = 'right';
    ctx.fillStyle = postText.accent;
    ctx.fillText('Fiverr Freelancer', W - footerX, footerY + (author ? 36 : 14));
    ctx.textAlign = 'left';
  }

  function renderMeeting(ctx, W, H, state) {
    var family = state.fontFamily;
    var edge = 32;
    var center = W / 2;
    var width = W * .79;
    var header = Math.round(H * .36);
    if (state.servicePhase !== undefined) {
      ctx.save();
      ctx.translate(W * .52, 0);
      ctx.scale(.48, .48);
      ctx.globalAlpha = .65;
      drawServiceNetwork(ctx, W, state.servicePhase);
      ctx.restore();
    }

    var headline = (state.meetingTitle || '').trim();
    var size = 112;
    var lines;
    do {
      setFont(ctx, size, '800', family);
      lines = wrapTextLines(ctx, headline, width);
      if (lines.length <= 1 || (size <= 66 && lines.length <= 2)) break;
      size -= 2;
    } while (size >= 30);
    // Center the flag and its label as one unit, then each headline line.
    var flagY = Math.max(24, (header - (98 + size * lines.length + 28)) / 2);
    var country = (state.countryLabel || '').trim();
    setFont(ctx, 53, '700', family);
    var countryWidth = Math.min(width - 122, ctx.measureText(country).width);
    var flagX = center - (country ? 122 + countryWidth : 84) / 2;
    drawFlag(ctx, state.countryCode, flagX, flagY - 3, 84, 84, state);
    if (country) {
      drawHRule(ctx, flagX + 103, flagY + 8, 2, '#bfdece', 61);
      ctx.fillStyle = postText.primary;
      ctx.fillText(country, flagX + 122, flagY + 9, countryWidth);
    }

    setFont(ctx, size, '800', family);
    var top = flagY + 98;
    lines.forEach(function(line, i) {
      var measured = ctx.measureText(line).width;
      var cut = i === lines.length - 1 ? line.lastIndexOf(' ') + 1 : line.length;
      var prefix = line.slice(0, cut);
      ctx.save();
      ctx.translate(center - Math.min(width, measured) / 2, top + i * size);
      ctx.scale(Math.min(1, width / measured), 1);
      ctx.fillStyle = postText.primary;
      ctx.fillText(prefix, 0, 0);
      ctx.fillStyle = postText.accent;
      ctx.fillText(line.slice(cut), ctx.measureText(prefix).width, 0);
      var client = /\bclient\b/i.exec(line);
      if (client) {
        var word = ctx.measureText(client[0]);
        var span = word.width * 1.08;
        var start = ctx.measureText(line.slice(0, client.index)).width - (span - word.width) / 2;
        var y = word.actualBoundingBoxDescent + size * .105;
        ctx.fillStyle = '#83efae';
        ctx.beginPath();
        ctx.moveTo(start, y + size * .035);
        ctx.bezierCurveTo(start + span * .24, y - size * .026,
          start + span * .76, y - size * .06, start + span, y);
        ctx.bezierCurveTo(start + span * .7, y + size * .002,
          start + span * .22, y + size * .036, start, y + size * .096);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    });

    setFont(ctx, 34, '600', family);
    var caption = wrapTextLines(ctx, state.meetingCaption, width);
    var author = state.showAuthor && (state.authorName || '').trim();
    var footerHeight = (author ? 116 : 80) + caption.length * 43;
    var bottom = H - footerHeight;
    var photo = state.meetingImg;
    var availableHeight = bottom - header;
    var monitorBottom = drawMonitor(ctx, photo, edge, header, W - 2 * edge, availableHeight,
      state.meetingFit, state.meetingZoom, state.meetingOffsetY);
    var textY = monitorBottom + 22;
    setFont(ctx, 34, '600', family);
    ctx.textAlign = 'center';
    ctx.fillStyle = postText.primary;
    caption.forEach(function(line) {
      ctx.fillText(line, center, textY, width);
      textY += 43;
    });
    return { overflow: false };
  }

  // ── Template 02: Case Study ─────────────────────────────────

  function renderCaseStudy(ctx, W, H, state) {
    var m = state.margin || 90;
    var brand = postText.accent;
    var dark = postText.primary;
    var charcoal = postText.secondary;
    var family = state.fontFamily || 'Manrope';

    var y = m;

    // Category / Kicker
    var categoryText = 'CASE STUDY' + (state.csCategory ? '  /  ' + state.csCategory.toUpperCase() : '');
    setFont(ctx, 18, '700', family);
    ctx.fillStyle = brand;
    ctx.fillText(categoryText, m, y);
    y += 34;

    // Main Headline (supports natural multi-line wrapping)
    var hl = drawHeadline(ctx, state.csHeadline || 'Project Headline', m, y, W - 2 * m, 58, 38, 1.18, dark, '800', family, 2);
    y += hl.height + 20;

    // Solid brand rule
    drawHRule(ctx, m, y, W - 2 * m, brand, 2);
    y += 24;

    var contentMaxY = H - m - 40;
    var hasOverflow = false;

    function drawSection(title, body) {
      if (!body || !body.trim()) return;
      setFont(ctx, 20, '700', family);
      ctx.fillStyle = brand;
      ctx.fillText(title.toUpperCase(), m, y);
      y += 30;

      var p = drawParagraph(ctx, body, m, y, W - 2 * m, 26, 1.55, charcoal, '400', family);
      y += p.height + 20;

      if (y < contentMaxY - 20) {
        drawHRule(ctx, m, y, W - 2 * m, '#50846b', 1);
        y += 18;
      }
    }

    drawSection('The Challenge', state.csChallenge);
    drawSection('The Solution', state.csSolution);

    if (y > contentMaxY) {
      hasOverflow = true;
    }

    return {
      overflow: hasOverflow,
      message: hasOverflow ? 'Case study content exceeds safe boundaries. Shorten paragraphs for best readability.' : ''
    };
  }

  // ── Template 03: Project Showcase ───────────────────────────

  function renderProject(ctx, W, H, state) {
    var m = state.margin || 90;
    var brand = postText.accent;
    var dark = postText.primary;
    var charcoal = postText.secondary;
    var family = state.fontFamily || 'Manrope';

    var y = m;

    // Project Type Kicker
    setFont(ctx, 18, '700', family);
    ctx.fillStyle = brand;
    ctx.fillText((state.projectType || 'WEB APPLICATION').toUpperCase(), m, y);
    y += 28;

    // Project Title
    var titleRes = drawHeadline(ctx, state.projectTitle || 'Project Title', m, y, W - 2 * m, 52, 36, 1.18, dark, '800', family, 2);
    y += titleRes.height + 16;

    var imageHeight = Math.min(H * .34, H - y - 358);
    drawMonitor(ctx, state.projectImg, m, y, W - 2 * m, imageHeight,
      state.projectFit || 'contain', state.projectZoom || 100, state.projectOffsetY || 0);
    y += imageHeight + 22;

    // Tech Tags (clean pills)
    var tags = Array.isArray(state.projectTech) ? state.projectTech : ['React', 'Node.js', 'PostgreSQL'];
    setFont(ctx, 18, '600', family);
    var tagX = m;
    var pillH = 32;
    var pillPadX = 14;

    tags.forEach(function(tag) {
      tag = String(tag).trim();
      if (!tag) return;
      var tw = ctx.measureText(tag).width;
      var pw = tw + pillPadX * 2;
      if (tagX + pw > W - m) return;

      // Pill background & border
      ctx.fillStyle = '#F4F5F3';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(tagX, y, pw, pillH, 4);
        ctx.fill();
        ctx.strokeStyle = '#50846b';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillRect(tagX, y, pw, pillH);
      }

      ctx.fillStyle = '#404145';
      ctx.fillText(tag, tagX + pillPadX, y + 7);
      tagX += pw + 10;
    });

    y += pillH + 20;

    // Short Description
    if (state.projectDesc) {
      drawParagraph(ctx, state.projectDesc, m, y, W - 2 * m, 26, 1.55, charcoal, '400', family);
    }

    return { overflow: y > H - m - 40 };
  }

  // ── Template 04: Service Highlight ──────────────────────────

  function renderService(ctx, W, H, state) {
    var m = state.margin || 90;
    var brand = postText.accent;
    var dark = postText.primary;
    var charcoal = postText.secondary;
    var family = state.fontFamily || 'Manrope';

    var y = m;

    // Architectural accent bar
    ctx.fillStyle = brand;
    ctx.fillRect(m, y, 72, 4);
    y += 24;

    // Service category label
    setFont(ctx, 18, '700', family);
    ctx.fillStyle = charcoal;
    ctx.fillText((state.serviceName || 'PROFESSIONAL SERVICE').toUpperCase(), m, y);
    y += 34;

    // Big Headline
    var hl = drawHeadline(ctx, state.serviceHeadline || 'Build your business online', m, y, W - 2 * m, 64, 42, 1.18, dark, '800', family, 3);
    y += hl.height + 22;

    // Clean rule
    drawHRule(ctx, m, y, W - 2 * m, '#50846b', 1);
    y += 26;

    // Description
    if (state.serviceDesc && state.serviceDesc.trim()) {
      var p = drawParagraph(ctx, state.serviceDesc, m, y, W - 2 * m, 28, 1.55, charcoal, '400', family);
      y += p.height + 34;
    }

    // Key benefits
    var benefits = Array.isArray(state.serviceBenefits) ? state.serviceBenefits : [];
    benefits.forEach(function(b) {
      if (!b || !b.trim()) return;
      setFont(ctx, 28, '700', family);
      ctx.fillStyle = brand;
      ctx.fillText('—', m, y);

      setFont(ctx, 28, '500', family);
      ctx.fillStyle = dark;
      ctx.fillText(b, m + 34, y);
      y += 46;
    });

    return { overflow: y > H - m - 40 };
  }

  // ── Template 05: Professional Tip / Insight ─────────────────

  function renderTip(ctx, W, H, state) {
    var m = state.margin || 90;
    var brand = postText.accent;
    var dark = postText.primary;
    var charcoal = postText.secondary;
    var family = state.fontFamily || 'Manrope';

    var y = m;

    // Category
    var cat = 'INSIGHT  /  ' + (state.tipCategory || 'SOFTWARE ENGINEERING').toUpperCase();
    setFont(ctx, 18, '700', family);
    ctx.fillStyle = brand;
    ctx.fillText(cat, m, y);
    y += 36;

    // Big bold quote/headline
    var hl = drawHeadline(ctx, state.tipHeadline || 'Write software for humans first', m, y, W - 2 * m, 74, 46, 1.15, dark, '800', family, 3);
    y += hl.height + 26;

    // Dark architectural rule
    drawHRule(ctx, m, y, W - 2 * m, dark, 2);
    y += 32;

    // Insight paragraph
    if (state.tipInsight && state.tipInsight.trim()) {
      drawParagraph(ctx, state.tipInsight, m, y, W - 2 * m, 32, 1.6, charcoal, '400', family);
    }

    return { overflow: y > H - m - 40 };
  }

  // ── Public API ──────────────────────────────────────────────

  window.Renderer = {
    landmark: landmark,
    renderToContext: function(ctx, W, H, state) {
      var id = state.templateId || 'meeting';
      var templates = {
        meeting: renderMeeting, casestudy: renderCaseStudy, project: renderProject,
        service: renderService, tip: renderTip
      };
      var renderTemplate = templates[id];
      if (!Object.prototype.hasOwnProperty.call(templates, id)) return { overflow: false };
      drawPostBackground(ctx, W, H, state);
      var result = renderTemplate(ctx, W, H, state);
      drawPostFooter(ctx, W, H, state);
      return result;
    },

    render: function(canvas, state) {
      var ctx = canvas.getContext('2d');
      var W = canvas.width;
      var H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      return this.renderToContext(ctx, W, H, state);
    }
  };

})();