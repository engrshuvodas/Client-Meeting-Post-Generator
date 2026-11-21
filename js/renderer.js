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

  function drawAuthorWatermark(ctx, W, H, m, state) {
    if (!state.showAuthor) return;
    var family = state.fontFamily || 'Manrope';
    setFont(ctx, 22, '500', family);
    ctx.textAlign = 'right';
    ctx.fillStyle = state.bgColor === '#003912' ? '#dcf6e9' : '#404145';
    var text = state.authorName || 'Engr. Shuvo Das';
    ctx.fillText(text, W - m, H - m - 24);

    // Subtle 4px green brand dot
    var tw = ctx.measureText(text).width;
    ctx.fillStyle = state.brandColor || '#1DBF73';
    ctx.beginPath();
    ctx.arc(W - m - tw - 12, H - m - 13, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.textAlign = 'left';
  }

  function drawFlag(ctx, code, x, y, w, h, state) {
    if (state && state.flagsImg && state.flagsImg.complete && state.flagsImg.naturalWidth) {
      window.drawCountryFlag(ctx, code, x, y, w, h, state.flagsImg, 2);
    } else {
      ctx.fillStyle = '#E8E9E7';
      ctx.fillRect(x, y, w, h);
    }
  }

  function drawScreenshotFrame(ctx, img, areaX, areaY, areaW, areaH, fitMode, zoomPct, offsetY, withBorder, matte) {
    var zoom = (zoomPct || 100) / 100;
    var oy = offsetY || 0;
    fitMode = fitMode || 'contain';

    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(areaX, areaY, areaW, areaH, 4);
    } else {
      ctx.rect(areaX, areaY, areaW, areaH);
    }
    ctx.clip();

    if (!img || !img.complete || !img.naturalWidth) {
      // Empty placeholder state
      ctx.fillStyle = '#F4F5F3';
      ctx.fillRect(areaX, areaY, areaW, areaH);
      ctx.strokeStyle = '#D9DAD8';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(areaX + 0.5, areaY + 0.5, areaW - 1, areaH - 1);
      ctx.setLineDash([]);
      setFont(ctx, 22, '500', 'Manrope');
      ctx.fillStyle = '#8C8E8B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Upload authentic screenshot (PNG / JPG)', areaX + areaW / 2, areaY + areaH / 2);
      ctx.restore();
      return;
    }

    // High quality containment / cover scaling
    var baseScale = fitMode === 'cover'
      ? Math.max(areaW / img.naturalWidth, areaH / img.naturalHeight)
      : Math.min(areaW / img.naturalWidth, areaH / img.naturalHeight);

    var scale = baseScale * zoom;
    var imgW = img.naturalWidth * scale;
    var imgH = img.naturalHeight * scale;
    var ix = areaX + (areaW - imgW) / 2;
    var iy = areaY + (areaH - imgH) / 2 + oy;

    // Clean neutral canvas background behind letterboxed image
    ctx.fillStyle = matte || '#F4F5F3';
    ctx.fillRect(areaX, areaY, areaW, areaH);

    ctx.drawImage(img, ix, iy, imgW, imgH);
    ctx.restore();

    // Subtle 1px framing border
    if (withBorder !== false) {
      ctx.strokeStyle = '#E8E9E7';
      ctx.lineWidth = 1;
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(areaX + 0.5, areaY + 0.5, areaW - 1, areaH - 1, 4);
        ctx.stroke();
      } else {
        ctx.strokeRect(areaX + 0.5, areaY + 0.5, areaW - 1, areaH - 1);
      }
    }
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

  var landmark = new Image();
  landmark.src = window.MEETING_ART.landmark;

  function renderMeeting(ctx, W, H, state) {
    var family = state.fontFamily;
    var edge = 32;
    var center = W / 2;
    var width = W * .79;
    var header = Math.round(H * .36);
    var ground = ctx.createLinearGradient(0, 0, W, H);
    var dark = state.bgColor === '#003912' ? '#002713' : '#00251a';
    ground.addColorStop(0, dark);
    ground.addColorStop(1, state.bgColor === '#F4F5F3' ? '#183a30' : '#003b29');
    ctx.fillStyle = ground;
    ctx.fillRect(0, 0, W, H);

    if (state.countryCode === 'us' && landmark.naturalWidth) {
      var artWidth = header * landmark.width / landmark.height;
      var artX = W - artWidth;
      ctx.drawImage(landmark, artX, 0, artWidth, header);
      var blend = ctx.createLinearGradient(artX, 0, artX + artWidth * .55, 0);
      blend.addColorStop(0, dark);
      blend.addColorStop(1, 'transparent');
      ctx.fillStyle = blend;
      ctx.fillRect(artX, 0, artWidth, header);
    }
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
    var flagY = Math.max(24, (header - (88 + size * lines.length + 28)) / 2);
    var country = (state.countryLabel || '').trim();
    setFont(ctx, 45, '700', family);
    var countryWidth = Math.min(width - 148, ctx.measureText(country).width);
    var flagX = center - (country ? 148 + countryWidth : 108) / 2;
    drawFlag(ctx, state.countryCode, flagX, flagY, 108, 66, state);
    if (country) {
      drawHRule(ctx, flagX + 127, flagY + 7, 2, '#bfdece', 52);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(country, flagX + 148, flagY + 8, countryWidth);
    }

    setFont(ctx, size, '800', family);
    var top = flagY + 88;
    lines.forEach(function(line, i) {
      var measured = ctx.measureText(line).width;
      var cut = i === lines.length - 1 ? line.lastIndexOf(' ') + 1 : line.length;
      var prefix = line.slice(0, cut);
      ctx.save();
      ctx.translate(center - Math.min(width, measured) / 2, top + i * size);
      ctx.scale(Math.min(1, width / measured), 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(prefix, 0, 0);
      ctx.fillStyle = '#9affd3';
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
    var frameWidth = W - 2 * edge;
    var frameHeight = availableHeight;
    if (state.meetingFit !== 'cover' && photo && photo.naturalWidth) {
      var ratio = photo.naturalWidth / photo.naturalHeight;
      frameWidth = Math.min(frameWidth, availableHeight * ratio);
      frameHeight = frameWidth / ratio;
    }
    var frameX = (W - frameWidth) / 2;
    var frameY = header + (availableHeight - frameHeight) / 2;
    ctx.save();
    ctx.strokeStyle = 'rgba(199, 247, 221, .38)';
    ctx.lineWidth = 2;
    ctx.strokeRect(frameX - 1, frameY - 1, frameWidth + 2, frameHeight + 2);
    drawScreenshotFrame(ctx, photo, frameX, frameY, frameWidth, frameHeight,
      state.meetingFit, state.meetingZoom, state.meetingOffsetY, false, '#08271e');
    ctx.restore();
    var textY = frameY + frameHeight + 22;
    setFont(ctx, 34, '600', family);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    caption.forEach(function(line) {
      ctx.fillText(line, center, textY, width);
      textY += 43;
    });
    var footerX = edge + 12;
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
      ctx.fillStyle = '#a6dbbf';
      ctx.fillText('Search on Google', footerX + 48, footerY + 13);
      setFont(ctx, 31, '700', family);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(author, footerX + 48, footerY + 38, W * .56);
    }
    setFont(ctx, 29, '700', family);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#98f4bf';
    ctx.fillText('Fiverr Freelancer', W - footerX, footerY + (author ? 36 : 14));
    ctx.textAlign = 'left';

    return { overflow: false };
  }

  // ── Template 02: Case Study ─────────────────────────────────

  function renderCaseStudy(ctx, W, H, state) {
    var m = state.margin || 90;
    var brand = state.brandColor || '#1DBF73';
    var dark = state.bgColor === '#003912' ? '#ffffff' : '#222325';
    var charcoal = state.bgColor === '#003912' ? '#d3ebde' : '#404145';
    var family = state.fontFamily || 'Manrope';

    ctx.fillStyle = state.bgColor || '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

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
        drawHRule(ctx, m, y, W - 2 * m, '#E8E9E7', 1);
        y += 18;
      }
    }

    drawSection('The Challenge', state.csChallenge);
    drawSection('The Solution', state.csSolution);

    if (y > contentMaxY) {
      hasOverflow = true;
    }

    drawAuthorWatermark(ctx, W, H, m, state);

    return {
      overflow: hasOverflow,
      message: hasOverflow ? 'Case study content exceeds safe boundaries. Shorten paragraphs for best readability.' : ''
    };
  }

  // ── Template 03: Project Showcase ───────────────────────────

  function renderProject(ctx, W, H, state) {
    var m = state.margin || 90;
    var brand = state.brandColor || '#1DBF73';
    var dark = state.bgColor === '#003912' ? '#ffffff' : '#222325';
    var charcoal = state.bgColor === '#003912' ? '#d3ebde' : '#404145';
    var family = state.fontFamily || 'Manrope';

    ctx.fillStyle = state.bgColor || '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Hero screenshot in upper 50%
    var heroH = Math.round(H * 0.48);
    drawScreenshotFrame(
      ctx,
      state.projectImg,
      m,
      m,
      W - 2 * m,
      heroH - m - 12,
      state.projectFit || 'contain',
      state.projectZoom || 100,
      state.projectOffsetY || 0,
      true
    );

    var y = heroH + 12;

    // Project Type Kicker
    setFont(ctx, 18, '700', family);
    ctx.fillStyle = brand;
    ctx.fillText((state.projectType || 'WEB APPLICATION').toUpperCase(), m, y);
    y += 28;

    // Project Title
    var titleRes = drawHeadline(ctx, state.projectTitle || 'Project Title', m, y, W - 2 * m, 52, 36, 1.18, dark, '800', family, 2);
    y += titleRes.height + 16;

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
        ctx.strokeStyle = '#E8E9E7';
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

    drawAuthorWatermark(ctx, W, H, m, state);

    return { overflow: y > H - m - 40 };
  }

  // ── Template 04: Service Highlight ──────────────────────────

  function renderService(ctx, W, H, state) {
    var m = state.margin || 90;
    var brand = state.brandColor || '#1DBF73';
    var dark = state.bgColor === '#003912' ? '#ffffff' : '#222325';
    var charcoal = state.bgColor === '#003912' ? '#d3ebde' : '#404145';
    var family = state.fontFamily || 'Manrope';

    ctx.fillStyle = state.bgColor || '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

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
    drawHRule(ctx, m, y, W - 2 * m, '#E8E9E7', 1);
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

    drawAuthorWatermark(ctx, W, H, m, state);

    return { overflow: y > H - m - 40 };
  }

  // ── Template 05: Professional Tip / Insight ─────────────────

  function renderTip(ctx, W, H, state) {
    var m = state.margin || 90;
    var brand = state.brandColor || '#1DBF73';
    var dark = state.bgColor === '#003912' ? '#ffffff' : '#222325';
    var charcoal = state.bgColor === '#003912' ? '#d3ebde' : '#404145';
    var family = state.fontFamily || 'Manrope';

    ctx.fillStyle = state.bgColor || '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

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

    drawAuthorWatermark(ctx, W, H, m, state);

    return { overflow: y > H - m - 40 };
  }

  // ── Public API ──────────────────────────────────────────────

  window.Renderer = {
    landmark: landmark,
    renderToContext: function(ctx, W, H, state) {
      var id = state.templateId || 'meeting';
      if (id === 'meeting') return renderMeeting(ctx, W, H, state);
      if (id === 'casestudy') return renderCaseStudy(ctx, W, H, state);
      if (id === 'project') return renderProject(ctx, W, H, state);
      if (id === 'service') return renderService(ctx, W, H, state);
      if (id === 'tip') return renderTip(ctx, W, H, state);
      return { overflow: false };
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