import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import quantize from 'quantize';
import { DOCUMENT } from '@angular/common';
import type {
  ColorThiefSetting,
  HSBColor,
  HSLColor,
  PaletteEntry,
  PaletteSwatch,
  RGBColor,
} from './images-color-thief.model';

@Injectable({
  providedIn: 'root'
})
export class ImagesColorThiefService {

  canvas!: HTMLCanvasElement;
  context !: CanvasRenderingContext2D;
  width !: number;
  height !: number;
  MODE = {
    LIGHT: 'LIGHT',
    DARK: 'DARK',
    HIGHER: 'HIGHER',
    LOWER: 'LOWER',
  };

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) { }

  private initCanvasImage(image: HTMLImageElement): void {
    this.canvas = this.document.createElement('canvas') as HTMLCanvasElement;

    const canvasContext = this.canvas.getContext('2d');

    if (canvasContext) {
      this.context = canvasContext;
    }

    this.width = this.canvas.width = image.naturalWidth;
    this.height = this.canvas.height = image.naturalHeight;

    this.context.drawImage(image, 0, 0, this.width, this.height);
  }

  private getCanvasImageData(): ImageData {
    return this.context.getImageData(0, 0, this.width, this.height);
  }

  private createPixelArray(imgData: ImageData, pixelCount: number, quality: number): number[][] {
    const pixels = imgData.data;
    const pixelArray = [];
    for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
        offset = i * 4;
        r = pixels[offset + 0];
        g = pixels[offset + 1];
        b = pixels[offset + 2];
        a = pixels[offset + 3];
        // If pixel is mostly opaque and not white
        if (typeof a === 'undefined' || a >= 125) {
            if (!(r > 250 && g > 250 && b > 250)) {
                pixelArray.push([r, g, b]);
            }
        }
    }
    return pixelArray;
  }

  private validateOptions(colorThiefSetting: ColorThiefSetting): ColorThiefSetting {
    const newSetting = colorThiefSetting;

    if (isNaN(newSetting.colorCount)) {
      newSetting.colorCount = 10;
    } else if (newSetting.colorCount === 1) {
        throw new Error('colorCount should be between 2 and 20. To get one color, call getColor() instead of getPalette()');
    } else {
      newSetting.colorCount = Math.max(newSetting.colorCount, 2);
      newSetting.colorCount = Math.min(newSetting.colorCount, 20);
    }

    if (isNaN(newSetting.quality) || newSetting.quality < 1) {
      newSetting.quality = 10;
    }

    return newSetting;
  }

  private convertRgbToHsb(rgb: RGBColor): HSBColor {
    const red = rgb.r / 255;
    const green = rgb.g / 255;
    const blue = rgb.b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    let hue = 0;

    if (delta !== 0) {
      if (max === red) {
        hue = ((green - blue) / delta) % 6;
      } else if (max === green) {
        hue = (blue - red) / delta + 2;
      } else {
        hue = (red - green) / delta + 4;
      }
    }

    hue = Math.round(hue * 60);

    if (hue < 0) {
      hue += 360;
    }

    return {
      h: hue,
      s: Math.round(max === 0 ? 0 : (delta / max) * 100),
      b: Math.round(max * 100),
    };
  }

  private convertHsbToRgb(hsb: HSBColor): RGBColor {
    const saturation = hsb.s / 100;
    const brightness = hsb.b / 100;
    const chroma = brightness * saturation;
    const hueSection = hsb.h / 60;
    const secondary = chroma * (1 - Math.abs((hueSection % 2) - 1));
    const match = brightness - chroma;
    let red = 0;
    let green = 0;
    let blue = 0;

    if (hueSection >= 0 && hueSection < 1) {
      red = chroma;
      green = secondary;
    } else if (hueSection < 2) {
      red = secondary;
      green = chroma;
    } else if (hueSection < 3) {
      green = chroma;
      blue = secondary;
    } else if (hueSection < 4) {
      green = secondary;
      blue = chroma;
    } else if (hueSection < 5) {
      red = secondary;
      blue = chroma;
    } else {
      red = chroma;
      blue = secondary;
    }

    return {
      r: Math.round((red + match) * 255),
      g: Math.round((green + match) * 255),
      b: Math.round((blue + match) * 255),
    };
  }

  private formatRgbText(rgb: RGBColor): string {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  private formatHexText(rgb: RGBColor): string {
    return `#${[rgb.r, rgb.g, rgb.b]
      .map((value) => value.toString(16).padStart(2, '0').toUpperCase())
      .join('')}`;
  }

  private formatHsbText(hsb: HSBColor): string {
    return `hsb(${hsb.h}, ${hsb.s}, ${hsb.b})`;
  }

  private formatRatioText(ratio: number): string {
    return `${Math.round(ratio * 100)}%`;
  }

  private buildPaletteSwatch(rgb: RGBColor, ratio?: number, hsbOverride?: HSBColor): PaletteSwatch {
    const hsb = hsbOverride ?? this.convertRgbToHsb(rgb);
    const swatch: PaletteSwatch = {
      rgb,
      hsb,
      hexText: this.formatHexText(rgb),
      rgbText: this.formatRgbText(rgb),
      hsbText: this.formatHsbText(hsb),
    };

    if (typeof ratio === 'number') {
      swatch.ratio = ratio;
      swatch.ratioText = this.formatRatioText(ratio);
    }

    return swatch;
  }

  private buildPaletteEntry(rgb: RGBColor, ratio: number): PaletteEntry {
    const original = this.buildPaletteSwatch(rgb, ratio);
    const cardHsb: HSBColor = {
      h: original.hsb.h,
      s: 70,
      b: 22,
    };
    const bodyHsb: HSBColor = {
      h: cardHsb.h,
      s: cardHsb.s,
      b: Math.round(cardHsb.b * 0.6),
    };

    return {
      original,
      card: this.buildPaletteSwatch(this.convertHsbToRgb(cardHsb), undefined, cardHsb),
      body: this.buildPaletteSwatch(this.convertHsbToRgb(bodyHsb), undefined, bodyHsb),
    };
  }

  private createColorKey(rgb: RGBColor): string {
    return `${rgb.r},${rgb.g},${rgb.b}`;
  }

  private findNearestPaletteColor(pixel: number[], palette: RGBColor[]): RGBColor | undefined {
    let nearestColor: RGBColor | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const color of palette) {
      const distance =
        ((pixel[0] ?? 0) - color.r) ** 2 +
        ((pixel[1] ?? 0) - color.g) ** 2 +
        ((pixel[2] ?? 0) - color.b) ** 2;

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestColor = color;
      }
    }

    return nearestColor;
  }

  private countPaletteRatios(palette: RGBColor[], pixels: number[][]): Map<string, number> {
    const pixelCounts = new Map<string, number>();

    for (const color of palette) {
      pixelCounts.set(this.createColorKey(color), 0);
    }

    for (const pixel of pixels) {
      const nearestColor = this.findNearestPaletteColor(pixel, palette);

      if (!nearestColor) {
        continue;
      }

      const key = this.createColorKey(nearestColor);
      pixelCounts.set(key, (pixelCounts.get(key) ?? 0) + 1);
    }

    const totalPixels = pixels.length;
    const ratios = new Map<string, number>();

    for (const color of palette) {
      const key = this.createColorKey(color);
      const count = pixelCounts.get(key) ?? 0;
      ratios.set(key, totalPixels === 0 ? 0 : count / totalPixels);
    }

    return ratios;
  }

  private sortPaletteEntriesByRatio(entries: PaletteEntry[]): PaletteEntry[] {
    return entries
      .map((entry, index) => ({ entry, index }))
      .sort((left, right) => {
        const leftRatio = left.entry.original.ratio ?? 0;
        const rightRatio = right.entry.original.ratio ?? 0;

        if (rightRatio !== leftRatio) {
          return rightRatio - leftRatio;
        }

        return left.index - right.index;
      })
      .map(({ entry }) => entry);
  }

  getPaletteEntries(img: HTMLImageElement, colorCount = 5, quality = 10): PaletteEntry[] {
    const colorThiefSetting: ColorThiefSetting = {
      colorCount,
      quality,
    };
    const options = this.validateOptions(colorThiefSetting);

    this.initCanvasImage(img);
    const imgData = this.getCanvasImageData();
    const pixelCount = this.width * this.height;
    const pixelArray = this.createPixelArray(imgData, pixelCount, options.quality);
    const cMap = quantize(pixelArray, options.colorCount);
    const palette = cMap ? (cMap.palette() as number[][]) : [];
    const paletteColors = palette.map(([r, g, b]) => ({ r, g, b }));
    const ratios = this.countPaletteRatios(paletteColors, pixelArray);
    const entries = paletteColors.map((color) =>
      this.buildPaletteEntry(color, ratios.get(this.createColorKey(color)) ?? 0)
    );

    return this.sortPaletteEntriesByRatio(entries);
  }

  getPalette(img: HTMLImageElement, colorCount = 5, quality = 10): number[][] {

    const colorThiefSetting: ColorThiefSetting = {
      colorCount: colorCount,
      quality: quality,
    };

    const options = this.validateOptions(colorThiefSetting);

    this.initCanvasImage(img);
    const imgData = this.getCanvasImageData();
    const pixelCount = this.width * this.height;
    const pixelArray = this.createPixelArray(imgData, pixelCount, options.quality);
    const cMap = quantize(pixelArray, options.colorCount);
    const palette = cMap ? cMap.palette() as number[][] : [];

    return palette;
  }

  getPaletteFromUrl(imageUrl: string, count = 5, quality = 10): Observable<number[][]> {
    return new Observable(
      observer => {
        const img = new Image();
        img.src = imageUrl;
        img.crossOrigin = "anonymous";

        img.onload = () => observer.next(this.getPalette(img, count, quality));
        img.onerror = () => observer.error();
      }
    );
  }

  RGBToHSL(r: number , g: number, b: number, amt: number): HSLColor {
    r /= 255;
    g /= 255;
    b /= 255;

    const cmin = Math.min(r,g,b)
    const cmax = Math.max(r,g,b)
    const delta = cmax - cmin
    const hsl = {h:0,s:0,l:0}
    let h = 0
    let s = 0
    let l = 0;

    // 開始計算 H
    if (delta == 0) {
        h = 0;
    }else if (cmax == r) {
        h = ((g - b) / delta) % 6;
    }else if (cmax == g) {
        h = (b - r) / delta + 2;
    }else {
        h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);
    // Make negative hues positive behind 360°
    if (h < 0) {
        h += 360;
    }

    // 開始計算 L S
    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    let lamt = l+amt;

    if(lamt>100) {
        lamt = 100;
    }

    hsl.h = h;
    hsl.s = s;
    hsl.l = lamt;

    return hsl;
  }

  HSLToRGB(h: number, s: number, l: number): number[] {
    s /= 100;
    l /= 100;

    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [ Math.floor(255 * f(0)) , Math.floor(255 * f(8)), Math.floor(255 * f(4))];
  }
  //------ Improve saturation and lightness ------//
  improveHSL(HSL: HSLColor) {
    // saturation >= 80
    if (HSL.s < 85) {
        HSL.s = 85;
    }

    // lightness between 50 to 60
    if (HSL.l < 50) {
        HSL.l = 50;
    }

    if (HSL.l > 60) {
        HSL.l = 60;
    }
  }

  //------ HSL Brightness ------//
  changeBrightness(rgbArr: number[], degree: number, mode: string): HSLColor {
    let colorHSL = this.RGBToHSL(rgbArr[0], rgbArr[1], rgbArr[2], 1);
    let result = colorHSL.l;
    const hsl = {h:0,s:0,l:0};
    let val;

    switch (mode) {
      case this.MODE.LIGHT:
        val = Math.abs(colorHSL.l - 100) / 10 * degree
        result = colorHSL.l += val
        break;
      case this.MODE.DARK:
        val = Math.abs(colorHSL.l - 0) / 10 * degree
        result = colorHSL.l -= val
        break;
    }
    colorHSL = Object.assign(colorHSL, {
      l: result,
    });

    hsl.h = colorHSL.h;
    hsl.s = colorHSL.s;
    hsl.l = result;

    return hsl;
  }

  //------ HSL Hue ------//
  changeHue(rgbArr: number[], degree: number) {
    let colorHSL = this.RGBToHSL(rgbArr[0], rgbArr[1], rgbArr[2], 1);
    const hsl = {h:0,s:0,l:0};

    const result = (colorHSL.h + degree) % 360;

    colorHSL = Object.assign(colorHSL, {
      h: result,
    });

    hsl.h = colorHSL.h;
    hsl.s = colorHSL.s;
    hsl.l = colorHSL.l;

    return hsl;
  }


}
