const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onTriggerSprintStart: (callback) => ipcRenderer.on("trigger-sprint-start", (_event, value) => callback(value)),
  onRealtimeActivityTelemetry: (callback) => ipcRenderer.on("realtime-activity-telemetry", (_event, value) => callback(value)),
  platform: process.platform
});
