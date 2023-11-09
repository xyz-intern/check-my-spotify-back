import { type } from "os";
import { Token } from "src/user/entities/token.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

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
    @Column()
    ref_userId: string;

    @ManyToOne(type => Token, token => token.playlist)
    @JoinColumn({name: "ref_userId"})
    token: Token
}