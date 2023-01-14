function init_external (category = "TEST",callname = now){ //callname is allocated to: "Draw!I26"
  // CALLED ONLY from SOURCE.
  if(PropertiesService.getDocumentProperties().getProperty('status') != 'SOURCE'){
    Logger.log("Invalid Initialize Root.")
    ui.alert("New Tournament Instances can only be created from SOURCE.");
    return;}
  Logger.log("NEW TOURNAMENT INITIALIZED : "+category+"-"+callname);
  
  const ss_name = `[${category}-${callname}] Scoring System ${VERSION}`;
  const mt_name = `[${category}-${callname}] Scores Master`;
  var rootFolder = DriveApp.getFolderById(PropertiesService.getDocumentProperties().getProperty('folderID_root')).createFolder(`[${category}-${callname}] Scoring System`);
  var resultFolder = rootFolder.createFolder("RESULTS");
  var templateFolder = rootFolder.createFolder("TEMPLATES");
  
  var ssSpreadsheetFile = DriveApp.getFileById(PropertiesService.getDocumentProperties().getProperty('ssId')).makeCopy(ss_name,rootFolder);
  var mtSpreadsheetFile = DriveApp.getFileById(PropertiesService.getDocumentProperties().getProperty('mtId')).makeCopy(mt_name,rootFolder);
  
  ssSpreadsheetFile.setShareableByEditors(false);
  mtSpreadsheetFile.setShareableByEditors(false);
  resultFolder.setShareableByEditors(false);
  templateFolder.setShareableByEditors(false);
  
  // ssSpreadsheetFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
  mtSpreadsheetFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  mtSpreadsheetFile.addEditor("korea.kypt@gmail.com");
  
  init_populate(ssSpreadsheetFile,mtSpreadsheetFile,rootFolder,resultFolder,templateFolder,category,callname);
  
  Logger.log("INITIALIZATION SUCCESSFUL");
}

function init_internal(){
  Logger.log("Internal Initialization Called at: "+now);
  var   ssSpreadsheet     = SpreadsheetApp.getActive();
  var   ssSpreadsheetFile = DriveApp.getFileById(ssSpreadsheet.getId());
  const mtSpreadsheetFile = DriveApp.getFileById(ssSpreadsheet.getRange("Consensus!B31").getValue());
  const rootFolder        = DriveApp.getFolderById(ssSpreadsheet.getRange("Consensus!B26").getValue());
  const resultFolder      = DriveApp.getFolderById(ssSpreadsheet.getRange("Consensus!B27").getValue());
  const templateFolder    = DriveApp.getFolderById(ssSpreadsheet.getRange("Consensus!B28").getValue());
  const category          = ssSpreadsheet.getRange("Draw!D26").getValue();
  const callname          = ssSpreadsheet.getRange("Draw!I26").getValue();
  
  PropertiesService.getScriptProperties().setProperties({
    'developers':'iamchoking247@gmail.com,korea.kypt@gmail.com',
    '_devPw':'kyptkypt' //if you found this out, you deserve developer rights.
  });
  PropertiesService.getDocumentProperties().setProperties({
    'ssUrl': ssSpreadsheetFile.getUrl(),
    'mtUrl': mtSpreadsheetFile.getUrl(),
    'ssId': ssSpreadsheetFile.getId(),
    'mtId': mtSpreadsheetFile.getId(),
    'folderID_root': rootFolder.getId(),
    'folderID_result': resultFolder.getId(),
    'folderID_template': templateFolder.getId(),
    'folderURL_root': rootFolder.getUrl(),
    'folderURL_result': resultFolder.getUrl(),
    'folderURL_template': templateFolder.getUrl()
  });
  if(PropertiesService.getDocumentProperties().getProperty('status') != 'SOURCE'){
    PropertiesService.getDocumentProperties().setProperties({
      'category':category.toString(),
      'callname':callname.toString(),
      'status': 'initialized at '+now+' VERSION: '+VERSION
    });
    Logger.log(`Internal Initialization Successful (instance): ${category}-${callname}`);
  }
  read_all_properties();
}

