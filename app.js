/* =============================================================
   Slot the Ball — mobile instant mode.
   Stake → three reels spin slices of real frames → they lock into one
   photo with the ball erased → touch-drag to aim (loupe) → one shot →
   the judges' ball drops in, the rings pay ×10 · ×5 · ×2 · stake back.
   ============================================================= */
(() => {
'use strict';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

/* target = judges' ball centre (% of image); ballSize = true ball width (% of
   image width); ballImg/ballW = the restored ball cut from the original photo.
   Same measurements as the player site (web/js/data.js). */
const FRAMES = [
  { id: 'sc-freekick', sport: 'soccer', title: 'The Wall', sub: 'Set-piece chaos in the box', img: 'assets/img/soccer-1.jpg', target: { x: 9.9, y: 50.4 }, ballSize: 4.3, ballImg: 'assets/balls/sc-freekick.png', ballW: 9.46 },
  { id: 'sc-eldiez', sport: 'soccer', title: 'El Diez', sub: 'The №10 strikes — keeper at full flight', img: 'assets/img/soccer-2.jpg', target: { x: 14.0, y: 77.3 }, ballSize: 5.8, ballImg: 'assets/balls/sc-eldiez.png', ballW: 12.27 },
  { id: 'sc-stretch', sport: 'soccer', title: 'Full Stretch', sub: 'Beaten at the near post?', img: 'assets/img/soccer-3.jpg', target: { x: 22.6, y: 82.6 }, ballSize: 7.2, ballImg: 'assets/balls/sc-stretch.png', ballW: 18.46 },
  { id: 'sc-slide', sport: 'soccer', title: 'The Slide', sub: 'Last-ditch block on the edge of the area', img: 'assets/img/soccer-4.jpg', target: { x: 18.4, y: 72.2 }, ballSize: 6.9, ballImg: 'assets/balls/sc-slide.png', ballW: 14.52 },
  { id: 'sc-firsttouch', sport: 'soccer', title: 'First Touch', sub: 'Cross whipped in — who gets there first?', img: 'assets/img/soccer-5.jpg', target: { x: 46.1, y: 20.0 }, ballSize: 6.1, ballImg: 'assets/balls/sc-firsttouch.png', ballW: 11.96 },
  { id: 'fb-pocket', sport: 'football', title: 'Pocket Pressure', sub: 'Release under the rush', img: 'assets/img/football-1.jpg', target: { x: 71.9, y: 9.5 }, ballSize: 10.3, ballImg: 'assets/balls/fb-pocket.png', ballW: 22.06 },
  { id: 'fb-fourthdown', sport: 'football', title: 'Fourth Down', sub: 'The pass breakup that decided the bowl', img: 'assets/img/football-2.jpg', target: { x: 44.4, y: 46.7 }, ballSize: 9.6, ballImg: 'assets/balls/fb-fourthdown.png', ballW: 18.91 },
  { id: 'fb-looseball', sport: 'football', title: 'Loose Ball', sub: 'Fumble! Every eye on the turf', img: 'assets/img/football-3.jpg', target: { x: 65.0, y: 86.4 }, ballSize: 11.3, ballImg: 'assets/balls/fb-looseball.png', ballW: 16.94 },
  { id: 'bb-topkey', sport: 'basketball', title: 'Top of the Key', sub: 'Bird\'s-eye over the rim', img: 'assets/img/basketball-1.jpg', target: { x: 46.5, y: 87.8 }, ballSize: 9.4, ballImg: 'assets/balls/bb-topkey.png', ballW: 16.3 },
  { id: 'bb-rimrunner', sport: 'basketball', title: 'Rim Runner', sub: 'Traffic in the paint', img: 'assets/img/basketball-2.jpg', target: { x: 48.8, y: 10.0 }, ballSize: 8.9, ballImg: 'assets/balls/bb-rimrunner.png', ballW: 18.83 },
  { id: 'bb-elevation', sport: 'basketball', title: 'Elevation', sub: 'Two bigs, one ball', img: 'assets/img/basketball-3.jpg', target: { x: 48.1, y: 7.0 }, ballSize: 5.1, ballImg: 'assets/balls/bb-elevation.png', ballW: 10.94 },
];
const ICON = { soccer: '⚽', basketball: '🏀', football: '🏈' };
const SPORT = { soccer: 'Soccer', basketball: 'Basketball', football: 'Football' };
/* r = zone radius in ball widths */
const ZONES = [{ m: 10, r: .5, c: '#ffc247', t: 'Bullseye' }, { m: 5, r: 1, c: '#22d3ee', t: 'Close' },
               { m: 2, r: 1.7, c: '#34e5a1', t: 'Near' }, { m: 1, r: 2.6, c: '#a884ff', t: 'Stake back' }];
const STAKES = [{ v: 1, c: '#5b2fd6' }, { v: 2, c: '#0e8ea8' }, { v: 5, c: '#c92a64' }, { v: 10, c: '#b8780f' }];

const BALL = {
  soccer: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#fff" stroke="#111" stroke-width="3"/><path d="M50 30 69 44 62 66H38L31 44Z" fill="#111"/><path d="M50 30V3M69 44 95 36M62 66 77 90M38 66 23 90M31 44 5 36" stroke="#111" stroke-width="3"/></svg>`,
  basketball: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#e8742a" stroke="#3a1a06" stroke-width="3"/><path d="M2 50h96M50 2v96M17 15c17 19 17 51 0 70M83 15c-17 19-17 51 0 70" fill="none" stroke="#3a1a06" stroke-width="3"/></svg>`,
  football: `<svg viewBox="0 0 100 60"><ellipse cx="50" cy="30" rx="48" ry="28" fill="#7a3d18" stroke="#2c1206" stroke-width="3"/><path d="M14 17c6 4 6 22 0 26M86 17c-6 4-6 22 0 26" stroke="#fff" stroke-width="3" fill="none"/><path d="M36 30h28M40 25v10M46 25v10M52 25v10M58 25v10" stroke="#fff" stroke-width="2.5"/></svg>`,
};
const ballH = sport => sport === 'football' ? .6 : 1;
const AR = 2 / 3;                                   // every frame is 3:2
/* distance in % of image width, isotropic: a vertical miss costs the same */
const dist = (f, p) => Math.hypot(p.x - f.target.x, (p.y - f.target.y) * AR);
const money = n => '$' + n.toFixed(2);
const round = n => Math.round(n * 100) / 100;
const pick = a => a[Math.random() * a.length | 0];

/* ---------------- state ---------------- */
const KEY = 'stb_slot_mobile_v1';
const S = (() => {
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && typeof s.bal === 'number') return s; } catch (e) {}
  return { bal: 100, stake: 2, hist: [], muted: false };
})();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
let phase = 'idle', frame = null, pin = null, filter = 'all', touching = false;

