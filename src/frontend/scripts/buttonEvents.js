// This file contains the event listeners for all the static buttons in the app.

document.getElementById('minimize').addEventListener('click', () => {
	window.electron.minimizeWindow();
});

document.getElementById('maximize').addEventListener('click', () => {
	window.electron.maximizeWindow();
});

document.getElementById('close').addEventListener('click', () => {
	window.electron.closeWindow();
});
