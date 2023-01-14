function onOpen(){
  if(PropertiesService.getDocumentProperties().getProperty('status') == null){
    ui.createMenu("KYPT Scoring System Script")
    .addItem('Initialize Scoring System','initGate')
    .addToUi();
    ui.alert('This document was opened for the first time. Please Initialize with the dropdown menu above.')
    return;
  }
  initGate();
//  consloe.log("on open has been triggered") //currently, there is sadly no way of live-debugging in Apps Script.
  ui.createMenu("KYPT Scoring System Script")
  .addSubMenu(
    ui.createMenu('Generate Documents')
    .addItem('Draw','user_gen_draw')
    .addItem('Leaderboard Status','user_gen_pf_status')
    .addItem('Tournament Progression Status','user_gen_database')
    .addItem('PF4 Questions Verdict','user_gen_pf4_problems')
    .addItem('PF##, RM##', 'user_gen_pfrm')
    .addItem('Total Summary of PF','user_gen_pf_summary')
    .addItem('Finals','user_gen_final')
  )
  .addSubMenu(
    ui.createMenu('Generate Templates')
    .addItem('Write Templates','user_gen_write_template_all')
    .addItem('Capture Templates','user_gen_capture_templates')
    .addItem('Finals Templates','user_gen_write_template_final')
  )
  .addSeparator()
  .addItem('Broadcast','user_broadcast')
  .addSeparator()
  .addSubMenu(
    ui.createMenu('Developer Options')
      .addItem('Internal Initialize','dev_init_internal')
      .addItem('Duplicate','dev_duplicate')
      .addItem('Load / Clear','dev_load')
      .addItem('New Tournament Instance','dev_init_external')
      .addSubMenu(ui.createMenu('Staff')
        .addItem("Add Staff",'dev_add_staff')
        .addItem('Clear Staff','dev_clear_staff')
      )
    )
  .addToUi();
}

function initGate(){
  Logger.log("This file was opened by: " + Session.getActiveUser().getEmail() +" ");
  if(PropertiesService.getDocumentProperties().getProperty('status') == null){
    Logger.log("Internal Initialize Called (first time open)");
    read_all_properties();
    init_internal();
    Logger.log("System Initialized Sucessfully.");
    ui.alert(`Welcome to ${PropertiesService.getDocumentProperties().getProperty('category')}-${PropertiesService.getDocumentProperties().getProperty('callname')} Scoring System!`)
    onOpen();
}
  else if(PropertiesService.getDocumentProperties().getProperty('status') == 'SOURCE'){
    var result = promptUser("Source Editing Mode","Editing this file will change all future instances. Do you know what you are doing?",
                            ButtonSet = ui.ButtonSet.YES_NO,trueButton = ui.Button.YES);
    if(result != PropertiesService.getScriptProperties().getProperty('_devPw') &&
      PropertiesService.getScriptProperties().getProperty('developers').search(Session.getActiveUser().getEmail()) == -1){
        ui.alert("Authentication Unsuccessful.");
        Logger.log("SOURCE authentication FAILED at: "+now);
    }
    Logger.log("SOURCE authentication successful at: "+now);
  }
}


function userGate(mode = 'user'){
  Logger.log("KYPT Scoring System Script was Run : " + Session.getActiveUser().getEmail() + " as " + mode);
  if(mode.search('dev') != -1){
    if(Session.getActiveUser().getEmail() == ''){}
    else if(PropertiesService.getScriptProperties().getProperty('developers').search(Session.getActiveUser().getEmail()) != -1){
      return true
    }
    var result  = promptUser("Developer Sign-In","Your Credentials Are not recognized as developer. Please enter Password.");
    if(result == PropertiesService.getScriptProperties().getProperty('_devPw')){
      return true
    }
    ui.alert("Invalid Password. Access Denied.");
    Logger.log("User Failed Developer Identification");
    return false;
  }
  else if(mode.search('user') != -1){
    return true;
  }
  return false;
}

