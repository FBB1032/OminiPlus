const { app, BrowserWindow, shell, ipcMain, Menu, session } = require('electron');
const path = require('path');

let mainWindow = null;

const isDev = process.env.NODE_ENV !== 'production';
const PORT = process.env.PORT || 3005;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1080,
    minHeight: 700,
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

  // Load local Next.js app
  const startUrl = isDev
    ? `http://localhost:${PORT}`
    : `http://localhost:${PORT}`;

  mainWindow.loadURL(startUrl).catch(() => {
    // If server is not yet ready, retry
    setTimeout(() => {
      mainWindow.loadURL(startUrl);
    }, 1500);
  });

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

app.whenReady().then(() => {
  // Explicitly grant media permissions (webcam, microphone, audio, fullscreen)
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

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
