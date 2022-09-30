# <center>DevApi Integration Challenge</center>

## Description
This project aims to integrate Google Sheets and HubSpot CRM tools. In order to add more functionality, an API was created that allows, in addition to performing this integration, to manipulate the spreadsheet by adding, updating or removing rows.

### Dependencies
- NodeJS (recent version);
- NPM (recent version);

### Technologies used
- NodeJS (NestJS);
- TypeScript;
- ESLint;
- Jest;

## Setup
First, we must create an **.env** file to add the credentials. There is a **.env.example** file that contains the variables used by the application, just rename it to **.env**.

### Google Sheets Configuration
After creating the .env file, go to the google cloud console and open the [APIs and Services option](https://console.cloud.google.com/projectselector2/apis/dashboard) and create a project.
![](https://i.ibb.co/D14LFT8/Screenshot-1.png "")

After creating the project and selecting it, click on ENABLE APIS AND SERVICES.
![](https://i.ibb.co/JvqwVqw/Screenshot-2.png "")

Look for the Google Sheets API option and then select it and enable.
![](https://i.ibb.co/pzvVm8k/Screenshot-3.png "")

Open the CREDENTIALS tab, click CREATE CREDENTIALS and select the **Service account** option and create an account.
![](https://i.ibb.co/wgt88qV/Screenshot-4.png "")

With the account created, select the option to edit the account.
![](https://i.ibb.co/drJ0d5S/Screenshot-5.png "")

Open the KEYS tab and create a new key by selecting the JSON option and download the credentials file.
![](https://i.ibb.co/WxLTSG6/Screenshot-6.png "")

With the downloaded JSON file copy the **client_email** key value and replace the **SHEETS_EMAIL** variable and copy the **private_key** key value and replace the **SHEETS_PRIVATE_KEY** variable from the **.env** file.

Then create a spreadsheet using Google Sheets and copy the id as in the example below.
![](https://i.ibb.co/zPDwM31/Screenshot-7.png "")

Remembering that the columns must follow the following structure to work correctly:
![](https://i.ibb.co/jhB6sFg/Screenshot-8.png "")

Share the spreadsheet with the email provided in the downloaded credentials file, its value is in the **client_email** key.

### Hubspot Configuration
Open the [Hubspot CRM](https://br.hubspot.com/products/crm) and login.

Open integration settings and create a private app.
![](https://i.ibb.co/34kGb90/Screenshot-9.png "")

Fill in the basic information and in the **Scopes** tab select CRM and check the options for **crm.objects.contacts** and create the app.
![](
https://i.ibb.co/JHP9QDs/Screenshot-10.png "")

Copy the generated token and assign the value to the **HUBSPOT_TOKEN** variable from the **.env** file.

Finally, define the port where you want to expose the project locally by replacing the **API_PORT** value in the .env file.

### Hubspot Configuration
Once you're on the project directory run:

```bash

$ npm i

```

For run the project use the following command:
```bash
npm run start:dev
```

## Endpoints
All endpoints built into the application are available in a [JSON file](https://fastupload.io/en/YHIaC0xEvSNal63/file) that can be imported by insomnia and other API platforms.

**GET**  `/hubspot/integrate-spreadsheet`
- Is the main endpoint of the application, it sends the spreadsheet data to the Hubspot CRM.

**GET**  `/hubspot/contacts/{id}`
- Returns the contact details from the Hubspot CRM, sometimes the integration takes some time, it may not return the contacts immediately, but just wait a little bit.

**DELETE**  `/hubspot/contacts/{id}`
- It deletes a contact saved in hubspot crm.

Auxiliary endpoints were also created, they allow to manipulate the hubspot spreadsheet and contacts.

**POST**  `/spreadsheets`
- It creates a new row in the worksheet, the request body must be a JSON with the following format:
```
{
	"company": "DevApi",
	"fullName": "John Doe",
	"email": "johndoe@devapi.com.br",
	"phone": "(19) 2602-8356",
	"website": "www.test1.com"
}
```
**GET**  `/spreadsheets`
- Lists all contact details in the spreadsheet.

**PUT**  `/spreadsheets/{email}`
- It updates a row in the spreadsheet, the email must be passed as a parameter in the request and a JSON in the body of the request with the following format:
```
{
	"company": "DevApi",
	"fullName": "Jane Doe",
	"email": "janedoe@devapi.com.br",
	"phone": "(33) 8702-6356",
	"website": "www.test2.com"
}
```
**DELETE**  `/spreadsheets/{email}`
- It deletes a row in the spreadsheet, the email must be passed as a parameter in the request.

## Tests

To run the tests, it is necessary that the Hubspot CRM and the Google Sheets spreadsheet are without any contacts, for this it is possible to create a new CRM and spreadsheet or to clean the existing ones manually or using the deletion endpoints.

Replace the value of the TESTS_SPREADSHEET_ID variable with the Sheet ID of the sheet and the value of the TESTS_HUBSPOT_TOKEN variable with the Hubspot CRM token.

For run the tests use the following command:
```bash
npm test
```
