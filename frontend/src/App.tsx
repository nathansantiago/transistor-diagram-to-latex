import './App.css'
import { Circle, Layer, Stage } from "react-konva"
import Grid from './components/Grid'

function App() {
  var width = window.innerWidth
  var height = window.innerHeight
  var gridWidth = 50

  return (
    <Stage width={width} height={height}>
      <Layer>
        <Grid width={width} height={height} gridWidth={gridWidth} />
        <Circle width={50} height={50} x={100} y={100} fill="red" draggable
          onMouseEnter={(e) => {
            document.body.style.cursor = 'pointer';
          }}
          onMouseLeave={(e) => {
            document.body.style.cursor = 'default';
          }} />
      </Layer>
    </Stage>
  )
}

export default App
