import {InstalledConverterPackage, UninstalledConverterPackage} from "../types/converter";
import * as path from "node:path";
import * as fs from "node:fs";
import {Converter, ConverterRegister} from "@converta/api";

export class PackageManagerUtils {
	static get bundleName(): string {
		return 'bundle.js';
	}
	
	static findAllLocalConverterPackages(app: Electron.App): InstalledConverterPackage[] {
		const appDataPath: string = app.getPath('appData');
		const converterPath: string = path.join(appDataPath, app.getName(), 'converters');
		const converterPackages: InstalledConverterPackage[] = [];
		
		const authorFolders: string[] = fs.readdirSync(converterPath);
		authorFolders.forEach((file: string) => {
			const packagePath: string = path.join(converterPath, file);
			const packageStat: fs.Stats = fs.statSync(packagePath);
			
			if (!packageStat.isDirectory()) {
				return;
			}
			
			const packageFiles: string[] = fs.readdirSync(packagePath);
			
			packageFiles.forEach((packageFile: string) => {
				const packageFilePath: string = path.join(packagePath, packageFile);
				const packageFileStat: fs.Stats = fs.statSync(packageFilePath);
				
				if (!packageFileStat.isDirectory()) {
					return;
				}
				
				const packageJsonPath: string = path.join(packageFilePath, 'package.json');
				const scriptPath: string = path.join(packageFilePath, this.bundleName);
				
				if (!fs.existsSync(packageJsonPath) || !fs.existsSync(scriptPath)) {
					return;
				}
				
				const module = require(scriptPath);
				const {ConverterRegistry} = module.default || module.ConverterRegistry;
				const registry = new ConverterRegistry() as ConverterRegister;
				const converter = registry.converter;
				
				const packageJson: any = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
				const converterPackage: InstalledConverterPackage = {
					name: packageJson.name,
					author: packageJson.author,
					description: packageJson.description,
					version: packageJson.version,
					packageJsonPath: packageJsonPath,
					converter: converter as Converter<any, any>[]
				}
				
				converterPackages.push(converterPackage);
			});
		})
		
		return converterPackages;
	}
	
	static async findAllOnlineConverterPackages(): Promise<UninstalledConverterPackage[]> {
		const packages: UninstalledConverterPackage[] = [];
		const jsonUrl: string = 'https://raw.githubusercontent.com/convertaaa/converter-list/main/repos.json';
		
		try {
			const response = await fetch(jsonUrl);
			const json = await response.json();
			
			const packagePromises = json.repos.map(async (repo: string) => {
				const packageJsonUrl: string = `https://raw.githubusercontent.com/${repo}/main/package.json`;
				const bundleJsUrl: string = `https://raw.githubusercontent.com/${repo}/main/dist/${this.bundleName}`;
				const packageResponse = await fetch(packageJsonUrl);
				const packageJson = await packageResponse.json();
				
				const converterPackage: UninstalledConverterPackage = {
					name: packageJson.name,
					author: packageJson.author,
					description: packageJson.description,
					version: packageJson.version,
					scriptUrl: bundleJsUrl,
					packageJsonUrl: packageJsonUrl
				};
				
				return converterPackage;
			});
			
			const resolvedPackages = await Promise.all(packagePromises);
			packages.push(...resolvedPackages);
			
		} catch (error) {
			console.error("Error fetching packages:", error);
		}
		
		return packages;
	}
	
	static async findNotInstalledConverterPackages(app: Electron.App): Promise<UninstalledConverterPackage[]> {
		const localPackages: InstalledConverterPackage[] = this.findAllLocalConverterPackages(app);
		const onlinePackages: UninstalledConverterPackage[] = await this.findAllOnlineConverterPackages();
		
		console.log('Local Packages:', localPackages);
		console.log('Online Packages:', onlinePackages);
		
		return onlinePackages.filter((onlinePackage: UninstalledConverterPackage) => {
			const isInstalled = localPackages.some((localPackage: InstalledConverterPackage) => {
				return localPackage.name === onlinePackage.name && localPackage.author === onlinePackage.author;
			});
			
			return !isInstalled;
		});
	}
	
	static async downloadConverterPackage(app: Electron.App, uninstalledConverterPackage: UninstalledConverterPackage): Promise<boolean> {
		const convertaFolder: string = path.join(app.getPath('appData'), app.getName());
		
		if (!fs.existsSync(convertaFolder)) {
			fs.mkdirSync(convertaFolder);
		}
		
		const convertersFolder: string = path.join(convertaFolder, 'converters');
		
		if (!fs.existsSync(convertersFolder)) {
			fs.mkdirSync(convertersFolder);
		}
		
		const authorPath: string = path.join(convertersFolder, uninstalledConverterPackage.author);
		
		if (!fs.existsSync(authorPath)) {
			fs.mkdirSync(authorPath);
		}
		
		const converterPackagePath: string = path.join(authorPath, uninstalledConverterPackage.name);
		
		if (fs.existsSync(converterPackagePath)) {
			console.error('Converter package already exists:', converterPackagePath); // TODO: Implement update logic later
			return false;
		}
		
		fs.mkdirSync(converterPackagePath, {recursive: true});
		
		const bundlePath: string = path.join(converterPackagePath, this.bundleName);
		const packageJsonPath: string = path.join(converterPackagePath, 'package.json');
		
		const scriptResponse = await fetch(uninstalledConverterPackage.scriptUrl);
		const jsonResponse = await fetch(uninstalledConverterPackage.packageJsonUrl);
		
		const scriptText = await scriptResponse.text();
		const jsonText = await jsonResponse.json();
		
		fs.writeFileSync(bundlePath, scriptText);
		fs.writeFileSync(packageJsonPath, JSON.stringify(jsonText));
		
		return true;
	}
	
	static uninstallConverterPackage(app: Electron.App, installedConverterPackage: InstalledConverterPackage): boolean {
		const converterPath: string = path.join(app.getPath('appData'), app.getName(), 'converters', installedConverterPackage.author, installedConverterPackage.name);
		
		if (!fs.existsSync(converterPath)) {
			console.error('Converter package does not exist:', converterPath);
			return false;
		}
		
		fs.rmdirSync(converterPath, {recursive: true});
		return true;
	}
}