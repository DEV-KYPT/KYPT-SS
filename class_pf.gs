class PF { //pharses the correct data into a class.
  //data format: range_~: a range (call by reference)
  //           : value_~: a string (call by value)
  //           : ~      : a number (or tuple)
  constructor(pf,rm){
    this.pf = pf;
    this.rm = rm;
    this.pos = [2+70*(rm-1),2+24*(pf-1)] //top-left
    //    Logger.log("%d, %d",this.pos[0],this.pos[1])
    this.rmLoc = this.get_range_relative(0,17).getValue();
    this.numTeams = this.get_range_relative(16,0,1,1).getValue();
  }
  
  get_range_relative(rowOffset,colOffset,rows = 1,cols = 1){
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('PF Results').getRange(this.pos[0]+rowOffset,this.pos[1]+colOffset,rows,cols)
  }
  
  get_range_full() {
    return this.get_range_relative(0,0,69,23)
  }
  
  get_range_stage(stage) {
    return this.get_range_relative(4+15*(stage-1),4,5,18);
  }
  
  get_values_stage_rej(stage){
    return this.get_range_relative(10+15*(stage-1),11,1,7).getValues();
  }
  
  get_value_stage_acc(stage){
    return this.get_range_relative(11+15*(stage-1),11,1,1).getValue();
  }

  get_ranges_stage(stage){ // used for loading examples. returns the ranges of all blue spaces.
    var ranges = []
    ranges.push(this.get_range_relative(5+15*(stage-1),7,3,11));  //central (presenters and scores)
    ranges.push(this.get_range_relative(10+15*(stage-1),11,1,7)); //rejected problems
    if(this.pf != 4){ranges.push(this.get_range_relative(11+15*(stage-1),11,1,1))}; //accepted problem
    // Logger.log(ranges);
    return ranges;
  }

  get_ranges(){
    var ranges = []
    for(var i = 1; i<=this.numTeams;i++){
      // Logger.log(i);
      ranges = ranges.concat(this.get_ranges_stage(i));
      // Logger.log(ranges);
    }
    ranges.push(this.get_range_relative(68,21));
    return ranges;
  }
  
  add_stage(stage,body,template = false,capture = false) {
    // returns consise values of a pf stage, pharsed so that they don't contain metadata
  // if(! capture){
  var rejString = this.get_values_stage_rej(stage)[0].filter(function (el) {return el != "";}).join()
  //    console.log(this.get_values_stage_rej(stage))
  if(template){
    var preData = body.appendParagraph(`Stage ${stage} \t\tAccepted Problem:\t\t\t\tRejected Problem(s):\t`);
    preData.setFontSize(13).editAsText().setBold(true);
  }
  else{
    var preData = body.appendParagraph(
      `Stage ${stage} \t\tAccepted Problem: ${this.get_value_stage_acc(stage)} \t\tRejected Problem(s): ${rejString}`);
  }
preData.setHeading(DocumentApp.ParagraphHeading.NORMAL);
  // }
  
  var v = this.get_range_stage(stage).getValues();
  var repTeam = v[1][2];
  var numRej = v[1][14];
  var repWet = v[1][15];
  v.splice(4,1);
  for(var row of v){
    row.splice(17,1);
    row.splice(14,2);
    row.splice(1,1);
    row[row.length-1] = Math.round(row[row.length-1]*1000)/1000;
  }
  v[0][1] = "Team";
  v[0][2] = "Name";
  v[0][v[0].length-1] = "Score";

  if(template){ //deletes all score information of the result. for writing.
    for(var i = 1;i<v.length;i++){
      for(var j = 2;j<v[0].length-1;j++){
        v[i][j] = " ";
      }
      v[i][v[0].length-1] = "-";
    }
  }

  if(capture){ // no table, just add simple text and return
    body.appendParagraph(`Reporter Team: ${v[1][1]}\t\t Reporter Name: `)
    body.appendParagraph('IMAGE');
    body.appendParagraph(`Opponent Team: ${v[2][1]}\t\t Opponent Name: `);
    body.appendParagraph('IMAGE');
    body.appendParagraph(`Reviewer Team: ${v[3][1]}\t\t Reviewer Name: `);
    body.appendParagraph('IMAGE');
    
    body.appendPageBreak();
    return null;
  }

  var table = body.appendTable(v);
  
  if(capture){var columnWidths = [80,100,80,280];}
  else{var columnWidths = [38,100,40,35,35,35,35,35,35,35,35,35,35,35];}//av width: 595.276
  
  
  var style = table_style(table,columnWidths);
  
  style[DocumentApp.Attribute.FONT_SIZE] = 8;
  
  table.getCell(1,0).setAttributes(style);
  table.getCell(2,0).setAttributes(style);
  table.getCell(3,0).setAttributes(style);

  
  var postText = "\n "
  if(repWet < 3 && (! template)){
    postText = `\nReporting Team Reached ${numRej} Rejects. Calculated Reporter Weight is ${repWet}`
  }

  var postData = preData.appendText(postText);
  postData.setFontSize(8).setItalic(true);  
  return table;
}


get_range_summary(){
  return this.get_range_relative(61,6,this.numTeams+1,16);
}

add_summary(body){
  body.appendParagraph("Results").setHeading(DocumentApp.ParagraphHeading.NORMAL);
  var v = this.get_range_summary().getValues()
  var i;
  for(i of v){
    i.splice(1,13);
    i[i.length-2] = Math.round(i[i.length-2]*1000)/1000;
    if(i[i.length-1]==1){i[i.length-1] = "O";}
    else{i[i.length-1] = "";}
  }
  v[0][v[0].length-1] = "FW";
  v[0][v[0].length-2] = "Total";

    var table = body.appendTable(v);
    var style = table_style(table,[100,35,30])
    style[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.CENTER;
    table.setAttributes(style);
    return table;
  }
}
         