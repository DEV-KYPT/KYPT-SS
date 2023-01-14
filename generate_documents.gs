function document_init(name,portrait = true,header = true,template = false){
  var doc = DocumentApp.create(name);
  var docId = doc.getId()
  if(template){DriveApp.getFileById(docId).moveTo(DriveApp.getFolderById(PropertiesService.getDocumentProperties().getProperty('folderID_template')));}
  else{DriveApp.getFileById(docId).moveTo(DriveApp.getFolderById(PropertiesService.getDocumentProperties().getProperty('folderID_result')));}
  paper_size(doc, 'a4_size', portrait);
  var style = {}
  style[DocumentApp.Attribute.FONT_FAMILY] = "Times New Roman";
  style[DocumentApp.Attribute.ITALIC]      = false;
  doc.getBody().setHeadingAttributes(DocumentApp.ParagraphHeading.HEADING1,style);
  doc.getBody().setHeadingAttributes(DocumentApp.ParagraphHeading.HEADING2,style);
  doc.getBody().setHeadingAttributes(DocumentApp.ParagraphHeading.HEADING3,style);
  doc.getBody().setHeadingAttributes(DocumentApp.ParagraphHeading.HEADING4,style);
  doc.getBody().setHeadingAttributes(DocumentApp.ParagraphHeading.HEADING5,style);
  doc.getBody().setHeadingAttributes(DocumentApp.ParagraphHeading.HEADING6,style);
  doc.getBody().setHeadingAttributes(DocumentApp.ParagraphHeading.SUBTITLE,style);
  // var style = {}
  style[DocumentApp.Attribute.LINE_SPACING] = 0.7;
  doc.getBody().setHeadingAttributes(DocumentApp.ParagraphHeading.NORMAL,style);

  style[DocumentApp.Attribute.BOLD] = true;
  doc.getBody().setHeadingAttributes(DocumentApp.ParagraphHeading.TITLE,style);

  if(header){
    if(PropertiesService.getDocumentProperties().getProperty("status") == "SOURCE"){
      doc.addHeader().getParagraphs()[0].appendText("XYPT-SOURCE");    
    }
    else{
      doc.addHeader().getParagraphs()[0].appendText(PropertiesService.getDocumentProperties().getProperty("category")+PropertiesService.getDocumentProperties().getProperty("callname"));
    }
    // doc.addHeader().appendParagraph("TEST");
    doc.addFooter().getParagraphs()[0].appendText("Document Generated: "+now);
  }

  doc.setMarginBottom(5);
  doc.setMarginTop(5);
  doc.setMarginLeft(15);
  doc.setMarginRight(15);
  
  return doc;
}

function savePDF(doc){
  docFile = DriveApp.getFileById(doc.getId());
  doc.saveAndClose();
  docblob = docFile.getAs(MimeType.PDF);
  /* Add the PDF extension */
  docblob.setName(doc.getName() + ".pdf");
  var pdf = DriveApp.createFile(docblob);
  pdf.moveTo(DriveApp.getFolderById(PropertiesService.getDocumentProperties().getProperty('folderID_result')));
  return pdf;
}

function table_style(table,columnWidths,fontSize = 9,style = undefined){
  if(style == undefined){
    style = {};
    style[DocumentApp.Attribute.HORIZONTAL_ALIGNMENT] = DocumentApp.HorizontalAlignment.CENTER;
    style[DocumentApp.Attribute.VERTICAL_ALIGNMENT]   = DocumentApp.VerticalAlignment.CENTER;
    style[DocumentApp.Attribute.FONT_SIZE] = fontSize;
    style[DocumentApp.Attribute.ITALIC]    = false;
    style[DocumentApp.Attribute.BOLD]      = false;
    style[DocumentApp.Attribute.PADDING_LEFT] = 3;
    style[DocumentApp.Attribute.PADDING_RIGHT] = 1;
    style[DocumentApp.Attribute.PADDING_TOP] = 2;
    style[DocumentApp.Attribute.PADDING_BOTTOM] = 2;
  }
  
  for(var i = 0; i<table.getNumRows();i++){
    for(var j = 0; j<columnWidths.length;j++){
      // Logger.log("%d,%d (total j: %d)",i,j,v[0].length);
      table.getCell(i,j).setAttributes(style);
      if(i === 0){table.setColumnWidth(j,columnWidths[j])}
    }
  }
return style
}

