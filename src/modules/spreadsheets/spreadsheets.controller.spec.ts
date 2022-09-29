import { BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ContactDetails } from './entities/contact-details.entity';
import { SpreadsheetsController } from './spreadsheets.controller';
import { SpreadsheetsService } from './spreadsheets.service';

describe('SpreadsheetsController', () => {
  let spreadsheetsController: SpreadsheetsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [SpreadsheetsController],
      providers: [SpreadsheetsService],
    }).compile();

    // set test spreadsheet data
    process.env.SPREADSHEET_ID = process.env.TESTS_SPREADSHEET_ID;

    spreadsheetsController = module.get<SpreadsheetsController>(
      SpreadsheetsController,
    );
  });

  it('should be defined', () => {
    expect(spreadsheetsController).toBeDefined();
  });

  it('shoud be able to create an spreadsheet row', async () => {
    const contactDetails: ContactDetails = {
      company: 'DevApi',
      fullName: 'John Doe',
      email: 'johndoe@devapi.com.br',
      phone: '(19) 2602-8356',
      website: 'www.test.com',
    };

    await spreadsheetsController.createRow(contactDetails);
    const allContacts = await spreadsheetsController.index();

    expect(allContacts[0]).toHaveProperty('email');
  });

  it('should not be able to create a spreadsheet row with already existing email', async () => {
    await expect(async () => {
      const contactDetails: ContactDetails = {
        company: 'DevApi',
        fullName: 'John Doe',
        email: 'johndoe@devapi.com.br',
        phone: '(84) 2870-4408',
        website: 'www.test2.com',
      };

      await spreadsheetsController.createRow(contactDetails);
    }).rejects.toBeInstanceOf(ConflictException);
  });

  it('should be able to update an existent spreadsheet row', async () => {
    const contactDetails: ContactDetails = {
      company: 'DevApi',
      fullName: 'Jane Doe',
      email: 'janedoe@devapi.com.br',
      phone: '(19) 2602-8356',
      website: 'www.test.com',
    };

    const email = 'johndoe@devapi.com.br';
    await spreadsheetsController.updateRow(email, contactDetails);
    const allContacts = await spreadsheetsController.index();

    expect(allContacts[0].email).toEqual('janedoe@devapi.com.br');
  }, 99999);

  it('should be able to list all spreadsheet rows', async () => {
    const allRows = await spreadsheetsController.index();

    expect(allRows).toBeInstanceOf(Array);
    expect(allRows[0]).toHaveProperty('email');
  });

  it('should be able to delete an spreadsheet row', async () => {
    const email = 'janedoe@devapi.com.br';
    await spreadsheetsController.deleteRow(email);
    const allRows = await spreadsheetsController.index();

    expect(allRows.length).toEqual(0);
  });

  it('should throw an exception when the SPREADSHEET_ID is invalid', async () => {
    process.env.SPREADSHEET_ID = 'TEST';

    await expect(async () => {
      await spreadsheetsController.index();
    }).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw an exception when the SHEETS_EMAIL is invalid', async () => {
    process.env.SHEETS_EMAIL = 'test@email.com';

    await expect(async () => {
      await spreadsheetsController.index();
    }).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should throw an exception when the SHEETS_PRIVATE_KEY is invalid', async () => {
    process.env.SHEETS_PRIVATE_KEY = '1234';

    await expect(async () => {
      await spreadsheetsController.index();
    }).rejects.toBeInstanceOf(BadRequestException);
  });
});
