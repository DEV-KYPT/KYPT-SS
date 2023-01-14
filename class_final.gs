class FINAL{
  constructor(){
    this.pos = [1,1] //top-left
    //    Logger.log("%d, %d",this.pos[0],this.pos[1])
  }
  
  get numTeams(){
    //    Logger.log("getting numTeams: %d, %d %s",this.pos[0],this.pos[1],this.get_range_relative(16,0,1,1).getA1Notation());
    return this.get_range_relative(17,0,1,1).getValue();
  }
  
  get_range_relative(rowOffset,colOffset,rows,cols){
    return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Final').getRange(this.pos[0]+rowOffset,this.pos[1]+colOffset,rows,cols)
  }
  
  get_range_full() {
    return this.get_range_relative(0,0,44,55)
  }
  
  
  get_range_stage(stage) {
    return this.get_range_relative(4+8*(stage-1),4,5,49);
  }

  get_ranges_stage_input(stage){
    var ranges = [];
    ranges.push(this.get_range_relative(5+8*(stage-1),7,3,43));
    ranges.push(this.get_range_relative(9+8*(stage-1),8,1,1)); //accepted problems
    return ranges;
  }

  get_ranges(){
    var ranges =[];
    for(var i = 1;i<=this.numTeams;i++){
      ranges = ranges.concat(this.get_ranges_stage_input(i));
    }
    ranges.push(this.get_range_relative(5,0,4,2)); //teams
    ranges.push(this.get_range_relative(4,8,1,42)); //juries
    ranges.push(this.get_range_relative(43,40,1,10)); //timekeepers
    return ranges;
  }
  
//  get_values_stage_rej(stage){
//    return this.get_range_relative(10+15*(stage-1),11,1,7).getValues();
//  } //finalists do not reject problems
  
  get_value_stage_acc(stage){
    return this.get_range_relative(9+8*(stage-1),8,1,1).getValue();
  }
  
  add_stage(stage,body,template = false) {
    // returns consise values of a pf stage, pharsed so that they don't contain metadata
    // var rejString = this.get_values_stage_rej(stage)[0].filter(function (el) {return el != "";}).join()
    //    console.log(this.get_values_stage_rej(stage))
    var preData = body.appendParagraph(`Stage ${stage} \t\tAccepted Problem: ${this.get_value_stage_acc(stage)}`);
  preData.setHeading(DocumentApp.ParagraphHeading.NORMAL).editAsText().setFontSize(7).setBold(true);
  
  var v = this.get_range_stage(stage).getValues();
  var repTeam = v[1][2];
//  var numRej = v[1][14];
//  var repWet = v[1][15];
  v.splice(4,1);
  for(var row of v){
    row.splice(48,1);
    row.splice(46,1);
    row.splice(1,1);
    row[row.length-1] = Math.round(row[row.length-1]*1000)/1000;
    if(row != v[0]){
      for(var j = 3;j<45;j++){
        if (row[j] != ''){row[j] = oneDigit(row[j]);}
      }
    }

  }
  v[0][1] = "Team";
  v[0][2] = "Name";
  v[0][v[0].length-1] = "Score";
  // Logger.log(v);

  if(template){ //deletes all score information of the result. for writing.
    for(var i = 1;i<v.length;i++){
      for(var j = 2;j<v[0].length-1;j++){
        v[i][j] = " ";
      }
      v[i][v[0].length-1] = "-";
    }
    v[0][3] = '_\n_\n_';
  }

  var table = body.appendTable(v);
  var columnWidths = [38,100,40];
  // Logger.log("line 63");
  columnWidths[45] = 40;
  
  var style = table_style(table,columnWidths,7);
  style[DocumentApp.Attribute.BOLD] = true;
  style[DocumentApp.Attribute.FONT_SIZE] = 6;
  for(var j = 3; j<=45;j++){
    table.getCell(0,j).setAttributes(style);
  }
  
//  var postText = "\n "
//  if(repWet < 3){
//    postText = `\nReporting Team Reached ${numRej} Rejects. Calculated Reporter Weight is ${repWet}`
//  }
//  var postData = preData.appendText(postText);
//  postData.setFontSize(8).setItalic(true);  
  // table.setTextAlignment(DocumentApp.)
  // table.editAsText().setItalic(false).setFontSize(9)
  return table;
}


get_range_summary(){
  return this.get_range_relative(36,6,this.numTeams+1,9);
}

add_summary(body){
  body.appendParagraph("Results").setHeading(DocumentApp.ParagraphHeading.NORMAL).editAsText().setFontSize(7).setBold(true);
  var v = this.get_range_summary().getValues();
  var i;
  for(i of v){
    i.splice(1,6);
    i[i.length-2] = Math.round(i[i.length-2]*1000)/1000;
//    if(i[i.length-1]==1){i[i.length-1] = "O";}
//    else{i[i.length-1] = "";}
    i[i.length-1] = oneDigit(i[i.length-1]);
  }
    v[0][v[0].length-1] = "Rank";
    v[0][v[0].length-2] = "Total";
    
    var table = body.appendTable(v);
    var style = table_style(table,[100,35,30],7)
    style[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.CENTER; //doesn't work
    table.setAttributes(style);
    
    return table;
  }
  }