import { Token } from "src/user/entities/token.entity";
export class PlaylistDto {
    songId: number;
    songName: string; 
    albumImage: string;
    token: Token;
    count: number;
}