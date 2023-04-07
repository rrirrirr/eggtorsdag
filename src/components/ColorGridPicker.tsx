import React from "react";

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
  return (
    <div className="color-grid-picker">
      {colors.map((color, index) => (
        <div
          key={index}
          className={`color-grid-picker__item${
            selectedColor === color ? " color-grid-picker__item--selected" : ""
          }`}
          style={{ backgroundColor: color }}
          onClick={() => onColorChange(color)}
        />
      ))}
      <style jsx>{`
        .color-grid-picker {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .color-grid-picker__item {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          cursor: pointer;
        }
        .color-grid-picker__item--selected {
          border: 2px solid #000;
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default ColorGridPicker;
