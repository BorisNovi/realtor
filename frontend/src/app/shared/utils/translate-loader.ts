import { HttpClient } from '@angular/common/http';
import { inject, makeStateKey, TransferState } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

export class TransferStateLoader implements TranslateLoader {
  private readonly http = inject(HttpClient);
  private readonly transferState = inject(TransferState);
  private readonly prefix = '/assets/i18n/';
  private readonly suffix = '.json';

  getTranslation(lang: string): Observable<TranslationObject> {
    const key = makeStateKey<TranslationObject>(`i18n.${lang}`);

    if (this.transferState.hasKey(key)) {
      const translations = this.transferState.get(key, {});
      this.transferState.remove(key);
      return of(translations);
    }

    return this.http
      .get<TranslationObject>(`${this.prefix}${lang}${this.suffix}`)
      .pipe(tap(t => this.transferState.set(key, t)));
  }
}
