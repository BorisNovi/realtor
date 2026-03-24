import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { debounceTime, map, Subject } from 'rxjs';

@Component({
  selector: 'rx-search-input',
  imports: [FormsModule, InputGroupModule, InputGroupAddonModule, InputTextModule],
  templateUrl: './search-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class SearchInputComponent {
  readonly placeholder = input('');
  readonly searchChange = output<string>();

  protected value = '';

  private readonly input$ = new Subject<string>();

  constructor() {
    this.input$
      .pipe(
        debounceTime(500),
        map(q => q.trim()),
        takeUntilDestroyed(),
      )
      .subscribe(q => this.searchChange.emit(q));
  }

  protected onInput(value: string): void {
    this.input$.next(value);
  }
}
