// ==UserScript==
// @name         HVHotkey
// @version      2025-04-15
// @author       WayneFerdon
// @include      http*://*hentaiverse.org/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL https://github.com/WayneFerdon/HVUT/raw/refs/heads/main/HVHotkey.user.js
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
  if(keyCode===32) {//space
    event.preventDefault();
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
  }
  const handlers = [
    [65, '#market_itembuy>.market_itemorders>table>tbody>tr:nth-child(2)'],//a
    [81, '#sellorder_update'],//q
    [68, '#market_itemsell>.market_itemorders>table>tbody>tr:nth-child(2)'],//d
    [69, '#buyorder_update'],//e
    [37, '#market_itemheader>:first-child>a,#monster_nav>:first-child>img'],//←
    [39, '#market_itemheader>:last-child>a,#monster_nav>:last-child>img'],//→
  ]
  for (let [key, selector] of handlers) {
    if (key === -1 || keyCode!==key) continue;
    const ui = gE(selector);
    try{
      console.log(ui, ui.onclick);
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
}, false);
