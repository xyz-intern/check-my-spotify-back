const BASE_URL = "https://api.spotify.com/v1/"
export const URL = {
    GET_CURRENT_PLAYING: `${BASE_URL}me/player/currently-playing`,
    GET_DEVICE_ID: `${BASE_URL}me/player/devices`,
    PLAYLIST_SET_PLAY: `${BASE_URL}me/player/play`,
    PLAYLIST_SET_STOP: `${BASE_URL}me/player/pause`,
    PLAYLIST_SET_PRE: `${BASE_URL}me/player/previous`,
    PLAYLIST_SET_NEXT: `${BASE_URL}me/player/next`,
    GET_SPOTIFY_CHART: `https://charts-spotify-com-service.spotify.com/public/v0/charts`,
    SET_PLAYBACK_VOLUME: `${BASE_URL}me/player/volume?volume_percent=`,
    GET_PLAYBACK_STATE: `${BASE_URL}me/player`,
    GET_TOKEN: `https://accounts.spotify.com/api/token`,
    GET_USER_PROFILE: `${BASE_URL}me`,
    GET_ARTIST_IMAGE: `${BASE_URL}artists/`,
    TRANSFER_PLAYBACK: `${BASE_URL}me/player`,
}