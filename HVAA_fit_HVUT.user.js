// ==UserScript==
// @name         HVAA_fit_HVUT
// @version      2025-11-16
// @author       WayneFerdon
// @include      http*://*hentaiverse.org/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL https://github.com/WayneFerdon/HVUT/raw/refs/heads/main/HVAA_fit_HVUT.user.js
// ==/UserScript==

function gE(ele, mode, parent) { // 获取元素
  if (typeof ele === 'object') {
    return ele;
  } if (mode === undefined && parent === undefined) {
    return (isNaN(ele * 1)) ? document.querySelector(ele) : document.getElementById(ele);
  } if (mode === 'all') {
    return (parent === undefined) ? document.querySelectorAll(ele) : parent.querySelectorAll(ele);
  } if (typeof mode === 'object' && parent === undefined) {
    return mode.querySelector(ele);
  }
}
const top = gE('#hvut-top');
const keys = ['.encounterUI', '.hvAAPauseUI', '.hvAAButton'];
let done = 0;
if(top) {
  appendUI();
}

function appendUI() {
  let ui;
  for(const key of keys) {
    ui = gE(key);
    if(!ui || !gE(key, top)) {
      continue;
    }
    // top.removeChild(ui);
    document.body.appendChild(ui);
  }
  for(const key of keys) {
    ui = gE(key);
    if(!ui || gE(key, top)) {
      continue;
    }
    top.appendChild(ui);
    done++;
  }
  if (done === keys.length) {
    return;
  }
  setTimeout(appendUI, 1000);
}
