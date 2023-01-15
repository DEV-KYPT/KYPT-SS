function read_all_properties() { //(for editor use only) logs all current parameter values.
  var readout = "";
  readout+= "\nScript Properties:";
  var keys_script = PropertiesService.getScriptProperties().getKeys();
  keys_script.sort()
  for (var key of keys_script) {
    readout += `\n\t${key}>>${PropertiesService.getScriptProperties().getProperty(key)}`;
    // Logger.log('%s>>%s', key, PropertiesService.getScriptProperties().getProperty(key));
  }

  readout += "\n\nUser Properties:";
  // Logger.log("User Properties:")
  var keys_user = PropertiesService.getUserProperties().getKeys();
  keys_user.sort()
  for (var key of keys_user) {
    readout += `\n\t${key}>>${PropertiesService.getUserProperties().getProperty(key)}`;
    // Logger.log('%s>>%s', key, PropertiesService.getUserProperties().getProperty(key));
  }

  readout += "\n\nDocument Properties:";
  // Logger.log("Document Properties:")
  var keys_doc = PropertiesService.getDocumentProperties().getKeys();
  keys_doc.sort()
  for (var key of keys_doc) {
    readout += `\n\t${key}>>${PropertiesService.getDocumentProperties().getProperty(key)}`;
    // Logger.log('%s>>%s', key, PropertiesService.getDocumentProperties().getProperty(key));
  }

  Logger.log(readout)
  return readout
}

function delete_properties(selection = "all"){
  if (selection == "all" || selection == "script"){
    PropertiesService.getScriptProperties().deleteAllProperties();
    Logger.log("Script Properties are Cleared")  
  }
  if (selection == "all" || selection == "user"){
    PropertiesService.getUserProperties().deleteAllProperties();
    Logger.log("User Properties are Cleared")
  }
  if (selection == "all" || selection == "document"){
    PropertiesService.getDocumentProperties().deleteAllProperties();
    Logger.log("Document Properties are Cleared")
  }
}

// function prop_temp(){
//   PropertiesService.getDocumentProperties().setProperty('folderID_template','1ERI_hbi-gjBb-vU8ft5KMt4X2rE0aCjZ');
// }