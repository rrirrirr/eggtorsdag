import React, { useEffect, useState } from "react";
import { SketchPicker, ColorResult } from "react-color";
import chroma from "chroma-js";
import "./App.css";
import useSound from "use-sound";

interface EggCanvasProps {
  color: string;
}

const generateEggGrid = (width: number, height: number): boolean[][] => {
  const grid: boolean[][] = Array(height)
    .fill(null)
    .map(() => Array(width).fill(false));

  const centerX = Math.floor(width / 2);
  const centerY = Math.floor(height / 2);
  const outlineThickness = 1;

  const a = width / 2; // Semi-major axis
  const b = height / 2; // Semi-minor axis

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const ellipseValue = (dx * dx) / (a * a) + (dy * dy) / (b * b);
      if (ellipseValue <= 1) {
        grid[y][x] = true;
      }
    }
  }
  return grid;
};

interface EggCanvasProps {
  color: string;
  gridSize: number;
}

const EggCanvas: React.FC<EggCanvasProps> = ({ color, gridSize }) => {
  const [playSound1] = useSound("/sounds/beep.mp3");
  const [playSound2] = useSound("/sounds/pop.mp3");
  const [playSound3] = useSound("/sounds/select.mp3");
  const [playSound4] = useSound("/sounds/snap.mp3");
  const [grid, setGrid] = useState<boolean[][]>(() =>
    generateEggGrid(gridSize, gridSize)
  );
  const [colors, setColors] = useState<string[][]>(() =>
    Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(""))
  );

  const handleCellClick = (x: number, y: number) => {
    if (!grid[y][x]) {
      return null;
    }
    const randomSound = Math.floor(Math.random() * 4);
    if (randomSound === 0) {
      playSound1();
    } else if (randomSound === 1) {
      playSound2();
    } else {
      playSound3();
    }
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row) => row.slice());
      newGrid[y][x] = true;
      return newGrid;
    });
    setColors((prevColors) => {
      const newColors = prevColors.map((row) => row.slice());
      newColors[y][x] = color;
      return newColors;
    });
  };

  const paintRandomPattern = () => {
    setColors((prevColors) => generateRandomPattern(grid, prevColors));
  };

  useEffect(() => {
    paintRandomPattern();
  }, []);

  return (
    <>
      <button onClick={paintRandomPattern}>Paint Random Pattern</button>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          gap: "1px",
          width: "400px",
          height: "400px",
          background: "#E4E8E6",
        }}
      >
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              onClick={() => handleCellClick(x, y)}
              style={{
                backgroundColor: cell ? colors[y][x] : "transparent",
                width: "100%",
                height: "100%",
              }}
            />
          ))
        )}
      </div>
    </>
  );
};

const randomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const generateRandomPattern = (
  grid: boolean[][],
  colors: string[][]
): string[][] => {
  const newColors = colors.map((row) => row.slice());
  const baseColor1 = randomColor();
  const baseColor2 = randomColor();
  const waveFrequency = 0.2;
  const waveAmplitude = 0.5;

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x]) {
        const t =
          (Math.sin(x * waveFrequency) + Math.cos(y * waveFrequency)) *
          waveAmplitude;
        const mixedColor = chroma
          .mix(baseColor1, baseColor2, (t + 1) / 2)
          .hex();
        newColors[y][x] = mixedColor;
      }
    }
  }
  return newColors;
};
const generateRandomPatternOld = (
  grid: boolean[][],
  colors: string[][]
): string[][] => {
  const newColors = colors.map((row) => row.slice());
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x]) {
        newColors[y][x] = randomColor();
      }
    }
  }
  return newColors;
};

const App: React.FC = () => {
  const [color, setColor] = useState("#000000");

  const handleColorChange = (newColor: ColorResult) => {
    setColor(newColor.hex);
  };

  return (
    <div className="App">
      <h1>Egg Painter</h1>
      <div className="painter-container">
        <EggCanvas color={color} gridSize={20} />
        <div className="color-picker">
          <SketchPicker color={color} onChangeComplete={handleColorChange} />
        </div>
      </div>
    </div>
  );
};

export default App;
