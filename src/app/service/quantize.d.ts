declare module 'quantize' {
  interface ColorMap {
    palette(): number[][];
    size(): number;
  }

  function quantize(pixels: number[][], maxColors: number): ColorMap | null;

  export = quantize;
}
