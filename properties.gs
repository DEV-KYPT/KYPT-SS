function read_all_properties() { //(for editor use only) logs all current parameter values.
  Logger.log("Script Properties:")
  for (var key in PropertiesService.getScriptProperties().getProperties()) {
    Logger.log('%s>>%s', key, PropertiesService.getScriptProperties().getProperty(key));
  }

  Logger.log("User Properties:")
  for (var key in PropertiesService.getUserProperties().getProperties()) {
    Logger.log('%s>>%s', key, PropertiesService.getUserProperties().getProperty(key));
  }

  Logger.log("Document Properties:")
  for (var key in PropertiesService.getDocumentProperties().getProperties()) {
    Logger.log('"%s">>"%s"', key, PropertiesService.getDocumentProperties().getProperty(key));
  }
  
  return  
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