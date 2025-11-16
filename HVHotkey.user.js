// ==UserScript==
// @name         HVHotkey
// @version      2025.11.16.
// @author       WayneFerdon
// @include      http*://*hentaiverse.org/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL https://github.com/WayneFerdon/HVUT/raw/refs/heads/master/HVHotkey.user.js
// ==/UserScript==

const autoSellItems = [12101, 12201, 12301, 12401, 12501, 12601, 13101, 13111, 13201, 13211, 13221, 60001, 60002, 60003, 60004, 60007, 60010, 60011, 60012, 60051, 60101, 60105, 61001, 61101, 61501, 60402, 60412, 60422, 30016, 30017, 30018, 30019, 30020, 30021, 30022, 30023, 30024, 30025, 30026, 30027, 30028, 30029, 30030, 30031, 30032];

if (window.self !== window.top) {
  return;
}
const battle = gE('#battle_main');
if (battle) {
  handleBattle();
  observe_node(document.querySelector('#textlog').firstChild, { childList: true }, handleBattle);
  // 新回合开始时会刷新 battle_main，导致原本的监听失效，必须在刷新时重新监听一次
  observe_node(document.querySelector('#battle_main'), { childList: true }, () => {
    handleBattle();
    observe_node(document.querySelector('#textlog').firstChild, { childList: true }, handleBattle);
  });
  observe_node(document.querySelector('body'), { childList: true }, () => {
    handleBattle();
    observe_node(document.querySelector('#textlog').firstChild, { childList: true }, handleBattle);
  });
  return;
}

// defaultNotSellSalvage();
autoCheck();

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
    [87, marketPrev],//w
    [83, marketNext],//s
  ]
  if(keyCode !== 32) {
    for (let [key, selector] of handlers) {
      if (key === -1 || keyCode!==key) continue;
      console.log(key);
      const ui = gE(selector);
      if(ui?.href){
        window.location.href = ui.href;
        return;
      }
      try{
        ui?.click();
        return;
      }
      catch{
      }
    }
    return;
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
       !autoSellItems.includes(item)){
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
  let incBtns;
  let isAdding;
  while(!incBtns || incBtns.length){
    incBtns = Array.from(gE('#attr_table img', 'all')).filter(e=>e.id.includes('_inc') && !e.src.includes('_d.png'));
    let displays = incBtns.map(e=>Array.from(gE('#attr_table td', 'all')).filter(e=>e.id.includes('_display')).find(d=>d.id === e.id.replace('_inc','_display')));
    let min=Number.MAX_SAFE_INTEGER;
    minBtn = undefined;
    let i;
    for(i = 0; i<displays.length; i++){
      let lv;
      if(displays[i].innerText !== ''){
        lv = displays[i].innerText * 1;
      } else {
        lv = 0;
        let n = 0;
        for(let img of gE('div>div', 'all', displays[i])){
          lv = img.style.cssText.match(/0px (-*)(\d+)px/)[2] * 1 / 12 * (10 ** n++) + lv;
        }
      }
      if(lv >= min) continue;
      min = lv;
      minBtn = incBtns[i];
    }
    minBtn?.click();
    isAdding ??= minBtn;
  }
  if (isAdding){
    gE(`img[src*="/y/character/apply.png"]`)?.onclick();
  }
}, false);

function gE(ele, mode, parent) { // 获取元素
  if (typeof ele === 'object') return ele;
  if (mode === undefined && parent === undefined) return (isNaN(ele * 1)) ? document.querySelector(ele) : document.getElementById(ele);
  if (mode === 'all') return (parent === undefined) ? document.querySelectorAll(ele) : parent.querySelectorAll(ele);
  if (typeof mode === 'object' && parent === undefined) return mode.querySelector(ele);
}

function cE(name) { // 创建元素
  return document.createElement(name);
}

function defaultNotSellSalvage(){
  const sellSalvage = gE('#sell_salvage');
  if(!sellSalvage){
    return;
  }
  const ls = gE('span', sellSalvage.parentNode);
  const isSell = window.getComputedStyle(ls, '::after').display === 'block';
  if(isSell){
    sellSalvage.checked = false;
  }
}

function autoCheck(){
  if(!gE('#cfs1') || !gE('#cfs2')){
    setTimeout(autoCheck, 1000);
    return;
  }
  gE('#cfs1').checked = true;
  gE('#cfs2').checked = true;
  gE('#equipform').submit();
  setTimeout(autoCheck, 1000);
}

function handleBattle() {
  if (!gE('#pane_action>div>div')) {
    gE('#pane_action').style.cssText += 'height: 40px;'
    const actions = gE('#pane_action>div', 'all');
    const keys = ['Q', 'W', 'E', 'S', 'D', 'F'];
    for (const i in actions) {
      if (isNaN(i * 1)) {
        break;
      }
      const action = actions[i];
      const key = cE('div');
      key.style.cssText += 'color: black; font-weight: bolder; font-size: 18px;'
      key.innerHTML = keys[i];
      action.appendChild(key);
    };
  }
  const pane_item = gE('#pane_item');
  const gem = gE('.bti1>.bti2>div>div', pane_item);
  if (!gem.innerText.includes('G/')) {
    gem.innerText = 'G/' + gem.innerText;
    const items = gE('.c>div:first-child>.c>.bti1>.bti2>div>div', 'all', pane_item);
    items.forEach( item => { item.innerText = 'F' + item.innerText; });
    const scrolls = gE('.c>div:nth-child(2)>.c>.bti1>.bti2>div>div', 'all', pane_item);
    scrolls.forEach( scroll => { scroll.innerText = scroll.innerText.replace('S', '⇧+F').replace('N', 'Ctrl+F'); });
  }
  const quickbar = gE('#quickbar');
  const skills = gE('.btsd', 'all');
  if(!gE('#quickbar>div:not(.btqs)', quickbar)) {
    for (let i = 0; i < 10; i++) {
      const index = cE('div');
      const hint = `alt${i === 9 ? 0 : i + 1}`;
      index.style.cssText += `position:absolute; top: 115px; left: ${30 + i * 37}px; color: white; font-weight: bolder; font-size: 18px; z-index:1000`;
      index.innerHTML = hint;
      quickbar.appendChild(index);
      ;
      const onmousehoverText = quickbar.childNodes[i].getAttribute('onmouseover');
      for (let skill of skills) {
        if (skill.getAttribute('onmouseover') !== onmousehoverText) {
          continue;
        }
        gE('div>div', skill).innerText = `[${hint}]` + gE('div>div', skill).innerText;
        break;
      }
    }
  }
}

function observe_node(node, config, callback) {
  const observer = new MutationObserver(callback);
  observer.observe(node, config);
  return observer;
}
