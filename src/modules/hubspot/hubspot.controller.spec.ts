import { SimplePublicObject } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ContactDetails } from '../spreadsheets/entities/contact-details.entity';
import { SpreadsheetsController } from '../spreadsheets/spreadsheets.controller';
import { SpreadsheetsService } from '../spreadsheets/spreadsheets.service';
import { HubspotController } from './hubspot.controller';
import { HubspotService } from './hubspot.service';

describe('HubspotController', () => {
  let hubspotController: HubspotController;
  let spreadsheetsController: SpreadsheetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), HttpModule],
      controllers: [HubspotController, SpreadsheetsController],
      providers: [HubspotService, SpreadsheetsService],
    }).compile();

    // test hubspot and spreadsheet data
    process.env.HUBSPOT_TOKEN = process.env.TESTS_HUBSPOT_TOKEN;
    process.env.SPREADSHEET_ID = process.env.TESTS_SPREADSHEET_ID;

    hubspotController = module.get<HubspotController>(HubspotController);
    spreadsheetsController = module.get<SpreadsheetsController>(
      SpreadsheetsController,
    );
  });

  it('should be defined', () => {
    expect(hubspotController).toBeDefined();
  });

  it('should be able to insert spreadsheet data to Hubspot CRM', async () => {
    const contact1: ContactDetails = {
      company: 'DevApi',
      fullName: 'John Doe',
      email: 'johndoe@devapi.com.br',
      phone: '(19) 2602-8356',
      website: 'www.test1.com',
    };

    const contact2: ContactDetails = {
      company: 'DevApi',
      fullName: 'Jane Doe',
      email: 'janedoe@devapi.com.br',
      phone: '(79) 2137-1437',
      website: 'www.test2.com',
    };

    await spreadsheetsController.createRow(contact1);
    await spreadsheetsController.createRow(contact2);
    await hubspotController.integrateSpreadsheet();
    await spreadsheetsController.deleteRow('johndoe@devapi.com.br');
    await spreadsheetsController.deleteRow('janedoe@devapi.com.br');

    let contacts: SimplePublicObject[] = [];

    // ensures contacts will always be on hubspot
    while (contacts.length < 2) {
      contacts = await hubspotController.findAllContacts();
    }

    expect(contacts).toBeInstanceOf(Array);
    expect(contacts[0]).toHaveProperty('id');
    expect(contacts[0].properties.email).toEqual(contact1.email);
  }, 99999);

  it('should be able to delete hubspot contacts', async () => {
    const contacts = await hubspotController.findAllContacts();

    for (const contact of contacts) {
      await hubspotController.deleteContact(Number(contact.id));
    }

    let contactsAfterDelete: SimplePublicObject[] = [...contacts];

    // ensures contacts will be deleted on hubspot
    while (contactsAfterDelete.length > 0) {
      contactsAfterDelete = await hubspotController.findAllContacts();
    }

    expect(contactsAfterDelete).toBeInstanceOf(Array);
    expect(contactsAfterDelete.length).toBe(0);
  }, 99999);
});
