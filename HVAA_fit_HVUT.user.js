// ==UserScript==
// @name         HVAA_fit_HVUT
// @version      2026.05.15
// @author       WayneFerdon
// @include      http*://*hentaiverse.org/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL https://github.com/WayneFerdon/HVUT/raw/refs/heads/main/HVAA_fit_HVUT.user.js
// ==/UserScript==

const top = gE('#hvut-top');
const keys = ['.encounterUI', '.hvAAPauseUI', 'body:not(iframe-body) .hvAAButton'];
let done = 0;
const battle = gE('#battle_main');

if(window.self === window.top && (top || battle)) {
  appendUI();
}
const csp = document.querySelector('#csp');
let observer;
if (csp) {
  observer = observe_node(csp, { subtree: true, childList: true }, setConfigBoxSticky);
}

function appendUI() {
  if (battle) {
    if (gE('.hvAAButton')) {
      gE('.hvAAButton').style.cssText += "left:1218px;top:0;"
    }
  } else {
    for(const key of keys) {
      let t = top;
      const ui = gE(key);
      if (key === 'body:not(iframe-body) .hvAAButton') {
        t = gE('.hvut-top-config');
        if (t) {
          ui.style.cssText += "top:unset;left:unset;background:unset;position:unset;width:unset;height:unset;";
          ui.innerText = 'hVAA Settings';
        }
      }
      if(!ui || !t || gE(key, t)) {
        continue;
      }
      t.appendChild(ui);
      done++;
    }
    if (done >= keys.length) {
      return;
    }
  }
  setTimeout(appendUI, 100);
}

function setConfigBoxSticky() {
  const container = gE('#hvut-top');
  if (!container) {
    observer.disconnect();
    return;
  }
  const box = gE('#hvAABox');
  if (!box) return;
  container.append(box);
  observer.disconnect();
}

function observe_node(node, config, callback) {
  const observer = new MutationObserver(callback);
  observer.observe(node, config);
  return observer;
}

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

function cE(name) { // 创建元素
  return document.createElement(name);
}
