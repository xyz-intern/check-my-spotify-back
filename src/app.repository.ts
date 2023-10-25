import { Repository } from "typeorm";
import { Token } from "./apis/entities/token.entity";
import { CustomRepository } from "./custom.repository";

@CustomRepository(Token)
export class TokenRepository extends Repository<Token> {

}
