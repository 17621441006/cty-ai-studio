// CTY scratch adapter for original public Catch Stars module.
// Gameplay/rendering are preserved; environment hooks and destroy() are isolated.
import { palette as C } from './cat-pixels-original.js';
import { createStarCatSkin, starCatBounds, STAR_CAT_SIZE } from '../../../../lib/pixel-cat';
const B = (zh, en) => ({ zh, en });
const R = value => value == null ? '' : typeof value === 'string' || typeof value === 'number' ? String(value) : value.zh ?? value.en ?? '';
const V = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ye = () => () => { };
function H(e, t = {}, ...n) { let r = document.createElement(e), i = t || {}; for (let [e, t] of Object.entries(i))
    t != null && t !== !1 && (e === `class` ? r.className = t : e === `text` ? r.textContent = t : e === `html` ? r.innerHTML = t : e === `i18n` ? (r.dataset.zh = t.zh ?? t.en, r.dataset.en = t.en ?? t.zh) : e === `i18nAttr` ? r.dataset.i18nAttr = t : e === `style` && typeof t == `object` ? Object.assign(r.style, t) : e === `dataset` ? Object.assign(r.dataset, t) : e.startsWith(`on`) && typeof t == `function` ? r.addEventListener(e.slice(2), t) : r.setAttribute(e, t === !0 ? `` : t)); if (i.i18n) {
    let e = R(i.i18n);
    i.i18nAttr ? r.setAttribute(i.i18nAttr, e) : r.textContent = e;
} for (let e of n.flat())
    e != null && e !== !1 && r.append(e.nodeType ? e : document.createTextNode(String(e))); return r; }