function gen_pfrm(pf = 1,rm = 1,docIn = undefined,docs = true,pdf = true,template = false,capture = false){
  // template true -> capture false: write template
  // template true -> capture false: capture template
  if(docIn == undefined){
    if(capture){var doc  = document_init(`CAPTURE_TEMPLATE_PF${pf}_RM${rm}`,true,false,true);}
    else{var doc  = document_init(`${getFullName_Bracket()}room_result_pf${pf}_rm${rm}_`+getNow());}
  }

  else{
    var doc = docIn;
    doc.getBody().appendPageBreak();
  }

  var body = doc.getBody();
  var docId = doc.getId();
  
  pfData = new PF(pf,rm);
  
  if(capture){ 
  var style = {}
  style[DocumentApp.Attribute.LINE_SPACING] = 0.7;
  doc.getBody().setHeadingAttributes(DocumentApp.ParagraphHeading.NORMAL,style);
  }

  var str_pfInfo = `PF: ${pf}, Room No. ${rm} (${pfData.rmLoc})`;

  if(! capture){
    if(doc == undefined){var title = body.getParagraphs()[0];}
    else{var title = body.appendParagraph('');}
    // Access the body of the document, then add a paragraph.
    if(template && (!capture)){title.appendText("PF Result - Written");}
    else{title.appendText("Confirmation of Result");}
    title.setHeading(DocumentApp.ParagraphHeading.HEADING1).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

    var pfInfo = body.appendParagraph(str_pfInfo);
    pfInfo.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  
    if(template){ var note = body.appendParagraph('Note: This is the written version of the pf results. And the base document for tracking.');}
    else{var note = body.appendParagraph('Note: Numbers here are rounded, while the system calculates un-rounded numbers.');}
    note.setAlignment(DocumentApp.HorizontalAlignment.RIGHT).setItalic(true);
    note.editAsText().setFontSize(8);
    body.appendParagraph('').setItalic(false);
    
    var footer = doc.getFooter().getParagraphs()[0];
    var header = doc.getHeader().getParagraphs()[0];
  }
  else{
    var footer = doc.addFooter().getParagraphs()[0];
    var header = doc.addHeader().getParagraphs()[0]
    header.appendText("PF Result - Captured: "+str_pfInfo).editAsText().setBold(true);
  }
  
  tables = [];
  for(i=1;i<=pfData.numTeams;i++){ //alot of things are 1-indexed. be wary
    tables.push(pfData.add_stage(i,body,template,capture));
  }

  if(! template){var summary = pfData.add_summary(body);}
  
  var confirmQuote = body.appendParagraph("\nThe Preceding Results have Been Checked and Confirmed.").setHeading(DocumentApp.ParagraphHeading.NORMAL).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  confirmQuote.editAsText().setBold(true).setFontSize(15);
  
  if(template && (docIn == undefined)){
    if(! capture){footer.appendText('\n');}
    footer.appendText("Confirmation of Chair\tName   _________________ \tSignature _________________________________________");
  }

  if(capture){body.getParagraphs()[0].removeFromParent();}

  var signatureQuote = '';
  signatureQuote += "\n\nEvaluating Timekeeper\tName   _________________ \tSignature ______________________________________________\n"
  signatureQuote += "\n\nAdministrative Juror\tName   _________________ \tSignature ______________________________________________\n"
  
  signatureOpening = body.appendParagraph(signatureQuote);
  signatureOpening.setHeading(DocumentApp.ParagraphHeading.NORMAL);

  if(pdf){
    var pdf = savePDF(doc);
    if (! docs){ return pdf;}
    else {return [DocumentApp.openById(docId),pdf];}
  }
  else{
    return doc;
  }
}

