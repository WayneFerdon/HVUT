// ==UserScript==
// @name         HVHotkey
// @version      2026.05.15
// @author       WayneFerdon
// @include      http*://*hentaiverse.org/*
// @exclude        http*://*hentaiverse.org/equip/*
// @exclude        http*://*hentaiverse.org/isekai/equip/*
// @connect        hentaiverse.org
// @connect        e-hentai.org
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL https://github.com/WayneFerdon/HVUT/raw/refs/heads/master/HVHotkey.user.js
// ==/UserScript==

/*
// const autoBuyItems = {
//   11191: 100, // 体力药水
//   11195: 100, // 体力长效药
//   11199: 30, // 体力秘药
//   11291: 100, // 魔力药水
//   11295: 100, // 魔力长效药
//   11299: 30, // 魔力秘药
//   11391: 100, // 灵力药水
//   11395: 100, // 灵力长效药
//   11399: 30, // 灵力秘药
//   // 11401: 0, // 能量饮料
//   // 11402: 0, // 咖啡因糖果
//   11501: 30, // 终极秘药
//   // 12101: 0, // 火焰魔药
//   // 12201: 0, // 冰冷魔药
//   // 12301: 0, // 闪电魔药
//   // 12401: 0, // 风暴魔药
//   // 12501: 0, // 神圣魔药
//   // 12601: 0, // 黑暗魔药
//   // 13101: 0, // 加速卷轴
//   // 13111: 0, // 守护卷轴
//   // 13199: 30, // 化身卷轴
//   // 13201: 0, // 吸收卷轴
//   // 13211: 0, // 幻影卷轴
//   // 13221: 30, // 生命卷轴
//   // 13299: 30, // 众神卷轴
//   // 19111: 30, // 花瓶
//   // 19131: 30, // 泡泡糖
// }

// const quality = 'Flimsy|Crude|Fair|Average|Fine|Superior|Exquisite|Magnificent|Legendary|Peerless';
// const prefix = 'Ethereal|Fiery|Arctic|Shocking|Tempestuous|Hallowed|Demonic|Ruby|Cobalt|Amber|Jade|Zircon|Onyx|Charged|Frugal|Radiant|Mystic|Agile|Reinforced|Savage|Shielding|Mithril';
// const slot = 'Cap|Robe|Gloves|Pants|Shoes|Helmet|Breastplate|Gauntlets|Leggings|Boots|Cuirass|Armor|Greaves|Sabatons|Coif|Hauberk|Mitons|Chausses|Boots';
// const onehanded = 'Axe|Club|Rapier|Shortsword|Wakizashi|Dagger|Sword Chucks';
// const twohanded = 'Estoc|Longsword|Mace|Katana|Scythe|Great Mace|Swordchucks';
// const staff = 'Oak Staff|Willow Staff|Katalox Staff|Redwood Staff|Ebony Staff';
// const shield = 'Buckler|Kite Shield|Force Shield|Tower Shield';
// const acloth = 'Cotton|Phase|Gossamer|Silk|Ironsilk';
// const alight = 'Leather|Shade|Kevlar|Dragon Hide|Drakehide';
// const aheavy = 'Plate|Power|Shield|Chainmail|Chain|Reactive';
*/

if (window.self !== window.top) {
  return;
}
const href = window.location.href;
const isIsekai = href.indexOf('isekai') !== -1;
const keepCount =0// isIsekai ? 0 : 1;
const isInBattle = gE('#battle_main');
const $ajax = window.top.$ajax ??= unsafeWindow.$ajax ??= initAjax();
let match = document.querySelector('script[src*="hvc.js"]').src.match(/z\/(\d+)(.*)\/hvc.js/);
var version = {
  main: match[1],
  sub: match[2],
  getFull: () => `${version.main}${version.sub ?? ''}`
};
const v091 = version.main >= 91;