/* ---------------- sound (synthesised, no files) ----------------
   Soft mallet/bell voices only — sine partials with a gentle attack, a warm
   low-pass and a light echo. No square or saw waves. */
let AC = null, OUT = null;
const ac = () => {
  if (!AC) {
    try {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200; lp.Q.value = .4;
      const master = AC.createGain(); master.gain.value = .9;
      const dl = AC.createDelay(); dl.delayTime.value = .19;
      const fb = AC.createGain(); fb.gain.value = .22;
      const wet = AC.createGain(); wet.gain.value = .16;
      master.connect(lp); lp.connect(AC.destination);
      lp.connect(dl); dl.connect(fb); fb.connect(dl); dl.connect(wet); wet.connect(AC.destination);
      OUT = master;
    } catch (e) {}
  }
  if (AC && AC.state === 'suspended') AC.resume();
  return AC;
};
/* one partial: sine with a soft 6ms attack and an exponential tail */
function partial(f, d, vol, when = 0, slide = 0) {
  const a = ac(); if (!a || S.muted) return;
  const t = a.currentTime + when, o = a.createOscillator(), g = a.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d * .8);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .006);
  g.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(g); g.connect(OUT); o.start(t); o.stop(t + d + .05);
}
const marimba = (f, vol = .06, when = 0, d = .45) => { partial(f, d, vol, when); partial(f * 4, d * .25, vol * .18, when); };
const bell = (f, vol = .04, when = 0, d = .9) => { partial(f, d, vol, when); partial(f * 2.76, d * .45, vol * .22, when); partial(f * 5.4, d * .2, vol * .08, when); };
const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5, 1568, 1760, 2093];
const SFX = {
  tick: () => partial(880 + Math.random() * 60, .035, .018),
  stop: () => { partial(170, .22, .14, 0, 95); marimba(392, .03); },
  land: () => [0, 2, 4, 5].forEach((n, i) => marimba(PENTA[n], .05, i * .07)),
  place: () => partial(540, .16, .07, 0, 820),
  roll: () => { for (let i = 0; i < 6; i++) marimba(PENTA[i % 3] / 2, .03, i * .09, .25); },
  thud: () => { partial(150, .45, .16, 0, 70); bell(PENTA[3], .025, .02); },
  ring: i => bell(PENTA[2 + i * 2], .03, 0, .7),
  win: big => (big ? [0, 2, 3, 5, 7, 8, 10] : [2, 3, 5]).forEach((n, i) => { marimba(PENTA[n], .055, i * .1); if (i === (big ? 6 : 2)) bell(PENTA[n], .03, i * .1 + .05, 1.4); }),
  lose: () => { marimba(329.63, .045, 0, .5); marimba(261.63, .045, .2, .7); },
  coin: () => bell(PENTA[6 + (Math.random() * 5 | 0)], .012, 0, .35),
};
const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

