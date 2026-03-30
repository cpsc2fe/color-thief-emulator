import { TestBed } from '@angular/core/testing';
import { ImagesColorThiefService } from './images-color-thief.service';
import { PaletteEntry, PaletteSwatch } from './images-color-thief.model';

describe('ImagesColorThief palette models', () => {
  let service: ImagesColorThiefService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImagesColorThiefService);
  });

  it('describes extraction results with original, card, and body swatches', () => {
    const original: PaletteSwatch = {
      rgb: { r: 12, g: 34, b: 56 },
      hsb: { h: 210, s: 79, b: 22 },
      rgbText: 'rgb(12, 34, 56)',
      hsbText: 'hsb(210, 79, 22)',
      ratio: 0.42,
      ratioText: '42%',
    };

    const entry: PaletteEntry = {
      original,
      card: {
        rgb: { r: 17, g: 26, b: 56 },
        hsb: { h: 226, s: 70, b: 22 },
        rgbText: 'rgb(17, 26, 56)',
        hsbText: 'hsb(226, 70, 22)',
      },
      body: {
        rgb: { r: 10, g: 16, b: 34 },
        hsb: { h: 226, s: 70, b: 13 },
        rgbText: 'rgb(10, 16, 34)',
        hsbText: 'hsb(226, 70, 13)',
      },
    };

    expect(entry.original.hsbText).toBe('hsb(210, 79, 22)');
    expect(entry.card.rgbText).toBe('rgb(17, 26, 56)');
    expect(entry.body.hsb.b).toBe(13);
    expect(entry.original.ratioText).toBe('42%');
  });

  it('converts rgb values to rounded integer hsb values', () => {
    expect(service['convertRgbToHsb']({ r: 12, g: 34, b: 56 })).toEqual({
      h: 210,
      s: 79,
      b: 22,
    });
  });

  it('builds original, card, and body swatches with lowercase display strings', () => {
    const entry = service['buildPaletteEntry']({ r: 12, g: 34, b: 56 }, 0.42);

    expect(entry.original.hsb).toEqual({ h: 210, s: 79, b: 22 });
    expect(entry.original.rgbText).toBe('rgb(12, 34, 56)');
    expect(entry.original.hsbText).toBe('hsb(210, 79, 22)');
    expect(entry.original.ratioText).toBe('42%');
    expect(entry.card.hsb).toEqual({ h: 210, s: 70, b: 22 });
    expect(entry.card.rgbText).toBe('rgb(17, 36, 56)');
    expect(entry.card.hsbText).toBe('hsb(210, 70, 22)');
    expect(entry.body.hsb).toEqual({ h: 210, s: 70, b: 13 });
    expect(entry.body.rgbText).toBe('rgb(10, 22, 33)');
    expect(entry.body.hsbText).toBe('hsb(210, 70, 13)');
  });

  it('sorts original colors by ratio in descending order', () => {
    const sorted = service['sortPaletteEntriesByRatio']([
      createPaletteEntryStub(11, 0.2),
      createPaletteEntryStub(22, 0.6),
      createPaletteEntryStub(33, 0.4),
    ]);

    expect(sorted.map((entry: PaletteEntry) => entry.original.rgb.r)).toEqual([22, 33, 11]);
  });

  it('keeps the original order when ratios are equal', () => {
    const sorted = service['sortPaletteEntriesByRatio']([
      createPaletteEntryStub(11, 0.5),
      createPaletteEntryStub(22, 0.5),
      createPaletteEntryStub(33, 0.2),
    ]);

    expect(sorted.map((entry: PaletteEntry) => entry.original.rgb.r)).toEqual([11, 22, 33]);
  });

  it('counts ratios by assigning sampled pixels to the nearest palette color', () => {
    const ratios = service['countPaletteRatios'](
      [
        { r: 205, g: 15, b: 15 },
        { r: 0, g: 0, b: 200 },
      ],
      [
        [200, 10, 10],
        [210, 20, 20],
        [0, 0, 200],
      ]
    );

    expect(ratios.get('205,15,15')).toBeCloseTo(2 / 3, 5);
    expect(ratios.get('0,0,200')).toBeCloseTo(1 / 3, 5);
  });
});

function createPaletteEntryStub(red: number, ratio: number): PaletteEntry {
  return {
    original: {
      rgb: { r: red, g: 0, b: 0 },
      hsb: { h: red, s: 50, b: 50 },
      rgbText: `rgb(${red}, 0, 0)`,
      hsbText: `hsb(${red}, 50, 50)`,
      ratio,
      ratioText: `${Math.round(ratio * 100)}%`,
    },
    card: {
      rgb: { r: red, g: 1, b: 1 },
      hsb: { h: red, s: 70, b: 22 },
      rgbText: `rgb(${red}, 1, 1)`,
      hsbText: `hsb(${red}, 70, 22)`,
    },
    body: {
      rgb: { r: red, g: 2, b: 2 },
      hsb: { h: red, s: 70, b: 13 },
      rgbText: `rgb(${red}, 2, 2)`,
      hsbText: `hsb(${red}, 70, 13)`,
    },
  };
}
