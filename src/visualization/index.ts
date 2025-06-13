import * as d3 from 'd3';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface FamilyMember {
  id: string;
  name: string;
  birthDate?: string;
  deathDate?: string;
  parentIds?: string[];
  spouseIds?: string[];
  children?: string[];
  gender?: 'male' | 'female' | 'other';
  photo?: string;
  occupation?: string;
  location?: string;
}

export interface FamilyTreeVisualizationOptions {
  width?: number;
  height?: number;
  nodeRadius?: number;
  levelHeight?: number;
  nodeSpacing?: number;
  colorScheme?: 'default' | 'vintage' | 'modern' | 'custom';
  showPhotos?: boolean;
  showDates?: boolean;
  showOccupation?: boolean;
  animationDuration?: number;
  zoomEnabled?: boolean;
  customColors?: {
    male?: string;
    female?: string;
    other?: string;
    link?: string;
    background?: string;
  };
}

export class FamilyTreeVisualization {
  private container: HTMLElement;
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private options: Required<FamilyTreeVisualizationOptions>;
  private members: Map<string, FamilyMember>;
  private tooltip: d3.Selection<HTMLDivElement, unknown, HTMLElement, any> | null = null;

  constructor(
    containerId: string,
    options: FamilyTreeVisualizationOptions = {}
  ) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
    
    this.container = container;
    this.members = new Map();
    
    // Set default options
    this.options = {
      width: options.width || 1200,
      height: options.height || 800,
      nodeRadius: options.nodeRadius || 40,
      levelHeight: options.levelHeight || 150,
      nodeSpacing: options.nodeSpacing || 100,
      colorScheme: options.colorScheme || 'default',
      showPhotos: options.showPhotos !== false,
      showDates: options.showDates !== false,
      showOccupation: options.showOccupation || false,
      animationDuration: options.animationDuration || 750,
      zoomEnabled: options.zoomEnabled !== false,
      customColors: options.customColors || {}
    };

