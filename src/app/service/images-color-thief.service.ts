import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ColorThiefSetting, HSLColor } from './images-color-thief.model';
import quantize from 'quantize';
import { DOCUMENT } from '@angular/common';

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
