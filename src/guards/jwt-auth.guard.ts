import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { EStrategies } from "src/models/strategies";

@Injectable()
export class JwtAuthGuard extends AuthGuard(EStrategies.JWT) {}