    // Initialize SVG with zoom support
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .attr('viewBox', `0 0 ${this.options.width} ${this.options.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .style('background-color', this.getColor('background', '#f9f9f9'));

    // Add zoom functionality if enabled
    if (this.options.zoomEnabled) {
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          this.svg.select('.zoom-group').attr('transform', event.transform.toString());
        });
      
      this.svg.call(zoom);
    }

    // Create main group for zoom
    this.svg.append('g').attr('class', 'zoom-group');
  }

  /**
   * Load family data and render the tree
   */
  public loadData(members: FamilyMember[]): void {
    // Clear existing data
    this.members.clear();
    
    // Store members in map for easy access
    members.forEach(member => {
      this.members.set(member.id, member);
    });

    this.render();
  }

  /**
   * Render the family tree visualization
   */
  private render(): void {
    // Clear existing visualization
    const zoomGroup = this.svg.select('.zoom-group');
    zoomGroup.selectAll('*').remove();

    // Add definitions for patterns and gradients
    const defs = zoomGroup.append('defs');
    
    // Add shadow filter
    const filter = defs.append('filter')
      .attr('id', 'shadow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    
    filter.append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3);
    
    filter.append('feOffset')
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('result', 'offsetblur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode')
      .attr('in', 'offsetblur');
    feMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');

    // Create groups for different elements
    const linksGroup = zoomGroup.append('g').attr('class', 'links');
    const nodesGroup = zoomGroup.append('g').attr('class', 'nodes');

    // Convert family data to hierarchical structure
    const root = this.buildHierarchy();
    
    if (!root) {
      console.warn('No root node found in family data');
      return;
    }

    // Create tree layout
    const treeLayout = d3.tree<FamilyMember>()
      .size([this.options.width - 100, this.options.height - 100]);

    const treeData = treeLayout(d3.hierarchy(root));

    // Draw links with animation
    const links = linksGroup.selectAll('path')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('d', d => {
        const sourceX = d.source.x + 50;
        const sourceY = d.source.y + 50;
        const targetX = d.target.x + 50;
        const targetY = d.target.y + 50;
        
        return `M${sourceX},${sourceY}
                C${sourceX},${(sourceY + targetY) / 2}
                 ${targetX},${(sourceY + targetY) / 2}
                 ${targetX},${targetY}`;
      })
      .attr('fill', 'none')
      .attr('stroke', this.getColor('link', '#cccccc'))
      .attr('stroke-width', 2)
      .attr('opacity', 0);

    // Animate links
    links.transition()
      .duration(this.options.animationDuration)
      .attr('opacity', 1);

    // Draw nodes with enhanced features
    const nodes = nodesGroup.selectAll('g')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x + 50}, ${d.y + 50})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => this.handleNodeClick(event, d));

    // Add circles with gender-based colors
    nodes.append('circle')
      .attr('r', 0)
      .attr('fill', d => {
        const gender = d.data.gender || 'other';
        return this.getColor(gender, '#69b3a2');
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('filter', 'url(#shadow)')
      .transition()
      .duration(this.options.animationDuration)
      .attr('r', this.options.nodeRadius);

    // Add photos if enabled
    if (this.options.showPhotos) {
      const photoNodes = nodes.filter(d => !!d.data.photo);
      
      // Add clipPath for circular photos
      photoNodes.each(function(d) {
        const node = d3.select(this);
        const clipId = `clip-${d.data.id}`;
        
        defs.append('clipPath')
          .attr('id', clipId)
          .append('circle')
          .attr('r', 35);
        
        node.append('image')
          .attr('xlink:href', d.data.photo || '')
          .attr('x', -35)
          .attr('y', -35)
          .attr('width', 70)
          .attr('height', 70)
          .attr('clip-path', `url(#${clipId})`);
      });
    }

    // Add text labels with better styling
    const labels = nodes.append('g')
      .attr('class', 'labels');

    // Name label
    labels.append('text')
      .attr('dy', this.options.showPhotos ? '60' : '5')
      .attr('text-anchor', 'middle')
      .text(d => d.data.name)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#333');

    // Add dates if enabled
    if (this.options.showDates) {
      labels.append('text')
        .attr('dy', this.options.showPhotos ? '75' : '20')
        .attr('text-anchor', 'middle')
        .text(d => {
          const birth = d.data.birthDate ? `b. ${d.data.birthDate}` : '';
          const death = d.data.deathDate ? `d. ${d.data.deathDate}` : '';
          return [birth, death].filter(Boolean).join(' - ');
        })
        .style('font-size', '10px')
        .style('fill', '#666');
    }

    // Add occupation if enabled
    if (this.options.showOccupation) {
      labels.append('text')
        .attr('dy', this.options.showPhotos ? '90' : '35')
        .attr('text-anchor', 'middle')
        .text(d => d.data.occupation || '')
        .style('font-size', '10px')
        .style('font-style', 'italic')
        .style('fill', '#666');
    }
  }

  /**
   * Build hierarchical structure from flat family data
   */
  private buildHierarchy(): FamilyMember | null {
    // Find root nodes (members without parents)
    const rootMembers = Array.from(this.members.values()).filter(
      member => !member.parentIds || member.parentIds.length === 0
    );

    if (rootMembers.length === 0) {
      return null;
    }

    // For simplicity, take the first root member
    const root = rootMembers[0];
    
    // Recursively build tree
    this.attachChildren(root);
    
    return root;
  }

  /**
   * Recursively attach children to family members
   */
  private attachChildren(member: FamilyMember): void {
    const children = Array.from(this.members.values()).filter(
      m => m.parentIds && m.parentIds.includes(member.id)
    );

    if (children.length > 0) {
      member.children = children.map(c => c.id);
      children.forEach(child => this.attachChildren(child));
    }
  }

  /**
   * Export visualization as PNG
   */
  public async exportAsPNG(filename: string = 'family-tree.png'): Promise<void> {
    try {
      const canvas = await html2canvas(this.container);
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error exporting as PNG:', error);
      throw error;
    }
  }

  /**
   * Export visualization as PDF
   */
  public async exportAsPDF(filename: string = 'family-tree.pdf'): Promise<void> {
    try {
      const canvas = await html2canvas(this.container);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(filename);
    } catch (error) {
      console.error('Error exporting as PDF:', error);
      throw error;
    }
  }

  /**
   * Update visualization options
   */
  public updateOptions(options: FamilyTreeVisualizationOptions): void {
    this.options = { ...this.options, ...options };
    
    // Update SVG dimensions
    this.svg
      .attr('width', this.options.width)
      .attr('height', this.options.height)
      .attr('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
    
    // Re-render if we have data
    if (this.members.size > 0) {
      this.render();
    }
  }

  /**
   * Clear the visualization
   */
  public clear(): void {
    this.svg.selectAll('*').remove();
    this.members.clear();
  }

  /**
   * Get color based on color scheme and type
   */
  private getColor(type: string, defaultColor: string): string {
    if (this.options.colorScheme === 'custom' && this.options.customColors) {
      return (this.options.customColors as any)[type] || defaultColor;
    }

    const colorSchemes: { [key: string]: { [key: string]: string } } = {
      default: {
        male: '#4a90e2',
        female: '#e24a90',
        other: '#90e24a',
        link: '#cccccc',
        background: '#f9f9f9'
      },
      vintage: {
        male: '#8b4513',
        female: '#cd5c5c',
        other: '#daa520',
        link: '#d2b48c',
        background: '#faf0e6'
      },
      modern: {
        male: '#2c3e50',
        female: '#e74c3c',
        other: '#95a5a6',
        link: '#bdc3c7',
        background: '#ecf0f1'
      }
    };

    const scheme = colorSchemes[this.options.colorScheme || 'default'] || colorSchemes.default;
    return scheme[type] || defaultColor;
  }

  /**
   * Export visualization as SVG
   */
  public exportAsSVG(filename: string = 'family-tree.svg'): void {
    const svgElement = this.svg.node();
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
  }

  /**
   * Handle node click events
   */
  private handleNodeClick(event: MouseEvent, d: d3.HierarchyPointNode<FamilyMember>): void {
    event.stopPropagation();
    
    // Create or update tooltip
    if (!this.tooltip) {
      this.tooltip = d3.select('body')
        .append('div')
        .attr('class', 'family-tree-tooltip')
        .style('position', 'absolute')
        .style('padding', '10px')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('border-radius', '5px')
        .style('pointer-events', 'none')
        .style('opacity', 0);
    }

    // Show member details
    const member = d.data;
    let content = `<strong>${member.name}</strong>`;
    
    if (member.birthDate || member.deathDate) {
      content += '<br/>';
      if (member.birthDate) content += `Born: ${member.birthDate}`;
      if (member.birthDate && member.deathDate) content += '<br/>';
      if (member.deathDate) content += `Died: ${member.deathDate}`;
    }
    
    if (member.occupation) {
      content += `<br/>Occupation: ${member.occupation}`;
    }
    
    if (member.location) {
      content += `<br/>Location: ${member.location}`;
    }

    this.tooltip
      .html(content)
      .style('left', (event.pageX + 10) + 'px')
      .style('top', (event.pageY - 28) + 'px')
      .transition()
      .duration(200)
      .style('opacity', 1);

    // Hide tooltip on click outside
    d3.select('body').on('click', () => {
      if (this.tooltip) {
        this.tooltip.transition()
          .duration(200)
          .style('opacity', 0);
      }
    });
  }
}