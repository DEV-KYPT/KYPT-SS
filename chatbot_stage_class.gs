function filter_empty(arr){
  return arr.filter(element => {return element !== '';});
}

function to_int(item) {
  return parseInt(item, 10);
}

class CB_Stage{
  constructor(pf,rm,st){
    this.pf_obj = new PF(pf,rm);
    this.pf = pf;
    this.rm = rm;
    this.st = st;
  }

  // helper functions for chatbot.
  // Rule B: banned problems
  // Rule P: previously presented problems
  // Rule a: Rejected  By Reporter
  // Rule b: Presented By Reporter
  // Rule c: Opposed   By Opponent
  // Rule d: Presented By Opponent
  
  // returns an array of numbers corresponding to the rule
  retreive_rule(rule){
    if(rule == 'B'){return filter_empty(getSsSpreadsheet().getSheetByName('CoreData').getRange("BM2:BQ2").getValues()[0]);}
    if(rule == 'P'){
      var presented = []
      for(var i = 0;i<this.st-1;i++){
        presented.push(this.pf_obj.get_range_relative(11+i*15,11).getValue());
      }
      return presented;}
    if(rule == 'a'){return filter_empty(this.pf_obj.get_range_relative(11+15*(this.st-1),7).getValue().split(',')).map(to_int);}
    if(rule == 'b'){return filter_empty(this.pf_obj.get_range_relative(12+15*(this.st-1),7).getValue().split(',')).map(to_int);}
    if(rule == 'c'){return filter_empty(this.pf_obj.get_range_relative(13+15*(this.st-1),7).getValue().split(',')).map(to_int);}
    if(rule == 'd'){return filter_empty(this.pf_obj.get_range_relative(14+15*(this.st-1),7).getValue().split(',')).map(to_int);}
  }

  // returns an interger of how many rejects were done by the team BEFORE this PF.
  retreive_num_prev_rejects(){
    var now_rejects = filter_empty(this.pf_obj.get_range_relative(10+15*(this.st-1),11,1,7).getValues()[0]).length
    // Logger.log(now_rejects)
    return this.pf_obj.get_range_relative(5+15*(this.st-1),18).getValue()-now_rejects;
  }

  get_range_rej(){
    return this.pf_obj.get_range_relative(10+15*(this.st-1),11,1,7)
  }
  get_range_acc(){
    return this.pf_obj.get_range_relative(11+15*(this.st-1),11)
  }

  get_team(pos){ //pos: r(eporter) o(pponent) (r)e(viewer)
    if(pos == 'r'){return this.pf_obj.get_range_relative(5+15*(this.st - 1),6).getValue();}
    if(pos == 'o'){return this.pf_obj.get_range_relative(6+15*(this.st - 1),6).getValue();}
    if(pos == 'e'){return this.pf_obj.get_range_relative(7+15*(this.st - 1),6).getValue();}
  }
}

function class_stage_temp(){
  var pf = 3;
  var rm = 5;
  var st = 3;
  var a = new CB_Stage(pf,rm,st);
  Logger.log(`[B] banned        : ${a.retreive_rule('B')}`);
  Logger.log(`[P] presented     : ${a.retreive_rule('P')}`);
  Logger.log(`[a] Rejected  by R: ${a.retreive_rule('a')}`);
  Logger.log(`[b] Presented by R: ${a.retreive_rule('b')}`);
  Logger.log(`[c] Opposed   by O: ${a.retreive_rule('c')}`);
  Logger.log(`[d] Presented by O: ${a.retreive_rule('d')}`);
  Logger.log(`number of previous rejects : ${a.retreive_num_prev_rejects(st)}`);
  Logger.log(`rej range: ${a.get_range_rej().getA1Notation()}`)
  Logger.log(`acc range: ${a.get_range_acc().getA1Notation()}`)

}
