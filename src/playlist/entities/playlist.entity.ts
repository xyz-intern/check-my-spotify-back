import { Token } from "src/user/entities/token.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Playlist {
    @PrimaryGeneratedColumn()
    songId: number;

    @Column()
    artistName: string;

    @Column()
    songName: string;

    @Column()
    imageUri: string;

    @Column()
    albumName: string;

    @Column()
    deviceId: string;

    @Column()
    count: number;

    @ManyToOne(type => Token, token => token.playlist, {nullable: false})
    @JoinColumn({ name: "userId" })
    token: Token;   
}