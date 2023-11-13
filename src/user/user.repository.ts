// import { Repository, createQueryBuilder } from "typeorm";
import { Repository, SelectQueryBuilder, EntityTarget, createQueryBuilder } from "typeorm";

import { Token } from "./entities/token.entity";
import { CustomRepository } from "./custom.repository";
@CustomRepository(Token)
export class TokenRepository extends Repository<Token> {
    async findByUserId(userId: string): Promise<Token | undefined> {
        return await this.createQueryBuilder("token")
          .where("token.userId = :userId", { userId })
          .getOne();
      }
}
