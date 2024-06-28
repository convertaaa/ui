export type InstalledConverterPackage = {
	name: string,
	author: string,
	description: string,
	version: string,
	scriptPath: string,
	packageJsonPath: string,
	converter: {
		allowedExtensions: string[],
		returnableExtension: string
	}[]
}

export type UninstalledConverterPackage = {
	name: string,
	author: string,
	description: string,
	version: string,
	scriptUrl: string,
	packageJsonUrl: string
}