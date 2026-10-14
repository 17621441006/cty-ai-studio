/**
 * Menus — title, character select, pause and results.
 *
 * These are a *view* of `IRace.state`, never a driver of it: `state` is
 * readonly on the interface and the race director owns it. Where a menu needs
 * to act it calls the sanctioned commands (`start()` / `reset()` /
 * `setPaused()`), and where the race director does not model a state we hold
 * that screen locally instead of writing to it — `localTitle` / `localPause`
 * are the fallbacks, not the primary path.
 *
 * `?ui=title|select|pause|results` forces a screen, for capture and review.
 */
import { RaceState, type Ctx, type IKart } from '../types';
import { el, formatClock, ordinalSuffix, cssColor, clamp } from './uiUtil';
import { ControlsMenu } from './ControlsMenu';
import { assetUrl } from '../core/AssetUrl';

export type ScreenName = 'none' | 'title' | 'select' | 'pause' | 'results';

export class Menus {
  /** The screen currently shown — HUD reads this to decide how to fade out. */
  screen: ScreenName = 'none';
  /** True while a full-screen menu owns the frame (HUD hides entirely). */
  blocking = false;
  /**
   * Set by a tap on a blocking screen. Touch devices have no Enter key, and the
   * title screen's only affordance was a keyboard hint — so a tap anywhere on
   * the title, select or results screen counts as confirm.
   */
  private tapConfirm = false;

  private root: HTMLDivElement;
  private screens: Record<Exclude<ScreenName, 'none'>, HTMLDivElement>;
  private ctx!: Ctx;
  private forced: ScreenName | null = null;

  /** Local pause, used when the race director does not model RaceState.Paused. */
  private localPause = false;
  private localTitle = false;

  private selected = 0;
  private cards: HTMLDivElement[] = [];
  private buttons: { pause: HTMLDivElement[]; results: HTMLDivElement[] } = { pause: [], results: [] };
  private btnIndex = 0;

  private prevSteer = 0;
  private resultsBuilt = false;
  /** How many karts were classified when the board was last built. */
  private resultsFinished = -1;
  private finishTimes = new Map<number, number>();
  private lastRaceTime = 0;

  /** the controls screen — its own overlay, not one of the four `screens` */
  private controls: ControlsMenu;
  /** title-screen copy follows the device actually in use; see `syncTouchCopy` */
  private titlePrompt!: HTMLDivElement;
  private titleHint!: HTMLDivElement;
  private titleGlyphs!: HTMLDivElement;
  private touchCopy: boolean | null = null;

  private rosterEl!: HTMLDivElement;
  private vehicleStatus!: HTMLDivElement;
  private vehicleButtons: HTMLButtonElement[] = [];
  private vehicleStatusKey = '';
  private standingsEl!: HTMLDivElement;
  /** the in-race running order, shown on the pause screen (see buildPause) */
  private pauseOrderEl!: HTMLDivElement;
  /** throttle on the pause board rebuild — it only changes when places do */
  private pauseOrderKey = '';
  private lapsEl!: HTMLDivElement;
  private resultTitle!: HTMLDivElement;
  private replayCelebration!: HTMLDivElement;

