// This file contains the frontend logic for the package manager.

let installedConverterPackages = [];

async function setInstalledConverterPackages() {
	installedConverterPackages = await window.electron.getInstalledConverterPackages();
	setInstalledConverterPackagesLength();
}

setInstalledConverterPackages();

async function openTab(tab) {
	document.getElementById('section-upload').style.display = 'none';
	document.getElementById('section-converter').style.display = 'none';
	document.getElementById('section-settings').style.display = 'none';
	document.getElementById('section-' + tab).style.display = 'block';

	if (tab === 'converter') {
		await receiveDownloadablePackages();
		await receiveInstalledPackages();
	}
}

async function updatePackageLists() {
	await setInstalledConverterPackages();
	await receiveInstalledPackages();
	await receiveDownloadablePackages();
}

async function receiveInstalledPackages() {
	const installedPackagesList = document.getElementById('installed-packages-list');
	installedPackagesList.innerHTML = '';

	installedConverterPackages.forEach((pkg) => {
		const uninstallBtn = document.createElement('button');
		uninstallBtn.innerText = 'Uninstall';
		uninstallBtn.onclick = async () => {
			const responseSucceed = await window.electron.uninstallConverterPackage(pkg);

			if (responseSucceed) {
				alert('Uninstalled ' + pkg.name + ' - ' + pkg.version);
				await updatePackageLists()
			} else {
				alert('Failed to uninstall ' + pkg.name + ' - ' + pkg.version);
			}
		};

		appendPackageListItem(installedPackagesList, pkg, uninstallBtn);
	});
}

async function receiveDownloadablePackages() {
	const downloadableConverterPackages = await window.electron.getDownloadableConverterPackages();
	const downloadPackagesList = document.getElementById('download-packages-list');
	downloadPackagesList.innerHTML = '';

	downloadableConverterPackages.forEach((pkg) => {
		const downloadBtn = document.createElement('button');
		downloadBtn.innerText = 'Download';
		downloadBtn.onclick = async () => {
			const responseSucceed = await window.electron.downloadConverterPackage(pkg);

			if (responseSucceed) {
				alert('Downloaded ' + pkg.name + ' - ' + pkg.version);
				await updatePackageLists()
			} else {
				alert('Failed to download ' + pkg.name + ' - ' + pkg.version);
			}
		};

		appendPackageListItem(downloadPackagesList, pkg, downloadBtn);
	});
}

function appendPackageListItem(listElement, pkg, button) {
	const li = document.createElement('li');
	li.classList.add('packages-list-item');

	const textDiv = document.createElement('div');
	textDiv.classList.add('text');

	const title = document.createElement('h3');
	title.innerText = pkg.name + " - " + pkg.version;
	textDiv.appendChild(title);

	const description = document.createElement('span');
	description.innerText = pkg.description;
	textDiv.appendChild(description);

	li.appendChild(textDiv);
	li.appendChild(button);
	listElement.appendChild(li);
}