function promptUser(title,subtitle,ButtonSet = ui.ButtonSet.OK_CANCEL,trueButton = ui.Button.OK){  
  var result = ui.prompt(title,subtitle,ButtonSet);
  if (result.getSelectedButton()==trueButton){
    return result.getResponseText();
  }
  return false;
}

function askUser(text,ButtonSet = ui.ButtonSet.YES_NO,trueButton = ui.Button.YES){
  if(ui.alert(text,ButtonSet) == trueButton){
    return true;
  }
  return false;
}

//var htmlOutput = HtmlService
//    .createHtmlOutput('Go to <a href="https://www.google.ca/">this site</a> for help!')

//var htmlOutput = HtmlService
//    .createHtmlOutput('Go to <a href="https://www.google.ca/">this site</a> for help!')
//    .setWidth(250) //optional
//    .setHeight(50); //optional
//SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Help Dialog Title');
function htmlString_result(doc,pdf){
  return '<div style="font-family:Arial; text-align:center">'+doc.getName()+'<br><br><a href = "'+
    PropertiesService.getDocumentProperties().getProperty('folderURL_result')+
      '" target = "_blank">Open Folder</a>  <a href = "'+
        doc.getUrl()+
          '"target = "_blank">Open Docs</a>  <a href = "'+
            pdf.getDownloadUrl()+
              '">Download PDF</a> </div>';
}

function user_gen_pfrm(){
  if(userGate('user') == false){return false;}
//  ui.alert("user_gen_pfrm() called");
  var pf = promptUser("Enter PF Number","1,2,3,etc.");
  var rm = promptUser("Enter Room Number","1,2,3 etc.");
  var [doc,pdf] = gen_pfrm(pf,rm,undefined,true,true);
  //ui.alert(`Document Successfully Generated!\n${  DriveApp.getFolderById(PropertiesService.getDocumentProperties().getProperty('folderID_result')).getUrl()}`);
  ui.showModalDialog(HtmlService.createHtmlOutput(htmlString_result(doc,pdf)).setWidth(420).setHeight(100), 'Document Generation Successful');
}

function user_gen_pf_status(){
  if(userGate('user') == false){return false;}
  var [doc,pdf] = gen_pf_status();
  ui.showModalDialog(HtmlService.createHtmlOutput(htmlString_result(doc,pdf)).setWidth(420).setHeight(100), 'Document Generation Successful');
}

function user_gen_pf_summary(){
  if(userGate('user') == false){return false;}
  var pf = promptUser("Enter PF Number","1,2,3,etc.");
  var total_rm = promptUser("Enter Total Number of Rooms","1,2,3 etc.");
  var [doc,pdf] = gen_pf_summary(pf,total_rm,true,true);
  ui.showModalDialog(HtmlService.createHtmlOutput(htmlString_result(doc,pdf)).setWidth(420).setHeight(100), 'Document Generation Successful');
}

function user_gen_final(){
  if(userGate('user') == false){return false;}
  var [doc,pdf] = gen_final(undefined,true,true);
  ui.showModalDialog(HtmlService.createHtmlOutput(htmlString_result(doc,pdf)).setWidth(420).setHeight(100), 'Document Generation Successful');
}

function user_gen_draw(){
  if(userGate('user') == false){return false;}
  var [doc,pdf] = gen_draw();
  ui.showModalDialog(HtmlService.createHtmlOutput(htmlString_result(doc,pdf)).setWidth(420).setHeight(100), 'Document Generation Successful');
}

function user_gen_database(){
  if(userGate('user') == false){return false;}
  var [doc,pdf] = gen_database();
  ui.showModalDialog(HtmlService.createHtmlOutput(htmlString_result(doc,pdf)).setWidth(420).setHeight(100), 'Document Generation Successful');
}

