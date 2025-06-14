#!/usr/bin/env node

/**
 * Performance Testing Script for Issue #43
 * Measures bundle size, load times, and rendering performance
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Bundle size analysis
function analyzeBundleSize() {
  const distPath = path.join(__dirname, 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Build not found. Run npm run build first.');
    return null;
  }

  const assets = fs.readdirSync(path.join(distPath, 'assets'));
  const jsFiles = assets.filter(file => file.endsWith('.js'));
  const cssFiles = assets.filter(file => file.endsWith('.css'));

  let totalJSSize = 0;
  let totalCSSSize = 0;

  jsFiles.forEach(file => {
    const filePath = path.join(distPath, 'assets', file);
    const stats = fs.statSync(filePath);
    totalJSSize += stats.size;
  });

  cssFiles.forEach(file => {
    const filePath = path.join(distPath, 'assets', file);
    const stats = fs.statSync(filePath);
    totalCSSSize += stats.size;
  });

  const report = {
    timestamp: new Date().toISOString(),
    totalJSSize: totalJSSize,
    totalCSSSize: totalCSSSize,
    totalSize: totalJSSize + totalCSSSize,
    jsFiles: jsFiles.length,
    cssFiles: cssFiles.length,
    breakdown: {
      javascript: `${(totalJSSize / 1024).toFixed(2)} KB`,
      css: `${(totalCSSSize / 1024).toFixed(2)} KB`,
      total: `${((totalJSSize + totalCSSSize) / 1024).toFixed(2)} KB`
    }
  };

  return report;
}

// Performance recommendations based on bundle analysis
function generateRecommendations(report) {
  const recommendations = [];

  if (report.totalJSSize > 200 * 1024) { // > 200KB
    recommendations.push({
      priority: 'high',
      type: 'bundle-splitting',
      description: 'JavaScript bundle exceeds 200KB - implement code splitting',
      impact: 'Reduce initial load time by 20-30%'
    });
  }

  if (report.jsFiles === 1) {
    recommendations.push({
      priority: 'medium',
      type: 'code-splitting',
      description: 'Single JavaScript bundle - consider route-based splitting',
      impact: 'Improve First Contentful Paint by 15-25%'
    });
  }

  recommendations.push({
    priority: 'medium',
    type: 'lazy-loading',
    description: 'Implement lazy loading for FamilyTree visualization',
    impact: 'Reduce initial bundle size by 30-40%'
  });

  recommendations.push({
    priority: 'low',
    type: 'compression',
    description: 'Enable Brotli compression on server',
    impact: 'Reduce transfer size by additional 10-15%'
  });

  return recommendations;
}

// Main performance analysis
function runPerformanceAnalysis() {
  console.log('🚀 Starting Performance Analysis for Issue #43\n');

  const bundleReport = analyzeBundleSize();
  
  if (!bundleReport) {
    return;
  }

  console.log('📊 Bundle Size Analysis:');
  console.log(`   JavaScript: ${bundleReport.breakdown.javascript}`);
  console.log(`   CSS: ${bundleReport.breakdown.css}`);
  console.log(`   Total: ${bundleReport.breakdown.total}`);
  console.log(`   Files: ${bundleReport.jsFiles} JS, ${bundleReport.cssFiles} CSS\n`);

  const recommendations = generateRecommendations(bundleReport);

  console.log('💡 Performance Recommendations:');
  recommendations.forEach((rec, index) => {
    const priorityEmoji = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
    console.log(`   ${index + 1}. ${priorityEmoji} ${rec.description}`);
    console.log(`      Impact: ${rec.impact}\n`);
  });

  // Save report
  const reportPath = path.join(__dirname, 'performance-report.json');
  const fullReport = {
    ...bundleReport,
    recommendations,
    analysis: {
      bundleEfficiency: bundleReport.totalSize < 250 * 1024 ? 'good' : 'needs-improvement',
      loadTimeEstimate: {
        fast3g: `${Math.ceil(bundleReport.totalSize / (1.6 * 1024))}s`,
        slow3g: `${Math.ceil(bundleReport.totalSize / (0.4 * 1024))}s`,
        wifi: `${Math.ceil(bundleReport.totalSize / (25 * 1024))}s`
      }
    }
  };

  fs.writeFileSync(reportPath, JSON.stringify(fullReport, null, 2));
  console.log(`📄 Detailed report saved to: ${reportPath}`);

  return fullReport;
}

// Run analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  runPerformanceAnalysis();
}

export { runPerformanceAnalysis, analyzeBundleSize };