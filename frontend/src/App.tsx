import './App.css';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import { useEffect, useState } from 'react';

function App() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight - 50, // Account for toolbar
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 50, // Account for toolbar
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Toolbar />
      <div style={{ marginTop: '50px' }}>
        <Canvas width={dimensions.width} height={dimensions.height} />
      </div>
    </div>
  );
}

export default App;
