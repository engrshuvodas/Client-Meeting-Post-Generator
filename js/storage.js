'use strict';

(function() {

  function stripImages(state) {
    var s = Object.assign({}, state);
    delete s.meetingImg;
    delete s.projectImg;
    delete s.flagsImg;
    return s;
  }

  window.Storage = {

    saveProject: function(state, screenshots) {
      var project = {
        format: 'shuvo-brand-studio-v1',
        savedAt: new Date().toISOString(),
        state: stripImages(state),
        screenshots: screenshots || { meetingImg: null, projectImg: null }
      };
      var json = JSON.stringify(project, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var filename = 'shuvo-project-' + Date.now() + '.json';
      window.ExportUtils.triggerDownload(blob, filename);
    },

    loadProjectFile: function(file) {
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function(e) {
          try {
            var data = JSON.parse(e.target.result);
            if (!data || data.format !== 'shuvo-brand-studio-v1') {
              throw new Error('Invalid project file format.');
            }
            resolve({
              state: data.state || {},
              screenshots: data.screenshots || { meetingImg: null, projectImg: null }
            });
          } catch(err) {
            reject(err);
          }
        };
        reader.onerror = function() { reject(new Error('Could not read file.')); };
        reader.readAsText(file);
      });
    },

    saveToLocal: function(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch(e) {}
    },

    loadFromLocal: function(key) {
      try {
        var item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch(e) { return null; }
    }

  };

})();
