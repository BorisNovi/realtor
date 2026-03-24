import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImportExportService {
  readonly #http = inject(HttpClient);

  import(file: File, endpoint: string): Observable<HttpEvent<unknown>> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const req = new HttpRequest('POST', `${environment.apiUrl}/${endpoint}`, formData, {
      reportProgress: true,
    });

    return this.#http.request(req);
  }

  export(endpoint: string): Observable<Blob> {
    return this.#http.get(`${environment.apiUrl}/${endpoint}`, { responseType: 'blob' });
  }
}
