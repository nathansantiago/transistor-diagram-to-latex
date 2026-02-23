import { Stage, Layer } from 'react-konva';
import { useEffect, useRef, useState } from 'react';
import Grid from './Grid';
import ComponentRenderer from './ComponentRenderer';
import WireRenderer from './WireRenderer';
import { useDiagramStore } from '../stores/diagramStore';

interface CanvasProps {
  width: number;
  height: number;
}

export default function Canvas({ width, height }: CanvasProps) {
  const stageRef = useRef<any>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const {
    components,
    connections,
    selectedComponentIds,
    selectedConnectionIds,
    stageScale,
    stageX,
    stageY,
    gridSize,
    activeTool,
    setStageScale,
    setStagePosition,
    updateComponent,
    setSelectedComponents,
    setSelectedConnections,
    clearSelection,
    deleteComponent,
    deleteConnection,
    snapToGrid,
    undo,
    redo,
  } = useDiagramStore();

  // Handle wheel zoom
  const handleWheel = (e: any) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - stageX) / oldScale,
      y: (pointer.y - stageY) / oldScale,
    };

    // Zoom speed
    const scaleBy = 1.1;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    setStageScale(newScale);

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    setStagePosition(newPos.x, newPos.y);
  };

  // Handle panning
  const handleDragEnd = (e: any) => {
    setStagePosition(e.target.x(), e.target.y());
  };

  // Handle mouse move for cursor position display
  const handleMouseMove = (e: any) => {
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    const x = (pointer.x - stageX) / stageScale;
    const y = (pointer.y - stageY) / stageScale;

    setCursorPos({ x: Math.round(x), y: Math.round(y) });
  };

  // Handle stage click (clear selection and check if dragging stage)
  const handleStageClick = (e: any) => {
    // Only clear selection if clicking on stage background (not on a shape)
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Space key to enable panning
      if (e.key === ' ') {
        e.preventDefault();
        setIsSpacePressed(true);
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedComponentIds.forEach((id) => { deleteComponent(id); });
        selectedConnectionIds.forEach((id) => { deleteConnection(id); });
      }

      // Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      // Escape to clear selection
      if (e.key === 'Escape') {
        clearSelection();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedComponentIds, selectedConnectionIds, deleteComponent, deleteConnection, undo, redo, clearSelection]);

  return (
    <div style={{ position: 'relative', width, height, background: '#1F2937' }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scaleX={stageScale}
        scaleY={stageScale}
        x={stageX}
        y={stageY}
        draggable={isSpacePressed}
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
        onMouseMove={handleMouseMove}
        onClick={handleStageClick}
        onTap={handleStageClick}
      >
        <Layer>
          {/* Grid */}
          <Grid width={width / stageScale} height={height / stageScale} gridWidth={gridSize} />

          {/* Wires/Connections (render below components) */}
          {connections.map((conn) => (
            <WireRenderer
              key={conn.id}
              connection={conn}
              components={components}
              isSelected={selectedConnectionIds.includes(conn.id)}
              onSelect={() => setSelectedConnections([conn.id])}
            />
          ))}

          {/* Components */}
          {components.map((comp) => (
            <ComponentRenderer
              key={comp.id}
              component={comp}
              isSelected={selectedComponentIds.includes(comp.id)}
              onSelect={() => setSelectedComponents([comp.id])}
              onDragEnd={(x, y) => updateComponent(comp.id, { x, y })}
              onDragMove={() => { }}
              snapToGrid={snapToGrid}
            />
          ))}
        </Layer>
      </Stage>

      {/* Status bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 24,
          background: '#111827',
          color: '#9CA3AF',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          padding: '0 12px',
          gap: 16,
          borderTop: '1px solid #374151',
        }}
      >
        <span>
          X: {cursorPos.x} Y: {cursorPos.y}
        </span>
        <span>
          Zoom: {Math.round(stageScale * 100)}%
        </span>
        <span>
          Components: {components.length}
        </span>
        <span>
          Tool: {activeTool}
        </span>
      </div>
    </div>
  );
}