/* ---------------- static chrome ---------------- */
const winEl = $('#win'), board = $('#board'), cols = $$('.col'), loupe = $('#loupe');
['#bulbsTop', '#bulbsBot'].forEach(s => { $(s).innerHTML = Array.from({ length: 18 }, (_, i) => `<i style="animation-delay:${(i % 6) * .16}s"></i>`).join(''); });

const TICK = [['HawkeyeDan', 10, 50], ['Mia_K', 5, 10], ['PitchPerfect', 2, 10], ['LensQueen', 10, 100], ['ZoneReader', 5, 25],
  ['TopBinsTara', 2, 4], ['EagleEyeEli', 10, 20], ['SwishSofia', 5, 50], ['RadarRay', 2, 20], ['CourtVision', 10, 100]];
const tk = TICK.map(([n, m, w]) => `<span><b>${n}</b> hit <i>×${m}</i> · +$${w}</span>`).join('');
$('#ticker').innerHTML = tk + tk;

$('#chips').innerHTML = STAKES.map(s => `<button class="chip" data-v="${s.v}" style="--cc:${s.c}"><span>$${s.v}</span></button>`).join('');
$('#paytable').innerHTML = ZONES.map(z => `<div class="pt" data-m="${z.m}" style="--c:${z.c}"><i></i><b>×${z.m}</b><span>${z.t}</span></div>`).join('')
  + `<div class="pt-note">Rings are measured in ball widths from the judges' ball. Outside them, the stake is lost.</div>`;

const MUTE_ON = `<svg viewBox="0 0 24 24" fill="none" stroke="#f3f0ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>`;
const MUTE_OFF = `<svg viewBox="0 0 24 24" fill="none" stroke="#a99fd0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>`;
const renderMute = () => { $('#muteBtn').innerHTML = S.muted ? MUTE_OFF : MUTE_ON; };
$('#muteBtn').addEventListener('click', () => { S.muted = !S.muted; save(); renderMute(); if (!S.muted) SFX.place(); });

/* preload every frame so the reels never flash empty */
FRAMES.forEach(f => { new Image().src = f.img; new Image().src = f.ballImg; });

/* ---------------- balance + meter ---------------- */
let balShown = S.bal;
function countTo(el, from, to, ms, fmt = money, onStep) {
  const t0 = performance.now();
  (function step(t) {
    const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3), v = from + (to - from) * e;
    el.textContent = fmt(v); onStep && onStep(k);
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
function renderBal(anim) {
  if (anim) { countTo($('#bal'), balShown, S.bal, 700); const p = $('#balPill'); p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); }
  else $('#bal').textContent = money(S.bal);
  balShown = S.bal;
}
const meter = $('#meter');
function setMeter(lbl, val, msg, cls = '') {
  $('#mLbl').textContent = lbl; if (val != null) $('#mVal').textContent = val;
  $('#mMsg').innerHTML = msg; meter.className = 'meter ' + cls;
}

/* ---------------- stake + filter ---------------- */
function renderChips() { $$('.chip').forEach(c => c.classList.toggle('on', +c.dataset.v === S.stake)); }
$('#chips').addEventListener('click', e => {
  const c = e.target.closest('.chip'); if (!c || !free()) return;
  S.stake = +c.dataset.v; save(); renderChips(); setBtn(); marimba(PENTA[STAKES.findIndex(x => x.v === S.stake) + 2], .05); buzz(8);
});
$('#filters').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || !free()) return;
  filter = b.dataset.f; $$('#filters button').forEach(x => x.classList.toggle('on', x === b));
});
const free = () => phase === 'idle' || phase === 'done';

