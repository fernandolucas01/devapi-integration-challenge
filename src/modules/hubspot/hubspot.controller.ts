import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { HubspotService } from './hubspot.service';

@Controller('hubspot')
export class HubspotController {
  constructor(private readonly hubspotService: HubspotService) {}

  @Put('integrate-spreadsheet')
  integrateSpreadsheet() {
    return this.hubspotService.integrateSpreadsheet();
  }

  @Get('contacts')
  findAllContacts() {
    return this.hubspotService.findAllContacts();
  }

  @Delete('contacts/:id')
  deleteContact(@Param('id', ParseIntPipe) id: number) {
    return this.hubspotService.deleteContact(id);
  }
}
