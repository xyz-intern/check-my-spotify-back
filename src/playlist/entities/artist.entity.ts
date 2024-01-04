import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Playlist } from "./playlist.entity";

@Entity()
export class Artist {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id: number;


    @Column()
    artistId: string;

    @ManyToOne(type => Playlist, playlist => playlist.artist)
    @JoinColumn({ name: 'playlist' }) // Artist에서 Playlist의 기본 키를 참조
    playlist: Playlist;

    @Column()
    @ApiProperty()
    count: number;

    @Column()
    @ApiProperty()
    artistName: string;

}