import { HttpEvent, HttpEventType, HttpResponse, HttpUploadProgressEvent } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { AuthState } from '../auth';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  readonly #store = inject(Store);

  // HttpClient с withFetch() не поддерживает reportProgress - используется XHR напрямую.
  // Токен читается синхронно из стора, чтобы не терять auth.
  upload(files: File[]): Observable<HttpEvent<string[]>> {
    return new Observable(observer => {
      const token = this.#store.selectSnapshot(AuthState.accessToken);
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`file${index}`, file, file.name);
      });

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${environment.apiUrl}/file`);
      if (token)
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.addEventListener('progress', event => {
        if (event.lengthComputable) {
          const progress: HttpUploadProgressEvent = {
            type: HttpEventType.UploadProgress,
            loaded: event.loaded,
            total: event.total,
          };
          observer.next(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          observer.next(new HttpResponse<string[]>({ body: JSON.parse(xhr.responseText), status: xhr.status }));
          observer.complete();
        }
        else
          observer.error(new Error(`HTTP ${xhr.status}`));
      });

      xhr.addEventListener('error', () => observer.error(new Error('Upload failed')));
      xhr.addEventListener('abort', () => observer.complete());

      xhr.send(formData);

      return () => xhr.abort();
    });
  }
}
