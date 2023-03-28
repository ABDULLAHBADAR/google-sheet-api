const express = require('express');
const request = require('request');
const key = require('./influential-bit-381819-d91143fae601.json');
const { google } = require('googleapis');

const app = express();
const port = 3000;

const apiUrl = 'https://bcisphuket-admin.api.getalma.com/v2/bcisphuket/classes/630d0ef0a43038011247973d/assignments';

const digestAuth = request.defaults({
  auth: {
    user: 'ME64AQ6PJZBYKSY13RNC',
    pass: 'WnhjWFJXSFRARDBhbypFKWMzTytER19NYSVpb1djVmRmY0ptTyNYKw==',
    sendImmediately: false
  }
});

async function handleRequest(req, res) {
  digestAuth.get(apiUrl, async (err, response, body) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error getting data');
    } else {
      const data = JSON.parse(body).response;
      await writeToCsv(data);
      res.send(data);
    }
  });
}

app.get('/', handleRequest);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});



const writeToCsv = async (data) => {
  return new Promise(async (resolve, reject) => {
    const client = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    const spreadsheetId = '1KGYyzJzVFXAr82-NiyGUjcZufPvuL6n0iDHtoZ_U3uc';
    const range = 'Sheet1'; // specify <t><f>fnx </f></t>he range to write to

    const values = data;

    client.authorize(async (err, tokens) => {
      if (err) {
        console.error(err);
        reject(err);
        return;
      }
      const sheets = google.sheets({
        version: 'v4',
        auth: client
      });
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });
        const rows = response.data.values;
        console.log(rows)
        let newValues = []
        newValues = [...rows, ...values.map(obj => [obj.id, obj.name, obj.description, obj.schoolYearId, obj.classId, obj.assignmentTypeId, obj.points, obj.dueDate, obj.isAssigned, obj.isPublished, obj.includedInFinalGrade, JSON.stringify(obj.onlineSubmit), JSON.stringify(obj.externalIds), obj.created, obj.modified])];

        const res = await sheets.spreadsheets.values.update({
          spreadsheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: newValues,
          },
        });
        console.log(`${newValues.length - 1} cells updated.`); // Subtract 1 to exclude the header row
        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  });
};


