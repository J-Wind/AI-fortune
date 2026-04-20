import { Module } from "@nestjs/common";
import { FortuneController } from "./fortune.controller";
import { FortuneService } from "./fortune.service";
import { FortuneTextController } from "./fortune-text.controller";
import { FortuneTextService } from "./fortune-text.service";
import { FortuneInterpretationController } from "./fortune-interpretation.controller";
import { FortuneInterpretationService } from "./fortune-interpretation.service";

@Module({
  controllers: [FortuneController, FortuneTextController, FortuneInterpretationController],
  providers: [FortuneService, FortuneTextService, FortuneInterpretationService],
  exports: [FortuneService, FortuneTextService, FortuneInterpretationService]
})
export class FortuneModule {}