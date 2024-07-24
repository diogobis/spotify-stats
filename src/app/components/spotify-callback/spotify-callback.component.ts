import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { Buffer } from 'buffer';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-spotify-callback',
  standalone: true,
  imports: [],
  templateUrl: './spotify-callback.component.html',
  styleUrl: './spotify-callback.component.css',
})
export class SpotifyCallbackComponent implements OnInit, OnDestroy {
  private sub: any;
  private clientID: string = environment.spotify.client_id;
  private clientSecret: string = environment.spotify.client_secret;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe((queryParams: any) => {
      var code = queryParams.code || null;
      var state = queryParams.state || null;

      if (state === null) {
        this.router.navigate(['/#?error=state_mismatch']);
      } else {
        // var authOptions = {
        //   url: 'https://accounts.spotify.com/api/token',
        //   form: {
        //     code: code,
        //     redirect_uri: 'http://localhost:4200/',
        //     grant_type: 'authorization_code',
        //   },
        //   headers: {
        //     'content-type': 'application/x-www-form-urlencoded',
        //     Authorization:
        //       'Basic ' +
        //       Buffer.from(this.clientID + ':' + this.clientSecret).toString(
        //         'base64'
        //       ),
        //   },
        //   json: true,
        // };

        axios
          .post(
            'https://accounts.spotify.com/api/token',
            {
              code: code,
              redirect_uri: 'http://localhost:4200/spotify/callback',
              grant_type: 'authorization_code',
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded  ',
                Authorization:
                  'Basic ' +
                  Buffer.from(this.clientID + ':' + this.clientSecret).toString(
                    'base64'
                  ),
              },
            }
          )
          .then((value) => {
            localStorage.setItem(
              'auth',
              JSON.stringify({ date: new Date(), ...value.data })
            );
            this.router.navigate(['']);
          });
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
