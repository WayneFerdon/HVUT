// ==UserScript==
// @name         HVHotkey
// @namespace    http://tampermonkey.net/
// @version      2025-03-20
// @description  try to take over the world!
// @author       You
// @include      http*://hentaiverse.org/*
// @include      http*://alt.hentaiverse.org/*
// @include      http*://e-hentai.org/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL https://github.com/WayneFerdon/HVUT/raw/refs/heads/main/HVHotkey.user.js
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
    const handlers = [
        [65, '#market_itembuy>.market_itemorders>table>tbody>tr:nth-child(2)'],//a
        [81, '#sellorder_update'],//q
        [68, '#market_itemsell>.market_itemorders>table>tbody>tr:nth-child(2)'],//d
        [69, '#buyorder_update'],//e
        [37, '#market_itemheader>:first-child>a'],//←
        [39, '#market_itemheader>:last-child>a']//→
    ]
    for (let [key, selector] of handlers) {
        if (key === -1 || keyCode!==key) continue;
        const ui = gE(selector);
        try{
            console.log(ui, ui.onclick)
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
