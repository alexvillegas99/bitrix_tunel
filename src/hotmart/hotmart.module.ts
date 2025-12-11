import { Module } from '@nestjs/common';
import { HotmartController } from './hotmart.controller';
import { HotmartService } from './hotmart.service';
import { BitrixModule } from '../bitrix/bitrix.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [BitrixModule, DatabaseModule],
  controllers: [HotmartController],
  providers: [HotmartService],
  exports: [HotmartService],
})
export class HotmartModule {}

