import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { withNgxsReduxDevtoolsPlugin } from '@ngxs/devtools-plugin';
import { withNgxsFormPlugin } from '@ngxs/form-plugin';
import { environment } from '../environments/environment';
import { withNgxsRouterPlugin } from '@ngxs/router-plugin';
import { withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { provideStore } from '@ngxs/store';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { authInterceptor, AuthState, CatalogState } from './core';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TransferStateLoader } from './shared/utils/translate-loader';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ContactsState } from './core/contacts/state/contacts.state';
import { ListingsState } from './core/listings/state';
import { ProfileState } from './core/profile/state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withEnabledBlockingInitialNavigation(),
    ),
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    importProvidersFrom(
      TranslateModule.forRoot({
        fallbackLang: 'en',
        loader: {
          provide: TranslateLoader,
          useClass: TransferStateLoader,
        },
      }),
    ),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
    MessageService,
    ConfirmationService,
    provideStore(
      [AuthState, ProfileState, CatalogState, ListingsState, ContactsState],
      ...(environment.production ? [] : [withNgxsReduxDevtoolsPlugin()]),
      withNgxsFormPlugin(),
      withNgxsRouterPlugin(),
      withNgxsStoragePlugin({
        keys: ['auth.accessToken', 'auth.refreshToken', 'auth.user'],
        afterDeserialize: (obj, key) => {
          if (key === 'auth.accessToken' && obj?.expires < Date.now()) {
            return null; // Очистка просроченного токена
          }
          return obj;
        },
      }),
    ),
  ],
};
