#!/usr/bin/env node

/**
 * Tree Shaking and Dead Code Elimination Analyzer
 * Identifies unused exports and imports for bundle size optimization
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Analyze exports in all TypeScript/JavaScript files
function analyzeExports() {
  const srcPath = path.join(__dirname, 'src');
  const exportMap = new Map();
  const importMap = new Map();
  
  const getAllFiles = (dir) => {
    let files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.includes('__tests__') && !item.includes('node_modules')) {
        files = files.concat(getAllFiles(fullPath));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js')) {
        if (!item.includes('.test.') && !item.includes('.spec.')) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  };
  
  const files = getAllFiles(srcPath);
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(srcPath, file);
    
    // Find exports
    const exportRegexes = [
      /export\s+(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/g,
      /export\s+{\s*([^}]+)\s*}/g,
      /export\s+default\s+(\w+|\{[^}]*\})/g,
      /export\s*\*\s+from\s+['"`]([^'"`]+)['"`]/g
    ];
    
    exportRegexes.forEach(regex => {
      let match;
      while ((match = regex.exec(content)) !== null) {
        const exported = match[1];
        if (exported) {
          if (!exportMap.has(relativePath)) {
            exportMap.set(relativePath, new Set());
          }
          if (exported.includes(',')) {
            // Handle multiple exports like { a, b, c }
            exported.split(',').forEach(exp => {
              exportMap.get(relativePath).add(exp.trim());
            });
          } else {
            exportMap.get(relativePath).add(exported);
          }
        }
      }
    });
    
    // Find imports
    const importRegex = /import\s+(?:(?:{\s*([^}]+)\s*})|(?:(\w+))|\*\s+as\s+(\w+))\s+from\s+['"`]([^'"`]+)['"`]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const namedImports = match[1];
      const defaultImport = match[2];
      const namespaceImport = match[3];
      const modulePath = match[4];
      
      if (!importMap.has(relativePath)) {
        importMap.set(relativePath, new Set());
      }
      
      if (namedImports) {
        namedImports.split(',').forEach(imp => {
          importMap.get(relativePath).add(`${modulePath}:${imp.trim()}`);
        });
      }
      
      if (defaultImport) {
        importMap.get(relativePath).add(`${modulePath}:default`);
      }
      
      if (namespaceImport) {
        importMap.get(relativePath).add(`${modulePath}:*`);
      }
    }
  });
  
  return { exportMap, importMap, files };
}

// Find unused exports
function findUnusedExports(analysis) {
  const { exportMap, importMap } = analysis;
  const unusedExports = new Map();
  
  exportMap.forEach((exports, filePath) => {
    const fileUnused = new Set();
    
    exports.forEach(exportName => {
      let isUsed = false;
      
      // Check if this export is imported anywhere
      importMap.forEach((imports) => {
        imports.forEach(importString => {
          const [modulePath, importName] = importString.split(':');
          
          // Handle relative imports
          if (modulePath.startsWith('.') || modulePath.startsWith('/')) {
            const resolvedPath = path.resolve(path.dirname(filePath), modulePath);
            const relativeResolved = path.relative(__dirname + '/src', resolvedPath);
            
            if ((relativeResolved === filePath || relativeResolved + '.ts' === filePath || relativeResolved + '.tsx' === filePath) &&
                (importName === exportName || importName === '*')) {
              isUsed = true;
            }
          }
        });
      });
      
      if (!isUsed && exportName !== 'default') {
        fileUnused.add(exportName);
      }
    });
    
    if (fileUnused.size > 0) {
      unusedExports.set(filePath, fileUnused);
    }
  });
  
  return unusedExports;
}

// Analyze heavy dependencies
function analyzeHeavyDependencies() {
  const packagePath = path.join(__dirname, 'package.json');
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const heavyDependencies = [
    { name: 'reactflow', size: '~120KB', optimizations: ['Use only needed components', 'Custom node implementation'] },
    { name: 'react-router-dom', size: '~45KB', optimizations: ['Consider reach/router alternative', 'Use only required components'] },
    { name: 'zustand', size: '~12KB', optimizations: ['Already lightweight', 'Consider if complex state needed'] },
    { name: 'axios', size: '~15KB', optimizations: ['Replace with native fetch', 'Custom HTTP client'] }
  ];
  
  const presentHeavyDeps = heavyDependencies.filter(dep => 
    packageData.dependencies?.[dep.name] || packageData.devDependencies?.[dep.name]
  );
  
  return presentHeavyDeps;
}

// Generate optimization recommendations
function generateOptimizations() {
  console.log('🎯 Tree Shaking and Bundle Optimization Analysis\n');
  
  const analysis = analyzeExports();
  const unusedExports = findUnusedExports(analysis);
  const heavyDeps = analyzeHeavyDependencies();
  
  console.log('📁 File Analysis:');
  console.log(`   Total files analyzed: ${analysis.files.length}`);
  console.log(`   Files with exports: ${analysis.exportMap.size}`);
  console.log(`   Files with imports: ${analysis.importMap.size}\n`);
  
  if (unusedExports.size > 0) {
    console.log('🗑️  Unused Exports Found:');
    unusedExports.forEach((exports, filePath) => {
      console.log(`   ${filePath}:`);
      exports.forEach(exportName => {
        console.log(`     - ${exportName}`);
      });
    });
    console.log();
  } else {
    console.log('✅ No unused exports found\n');
  }
  
  if (heavyDeps.length > 0) {
    console.log('📦 Heavy Dependencies Analysis:');
    heavyDeps.forEach(dep => {
      console.log(`   ${dep.name} (${dep.size}):`);
      dep.optimizations.forEach(opt => {
        console.log(`     • ${opt}`);
      });
      console.log();
    });
  }
  
  // Bundle splitting recommendations
  console.log('💡 Bundle Optimization Recommendations:\n');
  
  console.log('1. 🔴 ReactFlow Optimization (High Priority):');
  console.log('   • Import only required components from reactflow');
  console.log('   • Consider custom node implementation');
  console.log('   • Potential savings: ~40-60KB\n');
  
  console.log('2. 🟡 Router Optimization (Medium Priority):');
  console.log('   • Use React Router tree shaking');
  console.log('   • Import only required router components');
  console.log('   • Potential savings: ~15-25KB\n');
  
  console.log('3. 🟡 Library Tree Shaking (Medium Priority):');
  console.log('   • Enable aggressive tree shaking in Vite config');
  console.log('   • Use ES modules imports only');
  console.log('   • Potential savings: ~10-20KB\n');
  
  const report = {
    timestamp: new Date().toISOString(),
    analysis: {
      totalFiles: analysis.files.length,
      filesWithExports: analysis.exportMap.size,
      filesWithImports: analysis.importMap.size,
      unusedExports: Object.fromEntries(
        Array.from(unusedExports.entries()).map(([k, v]) => [k, Array.from(v)])
      )
    },
    heavyDependencies: heavyDeps,
    optimizations: [
      {
        type: 'reactflow-optimization',
        priority: 'high',
        description: 'Optimize ReactFlow imports and usage',
        potentialSavings: '40-60KB'
      },
      {
        type: 'router-optimization', 
        priority: 'medium',
        description: 'Optimize React Router tree shaking',
        potentialSavings: '15-25KB'
      },
      {
        type: 'tree-shaking',
        priority: 'medium', 
        description: 'Enable aggressive tree shaking',
        potentialSavings: '10-20KB'
      }
    ]
  };
  
  // Save report
  const reportPath = path.join(__dirname, 'tree-shaking-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Tree shaking report saved to: ${reportPath}`);
  
  return report;
}

// Run analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  generateOptimizations();
}

export { generateOptimizations };