  constructor(parent: HTMLElement) {
    this.root = el('div', 'kr-screens', parent);
    // Sibling of `.kr-screens`, not a child: the tap-anywhere-confirm listener
    // below is on `this.root`, and a tap on a SETTING must not also start the
    // race. Its own listeners stop propagation before the touch pad sees it.
    this.controls = new ControlsMenu(parent);
    this.screens = {
      title: this.buildTitle(),
      select: this.buildSelect(),
      pause: this.buildPause(),
      results: this.buildResults(),
    };
    // one delegated listener rather than a handler per control
    this.root.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      if (t.closest('.kr-btn')) this.ui('confirm');
      else if (t.closest('.kr-card')) this.ui('move');
    });

    // Tap-anywhere confirm. A real control that was tapped handles itself via
    // its own click handler, so those are excluded to avoid confirming twice.
    this.root.addEventListener('pointerdown', (e) => {
      if (!this.blocking) return;
      const t = e.target as HTMLElement;
      if (t.closest('.kr-btn, .kr-card')) return;
      this.tapConfirm = true;
    });

    const forced = new URLSearchParams(location.search).get('ui');
    if (forced === 'title' || forced === 'select' || forced === 'pause' || forced === 'results') {
      this.forced = forced;
    }
  }

  init(ctx: Ctx) {
    this.ctx = ctx;
    // finish times are not on IRace, so we stamp them off the bus ourselves
    ctx.bus.on((e) => {
      if (e.type === 'finish') this.finishTimes.set(e.kart.id, ctx.race.raceTime);
    });
    this.fillRoster(ctx);
    this.controls.attach(ctx);
  }

  // ------------------------------------------------------------------ frame

  update(ctx: Ctx, _dt: number) {
    const race = ctx.race;
    this.syncVehicleStatus();
    const input = ctx.input.state;
    if (ctx.ceremony?.active) {
      for (const screen of Object.values(this.screens)) {
        screen.classList.remove('on'); screen.style.pointerEvents = 'none';
      }
      this.screen = 'none'; this.blocking = true;
      this.root.style.pointerEvents = 'none'; this.tapConfirm = false;
      document.documentElement.dataset.menu = 'ceremony';
      return;
    }
    // Race processes pause first; explicit resume must also clear the UI flag.
    if (input.pausePressed && race.state !== RaceState.Paused) this.localPause = false;

    // A race reset rewinds the clock; drop stale results so they rebuild.
    if (race.raceTime < this.lastRaceTime - 0.25) {
      this.resultsBuilt = false;
      this.resultsFinished = -1;
      this.finishTimes.clear();
    }
    this.lastRaceTime = race.raceTime;

    // The title copy follows the device actually in use, and `input.touch` can
    // flip mid-session (the iPadOS lazy mount, or a keyboard being pressed on a
    // tablet). Cached on the value, so this is a compare per frame.
    this.syncTouchCopy(ctx.input.touch);

    // The controls screen owns input while it is up: it is a sibling overlay,
    // not one of the four screens, so nothing below it may act on a confirm.
    this.controls.update(ctx);
    if (this.controls.open) {
      this.tapConfirm = false;
      this.prevSteer = input.steer;
      return;
    }

    const inRace = race.state === RaceState.Racing || race.state === RaceState.Countdown;

    // Confirm is `itemPressed` — Enter / Space / E / gamepad face button — which
    // is what the on-screen hint actually promises. It used to read
    // `pausePressed`, i.e. Escape or P alone, so the title screen said "PRESS
    // ENTER TO START" and Enter did nothing at all.
    //
    // It is gated on a screen actually being up. Without that gate the same
    // keypress that fires a shell also opens the pause menu, because with no
    // screen showing `onConfirm` falls through to its pause branch.
    if (this.screen !== 'none') {
      if (input.itemPressed || this.tapConfirm) this.onConfirm(ctx, inRace);
    } else if (input.pausePressed && inRace) {
      this.localPause = true;
      this.ui('pause');
    }
    this.tapConfirm = false;

    // steer edges drive menu navigation on keyboard/gamepad
    const st = input.steer;
    if (st > 0.55 && this.prevSteer <= 0.55) this.nav(1);
    else if (st < -0.55 && this.prevSteer >= -0.55) this.nav(-1);
    this.prevSteer = st;

    let want: ScreenName;
    if (this.forced) want = this.forced;
    else if (race.state === RaceState.Menu || this.localTitle) want = this.selecting ? 'select' : 'title';
    else if (race.state === RaceState.Paused || this.localPause) want = 'pause';
    else if (race.state === RaceState.Finished || race.state === RaceState.Results) want = 'results';
    else want = 'none';

    // The board is not final the moment it appears. It goes up `RESULTS_DELAY`
    // after the *player* crosses, and on a three-lap race the field behind them
    // is still running for up to half a minute. Building it once meant a
    // winning player saw a classification frozen at their own crossing: every
    // row below them ordered by distance-on-track, printing a metre gap instead
    // of a finish time, and never corrected. Rebuild while anyone is still out
    // there — `finishedCount` only moves 7 more times, so this is a handful of
    // rebuilds, not a per-frame one.
    if (want === 'results') {
      const hideReplay = race.player.place !== 1 || !ctx.ceremony?.ready;
      this.replayCelebration.hidden = hideReplay;
      if (!hideReplay && !this.buttons.results.includes(this.replayCelebration)) this.buttons.results.push(this.replayCelebration);
      else if (hideReplay && this.buttons.results.includes(this.replayCelebration)) {
        this.buttons.results.pop(); this.btnIndex = Math.min(this.btnIndex, this.buttons.results.length - 1);
      }
      const done = ctx.race.karts.reduce((n, k) => n + (k.finished ? 1 : 0), 0);
      if (!this.resultsBuilt || done !== this.resultsFinished) {
        this.resultsFinished = done;
        this.fillResults(ctx);
      }
    } else if (want === 'pause') {
      this.fillPauseOrder(ctx);
    }

    if (want !== this.screen) {
      if (this.screen !== 'none') this.screens[this.screen].classList.remove('on');
      if (want !== 'none') this.screens[want].classList.add('on');
      this.screen = want;
      this.btnIndex = 0;
      this.syncButtons();
    }
    this.blocking = want === 'title' || want === 'select' || want === 'results';

    // Inline, not stylesheet: the HUD layer sets `pointer-events: none` with
    // enough specificity that an appended `.kr-screen.on` rule loses, and a
    // blocking screen that cannot receive a tap is unstartable on a phone —
    // there is no Enter key to fall back to. Inline always wins, and reverting
    // to 'none' the moment the screen clears keeps the canvas clickable.
    const pe = this.blocking ? 'auto' : 'none';
    this.root.style.pointerEvents = pe;
    // Clear the OUTGOING screen too. This used to only ever set the incoming
    // one, so a screen that had been shown kept `pointer-events: auto` as an
    // inline style — which outranks any stylesheet — for the rest of the
    // session. Every `.kr-screen` stays displayed, so the title screen sat over
    // the race as a live, invisible pointer target from the first frame on.
    for (const name of Object.keys(this.screens) as ScreenName[]) {
      const el = this.screens[name];
      if (el) el.style.pointerEvents = name === want ? pe : 'none';
    }

    // Tell the touch layer a menu owns the screen. Without this the stick, the
    // drift/brake cluster and the item button stay drawn over every menu — the
    // results board shipped with a live DRIFT button on top of it and the item
    // button sitting across the TOTAL row. Driving controls over a screen you
    // cannot drive from are decoration at best and a mis-tap at worst.
    //
    // Signalled as an attribute rather than a direct call because `Menus` must
    // not depend on `TouchControls`: the controls mount lazily, and on a
    // browser that lies about being a desktop they may not exist yet when this
    // first runs. CSS applies retroactively; a method call would have to be
    // replayed. Same shape as the existing `html[data-touch]` HUD reflow.
    if (want === 'none') delete document.documentElement.dataset.menu;
    else document.documentElement.dataset.menu = want;
  }

  private selecting = false;

  // ------------------------------------------------------------------ input

  private nav(dir: number) {
    if (this.screen === 'select') {
      this.selected = (this.selected + dir + this.cards.length) % this.cards.length;
      this.chooseVehicle();
    } else if (this.screen === 'pause' || this.screen === 'results') {
      const list = this.screen === 'pause' ? this.buttons.pause : this.buttons.results;
      this.btnIndex = (this.btnIndex + dir + list.length) % list.length;
      this.syncButtons();
    } else {
      return;
    }
    this.ui('move');
  }

  /**
   * Keyboard confirm routes through the same `click()` the mouse uses, so the
   * 'confirm' SFX is emitted once, by the delegated listener in the ctor.
   */
  private onConfirm(ctx: Ctx, inRace: boolean) {
    switch (this.screen) {
      case 'title':
        this.selecting = true;
        this.ui('confirm');
        return;
      case 'select':
        this.startRace(ctx);
        this.ui('confirm');
        return;
      case 'pause':
        this.buttons.pause[this.btnIndex]?.click();
        return;
      case 'results':
        this.buttons.results[this.btnIndex]?.click();
        return;
      default:
        if (inRace) { this.localPause = true; this.ui('pause'); }
    }
  }

  /** Menu SFX hook — the audio system listens for these on the bus. */
  private ui(name: string) {
    this.ctx?.bus.emit({ type: 'ui', name });
  }

  private startRace(ctx: Ctx, demo = false) {
    if (ctx.race.vehicleLoading || ctx.race.vehicleError) return;
    this.forced = null;
    this.localTitle = false;
    this.selecting = false;
    this.localPause = false;
    this.resultsBuilt = false;
    this.resultsFinished = -1;
    this.finishTimes.clear();
    ctx.race.setAutoDrive(demo);
    ctx.race.reset();
  }

  // ------------------------------------------------------------------ build

  private makeScreen(cls: string) {
    const s = el('div', 'kr-screen ' + cls, this.root);
    el('div', 'kr-screen-in', s);
    return s;
  }

  private buildTitle() {
    const s = this.makeScreen('kr-s-title');
    const inner = s.firstElementChild as HTMLDivElement;
    const wrap = el('div', 'kr-stage', inner);
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.alignItems = 'center';
    const logo = el('img', 'kr-logo', wrap) as HTMLImageElement;
    logo.src = assetUrl('/images/zangzangbao-kart-title.svg');
    logo.alt = '脏脏包 · 樱花卡丁车';
    logo.width = 1774;
    logo.height = 887;
    logo.draggable = false;
    el('div', 'kr-sub', wrap, '和脏脏包一起，穿过花瓣飞舞的小镇');
    // Built empty; `syncTouchCopy` fills it from `ctx.input.touch` every time
    // that flips. This used to run its OWN `matchMedia('(pointer: coarse)')`
    // probe once, in the constructor — which is exactly the check that fails on
    // the documented iPadOS "Request Desktop Website" case, where Safari claims
    // `pointer: fine` and `maxTouchPoints: 0`. `Input` already handles that with
    // a lazy capture-phase mount on the first real finger; the menu copy was
    // never brought along, so an iPad in desktop mode got on-screen controls and
    // the words "按回车键开始" above them.
    this.titlePrompt = el('div', 'kr-prompt', wrap);
    this.titleGlyphs = el('div', 'kr-glyphs', wrap);
    this.titleHint = el('div', 'kr-hint', wrap);
    const demo = el('div', 'kr-btn kr-btn-demo', wrap, '自动驾驶演示');
    demo.setAttribute('role', 'button'); demo.tabIndex = 0;
    demo.title = '末位发车 · 双强敌追逐 · 自动漂移、氮气与道具 · 可随时接管';
    demo.onpointerdown = e => e.stopPropagation();
    demo.onclick = (e) => { e.stopPropagation(); this.startRace(this.ctx, true); };
    demo.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); demo.click(); } };
    const cbtn = el('div', 'kr-btn kr-btn-controls', wrap, '操作设置');
    cbtn.onclick = (e) => { e.stopPropagation(); this.controls.show(); };
    this.syncTouchCopy(false);
    return s;
  }

  /**
   * DEFECT D6. The only touch onboarding was one line of `kr-hint` at
   * `clamp(9px, 1.4vmin, 18px)` — 1.4 vmin is 5.5 px on a 390-tall phone so it
   * clamped to 9 px — at 44% opacity: 1.5 mm of glyph, NAMING controls without
   * showing where any of them are, while the floating stick is invisible at
   * rest. A first-run player had no visual evidence a steering control existed.
   *
   * On touch that line is replaced by three miniature renderings of the ACTUAL
   * controls at their actual colours, each with one word beneath it at >= 14 px
   * and full opacity. Same information; nothing to read. The breathing ghost
   * stick in `TouchControls` is the other half of this, and it is on the frame
   * the player is looking at rather than on a screen they are leaving.
   */
  private syncTouchCopy(touch: boolean) {
    if (this.touchCopy === touch) return;
    this.touchCopy = touch;
    this.titlePrompt.textContent = touch ? '点击开始' : '按回车键开始';
    if (touch) {
      this.titleGlyphs.innerHTML =
        '<div class="kr-gl"><span class="kr-gl-stick"><i></i><b></b></span>转向</div>' +
        '<div class="kr-gl"><span class="kr-gl-drift">漂移</span>甩尾</div>' +
        '<div class="kr-gl"><span class="kr-gl-item">+</span>道具</div>';
      this.titleHint.innerHTML = '';
    } else {
      this.titleGlyphs.innerHTML = '';
      this.titleHint.innerHTML =
        '<b>&#8592;</b><b>&#8594;</b> 转向 &nbsp;&nbsp; <b>&#8593;</b> 加速 &nbsp;&nbsp; ' +
        '<b>Shift</b> 漂移蓄能 &nbsp;&nbsp; <b>X</b> 氮气 &nbsp;&nbsp; <b>空格键</b> 道具 &nbsp;&nbsp; <b>退出键</b> 暂停';
    }
  }

  private buildSelect() {
    const s = this.makeScreen('kr-s-select');
    const inner = s.firstElementChild as HTMLDivElement;
    const head = el('div', 'kr-stage kr-garage-heading', inner);
    el('div', 'kr-garage-eyebrow', head, 'ZANG ZANG BAO / GARAGE');
    el('div', 'kr-title kr-gold', head, '今天，开哪辆？');
    el('div', 'kr-garage-note', head, '脏脏包先挑，小司和小涌会选剩下的车。小司是头号对手。');
    this.rosterEl = el('div', 'kr-roster kr-stage', inner);
    this.rosterEl.setAttribute('role', 'radiogroup');
    this.rosterEl.setAttribute('aria-label', '车辆外观');
    this.vehicleStatus = el('div', 'kr-vehicle-status', inner);
    this.vehicleStatus.setAttribute('role', 'status');
    this.vehicleStatus.setAttribute('aria-live', 'polite');
    const go = el('div', 'kr-menu-list kr-stage kr-garage-actions', inner);
    for (const [label, demo] of [['开始比赛', false], ['自动驾驶演示', true]] as const) {
      const btn = el('button', 'kr-btn' + (demo ? '' : ' sel'), go, label) as HTMLButtonElement;
      btn.type = 'button'; btn.onclick = e => { e.stopPropagation(); this.startRace(this.ctx, demo); };
      this.vehicleButtons.push(btn);
    }
    return s;
  }

  private fillRoster(ctx: Ctx) {
    this.rosterEl.textContent = ''; this.cards.length = 0;
    ctx.race.vehicleOptions.forEach((option, i) => {
      const c = el('div', 'kr-card kr-vehicle-card', this.rosterEl);
      c.style.setProperty('--c', option.color);
      c.setAttribute('role', 'radio'); c.tabIndex = 0;
      el('div', 'kr-vehicle-badge', c, option.badge);
      el('div', 'kr-card-name', c, option.name);
      el('div', 'kr-vehicle-detail', c, option.detail);
      c.onclick = e => { e.stopPropagation(); this.selected = i; this.chooseVehicle(); };
      c.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); c.click(); } };
      this.cards.push(c);
    });
    this.selected = Math.max(0, ctx.race.vehicleOptions.findIndex(o => o.id === ctx.race.vehicleAppearance));
    this.syncCards(); this.syncVehicleStatus();
  }

  private chooseVehicle() {
    this.syncCards();
    const id = this.ctx.race.vehicleOptions[this.selected].id;
    void this.ctx.race.selectVehicleAppearance(id).then(() => this.syncVehicleStatus());
    this.syncVehicleStatus();
  }

  private syncVehicleStatus() {
    if (!this.ctx) return;
    const r = this.ctx.race;
    const name = r.vehicleOptions.find(v => v.id === r.vehicleAppearance)?.name || '';
    const family = r.familyVehicles.map(p => `${p.name}：${p.vehicleName}`).join(' · ');
    const message = r.vehicleLoading ? '正在为大家准备赛车…' : r.vehicleError || `${name} · ${family}`;
    if (message === this.vehicleStatusKey) return;
    this.vehicleStatusKey = message; this.vehicleStatus.textContent = message;
    this.vehicleStatus.dataset.error = String(!!r.vehicleError);
    for (const button of this.vehicleButtons) button.disabled = r.vehicleLoading || !!r.vehicleError;
  }

  private syncCards() {
    for (let i = 0; i < this.cards.length; i++) {
      const active = i === this.selected;
      this.cards[i].classList.toggle('sel', active);
      this.cards[i].setAttribute('aria-checked', String(active));
    }
  }

  /**
   * Pause. ROUND 8: this screen now carries the full running order.
   *
   * The eight-driver order used to be a permanent 200x320 timing tower pinned
   * to the right-centre of the in-race HUD — the largest single element on
   * screen, sitting on the outside of every right-hand corner, occluding the
   * rivals it was describing. It belongs here and on the results screen, where
   * the race is stopped and eight rows are actually readable. Same rows, same
   * type, same rules as the results board: one standings object in the game.
   */
  private buildPause() {
    const s = this.makeScreen('kr-s-pause');
    const inner = s.firstElementChild as HTMLDivElement;
    const box = el('div', 'kr-stage', inner);
    box.style.display = 'flex';
    box.style.flexDirection = 'column';
    box.style.alignItems = 'center';
    box.style.width = '100%';
    el('div', 'kr-pause-badge', box, '比赛已暂停');
    el('div', 'kr-title kr-gold', box, '暂停');

    const grid = el('div', 'kr-pause-grid', box);
    const left = el('div', undefined, grid);
    el('div', 'kr-order-title', left, '当前排名');
    this.pauseOrderEl = el('div', 'kr-standings', left);
    const right = el('div', undefined, grid) as HTMLDivElement;
    right.style.display = 'flex';
    right.style.flexDirection = 'column';
    right.style.justifyContent = 'center';
    right.style.height = '100%';
    const list = el('div', 'kr-menu-list', right);

    const resume = el('div', 'kr-btn', list, '继续比赛');
    // Clearing `localPause` alone is not enough: on a real race the director
    // owns the pause and `race.state` is `Paused`, which keeps `want` pinned to
    // this screen no matter what the UI's own flag says. Resume has to tell the
    // director too, or the button does nothing — which is exactly what it did.
    resume.onclick = () => {
      this.localPause = false;
      this.forced = null;
      this.ctx?.race.setPaused(false);
    };
    // Reachable MID-RACE, deliberately. `setScheme` releases every pointer and
    // zeroes the command and never touches `IRace`, so a player who cannot
    // steer can fix that without abandoning the race they are in.
    const ctrl = el('div', 'kr-btn', list, '操作设置');
    ctrl.onclick = () => this.controls.show();
    const restart = el('div', 'kr-btn', list, '重新比赛');
    restart.onclick = () => { this.localPause = false; this.forced = null; this.startRace(this.ctx); };
    const quit = el('div', 'kr-btn', list, '返回主菜单');
    quit.onclick = () => {
      this.localPause = false;
      this.forced = null;
      this.localTitle = true;
      this.selecting = false;
      this.ctx.race.returnToMenu();
    };
    this.buttons.pause = [resume, ctrl, restart, quit];
    return s;
  }

  private buildResults() {
    const s = this.makeScreen('kr-s-results');
    const inner = s.firstElementChild as HTMLDivElement;
    this.resultTitle = el('div', 'kr-title kr-gold kr-stage', inner, '比赛结束');
    const grid = el('div', 'kr-results-grid kr-stage', inner);
    this.standingsEl = el('div', 'kr-standings', grid);
    const right = el('div', undefined, grid) as HTMLDivElement;
    right.style.display = 'flex';
    right.style.flexDirection = 'column';
    this.lapsEl = el('div', 'kr-laps', right);

    const list = el('div', 'kr-menu-list kr-stage', inner);
    const again = el('div', 'kr-btn', list, '再来一局');
    again.onclick = () => this.startRace(this.ctx);
    const title = el('div', 'kr-btn', list, '返回主菜单');
    title.onclick = () => { this.localTitle = true; this.selecting = false; this.forced = null; this.ctx.race.returnToMenu(); };
    this.replayCelebration = el('div', 'kr-btn', list, '重播冠军庆祝');
    this.replayCelebration.setAttribute('role', 'button');
    this.replayCelebration.tabIndex = 0;
    this.replayCelebration.onclick = () => this.ctx.ceremony?.replay();
    this.replayCelebration.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); this.ctx.ceremony?.replay(); } };
    this.buttons.results = [again, title];
    return s;
  }

  private syncButtons() {
    const list = this.screen === 'pause' ? this.buttons.pause
      : this.screen === 'results' ? this.buttons.results : null;
    for (const group of [this.buttons.pause, this.buttons.results]) {
      for (let i = 0; i < group.length; i++) {
        group[i].classList.toggle('sel', group === list && i === this.btnIndex);
      }
    }
  }

  /**
   * The running order, on the pause screen. Rebuilt only when the order (or
   * the lap the leader is on) actually changes — the pause screen is static
   * and a per-frame rebuild of eight rows would be eight allocations a frame
   * for nothing.
   */
  private fillPauseOrder(ctx: Ctx) {
    const race = ctx.race;
    const player = race.player;
    const order: IKart[] = race.standings.length ? race.standings : race.karts;

    let key = '';
    for (let i = 0; i < order.length; i++) key += order[i].id + ':' + order[i].lap + '|';
    if (key === this.pauseOrderKey) return;
    this.pauseOrderKey = key;

    // Rebuilt rows must not re-deal the entrance animation on every reorder.
    this.pauseOrderEl.classList.add('settled');
    this.pauseOrderEl.textContent = '';
    order.forEach((k, i) => {
      const row = el('div', 'kr-row' + (k === player ? ' you' : ''), this.pauseOrderEl);
      row.style.setProperty('--c', cssColor(k.stats.color));
      const p = el('div', 'kr-row-p', row);
      p.innerHTML = `${i + 1}<sup>${ordinalSuffix(i + 1)}</sup>`;
      el('div', 'kr-row-c', row);
      // Full names, never truncated: the roster's longest name is authored and
      // the row is sized for it. `text-overflow: ellipsis` on content whose
      // maximum length you control is the loudest "unfinished" tell there is,
      // and the old in-race tower shipped "BRAMB…" and "MARLO…" in all ten
      // review frames.
      el('div', 'kr-row-n', row, k.stats.name);
      el('div', 'kr-row-t', row, `第 ${clamp(k.lap + 1, 1, race.totalLaps)}/${race.totalLaps} 圈`);
    });
  }

  private fillResults(ctx: Ctx) {
    // Second and subsequent builds land on a board the player is already
    // reading; only the first one gets the staggered entrance.
    this.standingsEl.classList.toggle('settled', this.resultsBuilt);
    this.resultsBuilt = true;
    const race = ctx.race;
    const player = race.player;
    const order: IKart[] = race.standings.length ? race.standings : race.karts;

    const place = player ? player.place : 1;
    this.resultTitle.textContent =
      place === 1 ? '冠军！' : `第 ${place} 名`;

    this.standingsEl.textContent = '';
    order.forEach((k, i) => {
      const row = el('div', 'kr-row' + (k === player ? ' you' : ''), this.standingsEl);
      row.style.setProperty('--c', cssColor(k.stats.color));
      row.style.setProperty('--d', (0.14 + i * 0.055).toFixed(3) + 's');
      const p = el('div', 'kr-row-p', row);
      p.innerHTML = `${i + 1}<sup>${ordinalSuffix(i + 1)}</sup>`;
      el('div', 'kr-row-c', row);
      el('div', 'kr-row-n', row, k.stats.name);
      const t = this.finishTimes.get(k.id);
      const gap = player ? k.raceDistance - player.raceDistance : 0;
      el('div', 'kr-row-t', row,
        t !== undefined ? formatClock(t)
          : k === player ? formatClock(race.raceTime)
            : `${gap >= 0 ? '+' : '−'}${Math.abs(Math.round(gap))} 米`);
    });

    // lap times + best-lap callout
    this.lapsEl.textContent = '';
    const laps = race.lapTimes;
    let best = -1;
    for (let i = 0; i < laps.length; i++) if (best < 0 || laps[i] < laps[best]) best = i;

    const callout = el('div', 'kr-best', this.lapsEl);
    el('b', undefined, callout, '最快单圈');
    el('em', undefined, callout, best >= 0 ? formatClock(laps[best], 3) : '—:—.———');

    for (let i = 0; i < race.totalLaps; i++) {
      const line = el('div', 'kr-lapline' + (i === best ? ' best' : ''), this.lapsEl);
      el('b', undefined, line, `第 ${i + 1} 圈`);
      el('em', undefined, line, i < laps.length ? formatClock(laps[i], 3) : '—');
    }
    const total = el('div', 'kr-lapline kr-lapline-total', this.lapsEl);
    el('b', undefined, total, '总用时');
    el('em', undefined, total,
      formatClock(player ? (this.finishTimes.get(player.id) ?? race.raceTime) : race.raceTime, 3));
  }
}
