// Thin generic helper over SpreadsheetApp. Sheets are small (max ~20 users), so
// reading the full sheet on every call is fine — no need for range-based paging.

function getSpreadsheet_() {
  var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) {
    throw new Error('Script property SPREADSHEET_ID is not set.');
  }
  return SpreadsheetApp.openById(id);
}

function getSheet_(name) {
  var sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet) {
    throw new Error('Sheet not found: ' + name);
  }
  return sheet;
}

function ensureSheet_(name, headers) {
  var ss = getSpreadsheet_();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function readSheet_(sheet) {
  var values = sheet.getDataRange().getValues();
  var headers = values.length ? values[0] : [];
  return { headers: headers, values: values };
}

function rowValuesToObject_(headers, rowValues) {
  var obj = {};
  for (var j = 0; j < headers.length; j++) {
    obj[headers[j]] = rowValues[j];
  }
  return obj;
}

function getSheetRows_(name) {
  var data = readSheet_(getSheet_(name));
  var rows = [];
  for (var i = 1; i < data.values.length; i++) {
    rows.push(rowValuesToObject_(data.headers, data.values[i]));
  }
  return rows;
}

function appendRow_(name, headers, rowObj) {
  var sheet = getSheet_(name);
  var row = headers.map(function (h) {
    return rowObj.hasOwnProperty(h) ? rowObj[h] : '';
  });
  sheet.appendRow(row);
}

function findRowByKey_(name, keyColumn, keyValue) {
  var data = readSheet_(getSheet_(name));
  var keyIdx = data.headers.indexOf(keyColumn);
  if (keyIdx === -1) {
    throw new Error('Unknown column: ' + keyColumn);
  }
  for (var i = 1; i < data.values.length; i++) {
    if (String(data.values[i][keyIdx]) === String(keyValue)) {
      return rowValuesToObject_(data.headers, data.values[i]);
    }
  }
  return null;
}

function updateRowByKey_(name, keyColumn, keyValue, patchObj) {
  var sheet = getSheet_(name);
  var data = readSheet_(sheet);
  var keyIdx = data.headers.indexOf(keyColumn);
  if (keyIdx === -1) {
    throw new Error('Unknown column: ' + keyColumn);
  }
  for (var i = 1; i < data.values.length; i++) {
    if (String(data.values[i][keyIdx]) === String(keyValue)) {
      var rowNumber = i + 1; // 1-based sheet row (data.values is 0-based, row 0 is the header)
      for (var colIdx = 0; colIdx < data.headers.length; colIdx++) {
        var header = data.headers[colIdx];
        if (patchObj.hasOwnProperty(header)) {
          sheet.getRange(rowNumber, colIdx + 1).setValue(patchObj[header]);
        }
      }
      return true;
    }
  }
  return false;
}
