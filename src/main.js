const { ipcMain, app, BrowserWindow } = require("electron");
const fs = require("fs").promises;
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);


app.setAppUserModelId("com.zenith.auralyze");


if (require('electron-squirrel-startup')) {
  app.quit();
}

// ==================== PATHS ====================
const APO_CONFIG_DIR = "C:\\Program Files\\EqualizerAPO\\config\\";
const MASTER_CONFIG_PATH = path.join(APO_CONFIG_DIR, "config.txt"); // The Master Switchboard
const ZENITH_CONFIG_PATH = path.join(APO_CONFIG_DIR, "zenith_active.txt");
const STATE_PATH = path.join(app.getPath("userData"), "zenith_state.json");

// ==================== ENGINE STATE ====================
let engineState = {
  isActive: true,
  currentMode: "music",
  spatialWidth: 25,
  compression: 0,
  customEq: "32 0; 64 0; 125 0; 250 0; 500 0; 1000 0; 2000 0; 4000 0; 8000 0; 16000 0",
  metrics: { bitDepth: 32, sampleRate: 192000, latency: 0.2 }
};

// ==================== NEURAL BRIDGE (AUTO-LINK) ====================
/**

 */
const establishNeuralBridge = async () => {
  try {
    const includeLine = `Include: zenith_active.txt`;
    let masterConfigContent = "";

    try {
      masterConfigContent = await fs.readFile(MASTER_CONFIG_PATH, "utf-8");
    } catch (e) {
      console.log("[Zenith] Master config not found. Is APO installed?");
      return;
    }

    if (!masterConfigContent.includes("zenith_active.txt")) {
      // Inject the engine at the top of the audio stack
      const updatedConfig = `${includeLine}\n${masterConfigContent}`;
      await fs.writeFile(MASTER_CONFIG_PATH, updatedConfig, "utf-8");
      console.log("[Zenith] Neural Bridge established successfully.");
    }
  } catch (err) {
    console.error("[Zenith] Bridge Error: Please Run as Administrator to link hardware.");
  }
};

// ==================== DEBOUNCE LOGIC (Anti-Crackle) ====================
let writeTimeout = null;
const SMOOTH_DELAY = 15; 

const applyAudioEngineSmooth = async () => {
  if (writeTimeout) clearTimeout(writeTimeout);
  
  writeTimeout = setTimeout(async () => {
    try {
      const config = generateConfig();
      await fs.writeFile(ZENITH_CONFIG_PATH, config, "utf-8");
      await saveState();
    } catch (err) {
      console.error("[Zenith] Bridge Busy or APO Missing. Check permissions.");
    }
  }, SMOOTH_DELAY);
};

// ==================== UTILITIES ====================
const saveState = async () => {
  try {
    await fs.writeFile(STATE_PATH, JSON.stringify(engineState, null, 2));
  } catch (err) { console.error("State save failed:", err); }
};

const loadState = async () => {
  try {
    const data = await fs.readFile(STATE_PATH, "utf-8");
    engineState = { ...engineState, ...JSON.parse(data) };
  } catch (err) { console.log("[Zenith] Loading Default State Profile"); }
};

const generateConfig = () => {
  if (!engineState.isActive) {
    return `# ZENITH ENGINE - BYPASSED (OFF)\nPreamp: -3.0 dB\nGraphicEQ: 32 0; 64 0; 125 0; 250 0; 500 0; 1000 0; 2000 0; 4000 0; 8000 0; 16000 0`;
  }
  const timestamp = new Date().toLocaleString();
  const spatialValue = (engineState.spatialWidth / 100).toFixed(2);
  
  return `# ZENITH NEURAL ENGINE v4.0\n# Generated: ${timestamp}\n\nPreamp: -6.0 dB\nGraphicEQ: ${engineState.customEq}\n\n# Spatial Expansion\nCopy: L=L+${spatialValue}*R R=R+${spatialValue}*L\nDelay: 10 ms\n\n# Neural Dynamics\n${engineState.compression > 0 ? `Filter: ON PK Fc 1000 Hz Gain ${engineState.compression} dB Q 0.1` : "# Boost Standby"}`;
};

// ==================== IPC HANDLERS ====================
ipcMain.on("window-minimize", () => mainWindow?.minimize());
ipcMain.on("window-maximize", () => {
  if (mainWindow?.isMaximized()) mainWindow?.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on("window-close", () => app.quit());

ipcMain.handle("detect-device", async () => {
  try {
    const { stdout } = await execPromise(`powershell -NoProfile -Command "Get-AudioDevice -Playback | Where-Object { $_.Default -eq $true } | Select-Object -ExpandProperty Name"`);
    return { name: stdout.trim() || "Master Audio", status: "Verified" };
  } catch (err) {
    return { name: "System Output", status: "Fallback" };
  }
});

ipcMain.on("toggle-power", (event, power) => {
  engineState.isActive = power;
  applyAudioEngineSmooth();
});

ipcMain.on("apply-custom-eq", (event, eqString) => {
  engineState.customEq = eqString;
  applyAudioEngineSmooth();
});

ipcMain.on("set-spatial-width", (event, value) => {
  engineState.spatialWidth = value;
  applyAudioEngineSmooth();
});

ipcMain.on("apply-mode", (event, modeId) => {
  engineState.currentMode = modeId;
  if(modeId === 'cinematic') engineState.customEq = "32 8; 64 6; 125 2; 250 -2; 500 -3; 1000 0; 2000 3; 4000 5; 8000 7; 16000 8";
  else if(modeId === 'gaming') engineState.customEq = "32 -3; 64 -1; 125 2; 250 5; 500 8; 1000 6; 2000 4; 4000 3; 8000 1; 16000 0";
  else engineState.customEq = "32 0; 64 0; 125 0; 250 0; 500 0; 1000 0; 2000 0; 4000 0; 8000 0; 16000 0";
  
  applyAudioEngineSmooth();
  event.reply("mode-applied", { mode: modeId, success: true });
});

// ==================== LIFECYCLE ====================
let mainWindow = null;

const createWindow = async () => {
  // 🛰️ Connect to Audio Hardware
  await establishNeuralBridge();
  
  // 📂 Load User Preferences
  await loadState();

  mainWindow = new BrowserWindow({
    width: 1300, 
    height: 850,
    backgroundColor: "#0B0E14",
    frame: false,
    show: false, 
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
};

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});