import chroma from "chroma-js";
import React from "react";
import { playSound } from "../Synth";
import "./ColorGridPicker.css";

interface ColorGridPickerProps {
  colors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const ColorGridPicker: React.FC<ColorGridPickerProps> = ({
  colors,
  selectedColor,
  onColorChange,
}) => {
  const handleCellMouseEnter = (color: string) => {
    const frequency = chroma(color).get("hsl.h") * 4 + 100;
    playSound(frequency);
  };

  return (
    <div className="color-grid-container">
      <div className="color-grid">
        {colors.map((color, index) => (
          <div
            key={index}
            className={`color-box ${
              color === selectedColor ? "selected-color" : ""
            }`}
            style={{ backgroundColor: color }}
            onMouseEnter={() => handleCellMouseEnter(color)}
            onClick={() => onColorChange(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorGridPicker;
