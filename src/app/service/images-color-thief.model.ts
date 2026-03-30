export interface ColorThiefSetting {
  colorCount: number;
  quality: number;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface HSBColor {
  h: number;
  s: number;
  b: number;
}

export interface PaletteSwatch {
  rgb: RGBColor;
  hsb: HSBColor;
  hexText: string;
  rgbText: string;
  hsbText: string;
  ratio?: number;
  ratioText?: string;
}

export interface PaletteEntry {
  original: PaletteSwatch;
  card: PaletteSwatch;
  body: PaletteSwatch;
}

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}
