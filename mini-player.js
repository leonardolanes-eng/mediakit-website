// ==================== MINI PLAYER - Persistent across all pages ====================
(function() {
  // Don't show on sonidos.html (it has its own full player)
  if (window.location.pathname.includes('sonidos.html')) return;

  // Check if any sounds are saved as active
  function getActiveSounds() {
    try {
      const state = JSON.parse(localStorage.getItem('relajate_sounds') || '{}');
      const active = {};
      Object.keys(state).forEach(name => {
        if (state[name] && state[name].active) {
          active[name] = state[name];
        }
      });
      return active;
    } catch(e) { return {}; }
  }

  const SOUND_LABELS = {
    rain:'Lluvia', cafe:'Café', piano:'Piano', ocean:'Océano',
    fire:'Fuego', wind:'Viento', birds:'Pájaros', thunder:'Truenos',
    night:'Noche', river:'Río', guitar:'Guitarra', flute:'Flauta', harp:'Arpa'
  };
  const SOUND_ICONS = {
    rain:'🌧', cafe:'☕', piano:'🎹', ocean:'🌊',
    fire:'🔥', wind:'🍃', birds:'🐦', thunder:'⚡',
    night:'🌙', river:'💧', guitar:'🎸', flute:'🎶', harp:'🎵'
  };

  let audioCtx = null;
  let masterGain = null;
  let miniPlaying = false;
  let miniSounds = {}; // name -> { gain, nodes }
  let miniMasterVol = 0.6;

  function createNoise(type) {
    const bufferSize = audioCtx.sampleRate * 4;
    const buffer = audioCtx.createBuffer(2, bufferSize, audioCtx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      if (type === 'brown') {
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          last = (last + 0.02 * white) / 1.02;
          data[i] = last * 3.5;
        }
      } else {
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      }
    }
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  function startMiniSound(name, volume) {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = miniMasterVol;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const gain = audioCtx.createGain();
    gain.gain.value = volume || 0.5;
    gain.connect(masterGain);
    const nodes = [];
    const cfg = { gain, nodes, _active: true };

    if (name === 'rain') {
      const n = createNoise('white');
      const hp = audioCtx.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=1000;
      const lp = audioCtx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=8000;
      const v = audioCtx.createGain(); v.gain.value=0.35;
      n.connect(hp); hp.connect(lp); lp.connect(v); v.connect(gain);
      n.start(); nodes.push(n,hp,lp,v);
    } else if (name === 'ocean') {
      const n = createNoise('white');
      const f = audioCtx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=400;
      const lfo = audioCtx.createOscillator(); lfo.frequency.value=0.08;
      const lg = audioCtx.createGain(); lg.gain.value=350;
      lfo.connect(lg); lg.connect(f.frequency);
      const v = audioCtx.createGain(); v.gain.value=0.6;
      n.connect(f); f.connect(v); v.connect(gain);
      n.start(); lfo.start(); nodes.push(n,lfo,f,lg,v);
    } else if (name === 'cafe') {
      const n = createNoise('brown');
      const bp = audioCtx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=800; bp.Q.value=0.3;
      const v = audioCtx.createGain(); v.gain.value=0.3;
      n.connect(bp); bp.connect(v); v.connect(gain);
      n.start(); nodes.push(n,bp,v);
    } else if (name === 'wind') {
      const n = createNoise('white');
      const f = audioCtx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=600;
      const lfo = audioCtx.createOscillator(); lfo.frequency.value=0.15;
      const lg = audioCtx.createGain(); lg.gain.value=400;
      lfo.connect(lg); lg.connect(f.frequency);
      const v = audioCtx.createGain(); v.gain.value=0.25;
      n.connect(f); f.connect(v); v.connect(gain);
      n.start(); lfo.start(); nodes.push(n,lfo,f,lg,v);
    } else if (name === 'fire') {
      const n = createNoise('brown');
      const bp = audioCtx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=500; bp.Q.value=1;
      const v = audioCtx.createGain(); v.gain.value=0.3;
      n.connect(bp); bp.connect(v); v.connect(gain);
      n.start(); nodes.push(n,bp,v);
    } else if (name === 'night') {
      const n = createNoise('brown');
      const f = audioCtx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=300;
      const v = audioCtx.createGain(); v.gain.value=0.2;
      n.connect(f); f.connect(v); v.connect(gain);
      n.start(); nodes.push(n,f,v);
    } else if (name === 'river') {
      const n = createNoise('white');
      const bp = audioCtx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1200; bp.Q.value=0.5;
      const v = audioCtx.createGain(); v.gain.value=0.2;
      n.connect(bp); bp.connect(v); v.connect(gain);
      n.start(); nodes.push(n,bp,v);
    } else if (name === 'piano') {
      cfg._active = true;
      const chords = [[261.63,329.63,392],[293.66,349.23,440],[246.94,311.13,370],[220,277.18,329.63]];
      function playChord() {
        if (!cfg._active) return;
        const chord = chords[Math.floor(Math.random()*chords.length)];
        chord.forEach(freq => {
          const o = audioCtx.createOscillator(); o.type='sine'; o.frequency.value=freq;
          const g2 = audioCtx.createGain();
          g2.gain.setValueAtTime(0,audioCtx.currentTime);
          g2.gain.linearRampToValueAtTime(0.04,audioCtx.currentTime+0.05);
          g2.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+4);
          o.connect(g2); g2.connect(gain);
          o.start(); o.stop(audioCtx.currentTime+4.5);
        });
        setTimeout(playChord, 4000+Math.random()*4000);
      }
      playChord();
    } else if (name === 'birds') {
      cfg._active = true;
      function chirp() {
        if (!cfg._active) return;
        const o = audioCtx.createOscillator(); o.type='sine';
        const f = 2000+Math.random()*2000;
        o.frequency.setValueAtTime(f,audioCtx.currentTime);
        o.frequency.exponentialRampToValueAtTime(f*1.5,audioCtx.currentTime+0.08);
        const g2 = audioCtx.createGain();
        g2.gain.setValueAtTime(0,audioCtx.currentTime);
        g2.gain.linearRampToValueAtTime(0.04,audioCtx.currentTime+0.02);
        g2.gain.linearRampToValueAtTime(0,audioCtx.currentTime+0.15);
        o.connect(g2); g2.connect(gain);
        o.start(); o.stop(audioCtx.currentTime+0.2);
        setTimeout(chirp, 1500+Math.random()*4000);
      }
      chirp();
    } else if (name === 'thunder') {
      cfg._active = true;
      function rumble() {
        if (!cfg._active) return;
        const n = createNoise('brown');
        const f = audioCtx.createBiquadFilter(); f.type='lowpass'; f.frequency.value=150;
        const g2 = audioCtx.createGain();
        g2.gain.setValueAtTime(0,audioCtx.currentTime);
        g2.gain.linearRampToValueAtTime(0.4,audioCtx.currentTime+0.3);
        g2.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+4);
        n.connect(f); f.connect(g2); g2.connect(gain);
        n.start(); n.stop(audioCtx.currentTime+5);
        setTimeout(rumble, 8000+Math.random()*15000);
      }
      rumble();
    } else if (name === 'guitar') {
      cfg._active = true;
      const chords = [[196,246.94,293.66],[220,277.18,329.63],[261.63,329.63,392]];
      function strum() {
        if (!cfg._active) return;
        const chord = chords[Math.floor(Math.random()*chords.length)];
        chord.forEach((freq,i) => {
          setTimeout(() => {
            if (!cfg._active) return;
            const o = audioCtx.createOscillator(); o.type='triangle'; o.frequency.value=freq;
            const g2 = audioCtx.createGain();
            g2.gain.setValueAtTime(0,audioCtx.currentTime);
            g2.gain.linearRampToValueAtTime(0.06,audioCtx.currentTime+0.01);
            g2.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+2.5);
            o.connect(g2); g2.connect(gain);
            o.start(); o.stop(audioCtx.currentTime+3);
          }, i*80);
        });
        setTimeout(strum, 3000+Math.random()*5000);
      }
      strum();
    } else if (name === 'flute') {
      cfg._active = true;
      const scale = [523.25,587.33,659.25,698.46,783.99,880];
      function note() {
        if (!cfg._active) return;
        const freq = scale[Math.floor(Math.random()*scale.length)] * (Math.random()>0.3?1:0.5);
        const o = audioCtx.createOscillator(); o.type='sine'; o.frequency.value=freq;
        const vib = audioCtx.createOscillator(); vib.frequency.value=4+Math.random()*2;
        const vg = audioCtx.createGain(); vg.gain.value=3;
        vib.connect(vg); vg.connect(o.frequency);
        const dur = 1.5+Math.random()*2;
        const g2 = audioCtx.createGain();
        g2.gain.setValueAtTime(0,audioCtx.currentTime);
        g2.gain.linearRampToValueAtTime(0.05,audioCtx.currentTime+0.3);
        g2.gain.setValueAtTime(0.05,audioCtx.currentTime+dur-0.5);
        g2.gain.linearRampToValueAtTime(0,audioCtx.currentTime+dur);
        o.connect(g2); g2.connect(gain);
        o.start(); vib.start();
        o.stop(audioCtx.currentTime+dur+0.1); vib.stop(audioCtx.currentTime+dur+0.1);
        setTimeout(note, (dur+0.5+Math.random()*2)*1000);
      }
      note();
    } else if (name === 'harp') {
      cfg._active = true;
      const harpNotes = [261.63,293.66,329.63,392,440,523.25,587.33,659.25];
      function arp() {
        if (!cfg._active) return;
        const start = Math.floor(Math.random()*4);
        const count = 4+Math.floor(Math.random()*4);
        for (let i=0;i<count;i++) {
          setTimeout(() => {
            if (!cfg._active) return;
            const freq = harpNotes[(start+i)%harpNotes.length];
            const o = audioCtx.createOscillator(); o.type='sine'; o.frequency.value=freq;
            const g2 = audioCtx.createGain();
            g2.gain.setValueAtTime(0,audioCtx.currentTime);
            g2.gain.linearRampToValueAtTime(0.04,audioCtx.currentTime+0.005);
            g2.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+2);
            o.connect(g2); g2.connect(gain);
            o.start(); o.stop(audioCtx.currentTime+2.5);
          }, i*120);
        }
        setTimeout(arp, 3500+Math.random()*5000);
      }
      arp();
    }

    miniSounds[name] = cfg;
  }

  function stopMiniSound(name) {
    const cfg = miniSounds[name];
    if (!cfg) return;
    cfg._active = false;
    cfg.nodes.forEach(n => {
      try { n.stop && n.stop(); } catch(e) {}
      try { n.disconnect(); } catch(e) {}
    });
    try { cfg.gain.disconnect(); } catch(e) {}
    delete miniSounds[name];
  }

  function stopAllMini() {
    Object.keys(miniSounds).forEach(n => stopMiniSound(n));
    miniPlaying = false;
    updateMiniUI();
  }

  function startAllFromState() {
    const active = getActiveSounds();
    const names = Object.keys(active);
    if (names.length === 0) return;
    names.forEach(name => {
      if (!miniSounds[name]) {
        startMiniSound(name, active[name].volume);
      }
    });
    miniPlaying = true;
    updateMiniUI();
  }

  function updateMiniUI() {
    const bar = document.getElementById('miniPlayerBar');
    const active = getActiveSounds();
    const names = Object.keys(active);

    if (names.length === 0) {
      bar.style.transform = 'translateY(100%)';
      return;
    }

    bar.style.transform = 'translateY(0)';
    const btn = document.getElementById('miniPlayBtn');
    btn.textContent = miniPlaying ? '⏸' : '▶';

    const tags = document.getElementById('miniSoundTags');
    tags.innerHTML = '';
    names.forEach(name => {
      const tag = document.createElement('span');
      tag.className = 'mini-tag';
      tag.textContent = (SOUND_ICONS[name]||'') + ' ' + (SOUND_LABELS[name]||name);
      tags.appendChild(tag);
    });
  }

  // Create mini player DOM
  function createMiniPlayer() {
    const style = document.createElement('style');
    style.textContent = `
      #miniPlayerBar {
        position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
        background: rgba(255,255,255,0.95); backdrop-filter: blur(12px);
        border-top: 1px solid rgba(0,0,0,0.08);
        box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
        padding: 0.5rem 1rem; display: flex; align-items: center; gap: 0.75rem;
        transition: transform 0.3s ease;
        transform: translateY(100%);
        font-family: inherit;
      }
      #miniPlayBtn {
        width: 36px; height: 36px; border-radius: 50%;
        background: linear-gradient(135deg, #9B8EC4, #6B9BD2);
        border: none; color: white; font-size: 1rem;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        flex-shrink: 0;
      }
      #miniPlayBtn:hover { opacity: 0.9; }
      .mini-info { flex: 1; display: flex; align-items: center; gap: 0.5rem; overflow: hidden; }
      .mini-label { font-size: 0.75rem; font-weight: 700; color: #555; white-space: nowrap; }
      #miniSoundTags { display: flex; gap: 0.3rem; overflow-x: auto; }
      .mini-tag {
        padding: 0.15rem 0.5rem; border-radius: 12px;
        background: rgba(155,142,196,0.1); font-size: 0.7rem;
        font-weight: 600; color: #6B5B8D; white-space: nowrap;
      }
      .mini-vol { width: 50px; height: 3px; -webkit-appearance: none; appearance: none;
        background: #ddd; border-radius: 2px; outline: none; flex-shrink: 0; }
      .mini-vol::-webkit-slider-thumb {
        -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%;
        background: #9B8EC4; cursor: pointer;
      }
      .mini-link {
        font-size: 0.7rem; color: #6B9BD2; text-decoration: none;
        font-weight: 700; white-space: nowrap; flex-shrink: 0;
      }
      .mini-link:hover { text-decoration: underline; }
      @media(max-width:600px) {
        #miniPlayerBar { padding: 0.4rem 0.6rem; gap: 0.4rem; }
        .mini-label { display: none; }
      }
    `;
    document.head.appendChild(style);

    const bar = document.createElement('div');
    bar.id = 'miniPlayerBar';
    bar.innerHTML = `
      <button id="miniPlayBtn">▶</button>
      <div class="mini-info">
        <span class="mini-label">🎵 Sonidos</span>
        <div id="miniSoundTags"></div>
      </div>
      <input type="range" class="mini-vol" id="miniVol" min="0" max="100" value="60">
      <a href="sonidos.html" class="mini-link">Abrir mixer →</a>
    `;
    document.body.appendChild(bar);

    // Add padding to body so content isn't hidden behind bar
    document.body.style.paddingBottom = '56px';

    // Play/pause button
    document.getElementById('miniPlayBtn').addEventListener('click', () => {
      if (miniPlaying) {
        stopAllMini();
      } else {
        startAllFromState();
      }
    });

    // Volume
    document.getElementById('miniVol').addEventListener('input', (e) => {
      miniMasterVol = e.target.value / 100;
      if (masterGain) masterGain.gain.value = miniMasterVol;
    });
  }

  // Initialize
  createMiniPlayer();

  // Check if sounds should auto-play
  const active = getActiveSounds();
  if (Object.keys(active).length > 0) {
    updateMiniUI();
    // Auto-start on first user interaction (browser policy requires user gesture)
    function autoStart() {
      if (!miniPlaying) {
        startAllFromState();
      }
      document.removeEventListener('click', autoStart);
      document.removeEventListener('touchstart', autoStart);
    }
    document.addEventListener('click', autoStart);
    document.addEventListener('touchstart', autoStart);
  }
})();
