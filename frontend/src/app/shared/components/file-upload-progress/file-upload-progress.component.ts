import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ProgressBarModule } from 'primeng/progressbar';

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

@Component({
  selector: 'rx-file-upload-progress',
  imports: [ProgressBarModule, TranslatePipe],
  templateUrl: './file-upload-progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadProgressComponent {
  readonly progress = input<number>(0);
  readonly status = input<UploadStatus>('idle');
  readonly label = input<string>('');
}