function gen_pf_status(doc = undefined, docs = true, pdf = true, name_override = undefined,confirm = false){
  if(doc == undefined){
    if (name_override == undefined){
      var doc = document_init(`${getFullName_Bracket()}pf_status_${getNow()}`,true);
    }
    else{var doc = document_init(name_override);}
  }
  else{
    doc.getBody().appendPageBreak();
  }
  var body = doc.getBody();
  var docId = doc.getId();
  
  var title = body.getParagraphs()[0];
  title.appendText(`Leaderboard Status : ${getNow()}`);
  title.setHeading(DocumentApp.ParagraphHeading.TITLE).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  var note = body.appendParagraph('Note: Numbers here are rounded, while the system calculates un-rounded numbers.');
  note.setAlignment(DocumentApp.HorizontalAlignment.RIGHT).setItalic(true);
  note.editAsText().setFontSize(8);
  body.appendParagraph('').setItalic(false);

  var v = getSsSpreadsheet().getRange("'3. Leaderboard'!O2:V26").getValues();
  var table = doc.appendTable(v);
  var style = table_style(table,[150,50,50,50,50,80,80,50],12);

  if(confirm){
    var confirmQuote = body.appendParagraph("\n\nThe Above Results have Been Checked and Confirmed.")
    .setHeading(DocumentApp.ParagraphHeading.NORMAL).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    confirmQuote.editAsText().setBold(true).setFontSize(15);
      
    signatureOpening = body.appendParagraph(
      "\n\nEvaluator          Name   _________________ \tSignature __________________________________________________\n"+
      "\n\nAdministrator    Name   _________________ \tSignature __________________________________________________"
    )
    signatureOpening.setHeading(DocumentApp.ParagraphHeading.NORMAL)
  }

  if(pdf){
    var pdf = savePDF(doc);
    if (! docs){ return pdf;}
    else {return [DocumentApp.openById(docId),pdf];}
  }
  else{
    return doc;
  }

}

function gen_pf_summary(pf = 1,total_rm = 5,docs = true,pdf = true){
  doc = gen_pf_status(undefined,true,false,`${getFullName_Bracket()}pf_summary_${now}`);
  var docId = doc.getId();
  for(var rm = 1; rm <= total_rm; rm++){
    doc = gen_pfrm(pf,rm,doc,true,false);
  }
  
  if(pdf){
    var pdf = savePDF(doc);
    if (! docs){ return pdf;}
    else {return [DocumentApp.openById(docId),pdf];}
  }
  else{
    return doc;
  }
}

function gen_final(doc = undefined,docs = true,pdf = true,template = false){
  // TODO: pharse rm value to match with room numbers.
  if(doc == undefined){
    if(template){var doc = document_init(`TEMPLATE_FINAL`,false);}
    else{var doc = document_init(`${getFullName_Bracket()}final_result_${now}`,false);}
  }
  else{
    doc.getBody().appendPageBreak();
  }
  var body = doc.getBody();
  var docId = doc.getId();
  
  pfData = new FINAL();
  
  // Access the body of the document, then add a paragraph.

  var title = body.getParagraphs()[0];
  if(template){title.appendText("Finals Result");}
  else{title.appendText("Confirmation of Result");}

  title.setHeading(DocumentApp.ParagraphHeading.HEADING1).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  var pfInfo = body.appendParagraph(`Finals`)
  pfInfo.setAlignment(DocumentApp.HorizontalAlignment.RIGHT);
  
  if(template){var note = body.appendParagraph('Note: This is the written version of the pf results. And the base document for tracking.');}
  else{var note = body.appendParagraph('Note: Numbers here are rounded, while the system calculates un-rounded numbers.');}

  note.setAlignment(DocumentApp.HorizontalAlignment.RIGHT).setItalic(true);
  note.editAsText().setFontSize(8);
  body.appendParagraph('').setItalic(false);  
  
  tables = [];
  for(i=1;i<=pfData.numTeams;i++){ //alot of things are 1-indexed. be wary
    tables.push(pfData.add_stage(i,body,template));
  }
  if(! template){ var summary = pfData.add_summary(body);}
  
  body.appendPageBreak();
  
  var confirmQuote = body.appendParagraph("\nThe Preceding Results have Been Checked and Confirmed.").setHeading(DocumentApp.ParagraphHeading.NORMAL).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  confirmQuote.editAsText().setBold(true).setFontSize(15);
  
  var signatureText = ""
  for(var i = 1;i<=5;i++){
    signatureText += `\n\nTimekeeper ${i}     Name   __________ \tSignature ________________________________________\n`;
  }
  signatureText +=  `\n\nEvaluator            Name   __________ \tSignature ________________________________________\n`;
  signatureText +=  `\n\nAdministrator     Name   __________ \tSignature ________________________________________\n`;
  
  var signatureOpening = body.appendParagraph(signatureText)
  signatureOpening.setHeading(DocumentApp.ParagraphHeading.NORMAL).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  
  if(pdf){
    var pdf = savePDF(doc);
    if (! docs){ return pdf;}
    else {return [DocumentApp.openById(docId),pdf];}
  }
  else{
    return doc;
  }
}

