import {contextBridge, ipcRenderer} from 'electron';
import {InstalledConverterPackage, UninstalledConverterPackage} from "./types/converter";

contextBridge.exposeInMainWorld('electron', {
	minimizeWindow: () => ipcRenderer.send('minimize-window'),
	maximizeWindow: () => ipcRenderer.send('maximize-window'),
	closeWindow: () => ipcRenderer.send('close-window'),
	
	getDownloadableConverterPackages: async () => {
		return await ipcRenderer.invoke('get-downloadable-converter-packages');
	},
	
	getInstalledConverterPackages: async () => {
		return await ipcRenderer.invoke('get-installed-converter-packages');
	},
	
	downloadConverterPackage: async (packageName: UninstalledConverterPackage) => {
		return await ipcRenderer.invoke('download-converter-package', packageName);
	},
	
	uninstallConverterPackage: async (packageName: UninstalledConverterPackage) => {
		return await ipcRenderer.invoke('uninstall-converter-package', packageName);
	},
	
	convertFile: async (inputFile: string, converter: InstalledConverterPackage, extension: string) => {
		return await ipcRenderer.invoke('convert-file', inputFile, converter, extension);
	},
});
