const { app, BrowserWindow, Tray, Menu, globalShortcut, shell, ipcMain, Notification, nativeImage, session } = require("electron");
const path = require("path");
const { exec } = require("child_process");
const http = require("http");

let mainWindow = null;
let tray = null;
let trackerInterval = null;

const WEB_URL = process.env.VITA_WEB_URL || "http://localhost:3000";
const API_URL = process.env.VITA_API_URL || "http://localhost:8000";

// Single Instance Lock to prevent multiple Electron windows opening
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Built-in Known App Mappings
  const APP_MAPPINGS = {
    "Antigravity": { name: "Antigravity", category: "Coding & Dev" },
    "Antigravity IDE": { name: "Antigravity", category: "Coding & Dev" },
    "antigravity": { name: "Antigravity", category: "Coding & Dev" },
    "Discord": { name: "Discord", category: "Product & Strategy" },
    "OrbStack": { name: "OrbStack", category: "Coding & Dev" },
    "Safari": { name: "Safari", category: "Reading & Research" },
    "Code": { name: "VS Code", category: "Coding & Dev" },
    "Visual Studio Code": { name: "VS Code", category: "Coding & Dev" },
    "Cursor": { name: "Cursor", category: "Coding & Dev" },
    "Figma": { name: "Figma", category: "Design & UI" },
    "Google Chrome": { name: "Chrome", category: "Reading & Research" },
    "Chrome": { name: "Chrome", category: "Reading & Research" },
    "Arc": { name: "Arc", category: "Reading & Research" },
    "Firefox": { name: "Firefox", category: "Reading & Research" },
    "iTerm2": { name: "iTerm", category: "Coding & Dev" },
    "iTerm": { name: "iTerm", category: "Coding & Dev" },
    "Terminal": { name: "iTerm", category: "Coding & Dev" },
    "Slack": { name: "Slack", category: "Product & Strategy" },
    "Notion": { name: "Notion", category: "Writing & Docs" },
    "Obsidian": { name: "Obsidian", category: "Writing & Docs" },
    "Pages": { name: "Pages", category: "Writing & Docs" },
    "Microsoft Word": { name: "Word", category: "Writing & Docs" },
    "Word": { name: "Word", category: "Writing & Docs" },
    "Jupyter": { name: "Jupyter", category: "Data & Analytics" },
    "TablePlus": { name: "TablePlus", category: "Data & Analytics" },
    "Excel": { name: "Excel", category: "Data & Analytics" },
    "Linear": { name: "Linear", category: "Product & Strategy" },
    "Jira": { name: "Jira", category: "Product & Strategy" },
    "Docker": { name: "Docker", category: "Coding & Dev" },
    "Docker Desktop": { name: "Docker", category: "Coding & Dev" }
  };

  // Dynamic In-Memory AI App Classification Cache
  const APP_CLASSIFICATION_CACHE = {};

  // Helper to dynamically classify unknown apps via FastAPI AI Classifier Service
  function classifyAppWithAI(rawProcessName, callback) {
    if (APP_MAPPINGS[rawProcessName]) {
      return callback(APP_MAPPINGS[rawProcessName]);
    }
    if (APP_CLASSIFICATION_CACHE[rawProcessName]) {
      return callback(APP_CLASSIFICATION_CACHE[rawProcessName]);
    }

    // Default fast fallback while classifying
    const lowName = rawProcessName.toLowerCase();
    const fallback = {
      name: rawProcessName,
      category: (lowName.includes("notes") || lowName.includes("pages") || lowName.includes("word") || lowName.includes("text")) 
        ? "Writing & Docs" 
        : (lowName.includes("chat") || lowName.includes("discord") || lowName.includes("slack")) 
          ? "Product & Strategy" 
          : "Writing & Docs"
    };

    const postData = JSON.stringify({ raw_name: rawProcessName });
    const req = http.request(`${API_URL}/analytics/classify-app`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      },
      timeout: 1500
    }, (res) => {
      let body = "";
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed && parsed.name && parsed.category) {
            APP_CLASSIFICATION_CACHE[rawProcessName] = {
              name: parsed.name,
              category: parsed.category,
              status: parsed.status,
              efficiency: parsed.efficiency
            };
            return callback(APP_CLASSIFICATION_CACHE[rawProcessName]);
          }
        } catch (e) {}
        callback(fallback);
      });
    });

    req.on("error", () => callback(fallback));
    req.on("timeout", () => { req.destroy(); callback(fallback); });
    req.write(postData);
    req.end();
  }

  // Pure Dynamic Telemetry Accumulator
  let appTimeSeconds = {};

  function startAutomaticActivityTracker() {
    // Built-in macOS LaunchServices CLI query (zero permissions required, 100% popup-free)
    const command = "lsappinfo info -only name $(lsappinfo front)";

    trackerInterval = setInterval(() => {
      exec(command, (error, stdout) => {
        if (error || !stdout) return;
        const match = stdout.match(/"(?:LSDisplayName|name)"="([^"]+)"/);
        if (!match || !match[1]) return;

        const rawProcessName = match[1].trim();
        if (!rawProcessName || rawProcessName === "Electron" || rawProcessName === "vita-desktop") return;
        
        classifyAppWithAI(rawProcessName, (mapped) => {
          // Accumulate 2 seconds of actual system focus for frontmost process
          if (!appTimeSeconds[mapped.name]) {
            appTimeSeconds[mapped.name] = 0;
          }
          appTimeSeconds[mapped.name] += 2;

          // Calculate relative percentages of total tracked time
          const totalSecs = Object.values(appTimeSeconds).reduce((a, b) => a + b, 0);
          const appPercentages = {};
          Object.keys(appTimeSeconds).forEach(appName => {
            appPercentages[appName] = totalSecs > 0 ? Math.round((appTimeSeconds[appName] / totalSecs) * 100) : 0;
          });

          // Broadcast live system activity telemetry to Next.js dashboard
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("realtime-activity-telemetry", {
              activeApp: mapped.name,
              category: mapped.category,
              rawProcess: rawProcessName,
              appTimeSeconds: appTimeSeconds,
              appPercentages: appPercentages,
              permissionGranted: true
            });
          }
        });
      });
    }, 2000);
  }

  function setupSecurityHeaders() {
    const isDev = process.env.NODE_ENV !== "production";
    
    // Strict Production CSP (disables unsafe-eval) vs. Dev CSP (allows HMR)
    const cspPolicy = isDev
      ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://127.0.0.1:* ws://localhost:* ws://127.0.0.1:* data: blob:;"
      : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 ws://localhost:8000; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self';";

    if (session && session.defaultSession) {
      session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            "Content-Security-Policy": [cspPolicy]
          }
        });
      });
    }
  }

  function createWindow() {
    setupSecurityHeaders();
    mainWindow = new BrowserWindow({
      width: 1440,
      height: 920,
      minWidth: 1024,
      minHeight: 700,
      title: "Vita Focus Telemetry Studio",
      titleBarStyle: "hiddenInset",
      trafficLightPosition: { x: 16, y: 16 },
      vibrancy: "sidebar",
      visualEffectState: "active",
      backgroundColor: "#e4e7e4",
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
        preload: path.join(__dirname, "preload.js")
      },
      show: false
    });

    mainWindow.loadURL(WEB_URL);

    mainWindow.once("ready-to-show", () => {
      mainWindow.show();
      mainWindow.focus();
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith("http:") || url.startsWith("https:")) {
        shell.openExternal(url);
        return { action: "deny" };
      }
      return { action: "allow" };
    });

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }

  function createTray() {
    try {
      const iconPath = path.join(__dirname, "public", "trayIconTemplate.png");
      const icon = nativeImage.createFromPath(iconPath);
      icon.setTemplateImage(true);
      tray = new Tray(icon);
    } catch (err) {
      console.error("[Vita] Failed to create tray icon:", err.message);
      return;
    }

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Vita Focus Telemetry Studio",
        enabled: false
      },
      { type: "separator" },
      {
        label: "Show Studio Window",
        click: () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
          } else {
            createWindow();
          }
        }
      },
      { type: "separator" },
      {
        label: "Quit Vita",
        click: () => {
          app.isQuitting = true;
          app.quit();
        }
      }
    ]);

    tray.setToolTip("Vita Focus Telemetry Studio");
    tray.setContextMenu(contextMenu);
  }

  ipcMain.on("update-timer-status", (_event, data) => {
    if (!tray) return;
    const { timerFormatted, activeSessionRunning, category } = data || {};
    if (activeSessionRunning && timerFormatted) {
      if (process.platform === "darwin") {
        tray.setTitle(` ${timerFormatted}`);
      }
      tray.setToolTip(`Vita Focus: ${timerFormatted} (${category || "Active"})`);
    } else {
      if (process.platform === "darwin") {
        tray.setTitle("");
      }
      tray.setToolTip("Vita Focus Telemetry Studio");
    }
  });

  ipcMain.on("timer-completed-notification", (_event, data) => {
    const { category, durationMinutes } = data || {};
    if (process.platform === "darwin" && tray) {
      tray.setTitle(" Done!");
      setTimeout(() => {
        if (tray) tray.setTitle("");
      }, 6000);
    }
    if (Notification.isSupported()) {
      const notif = new Notification({
        title: "Focus Sprint Completed",
        body: `Great job! Your ${durationMinutes || 25}-minute ${category || "Focus"} session is finished. Time to take a short break!`,
        silent: false
      });
      notif.on("click", () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      });
      notif.show();
    }
  });

  app.setAsDefaultProtocolClient("vita");

  app.on("open-url", (event, url) => {
    event.preventDefault();
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    } else {
      createWindow();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();
    startAutomaticActivityTracker();

    globalShortcut.register("CommandOrControl+Shift+V", () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      } else {
        createWindow();
      }
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("will-quit", () => {
    if (trackerInterval) clearInterval(trackerInterval);
    globalShortcut.unregisterAll();
  });
}
