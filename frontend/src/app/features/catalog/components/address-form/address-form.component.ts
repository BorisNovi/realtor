import { ChangeDetectionStrategy, Component, input, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { InputWrapperComponent } from '@shared/components';
import { IAddress } from '@shared/interfaces';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'rx-address-form',
  imports: [InputWrapperComponent, InputTextModule, TranslatePipe, ReactiveFormsModule],
  templateUrl: './address-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent implements OnInit {
  readonly value = input<IAddress>();
  readonly form = input.required<FormGroup>();
  ngOnInit(): void {
    const f = this.form();
    const v = this.value();
    f.addControl('city', new FormControl(v?.city || '', Validators.required));
    f.addControl('road', new FormControl(v?.road || '', Validators.required));
    f.addControl('houseNumber', new FormControl(v?.houseNumber || '', Validators.required));
    f.addControl('apartment', new FormControl(''));
    f.addControl('position', new FormControl(v?.position || [0, 0]));
  }
}
