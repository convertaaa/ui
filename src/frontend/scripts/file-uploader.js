let dropArea = document.getElementById('drop-area');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
	dropArea.addEventListener(eventName, preventDefaults, false)
})

function preventDefaults(e) {
	e.preventDefault()
	e.stopPropagation()
}

;['dragenter', 'dragover'].forEach(eventName => {
	dropArea.addEventListener(eventName, highlight, false)
})

;['dragleave', 'drop'].forEach(eventName => {
	dropArea.addEventListener(eventName, unhighlight, false)
})

function highlight(e) {
	dropArea.classList.add('highlight')
}

function unhighlight(e) {
	dropArea.classList.remove('highlight')
}

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
	let dt = e.dataTransfer
	let files = dt.files

	handleFiles(files)
}

function handleFiles(files) {
	([...files]).forEach(registerFile)
}

function registerFile(file) {
	const ext = file.name.split('.').pop()
	let allowedExtensions = []
	installedConverterPackages.forEach(pkg => {
		pkg.converter.forEach(converter => {
			allowedExtensions.push(...converter.allowedExtensions)
		});
	});
	allowedExtensions = Array.from(new Set(allowedExtensions))

	console.log(allowedExtensions)

	if (!ext) {
		alert('This file does not have an extension')
		return
	}

	if (!allowedExtensions.includes(ext)) {
		alert('This file type is not supported by any installed converter packages')
		return
	}

	runtimeFilesToConvert.push({
		name: file.name,
		path: file.path,
		ext: ext,
		status: "Not converted"
	})

	console.log(runtimeFilesToConvert)
	displayCurrentConvertProgress()
}

const runtimeFilesToConvert = []

function displayCurrentConvertProgress() {
	const convertProgressTable = document.getElementById('convert-progress-table')
	const convertProgressTableBody = convertProgressTable.getElementsByTagName('tbody')[0]

	convertProgressTableBody.innerHTML = ''

	runtimeFilesToConvert.forEach((file, index) => {
		const row = convertProgressTableBody.insertRow()
		const cellName = row.insertCell()
		const cellStatus = row.insertCell()
		const cellActions = row.insertCell()

		cellName.innerText = file.name

		if (file.status !== "Not converted") {
			cellStatus.innerText = file.status

			if (file.status === "Done") {
				cellActions.innerHTML = `<button onclick="findDownload(${index})">Find Download</button>`
			} else {
				cellActions.innerHTML = `<button disabled>Download</button>`
			}
		} else {
			// Drop-down menu for selecting a converter
			const converters = []
			installedConverterPackages.forEach(pkg => {
				pkg.converter.forEach(converter => {
					if (converter.allowedExtensions.includes(file.ext)) {
						converters.push({
							pkg,
							converter
						})
					}
				});
			});

			const select = document.createElement('select')
			select.id = 'converter-select-' + index
			converters.forEach((converter) => {
				const option = document.createElement('option')
				option.value = converter.pkg.name + '*' + converter.converter.returnableExtension
				option.text = converter.pkg.name + ' - ' + converter.converter.returnableExtension
				select.appendChild(option)
			})

			cellStatus.appendChild(select)
			cellActions.innerHTML = `<button onclick="convertFile(${index})">Convert</button>`
		}
	})
}

async function convertFile(index) {
	const converterText = document.getElementById('converter-select-' + index).value
	runtimeFilesToConvert[index].status = "Converting..."
	displayCurrentConvertProgress()

	const file = runtimeFilesToConvert[index]
	const converterParts = converterText.split('*')
	const converter = installedConverterPackages.find(pkg => pkg.name === converterParts[0])
	await window.electron.convertFile(file.path, converter, converterParts[1])

	runtimeFilesToConvert[index].status = "Done"
	displayCurrentConvertProgress()
}
