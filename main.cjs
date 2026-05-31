const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    title: "ivid",
    icon: path.join(__dirname, "public", "icon.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
    },
  });

  // Create the native VLC-style application menu
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Open File...",
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog(win, {
              properties: ["openFile", "multiSelections"],
              filters: [
                {
                  name: "Videos",
                  extensions: ["mp4", "mkv", "webm", "avi", "mov"],
                },
              ],
            });
            if (!canceled) {
              win.webContents.send("open-files", filePaths);
            }
          },
        },
        {
          label: "Open Folder...",
          accelerator: "CmdOrCtrl+Shift+O",
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog(win, {
              properties: ["openDirectory"],
            });
            if (!canceled) {
              win.webContents.send("open-folder", filePaths[0]);
            }
          },
        },
        { type: "separator" },
        { label: "Exit", role: "quit" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // In development, Vite runs on port 5173
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  ipcMain.handle("get-initial-files", () => {
    const args = process.argv.slice(isDev ? 2 : 1);
    const files = args.filter((arg) => !arg.startsWith("-") && arg !== ".");
    return files.map((f) => path.resolve(f));
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
