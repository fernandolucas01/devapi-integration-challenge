import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ContactDetails } from '../spreadsheets/entities/contact-details.entity';
import { SpreadsheetsService } from '../spreadsheets/spreadsheets.service';

@Controller('spreadsheets')
export class SpreadsheetsController {
  constructor(private readonly spreadsheetsService: SpreadsheetsService) {}

  @Get()
  index() {
    return this.spreadsheetsService.findAllRows();
  }

  @Post()
  async createRow(@Body() contactDetails: ContactDetails) {
    return this.spreadsheetsService.createRow(contactDetails);
  }

  @Put(':email')
  updateRow(
    @Param('email') email: string,
    @Body() contactDetails: ContactDetails,
  ) {
    return this.spreadsheetsService.updateRow(email, contactDetails);
  }

  @Delete(':email')
  deleteRow(@Param('email') email: string) {
    return this.spreadsheetsService.deleteRow(email);
  }
}
