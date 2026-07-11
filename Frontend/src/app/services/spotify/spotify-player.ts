import { Injectable, signal } from '@angular/core';
import { UserService } from '../user.service';

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

@Injectable({ providedIn: 'root' })
export class SpotifyPlayerService {
  player: any = null;
  deviceId = signal<string | null>(null);
  isReady = signal(false);
  isPlaying = signal(false);

  constructor(private userService: UserService) {}

  async init() {
    if (this.player) return;

    const token = await this.getToken();
    if (!token) return;

    this.player = new window.Spotify.Player({
      name: 'R3 Love Player',
      getOAuthToken: (cb: (token: string) => void) => cb(token),
      volume: 0.5,
    });

    this.player.addListener('ready', ({ device_id }: any) => {
      this.deviceId.set(device_id);
      this.isReady.set(true);
    });

    this.player.addListener('player_state_changed', (state: any) => {
      this.isPlaying.set(!state?.paused);
    });

    await this.player.connect();
  }

  private async getToken(): Promise<string | null> {
    return new Promise((resolve) => {
      this.userService.getSpotifyAccessToken().subscribe((token) => {
        resolve(token);
      });
    });
  }

  async play(trackUri: string) {
    const deviceId = this.deviceId();
    const token = await this.getToken();
    if (!deviceId || !token) return;

    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uris: [trackUri] }),
    });
  }

  async togglePlayback() {
    await this.player.togglePlay();
  }
}
