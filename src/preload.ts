import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electron', {
	minimizeWindow: () => ipcRenderer.send('minimize-window'),
	maximizeWindow: () => ipcRenderer.send('maximize-window'),
	closeWindow: () => ipcRenderer.send('close-window'),
	
	testing: () => ipcRenderer.send('testing'),
	
	getDownloadableConverterPackages: async () => {
		console.log('getting downloadable converter packages');
		return await ipcRenderer.invoke('get-downloadable-converter-packages');
	}
});
