import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  readonly #http = inject(HttpClient);

  upload(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index}`, file, file.name);
    });

    return this.#http.post<string[]>(`${environment.apiUrl}/file`, formData);
  }
}
