import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  GoogleSpreadsheet,
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';
import { ContactDetails } from './entities/contact-details.entity';

@Injectable()
export class SpreadsheetsService {
  async findAllRows(): Promise<ContactDetails[]> {
    try {
      const spreadsheet = await this.getSpreadsheet();
      const spreadSheetResult = await spreadsheet.getRows();
      const allRows = this.formatRowResult(spreadSheetResult);

      return allRows;
    } catch {
      throw new BadRequestException('Could not get the spreadsheet rows');
    }
  }

  async createRow(contactDetails: ContactDetails): Promise<void> {
    const spreadsheet = await this.getSpreadsheet();
    const allContactDetails = await this.findAllRows();
    const contactAlreadyExists = allContactDetails.some(
      (item) => item.email === contactDetails.email,
    );

    if (contactAlreadyExists) {
      throw new ConflictException('Contact already exists');
    }

    try {
      await spreadsheet.addRow({
        'Nome da empresa': contactDetails.company,
        'Nome completo': contactDetails.fullName,
        Email: contactDetails.email,
        Telefone: contactDetails.phone,
        Website: contactDetails.website,
      });
    } catch {
      throw new BadRequestException('Could not add new row');
    }
  }

  async updateRow(email: string, contact: ContactDetails): Promise<void> {
    const spreadsheet = await this.getSpreadsheet();
    const spreadsheetRows = await spreadsheet.getRows();
    const allContactDetails = await this.findAllRows();

    const contactAlreadyExists = allContactDetails.some((item) => {
      return email !== contact.email && item.email === contact.email;
    });

    if (contactAlreadyExists) {
      throw new ConflictException('Contact already exists');
    }

    spreadsheetRows.forEach((row) => {
      if (row['Email'] === email) {
        row['Nome da empresa'] = contact.company;
        row['Nome completo'] = contact.fullName;
        row['Email'] = contact.email;
        row['Telefone'] = contact.phone;
        row['Website'] = contact.website;
      }
    });

    try {
      const newRows = this.formatSpreadsheetResult(spreadsheetRows);
      await spreadsheet.clearRows();
      await spreadsheet.addRows(newRows);
    } catch {
      throw new BadRequestException('Could not update row');
    }
  }

  async deleteRow(email: string): Promise<void> {
    const spreadsheet = await this.getSpreadsheet();
    const spreadsheetRows = await spreadsheet.getRows();

    const filteredSpreadsheetRows = spreadsheetRows.filter(
      (row) => row['Email'] !== email,
    );

    try {
      const newRows = this.formatSpreadsheetResult(filteredSpreadsheetRows);
      await spreadsheet.clearRows();
      await spreadsheet.addRows(newRows);
    } catch {
      throw new BadRequestException('Could not delete row');
    }
  }

  private formatRowResult(
    spreadsheetResult: GoogleSpreadsheetRow[],
  ): ContactDetails[] {
    const allContactDetails: ContactDetails[] = spreadsheetResult.map((row) => {
      return {
        company: row['Nome da empresa'],
        fullName: row['Nome completo'],
        email: row['Email'],
        phone: row['Telefone'],
        website: row['Website'],
      };
    });

    return allContactDetails;
  }

  private formatSpreadsheetResult(spreadsheetResult: GoogleSpreadsheetRow[]) {
    const allContactDetails = spreadsheetResult.map((row) => {
      return {
        'Nome da empresa': row['Nome da empresa'],
        'Nome completo': row['Nome completo'],
        Email: row['Email'],
        Telefone: row['Telefone'],
        Website: row['Website'],
      };
    });

    return allContactDetails;
  }

  private async getSpreadsheet(): Promise<GoogleSpreadsheetWorksheet> {
    const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID);
    try {
      await doc.useServiceAccountAuth({
        client_email: process.env.SHEETS_EMAIL,
        private_key: process.env.SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      });

      await doc.loadInfo();
      const firstSheet = doc.sheetsByIndex[0];

      return firstSheet;
    } catch (err) {
      throw new NotFoundException('Could not get connection to spreadsheet');
    }
  }
}