/* ---------------- the button: spin / shoot / top up ---------------- */
const btn = $('#spinBtn');
function setBtn() {
  const L = $('#spinLbl'), sub = $('#spinSub');
  btn.classList.toggle('shoot', phase === 'aim');
  btn.disabled = phase === 'spin' || phase === 'reveal' || phase === 'aim';
  if (phase === 'aim') { L.textContent = 'Aim'; sub.textContent = 'one shot'; }
  else if (free() && S.bal < S.stake) { L.textContent = 'Top up'; sub.textContent = '+$100 demo'; }
  else { L.textContent = phase === 'done' ? 'Again' : 'Spin'; sub.textContent = money(S.stake); }
  $('#chips').classList.toggle('lock', !free());
  $('#filters').classList.toggle('lock', !free());
}
btn.addEventListener('click', () => {
  ac();
  if (!free()) return;
  if (S.bal < S.stake) { S.bal = round(S.bal + 100); save(); renderBal(true); SFX.win(false); setBtn(); return; }
  spin();
});

/* ---------------- reels ---------------- */
const cell = (f, i) => `<div style="background-image:url(${f.img});background-position:${i * 50}% 50%"></div>`;
const cellH = () => winEl.clientHeight;
function placeStrips() {
  const H = cellH(); winEl.style.setProperty('--ch', H + 'px');
  cols.forEach(c => { c.firstElementChild.style.transform = `translateY(${-c._idx * H}px)`; });
}
cols.forEach((c, i) => { c._cur = pick(FRAMES); c._idx = 0; c.firstElementChild.innerHTML = cell(c._cur, i); });
addEventListener('resize', () => { if (phase !== 'spin') placeStrips(); });

function spin() {
  phase = 'spin'; pin = null;
  S.bal = round(S.bal - S.stake); save(); renderBal(true);
  const pool = FRAMES.filter(f => filter === 'all' || f.sport === filter);
  frame = pick(pool.length > 1 ? pool.filter(f => f !== frame) : pool);
  setBtn();
  board.className = 'board'; board.innerHTML = '';
  $('#idle').classList.add('out'); winEl.classList.remove('landed');
  $$('.pt').forEach(p => p.classList.remove('hit')); $('#cabinet').classList.remove('party');
  const fh = $('#frameHead'); fh.classList.remove('in');
  $('#fhSport').textContent = '◎'; $('#fhTitle').textContent = 'Spinning…'; $('#fhSub').textContent = 'A real moment is landing'; $('#fhTag').textContent = 'Frame —';
  setMeter('Stake', money(S.stake), 'Reels are rolling…');

  const H = cellH(); winEl.style.setProperty('--ch', H + 'px');
  let stopped = 0;
  cols.forEach((col, i) => {
    const strip = col.firstElementChild, N = 13 + i * 5;
    // [spare above, current, …random…, landing frame, spare below]
    const cells = [pick(FRAMES), col._cur];
    for (let k = 2; k < N; k++) cells.push(pick(FRAMES));
    cells.push(frame, pick(FRAMES));
    const T = cells.length - 2, end = -T * H, dur = 1450 + i * 520;
    strip.getAnimations().forEach(a => a.cancel());
    strip.innerHTML = cells.map(c => cell(c, i)).join('');
    strip.style.transform = `translateY(${-H}px)`;
    col.classList.add('blur');
    const anim = strip.animate([
      { transform: `translateY(${-H}px)`, easing: 'ease-out' },
      { transform: `translateY(${-H * .86}px)`, offset: .07, easing: 'cubic-bezier(.45,0,.2,1)' },
      { transform: `translateY(${end - H * .12}px)`, offset: .9, easing: 'cubic-bezier(.3,.7,.4,1)' },
      { transform: `translateY(${end}px)` },
    ], { duration: dur, fill: 'forwards' });
    setTimeout(() => col.classList.remove('blur'), dur * .78);
    anim.onfinish = () => {
      strip.style.transform = `translateY(${end}px)`; anim.cancel();
      col._cur = frame; col._idx = T;
      SFX.stop(); buzz(14);
      if (++stopped === 3) landed();
    };
  });
  // ticks follow the last reel as it passes each frame
  const last = cols[2].firstElementChild; let prev = -1;
  (function tick() {
    if (phase !== 'spin') return;
    const m = new DOMMatrixReadOnly(getComputedStyle(last).transform), idx = Math.floor(-m.m42 / H + .5);
    if (idx !== prev) { prev = idx; SFX.tick(); }
    requestAnimationFrame(tick);
  })();
}

