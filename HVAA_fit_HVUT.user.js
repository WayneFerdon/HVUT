// ==UserScript==
// @name         HVAA_fit_HVUT
// @version      2025-04-15
// @author       WayneFerdon
// @include      http*://*.hentaiverse.org/*
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
if(top) {
    [gE('.encounterUI'),gE('.hvAAPauseUI'),gE('.hvAAButton')].forEach(ui=>{
        if(ui) top.appendChild(ui);
    })
}
