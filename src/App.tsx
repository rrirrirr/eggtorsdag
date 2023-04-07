import React, { useEffect, useState } from "react";
import { SketchPicker, ColorResult } from "react-color";
import chroma from "chroma-js";
import "./App.css";
import useSound from "use-sound";
import { io, Socket } from "socket.io-client";
import ColorGridPicker from "./components/ColorGridPicker";

const generatePastelColors = (count: number): string[] => {
  const colorStops = [
    chroma("#FFB6C1"),
    chroma("#FFDAB9"),
    chroma("#E6E6FA"),
    chroma("#B0E0E6"),
    chroma("#F0E68C"),
    chroma("#FFC0CB"),
    chroma("#FFE4E1"),
    chroma("#D8BFD8"),
    chroma("#FFDEAD"),
    chroma("#C6E2FF"),
    chroma("#BFEFFF"),
    chroma("#F0FFF0"),
  ];
  const colors: string[] = [];
  const scale = chroma.scale(colorStops).mode("lch").colors(count);

  for (const color of scale) {
    colors.push(color);
  }

  return colors;
};

const pastelColors = generatePastelColors(100);

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
    if (socket) {
      socket.emit("paint", { x, y, color });
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

  const [socket, setSocket] = useState<Socket | null>(null);

  const handleIncomingPaint = (x: number, y: number, newColor: string) => {
    setColors((prevColors) => {
      const updatedColors = prevColors.map((row) => row.slice());
      updatedColors[y][x] = newColor;
      return updatedColors;
    });
  };

  const [isConnected, setIsConnected] = useState(false);
  const [fooEvents, setFooEvents] = useState([]);

  useEffect(() => {
    const newSocket = io(
      `${import.meta.env.VITE_HOST}` || "http://localhost:3001"
    );

    function onConnect() {
      console.log("Connected");
      setIsConnected(true);
    }

    function onInit(initialColors: string[][]) {
      setColors((prevColors) => {
        const updatedColors = prevColors.map((row, y) =>
          row.map(
            (cellColor, x) =>
              (initialColors[y] && initialColors[y][x]) || cellColor
          )
        );
        return updatedColors;
      });
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onPaint(data: { x: number; y: number; color: string }) {
      handleIncomingPaint(data.x, data.y, data.color);
    }

    setSocket(newSocket);
    newSocket.on("connect", onConnect);
    newSocket.on("init", onInit);
    newSocket.on("disconnect", onDisconnect);
    newSocket.on("paint", onPaint);

    return () => {
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.off("paint", onPaint);
      newSocket.disconnect();
    };
  }, []);

  return (
    <>
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
      <h1>Multi Eggtorsdag</h1>
      <div className="painter-container">
        <EggCanvas color={color} gridSize={20} />
      </div>
      <div className="color-picker">
        <ColorGridPicker
          colors={pastelColors}
          selectedColor={color}
          onColorChange={setColor}
        />
      </div>
    </div>
  );
};

export default App;
