(function () {
  'use strict';

  var root = document.documentElement;
  var progressBar = document.querySelector('.progress');
  var progressFill = document.querySelector('.bar-fill');
  var statusText = document.getElementById('loading-status');
  var totalFiles = null;
  var remainingFiles = null;

  var designWidth = 1920;
  var designHeight = 1080;
  var barWidth = 1720;

  function resizeLayout() {
    var scale = Math.min(
      window.innerWidth / designWidth,
      window.innerHeight / designHeight
    );

    root.style.setProperty('--scale', scale);
    root.style.setProperty('--bar-scale', progressBar.clientWidth / barWidth);
  }

  function setProgress(percent) {
    percent = Math.max(0, Math.min(100, percent));
    progressBar.classList.remove('is-indeterminate');
    progressFill.style.width = percent + '%';
    progressBar.setAttribute('aria-valuenow', Math.round(percent));
    progressBar.removeAttribute('aria-valuetext');
  }

  function showActivity() {
    // Le statut Workshop ne fournit pas toujours de compteur exploitable.
    progressBar.classList.add('is-indeterminate');
    progressBar.removeAttribute('aria-valuenow');
    progressBar.setAttribute('aria-valuetext', 'Loading in progress');
  }

  function parseFileCount(value) {
    var count = Number(value);
    return Number.isFinite(count) && count >= 0 ? count : null;
  }

  function updateDownloadProgress() {
    if (totalFiles === null || totalFiles <= 0 || remainingFiles === null) {
      showActivity();
      return;
    }

    var downloadedFiles = totalFiles - remainingFiles;
    setProgress(downloadedFiles / totalFiles * 100);
  }

  window.SetFilesTotal = function (value) {
    totalFiles = parseFileCount(value);
    updateDownloadProgress();
  };

  window.SetFilesNeeded = function (value) {
    remainingFiles = parseFileCount(value);
    updateDownloadProgress();
  };

  window.DownloadingFile = function (fileName) {
    statusText.textContent = 'Downloading ' + String(fileName);
    updateDownloadProgress();
  };

  window.SetStatusChanged = function (value) {
    var message = String(value);
    statusText.textContent = message;

    var workshopProgress = message.match(/Mounted\s+(\d+)\s+of\s+(\d+)\s+workshop addons/i);
    if (workshopProgress && Number(workshopProgress[2]) > 0) {
      var mountedAddons = Number(workshopProgress[1]);
      var totalAddons = Number(workshopProgress[2]);
      setProgress(mountedAddons / totalAddons * 100);
    } else {
      showActivity();
    }
  };

  window.addEventListener('resize', resizeLayout);
  resizeLayout();
  showActivity();

  if (new URLSearchParams(window.location.search).get('preview') === '1') {
    window.SetStatusChanged('Mounted 122 of 122 workshop addons!');
  }
}());
