# Family Tree Visualization Feature

This directory contains the visualization feature for the family tree application (Issue #4).

## Setup

The visualization dependencies have been installed:
- **d3** (v7.9.0) - Data visualization library
- **html2canvas** (v1.4.1) - For PNG export functionality
- **jspdf** (v2.5.2) - For PDF export functionality
- **@types/d3** (v7.4.3) - TypeScript type definitions for D3

## Project Structure

```
issue-4-visualization/
├── package.json          # Node.js package configuration
├── tsconfig.json         # TypeScript configuration
├── src/
│   └── visualization/
│       └── index.ts      # Main visualization module
├── example.html          # Example usage demonstration
└── VISUALIZATION_README.md
```

## Building the Project

To compile the TypeScript code:

```bash
npm run build
```

This will compile the TypeScript files in `src/` to JavaScript in `dist/`.

## Usage

### Basic Usage

```typescript
import { FamilyTreeVisualization } from './visualization';

// Create visualization instance
const viz = new FamilyTreeVisualization('container-id', {
    width: 1200,
    height: 800,
    nodeRadius: 40,
    levelHeight: 150
});

// Load family data
viz.loadData([
    {
        id: '1',
        name: 'John Doe',
        parentIds: []
    },
    {
        id: '2',
        name: 'Jane Doe',
        parentIds: ['1']
    }
]);
```

### Export Features

```typescript
// Export as PNG
await viz.exportAsPNG('family-tree.png');

// Export as PDF
await viz.exportAsPDF('family-tree.pdf');
```

## Integration with Main Project

To integrate this visualization feature with the main family tree application:

1. **Build the visualization module**: Run `npm run build` in this directory
2. **Import the compiled module**: Reference the built files from `dist/`
3. **Create API endpoints**: Add endpoints in the main backend to serve visualization data
4. **Frontend integration**: Include the visualization in your frontend application

## API Data Format

The visualization expects family member data in this format:

```typescript
interface FamilyMember {
    id: string;
    name: string;
    birthDate?: string;
    deathDate?: string;
    parentIds?: string[];
    spouseIds?: string[];
    children?: string[];
}
```

## Development

For development with automatic recompilation:

```bash
npm run dev
```

This will watch for TypeScript file changes and recompile automatically.

## Example

Open `example.html` in a web browser after building the project to see a working demonstration. Note that you'll need to serve the file through a web server (not file://) due to module import restrictions.

Simple way to serve locally:
```bash
python3 -m http.server 8000
# Then open http://localhost:8000/example.html
```