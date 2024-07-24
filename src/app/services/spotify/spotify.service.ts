import { Injectable } from '@angular/core';
import axios from 'axios';
import { Buffer } from 'buffer';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private clientID: string = environment.spotify.client_id;
  private clientSecret: string = environment.spotify.client_secret;
  private credentials: any = {};

  constructor() {
    this.checkCredentials();
  }

  private async checkCredentials() {
    let credentials = JSON.parse(localStorage.getItem('auth') as string);
    if (credentials === null) console.log('NO CREDENTIALS');

    if (credentials !== null) {
      await this.verifyExpiration();
    }
  }

  private async verifyExpiration() {
    let credentials = JSON.parse(localStorage.getItem('auth') as string);

    // CHECK IF EXPIRED
    console.log('CHECKING CREDENTIALS EXPIRATION');
    let d = new Date();
    this.credentials = credentials;

    console.log(
      Math.floor(
        (credentials.expires_in * 1000 -
          (d.valueOf() - new Date(credentials.date).valueOf())) /
          60000
      ) + ' MINUTES REMAINING'
    );

    if (
      d.valueOf() - new Date(credentials.date).valueOf() >=
      credentials.expires_in * 1000
    ) {
      await this.refreshToken();
    }
  }

  private async refreshToken() {
    console.log('REFRESHING TOKEN');
    this.credentials = JSON.parse(localStorage.getItem('auth') as string);

    let response = await axios.post(
      'https://accounts.spotify.com/api/token',
      {
        grant_type: 'refresh_token',
        refresh_token: this.credentials.refresh_token,
        client_id: this.credentials.access_token,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization:
            'Basic ' +
            Buffer.from(this.clientID + ':' + this.clientSecret).toString(
              'base64'
            ),
        },
      }
    );

    this.credentials.access_token = response.data.access_token;
    this.credentials.date = new Date();

    localStorage.setItem('auth', JSON.stringify(this.credentials));
  }

  public async get(
    type: 'artists' | 'tracks',
    time_range: 'short_term' | 'medium_term' | 'long_term',
    limit: number = 10,
    offset: number = 0
  ) {
    await this.verifyExpiration();

    let response = await axios.get(
      'https://api.spotify.com/v1/me/top/' + type,
      {
        params: {
          time_range,
          limit,
          offset,
        },
        headers: { Authorization: 'Bearer  ' + this.credentials.access_token },
      }
    );

    return response;
  }
}
