export function getMostPrevalentColor(colors: string[]): string {
  const colorCounts: { [key: string]: number } = {};

  colors.forEach((color) => {
    if (color !== "transparent") {
      if (colorCounts[color]) {
        colorCounts[color]++;
      } else {
        colorCounts[color] = 1;
      }
    }
  });

  let prevalentColor = "";
  let maxCount = 0;

  for (const color in colorCounts) {
    if (colorCounts[color] > maxCount) {
      maxCount = colorCounts[color];
      prevalentColor = color;
    }
  }

  return prevalentColor;
}