const autoSellItems = JSON.parse(GM_getValue('autoSellItems_default', '[]')).concat(JSON.parse(GM_getValue(isIsekai ? 'autoSellItems_isekai' : 'autoSellItems_persistent', '[]')));
const sellEquips = JSON.parse(GM_getValue('sellEquips_default', '[]')).concat(JSON.parse(GM_getValue(isIsekai ? 'sellEquips_isekai' : 'sellEquips_persistent', '[]'))).map(r=>new RegExp(r));

let items, credits;
let marketoken;

// In Battle
if (gE('#riddlecounter')) return;
if (gE('#riddlecounter')) return;
if (gE('#battle_main')) {
  const observer = new MutationObserver((m,observer) => {
    handleBattle();
    // observer.disconnect();
    if (!gE('#battle_main')) return;
    observer.observe(gE('#battle_main'), { childList:true, subtree:true, attribute: true, attributeFilter: ['value', 'title'] });
  });

  handleBattle();
  observer.observe(gE('#battle_main'), { childList:true, subtree:true, attribute: true, attributeFilter: ['value', 'title'] });
  return;
}

function handleBattle() {
  if (!gE('#battle_main')) return;
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
    }
  };
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
  if(gE('#quickbar>.btqs>.hint', quickbar)) {
    return;
  }
  const btns = gE('#quickbar>.btqs', 'all', quickbar);
  const skillHints = {};
  for (let i = 0; i < 10; i++) {
    const btn = btns[i];
    const onmousehoverText = btns[i].getAttribute('onmouseover');
    if (!onmousehoverText) continue;
    const index = cE('div');
    const hint = `alt${i === 9 ? 0 : i + 1}`;
    index.style.cssText += `position:absolute; top: -15px; left: 5px; color: #AAA; font-size: 15px; z-index:1000`;
    index.innerHTML = hint;
    index.classList.add('hint');
    btns[i].appendChild(index);
    skillHints[onmousehoverText] = hint;
  }
  for (let skill of gE('.btsd', 'all')) {
    const hint = skillHints[skill.getAttribute('onmouseover')];
    if (!hint) continue;
    gE('div>div>div', skill).innerHTML = `<div style="color: #1E90FF;">[${hint}]</div>` + gE('div>div>div', skill).innerHTML;
    gE('div>div>div', skill).style.cssText += 'display: flex;';
  }
}

// Automatics

// defaultNotSellSalvage();

autoCheck();

automatics();

async function automatics() { try {
  autoLab();
  await (v091 ? autoOnArmory() : autoOnEquipShop());
  items = undefined;
  await autoOnMarket();
} catch(e) { console.error(e) }}

