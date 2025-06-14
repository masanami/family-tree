import React, { useMemo } from 'react';

interface FamilyTreeEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  style?: React.CSSProperties;
  data: {
    relationType: 'parent-child' | 'spouse' | 'sibling';
    label?: string;
  };
}

export const FamilyTreeEdge = React.memo<FamilyTreeEdgeProps>(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  data
}) => {
  const { relationType, label } = data;

  // Memoized path calculation
  const pathData = useMemo(() => {
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;

    switch (relationType) {
      case 'parent-child':
        // Straight line for parent-child relationships
        return `M${sourceX},${sourceY} L${targetX},${targetY}`;
      
      case 'spouse':
        // Curved line for spouse relationships
        const controlX = midX;
        const controlY = Math.min(sourceY, targetY) - 30;
        return `M${sourceX},${sourceY} Q${controlX},${controlY} ${targetX},${targetY}`;
      
      case 'sibling':
        // Step line for sibling relationships
        return `M${sourceX},${sourceY} L${midX},${sourceY} L${midX},${targetY} L${targetX},${targetY}`;
      
      default:
        return `M${sourceX},${sourceY} L${targetX},${targetY}`;
    }
  }, [sourceX, sourceY, targetX, targetY, relationType]);

  // Memoized edge styles
  const edgeStyles = useMemo(() => {
    const baseStyles = {
      fill: 'none',
      strokeWidth: 2,
    };

    switch (relationType) {
      case 'parent-child':
        return {
          ...baseStyles,
          stroke: '#3B82F6', // Blue for parent-child
          strokeDasharray: 'none'
        };
      
      case 'spouse':
        return {
          ...baseStyles,
          stroke: '#EF4444', // Red for spouse
          strokeDasharray: '5,5'
        };
      
      case 'sibling':
        return {
          ...baseStyles,
          stroke: '#10B981', // Green for sibling
          strokeDasharray: '10,3'
        };
      
      default:
        return {
          ...baseStyles,
          stroke: '#6B7280' // Gray for unknown
        };
    }
  }, [relationType]);

  // Memoized label position
  const labelPosition = useMemo(() => ({
    x: (sourceX + targetX) / 2,
    y: (sourceY + targetY) / 2
  }), [sourceX, sourceY, targetX, targetY]);

  return (
    <g>
      {/* Edge Path */}
      <path
        id={id}
        d={pathData}
        style={{ ...edgeStyles, ...style }}
        className={`family-edge family-edge-${relationType}`}
        role="presentation"
        aria-label={label || relationType}
      />

      {/* Label */}
      {label && (
        <text
          x={labelPosition.x}
          y={labelPosition.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-gray-700 font-medium"
          style={{
            backgroundColor: 'white',
            padding: '2px 4px',
            borderRadius: '4px'
          }}
        >
          {label}
        </text>
      )}
    </g>
  );
});

FamilyTreeEdge.displayName = 'FamilyTreeEdge';