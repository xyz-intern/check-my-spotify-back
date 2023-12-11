import { Repository, SelectQueryBuilder, EntityTarget, createQueryBuilder } from "typeorm";

import { Token } from "./entities/token.entity";
import { CustomRepository } from "./custom.repository";
@CustomRepository(Token)
export class TokenRepository extends Repository<Token> {
}