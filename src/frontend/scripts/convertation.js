// This file contains the logic for the convertation process.

function setInstalledConverterPackagesLength() {
	const loadedConverterPackagesCount = installedConverterPackages.length;
	const installedPackagesSpan = document.getElementById('installed-packages-span');
	installedPackagesSpan.innerText = loadedConverterPackagesCount.toString();
}