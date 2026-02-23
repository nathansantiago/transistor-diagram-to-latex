import { Group, Rect, Circle, Line, Text, Arrow } from 'react-konva';
import type { Component } from '../types/diagram';

interface ComponentRendererProps {
  component: Component;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  snapToGrid: (value: number) => number;
}

export default function ComponentRenderer({
  component,
  isSelected,
  onSelect,
  onDragEnd,
  onDragMove,
  snapToGrid,
}: ComponentRendererProps) {
  const handleDragEnd = (e: any) => {
    const x = snapToGrid(e.target.x());
    const y = snapToGrid(e.target.y());
    onDragEnd(x, y);
  };

  const handleDragMove = (e: any) => {
    onDragMove(e.target.x(), e.target.y());
  };

  return (
    <Group
      x={component.x}
      y={component.y}
      rotation={component.rotation}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      dragBoundFunc={(pos) => ({
        x: snapToGrid(pos.x),
        y: snapToGrid(pos.y),
      })}
    >
      {/* Selection indicator */}
      {isSelected && (
        <Rect
          x={-25}
          y={-25}
          width={50}
          height={50}
          stroke="#3B82F6"
          strokeWidth={2}
          dash={[5, 5]}
        />
      )}

      {/* Render component based on type */}
      {renderComponentShape(component)}

      {/* Label */}
      {(component.label || component.value) && (
        <Text
          x={-20}
          y={30}
          width={40}
          text={component.label || component.value}
          fontSize={12}
          fill="#ffffff"
          align="center"
        />
      )}

      {/* Connection ports (visible when selected) */}
      {isSelected && (
        <>
          <Circle x={-20} y={0} radius={3} fill="#10B981" /> {/* left */}
          <Circle x={20} y={0} radius={3} fill="#10B981" /> {/* right */}
          <Circle x={0} y={-20} radius={3} fill="#10B981" /> {/* top */}
          <Circle x={0} y={20} radius={3} fill="#10B981" /> {/* bottom */}
        </>
      )}
    </Group>
  );
}