function user_gen_write_template_all(){
  if(userGate('user') == false){return false;}
  var total_pf = promptUser("Enter Total Number of PF's","1,2,3,etc.");
  var total_rm = promptUser("Enter Total Number of Rooms","1,2,3 etc.");
  var [doc,pdf] = gen_write_template_all(total_pf,total_rm,true,true);
  ui.showModalDialog(HtmlService.createHtmlOutput(htmlString_result(doc,pdf)).setWidth(420).setHeight(100), 'Template Generation Successful');
}

function user_gen_write_template_final(){
  if(userGate('user') == false){return false;}
  var [doc,pdf] = gen_final(undefined,true,true,true);
  ui.showModalDialog(HtmlService.createHtmlOutput(htmlString_result(doc,pdf)).setWidth(420).setHeight(100), 'Template Generation Successful');
}

function user_gen_capture_templates(){
  if(userGate('user') == false){return false;}
  //gen_capture_templates(total_pf = 4,total_rm = 6,docs = true,pdf = false)
  var total_pf = promptUser("Enter Total Number of PF's","1,2,3,etc.");
  var total_rm = promptUser("Enter Total Number of Rooms","1,2,3 etc.");
  gen_capture_templates(total_pf,total_rm,true,false);
  ui.alert(`Capture templates successfully generated. Check [TEMPLATES] folder`);
}

function user_gen_pf4_problems(){
  if(userGate('user') == false){return false;}
  var [doc,pdf] = gen_pf4_problems();
  ui.showModalDialog(HtmlService.createHtmlOutput(htmlString_result(doc,pdf)).setWidth(420).setHeight(100), 'Document Generation Successful');  
}


function user_broadcast(){
  if(userGate('user') == false){return false;}
  var message = promptUser("Enter Broadcast Message","Message Displayed in: '3. Leaderboard'!A29");
  broadcast (message);
  ui.alert('Broadcast Successful at : '+ now);
}

function dev_init_internal(){
  if(userGate('dev') == false){return false;}
  init_internal();
}

function dev_init_external(){
  if(userGate('dev') == false){return false;}
  var category = promptUser("Enter Tournament Category","KYPT, I-YPT, etc.");
  var callname = promptUser("Enter Callname","2018, 2019, etc.");
  init_external (category,callname);
  ui.alert("New Tournament Instances Successfully Created.")
}

function dev_duplicate(){
  if(userGate('dev') == false){return false;}
  var postfix = promptUser("Enter Postfix for Duplicated System","new name: current name + postfix")
  if(postfix == ""){
    duplicate();
  }
  else{duplicate(postfix);}
  ui.alert("Duplication Successful.")
}

function dev_load(){
  if(PropertiesService.getDocumentProperties().getProperty('status') == "SOURCE"){
    ui.alert("SOUCE Doucement Cannot be Automatically Loaded / Cleared");
    return false;
  }

  var range = promptUser("Enter Range","all,pre,fin,1,2,3,4");
  var cmd = promptUser("Enter Command","load, clear");

  if(cmd == null){ui.alert("No command given. Aborting.");return false;}

  var srcId = '';
  if(cmd.search('c') == -1){
    srcId = promptUser("Enter Tournament Category","By default, KYPT2020 will be used (23 teams, 6 rooms, 4 PF's).");
    if(srcId == ''){srcId = undefined;}
  }
  if(load(range,cmd,srcId) == 1){ui.alert(`Load / Clear Successful\nrange: ${range}\ncommand: ${cmd}`);}
  else{ui.alert(`Load / Clear Failed\nrange: ${range}\ncommand: ${cmd}`);}

}

function dev_add_staff(){
  if(userGate('dev') == false){return false;}
  add_staff();
  ui.alert("Staff Members Added");
}

function dev_clear_staff(){
  if(userGate('dev') == false){return false;}
  var result = askUser('Clear all staff members? They will lose all access to documents.');
  if(! result){
    ui.alert('Canceled');
    return false;
  }
  clear_staff();
  ui.alert("All staff members cleared");
}