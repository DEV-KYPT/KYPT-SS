function read_all_properties() { //(for editor use only) logs all current parameter values.
  var readout = `Reading All Properties [${now}]`;

  var keys_script = PropertiesService.getScriptProperties().getKeys();
  var keys_user   = PropertiesService.getUserProperties().getKeys();
  var keys_doc    = PropertiesService.getDocumentProperties().getKeys();
  keys_script.sort();
  keys_user.sort();
  keys_doc.sort();

  var maxlen = 0;
  for(var key of keys_script.concat(keys_user).concat(keys_doc)){if(key.length>maxlen){maxlen = key.length;}}
  Logger.log(maxlen);

  readout += "\n\nScript Properties:";
  for (var key of keys_script) {readout += `\n\t"${key}"${' '.repeat(maxlen-key.length)} >> "${PropertiesService.getScriptProperties().getProperty(key)}"`;}
  readout += "\n\nUser Properties:";
  for (var key of keys_user)   {readout += `\n\t"${key}"${' '.repeat(maxlen-key.length)} >> "${PropertiesService.getUserProperties().getProperty(key)}"`;}
  readout += "\n\nDocument Properties:";
  for (var key of keys_doc)    {readout += `\n\t"${key}"${' '.repeat(maxlen-key.length)} >> "${PropertiesService.getDocumentProperties().getProperty(key)}"`;}

  Logger.log(readout)
  return readout
}

function delete_properties(selection = "all"){
  if (selection == "all" || selection == "script"){
    PropertiesService.getScriptProperties().deleteAllProperties();
    Logger.log("Script Properties Cleared")  
  }
  if (selection == "all" || selection == "user"){
    PropertiesService.getUserProperties().deleteAllProperties();
    Logger.log("User Properties Cleared")
  }
  if (selection == "all" || selection == "document"){
    PropertiesService.getDocumentProperties().deleteAllProperties();
    Logger.log("Document Properties Cleared")
  }
}