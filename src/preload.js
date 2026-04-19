const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("zenith", {
  // ==================== CORE AUDIO CONTROL ====================
  applyMode: (modeId) => ipcRenderer.send("apply-mode", modeId),
  applyCustomEq: (eqString) => ipcRenderer.send("apply-custom-eq", eqString),
  applyHardwareCorrection: (hardwareId) => ipcRenderer.send("apply-hardware-correction", hardwareId),
  
  // Surgical Precision Controls for Manual Mode
  updateBass: (value) => ipcRenderer.send("update-bass", value),
  updateClarity: (value) => ipcRenderer.send("update-clarity", value),
  
  // NEW: Added to resolve setSpatialWidth & applyCompression errors
  setSpatialWidth: (value) => ipcRenderer.send("set-spatial-width", value),
  applyCompression: (value) => ipcRenderer.send("apply-compression", value),
  
  toggleSpatial: (enabled) => ipcRenderer.send("toggle-spatial", enabled),
  togglePower: (power) => ipcRenderer.send("toggle-power", power),
  changeVolume: (volume) => ipcRenderer.send("change-volume", volume),
  runOptimization: () => ipcRenderer.send("run-optimization"),
  
  // ==================== DATA FETCHING ====================
  detectDevice: () => ipcRenderer.invoke("detect-device"),
  getState: () => ipcRenderer.invoke("get-state"),
  getMetrics: () => ipcRenderer.invoke("get-metrics"),
  getPresets: () => ipcRenderer.invoke("get-presets"),
  
  // ==================== HEARING PROFILE (Golden Ear) ====================
  saveHearingProfile: (profile) => ipcRenderer.invoke("save-hearing-profile", profile),
  getHearingProfile: () => ipcRenderer.invoke("get-hearing-profile"),
  
  // ==================== HARDWARE CORRECTION ====================
  getHardwareCorrection: (deviceName) => ipcRenderer.invoke("get-hardware-correction", deviceName),
  
  // ==================== AUDIO DATA FOR VISUALIZATION ====================
  // Ensure this connects to the real system loopback for Spotify reactivity
  onAudioData: (callback) => {
    ipcRenderer.on('audio-data', (event, data) => callback(data));
  },
  removeAudioDataListener: () => {
    ipcRenderer.removeAllListeners('audio-data');
  },
  
  // ==================== WINDOW CONTROLS ====================
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
  
  // ==================== EVENT LISTENERS ====================
  on: (channel, callback) => {
    const valid = [
      "mode-applied",
      "optimization-progress",
      "optimization-complete",
      "volume-changed",
      "settings-updated",
      "power-toggled",
      "hardware-applied",
      "scene-detected",
      "audio-data" // Added for consistency
    ];
    if (valid.includes(channel)) {
      ipcRenderer.on(channel, (_, data) => callback(data));
    }
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
  
  // ==================== UTILITIES ====================
  getVersion: () => "v4.0.0-Surgical"
});

console.log("[Zenith] Bridge v4.0 Ready - Surgical Core & AI Integration Stabilized");