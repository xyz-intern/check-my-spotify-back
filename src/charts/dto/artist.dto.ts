import { ApiProperty } from "@nestjs/swagger";
import { Playlist } from "src/playlist/entities/playlist.entity";
import { Token } from "src/user/entities/token.entity";
import { Column, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
export class ArtistDto {
    artistName: string;
    count: number;
    artistId: any;
    playlist: Playlist;
}