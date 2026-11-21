/**
 * SHUVO BRAND STUDIO — APPLICATION CONTROLLER
 * Reactive state management, DOM binding, live preview, export pipelines
 */

'use strict';

(function() {

  var canvas = null;
  var canvasWrapper = null;
  var statusEl = null;
  var dimensionsEl = null;
  var meetingDataUrl = null;
  var projectDataUrl = null;

  // Format dimensions (master coordinates)
  var FORMATS = {
    square:     { w: 1080, h: 1080, label: '1080 × 1080 px (1:1 Square)' },
    portrait45: { w: 1080, h: 1350, label: '1080 × 1350 px (4:5 Portrait)' },
    portrait34: { w: 1080, h: 1440, label: '1080 × 1440 px (3:4 Portrait)' }
  };

  // ── Render Pipeline ─────────────────────────────────────────

  function render() {
    if (!canvas || !window.Renderer) return;
    var state = window.AppState.get();
    try {
      var res = window.Renderer.render(canvas, state);
      if (res && res.overflow) {
        setStatus(res.message || '⚠️ Content exceeds safe boundaries', 'warning');
      } else {
        setStatus('Ready');
      }
    } catch(e) {
      setStatus('Render error: ' + e.message, 'error');
      console.error(e);
    }
  }

  function initServiceAnimation() {
    var toggle = document.getElementById('animateServices');
    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var timer;
    function sync() {
      clearInterval(timer);
      if (!toggle.checked || document.hidden || window.AppState.get().templateId !== 'meeting') return;
      timer = setInterval(function() {
        var state = window.AppState.get();
        state.servicePhase = (performance.now() % 6000) / 6000;
        window.Renderer.render(canvas, state);
      }, 50);
    }
    function applyPreference() {
      if (motion.matches) toggle.checked = false;
      render();
      sync();
    }
    motion.addEventListener('change', applyPreference);
    document.addEventListener('visibilitychange', sync);
    toggle.addEventListener('change', function() { render(); sync(); });
    window.AppState.subscribe(sync);
    applyPreference();
  }

  function setStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = 'canvas-status' + (type ? ' ' + type : '');
  }

  // ── Template Tabs ───────────────────────────────────────────

  function showTemplate(tpl) {
    document.querySelectorAll('.tab-btn').forEach(function(t) {
      t.classList.toggle('active', t.dataset.template === tpl);
      t.setAttribute('aria-selected', t.dataset.template === tpl ? 'true' : 'false');
    });
    document.querySelectorAll('.template-panel').forEach(function(panel) {
      panel.classList.toggle('hidden', panel.id !== 'panel-' + tpl);
    });
  }

  function initTemplateTabs() {
    var tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var tpl = btn.dataset.template;
        showTemplate(tpl);
        window.AppState.set({ templateId: tpl });
        applyFormat(window.AppState.get().format);
      });
    });
  }

  // ── Canvas Dimensions & Aspect Ratio ────────────────────────

  function dimensionsFor(format, template) {
    if (format === 'auto' && template === 'meeting') return {w: 1080, h: 818, label: '1080 × 818 px (Meeting cover)'};
    return FORMATS[format] || FORMATS.square;
  }

  function applyFormat(formatKey) {
    var fmt = dimensionsFor(formatKey, window.AppState.get().templateId);
    canvas.width = fmt.w;
    canvas.height = fmt.h;
    if (canvasWrapper) {
      canvasWrapper.style.setProperty('--ratio', fmt.w / fmt.h);
      canvasWrapper.style.aspectRatio = fmt.w + ' / ' + fmt.h;
    }
    if (dimensionsEl) {
      dimensionsEl.textContent = fmt.label;
    }
    updateCropOverlay(formatKey);
    render();
  }

  function updateCropOverlay(formatKey) {
    var cropSafeBox = document.getElementById('cropSafeBox');
    var maskTop = document.getElementById('cropMaskTop');
    var maskBottom = document.getElementById('cropMaskBottom');
    var cropBadge = document.getElementById('cropBadge');
    if (!cropSafeBox) return;

    if (formatKey === 'portrait45') {
      // 1080x1350: square center is (1350-1080)/2 = 135px -> 10%
      var cropPct = 10;
      if (maskTop) { maskTop.style.height = cropPct + '%'; maskTop.classList.add('visible'); }
      if (maskBottom) { maskBottom.style.height = cropPct + '%'; maskBottom.classList.add('visible'); }
      cropSafeBox.style.top = (cropPct + 6.66) + '%';
      cropSafeBox.style.bottom = (cropPct + 6.66) + '%';
      if (cropBadge) cropBadge.textContent = 'Profile Grid 1:1 Safe Zone';
    } else if (formatKey === 'portrait34') {
      // 1080x1440: square center is (1440-1080)/2 = 180px -> 12.5%
      var cropPct2 = 12.5;
      if (maskTop) { maskTop.style.height = cropPct2 + '%'; maskTop.classList.add('visible'); }
      if (maskBottom) { maskBottom.style.height = cropPct2 + '%'; maskBottom.classList.add('visible'); }
      cropSafeBox.style.top = (cropPct2 + 6.25) + '%';
      cropSafeBox.style.bottom = (cropPct2 + 6.25) + '%';
      if (cropBadge) cropBadge.textContent = 'Profile Grid 1:1 Safe Zone';
    } else {
      if (maskTop) maskTop.classList.remove('visible');
      if (maskBottom) maskBottom.classList.remove('visible');
      cropSafeBox.style.top = '8.333%';
      cropSafeBox.style.bottom = '8.333%';
      if (cropBadge) cropBadge.textContent = '810px Safe Zone';
    }
  }

  // ── Country Search & Selection ──────────────────────────────

  function initCountrySearch() {
    var searchInput = document.getElementById('countrySearch');
    var dropdown = document.getElementById('countryDropdown');
    var flagPreview = document.getElementById('flagPreview');
    var displayName = document.getElementById('countryDisplayName');
    var labelInput = document.getElementById('countryLabelInput');

    function redrawFlagPreview(code) {
      if (!flagPreview) return;
      var ctx = flagPreview.getContext('2d');
      ctx.clearRect(0, 0, flagPreview.width, flagPreview.height);
      var state = window.AppState.get();
      if (state.flagsImg && state.flagsImg.complete && state.flagsImg.naturalWidth) {
        window.drawCountryFlag(ctx, code, 0, 0, flagPreview.width, flagPreview.height, state.flagsImg);
      }
    }

    function selectCountry(country) {
      window.AppState.set({ countryCode: country.code, countryLabel: country.name });
      if (displayName) displayName.textContent = country.name;
      if (labelInput) labelInput.value = country.name;
      redrawFlagPreview(country.code);
      if (dropdown) dropdown.hidden = true;
      if (searchInput) searchInput.value = '';
      render();
    }

    function showDropdown(filter) {
      if (!dropdown || !window.COUNTRIES) return;
      var lower = (filter || '').toLowerCase();
      var results = window.COUNTRIES.filter(function(c) {
        return c.name.toLowerCase().indexOf(lower) !== -1;
      }).slice(0, 20);

      dropdown.innerHTML = '';
      var state = window.AppState.get();

      results.forEach(function(country) {
        var div = document.createElement('div');
        div.className = 'country-option';
        div.setAttribute('role', 'option');

        var flagCanvas = document.createElement('canvas');
        flagCanvas.width = 66;
        flagCanvas.height = 66;
        if (state.flagsImg && state.flagsImg.complete) {
          window.drawCountryFlag(flagCanvas.getContext('2d'), country.code, 0, 0, 66, 66, state.flagsImg);
        }

        var nameSpan = document.createElement('span');
        nameSpan.textContent = country.name;

        div.appendChild(flagCanvas);
        div.appendChild(nameSpan);
        div.addEventListener('click', function() { selectCountry(country); });
        dropdown.appendChild(div);
      });

      dropdown.hidden = results.length === 0;
    }

    if (searchInput) {
      searchInput.addEventListener('input', function() { showDropdown(searchInput.value); });
      searchInput.addEventListener('focus', function() { showDropdown(searchInput.value); });
    }

    document.addEventListener('click', function(e) {
      if (dropdown && !dropdown.contains(e.target) && e.target !== searchInput) {
        dropdown.hidden = true;
      }
    });

    if (labelInput) {
      labelInput.addEventListener('input', function() {
        window.AppState.set({ countryLabel: labelInput.value });
        if (displayName) displayName.textContent = labelInput.value;
        render();
      });
    }

    window._redrawFlagPreview = redrawFlagPreview;
  }

  // ── Screenshot File Uploads ─────────────────────────────────

  function initFileUploads() {
    var meetingInput = document.getElementById('meetingFileInput');
    var projectInput = document.getElementById('projectFileInput');

    if (meetingInput) {
      meetingInput.addEventListener('change', function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var img = new Image();
          img.onload = function() {
            meetingDataUrl = ev.target.result;
            window.AppState.setImage('meetingImg', img);
            render();
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    if (projectInput) {
      projectInput.addEventListener('change', function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          var img = new Image();
          img.onload = function() {
            projectDataUrl = ev.target.result;
            window.AppState.setImage('projectImg', img);
            render();
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
      });
    }
  }

  // ── Input Bindings ──────────────────────────────────────────

  function bindInput(id, stateKey, transform) {
    var el = document.getElementById(id);
    if (!el) return;
    var eventType = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'input';
    el.addEventListener(eventType, function() {
      var val = el.type === 'checkbox' ? el.checked : el.value;
      if (transform) val = transform(val);
      var update = {};
      update[stateKey] = val;
      window.AppState.set(update);
      render();
    });
  }

  function initInputBindings() {
    // Brand & layout
    bindInput('authorName', 'authorName');
    bindInput('showAuthor', 'showAuthor');
    bindInput('fontFamily', 'fontFamily');
    bindInput('bgColorSelect', 'bgColor');

    // Case Study
    bindInput('csCategory', 'csCategory');
    bindInput('csHeadline', 'csHeadline');
    bindInput('csChallenge', 'csChallenge');
    bindInput('csSolution', 'csSolution');

    // Project
    bindInput('projectTitle', 'projectTitle');
    bindInput('projectType', 'projectType');
    bindInput('projectDesc', 'projectDesc');
    bindInput('projectFit', 'projectFit');
    bindInput('projectTechInput', 'projectTech', function(v) {
      return v.split(',').map(function(t) { return t.trim(); }).filter(Boolean);
    });

    // Meeting image presentation
    bindInput('meetingTitle', 'meetingTitle');
    bindInput('meetingCaption', 'meetingCaption');
    bindInput('meetingFit', 'meetingFit');

    var mZoom = document.getElementById('meetingZoom');
    var mZoomVal = document.getElementById('meetingZoomVal');
    if (mZoom) {
      mZoom.addEventListener('input', function() {
        var num = parseInt(mZoom.value, 10) || 100;
        if (mZoomVal) mZoomVal.textContent = num + '%';
        window.AppState.set({ meetingZoom: num });
        render();
      });
    }

    var mOff = document.getElementById('meetingOffsetY');
    var mOffVal = document.getElementById('meetingOffsetVal');
    if (mOff) {
      mOff.addEventListener('input', function() {
        var num2 = parseInt(mOff.value, 10) || 0;
        if (mOffVal) mOffVal.textContent = num2 + 'px';
        window.AppState.set({ meetingOffsetY: num2 });
        render();
      });
    }

    // Project image presentation
    var pZoom = document.getElementById('projectZoom');
    var pZoomVal = document.getElementById('projectZoomVal');
    if (pZoom) {
      pZoom.addEventListener('input', function() {
        var num = parseInt(pZoom.value, 10) || 100;
        if (pZoomVal) pZoomVal.textContent = num + '%';
        window.AppState.set({ projectZoom: num });
        render();
      });
    }

    var pOff = document.getElementById('projectOffsetY');
    var pOffVal = document.getElementById('projectOffsetVal');
    if (pOff) {
      pOff.addEventListener('input', function() {
        var num2 = parseInt(pOff.value, 10) || 0;
        if (pOffVal) pOffVal.textContent = num2 + 'px';
        window.AppState.set({ projectOffsetY: num2 });
        render();
      });
    }

    // Service Highlight
    bindInput('serviceName', 'serviceName');
    bindInput('serviceHeadline', 'serviceHeadline');
    bindInput('serviceDesc', 'serviceDesc');

    function updateBenefits() {
      var b1 = (document.getElementById('benefit1') || {}).value || '';
      var b2 = (document.getElementById('benefit2') || {}).value || '';
      var b3 = (document.getElementById('benefit3') || {}).value || '';
      window.AppState.set({ serviceBenefits: [b1, b2, b3] });
      render();
    }
    ['benefit1', 'benefit2', 'benefit3'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', updateBenefits);
    });

    // Tip
    bindInput('tipCategory', 'tipCategory');
    bindInput('tipHeadline', 'tipHeadline');
    bindInput('tipInsight', 'tipInsight');

    // Format selector
    var formatSel = document.getElementById('formatSelect');
    if (formatSel) {
      formatSel.addEventListener('change', function() {
        window.AppState.set({ format: formatSel.value });
        applyFormat(formatSel.value);
      });
    }

    // Export quality scale
    var scaleSel = document.getElementById('exportScale');
    if (scaleSel) {
      scaleSel.addEventListener('change', function() {
        window.AppState.set({ exportScale: parseInt(scaleSel.value, 10) || 1 });
      });
    }

    // Crop overlay guide
    var cropCheck = document.getElementById('showCropGuide');
    var cropOverlay = document.getElementById('cropOverlay');
    if (cropCheck && cropOverlay) {
      cropCheck.addEventListener('change', function() {
        cropOverlay.classList.toggle('hidden', !cropCheck.checked);
      });
    }
  }

  // ── High Resolution Export Helpers ──────────────────────────

  function renderToExportCanvas(state, scale) {
    scale = scale || 1;
    var fmt = dimensionsFor(state.format, state.templateId);
    var exportCanvas = document.createElement('canvas');
    exportCanvas.width = fmt.w * scale;
    exportCanvas.height = fmt.h * scale;

    var ctx = exportCanvas.getContext('2d');
    if (scale > 1) {
      ctx.scale(scale, scale);
    }
    window.Renderer.renderToContext(ctx, fmt.w, fmt.h, state);
    return exportCanvas;
  }

  // ── Export Actions (PNG & ZIP) ───────────────────────────────

  function initExport() {
    var btnPng = document.getElementById('btnExportPng');
    var btnAll = document.getElementById('btnExportAll');

    if (btnPng) {
      btnPng.addEventListener('click', async function() {
        setStatus('Generating export...', '');
        try {
          var state = window.AppState.get();
          await window.Renderer.landmark.decode();
          var scale = state.exportScale || 1;
          var exportCanvas = renderToExportCanvas(state, scale);
          var blob = await window.ExportUtils.canvasBlob(exportCanvas);
          var filename = 'shuvo-' + (state.templateId || 'slide') + '-' + exportCanvas.width + 'x' + exportCanvas.height + '-' + Date.now() + '.png';
          window.ExportUtils.triggerDownload(blob, filename);
          setStatus('Exported: ' + filename + ' (' + exportCanvas.width + 'x' + exportCanvas.height + ')');
        } catch(e) {
          setStatus('Export failed: ' + e.message, 'error');
        }
      });
    }

    if (btnAll) {
      btnAll.addEventListener('click', async function() {
        setStatus('Exporting all 5 slides...', '');
        try {
          var originalState = window.AppState.get();
          await window.Renderer.landmark.decode();
          var scale = originalState.exportScale || 1;
          var templates = ['meeting', 'casestudy', 'project', 'service', 'tip'];
          var items = [];

          for (var i = 0; i < templates.length; i++) {
            var tpl = templates[i];
            var slideState = Object.assign({}, originalState, { templateId: tpl });
            var exportCanvas = renderToExportCanvas(slideState, scale);
            var blob = await window.ExportUtils.canvasBlob(exportCanvas);
            var bytes = new Uint8Array(await blob.arrayBuffer());
            items.push(['shuvo-0' + (i + 1) + '-' + tpl + '.png', bytes]);
          }

          var zip = window.ExportUtils.createZip(items);
          window.ExportUtils.triggerDownload(zip, 'shuvo-brand-studio-bundle-' + Date.now() + '.zip');
          setStatus('Exported all ' + templates.length + ' slides as ZIP archive');
        } catch(e) {
          setStatus('Export failed: ' + e.message, 'error');
        }
      });
    }
  }

  // ── Project Save / Load & Hydration ─────────────────────────

  function hydrateForm(state) {
    showTemplate(state.templateId);
    var fields = {
      meetingTitle: 'meetingTitle',
      meetingCaption: 'meetingCaption',
      authorName: 'authorName',
      csCategory: 'csCategory',
      csHeadline: 'csHeadline',
      csChallenge: 'csChallenge',
      csSolution: 'csSolution',
      projectTitle: 'projectTitle',
      projectType: 'projectType',
      projectDesc: 'projectDesc',
      serviceName: 'serviceName',
      serviceHeadline: 'serviceHeadline',
      serviceDesc: 'serviceDesc',
      tipCategory: 'tipCategory',
      tipHeadline: 'tipHeadline',
      tipInsight: 'tipInsight',
      countryLabelInput: 'countryLabel'
    };

    Object.keys(fields).forEach(function(elId) {
      var el = document.getElementById(elId);
      var stateKey = fields[elId];
      if (el && state[stateKey] !== undefined) el.value = state[stateKey];
    });

    var showAuthorEl = document.getElementById('showAuthor');
    if (showAuthorEl && state.showAuthor !== undefined) showAuthorEl.checked = state.showAuthor;

    var fontEl = document.getElementById('fontFamily');
    if (fontEl && state.fontFamily) fontEl.value = state.fontFamily;

    var fmtEl = document.getElementById('formatSelect');
    if (fmtEl && state.format) fmtEl.value = state.format;

    var bgEl = document.getElementById('bgColorSelect');
    if (bgEl && state.bgColor) bgEl.value = state.bgColor;

    var scaleEl = document.getElementById('exportScale');
    if (scaleEl && state.exportScale) scaleEl.value = state.exportScale;

    var mFit = document.getElementById('meetingFit');
    if (mFit && state.meetingFit) mFit.value = state.meetingFit;

    var mZoom = document.getElementById('meetingZoom');
    var mZoomVal = document.getElementById('meetingZoomVal');
    if (mZoom && state.meetingZoom !== undefined) {
      mZoom.value = state.meetingZoom;
      if (mZoomVal) mZoomVal.textContent = state.meetingZoom + '%';
    }

    var mOff = document.getElementById('meetingOffsetY');
    var mOffVal = document.getElementById('meetingOffsetVal');
    if (mOff && state.meetingOffsetY !== undefined) {
      mOff.value = state.meetingOffsetY;
      if (mOffVal) mOffVal.textContent = state.meetingOffsetY + 'px';
    }

    var pFit = document.getElementById('projectFit');
    if (pFit && state.projectFit) pFit.value = state.projectFit;

    var pZoom = document.getElementById('projectZoom');
    var pZoomVal = document.getElementById('projectZoomVal');
    if (pZoom && state.projectZoom !== undefined) {
      pZoom.value = state.projectZoom;
      if (pZoomVal) pZoomVal.textContent = state.projectZoom + '%';
    }

    var pOff = document.getElementById('projectOffsetY');
    var pOffVal = document.getElementById('projectOffsetVal');
    if (pOff && state.projectOffsetY !== undefined) {
      pOff.value = state.projectOffsetY;
      if (pOffVal) pOffVal.textContent = state.projectOffsetY + 'px';
    }

    var techEl = document.getElementById('projectTechInput');
    if (techEl && Array.isArray(state.projectTech)) techEl.value = state.projectTech.join(', ');

    if (Array.isArray(state.serviceBenefits)) {
      ['benefit1', 'benefit2', 'benefit3'].forEach(function(id, i) {
        var el = document.getElementById(id);
        if (el && state.serviceBenefits[i] !== undefined) el.value = state.serviceBenefits[i];
      });
    }

    var displayName = document.getElementById('countryDisplayName');
    if (displayName && state.countryLabel) displayName.textContent = state.countryLabel;
  }

  function initSaveLoad() {
    var btnSave = document.getElementById('btnSave');
    var fileLoad = document.getElementById('fileLoadProject');
    var btnReset = document.getElementById('btnReset');

    if (btnSave) {
      btnSave.addEventListener('click', function() {
        window.Storage.saveProject(window.AppState.get(), {
          meetingImg: meetingDataUrl,
          projectImg: projectDataUrl
        });
      });
    }

    if (fileLoad) {
      fileLoad.addEventListener('change', async function(e) {
        var file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
          var result = await window.Storage.loadProjectFile(file);
          result.state = window.AppState.restoreDefaults(result.state);
          window.AppState.set(result.state);
          hydrateForm(result.state);

          if (result.screenshots && result.screenshots.meetingImg) {
            var img = new Image();
            var dataUrl = result.screenshots.meetingImg;
            img.onload = function() {
              meetingDataUrl = dataUrl;
              window.AppState.setImage('meetingImg', img);
              render();
            };
            img.src = dataUrl;
          }
          if (result.screenshots && result.screenshots.projectImg) {
            var img2 = new Image();
            var dataUrl2 = result.screenshots.projectImg;
            img2.onload = function() {
              projectDataUrl = dataUrl2;
              window.AppState.setImage('projectImg', img2);
              render();
            };
            img2.src = dataUrl2;
          }

          if (result.state.format) applyFormat(result.state.format);
          render();
          setStatus('Project loaded successfully.');
        } catch(err) {
          setStatus('Could not load project: ' + err.message, 'error');
        }
        fileLoad.value = '';
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', function() {
        window.AppState.reset();
        meetingDataUrl = null;
        projectDataUrl = null;
        hydrateForm(window.AppState.get());
        applyFormat(window.AppState.DEFAULT_STATE.format);
        if (document.getElementById('formatSelect')) document.getElementById('formatSelect').value = window.AppState.DEFAULT_STATE.format;
        if (document.getElementById('bgColorSelect')) document.getElementById('bgColorSelect').value = '#FFFFFF';
        render();
        setStatus('Reset to default brand settings.');
      });
    }
  }

  // ── Initialization ──────────────────────────────────────────

  function init() {
    canvas = document.getElementById('mainCanvas');
    canvasWrapper = document.getElementById('canvasWrapper');
    statusEl = document.getElementById('canvasStatus');
    dimensionsEl = document.getElementById('canvasDimensions');

    if (!canvas) return;

    var currentState = window.AppState.get();
    applyFormat(currentState.format || 'square');
    hydrateForm(currentState);

    // Load countries flags sprite
    var flagsImg = new Image();
    flagsImg.onload = function() {
      window.AppState.setImage('flagsImg', flagsImg);
      if (window._redrawFlagPreview) window._redrawFlagPreview(currentState.countryCode || 'ae');
      render();
    };
    flagsImg.onerror = function() { setStatus('Could not load flags sprite', 'warning'); };
    if (window.APP_ASSETS && window.APP_ASSETS.FLAGS_SPRITE_IMAGE) {
      flagsImg.src = window.APP_ASSETS.FLAGS_SPRITE_IMAGE;
    }

    window.Renderer.landmark.addEventListener('load', render);
    var sample = currentState.countryCode === 'us' ? window.MEETING_ART.screenshot : window.APP_ASSETS.DEFAULT_MEETING_IMAGE;
    // Load default authentic meeting screenshot
    if (window.APP_ASSETS && window.APP_ASSETS.DEFAULT_MEETING_IMAGE) {
      var defMeeting = new Image();
      defMeeting.onload = function() {
        meetingDataUrl = sample;
        window.AppState.setImage('meetingImg', defMeeting);
        render();
      };
      defMeeting.src = sample;
    }

    initTemplateTabs();
    initCountrySearch();
    initFileUploads();
    initInputBindings();
    initExport();
    initSaveLoad();
    initServiceAnimation();

    render();
    setStatus('Ready — Shuvo Brand Studio');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();