function gen_write_template_all(total_pf = 4,total_rm = 5,docs = true,pdf = true){
  doc = gen_pfrm(1,1,undefined,true,false,true);
  var docId = doc.getId();
  for(var pf = 1; pf <= total_pf; pf++){
    for(var rm = 1; rm <= total_rm; rm++){
      if(pf == 1 && rm == 1){continue;}
      doc = gen_pfrm(pf,rm,doc,true,false,true);
    }
  }
  
  if(pdf){
    var pdf = savePDF(doc);
    if (! docs){ return pdf;}
    else {return [DocumentApp.openById(docId),pdf];}
  }
  else{
    return doc;
  }
}

function gen_draw(confirm = false,doc = undefined,docs = true,pdf = true){
  if(doc == undefined){
    var doc = document_init(`${getFullName_Bracket()}draw_${now}`);
  }
  else{
    doc.getBody().appendPageBreak();
  }
  var body = doc.getBody();
  var docId = doc.getId();
  
  var title = body.getParagraphs()[0];
  title.appendText("Tournament Draw");
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  var note = body.appendParagraph('The order of teams listed (top to bottom) correspond to teams starting as Reporter, Opponent, Reviewer, Observer, Respectively.');
  note.setAlignment(DocumentApp.HorizontalAlignment.RIGHT).setItalic(true);
  note.editAsText().setFontSize(8);
  body.appendParagraph('').setItalic(false);  

  // add draw here

  var v = SpreadsheetApp.getActiveSpreadsheet().getRange(`Draw!A3:M24`).getValues();
  var rooms = 6;
  while(v[3][rooms*2] == ''){rooms--;}

  for(var i = 0;i<v.length;i++){
    v[i].splice(rooms*2+1,2*(6-rooms));
  }

  for(var i = 1;i<v[0].length;i=i+2){
    v[0][i+1] = v[0][i];
    v[1][i+1] = v[1][i];
  }

  for(var i = 0;i<v.length;i++){
    for(var j = 0;j<v[0].length;j++){
      if(j%2 == 1){
        v[i][j] = ' ';
      }
      else if(typeof v[i][j] == typeof 1.0){
        v[i][j] = num_to_str(v[i][j]);
      }
    }
  }

  v[0][0] = 'PF';
  v[1][0] = '#';

  var table = body.appendTable(v);

  var mul = 560/(1+ 6 * rooms);

  var columnWidths = [1*mul]; //av width: 595.276
  
  for(var i = 0;i<rooms;i++){
    columnWidths.push(1*mul);
    columnWidths.push(5*mul);
  }

  var style = table_style(table,columnWidths);

  //add drawlist here

  var list_v_raw = SpreadsheetApp.getActive().getRange('Draw!U4:V27').getValues();

  for(var i = 0;i<list_v_raw.length;i++){
    for(var j = 0;j<list_v_raw[0].length;j++){
      if(typeof list_v_raw[i][j] == typeof 1.0){
        list_v_raw[i][j] = num_to_str(list_v_raw[i][j]);
      }
    }
  }

  body.appendParagraph("Draw Placement").setHeading(DocumentApp.ParagraphHeading.NORMAL);

  var list_v = new Array(7).fill('').map(() => new Array(10).fill(''));
  // const matrix = new Array(5).fill(0).map(() => new Array(4).fill(0)); // 5 rows 4 coulumns zero matrix

  [list_v[0][0],list_v[0][1 ]] = ['Draw','Team Name'];
  [list_v[0][3],list_v[0][4 ]] = ['Draw','Team Name'];
  [list_v[0][6],list_v[0][7 ]] = ['Draw','Team Name'];
  [list_v[0][9],list_v[0][10]] = ['Draw','Team Name'];

  // Logger.log(list_v_raw);
  // Logger.log(list_v);

  for(var i = 0;i<6;i++){
    [list_v[i+1][1 ],list_v[i+1][0 ]] = list_v_raw[i];
    [list_v[i+1][4 ],list_v[i+1][3 ]] = list_v_raw[i+6];
    [list_v[i+1][7 ],list_v[i+1][6 ]] = list_v_raw[i+12];
    [list_v[i+1][10],list_v[i+1][9 ]] = list_v_raw[i+18];
  }

  var table_drawlist = body.appendTable(list_v);

  var columnWidths_drawlist = [30,105,1,30,105,1,30,105,1,30,105]; //av width: 595.276

  var style_drawlist = table_style(table_drawlist,columnWidths_drawlist);

  if(confirm){
    var confirmQuote = body.appendParagraph("The Above Results have Been Checked and Confirmed.").setHeading(DocumentApp.ParagraphHeading.NORMAL).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    confirmQuote.editAsText().setBold(true).setFontSize(15);
    
    signatureOpening = body.appendParagraph(
      "\n\nTimekeeper 1     Name   _________________ \tSignature __________________________________________________\n"+
      "\n\nTimekeeper 2     Name   _________________ \tSignature __________________________________________________\n"+
      "\n\nAdministrator     Name   _________________ \tSignature __________________________________________________"
    )
    signatureOpening.setHeading(DocumentApp.ParagraphHeading.NORMAL)
  }  

  if(pdf){
    var pdf = savePDF(doc);
    if (! docs){ return pdf;}
    else {return [DocumentApp.openById(docId),pdf];}
  }
  else{
    return doc;
  }
}

