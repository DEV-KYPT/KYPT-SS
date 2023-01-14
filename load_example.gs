function load(range = pre,cmd = 'pre',srcID = '1pzNFW88-TlAcBgSrtkwJeMPgJs9mgFE1_-Kg7q44eto') { 
  // current default parameter corresponds to replicated KYPT 2020
  var ranges = [];
  if(range == 'all'){
    ranges = ranges.concat(input_ranges_pre());
    ranges = ranges.concat(input_ranges_fin());
    for(var i = 1;i<=4;i++){ranges = ranges.concat(input_ranges_pf(i));}
  }
  else{
    if(range.search('1') != -1){ranges = ranges.concat(input_ranges_pf(1));}
    if(range.search('2') != -1){ranges = ranges.concat(input_ranges_pf(2));}
    if(range.search('3') != -1){ranges = ranges.concat(input_ranges_pf(3));}
    if(range.search('4') != -1){ranges = ranges.concat(input_ranges_pf(4));}
    if(range.search('pre') != -1){ranges = ranges.concat(input_ranges_pre());}
    if(range.search('fin') != -1){ranges = ranges.concat(input_ranges_fin());}
  }
  if(ranges == []){return -1;}

  if((cmd.search('l') != -1) && (cmd.search('c') == -1)){ //load
    load_ranges(ranges,srcID);
  }
  else if(cmd.search('c') != -1){ // clear
    clear_ranges(ranges);
  }
  else{
    Logger.log(`no adequate command found for ${cmd}. No action taken`)
    return -1;
  }
  return 1;
}

function input_ranges_pfrm(pf = 1,rm = 1){
  var pfData = new PF(pf,rm);
  return pfData.get_ranges();
}

function input_ranges_pf(pf = 1,total_rm = 6){
  Logger.log(`LOAD: Adding Range: PF${pf} (rm 1 ~ ${total_rm})`);
  var ranges = []
  for(var rm = 1;rm < total_rm+1;rm++){
    ranges = ranges.concat(input_ranges_pfrm(pf,rm));
  }
  return ranges;
}

function input_ranges_pre(){
  Logger.log(`LOAD: Adding Range: PRE`);
  ss = SpreadsheetApp.getActiveSpreadsheet();
  return [
    ss.getRange('Draw!C37:M55'), //seed structure
    ss.getRange('Draw!O4:P27'),  //names, seed placement
    ss.getRange('Draw!S4:S9'),   //rooms location
    ss.getRange('PF4!F2:I25'),   //PF4 VERDICT - choices
    ss.getRange('PF4!L2:L25'),   //PF4 VERDICT - verdicts
    ss.getRange('CoreData!BM2:BQ2'), //banned questions
    ss.getRange('JuryPlacement!D4:M9') //Jury Placement (can delete if format changes)
  ];
}

function input_ranges_fin(){
  Logger.log(`LOAD: Adding Range: FIN`);
  var finData = new FINAL()
  return finData.get_ranges();
}

function ranges_profile(ranges){
  var n = '';
  var ss = SpreadsheetApp.openById(PropertiesService.getDocumentProperties().getProperty('ssId'));
  for(var r of ranges){
    n = fullNotation(r);
    Logger.log(n);
    Logger.log(ss.getRange(n).getValues());
    // Logger.log(r.getValues());
  }
}

function fullNotation(range){
  return `'${range.getSheet().getName()}'!${range.getA1Notation()}`;
}

function load_ranges(ranges,srcID = '1pzNFW88-TlAcBgSrtkwJeMPgJs9mgFE1_-Kg7q44eto'){
  Logger.log(`LOAD: IMPORTING Added ranges`);
  src_ss = SpreadsheetApp.openById(srcID);
  for(r of ranges){
    r.setValues(src_ss.getRange(fullNotation(r)).getValues());
  }
}

function clear_ranges(ranges){
  Logger.log(`LOAD: CLEARING Added ranges`);
  for(r of ranges){r.setValue('');}
}

function temp(){
  load('all','l');
}
