const { app, BrowserWindow, shell, ipcMain, Menu, session, dialog, crashReporter } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const fs = require('fs');

let mainWindow = null;
let nextServerProcess = null;

const isDev = !!process.env.ELECTRON_DEV_URL;
const PORT = Number(process.env.PORT || 3005);

// ---------------------------------------------------------------------------
// Single-instance lock — prevents zombie background processes / port conflicts
// ---------------------------------------------------------------------------
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// ---------------------------------------------------------------------------
// GPU crash fallback — d3dcompiler/vulkan driver issues cause silent failures
// on old Intel/AMD chipsets; retry once without GPU, then with software GL.
// ---------------------------------------------------------------------------
const gpuBlacklistPath = path.join(app.getPath('userData'), 'gpu-disabled');
if (fs.existsSync(gpuBlacklistPath)) {
  app.disableHardwareAcceleration();
}

app.on('child-process-gone', (_event, details) => {
  if (details.type === 'GPU' && details.reason !== 'clean-exit') {
    try { fs.writeFileSync(gpuBlacklistPath, String(Date.now())); } catch {}
    dialog.showErrorBox(
      'OminiPulse Desktop — Graphics Issue Detected',
      'The graphics subsystem crashed. Hardware acceleration has been disabled.\nPlease restart the application.'
    );
    app.relaunch();
    app.exit(0);
  }
});

app.on('render-process-gone', (_event, _webContents, details) => {
  if (details.reason !== 'clean-exit' && mainWindow && !mainWindow.isDestroyed()) {
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'error',
      buttons: ['Reload', 'Quit'],
      defaultId: 0,
      title: 'OminiPulse Desktop',
      message: 'The application window stopped responding.',
      detail: `Renderer exit reason: ${details.reason}`,
    });
    if (choice === 0) {
      mainWindow.webContents.reload();
    } else {
      app.quit();
    }
  }
});

app.on('uncaughtException', (err) => {
  dialog.showErrorBox(
    'OminiPulse Desktop — Unexpected Error',
    `${err && err.stack ? err.stack : err}`
  );
});

// ---------------------------------------------------------------------------
// Next.js server management
// ---------------------------------------------------------------------------
function resolveServerEntry() {
  // Packaged: standalone server copied to extraResources/app-standalone
  const candidates = [
    path.join(process.resourcesPath, 'app-standalone', 'server.js'),
    path.join(process.resourcesPath, 'app.asar.unpacked', '.next', 'standalone', 'server.js'),
    path.join(__dirname, '..', '.next', 'standalone', 'server.js'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function startNextServer(entry) {
  const serverRoot = path.dirname(entry);
  const env = {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(PORT),
    HOSTNAME: '127.0.0.1',
    // Run the bundled Electron binary as plain Node.js for the server process
    ELECTRON_RUN_AS_NODE: '1',
    ELECTRON_NO_ATTACH_CONSOLE: '1',
  };

  nextServerProcess = spawn(process.execPath, [entry], {
    cwd: serverRoot,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  nextServerProcess.stdout.on('data', (d) => process.stdout.write(d));
  nextServerProcess.stderr.on('data', (d) => process.stderr.write(d));

  nextServerProcess.on('error', (err) => {
    dialog.showErrorBox(
      'OminiPulse Desktop — Server Error',
      `Failed to start the application server:\n${err.message}`
    );
  });

  nextServerProcess.on('exit', (code) => {
    nextServerProcess = null;
    if (code && code !== 0 && !app.isQuitting) {
      dialog.showErrorBox(
        'OminiPulse Desktop — Server Crashed',
        `The application server exited with code ${code}.\nPlease reinstall the application if this keeps happening.`
      );
    }
  });
}

function waitForServer(port, timeoutMs = 30000) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(`http://127.0.0.1:${port}`, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Server did not start within ${timeoutMs / 1000}s on port ${port}.`));
        } else {
          setTimeout(attempt, 300);
        }
      });
    };
    attempt();
  });
}

// ---------------------------------------------------------------------------
// Window
// ---------------------------------------------------------------------------
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
    show: false,
    title: 'OminiPulse — Professional Clinical Desktop Suite',
    backgroundColor: '#f8fafc',
    icon: path.join(__dirname, '../public/favicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  // Custom Application Menu
  const template = [
    {
      label: 'OminiPulse',
      submenu: [
        { label: 'About OminiPulse', click: () => shell.openExternal('https://ominipulse.ai') },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { role: 'close' },
      ],
    },
    {
      label: 'Help & Security',
      submenu: [
        { label: 'MDCN Compliance Guidelines', click: () => shell.openExternal('https://www.mdcn.gov.ng') },
        { label: 'NDPA 2023 Data Protection', click: () => shell.openExternal('https://ndpc.gov.ng') },
        { type: 'separator' },
        { label: 'Clinical Helpdesk', click: () => shell.openExternal('mailto:support@ominipulse.ai') },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function showErrorDialog(title, message) {
  dialog.showErrorBox(`OminiPulse Desktop — ${title}`, message);
}

// ---------------------------------------------------------------------------
// Boot sequence
// ---------------------------------------------------------------------------
async function boot() {
  // Media permissions (webcam, microphone, fullscreen for telehealth)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowed = ['media', 'mediaKeySystem', 'notifications', 'fullscreen', 'pointerLock'];
    if (allowed.includes(permission)) {
      return callback(true);
    }
    callback(false);
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    const allowed = ['media', 'mediaKeySystem', 'notifications', 'fullscreen', 'pointerLock'];
    return allowed.includes(permission);
  });

  // Fullscreen IPC handlers for Video Telehealth Consultation
  ipcMain.handle('toggle-fullscreen', () => {
    if (mainWindow) {
      const next = !mainWindow.isFullScreen();
      mainWindow.setFullScreen(next);
      return next;
    }
    return false;
  });

  ipcMain.handle('set-fullscreen', (_event, flag) => {
    if (mainWindow) {
      mainWindow.setFullScreen(flag);
      return mainWindow.isFullScreen();
    }
    return false;
  });

  ipcMain.handle('is-fullscreen', () => {
    return mainWindow ? mainWindow.isFullScreen() : false;
  });

  createMainWindow();

  if (isDev) {
    // Dev: Next.js dev server is started externally via `concurrently` + `wait-on`
    const startUrl = process.env.ELECTRON_DEV_URL || `http://localhost:${PORT}`;
    await mainWindow.loadURL(startUrl).catch(() => {
      setTimeout(() => mainWindow && mainWindow.loadURL(startUrl), 1500);
    });
    mainWindow.show();
    return;
  }

  // Production: start the bundled Next.js standalone server
  const entry = resolveServerEntry();
  if (!entry) {
    showErrorDialog(
      'Installation Error',
      'Application server files are missing or corrupted.\n\nPlease reinstall OminiPulse Desktop.'
    );
    mainWindow.destroy();
    app.quit();
    return;
  }

  try {
    startNextServer(entry);
    await waitForServer(PORT);
    await mainWindow.loadURL(`http://127.0.0.1:${PORT}`);
    mainWindow.show();
  } catch (err) {
    showErrorDialog(
      'Startup Failed',
      `Failed to start the application server:\n${err && err.message ? err.message : err}\n\n` +
      'If the problem persists, reinstall the application.'
    );
    mainWindow.destroy();
    app.quit();
  }
}

app.whenReady().then(boot);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('will-quit', () => {
  if (nextServerProcess && !nextServerProcess.killed) {
    try { nextServerProcess.kill(); } catch {}
  }
});
