import { Directive, ElementRef, OnChanges, SimpleChanges, AfterViewInit, input, inject } from '@angular/core';

@Directive({
  selector: '[appScrollToTopOnShow]',
})
export class ScrollToTopOnShowDirective implements OnChanges, AfterViewInit {
  readonly isVisible = input(false, { alias: 'appScrollToTopOnShow' });
  readonly scrollOffset = input<number>(0);

  readonly el = inject(ElementRef<HTMLElement>);

  ngAfterViewInit(): void {
    if (this.isVisible()) {
      this.scrollIntoView();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && changes['isVisible'].currentValue) {
      this.scrollIntoView();
    }
  }

  private scrollIntoView(): void {
    const nativeEl = this.el.nativeElement;
    const scrollParent = this.getScrollParent(nativeEl);
    if (scrollParent) {
      const elTop = nativeEl.getBoundingClientRect().top;
      const parentTop = scrollParent.getBoundingClientRect().top;
      const scrollOffset = elTop - parentTop - this.scrollOffset();
      scrollParent.scrollBy({ top: scrollOffset, behavior: 'smooth' });
    } else {
      nativeEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private getScrollParent(element: HTMLElement): HTMLElement | null {
    let parent: HTMLElement | null = element.parentElement;
    while (parent) {
      const overflowY = window.getComputedStyle(parent).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }
}
