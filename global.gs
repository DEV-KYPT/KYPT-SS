/////////////////////////VARIABLES/////////////////////////
const VERSION = 'v0.2.0'

try{
  var ui = SpreadsheetApp.getUi();
}catch (error) {
  Logger.log('Exception in Fetching UI: \n' + error);
}

var now = getNow();

var Snum = ['0','1','2','3','4','5','6','7','8','9','10']

var color = {
  black:"#000000",
  dark_grey_4:"#434343",
  dark_grey_3:"#666666",
  dark_grey_2:"#999999",
  dark_grey_1:"#b7b7b7",
  grey:"#cccccc",
  light_grey_1:"#d9d9d9",
  light_grey_2:"#efefef",
  light_grey_3:"#f3f3f3",
  white:"#ffffff",
  red_berry:"#980000",
  red:"#ff0000",
  orange:"#ff9900",
  yellow:"#ffff00",
  green:"#00ff00",
  cyan:"#00ffff",
  cornflower_blue:"#4a86e8",
  blue:"#0000ff",
  purple:"#9900ff",
  magenta:"#ff00ff",
  light_red_berry_3:"#e6b8af",
  light_red_3:"#f4cccc",
  light_orange_3:"#fce5cd",
  light_yellow_3:"#fff2cc",
  light_green_3:"#d9ead3",
  light_cyan_3:"#d0e0e3",
  light_cornflower_blue_3:"#c9daf8",
  light_blue_3:"#cfe2f3",
  light_purple_3:"#d9d2e9",
  light_magenta_3:"#ead1dc",
  light_red_berry_2:"#dd7e6b",
  light_red_2:"#ea9999",
  light_orange_2:"#f9cb9c",
  light_yellow_2:"#ffe599",
  light_green_2:"#b6d7a8",
  light_cyan_2:"#a2c4c9",
  light_cornflower_blue_2:"#a4c2f4",
  light_blue_2:"#9fc5e8",
  light_purple_2:"#b4a7d6",
  light_magenta_2:"#d5a6bd",
  light_red_berry_1:"#cc4125",
  light_red_1:"#e06666",
  light_orange_1:"#f6b26b",
  light_yellow_1:"#ffd966",
  light_green_1:"#93c47d",
  light_cyan_1:"#76a5af",
  light_cornflower_blue_1:"#6d9eeb",
  light_blue_1:"#6fa8dc",
  light_purple_1:"#8e7cc3",
  light_magenta_1:"#c27ba0",
  dark_red_berry_1:"#a61c00",
  dark_red_1:"#cc0000",
  dark_orange_1:"#e69138",
  dark_yellow_1:"#f1c232",
  dark_green_1:"#6aa84f",
  dark_cyan_1:"#45818e",
  dark_cornflower_blue_1:"#3c78d8",
  dark_blue_1:"#3d85c6",
  dark_purple_1:"#674ea7",
  dark_magenta_1:"#a64d79",
  dark_red_berry_2:"#85200c",
  dark_red_2:"#990000",
  dark_orange_2:"#b45f06",
  dark_yellow_2:"#bf9000",
  dark_green_2:"#38761d",
  dark_cyan_2:"#134f5c",
  dark_cornflower_blue_2:"#1155cc",
  dark_blue_2:"#0b5394",
  dark_purple_2:"#351c75",
  dark_magenta_2:"#741b47",
  dark_red_berry_3:"#5b0f00",
  dark_red_3:"#660000",
  dark_orange_3:"#783f04",
  dark_yellow_3:"#7f6000",
  dark_green_3:"#274e13",
  dark_cyan_3:"#0c343d",
  dark_cornflower_blue_3:"#1c4587",
  dark_blue_3:"#073763",
  dark_purple_3:"#20124d",
  dark_magenta_3:"#4c1130"
};

var cb_color = { // chatbot colors
  "cmd":"darkmagenta",
  "chal":"blue",
  "rela":"deeppink",
  "rej":"red",
  "acc":"forestgreen",
  "undo":"brown"
}

var regulation = {
  'max_rejects':7, // maximum number of rejects for a single team throughout tournament (IYPT:8,KYPT:7)
  'remove_th':5,   // minimum number below which rules have to be removed (IYPT:5,KYPT:5)
}

/////////////////////////FUNCTIONS/////////////////////////

function getSsSpreadsheet(){return SpreadsheetApp.getActive();}
function getMtSpreadsheet(){return SpreadsheetApp.openByUrl(PropertiesService.getDocumentProperties().getProperty('mtUrl'));}

function getNow() {
  //  timezone = "GMT+" + new Date().getTimezoneOffset()/60
  timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone()
  var date = Utilities.formatDate(new Date(), timezone, "yyyy-MM-dd-HH:mm");
  return date;
}

function getUserID(){
  return Session.getActiveUser().getEmail().split("@")[0];
}

function getName() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Draw').getRange("I26").getValue();
}

function isSource() {return (PropertiesService.getDocumentProperties().getProperty('status') == 'SOURCE');}

function getFullName() {
  if(PropertiesService.getDocumentProperties().getProperty('status') == 'SOURCE'){return "SOURCE"}
  return SpreadsheetApp.getActiveSpreadsheet().getRange("Draw!D26").getValue() + '-'+ SpreadsheetApp.getActiveSpreadsheet().getRange("Draw!I26").getValue();
}

function getFullName_Bracket() {
  return '['+getFullName()+']';
}

function paper_size(doc, paperSize, portrait = true) {
  //Dictionary of Paper sizes by width and height in portrait.
  var paper = {
     letter_size:[612.283,790.866], 
     tabloid_size:[790.866,1224.57],
     legal_size:[612.283,1009.13],
     statement_size:[396.85,612.283],
     executive_size:[521.575,756.85],
     folio_size:[612.283,935.433],
     a3_size:[841.89,1190.55],
     a4_size:[595.276,841.89],
     a5_size:[419.528,595.276],
     b4_size:[708.661,1000.63],
     b5_size:[498.898,708.661]};
 
  if(portrait===true){
    doc.getBody().setPageWidth(paper[paperSize][0]).setPageHeight(paper[paperSize][1]);
  }else {
    doc.getBody().setPageHeight(paper[paperSize][0]).setPageWidth(paper[paperSize][1]);
  };
};

function oneDigit(num){
  if(typeof(num) == "number"){
    if( num >= 0  && num <= 10 ){
      return Snum[num];
    }
  }
  return num
}

function num_to_str(num = 1.0){
  var str = num.toString();
  // Logger.log(str);
  return str
}