function duplicate(postfix = ` - copied ${now}`){//a function do duplicate an instance. Can be used for backup / sandboxing.
  initGate();
  if(PropertiesService.getDocumentProperties().getProperty('status') == 'SOURCE'){
    Logger.log("Invalid Duplication Root.")
    ui.alert("SOURCE System Cannot be Duplicated.");
    return;
  }
  
  const category = PropertiesService.getDocumentProperties().getProperty('category');
  const callname = PropertiesService.getDocumentProperties().getProperty('callname');
  
  const new_ss_name = `[${category}-${callname}] Scoring System ${VERSION}`+postfix;
  const new_mt_name = `[${category}-${callname}] Scores Master`+postfix;
  var new_rootFolder = DriveApp.getFolderById(PropertiesService.getDocumentProperties().getProperty('folderID_root')).getParents().next().createFolder(`[${category}-${callname}] Scoring System`+postfix);
  var new_resultFolder = new_rootFolder.createFolder("RESULTS");

  var new_templateFolder = new_rootFolder.createFolder("TEMPLATES");

  var new_ssSpreadsheetFile = DriveApp.getFileById(PropertiesService.getDocumentProperties().getProperty('ssId')).makeCopy(new_ss_name,new_rootFolder);
  var new_mtSpreadsheetFile = DriveApp.getFileById(PropertiesService.getDocumentProperties().getProperty('mtId')).makeCopy(new_mt_name,new_rootFolder);
  
  new_ssSpreadsheetFile.setShareableByEditors(false);
  new_mtSpreadsheetFile.setShareableByEditors(false);
  
  new_ssSpreadsheetFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
  new_mtSpreadsheetFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  new_mtSpreadsheetFile.addEditor("korea.kypt@gmail.com");
  
  init_populate(new_ssSpreadsheetFile,new_mtSpreadsheetFile,new_rootFolder,new_resultFolder,new_templateFolder);
  
  Logger.log("Duplication Successful");
  
}

function _init_source(ssname = '[XYPT-SOURCE] Scoring System',mtname = '[XYPT-SOURCE] Scores Master',del = true){ 
  //this function initializes the SOURCE of deveopment, and can only be edited through editor. be careful with this function.
  //if you don't know what you are doing, please contact one of the developers
  Logger.log("SOURCE INIT DETECTED!")
  Logger.log("before source init:");
  read_all_properties();
  var   ssSpreadsheetFile = DriveApp.getFilesByName(ssname).next();
  const mtSpreadsheetFile = DriveApp.getFilesByName(mtname).next();
  const rootFolder = ssSpreadsheetFile.getParents().next();
  const resultFolder = rootFolder.getFoldersByName('RESULTS').next();
  const templateFolder = rootFolder.getFoldersByName('TEMPLATES').next();
  if (del){
    delete_properties();
  }
  PropertiesService.getScriptProperties().setProperties({
    'developers':'iamchoking247@gmail.com,korea.kypt@gmail.com',
    '_devPw':'kyptkypt' //if you found this out, you deserve developer rights.
  });
  PropertiesService.getDocumentProperties().setProperties({
    'ssUrl': ssSpreadsheetFile.getUrl(),
    'mtUrl': mtSpreadsheetFile.getUrl(),
    'ssId': ssSpreadsheetFile.getId(),
    'mtId': mtSpreadsheetFile.getId(),
    'folderID_root': rootFolder.getId(),
    'folderID_result': resultFolder.getId(),
    'folderID_template': templateFolder.getId(),
    'folderURL_root': rootFolder.getUrl(),
    'folderURL_result': resultFolder.getUrl(),
    'folderURL_template': templateFolder.getUrl()
  });
  PropertiesService.getDocumentProperties().setProperties({
    'status': 'SOURCE'
  });
  init_populate(ssSpreadsheetFile,mtSpreadsheetFile,rootFolder,resultFolder,templateFolder);
  Logger.log("source init completed:");
  read_all_properties();
  Logger.log("SOURCE INIT SUCCESSFUL")
}

