function str2HTML(s){
  return s.replace(/(?:\r\n|\r|\n)/g, '<br>');
}

function simplify_teamname(s){
  return s.slice(0,2)+s.slice(-1);
}

class Quote{
  constructor(cmd_string){ // formatted: (userID)++(timestamp)++(command)
    [this.user_id,this.time,this.cmd] = cmd_string.split('++')
    this.resp = '';
  }

  toString(add_cmd_tags = false){
    var s = `${this.user_id.slice(0,10)}>> ${this.cmd}`
    if(add_cmd_tags){s = `<span style="color:${cb_color['cmd']};font-weight:bold;">${s}</span>`}
    if(this.resp != ''){s+=`${this.resp}`};
    return s;
  }

  toHTML(){
    return str2HTML(this.toString(true));
  }

  serialize(){
    return `${this.user_id}++${this.time}++${this.cmd}`
  }
}

class Conversation{

  /////////// CONSTRUCTOR FUNCTION
  constructor(pf,rm,st){
    this.pf = pf;
    this.rm = rm;
    this.st = st;

    this.st_obj = new CB_Stage(pf,rm,st); //new object that retrieves relevant data;

    this.property_key = `cmdlog_pf${this.pf}-rm${this.rm}-st${this.st}`;

    this.quotes = [];
    if(this.is_empty() ){this.init()}
    this.load()

    this.compute_state = 0; //0: un-initialized, 1: under computation, 2: finished.
    Logger.log(''+this);
  }
  ////////// SERIALIZED LOGISTICS
  is_empty(){ // checks for any serialized data within properties
    return (PropertiesService.getDocumentProperties().getProperty(this.property_key) == null)
  }
  init(){
    var init_string = `${getUserID()}++${getNow()}++init`;
    PropertiesService.getDocumentProperties().setProperty(this.property_key,init_string);
    return [init_string,]
  }
  load(){ // brings serialized document property into this.quotes[]
    var raw_string = PropertiesService.getDocumentProperties().getProperty(this.property_key);
    if(raw_string == null){return null}
    this.quotes = [];
    for(var s of raw_string.split("\n")){this.quotes.push(new Quote(s));}
  }
  save(){ // saves this.quotes[] into serialized string without responses
    var serialized_string = '';
    for(var q of this.quotes){
      serialized_string += q.serialize() + '\n';
    }
    PropertiesService.getDocumentProperties().setProperty(this.property_key,serialized_string.slice(0,-1));
  }

  ////////// COMMAND MANIPULATION
  add_command(cmd){
    this.quotes.push(new Quote(`${getUserID()}++${getNow()}++${cmd}`));
    this.save();
  }

  pop_last(){ // for "undo" command
    if(this.quotes.length >= 2){
      this.quotes.pop();
      this.save();
    }
  }

  ////////// OUTPUT / REPRESENTATION
  toString(add_cmd_tags = false){
    var s = '';
    for(var q of this.quotes){
      s += q.toString(add_cmd_tags) + '\n';
    }
    return s
  }

  toHTML(){
    return str2HTML(this.toString(true));
  }

  ////////// IMPORTANT: Command Responses

  init_computation(){
    this.all_problems = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17];
    this.rule = {
      'B':this.st_obj.retreive_rule('B'),
      'P':this.st_obj.retreive_rule('P'),
      'a':this.st_obj.retreive_rule('a'),
      'b':this.st_obj.retreive_rule('b'),
      'c':this.st_obj.retreive_rule('c'),
      'd':this.st_obj.retreive_rule('d'),
    }
    this.rule_description = {
      'B':"Banned in KYPT",
      'P':"Presented in this PF",
      'a':"Rejected by Reporter",
      'b':"Presented by Reporter",
      'c':"Opposed by Opponent",
      'd':"Presented by Opponent",
      'o':"Out of Range",
    }
    this.active_rules  = ['B','P','a','b','c','d'];

    this.new_rejects = [];
    this.num_rejects = this.st_obj.retreive_num_prev_rejects();

