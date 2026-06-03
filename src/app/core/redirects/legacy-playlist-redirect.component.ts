import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APP_ROUTES } from '../constants/app-routes.constants';

/** Redirige rutas antiguas `/playlist/:id` a playlists con query `?playlist=id`. */
@Component({
  selector: 'app-legacy-playlist-redirect',
  standalone: true,
  template: '',
})
export class LegacyPlaylistRedirectComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.router.navigate([APP_ROUTES.playlists], {
        queryParams: { playlist: id },
        replaceUrl: true,
      });
      return;
    }

    this.router.navigateByUrl(APP_ROUTES.playlists, { replaceUrl: true });
  }
}
