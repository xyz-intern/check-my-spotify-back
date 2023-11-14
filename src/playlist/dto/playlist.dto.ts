import { Token } from "src/user/entities/token.entity";
export class PlaylistDto {
    songId: number;
    artistName: string;
    songName: string;
    imageUri: string;
    albumName: string;
    deviceId: string;
    count: number;
    token: Token;
}