import { Line, Circle } from 'react-konva';
import type { Connection, Component } from '../types/diagram';

interface WireRendererProps {
  connection: Connection;
  components: Component[];
  isSelected: boolean;
  onSelect: () => void;
}

export default function WireRenderer({
  connection,
  components,
  isSelected,
  onSelect,
}: WireRendererProps) {
  // Find source and target components
  const sourceComp = components.find((c) => c.id === connection.source.componentId);
  const targetComp = components.find((c) => c.id === connection.target.componentId);

  if (!sourceComp || !targetComp) {
    return null;
  }

  // Calculate port positions (20px offset from center)
  const getPortPosition = (comp: Component, position: string) => {
    const offset = 20;
    let x = comp.x;
    let y = comp.y;

    switch (position) {
      case 'left':
        x -= offset;
        break;
      case 'right':
        x += offset;
        break;
      case 'top':
        y -= offset;
        break;
      case 'bottom':
        y += offset;
        break;
    }

    return { x, y };
  };

  const start = getPortPosition(sourceComp, connection.source.position);
  const end = getPortPosition(targetComp, connection.target.position);

  // Build points array: start -> waypoints -> end
  const points: number[] = [start.x, start.y];

  if (connection.waypoints && connection.waypoints.length > 0) {
    connection.waypoints.forEach((wp) => {
      points.push(wp.x, wp.y);
    });
  }

  points.push(end.x, end.y);

  return (
    <>
      <Line
        points={points}
        stroke={isSelected ? '#3B82F6' : '#9CA3AF'}
        strokeWidth={isSelected ? 3 : 2}
        onClick={onSelect}
        onTap={onSelect}
      />

      {/* Show waypoints if selected */}
      {isSelected && connection.waypoints?.map((wp, index) => (
        <Circle
          key={index}
          x={wp.x}
          y={wp.y}
          radius={4}
          fill="#3B82F6"
          stroke="#ffffff"
          strokeWidth={1}
        />
      ))}
    </>
  );
}
