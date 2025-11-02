import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Store } from '@ngxs/store';
import { SLIDE } from '@shared/animations';
import { MapComponent } from '@shared/components';
import { MapMarkerComponent } from '@shared/components/map/map-marker.component';
import { CURRENCY_SYMBOLS } from '@shared/constants';
import { Currency } from '@shared/enums';
import { ICatalogItem, IPropertyObject } from '@shared/interfaces';
import { getPropertyStatusColor, getPropertyStatusSeverity } from '@shared/utils/property-status-severity.util';
import { LngLatBoundsLike } from 'maplibre-gl';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';
import { DrawerModule } from 'primeng/drawer';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { GalleriaModule } from 'primeng/galleria';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { tap } from 'rxjs';
import { CatalogState, DeletePropertyObjects, DeletionConfirmationService, FetchPropertyObject } from 'src/app/core';
import { CatalogFiltersService } from '../../catalog-filters.service';
import { CreateCatalogItemComponent } from '../create-catalog-item/create-catalog-item.component';
import { CamelToUpperSnakePipe, WorldPhoneMaskPipe } from '@shared/pipes';

@Component({
  selector: 'rx-catalog-map',
  imports: [
    MapComponent,
    MapMarkerComponent,
    FormsModule,
    ButtonModule,
    TranslatePipe,
    DrawerModule,
    GalleriaModule,
    ConfirmDialog,
    TagModule,
    DividerModule,
    ProgressBarModule,
    CamelToUpperSnakePipe,
    WorldPhoneMaskPipe,
  ],
  providers: [DialogService],
  templateUrl: './catalog-map.component.html',
  styles: `
    ::ng-deep {
      p-galleria .p-galleria {
        border-color: transparent !important;
        border-radius: 0;
      }
    }
    .card {
      margin-bottom: 1rem;
    }
  `,
  animations: [SLIDE],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogMapComponent {
  readonly mapComponent = viewChild(MapComponent);

  readonly #store = inject(Store);
  readonly #destroyRef = inject(DestroyRef);
  readonly filtersService = inject(CatalogFiltersService);
  readonly #translateService = inject(TranslateService);
  readonly #deletionConfirmationService = inject(DeletionConfirmationService);
  readonly #dialogService = inject(DialogService);

  readonly tableDataS = this.#store.selectSignal(CatalogState.catalog);
  readonly getStatusColor = getPropertyStatusColor;
  readonly selectedItem = signal<ICatalogItem | null>(null);
  readonly drawerOpen = signal(false);

  readonly detailedCache = signal<Record<number, IPropertyObject | null>>({});
  readonly detailedSelected = signal<IPropertyObject | null>(null);

  readonly getSeverity = getPropertyStatusSeverity;
  getCurrencySymbol(key: string): string {
    return CURRENCY_SYMBOLS[key as Currency];
  }

  #ref!: DynamicDialogRef | null;

  // TODO: Помтом убрать. Сделанно временно, пока с бэка не возвращаются фото в { image: string; thumbnail: string; }[]
  readonly imagesTemp = computed(() => this.selectedItem()?.photos.map(p => ({ image: p, thumbnail: p })));

  readonly fitBounds = computed<LngLatBoundsLike | undefined>(() => {
    const positions = this.tableDataS()
      .items.map(i => i.address?.position)
      .filter((pos): pos is [number, number] => Array.isArray(pos) && pos.length === 2);

    if (positions.length === 0) return;

    const lons = positions.map(p => p[0]);
    const lats = positions.map(p => p[1]);

    const minLng = Math.min(...lons);
    const maxLng = Math.max(...lons);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);

    return [
      [minLng, minLat],
      [maxLng, maxLat],
    ];
  });

  readonly optionsArray = computed(() => {
    const options = this.detailedSelected()?.specifics?.options;
    if (!options) return [];

    return Object.entries(options)
      .map(([category, values]) => ({
        category,
        values: Object.entries(values as Record<string, boolean>).filter(opt => opt[1]),
      }))
      .filter(group => group.values.length > 0);
  });

  showAll() {
    const map = this.mapComponent()?.map;
    const bounds = this.fitBounds();
    if (bounds && map) map.fitBounds(bounds, { maxZoom: 17, padding: 100 });
  }

  onMarkerClick(item: ICatalogItem): void {
    this.selectedItem.set(item);
    this.drawerOpen.set(true);
    if (item.id) this.loadDetailedItem(item.id);
  }

  deleteItem(id: number): void {
    this.#deletionConfirmationService.confirm(() => {
      this.#store.dispatch(new DeletePropertyObjects([id]));
    });
  }

  edit(id: number): void {
    this.#store
      .dispatch(new FetchPropertyObject(id))
      .pipe(
        tap(() => {
          const propertyData = this.#store.selectSnapshot(CatalogState.propertyObject);
          if (propertyData) {
            this.openEditDialog(propertyData);
          }
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }

  openEditDialog(item: ICatalogItem): void {
    this.#ref = this.#dialogService.open(CreateCatalogItemComponent, {
      data: item,
      header: this.#translateService.instant('CATALOG.TABLE.DIALOG.EDIT'),
      width: '50vw',
      modal: true,
      closable: true,
      contentStyle: { overflow: 'auto' },
      focusOnShow: false,
      breakpoints: {
        '960px': '75vw',
        '768px': '90vw',
        '640px': '95vw',
      },
    });
  }

  private loadDetailedItem(id: number) {
    this.detailedSelected.set(null);

    const cache = this.detailedCache();
    if (cache[id]) {
      this.detailedSelected.set(cache[id]);
      return;
    }

    this.#store
      .dispatch(new FetchPropertyObject(id))
      .pipe(
        tap(() => {
          const propertyData = this.#store.selectSnapshot(CatalogState.propertyObject);
          if (propertyData) {
            this.detailedCache.set({ ...this.detailedCache(), [id]: propertyData });
            this.detailedSelected.set(propertyData);
          }
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe();
  }
}