function autoCheck(){
  if(!gE('#cfs1') || !gE('#cfs2')){
    setTimeout(autoCheck, 100);
    return;
  }
  gE('#cfs1').checked = true;
  gE('#cfs2').checked = true;
  gE('#equipform').submit();
  // setTimeout(autoCheck, 100);
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

async function autoLab() { try {
  if (isIsekai) {
    return;
  }
  // console.log('Start autoLab');
  const doc = $doc(await $ajax.fetch('?s=Bazaar&ss=ml'));
  const count = gE('.msl', 'all', doc).length;
  if (gE('img[src*="feedallmonsters.png"]', doc)) {
    await $ajax.fetch(`?s=Bazaar&ss=ml`, `feed_all=food`);
  }
  if (gE('img[src*="drugallmonsters.png"]', doc)) {
    let ml = Array.from(gE('.msl', 'all', doc)).map(msl=> {
      const index = msl.getAttribute('onclick').match(/slot=(\d+)/)[1];
      const img = gE('.msn:last-child img', msl);
      return { index:index, morale:img.style.width.replace('px', '') * 1 };
    });
    ml.sort((a,b) => a.morale - b.morale);
    const mons = [];
    for (const mon of ml) {
      if(!await autoLabMonster(mon.index)) break;
      if (mon.morale >= 90) console.log(mon)
      mons.push(mon);
    }
    if (mons.length) console.log(mons);
  }
  // console.log('Done autoLab');
} catch(e) { console.error(e) }}

async function autoLabMonster(i) { try {
  const mldoc = $doc(await $ajax.fetch(`?s=Bazaar&ss=ml&slot=${i}`));
  let minBtn;
  if(!gE('img[onclick="do_feed(\'drugs\')"]', mldoc)){
    return;
  }
  let minLevel = 9999;
  for (let ui of gE('.mcr>table>tbody>tr', 'all', mldoc)) {
    const btn = gE('td>img', ui);
    if(!btn.getAttribute('onclick')) continue;
    const level = gE('td>div>div:not(last-child)', ui).innerText.replace('+', '');
    if(level >= minLevel) continue;
    minLevel = level;
    minBtn = btn;
  }
  if (!minBtn) {
    return;
  }
  await $ajax.fetch(`?s=Bazaar&ss=ml&slot=${i}`, `crystal_upgrade=${minBtn.getAttribute('onclick').match(/do_crystal_upgrade\('(.+)', event\)/)[1]}&crystal_count=1`);
} catch(e) { console.error(e) }}

async function loadMarketItem(screen, filter) { try {
  const isOrders = screen === 'sellorders';
  const html = await $ajax.fetch(`?s=Bazaar&ss=mk&screen=${screen}&filter=${filter}`);
  const doc = $doc(html);
  const match = html.match(/<td>(.*)<\/td>/g);
  if (!match) {
    return;
  }
  const market = gE('#market_itemlist tr', 'all', doc);
  marketoken ??= gE('input[name="marketoken"]', doc).value;
  let i = 0;
  credits = Array.from(gE('.credit_balance>div:last-child', 'all', doc)).map(elem=>elem.innerText.replace(/ C$|\,|\s$/, ''));
  items ??= {};
  for (const item of market) {
    const id = item.getAttribute('onclick')?.match(/itemid=(\d+)/)[1];
    if (!id || items[id]) continue;
    const cells = Array.from(gE('td', 'all', item)).map(cell=>cell.innerText.replace(/ C$|\,|\s$/, ''));
    let name, count, sellOrder, sellOrderPrice, price, buyPrice, marketStorage;
    if (isOrders) {
      [name, count, sellOrder, sellOrderPrice, price, buyPrice, marketStorage] = cells;
    } else {
      [name, count, price, buyPrice, marketStorage] = cells;
    }
    [count, sellOrder, sellOrderPrice, price, buyPrice, marketStorage] = [count, sellOrder, sellOrderPrice, price, buyPrice, marketStorage].map(text => {
      const value = text * 1;
      return isNaN(value) ? 0 : value;
    });
    items[id] = {
      name: name,
      count: (sellOrder ?? 0) * 1 + (count ?? 0) * 1,
      price: price * 1,
      buyPrice: buyPrice * 1,
    };
  }
} catch(e) { console.error(e) }}

async function loadItems(filters) { try {
  if (items) return;
  filters ??= ['co', 'ma', 'tr'].concat(isIsekai ? [] : ['ar', 'fi', 'mo']);
  const promiseList = [];
  for (const filter of filters) {
    await loadMarketItem('sellorders', filter);
    await loadMarketItem('browseitems', filter);
  }
} catch(e) { console.error(e) }}

async function autoOnMarket() { try {
  // console.log('Start autoOnMarket');
  await loadItems();
  const toBuy = {};
  let totalBuyCost = 0;
  for (const id in items) {
    const item = items[id];
    if (autoSellItems.includes(id * 1) && item.count > keepCount) {
      console.log('sell', id, item.count - keepCount, '@', item.price);
      await $ajax.fetch(`?s=Bazaar&ss=mk&itemid=${id}`, `marketoken=${marketoken}&sellorder_batchcount=${item.count - keepCount}&sellorder_batchprice=${item.price}&sellorder_update=update`);
      await pauseAsync(2000);
    }
    // if (Object.keys(autoBuyItems).includes(id)) {
    //   const require = autoBuyItems[id] - (item.count ?? 0);
    //   if (require <= 0) continue;
    //   totalBuyCost += require * item.buyPrice;
    //   toBuy[id] = autoBuyItems[id] - item.count;
    //   console.log(id, item.count, '<' , autoBuyItems[id], item.buyPrice);
    // }
  }
  // console.log(toBuy, totalBuyCost);
  // if (1*credits[0]+1*credits[1] >= totalBuyCost) {
  //   const toTransfer = totalBuyCost - 1*credits[1]
  //   if (toTransfer > 0) {
  //     await $ajax.fetch(`?s=Bazaar&ss=mk`, `account_withdraw='▼   Deposit   ▼'&markettoken=${marketoken}&account_amount=${toTransfer}`);
  //     await pauseAsync(2000);
  //   }
  //   for (const id in toBuy){
  //     await $ajax.fetch(`?s=Bazaar&ss=mk&itemid=${id}`, `marketoken=${marketoken}&buyorder_batchcount=${toBuy[id]}&sellorder_batchprice=${items[id].price}&sellorder_update=update`);
  //     await pauseAsync(2000);
  //   };
  // }

  // console.log('Done autoOnMarket');
} catch(e) { console.error(e) }}

async function autoOnArmory(targetFilter) { try {
  if (targetFilter) {
    if (window.location.href.indexOf('?s=Bazaar&ss=am&screen=salvage') === -1 && window.location.href.indexOf('?s=Bazaar&ss=am&screen=sell') === -1) {
      return;
    }
  }
  // console.log('Start autoOnArmory', targetFilter);
  const filters = (targetFilter && targetFilter !== 'all') ? [targetFilter] : ['weapon_1handed', 'weapon_2handed', 'weapon_staff', 'shield', 'armor_cloth', 'armor_light', 'armor_heavy'];
  const toSalvage = [];
  const toSell = [];
  let token;
  let eqps = {};
  await Promise.all(filters.map(getArmory));

  let promiseList = [];
  if (toSalvage.length) {
    console.log('salvage', toSalvage.map(id => eqps[id]));
    promiseList.push($ajax.fetch(`?s=Bazaar&ss=am&screen=salvage`, `${token}${toSalvage.map(id=>`&eqids[]=${id}`)}&sell_salvage=on`));
  }
  if (toSell.length) {
    console.log('sell', toSell.map(id => eqps[id]));
    promiseList.push($ajax.fetch(`?s=Bazaar&ss=am&screen=sell`, `${token}${toSell.map(id=>`&eqids[]=${id}`)}}`));
  }
  await Promise.all(promiseList);
  // console.log('Done autoOnArmory', targetFilter);
  if (targetFilter) {
    popup('Done autoOnArmory');
  }
  return true;

  async function getArmory(filter) { try {
    const html = await $ajax.fetch(`?s=Bazaar&ss=am&screen=salvage&filter=${filter}`);
    const sell = (await $ajax.fetch(`?s=Bazaar&ss=am&screen=sell&filter=${filter}`)).match(/const eqitems=(\{.*\}); const itemdata=\[.*\];/);
    if (!sell) {
      return;
    }
    const sellPrice = JSON.parse(sell[1]);
    token ??= `postoken=${gE('input[name="postoken"]', $doc(html)).value}`;
    const match = html.match(/const eqitems=(\{.*\}); const itemdata=\{.*\};/);
    if (!match) return;
    const eqitems = JSON.parse(match[1]);
    for (const id in eqitems) {
      const eqp = eqitems[id];
      for (const reg of sellEquips) {
        if (!targetFilter && !eqp.t.match(reg)) continue;
        await loadItems(['ma']);
        if (!items) break;
        let salvagPrice = eqp.c;
        let undefinedSalvag = false;
        for (const m in eqp.m) {
          if (!items[m]) {
            if (![60401, 60411, 60421].includes(m*1)) {
              console.log(eqp, m, 'price undefined');
            }
            undefinedSalvag = true;
          }
          salvagPrice += items[m]?.price * eqp.m[m];
        }
        if (undefinedSalvag) {
          continue;
        }
        if (sellPrice[id].c < salvagPrice) {
          toSalvage.push(id);
        } else {
          toSell.push(id);
        }
        break;
      }
    }
    eqps = { ...eqps, ...sellPrice};
  } catch(e) { console.error(e) }}
} catch(e) { console.error(e) }}

async function autoOnEquipShop() { try {
  // console.log('Start autoOnEquipShop');
  const mat_type = { '1handed': 'Metals', '2handed': 'Metals', 'staff': 'Wood', 'shield': 'Wood', 'acloth': 'Cloth', 'alight': 'Leather', 'aheavy': 'Metals' };
  const core_type = { '1handed': 'Weapon', '2handed': 'Weapon', 'staff': 'Staff', 'shield': 'Armor', 'acloth': 'Armor', 'alight': 'Armor', 'aheavy': 'Armor' };
  const quality = { 'Flimsy': 1, 'Crude': 2, 'Fair': 3, 'Average': 4, 'Fine': 5, 'Superior': 6, 'Exquisite': 7, 'Magnificent': 8, 'Legendary': 9, 'Peerless': 10 };
  const rare_type = { 'Force Shield': true, 'Phase': true, 'Shade': true, 'Power': true };

  const nameReg = (() => {
    const quality = 'Flimsy|Crude|Fair|Average|Fine|Superior|Exquisite|Magnificent|Legendary|Peerless';
    const prefix = 'Ethereal|Fiery|Arctic|Shocking|Tempestuous|Hallowed|Demonic|Ruby|Cobalt|Amber|Jade|Zircon|Onyx|Charged|Frugal|Radiant|Mystic|Agile|Reinforced|Savage|Shielding|Mithril';
    const slot = 'Cap|Robe|Gloves|Pants|Shoes|Helmet|Breastplate|Gauntlets|Leggings|Boots|Cuirass|Armor|Greaves|Sabatons|Coif|Hauberk|Mitons|Chausses|Boots';
    const onehanded = 'Axe|Club|Rapier|Shortsword|Wakizashi|Dagger|Sword Chucks';
    const twohanded = 'Estoc|Longsword|Mace|Katana|Scythe|Great Mace|Swordchucks';
    const staff = 'Oak Staff|Willow Staff|Katalox Staff|Redwood Staff|Ebony Staff';
    const shield = 'Buckler|Kite Shield|Force Shield|Tower Shield';
    const acloth = 'Cotton|Phase|Gossamer|Silk|Ironsilk';
    const alight = 'Leather|Shade|Kevlar|Dragon Hide|Drakehide';
    const aheavy = 'Plate|Power|Shield|Chainmail|Chain|Reactive';
    const pattern = `^(${quality})(?: (?:(${prefix})|(.+?)))? (?:(${onehanded})|(${twohanded})|(${staff})|(${shield})|(?:(?:(${acloth})|(${alight})|(${aheavy})) (${slot})))(?: of (.+))?$`;
    return new RegExp(pattern, 'i');
  })();

  let equips, eqvalue;
  let toSalvage = [];
  let toSell = [];

  const handle = async function (id, filter) { try {
    const dynjs = equips[id];
    const eq = {
      name: dynjs.t,
      filter: filter,
      value: eqvalue[id],
    };

    let exec = dynjs.d.match(/<div>(.+?) &nbsp; &nbsp; (?:Level (\d+|Unassigned) )?&nbsp; &nbsp; <span>(Tradeable|Untradeable|Soulbound)<\/span><\/div><div>Condition: (\d+) \/ (\d+) \(\d+%\) &nbsp; &nbsp; Potency Tier: (\d+) \((?:(\d+) \/ (\d+)|MAX)\)/);
    // eq.category = exec[1];
    // eq.tradeable = exec[3] === 'Tradeable';
    exec = eq.name.match(nameReg);
    if (!exec) {
      console.log('Failed matching eqp name:', eq);
      return;
    }
    for (const reg of sellEquips) {
      if (!eq.name.match(reg)) continue;
      await loadItems(['ma']);
      eq.quality = quality[exec[1]];
      eq.type = exec[4] || exec[5] || exec[6] || exec[7] || exec[8] || exec[9] || exec[10];
      eq.salvage_value = salvage_mats(eq);
      if (!eq.salvage_value || isNaN(eq.salvage_value)) {
        continue;
      }
      if (eq.salvage_value > eq.value) {
        toSalvage.push([id, eq.filter]);
      } else {
        toSell.push(id);
      }
      break;
    }
  } catch(e) { console.error(e) }};

  function salvage_mats(eq) {
    let salvage_mats = {};
    const q = eq.quality;
    const t = mat_type[eq.filter];
    let value = eq.value;

    if (q < 6) {
      const scrap = 'Scrap ' + (t === 'Metals' ? 'Metal' : t);
      salvage_mats[scrap] = Math.min(10, Math.ceil(value / 100));
    } else {
      const mat = (q === 6 ? 'Low-Grade ' : q === 7 ? 'Mid-Grade ' : 'High-Grade ') + t;
      salvage_mats[mat] = !isIsekai ? 1 : q === 6 ? 3 : q === 7 ? 2 : 1;
    }
    if (q >= 9) {
      const core = (q === 9 ? 'Legendary ' : 'Peerless ') + core_type[eq.filter] + ' Core';
      salvage_mats[core] = rare_type[eq.type] ? 5 : 1;
    }
    if (rare_type[eq.type]) {
      const cell = 'Energy Cell';
      salvage_mats[cell] = 1;
    }
    return Object.entries(salvage_mats).reduce((s, [k, v]) => {
      if (items) {
        const price = items[Object.keys(items).find(id => items[id].name === k)]?.price;
        if (price) {
          return s + price * v;
        }
      }
      console.log(k, 'price undefined');
    }, 0);
  };

  const html = await $ajax.fetch((await $ajax.fetch('?s=Forge&ss=sa')).match(/src="(\/dynjs\/\d+\/.+\/equip\-\d+\.js)"/)[1]);
  equips = JSON.parse(/var dynjs_equip=(\{.*\});/.exec(html)?.[1] || null);
  let token;
  const getEquip = async function (filter) { try {
    const html = await $ajax.fetch('?s=Bazaar&ss=es&filter=' + filter);
    const doc = $doc(html);
    token ??= gE('input[name="storetoken"]', doc)?.value;
    if (!token) return;
    eqvalue = JSON.parse(/var eqvalue = (\{.*\});/.exec(html)?.[1] || null);
    for (let eqp of gE('#item_pane div[id*="e"]', 'all', doc)) {
      if (eqp.getAttribute('data-locked') === '1') {
        continue;
      }
      const id = eqp.id.match(/e(\d+)/)[1];
      await handle(id , filter);
    }
  } catch(e) { console.error(e) }}
  await Promise.all(['1handed', '2handed', 'staff', 'shield', 'acloth', 'alight', 'aheavy'].map(getEquip));
  let promiseList = [];
  if (toSalvage.length) {
    console.log('salvage', toSalvage, toSalvage.map((id, filter) => [ equips[id], id, filter]));
    promiseList = promiseList.concat(toSalvage.map(eqp=>$ajax.fetch(`?s=Forge&ss=sa&filter=${eqp[1]}`, `select_item=${eqp[0]}`)));
  }
  if (toSell.length) {
    console.log('toSell', toSell.map(id => equips[id]));
    promiseList = promiseList.concat(toSell.map(eqp=>$ajax.fetch(`?s=Bazaar&ss=es`, `select_eids=${eqp}&storetoken=${token}`)));
  }
  await Promise.all(promiseList);
  // console.log('Done autoOnEquipShop');
} catch(e) { console.error(e) }}

// Hotkeys

var _query = Object.fromEntries(location.search.slice(1).split('&').map((q) => { const [k, v = ''] = q.split('=', 2); return [k, decodeURIComponent(v.replace(/\+/g, ' '))]; }));

const funcKeyDown = {};
const funcKeys = ['Shift', 'Alt', 'Control', 'Meta'];
document.addEventListener('keyup', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (funcKeys.indexOf(e.key) === -1) return;
  funcKeyDown[e.key] = false;
});
const marketNext = '#market_itemheader>:last-child>a,#monster_nav>:last-child>img';
const marketPrev = '#market_itemheader>:first-child>a,#monster_nav>:first-child>img';
const marketSellBid = '#market_itembuy>.market_itemorders>table>tbody>tr:nth-child(2)';
const marketSellOrder = '#sellorder_update';
const marketBuyBid = '#market_itemsell>.market_itemorders>table>tbody>tr:nth-child(2)';
const marketBuyOrder = '#buyorder_update';
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
  for (let func of [onLab, onStock, onAttribute, ()=>autoOnArmory(_query.filter ?? 'new')]) {
    if (func()) {
      break;
    }
  }
}, false);

