// ==UserScript==
// @name         HVHotkey
// @version      2025.10.04.
// @author       WayneFerdon
// @include      http*://*hentaiverse.org/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL https://github.com/WayneFerdon/HVUT/raw/refs/heads/master/HVHotkey.user.js
// ==/UserScript==

if (window.self !== window.top) {
  return;
}

function gE(ele, mode, parent) { // 获取元素
  if (typeof ele === 'object') return ele;
  if (mode === undefined && parent === undefined) return (isNaN(ele * 1)) ? document.querySelector(ele) : document.getElementById(ele);
  if (mode === 'all') return (parent === undefined) ? document.querySelectorAll(ele) : parent.querySelectorAll(ele);
  if (typeof mode === 'object' && parent === undefined) return mode.querySelector(ele);
}

function cE(name) { // 创建元素
  return document.createElement(name);
}

var _query = Object.fromEntries(location.search.slice(1).split('&').map((q) => { const [k, v = ''] = q.split('=', 2); return [k, decodeURIComponent(v.replace(/\+/g, ' '))]; }));

const funcKeyDown = {};
const funcKeys = ['Shift', 'Alt', 'Control', 'Meta'];
document.addEventListener('keyup', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (funcKeys.indexOf(e.key) === -1) return;
  funcKeyDown[e.key] = false;
});

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (funcKeys.indexOf(e.key) !== -1) {
    funcKeyDown[e.key] = true;
    return;
  }
  const keyCode = e.keyCode;
  for (let keydown of Object.values(funcKeyDown)) {
    if(keydown) {
      return;
    }
  }
  const marketNext = '#market_itemheader>:last-child>a,#monster_nav>:last-child>img';
  const marketPrev = '#market_itemheader>:first-child>a,#monster_nav>:first-child>img';
  const marketSellBid = '#market_itembuy>.market_itemorders>table>tbody>tr:nth-child(2)';
  const marketSellOrder = '#sellorder_update';
  const marketBuyBid = '#market_itemsell>.market_itemorders>table>tbody>tr:nth-child(2)';
  const marketBuyOrder = '#buyorder_update';
  const handlers = [
    [65, marketSellBid],//a
    [81, marketSellOrder],//q
    [68, marketBuyBid],//d
    [69, marketBuyOrder],//e
    [37, marketPrev],//←
    [39, marketNext],//→
  ]
  if(keyCode !== 32) {
    for (let [key, selector] of handlers) {
      if (key === -1 || keyCode!==key) continue;
      const ui = gE(selector);
      try{
        gE(ui).click();
      }
      catch{
      }
      if(ui.onclick) {
        return;
      }
      if(!ui.href) return;
      window.location.href = ui.href;
    }
  }
  // keyCode === 32 => space
  event.preventDefault();
  // lab
  let minBtn = gE('#monster_nav>:last-child>img');
  if(minBtn){
    if(gE('img[onclick="do_feed(\'drugs\')"]')){
      let minLevel = 9999;
      for (let ui of gE('.mcr>table>tbody>tr', 'all')) {
        const btn = gE('td>img',ui);
        if(!btn.onclick) continue;
        const level = gE('td>div>div:not(last-child)',ui).innerText.replace('+', '');
        if(level >= minLevel) continue;
        minLevel = level;
        minBtn = btn;
      }
    }
    minBtn.click();
    return;
  }

  // market
  let stock = gE('#sell_order_stock_field>span');
  if(stock){
    const item = _query.itemid*1;
    if(stock.innerHTML == 0 ||
       ![12101, 12201, 12301, 12401, 12501, 12601, 13101, 13201, 13211, 13221,
         60001, 60002, 60003, 60004, 60007, 60010, 60011, 60012, 60051, 60101, 60105, 61001, 61101, 61501, 60402, 60412, 60422,
         30016, 30017, 30018, 30019, 30020, 30021, 30022, 30023, 30024, 30025, 30026, 30027, 30028, 30029, 30030, 30031, 30032].includes(item)){
      gE(marketNext).click();
      return;
    }
    let bid = gE(marketSellBid);
    let order = gE(marketSellOrder);
    try{
      gE(bid).click();
      gE(order).click();
    }
    catch{
    }
    return;
  }

  // character
  let incBtns = Array.from(gE('#attr_table img', 'all')).filter(e=>e.id.includes('_inc') && !e.src.includes('_d.png'));
  while(incBtns.length){
    let displays = Array.from(gE('#attr_table td', 'all')).filter(e=>e.id.includes('_display'));
    displays = incBtns.map(e=>displays.find(d=>d.id === e.id.replace('_inc','_display')));
    let min=Number.MAX_SAFE_INTEGER, minBtn;
    for(let i = 0; i<displays.length; i++){
      let lv = displays[i].innerText * 1;
      if(lv >= min) continue;
      min = lv;
      minBtn = incBtns[i];
    }
    minBtn.click();
    incBtns = Array.from(gE('#attr_table img', 'all')).filter(e=>e.id.includes('_inc') && !e.src.includes('_d.png'));
  }
}, false);
