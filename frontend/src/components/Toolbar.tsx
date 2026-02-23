import { useDiagramStore } from '../stores/diagramStore';
import type { ComponentType } from '../types/diagram';

export default function Toolbar() {
  const {
    activeTool,
    setActiveTool,
    addComponent,
    clear,
    undo,
    redo,
    components,
    snapToGrid,
  } = useDiagramStore();

  const quickAddComponent = (type: ComponentType) => {
    // Add component at a semi-random position, snapped to grid
    const x = snapToGrid(200 + (components.length * 100) % 400);
    const y = snapToGrid(200 + Math.floor(components.length / 4) * 100);

    // Generate appropriate label based on type
    let label = '';
    if (type === 'nmos' || type === 'pmos') {
      label = `M${components.length + 1}`;
    } else if (type === 'ground' || type === 'rground') {
      label = ''; // Ground typically doesn't have labels
    } else {
      label = `${type.toUpperCase()}_${components.length + 1}`;
    }

    addComponent({
      type,
      x,
      y,
      rotation: 0,
      label,
      value: '',
    });
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    background: '#374151',
    color: '#E5E7EB',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  };

  const activeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: '#3B82F6',
    color: '#ffffff',
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    padding: '0 8px',
    borderLeft: '1px solid #4B5563',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 50,
        background: '#1F2937',
        borderBottom: '1px solid #374151',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '0 16px',
        zIndex: 10,
      }}
    >
      {/* Tools Section */}
      <div style={sectionStyle}>
        <button
          type="button"
          style={activeTool === 'select' ? activeButtonStyle : buttonStyle}
          onClick={() => setActiveTool('select')}
          title="Select Tool (V)"
        >
          Select
        </button>
        <button
          type="button"
          style={activeTool === 'wire' ? activeButtonStyle : buttonStyle}
          onClick={() => setActiveTool('wire')}
          title="Wire Tool (W)"
        >
          Wire
        </button>
      </div>

      {/* Quick Add Components */}
      <div style={sectionStyle}>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => quickAddComponent('nmos')}
          title="Add NMOS Transistor"
        >
          + NMOS
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => quickAddComponent('pmos')}
          title="Add PMOS Transistor"
        >
          + PMOS
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => quickAddComponent('ground')}
          title="Add Ground"
        >
          + GND
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => quickAddComponent('rground')}
          title="Add Reference Ground"
        >
          + RGND
        </button>
      </div>

      {/* History Actions */}
      <div style={sectionStyle}>
        <button
          type="button"
          style={buttonStyle}
          onClick={undo}
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={redo}
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </button>
      </div>

      {/* Clear */}
      <div style={sectionStyle}>
        <button
          type="button"
          style={{ ...buttonStyle, background: '#DC2626' }}
          onClick={() => {
            if (confirm('Clear entire diagram?')) {
              clear();
            }
          }}
          title="Clear Canvas"
        >
          Clear
        </button>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Help */}
      <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
        <span>Scroll to zoom • Hold Space + drag to pan • Del to delete</span>
      </div>
    </div>
  );
}
