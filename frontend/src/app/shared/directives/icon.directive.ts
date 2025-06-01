import { Directive, ElementRef, Renderer2, effect, inject, input } from '@angular/core';

@Directive({
  selector: '[appIcon]',
})
export class IconDirective {
  readonly appIcon = input.required<string>();

  readonly #el: ElementRef = inject(ElementRef);
  readonly #renderer: Renderer2 = inject(Renderer2);

  constructor() {
    effect(() => {
      const icon = this.appIcon();
      if (icon) {
        this.#clearHostElement();
        this.#createIcon(icon);
      }
    });
  }

  #createIcon(iconName: string): void {
    const img = this.#renderer.createElement('img');
    this.#renderer.setAttribute(img, 'src', `/assets/icons/${iconName}.svg`);
    this.#renderer.addClass(img, 'icon');
    this.#renderer.appendChild(this.#el.nativeElement, img);
  }

  #clearHostElement(): void {
    const element = this.#el.nativeElement;
    const firstChild = element.firstChild;
    if (firstChild) {
      this.#renderer.removeChild(element, firstChild);
    }
  }
}
