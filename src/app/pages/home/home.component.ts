import { Component, FactorySansProvider } from '@angular/core';
import { SpotifyService } from '../../services/spotify/spotify.service';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, FontAwesomeModule],
  providers: [DatePipe, DecimalPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  public time_range: 'short_term' | 'medium_term' | 'long_term' = 'short_term';
  public limit: number = 10;
  public type: 'artists' | 'tracks' = 'artists';

  public isLoggedIn: boolean = false;

  public faSpotify = faSpotify;

  public items: any = [];

  constructor(
    private spotifyService: SpotifyService,
    public datePipe: DatePipe,
    public decimalPipe: DecimalPipe
  ) {
    this.isLoggedIn =
      JSON.parse(localStorage.getItem('auth') as string) !== null;

    if (this.isLoggedIn) this.get();
  }

  get() {
    this.spotifyService
      .get(this.type, this.time_range, this.limit)
      .then((result) => {
        this.items = result.data.items;
      });
  }

  formatDuration(duration_ms: number) {
    let duration_s = Math.round(duration_ms / 1000);
    let duration_m = Math.floor(duration_s / 60);

    duration_s -= duration_m * 60;

    return `${duration_m}:${duration_s}`;
  }

  formatInfo(item: any) {
    let info = [];

    info.push(['popularity', item.popularity]);

    if (this.type == 'tracks') {
      info.push(['type', item.album.album_type.toLowerCase()]);

      if (item.album.album_type === 'ALBUM')
        info.push(['track', `${item.track_number}/${item.album.total_tracks}`]);

      info.push(['release', this.formatDate(item.album.release_date)]);
    } else {
      info.push(['followers', this.formatNumber(item.followers.total)]);
    }

    return info;
  }

  public formatDate(date: string) {
    return this.datePipe.transform(date, 'dd/MM/yyyy');
  }

  public formatNumber(number: string) {
    return this.decimalPipe.transform(number, '1.0');
  }

  public spotifyLogin() {
    const clientId = environment.spotify.client_id;
    const redirectUri = 'http://localhost:4200/spotify/callback';
    const scopes = 'user-top-read user-read-private user-read-email';

    const url = new URL('https://accounts.spotify.com/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', scopes);
    url.searchParams.set('state', this.generateState(16));
    window.open(url.toString(), 'spotifyLogin');
  }

  generateState(length: number) {
    let result = '';
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }

  stringToColour = (str: string) => {
    let hash = 0;
    str.split('').forEach((char) => {
      hash = char.charCodeAt(0) + ((hash << 5) - hash);
    });
    let colour = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      colour += value.toString(16).padStart(2, '0');
    }
    return colour;
  };
}
