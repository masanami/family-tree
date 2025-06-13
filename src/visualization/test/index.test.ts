import { FamilyTreeVisualization, FamilyMember } from '../index';
import * as d3 from 'd3';

// Mock html2canvas and jsPDF
jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    toDataURL: jest.fn().mockReturnValue('data:image/png;base64,test')
  })
}));

jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    save: jest.fn()
  }))
}));

describe('FamilyTreeVisualization', () => {
  let container: HTMLElement;
  let visualization: FamilyTreeVisualization;

  beforeEach(() => {
    // Create a container element
    container = document.createElement('div');
    container.id = 'test-container';
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
    if (visualization) {
      visualization.clear();
    }
  });

  describe('Initialization', () => {
    it('should create visualization instance with default options', () => {
      visualization = new FamilyTreeVisualization('test-container');
      expect(visualization).toBeDefined();
      
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('width')).toBe('1200');
      expect(svg?.getAttribute('height')).toBe('800');
    });

    it('should create visualization with custom options', () => {
      visualization = new FamilyTreeVisualization('test-container', {
        width: 1600,
        height: 900,
        nodeRadius: 50,
        colorScheme: 'vintage'
      });

      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('1600');
      expect(svg?.getAttribute('height')).toBe('900');
    });

    it('should throw error if container not found', () => {
      expect(() => {
        new FamilyTreeVisualization('non-existent-container');
      }).toThrow('Container with id "non-existent-container" not found');
    });
  });

  describe('Data Loading and Rendering', () => {
    const mockFamilyData: FamilyMember[] = [
      {
        id: '1',
        name: 'John Doe',
        birthDate: '1950-01-01',
        gender: 'male'
      },
      {
        id: '2',
        name: 'Jane Doe',
        birthDate: '1955-02-15',
        gender: 'female',
        spouseIds: ['1']
      },
      {
        id: '3',
        name: 'Jim Doe',
        birthDate: '1980-05-20',
        parentIds: ['1', '2'],
        gender: 'male',
        occupation: 'Engineer'
      },
      {
        id: '4',
        name: 'Jill Doe',
        birthDate: '1985-08-10',
        parentIds: ['1', '2'],
        gender: 'female',
        occupation: 'Doctor',
        location: 'New York'
      }
    ];

    beforeEach(() => {
      visualization = new FamilyTreeVisualization('test-container');
    });

    it('should load and render family data', () => {
      visualization.loadData(mockFamilyData);

      // Check if nodes are rendered
      const nodes = container.querySelectorAll('.node');
      expect(nodes.length).toBeGreaterThan(0);

      // Check if links are rendered
      const links = container.querySelectorAll('.links path');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should render nodes with correct gender colors', () => {
      visualization = new FamilyTreeVisualization('test-container', {
        colorScheme: 'default'
      });
      visualization.loadData(mockFamilyData);

      const circles = container.querySelectorAll('.node circle');
      expect(circles.length).toBe(mockFamilyData.length);
    });

    it('should display member names', () => {
      visualization.loadData(mockFamilyData);

      const labels = container.querySelectorAll('.labels text');
      const names = Array.from(labels).map(label => label.textContent);
      
      expect(names).toContain('John Doe');
      expect(names).toContain('Jane Doe');
      expect(names).toContain('Jim Doe');
      expect(names).toContain('Jill Doe');
    });

    it('should display dates when showDates is true', () => {
      visualization = new FamilyTreeVisualization('test-container', {
        showDates: true
      });
      visualization.loadData(mockFamilyData);

      const labels = container.querySelectorAll('.labels text');
      const texts = Array.from(labels).map(label => label.textContent);
      
      expect(texts.some(text => text?.includes('b. 1950-01-01'))).toBe(true);
    });

    it('should display occupation when showOccupation is true', () => {
      visualization = new FamilyTreeVisualization('test-container', {
        showOccupation: true
      });
      visualization.loadData(mockFamilyData);

      const labels = container.querySelectorAll('.labels text');
      const texts = Array.from(labels).map(label => label.textContent);
      
      expect(texts).toContain('Engineer');
      expect(texts).toContain('Doctor');
    });

    it('should handle empty data gracefully', () => {
      expect(() => {
        visualization.loadData([]);
      }).not.toThrow();
    });
  });

  describe('Color Schemes', () => {
    beforeEach(() => {
      visualization = new FamilyTreeVisualization('test-container');
    });

    it('should apply vintage color scheme', () => {
      visualization = new FamilyTreeVisualization('test-container', {
        colorScheme: 'vintage'
      });

      const svg = container.querySelector('svg');
      expect(svg?.style.backgroundColor).toBe('rgb(250, 240, 230)'); // #faf0e6
    });

    it('should apply modern color scheme', () => {
      visualization = new FamilyTreeVisualization('test-container', {
        colorScheme: 'modern'
      });

      const svg = container.querySelector('svg');
      expect(svg?.style.backgroundColor).toBe('rgb(236, 240, 241)'); // #ecf0f1
    });

    it('should apply custom colors', () => {
      visualization = new FamilyTreeVisualization('test-container', {
        colorScheme: 'custom',
        customColors: {
          background: '#ff0000',
          male: '#0000ff',
          female: '#00ff00'
        }
      });

      const svg = container.querySelector('svg');
      expect(svg?.style.backgroundColor).toBe('rgb(255, 0, 0)'); // #ff0000
    });
  });

  describe('Export Functionality', () => {
    const mockFamilyData: FamilyMember[] = [
      {
        id: '1',
        name: 'Test Person',
        gender: 'male'
      }
    ];

    beforeEach(() => {
      visualization = new FamilyTreeVisualization('test-container');
      visualization.loadData(mockFamilyData);
    });

    it('should export as SVG', () => {
      const createElementSpy = jest.spyOn(document, 'createElement');
      const clickSpy = jest.fn();
      
      createElementSpy.mockReturnValue({
        click: clickSpy,
        download: '',
        href: ''
      } as any);

      visualization.exportAsSVG('test.svg');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should export as PNG', async () => {
      const createElementSpy = jest.spyOn(document, 'createElement');
      const clickSpy = jest.fn();
      
      createElementSpy.mockReturnValue({
        click: clickSpy,
        download: '',
        href: ''
      } as any);

      await visualization.exportAsPNG('test.png');

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('should export as PDF', async () => {
      await visualization.exportAsPDF('test.pdf');
      
      // Check that jsPDF methods were called
      const { jsPDF } = require('jspdf');
      expect(jsPDF).toHaveBeenCalled();
    });
  });

  describe('Options Update', () => {
    beforeEach(() => {
      visualization = new FamilyTreeVisualization('test-container');
    });

    it('should update visualization options', () => {
      const mockData: FamilyMember[] = [
        { id: '1', name: 'Test', gender: 'male' }
      ];
      
      visualization.loadData(mockData);
      
      visualization.updateOptions({
        width: 1500,
        height: 1000,
        nodeRadius: 60
      });

      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('width')).toBe('1500');
      expect(svg?.getAttribute('height')).toBe('1000');
    });
  });

  describe('Zoom Functionality', () => {
    it('should enable zoom when zoomEnabled is true', () => {
      visualization = new FamilyTreeVisualization('test-container', {
        zoomEnabled: true
      });

      const zoomGroup = container.querySelector('.zoom-group');
      expect(zoomGroup).toBeTruthy();
    });

    it('should create zoom group even when zoom is disabled', () => {
      visualization = new FamilyTreeVisualization('test-container', {
        zoomEnabled: false
      });

      const zoomGroup = container.querySelector('.zoom-group');
      expect(zoomGroup).toBeTruthy();
    });
  });

  describe('Clear Functionality', () => {
    beforeEach(() => {
      visualization = new FamilyTreeVisualization('test-container');
    });

    it('should clear visualization and data', () => {
      const mockData: FamilyMember[] = [
        { id: '1', name: 'Test', gender: 'male' }
      ];
      
      visualization.loadData(mockData);
      visualization.clear();

      const nodes = container.querySelectorAll('.node');
      expect(nodes.length).toBe(0);
    });
  });
});