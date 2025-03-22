import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TagModule } from 'primeng/tag';
import { PropertyType, PropertyStatus } from '@shared/enums';
import { getPropertyStatusSeverity } from '@shared/utils';

@Component({
  imports: [FileUploadModule, InputTextModule, ButtonModule, AutoCompleteModule, TagModule],
  templateUrl: './create-catalog-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateCatalogItemComponent {
  private readonly ref = inject(DynamicDialogRef);

  public readonly getSeverity = getPropertyStatusSeverity;

  propertyTypeSuggestions: { label: string; value: PropertyType }[] = [];
  statusSuggestions: { label: string; value: PropertyStatus }[] = [];

  private propertyTypes = [
    { label: 'Flat', value: PropertyType.flat },
    { label: 'House', value: PropertyType.house },
    { label: 'Room', value: PropertyType.room },
  ];

  private statuses = [
    { label: 'Available', value: PropertyStatus.available },
    { label: 'Reserved', value: PropertyStatus.reserved },
    { label: 'Rented', value: PropertyStatus.rented },
  ];

  filterPropertyTypes(event: any) {
    const query = event.query.toLowerCase();
    this.propertyTypeSuggestions = this.propertyTypes.filter(type => type.label.toLowerCase().includes(query));
  }

  filterStatuses(event: any) {
    const query = event.query.toLowerCase();
    this.statusSuggestions = this.statuses.filter(status => status.label.toLowerCase().includes(query));
  }

  onSubmit() {
    console.log('Form submitted');
    this.ref.close();
  }

  onCancel() {
    this.ref.close();
  }
}
