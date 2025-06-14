import React, { useCallback, useMemo, useState } from 'react';
import { 
  ReactFlow, 
  Controls, 
  MiniMap, 
  Background, 
  useNodesState, 
  useEdgesState
} from 'reactflow';

import { Person } from '../../types/person';
import { FamilyTreeData, FamilyTreeLayoutOptions } from '../../types/family-tree';
import { generateFamilyTreeLayout } from '../../utils/familyTreeLayout';
import { FamilyTreeNode } from './FamilyTreeNode';
import { FamilyTreeEdge } from './FamilyTreeEdge';
import { Button } from '../UI/Button';

interface FamilyTreeVisualizationProps {
  familyTreeData: FamilyTreeData;
  onPersonClick: (person: Person) => void;
  onPersonEdit: (person: Person) => void;
  onLayoutChange: (layoutOptions: FamilyTreeLayoutOptions) => void;
}

const defaultLayoutOptions: FamilyTreeLayoutOptions = {
  direction: 'TB',
  nodeSpacing: { horizontal: 200, vertical: 150 },
  generationSpacing: 200
};


export const FamilyTreeVisualization = React.memo<FamilyTreeVisualizationProps>(({
  familyTreeData,
  onPersonClick,
  onPersonEdit,
  onLayoutChange
}) => {
  const [layoutOptions, setLayoutOptions] = useState(defaultLayoutOptions);
  const [zoom, setZoom] = useState(1);

  // Memoized custom node types for performance
  const nodeTypes = useMemo(() => ({
    person: (props: any) => (
      <FamilyTreeNode
        data={props.data}
        onPersonClick={props.data.onPersonClick}
        onPersonEdit={props.data.onPersonEdit}
      />
    )
  }), []);

  // Memoized custom edge types for performance
  const edgeTypes = useMemo(() => ({
    'family-relation': (props: any) => (
      <FamilyTreeEdge
        id={props.id}
        sourceX={props.sourceX}
        sourceY={props.sourceY}
        targetX={props.targetX}
        targetY={props.targetY}
        style={props.style}
        data={props.data}
      />
    )
  }), []);

  // Generate layout based on current options
  const layoutedData = useMemo(() => {
    return generateFamilyTreeLayout(familyTreeData, layoutOptions);
  }, [familyTreeData, layoutOptions]);

  // Prepare nodes for React Flow
  const reactFlowNodes = useMemo(() => {
    return layoutedData.nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        onPersonClick,
        onPersonEdit
      }
    }));
  }, [layoutedData.nodes, onPersonClick, onPersonEdit]);

  // Prepare edges for React Flow
  const reactFlowEdges = useMemo(() => {
    return layoutedData.edges;
  }, [layoutedData.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Update nodes when reactFlowNodes change
  React.useEffect(() => {
    setNodes(reactFlowNodes);
  }, [reactFlowNodes, setNodes]);

  // Update edges when reactFlowEdges change
  React.useEffect(() => {
    setEdges(reactFlowEdges);
  }, [reactFlowEdges, setEdges]);

  const handleLayoutChange = useCallback((direction: 'TB' | 'LR' | 'BT' | 'RL') => {
    const newLayoutOptions = { ...layoutOptions, direction };
    setLayoutOptions(newLayoutOptions);
    onLayoutChange(newLayoutOptions);
  }, [layoutOptions, onLayoutChange]);

  // Memoized control button classes
  const buttonClasses = useMemo(() => ({
    layoutButton: 'text-sm font-medium text-gray-700',
    activeButton: 'bg-white rounded-lg shadow-md p-4 space-y-2',
    zoomButton: 'absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md p-4 space-y-2'
  }), []);

  // Memoized container styles
  const containerStyles = useMemo(() => ({
    main: 'w-full h-full relative',
    layoutControls: 'absolute top-4 left-4 z-10 bg-white rounded-lg shadow-md p-4 space-y-2',
    zoomControls: 'absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md p-4 space-y-2',
    reactFlowContainer: 'bg-gray-50 w-full h-full',
    emptyState: 'absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90'
  }), []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev * 0.8, 0.1));
  }, []);

  const handleFitView = useCallback(() => {
    setZoom(1);
  }, []);

  // Keyboard navigation support
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case '+':
      case '=':
        e.preventDefault();
        handleZoomIn();
        break;
      case '-':
        e.preventDefault();
        handleZoomOut();
        break;
      case '0':
        e.preventDefault();
        handleFitView();
        break;
      case 'ArrowUp':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleLayoutChange('TB');
        }
        break;
      case 'ArrowRight':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleLayoutChange('LR');
        }
        break;
      case 'ArrowDown':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleLayoutChange('BT');
        }
        break;
      case 'ArrowLeft':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          handleLayoutChange('RL');
        }
        break;
    }
  }, [handleZoomIn, handleZoomOut, handleFitView, handleLayoutChange]);

  const isEmpty = familyTreeData.nodes.length === 0;

  return (
    <div 
      className={containerStyles.main} 
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="application"
      aria-label="家系図ビジュアライゼーション"
      aria-describedby="family-tree-instructions"
    >
      {/* Screen reader instructions */}
      <div 
        id="family-tree-instructions" 
        className="sr-only"
        aria-live="polite"
      >
        家系図を操作できます。+キーでズームイン、-キーでズームアウト、0キーで全体表示。Ctrl+矢印キーでレイアウト変更。
      </div>
      {/* Layout Controls */}
      <div 
        className={containerStyles.layoutControls}
        role="group"
        aria-labelledby="layout-controls-title"
      >
        <h3 
          id="layout-controls-title"
          className="text-sm font-medium text-gray-700"
        >
          レイアウト変更
        </h3>
        <div className="flex flex-col space-y-2">
          <Button
            size="sm"
            variant={layoutOptions.direction === 'TB' ? 'primary' : 'secondary'}
            onClick={() => handleLayoutChange('TB')}
            aria-pressed={layoutOptions.direction === 'TB'}
            aria-describedby="layout-tb-desc"
          >
            上から下
          </Button>
          <span id="layout-tb-desc" className="sr-only">
            Ctrl+上矢印でも選択可能
          </span>
          
          <Button
            size="sm"
            variant={layoutOptions.direction === 'LR' ? 'primary' : 'secondary'}
            onClick={() => handleLayoutChange('LR')}
            aria-pressed={layoutOptions.direction === 'LR'}
            aria-describedby="layout-lr-desc"
          >
            左から右
          </Button>
          <span id="layout-lr-desc" className="sr-only">
            Ctrl+右矢印でも選択可能
          </span>
          
          <Button
            size="sm"
            variant={layoutOptions.direction === 'BT' ? 'primary' : 'secondary'}
            onClick={() => handleLayoutChange('BT')}
            aria-pressed={layoutOptions.direction === 'BT'}
            aria-describedby="layout-bt-desc"
          >
            下から上
          </Button>
          <span id="layout-bt-desc" className="sr-only">
            Ctrl+下矢印でも選択可能
          </span>
          
          <Button
            size="sm"
            variant={layoutOptions.direction === 'RL' ? 'primary' : 'secondary'}
            onClick={() => handleLayoutChange('RL')}
            aria-pressed={layoutOptions.direction === 'RL'}
            aria-describedby="layout-rl-desc"
          >
            右から左
          </Button>
          <span id="layout-rl-desc" className="sr-only">
            Ctrl+左矢印でも選択可能
          </span>
        </div>
      </div>

      {/* Zoom Controls */}
      <div 
        className={containerStyles.zoomControls}
        role="group"
        aria-labelledby="zoom-controls-title"
      >
        <h3 
          id="zoom-controls-title"
          className="sr-only"
        >
          ズーム操作
        </h3>
        <div className="space-y-2">
          <Button
            size="sm"
            onClick={handleZoomIn}
            aria-label="ズームイン（+キーでも可能）"
            aria-describedby="zoom-in-desc"
          >
            ズームイン
          </Button>
          <span id="zoom-in-desc" className="sr-only">
            現在のズーム: {Math.round(zoom * 100)}%
          </span>
          
          <Button
            size="sm"
            onClick={handleZoomOut}
            aria-label="ズームアウト（-キーでも可能）"
          >
            ズームアウト
          </Button>
          
          <Button
            size="sm"
            onClick={handleFitView}
            aria-label="全体表示（0キーでも可能）"
          >
            全体表示
          </Button>
        </div>
      </div>

      {/* React Flow */}
      <div 
        className={containerStyles.reactFlowContainer}
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-gray-50"
          tabIndex={0}
        >
          <Controls />
          <MiniMap />
          <Background />
        </ReactFlow>

        {/* Empty State Overlay */}
        {isEmpty && (
          <div 
            className={containerStyles.emptyState}
            role="status"
            aria-live="polite"
          >
            <div className="text-center">
              <p className="text-gray-500 text-lg">家系図データがありません</p>
              <p className="text-gray-400 text-sm mt-2">人物を追加して家系図を作成してください</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

FamilyTreeVisualization.displayName = 'FamilyTreeVisualization';