// Helper function to render different component shapes
function renderComponentShape(component: Component) {
  const color = '#E5E7EB';
  const strokeWidth = 2;

  switch (component.type) {
    case 'resistor':
      return (
        <Group>
          <Line
            points={[-20, 0, -10, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Rect
            x={-10}
            y={-5}
            width={20}
            height={10}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[10, 0, 20, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    case 'capacitor':
      return (
        <Group>
          <Line
            points={[-20, 0, -2, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[-2, -10, -2, 10]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[2, -10, 2, 10]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[2, 0, 20, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    case 'inductor':
      return (
        <Group>
          <Line
            points={[-20, 0, -15, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Simple coil representation */}
          <Circle x={-10} y={0} radius={3} stroke={color} strokeWidth={strokeWidth} />
          <Circle x={-5} y={0} radius={3} stroke={color} strokeWidth={strokeWidth} />
          <Circle x={0} y={0} radius={3} stroke={color} strokeWidth={strokeWidth} />
          <Circle x={5} y={0} radius={3} stroke={color} strokeWidth={strokeWidth} />
          <Circle x={10} y={0} radius={3} stroke={color} strokeWidth={strokeWidth} />
          <Line
            points={[15, 0, 20, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    case 'ground':
      return (
        <Group>
          <Line
            points={[0, -20, 0, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[-12, 0, 12, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[-8, 5, 8, 5]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[-4, 10, 4, 10]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    case 'rground':
      return (
        <Group>
          <Line
            points={[0, -20, 0, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[10, 0, -10, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    case 'nmos':
      return (
        <Group>
          {/* Gate horizontal line */}
          <Line
            points={[-20, 0, -8, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Gate vertical bar */}
          <Line
            points={[-8, -12, -8, 12]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Channel vertical line */}
          <Line
            points={[-3, -12, -3, 12]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Drain horizontal */}
          <Line
            points={[-3, -12, 8, -12]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Drain vertical up */}
          <Line
            points={[8, -12, 8, -20]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Source horizontal */}
          <Line
            points={[-3, 12, 8, 12]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Source vertical down */}
          <Line
            points={[8, 12, 8, 20]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    case 'pmos':
      return (
        <Group>
          {/* Gate horizontal line */}
          <Line
            points={[-20, 0, -12, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Circle on gate to denote PMOS */}
          <Circle
            x={-10}
            y={0}
            radius={2}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Gate vertical bar */}
          <Line
            points={[-8, -12, -8, 12]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Channel vertical line */}
          <Line
            points={[-3, -12, -3, 12]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Drain horizontal */}
          <Line
            points={[-3, -12, 8, -12]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Drain vertical up */}
          <Line
            points={[8, -12, 8, -20]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Source horizontal */}
          <Line
            points={[-3, 12, 8, 12]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Source vertical down */}
          <Line
            points={[8, 12, 8, 20]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    case 'battery':
    case 'dc_voltage':
      return (
        <Group>
          <Line
            points={[-20, 0, -5, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[-5, -8, -5, 8]}
            stroke={color}
            strokeWidth={strokeWidth * 1.5}
          />
          <Line
            points={[5, -12, 5, 12]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[5, 0, 20, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    case 'diode':
      return (
        <Group>
          <Line
            points={[-20, 0, -5, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Triangle */}
          <Line
            points={[-5, -8, -5, 8, 5, 0, -5, -8]}
            stroke={color}
            strokeWidth={strokeWidth}
            closed
          />
          {/* Bar */}
          <Line
            points={[5, -8, 5, 8]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[5, 0, 20, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    case 'led':
      return (
        <Group>
          <Line
            points={[-20, 0, -5, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Triangle */}
          <Line
            points={[-5, -8, -5, 8, 5, 0, -5, -8]}
            stroke={color}
            strokeWidth={strokeWidth}
            closed
          />
          {/* Bar */}
          <Line
            points={[5, -8, 5, 8]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[5, 0, 20, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Arrows for light emission */}
          <Arrow
            points={[8, -10, 12, -14]}
            stroke="#FCD34D"
            strokeWidth={1.5}
            pointerLength={3}
            pointerWidth={3}
          />
        </Group>
      );

    case 'npn':
      return (
        <Group>
          {/* Base */}
          <Line
            points={[-20, 0, -5, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[-5, -15, -5, 15]}
            stroke={color}
            strokeWidth={strokeWidth * 1.5}
          />
          {/* Collector */}
          <Line
            points={[-5, -10, 10, -20]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[10, -20, 10, -25]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Emitter */}
          <Line
            points={[-5, 10, 10, 20]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[10, 20, 10, 25]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Arrow on emitter */}
          <Arrow
            points={[0, 12, 8, 18]}
            stroke={color}
            strokeWidth={strokeWidth}
            pointerLength={4}
            pointerWidth={4}
            fill={color}
          />
        </Group>
      );

    case 'pnp':
      return (
        <Group>
          {/* Base */}
          <Line
            points={[-20, 0, -5, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[-5, -15, -5, 15]}
            stroke={color}
            strokeWidth={strokeWidth * 1.5}
          />
          {/* Collector */}
          <Line
            points={[-5, -10, 10, -20]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[10, -20, 10, -25]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Emitter */}
          <Line
            points={[-5, 10, 10, 20]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Line
            points={[10, 20, 10, 25]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          {/* Arrow pointing into base */}
          <Arrow
            points={[8, 18, 0, 12]}
            stroke={color}
            strokeWidth={strokeWidth}
            pointerLength={4}
            pointerWidth={4}
            fill={color}
          />
        </Group>
      );

    case 'junction':
      return (
        <Circle
          x={0}
          y={0}
          radius={4}
          fill={color}
        />
      );

    case 'opamp':
      return (
        <Group>
          {/* Triangle */}
          <Line
            points={[-15, -15, -15, 15, 15, 0, -15, -15]}
            stroke={color}
            strokeWidth={strokeWidth}
            closed
          />
          {/* + and - labels */}
          <Text
            x={-12}
            y={-12}
            text="+"
            fontSize={12}
            fill={color}
          />
          <Text
            x={-12}
            y={4}
            text="−"
            fontSize={12}
            fill={color}
          />
        </Group>
      );

    case 'switch':
      return (
        <Group>
          <Line
            points={[-20, 0, -10, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Circle x={-10} y={0} radius={2} fill={color} />
          <Line
            points={[-10, 0, 5, -8]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <Circle x={10} y={0} radius={2} fill={color} />
          <Line
            points={[10, 0, 20, 0]}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </Group>
      );

    // Default: simple box for unknown components
    default:
      return (
        <Rect
          x={-15}
          y={-15}
          width={30}
          height={30}
          stroke={color}
          strokeWidth={strokeWidth}
        />
      );
  }
}
