import {app, BrowserWindow, ipcMain} from 'electron';
import path = require('path');
import {ConverterLoadingUtils} from "./utils/converter-loading.utils";

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 1300,
		height: 800,
		frame: false,
		transparent: true,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true
		},
		icon: path.join(__dirname, 'assets', 'converta-light.png'),
	});
	
	mainWindow.webContents.openDevTools();

	mainWindow.loadFile(path.join(__dirname, 'index.html')).catch((err) => {
		console.error('Failed to load index.html:', err);
	});
	
	mainWindow.setResizable(true);
	mainWindow.setMenuBarVisibility(false);
	mainWindow.on('closed', () => {
		mainWindow.destroy();
	});

	ipcMain.on('minimize-window', () => {
		mainWindow.minimize();
	});

	ipcMain.on('maximize-window', () => {
		if (mainWindow.isMaximized()) {
			mainWindow.unmaximize();
		} else {
			mainWindow.maximize();
		}
	});

	ipcMain.on('close-window', () => {
		mainWindow.close();
	});
	
	ipcMain.on('testing', () => {
		ConverterLoadingUtils.findAllDownloadableConverterPackages().then(r => console.log(r));
	});
	
	ipcMain.handle('get-downloadable-converter-packages', async () => {
		return await ConverterLoadingUtils.findAllDownloadableConverterPackages();
	});
};

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
