#!/usr/bin/env node

/**
 * Advanced Bundle Analysis for Dependency Optimization
 * Analyzes package.json dependencies and identifies optimization opportunities
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Analyze package.json dependencies
function analyzeDependencies() {
  const packagePath = path.join(__dirname, 'package.json');
  const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const deps = packageData.dependencies || {};
  const devDeps = packageData.devDependencies || {};
  
  console.log('📦 Dependency Analysis:\n');
  
  console.log('Production Dependencies:');
  Object.entries(deps).forEach(([name, version]) => {
    console.log(`  - ${name}: ${version}`);
  });
  
  console.log('\nDev Dependencies:');
  Object.entries(devDeps).forEach(([name, version]) => {
    console.log(`  - ${name}: ${version}`);
  });
  
  return { deps, devDeps };
}

// Identify potentially unused dependencies
function identifyUnusedDependencies() {
  const srcPath = path.join(__dirname, 'src');
  
  if (!fs.existsSync(srcPath)) {
    console.log('❌ src folder not found');
    return [];
  }
  
  // Get all TypeScript/JavaScript files
  const getAllFiles = (dir, extension = '.tsx') => {
    let files = [];
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files = files.concat(getAllFiles(fullPath, extension));
      } else if (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js')) {
        files.push(fullPath);
      }
    }
    
    return files;
  };
  
  const files = getAllFiles(srcPath);
  const packageData = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const deps = { ...packageData.dependencies, ...packageData.devDependencies };
  
  const usedDependencies = new Set();
  const importRegex = /import\s+(?:.*?\s+from\s+)?['"`]([^'"`]+)['"`]/g;
  
  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      
      // Extract package name (handle scoped packages)
      if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
        const packageName = importPath.startsWith('@') 
          ? importPath.split('/').slice(0, 2).join('/')
          : importPath.split('/')[0];
        
        if (deps[packageName]) {
          usedDependencies.add(packageName);
        }
      }
    }
  });
  
  const allDeps = Object.keys(deps);
  const unusedDeps = allDeps.filter(dep => !usedDependencies.has(dep));
  
  return {
    total: allDeps.length,
    used: Array.from(usedDependencies),
    unused: unusedDeps,
    usageRate: ((usedDependencies.size / allDeps.length) * 100).toFixed(1)
  };
}

// Generate bundle optimization recommendations
function generateBundleOptimizations() {
  const analysis = identifyUnusedDependencies();
  const optimizations = [];
  
  if (analysis.unused.length > 0) {
    optimizations.push({
      type: 'remove-unused-deps',
      priority: 'high',
      description: `Remove ${analysis.unused.length} unused dependencies`,
      dependencies: analysis.unused,
      impact: `Reduce bundle size by ~${analysis.unused.length * 10}KB`
    });
  }
  
  // Check for heavy dependencies that could be optimized
  const heavyDeps = [
    { name: 'reactflow', alternative: 'Custom implementation for specific use case', savings: '~50KB' },
    { name: 'axios', alternative: 'Native fetch API', savings: '~15KB' },
    { name: '@testing-library/react', category: 'dev-only', note: 'Move to devDependencies if in production deps' }
  ];
  
  const packageData = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const prodDeps = packageData.dependencies || {};
  
  heavyDeps.forEach(dep => {
    if (prodDeps[dep.name]) {
      optimizations.push({
        type: 'optimize-dependency',
        priority: 'medium',
        description: `Consider optimizing ${dep.name}`,
        alternative: dep.alternative,
        impact: dep.savings || 'Bundle size reduction',
        dependency: dep.name
      });
    }
  });
  
  return { analysis, optimizations };
}

// Main analysis function
function runBundleAnalysis() {
  console.log('🔍 Advanced Bundle Analysis for Issue #43\n');
  
  const dependencies = analyzeDependencies();
  const optimization = generateBundleOptimizations();
  
  console.log('\n📈 Dependency Usage Analysis:');
  console.log(`   Total Dependencies: ${optimization.analysis.total}`);
  console.log(`   Used Dependencies: ${optimization.analysis.used.length}`);
  console.log(`   Unused Dependencies: ${optimization.analysis.unused.length}`);
  console.log(`   Usage Rate: ${optimization.analysis.usageRate}%\n`);
  
  if (optimization.analysis.unused.length > 0) {
    console.log('🗑️  Unused Dependencies:');
    optimization.analysis.unused.forEach(dep => {
      console.log(`   - ${dep}`);
    });
    console.log();
  }
  
  console.log('💡 Bundle Optimization Recommendations:');
  optimization.optimizations.forEach((opt, index) => {
    const priorityEmoji = opt.priority === 'high' ? '🔴' : opt.priority === 'medium' ? '🟡' : '🟢';
    console.log(`   ${index + 1}. ${priorityEmoji} ${opt.description}`);
    if (opt.alternative) console.log(`      Alternative: ${opt.alternative}`);
    console.log(`      Impact: ${opt.impact}\n`);
  });
  
  // Save detailed report
  const reportPath = path.join(__dirname, 'bundle-analysis-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    dependencies,
    analysis: optimization.analysis,
    optimizations: optimization.optimizations,
    summary: {
      totalDependencies: optimization.analysis.total,
      unusedCount: optimization.analysis.unused.length,
      potentialSavings: `${optimization.analysis.unused.length * 10}KB`,
      usageEfficiency: `${optimization.analysis.usageRate}%`
    }
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Bundle analysis report saved to: ${reportPath}`);
  
  return report;
}

// Run analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  runBundleAnalysis();
}

export { runBundleAnalysis };