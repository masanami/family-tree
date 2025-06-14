import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Frontend Setup - Issue #33', () => {
  const frontendDir = path.join(process.cwd(), 'frontend');

  describe('Viteプロジェクトの作成', () => {
    it('frontendディレクトリが存在すること', () => {
      expect(fs.existsSync(frontendDir)).toBe(true);
    });

    it('package.jsonが存在すること', () => {
      const packageJsonPath = path.join(frontendDir, 'package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
    });

    it('package.jsonにViteが含まれていること', () => {
      const packageJsonPath = path.join(frontendDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.devDependencies?.vite).toBeDefined();
    });

    it('index.htmlが存在すること', () => {
      const indexHtmlPath = path.join(frontendDir, 'index.html');
      expect(fs.existsSync(indexHtmlPath)).toBe(true);
    });
  });

  describe('TypeScript設定', () => {
    it('tsconfig.jsonが存在すること', () => {
      const tsconfigPath = path.join(frontendDir, 'tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
    });

    it('TypeScriptがdevDependenciesに含まれていること', () => {
      const packageJsonPath = path.join(frontendDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.devDependencies?.typescript).toBeDefined();
    });

    it('tsconfig.jsonにReact JSX設定が含まれていること', () => {
      const tsconfigPath = path.join(frontendDir, 'tsconfig.json');
      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf-8'));
      expect(tsconfig.compilerOptions?.jsx).toBe('react-jsx');
    });
  });

  describe('Tailwind CSS設定', () => {
    it('tailwind.config.jsが存在すること', () => {
      const tailwindConfigPath = path.join(frontendDir, 'tailwind.config.js');
      expect(fs.existsSync(tailwindConfigPath)).toBe(true);
    });

    it('postcss.config.jsが存在すること', () => {
      const postcssConfigPath = path.join(frontendDir, 'postcss.config.js');
      expect(fs.existsSync(postcssConfigPath)).toBe(true);
    });

    it('TailwindCSSがdevDependenciesに含まれていること', () => {
      const packageJsonPath = path.join(frontendDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.devDependencies?.tailwindcss).toBeDefined();
    });

    it('メインCSSファイルにTailwindディレクティブが含まれていること', () => {
      const mainCssPath = path.join(frontendDir, 'src', 'index.css');
      const cssContent = fs.readFileSync(mainCssPath, 'utf-8');
      expect(cssContent).toContain('@tailwind base');
      expect(cssContent).toContain('@tailwind components');
      expect(cssContent).toContain('@tailwind utilities');
    });
  });

  describe('ディレクトリ構造', () => {
    it('srcディレクトリが存在すること', () => {
      const srcPath = path.join(frontendDir, 'src');
      expect(fs.existsSync(srcPath)).toBe(true);
    });

    it('componentsディレクトリが存在すること', () => {
      const componentsPath = path.join(frontendDir, 'src', 'components');
      expect(fs.existsSync(componentsPath)).toBe(true);
    });

    it('pagesディレクトリが存在すること', () => {
      const pagesPath = path.join(frontendDir, 'src', 'pages');
      expect(fs.existsSync(pagesPath)).toBe(true);
    });

    it('utilsディレクトリが存在すること', () => {
      const utilsPath = path.join(frontendDir, 'src', 'utils');
      expect(fs.existsSync(utilsPath)).toBe(true);
    });

    it('hooksディレクトリが存在すること', () => {
      const hooksPath = path.join(frontendDir, 'src', 'hooks');
      expect(fs.existsSync(hooksPath)).toBe(true);
    });

    it('servicesディレクトリが存在すること', () => {
      const servicesPath = path.join(frontendDir, 'src', 'services');
      expect(fs.existsSync(servicesPath)).toBe(true);
    });

    it('typesディレクトリが存在すること', () => {
      const typesPath = path.join(frontendDir, 'src', 'types');
      expect(fs.existsSync(typesPath)).toBe(true);
    });
  });

  describe('開発環境の動作確認', () => {
    it('vite.config.tsが存在すること', () => {
      const viteConfigPath = path.join(frontendDir, 'vite.config.ts');
      expect(fs.existsSync(viteConfigPath)).toBe(true);
    });

    it('package.jsonにdevスクリプトが定義されていること', () => {
      const packageJsonPath = path.join(frontendDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts?.dev).toBeDefined();
      expect(packageJson.scripts.dev).toContain('vite');
    });

    it('package.jsonにbuildスクリプトが定義されていること', () => {
      const packageJsonPath = path.join(frontendDir, 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts?.build).toBeDefined();
      expect(packageJson.scripts.build).toContain('vite build');
    });

    it('main.tsxまたはmain.tsが存在すること', () => {
      const mainTsxPath = path.join(frontendDir, 'src', 'main.tsx');
      const mainTsPath = path.join(frontendDir, 'src', 'main.ts');
      expect(fs.existsSync(mainTsxPath) || fs.existsSync(mainTsPath)).toBe(true);
    });

    it('App.tsxが存在すること', () => {
      const appPath = path.join(frontendDir, 'src', 'App.tsx');
      expect(fs.existsSync(appPath)).toBe(true);
    });
  });
});