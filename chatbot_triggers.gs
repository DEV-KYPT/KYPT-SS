function onSubmit(form_data){
  Logger.log(`KYPT Chatbot Instruction Submitted.\nSPEC: PF${form_data.pf} RM${form_data.rm} ST${form_data.st},\nUSER: ${Session.getActiveUser().getEmail()}\nCMD : ${form_data.cmd}`);
  var chat_history = '';
  var do_insert = true;
  var conv = new Conversation(form_data.pf,form_data.rm,form_data.st);
  if(form_data.cmd != ''){
    if     (form_data.cmd[0] == 'u'){Logger.log('UNDO' );conv.pop_last()                ;} // undo
    else if(form_data.cmd[0] == 'c'){Logger.log('CLEAR');conv.init();conv.load()        ;} // clear
    else                            {Logger.log('ADD'  );conv.add_command(form_data.cmd);} // add
  }
  else{do_insert = false;}
  conv.execute_all(do_insert);
  return [conv.status(),conv.toHTML(),conv.tooltip()];
}

function remove_all_cmd_logs(){
  // TODO
}