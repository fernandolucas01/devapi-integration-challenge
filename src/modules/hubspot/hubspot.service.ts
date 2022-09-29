import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ContactDetails } from '../spreadsheets/entities/contact-details.entity';
import { SpreadsheetsService } from '../spreadsheets/spreadsheets.service';
import { Client } from '@hubspot/api-client';
import { SimplePublicObject } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, from, retry } from 'rxjs';
import * as freeEmailDomains from 'free-email-domains';

@Injectable()
export class HubspotService {
  private readonly logger = new Logger(HubspotService.name);
  private readonly hubspotClient = new Client({
    accessToken: process.env.HUBSPOT_TOKEN,
  });

  constructor(
    private readonly spreadsheetsService: SpreadsheetsService,
    private readonly httpService: HttpService,
  ) {}

  async integrateSpreadsheet(): Promise<void> {
    const allContacteDetails = await this.spreadsheetsService.findAllRows();
    const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    const contactsToSendToHubspot = allContacteDetails.filter(
      (contact) =>
        emailPattern.test(contact.email) &&
        !(freeEmailDomains as string[]).includes(contact.email),
    );

    try {
      for (const contact of contactsToSendToHubspot) {
        await this.sendSpreadsheetDataToHubspot(contact);
      }
    } catch {
      this.logger.warn(
        'there was a problem sending contact details to hubspot',
      );
    }
  }

  async findAllContacts(): Promise<SimplePublicObject[]> {
    try {
      const response = await firstValueFrom(
        from(
          this.hubspotClient.crm.contacts.searchApi.doSearch({} as any),
        ).pipe(retry(5)),
      );

      return response.results;
    } catch {
      throw new BadRequestException('Unable to get contacts');
    }
  }

  async deleteContact(id: number): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.delete(
          `https://api.hubapi.com/contacts/v1/contact/vid/${id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
            },
          },
        ),
      );
    } catch {
      throw new BadRequestException('Could not delete contact');
    }
  }

  private sendSpreadsheetDataToHubspot(
    contactDetails: ContactDetails,
  ): Promise<SimplePublicObject> {
    const contactNames = contactDetails.fullName.split(' ');
    const firstname = contactNames[0];
    const lastname =
      contactNames.length > 1 ? contactNames[contactNames.length - 1] : '';
    delete contactDetails.fullName;
    const properties = { ...contactDetails, firstname, lastname };

    return this.hubspotClient.crm.contacts.basicApi.create({
      properties,
    });
  }
}
