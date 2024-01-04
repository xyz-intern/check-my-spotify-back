import { ApiProperty } from "@nestjs/swagger";
import { Token } from "src/user/entities/token.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Artist } from "./artist.entity";

@Entity()
export class Playlist {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    songId: number;

    @Column()
    @ApiProperty()
    albumImage: string;
    
    @ManyToOne(type => Token, token => token.playlist, { nullable: false })
    @JoinColumn({ name: "userId" })
    @ApiProperty()
    token: Token;

    @Column()
    @ApiProperty()
    songName: string;

    @OneToMany(() => Artist, artist => artist.playlist)
    artist: Artist;

    @Column()
    count: number;
}