function gen_capture_templates(total_pf = 4,total_rm = 6,docs = true,pdf = false){
  // generates google docs of capture templates. Should NOT generate pdf files.
  for(var pf = 1;pf <= total_pf;pf++){
    for(var rm = 1;rm <= total_rm;rm++){
      // gen_pfrm(pf = 1,rm = 1,doc = undefined,docs = true,pdf = true,template = false,capture = false)
      doc = gen_pfrm( pf,    rm,      undefined,       true,     false,            true,           true);
    }
  }
}

function gen_database(confirm = false,doc = undefined,docs = true,pdf = true){
    if(doc == undefined){
    var doc = document_init(`${getFullName_Bracket()}database_${now}`,false);
  }
  else{
    doc.getBody().appendPageBreak();
  }
  var body = doc.getBody();
  var docId = doc.getId();
  
  var title = doc.getHeader().getParagraphs()[0];
  title.appendText("\tTournament Progression Information ("+now+")");
  // title.setHeading(DocumentApp.ParagraphHeading.HEADING1).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  // var note = body.appendParagraph('The order of teams listed (top to bottom) correspond to teams starting as Reporter, Opponent, Reviewer, Observer, Respectively.');
  // note.setAlignment(DocumentApp.HorizontalAlignment.RIGHT).setItalic(true);
  // note.editAsText().setFontSize(8);
  // body.appendParagraph('').setItalic(false);  

  // acuire raw data
  var v_prb = SpreadsheetApp.getActiveSpreadsheet().getRange(`'2. Database'!A4:BB27`).getValues();
  var d1_prb = SpreadsheetApp.getActiveSpreadsheet().getRange(`'2. Database'!A2:BB2`).getValues();
  var d2_prb = SpreadsheetApp.getActiveSpreadsheet().getRange(`'2. Database'!A3:BB3`).getValues();

  var v_prs  = SpreadsheetApp.getActiveSpreadsheet().getRange(`'2. Database'!A4:BB27`).getValues();
  var d1_prs = SpreadsheetApp.getActiveSpreadsheet().getRange(`'2. Database'!A2:BB2`).getValues();
  var d2_prs = SpreadsheetApp.getActiveSpreadsheet().getRange(`'2. Database'!A3:BB3`).getValues();

  cw_base = [15,60];
  const cw_num  = 18;
  const cw_name = 60;


  // splice / preprocess data
  for(var i = 0;i<v_prb.length;i++){
    v_prb[i].splice(42,12);
    v_prs[i].splice( 2 ,40);
  }

  d1_prb[0].splice(42,12);
  d2_prb[0].splice(42,12);

  d1_prs[0].splice( 2 ,40);
  d2_prs[0].splice( 2 ,40);

  for(var i = 0;i<v_prb.length;i++){
    for(var j = 0;j<v_prb[0].length-1;j++){
      if(typeof v_prb[i][j] == typeof 1.0){v_prb[i][j] = num_to_str(v_prb[i][j]);}
    }
  }

  for(var i = 0;i<v_prs.length;i++){
    for(var j = 0;j<v_prs[0].length-1;j++){
      if(typeof v_prs[i][j] == typeof 1.0){v_prs[i][j] = num_to_str(v_prs[i][j]);}
    }
  }

  //Add problems part
  for(var i = d1_prb[0].length-1; i > 0;i--){
    if(d1_prb[0][i] == ''){d1_prb[0].splice(i,1);}
    else{d1_prb[0][i] = 'PF'+num_to_str(d1_prb[0][i]);}
  }
  d1_prb[0].splice(0,1,'Category');

  for(var i = d2_prb[0].length-1; i > 0;i--){
    if(d2_prb[0][i] == ''){d2_prb[0].splice(i,1);}
  }
  d2_prb[0].splice(0,2,'PF Number');

  // Logger.log(d2_prb);
  // return;

  var cw_prb = cw_base.concat(Array(40).fill(cw_num));
  var cw_d1_prb = [75].concat(Array(12).fill(cw_num  )).concat(Array(4).fill(cw_num*7));
  var cw_d2_prb = [75].concat(Array(3 ).fill(cw_num*4)).concat(Array(4).fill(cw_num*7));
  // Logger.log(d1_prb);
  // Logger.log(cw_d1_prb);

  var style_btw_tables = {}
  style_btw_tables[DocumentApp.Attribute.LINE_SPACING] = 0.1;


  body.appendParagraph('Problems Sequence');
  body.appendParagraph(' ').editAsText().setFontSize(1).setAttributes(style_btw_tables);
  var table_d2_prb = body.appendTable(d2_prb);
  var table_d1_prb = body.appendTable(d1_prb);

  var table_prb = body.appendTable(v_prb);
  //here, d2 is inserted before d1 because it makes more sense in veiwing.

  var style_prb = table_style(table_prb,cw_prb,8);

  var style_d1_prb = table_style(table_d1_prb,cw_d1_prb,8);
  var style_d2_prb = table_style(table_d2_prb,cw_d2_prb,8);

  body.appendPageBreak();
  //--------------------------------------------------------------

  //add presenters part
  for(var i = d1_prs[0].length-1; i > 0;i--){
    if(d1_prs[0][i] == ''){d1_prs[0].splice(i,1);}
    else{d1_prs[0][i] = 'PF'+num_to_str(d1_prs[0][i]);}
  }
  d1_prs[0].splice(0,1,'Category');

  for(var i = d2_prs[0].length-1; i > 0;i--){
    if(d2_prs[0][i] == ''){d2_prs[0].splice(i,1);}
  }
  d2_prs[0].splice(0,2,'PF Number');

  // Logger.log(d1_prs);
  // Logger.log(d2_prs);
  // return;

  var cw_prs = cw_base.concat(Array(12).fill(cw_name));

  var cw_d1_prs = [75].concat(Array(4 ).fill(cw_name*3));
  var cw_d2_prs = [75].concat(Array(12).fill(cw_name  ));

  body.appendParagraph('\nPresenters Sequence').setHeading(DocumentApp.ParagraphHeading.NORMAL);
  body.appendParagraph(' ').editAsText().setFontSize(1).setAttributes(style_btw_tables);

  var table_d1_prs = body.appendTable(d1_prs);
  var table_d2_prs = body.appendTable(d2_prs);
  var table_prs = body.appendTable(v_prs);

  var style_prs = table_style(table_prs,cw_prs,8);
  
  var style_d1_prs = table_style(table_d1_prs,cw_d1_prs,8);
  var style_d2_prs = table_style(table_d2_prs,cw_d2_prs,8);


  // style[DocumentApp.Attribute.FONT_SIZE] = 8;
  
  // table.getCell(1,0).setAttributes(style);
  // table.getCell(2,0).setAttributes(style);
  // table.getCell(3,0).setAttributes(style);


  if(confirm){
    body.appendPageBreak();
    var confirmQuote = body.appendParagraph("The Above Results have Been Checked and Confirmed.").setHeading(DocumentApp.ParagraphHeading.NORMAL).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    confirmQuote.editAsText().setBold(true).setFontSize(15);
    
    signatureOpening = body.appendParagraph(
      "\n\nTimekeeper 1     Name   _________________ \tSignature __________________________________________________\n"+
      "\n\nTimekeeper 2     Name   _________________ \tSignature __________________________________________________\n"+
      "\n\nAdministrator     Name   _________________ \tSignature __________________________________________________"
    )
    signatureOpening.setHeading(DocumentApp.ParagraphHeading.NORMAL)
  }  

  if(pdf){
    var pdf = savePDF(doc);
    if (! docs){ return pdf;}
    else {return [DocumentApp.openById(docId),pdf];}
  }
  else{
    return doc;
  }
}

