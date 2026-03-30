import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import type { PaletteEntry } from './service/images-color-thief.model';

describe('AppComponent', () => {
  it('renders original, card, and body rows with ratio and hsb text', () => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
    });

    const fixture = TestBed.createComponent(AppComponent);
    const component = fixture.componentInstance;

    component.palette = [createPaletteEntry()] as never;
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent.replace(/\s+/g, ' ');

    expect(text).toContain('original');
    expect(text).toContain('ratio 42%');
    expect(text).toContain('rgb(12, 34, 56)');
    expect(text).toContain('hsb(210, 79, 22)');
    expect(text).toContain('card');
    expect(text).toContain('hsb(210, 70, 22)');
    expect(text).toContain('body');
    expect(text).toContain('hsb(210, 70, 13)');
  });
});

function createPaletteEntry(): PaletteEntry {
  return {
    original: {
      rgb: { r: 12, g: 34, b: 56 },
      hsb: { h: 210, s: 79, b: 22 },
      rgbText: 'rgb(12, 34, 56)',
      hsbText: 'hsb(210, 79, 22)',
      ratio: 0.42,
      ratioText: '42%',
    },
    card: {
      rgb: { r: 17, g: 36, b: 56 },
      hsb: { h: 210, s: 70, b: 22 },
      rgbText: 'rgb(17, 36, 56)',
      hsbText: 'hsb(210, 70, 22)',
    },
    body: {
      rgb: { r: 10, g: 22, b: 33 },
      hsb: { h: 210, s: 70, b: 13 },
      rgbText: 'rgb(10, 22, 33)',
      hsbText: 'hsb(210, 70, 13)',
    },
  };
}
