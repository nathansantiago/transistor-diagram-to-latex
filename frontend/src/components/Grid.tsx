import { Line } from 'react-konva';

type GridProps = {
  width: number;
  height: number;
  gridWidth: number;
};

export default function Grid({ width, height, gridWidth }: GridProps) {
  return (
    <>
      {Array.from({ length: Math.ceil(width / gridWidth) }).map((_, i) => (
        <Line
          key={i * gridWidth}
          points={[Math.round(i * gridWidth) + 0.5, 0, Math.round(i * gridWidth) + 0.5, height]}
          stroke="#fff"
        />
      ))}
      {Array.from({ length: Math.ceil(height / gridWidth) }).map((_, i) => (
        <Line
          key={i * gridWidth}
          points={[0, Math.round(i * gridWidth) + 0.5, width, Math.round(i * gridWidth) + 0.5]}
          stroke="#fff"
        />
      ))}
    </>
  );
}