function u(e) { let t = 0, n = 0, r = 0, i = !1, a = o => { let s = n ? Math.min(.05, (o - n) / 1e3) : 1 / 60; n = o, r += s, e(s, r), i && (t = requestAnimationFrame(a)); }, o = () => { document.hidden ? cancelAnimationFrame(t) : i && (n = 0, t = requestAnimationFrame(a)); }, s = { start() { return i || (i = !0, n = 0, t = requestAnimationFrame(a)), s; }, stop() { return i = !1, cancelAnimationFrame(t), s; }, destroy() { return s.stop(), document.removeEventListener(`visibilitychange`, o), s; }, get running() { return i; }, get time() { return r; } }; return document.addEventListener(`visibilitychange`, o), s; }
export function createStarsRuntime(host = { emit() { }, isActive() { return true; } }, { storageKey = 'cty-stars-best', sound = {} } = {}) {
    const catSkin=createStarCatSkin();
    const z = new Proxy(sound, { get: (target, name) => typeof target[name] === 'function' ? target[name] : () => { } });
    var Gi = 160, Ki = 30, qi = storageKey, Ji = { 0: `111101101101111`, 1: `010110010010111`, 2: `111001111100111`, 3: `111001111001111`, 4: `101101111001001`, 5: `111100111001111`, 6: `111100111101111`, 7: `111001010010010`, 8: `111101111101111`, 9: `111101111001111`, "+": `000010111010000`, "-": `000000111000000`, x: `000101010101000` };
    function Yi(e, t, n, r, i) { e.fillStyle = i; let a = n; for (let n of String(t)) {
        let t = Ji[n];
        if (t)
            for (let n = 0; n < 15; n++)
                t[n] === `1` && e.fillRect(a + n % 3, r + Math.floor(n / 3), 1, 1);
        a += 4;
    } }
    var Xi = [`...g...`, `...g...`, `..gGg..`, `ggGWGgg`, `..gGg..`, `...g...`, `...g...`], Zi = [`....G....`, `....g....`, `...gGg...`, `..gGWGg..`, `GgGWWWGgG`, `..gGWGg..`, `...gGg...`, `....g....`, `....G....`], Qi = { g: C.gold, G: C.goldHi, W: C.creamHi };
    function $i(e, t, n, r) { for (let i = 0; i < t.length; i++)
        for (let a = 0; a < t[i].length; a++) {
            let o = t[i][a];
            o !== `.` && (e.fillStyle = Qi[o], e.fillRect(n + a, r + i, 1, 1));
        } }
    var ea = 0;
    try {
        ea = +(localStorage.getItem(qi) || 0) || 0;
    }
    catch { }
    function ta(e) { let t = H(`canvas`, { class: `gm-cv`, width: Gi * 2, height: 150 * 2, "aria-label": `` }), r = t.getContext(`2d`), a = H(`span`, { class: `gm-score px` }, `0`), o = H(`span`, { class: `gm-timebar` }, Array.from({ length: 15 }, () => H(`i`, { class: `is-on` }))), s = H(`span`, { class: `gm-time px` }, `0:${Ki}`), c = H(`span`, { class: `gm-best px` }), l = H(`div`, { class: `gm-hud` }, H(`span`, { class: `gm-hud__l` }, H(`span`, { class: `gm-star`, "aria-hidden": `true` }, `★`), a), H(`span`, { class: `gm-hud__m` }, o, s), c), d = H(`div`, { class: `gm-ov` }), f = H(`div`, { class: `gm-stage` }, t, d), p = H(`button`, { class: `gm-pad`, type: `button`, i18n: B(`向左`, `Left`), i18nAttr: `aria-label` }, `◀`), m = H(`button`, { class: `gm-pad`, type: `button`, i18n: B(`向右`, `Right`), i18nAttr: `aria-label` }, `▶`), h = H(`div`, { class: `gm-pads` }, p, m), g = H(`div`, { class: `app game`, tabindex: `-1` }, l, f, h), _ = 150, v = 3, y = { state: `title`, score: 0, time: Ki, combo: 0, maxCombo: 0, caught: 0, cat: { x: Gi / 2, vx: 0, face: 1, dizzy: 0, walkT: 0, blink: 0 }, items: [], parts: [], pops: [], spawnT: .4, shake: 0, target: null, keys: { l: !1, r: !1 }, visible: !1, newBest: !1, bgStars: [] }, b = () => _ - 12, x = null; function S() { x = document.createElement(`canvas`), x.width = Gi, x.height = _; let e = x.getContext(`2d`), t = e.createLinearGradient(0, 0, 0, _); t.addColorStop(0, C.night0), t.addColorStop(.7, C.night2), t.addColorStop(1, C.night3), e.fillStyle = t, e.fillRect(0, 0, Gi, _), e.fillStyle = `rgba(244,228,196,.10)`, e.beginPath(), e.arc(136, 22, 17, 0, Math.PI * 2), e.fill(); for (let t = -11; t <= 11; t++)
        for (let n = -11; n <= 11; n++)
            n * n + t * t > 121 || (e.fillStyle = (n * 7 + t * 13 + 99) % 9 == 0 || n > 2 && t < -3 && (n + t) % 3 == 0 ? C.blue8 : n + t < -6 ? C.creamHi : C.cream, e.fillRect(136 + n, 22 + t, 1, 1)); e.fillStyle = C.gold; for (let t = 0; t < 64; t++) {
        let n = Math.round(136 + Math.cos(t / 10) * 12), r = Math.round(22 + Math.sin(t / 10) * 12);
        e.fillRect(n, r, 1, 1);
    } for (let t = 0; t < 46; t++)
        e.fillStyle = t % 5 ? `#6c7f9c` : C.goldHi, e.fillRect(t * 37 % Gi, t * 53 % (_ - 40), 1, 1); let n = b(); for (let t = 0; t < Gi; t += 4) {
        let r = 3 + Math.round(2 + Math.sin(t * .11) * 2 + Math.sin(t * .31) * 1.3);
        for (let i = n - r + 2; i < _; i += 4) {
            let r = i < n + 2, a = (t * 7 + i * 3) % 11;
            e.fillStyle = r ? a < 4 ? C.goldHi : a < 7 ? C.creamHi : C.mist : a < 3 ? C.blue8 : a < 7 ? C.blue6 : C.blue5, e.fillRect(t, i, 3, 3), e.fillStyle = `rgba(255,255,255,.25)`, e.fillRect(t, i, 3, 1);
        }
    } } function w() { let e = g.clientWidth, n = g.clientHeight; if (!e || !n)
        return; let r = Math.max(160, e - 24), i = Math.max(140, n - l.offsetHeight - (h.offsetParent ? h.offsetHeight + 12 : 0) - 36); v = Math.max(1, Math.min(Math.floor(r / Gi), Math.floor(i / 120))); let a = V(Math.floor(i / v), 120, 250); (a !== _ || !x) && (_ = a, t.height = _ * 2, S()), t.style.width = `${Gi * v}px`, t.style.height = `${_ * v}px`, f.style.width = `${Gi * v}px`, f.style.height = `${_ * v}px`, y.cat.x = V(y.cat.x, 10, 150), te(0); } function T() { if (d.replaceChildren(), y.state === `playing`) {
        d.hidden = !0;
        return;
    } d.hidden = !1, y.state === `title` ? d.append(H(`div`, { class: `gm-ov__t px` }, R(B(`接星星`, `Catch Stars`))), H(`p`, { class: `gm-ov__p` }, R(B(`左右移动小猫，接住金色星星，躲开蓝色方块。30 秒一局。`, `Move the cat left and right. Catch gold stars, dodge blue blocks. 30 seconds.`))), H(`div`, { class: `gm-ov__keys px` }, H(`kbd`, {}, `←`), H(`kbd`, {}, `→`), H(`span`, {}, R(B(`或 拖动 / 触摸`, `or drag / touch`)))), H(`div`, { class: `gm-ov__legend px` }, H(`span`, {}, H(`i`, { class: `lg-star` }), `+1`), H(`span`, {}, H(`i`, { class: `lg-big` }), `+5`), H(`span`, {}, H(`i`, { class: `lg-blk` }), `−3`)), H(`button`, { class: `btn btn--gold gm-go`, type: `button`, onclick: D }, H(`span`, { class: `px` }, R(B(`开始`, `Start`))))) : y.state === `paused` ? d.append(H(`div`, { class: `gm-ov__t px` }, R(B(`暂停`, `Paused`))), H(`button`, { class: `btn btn--gold gm-go`, type: `button`, onclick: k }, H(`span`, { class: `px` }, R(B(`继续`, `Resume`))))) : y.state === `over` && d.append(H(`div`, { class: `gm-ov__t px` }, R(B(`时间到！`, `Time's up!`))), H(`div`, { class: `gm-ov__score px` }, `★ ${y.score}`), H(`p`, { class: `gm-ov__p` }, R(B(`接住 ${y.caught} 颗 · 最高连击 ${y.maxCombo}`, `${y.caught} caught · best combo ${y.maxCombo}`))), y.newBest ? H(`div`, { class: `gm-ov__new px` }, R(B(`新纪录！`, `New record!`))) : H(`p`, { class: `gm-ov__p gm-ov__dim px` }, R(B(`最高分 ${ea}`, `Best ${ea}`))), H(`button`, { class: `btn btn--gold gm-go`, type: `button`, onclick: D }, H(`span`, { class: `px` }, R(B(`再来一局`, `Play again`))))); } function E() { a.textContent = String(y.score); let e = Math.max(0, Math.ceil(y.time)); s.textContent = `0:${String(e).padStart(2, `0`)}`; let t = o.children.length, n = Math.ceil(y.time / Ki * t); for (let e = 0; e < t; e++)
        o.children[e].classList.toggle(`is-on`, e < n); g.classList.toggle(`is-hurry`, y.state === `playing` && y.time <= 5), c.textContent = R(B(`最高 ${ea}`, `Best ${ea}`)); } function D() { Object.assign(y, { state: `playing`, score: 0, time: Ki, combo: 0, maxCombo: 0, caught: 0, items: [], parts: [], pops: [], spawnT: .5, newBest: !1 }), y.cat.dizzy = 0; for (let [e, t] of [[.12, .3], [.32, .7], [.52, .45]])
        y.items.push({ type: `star`, x: 12 + 136 * (t + Math.random() * .2 - .1), y: _ * e, vy: _ / 150 * 34, vx: 0, phase: 0 }); z.select(), T(), E(), g.focus({ preventScroll: !0 }), ne.running || ne.start(), e.emit(`game`, { type: `start` }); } function O() { y.state === `playing` && (y.state = `paused`, T()); } function k() { y.state === `paused` && (y.state = `playing`, T(), g.focus({ preventScroll: !0 })); } function A() { if (y.state = `over`, y.score > ea) {
        ea = y.score, y.newBest = !0;
        try {
            localStorage.setItem(qi, String(ea));
        }
        catch { }
    } [0, 4, 7, 12].forEach((e, t) => setTimeout(() => z.blip(523 * 2 ** (e / 12), .09), t * 90)), y.newBest && setTimeout(() => { z.sparkle(), z.meow(), e.wall?.hop(); }, 420), T(), E(), e.emit(`game`, { type: `over`, score: y.score }); } let j = (e, t) => e + Math.random() * (t - e); function ee() { let e = 1 - y.time / Ki, t = Math.random(), n = t < .07 ? `big` : t < .27 + e * .1 ? `block` : `star`, r = _ / 150, i = { type: n, x: j(8, 152), y: -8, vx: 0, phase: Math.random() * 6 }; n === `star` && (i.vy = (38 + e * 26 + j(0, 12)) * r), n === `big` && (i.vy = (26 + e * 12) * r), n === `block` && (i.vy = (46 + e * 34 + j(0, 14)) * r, i.vx = j(-8, 8), i.c = [C.blue5, C.blue6, C.blue7][Math.floor(Math.random() * 3)]), y.items.push(i); } function M(e, t, n, r = 8, i = 40) { for (let a = 0; a < r; a++) {
        let r = Math.random() * Math.PI * 2, o = j(i * .4, i);
        y.parts.push({ x: e, y: t, vx: Math.cos(r) * o, vy: Math.sin(r) * o - 20, life: j(.3, .6), t: 0, c: n[a % n.length] });
    } } function N(e, t, n, r) { y.pops.push({ x: e, y: t, text: n, color: r, t: 0 }); } function P(e) { if(y.state === 'paused')return;let t = y.cat; if (t.blink -= e, t.blink < -3 && (t.blink = .14), y.state !== `playing`) {
        Math.random() < e * 1.2 && y.items.push({ type: `star`, x: j(8, 152), y: -8, vy: j(14, 22), vx: 0, phase: 0, ghost: !0 });
        for (let t of y.items)
            t.y += t.vy * e;
        y.items = y.items.filter(e => e.y < b() + 4), F(e);
        return;
    } if (y.time -= e, y.time <= 0) {
        y.time = 0, E(), A();
        return;
    } let n = 1 - y.time / Ki; y.spawnT -= e, y.spawnT <= 0 && (ee(), y.spawnT = (y.time <= 5 ? .24 : .62 - n * .3) * j(.75, 1.25)); let r = 0; if (t.dizzy > 0)
        t.dizzy -= e;
    else if (y.keys.l && --r, y.keys.r && (r += 1), !r && y.target != null) {
        let e = y.target - t.x;
        Math.abs(e) > 1.5 && (r = V(e / 10, -1, 1));
    } t.vx += (r * 118 - t.vx) * Math.min(1, e * 14), t.x = V(t.x + t.vx * e, 11, 149), Math.abs(t.vx) > 8 && (t.face = t.vx > 0 ? 1 : -1, t.walkT += e); let i = b(), a = starCatBounds(t.x, i); for (let n of y.items) {
        if (n.y += n.vy * e, n.x += n.vx * e, n.phase += e * 8, n.ghost)
            continue;
        let r = n.type === `big` ? 4 : 3;
        if (n.x + r > a.x0 && n.x - r < a.x1 && n.y + r > a.y0 && n.y - r < a.y1) {
            if (n.dead = !0, n.type === `block`)
                t.dizzy <= 0 && (y.score = Math.max(0, y.score - 3), y.combo = 0, t.dizzy = .7, y.shake = .3, M(n.x, n.y, [C.blue5, C.blue7, C.blue8], 10, 50), N(n.x, n.y - 6, `-3`, C.blue8), z.error());
            else {
                let e = n.type === `big` ? 5 : 1;
                y.combo++, y.caught++, y.maxCombo = Math.max(y.maxCombo, y.combo);
                let r = n.type === `star` && y.combo >= 10 ? 2 : +(n.type === `star` && y.combo >= 5);
                y.score += e + r, M(n.x, n.y, n.type === `big` ? [C.goldHi, C.creamHi, C.gold] : [C.gold, C.goldHi], n.type === `big` ? 14 : 8, n.type === `big` ? 60 : 40), N(n.x, n.y - 6, `+${e + r}`, n.type === `big` ? C.creamHi : C.goldHi), y.combo > 0 && y.combo % 5 == 0 && N(t.x, i - 30, `x${y.combo}`, C.tealHi), n.type === `big` ? z.sparkle() : z.hover(y.combo);
            }
            E();
        }
        else
            n.y > i + 2 && (n.dead = !0, n.type === `block` ? M(n.x, i, [C.blue6], 3, 18) : (y.combo = 0, M(n.x, i, [C.mist, C.blue8], 3, 18)));
    } y.items = y.items.filter(e => !e.dead), y.shake > 0 && (y.shake -= e), F(e), Math.floor(y.time * 4) !== y._lastHud && (y._lastHud = Math.floor(y.time * 4), E(), y.time <= 3.05 && Math.floor(y.time) !== y._lastTick && (y._lastTick = Math.floor(y.time), z.tick())); } function F(e) { for (let t of y.parts)
        t.t += e, t.x += t.vx * e, t.y += t.vy * e, t.vy += 90 * e; y.parts = y.parts.filter(e => e.t < e.life); for (let t of y.pops)
        t.t += e; y.pops = y.pops.filter(e => e.t < .8); } function te(e) { if (!x)
        return; r.setTransform(2,0,0,2,0,0);r.imageSmoothingEnabled=false;r.save(), y.shake > 0 && r.translate(Math.round((Math.random() - .5) * 3), Math.round((Math.random() - .5) * 2)), r.drawImage(x, 0, 0); for (let t = 0; t < 8; t++)
        Math.sin(e * (1 + t * .3) + t) > .6 && (r.fillStyle = C.creamHi, r.fillRect((t * 41 + 9) % Gi, (t * 29 + 11) % (_ - 50), 1, 1)); for (let e of y.items) {
        let t = Math.round(e.x), n = Math.round(e.y);
        e.type === `block` ? (r.fillStyle = C.grout, r.fillRect(t - 4, n - 4, 8, 8), r.fillStyle = e.c, r.fillRect(t - 3, n - 3, 6, 6), r.fillStyle = `rgba(255,255,255,.35)`, r.fillRect(t - 3, n - 3, 6, 1), r.fillStyle = `rgba(0,8,30,.35)`, r.fillRect(t - 3, n + 2, 6, 1)) : e.type === `big` ? (r.globalAlpha = .22 + .14 * Math.sin(e.phase), r.fillStyle = C.goldHi, r.fillRect(t - 3, n - 7, 7, 15), r.fillRect(t - 7, n - 3, 15, 7), r.fillRect(t - 5, n - 5, 11, 11), r.globalAlpha = 1, $i(r, Zi, t - 4, n - 4)) : (e.ghost && (r.globalAlpha = .45), $i(r, Xi, t - 3, n - 3), r.globalAlpha = 1, r.fillStyle = `rgba(248,216,160,.35)`, r.fillRect(t, n - 6, 1, 2));
    } let t = y.cat, a = b(), o = Math.abs(t.vx) > 8 && y.state === `playing`;
    r.fillStyle = `rgba(0,6,20,.35)`;r.fillRect(Math.round(t.x - 10), a - 1, 20, 2);
    catSkin.draw(r,t.x,a,{walking:o,walkTime:t.walkT,face:t.face,dizzy:t.dizzy>0,time:e});
    if (t.dizzy > 0)
        for (let n = 0; n < 3; n++) {
            let i = e * 8 + n * 2.1;
            r.fillStyle = n ? C.blue8 : C.goldHi, r.fillRect(Math.round(t.x + Math.cos(i) * 7), Math.round(a - STAR_CAT_SIZE.height - 3 + Math.sin(i) * 2), 2, 2);
        } for (let e of y.parts)
        r.globalAlpha = 1 - e.t / e.life, r.fillStyle = e.c, r.fillRect(Math.round(e.x), Math.round(e.y), 1, 1); r.globalAlpha = 1; for (let e of y.pops) {
        r.globalAlpha = 1 - e.t / .8;
        let t = String(e.text).length * 4;
        Yi(r, e.text, Math.round(e.x - t / 2), Math.round(e.y - e.t * 16), e.color);
    } r.globalAlpha = 1, y.state === `playing` && y.time <= 5 && (r.fillStyle = `rgba(236,194,115,.07)`, r.fillRect(0, 0, Gi, _)), r.restore(); } let ne = u((e, t) => { y.visible && (P(e), te(t)); }), re = e => { let n = t.getBoundingClientRect(); return (e - n.left) / n.width * Gi; }; t.addEventListener(`pointerdown`, e => { y.target = re(e.clientX); try {
        t.setPointerCapture(e.pointerId);
    }
    catch { } y.state === `title` && D(); }), t.addEventListener(`pointermove`, e => { (e.pointerType === `mouse` || e.buttons || e.pressure > 0) && (y.target = re(e.clientX)); }), t.addEventListener(`pointerleave`, e => { e.pointerType === `mouse` && (y.target = null); }), t.addEventListener(`pointerup`, e => { e.pointerType !== `mouse` && (y.target = null); }); let ie = (e, t) => { let n = e => { e.preventDefault(), y.keys[t] = !0, y.target = null; }, r = () => { y.keys[t] = !1; }; e.addEventListener(`pointerdown`, n), e.addEventListener(`pointerup`, r), e.addEventListener(`pointerleave`, r), e.addEventListener(`pointercancel`, r); }; ie(p, `l`), ie(m, `r`); let I = (t, n) => { if (!y.visible || !e.isActive(`game`) || t.target.closest && t.target.closest(`input, textarea`))
        return; let r = t.key; (r === `ArrowLeft` || r === `a` || r === `A`) && (y.keys.l = n, y.target = null, t.preventDefault()), (r === `ArrowRight` || r === `d` || r === `D`) && (y.keys.r = n, y.target = null, t.preventDefault()), n && (r === ` ` || r === `Enter`) && !t.target.closest?.(`button`) && (y.state === `title` || y.state === `over` ? (D(), t.preventDefault()) : y.state === `paused` && (k(), t.preventDefault())), !t.repeat && n && (r === `p` || r === `P` || r === `Escape`) && (y.state === `playing` ? O() : y.state === `paused` && k()); }; let keyDown = e => I(e, !0), keyUp = e => I(e, !1), sizeObserver = new ResizeObserver(() => { if(!g.clientWidth || !g.clientHeight){y.visible=false;O();y.keys.l=y.keys.r=false;ne.stop()}else{y.visible=true;w();ne.running||ne.start()} }); const clearInput=()=>{y.keys.l=y.keys.r=false;y.target=null};g.addEventListener(`focusout`,clearInput);const loseFocus=()=>{clearInput();O()};window.addEventListener(`blur`,loseFocus);document.addEventListener(`visibilitychange`,clearInput);sizeObserver.observe(g); return document.addEventListener(`keydown`, keyDown), document.addEventListener(`keyup`, keyUp), ye(() => { T(), E(), t.setAttribute(`aria-label`, R(B(`接星星游戏画面`, `Catch Stars game canvas`))); }), t.setAttribute(`aria-label`, R(B(`接星星游戏画面`, `Catch Stars game canvas`))), T(), E(), { el: g, destroy() { catSkin.dispose();y.visible = false; window.removeEventListener(`blur`,loseFocus);document.removeEventListener(`visibilitychange`,clearInput);g.removeEventListener(`focusout`,clearInput);ne.destroy(); sizeObserver.disconnect(); document.removeEventListener(`keydown`, keyDown); document.removeEventListener(`keyup`, keyUp); y.keys.l = y.keys.r = false; }, onShow() { y.visible = !0, w(), ne.start(), y.state === `paused` && T(); }, onHide() { y.visible = !1, O(), y.keys.l = y.keys.r = !1, ne.stop(); }, onResize() { y.visible && w(); }, focusTarget: () => y.state === `playing` ? g : d.querySelector(`button`) || g, start: D, pause: O, resume: k, get state() { return y.state; }, get score() { return y.score; }, peek() { let e = t.getBoundingClientRect(), n = e.width / Gi; return { cat: { x: e.left + y.cat.x * n, y: e.top + b() * n }, items: y.items.filter(e => !e.ghost).map(t => ({ type: t.type, x: e.left + t.x * n, y: e.top + t.y * n })), rect: { x: e.left, y: e.top, w: e.width, h: e.height }, time: y.time }; } }; }
    return ta(host);
}