    this.possible_problems = [];
    this.stabilize();
    // Logger.log(this.rule);
    // Logger.log(typeof(this.rule['b'][0]))
    // Logger.log(this.possible_problems);
    // this.quotes[0].resp = this.possible_problems;
    this.challenged_p = 0; // challenged problem (0 means no problem challenged.)
    this.compute_state = 1;
  }

  challenge_conflicts(p,only_active = true){
    var conflict = [];
    if(this.all_problems.includes(p) == false){
      conflict.push("o");
      return conflict
    }
    if(only_active){ // check for active rules only (used generally)
      for(var r of this.active_rules){if(this.rule[r].includes(p)){conflict.push(r);}}
    }
    else{ // check for all rules (used in tables)
      for(var r in this.rule){if(this.rule[r].includes(p)){conflict.push(r);}}
    }
    // Logger.log(conflict);
    return conflict
  }

  can_challenge(p){
    return(this.challenge_conflicts(p).length == 0)
  }

  can_reject(){
    return(this.num_rejects < regulation['max_rejects']);
  }

  apply_rules(){
    this.possible_problems = [];
    for(var p of this.all_problems){
      if(this.can_challenge(p)){
        this.possible_problems.push(p);
      }
    }
    // Logger.log(this.possible_problems)
  }

  remove_rule(){
    var removeed_rule = this.active_rules[this.active_rules.length-1]
    this.active_rules = this.active_rules.slice(0,-1);
    return removeed_rule;
  }

  stabilize(){
    var removeed_rules = [];
    this.apply_rules();
    while(this.possible_problems.length < regulation['remove_th'] && this.active_rules.length > 2){
      removeed_rules.push(this.remove_rule());
      this.apply_rules();
    }
    return removeed_rules;
  }

  html_people(){
    var html = '<table>';
    html += '<tr><th>Rep.</th><th>Opp.</th><th>Rev.</th></tr>';
    html += `<tr><td>${simplify_teamname(this.st_obj.get_team('r'))}</td><td>${simplify_teamname(this.st_obj.get_team('o'))}</td><td>${simplify_teamname(this.st_obj.get_team('e'))}</td></tr>`;
    html += '</table>';
    return html
  }

  html_table(){
    var html = '<table>';
    var temp_conflicts = []

    // first row (header)
    html += '<tr>'
    html += `<th>##</th>`
    for (let r in this.rule){
      if(this.active_rules.includes(r)){html += `<th>${r}</th>`;}
      else{html += `<th style="color:${cb_color['rela']}">${r}</th>`;}
    }
    html += '</tr>'
  
    // number rows
    for (var num of this.all_problems){
      html += '<tr>'
      if(this.possible_problems.includes(num)){html += `<td style="color:${cb_color['chal']}">`;}
      else{html += '<td>';}
      html += `${num}</td>`
      temp_conflicts = this.challenge_conflicts(num,false);
      for (let r in this.rule){
        if(this.active_rules.includes(r)){html += '<td>';}
        else{html += `<td style="color:${cb_color['rela']}">`;}
        if(temp_conflicts.includes(r)){html+=`${r}`;}
        html += '</td>';
      }
      html += '</tr>'
    }
    html += '</table>'
    return html
  }

  text_table(){
    var s = '#\t: conflicts';
    for(var num of this.all_problems){
      s += `\n${num}\t: ${this.challenge_conflicts(num)}`;
    }
    return s
  }

  text_summary(){
    var s = '';
    s+= `New Rejects:${this.new_rejects}`;
    s+= `\nTotal # of Rej.:${this.num_rejects}`;
    if(this.compute_state < 2){
      s+= `\nChallenge-able:\n<span style="color:${cb_color['chal']}">${this.possible_problems}</span>`;
      s+= `\nCurrently Challenged: <span style="color:${cb_color['chal']}"><b>${((this.challenged_p==0) ? "none":this.challenged_p)}</b></span>`;
    }
    else{s+= `\nAccepted: <span style="color:${cb_color['acc']}"><b>${this.challenged_p}</b></span>`;}
    return s;
  }

  tooltip(){
    var tooltip = '';
    if(this.compute_state < 2){
      if(this.challenged_p < 1){ // no challenged problem
        tooltip += `<span style="color:${cb_color["chal"]}"><b>##(1~${this.all_problems[this.all_problems.length-1]})</b>:challenge problem</span>`;
      }
      else{
        tooltip += `<span style="color:${cb_color["acc"]}"><b>a</b>:accept problem</span>`;
        tooltip += `\n<span style="color:${cb_color["rej"]}"><b>r</b>:reject problem</span>`;
      }
    }
    else{tooltip   += 'Computation Finished.'}
    tooltip   += `\n<span style="color:${cb_color["undo"]}"><b>u</b>:undo last command</span>`;
    return str2HTML(tooltip);
  }

  status(table = 'html'){
    // var s = '<hr>';
    var s = '';
    s+= this.html_people();
    if(table == 'text'){s+=this.text_table();}
    if(table == 'html'){s+=this.html_table();}
    s+= this.text_summary();
    s += '<hr>'
    return str2HTML(s);
  }

  insert_result(do_insert = true){
    if(do_insert == false){return ;}
    var rejects = this.new_rejects
    while(rejects.length < 7){rejects.push("")}
    this.st_obj.get_range_rej().setValues([this.new_rejects]);
    this.st_obj.get_range_acc().setValue([this.challenged_p]);
  }

  // Possible commands:
  // i: initialize
  // num(1~17): challenge probelem
  // a: accept challenged problem
  // r: reject challenged problem

  execute_cmd(index,do_insert = true){ // executes the i th command within this.quotes. adds the response.
    var cmd = this.quotes[index].cmd.slice(0,2);
    var cmd_type = "a"; //"a": action (i,a,r), "c": challenge (1~17)
    if(/\d/.test(cmd)){cmd = parseInt(cmd,10); cmd_type = "c"}
    else              {cmd = cmd[0]          ; cmd_type = "a"}
    Logger.log(`Processing QUOTE#${index} (${this.quotes[index].cmd}) <preprocessed: ${cmd} , type: ${cmd_type}>`);
    var response = `[${cmd_type}:${cmd}]`;
    var err = false;

    if(this.compute_state == 2)                         {response += "\n[ERR] Computation Finished. No Actions Possible"  ; err = true;}
    else if(this.challenged_p != 0 && (cmd_type == "c")){response += "\n[ERR] Cannot Challenge Multiple Problems at once!"; err = true;}
    else if(this.challenged_p == 0 && (cmd_type == "a")){response += "\n[ERR] No problems are challenged yet!"            ; err = true;}

    if(cmd_type == "a" && (err == false)){
      if(cmd == 'i'){
        if(this.compute_state != 0){response += "\n[ERR] Computation was Already Initialized.";err = true;}
        else{this.init_computation();response += `\n[ PF${this.pf} RM${this.rm} ST${this.st} ] Initialized`;}
      }
      else if(this.compute_state == 0){response += "\n[ERR] You Must First Initialize Computation!";err = true;}
      else if(cmd == 'r'){
        if(this.can_reject()){
          this.rule['a'].push(this.challenged_p);
          this.new_rejects.push(this.challenged_p);
          this.num_rejects += 1;
          response += `\n[OK] P#.<span style="color:${cb_color["chal"]}">${this.challenged_p}</span> <span style="color:${cb_color["rej"]}">Rejected</span>`;
          this.challenged_p = 0;
          var removeed_rules = this.stabilize();
          for(var r of removeed_rules){
            response += `\n<span style="color:${cb_color['rela']}">!!Rule[${r}] Removeed!!\n(${this.rule_description[r]})</span>`;
          }
        }
        else{
          response += "\n[ERR] Cannot Reject (max rejects reached)";
          err = true;
        }
      }
      else if(cmd == 'a'){
        response += `\n[OK] P#.<span style="color:${cb_color["chal"]}">${this.challenged_p}</span> <span style="color:${cb_color["acc"]}">Accepted</span>.`;
        response += `\n<span style="font-weight:bold;">Challenge Complete.</span>`;
        response += `\n<span style="color:${cb_color["rej"]}"->Rej.:${this.new_rejects}</span>`;
        response += `\n<span style="color:${cb_color["acc"]}"->Acc.:${this.challenged_p}</span>`;
        this.insert_result(do_insert);
        this.compute_state = 2;
      }
      else{response += "\n[ERR] Invalid Command (possible commands: [a/r])";err = true;}
    }

    if(cmd_type == "c" && (err == false)){
      if(this.can_challenge(cmd)){
        this.challenged_p = cmd;
        response += `\n[OK] P#.<span style="color:${cb_color["chal"]}">${this.challenged_p} Challenged</span>`;
      }
      else{
        response += "\n[ERR] Cannot Challenge Problem\nConflicts:";
        var conflicts = this.challenge_conflicts(cmd);
        for(var c of conflicts){
          response += `\n[${c}]${this.rule_description[c]}`;
        }
        err = true;
      }
    }

    // if(err){response += "\nERR occurred. Nothing changed."}
    // else{response += " [O]"}
    // if(index == this.quotes.length -1){response += `${this.status()}`;}
    this.quotes[index].resp = response;
    return response;
  }

  execute_all(do_insert = true){
    for(var index = 0;index < this.quotes.length;index++){this.execute_cmd(index,do_insert);}
    Logger.log("Processing Complete")
    Logger.log(this.toString())
  }
}