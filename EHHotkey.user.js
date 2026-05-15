// ==UserScript==
// @name         EHHotkey
// @version      2026.05.15
// @description  try to take over the world!
// @author       WayneFerdon
// @downloadURL https://github.com/WayneFerdon/HVUT/raw/refs/heads/main/EHHotkey.user.js
// @updateURL https://github.com/WayneFerdon/HVUT/raw/refs/heads/main/EHHotkey.user.js
// @include      http*://exhentai.org/*
// @include      http*://e-hentai/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

function gE(ele, mode, parent) { // 获取元素
  if (typeof ele === 'object') return ele;
  if (mode === undefined && parent === undefined) return (isNaN(ele * 1)) ? document.querySelector(ele) : document.getElementById(ele);
  if (mode === 'all') return (parent === undefined) ? document.querySelectorAll(ele) : parent.querySelectorAll(ele);
  if (typeof mode === 'object' && parent === undefined) return mode.querySelector(ele);
}

function cE(name) { // 创建元素
  return document.createElement(name);
}

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  const keyCode = e.keyCode;
  const handlers = [
    [37, '#uprev'],//←
    [39, '#unext'],//→
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