function onLab() {
  let minBtn = gE('#monster_nav>:last-child>img');
  if(!minBtn){
    return;
  }
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
  return true;
}

function onStock() {
  let stock = gE('#sell_order_stock_field>span');
  if(!stock){
    return;
  }
  const item = _query.itemid*1;
  if(stock.innerHTML == 0 ||
     !autoSellItems.includes(item)){
    gE(marketNext).click();
    return;
  }
  let bid = gE(marketSellBid);
  let order = gE(marketSellOrder);
  try {
    gE(bid).click();
    gE(order).click();
  } catch{}
  return true;
}

function onAttribute() {
  if (!gE('#attr_outer')) {
    return;
  }
  let incBtns;
  let isAdding;
  while(!incBtns || incBtns.length){
    incBtns = Array.from(gE('#attr_table img', 'all')).filter(e=>e.id.includes('_inc') && !e.src.includes('_d.png'));
    const displays = incBtns.map(e=>Array.from(gE('#attr_table td', 'all')).filter(e=>e.id.includes('_display')).find(d=>d.id === e.id.replace('_inc','_display')));
    let min=Number.MAX_SAFE_INTEGER;
    let minBtn = undefined;
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
  return true;
}

// Utils
function pauseAsync(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

function goto() { // 前进
  window.location.href = window.location;
  setTimeout(goto, 5000);
}

function initAjax() {
  const $ajax = {
    debug: true,
    interval: 300, // DO NOT DECREASE THIS NUMBER, OR IT MAY TRIGGER THE SERVER'S LIMITER AND YOU WILL GET BANNED
    max: 4,
    tid: null,
    error: null,
    conn: 0,
    queue: [],

    insert: function (url, data, method, context = {}, headers = {}) {
      return $ajax.fetch(url, data, method, context, headers, true);
    },
    fetch: function (url, data, method, context = {}, headers = {}, isInsert = false) {
      return new Promise((resolve, reject) => {
        $ajax.add(method, url, data, resolve, reject, context, headers, isInsert);
      });
    },
    open: function (url, data, method, context = {}, headers = {}) {
      $ajax.fetch(url, data, method, context, headers).then(goto).catch(e => { console.error(e) });
    },
    openNoFetch: function (url, newTab) {
      window.open(url, newTab ? '_blank' : '_self')
    },
    repeat: function (count, func, ...args) {
      const list = [];
      for (let i = 0; i < count; i++) {
        list.push(func(...args));
      }
      return list;
    },
    add: function (method, url, data, onload, onerror, context = {}, headers = {}, isInsert = false) {
      method = !data ? 'GET' : method ?? 'POST';
      if (method === 'POST') {
        headers['Content-Type'] ??= 'application/x-www-form-urlencoded';
        if (data && typeof data === 'object') {
          data = Object.entries(data).map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v)).join('&');
        }
      } else if (method === 'JSON') {
        method = 'POST';
        headers['Content-Type'] ??= 'application/json';
        if (data && typeof data === 'object') {
          data = JSON.stringify(data);
        }
      }
      context.onload = onload;
      context.onerror = onerror;
      if (isInsert) {
        $ajax.queue.unshift({ method, url, data, headers, context, onload: $ajax.onload, onerror: $ajax.onerror });
      } else {
        $ajax.queue.push({ method, url, data, headers, context, onload: $ajax.onload, onerror: $ajax.onerror });
      }
      $ajax.next();
    },
    next: function () {
      if (!$ajax.queue.length) {
        return;
      }
      if ($ajax.tid) {
        if (!$ajax.conn) {
          clearTimeout($ajax.tid);
          $ajax.tid = null;
          $ajax.timer();
          $ajax.send();
        }
      } else {
        if ($ajax.conn < $ajax.max) {
          $ajax.timer();
          $ajax.send();
        }
      }
    },
    getLast: function () {
      const v = localStorage.getItem((isIsekai ? 'hvuti' : 'hvut') + '_last_post');
      return v === null ? undefined : JSON.parse(v);
    },
    setLast: function (last) {
      localStorage.setItem((isIsekai ? 'hvuti' : 'hvut') + '_last_post', JSON.stringify(last));
    },
    timer: function () {
      function ontimer() {
        const now = new Date().getTime();
        const last = $ajax.getLast();
        if (last && now - last >= $ajax.interval) {
          $ajax.next();
          return;
        }
        $ajax.setLast(now);
        $ajax.tid = null;
        $ajax.next();
      };
      $ajax.tid = setTimeout(ontimer, $ajax.interval);
    },
    simplify: function (r) {
      const info = {};
      info.url = r.url;
      if (r.data) info.data = r.data;
      if (r.method) info.method = r.method;
      if (r.context && JSON.stringify(r.context) !== JSON.stringify({})) info.context = r.context;
      if (r.headers && JSON.stringify(r.headers) !== JSON.stringify({})) info.headers = r.headers;
      return info;
    },
    send: function () {
      const current = $ajax.queue.shift();
      GM_xmlhttpRequest(current);
      $ajax.conn++;
      if (!$ajax.debug) return;
      const remain = $ajax.queue.map($ajax.simplify);
      console.log('$ajax.send:', $ajax.simplify(current), remain?.length ? 'remain:' : '', remain?.length ? remain : '');
    },
    onload: function (r) {
      $ajax.conn--;
      const text = r.responseText;
      if (r.status !== 200) {
        $ajax.error = `${r.status} ${r.statusText}: ${r.finalUrl}`;
        r.context.onerror?.();
      } else if (text === 'state lock limiter in effect') {
        if ($ajax.error !== text) {
          // popup(`<p style="color: #f00; font-weight: bold;">${text}</p><p>Your connection speed is so fast that <br>you have reached the maximum connection limit.</p><p>Try again later.</p>`);
          console.error(`${text}\nYour connection speed is so fast that you have reached the maximum connection limit. Try again later.`)
        }
        $ajax.error = text;
        r.context.onerror?.();
      } else {
        r.context.onload?.(text);
        $ajax.next();
      }
    },
    onerror: function (r) {
      $ajax.conn--;
      $ajax.error = `${r.status} ${r.statusText}: ${r.finalUrl}`;
      r.context.onerror?.();
      $ajax.next();
    },
  };
  window.addEventListener('unhandledrejection', (e) => { console.error($ajax.error, e); });
  return $ajax;
}

function $doc(h) {
  const doc = document.implementation.createHTMLDocument('');
  doc.documentElement.innerHTML = h;
  return doc;
}

function popup(text) {
  const popupWindow = cE('div');
  popupWindow.style.cssText += 'position:fixed;top:0;left:0;width:1236px;height:702px;padding:3px 100% 100% 3px;background-color:#0006;z-index:1001;cursor:pointer;display:flex;justify-content:center;align-items:center;'
  popupWindow.addEventListener('click', r);
  document.body.appendChild(popupWindow);
  const display = cE('div');
  display.innerText = text;
  display.style.cssText += 'min-width:400px;min-height:100px;max-width:100%;max-height:100%;padding:10px;background-color:#fff;border:1px solid;display:flex;flex-direction:column;justify-content:center;font-size:10pt;color:#333;';
  popupWindow.appendChild(display);
  document.addEventListener('keydown', r);
  return display;

  function r(e) {
    switch(true) {
      case e.key?.length >=2 && e.key?.includes('F'): return;
      case e.ctrlKey: return;
      default: break;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    if (e.button !== 0 && !['Enter', ' ', 'Escape'].includes(e.key)) {
      return;
    }
    popupWindow.remove();
    document.removeEventListener('keydown', r);
  }
}