function landed() {
  winEl.classList.add('landed');
  const sw = $('#sweep'); sw.classList.remove('go'); void sw.offsetWidth; sw.classList.add('go');
  SFX.land(); buzz([10, 40, 10]);
  const fh = $('#frameHead'); void fh.offsetWidth; fh.classList.add('in');
  $('#fhSport').textContent = ICON[frame.sport]; $('#fhTitle').textContent = frame.title; $('#fhSub').textContent = frame.sub;
  $('#fhTag').textContent = SPORT[frame.sport];
  setTimeout(() => {
    phase = 'aim'; mountBoard(); setBtn();
    setMeter('Stake', money(S.stake), '<b>Ball removed.</b> Drag to aim — lift your finger to shoot');
  }, 380);
}

/* ---------------- aiming ---------------- */
function mountBoard() {
  const f = frame;
  board.innerHTML = `<img class="ph" src="${f.img}" alt="" draggable="false">
    <div class="xh v"></div><div class="xh h"></div>
    <div class="ghost" style="width:${f.ballSize}%;aspect-ratio:${1 / ballH(f.sport)}">${BALL[f.sport]}</div>`;
  board.className = 'board on hint';
  $('#lpImg').style.backgroundImage = `url(${f.img})`;
  $('#lpBall').innerHTML = BALL[f.sport];
}
const Z = 3, LS = 120;                                  // loupe zoom + size
function at(e) {
  const r = board.getBoundingClientRect();
  const sx = Math.max(0, Math.min(r.width, e.clientX - r.left)), sy = Math.max(0, Math.min(r.height, e.clientY - r.top));
  return { r, x: sx / r.width * 100, y: sy / r.height * 100 };
}
function aim(e, withLoupe) {
  const p = at(e), f = frame;
  const g = board.querySelector('.ghost'); g.style.left = p.x + '%'; g.style.top = p.y + '%';
  board.querySelector('.xh.v').style.left = p.x + '%'; board.querySelector('.xh.h').style.top = p.y + '%';
  if (withLoupe) {
    const W = p.r.width * Z, Hh = p.r.height * Z, img = $('#lpImg'), b = $('#lpBall');
    img.style.width = W + 'px'; img.style.height = Hh + 'px'; img.style.backgroundSize = '100% 100%';
    img.style.transform = `translate(${LS / 2 - p.x / 100 * W}px, ${LS / 2 - p.y / 100 * Hh}px)`;
    const bw = f.ballSize / 100 * W; b.style.width = bw + 'px'; b.style.height = bw * ballH(f.sport) + 'px';
    let lx = e.clientX - LS / 2, ly = e.clientY - LS - 56;
    if (ly < 8) ly = e.clientY + 56;
    lx = Math.max(8, Math.min(innerWidth - LS - 8, lx));
    loupe.style.left = lx + 'px'; loupe.style.top = ly + 'px'; loupe.classList.add('on');
  }
  return p;
}
board.addEventListener('pointerdown', e => {
  if (phase !== 'aim') return;
  e.preventDefault(); ac();
  try { board.setPointerCapture(e.pointerId); } catch (err) {}
  touching = true; board.classList.add('touching'); board.classList.remove('hint', 'hover');
  board.querySelector('.pin')?.remove();
  aim(e, true); buzz(6);
});
board.addEventListener('pointermove', e => {
  if (phase !== 'aim') return;
  if (touching) aim(e, true);
  else if (e.pointerType === 'mouse') { board.classList.add('hover'); aim(e, false); }
});
const release = e => {
  if (!touching) return;
  touching = false; board.classList.remove('touching'); loupe.classList.remove('on');
  if (phase !== 'aim') return;
  const p = at(e); place({ x: +p.x.toFixed(2), y: +p.y.toFixed(2) });
};
board.addEventListener('pointerup', release);
board.addEventListener('pointercancel', release);
board.addEventListener('pointerleave', () => board.classList.remove('hover'));

