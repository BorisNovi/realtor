import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable()
export class TitleService extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  // TODO: расширить сервис тайтлов на все кейсы
  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.title.setTitle(this.buildTitle(snapshot) + ' - Urban CRM');
  }
}
