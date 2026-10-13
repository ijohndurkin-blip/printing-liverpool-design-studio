/* Printing Liverpool – Design Studio concept demo.
 * Plain JavaScript, no build step. All prices below are illustrative. */
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Catalogue (example data – the shop would edit these to match real prices)
  // ---------------------------------------------------------------------------
  const SHIRT_COLOURS = [
    { name: 'White', hex: '#ffffff' },
    { name: 'Black', hex: '#1d1d1f' },
    { name: 'Navy', hex: '#1f2a44' },
    { name: 'Red', hex: '#c8102e' },
    { name: 'Royal Blue', hex: '#2152c4' },
    { name: 'Heather Grey', hex: '#b7b9bd' },
    { name: 'Bottle Green', hex: '#1e5a3c' },
    { name: 'Pink', hex: '#f4a7c0' },
  ];

  const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  const PLUS_SIZES = ['2XL', '3XL'];
  const PLUS_SIZE_SURCHARGE = 2;

  // Print areas are fractions of the 500×500 stage. widthIn = physical print width.
  const PRODUCTS = {
    tshirt: {
      name: 'T-shirt', from: 6, colours: SHIRT_COLOURS, sizes: APPAREL_SIZES,
      area: { front: [0.34, 0.22, 0.32, 0.44], back: [0.33, 0.18, 0.34, 0.50] }, widthIn: 12,
    },
    hoodie: {
      name: 'Hoodie', from: 18, colours: SHIRT_COLOURS, sizes: APPAREL_SIZES,
      area: { front: [0.35, 0.25, 0.30, 0.34], back: [0.33, 0.33, 0.34, 0.40] }, widthIn: 11,
    },
    sweatshirt: {
      name: 'Sweatshirt', from: 14, colours: SHIRT_COLOURS, sizes: APPAREL_SIZES,
      area: { front: [0.34, 0.24, 0.32, 0.42], back: [0.33, 0.20, 0.34, 0.48] }, widthIn: 12,
    },
    tote: {
      name: 'Tote bag', from: 4, sizes: ['One size'],
      colours: [{ name: 'Natural', hex: '#efe6d2' }, { name: 'Black', hex: '#1d1d1f' }, { name: 'Navy', hex: '#1f2a44' }, { name: 'Red', hex: '#c8102e' }],
      area: { front: [0.30, 0.38, 0.40, 0.46], back: [0.30, 0.38, 0.40, 0.46] }, widthIn: 10,
    },
  };

  const METHODS = {
    dtg: { name: 'DTG (direct to garment)', desc: 'Full colour and photos. Best for 1–50 items.', perSide: 5, setupPerSide: 0, min: 1 },
    screen: { name: 'Screen printing', desc: 'Bold, long-lasting colour. Best value for 20+ items.', perSide: 2.5, setupPerSide: 25, min: 20 },
    vinyl: { name: 'Vinyl transfer', desc: 'Crisp text, names and numbers.', perSide: 4, setupPerSide: 0, min: 1 },
    embroidery: { name: 'Embroidery', desc: 'Stitched logos with a premium finish.', perSide: 6, setupPerSide: 20, min: 1 },
  };

  const DISCOUNTS = [[100, 0.20], [50, 0.15], [25, 0.10], [10, 0.05]];
  const TURNAROUND = { standard: 0, nextday: 0.15, sameday: 0.25 };
  const DELIVERY = { collect: 0, courier: 8 };

  // ---------------------------------------------------------------------------
  // Garment artwork (simple flat SVG shapes in a 500×500 viewBox)
  // ---------------------------------------------------------------------------
  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const c = (v) => Math.max(0, Math.min(255, Math.round(v + amt)));
    const r = c(n >> 16), g = c((n >> 8) & 255), b = c(n & 255);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  function garmentSVG(product, side, hex) {
    const stroke = shade(hex, hex === '#ffffff' ? -45 : -35);
    const detail = shade(hex, -20);
    const s = `stroke="${stroke}" stroke-width="3" stroke-linejoin="round"`;
    switch (product) {
      case 'tshirt': {
        const neck = side === 'front' ? 'Q250,88 305,40' : 'Q250,58 305,40';
        return `<path fill="${hex}" ${s} d="M195,40 ${neck} L382,66 L472,152 L420,208 L375,172 L375,468 L125,468 L125,172 L80,208 L28,152 L118,66 Z"/>` +
          `<path fill="none" stroke="${detail}" stroke-width="6" d="M195,40 ${neck}"/>` +
          `<path fill="none" stroke="${detail}" stroke-width="2" d="M125,172 L118,66 M375,172 L382,66"/>`;
      }
      case 'hoodie': {
        const hood = side === 'front'
          ? `<path fill="${detail}" ${s} d="M188,48 Q186,6 250,4 Q314,6 312,48 Q250,110 188,48 Z"/>` +
            `<path fill="none" stroke="${stroke}" stroke-width="3" d="M232,72 L230,135 M268,72 L270,135"/>`
          : `<path fill="${detail}" ${s} d="M188,48 Q180,0 250,0 Q320,0 312,48 Q290,150 250,150 Q210,150 188,48 Z"/>`;
        const pocket = side === 'front' ? `<path fill="none" stroke="${detail}" stroke-width="4" d="M172,335 L328,335 L350,425 L150,425 Z"/>` : '';
        return `<path fill="${hex}" ${s} d="M188,48 Q250,100 312,48 L388,72 L478,335 L425,352 L372,195 L372,452 L128,452 L128,195 L75,352 L22,335 L112,72 Z"/>` +
          `<rect x="128" y="440" width="244" height="30" rx="6" fill="${detail}" ${s}/>` +
          `<rect x="20" y="330" width="56" height="26" rx="6" transform="rotate(18 48 343)" fill="${detail}" ${s}/>` +
          `<rect x="424" y="330" width="56" height="26" rx="6" transform="rotate(-18 452 343)" fill="${detail}" ${s}/>` +
          hood + pocket;
      }
      case 'sweatshirt': {
        const neck = side === 'front' ? 'Q250,82 305,42' : 'Q250,60 305,42';
        return `<path fill="${hex}" ${s} d="M195,42 ${neck} L388,70 L478,335 L425,352 L372,195 L372,452 L128,452 L128,195 L75,352 L22,335 L112,70 Z"/>` +
          `<path fill="none" stroke="${detail}" stroke-width="10" d="M195,42 ${neck}"/>` +
          `<rect x="128" y="440" width="244" height="30" rx="6" fill="${detail}" ${s}/>` +
          `<rect x="20" y="330" width="56" height="26" rx="6" transform="rotate(18 48 343)" fill="${detail}" ${s}/>` +
          `<rect x="424" y="330" width="56" height="26" rx="6" transform="rotate(-18 452 343)" fill="${detail}" ${s}/>`;
      }
      case 'tote':
        return `<path fill="none" stroke="${detail}" stroke-width="16" stroke-linecap="round" d="M180,150 C180,40 320,40 320,150"/>` +
          `<rect x="110" y="140" width="280" height="330" rx="6" fill="${hex}" ${s}/>` +
          `<path fill="none" stroke="${detail}" stroke-width="2" stroke-dasharray="6 6" d="M118,152 L382,152"/>`;
    }
    return '';
  }

  function svgDoc(inner) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">${inner}</svg>`;
  }

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const state = {
    product: 'tshirt',
    colour: 0,
    side: 'front',
    method: 'dtg',
    layers: { front: [], back: [] },
    selected: null,
    qty: {},
    showGuides: true,
  };
  let nextId = 1;

  // ---------------------------------------------------------------------------
  // DOM helpers
  // ---------------------------------------------------------------------------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const gbp = (n) => '£' + n.toFixed(2);
  const el = {
    garment: $('#garment'), stage: $('#stage'), printArea: $('#printArea'), layers: $('#layers'),
    productGrid: $('#productGrid'), swatches: $('#swatches'), colourName: $('#colourName'),
    fileInput: $('#fileInput'), dropzone: $('#dropzone'), textInput: $('#textInput'),
    layerEditor: $('#layerEditor'), layerTitle: $('#layerTitle'), textOptions: $('#textOptions'),
    editText: $('#editText'), fontSelect: $('#fontSelect'), textColour: $('#textColour'),
    sizeRange: $('#sizeRange'), rotateRange: $('#rotateRange'),
    methods: $('#methods'), sizes: $('#sizes'), quality: $('#qualityNote'),
    summaryList: $('#summaryList'), totalPrice: $('#totalPrice'), perItem: $('#perItem'), warnings: $('#warnings'),
  };

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  function renderProducts() {
    el.productGrid.innerHTML = '';
    Object.entries(PRODUCTS).forEach(([key, p]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'product' + (key === state.product ? ' active' : '');
      b.setAttribute('aria-pressed', key === state.product);
      b.innerHTML = `<svg viewBox="0 0 500 500" aria-hidden="true">${garmentSVG(key, 'front', '#e9ebef')}</svg>` +
        `<strong>${p.name}</strong><small>from ${gbp(p.from)}</small>`;
      b.addEventListener('click', () => {
        state.product = key;
        if (state.colour >= p.colours.length) state.colour = 0;
        state.qty = {};
        renderAll();
      });
      el.productGrid.appendChild(b);
    });
  }

  function renderSwatches() {
    const p = PRODUCTS[state.product];
    el.swatches.innerHTML = '';
    p.colours.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'swatch' + (i === state.colour ? ' active' : '');
      b.style.background = c.hex;
      b.title = c.name;
      b.setAttribute('aria-label', c.name);
      b.setAttribute('aria-pressed', i === state.colour);
      b.addEventListener('click', () => { state.colour = i; renderSwatches(); renderGarment(); updateQuote(); });
      el.swatches.appendChild(b);
    });
    el.colourName.textContent = p.colours[state.colour].name;
  }

  function renderGarment() {
    const p = PRODUCTS[state.product];
    el.garment.innerHTML = garmentSVG(state.product, state.side, p.colours[state.colour].hex);
    const [x, y, w, h] = p.area[state.side];
    Object.assign(el.printArea.style, { left: x * 100 + '%', top: y * 100 + '%', width: w * 100 + '%', height: h * 100 + '%' });
    el.printArea.classList.toggle('guides', state.showGuides);
    renderLayers();
  }

  function currentLayers() { return state.layers[state.side]; }
  function findLayer(id) { return currentLayers().find((l) => l.id === id); }

  function renderLayers() {
    const areaW = el.printArea.clientWidth;
    el.layers.innerHTML = '';
    currentLayers().forEach((layer) => {
      const d = document.createElement('div');
      d.className = 'layer' + (layer.id === state.selected ? ' selected' : '');
      d.dataset.id = layer.id;
      d.style.left = layer.x * 100 + '%';
      d.style.top = layer.y * 100 + '%';
      d.style.transform = `translate(-50%, -50%) rotate(${layer.rotation}deg)`;
      if (layer.type === 'image') {
        d.style.width = layer.scale * 100 + '%';
        const img = document.createElement('img');
        img.src = layer.src;
        img.alt = layer.name;
        img.draggable = false;
        d.appendChild(img);
      } else {
        d.textContent = layer.text;
        d.style.fontFamily = `"${layer.font}", sans-serif`;
        d.style.fontSize = layer.scale * areaW * 0.35 + 'px';
        d.style.color = layer.color;
        d.style.fontWeight = '700';
      }
      d.addEventListener('pointerdown', startDrag);
      el.layers.appendChild(d);
    });
    renderEditor();
    renderQuality();
  }

  function renderEditor() {
    const layer = state.selected && findLayer(state.selected);
    el.layerEditor.hidden = !layer;
    if (!layer) return;
    el.layerTitle.textContent = layer.type === 'image' ? layer.name : 'Text: ' + layer.text;
    el.textOptions.hidden = layer.type !== 'text';
    if (layer.type === 'text') {
      el.editText.value = layer.text;
      el.fontSelect.value = layer.font;
      el.textColour.value = layer.color;
    }
    el.sizeRange.value = Math.round(layer.scale * 100);
    el.rotateRange.value = layer.rotation;
  }

  // Print-resolution check for the selected (or first) image on this side.
  function renderQuality() {
    const sel = state.selected && findLayer(state.selected);
    const layer = sel && sel.type === 'image' ? sel : currentLayers().find((l) => l.type === 'image');
    if (!layer) { el.quality.hidden = true; return; }
    const p = PRODUCTS[state.product];
    const printedIn = layer.scale * p.widthIn;
    const cm = (printedIn * 2.54).toFixed(0);
    el.quality.hidden = false;
    if (layer.vector) {
      el.quality.className = 'quality ok';
      el.quality.textContent = `✓ Vector artwork. It will print sharp at any size (about ${cm} cm wide).`;
      return;
    }
    const dpi = Math.round(layer.naturalW / printedIn);
    if (dpi >= 200) {
      el.quality.className = 'quality ok';
      el.quality.textContent = `✓ Great quality: ${dpi} dpi at about ${cm} cm wide.`;
    } else if (dpi >= 120) {
      el.quality.className = 'quality warn';
      el.quality.textContent = `⚠ OK quality: ${dpi} dpi at about ${cm} cm wide. It may look slightly soft, so try printing it smaller or uploading a bigger file.`;
    } else {
      el.quality.className = 'quality bad';
      el.quality.textContent = `✕ Low resolution: ${dpi} dpi at about ${cm} cm wide. The print will look blurry. Please upload a larger image (300 dpi is ideal).`;
    }
  }

  function renderMethods() {
    el.methods.innerHTML = '';
    Object.entries(METHODS).forEach(([key, m]) => {
      const label = document.createElement('label');
      label.className = 'option';
      const price = m.setupPerSide ? `${gbp(m.perSide)}/side + ${gbp(m.setupPerSide)} setup` : `${gbp(m.perSide)}/side`;
      label.innerHTML = `<input type="radio" name="method" value="${key}" ${key === state.method ? 'checked' : ''}>` +
        `<span><strong>${m.name}</strong><small>${m.desc}${m.min > 1 ? ` Minimum ${m.min} items.` : ''}</small></span><em>${price}</em>`;
      label.querySelector('input').addEventListener('change', () => { state.method = key; updateQuote(); });
      el.methods.appendChild(label);
    });
  }

  function renderSizes() {
    const p = PRODUCTS[state.product];
    el.sizes.innerHTML = '';
    p.sizes.forEach((size) => {
      const l = document.createElement('label');
      l.className = 'size';
      const plus = PLUS_SIZES.includes(size);
      l.innerHTML = `<span>${size}</span><input type="number" min="0" max="5000" inputmode="numeric" value="${state.qty[size] || 0}" aria-label="Quantity ${size}">` +
        (plus ? `<small>+${gbp(PLUS_SIZE_SURCHARGE)}</small>` : '');
      l.querySelector('input').addEventListener('input', (e) => {
        state.qty[size] = Math.max(0, Math.min(5000, parseInt(e.target.value, 10) || 0));
        updateQuote();
      });
      el.sizes.appendChild(l);
    });
  }

  // ---------------------------------------------------------------------------
  // Pricing
  // ---------------------------------------------------------------------------
  function quote() {
    const p = PRODUCTS[state.product];
    const m = METHODS[state.method];
    const turnaround = $('input[name=turnaround]:checked').value;
    const delivery = $('input[name=delivery]:checked').value;
    const qty = Object.values(state.qty).reduce((a, b) => a + b, 0);
    const plusQty = PLUS_SIZES.reduce((a, s) => a + (state.qty[s] || 0), 0);
    const sides = ['front', 'back'].filter((s) => state.layers[s].length);

    const garments = qty * p.from + plusQty * PLUS_SIZE_SURCHARGE;
    const printing = qty * sides.length * m.perSide;
    const setup = qty ? sides.length * m.setupPerSide : 0;
    const subtotal = garments + printing + setup;
    const rate = (DISCOUNTS.find(([n]) => qty >= n) || [0, 0])[1];
    const discount = (garments + printing) * rate;
    const rush = (subtotal - discount) * TURNAROUND[turnaround];
    const ship = qty ? DELIVERY[delivery] : 0;
    const total = subtotal - discount + rush + ship;

    const warnings = [];
    if (!sides.length) warnings.push('Add a design or some text to at least one side.');
    if (!qty) warnings.push('Enter how many you need in step 4.');
    if (qty && qty < m.min) warnings.push(`${m.name} needs at least ${m.min} items. Switch to DTG or vinyl for smaller runs.`);
    if (state.method === 'screen' && turnaround === 'sameday') warnings.push('Same-day screen printing depends on how busy we are. We will confirm when we send your proof.');

    return { p, m, qty, plusQty, sides, garments, printing, setup, rate, discount, rush, ship, total, turnaround, delivery, warnings };
  }

  function updateQuote() {
    const q = quote();
    const rows = [
      [`${q.qty} × ${q.p.name} (${q.p.colours[state.colour].name})`, gbp(q.garments)],
      [`Printing: ${q.m.name}, ${q.sides.length ? q.sides.join(' + ') : 'no sides yet'}`, gbp(q.printing)],
    ];
    if (q.setup) rows.push(['One-off setup', gbp(q.setup)]);
    if (q.discount) rows.push([`Bulk discount (${q.rate * 100}%)`, '−' + gbp(q.discount), 'discount']);
    if (q.rush) rows.push([q.turnaround === 'sameday' ? 'Same-day express' : 'Next-day express', gbp(q.rush)]);
    rows.push([q.delivery === 'courier' ? 'Same-day courier' : 'Collection', q.ship ? gbp(q.ship) : 'Free']);
    el.summaryList.innerHTML = rows.map(([k, v, cls]) => `<dt>${k}</dt><dd class="${cls || ''}">${v}</dd>`).join('');
    el.totalPrice.textContent = gbp(q.total);
    el.perItem.textContent = q.qty ? `${gbp(q.total / q.qty)} per item` : '';
    el.warnings.innerHTML = q.warnings.map((w) => `<li>${w}</li>`).join('');
    $$('#methods .option').forEach((o) => {
      const m = METHODS[o.querySelector('input').value];
      o.classList.toggle('disabled', q.qty > 0 && q.qty < m.min);
    });
    return q;
  }

  // ---------------------------------------------------------------------------
  // Layers: add / edit / drag
  // ---------------------------------------------------------------------------
  function addLayer(layer) {
    layer.id = nextId++;
    Object.assign(layer, { x: 0.5, y: 0.4, rotation: 0 }, layer);
    currentLayers().push(layer);
    state.selected = layer.id;
    renderLayers();
    updateQuote();
  }

  function addImageFromDataURL(src, name, vector, extra) {
    const img = new Image();
    img.onload = () => {
      const aspect = img.naturalWidth && img.naturalHeight ? img.naturalHeight / img.naturalWidth : 1;
      const [, , w, h] = PRODUCTS[state.product].area[state.side];
      // Fit the image inside the print area (accounting for the area's aspect ratio).
      const maxScale = Math.min(1, (h / w) / aspect) * 0.9;
      addLayer({ type: 'image', src, name, vector, naturalW: img.naturalWidth || 1000, naturalH: img.naturalHeight || 1000, aspect, scale: maxScale, y: 0.45, ...extra });
    };
    img.onerror = () => alert('Sorry, we could not read that image. Please try a PNG or JPG.');
    img.src = src;
  }

  function handleFile(file) {
    if (!file) return;
    if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(file.type)) { alert('Please upload a PNG, JPG, SVG or WEBP file.'); return; }
    if (file.size > 20 * 1024 * 1024) { alert('That file is over 20 MB. Please upload a smaller file, or email it to us.'); return; }
    const reader = new FileReader();
    reader.onload = () => addImageFromDataURL(reader.result, file.name, file.type === 'image/svg+xml');
    reader.readAsDataURL(file);
  }

  function addText(text) {
    text = (text || '').trim();
    if (!text) { el.textInput.focus(); return; }
    addLayer({ type: 'text', text, font: 'Anton', color: pickTextColour(), scale: Math.min(0.9, 4 / Math.max(4, text.length)), y: 0.25 });
    el.textInput.value = '';
  }

  // Choose a text colour that contrasts with the garment.
  function pickTextColour() {
    const hex = PRODUCTS[state.product].colours[state.colour].hex;
    const n = parseInt(hex.slice(1), 16);
    const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    if (lum > 0.6) return hex === '#ffffff' || hex === '#efe6d2' ? '#c8102e' : '#16181d';
    return '#ffffff';
  }

  let drag = null;
  function startDrag(e) {
    const id = Number(e.currentTarget.dataset.id);
    const layer = findLayer(id);
    if (!layer) return;
    if (state.selected !== id) { state.selected = id; renderLayers(); }
    const node = el.layers.querySelector(`[data-id="${id}"]`);
    const rect = el.printArea.getBoundingClientRect();
    drag = { layer, node, startX: e.clientX, startY: e.clientY, ox: layer.x, oy: layer.y, w: rect.width, h: rect.height };
    node.classList.add('dragging');
    node.setPointerCapture(e.pointerId);
    node.addEventListener('pointermove', onDrag);
    node.addEventListener('pointerup', endDrag, { once: true });
    node.addEventListener('pointercancel', endDrag, { once: true });
    e.preventDefault();
  }
  function onDrag(e) {
    if (!drag) return;
    drag.layer.x = clamp(drag.ox + (e.clientX - drag.startX) / drag.w, 0, 1);
    drag.layer.y = clamp(drag.oy + (e.clientY - drag.startY) / drag.h, 0, 1);
    drag.node.style.left = drag.layer.x * 100 + '%';
    drag.node.style.top = drag.layer.y * 100 + '%';
  }
  function endDrag() {
    if (!drag) return;
    drag.node.classList.remove('dragging');
    drag.node.removeEventListener('pointermove', onDrag);
    drag = null;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function editSelected(fn) {
    const layer = state.selected && findLayer(state.selected);
    if (!layer) return;
    fn(layer);
    renderLayers();
  }

  // ---------------------------------------------------------------------------
  // Mockup export (canvas)
  // ---------------------------------------------------------------------------
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  async function renderMockup(side, size = 1000) {
    const p = PRODUCTS[state.product];
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const bg = ctx.createRadialGradient(size / 2, size * 0.4, 0, size / 2, size * 0.4, size * 0.7);
    bg.addColorStop(0, '#ffffff');
    bg.addColorStop(1, '#eceef2');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    const svg = svgDoc(garmentSVG(state.product, side, p.colours[state.colour].hex));
    const garment = await loadImage('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    ctx.drawImage(garment, 0, 0, size, size);

    const [ax, ay, aw, ah] = p.area[side].map((v) => v * size);
    ctx.save();
    ctx.beginPath();
    ctx.rect(ax, ay, aw, ah);
    ctx.clip();
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    for (const layer of state.layers[side]) {
      ctx.save();
      ctx.translate(ax + layer.x * aw, ay + layer.y * ah);
      ctx.rotate((layer.rotation * Math.PI) / 180);
      if (layer.type === 'image') {
        const img = await loadImage(layer.src);
        const w = layer.scale * aw;
        const h = w * layer.aspect;
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      } else {
        ctx.font = `700 ${layer.scale * aw * 0.35}px "${layer.font}", sans-serif`;
        ctx.fillStyle = layer.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(layer.text, 0, 0);
      }
      ctx.restore();
    }
    ctx.restore();
    return canvas.toDataURL('image/png');
  }

  function download(href, filename) {
    const a = document.createElement('a');
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // ---------------------------------------------------------------------------
  // Sample design so the demo works with one click
  // ---------------------------------------------------------------------------
  const SAMPLE_SVG = svgDoc(
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff3b5c"/><stop offset="1" stop-color="#7b2ff7"/></linearGradient></defs>' +
    '<circle cx="250" cy="200" r="150" fill="none" stroke="url(#g)" stroke-width="18"/>' +
    '<g stroke="url(#g)" stroke-width="10" stroke-linecap="round">' +
      '<path d="M170 200 H220 M280 200 H330 M250 120 V170 M250 230 V280 M195 145 L225 175 M305 145 L275 175 M195 255 L225 225 M305 255 L275 225"/></g>' +
    '<g fill="url(#g)"><circle cx="250" cy="200" r="28"/><circle cx="170" cy="200" r="12"/><circle cx="330" cy="200" r="12"/><circle cx="250" cy="120" r="12"/><circle cx="250" cy="280" r="12"/>' +
      '<circle cx="195" cy="145" r="10"/><circle cx="305" cy="145" r="10"/><circle cx="195" cy="255" r="10"/><circle cx="305" cy="255" r="10"/></g>' +
    '<text x="250" y="420" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="64" fill="url(#g)">AI SUMMIT</text>' +
    '<text x="250" y="470" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" font-size="30" letter-spacing="10" fill="#7b2ff7">LIVERPOOL 2026</text>'
  );

  function loadSample() {
    state.layers.front = state.layers.front.filter((l) => !l.sample);
    state.side = 'front';
    syncSideTabs();
    renderGarment();
    addImageFromDataURL('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SAMPLE_SVG), 'AI Summit sample artwork.svg', true, { sample: true });
    if (!Object.values(state.qty).some(Boolean)) { state.qty = { S: 5, M: 10, L: 10, XL: 5 }; renderSizes(); }
    updateQuote();
    $('#studio').scrollIntoView({ behavior: 'smooth' });
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  function syncSideTabs() {
    $$('.seg').forEach((b) => {
      const on = b.dataset.side === state.side;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on);
    });
  }

  function bindEvents() {
    $$('.seg').forEach((b) => b.addEventListener('click', () => {
      state.side = b.dataset.side;
      state.selected = null;
      syncSideTabs();
      renderGarment();
    }));

    el.fileInput.addEventListener('change', (e) => { handleFile(e.target.files[0]); e.target.value = ''; });
    ['dragenter', 'dragover'].forEach((t) => el.dropzone.addEventListener(t, (e) => { e.preventDefault(); el.dropzone.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((t) => el.dropzone.addEventListener(t, (e) => { e.preventDefault(); el.dropzone.classList.remove('over'); }));
    el.dropzone.addEventListener('drop', (e) => handleFile(e.dataTransfer.files[0]));
    // Allow dropping straight onto the preview too.
    el.stage.addEventListener('dragover', (e) => e.preventDefault());
    el.stage.addEventListener('drop', (e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); });

    $('#addText').addEventListener('click', () => addText(el.textInput.value));
    el.textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addText(el.textInput.value); } });

    el.editText.addEventListener('input', () => editSelected((l) => { l.text = el.editText.value || ' '; }));
    el.fontSelect.addEventListener('change', () => editSelected((l) => { l.font = el.fontSelect.value; }));
    el.textColour.addEventListener('input', () => editSelected((l) => { l.color = el.textColour.value; }));
    el.sizeRange.addEventListener('input', () => editSelected((l) => { l.scale = el.sizeRange.value / 100; }));
    el.rotateRange.addEventListener('input', () => editSelected((l) => { l.rotation = Number(el.rotateRange.value); }));
    $('#centreLayer').addEventListener('click', () => editSelected((l) => { l.x = 0.5; l.y = 0.5; l.rotation = 0; }));
    $('#fitLayer').addEventListener('click', () => editSelected((l) => {
      const [, , w, h] = PRODUCTS[state.product].area[state.side];
      l.x = 0.5; l.y = 0.5; l.rotation = 0;
      l.scale = l.type === 'image' ? Math.min(1, (h / w) / l.aspect) : 0.9;
    }));
    $('#removeLayer').addEventListener('click', () => {
      state.layers[state.side] = currentLayers().filter((l) => l.id !== state.selected);
      state.selected = null;
      renderLayers();
      updateQuote();
    });

    // Click on empty stage clears selection.
    el.stage.addEventListener('pointerdown', (e) => {
      if (!e.target.closest('.layer') && state.selected) { state.selected = null; renderLayers(); }
    });

    $('#showGuides').addEventListener('change', (e) => { state.showGuides = e.target.checked; el.printArea.classList.toggle('guides', state.showGuides); });
    $$('input[name=turnaround], input[name=delivery]').forEach((i) => i.addEventListener('change', updateQuote));

    $('#downloadMockup').addEventListener('click', async () => {
      download(await renderMockup(state.side), `mockup-${state.product}-${state.side}.png`);
    });

    $('#heroSample').addEventListener('click', loadSample);

    window.addEventListener('resize', () => renderLayers());

    // Order form
    let lastOrder = null;
    $('#orderForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const err = $('#formError');
      const q = updateQuote();
      if (!form.checkValidity()) { err.textContent = 'Please fill in your name and email, and confirm you own the artwork.'; form.reportValidity(); return; }
      if (q.warnings.length && (!q.sides.length || !q.qty || q.qty < q.m.min)) { err.textContent = q.warnings[0]; return; }
      err.textContent = '';

      const data = Object.fromEntries(new FormData(form));
      const ref = 'PL-' + Date.now().toString(36).toUpperCase().slice(-6);
      lastOrder = {
        reference: ref,
        createdAt: new Date().toISOString(),
        customer: { name: data.name, email: data.email, phone: data.phone, organisation: data.org, neededBy: data.deadline, notes: data.notes },
        product: { type: q.p.name, colour: q.p.colours[state.colour].name },
        printMethod: q.m.name,
        sides: q.sides.map((s) => ({
          side: s,
          layers: state.layers[s].map((l) => l.type === 'image'
            ? { type: 'image', file: l.name, x: +l.x.toFixed(3), y: +l.y.toFixed(3), widthPct: Math.round(l.scale * 100), rotation: l.rotation }
            : { type: 'text', text: l.text, font: l.font, colour: l.color, x: +l.x.toFixed(3), y: +l.y.toFixed(3), rotation: l.rotation }),
        })),
        sizes: Object.fromEntries(Object.entries(state.qty).filter(([, v]) => v > 0)),
        turnaround: q.turnaround,
        delivery: q.delivery,
        totalGBP: +q.total.toFixed(2),
      };
      $('#orderRef').textContent = ref;
      $('#orderJson').textContent = JSON.stringify(lastOrder, null, 2);
      $('#confirmMockup').src = await renderMockup(q.sides[0], 600);
      $('#confirmModal').hidden = false;
      $('#closeModal').focus();
    });
    $('#closeModal').addEventListener('click', () => { $('#confirmModal').hidden = true; });
    $('#confirmModal').addEventListener('click', (e) => { if (e.target.id === 'confirmModal') e.currentTarget.hidden = true; });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') $('#confirmModal').hidden = true; });
    $('#downloadOrder').addEventListener('click', () => {
      if (!lastOrder) return;
      const blob = new Blob([JSON.stringify(lastOrder, null, 2)], { type: 'application/json' });
      download(URL.createObjectURL(blob), `${lastOrder.reference}.json`);
    });
  }

  function renderAll() {
    renderProducts();
    renderSwatches();
    renderGarment();
    renderMethods();
    renderSizes();
    updateQuote();
  }

  bindEvents();
  renderAll();

  // Expose for debugging / tests.
  window.DesignStudio = { state, quote, renderMockup, loadSample };
})();
