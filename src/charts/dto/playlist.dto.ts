import { ApiProperty } from "@nestjs/swagger";
import { Token } from "src/user/entities/token.entity";
export class PlaylistDto {
    songId: number;
    artistName: string;
    songName: string;
    albumImage: string;
    albumName: string;
    deviceId: string;
    artistImage: string;
    count: number;
    token: Token;
}