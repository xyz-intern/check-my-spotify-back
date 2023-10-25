import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    userId: number;

    @Column()
    accessToken: string;

    @Column()
    refreshToken: string;

    @Column('boolean', {default: false})
    refreshToken_expiration: boolean;
}
