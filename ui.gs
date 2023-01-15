
/**
 * [ui] Automatically triggered function for opening the document (also when refreshed). Contains all frontend handles
 * @return {null}
 */
function onOpen(){
  Logger.log("This file was opened by: " + Session.getActiveUser().getEmail() +" ");
  if(PropertiesService.getDocumentProperties().getProperty('status') == null){
    ui.createMenu("Initialize KYPT Scoring System")
    .addItem('Initialize Scoring System','initGate')
    .addToUi();
    ui.alert('This document was opened for the first time. Please Initialize with the dropdown menu above.')
    return;
  }
  if(! initGate()){return;}
  ui.createMenu("KYPT Script")
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

  ui.createMenu('KYPT Chatbot')
    .addItem('Activate Chatbot', 'user_show_chatbot')
    .addToUi();
}

/**
 * [ui] Check in the open of document of this script needs to be initialized. (Different logical flow)
 * 
 * @return {boolean} if the gate is passed
 */
function initGate(){
  if(PropertiesService.getDocumentProperties().getProperty('status') == null){
    Logger.log("This file was initialized by: " + Session.getActiveUser().getEmail() +" ");
    Logger.log("Internal Initialize Called (first time open)");
    read_all_properties();
    init_internal();
    Logger.log("System Initialized Sucessfully.");
    ui.alert(`Welcome to ${PropertiesService.getDocumentProperties().getProperty('category')}-${PropertiesService.getDocumentProperties().getProperty('callname')} Scoring System!\n Refresh page to access scripts.`)
    // onOpen();
    return false
  }
  else if(PropertiesService.getDocumentProperties().getProperty('status') == 'SOURCE'){
    var result = promptUser(
      "Source Editing Mode","Editing this file will change all future instances. Do you know what you are doing?",
      ButtonSet = ui.ButtonSet.YES_NO,trueButton = ui.Button.YES
    );
    if(result != PropertiesService.getScriptProperties().getProperty('_devPw') &&
      PropertiesService.getScriptProperties().getProperty('developers').search(Session.getActiveUser().getEmail()) == -1){
        ui.alert("Authentication Unsuccessful.");
        Logger.log("SOURCE authentication FAILED at: "+now);
        return false
    }
    Logger.log("SOURCE authentication successful at: "+now);
    return true
  }
  return true
}

/**
 * [ui] Credential check on frontend for authorization in certain functions
 * 
 * @param {string} mode supported modes: 'dev' (developer only access), 'user" (public access)
 * @return{boolean} returns true if gate is passed
 */
function userGate(mode = 'user'){
  Logger.log("KYPT Scoring System Script was Run : " + Session.getActiveUser().getEmail() + " as " + mode);
  if(mode.search('dev') != -1){
    if(Session.getActiveUser().getEmail() == ''){}
    else if(PropertiesService.getScriptProperties().getProperty('developers').search(Session.getActiveUser().getEmail()) != -1){
      return true
    }
    var result  = promptUser("Developer Sign-In","Your credentials are not recognized as developer. Please enter Password.");
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

/**
 * [ui] Wrapper for text input dialog boxes
 * 
 * @param {string} title the title of dialog box
 * @param {string} subtitle subtitle or description in dialog box
 * @param {ButtonSet} buttons the button set to use
 * @param {Button} trueButton the botton that corresponds to true
 * @return{(boolean|string)} returns the input text if the trueButton is pressed, false if not.
 */
function promptUser(title,subtitle,buttons = ui.ButtonSet.OK_CANCEL,trueButton = ui.Button.OK){  
  var result = ui.prompt(title,subtitle,buttons);
  if (result.getSelectedButton()==trueButton){
    return result.getResponseText();
  }
  return false;
}

/**
 * [ui] Wrapper for yes/no dialog boxes
 * 
 * @param {string} text text to display on dialog box
 * @param {ButtonSet} buttons the button set to use
 * @param {Button} trueButton the botton that corresponds to true
 * @return{boolean} returns if the trueButton is pressed
 */
function askUser(text,ButtonSet = ui.ButtonSet.YES_NO,trueButton = ui.Button.YES){
  if(ui.alert(text,ButtonSet) == trueButton){
    return true;
  }
  return false;
}


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

function user_show_chatbot() {
  if(userGate('user') == false){return false;}
  var html = HtmlService.createHtmlOutputFromFile('chatbot').setTitle('KYPT Chatbot');
  ui.showSidebar(html);
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
  ui.alert("New Tournament Instance Successfully Created.")
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