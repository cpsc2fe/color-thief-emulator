import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImagesColorThiefService } from './service/images-color-thief.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  @ViewChild('imagePreview') imagePreview!: ElementRef<HTMLImageElement>;

  imageUrl: string | null = null;
  palette: number[][] = [];
  colorCount = 5;
  quality = 10;
  isLoading = false;

  constructor(private colorThiefService: ImagesColorThiefService) {}

  get isColorCountValid(): boolean {
    return !isNaN(this.colorCount) && this.colorCount >= 2 && this.colorCount <= 20;
  }

  get isQualityValid(): boolean {
    return !isNaN(this.quality) && this.quality >= 1;
  }

  get isParamsValid(): boolean {
    return this.isColorCountValid && this.isQualityValid;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        this.imageUrl = e.target?.result as string;
        this.palette = [];
      };

      reader.readAsDataURL(file);
    }
  }

  extractColors(): void {
    if (!this.imagePreview?.nativeElement || !this.isParamsValid) return;

    this.isLoading = true;

    setTimeout(() => {
      try {
        this.palette = this.colorThiefService.getPalette(
          this.imagePreview.nativeElement,
          this.colorCount,
          this.quality
        );
      } catch (error) {
        console.error('Error extracting colors:', error);
      } finally {
        this.isLoading = false;
      }
    }, 100);
  }

  rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  rgbToString(color: number[]): string {
    return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
