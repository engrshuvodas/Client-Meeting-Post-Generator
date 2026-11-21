// Country dataset and flag sprite renderer for Client Carousel Studio
const COUNTRIES=[{"name":"Argentina","code":"ar","idx":0},{"name":"Australia","code":"au","idx":1},{"name":"Austria","code":"at","idx":2},{"name":"Bahrain","code":"bh","idx":3},{"name":"Bangladesh","code":"bd","idx":4},{"name":"Barbados","code":"bb","idx":5},{"name":"Belgium","code":"be","idx":6},{"name":"Brazil","code":"br","idx":7},{"name":"Bulgaria","code":"bg","idx":8},{"name":"Cambodia","code":"kh","idx":9},{"name":"Cameroon","code":"cm","idx":10},{"name":"Canada","code":"ca","idx":11},{"name":"China","code":"cn","idx":12},{"name":"Colombia","code":"co","idx":13},{"name":"Cyprus","code":"cy","idx":14},{"name":"Denmark","code":"dk","idx":15},{"name":"Dominican Republic","code":"do","idx":16},{"name":"Egypt","code":"eg","idx":17},{"name":"Estonia","code":"ee","idx":18},{"name":"France","code":"fr","idx":19},{"name":"Georgia","code":"ge","idx":20},{"name":"Germany","code":"de","idx":21},{"name":"Ghana","code":"gh","idx":22},{"name":"Greece","code":"gr","idx":23},{"name":"Hong Kong","code":"hk","idx":24},{"name":"Hungary","code":"hu","idx":25},{"name":"India","code":"in","idx":26},{"name":"Indonesia","code":"id","idx":27},{"name":"Ireland","code":"ie","idx":28},{"name":"Israel","code":"il","idx":29},{"name":"Italy","code":"it","idx":30},{"name":"Ivory Coast","code":"ci","idx":31},{"name":"Jamaica","code":"jm","idx":32},{"name":"Kazakhstan","code":"kz","idx":33},{"name":"Kenya","code":"ke","idx":34},{"name":"Kuwait","code":"kw","idx":35},{"name":"Laos","code":"la","idx":36},{"name":"Lebanon","code":"lb","idx":37},{"name":"Malaysia","code":"my","idx":38},{"name":"Mexico","code":"mx","idx":39},{"name":"Moldova","code":"md","idx":40},{"name":"Morocco","code":"ma","idx":41},{"name":"Mozambique","code":"mz","idx":42},{"name":"Netherlands","code":"nl","idx":43},{"name":"Nigeria","code":"ng","idx":44},{"name":"Norway","code":"no","idx":45},{"name":"Oman","code":"om","idx":46},{"name":"Pakistan","code":"pk","idx":47},{"name":"Panama","code":"pa","idx":48},{"name":"Peru","code":"pe","idx":49},{"name":"Poland","code":"pl","idx":50},{"name":"Portugal","code":"pt","idx":51},{"name":"Qatar","code":"qa","idx":52},{"name":"Saudi Arabia","code":"sa","idx":53},{"name":"Singapore","code":"sg","idx":54},{"name":"South Africa","code":"za","idx":55},{"name":"Spain","code":"es","idx":56},{"name":"Sri Lanka","code":"lk","idx":57},{"name":"Sweden","code":"se","idx":58},{"name":"Switzerland","code":"ch","idx":59},{"name":"Tanzania","code":"tz","idx":60},{"name":"Turkey","code":"tr","idx":61},{"name":"Ukraine","code":"ua","idx":62},{"name":"United Arab Emirates","code":"ae","idx":63},{"name":"United Kingdom","code":"gb","idx":64},{"name":"United States","code":"us","idx":65},{"name":"Venezuela","code":"ve","idx":66},{"name":"Zimbabwe","code":"zw","idx":67}];
const FLAG_COLUMNS = 8;
const FLAG_CELL_W = 132;
const FLAG_CELL_H = 98;

/**
 * Draws a country flag from the sprite sheet onto any canvas context.
 * Supports rounded corners if borderRadius is passed.
 */
function drawCountryFlag(ctx, code, x, y, w, h, flagsImg, borderRadius = 0) {
  if (!flagsImg || !flagsImg.complete || !flagsImg.naturalWidth) return;
  const itemIndex = COUNTRIES.findIndex(c => c.code === code);
  const ix = Math.max(0, itemIndex);
  const col = ix % FLAG_COLUMNS;
  const row = Math.floor(ix / FLAG_COLUMNS);

  ctx.save();
  if (borderRadius > 0) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y, w, h, borderRadius);
    } else {
      ctx.rect(x, y, w, h);
    }
    ctx.clip();
  }
  ctx.drawImage(flagsImg, col * FLAG_CELL_W, row * FLAG_CELL_H, FLAG_CELL_W, FLAG_CELL_H, x, y, w, h);
  ctx.restore();
}

window.COUNTRIES = COUNTRIES;
window.drawCountryFlag = drawCountryFlag;