function init_populate(ssSpreadsheetFile,mtSpreadsheetFile,rootFolder,resultFolder,templateFolder,category=undefined,callname=undefined){
  var ssSpreadsheet = SpreadsheetApp.openById(ssSpreadsheetFile.getId());
  ssSpreadsheet.getRange("Consensus!B26").setValue(rootFolder.getId()); //root dir ID
  ssSpreadsheet.getRange("Consensus!B27").setValue(resultFolder.getId()); //result dir ID
  ssSpreadsheet.getRange("Consensus!B28").setValue(templateFolder.getId()); //template dir ID
  ssSpreadsheet.getRange("Consensus!B30").setValue(ssSpreadsheetFile.getId()) ;//scoring system dir ID
  ssSpreadsheet.getRange("Consensus!B31").setValue(mtSpreadsheetFile.getId()) ;//scores master dir ID
  ssSpreadsheet.getRange("Consensus!F1" ).setValue(VERSION);
  if (category != undefined){
    ssSpreadsheet.getRange("Draw!D26" ).setValue(category);
    ssSpreadsheet.getRange("Draw!I26" ).setValue(callname);
  }
}

function add_staff(){
  var staffSheet = SpreadsheetApp.getActive().getSheetByName('Staff');
  var i = 3;
  var j = 0;

  var ssSpreadsheetFile = DriveApp.getFileById(PropertiesService.getDocumentProperties().getProperty('ssId'));
  var resultFolder = DriveApp.getFileById(PropertiesService.getDocumentProperties().getProperty('folderID_result'));
  var templateFolder = DriveApp.getFileById(PropertiesService.getDocumentProperties().getProperty('folderID_template'));
  var acc_temp = '';

  while(staffSheet.getRange(1,i).getValue() != ''){
    j = 5;
    var perm_ss    = staffSheet.getRange(2,i).getValue();
    var perm_res   = staffSheet.getRange(3,i).getValue();
    var perm_templ = staffSheet.getRange(4,i).getValue();
    while(true){
      acc_temp = staffSheet.getRange(j,i).getValue();
      if(acc_temp == ''){break;}
      if(perm_ss == 'view'){ssSpreadsheetFile.addViewer(acc_temp);}
      else if(perm_ss == 'edit'){ssSpreadsheetFile.addEditor(acc_temp);}

      if(perm_res == 'view'){resultFolder.addViewer(acc_temp);}
      else if(perm_res == 'edit'){resultFolder.addEditor(acc_temp);}

      if(perm_templ == 'view'){templateFolder.addViewer(acc_temp);}
      else if(perm_templ == 'edit'){templateFolder.addEditor(acc_temp);}
      Logger.log(`[ADD STAFF] added ${staffSheet.getRange(j,i).getValue()} as ${staffSheet.getRange(1,i).getValue()}`)
      j += 1;
    }
    i += 1;
  }
}

function clear_staff(){
  var ssSpreadsheetFile = DriveApp.getFileById(PropertiesService.getDocumentProperties().getProperty('ssId'));
  var resultFolder = DriveApp.getFileById(PropertiesService.getDocumentProperties().getProperty('folderID_result'));
  var templateFolder = DriveApp.getFileById(PropertiesService.getDocumentProperties().getProperty('folderID_template'));

  for(var file of [ssSpreadsheetFile,resultFolder,templateFolder]){
    var editors = file.getEditors();
    var viewers = file.getViewers();
    for (var ed of editors){file.removeEditor(ed);}
    for (var ve of viewers){file.removeViewer(ve);}
  }
}