const rand = (seed) => {
  let s = seed;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) | 0) >>> 0) / 4294967296;
};

/**
 * 《月华 · 奥日幻林重制版》 2.5D Stereoscopic Scene
 * - Rock-steady background during normal play (zero motion-sickness sway)
 * - Clean, noble 3D 1-Point Perspective Stone Terrace & Cliff Ledge (GROUND = 701..900)
 * - Uncluttered foreground (no distracting mushrooms or heavy corner obstructions),
 *   keeping the fighters and skill VFX as the undisputed visual centerpiece!
 */
export class Scene {
  constructor() {
    this.layers = [];
    this.grass = [];
    this.spores = [];
    this.petals = [];
    this.make();
  }

  createLayerCanvas(w = 1920, h = 960) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return [c, c.getContext('2d')];
  }

  make() {
    const r = rand(723);

    this.bg = document.createElement('canvas');
    this.bg.width = 1600;
    this.bg.height = 900;

    this.buildSkyAndMoonLayer(r);
    this.buildFarMountainsLayer(r);
    this.buildMidMountainsAndPagodasLayer(r);
    this.buildCathedralForestArchLayer(r);
    this.buildShrineAndMapleTreesLayer(r);
    this.buildStoneTerraceLayer(r);
    this.buildForegroundBokehLayer(r);
    this.initInteractiveFloraAndParticles(r);

    const bgCtx = this.bg.getContext('2d');
    this.draw(bgCtx, 0, { shakeX: 0, shakeY: 0, parallaxOn: false });
  }

  // ==========================================================================
  // LAYER 0: Deep Twilight Starfield, Nebula & Giant Spirit Moon
  // ==========================================================================
  buildSkyAndMoonLayer(r) {
    const [canvas, c] = this.createLayerCanvas(1920, 960);
    this.layerSky = canvas;
    const ox = 160;
    const oy = 30;

    const g = c.createLinearGradient(0, 0, 0, 960);
    g.addColorStop(0.0, '#100b22');
    g.addColorStop(0.28, '#25193a');
    g.addColorStop(0.55, '#54385a');
    g.addColorStop(0.78, '#986375');
    g.addColorStop(1.0, '#c89b8a');
    c.fillStyle = g;
    c.fillRect(0, 0, 1920, 960);

    for (let i = 0; i < 6; i++) {
      const nx = 250 + i * 280 + (r() - 0.5) * 120;
      const ny = 140 + (r() - 0.5) * 110;
      const rad = 220 + r() * 160;
      const ng = c.createRadialGradient(nx, ny, 10, nx, ny, rad);
      ng.addColorStop(0, i % 2 === 0 ? 'rgba(195, 145, 235, 0.14)' : 'rgba(255, 185, 155, 0.12)');
      ng.addColorStop(1, 'rgba(0, 0, 0, 0)');
      c.fillStyle = ng;
      c.fillRect(nx - rad, ny - rad, rad * 2, rad * 2);
    }

    for (let i = 0; i < 95; i++) {
      const sx = r() * 1920;
      const sy = r() * 440;
      const sr = 0.6 + r() * 1.4;
      c.fillStyle = i % 3 === 0 ? '#ffe8c8' : i % 3 === 1 ? '#e2d4ff' : '#d8eeff';
      c.globalAlpha = 0.25 + r() * 0.55;
      c.beginPath();
      c.arc(sx, sy, sr, 0, Math.PI * 2);
      c.fill();
    }
    c.globalAlpha = 1;

    const mx = ox + 1110;
    const my = oy + 240;

    const outerGlow = c.createRadialGradient(mx, my, 40, mx, my, 420);
    outerGlow.addColorStop(0.0, 'rgba(255, 246, 224, 0.96)');
    outerGlow.addColorStop(0.24, 'rgba(255, 222, 184, 0.52)');
    outerGlow.addColorStop(0.52, 'rgba(205, 220, 255, 0.18)');
    outerGlow.addColorStop(1.0, 'rgba(205, 220, 255, 0)');
    c.fillStyle = outerGlow;
    c.beginPath();
    c.arc(mx, my, 420, 0, Math.PI * 2);
    c.fill();

    const moonDisk = c.createRadialGradient(mx - 22, my - 22, 10, mx, my, 126);
    moonDisk.addColorStop(0.0, '#fffdf6');
    moonDisk.addColorStop(0.68, '#ffefd8');
    moonDisk.addColorStop(0.92, '#f3d2be');
    moonDisk.addColorStop(1.0, 'rgba(243, 210, 190, 0)');
    c.fillStyle = moonDisk;
    c.beginPath();
    c.arc(mx, my, 124, 0, Math.PI * 2);
    c.fill();
  }

  // ==========================================================================
  // LAYER 1: Far Misty Mountain Silhouettes
  // ==========================================================================
  buildFarMountainsLayer(r) {
    const [canvas, c] = this.createLayerCanvas(1920, 960);
    this.layerFarMtn = canvas;
    const oy = 30;

    const ridge = (yBase, amp, col, seed, mistAlpha) => {
      const g = c.createLinearGradient(0, yBase - amp, 0, oy + 720);
      g.addColorStop(0, col);
      g.addColorStop(0.75, col);
      g.addColorStop(1, 'rgba(72, 48, 78, 0.92)');
      c.fillStyle = g;
      c.beginPath();
      c.moveTo(0, 960);
      for (let x = 0; x <= 1920; x += 28) {
        const wx = x - 160;
        const y =
          oy +
          yBase -
          Math.sin(wx * 0.0035 + seed) * amp -
          Math.cos(wx * 0.011 - seed) * amp * 0.42 -
          Math.sin(wx * 0.024 + seed * 2) * amp * 0.15;
        c.lineTo(x, y);
      }
      c.lineTo(1920, 960);
      c.closePath();
      c.fill();

      const mg = c.createLinearGradient(0, oy + yBase - 30, 0, oy + yBase + 95);
      mg.addColorStop(0, 'rgba(235, 190, 185, 0)');
      mg.addColorStop(0.5, `rgba(235, 195, 205, ${mistAlpha})`);
      mg.addColorStop(1, 'rgba(235, 190, 185, 0)');
      c.fillStyle = mg;
      c.fillRect(0, oy + yBase - 30, 1920, 125);
    };

    ridge(495, 76, '#6d4c6888', 1.0, 0.14);
    ridge(552, 62, '#533956bb', 2.4, 0.16);
  }

  // ==========================================================================
  // LAYER 2: Midground Mountains, Distant Pagodas & Moonlit Falls
  // ==========================================================================
  buildMidMountainsAndPagodasLayer(r) {
    const [canvas, c] = this.createLayerCanvas(1920, 960);
    this.layerMidMtn = canvas;
    const ox = 160;
    const oy = 30;

    c.fillStyle = '#3c2944e0';
    c.beginPath();
    c.moveTo(0, 960);
    for (let x = 0; x <= 1920; x += 24) {
      const wx = x - ox;
      const y =
        oy +
        612 -
        Math.sin(wx * 0.0035 + 4.1) * 46 -
        Math.cos(wx * 0.011 - 4.1) * 19;
      c.lineTo(x, y);
    }
    c.lineTo(1920, 960);
    c.closePath();
    c.fill();

    this.pagoda(c, ox + 365, oy + 530, 0.72, '#432d48cc', true);
    this.pagoda(c, ox + 1320, oy + 560, 0.54, '#543852aa', true);
  }

  // ==========================================================================
  // LAYER 3: Ancient Forest Trunk Arch Framing
  // ==========================================================================
  buildCathedralForestArchLayer(r) {
    const [canvas, c] = this.createLayerCanvas(1920, 960);
    this.layerArch = canvas;
    const ox = 160;
    const oy = 30;

    const drawGiantRootColumn = (xBase, topX, widthBase, side) => {
      c.save();
      const grad = c.createLinearGradient(xBase - widthBase, 0, xBase + widthBase, 750);
      grad.addColorStop(0, '#1e1429');
      grad.addColorStop(0.6, '#2b1d38');
      grad.addColorStop(1, '#382544');
      c.fillStyle = grad;
      c.beginPath();
      c.moveTo(xBase - widthBase, oy + 720);
      c.quadraticCurveTo(xBase - widthBase * 0.4, oy + 360, topX - widthBase * 0.5, -20);
      c.lineTo(topX + widthBase * 0.5, -20);
      c.quadraticCurveTo(xBase + widthBase * 0.35, oy + 360, xBase + widthBase, oy + 720);
      c.closePath();
      c.fill();

      c.strokeStyle = side > 0 ? 'rgba(255, 215, 165, 0.22)' : 'rgba(220, 232, 255, 0.22)';
      c.lineWidth = 3.5;
      c.beginPath();
      if (side > 0) {
        c.moveTo(xBase + widthBase * 0.85, oy + 700);
        c.quadraticCurveTo(xBase + widthBase * 0.3, oy + 360, topX + widthBase * 0.4, 0);
      } else {
        c.moveTo(xBase - widthBase * 0.85, oy + 700);
        c.quadraticCurveTo(xBase - widthBase * 0.3, oy + 360, topX - widthBase * 0.4, 0);
      }
      c.stroke();
      c.restore();
    };

    drawGiantRootColumn(ox - 55, ox + 140, 115, 1);
    drawGiantRootColumn(ox + 1665, ox + 1480, 110, -1);
  }

  // ==========================================================================
  // LAYER 4: Midground Weathered Torii Shrine, Lanterns & Maple Trees
  // ==========================================================================
  buildShrineAndMapleTreesLayer(r) {
    const [canvas, c] = this.createLayerCanvas(1920, 960);
    this.layerShrine = canvas;
    const ox = 160;
    const oy = 30;

    const treeSpecs = [
      { x: ox - 95, y: oy + 708, s: 1.22 },
      { x: ox + 205, y: oy + 708, s: 0.92 },
      { x: ox + 920, y: oy + 710, s: 0.76 },
      { x: ox + 1500, y: oy + 708, s: 1.08 },
    ];
    for (const t of treeSpecs) {
      this.tree(c, t.x, t.y, t.s, r);
    }

    const tx = ox + 1190;
    const ty = oy + 560;
    c.save();
    c.translate(tx, ty);

    const gateGlow = c.createRadialGradient(0, -10, 15, 0, -10, 210);
    gateGlow.addColorStop(0, 'rgba(255, 200, 150, 0.20)');
    gateGlow.addColorStop(0.55, 'rgba(215, 225, 255, 0.10)');
    gateGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    c.fillStyle = gateGlow;
    c.beginPath();
    c.arc(0, -10, 210, 0, Math.PI * 2);
    c.fill();

    c.strokeStyle = '#482e46';
    c.lineWidth = 15;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-110, 160);
    c.lineTo(-95, -112);
    c.moveTo(110, 160);
    c.lineTo(95, -112);
    c.stroke();

    c.strokeStyle = '#c89ca8';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(-105, 155);
    c.lineTo(-91, -108);
    c.moveTo(106, 155);
    c.lineTo(91, -108);
    c.stroke();

    c.strokeStyle = '#422940';
    c.lineWidth = 19;
    c.beginPath();
    c.moveTo(-152, -108);
    c.quadraticCurveTo(0, -74, 152, -108);
    c.stroke();

    c.strokeStyle = '#e5be9e';
    c.lineWidth = 2.5;
    c.beginPath();
    c.moveTo(-148, -115);
    c.quadraticCurveTo(0, -82, 148, -115);
    c.stroke();

    c.strokeStyle = '#4c3249';
    c.lineWidth = 11;
    c.beginPath();
    c.moveTo(-128, -56);
    c.lineTo(128, -56);
    c.stroke();

    c.lineWidth = 3.2;
    c.strokeStyle = '#cdb29e';
    c.beginPath();
    c.moveTo(-105, -60);
    c.quadraticCurveTo(0, 2, 105, -60);
    c.stroke();

    for (let x = -65; x < 90; x += 35) {
      c.fillStyle = '#f5eadc';
      c.shadowColor = '#ffd8a8';
      c.shadowBlur = 8;
      c.beginPath();
      c.moveTo(x, -36);
      c.lineTo(x + 7, -21);
      c.lineTo(x, -8);
      c.lineTo(x - 7, -23);
      c.closePath();
      c.fill();
    }
    c.shadowBlur = 0;

    for (const lx of [-165, 165]) {
      this.drawStoneLantern(c, lx, 156);
    }

    c.restore();
  }

  drawStoneLantern(c, x, groundY) {
    c.save();
    c.translate(x, groundY);
    c.fillStyle = '#4b3952';
    c.fillRect(-16, -8, 32, 8);
    c.fillRect(-9, -48, 18, 40);
    c.fillRect(-15, -54, 30, 6);
    c.fillStyle = '#38293e';
    c.fillRect(-12, -74, 24, 20);
    const fg = c.createRadialGradient(0, -64, 2, 0, -64, 38);
    fg.addColorStop(0, '#fff8dc');
    fg.addColorStop(0.3, '#ffae48');
    fg.addColorStop(0.7, 'rgba(255, 140, 50, 0.28)');
    fg.addColorStop(1, 'rgba(255, 140, 50, 0)');
    c.fillStyle = fg;
    c.beginPath();
    c.arc(0, -64, 38, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#fff3c4';
    c.fillRect(-6, -70, 12, 12);
    c.fillStyle = '#45344d';
    c.beginPath();
    c.moveTo(-22, -74);
    c.quadraticCurveTo(0, -92, 22, -74);
    c.closePath();
    c.fill();
    c.strokeStyle = 'rgba(245, 215, 180, 0.45)';
    c.lineWidth = 1.8;
    c.beginPath();
    c.moveTo(-18, -75);
    c.quadraticCurveTo(0, -88, 12, -77);
    c.stroke();
    c.restore();
  }

  // ==========================================================================
  // LAYER 5: Clean 3D Perspective Stone Bridge Deck (701..768) + Overhang Cliff (768..960)
  // ==========================================================================
  buildStoneTerraceLayer(r) {
    const [canvas, c] = this.createLayerCanvas(1920, 960);
    this.layerTerrace = canvas;
    const ox = 160;
    const oy = 30;
    const gLine = oy + 701;
    const lipY = oy + 766;
    const vpX = ox + 800;
    const vpY = oy + 420;

    // 1. Top 3D Perspective Stone Deck Surface (gLine .. lipY)
    const deckGrad = c.createLinearGradient(0, gLine - 4, 0, lipY);
    deckGrad.addColorStop(0.0, '#4a3954');
    deckGrad.addColorStop(0.45, '#5b4664');
    deckGrad.addColorStop(0.88, '#6c5374');
    deckGrad.addColorStop(1.0, '#85698b');
    c.fillStyle = deckGrad;
    c.fillRect(0, gLine, 1920, lipY - gLine);

    // Distant back edge rim highlight along GROUND = 701
    const backCurb = c.createLinearGradient(0, gLine - 3, 0, gLine + 7);
    backCurb.addColorStop(0, '#e2c4d4');
    backCurb.addColorStop(0.5, '#8c6f8a');
    backCurb.addColorStop(1, '#4a3954');
    c.fillStyle = backCurb;
    c.fillRect(0, gLine - 2, 1920, 9);

    // Perspective stone courses
    const courseYs = [gLine + 12, gLine + 27, gLine + 45, lipY];
    for (let row = 0; row < courseYs.length; row++) {
      const y = courseYs[row];
      c.strokeStyle = 'rgba(25, 16, 36, 0.55)';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(1920, y);
      c.stroke();

      c.strokeStyle = 'rgba(235, 205, 220, 0.22)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(0, y + 2);
      c.lineTo(1920, y + 2);
      c.stroke();
    }

    // True 1-point perspective radial stone slab joints
    for (let i = -14; i <= 14; i++) {
      const xAtBack = vpX + i * 68;
      const dx = xAtBack - vpX;
      const slope = dx / (gLine - vpY);
      const xAtLip = vpX + slope * (lipY - vpY);

      c.strokeStyle = 'rgba(22, 14, 34, 0.62)';
      c.lineWidth = 2.4;
      c.beginPath();
      c.moveTo(xAtBack, gLine);
      c.lineTo(xAtLip, lipY);
      c.stroke();

      c.strokeStyle = 'rgba(240, 215, 228, 0.26)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(xAtBack + 2.5, gLine);
      c.lineTo(xAtLip + 3.5, lipY);
      c.stroke();
    }

    // 2. 3D Chiseled Front Stone Cornice / Overhang Lip (lipY .. lipY + 18)
    const corniceH = 18;
    const corniceGrad = c.createLinearGradient(0, lipY, 0, lipY + corniceH);
    corniceGrad.addColorStop(0.0, '#ebd2de');
    corniceGrad.addColorStop(0.25, '#b08ea4');
    corniceGrad.addColorStop(0.75, '#59425e');
    corniceGrad.addColorStop(1.0, '#24182e');
    c.fillStyle = corniceGrad;
    c.fillRect(0, lipY, 1920, corniceH);

    for (let i = -14; i <= 14; i++) {
      const xAtBack = vpX + i * 68;
      const slope = (xAtBack - vpX) / (gLine - vpY);
      const xAtLip = vpX + slope * (lipY - vpY);
      c.strokeStyle = 'rgba(24, 15, 36, 0.72)';
      c.lineWidth = 2.5;
      c.beginPath();
      c.moveTo(xAtLip, lipY);
      c.lineTo(xAtLip, lipY + corniceH);
      c.stroke();
    }

    // 3. Vertical 3D Cliff Wall & Ancient Undercroft below the Cornice (lipY + corniceH .. 960)
    const wallTop = lipY + corniceH;
    const wallGrad = c.createLinearGradient(0, wallTop, 0, 960);
    wallGrad.addColorStop(0.0, '#140d20');
    wallGrad.addColorStop(0.18, '#261a36');
    wallGrad.addColorStop(0.55, '#1b1228');
    wallGrad.addColorStop(1.0, '#0c0816');
    c.fillStyle = wallGrad;
    c.fillRect(0, wallTop, 1920, 960 - wallTop);

    for (let x = 80; x < 1880; x += 160) {
      c.fillStyle = 'rgba(48, 34, 64, 0.50)';
      c.fillRect(x - 18, wallTop + 6, 36, 960 - wallTop);
      c.strokeStyle = 'rgba(165, 135, 185, 0.20)';
      c.lineWidth = 1.5;
      c.strokeRect(x - 18, wallTop + 6, 36, 960 - wallTop);
    }

    // Scattered fallen crimson & gold maple leaves on the perspective deck
    for (let i = 0; i < 75; i++) {
      const lx = r() * 1920;
      const ly = gLine + 6 + r() * (lipY - gLine - 10);
      const depthScale = 0.7 + ((ly - gLine) / (lipY - gLine)) * 0.6;
      c.fillStyle = ['#c95b6b99', '#e2846b99', '#ebb87888', '#9c486299'][i % 4];
      c.save();
      c.translate(lx, ly);
      c.rotate(r() * 6.28);
      c.beginPath();
      c.ellipse(0, 0, (4 + r() * 5) * depthScale, (1.5 + r() * 2) * depthScale, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
  }

  // ==========================================================================
  // LAYER 6: Clean, Restrained Foreground Reed Silhouettes (Zero Mushrooms!)
  // ==========================================================================
  buildForegroundBokehLayer(r) {
    const [canvas, c] = this.createLayerCanvas(1920, 960);
    this.layerFg = canvas;
    const ox = 160;
    const oy = 30;
    const gLine = oy + 701;

    // Subtle dark reed silhouettes only at the far left & right edges, leaving the stage 100% unobstructed
    for (let i = 0; i < 95; i++) {
      const rx = r() * 1600;
      if (rx > 180 && rx < 1420) continue;
      const x = ox + rx;
      c.strokeStyle = i % 4 === 0 ? '#322444' : '#1b1328';
      c.lineWidth = 1.3 + r() * 2.0;
      c.beginPath();
      c.moveTo(x, gLine + 24);
      c.quadraticCurveTo(x - 5, gLine - 8, x + (r() - 0.5) * 32, gLine - 18 - r() * 52);
      c.stroke();
    }
  }

  initInteractiveFloraAndParticles(r) {
    // Subtle swaying grass blades along GROUND = 701 (no mushrooms!)
    this.grass = [];
    for (let x = 45; x < 1560; x += 16 + Math.floor(r() * 12)) {
      this.grass.push({
        x,
        h: 9 + r() * 13,
        lean: (r() - 0.5) * 7,
        bend: 0,
        phase: r() * Math.PI * 2,
      });
    }

    this.spores = Array.from({ length: 28 }, () => ({
      x: r() * 1680 - 40,
      y: 120 + r() * 640,
      r: 1.5 + r() * 3.0,
      vx: (r() - 0.5) * 12,
      vy: -6 - r() * 11,
      phase: r() * Math.PI * 2,
      color: r() > 0.5 ? '#fff2d6' : '#e8eeff',
      depth: 0.4 + r() * 0.8,
    }));

    this.petals = Array.from({ length: 48 }, () => ({
      x: r() * 1700,
      y: r() * 750,
      s: 2.2 + r() * 4.8,
      v: 12 + r() * 18,
      p: r() * 6.28,
      col: r() > 0.6 ? '#ffbe8f' : r() > 0.3 ? '#e07a86' : '#b85a6e',
    }));
  }

  pagoda(c, x, y, s, col, glowingWindows = false) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    c.fillStyle = col;
    for (let k = 0; k < 3; k++) {
      const h = -k * 45;
      c.fillRect(-26, h - 30, 52, 36);
      c.beginPath();
      c.moveTo(-58, h - 22);
      c.quadraticCurveTo(-15, h - 39, 0, h - 54);
      c.quadraticCurveTo(15, h - 39, 58, h - 22);
      c.quadraticCurveTo(0, h - 14, -58, h - 22);
      c.fill();

      if (glowingWindows) {
        c.fillStyle = 'rgba(255, 220, 150, 0.65)';
        c.fillRect(-7, h - 18, 5, 9);
        c.fillRect(2, h - 18, 5, 9);
        c.fillStyle = col;
      }
    }
    c.restore();
  }

  tree(c, x, y, s, r) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);
    const branch = (bx, by, len, a, w, depth) => {
      const nx = bx + Math.cos(a) * len;
      const ny = by + Math.sin(a) * len;
      const ctrlX = bx + Math.cos(a + 0.15) * len * 0.6;
      const ctrlY = by + Math.sin(a + 0.15) * len * 0.6;

      c.strokeStyle = depth > 1 ? '#3b263b' : '#573649';
      c.lineWidth = w;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(bx, by);
      c.quadraticCurveTo(ctrlX, ctrlY, nx, ny);
      c.stroke();

      if (depth >= 2) {
        c.strokeStyle = 'rgba(235, 195, 175, 0.25)';
        c.lineWidth = Math.max(1.5, w * 0.16);
        c.beginPath();
        c.moveTo(bx + w * 0.25, by);
        c.quadraticCurveTo(ctrlX + w * 0.2, ctrlY, nx + w * 0.15, ny);
        c.stroke();
      }

      if (depth) {
        branch(nx, ny, len * (0.62 + r() * 0.1), a - 0.3 - r() * 0.45, w * 0.64, depth - 1);
        branch(nx, ny, len * (0.62 + r() * 0.15), a + 0.3 + r() * 0.45, w * 0.6, depth - 1);
      } else {
        const cg = c.createRadialGradient(nx, ny, 4, nx, ny, 56);
        cg.addColorStop(0, 'rgba(255, 155, 110, 0.22)');
        cg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        c.fillStyle = cg;
        c.beginPath();
        c.arc(nx, ny, 56, 0, Math.PI * 2);
        c.fill();

        const leafColors = ['#6e2842', '#a63c52', '#cf5858', '#e88364', '#ffca82'];
        for (let i = 0; i < 25; i++) {
          const lx = nx + (r() - 0.5) * 74;
          const ly = ny + (r() - 0.5) * 48;
          c.fillStyle = leafColors[Math.min(4, Math.floor((1 - (ly - (ny - 24)) / 48) * 3.5 + r() * 1.8))];
          c.save();
          c.translate(lx, ly);
          c.rotate(r() * 6.28);
          c.beginPath();
          c.moveTo(0, -6.5);
          c.lineTo(3, -2);
          c.lineTo(7.5, -3);
          c.lineTo(5, 2);
          c.lineTo(6, 5.5);
          c.lineTo(0, 4);
          c.lineTo(-4, 6);
          c.lineTo(-3, 1);
          c.lineTo(-7.5, -2);
          c.lineTo(-2, -2);
          c.closePath();
          c.fill();
          c.restore();
        }
      }
    };
    branch(0, 0, 178, -1.62, 29, 4);
    c.restore();
  }

  draw(c, time, opts = {}) {
    const sx = opts.shakeX || 0;
    const sy = opts.shakeY || 0;

    if (opts.stageTheme === 'eclipse' && opts.arenaImg && opts.arenaImg.width) {
      c.save();
      c.drawImage(opts.arenaImg, -20 + sx * 0.85, -12 + sy * 0.85, 1640, 924);
      // Volumetric Moon-Portal Glow & Beams from the Eclipse Gate (905, 215)
      c.globalCompositeOperation = 'screen';
      const px = 905 + sx * 0.45;
      const py = 215 + sy * 0.45;
      const portalPulse = 0.78 + 0.22 * Math.sin(time * 1.1);
      const pg = c.createRadialGradient(px, py, 10, px, py, 260);
      pg.addColorStop(0, `rgba(225, 238, 255, ${(0.24 * portalPulse).toFixed(3)})`);
      pg.addColorStop(0.5, `rgba(175, 155, 255, ${(0.10 * portalPulse).toFixed(3)})`);
      pg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      c.fillStyle = pg;
      c.beginPath();
      c.arc(px, py, 260, 0, Math.PI * 2);
      c.fill();

      // Flickering Stone Lantern Glows on the Eclipse Shrine
      for (const [lx, ly] of [[128, 398], [748, 326], [1302, 338], [1565, 355]]) {
        const fl = 0.85 + 0.15 * Math.sin(time * 4.5 + lx);
        const lg = c.createRadialGradient(lx + sx * 0.7, ly + sy * 0.7, 2, lx + sx * 0.7, ly + sy * 0.7, 72 * fl);
        lg.addColorStop(0, 'rgba(255, 210, 125, 0.38)');
        lg.addColorStop(0.5, 'rgba(255, 120, 45, 0.14)');
        lg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        c.fillStyle = lg;
        c.beginPath();
        c.arc(lx + sx * 0.7, ly + sy * 0.7, 72 * fl, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();
    } else {
      const drawPlane = (canvas, px, py) => {
        c.drawImage(canvas, -160 + sx * px, -30 + sy * py);
      };

      drawPlane(this.layerSky, 0.05, 0.05);
      drawPlane(this.layerFarMtn, 0.15, 0.12);
      drawPlane(this.layerMidMtn, 0.28, 0.22);

      // Volumetric Diagonal Moonbeams
      c.save();
      c.globalCompositeOperation = 'screen';
      const mx = 1110 + sx * 0.08;
      const my = 240 + sy * 0.05;
      for (let i = 0; i < 5; i++) {
        const pulse = 0.72 + 0.28 * Math.sin(time * 0.55 + i * 1.4);
        const beamX = 420 + i * 240 + sx * 0.35;
        const bw = 75 + (i % 2) * 45;
        const grad = c.createLinearGradient(mx, my, beamX, 720);
        grad.addColorStop(0, `rgba(255, 232, 195, ${(0.085 * pulse).toFixed(3)})`);
        grad.addColorStop(0.55, `rgba(215, 185, 255, ${(0.05 * pulse).toFixed(3)})`);
        grad.addColorStop(1, 'rgba(215, 185, 255, 0)');
        c.fillStyle = grad;
        c.beginPath();
        c.moveTo(mx - 30, my);
        c.lineTo(mx + 30, my);
        c.lineTo(beamX + bw, 740);
        c.lineTo(beamX - bw, 740);
        c.closePath();
        c.fill();
      }
      c.restore();

      drawPlane(this.layerArch, 0.48, 0.38);
      drawPlane(this.layerShrine, 0.72, 0.62);

      // Warm stone lantern glow & horizon mist
      c.save();
      c.globalCompositeOperation = 'screen';
      for (const lx of [1190 - 165, 1190 + 165]) {
        const flicker = 0.88 + 0.12 * Math.sin(time * 4.2 + lx);
        const gx = lx + sx * 0.72;
        const gy = 652 + sy * 0.62;
        const lg = c.createRadialGradient(gx, gy, 4, gx, gy, 92 * flicker);
        lg.addColorStop(0, 'rgba(255, 220, 140, 0.40)');
        lg.addColorStop(0.45, 'rgba(255, 145, 55, 0.15)');
        lg.addColorStop(1, 'rgba(0, 0, 0, 0)');
        c.fillStyle = lg;
        c.beginPath();
        c.arc(gx, gy, 92 * flicker, 0, Math.PI * 2);
        c.fill();
      }

      const mistY = 682 + sy * 0.85;
      const mistGrad = c.createLinearGradient(0, mistY - 50, 0, mistY + 42);
      mistGrad.addColorStop(0, 'rgba(180, 160, 220, 0)');
      mistGrad.addColorStop(0.5, 'rgba(215, 225, 255, 0.10)');
      mistGrad.addColorStop(1, 'rgba(180, 160, 220, 0)');
      c.fillStyle = mistGrad;
      c.fillRect(0, mistY - 50, 1600, 92);
      c.restore();

      // Main Stage 3D Perspective Stone Terrace
      drawPlane(this.layerTerrace, 1.0, 1.0);
    }

    // Real-time Dynamic Ground Light Reflections (Golden for Cat, Silver-White for Xiaosi)
    if (opts.lights && opts.lights.length > 0) {
      c.save();
      c.globalCompositeOperation = 'screen';
      for (const l of opts.lights) {
        const rad = l.r || 135;
        const lx = l.x + sx;
        const ly = 716 + sy;
        const lg = c.createRadialGradient(lx, ly, 4, lx, ly, rad);
        lg.addColorStop(0, l.color);
        lg.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = lg;
        c.save();
        c.translate(lx, ly);
        c.scale(1, 0.26);
        c.beginPath();
        c.arc(0, 0, rad, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
      c.restore();
    }

    // Interactive Grass along GROUND = 701
    const actors = opts.actors || [];
    c.save();
    c.translate(sx, sy);
    for (const g of this.grass) {
      let targetBend = Math.sin(time * 1.6 + g.phase) * 2.5;
      for (const a of actors) {
        const dist = g.x - a.x;
        if (Math.abs(dist) < 75 && (a.y || 0) < 65) {
          const push = (1 - Math.abs(dist) / 75) * (dist >= 0 ? 14 : -14);
          targetBend += push;
        }
      }
      g.bend += (targetBend - g.bend) * 0.18;

      c.strokeStyle = '#3b2c4a';
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(g.x, 703);
      c.quadraticCurveTo(g.x + g.lean * 0.4, 703 - g.h * 0.5, g.x + g.lean + g.bend, 703 - g.h);
      c.stroke();
    }
    c.restore();

    // Drifting Midground Maple Petals
    c.save();
    for (const p of this.petals) {
      const x = ((p.x + time * p.v) % 1700 + 1700) % 1700 - 50;
      const y = (p.y + time * 12) % 760;
      c.save();
      c.translate(x, y);
      c.rotate(Math.sin(time * 1.4 + p.p) * 1.2);
      c.fillStyle = p.col;
      c.globalAlpha = 0.72;
      c.beginPath();
      c.ellipse(0, 0, p.s, p.s * 0.42, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }
    c.restore();
  }

  /**
   * Restrained Foreground Layer: subtle edge reeds + soft floating light motes,
   * never obstructing the stage or characters.
   */
  drawForeground(c, time, opts = {}) {
    const sx = opts.shakeX || 0;
    const sy = opts.shakeY || 0;

    c.save();
    c.drawImage(this.layerFg, -160 + sx * 1.25, -30 + sy * 1.15);

    c.globalCompositeOperation = 'screen';
    for (const sp of this.spores) {
      const sxPos = ((sp.x + time * sp.vx + Math.sin(time * 1.1 + sp.phase) * 18) % 1720 + 1720) % 1720 - 60;
      const syPos = ((sp.y + time * sp.vy + Math.cos(time * 0.8 + sp.phase) * 10) % 780 + 780) % 780;
      const pulse = 0.45 + 0.55 * Math.sin(time * 2.4 + sp.phase);
      const rad = sp.r * (sp.depth > 1.0 ? 1.8 : 1.0);

      const g = c.createRadialGradient(sxPos, syPos, 0.5, sxPos, syPos, rad * 2.8);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.35, sp.color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      c.globalAlpha = pulse * 0.52;
      c.fillStyle = g;
      c.beginPath();
      c.arc(sxPos, syPos, rad * 2.8, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
}