function gen_pf4_problems(confirm = false,docInput = undefined,docs = true,pdf = true){
  if(docInput == undefined){
    var doc = document_init(`${getFullName_Bracket()}pf4_problems_${getNow()}`,true);
  }
  else{
    var doc = docInput;
    doc.getBody().appendPageBreak();
  }
  var body = doc.getBody();
  var docId = doc.getId();
  
  if(docInput == undefined){var title = body.getParagraphs()[0];}
  else{var title = body.appendParagraph('');}
  title.appendText(`PF4 Problems Verdict`);
  title.setHeading(DocumentApp.ParagraphHeading.TITLE).setAlignment(DocumentApp.HorizontalAlignment.CENTER);

  var note = body.appendParagraph('The Column "Verdict" denotes the problems that the respective teams will be presenting for the pf.');
  note.setAlignment(DocumentApp.HorizontalAlignment.RIGHT).setItalic(true);
  note.editAsText().setFontSize(8);
  body.appendParagraph('').setItalic(false);

  var v = getSsSpreadsheet().getRange("'4. PF4 Questions'!B1:H25").getValues();

  for(var i = 0;i<v.length;i++){
    for(var j = 0;j<v[0].length;j++){
      if(typeof v[i][j] == typeof 1.0){
        v[i][j] = num_to_str(v[i][j]);
      }
    }
  }

  var table = doc.appendTable(v);
  var style = table_style(table,[40,40,100,100,80,80,50]);

  if(confirm){
    var confirmQuote = body.appendParagraph("\n\nThe Above Results have Been Checked and Confirmed.")
    .setHeading(DocumentApp.ParagraphHeading.NORMAL).setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    confirmQuote.editAsText().setBold(true).setFontSize(15);
      
    signatureOpening = body.appendParagraph(
      "\n\nEvaluator          Name   _________________ \tSignature __________________________________________________\n"+
      "\n\nAdministrator    Name   _________________ \tSignature __________________________________________________"
    )
    signatureOpening.setHeading(DocumentApp.ParagraphHeading.NORMAL)
  }

  if(pdf){
    var pdf = savePDF(doc);
    if (! docs){ return pdf;}
    else {return [DocumentApp.openById(docId),pdf];}
  }
  else{
    return doc;
  }
}