function place(p) {
  pin = p;
  board.querySelector('.pin')?.remove();
  board.insertAdjacentHTML('beforeend', `<div class="pin ${p.y < 22 ? 'low' : ''}" style="left:${p.x}%;top:${p.y}%;width:${frame.ballSize}%;aspect-ratio:${1 / ballH(frame.sport)}">${BALL[frame.sport]}<em>Your shot</em></div>`);
  SFX.place(); buzz(12);
  // the mark IS the shot — no submit step, the reveal starts straight away
  phase = 'reveal'; setBtn();
  setTimeout(shoot, 280);
}

/* ---------------- the reveal ---------------- */
function shoot() {
  phase = 'reveal'; setBtn();
  const f = frame, t = f.target;
  const d = dist(f, pin), bw = d / f.ballSize, z = ZONES.find(z => bw <= z.r), m = z ? z.m : 0, win = round(S.stake * m);
  board.classList.remove('hint', 'hover'); board.classList.add('revealing', 'dim');
  board.insertAdjacentHTML('beforeend',
    ZONES.map(zz => {
      const low = t.y - zz.r * f.ballSize / AR < 7;     // ring top above the frame → label underneath
      return `<div class="ring ${low ? 'lowlbl' : ''}" data-m="${zz.m}" style="--c:${zz.c};left:${t.x}%;top:${t.y}%;width:${2 * zz.r * f.ballSize}%"><b>×${zz.m}</b></div>`;
    }).join('')
    + `<img class="rb" src="${f.ballImg}" alt="" style="left:${t.x}%;top:${t.y}%;width:${f.ballW}%">`
    + `<svg class="rline" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="${pin.x}" y1="${pin.y}" x2="${t.x}" y2="${t.y}"/></svg>`);
  setMeter('Stake', money(S.stake), 'The judges are marking…');
  SFX.roll();
  setTimeout(() => { board.classList.add('ballin'); SFX.thud(); buzz(30); setMeter('Stake', null, '<b>There it is.</b>'); }, 650);
  const rings = [...board.querySelectorAll('.ring')];
  rings.forEach((r, i) => setTimeout(() => { r.classList.add('on'); SFX.ring(i); }, 1050 + i * 150));
  setTimeout(() => board.classList.add('lined'), 1750);
  setTimeout(() => result(z, m, win, bw), 2100);
}

function result(z, m, win, bw) {
  const f = frame;
  if (z) {
    board.querySelector(`.ring[data-m="${m}"]`).classList.add('hit');
    document.querySelector(`.pt[data-m="${m}"]`).classList.add('hit');
  }
  S.hist.unshift({ id: f.id, m, win, stake: S.stake, x: pin.x, y: pin.y }); S.hist = S.hist.slice(0, 20);
  if (m) {
    S.bal = round(S.bal + win); save();
    setMeter('Win', null, `${z.t} · ${bw.toFixed(1)} ball-widths <span class="mul" style="color:${z.c}">×${m}</span>`, 'win');
    countTo($('#mVal'), 0, win, 900, money, k => { if (Math.random() < .35 && k < 1) SFX.coin(); });
    setTimeout(() => renderBal(true), 500);
    SFX.win(m >= 5); buzz(m >= 5 ? [30, 50, 30, 50, 60] : [25, 40, 25]);
    if (m > 1) { $('#cabinet').classList.add('party'); coins(Math.min(150, m * 14)); }
    if (m === 10) setTimeout(() => bigWin(win), 700);
  } else {
    save();
    setMeter('Win', money(0), `<b>Missed</b> · ${bw.toFixed(1)} ball-widths off`, 'lose shake');
    SFX.lose(); buzz(60);
  }
  renderHist();
  phase = 'done'; setBtn();
}

