import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideCalendar, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { provideHttpClient } from '@angular/common/http';
import { Apollo, APOLLO_OPTIONS, provideApollo } from 'apollo-angular';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../enviroments/enviroment';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';

export function createApollo(httpLink: HttpLink): ApolloClientOptions {
  return {
    link: httpLink.create({
      uri: environment.graphqlUri,
    }),
    cache: new InMemoryCache(),
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    { provide: APOLLO_OPTIONS, useFactory: createApollo, deps: [HttpLink] },
    Apollo,
    ...provideCalendar({ provide: DateAdapter, useFactory: adapterFactory }),
    provideAnimations(),
    provideToastr(),
  ],
};
