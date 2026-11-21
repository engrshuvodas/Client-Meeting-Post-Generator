'use strict';

(function() {

  var STORAGE_KEY = 'shuvo_brand_studio_state_v1';

  var DEFAULT_STATE = {
    templateId: 'meeting',
    textSizes: {},
    format: 'square',         // 'square' (1080x1080), 'portrait45' (1080x1350), 'portrait34' (1080x1440)
    brandColor: '#1DBF73',
    fontFamily: 'Manrope',    // 'Manrope' or 'Inter'
    bgColor: '#FFFFFF',
    authorName: 'Engr. Shuvo Das',
    showAuthor: true,
    countryCode: 'us',
    countryLabel: 'USA',

    // Meeting template
    meetingTitle: 'Client',
    meetingHeadlineOffsetY: 0,
    meetingTitleAccent: 'Meeting',
    meetingCaption: '',
    meetingFit: 'contain',    // 'contain' or 'cover'
    meetingZoom: 100,         // percentage 50 - 200
    meetingOffsetY: 0,        // pixels -200 to +200

    chatHeadline: 'Client',
    chatHeadlineOffsetY: 0,
    chatHeadlineAccent: 'Conversation',
    chatFrame: 'phone',
    chatCountry: '',

    // Case Study template
    csCategory: 'Web Development',
    csHeadline: 'Scalable Microservices Architecture for High-Traffic eCommerce',
    csChallenge: 'The client faced frequent database bottlenecks and severe latency spikes during peak sales campaigns, causing high cart abandonment.',
    csSolution: 'Architected an asynchronous event-driven workflow using Node.js, Redis caching, and automated queue workers with optimized database indexing.',

    // Project Showcase template
    projectTitle: 'Enterprise Analytics Dashboard',
    projectType: 'Full-Stack Web Application',
    projectDesc: 'A responsive real-time data monitoring platform providing automated reporting and interactive metrics visualization.',
    projectTech: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    projectFit: 'contain',
    projectZoom: 100,
    projectOffsetY: 0,

    // Service Highlight template
    serviceName: 'Full-Stack Development & Automation',
    serviceHeadline: 'Robust digital solutions built to scale your business',
    serviceDesc: 'We architect and build bespoke web applications, API integrations, and workflow automations designed for performance, security, and long-term maintainability.',
    serviceBenefits: [
      'Clean, maintainable, production-grade architecture',
      'High-performance optimization and SEO best practices',
      'Direct communication, agile delivery, and ongoing support'
    ],

    // Tip / Insight template
    tipCategory: 'Software Engineering',
    tipHeadline: 'Write software for humans first, computers second',
    tipInsight: 'Code is read ten times more often than it is written. Clear naming, predictable module boundaries, and concise single-responsibility functions will always outperform clever but obscure shortcuts in long-term production maintenance.',

    margin: 90,
    exportScale: 1
  };

  // Image objects stored separately (cannot JSON-clone)
  var _images = {
    meetingImg: null, chatImg: null,
    projectImg: null,
    flagsImg: null
  };

  function restoreDefaults(saved) {
    var state = Object.assign({}, DEFAULT_STATE, saved);
    if (saved.meetingTitle === undefined && saved.meetingHeadline !== undefined) {
      state.meetingTitle = saved.showMeetingHeadline === false ? '' : saved.meetingHeadline;
    }
    if (saved.meetingCaption === undefined && saved.meetingNote !== undefined) state.meetingCaption = saved.meetingNote;
    ['meetingTitle', 'chatHeadline'].forEach(function(key) {
      if (saved[key + 'Accent'] !== undefined) return;
      if (saved[key] === undefined && !(key === 'meetingTitle' && saved.meetingHeadline !== undefined)) return;
      var words = String(state[key] || '').trim().split(/\s+/);
      state[key + 'Accent'] = words.pop();
      state[key] = words.join(' ');
    });
    if (state.format === 'auto') state.format = DEFAULT_STATE.format;
    return state;
  }

  function loadSavedState() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        var parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return restoreDefaults(Object.assign({}, parsed, { format: DEFAULT_STATE.format }));
        }
      }
    } catch(e) {}
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  var _state = loadSavedState();
  var _subscribers = [];

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_state));
    } catch(e) {}
  }

  function notify() {
    var view = Object.assign({}, _state, _images);
    _subscribers.forEach(function(fn) {
      try { fn(view); } catch(e) { console.error(e); }
    });
  }

  window.AppState = {
    restoreDefaults: restoreDefaults,
    get: function() {
      return Object.assign({}, _state, _images);
    },
    set: function(partial) {
      var imageKeys = ['meetingImg', 'chatImg', 'projectImg', 'flagsImg'];
      var filtered = {};
      Object.keys(partial).forEach(function(k) {
        if (imageKeys.indexOf(k) === -1) filtered[k] = partial[k];
      });
      Object.assign(_state, filtered);
      persist();
      notify();
    },
    setImage: function(key, imgObj) {
      _images[key] = imgObj;
      notify();
    },
    reset: function() {
      try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
      _state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      _images = { meetingImg: null, chatImg: null, projectImg: null, flagsImg: null };
      notify();
    },
    subscribe: function(fn) {
      _subscribers.push(fn);
    },
    notify: notify,
    DEFAULT_STATE: DEFAULT_STATE
  };

})();