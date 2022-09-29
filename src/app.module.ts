import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HubspotModule } from './modules/hubspot/hubspot.module';
import { SpreadsheetsModule } from './modules/spreadsheets/spreadsheets.module';

@Module({
  imports: [ConfigModule.forRoot(), SpreadsheetsModule, HubspotModule],
})
export class AppModule {}
