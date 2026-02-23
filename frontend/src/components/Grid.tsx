import { Line } from 'react-konva';

type GridProps = {
  width: number;
  height: number;
  gridWidth: number;
};

export default function Grid({ width, height, gridWidth }: GridProps) {
  const extendedWidth = width * 2;
  const extendedHeight = height * 2;

  return (
    <>
      {/* Vertical lines */}
      {Array.from({ length: Math.ceil(extendedWidth / gridWidth) + 1 }).map((_, i) => (
        <Line
          key={`v-${i}`}
          points={[
            Math.round(i * gridWidth) + 0.5,
            -extendedHeight,
            Math.round(i * gridWidth) + 0.5,
            extendedHeight
          ]}
          stroke="#374151"
          strokeWidth={0.5}
        />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: Math.ceil(extendedHeight / gridWidth) + 1 }).map((_, i) => (
        <Line
          key={`h-${i}`}
          points={[
            -extendedWidth,
            Math.round(i * gridWidth) + 0.5,
            extendedWidth,
            Math.round(i * gridWidth) + 0.5
          ]}
          stroke="#374151"
          strokeWidth={0.5}
        />
      ))}
    </>
  );
}
