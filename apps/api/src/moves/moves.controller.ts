import { Body, Controller, Param, Post } from "@nestjs/common";
import { GetUser } from "src/auth/decorator";
import { makeMove } from "./dto/makMove.dto";
import { MovesService } from "./moves.service";

@Controller("moves")
export class MovesController {
    constructor(private readonly movesService: MovesService) {}
    @Post(":gameId/addmove")
    addMove(
        @Param("gameId") gameId: number,
        @Body() move: makeMove,
        @GetUser() user,
    ) {
        const id: number = user.id;
        return this.movesService.makeMove(move, gameId, id);
    }
}
