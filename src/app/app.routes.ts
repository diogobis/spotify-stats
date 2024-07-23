import { Routes } from '@angular/router';
import { SpotifyCallbackComponent } from './components/spotify-callback/spotify-callback.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'spotify/callback', component: SpotifyCallbackComponent },
];
