import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImagesColorThiefService } from './service/images-color-thief.service';
import type { PaletteEntry } from './service/images-color-thief.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  protected readonly imagePreview = viewChild<ElementRef<HTMLImageElement>>('imagePreview');
  private readonly colorThiefService = inject(ImagesColorThiefService);

  imageUrl: string | null = null;
  palette: PaletteEntry[] = [];
  colorCount = 5;
  quality = 10;
  exactCount = true;
  isLoading = false;

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
    const imageElement = this.imagePreview()?.nativeElement;

    if (!imageElement || !this.isParamsValid) {
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      try {
        let result = this.colorThiefService.getPaletteEntries(
          imageElement,
          this.colorCount,
          this.quality
        );
        if (this.exactCount) {
          result = result.slice(0, this.colorCount);
        }
        this.palette = result;
      } catch (error) {
        console.error('Error extracting colors:', error);
      } finally {
        this.isLoading = false;
      }
    }, 100);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
  }
}
