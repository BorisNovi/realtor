import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageSelectService } from './core';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'rx-root',
  imports: [RouterOutlet, Toast],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor() {
    // Инициализирует язык из localStorage/браузера при старте, до любого лэйаута
    inject(LanguageSelectService);
  }
}
