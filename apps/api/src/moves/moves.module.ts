import { Module } from "@nestjs/common";
import { MovesController } from "./moves.controller";
import { MovesService } from "./moves.service";

@Module({
    providers: [MovesService],
    controllers: [MovesController],
})
export class MovesModule {}
