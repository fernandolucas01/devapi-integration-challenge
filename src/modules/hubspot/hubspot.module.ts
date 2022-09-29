import { Module } from '@nestjs/common';
import { HubspotService } from './hubspot.service';
import { HubspotController } from './hubspot.controller';
import { SpreadsheetsModule } from '../spreadsheets/spreadsheets.module';
import { SpreadsheetsService } from '../spreadsheets/spreadsheets.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, SpreadsheetsModule],
  controllers: [HubspotController],
  providers: [HubspotService, SpreadsheetsService],
})
export class HubspotModule {}
