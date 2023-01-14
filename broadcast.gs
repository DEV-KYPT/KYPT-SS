var broadcastSheets = ['1. Draw','2. Database','3. Leaderboard','4. PF4 Questions']

function broadcast (message = '---'){
  //set the necessary shit first
  getSsSpreadsheet().getRange("'3. Leaderboard'!A29").setValue(`LAST UPDATED : ${now}`);
  getSsSpreadsheet().getRange("'3. Leaderboard'!A30").setValue(`MESSAGE : ${message}`);
  
  var sheetName;
  for(sheetName of broadcastSheets){
    var ssSpreadsheet = getSsSpreadsheet();
    var mtSpreadsheet = getMtSpreadsheet();
    var ssSheet = ssSpreadsheet.getSheetByName(sheetName);
    var values = ssSheet.getRange(1,1,ssSheet.getMaxRows(), ssSheet.getMaxColumns()).getValues();
    var mtSheet = mtSpreadsheet.getSheetByName(sheetName);
    mtSheet.getRange(1,1,mtSheet.getMaxRows(), mtSheet.getMaxColumns()).setValues(values);
  }
      }