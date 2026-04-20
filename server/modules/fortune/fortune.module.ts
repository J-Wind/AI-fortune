import { Module } from "@nestjs/common";
import { FortuneController } from "./fortune.controller";
import { FortuneService } from "./fortune.service";
import { FortuneTextController } from "./fortune-text.controller";
import { FortuneTextService } from "./fortune-text.service";
import { FortuneInterpretationController } from "./fortune-interpretation.controller";
import { FortuneInterpretationService } from "./fortune-interpretation.service";
import { FortuneShareController } from "./fortune-share.controller";
import { FortuneShareService } from "./fortune-share.service";

@Module({
  controllers: [FortuneController, FortuneTextController, FortuneInterpretationController, FortuneShareController],
  providers: [FortuneService, FortuneTextService, FortuneInterpretationService, FortuneShareService],
  exports: [FortuneService, FortuneTextService, FortuneInterpretationService, FortuneShareService]
})
export class FortuneModule {}