import { ApiProperty } from "@nestjs/swagger";
import { Token } from "src/user/entities/token.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Playlist {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    songId: number;

    @Column()
    @ApiProperty()
    artistName: string;

    @Column()
    @ApiProperty()
    songName: string;

    @Column()
    @ApiProperty()
    albumImage: string;

    @Column()
    @ApiProperty()
    albumName: string;

    @Column()
    @ApiProperty()
    deviceId: string;

    @Column()
    @ApiProperty()
    count: number;

    @Column()
    @ApiProperty()
    artistImage: string;

    @ManyToOne(type => Token, token => token.playlist, {nullable: false})
    @JoinColumn({ name: "userId" })
    @ApiProperty()
    token: Token;   
}