/* ---------------- history: close-ups with the ball restored ---------------- */
function renderHist() {
  const row = $('#hist');
  if (!S.hist.length) { row.innerHTML = '<span class="h-none">No shots yet. Your close-ups land here.</span>'; $('#hStats').textContent = '—'; return; }
  const T = 74, W = T * 4, H = W * AR;
  row.innerHTML = S.hist.map(h => {
    const f = FRAMES.find(x => x.id === h.id); if (!f) return '';
    const z = ZONES.find(z => z.m === h.m);
    const bx = Math.max(T - W, Math.min(0, T / 2 - f.target.x / 100 * W)), by = Math.max(T - H, Math.min(0, T / 2 - f.target.y / 100 * H));
    return `<div class="hc ${h.m ? '' : 'lost'}" style="${z ? '--c:' + z.c : ''}">
      <div class="hc-img" style="background-image:url(${f.img});background-size:${W}px ${H}px;background-position:${bx}px ${by}px">
        <img src="${f.ballImg}" alt="" style="left:${bx + f.target.x / 100 * W}px;top:${by + f.target.y / 100 * H}px;width:${f.ballW / 100 * W}px"><b>×${h.m}</b></div>
      <span>${h.m ? '+' + money(h.win) : '−' + money(h.stake)}</span></div>`;
  }).join('');
  const net = S.hist.reduce((a, h) => a + h.win - h.stake, 0);
  $('#hStats').textContent = `${S.hist.length} shot${S.hist.length > 1 ? 's' : ''} · net ${net >= 0 ? '+' : '−'}${money(Math.abs(net))}`;
}

/* ---------------- big win ---------------- */
function bigWin(win) {
  $('#bwMul').textContent = '×10'; $('#bwAmt').textContent = '+' + money(win);
  const o = $('#bigwin'); o.classList.add('on'); coins(90, true); SFX.win(true);
}
$('#bigwin').addEventListener('click', () => $('#bigwin').classList.remove('on'));

/* ---------------- coin burst ---------------- */
const cv = $('#fx'), cx = cv.getContext('2d'); let parts = [], raf = 0;
function coins(n, center) {
  const dpr = devicePixelRatio || 1; cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const r = center ? { left: innerWidth / 2, top: innerHeight / 2, width: 0 } : $('#meter').getBoundingClientRect();
  const ox = center ? innerWidth / 2 : r.left + 60, oy = center ? innerHeight / 2 : r.top + 20;
  for (let i = 0; i < n; i++) parts.push({
    x: ox + (Math.random() - .5) * 40, y: oy, vx: (Math.random() - .5) * (center ? 16 : 11), vy: -Math.random() * (center ? 17 : 14) - 4,
    s: Math.random() * 5 + 6, a: Math.random() * 6, va: Math.random() * .3 + .1, life: 0,
  });
  if (!raf) loop();
}
function loop() {
  cx.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter(p => p.y < innerHeight + 30 && p.life < 240);
  parts.forEach(p => {
    p.vy += .42; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.a += p.va; p.life++;
    const sx = Math.abs(Math.cos(p.a));
    cx.save(); cx.translate(p.x, p.y); cx.scale(Math.max(.15, sx), 1);
    const g = cx.createLinearGradient(-p.s, -p.s, p.s, p.s);
    g.addColorStop(0, '#fff4c2'); g.addColorStop(.45, '#ffc247'); g.addColorStop(1, '#a86a08');
    cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, p.s, 0, 7); cx.fill();
    cx.strokeStyle = 'rgba(120,70,0,.6)'; cx.lineWidth = 1.2; cx.beginPath(); cx.arc(0, 0, p.s * .62, 0, 7); cx.stroke();
    cx.restore();
  });
  raf = parts.length ? requestAnimationFrame(loop) : 0;
  if (!raf) cx.clearRect(0, 0, innerWidth, innerHeight);
}

/* ---------------- splash ---------------- */
$('#playBtn').addEventListener('click', () => { ac(); SFX.land(); $('#splash').classList.add('out'); setTimeout(() => $('#splash').remove(), 600); });

/* ---------------- boot ---------------- */
renderMute(); renderBal(); renderChips(); renderHist(); setBtn(); placeStrips();
})();
