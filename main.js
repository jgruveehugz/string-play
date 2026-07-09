(function () {
  "use strict";

  var canvas = document.getElementById("game");
  var ctx = canvas.getContext("2d");
  var suppressClicksUntil = 0;
  var suppressClickSource = null;
  var levelLabelEl = document.getElementById("levelLabel");
  var levelEl = document.getElementById("level");
  var movesLabelEl = document.getElementById("movesLabel");
  var movesEl = document.getElementById("moves");
  var scoreEl = document.getElementById("score");
  var bestEl = document.getElementById("best");
  var chainEl = document.getElementById("chain");
  var layersEl = document.getElementById("layers");
  var audioButton = document.getElementById("audioButton");
  var modeButton = document.getElementById("modeButton");
  var dailyButton = document.getElementById("dailyButton");
  var resetButton = document.getElementById("resetButton");
  var settingsButton = document.getElementById("settingsButton");
  var volumeInput = document.getElementById("volume");
  var levelTitleEl = document.getElementById("levelTitle");
  var objectiveEl = document.getElementById("objective");
  var goalRailEl = document.getElementById("goalRail");
  var goalNowEl = document.getElementById("goalNow");
  var goalLevelEl = document.getElementById("goalLevel");
  var goalMacroEl = document.getElementById("goalMacro");
  var goalHintEl = document.getElementById("goalHint");
  var challengeRivalEl = document.getElementById("challengeRival");
  var challengeHookEl = document.getElementById("challengeHook");
  var challengeCodeEl = document.getElementById("challengeCode");
  var progressEl = document.getElementById("progress");
  var starsEl = document.getElementById("stars");
  var dailyMissionEl = document.getElementById("dailyMission");
  var hudPanel = document.getElementById("hudPanel");
  var hudToggle = document.getElementById("hudToggle");
  var hudSheet = document.getElementById("hudSheet");
  var hudCollapsed = false;
  var hudSheetOpen = false;
  var missionPanel = document.getElementById("missionPanel");
  var prevLevelButton = document.getElementById("prevLevelButton");
  var nextLevelButton = document.getElementById("nextLevelButton");
  var DEBUG = new URLSearchParams(location.search).has("debug");
  var debugTimeScale = 1; // stays 1 unless NeonLatticeDebug.setSpeed is called (debug=1 only)
  var debugUnlimitedMoves = false; // stays false unless NeonLatticeDebug.setUnlimitedMoves is called (debug=1 only)
  var debugDirectorHour = null; // stays null unless NeonLatticeDebug.setDirectorHour is called (debug=1 only)
  var humPreview = null; // stays null unless NeonLatticeDebug.previewHum stages a Hum (debug=1 only)
  // Greenroom (Backstage band screen): per-cell poke clock (last poke time in the
  // render clock's seconds) and a local, budgeted sparkle list drawn only on the
  // greenroom canvas. Pure cosmetic; no board or save state.
  var greenroomPokeAt = [];   // index -> seconds of last poke (render clock)
  var greenroomSparks = [];   // { x, y, vx, vy, born, ttl, size, color }
  var GREENROOM_COLS = 4;
  var GREENROOM_POKE_DUR = 0.62; // one-shot signature-move envelope length (s)
  var GREENROOM_AMBIENT_HZ = 0.5; // staggered idle-bob speed so the awake band always shows life, even muted (cycles/s)
  var GREENROOM_AMBIENT_LIFT = 0.14; // idle-bob height as a fraction of a full poke lift (0-1)
  // Most-recently-woken Hum id; runtime only (no save field). Spotlights the
  // freshest wake in the Greenroom and keeps a woken cameo on later win cards.
  var greenroomSpotlightHum = null;
  if (prevLevelButton) prevLevelButton.hidden = !DEBUG;
  if (nextLevelButton) nextLevelButton.hidden = !DEBUG;
  var coachEl = document.getElementById("coach");
  var boosterRow = document.querySelector(".boosters");
  var hammerButton = document.getElementById("hammerButton");
  var shuffleButton = document.getElementById("shuffleButton");
  var chargeButton = document.getElementById("chargeButton");
  var chargeLabelEl = chargeButton.querySelector("span");
  var hammerCountEl = document.getElementById("hammerCount");
  var shuffleCountEl = document.getElementById("shuffleCount");
  var chargeCountEl = document.getElementById("chargeCount");
  var shareButton = document.getElementById("shareButton");
  var mapButton = document.getElementById("mapButton");
  var storeButton = document.getElementById("storeButton");
  var splashPanel = document.getElementById("splashPanel");
  var splashStartButton = document.getElementById("splashStartButton");
  var splashMenuButton = document.getElementById("splashMenuButton");
  var menuButton = document.getElementById("menuButton");
  var menuPanel = document.getElementById("menuPanel");
  var closeMenuButton = document.getElementById("closeMenuButton");
  var menuSummaryEl = document.getElementById("menuSummary");
  var menuResumeButton = document.getElementById("menuResumeButton");
  var menuAudioButton = document.getElementById("menuAudioButton");
  var menuMapButton = document.getElementById("menuMapButton");
  var menuStoreButton = document.getElementById("menuStoreButton");
  var menuShareButton = document.getElementById("menuShareButton");
  var menuRushButton = document.getElementById("menuRushButton");
  var menuDailyButton = document.getElementById("menuDailyButton");
  var menuRestartButton = document.getElementById("menuRestartButton");
  var menuSettingsButton = document.getElementById("menuSettingsButton");
  var menuRivalEl = document.getElementById("menuRival");
  var menuHookEl = document.getElementById("menuHook");
  var menuCodeEl = document.getElementById("menuCode");
  var menuDailyMissionEl = document.getElementById("menuDailyMission");
  var mapPanel = document.getElementById("mapPanel");
  var mapTitleEl = document.getElementById("mapTitle");
  var mapSummaryEl = document.getElementById("mapSummary");
  var mapUnlockedEl = document.getElementById("mapUnlocked");
  var mapStarsEl = document.getElementById("mapStars");
  var mapCurrentEl = document.getElementById("mapCurrent");
  var mapRewardEl = document.getElementById("mapReward");
  var mapMissionEl = document.getElementById("mapMission");
  var mapStreakEl = document.getElementById("mapStreak");
  var mapEventEl = document.getElementById("mapEvent");
  var mapGridEl = document.getElementById("mapGrid");
  var closeMapButton = document.getElementById("closeMapButton");
  var setlistPanel = document.getElementById("setlistPanel");
  var setlistTitleEl = document.getElementById("setlistTitle");
  var setlistSummaryEl = document.getElementById("setlistSummary");
  var setlistStreakEl = document.getElementById("setlistStreak");
  var setlistPassesEl = document.getElementById("setlistPasses");
  var setlistBestEl = document.getElementById("setlistBest");
  var setlistMonthEl = document.getElementById("setlistMonth");
  var setlistGridEl = document.getElementById("setlistGrid");
  var setlistStreakLineEl = document.getElementById("setlistStreakLine");
  var setlistPlayButton = document.getElementById("setlistPlayButton");
  var closeSetlistButton = document.getElementById("closeSetlistButton");
  var menuSetlistButton = document.getElementById("menuSetlistButton");
  var menuGreenroomButton = document.getElementById("menuGreenroomButton");
  var greenroomPanel = document.getElementById("greenroomPanel");
  var greenroomCanvas = document.getElementById("greenroomCanvas");
  var greenroomLedgerEl = document.getElementById("greenroomLedger");
  var closeGreenroomButton = document.getElementById("closeGreenroomButton");
  var splashDailyButton = document.getElementById("splashDailyButton");
  var splashDailyTitleEl = document.getElementById("splashDailyTitle");
  var splashDailyMetaEl = document.getElementById("splashDailyMeta");
  var storePanel = document.getElementById("storePanel");
  var closeStoreButton = document.getElementById("closeStoreButton");
  var storeSummaryEl = document.getElementById("storeSummary");
  var creditCountEl = document.getElementById("creditCount");
  var storeOffersEl = document.getElementById("storeOffers");
  var storeStatusEl = document.getElementById("storeStatus");
  var sharePanel = document.getElementById("sharePanel");
  var shareCoverImg = document.getElementById("shareCoverImg");
  var shareEyebrowEl = document.getElementById("shareEyebrow");
  var shareTitleEl = document.getElementById("shareTitle");
  var shareSubtitleEl = document.getElementById("shareSubtitle");
  var shareStatsEl = document.getElementById("shareStats");
  var shareTextEl = document.getElementById("shareText");
  var shareCopyButton = document.getElementById("shareCopyButton");
  var nativeShareButton = document.getElementById("nativeShareButton");
  var shareImageButton = document.getElementById("shareImageButton");
  var closeShareButton = document.getElementById("closeShareButton");
  var shareStatusEl = document.getElementById("shareStatus");
  var coachPanel = document.getElementById("coachPanel");
  var coachBodyEl = document.getElementById("coachBody");
  var settingsPanel = document.getElementById("settingsPanel");
  var hapticsToggle = document.getElementById("hapticsToggle");
  var hapticsTestButton = document.getElementById("hapticsTestButton");
  var hapticsStatusEl = document.getElementById("hapticsStatus");
  var fullFxToggle = document.getElementById("fullFxToggle");
  var musicPaletteSelect = document.getElementById("musicPaletteSelect");
  var musicGenreSelect = document.getElementById("musicGenreSelect");
  var musicAutoToggle = document.getElementById("musicAutoToggle");
  var qualityStatusEl = document.getElementById("qualityStatus");
  var unlockAllButton = document.getElementById("unlockAllButton");
  var resetProgressButton = document.getElementById("resetProgressButton");
  var closeSettingsButton = document.getElementById("closeSettingsButton");

  var GRID = 8;
  var TYPES = [
    { name: "Ion", color: "#46f4ff", fill: "rgba(70,244,255,0.09)", shape: "circle", scaleDegree: 0 },
    { name: "Prism", color: "#ff4fd8", fill: "rgba(255,79,216,0.085)", shape: "triangle", scaleDegree: 1 },
    { name: "Quark", color: "#8cff6b", fill: "rgba(140,255,107,0.08)", shape: "diamond", scaleDegree: 2 },
    { name: "Pulse", color: "#ffd166", fill: "rgba(255,209,102,0.085)", shape: "square", scaleDegree: 3 },
    { name: "Core", color: "#ff8a3d", fill: "rgba(255,138,61,0.08)", shape: "hex", scaleDegree: 4 },
    { name: "Atom", color: "#7a6bff", fill: "rgba(122,107,255,0.08)", shape: "atom", scaleDegree: 5 }
  ];
  // Single silhouette source for every piece shape, normalized to radius = 1.
  // BOTH the board gems (drawShape / drawAtom, canvas) and the goal-chip icons
  // (buildPieceGlyphSvg, inline SVG) read these exact ratios, so a goal chip can
  // never drift from the gem it names. Ratios are the ones the board draws.
  var PIECE_GLYPH_SHAPES = {
    circle: { kind: "rings", radii: [1, 0.48] },                                     // Ion double-ring
    triangle: { kind: "poly", sides: 3, radius: 1, offset: -Math.PI / 2 },           // Prism up-triangle
    diamond: { kind: "path", points: [[0, -1.18], [0.72, 0], [0, 1.18], [-0.72, 0]] }, // Quark tall vertical rhombus
    square: { kind: "poly", sides: 4, radius: 0.82, offset: Math.PI / 4 },           // Pulse flat-top inset square
    hex: { kind: "poly", sides: 6, radius: 1, offset: Math.PI / 6, dot: 0.16 },      // Core hex + center dot
    atom: { kind: "atom", rx: 1.06, ry: 0.38, nucleus: 0.25 }                        // Atom crossed ellipses
  };
  var PIECE_COLOR_NAMES = ["Cyan", "Pink", "Green", "Gold", "Orange", "Violet"];
  TYPES.forEach(function (type) {
    type.coreColor = mixColor(type.color, "#ffffff", 0.65);
    // Precomputed birth-flash blend steps (t = 0.65 .. 1.0) so drawSingleGem never
    // calls mixColor (hex parsing + string build) per gem per frame during refills.
    type.birthColors = [];
    for (var blendStep = 0; blendStep < 4; blendStep += 1) {
      type.birthColors.push(mixColor(type.color, "#ffffff", 0.65 + 0.35 * (blendStep / 3)));
    }
  });
  // Per-piece voice: each of the 6 colors gets its own instrument (a VOICE_CHARACTERS
  // key) so the player hears the color, not just its pitch. register is an octave offset
  // added to the type's note; filter is the base cutoff the character's filtEnv sweeps
  // from; gain trims per-piece level. Pitch still comes from frequencyForType, so every
  // match/cascade stays pentatonic-consonant on any 16th. Indexed by TYPES id.
  var PIECE_VOICES = [
    { character: "warm",   register: 0, filter: 1400, gain: 0.9 },  // Ion (cyan)    round low pluck
    { character: "stack",  register: 1, filter: 2200, gain: 0.9 },  // Prism (pink)  bright detuned saw
    { character: "pluck",  register: 1, filter: 2600, gain: 0.85 }, // Quark (green) short FM blip
    { character: "hollow", register: 1, filter: 2000, gain: 0.9 },  // Pulse (gold)  PWM reed lead
    { character: "brass",  register: 0, filter: 1800, gain: 0.9 },  // Core (orange) warm FM mid
    { character: "air",    register: 2, filter: 3600, gain: 0.8 }   // Atom (violet) airy sine shimmer high
  ];

  // --- Glyph Creature Spec (GCS v1) validator ---------------------------
  // Pure, engine-agnostic guard for the portable Hum definitions in
  // handoff/creatures.json (the Hugglz-owned IP asset that later splits to
  // gcs-repo in the Godot phase). Enforces the Vector-Native Contract:
  // stroke-primitive bodies reused from TYPES; one primary color plus an
  // optional white accent; all motion as named easing curves keyed to beat
  // indices (never baked frames); voice as scale degrees (never audio
  // files); no bespoke sprite / texture / rig fields. Returns
  // { ok: Boolean, errors: [String] }. Touches no Canvas and renders nothing.
  var GCS_SHAPES = ["circle", "triangle", "diamond", "square", "hex", "atom"];
  var GCS_CURVES = ["linear", "easeInOut", "easeInQuad", "easeOutQuad", "easeInCubic", "easeOutCubic", "easeInBack", "easeOutBack", "easeOutElastic"];
  var GCS_WAVES = ["sine", "square", "triangle", "sawtooth"];
  // Keys that would bind a Hum to a raster, skeletal, or audio asset and
  // break "renders anywhere from a stroke API". Any of these, anywhere in
  // the doc, fails the contract.
  var GCS_FORBIDDEN_KEYS = {
    sprite: 1, spritesheet: 1, image: 1, img: 1, texture: 1, atlas: 1,
    bitmap: 1, png: 1, svg: 1, gif: 1, src: 1, url: 1, href: 1, path: 1,
    frames: 1, keyframes: 1, mesh: 1, rig: 1, skeleton: 1, bone: 1,
    audio: 1, sound: 1, sample: 1, file: 1, asset: 1
  };

  function gcsIsHexColor(value) {
    return typeof value === "string" && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);
  }
  function gcsIsNumber(value) {
    return typeof value === "number" && isFinite(value);
  }
  function gcsIsInt(value) {
    return gcsIsNumber(value) && Math.floor(value) === value;
  }
  function gcsScanForbidden(node, trail, errors) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (var i = 0; i < node.length; i += 1) {
        gcsScanForbidden(node[i], trail + "[" + i + "]", errors);
      }
      return;
    }
    for (var key in node) {
      if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
      var here = trail ? trail + "." + key : key;
      if (GCS_FORBIDDEN_KEYS[key.toLowerCase()]) {
        errors.push("forbidden sprite/asset field '" + here + "'");
      }
      gcsScanForbidden(node[key], here, errors);
    }
  }

  function validateGcs(doc) {
    var errors = [];
    if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
      return { ok: false, errors: ["doc is not an object"] };
    }
    var label = doc.id || doc.name || "?";
    function err(msg) { errors.push(label + ": " + msg); }

    if (doc.gcs !== 1) err("gcs version must be 1");
    if (typeof doc.id !== "string" || !doc.id) err("id must be a non-empty string");
    if (typeof doc.name !== "string" || !doc.name) err("name must be a non-empty string");

    // body: a stroke primitive reused from TYPES, sized in radius units.
    var body = doc.body;
    if (!body || typeof body !== "object") {
      err("body missing");
    } else {
      if (GCS_SHAPES.indexOf(body.shape) === -1) err("body.shape '" + body.shape + "' not in allowed primitives");
      if (!gcsIsNumber(body.radius) || body.radius <= 0) err("body.radius must be a positive number");
      if (!gcsIsNumber(body.stroke) || body.stroke <= 0) err("body.stroke must be a positive number");
    }

    // palette: exactly primary + optional white accent.
    var palette = doc.palette;
    if (!palette || typeof palette !== "object") {
      err("palette missing");
    } else {
      if (!gcsIsHexColor(palette.primary)) err("palette.primary must be a hex color");
      for (var pk in palette) {
        if (!Object.prototype.hasOwnProperty.call(palette, pk)) continue;
        if (pk !== "primary" && pk !== "accent") err("palette has stray key '" + pk + "' (only primary + optional white accent allowed)");
      }
      if (palette.accent != null && String(palette.accent).toLowerCase() !== "#ffffff") {
        err("palette.accent must be white (#ffffff) when present");
      }
    }

    // features: two dot eyes plus optional line-stroke adornments.
    var features = doc.features;
    if (!features || typeof features !== "object") {
      err("features missing");
    } else {
      var eyes = features.eyes;
      if (!eyes || typeof eyes !== "object") {
        err("features.eyes missing");
      } else {
        if (!gcsIsNumber(eyes.x)) err("eyes.x must be a number");
        if (!gcsIsNumber(eyes.y)) err("eyes.y must be a number");
        if (!gcsIsNumber(eyes.r) || eyes.r <= 0) err("eyes.r must be a positive number");
        if (!Array.isArray(eyes.blinkS) || eyes.blinkS.length !== 2 || !gcsIsNumber(eyes.blinkS[0]) || !gcsIsNumber(eyes.blinkS[1]) || eyes.blinkS[0] > eyes.blinkS[1]) {
          err("eyes.blinkS must be [min, max] seconds with min <= max");
        }
      }
      ["antennae", "satellites", "tendrils"].forEach(function (slot) {
        if (!Array.isArray(features[slot])) err("features." + slot + " must be an array");
      });
    }

    // motion: named easing curves keyed to beat indices, no baked frames.
    var motion = doc.motion;
    if (!motion || typeof motion !== "object") {
      err("motion missing");
    } else {
      var bounce = motion.bounce;
      if (!bounce || typeof bounce !== "object") {
        err("motion.bounce missing");
      } else {
        if (!Array.isArray(bounce.beats) || bounce.beats.length === 0) {
          err("bounce.beats must be a non-empty array of beat indices");
        } else {
          for (var b = 0; b < bounce.beats.length; b += 1) {
            if (!gcsIsInt(bounce.beats[b]) || bounce.beats[b] < 0 || bounce.beats[b] > 15) {
              err("bounce.beats[" + b + "] must be an integer 16th step in 0..15");
            }
          }
        }
        if (GCS_CURVES.indexOf(bounce.curve) === -1) err("bounce.curve '" + bounce.curve + "' is not a named easing");
        if (!gcsIsNumber(bounce.amp)) err("bounce.amp must be a number");
      }
      if (!gcsIsNumber(motion.squash) || motion.squash < 0) err("motion.squash must be a non-negative number");
      var breath = motion.breath;
      if (!breath || typeof breath !== "object" || !gcsIsNumber(breath.amp) || !gcsIsNumber(breath.hz)) {
        err("motion.breath must have numeric amp and hz");
      }
      if (!gcsIsNumber(motion.trail) || motion.trail < 0 || motion.trail > 1) err("motion.trail must be a number in 0..1");
    }

    // voice: scale degrees + named oscillator + base frequency, no audio.
    var voice = doc.voice;
    if (!voice || typeof voice !== "object") {
      err("voice missing");
    } else {
      var motif = voice.motif;
      if (!motif || typeof motif !== "object") {
        err("voice.motif missing");
      } else {
        var degLen = -1;
        if (!Array.isArray(motif.deg) || motif.deg.length === 0) {
          err("voice.motif.deg must be a non-empty array of scale degrees");
        } else {
          degLen = motif.deg.length;
          for (var d = 0; d < motif.deg.length; d += 1) {
            if (!gcsIsInt(motif.deg[d])) err("voice.motif.deg[" + d + "] must be an integer scale degree");
          }
        }
        if (!Array.isArray(motif.dur) || motif.dur.length !== degLen) {
          err("voice.motif.dur must be an array matching deg length");
        }
      }
      if (GCS_WAVES.indexOf(voice.wave) === -1) err("voice.wave '" + voice.wave + "' is not a named oscillator");
      if (!gcsIsNumber(voice.base) || voice.base <= 0) err("voice.base must be a positive frequency");
    }

    if (!Array.isArray(doc.personality)) {
      err("personality must be an array");
    } else {
      for (var p = 0; p < doc.personality.length; p += 1) {
        if (typeof doc.personality[p] !== "string") err("personality[" + p + "] must be a string");
      }
    }

    gcsScanForbidden(doc, "", errors);

    return { ok: errors.length === 0, errors: errors };
  }

  // Fetch the portable spec, keep every Hum that passes the Vector-Native
  // Contract, and (in debug) log a one-line validation summary. Loaded in
  // production too so the recording-drops ritual and the track-screen sleeping
  // Hum can render; failures degrade silently to no Hum art.
  var creatureSpecs = []; // valid GCS docs from creatures.json, indexed by track
  var HUM_SEGMENTS = 15;  // outline strokes per Hum; one recorded per campaign level
  var HUM_FIRST_WAKE_LEVEL = 4; // fresh saves wake the very first Hum on this clear (not the L15 Finale) so the collection's payoff lands in the first minutes; cosmetic only
  // Canonical Hum ids in track (episode) order. Stable GCS ids owned by Hugglz,
  // so they drive the save key and the per-track lookup without depending on the
  // async load order. Note the chrome-lattice theme id maps to hum-chrome-strings.
  var HUM_IDS = [
    "hum-ion-gate", "hum-prism-wake", "hum-quark-relay", "hum-pulse-foundry",
    "hum-core-spiral", "hum-atom-choir", "hum-shield-mirror", "hum-nova-yard",
    "hum-vector-drift", "hum-signal-reef", "hum-chrome-strings", "hum-solar-static",
    "hum-dark-circuit", "hum-gravity-bloom", "hum-overdrive-arc", "hum-final-harmonic"
  ];
  function getHumIdForLevel(level) {
    var episode = Math.max(1, Math.floor((level && level.episode) || 1));
    return HUM_IDS[(episode - 1) % HUM_IDS.length];
  }
  function getHumIdForEpisode(episode) {
    return HUM_IDS[(Math.max(1, Math.floor(episode || 1)) - 1) % HUM_IDS.length];
  }
  function findHumSpec(humId) {
    for (var i = 0; i < creatureSpecs.length; i += 1) {
      if (creatureSpecs[i] && creatureSpecs[i].id === humId) return creatureSpecs[i];
    }
    return null;
  }
  function loadCreatureSpecs() {
    if (typeof fetch !== "function") return;
    fetch("handoff/creatures.json", { cache: "no-store" }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).then(function (data) {
      var docs = Array.isArray(data) ? data : (data && data.hums) || [];
      creatureSpecs = docs.filter(function (d) { return validateGcs(d).ok; });
      if (DEBUG && window.console && console.log) {
        var failures = [];
        for (var i = 0; i < docs.length; i += 1) {
          var report = validateGcs(docs[i]);
          if (!report.ok) failures.push({ id: docs[i] && docs[i].id, errors: report.errors });
        }
        console.log("[GCS] validated " + docs.length + " Hums, " + (docs.length - failures.length) + " ok, " + failures.length + " failed");
        if (failures.length && console.warn) console.warn("[GCS] contract failures", failures);
      }
      redrawTracklistHums(); // paint sleeping Hums once the specs arrive
    }).catch(function (e) {
      if (DEBUG && window.console && console.warn) console.warn("[GCS] could not load handoff/creatures.json", e && e.message);
    });
  }

  var GAME_TITLE = "STRING";
  var GAME_CODE_PREFIX = "STR";

  var SCALE = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22];
  var BASE_FREQ = 130.81;
  var PENT_MAJ = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
  var PENT_MIN = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22];
  var PENT_SUS = [0, 2, 5, 7, 10, 12, 14, 17, 19, 22];
  var PENT_RIT = [0, 2, 5, 7, 9, 12, 14, 17, 19, 21];
  var PENT_MAN = [0, 3, 5, 8, 10, 12, 15, 17, 20, 22];
  var GROOVES = {
    four: {
      kick: [0],
      kickHi: [8],
      snare: [8],
      hat: [2, 6, 10, 14],
      bass: [[0, 0, 1], [8, 0, 1], [11, 2, 1]],
      swing: 0
    },
    floor4: {
      kick: [0, 4, 8, 12],
      snare: [4, 12],
      hat: [2, 6, 10, 14],
      bass: [[0, 0, 1], [4, 0, 1], [8, 0, 1], [11, 2, 1], [12, 0, 1]],
      swing: 0
    },
    drive: {
      kick: [0, 8],
      kickHi: [10],
      snare: [4, 12],
      hat: [0, 2, 4, 6, 8, 10, 12, 14],
      bass: [[0, 0, 1], [3, 3, 1], [8, 4, 1], [11, 3, 1]],
      swing: 0
    },
    "break": {
      kick: [0, 10],
      kickHi: [7],
      snare: [4, 12],
      hat: [2, 5, 8, 11, 14],
      bass: [[0, 0, 1], [3, 0, 2], [6, 0, 1], [10, 0, 1], [14, 2, 1]],
      swing: 0
    },
    half: {
      kick: [0],
      snare: [8],
      hat: [4, 12],
      bass: [[0, 0, 1], [8, 3, 1]],
      swing: 0
    }
  };
  // Genre drum feel (music genres seq 1). kick/snare/hat/kickHi placement in 16th
  // steps. The sector palette keeps its own bass line and key; the genre only reskins
  // the drum feel. Read by getActiveGroove (later item); electronic uses palette.groove
  // and never touches this table.
  var GENRE_DRUMS = {
    backbeat: { kick: [0, 4, 8, 12], snare: [4, 12], hat: [2, 6, 10, 14], kickHi: [10] }, // pop: four-on-floor + hard backbeat
    swing:    { kick: [0, 8],        snare: [4, 12], hat: [2, 5, 8, 11, 14], kickHi: null }, // jazz: ride-ish, kick on 1 and 3
    drag:     { kick: [0, 10],       snare: [8],     hat: [4, 12], kickHi: null }            // trip-hop: sparse, snare on 3, half-time base
  };
  // Genre bundles (music genres seq 1). A genre is applied ON TOP of whichever of the 16
  // sector palettes is active: it reskins harmonic richness, drum feel, instrument family,
  // and density while the palette keeps key/mode/root/progression/mood. Electronic is the
  // identity element: every field null/false, so getGenre-aware call sites return today's
  // exact behavior until a non-electronic genre opts them in. Read only through getGenre().
  var GENRES = {
    electronic: {
      id: "electronic", label: "Electronic",
      drums: null, swing: null, swingMax: null, forceHalfTime: false, snareDragMs: 0,
      chordDegrees: null, chordColor: null, preferBrightScale: false, bassMode: null, drumKit: null,
      filterScale: 1, vinylNoiseGain: 0, leadVoice: null, padVoice: null, bassVoice: null,
      pieceTrim: 1, gateShift: 0, floorBonus: 0, energyCap: 1, extraLayer: null
    },
    pop: {
      id: "pop", label: "Pop",
      drums: "backbeat", swing: 0.08, swingMax: 0.14, forceHalfTime: false, snareDragMs: 0,
      chordDegrees: { low: [0, 2, 3, 4], high: [0, 2, 3, 4, 6] }, // full major-6 / 6-9: root+3rd+5th(deg3)+6th, +9th(deg6) on top. The 5th anchors it unambiguously major (vs the rootless [0,2,4]=6-no-5), the most consonant/radio stack; all pentatonic offsets, so in-key on any 16th
      chordColor: null, preferBrightScale: true, bassMode: "root", drumKit: "clean",
      filterScale: 1.12, vinylNoiseGain: 0, leadVoice: "warm", padVoice: "air", bassVoice: "sub",
      pieceTrim: 1, gateShift: -0.1, floorBonus: 0.06, energyCap: 1, extraLayer: "topline"
    },
    jazzy: {
      // Tuned electric-jazz/lounge (music genres seq 7), the richest preset: 6/9 stacks + a
      // guarded b7/9 rhodes color (the real extended sound), a walking bass approaching each
      // chord root, a triplet-leaning swing shuffle with a laid-back snare drag, brush/ride kit,
      // rhodes lead/comp over a warm pad, a warm 0.95 filter, and a 0.9 energy cap so it stays
      // cool. Stylized electric jazz over a synth trio, not acoustic bebop (see spec 8).
      id: "jazzy", label: "Jazzy",
      drums: "swing", swing: 0.42, swingMax: 0.5, forceHalfTime: false, snareDragMs: 6,
      chordDegrees: { low: [0, 2, 4, 6], high: [0, 2, 4, 6, 8] }, // rootless 6/9 (low) -> add-9/11 (high), all in-scale. DELIBERATELY omits the 5th (deg 3) that pop adds: the open, 5th-less stack is the electric-jazz color, not a grounded major triad. deg 6 = the 9th, deg 8 = the 11th/12th
      chordColor: [10, 14], preferBrightScale: false, bassMode: "walking", drumKit: "brush", // chordColor +10=b7 / +14=9 fire ONLY on the sustained rhodes comp in playPadChord, guarded against a min2 clash, never on bass/fast leads
      filterScale: 0.95, vinylNoiseGain: 0, leadVoice: "rhodes", padVoice: "warm", bassVoice: "sub",
      pieceTrim: 0.92, gateShift: 0, floorBonus: 0.02, energyCap: 0.9, extraLayer: "comp" // medium density; the 0.9 cap holds the whole mix cool even at climax, the extraLayer is the rhodes offbeat comp behind the head
    },
    triphop: {
      // Tuned trip-hop (music genres seq 8), the sparsest/darkest preset. Consumes the reused
      // shipped half-time path so 124 FEELS ~62 (campaign only; Rush/Daily fall back to
      // straight-but-dark per the audio locks). Sparse dyad/triad voicings on the sector's dark
      // scale (no bright lift), the drag sparse kit (snare on 3, heavy 14ms drag), a gentle 0.2
      // swing, dark hollow/sub voices pulled down by the 0.68 filter, the dusty rounded boom-bap
      // kit, the continuous vinyl crackle bed, and the sparsest arrangement (+0.12 gate, -0.04
      // floor, 0.72 cap so it stays laid-back even at climax). The existing delay/feedback bus
      // supplies the reverb-drenched tail. Bed gain lifted 0.012 -> 0.014 to hold its continuous
      // surface-noise presence after warming vinylNoiseCutoff 3600 -> 3000 (see AUDIO_TUNING); the
      // warmer band tucks the un-scaled bed under the dark mix as dust, not hiss.
      id: "triphop", label: "Trip-Hop",
      drums: "drag", swing: 0.2, swingMax: 0.28, forceHalfTime: true, snareDragMs: 14, // forced half-time is the spine; the drag pattern itself only surfaces in Rush/Daily since campaign's GROOVES.half override owns kick/snare placement, while the dusty timbre + 14ms drag + 0.2 swing still apply over it
      chordDegrees: { low: [0, 2], high: [0, 2, 4] }, // sparse root+4th dyad / quartal root-4-b7 triad on a minor-pentatonic sector; space IS the genre, so no fill and no bright lift
      chordColor: null, preferBrightScale: false, bassMode: "root", drumKit: "dusty",
      filterScale: 0.68, vinylNoiseGain: 0.005, leadVoice: "hollow", padVoice: "sub", bassVoice: "sub", // hollow lead over sub pad + sub bass, all pulled dark by the 0.68 global filter. vinylNoiseGain cut 0.014 -> 0.005 (now a lowpassed dark bed, not bright static) per Jung's "static noise not pleasant" 2026-07-06
      pieceTrim: 0.9, gateShift: 0.12, floorBonus: -0.04, energyCap: 0.72, extraLayer: null
    }
  };
  // Voice-character synthesis table (seq 4). The shared richer-oscillator layer that
  // playBurst/addLayer/specials (seq 5-7) opt into via playTone's trailing `voice` arg.
  // A voice=null note keeps the shipped single-oscillator path untouched. Each character
  // picks a synthesis type and the DSP knobs the builder reads:
  //   type   : single | stack | pwm | fm
  //   wave   : oscillator wave (falls back to playTone's wave arg when unset)
  //   detune : stack spread in cents, +/- around center (clamped to voiceStackDetuneMax)
  //   sub    : stack sub-oscillator amount (-12 st sine), gain = voiceSubMix * sub
  //   duty   : pwm pulse duty cycle (0-1); a PeriodicWave is cached per duty at graph init
  //   motion : truthy connects the shared pwm/stack chorus LFO to detune
  //   ratio  : fm modulator freq multiplier (integer for sustaining voices = harmonic sidebands)
  //   index  : fm modulation index, peak deviation = carrier*ratio*index (capped voiceFmIndexMax)
  //   fmDecay: fm index-envelope decay in seconds (falls back to voiceFmDecayDefault)
  //   shimmer: adds one low-gain sine partial N harmonics up (air; 3 = an octave+fifth)
  //   filtEnv: reuses the seq 3 filter envelope; true = defaults, object = per-voice override
  var VOICE_CHARACTERS = {
    single: { type: "single", wave: "triangle", filtEnv: true },
    warm:   { type: "stack",  wave: "triangle", detune: 7,  sub: 0.35, filtEnv: { octaves: 1.6, decay: 0.16 } },
    stack:  { type: "stack",  wave: "sawtooth", detune: 14, sub: 0,    filtEnv: { octaves: 2.4, decay: 0.10 } },
    hollow: { type: "pwm",    duty: 0.22,       motion: 6,             filtEnv: { octaves: 2.0, decay: 0.12 } },
    glass:  { type: "single", wave: "square",   filtEnv: { octaves: 2.8, decay: 0.06 } },
    bell:   { type: "fm",     ratio: 2, index: 3, fmDecay: 0.09,       filtEnv: { octaves: 1.2, decay: 0.20 } },
    brass:  { type: "fm",     ratio: 1, index: 5, fmDecay: 0.12,       filtEnv: { octaves: 2.2, decay: 0.14 } },
    pluck:  { type: "fm",     ratio: 3, index: 4, fmDecay: 0.05,       filtEnv: { octaves: 3.0, decay: 0.05 } },
    sub:    { type: "stack",  wave: "triangle", detune: 4,  sub: 0.6,  filtEnv: { octaves: 1.0, decay: 0.22 } },
    air:    { type: "single", wave: "sine",     shimmer: 3,            filtEnv: { octaves: 1.4, decay: 0.30 } },
    nova:   { type: "stack",  wave: "sawtooth", detune: 16, sub: 0.2,  filtEnv: { octaves: 2.6, decay: 0.10 } },
    // FM electric piano (Rhodes) for the jazz genre (music genres seq 2): the sustained
    // comp/pad voice that carries the 6/9 stacks and the guarded b7/9 color tones. A soft
    // ratio-1 FM bell with a slow filter bloom = the DX7-style tine sound, no samples.
    rhodes: { type: "fm",     ratio: 1, index: 2.4, fmDecay: 0.20, wave: "sine", filtEnv: { octaves: 1.4, decay: 0.28 } }
  };
  var MUSIC_PALETTES = [
    {
      id: "neon",
      // Per-palette timbre profile (Music Variety item 4): lead/pad/bass each pick a
      // VOICE_CHARACTERS key so every sector reads as a distinct instrument, not just a
      // re-keyed flat tone. Read at playBurst chord/lead, playPadChord, the scheduleStep
      // bass branch + bass one-shots, and the motif-layer render. Piece voices (item 2)
      // still win on match events; these color the groove bed the player swaps over.
      leadVoice: "stack", padVoice: "warm", bassVoice: "sub",
      label: "Neon Noir",
      // Track hook (prime motif): scale-degree offsets + note lengths in 16th steps; sum(dur) divides 32.
      motif: { deg: [0, 3, 2, 5, 3, 2, 0], dur: [2, 2, 2, 2, 2, 2, 4], register: 1 },
      base: 130.81,
      scale: [0, 3, 5, 7, 10, 12, 15, 17, 19, 22],
      pad: [0, 7, 10, 15],
      progression: [0, 3, 4, 2],
      bassRatio: 0.5,
      subRatio: 0.25,
      leadWave: "square",
      layerWave: "triangle",
      bassWave: "sawtooth",
      padWave: "triangle",
      delayBase: 0.14,
      delayDrive: 0.16,
      feedbackBase: 0.18,
      feedbackDrive: 0.14,
      groove: {
        kick: [0, 4, 8, 12],
        snare: [4, 12],
        hat: [2, 6, 10, 14],
        bass: [[0, 0, 1], [4, 0, 1], [8, 0, 1], [11, 2, 1], [12, 0, 1]],
        swing: 0
      }
    },
    {
      id: "pulse",
      leadVoice: "warm", padVoice: "air", bassVoice: "sub",
      label: "Pulse Lift",
      motif: { deg: [0, 2, 4, 5, 4, 2], dur: [2, 2, 2, 4, 2, 4], register: 1 },
      base: 146.83,
      scale: [0, 2, 4, 7, 9, 12, 14, 16, 19, 21],
      pad: [0, 7, 9, 16],
      progression: [0, 3, 4, 2],
      bassRatio: 0.5,
      subRatio: 0.25,
      leadWave: "triangle",
      layerWave: "sine",
      bassWave: "sawtooth",
      padWave: "sine",
      delayBase: 0.18,
      delayDrive: 0.18,
      feedbackBase: 0.2,
      feedbackDrive: 0.16,
      groove: {
        kick: [0, 4, 8, 12],
        snare: [4, 12],
        hat: [2, 6, 10, 14, 15],
        bass: [[0, 0, 1], [3, 0, 2], [6, 0, 1], [8, 0, 1], [11, 0, 2], [14, 2, 1]],
        swing: 0.12
      }
    },
    {
      id: "arc",
      leadVoice: "hollow", padVoice: "glass", bassVoice: "sub",
      label: "Arc Grid",
      motif: { deg: [0, 1, 3, 1, 4, 3, 1, 0], dur: [2, 2, 2, 2, 2, 2, 2, 2], register: 1 },
      base: 123.47,
      scale: [0, 2, 5, 7, 10, 12, 14, 17, 19, 22],
      pad: [0, 7, 10, 14],
      progression: [0, 2, 3, 4],
      bassRatio: 0.375,
      subRatio: 0.1875,
      leadWave: "square",
      layerWave: "square",
      bassWave: "sawtooth",
      padWave: "triangle",
      delayBase: 0.12,
      delayDrive: 0.12,
      feedbackBase: 0.16,
      feedbackDrive: 0.12,
      groove: {
        kick: [0, 6, 10],
        snare: [4, 12],
        hat: [1, 3, 5, 7, 9, 11, 13, 15],
        bass: [[0, 0, 1], [3, 3, 1], [8, 4, 1], [11, 3, 1]],
        swing: 0.05
      }
    },
    {
      id: "foundry",
      leadVoice: "brass", padVoice: "warm", bassVoice: "sub",
      label: "Foundry Stomp",
      motif: { deg: [0, 0, 3, 0, 5, 3], dur: [2, 2, 4, 2, 2, 4], register: 1 },
      base: 110.00,
      scale: PENT_MAN,
      progression: [0, 4, 3, 2],
      bassRatio: 0.5,
      subRatio: 0.25,
      leadWave: "sawtooth",
      layerWave: "square",
      bassWave: "square",
      padWave: "triangle",
      delayBase: 0.1,
      delayDrive: 0.12,
      feedbackBase: 0.14,
      feedbackDrive: 0.1,
      delaySteps: 2,
      bpmOffset: 2,
      groove: GROOVES["break"]
    },
    {
      id: "spiral",
      leadVoice: "brass", padVoice: "warm", bassVoice: "sub",
      label: "Red Spiral",
      motif: { deg: [0, 4, 3, 5, 4, 7], dur: [2, 2, 2, 2, 4, 4], register: 1 },
      base: 164.81,
      scale: PENT_MIN,
      progression: [0, 2, 4, 3],
      bassRatio: 0.5,
      subRatio: 0.25,
      leadWave: "square",
      layerWave: "triangle",
      bassWave: "sawtooth",
      padWave: "triangle",
      delayBase: 0.11,
      delayDrive: 0.14,
      feedbackBase: 0.15,
      feedbackDrive: 0.12,
      delaySteps: 2,
      bpmOffset: 3,
      groove: GROOVES.drive
    },
    {
      id: "choir",
      leadVoice: "air", padVoice: "air", bassVoice: "warm",
      label: "Atom Choir",
      motif: { deg: [0, 2, 3, 5, 3, 2], dur: [4, 2, 2, 4, 2, 2], register: 2 },
      base: 138.59,
      scale: PENT_RIT,
      progression: [0, 3, 2, 4],
      bassRatio: 0.5,
      subRatio: 0.25,
      leadWave: "sine",
      layerWave: "sine",
      bassWave: "triangle",
      padWave: "sine",
      delayBase: 0.22,
      delayDrive: 0.16,
      feedbackBase: 0.26,
      feedbackDrive: 0.14,
      delaySteps: 6,
      bpmOffset: 0,
      groove: GROOVES.half
    },
    {
      id: "mirror",
      leadVoice: "glass", padVoice: "glass", bassVoice: "sub",
      label: "Glass Edge",
      motif: { deg: [0, 5, 1, 5, 2, 5, 1], dur: [2, 2, 2, 2, 2, 2, 4], register: 1 },
      base: 174.61,
      scale: PENT_SUS,
      progression: [0, 4, 2, 3],
      bassRatio: 0.375,
      subRatio: 0.1875,
      leadWave: "square",
      layerWave: "square",
      bassWave: "sawtooth",
      padWave: "sine",
      delayBase: 0.1,
      delayDrive: 0.1,
      feedbackBase: 0.12,
      feedbackDrive: 0.08,
      delaySteps: 2,
      bpmOffset: 2,
      groove: GROOVES.four
    },
    {
      id: "nova",
      leadVoice: "stack", padVoice: "air", bassVoice: "sub",
      label: "Nova Bloom",
      motif: { deg: [0, 2, 4, 7, 5, 4, 2], dur: [2, 2, 2, 4, 2, 2, 2], register: 1 },
      base: 155.56,
      scale: PENT_MAJ,
      progression: [0, 2, 3, 5],
      bassRatio: 0.5,
      subRatio: 0.25,
      leadWave: "sawtooth",
      layerWave: "triangle",
      bassWave: "sawtooth",
      padWave: "triangle",
      delayBase: 0.16,
      delayDrive: 0.2,
      feedbackBase: 0.2,
      feedbackDrive: 0.18,
      delaySteps: 3,
      bpmOffset: 3,
      groove: GROOVES.floor4
    },
    {
      id: "drift",
      leadVoice: "hollow", padVoice: "warm", bassVoice: "sub",
      label: "Side Current",
      motif: { deg: [0, 3, 1, 4, 2, 5], dur: [2, 4, 2, 4, 2, 2], register: 1 },
      base: 110.00,
      scale: PENT_SUS,
      progression: [0, 3, 4, 2],
      bassRatio: 0.375,
      subRatio: 0.1875,
      leadWave: "triangle",
      layerWave: "sine",
      bassWave: "sawtooth",
      padWave: "triangle",
      delayBase: 0.15,
      delayDrive: 0.14,
      feedbackBase: 0.19,
      feedbackDrive: 0.12,
      delaySteps: 3,
      bpmOffset: 2,
      groove: {
        kick: GROOVES["break"].kick,
        kickHi: GROOVES["break"].kickHi,
        snare: GROOVES["break"].snare,
        hat: GROOVES["break"].hat,
        bass: GROOVES["break"].bass,
        swing: 0.12
      }
    },
    {
      id: "reef",
      leadVoice: "air", padVoice: "air", bassVoice: "warm",
      label: "Liquid Signal",
      motif: { deg: [0, 2, 5, 4, 2, 0], dur: [4, 2, 2, 2, 2, 4], register: 2 },
      base: 130.81,
      scale: PENT_RIT,
      progression: [0, 2, 4, 2],
      bassRatio: 0.5,
      subRatio: 0.25,
      leadWave: "sine",
      layerWave: "triangle",
      bassWave: "triangle",
      padWave: "sine",
      delayBase: 0.2,
      delayDrive: 0.18,
      feedbackBase: 0.24,
      feedbackDrive: 0.16,
      delaySteps: 4,
      bpmOffset: 1,
      groove: {
        kick: GROOVES.half.kick,
        snare: GROOVES.half.snare,
        hat: GROOVES.half.hat,
        bass: GROOVES.half.bass,
        swing: 0.06
      }
    },
    {
      id: "chrome",
      leadVoice: "glass", padVoice: "glass", bassVoice: "sub",
      label: "Chrome Cut",
      motif: { deg: [0, 4, 0, 5, 0, 4, 3, 0], dur: [2, 2, 2, 2, 2, 2, 2, 2], register: 1 },
      base: 146.83,
      scale: PENT_MIN,
      progression: [0, 2, 3, 4],
      bassRatio: 0.5,
      subRatio: 0.25,
      leadWave: "square",
      layerWave: "square",
      bassWave: "sawtooth",
      padWave: "triangle",
      delayBase: 0.08,
      delayDrive: 0.1,
      feedbackBase: 0.1,
      feedbackDrive: 0.08,
      delaySteps: 2,
      bpmOffset: 4,
      groove: GROOVES.drive
    },
    {
      id: "solar",
      leadVoice: "brass", padVoice: "air", bassVoice: "sub",
      label: "Hot Bloom",
      motif: { deg: [0, 3, 5, 7, 5, 3], dur: [2, 2, 4, 4, 2, 2], register: 1 },
      base: 164.81,
      scale: PENT_MAJ,
      progression: [0, 3, 4, 5],
      bassRatio: 0.5,
      subRatio: 0.25,
      leadWave: "sawtooth",
      layerWave: "triangle",
      bassWave: "sawtooth",
      padWave: "triangle",
      delayBase: 0.17,
      delayDrive: 0.2,
      feedbackBase: 0.2,
      feedbackDrive: 0.16,
      delaySteps: 3,
      bpmOffset: 4,
      groove: GROOVES.floor4
    },
    {
      id: "circuit",
      leadVoice: "hollow", padVoice: "sub", bassVoice: "sub",
      label: "Low Pressure",
      motif: { deg: [0, 1, 0, 2, 1, 0], dur: [4, 2, 4, 2, 2, 2], register: 1 },
      base: 116.54,
      scale: PENT_MAN,
      progression: [0, 2, 1, 3],
      bassRatio: 0.375,
      subRatio: 0.1875,
      leadWave: "triangle",
      layerWave: "sine",
      bassWave: "sine",
      padWave: "sine",
      delayBase: 0.16,
      delayDrive: 0.1,
      feedbackBase: 0.22,
      feedbackDrive: 0.1,
      delaySteps: 4,
      bpmOffset: 0,
      groove: GROOVES.half
    },
    {
      id: "bloom",
      leadVoice: "bell", padVoice: "air", bassVoice: "sub",
      label: "Cascade Bloom",
      motif: { deg: [0, 2, 3, 5, 7, 5, 3], dur: [2, 2, 2, 2, 4, 2, 2], register: 1 },
      base: 138.59,
      scale: PENT_MIN,
      progression: [0, 3, 5, 4],
      bassRatio: 0.5,
      subRatio: 0.25,
      leadWave: "triangle",
      layerWave: "sine",
      bassWave: "sawtooth",
      padWave: "triangle",
      delayBase: 0.19,
      delayDrive: 0.2,
      feedbackBase: 0.24,
      feedbackDrive: 0.18,
      delaySteps: 4,
      bpmOffset: 3,
      groove: GROOVES["break"]
    },
    {
      id: "overdrive",
      leadVoice: "stack", padVoice: "glass", bassVoice: "sub",
      label: "Peak Drive",
      motif: { deg: [0, 4, 5, 4, 7, 5, 4, 2], dur: [2, 2, 2, 2, 2, 2, 2, 2], register: 1 },
      base: 155.56,
      scale: PENT_SUS,
      progression: [0, 2, 4, 3],
      bassRatio: 0.5,
      subRatio: 0.25,
      leadWave: "square",
      layerWave: "square",
      bassWave: "sawtooth",
      padWave: "triangle",
      delayBase: 0.1,
      delayDrive: 0.14,
      feedbackBase: 0.13,
      feedbackDrive: 0.12,
      delaySteps: 2,
      bpmOffset: 6,
      groove: GROOVES.drive
    },
    {
      id: "harmonic",
      leadVoice: "brass", padVoice: "air", bassVoice: "sub",
      label: "Full Spectrum",
      motif: { deg: [0, 2, 4, 5, 7, 5, 4, 2], dur: [2, 2, 2, 2, 2, 2, 2, 2], register: 1 },
      base: 174.61,
      scale: PENT_MAJ,
      progression: [0, 2, 3, 4, 5, 4, 3, 2],
      bassRatio: 0.5,
      subRatio: 0.25,
      leadWave: "sawtooth",
      layerWave: "triangle",
      bassWave: "sawtooth",
      padWave: "sine",
      delayBase: 0.18,
      delayDrive: 0.2,
      feedbackBase: 0.22,
      feedbackDrive: 0.16,
      delaySteps: 3,
      bpmOffset: 4,
      groove: GROOVES.floor4
    }
  ];
  var EPISODE_THEMES = [
    { id: "ion-gate", name: "Ion Gate", tag: "Clean arcs", hook: "First spark field", palette: "neon" },
    { id: "prism-wake", name: "Prism Wake", tag: "Bright lift", hook: "Candy-color lasers", palette: "pulse" },
    { id: "quark-relay", name: "Quark Relay", tag: "Tight sync", hook: "Fast green chains", palette: "arc" },
    { id: "pulse-foundry", name: "Pulse Foundry", tag: "Hard bounce", hook: "Yellow engine room", palette: "foundry" },
    { id: "core-spiral", name: "Core Spiral", tag: "Redline runs", hook: "Overdrive training", palette: "spiral" },
    { id: "atom-choir", name: "Atom Choir", tag: "Wide pads", hook: "Layered harmonic bursts", palette: "choir" },
    { id: "shield-mirror", name: "Shield Mirror", tag: "Crack the grid", hook: "Shield-cell sweeps", palette: "mirror" },
    { id: "nova-yard", name: "Nova Yard", tag: "Bomb craft", hook: "Special-piece fireworks", palette: "nova" },
    { id: "vector-drift", name: "Vector Drift", tag: "Sideways rhythm", hook: "Diagonal cascade traps", palette: "drift" },
    { id: "signal-reef", name: "Signal Reef", tag: "Liquid neon", hook: "Soft pads, hard hits", palette: "reef" },
    { id: "chrome-lattice", name: "Chrome Strings", tag: "Sharp beams", hook: "Precision chain scoring", palette: "chrome" },
    { id: "solar-static", name: "Solar Static", tag: "Hot bloom", hook: "Score pushes and flare goals", palette: "solar" },
    { id: "dark-circuit", name: "Dark Circuit", tag: "Low pressure", hook: "Tense move economy", palette: "circuit" },
    { id: "gravity-bloom", name: "Gravity Bloom", tag: "Big cascades", hook: "Stacked chain finales", palette: "bloom" },
    { id: "overdrive-arc", name: "Overdrive Arc", tag: "Peak drive", hook: "Drive mastery", palette: "overdrive" },
    { id: "final-harmonic", name: "Final Harmonic", tag: "Full spectrum", hook: "Everything fires at once", palette: "harmonic" }
  ];
  var BPM = 124;
  var TIMING = {
    swapCheck: 74,
    reject: 120,
    clear: 58,
    drop: 158,
    hitStopFusion: 110,
    hitStopNova: 45,
    hitStopNovaSweep: 100
  };
  var AUDIO_TUNING = {
    macroFloorHz: 3200, // macro lowpass cutoff at zero intensity (Hz, 800-6000)
    macroCeilHz: 14000, // macro lowpass cutoff at full intensity (Hz, 8000-18000)
    macroEnergyWeight: 0.55, // how much board energy pushes the macro open (0-1)
    macroDriveWeight: 0.45, // how much visual drive pushes the macro open (0-1)
    macroOverdriveBoost: 0.25, // flat intensity bonus while overdrive is live (0-0.5)
    macroCurve: 1.4, // intensity response curve; >1 keeps the low end darker longer (0.5-3)
    macroGlide: 0.2, // setTargetAtTime smoothing for cutoff moves (seconds, 0.05-0.6)
    duckDepth: 0.35, // fraction of music gain removed at full duck (0-0.8)
    duckAttack: 0.012, // ramp down time into the duck (seconds, 0.005-0.05)
    duckHold: 0.07, // time held at the ducked level (seconds, 0.02-0.2)
    duckRelease: 0.22, // setTargetAtTime constant for recovery to full (seconds, 0.08-0.5)
    duckSmallScale: 0.6, // duck scale for smaller hits like line specials (0-1)
    kickSubGain: 0.18, // sub sine layer peak gain per unit amount (0-0.3)
    kickKnockGain: 0.07, // mid triangle knock layer peak gain; carries the beat on phone speakers (0-0.15)
    kickKnockHz: 190, // knock layer start frequency, drops an octave over 30ms (Hz, 120-320)
    kickClickGain: 0.05, // attack click noise gain for transient definition (0-0.1)
    kickClickHz: 3200, // attack click bandpass center (Hz, 2000-6000)
    defaultDelaySteps: 3, // echo delay length in 16th steps when a palette sets no delaySteps; 3 = dotted eighth (1-6)
    delayGlide: 0.05, // setTargetAtTime smoothing when delay retunes to a new BPM (seconds, 0.02-0.2)
    heroSnapSteps: 2, // hero stingers snap to this many 16th steps (1-4)
    stingSnapSteps: 2, // level-win sting snaps to this many 16th steps (1-4)
    snapMaxWait: 0.3, // if a multi-step snap would wait longer than this, fall back to next 16th (seconds, 0.1-0.5)
    tickGain: 0.028, // immediate touch tick gain fired before quantized hero hits (0-0.06)
    novaSweepChordGain: 0.05, // solo nova sweep hero chord per-note gain (0-0.08)
    novaSweepChordSpread: 0.035, // seconds between nova sweep hero chord note onsets (0-0.08)
    goalBlipGain: 0.05, // goal-complete in-key blip gain per note; rides the hero snap grid (0-0.09)
    goalBlipDur: 0.16, // goal-complete blip note length (seconds, 0.06-0.32)
    goalBlipSpread: 0.05, // seconds between the goal-complete blip's two notes (0-0.09)
    armBlipGain: 0.036, // armed-special confirm blip gain per note; rides the hero snap grid, teaches "tap again to fire" (0-0.07)
    armBlipDur: 0.13, // armed-special confirm blip note length (seconds, 0.06-0.28)
    armBlipSpread: 0.052, // seconds between the arm blip's two ascending notes (0-0.09)
    layerCueGain: 0.03, // music-layer-enter confirm blip gain per note; rides the hero snap grid, cues a new voice joining (0-0.06)
    layerCueDur: 0.14, // music-layer-enter blip note length (seconds, 0.06-0.28)
    layerCueSpread: 0.045, // seconds between the layer-enter blip's two rising notes (0-0.09)
    humWakeSnapSteps: 2, // Hum "born from light" wake chord snaps to this many 16th steps (1-4)
    humWakeChordGain: 0.052, // Hum-wake chord gain per note; rides the hero-snap grid, in-key so it stays consonant (0-0.09)
    humWakeChordDur: 0.34, // Hum-wake chord note length (seconds, 0.12-0.6)
    humWakeChordSpread: 0.06, // seconds between the wake chord's rising notes (0-0.12)
    overdriveEndGain: 0.05, // overdrive cool-down cue per-note gain; a soft release, not a hit (0-0.09)
    overdriveEndSpread: 0.06, // seconds between the overdrive cool-down's two descending notes (0-0.12)
    overdriveEndDur: 0.2, // overdrive cool-down note length (seconds, 0.1-0.4)
    gateSnapSteps: 1, // beat-gate toggle SFX snaps to this many 16th steps (1-4)
    gateToneGain: 0.032, // beat-gate toggle tone gain (0-0.06)
    gateNoiseGain: 0.045, // beat-gate shutter noise gain on close (0-0.09)
    signalSnapSteps: 1, // signal packet launch + chirp snap to this many 16th steps (1-4)
    signalToneGain: 0.034, // signal packet chirp gain (0-0.06)
    spectrumToneGain: 0.036, // spectrum segment extinguish note gain (0-0.06)
    spectrumBreakGain: 0.05, // spectrum shield break sting gain (0-0.08)
    cageSnapSteps: 1, // phase-cage glitch-shatter snaps to this many 16th steps (1-4)
    cageShatterGain: 0.05, // phase-cage glitch-shatter sting gain (0-0.08)
    wireSnapSteps: 1, // fuse-wire pulse zap snaps to this many 16th steps (1-4)
    wirePulseGain: 0.04, // fuse-wire pulse zap gain per chained detonation (0-0.07)
    wireBeatSteps: 4, // 16th steps between fuse-wire chain detonations; 4 = one beat (2-8)
    grooveSnareGate: 0.32, // board energy needed before the snare pattern enters (0-1)
    grooveHatGate: 0.2, // board energy needed before the main hat pattern enters (0-1)
    grooveHat16Gate: 0.68, // board energy needed before ghost hats fill the in-between 16ths (0-1)
    grooveBassGate: 0.44, // board energy needed before the bassline pattern enters (0-1)
    grooveKickHiGate: 0.58, // board energy needed before soft kickHi accents join the kick pattern (0-1)
    gateHysteresis: 0.06, // energy drop below a groove gate before that part exits; stops parts flapping at the threshold (0-0.12)
    grooveSwingMax: 0.25, // hard cap on per-palette swing so off-16ths never smear past feel (0-0.4)
    genreSwingMaxJazz: 0.5, // hard cap on genre swing past grooveSwingMax; keeps the shuffle from smearing (0.3-0.6)
    genreSnareDragMax: 18, // hard cap on genre snare drag behind the grid (ms, 0-30)
    flatlineOctave: 2, // octaves above the palette root for the rush-end flatline tone (1-3)
    flatlineGain: 0.046, // flatline tone gain (0-0.08)
    flatlineDur: 0.78, // flatline tone length (seconds, 0.4-1.2)
    rejectGhostGain: 0.02, // muted ghost pluck gain on an invalid swap (0-0.05)
    rejectGhostDur: 0.07, // muted ghost pluck decay on an invalid swap (seconds, 0.03-0.08)
    failThudDur: 0.46, // out-of-moves root thud length; the flatline tone shortened (seconds, 0.3-0.8)
    failFloorBase: 0.18, // arrangement floor the fail ramp settles on; matches the base arrangeFloors entry (0-0.4)
    failRampBeats: 2, // beats to ease the arrangement down to failFloorBase after out-of-moves (1-4)
    impactLevel: 1, // impact bus level relative to the volume slider (0-1.2)
    arrangeFloors: [
      // campaign arrangement floor by goal progress, matched top-down; energy still rides above the floor (floors 0-1)
      { progress: 0.9, floor: 0.68 },
      { progress: 0.75, floor: 0.58 },
      { progress: 0.5, floor: 0.45 },
      { progress: 0.25, floor: 0.3 },
      { progress: 0, floor: 0.18 }
    ],
    tier0FloorScale: 0.75, // chapters 1-5 scale the arrangement floor down so early sectors stay sparse (0.5-1)
    tier0EnergyCap: 0.66, // chapters 1-5 cap effective energy; keeps sparkle out of the sector's front half (0.4-1)
    tier2FloorBonus: 0.04, // chapters 11-15 add this to the arrangement floor for denser late sectors (0-0.1)
    climaxProgress: 0.9, // goal progress that triggers the climax state (0.7-1)
    climaxSweepSteps: 32, // 16th steps to sweep the macro filter fully open after climax onset (8-64)
    revealSteps: 32, // sector-entry hold length in 16th steps; 32 = 2 bars before the full groove lands (16-64)
    revealDroneGain: 0.02, // root drone gain under the sector-entry hold (0-0.05)
    revealMotifGain: 0.03, // reveal motif note gain during the hold; the hold plays the track hook's prime form (0-0.06)
    motifOpsMax: 2, // max seed-picked operators composed onto the track hook per level (1-3)
    motifDegreeMin: -3, // lowest scale degree a motif variant may reach after operators (-5-0)
    motifDegreeMax: 9, // highest scale degree a motif variant may reach after operators (5-12)
    motifGainByTier: [0.014, 0.018, 0.022], // signature motif layer gain by difficulty tier 0/1/2 (each 0-0.03)
    motifTensionCalmMax: 0.75, // difficulty tier below this picks the calm operator pool (0.3-1.2)
    motifTensionUrgentMin: 2, // difficulty tier at/above this picks the urgent operator pool (1.5-2.8)
    motifNoteDurScale: 0.8, // fraction of a motif note's rhythmic slot the tone sustains (0.4-1)
    winMotifSpacing: 0.05, // seconds between win-sting motif arpeggio notes (0.03-0.09)
    driftDetuneCents: 4, // per-level seed detune half-range in cents; tints every note's pitch (0-10)
    driftCutoffMul: 0.05, // per-level seed lowpass-cutoff half-range as a fraction; brightens/darkens the mix (0-0.12)
    driftFeedbackNudge: 0.015, // per-level seed delay-feedback half-range added to the feedback target (0-0.04)
    driftFiltEnvOctaves: 0.25, // per-level seed filter-envelope sweep-depth half-range in octaves; voice engine (seq 4) (0-0.6)
    driftVoiceBias: 0.15, // per-level seed voice-character/stack-brightness half-range bias; voice engine (seq 4) (0-0.4)
    voiceFiltEnvAttack: 0.008, // filter-envelope attack for character voices (seconds, 0.002-0.03)
    voiceFiltEnvDecay: 0.12, // filter-envelope decay to the sustain floor (seconds, 0.03-0.4)
    voiceFiltEnvOctaves: 2.2, // filter-env sweep height above the note base cutoff (octaves, 0-4)
    voiceFiltEnvFloor: 0.5, // cutoff multiplier the env settles to, times base cutoff (0.2-1)
    voiceFiltEnvStart: 0.6, // cutoff multiplier at note onset, times base cutoff (0.2-1)
    voiceStackDetuneMax: 22, // hard cap on 2-osc stack detune, keeps stacks in tune (cents, 0-40)
    voiceSubMix: 0.5, // sub-oscillator (-12 st) gain vs the main osc when a character sets sub>0 (0-0.8)
    voiceFmIndexMax: 6, // hard cap on FM modulation index so sidebands stay musical (0-10)
    voiceFmDecayDefault: 0.08, // fallback FM index-envelope decay when a character sets none (seconds, 0.02-0.3)
    voicePwmMotionHz: 5, // PWM/stack chorus LFO rate on detune (Hz, 2-8)
    voicePwmMotionCents: 6, // depth of that chorus LFO (cents, 0-14)
    voiceMaxOscPerNote: 4, // safety cap on oscillators a single character note may spawn (2-6)
    pieceVoiceGainTrim: 0.9, // global trim on piece-voice notes vs the old flat tone, avoids stacking hot (0.6-1.1)
    pieceVoiceCascadeLift: 1, // extra register added to piece voices at chain >= 4 (0-2)
    heroNovaDetuneCents: 16, // detune of the nova super-saw hero stab (6-30)
    heroFusionFmIndex: 5, // FM index for the fusion/combo bell hero timbre (2-8)
    phraseBars: 4, // bars per call-and-response phrase; front half call, back half response (2-8)
    responseDuck: 0.3, // motif layer gain multiplier during response bars; the band steps back (0.1-1)
    responseBoost: 1.3, // player tone gain multiplier during response bars; the answer rings louder (1-1.6)
    responseToneGainCap: 0.11, // hard cap on response-boosted one-shot tone gains (0.06-0.14)
    callPickupRange: 2, // max scale degrees the next call transposes toward the player's response register (0-4)
    polyloopPeriods: [80, 112, 176], // polyloop bed periods in 16th steps; coprime 5/7/11 bars so with the 2-bar pad the bed realigns only every ~770 bars (each 32-320)
    polyloopGains: [0.014, 0.012, 0.016], // drone swell / ghost motif / sparkle ping layer gains (each 0-0.03)
    counterMelodyOnsetMin: 8, // session minutes before the session-gated counter-melody starts fading in (3-20)
    counterMelodyRampMin: 3, // minutes the counter-melody (and sub-bass) takes to reach full gain (1-8)
    counterMelodyGain: 0.011, // full counter-melody layer gain (0-0.03)
    subMovementOnsetMin: 14, // session minutes before the walking sub-bass engages (6-30)
    subMovementGain: 0.03, // full walking sub-bass layer gain (0-0.05)
    mutateBarsMin: 8, // min bars between habituation surface mutations (4-16)
    mutateBarsMax: 16, // max bars between habituation surface mutations (8-32)
    mutateDelayWetNudge: 0.02, // delay-wet drift applied by one habituation mutation (0.005-0.05)
    mutateDelayWetRange: 0.04, // max accumulated delay-wet drift from the palette base (0.02-0.08)
    inputRateHalflife: 20, // EMA halflife for the moves/min input-rate estimate (seconds, 8-40)
    failPressureDecay: 90, // seconds for fail pressure to decay linearly from 1 to 0 (30-180)
    directorTickSteps: 16, // 16th steps between iso-director ticks; 16 = once per bar (8-32)
    inputRateFull: 26, // moves/min that reads as full playing intensity (12-40)
    arousalBase: 0.25, // resting player-arousal estimate before rate/chain/fail terms (0-0.5)
    arousalRateWeight: 0.45, // arousal weight on normalized input rate (0-0.7)
    arousalChainWeight: 0.2, // arousal weight on maxChain / arousalChainFull (0-0.4)
    arousalChainFull: 6, // maxChain that reads as full chain arousal (3-10)
    arousalFailWeight: 0.3, // arousal subtracted at full fail pressure (0-0.5)
    isoSlewUp: 0.03, // director arousal rise per bar toward the music state; slow up (0.01-0.1)
    isoSlewDown: 0.12, // director arousal fall per bar toward the music state; fast down (0.05-0.3)
    directorBiasMax: 0.25, // hard cap on the iso bias added to effective energy (0-0.4)
    fatigueMinutes: 25, // session minutes before the fatigue ceiling engages (10-60)
    fatigueCeiling: 0.75, // effective-energy ceiling after fatigueMinutes (0.5-1)
    nightStartHour: 22, // local hour the night ceiling engages, inclusive (18-23)
    nightEndHour: 6, // local hour the night ceiling releases, exclusive (4-10)
    nightCeiling: 0.7, // effective-energy ceiling during night hours (0.4-1)
    recoveryBars: 8, // bars a recovery take stays capped after 2+ fails on a level (4-16)
    recoveryCeiling: 0.35, // effective-energy ceiling at the top of a recovery take (0.2-0.5)
    recoveryRebuildStep: 0.12, // ceiling rebuild added every 2 bars of a recovery take (0.05-0.25)
    surpriseMax: 1, // surprise budget cap; scarcity preserves the reward signal (1-2)
    surpriseRefillSeconds: 45, // seconds to refill +1 surprise budget (20-90)
    surpriseFatigueSlow: 1.5, // refill slowdown factor once the fatigue governor engages (1-2.5)
    surpriseMinGapBars: 8, // min bars between surprise spends (4-16)
    surpriseCosts: { borrowedPad: 0.6, octaveMotif: 0.4, addSixthPad: 0.3, doubleHarmony: 0.5, borrowedChord: 0.7 }, // budget cost per consonant surprise event (each 0.1-1)
    surpriseMotifGainScale: 1.5, // octaveMotif gain multiplier on the restated hook (1-2)
    surpriseHarmonySteps: 16, // doubleHarmony chord length in 16th steps for one phrase; half the 32-step norm (8-32)
    halfHarmonySteps: 64, // half-time chord length in 16th steps; double the 32-step norm (32-128)
    sectionBars: 32, // bars per section before a seeded bridge may open (16-64)
    sectionBridgeChance: 0.4, // seeded chance a section opens as a bridge (0-1)
    bridgeBars: 8, // bridge length before the home progression returns (4-16)
    harmonicRhythmBridge: 16, // steps-per-chord inside a bridge; faster than the 32 norm (8-32)
    halfNightBars: 4, // bars the night governor half-times the groove after a level start (2-8)
    // CONTINUOUS MUSIC (Jung's top ask): one groove that flows through a whole track without
    // breaking. When true, same-palette (within-track) level transitions skip the bed-to-silence
    // tail, the drum duck, and the drum-free bridge entirely: the groove keeps running and the
    // next level re-anchors on the tonic under it, so the melody morphs (per-level motif) while
    // the through-line never dips. Sector-reveal (new-track) boundaries keep their intro. Flip
    // false to restore the old per-level bridge hand-off for an A/B.
    continuousGroove: true,
    // Continuous energy carry (increment 3): on a within-track hand-off, open the next level
    // at the previous level's arrangement energy and ease it down over this many bars, so the
    // transition MATCHES (no vibrant->sparse drop) and then settles into the new level's own
    // progress-driven build. 0 disables the carry (hand-off still seamless, energy just resets
    // to the level's opening floor).
    continuousCarryBars: 8,
    transitionTailBars: 1.5, // level-clear arrangement-bus tail length before the next level (bars, 0.5-3)
    transitionTailFloor: 0.0, // arrangement-bus gain the level-clear tail settles toward (0-0.3)
    levelFadeInBars: 1, // legacy same-sector fade length; superseded by the bridge hand-off (bars, 0.25-2)
    transitionFadeInStart: 0.12, // arrangement-bus gain a bridge hand-off swells up from (0-0.4)
    // Musical level-transition bridge (campaign-only). Replaces the old volume-only tail+fade
    // with a real hand-off: the drums duck out, a per-palette pad swell + a lead turnaround
    // figure resolve to the tonic (with a soft riser), then the next groove re-enters cleanly
    // on the downbeat at bridgeIntroBars.
    bridgeIntroBars: 2, // level-start bridge length in bars before the groove downbeat (2-4)
    bridgeDuckDepth: 0.85, // fraction the level-clear tail ducks the drum/impact bus toward silence (0-1)
    bridgePadGain: 0.05, // peak gain of each bridge pad-swell voice (0-0.12)
    bridgeLeadGain: 0.055, // peak gain of each bridge lead-turnaround note (0-0.1)
    bridgeLeadFigure: [7, 5, 4, 2, 0], // lead turnaround scale degrees; MUST end on 0 so the fill lands on the tonic (in-scale degrees)
    bridgeRiserGain: 0.05, // peak gain of the soft noise riser that builds into the downbeat (0-0.12)
    // Genre harmony extension (music genres seq 2). Feel knobs for the jazz color tones and
    // walking bass; both are no-ops unless a genre opts in (electronic keeps today's sound).
    jazzColorGain: 0.008, // per-tone gain of an added jazz color extension (b7/9) on the sustained rhodes comp; lifted from 0.006 so the tine 7th/9th actually reads as the extended-chord color while staying under the warm pad (0-0.02)
    walkingBassGain: 0.06, // jazz walking-bass per-note gain; the signature quarter-note walk, lifted from 0.05 so it anchors the trio yet stays under the energy-scaled electronic bass peak so jazz reads cool (0-0.09)
    jazzTurnaround: [1, 3, 0, 0], // jazz-only seeded-bridge ii-V-I: scale-degree ROOT indices (supertonic, dominant fifth, tonic, tonic), all in-scale; length 4 splits the 8-bar bridge into two clean turnarounds that resolve home
    // Genre voice/timbre extension (music genres seq 4). The global filter-scale clamp and
    // the trip-hop vinyl crackle bed. All no-ops unless a non-electronic genre opts in.
    genreFilterScaleMin: 0.6, // clamp on how dark a genre may pull the global filter scale (0.5-1)
    vinylNoiseCutoff: 1100, // LOWPASS cutoff of the trip-hop vinyl bed (was a 3000Hz bandpass that read as unpleasant static/hiss — Jung 2026-07-06). Lowpass at 1100 makes it a dark, felt warmth under the mix, not a high-mid hiss on top (Hz, 700-2500)
    vinylNoiseGainMax: 0.012, // hard cap on the vinyl bed gain, lowered from 0.02 so the bed can never get hissy again (0-0.02)
    // Genre arrangement/density extension (music genres seq 5). Per-note gains for the two
    // genre-conditional persistent layers; both stay silent unless pop/jazz is the live genre.
    // The gate shift, floor bonus, and energy cap are per-genre fields on GENRES, not scalars.
    popToplineGain: 0.018, // pop persistent octave-up topline hook layer gain; nudged up to sit just over the fuller 6-9 pad so the hook still cuts on top (0-0.03)
    jazzCompGain: 0.014 // jazz rhodes offbeat comping layer gain (0-0.03)
  };
  var MOTION = {
    gemLerp: 30,
    scaleLerp: 22
  };
  var LIMITS = {
    particles: 420,
    beams: 34,
    floaters: 20,
    rays: 76,
    shockwaves: 18,
    flyRewards: 14,
    signalPackets: 12,
    cellFlashes: 80
  };
  var CELL_FLASH_TTL = 0.42; // footprint-flash life in seconds; a quick bright tint on cleared cells (0.2-0.8)
  var REWARD_DROP = {
    dropChanceChain: 0.2, // chance a cascade chain of 4+ drops a booster token on the board (0-1)
    dropChanceBig: 0.28, // chance a 5+ piece group drops a booster token on the board (0-1)
    maxPerLevel: 2, // hard cap on board drops per level attempt; keeps the economy tight (1-2)
    cooldownMoves: 6, // moves that must pass after a drop before the next may spawn (0-12)
    allowedBoosters: ["hammer", "charge"] // booster ids eligible to drop on the board
  };
  var REWARD_FLY = {
    hammer: { glyph: "⚒︎", color: "#ffd166" },
    shuffle: { glyph: "⇄", color: "#8cff6b" },
    charge: { glyph: "⚡︎", color: "#ff4fd8" },
    credits: { glyph: "◈", color: "#ffd166" }
  };
  var LEVEL_COUNT = 240;
  var OVERDRIVE_THRESHOLD = 0.72;
  var STAR_REWARDS = buildStarRewards();
  var STREAK_REWARDS = [
    { day: 1, rewards: { hammer: 1, shuffle: 0, charge: 0 } },
    { day: 2, rewards: { hammer: 0, shuffle: 1, charge: 0 } },
    { day: 3, rewards: { hammer: 0, shuffle: 0, charge: 1 } },
    { day: 4, rewards: { hammer: 1, shuffle: 1, charge: 0 } },
    { day: 5, rewards: { hammer: 0, shuffle: 1, charge: 1 } },
    { day: 6, rewards: { hammer: 2, shuffle: 0, charge: 1 } },
    { day: 7, rewards: { hammer: 2, shuffle: 2, charge: 2 } }
  ];
  // Daily Setlist: three scored takes per local date; the best take is the
  // record, everything after is unlimited unscored rehearsal (synthesis 15).
  var DAILY_TAKE_LIMIT = 3;
  // Backstage Pass: one earned per completed 7-day streak week, hold max 2.
  // A single missed day auto-consumes a pass and keeps the streak; two or
  // more missed days pause the streak, never break the record (synthesis 17).
  var BACKSTAGE_PASS_MAX = 2;
  // Daily #1 = 2026-01-01, so the counter reads like an ongoing release run.
  var DAILY_NUMBER_EPOCH = new Date(2025, 11, 31);
  var WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var WEEKLY_EVENT_REWARDS = [
    { threshold: 80, rewards: { hammer: 1, shuffle: 0, charge: 0 } },
    { threshold: 180, rewards: { hammer: 0, shuffle: 1, charge: 0 } },
    { threshold: 320, rewards: { hammer: 0, shuffle: 0, charge: 1 } },
    { threshold: 520, rewards: { hammer: 1, shuffle: 1, charge: 0 } },
    { threshold: 780, rewards: { hammer: 0, shuffle: 1, charge: 1 } },
    { threshold: 1100, rewards: { hammer: 2, shuffle: 1, charge: 1 } },
    { threshold: 1500, rewards: { hammer: 2, shuffle: 2, charge: 2 } }
  ];
  // First-session schedule (levels 1-16 preset, 17-40 rule-driven):
  // one new thing per level, debut-as-toy, +2 rule, 10-level metronome.
  // Verb (1-2) -> line special (3-4) -> nova (5-6) -> boosters gift in
  // (7/9/12/16) -> chain goal (8) -> shields (11-13) -> gate (15).
  // Fusion is discovered, never taught: adjacent specials seeded at 13
  // (and again at 26); no fusion goal until past level 100.
  var FIRST_SESSION_LEVELS = [
    {
      number: 1,
      title: "Ignition Grid",
      moves: 24,
      scoreTarget: 1500,
      goals: [
        { kind: "score", target: 1500 },
        { kind: "collect", type: 0, target: 8 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "full" },
      coach: "Ion pieces are cyan circles. Match three to collect them.",
      pressure: "Every clear scores. Hunt cyan circles first."
    },
    {
      number: 2,
      title: "Prism Current",
      moves: 22,
      scoreTarget: 1900,
      goals: [
        { kind: "score", target: 1900 },
        { kind: "collect", type: 1, target: 9 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "full" },
      coach: "Prism pieces are pink triangles. Same swap, new color.",
      pressure: "Keep swapping. Every match plays a note."
    },
    {
      number: 3,
      title: "Line Spark",
      moves: 24,
      scoreTarget: 2300,
      goals: [
        { kind: "score", target: 2300 },
        { kind: "specials", target: 1 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "full" },
      coach: "Match four to create a beam piece.",
      pressure: "Make one special, then ride the burst."
    },
    {
      number: 4,
      title: "Beam Loan",
      moves: 22,
      scoreTarget: 2700,
      goals: [
        { kind: "score", target: 2700 },
        { kind: "collect", type: 2, target: 9 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "full" },
      starterSpecials: [
        { row: 4, col: 3, special: "lineH" }
      ],
      coach: "A beam piece is loaded. Swap it to fire the row.",
      pressure: "The loaner beam is yours. Spend it anywhere."
    },
    {
      number: 5,
      title: "Nova Primer",
      moves: 26,
      scoreTarget: 3100,
      goals: [
        { kind: "score", target: 3100 },
        { kind: "specials", target: 2 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "full" },
      coach: "Match five for a nova. Tap it to arm, tap again to fire.",
      pressure: "Make the five. Tap the nova to arm, tap again to fire the sweep."
    },
    {
      number: 6,
      title: "Twin Circuit",
      moves: 26,
      scoreTarget: 3500,
      goals: [
        { kind: "score", target: 3500 },
        { kind: "collect", type: 3, target: 9 },
        { kind: "specials", target: 2 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "corner-bites" },
      coach: "Pulse pieces are gold squares. Build two specials.",
      pressure: "Beams and novas together. No new tricks."
    },
    {
      number: 7,
      title: "Toolkit Relay",
      moves: 24,
      scoreTarget: 3900,
      goals: [
        { kind: "score", target: 3900 },
        { kind: "collect", type: 4, target: 10 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "wide-gate" },
      coach: "Core pieces are orange hexes. Clear ten.",
      pressure: "Win this take and the booster bar opens."
    },
    {
      number: 8,
      title: "Cascade Signal",
      moves: 25,
      scoreTarget: 3900,
      goals: [
        { kind: "score", target: 3900 },
        { kind: "chain", target: 2 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "full" },
      coach: "Set one clear that drops into another.",
      pressure: "Chains finish goals with fewer moves."
    },
    {
      number: 9,
      title: "Echo Chamber",
      moves: 26,
      scoreTarget: 4400,
      goals: [
        { kind: "score", target: 4400 },
        { kind: "collect", type: 5, target: 10 },
        { kind: "chain", target: 2 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "corner-bites", producers: [{ row: 4, col: 4 }] },
      coach: "The center Producer feeds you a violet Atom every move. Chain them.",
      pressure: "The Producer keeps making Atoms. Cascade them into chains."
    },
    {
      number: 10,
      title: "First Encore",
      moves: 28,
      scoreTarget: 4800,
      goals: [
        { kind: "score", target: 4800 },
        { kind: "collect", type: 0, target: 11 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "wide-gate" },
      coach: "Milestone take. Play loose and bank moves.",
      pressure: "Victory lap. Saved moves become the finale."
    },
    {
      number: 11,
      title: "Shield Debut",
      moves: 28,
      scoreTarget: 5000,
      goals: [
        { kind: "score", target: 5000 },
        { kind: "flux", target: 4 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "corner-bites", blockers: [{ row: 3, col: 2 }, { row: 3, col: 5 }, { row: 4, col: 3 }, { row: 5, col: 2 }, { row: 5, col: 5 }] },
      coach: "Shields are solid walls. Pieces fall through them. Match right beside a wall to break it open.",
      pressure: "You can't match a wall. Clear next to it to break it, then the cell opens up."
    },
    {
      number: 12,
      title: "Shield Current",
      moves: 26,
      scoreTarget: 5400,
      goals: [
        { kind: "score", target: 5400 },
        { kind: "flux", target: 5 },
        { kind: "chain", target: 2 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "full", blockers: [{ row: 2, col: 2 }, { row: 2, col: 5 }, { row: 3, col: 4 }, { row: 4, col: 2 }, { row: 5, col: 5 }, { row: 5, col: 3 }] },
      coach: "Break the walls by matching beside them. Chains break more at once.",
      pressure: "Walls plus chains. Pieces fall through until you break them."
    },
    {
      number: 13,
      title: "Shield Forge",
      moves: 27,
      scoreTarget: 5600,
      goals: [
        { kind: "score", target: 5600 },
        { kind: "flux", target: 6 },
        { kind: "specials", target: 2 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "full", blockers: [{ row: 2, col: 3 }, { row: 2, col: 4 }, { row: 3, col: 1 }, { row: 3, col: 6 }, { row: 5, col: 1 }, { row: 5, col: 6 }, { row: 6, col: 3 }] },
      starterSpecials: [
        { row: 4, col: 3, special: "lineH" },
        { row: 4, col: 4, special: "lineV" }
      ],
      coach: "Fire a beam beside a wall to smash it. Two beams wait on the board.",
      pressure: "Specials break walls fast. Pieces fall through until then."
    },
    {
      number: 14,
      title: "Creep Debut",
      moves: 25,
      scoreTarget: 5000,
      goals: [
        { kind: "score", target: 5000 },
        { kind: "spread", target: 5 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "full", spreaders: [{ row: 3, col: 2 }, { row: 5, col: 5 }] },
      coach: "The green Creep spreads to a new cell every few moves. Match an infected cell to clear it.",
      pressure: "Clear next to the Creep to contain it. Match it to remove it."
    },
    {
      number: 15,
      title: "Track Gate",
      moves: 26,
      scoreTarget: 6200,
      goals: [
        { kind: "score", target: 6200 },
        { kind: "flux", target: 8 },
        { kind: "specials", target: 2 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "full", blockers: [{ row: 2, col: 2 }, { row: 2, col: 5 }, { row: 3, col: 3, strength: 2 }, { row: 3, col: 4 }, { row: 5, col: 3 }, { row: 5, col: 4, strength: 2 }, { row: 6, col: 2 }, { row: 6, col: 5 }] },
      coach: "The finale wall. Break beside the shields. Gold ones take two hits.",
      pressure: "Break the walls and bank a big finish. Some are reinforced."
    },
    {
      number: 16,
      title: "Charge Lattice",
      moves: 25,
      scoreTarget: 6400,
      goals: [
        { kind: "score", target: 6400 },
        { kind: "collect", type: 3, target: 10 },
        { kind: "flux", target: 2 }
      ],
      layout: { pattern: "none", strength: 0, fluxTarget: 0, boardShape: "diamond", blockers: [{ row: 3, col: 4 }, { row: 4, col: 3 }, { row: 4, col: 4 }] },
      coach: "Mix it all. Break the walls, then collect the gold squares.",
      pressure: "Clean take here earns the full booster kit."
    }
  ];
  // Boosters teach by gifting: end-of-level grants at 7/9/12/16 only,
  // spaced 3-4 levels apart, after the core loop lands. Everything else
  // pays credits so the gift moments stay legible.
  var FIRST_CLEAR_REWARDS = {
    1: { label: "FIRST SPARK", rewards: { hammer: 0, shuffle: 0, charge: 0 }, credits: 20 },
    2: { label: "CURRENT BONUS", rewards: { hammer: 0, shuffle: 0, charge: 0 }, credits: 20 },
    3: { label: "BEAM BONUS", rewards: { hammer: 0, shuffle: 0, charge: 0 }, credits: 25 },
    4: { label: "LOANER BONUS", rewards: { hammer: 0, shuffle: 0, charge: 0 }, credits: 25 },
    5: { label: "NOVA BONUS", rewards: { hammer: 0, shuffle: 0, charge: 0 }, credits: 30 },
    6: { label: "TWIN BONUS", rewards: { hammer: 0, shuffle: 0, charge: 0 }, credits: 30 },
    7: { label: "HAMMER GIFT", rewards: { hammer: 1, shuffle: 0, charge: 0 }, credits: 35 },
    8: { label: "CASCADE BONUS", rewards: { hammer: 0, shuffle: 0, charge: 0 }, credits: 35 },
    9: { label: "SHUFFLE GIFT", rewards: { hammer: 0, shuffle: 1, charge: 0 }, credits: 40 },
    10: { label: "ENCORE BONUS", rewards: { hammer: 0, shuffle: 0, charge: 0 }, credits: 60 },
    12: { label: "CHARGE GIFT", rewards: { hammer: 0, shuffle: 0, charge: 1 }, credits: 40 },
    15: { label: "GATE BONUS", rewards: { hammer: 0, shuffle: 0, charge: 0 }, credits: 60 },
    16: { label: "KIT GIFT", rewards: { hammer: 1, shuffle: 1, charge: 0 }, credits: 45 }
  };
  var WEEKLY_EVENT_NAMES = [
    "Neon Cup",
    "Pulse Cup",
    "Nova Circuit",
    "Overdrive Open",
    "Shield Rally",
    "Harmonic Clash"
  ];
  var MODE_CAMPAIGN = "campaign";
  var MODE_RUSH = "rush";
  var MODE_DAILY = "daily";
  var RUSH_DRAIN_BASE = 0.048;
  var RUSH_DRAIN_GROWTH = 0.00042;
  var RUSH_BOOSTER_COST = {
    hammer: 0.08,
    shuffle: 0.12
  };
  var PULSE_RELEASE_THRESHOLD = 1;
  var PULSE_RELEASE_BANK_MAX = 1.35;
  var MAX_CASCADE_CHAIN = 12;
  var CONTINUE_MOVES = 5;
  var CONTINUE_COST = 80;
  var STORE_ITEMS = [
    { id: "starter", title: "Starter Pack", subtitle: "3 Hammer, 3 Shuffle, 2 Charge", tag: "First-session value", mockPrice: "$0.99", singleClaim: true, rewards: { hammer: 3, shuffle: 3, charge: 2 }, credits: 120 },
    { id: "neon-kit", title: "Neon Kit", subtitle: "2 of each booster, 260 credits", tag: "Mock bundle SKU", mockPrice: "$2.99", singleClaim: true, rewards: { hammer: 2, shuffle: 2, charge: 2 }, credits: 260 },
    { id: "hammer-pack", title: "Hammer Pack", subtitle: "5 Hammer boosters", tag: "Break target pieces", creditCost: 120, rewards: { hammer: 5, shuffle: 0, charge: 0 } },
    { id: "shuffle-pack", title: "Shuffle Pack", subtitle: "4 Shuffle boosters", tag: "Fix bad boards", creditCost: 110, rewards: { hammer: 0, shuffle: 4, charge: 0 } },
    { id: "charge-pack", title: "Charge Pack", subtitle: "3 Charge boosters", tag: "Force overdrive", creditCost: 160, rewards: { hammer: 0, shuffle: 0, charge: 3 } },
    { id: "continue", title: "Continue", subtitle: "+5 moves on the current level", tag: "Save failed runs", creditCost: CONTINUE_COST, continueMoves: CONTINUE_MOVES }
  ];

  var view = {
    width: 0,
    height: 0,
    dpr: 1,
    boardX: 0,
    boardY: 0,
    boardSize: 0,
    cell: 0
  };

  var board = [];
  var boardMask = [];
  var currentBoardShape = "full";
  var tileCharges = [];
  // Beat Gates: masked cells that toggle open/closed per MOVE (never per
  // second — the campaign never races time). Closed = solid wall: holds no
  // piece, blocks falls and matches. Visuals strobe on the beat clock.
  var beatGateList = [];
  var beatGateMap = {};
  var beatGateOpenMoves = 2;
  var beatGateClosedMoves = 2;
  var beatGateOffset = 0;
  var beatGateMoveCount = 0;
  var beatGatePhaseOpen = true;
  var beatGateAnim = 1;
  var beatGateFlash = 0;
  // Signal Nodes: static masked cells that never hold a piece. Every
  // adjacent match emits one packet; the tracer launch and its chirp are
  // quantized to the next beat (every swap plays a note, so does a packet).
  var signalNodeList = [];
  var signalNodeMap = {};
  var signalPacketCount = 0;
  // Producers (Sector-1 slice, increment 2): a fixed spawner node that occupies
  // a masked cell (holds no piece, like a Signal Node) and, once per player
  // move, "emits" a goal-colored piece by converting one safe orthogonal
  // neighbor to the goal color. Keeps the board changing while you play (RM #7).
  var producerList = [];
  var producerMap = {};
  var producerEmitPending = false;
  // Spreaders (Sector-1 slice, increment 3): a creeping infection that overlays
  // a gem cell and spreads to an orthogonal neighbor every few moves UNLESS you
  // cleared a match next to it (containment). Match an infected cell to clear it.
  // Real pressure (RM); capped so it can never fill the board / softlock.
  var spreaderList = [];
  var spreaderMap = {};
  var spreaderMoveCount = 0;
  var SPREAD_EVERY = 3; // moves between spread ticks
  var SPREAD_CAP = 9; // hard ceiling on live infections (softlock guard)
  var SPREAD_COLOR = "#c8ff2e"; // acid lime, distinct from Quark green #8cff6b
  // Spectrum Shields: shield cells that need adjacent matches of specific
  // colors. The bracket silhouette stays; a colored arc ring names the
  // colors and extinguishes segment by segment.
  var spectrumList = [];
  var spectrumMap = {};
  // Phase Locks: pieces frozen inside a translucent phase cage. A caged
  // piece can't swap, move, fall, or join a run; matching its color on an
  // orthogonal neighbor breaks the phase (glitch shatter), the freed piece
  // joins that clear, and a caged special detonates on release.
  var phaseLockList = [];
  var phaseLockMap = {};
  // Fuse Wires: pre-placed specials joined by visible circuit traces.
  // Detonating any wired special arms the network: the remaining wired
  // specials fire in wire order one beat apart, the current pulse hopping
  // the trace quantized to the grid.
  var fuseNetworkList = [];
  var fuseQueue = [];
  var fusePulses = [];
  // Board-shape data lives above the campaign build (buildCampaign runs
  // right here at load, before later var statements execute).
  // Every mask keeps the top two rows playable (feel lock) and leaves at
  // least 44 active cells so goals stay tunable. core-diamond is the
  // level-240 one-off and stays out of the rotation pool.
  var BOARD_SHAPE_POOL = ["full", "corner-bites", "wide-gate", "diamond", "soft-diamond", "hourglass", "cross", "twin-towers", "staircase", "arena", "fang", "wave", "butterfly", "chevron", "vault"];
  // Finale set pieces: each 15th level gets a signature board, escalating
  // from the early vocabulary to the theatrical cuts, and the campaign
  // ends on the one-off core-diamond. Level 15 lives in the 1-16 presets
  // (authored "full" board) and level 30 sits in the early rotation
  // (already "wide-gate"); both entries here document the assignment and
  // feed the no-repeat rule.
  var FINALE_BOARD_SHAPES = {
    15: "full", 30: "wide-gate", 45: "corner-bites", 60: "diamond",
    75: "soft-diamond", 90: "hourglass", 105: "vault", 120: "twin-towers",
    135: "staircase", 150: "wave", 165: "butterfly", 180: "chevron",
    195: "fang", 210: "cross", 225: "arena", 240: "core-diamond"
  };
  var boardShapeCache = {};
  var campaign = buildCampaign(LEVEL_COUNT);
  var campaignSave = readCampaignSave();
  var settings = readSettings();
  var currentLevelIndex = Math.min(campaignSave.unlocked - 1, campaign.length - 1);
  var currentLevel = campaign[currentLevelIndex];
  var currentLevelAttempt = 0;
  var gameMode = MODE_CAMPAIGN;
  var boardRng = Math.random;
  var dailyId = getDailyId();
  var dailySeed = hashString("neon-lattice-daily:" + dailyId);
  var particles = [];
  var beams = [];
  var rays = [];
  var floaters = [];
  var cellFlashes = []; // footprint flashes marking the exact cells a special/fusion clears
  var calloutQueue = [];
  var activeCallout = null;
  // Layer-growth payoff (presentation only): a read-only mirror of the voices the
  // arranger already gates on (gateState) plus the climax lead. Each entry lights
  // one pip on the canvas Voices meter, and the labelled ones headline a brief
  // callout + soft hero-snap cue as they join. Order runs low energy -> high, so
  // the meter reads like a rising EQ as the track fills in. Nothing here changes
  // the music; see updateArrangementBands / drawArrangementHud.
  var ARRANGEMENT_BANDS = [
    { key: "spine", label: null, color: "#9fb0cc" }, // kick + pad + lead motif, always on once the groove drops
    { key: "hat", label: "+ HATS", color: "#46f4ff" },
    { key: "snare", label: "+ BEAT", color: "#8cff6b" },
    { key: "bass", label: "+ BASS", color: "#ffd166" },
    { key: "kickHi", label: null, color: "#ff9f4f" }, // soft high-kick accent, pip-only
    { key: "hat16", label: null, color: "#8cf0ff" }, // ghost 16th shimmer, pip-only
    { key: "climax", label: "+ LEAD", color: "#ff4fd8" }
  ];
  var bandLatch = {}; // OFF->ON latch per band for one-shot callouts; reset each level
  var bandActive = []; // per-band current audible state, read by the Voices meter
  var bandPop = []; // per-band entry pop timer (0-1), decayed in updateEffects, scaled by fxScale
  var bandsPrimed = false; // first post-reveal step seeds the latch silently so the groove drop never spams callouts
  var celebration = null; // level-clear staged sequence (startLevelClearCelebration)
  var goalChipFlash = {};
  var rewardDropState = { dropped: 0, lastDropMove: -99 };
  var levelGrantLedger = [];
  var flyRewardCount = 0;
  var shockwaves = [];
  var vectorField = buildVectorField(92);
  var stageBgGradient = null;
  var vignetteGradient = null;
  var washCyan = null;
  var washGold = null;
  var nebulaCanvas = null;
  var score = 0;
  var bestScore = readBestScore();
  var rushBestScore = readRushBestScore();
  var dailyBestScore = readDailyBestScore(dailyId);
  var dailyRunTake = getDailyTakeEntry(dailyId).count + 1;
  var combo = 0;
  var movesLeft = 0;
  var mercyBias = 0;
  var pulse = 1;
  var pulseBank = 0;
  var rushSeconds = 0;
  var rushCritical = false;
  var rushNewBest = false;
  var dailyNewBest = false;
  var rushSurgeCooldown = 0;
  var hudClock = 0;
  var runSerial = 0;
  var lastSharePayload = null;
  var shareScoreCountFrame = 0;
  var failLockUntil = 0;
  // True from the moment a result/fail card is scheduled until it opens or is
  // closed. Blocks board taps in the pre-card window so a stray tap can't
  // restart a lost level (skipping the fail card + Continue offer) or advance
  // a win before the result card renders.
  var shareCardPending = false;
  var mapBuilt = false;
  var coachSeen = readCoachSeen();
  var coachQueue = [];
  var activeCoachTip = null;
  var coachLastShownAt = 0;
  var coachLateTipCount = 0;
  var resetProgressArmedUntil = 0;
  var resetProgressTimer = 0;
  var levelState = "playing";
  var levelStats = createLevelStats();
  var activeBooster = null;
  var selected = null;
  // Tap-to-fire specials (mandate A5): first tap arms and shows the
  // footprint preview, second tap on the same cell fires.
  var armedSpecial = null;
  var pointerStart = null;
  var pointerStartPoint = null;
  var activePointerId = null;
  var pendingSwap = null;
  var PENDING_SWAP_MAX_AGE = 2500;
  var hintIdle = 0;
  var swapHint = null;
  var swapHintAge = 0;
  var guidedMove = null;
  // Nova primer (mandate A7): level 5 plants a makeable five-in-line, then
  // guides the tap that fires the resulting nova so the sweep is performed,
  // not just named. novaPrimerGem tracks the debut nova between cascades.
  var novaPrimerSwap = null;
  var novaPrimerGem = null;
  var animating = false;
  var hitStop = 0;
  var animatingClock = 0;
  var flash = 0;
  var novaWarpPulse = 0;
  var beatPulse = 0;
  var energy = 0.12;
  var drive = 0;
  var overdrivePulse = 0;
  var meterHotActive = false;
  var overdriveExitPulse = 0;
  var screenShake = 0;
  var lastTime = 0;
  var frameQuality = {
    level: 0,
    smoothedFps: 60,
    lowTimer: 0,
    highTimer: 0,
    cooldown: 0
  };

  var audio = {
    ctx: null,
    master: null,
    compressor: null,
    delay: null,
    feedback: null,
    wet: null,
    macro: null,
    duck: null,
    impact: null,
    timer: null,
    nextStepTime: 0,
    step: 0,
    climaxStep: -1,
    revealUntilStep: 0,
    // Musical level-transition bridge: the next campaign level opens with a drum-free
    // hand-off. scheduleStep suppresses the groove while step < bridgeUntilStep, plays a
    // per-palette pad+lead cadence to the tonic, then re-enters the groove on the downbeat.
    bridgeUntilStep: 0,
    // Palette id that played on the previous campaign level. resetMusicPhrase compares it to
    // the incoming level's palette to decide a phase-continuous (same-key) hand-off.
    lastPaletteId: null,
    // Continuous energy carry: carryFloor = the arrangement energy the previous level ended on,
    // eased in from carryFloorStep so the next level opens matched, not sparse. lastArrangeFloor
    // tracks the live playing floor so a hand-off knows what to carry.
    carryFloor: 0,
    carryFloorStep: 0,
    lastArrangeFloor: 0,
    gateState: { snare: false, hat: false, hat16: false, bass: false, kickHi: false },
    failRamp: null,
    // Iso-principle director: meets the player where they are (arousal),
    // then steers the arrangement with a bias and an energy ceiling.
    director: {
      currentArousal: 0.25,
      playerArousal: 0.25,
      bias: 0,
      ceiling: 1,
      inputRate: 0,
      failPressure: 0,
      sessionStart: Date.now(),
      lastMoves: 0,
      recoveryUntilStep: 0,
      // Half-time feel: when set, scheduleStep reads this groove instead of the
      // palette's; changed only at phrase boundaries, never mid-phrase.
      grooveOverride: null
    },
    effectiveEnergy: null,
    // Seed-derived motif variant for the current campaign level: { ops: [...ids], motif: {deg,dur,register} }.
    // Only operator ids are derived; nothing persists.
    levelMotif: null,
    // Seed-derived per-level timbre drift: tight symmetric detune/cutoff/feedback/voice
    // biases so every level sounds felt-not-heard different. Zeroed for Rush/Daily.
    levelDrift: null,
    // Call-and-response phrase state: the player's top response degree steers the next call's transpose.
    phrase: { topDegree: null, callShift: 0 },
    // Habituation drift state: level-seeded mutation clock plus the current surface overrides.
    mutation: { rng: null, nextBar: 0, hatPattern: null, delayWetOffset: 0, log: [] },
    // Surprise scheduler (RPE budget): rare consonant events spend from a
    // slow-refill budget; staged overrides are consumed by the next chord/phrase.
    surprise: { budget: 1, lastSpendBar: -999, lastProgress: 0, scaleOverride: null, padDegrees: null, harmony: null, borrowUntilStep: 0, log: [] },
    // Seeded bridge-section memo (item 7): one entry keyed on level id/seed + section
    // index so the per-section bridge roll is computed once, not per harmony read.
    sectionCache: null,
    layers: [],
    noiseBuffer: null,
    // Voice-character shared infrastructure (seq 4): a cache of pulse PeriodicWaves
    // (one per duty, built at graph init) plus one persistent chorus LFO on pwm/stack
    // detune. Persistent, never per-note; per-note oscillators are stopped after their env.
    pulseWaves: null,
    pwmLfo: null,
    pwmLfoGain: null,
    // Vinyl crackle bed (music genres seq 4): a single persistent looped-noise texture,
    // silent by default, lifted off zero only for trip-hop. Persistent by design, never
    // per-note, so it starts once at graph init and lives with the graph (no one-shot leak).
    vinyl: null,
    vinylFilter: null,
    vinylGain: null,
    started: false,
    muted: settings.muted === true,
    unlockStamp: 0,
    volume: Number(volumeInput.value) / 100
  };

  function buildStarRewards() {
    // First reactor grant lands after the level-7 gift moment so the
    // 7/9/12/16 booster introduction stays the first booster contact.
    var thresholds = [16, 24, 36, 54, 72, 96, 120, 150, 180, 225, 270, 315, 360, 420, 480, 540, 600, 660, 720];
    return thresholds.map(function (threshold, index) {
      var cycle = index % 5;
      var rewards = { hammer: 0, shuffle: 0, charge: 0 };
      if (cycle === 0) rewards.hammer = 1;
      if (cycle === 1) rewards.shuffle = 1;
      if (cycle === 2) rewards.charge = 1;
      if (cycle === 3) {
        rewards.hammer = 1;
        rewards.shuffle = 1;
      }
      if (cycle === 4) {
        rewards.shuffle = 1;
        rewards.charge = 1;
      }
      return {
        threshold: threshold,
        rewards: rewards
      };
    });
  }

  function buildCampaign(count) {
    var levels = [];
    // Sawtooth: difficulty climbs across each 10-level decade, peaks at
    // cycle positions 7 (HARD) and 8 (SUPER HARD), relief at 9. Starts
    // after the level-20 intro runway so the first session never spikes.
    var sawtoothMoves = [2, 2, 1, 1, 1, 0, 0, -4, -5, 3];
    var sawtoothScore = [0.85, 0.9, 0.95, 1, 1.02, 1.05, 1.08, 1.2, 1.28, 0.8];
    for (var index = 0; index < count; index += 1) {
      var number = index + 1;
      var episode = Math.floor(index / 15) + 1;
      var chapterLevel = (index % 15) + 1;
      var theme = getEpisodeTheme(episode);
      var difficulty = 1 + Math.floor(index / 18);
      var preset = getFirstSessionPreset(number);
      var layout = preset ? cloneLevelLayout(preset.layout) : createLevelLayout(number, difficulty);
      var baseMoves = 28 - Math.min(7, Math.floor(index / 32)) + (number % 4);
      var moves = preset ? preset.moves : Math.max(17, baseMoves + (layout.pattern === "none" && !(layout.gates && layout.gates.length > 0) ? 0 : 2));
      var scoreTarget = preset ? preset.scoreTarget : createScoreTarget(number);
      var badge = "";
      if (!preset && number > 20) {
        var cyclePos = (number - 1) % 10;
        moves = Math.max(16, moves + sawtoothMoves[cyclePos]);
        // Badge score multipliers taper by band: the base curve sits
        // closer to achieved scores past L100, so late badges need less
        // extra target. Values fitted against the simulate-difficulty
        // greedy score distributions to land the 40-70% win band.
        var scoreMult = sawtoothScore[cyclePos];
        if (isBadgePosition(number)) {
          // The 38-69 badge cluster measured dead (100% random and/or
          // greedy wins) at 1.6/1.7 while 78-99 sat in band, so the
          // sub-100 band splits at 70 with a hotter early tier.
          if (cyclePos === 7) scoreMult = number <= 70 ? 2.1 : number <= 100 ? 1.6 : number <= 170 ? 1.3 : 1.1;
          if (cyclePos === 8) scoreMult = number <= 70 ? 2.3 : number <= 100 ? 1.7 : number <= 170 ? 1.38 : 1.22;
          // Per-level overrides fitted from targeted 6-attempt
          // simulate-difficulty runs: these seeds sit far enough off
          // their band's median that the shared multiplier alone cannot
          // land the 40-70% greedy win band. 108 and 149 are seeds where
          // random cascade scoring rivals greedy collect-chasing, so any
          // target that lifts greedy to 50%+ also lifts random to 67%+
          // (BADGE-SOFT); their fitted values sit mid-plateau on the
          // random/greedy tie instead.
          var badgeSpotMults = { 38: 2.8, 49: 2.45, 58: 2.28, 59: 2.7, 69: 2.1, 108: 1.45, 109: 1.55, 118: 1.4, 138: 1.6, 149: 1.49, 178: 1.18, 189: 1.33, 209: 1.14, 239: 1.15 };
          if (badgeSpotMults[number]) scoreMult = badgeSpotMults[number];
        }
        scoreTarget = Math.floor(scoreTarget * scoreMult);
        // First HARD label lands at 35; the decade rhythm follows.
        if (number >= 35 && cyclePos === 7) badge = "HARD";
        if (number >= 35 && cyclePos === 8) badge = "SUPER HARD";
      }
      if (number === 35) {
        badge = "HARD";
        moves = Math.max(16, moves - 4);
        // 1.95 left random-policy wins at 100%; 2.55 puts the bar past
        // the measured random full-run ceiling (~25k over 29 moves)
        // while greedy's stronger cascades keep it in the win band.
        scoreTarget = Math.floor(scoreTarget * 2.55);
      }
      if (number === 38 || number === 39) {
        // First badge pair after the L35 debut measured dead (100%
        // random AND greedy wins): they carry 27 moves against the
        // badge cluster's 24-25, so trim the surplus to put the HARD
        // and SUPER HARD labels back to work.
        moves = Math.max(16, moves - 3);
      }
      if (number === 36) {
        // Easy cooldown right after the first HARD level.
        moves += 2;
        scoreTarget = Math.floor(scoreTarget * 0.85);
      }
      if (number === 41) {
        // Beat Gates debut: toy framing with a move surplus and a soft
        // score bar so the showcase lands 95-100% wins.
        moves += 4;
        scoreTarget = Math.floor(scoreTarget * 0.8);
      }
      if (number === 51 || number === 61) {
        // Signal Nodes / Spectrum Shields debuts: same toy framing as 41
        // so the solo showcases land 95-100% wins. Spectrum gets a bigger
        // surplus: color-specific feeds can starve on a cold board.
        moves += number === 61 ? 6 : 4;
        scoreTarget = Math.floor(scoreTarget * 0.8);
      }
      if (number === 71 || number === 81) {
        // Phase Locks / Fuse Wires debuts: toy framing again. Cages meter
        // the board (they block falls), so 71 gets the bigger surplus;
        // 81's wired chain pays for itself once any entry fires.
        moves += number === 71 ? 5 : 4;
        scoreTarget = Math.floor(scoreTarget * 0.8);
      }
      if (number === 225) {
        // Arena finale set piece: the open-center ring holds 48 cells
        // (versus 62 on the corner-bites board the score curve was fitted
        // against), which cut greedy cascade scores ~25% and walled the
        // level in simulate-difficulty. Ease the bar to match the rim's
        // real throughput.
        moves += 2;
        scoreTarget = Math.floor(scoreTarget * 0.68);
      }
      var goals = preset ? cloneLevelGoals(preset.goals) : createLevelGoals(number, difficulty, scoreTarget, layout);
      if (!preset && layout.fluxTarget > 0) {
        var clampedFlux = Math.min(layout.fluxTarget, Math.floor(moves * 2));
        layout.fluxTarget = clampedFlux;
        // Passive shield clearing runs well under one cell per move, so
        // flux goals stay beneath that ceiling to stay winnable.
        goals.forEach(function (goal) {
          if (goal.kind === "flux") goal.target = Math.min(goal.target, clampedFlux, Math.floor(moves * 0.4));
        });
      }

      var modifiers = createLevelModifiers(number, difficulty, getLevelDropBias(number, goals));

      levels.push({
        id: number,
        title: preset ? preset.title : theme.name + " " + chapterLevel,
        sectorTitle: "Track " + pad2(episode) + ": " + theme.name,
        episodeTheme: theme.id,
        tagline: theme.tag,
        clipHook: theme.hook,
        musicPalette: theme.palette,
        seed: hashString("neon-lattice-level:" + number),
        episode: episode,
        moves: moves,
        badge: badge,
        coach: preset ? preset.coach : createCoachCopy(number),
        pressure: preset ? preset.pressure : createPressureCopy(number, difficulty, layout),
        goals: goals,
        layout: layout,
        starterSpecials: preset ? cloneStarterSpecials(preset.starterSpecials) : createStarterSpecials(number),
        starTargets: [
          scoreTarget,
          Math.floor(scoreTarget * 1.35),
          Math.floor(scoreTarget * 1.75)
        ],
        modifiers: modifiers
      });
    }
    return levels;
  }

  function getFirstSessionPreset(number) {
    return FIRST_SESSION_LEVELS.find(function (level) {
      return level.number === number;
    }) || null;
  }

  function createScoreTarget(number) {
    // Base score target ~65-75% of the median greedy-achieved score per
    // level band (scripts/difficulty-report.json records[].score), with
    // growth tapering where achieved scores plateau (~L150 onward). The
    // old 1800 + number * 150 + difficulty * 420 curve outran achievable
    // scoring past L100 and produced unwinnable score walls.
    if (number <= 20) return 4300 + number * 210;
    if (number <= 60) return 8500 + (number - 20) * 130;
    if (number <= 120) return 13700 + (number - 60) * 105;
    if (number <= 180) return 20000 + (number - 120) * 70;
    return 24200 + (number - 180) * 30;
  }

  function isBadgePosition(number) {
    var cyclePos = (number - 1) % 10;
    return number >= 35 && (cyclePos === 7 || cyclePos === 8);
  }

  function createStarterSpecials(number) {
    var domino = getAuthoredDominoKind(number);
    if (domino === "wires") {
      // Fuse-wired specials are pre-placed; the wires[] layout joins the
      // same cells into a network.
      return createFuseWireNetworks(number).reduce(function (list, network) {
        return list.concat(network.map(function (cell) {
          return { row: cell.row, col: cell.col, special: cell.special };
        }));
      }, []);
    }
    if (domino === "locked-special") {
      // The authored domino: one caged special. The one right unlock
      // (its color, matched alongside) detonates the region.
      var dominoHash = hashString("neon-lattice-locked-special:" + number);
      return [{
        row: 3 + (dominoHash % 3),
        col: 2 + ((dominoHash >>> 4) % 4),
        special: ["lineH", "lineV", "nova"][(dominoHash >>> 8) % 3],
        locked: true
      }];
    }
    // Fusion is discovered, never taught: seed one adjacent special pair
    // mid-campaign (the first pair ships with the level-13 preset), and
    // on every fusion-goal level so the goal is never opportunity-starved.
    if (number === 26) {
      return [
        { row: 4, col: 3, special: "lineH" },
        { row: 4, col: 4, special: "nova" }
      ];
    }
    if (number > 100 && number % 12 === 8 && !isBadgePosition(number)) {
      return [
        { row: 4, col: 3, special: "lineH" },
        { row: 4, col: 4, special: "lineV" }
      ];
    }
    return [];
  }

  function cloneLevelGoals(goals) {
    return goals.map(function (goal) {
      var copy = {
        kind: goal.kind,
        target: goal.target
      };
      if (goal.kind === "collect") copy.type = goal.type;
      return copy;
    });
  }

  function cloneLevelLayout(layout) {
    return {
      pattern: layout.pattern,
      strength: layout.strength,
      fluxTarget: layout.fluxTarget,
      boardShape: layout.boardShape || "full",
      gates: (layout.gates || []).map(function (cell) {
        return { row: cell.row, col: cell.col };
      }),
      gateOpenMoves: layout.gateOpenMoves || 2,
      gateClosedMoves: layout.gateClosedMoves || 2,
      gateOffset: layout.gateOffset || 0,
      signals: (layout.signals || []).map(function (cell) {
        return { row: cell.row, col: cell.col };
      }),
      producers: (layout.producers || []).map(function (cell) {
        return { row: cell.row, col: cell.col };
      }),
      spreaders: (layout.spreaders || []).map(function (cell) {
        return { row: cell.row, col: cell.col };
      }),
      blockers: (layout.blockers || []).map(function (cell) {
        return { row: cell.row, col: cell.col, strength: cell.strength };
      }),
      spectrum: (layout.spectrum || []).map(function (entry) {
        return { row: entry.row, col: entry.col, colors: (entry.colors || []).slice() };
      }),
      locks: (layout.locks || []).map(function (entry) {
        return { row: entry.row, col: entry.col, type: entry.type };
      }),
      wires: (layout.wires || []).map(function (network) {
        return (network || []).map(function (cell) {
          return { row: cell.row, col: cell.col, special: cell.special };
        });
      })
    };
  }

  function cloneStarterSpecials(starterSpecials) {
    return (starterSpecials || []).map(function (entry) {
      return {
        row: entry.row,
        col: entry.col,
        special: entry.special,
        locked: entry.locked === true
      };
    });
  }

  function getEpisodeTheme(episode) {
    var index = Math.max(0, Math.floor((episode || 1) - 1));
    return EPISODE_THEMES[index % EPISODE_THEMES.length] || EPISODE_THEMES[0];
  }

  function getLevelEpisodeTheme(level) {
    if (!level) return EPISODE_THEMES[0];
    var theme = EPISODE_THEMES.find(function (candidate) {
      return candidate.id === level.episodeTheme;
    });
    return theme || getEpisodeTheme(level.episode);
  }

  function getCurrentEpisodeTheme() {
    return getLevelEpisodeTheme(currentLevel);
  }

  function isFinaleLevel(level) {
    // Every 15th level is the track's Finale; framing only, no rule changes.
    return Boolean(level && level.id % 15 === 0);
  }

  function getLevelDisplayTitle(level) {
    if (!level) return "";
    if (!isFinaleLevel(level)) return level.title;
    return getLevelEpisodeTheme(level).name + " Finale";
  }

  function createLevelGoals(number, difficulty, scoreTarget, layout) {
    var type = number % TYPES.length;
    var goals = [{ kind: "score", target: scoreTarget }];

    // First-40 metronome (presets cover 1-16): double shields debut as a
    // toy at 21, +2 rule pairs them with one older element at 22-23, the
    // fusion showcase re-seeds at 26, overdrive goals debut at 32.
    if (number === 21) {
      goals.push({ kind: "flux", target: Math.min(layout.fluxTarget || 12, 12) });
      return goals;
    }
    if (number === 22) {
      goals.push({ kind: "flux", target: Math.min(layout.fluxTarget || 12, 12) });
      goals.push({ kind: "chain", target: 2 });
      return goals;
    }
    if (number === 23) {
      goals.push({ kind: "flux", target: Math.min(layout.fluxTarget || 14, 14) });
      goals.push({ kind: "collect", type: type, target: 12 });
      return goals;
    }
    if (number === 26) {
      goals.push({ kind: "specials", target: 3 });
      return goals;
    }
    if (number === 32) {
      goals.push({ kind: "overdrive", target: 1 });
      return goals;
    }
    if (number === 41) {
      // Beat Gates debut: the gates are the whole point, so the goal
      // stays a modest collect the greedy line clears with room to spare.
      goals.push({ kind: "collect", type: type, target: 10 });
      return goals;
    }
    if (isSignalLevel(number)) {
      // Signal decade: 51 is the solo showcase (the nodes ARE the goal),
      // 52 pairs nodes with corner shields via layout, 53 adds a collect.
      // The edge-antenna rotation variant (cols 0/7) feeds from three
      // neighbors instead of four, so its target eases to 10: measured
      // at 12 it walls (L77 0% greedy).
      var edgeNodes = Math.floor(number / 10) % 3 === 1;
      goals.push({ kind: "signal", target: number === 51 ? 8 : number === 52 ? 9 : number === 53 ? 10 : edgeNodes ? 10 : 12 });
      if (number === 53) goals.push({ kind: "collect", type: type, target: 10 });
      return goals;
    }
    if (isSpectrumLevel(number)) {
      // Spectrum Shields ride the existing shield goal: one break per
      // shield, so all the player-facing shield copy stays true. The
      // debut over-provisions (three shields, break two) so no single
      // starved color can sink the showcase.
      var spectrumCount = layout.spectrum ? layout.spectrum.length : 3;
      // 73 and 83 stack locks/wires on the shields (+2 rule), so they
      // over-provision like the debut: break all but one.
      var overProvision = number === 61 || number === 73 || number === 83;
      goals.push({ kind: "flux", target: overProvision ? Math.max(1, spectrumCount - 1) : spectrumCount });
      if (number === 62) goals.push({ kind: "collect", type: type, target: 10 });
      if (number === 63) goals.push({ kind: "chain", target: 2 });
      return goals;
    }
    if (number === 71 || number === 72) {
      // Phase Locks debut: the cages hold the collect color, so every
      // unlock feeds the goal (no new goal kind). 72 adds a chain goal
      // (the one older element); 73 pairs locks with spectrum shields.
      goals.push({ kind: "collect", type: type, target: number === 71 ? 10 : 12 });
      if (number === 72) goals.push({ kind: "chain", target: 2 });
      return goals;
    }
    if (number === 81 || number === 82) {
      // Fuse Wires debut: wire detonations count for the specials goal
      // (no new goal kind). 82 adds a collect (the one older element);
      // 83 pairs wires with spectrum shields.
      goals.push({ kind: "specials", target: 3 });
      if (number === 82) goals.push({ kind: "collect", type: type, target: 10 });
      return goals;
    }

    // Fusion goals only deep in the campaign; before that fusions stay a
    // discovered trick, never a requirement. These levels always seed an
    // adjacent special pair, so one fusion is on the board at start.
    if (number > 100 && number % 12 === 8 && !isBadgePosition(number)) {
      goals.push({ kind: "fusion", target: 1 });
      return goals;
    }

    // Badge levels share one goal profile (score race + a modest collect)
    // so the HARD/SUPER HARD tuning stays a single score knob per band
    // instead of swinging with whichever rotation goal lands on the peak.
    // Collect keeps the greedy line on goal pieces rather than cascade
    // farming, which holds achieved scores in a tighter band.
    if (isBadgePosition(number)) {
      goals.push({ kind: "collect", type: type, target: Math.min(20, 12 + Math.floor(difficulty / 2)) });
      return goals;
    }

    var pattern = number % 6;
    if (pattern === 0) {
      goals.push({ kind: "collect", type: type, target: Math.min(24, 14 + difficulty) });
    } else if (pattern === 1 && layout.fluxTarget > 0) {
      goals.push({ kind: "flux", target: layout.fluxTarget });
    } else if (pattern === 2) {
      goals.push({ kind: "specials", target: Math.min(6, 3 + Math.floor(difficulty / 3)) });
    } else if (pattern === 3) {
      // The arena ring starves cascades: gems fall straight through the
      // carved core, so deep chains barely occur. Measured at chain 3 it
      // walls (L225 0% greedy, short by 1 every attempt); the ask caps
      // at 2 on that board.
      var chainCap = layout.boardShape === "arena" ? 2 : 3;
      goals.push({ kind: "chain", target: Math.min(chainCap, 2 + Math.floor(difficulty / 4)) });
    } else if (pattern === 4 && number > 32) {
      goals.push({ kind: "overdrive", target: 1 });
    } else if (pattern === 4) {
      goals.push({ kind: "chain", target: 2 });
    } else {
      goals.push({ kind: "collect", type: (type + 2) % TYPES.length, target: Math.min(22, 14 + Math.floor(difficulty * 0.7)) });
    }

    return goals;
  }

  function createLevelLayout(number, difficulty) {
    // Presets cover 1-16. From 17 the shield patterns rotate; strength 2
    // debuts at 21 as that decade's new thing (double shields).
    var pattern = "none";
    if (number >= 17) {
      var patterns = ["corners", "cross", "ring", "diagonal", "center", "checker"];
      pattern = patterns[(number + difficulty) % patterns.length];
    }
    if (number === 21) pattern = "center";

    // Beat Gates land at 41+ only, so the first-40 schedule stays clean.
    // On gate levels the gate is the hook: shields drop out (except 42,
    // where the +2 rule pairs gates with corner shields), and the board
    // stays full so the gated chokes read clean.
    var gates = createBeatGateCells(number);
    if (gates.length > 0) pattern = number === 42 ? "corners" : "none";

    // Signal Nodes (51+) and Spectrum Shields (61+) are their decades'
    // hooks: the generic shield rotation drops out (except 52, where the
    // +2 rule pairs nodes with corner shields) and the board stays full
    // so the corner/choke placements read clean.
    var signals = createSignalNodeCells(number);
    if (signals.length > 0) pattern = number === 52 ? "corners" : "none";
    var spectrum = createSpectrumShieldCells(number);
    if (spectrum.length > 0) pattern = "none";

    // Phase Locks (71+) and Fuse Wires (81+): the debuts are their
    // decades' hooks, so the shield rotation drops out and the board
    // stays full (73/83 keep spectrum shields as the one older element).
    // From 84 both join rotation as authored puzzle moments and ride
    // whatever the level already runs.
    var locks = createPhaseLockCells(number);
    var wires = createFuseWireNetworks(number);
    var dominoDebut = (locks.length > 0 || wires.length > 0) && number <= 83;
    if (dominoDebut && spectrum.length === 0) pattern = "none";

    var strength = number > 150 ? 3 : number >= 21 ? 2 : 1;
    var gateTiming = createBeatGateTiming(number, gates);
    var layout = {
      pattern: pattern,
      strength: strength,
      fluxTarget: 0,
      boardShape: gates.length > 0 || signals.length > 0 || spectrum.length > 0 || dominoDebut ? "full" : createBoardShape(number, difficulty),
      gates: gates,
      gateOpenMoves: gateTiming.open,
      gateClosedMoves: gateTiming.closed,
      gateOffset: gateTiming.offset,
      signals: signals,
      spectrum: spectrum,
      locks: locks,
      wires: wires
    };
    layout.fluxTarget = countFluxCells(layout);
    if (spectrum.length > 0) layout.fluxTarget = spectrum.length;
    return layout;
  }

  function isSignalLevel(number) {
    // L51 solo showcase, 52-53 pair nodes with one older element, then
    // one signal level per decade (x7) so the hook never repeats on
    // consecutive levels (gates hold x6) and the HARD/SUPER HARD slots
    // (x8/x9) stay clean.
    if (number < 51) return false;
    if (number <= 53) return true;
    return number % 10 === 7 && number >= 57;
  }

  function createSignalNodeCells(number) {
    if (!isSignalLevel(number)) return [];
    // Nodes never sit in the top two rows: the top band must stay playable.
    if (number === 51) {
      // Solo showcase: a center antenna pair the whole board feeds.
      return [{ row: 4, col: 3 }, { row: 4, col: 4 }];
    }
    if (number === 52) {
      // Edge nodes paired with corner shields (the one older element).
      return [{ row: 5, col: 0 }, { row: 5, col: 7 }];
    }
    if (number === 53) {
      // Side pockets plus a collect goal (the one older element).
      return [{ row: 3, col: 1 }, { row: 3, col: 6 }];
    }
    var variant = Math.floor(number / 10) % 3;
    if (variant === 0) return [{ row: 5, col: 1 }, { row: 5, col: 6 }];
    if (variant === 1) return [{ row: 4, col: 0 }, { row: 4, col: 7 }];
    return [{ row: 6, col: 2 }, { row: 6, col: 5 }];
  }

  function isSignalCellInLayout(layout, row, col) {
    if (!layout || !layout.signals) return false;
    return layout.signals.some(function (cell) {
      return cell.row === row && cell.col === col;
    });
  }

  function isSpectrumLevel(number) {
    // L61 solo showcase, 62-63 pair shields with one older element, then
    // one spectrum level per decade (x3; x6 gates, x7 signal, x8/x9 badges).
    if (number < 61) return false;
    if (number <= 63) return true;
    return number % 10 === 3 && number >= 73;
  }

  function createSpectrumShieldCells(number) {
    if (!isSpectrumLevel(number)) return [];
    var cells;
    var colorCount = 2;
    if (number === 61) {
      // Solo showcase: three spread shields, two colors each, kept off
      // the rim so cascade traffic feeds every color.
      cells = [{ row: 2, col: 2 }, { row: 4, col: 5 }, { row: 6, col: 3 }];
    } else if (number === 62) {
      // Pairs with a collect goal (the one older element).
      cells = [{ row: 3, col: 1 }, { row: 3, col: 6 }, { row: 6, col: 3 }];
    } else if (number === 63) {
      // Pairs with a chain goal; the goal pairing carries the difficulty,
      // so the shields stay two-color (three colors debut in rotation).
      cells = [{ row: 2, col: 3 }, { row: 5, col: 1 }, { row: 5, col: 6 }];
    } else {
      var variant = Math.floor(number / 10) % 3;
      colorCount = 3;
      if (variant === 0) cells = [{ row: 2, col: 1 }, { row: 2, col: 6 }, { row: 6, col: 2 }, { row: 6, col: 5 }];
      else if (variant === 1) cells = [{ row: 3, col: 1 }, { row: 3, col: 6 }, { row: 5, col: 3 }, { row: 5, col: 4 }];
      else cells = [{ row: 2, col: 3 }, { row: 2, col: 4 }, { row: 6, col: 1 }, { row: 6, col: 6 }];
    }
    return cells.map(function (cell, index) {
      return { row: cell.row, col: cell.col, colors: pickSpectrumColors(number, index, colorCount) };
    });
  }

  function pickSpectrumColors(number, index, count) {
    // Deterministic per level+shield; stride 1 or 2 keeps the K colors distinct.
    var hash = hashString("neon-lattice-spectrum:" + number + ":" + index);
    var start = (hash >>> 0) % TYPES.length;
    var step = 1 + (((hash >>> 3) & 1));
    var colors = [];
    for (var i = 0; i < count; i += 1) colors.push((start + i * step) % TYPES.length);
    return colors;
  }

  function getAuthoredDominoKind(number) {
    // Phase Locks debut 71-73, Fuse Wires debut 81-83 (solo showcase,
    // then the +2 rule pairs each with one older element). From 84 both
    // join rotation: roughly 1 of 4 levels carries an authored pre-placed
    // moment (caged pieces, one caged special, or a wired network),
    // skipping badge peaks, other decade hooks, and fusion-seed levels.
    if (number >= 71 && number <= 73) return "locks";
    if (number >= 81 && number <= 83) return "wires";
    if (number < 84 || number % 4 !== 0) return null;
    if (isBadgePosition(number)) return null;
    if (isBeatGateLevel(number) || isSignalLevel(number)) return null;
    if (number > 100 && number % 12 === 8) return null;
    var variant = Math.floor(number / 4) % 3;
    if (variant === 0) return "locks";
    if (variant === 1) return "locked-special";
    return "wires";
  }

  function createPhaseLockCells(number) {
    if (getAuthoredDominoKind(number) !== "locks") return [];
    // Cages never sit in the top two rows (feel lock) and always cage the
    // level's bias color, so every unlock feeds the collect goal.
    var bias = number % TYPES.length;
    if (number === 71) {
      // Solo showcase: three spread cages the whole board can reach.
      return [
        { row: 3, col: 2, type: bias },
        { row: 3, col: 5, type: bias },
        { row: 5, col: 3, type: bias }
      ];
    }
    if (number === 72) {
      // Pairs with a chain goal (the one older element).
      return [
        { row: 2, col: 3, type: bias },
        { row: 5, col: 1, type: bias },
        { row: 5, col: 6, type: bias }
      ];
    }
    if (number === 73) {
      // Lock beside shield pressure: cages sit off the spectrum cells so
      // the two-step order (feed the shield, free the cage) reads clean.
      return [
        { row: 2, col: 3, type: bias },
        { row: 6, col: 4, type: bias }
      ];
    }
    var variant = Math.floor(number / 10) % 3;
    if (variant === 0) return [{ row: 3, col: 2, type: bias }, { row: 5, col: 5, type: bias }];
    if (variant === 1) return [{ row: 2, col: 5, type: bias }, { row: 5, col: 2, type: bias }];
    return [{ row: 4, col: 1, type: bias }, { row: 4, col: 6, type: bias }];
  }

  function createFuseWireNetworks(number) {
    if (getAuthoredDominoKind(number) !== "wires") return [];
    // Wire order is the chain order: the pulse hops cell to cell, one
    // beat per hop. Cells double as the pre-placed starter specials and
    // never share a row/column with a wired line special: an instant
    // blast chain would eat the beat-apart signature.
    if (number === 81) {
      // Solo showcase: fire any of the three, the wire spends the rest.
      return [[
        { row: 5, col: 1, special: "lineH" },
        { row: 3, col: 4, special: "lineV" },
        { row: 6, col: 5, special: "nova" }
      ]];
    }
    if (number === 82) {
      // Pairs with a collect goal (the one older element).
      return [[
        { row: 5, col: 2, special: "lineV" },
        { row: 3, col: 5, special: "lineH" }
      ]];
    }
    if (number === 83) {
      // Wires beside spectrum shields: the right entry cracks both.
      return [[
        { row: 4, col: 2, special: "lineH" },
        { row: 5, col: 5, special: "nova" }
      ]];
    }
    var hash = hashString("neon-lattice-wire:" + number);
    var variant = hash % 3;
    var specials = ["lineH", "lineV"];
    if (variant === 0) return [[{ row: 5, col: 2, special: specials[hash % 2] }, { row: 3, col: 5, special: specials[(hash + 1) % 2] }]];
    if (variant === 1) return [[{ row: 3, col: 2, special: specials[(hash + 1) % 2] }, { row: 5, col: 5, special: specials[hash % 2] }]];
    return [[
      { row: 5, col: 1, special: "lineV" },
      { row: 3, col: 6, special: "lineH" },
      { row: 2, col: 3, special: specials[hash % 2] }
    ]];
  }

  function isBeatGateLevel(number) {
    // L41 solo showcase, 42-43 pair gates with one older element, then
    // one gate level per decade (x6) so no two consecutive levels share
    // the hook and the HARD/SUPER HARD slots (x8/x9) stay gate-free.
    if (number < 41) return false;
    if (number <= 43) return true;
    return number % 10 === 6;
  }

  function createBeatGateCells(number) {
    if (!isBeatGateLevel(number)) return [];
    // Gates never sit in the top two rows: the top band must stay playable.
    if (number === 41) {
      // Solo showcase: one center shutter band, whole level is the gate.
      return [{ row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 }];
    }
    if (number === 42) {
      // Light pair with corner shields (the one older element).
      return [{ row: 4, col: 3 }, { row: 4, col: 4 }];
    }
    if (number === 43) {
      // Pillar chokes plus a collect goal (the one older element).
      return [{ row: 3, col: 2 }, { row: 3, col: 5 }, { row: 4, col: 2 }, { row: 4, col: 5 }];
    }
    var variant = Math.floor(number / 10) % 3;
    if (variant === 0) return [{ row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 }];
    if (variant === 1) return [{ row: 3, col: 2 }, { row: 3, col: 5 }, { row: 4, col: 2 }, { row: 4, col: 5 }];
    return [{ row: 5, col: 1 }, { row: 5, col: 2 }, { row: 5, col: 5 }, { row: 5, col: 6 }];
  }

  function createBeatGateTiming(number, gates) {
    if (!gates || gates.length === 0) return { open: 2, closed: 2, offset: 0 };
    // Debut breathes longest; the canonical cycle from 44 on is open 2 /
    // closed 2. Offset comes from the level seed but stays inside the
    // open span so every fresh board starts with gates open.
    var open = number === 41 ? 3 : number <= 43 ? 3 : 2;
    var closed = number === 41 ? 1 : 2;
    var offset = hashString("neon-lattice-gate:" + number) % open;
    return { open: open, closed: closed, offset: offset };
  }

  function isGateCellInLayout(layout, row, col) {
    if (!layout || !layout.gates) return false;
    return layout.gates.some(function (cell) {
      return cell.row === row && cell.col === col;
    });
  }

  // BOARD_SHAPE_POOL / FINALE_BOARD_SHAPES / boardShapeCache are declared
  // above the buildCampaign call (load order), near the other level state.
  function createBoardShape(number, difficulty) {
    // Pure function of the level number: determinism is a feel lock, so
    // the same level always cuts the same board.
    return resolveBoardShape(number);
  }

  // Pinned shapes sit outside the seeded rotation: finale set pieces and
  // badge levels. HARD/SUPER HARD score multipliers (sawtoothScore,
  // badgeSpotMults) were fitted against the legacy five-shape rotation,
  // which dealt every x8 a soft-diamond and every x9 a full board (62-64
  // cells). Carved boards cut cascade throughput enough to turn every
  // badge level into a 0%-greedy score wall in simulate-difficulty, so
  // badge levels keep their legacy cut.
  function getPinnedBoardShape(number) {
    if (number <= 40) return null;
    if (FINALE_BOARD_SHAPES[number]) return FINALE_BOARD_SHAPES[number];
    if (isBadgePosition(number)) {
      var legacyShapes = ["corner-bites", "wide-gate", "diamond", "soft-diamond", "full"];
      return legacyShapes[number % legacyShapes.length];
    }
    return null;
  }

  function resolveBoardShape(number) {
    if (boardShapeCache[number]) return boardShapeCache[number];
    var shape;
    var pinned = getPinnedBoardShape(number);
    if (number <= 5) {
      shape = "full";
    } else if (pinned) {
      shape = pinned;
    } else if (number <= 40) {
      // Soft-diamond debuts solo at 31 (the 31-40 decade's new thing).
      if (number === 31) {
        shape = "soft-diamond";
      } else {
        var earlyShapes = ["full", "corner-bites", "wide-gate", "diamond"];
        shape = earlyShapes[number % earlyShapes.length];
      }
    } else {
      // Seeded, level-deterministic pick with a no-repeat rule: the shape
      // must differ from the previous two levels' shapes (derived the
      // same way) and from any pinned shape (finale set piece or badge
      // board) within the next two levels, so an authored board never
      // echoes an ordinary one beside it.
      var banned = [
        resolveBoardShape(number - 1),
        resolveBoardShape(number - 2),
        getPinnedBoardShape(number + 1),
        getPinnedBoardShape(number + 2)
      ];
      var hash = hashString("neon-lattice-shape:" + number);
      shape = BOARD_SHAPE_POOL[hash % BOARD_SHAPE_POOL.length];
      for (var i = 0; i < BOARD_SHAPE_POOL.length; i += 1) {
        var candidate = BOARD_SHAPE_POOL[(hash + i) % BOARD_SHAPE_POOL.length];
        if (banned.indexOf(candidate) === -1) {
          shape = candidate;
          break;
        }
      }
    }
    boardShapeCache[number] = shape;
    return shape;
  }

  function createCoachCopy(number) {
    if (number === 21) return "Double Shields are reinforced walls. Two hits each: crack, then smash.";
    if (number === 31) return "New board cut. Watch the drop lanes.";
    if (number === 41) return "Beat Gates ride the song. Closed gates block swaps and falls.";
    if (isBeatGateLevel(number)) return "Count the gate pips. Land key swaps on open bars.";
    if (number === 51) return "Signal Nodes hear nearby matches. Each one fires a packet.";
    if (isSignalLevel(number)) return "Feed the antennas. Matches beside a node send packets.";
    if (number === 61) return "Spectrum walls show the colors that crack them. Match those colors beside each wall.";
    if (isSpectrumLevel(number) && getAuthoredDominoKind(number) === null) return "Each wall shows the colors that crack it. Match them right beside it.";
    if (number === 71) return "Phase cages freeze pieces. Match the caged color beside them.";
    if (number === 81) return "Fuse wires link charged pieces. Fire one, the wire fires the rest.";
    if (getAuthoredDominoKind(number) === "locks") return "Caged pieces can't move. Free them with their own color.";
    if (getAuthoredDominoKind(number) === "locked-special") return "One caged special waits. Its color match sets it off.";
    if (getAuthoredDominoKind(number) === "wires") return "Follow the wire. One detonation spends the whole network.";
    if (number === 32) return "Fill the string frame. High drive doubles score.";
    if (number > 100 && number % 12 === 8) return "Make two specials, then swap them together.";
    if (number % 15 === 0) return "Final sector gate. Chase clean cascades.";
    if (number % 6 === 4 && number > 32) return "Overdrive levels reward aggressive clears.";
    if (number % 6 === 2) return "Specials break dense boards fast.";
    return "Clear goals fast and preserve moves.";
  }

  function createPressureCopy(number, difficulty, layout) {
    if (layout && layout.producers && layout.producers.length > 0) return "The Producer feeds the goal color every move. Keep clearing beside it.";
    if (layout && layout.spreaders && layout.spreaders.length > 0) return "The Creep spreads every few moves. Match it to clear it; clear beside it to contain it.";
    if (layout && layout.gates && layout.gates.length > 0) return "Gates toggle per move. Sequence matches for the open phase.";
    if (layout && layout.signals && layout.signals.length > 0) return "Nodes only hear adjacent matches. Plan color flow into their pockets.";
    if (layout && layout.wires && layout.wires.length > 0) return "Pick the right entry special. The wire spends the rest on the beat.";
    if (layout && layout.locks && layout.locks.length > 0) return "Cages block swaps and falls. The freeing match is the puzzle.";
    if (getAuthoredDominoKind(number) === "locked-special") return "One caged special. The freeing match detonates the region.";
    if (layout && layout.spectrum && layout.spectrum.length > 0) return "Each wall shows the colors that crack it. Spend scarce colors where they count.";
    if (number % 15 === 0) return "Gate level. Saved moves become the share blast.";
    if (number > 100 && number % 12 === 8) return "Swap special into special. Bigger blast, clearer goal.";
    if (layout && layout.pattern !== "none") return "Shields add pressure. Smash the walls to clear them.";
    if (number % 6 === 2) return "Specials save moves and create bigger music hits.";
    if (number % 6 === 3) return "Cascades beat the move limit.";
    if (number % 6 === 4) return "Build drive early. Overdrive raises score fast.";
    if (difficulty >= 6) return "Move budget is tighter. Plan two swaps ahead.";
    return "Moves decide the clear. Saved moves improve stars.";
  }

  function getLevelDropBias(number, goals) {
    var collectGoal = (goals || []).find(function (goal) {
      return goal.kind === "collect";
    });
    if (collectGoal && typeof collectGoal.type === "number") return collectGoal.type;
    return number % TYPES.length;
  }

  function createLevelModifiers(number, difficulty, colorBias) {
    var bias = typeof colorBias === "number" ? Math.floor(colorBias) : number % TYPES.length;
    bias = ((bias % TYPES.length) + TYPES.length) % TYPES.length;
    return {
      colorBias: bias,
      tempoLift: Math.min(12, Math.floor(difficulty / 2)),
      cascadeBonus: 1 + Math.min(0.7, difficulty * 0.025)
    };
  }

  function countFluxCells(layout) {
    if (layout.pattern === "none") return 0;
    var count = 0;
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        if (isCellActiveForShape(layout.boardShape || "full", row, col) && isFluxCell(layout.pattern, row, col) && !isGateCellInLayout(layout, row, col) && !isSignalCellInLayout(layout, row, col)) count += layout.strength;
      }
    }
    return count;
  }

  function buildBoardMask(shape) {
    var mask = [];
    for (var row = 0; row < GRID; row += 1) {
      mask[row] = [];
      for (var col = 0; col < GRID; col += 1) {
        mask[row][col] = isCellActiveForShape(shape || "full", row, col);
      }
    }
    return mask;
  }

  function isCellActiveForShape(shape, row, col) {
    if (row < 0 || row >= GRID || col < 0 || col >= GRID) return false;
    // Top-edge holes read as dead pieces on phones.
    if (row <= 1) return true;
    if (shape === "corner-bites") {
      return !((row === 0 || row === GRID - 1) && (col === 0 || col === GRID - 1));
    }
    if (shape === "wide-gate") {
      var edgeRow = row === 0 || row === GRID - 1;
      var outerCol = col <= 1 || col >= GRID - 2;
      return !(edgeRow && outerCol);
    }
    if (shape === "diamond") {
      return Math.abs(row - 3.5) + Math.abs(col - 3.5) <= 5.5;
    }
    if (shape === "soft-diamond") {
      return Math.abs(row - 3.5) + Math.abs(col - 3.5) <= 6.5;
    }
    if (shape === "hourglass") {
      // Waist pinches at rows 3-4; the shoulders ease back out.
      var pinch = row === 3 || row === 4 ? 2 : row === 2 || row === 5 ? 1 : 0;
      return col >= pinch && col < GRID - pinch;
    }
    if (shape === "cross") {
      // Plus sign under the full top band: a wide bar at rows 4-5.
      return (row >= 4 && row <= 5) || (col >= 2 && col <= 5);
    }
    if (shape === "twin-towers") {
      // Two 3-wide columns joined by a full floor.
      return row >= 6 || col <= 2 || col >= 5;
    }
    if (shape === "staircase") {
      // Steps descend to the right; each row reaches one column further.
      return col <= row + 1;
    }
    if (shape === "arena") {
      // Ring with an open center: gems orbit the rim.
      return !(row >= 3 && row <= 6 && col >= 2 && col <= 5);
    }
    if (shape === "fang") {
      // Asymmetric bite out of the left flank.
      var fangBite = row === 5 ? 3 : row === 4 || row === 6 ? 2 : row === 3 || row === 7 ? 1 : 0;
      return col >= fangBite;
    }
    if (shape === "wave") {
      // Rows offset left and right in alternation.
      return row % 2 === 0 ? col >= 2 : col <= 5;
    }
    if (shape === "butterfly") {
      // Two wings meeting at a narrow body band.
      if (row === 4 || row === 5) return col >= 1 && col <= 6;
      return col <= 2 || col >= 5;
    }
    if (shape === "chevron") {
      // The bottom edge tapers to a downward point.
      var chevronCut = row === 5 ? 1 : row === 6 ? 2 : row === 7 ? 3 : 0;
      return col >= chevronCut && col < GRID - chevronCut;
    }
    if (shape === "vault") {
      // Narrow shaft opens onto a wide floor.
      return row >= 5 || (col >= 2 && col <= 5);
    }
    if (shape === "core-diamond") {
      // Level-240 one-off: full board with a carved center diamond.
      return Math.abs(row - 4.5) + Math.abs(col - 3.5) > 2;
    }
    return true;
  }

  function applyBoardShape(level) {
    currentBoardShape = level && level.layout && level.layout.boardShape ? level.layout.boardShape : "full";
    boardMask = buildBoardMask(currentBoardShape);
    // Signal nodes carve the mask before gates so gates never land on a node.
    applySignalNodes(level && level.layout ? level.layout : null);
    applyBeatGates(level && level.layout ? level.layout : null);
    applySpectrumShields(level && level.layout ? level.layout : null);
    applyProducers(level && level.layout ? level.layout : null);
    applySpreaders(level && level.layout ? level.layout : null);
    applyFluxBlockers(level);
    resetPhaseAndFuseState();
  }

  function applyFluxBlockers(level) {
    // Shields are BLOCKERS: a shield cell is masked (gems fall through it, no
    // matching through it) and drawn as the neon wall; tileCharges holds its hit
    // count. You break it by clearing a match orthogonally adjacent; on break it
    // un-masks and the collapse fills it. Runs after the other mask-carvers so a
    // shield never lands on a node/producer cell.
    var layout = level && level.layout ? level.layout : null;
    var strength = layout && layout.strength ? layout.strength : 0;
    tileCharges = [];
    for (var row = 0; row < GRID; row += 1) {
      tileCharges[row] = [];
      for (var col = 0; col < GRID; col += 1) tileCharges[row][col] = 0;
    }
    // Pattern-based shields, capped so procedural boards stay sparse (checker-
    // board-thinned via isFluxCell, then hard-capped) — no dense hole masses.
    if (strength > 0 && layout && layout.pattern && layout.pattern !== "none") {
      var placed = 0;
      var MAX_PATTERN_BLOCKERS = 7;
      for (var r = 0; r < GRID && placed < MAX_PATTERN_BLOCKERS; r += 1) {
        for (var c = 0; c < GRID && placed < MAX_PATTERN_BLOCKERS; c += 1) {
          if (isCellActive(r, c) && !isBeatGateCell(r, c) && isFluxCell(layout.pattern, r, c)) {
            tileCharges[r][c] = strength;
            boardMask[r][c] = false; // blocker hole until broken
            placed += 1;
          }
        }
      }
    }
    // Explicit hand-placed shields (sparse; each is individually breakable).
    (layout && layout.blockers ? layout.blockers : []).forEach(function (b) {
      if (b.row < 0 || b.row >= GRID || b.col < 0 || b.col >= GRID) return;
      if (!isCellActive(b.row, b.col)) return;
      tileCharges[b.row][b.col] = b.strength || strength || 1;
      boardMask[b.row][b.col] = false;
    });
  }

  function resetPhaseAndFuseState() {
    // Locks and wires attach to gems, so they re-apply after the board
    // builds (applyPhaseLocks / applyFuseWires); this just clears state.
    phaseLockList = [];
    phaseLockMap = {};
    fuseNetworkList = [];
    fuseQueue = [];
    fusePulses = [];
  }

  function applySignalNodes(layout) {
    signalNodeMap = {};
    signalNodeList = [];
    (layout && layout.signals ? layout.signals : []).forEach(function (cell) {
      // Feel lock: nodes never occupy the top two rows.
      if (cell.row < 2 || cell.row >= GRID || cell.col < 0 || cell.col >= GRID) return;
      if (!isCellActive(cell.row, cell.col)) return;
      var key = cell.row + ":" + cell.col;
      if (signalNodeMap[key]) return;
      signalNodeMap[key] = true;
      signalNodeList.push({ row: cell.row, col: cell.col, flashAt: 0 });
      // Static masked cell: it never holds a piece; falls pass through the
      // hole like any other mask cut, so columns below never starve.
      boardMask[cell.row][cell.col] = false;
    });
  }

  function applyProducers(layout) {
    producerMap = {};
    producerList = [];
    (layout && layout.producers ? layout.producers : []).forEach(function (cell) {
      // Feel lock: producers never occupy the top two rows (same as gates/nodes).
      if (cell.row < 2 || cell.row >= GRID || cell.col < 0 || cell.col >= GRID) return;
      if (!isCellActive(cell.row, cell.col)) return;
      var key = cell.row + ":" + cell.col;
      if (producerMap[key]) return;
      producerMap[key] = true;
      producerList.push({ row: cell.row, col: cell.col, emitIndex: 0, flashAt: 0, beamTo: null });
      // Static masked cell: it never holds a piece; it emits into its neighbors.
      boardMask[cell.row][cell.col] = false;
    });
  }

  function producerEmitType() {
    var goals = currentLevel && currentLevel.goals ? currentLevel.goals : [];
    for (var i = 0; i < goals.length; i += 1) {
      if (goals[i].kind === "collect" && typeof goals[i].type === "number") return goals[i].type;
    }
    return currentLevel && currentLevel.modifiers ? currentLevel.modifiers.colorBias : 0;
  }

  function producerWouldRun(row, col, type) {
    // Would setting (row,col) to `type` complete a 3+ run at that cell?
    var count = 1;
    for (var c = col - 1; c >= 0 && board[row] && board[row][c] && board[row][c].type === type; c -= 1) count += 1;
    for (var c2 = col + 1; c2 < GRID && board[row] && board[row][c2] && board[row][c2].type === type; c2 += 1) count += 1;
    if (count >= 3) return true;
    count = 1;
    for (var r = row - 1; r >= 0 && board[r] && board[r][col] && board[r][col].type === type; r -= 1) count += 1;
    for (var r2 = row + 1; r2 < GRID && board[r2] && board[r2][col] && board[r2][col].type === type; r2 += 1) count += 1;
    return count >= 3;
  }

  function pickProducerTarget(producer, type) {
    // Rotate through the 4 neighbors; pick the first that holds a plain gem of
    // another color whose conversion won't hand the player a free match.
    var offsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (var step = 0; step < 4; step += 1) {
      var idx = (producer.emitIndex + step) % 4;
      var row = producer.row + offsets[idx][0];
      var col = producer.col + offsets[idx][1];
      if (row < 0 || row >= GRID || col < 0 || col >= GRID) continue;
      if (!isCellActive(row, col)) continue;
      var gem = board[row] && board[row][col];
      if (!gem || gem.special || gem.locked) continue;
      if (gem.type === type) continue;
      if (producerWouldRun(row, col, type)) continue;
      producer.emitIndex = (idx + 1) % 4;
      return { row: row, col: col };
    }
    return null;
  }

  function emitProducers() {
    if (producerList.length === 0) return;
    var type = producerEmitType();
    var now = performance.now();
    var emitted = false;
    producerList.forEach(function (producer) {
      var target = pickProducerTarget(producer, type);
      if (!target) return;
      var gem = board[target.row][target.col];
      if (!gem) return;
      gem.type = type;
      gem.pop = Math.max(gem.pop, 0.55);
      gem.birth = Math.max(gem.birth || 0, 0.4);
      gem.spin = (gem.spin || 0) + 0.4;
      producer.flashAt = now;
      producer.beamTo = { row: target.row, col: target.col, at: now };
      var tx = view.boardX + target.col * view.cell + view.cell / 2;
      var ty = view.boardY + target.row * view.cell + view.cell / 2;
      addShockwave(tx, ty, TYPES[type].color, view.cell * 0.08, view.cell * 0.5, 0.2, 5);
      emitted = true;
    });
    if (emitted) {
      setTargets();
      if (typeof playSpectrumSegment === "function") playSpectrumSegment(type);
    }
  }

  function applySpreaders(layout) {
    spreaderMap = {};
    spreaderList = [];
    spreaderMoveCount = 0;
    (layout && layout.spreaders ? layout.spreaders : []).forEach(function (cell) {
      // Feel lock: infections never seed in the top two rows.
      if (cell.row < 2 || cell.row >= GRID || cell.col < 0 || cell.col >= GRID) return;
      if (!isCellActive(cell.row, cell.col)) return;
      var key = cell.row + ":" + cell.col;
      if (spreaderMap[key]) return;
      spreaderMap[key] = true;
      // Infected cells keep their gem (you clear the infection by matching it).
      spreaderList.push({ row: cell.row, col: cell.col, born: 0, spawnAt: 0, contained: false });
    });
  }

  function pickSpreadTarget(sp) {
    // First eligible orthogonal neighbor that holds a plain gem and isn't
    // already infected; start offset rotates so the creep isn't always downward.
    var offsets = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    var start = spreaderMoveCount % 4;
    for (var i = 0; i < 4; i += 1) {
      var o = offsets[(start + i) % 4];
      var r = sp.row + o[0];
      var c = sp.col + o[1];
      if (r < 0 || r >= GRID || c < 0 || c >= GRID) continue;
      if (!isCellActive(r, c)) continue;
      if (spreaderMap[r + ":" + c]) continue;
      var gem = board[r] && board[r][c];
      if (!gem || gem.special || gem.locked) continue;
      return { row: r, col: c };
    }
    return null;
  }

  function pickReseedCell() {
    // A plain gem cell (not the top two rows, not already infected/special).
    var start = spreaderMoveCount * 7 + 3;
    for (var k = 0; k < GRID * GRID; k += 1) {
      var idx = (start + k) % (GRID * GRID);
      var r = Math.floor(idx / GRID);
      var c = idx % GRID;
      if (r < 2) continue;
      if (!isCellActive(r, c)) continue;
      if (spreaderMap[r + ":" + c]) continue;
      var gem = board[r] && board[r][c];
      if (!gem || gem.special || gem.locked) continue;
      return { row: r, col: c };
    }
    return null;
  }

  function stepSpreaders() {
    if (spreaderList.length === 0) {
      // Keep the creep alive while its clear-goal is still open, so the level
      // is always completable even if the player clears every infection early.
      var openGoal = (currentLevel && currentLevel.goals ? currentLevel.goals : []).find(function (g) {
        return g.kind === "spread";
      });
      if (openGoal && levelStats.spreadCleared < openGoal.target) {
        var seed = pickReseedCell();
        if (seed) {
          spreaderMap[seed.row + ":" + seed.col] = true;
          spreaderList.push({ row: seed.row, col: seed.col, born: performance.now(), spawnAt: performance.now(), contained: false });
        }
      }
      return;
    }
    spreaderMoveCount += 1;
    if (spreaderMoveCount % SPREAD_EVERY === 0 && spreaderList.length < SPREAD_CAP) {
      var newborns = [];
      spreaderList.forEach(function (sp) {
        if (sp.contained) return; // a clear next to it held it back this cycle
        if (spreaderList.length + newborns.length >= SPREAD_CAP) return;
        var target = pickSpreadTarget(sp);
        if (!target) return;
        spreaderMap[target.row + ":" + target.col] = true;
        newborns.push(target);
        var x = view.boardX + target.col * view.cell + view.cell / 2;
        var y = view.boardY + target.row * view.cell + view.cell / 2;
        addShockwave(x, y, SPREAD_COLOR, view.cell * 0.06, view.cell * 0.42, 0.18, 4);
      });
      newborns.forEach(function (t) {
        spreaderList.push({ row: t.row, col: t.col, born: performance.now(), spawnAt: performance.now(), contained: false });
      });
    }
    // Reset containment for the next cycle.
    spreaderList.forEach(function (sp) { sp.contained = false; });
  }

  function clearSpreaders(cells) {
    if (spreaderList.length === 0 || cells.length === 0) return;
    cells.forEach(function (cell) {
      var key = cell.row + ":" + cell.col;
      if (!spreaderMap[key]) return;
      delete spreaderMap[key];
      spreaderList = spreaderList.filter(function (s) {
        return !(s.row === cell.row && s.col === cell.col);
      });
      levelStats.spreadCleared += 1;
      var x = view.boardX + cell.col * view.cell + view.cell / 2;
      var y = view.boardY + cell.row * view.cell + view.cell / 2;
      addShockwave(x, y, SPREAD_COLOR, view.cell * 0.12, view.cell * 0.72, 0.24, 6);
    });
    // Containment: any infection orthogonally next to a cleared cell is held
    // back on the next spread tick (clearing beside it keeps it in check).
    spreaderList.forEach(function (sp) {
      var adjacent = cells.some(function (cell) {
        return Math.abs(cell.row - sp.row) + Math.abs(cell.col - sp.col) === 1;
      });
      if (adjacent) sp.contained = true;
    });
  }

  function applySpectrumShields(layout) {
    spectrumMap = {};
    spectrumList = [];
    (layout && layout.spectrum ? layout.spectrum : []).forEach(function (entry) {
      if (entry.row < 0 || entry.row >= GRID || entry.col < 0 || entry.col >= GRID) return;
      if (!isCellActive(entry.row, entry.col)) return;
      var key = entry.row + ":" + entry.col;
      if (spectrumMap[key]) return;
      var shield = {
        row: entry.row,
        col: entry.col,
        colors: (entry.colors || []).slice(),
        remaining: (entry.colors || []).slice(),
        segmentFlash: {},
        brokeAt: 0
      };
      spectrumMap[key] = shield;
      spectrumList.push(shield);
    });
  }

  function isCellActive(row, col) {
    if (row < 0 || row >= GRID || col < 0 || col >= GRID) return false;
    if (!boardMask || boardMask.length !== GRID) boardMask = buildBoardMask(currentBoardShape || "full");
    return Boolean(boardMask[row] && boardMask[row][col]);
  }

  function applyBeatGates(layout) {
    beatGateMap = {};
    beatGateList = [];
    beatGateMoveCount = 0;
    beatGateOpenMoves = layout && layout.gateOpenMoves ? layout.gateOpenMoves : 2;
    beatGateClosedMoves = layout && layout.gateClosedMoves ? layout.gateClosedMoves : 2;
    beatGateOffset = layout && layout.gateOffset ? layout.gateOffset : 0;
    (layout && layout.gates ? layout.gates : []).forEach(function (cell) {
      // Feel lock: gates never occupy the top two rows.
      if (cell.row < 2 || cell.row >= GRID || cell.col < 0 || cell.col >= GRID) return;
      if (!isCellActive(cell.row, cell.col)) return;
      var key = cell.row + ":" + cell.col;
      if (beatGateMap[key]) return;
      beatGateMap[key] = true;
      beatGateList.push({ row: cell.row, col: cell.col });
    });
    beatGatePhaseOpen = isBeatGateOpenAt(0);
    beatGateAnim = 1;
    beatGateFlash = 0;
  }

  function isBeatGateOpenAt(moves) {
    var cycle = beatGateOpenMoves + beatGateClosedMoves;
    if (cycle <= 0) return true;
    return (moves + beatGateOffset) % cycle < beatGateOpenMoves;
  }

  function isBeatGateCell(row, col) {
    return Boolean(beatGateMap[row + ":" + col]);
  }

  function isBeatGateClosed(row, col) {
    return beatGateList.length > 0 && !beatGatePhaseOpen && Boolean(beatGateMap[row + ":" + col]);
  }

  function movesUntilBeatGateToggle() {
    var cycle = beatGateOpenMoves + beatGateClosedMoves;
    if (beatGateList.length === 0 || cycle <= 0) return 0;
    var index = (beatGateMoveCount + beatGateOffset) % cycle;
    return beatGatePhaseOpen ? beatGateOpenMoves - index : cycle - index;
  }

  function advanceBeatGates() {
    if (beatGateList.length === 0) return;
    beatGateMoveCount += 1;
    var open = isBeatGateOpenAt(beatGateMoveCount);
    if (open === beatGatePhaseOpen) return;
    beatGatePhaseOpen = open;
    beatGateAnim = 0;
    if (!open) {
      // Closed = solid wall: the shutter holds no piece. Anything caught
      // inside dissolves (no score, no noise added to the mix).
      var trapped = beatGateList.filter(function (cell) {
        return Boolean(board[cell.row] && board[cell.row][cell.col]);
      });
      if (trapped.length > 0) burstMatches(trapped, 1);
      trapped.forEach(function (cell) {
        board[cell.row][cell.col] = null;
      });
    }
    playBeatGateToggle(!open);
    vibrate("swap");
  }

  function isFluxCell(pattern, row, col) {
    // Shields are blockers now: thin every pattern to a checkerboard so no two
    // shields sit orthogonally adjacent. That keeps each one individually
    // breakable (never a solid unbreakable mass) and leaves the board with
    // enough active cells to always have a move. countFluxCells reuses this, so
    // procedural flux goals stay reachable.
    if ((row + col) % 2 !== 0) return false;
    if (pattern === "corners") return (row < 2 || row > 5) && (col < 2 || col > 5);
    if (pattern === "cross") return row === 3 || row === 4 || col === 3 || col === 4;
    if (pattern === "ring") return row === 1 || row === 6 || col === 1 || col === 6;
    if (pattern === "diagonal") return row === col || row + col === GRID - 1;
    if (pattern === "center") return row >= 2 && row <= 5 && col >= 2 && col <= 5;
    if (pattern === "checker") return row > 0 && row < 7 && col > 0 && col < 7 && (row + col) % 2 === 0;
    return false;
  }

  function createLevelStats() {
    return {
      collected: {},
      specialsCreated: 0,
      specialsActivated: 0,
      fusions: 0,
      maxChain: 0,
      overdrives: 0,
      pulseReleases: 0,
      fluxCleared: 0,
      signalCollected: 0,
      spreadCleared: 0,
      movesMade: 0,
      biggestClear: 0,
      bestMatchScore: 0,
      goalAnnouncements: {},
      clipScore: 0,
      clipReason: "Opening run",
      // Waveform artifact capture: play-time clock, one intensity bucket per
      // musical bar (4 beats at the level's effective BPM), and overlay
      // events (special / release / flatline). Spoiler-free by design: it
      // records how the take sounded, never the board or goal solutions.
      takeSeconds: 0,
      barIntensity: [],
      barEvents: []
    };
  }

  function readCampaignSave() {
    try {
      var raw = window.localStorage.getItem("neon-lattice-campaign");
      if (!raw) return defaultCampaignSave();
      var parsed = JSON.parse(raw);
      return {
        unlocked: Math.min(campaign.length, Math.max(1, Number(parsed.unlocked) || 1)),
        stars: parsed.stars || {},
        boosters: normalizeBoosters(parsed.boosters),
        rewards: parsed.rewards || {},
        reveals: parsed.reveals || {},
        missions: normalizeMissionState(parsed.missions),
        streak: normalizeStreakState(parsed.streak),
        daily: normalizeDailyState(parsed.daily),
        event: normalizeWeeklyEventState(parsed.event),
        attempts: normalizeLevelAttempts(parsed.attempts),
        failStreaks: normalizeLevelAttempts(parsed.failStreaks),
        wallet: normalizeWallet(parsed.wallet),
        purchases: normalizePurchases(parsed.purchases),
        hums: normalizeHums(parsed.hums)
      };
    } catch (error) {
      return defaultCampaignSave();
    }
  }

  function defaultCampaignSave() {
    return {
      unlocked: 1,
      stars: {},
      boosters: { hammer: 1, shuffle: 1, charge: 1 },
      rewards: {},
      reveals: {},
      missions: normalizeMissionState(null),
      streak: normalizeStreakState(null),
      daily: normalizeDailyState(null),
      event: normalizeWeeklyEventState(null),
      attempts: {},
      failStreaks: {},
      wallet: normalizeWallet(null),
      purchases: {},
      hums: {}
    };
  }

  // Hum recording progress: each track's Hum draws in one of HUM_SEGMENTS
  // outline strokes per level clear, then wakes on the Finale. Old saves have
  // no hums field, so this migrates them to an empty ledger.
  function normalizeHums(hums) {
    var source = hums || {};
    var output = {};
    // Whitelist to canonical Hum ids so stray/legacy keys don't accumulate,
    // and treat only an explicit awake===true as awake (not any truthy value).
    HUM_IDS.forEach(function (key) {
      if (!source[key]) return;
      var entry = source[key] || {};
      output[key] = {
        segments: Math.max(0, Math.min(HUM_SEGMENTS, Math.floor(Number(entry.segments) || 0))),
        awake: entry.awake === true
      };
    });
    return output;
  }

  function ensureHumState(humId) {
    campaignSave.hums = normalizeHums(campaignSave.hums);
    if (!campaignSave.hums[humId]) campaignSave.hums[humId] = { segments: 0, awake: false };
    return campaignSave.hums[humId];
  }

  // True once a track's Hum has woken on its Finale win card. Reads the migrated
  // save (missing/old entries count as asleep) so cameos omit cleanly.
  function isHumAwake(humId) {
    return Boolean(humId && campaignSave.hums && campaignSave.hums[humId] && campaignSave.hums[humId].awake);
  }

  // The freshest woken Hum id: the one just woken this session if it is still
  // awake, else the highest-track awake Hum (Hums wake in track order, so that is
  // the newest by progression). Lets a win card cameo the collection even on the
  // first level of a new track (whose own Hum is still asleep). Runtime only.
  function latestAwakeHumId() {
    if (greenroomSpotlightHum && isHumAwake(greenroomSpotlightHum)) return greenroomSpotlightHum;
    for (var i = HUM_IDS.length - 1; i >= 0; i -= 1) {
      if (isHumAwake(HUM_IDS[i])) return HUM_IDS[i];
    }
    return null;
  }

  function normalizeWallet(wallet) {
    var credits = wallet && Number.isFinite(Number(wallet.credits)) ? Number(wallet.credits) : 250;
    return {
      credits: Math.max(0, credits)
    };
  }

  function normalizePurchases(purchases) {
    var output = {};
    Object.keys(purchases || {}).forEach(function (key) {
      output[key] = Math.max(0, Number(purchases[key]) || 0);
    });
    return output;
  }

  function normalizeLevelAttempts(attempts) {
    var output = {};
    Object.keys(attempts || {}).forEach(function (key) {
      var value = Math.max(0, Number(attempts[key]) || 0);
      if (value > 0) output[key] = value;
    });
    return output;
  }

  function registerLevelAttempt(levelId) {
    return commitLevelAttempt(levelId, peekLevelAttempt(levelId));
  }

  function peekLevelAttempt(levelId) {
    campaignSave.attempts = normalizeLevelAttempts(campaignSave.attempts);
    var key = String(levelId);
    return (campaignSave.attempts[key] || 0) + 1;
  }

  function commitLevelAttempt(levelId, attempt) {
    campaignSave.attempts = normalizeLevelAttempts(campaignSave.attempts);
    var key = String(levelId);
    var next = Math.max(campaignSave.attempts[key] || 0, Math.floor(attempt) || 0);
    if (next <= (campaignSave.attempts[key] || 0)) return campaignSave.attempts[key] || 0;
    campaignSave.attempts[key] = next;
    writeCampaignSave();
    return next;
  }

  function commitCurrentLevelAttempt() {
    if (gameMode !== MODE_CAMPAIGN || !currentLevel) return;
    currentLevelAttempt = commitLevelAttempt(currentLevel.id, currentLevelAttempt || peekLevelAttempt(currentLevel.id));
  }

  function claimCampaignStartRewards() {
    if (gameMode !== MODE_CAMPAIGN) return;
    if (ensureDailyStreak(true)) updateHud();
  }

  function claimRunStartRewards() {
    if (gameMode === MODE_CAMPAIGN) {
      claimCampaignStartRewards();
      return;
    }
    if (ensureDailyStreak(true)) updateHud();
  }

  function getCampaignRunSeed(level, attempt) {
    return hashString("neon-lattice-run:" + level.id + ":" + level.seed + ":" + attempt);
  }

  function getCampaignSeedLabel(level, attempt) {
    var seed = getCampaignRunSeed(level, attempt || 1);
    return "L" + level.id + "-A" + (attempt || 1) + "-" + seed.toString(36).toUpperCase();
  }

  function getLevelModifierLabel(level) {
    if (!level || !level.modifiers) return "Standard";
    var type = TYPES[level.modifiers.colorBias] || TYPES[0];
    return type.name + " bias, +" + level.modifiers.tempoLift + " BPM";
  }

  function normalizeBoosters(boosters) {
    return {
      hammer: Math.max(0, Number(boosters && boosters.hammer) || 0),
      shuffle: Math.max(0, Number(boosters && boosters.shuffle) || 0),
      charge: Math.max(0, Number(boosters && boosters.charge) || 0)
    };
  }

  function normalizeMissionState(state) {
    var today = getDailyId();
    if (!state || state.date !== today) {
      return {
        date: today,
        progress: {},
        claimed: {}
      };
    }

    return {
      date: today,
      progress: state.progress || {},
      claimed: state.claimed || {}
    };
  }

  function ensureMissionState() {
    var previous = campaignSave.missions && campaignSave.missions.date;
    campaignSave.missions = normalizeMissionState(campaignSave.missions);
    return previous !== campaignSave.missions.date;
  }

  // Rolling window for date-keyed save maps. Entries older than this are
  // dropped on load so claimedDates/patchedDates/daily.takes can't grow
  // unbounded across the life of a save.
  var SAVE_DATE_WINDOW_DAYS = 60;

  function getSaveDateCutoff() {
    var now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - SAVE_DATE_WINDOW_DAYS);
  }

  // Copy a YYYYMMDD-keyed map, dropping entries older than the rolling window.
  // Keys that don't parse as dates pass through so unrelated data still migrates.
  function pruneDatedKeys(map) {
    var output = {};
    if (!map) return output;
    var cutoff = getSaveDateCutoff();
    Object.keys(map).forEach(function (key) {
      var date = dailyIdToDate(key);
      if (date && date < cutoff) return;
      output[key] = map[key];
    });
    return output;
  }

  function normalizeStreakState(state) {
    return {
      current: Math.max(0, Number(state && state.current) || 0),
      best: Math.max(0, Number(state && state.best) || 0),
      lastDate: String((state && state.lastDate) || ""),
      claimedDates: pruneDatedKeys(state && state.claimedDates),
      passes: Math.max(0, Math.min(BACKSTAGE_PASS_MAX, Math.floor(Number(state && state.passes) || 0))),
      patchedDates: pruneDatedKeys(state && state.patchedDates)
    };
  }

  function normalizeDailyState(state) {
    var takes = {};
    var cutoff = getSaveDateCutoff();
    Object.keys((state && state.takes) || {}).forEach(function (key) {
      if (!/^\d{8}$/.test(key)) return;
      var takeDate = dailyIdToDate(key);
      if (takeDate && takeDate < cutoff) return;
      var entry = state.takes[key];
      takes[key] = {
        count: Math.max(0, Math.floor(Number(entry && entry.count) || 0)),
        best: Math.max(0, Math.floor(Number(entry && entry.best) || 0))
      };
    });
    return { takes: takes };
  }

  function getDailyTakeEntry(id) {
    campaignSave.daily = normalizeDailyState(campaignSave.daily);
    return campaignSave.daily.takes[id] || { count: 0, best: 0 };
  }

  function isDailyRehearsal() {
    return gameMode === MODE_DAILY && dailyRunTake > DAILY_TAKE_LIMIT;
  }

  function getDailyTakeLabel() {
    if (isDailyRehearsal()) return "Rehearsal";
    return "Take " + Math.min(dailyRunTake, DAILY_TAKE_LIMIT) + "/" + DAILY_TAKE_LIMIT;
  }

  function getDailyTakeValue() {
    if (isDailyRehearsal()) return "Rehearsal";
    return Math.min(dailyRunTake, DAILY_TAKE_LIMIT) + "/" + DAILY_TAKE_LIMIT;
  }

  function recordDailyTake() {
    if (gameMode !== MODE_DAILY || isDailyRehearsal()) return;
    campaignSave.daily = normalizeDailyState(campaignSave.daily);
    var entry = campaignSave.daily.takes[dailyId] || { count: 0, best: 0 };
    entry.count = Math.min(DAILY_TAKE_LIMIT, entry.count + 1);
    entry.best = Math.max(entry.best, score);
    campaignSave.daily.takes[dailyId] = entry;
    writeCampaignSave();
  }

  function getDailyNumber(id) {
    var date = dailyIdToDate(id || dailyId);
    if (!date) return 1;
    return Math.max(1, Math.round((date.getTime() - DAILY_NUMBER_EPOCH.getTime()) / 86400000));
  }

  function getDailyPalette(id) {
    // Canonical daily track: one hash over the whole album, unlock state
    // ignored, never player-swappable in Daily (synthesis 15).
    return MUSIC_PALETTES[hashString("daily-track:" + (id || dailyId)) % MUSIC_PALETTES.length];
  }

  function getDailyTrackTitle(id) {
    return "Daily #" + getDailyNumber(id) + " on " + getDailyPalette(id).label;
  }

  function getMissedDailyIds(previousId, nextId) {
    var previous = dailyIdToDate(previousId);
    var next = dailyIdToDate(nextId);
    if (!previous || !next || next <= previous) return [];
    var missed = [];
    var cursor = new Date(previous.getFullYear(), previous.getMonth(), previous.getDate() + 1);
    while (getDailyId(cursor) !== getDailyId(next) && missed.length <= 3) {
      missed.push(getDailyId(cursor));
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1);
    }
    return missed;
  }

  function getDailyWeekdayName(id) {
    var date = dailyIdToDate(id);
    return date ? WEEKDAY_NAMES[date.getDay()] : "";
  }

  function getStreakDisplayState() {
    campaignSave.streak = normalizeStreakState(campaignSave.streak);
    var lastDate = campaignSave.streak.lastDate;
    var today = getDailyId();
    if (!lastDate || campaignSave.streak.current <= 0) return "fresh";
    if (lastDate === today || isNextDailyId(lastDate, today)) return "live";
    var missed = getMissedDailyIds(lastDate, today);
    if (missed.length === 1 && campaignSave.streak.passes > 0) return "covered";
    return "paused";
  }

  function ensureDailyStreak(showFx) {
    campaignSave.streak = normalizeStreakState(campaignSave.streak);
    var today = getDailyId();
    if (campaignSave.streak.claimedDates[today]) return false;

    var previousDate = campaignSave.streak.lastDate;
    var previousCurrent = campaignSave.streak.current;
    var current = previousCurrent;
    var passLine = "";
    if (!previousDate) {
      current = 1;
    } else if (isNextDailyId(previousDate, today)) {
      current += 1;
    } else if (previousDate !== today) {
      var missed = getMissedDailyIds(previousDate, today);
      if (missed.length === 1 && campaignSave.streak.passes > 0) {
        // Backstage Pass: the single missed day gets patched and the streak
        // keeps playing. One quiet line, no red state (synthesis 17).
        campaignSave.streak.passes -= 1;
        campaignSave.streak.claimedDates[missed[0]] = true;
        campaignSave.streak.patchedDates[missed[0]] = true;
        current += 2;
        passLine = "BACKSTAGE PASS COVERED " + getDailyWeekdayName(missed[0]).toUpperCase();
      } else {
        // Paused, never lost: the best run stays on the record.
        current = 1;
      }
    }

    campaignSave.streak.current = current;
    campaignSave.streak.best = Math.max(campaignSave.streak.best, current);
    campaignSave.streak.lastDate = today;
    campaignSave.streak.claimedDates[today] = true;
    if (current > previousCurrent && Math.floor(current / 7) > Math.floor(previousCurrent / 7) && campaignSave.streak.passes < BACKSTAGE_PASS_MAX) {
      campaignSave.streak.passes += 1;
      if (showFx) addCallout("BACKSTAGE PASS EARNED", "#ffd166", 18);
    }

    var reward = getStreakReward(current);
    grantRewardBundle(reward.rewards);
    if (showFx) {
      if (passLine) addCallout(passLine, "#46f4ff", 18);
      recordGrant("Streak day " + current, "+" + describeRewardBundle(reward.rewards));
      showDailyStreakReward(current, reward);
    }
    writeCampaignSave();
    return true;
  }

  function getStreakReward(streakCount) {
    var index = Math.min(STREAK_REWARDS.length - 1, Math.max(0, streakCount - 1));
    return STREAK_REWARDS[index];
  }

  function showDailyStreakReward(streakCount, reward) {
    if (getCompletedLevels() === 0 && streakCount <= 1) return;
    var label = describeRewardBundle(reward.rewards);
    addCallout("DAILY STREAK " + streakCount + " +" + label, "#ffd166", 20);
    flyRewardBundle(centerBoardX(), centerBoardY(), reward.rewards, 0);
    addShockwave(centerBoardX(), centerBoardY(), "#46f4ff", view.cell * 0.18, view.cell * 1.35, 0.3, 10);
    playBoosterHit("shuffle");
    vibrate("special");
    if (streakCount > 1 || getCompletedLevels() > 0) queueCoachTip("streak");
  }

  function getStreakHudText() {
    campaignSave.streak = normalizeStreakState(campaignSave.streak);
    var count = campaignSave.streak.current || 0;
    if (count <= 0) return "Streak 0";
    return "Streak " + count + "d";
  }

  function getStreakMapText() {
    campaignSave.streak = normalizeStreakState(campaignSave.streak);
    var count = campaignSave.streak.current || 0;
    if (count <= 0) return "0 days";
    return count + " day" + (count === 1 ? "" : "s");
  }

  function normalizeWeeklyEventState(state) {
    var weekId = getWeeklyEventId();
    if (!state || state.weekId !== weekId) {
      return {
        weekId: weekId,
        points: 0,
        claimed: {}
      };
    }

    return {
      weekId: weekId,
      points: Math.max(0, Number(state.points) || 0),
      claimed: state.claimed || {}
    };
  }

  function ensureWeeklyEventState() {
    var previous = campaignSave.event && campaignSave.event.weekId;
    campaignSave.event = normalizeWeeklyEventState(campaignSave.event);
    return previous !== campaignSave.event.weekId;
  }

  function recordWeeklyEventPoints(points, reason, showFx) {
    var value = Math.max(0, Math.floor(points) || 0);
    if (value <= 0) return;
    ensureWeeklyEventState();
    campaignSave.event.points += value;
    var granted = claimWeeklyEventRewards(showFx);
    if (showFx && granted.length === 0) showWeeklyEventProgress(value, reason);
    writeCampaignSave();
    updateHud();
  }

  function claimWeeklyEventRewards(showFx) {
    ensureWeeklyEventState();
    var granted = [];
    WEEKLY_EVENT_REWARDS.forEach(function (reward) {
      var key = String(reward.threshold);
      if (campaignSave.event.points < reward.threshold || campaignSave.event.claimed[key]) return;
      grantRewardBundle(reward.rewards);
      campaignSave.event.claimed[key] = true;
      granted.push(reward);
      if (showFx) {
        recordGrant(getWeeklyEventName() + " " + reward.threshold, "+" + describeRewardBundle(reward.rewards));
        flyRewardBundle(centerBoardX(), centerBoardY(), reward.rewards, 0);
      }
    });

    if (showFx && granted.length > 0) {
      showWeeklyEventReward(granted[granted.length - 1], granted.length);
    }
    return granted;
  }

  function showWeeklyEventProgress(points, reason) {
    var label = getWeeklyEventName().toUpperCase();
    addCallout(label + " +" + points, "#46f4ff", 18);
  }

  function showWeeklyEventReward(reward, count) {
    var label = describeRewardBundle(reward.rewards);
    addCallout(getWeeklyEventName().toUpperCase() + " " + reward.threshold + " +" + label, "#46f4ff", 20);
    addShockwave(centerBoardX(), centerBoardY(), "#46f4ff", view.cell * 0.18, view.cell * 1.55, 0.34, 11);
    playBoosterHit("charge");
    vibrate("win");
    queueCoachTip("event");
  }

  function getNextWeeklyEventReward() {
    ensureWeeklyEventState();
    for (var i = 0; i < WEEKLY_EVENT_REWARDS.length; i += 1) {
      if (campaignSave.event.points < WEEKLY_EVENT_REWARDS[i].threshold) return WEEKLY_EVENT_REWARDS[i];
    }
    return null;
  }

  function getWeeklyEventMapText() {
    ensureWeeklyEventState();
    var next = getNextWeeklyEventReward();
    if (!next) return formatNumber(campaignSave.event.points);
    return formatNumber(campaignSave.event.points) + "/" + next.threshold;
  }

  function getWeeklyEventShareLine() {
    ensureWeeklyEventState();
    var next = getNextWeeklyEventReward();
    if (!next) return getWeeklyEventName() + ": " + formatNumber(campaignSave.event.points) + " points, complete";
    return getWeeklyEventName() + ": " + formatNumber(campaignSave.event.points) + "/" + next.threshold;
  }

  function getWeeklyEventName() {
    var index = hashString("weekly-event-name:" + getWeeklyEventId()) % WEEKLY_EVENT_NAMES.length;
    return WEEKLY_EVENT_NAMES[index];
  }

  function createDailyMissionTemplates() {
    return [
      { kind: "clear", title: "Clear Shapes", target: 180, reward: { hammer: 1, shuffle: 0, charge: 0 } },
      { kind: "special", title: "Special Charge", target: 10, reward: { hammer: 0, shuffle: 1, charge: 0 } },
      { kind: "fusion", title: "Swap Specials", target: 3, reward: { hammer: 1, shuffle: 0, charge: 1 } },
      { kind: "overdrive", title: "Overdrive Spark", target: 3, reward: { hammer: 0, shuffle: 0, charge: 1 } },
      { kind: "campaignWin", title: "Track Wins", target: 2, reward: { hammer: 1, shuffle: 1, charge: 0 } },
      { kind: "chain", title: "Cascade Hunt", target: 5, reward: { hammer: 0, shuffle: 1, charge: 0 } },
      { kind: "rushTime", title: "Pulse Time", target: 150, reward: { hammer: 0, shuffle: 0, charge: 1 } }
    ];
  }

  function buildDailyMissions(date) {
    var templates = createDailyMissionTemplates();
    var seed = hashString("neon-lattice-missions:" + date);
    var offset = seed % templates.length;
    var missions = [];

    for (var i = 0; i < 3; i += 1) {
      var template = templates[(offset + i * 5) % templates.length];
      missions.push({
        id: "m" + i,
        kind: template.kind,
        title: template.title,
        target: template.target,
        reward: template.reward
      });
    }
    return missions;
  }

  function recordDailyMissionProgress(kind, amount) {
    if (!amount || amount <= 0) return;
    var changed = ensureMissionState();
    var missions = buildDailyMissions(campaignSave.missions.date);

    missions.forEach(function (mission) {
      if (mission.kind !== kind || campaignSave.missions.claimed[mission.id]) return;
      var current = getDailyMissionProgress(mission);
      var next = Math.min(mission.target, current + amount);
      if (next === current) return;
      campaignSave.missions.progress[mission.id] = next;
      changed = true;

      if (next >= mission.target) {
        campaignSave.missions.claimed[mission.id] = true;
        grantRewardBundle(mission.reward);
        recordGrant("Daily: " + mission.title, "+" + describeRewardBundle(mission.reward));
        flyRewardBundle(centerBoardX(), centerBoardY(), mission.reward, 0);
        showDailyMissionReward(mission);
      }
    });

    if (changed) {
      writeCampaignSave();
      updateHud();
    }
  }

  function getDailyMissionProgress(mission) {
    ensureMissionState();
    return Math.max(0, Number(campaignSave.missions.progress[mission.id]) || 0);
  }

  function getActiveDailyMission() {
    ensureMissionState();
    var missions = buildDailyMissions(campaignSave.missions.date);
    for (var i = 0; i < missions.length; i += 1) {
      if (!campaignSave.missions.claimed[missions[i].id]) return missions[i];
    }
    return null;
  }

  function getDailyMissionHudText() {
    var mission = getActiveDailyMission();
    var streakText = getStreakHudText();
    if (!mission) return "Daily missions complete. " + streakText + ".";
    var progress = getDailyMissionProgress(mission);
    return "Daily: " + mission.title + " " + formatMissionValue(progress, mission.kind) + "/" + formatMissionValue(mission.target, mission.kind) + " Reward " + describeRewardBundle(mission.reward) + " | " + streakText;
  }

  function getDailyMissionMapText() {
    var mission = getActiveDailyMission();
    if (!mission) return "Complete";
    return formatMissionValue(getDailyMissionProgress(mission), mission.kind) + "/" + formatMissionValue(mission.target, mission.kind);
  }

  function getDailyMissionShareLine() {
    var mission = getActiveDailyMission();
    if (!mission) return "Daily missions complete.";
    return mission.title + ": " + formatMissionValue(getDailyMissionProgress(mission), mission.kind) + "/" + formatMissionValue(mission.target, mission.kind);
  }

  function getStreakShareLine() {
    campaignSave.streak = normalizeStreakState(campaignSave.streak);
    return (campaignSave.streak.current || 0) + " day current, " + (campaignSave.streak.best || 0) + " day best";
  }

  function formatMissionValue(value, kind) {
    if (kind === "rushTime") return formatRunTime(value);
    return String(Math.floor(value));
  }

  function showDailyMissionReward(mission) {
    var reward = describeRewardBundle(mission.reward);
    addCallout("DAILY " + mission.title.toUpperCase() + " +" + reward, "#ffd166", 22);
    addShockwave(centerBoardX(), centerBoardY(), "#ffd166", view.cell * 0.2, view.cell * 1.5, 0.38, 12);
    vibrate("win");
    playBoosterHit("charge");
  }

  function writeCampaignSave() {
    try {
      window.localStorage.setItem("neon-lattice-campaign", JSON.stringify(campaignSave));
    } catch (error) {
      return;
    }
  }

  function getRenderDprCap() {
    if (!settings.fullFx) return 1.1;
    if (frameQuality.level >= 2) return 1.1;
    if (frameQuality.level === 1) return 1.5;
    return view.width * view.height < 500000 ? 2.0 : 1.5;
  }

  function setHudSheetOpen(open) {
    hudSheetOpen = Boolean(open && hudCollapsed);
    if (hudSheet) {
      hudSheet.classList.toggle("is-open", hudSheetOpen);
      hudSheet.setAttribute("aria-hidden", hudSheetOpen ? "false" : "true");
    }
    if (hudToggle) {
      hudToggle.classList.toggle("is-open", hudSheetOpen);
      hudToggle.setAttribute("aria-expanded", hudSheetOpen ? "true" : "false");
    }
  }

  function applyHudLayout(width) {
    if (!hudPanel || !hudSheet || !hudToggle) return;
    var collapse = width < 600;
    if (collapse === hudCollapsed) return;
    hudCollapsed = collapse;
    var controlsRow = hudPanel.querySelector(".controls") || hudSheet.querySelector(".controls");
    var statLevel = levelEl.parentElement;
    var statBest = bestEl.parentElement;
    var statChain = chainEl.parentElement;
    var statVoices = layersEl.parentElement;
    if (collapse) {
      // Strip keeps Score + Moves + mute icon + chevron; the rest moves into the drop-down sheet.
      hudPanel.insertBefore(audioButton, hudToggle);
      hudSheet.appendChild(statLevel);
      hudSheet.appendChild(statBest);
      hudSheet.appendChild(statChain);
      hudSheet.appendChild(statVoices);
      if (controlsRow) hudSheet.appendChild(controlsRow);
      hudPanel.classList.add("hud--collapsed");
    } else {
      hudPanel.insertBefore(statLevel, movesEl.parentElement);
      hudPanel.insertBefore(statBest, hudToggle);
      hudPanel.insertBefore(statChain, hudToggle);
      hudPanel.insertBefore(statVoices, hudToggle);
      if (controlsRow) {
        hudPanel.insertBefore(controlsRow, hudToggle);
        controlsRow.insertBefore(audioButton, controlsRow.firstChild);
      }
      hudPanel.classList.remove("hud--collapsed");
    }
    setHudSheetOpen(false);
  }

  function resize() {
    if (window.innerWidth < 80 || window.innerHeight < 80) return false;
    var nextDpr = Math.max(1, Math.min(getRenderDprCap(), window.devicePixelRatio || 1));
    if (window.innerWidth === view.width && window.innerHeight === view.height && nextDpr === view.dpr) return false;
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    view.dpr = Math.max(1, Math.min(getRenderDprCap(), window.devicePixelRatio || 1));
    canvas.width = Math.floor(view.width * view.dpr);
    canvas.height = Math.floor(view.height * view.dpr);
    canvas.style.width = view.width + "px";
    canvas.style.height = view.height + "px";
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    applyHudLayout(view.width);

    var topReserve = view.width < 1240 ? 224 : 108;
    var bottomPad = view.width < 600 ? 178 : 112;
    var minUsableHeight = 300;
    var minBoardSize = 280;
    var boardScale = 0.94;
    if (view.width < 600) {
      var shortPhone = view.height < 620;
      topReserve = shortPhone ? 78 : 84;
      bottomPad = shortPhone ? 154 : 164;
      minUsableHeight = shortPhone ? 220 : 300;
      minBoardSize = shortPhone ? 226 : 280;
      boardScale = 0.985;
    }
    topReserve = Math.max(topReserve, getTopChromeReserve(topReserve));
    bottomPad = Math.max(bottomPad, getBottomChromeReserve(bottomPad));
    var usableHeight = Math.max(minUsableHeight, view.height - topReserve - bottomPad);
    var usableWidth = view.width < 600 ? Math.max(300, view.width - 12) : Math.max(280, view.width - 28);
    view.boardSize = Math.floor(Math.min(usableWidth, usableHeight) * boardScale);
    view.boardSize = Math.max(minBoardSize, Math.min(view.boardSize, 690));
    view.cell = view.boardSize / GRID;
    view.boardX = (view.width - view.boardSize) / 2;
    view.boardY = topReserve + (usableHeight - view.boardSize) / 2;

    rebuildStageGradients();
    setTargets();
    return true;
  }

  function forceBoardRelayout() {
    view.width = 0;
    view.height = 0;
    resize();
  }

  function rebuildStageGradients() {
    if (!ctx || !view.boardSize) return;
    var cx = view.width / 2;
    var cy = view.boardY + view.boardSize / 2;
    var outer = Math.max(view.width, view.height);
    stageBgGradient = ctx.createRadialGradient(cx, cy, view.boardSize * 0.25, cx, cy, outer * 0.85);
    stageBgGradient.addColorStop(0, "#0a1120");
    stageBgGradient.addColorStop(0.55, "#060812");
    stageBgGradient.addColorStop(1, "#02030a");
    washCyan = ctx.createRadialGradient(cx, cy, view.boardSize * 0.42, cx, cy, outer * 0.72);
    washCyan.addColorStop(0, "rgba(70,244,255,0)");
    washCyan.addColorStop(1, "#46f4ff");
    washGold = ctx.createRadialGradient(cx, cy, view.boardSize * 0.42, cx, cy, outer * 0.72);
    washGold.addColorStop(0, "rgba(255,209,102,0)");
    washGold.addColorStop(1, "#ffd166");
    vignetteGradient = null;
  }

  function getTopChromeReserve(fallback) {
    if (!hudPanel || !hudPanel.getBoundingClientRect) return fallback;
    try {
      var rect = hudPanel.getBoundingClientRect();
      if (!rect || !Number.isFinite(rect.bottom)) return fallback;
      return Math.ceil(rect.bottom + (view.width < 600 ? 16 : 20));
    } catch (error) {
      return fallback;
    }
  }

  function getBottomChromeReserve(fallback) {
    if (!missionPanel || !missionPanel.getBoundingClientRect) return fallback;
    try {
      var rect = missionPanel.getBoundingClientRect();
      if (!rect || !Number.isFinite(rect.top)) return fallback;
      return Math.ceil(Math.max(0, view.height - rect.top) + (view.width < 600 ? 16 : 20));
    } catch (error) {
      return fallback;
    }
  }

  function setTargets() {
    forEachGem(function (gem, row, col) {
      gem.tx = view.boardX + col * view.cell + view.cell / 2;
      gem.ty = view.boardY + row * view.cell + view.cell / 2;
      if (!Number.isFinite(gem.x)) gem.x = gem.tx;
      if (!Number.isFinite(gem.y)) gem.y = gem.ty;
    });
  }

  function newBoard() {
    guidedMove = null;
    pendingSwap = null;
    if (gameMode === MODE_RUSH) {
      startRush();
      return;
    }
    if (gameMode === MODE_DAILY) {
      startDaily();
      return;
    }
    startLevel(currentLevelIndex);
  }

  function startLevel(index) {
    gameMode = MODE_CAMPAIGN;
    runSerial += 1;
    // Park before closeShareCard: its showNextCoachTip() chain would
    // otherwise surface a queued toast here only for the park to eat it.
    // Parking (not dismissing) requeues a mechanic toast the transition
    // would otherwise swallow before its 6s of read time.
    parkActiveCoachTip();
    closeShareCard();
    closeMap();
    closeStore();
    closeSettings();
    currentLevelIndex = Math.max(0, Math.min(campaign.length - 1, index));
    currentLevel = campaign[currentLevelIndex];
    currentLevelAttempt = isSplashOpen() ? peekLevelAttempt(currentLevel.id) : registerLevelAttempt(currentLevel.id);
    boardRng = createSeededRandom(getCampaignRunSeed(currentLevel, currentLevelAttempt));
    board = [];
    tileCharges = [];
    score = 0;
    combo = 0;
    movesLeft = currentLevel.moves;
    var fails = campaignSave.failStreaks[currentLevel.id] || 0;
    movesLeft += fails >= 5 ? 3 : fails >= 3 ? 2 : 0;
    // Hum payoff (perk): a woken Hum grants +1 move on its own track's levels.
    if (isHumAwake(getHumIdForLevel(currentLevel))) movesLeft += 1;
    mercyBias = fails >= 3 ? 0.18 : 0;
    pulse = 1;
    pulseBank = 0;
    rushSeconds = 0;
    rushCritical = false;
    rushNewBest = false;
    dailyNewBest = false;
    rushSurgeCooldown = 0;
    hudClock = 0;
    levelState = "playing";
    levelStats = createLevelStats();
    resetGrantLedger();
    activeBooster = null;
    selected = null;
    armedSpecial = null;
    pointerStart = null;
    pendingSwap = null;
    resetSwapHint();
    guidedMove = null;
    particles = [];
    beams = [];
    rays = [];
    floaters = [];
    cellFlashes = [];
    calloutQueue = [];
    activeCallout = null;
    celebration = null;
    goalChipFlash = {};
    shockwaves = [];
    animating = false;
    animatingClock = 0;
    flash = 0;
    energy = 0.12;
    drive = 0;
    overdrivePulse = 0;
    meterHotActive = false;
    overdriveExitPulse = 0;
    screenShake = 0;
    audio.layers = [];
    resetMusicPhrase();
    applyAudioPalette();
    // Two straight fails on this level arm a recovery take: the director caps
    // the mix low, half-times the groove, and rebuilds over recoveryBars.
    // Step-relative so a recovery take works whether the clock reset to 0 (normal) or kept
    // running (phase-continuous hand-off after 2 fails on the same level).
    if (fails >= 2) audio.director.recoveryUntilStep = audio.step + AUDIO_TUNING.recoveryBars * 16;
    // Every tier opens with a signature motif layer that rides the whole level:
    // the track hook's seed-derived variant, louder in later tiers.
    audio.levelMotif = computeLevelMotif(currentLevel);
    // Felt-not-heard per-level timbre drift, keyed off the same level seed.
    audio.levelDrift = computeLevelDrift(currentLevel);
    var motifChapter = ((currentLevel.id - 1) % 15) + 1;
    var motifTier = motifChapter <= 5 ? 0 : motifChapter <= 10 ? 1 : 2;
    audio.layers.push({ motif: audio.levelMotif.motif, wave: getMusicPalette().leadWave, gain: AUDIO_TUNING.motifGainByTier[motifTier], pan: 0, filter: 3800, expiresAt: 1e9, persistent: true });
    // Polyloop bed (Eno layers): three persistent loops at coprime bar counts
    // (5/7/11 bars); with the 2-bar pad the full bed realigns only every ~770
    // bars, so idle play never repeats a 2-bar window exactly.
    var loopStepSeconds = (60 / getActiveBpm()) / 4;
    // Drone swell: root an octave down (octave 0.5 halves the layer freq), one bar long.
    audio.layers.push({ degrees: [0], division: AUDIO_TUNING.polyloopPeriods[0], phase: 0, duration: loopStepSeconds * 16, wave: getMusicPalette().padWave, gain: AUDIO_TUNING.polyloopGains[0], pan: -0.12, filter: 900, octave: 0.5, expiresAt: 1e9, persistent: true, polyloop: true });
    // Ghost motif: the track hook's prime form at octave 0, once per 7 bars.
    audio.layers.push({ motif: motifOctave(getTrackMotif(), -1), division: AUDIO_TUNING.polyloopPeriods[1], wave: getMusicPalette().padWave, gain: AUDIO_TUNING.polyloopGains[1], pan: 0.16, filter: 1600, expiresAt: 1e9, persistent: true, polyloop: true });
    // Sparkle ping: degree 5 up high, once per 11 bars.
    audio.layers.push({ degrees: [5], division: AUDIO_TUNING.polyloopPeriods[2], phase: 0, duration: 0.09, wave: "sine", gain: AUDIO_TUNING.polyloopGains[2], pan: 0.3, filter: 4200, octave: 2, expiresAt: 1e9, persistent: true, polyloop: true });
    // Session-gated bloom (Music Variety item 5): two persistent layers pushed every
    // campaign level (startLevel is campaign-only; Rush/Daily never reach here, keeping
    // their pulse-danger mix locks). layerSessionFade reads them at 0 until the whole
    // session (director.sessionStart, set once at graph create) crosses each onset, then
    // ramps them in and holds, so a long take keeps unfolding. polyloop: true so
    // habituation never rotates their identity. Both stay pentatonic-safe on the shared grid.
    // Counter-melody: the hook inverted (axis 2) an octave above the ghost, panned opposite it,
    // airy sine, low gain. Uses the motif-layer render path, gated from counterMelodyOnsetMin.
    audio.layers.push({ motif: motifOctave(motifInvert(getTrackMotif(), 2), 1), wave: getMusicPalette().leadWave, gain: AUDIO_TUNING.counterMelodyGain, pan: -0.16, filter: 2600, voice: VOICE_CHARACTERS.air, sessionOnsetMin: AUDIO_TUNING.counterMelodyOnsetMin, rampMinutes: AUDIO_TUNING.counterMelodyRampMin, expiresAt: 1e9, persistent: true, polyloop: true });
    // Walking sub-bass: roots [0,0,4,4] one note per bar at palette.bassRatio, sub character,
    // gated later (subMovementOnsetMin) so the low end only starts moving deep in a session.
    audio.layers.push({ degrees: [0, 0, 4, 4], division: 16, phase: 0, duration: loopStepSeconds * 14, wave: getMusicPalette().bassWave, gain: AUDIO_TUNING.subMovementGain, pan: 0, filter: 600, octave: getMusicPalette().bassRatio, voice: VOICE_CHARACTERS.sub, sessionOnsetMin: AUDIO_TUNING.subMovementOnsetMin, rampMinutes: AUDIO_TUNING.counterMelodyRampMin, expiresAt: 1e9, persistent: true, polyloop: true });
    // Genre extra layer (music genres seq 5): one genre-conditional persistent layer, tagged
    // genreLayer:true so the seq-9 selector can strip/re-push it on a live genre change. Pop
    // rides an octave-up warm topline hook (the track motif +1 octave); jazz adds an offbeat
    // rhodes comp rolling the chord tones; trip-hop and electronic add nothing. polyloop:true
    // keeps the layer's identity stable against habituation, like the ghost/counter layers, and
    // every degree resolves through getHarmonyToneFreq so the layer stays in-scale on the grid.
    pushGenreExtraLayer();
    // Hum payoff (music): a woken Hum adds a persistent in-key voice ping to its
    // own track, so collecting it permanently enriches that track's soundtrack
    // (music is the identity). Uses the Hum's own voice motif + wave, resolved
    // through the shared scale like every other layer.
    var awakeHumId = getHumIdForLevel(currentLevel);
    if (isHumAwake(awakeHumId)) {
      var awakeHumSpec = findHumSpec(awakeHumId);
      if (awakeHumSpec && awakeHumSpec.voice && awakeHumSpec.voice.motif && awakeHumSpec.voice.motif.deg && awakeHumSpec.voice.motif.deg.length) {
        audio.layers.push({ degrees: [awakeHumSpec.voice.motif.deg[0] || 0], division: 9, phase: 2, duration: 0.11, wave: awakeHumSpec.voice.wave || "triangle", gain: 0.022, pan: 0.22, filter: 3600, octave: 1, expiresAt: 1e9, persistent: true, polyloop: true });
      }
    }
    if (!isSplashOpen()) {
      maybeStartSectorReveal();
      maybeQueueFinaleIntro();
    }

    activeColorSet = computeActiveColorSet(currentLevel); // 4-color trick: restrict early-track palette
    applyBoardShape(currentLevel);
    buildFreshBoard(false);
    applyLevelLayout(currentLevel);
    applyLevelStarterSpecials(currentLevel);
    applyPhaseLocks(currentLevel);
    applyFuseWires(currentLevel);
    // A cage can eat the only legal move: re-guarantee one after locking.
    if (phaseLockList.length > 0 && !hasAnyMove()) forcePlayableMove();
    novaPrimerSwap = null;
    novaPrimerGem = null;
    if (currentLevel.id === 5) plantNovaPrimer();
    setTargets();
    queueLevelCoachTips(currentLevel.id);
    if (!isSplashOpen()) claimCampaignStartRewards();
    if (claimStarRewards(false).length > 0) writeCampaignSave();
    updateHud();
    forceBoardRelayout();
    // Re-kick the toast loop so a parked mechanic tip resurfaces once the
    // new board settles (nothing else kicks it when the queue is untouched).
    showNextCoachTip();
  }

  function startRush() {
    gameMode = MODE_RUSH;
    runSerial += 1;
    parkActiveCoachTip();
    closeShareCard();
    closeMap();
    closeStore();
    closeSettings();
    boardRng = Math.random;
    board = [];
    tileCharges = [];
    score = 0;
    combo = 0;
    movesLeft = 0;
    pulse = 1;
    pulseBank = 0;
    rushSeconds = 0;
    rushCritical = false;
    rushNewBest = false;
    dailyNewBest = false;
    rushSurgeCooldown = 0;
    hudClock = 0;
    levelState = "playing";
    levelStats = createLevelStats();
    resetGrantLedger();
    activeBooster = null;
    selected = null;
    armedSpecial = null;
    pointerStart = null;
    pendingSwap = null;
    resetSwapHint();
    guidedMove = null;
    particles = [];
    beams = [];
    rays = [];
    floaters = [];
    cellFlashes = [];
    calloutQueue = [];
    activeCallout = null;
    celebration = null;
    goalChipFlash = {};
    shockwaves = [];
    animating = false;
    animatingClock = 0;
    flash = 0;
    energy = 0.2;
    drive = 0;
    overdrivePulse = 0;
    meterHotActive = false;
    overdriveExitPulse = 0;
    screenShake = 0;
    audio.layers = [];
    resetMusicPhrase();
    applyAudioPalette();

    applyBoardShape({ layout: { boardShape: "full" } });
    buildFreshBoard(false);
    applyRushLayout();
    setTargets();
    if (!isSplashOpen()) ensureDailyStreak(true);
    addCallout("PULSE RUSH", "#46f4ff", 26);
    updateHud();
    forceBoardRelayout();
    queueCoachTip("rush");
  }

  function startDaily() {
    gameMode = MODE_DAILY;
    runSerial += 1;
    parkActiveCoachTip();
    closeShareCard();
    closeMap();
    closeStore();
    closeSettings();
    dailyId = getDailyId();
    dailySeed = hashString("neon-lattice-daily:" + dailyId);
    dailyBestScore = readDailyBestScore(dailyId);
    dailyRunTake = getDailyTakeEntry(dailyId).count + 1;
    boardRng = createSeededRandom(dailySeed);
    board = [];
    tileCharges = [];
    score = 0;
    combo = 0;
    movesLeft = 0;
    pulse = 1;
    pulseBank = 0;
    rushSeconds = 0;
    rushCritical = false;
    rushNewBest = false;
    dailyNewBest = false;
    rushSurgeCooldown = 0;
    hudClock = 0;
    levelState = "playing";
    levelStats = createLevelStats();
    resetGrantLedger();
    activeBooster = null;
    selected = null;
    armedSpecial = null;
    pointerStart = null;
    pendingSwap = null;
    resetSwapHint();
    guidedMove = null;
    particles = [];
    beams = [];
    rays = [];
    floaters = [];
    cellFlashes = [];
    calloutQueue = [];
    activeCallout = null;
    celebration = null;
    goalChipFlash = {};
    shockwaves = [];
    animating = false;
    animatingClock = 0;
    flash = 0;
    energy = 0.24;
    drive = 0;
    overdrivePulse = 0;
    meterHotActive = false;
    overdriveExitPulse = 0;
    screenShake = 0;
    audio.layers = [];
    resetMusicPhrase();
    applyAudioPalette();

    applyBoardShape({ layout: { boardShape: "full" } });
    buildFreshBoard(false);
    applyRushLayout();
    setTargets();
    if (!isSplashOpen()) ensureDailyStreak(true);
    addCallout(getDailyTrackTitle(dailyId).toUpperCase(), "#ffd166", 24);
    addCallout(isDailyRehearsal() ? "REHEARSAL · UNSCORED" : getDailyTakeLabel().toUpperCase(), "#46f4ff", 18);
    updateHud();
    forceBoardRelayout();
    queueCoachTip("daily");
  }

  function toggleMode() {
    if (gameMode !== MODE_CAMPAIGN) {
      startLevel(currentLevelIndex);
      return;
    }
    startRush();
  }

  function isPulseMode() {
    return gameMode === MODE_RUSH || gameMode === MODE_DAILY;
  }

  function beginAnimation() {
    animating = true;
    animatingClock = 0;
  }

  function markAnimationProgress() {
    animatingClock = 0;
  }

  function endAnimation() {
    animating = false;
    animatingClock = 0;
    cancelPointerCapture();
    flushPendingSwap();
    showNextCoachTip();
    maybeArmNovaPrimerTapGuide();
  }

  function recoverInputLock(reason) {
    if (!animating) return;
    pendingSwap = null;
    endAnimation();
    selected = null;
    armedSpecial = null;
    activeBooster = null;
    guidedMove = null;
    combo = 0;
    addCallout(reason || "INPUT RESET", "#46f4ff", 16);
    updateHud();
  }

  function runLater(delay, callback, token) {
    var serial = token || runSerial;
    if (debugTimeScale !== 1) delay = Math.max(1, Math.round(delay / debugTimeScale));
    window.setTimeout(function () {
      if (serial !== runSerial) return;
      try {
        callback();
      } catch (error) {
        if (window.console && window.console.error) window.console.error(error);
        recoverInputLock("INPUT RESET");
      }
    }, delay);
  }

  // Debut level for each one-time mechanic tip. A tip queued on its debut level
  // but never shown (a skip/jump past it, or a fast guided level) must not leak
  // forward and mask a later level's teaching — the L5 nova primer was showing
  // the L1 "Ion pieces are cyan circles" swap tip this way.
  var TIP_DEBUT_LEVEL = { swap: 1, special: 3, chain: 8, booster: 8, flux: 11, movePressure: 14, gate: 15, overdrive: 32 };

  function queueLevelCoachTips(levelId) {
    // Drop any queued tip that debuts more than one level back (stale forward
    // leak). The one-level grace keeps a just-parked tip from the prior level.
    for (var qi = coachQueue.length - 1; qi >= 0; qi -= 1) {
      var debut = TIP_DEBUT_LEVEL[coachQueue[qi]];
      if (debut && debut < levelId - 1) coachQueue.splice(qi, 1);
    }
    // One tip per debut, on the debut level. Boosters get their tip the
    // level after the first gift (end of 7). Fusion never gets a tip:
    // the seeded pairs at 13 and 26 leave it to discovery.
    if (levelId === 1) queueCoachTip("swap");
    if (levelId === 3) queueCoachTip("special");
    if (levelId === 8) queueCoachTip("chain");
    if (levelId === 8) queueCoachTip("booster");
    if (levelId === 11) queueCoachTip("flux");
    if (levelId === 14) queueCoachTip("movePressure");
    if (levelId === 15) queueCoachTip("gate");
    if (levelId === 32) queueCoachTip("overdrive");
  }

  function applyLevelLayout(level) {
    // applyBoardShape now masks the shield blockers and seeds tileCharges
    // (via applyFluxBlockers).
    applyBoardShape(level);
    // Reachability guard: never ask for more shield-breaks than the board holds
    // (blockers no longer regenerate, and the checkerboard thinning can leave a
    // pattern with fewer hits than the old matchable-gem count).
    if (level && level.goals) {
      var totalHits = 0;
      for (var r = 0; r < GRID; r += 1) {
        for (var c = 0; c < GRID; c += 1) totalHits += (tileCharges[r] && tileCharges[r][c]) || 0;
      }
      level.goals.forEach(function (g) {
        if (g.kind === "flux" && g.target > totalHits) g.target = totalHits;
      });
    }
  }

  function applyLevelStarterSpecials(level) {
    (level.starterSpecials || []).forEach(function (entry) {
      if (entry.row < 0 || entry.row >= GRID || entry.col < 0 || entry.col >= GRID) return;
      if (!isCellActive(entry.row, entry.col)) return;
      var gem = board[entry.row] && board[entry.row][entry.col];
      if (!gem) return;
      gem.special = entry.special;
      gem.pop = Math.max(gem.pop, 0.3);
      gem.trail = Math.max(gem.trail || 0, 0.4);
    });
  }

  function applyPhaseLocks(level) {
    // Phase Locks cage the piece in place: it can't swap, move, fall, or
    // join a run until an orthogonal match of its own color frees it.
    (level.layout && level.layout.locks ? level.layout.locks : []).forEach(function (entry) {
      lockGemAt(entry.row, entry.col, entry.type);
    });
    // starterSpecials entries can carry locked: true — the authored
    // domino where the one right unlock detonates a region.
    (level.starterSpecials || []).forEach(function (entry) {
      if (entry.locked === true) lockGemAt(entry.row, entry.col, null);
    });
  }

  function lockGemAt(row, col, type) {
    // Feel lock: cages never occupy the top two rows.
    if (row < 2 || row >= GRID || col < 0 || col >= GRID) return null;
    if (!isCellActive(row, col) || isBeatGateCell(row, col)) return null;
    var key = row + ":" + col;
    if (phaseLockMap[key]) return null;
    var gem = board[row] && board[row][col];
    if (!gem) return null;
    // Caged pieces never join runs, so forcing the authored color here
    // can't create an instant match.
    if (typeof type === "number") gem.type = ((Math.floor(type) % TYPES.length) + TYPES.length) % TYPES.length;
    gem.locked = true;
    var lock = { row: row, col: col, brokeAt: 0, flashAt: 0 };
    phaseLockMap[key] = lock;
    phaseLockList.push(lock);
    return lock;
  }

  function isPhaseLocked(row, col) {
    return Boolean(phaseLockMap[row + ":" + col]);
  }

  function applyFuseWires(level) {
    (level.layout && level.layout.wires ? level.layout.wires : []).forEach(function (cells) {
      var gems = [];
      (cells || []).forEach(function (cell) {
        if (!isCellActive(cell.row, cell.col)) return;
        var gem = board[cell.row] && board[cell.row][cell.col];
        // Wired cells must hold pre-placed specials (starterSpecials).
        if (!gem || !gem.special || gem.fuse) return;
        gems.push(gem);
      });
      if (gems.length < 2) return;
      var network = { gems: gems, fired: false };
      gems.forEach(function (gem) {
        gem.fuse = network;
      });
      fuseNetworkList.push(network);
    });
  }

  function applyRushLayout() {
    var patterns = ["cross", "diagonal", "ring", "checker"];
    var pattern = patterns[Math.floor(boardRandom() * patterns.length)];
    tileCharges = [];
    applyBoardShape({ layout: { boardShape: "full" } });
    for (var row = 0; row < GRID; row += 1) {
      tileCharges[row] = [];
      for (var col = 0; col < GRID; col += 1) {
        tileCharges[row][col] = isFluxCell(pattern, row, col) ? 1 : 0;
      }
    }
  }

  function buildFreshBoard(falling) {
    var guard = 0;
    do {
      board = [];
      for (var row = 0; row < GRID; row += 1) {
        board[row] = [];
        for (var col = 0; col < GRID; col += 1) {
          board[row][col] = isCellActive(row, col) && !isBeatGateClosed(row, col) ? createGem(pickOpeningType(row, col), row, col, falling) : null;
        }
      }
      guard += 1;
    } while (!hasAnyMove() && guard < 40);
    if (!hasAnyMove()) forcePlayableMove();
    forceTopBandMove();
  }

  function createGem(type, row, col, falling) {
    var tx = view.boardX + col * view.cell + view.cell / 2;
    var ty = view.boardY + row * view.cell + view.cell / 2;
    return {
      type: type,
      row: row,
      col: col,
      x: tx,
      y: falling ? view.boardY - (GRID - row + 1) * view.cell : ty,
      tx: tx,
      ty: ty,
      scale: falling ? 0.78 : 1,
      spin: Math.random() * Math.PI * 2,
      pop: 0,
      birth: falling ? 1 : 0,
      trail: falling ? 0.45 : 0,
      special: null
    };
  }

  function pickOpeningType(row, col) {
    var blocked = {};
    if (col >= 2 && board[row][col - 1] && board[row][col - 2] && board[row][col - 1].type === board[row][col - 2].type) {
      blocked[board[row][col - 1].type] = true;
    }
    if (row >= 2 && board[row - 1][col] && board[row - 2][col] && board[row - 1][col].type === board[row - 2][col].type) {
      blocked[board[row - 1][col].type] = true;
    }
    var choices = activeColorIndices().filter(function (type) {
      return !blocked[type];
    });
    return pickWeightedType(choices);
  }

  // ---- 4-color trick (Royal Match's top "wins feel great" lever) --------------------
  // STRING shipped every board with all 6 colors from L1. Fewer active colors early =
  // denser matches, more specials, more juice, and a gentler on-ramp. The active COUNT
  // scales by track (15-level sector); the active SET always includes every color the
  // level's goals need. Spectrum shields (the only color-specific breakable) only appear
  // at L61+, where the count is already the full 6 -- so a shield color is never dropped.
  // Rush/Daily always use all colors (gated on gameMode in activeColorIndices).
  var activeColorSet = null; // null = all TYPES; a subset array restricts campaign spawns
  var ACTIVE_COLORS_BY_TRACK = [4, 4, 5, 5, 6]; // tracks 1,2,3,4,5+; clamped to TYPES.length
  function activeColorCountForLevel(level) {
    if (!level || !level.id) return TYPES.length;
    var track = Math.floor((level.id - 1) / 15);
    var count = ACTIVE_COLORS_BY_TRACK[Math.min(track, ACTIVE_COLORS_BY_TRACK.length - 1)];
    return Math.max(3, Math.min(TYPES.length, count)); // never below 3 -- a match-3 needs headroom
  }
  function computeActiveColorSet(level) {
    var count = activeColorCountForLevel(level);
    if (count >= TYPES.length) return null; // full palette -> no restriction
    var set = [];
    function add(c) { c = ((c % TYPES.length) + TYPES.length) % TYPES.length; if (set.indexOf(c) === -1) set.push(c); }
    var bias = (level.modifiers && typeof level.modifiers.colorBias === "number") ? level.modifiers.colorBias : (level.id % TYPES.length);
    add(bias); // the "home" color the mix biases toward
    (level.goals || []).forEach(function (g) { if (g && g.kind === "collect" && typeof g.type === "number") add(g.type); });
    var k = 1;
    while (set.length < count && k <= TYPES.length) { add(bias + k); k += 1; } // fill outward from bias
    return set;
  }
  function activeColorIndices() {
    if (gameMode === MODE_CAMPAIGN && activeColorSet) return activeColorSet.slice();
    return TYPES.map(function (_, index) { return index; });
  }

  function randomType() {
    return pickWeightedType(activeColorIndices());
  }

  function forcePlayableMove() {
    if (hasAnyMove()) return true;
    var candidates = getPlayablePatternCandidates();
    for (var index = 0; index < candidates.length; index += 1) {
      if (tryPlayablePattern(candidates[index])) return true;
    }
    return hasAnyMove();
  }

  function forceTopBandMove() {
    if (hasTopBandLegalMove()) return true;
    var candidates = getPlayablePatternCandidates();
    for (var index = 0; index < candidates.length; index += 1) {
      if (!candidateTouchesTopBand(candidates[index])) continue;
      if (tryTopBandPattern(candidates[index])) return true;
    }
    return hasTopBandLegalMove();
  }

  function hasTopBandLegalMove() {
    return getLegalMoves().some(function (move) {
      return move.a.row <= 1 || move.b.row <= 1;
    });
  }

  function candidateTouchesTopBand(candidate) {
    return candidate.cells.some(function (cell) {
      return cell.row <= 1;
    });
  }

  function getPlayablePatternCandidates() {
    var candidates = [];
    for (var row = 0; row < GRID - 1; row += 1) {
      for (var col = 0; col < GRID - 2; col += 1) {
        if (
          isPlayableGemCell(row, col) &&
          isPlayableGemCell(row, col + 1) &&
          isPlayableGemCell(row, col + 2) &&
          isPlayableGemCell(row + 1, col + 1)
        ) {
          candidates.push({
            cells: [
              { row: row, col: col },
              { row: row, col: col + 1 },
              { row: row, col: col + 2 },
              { row: row + 1, col: col + 1 }
            ],
            slots: [0, 1, 0, 0]
          });
        }
      }
    }
    for (var vRow = 0; vRow < GRID - 2; vRow += 1) {
      for (var vCol = 0; vCol < GRID - 1; vCol += 1) {
        if (
          isPlayableGemCell(vRow, vCol) &&
          isPlayableGemCell(vRow + 1, vCol) &&
          isPlayableGemCell(vRow + 2, vCol) &&
          isPlayableGemCell(vRow + 1, vCol + 1)
        ) {
          candidates.push({
            cells: [
              { row: vRow, col: vCol },
              { row: vRow + 1, col: vCol },
              { row: vRow + 2, col: vCol },
              { row: vRow + 1, col: vCol + 1 }
            ],
            slots: [0, 1, 0, 0]
          });
        }
      }
    }
    return candidates;
  }

  function isPlayableGemCell(row, col) {
    // Caged pieces are off-limits: pattern forcing must never rewrite them.
    return isCellActive(row, col) && !isPhaseLocked(row, col) && Boolean(board[row] && board[row][col]);
  }

  function tryPlayablePattern(candidate) {
    var snapshot = candidate.cells.map(function (cell) {
      var gem = board[cell.row][cell.col];
      return {
        cell: cell,
        type: gem.type,
        special: gem.special
      };
    });

    for (var typeA = 0; typeA < TYPES.length; typeA += 1) {
      for (var typeB = 0; typeB < TYPES.length; typeB += 1) {
        if (typeA === typeB) continue;
        candidate.cells.forEach(function (cell, index) {
          var gem = board[cell.row][cell.col];
          gem.type = candidate.slots[index] === 0 ? typeA : typeB;
          gem.special = null;
        });
        if (findMatches().length === 0 && hasAnyMove()) return true;
      }
    }

    snapshot.forEach(function (entry) {
      var gem = board[entry.cell.row][entry.cell.col];
      gem.type = entry.type;
      gem.special = entry.special;
    });
    return false;
  }

  function tryTopBandPattern(candidate) {
    var snapshot = candidate.cells.map(function (cell) {
      var gem = board[cell.row][cell.col];
      return {
        cell: cell,
        type: gem.type,
        special: gem.special
      };
    });

    for (var typeA = 0; typeA < TYPES.length; typeA += 1) {
      for (var typeB = 0; typeB < TYPES.length; typeB += 1) {
        if (typeA === typeB) continue;
        candidate.cells.forEach(function (cell, index) {
          var gem = board[cell.row][cell.col];
          gem.type = candidate.slots[index] === 0 ? typeA : typeB;
          gem.special = null;
        });
        if (findMatches().length === 0 && hasTopBandLegalMove()) return true;
      }
    }

    snapshot.forEach(function (entry) {
      var gem = board[entry.cell.row][entry.cell.col];
      gem.type = entry.type;
      gem.special = entry.special;
    });
    return false;
  }

  function plantNovaPrimer() {
    // Jung mandate A7: Nova Primer must demonstrate the new nova. Plant a
    // deterministic T T _ T T row with a donor T above the gap so one swap
    // makes the five. Runs on every attempt; boardRng keeps the colors
    // seeded per (level, attempt). The guide only rides along until the
    // player has fired a debut nova once.
    var anchors = [
      { row: 4, col: 1 },
      { row: 3, col: 1 },
      { row: 5, col: 1 },
      { row: 4, col: 2 },
      { row: 3, col: 2 },
      { row: 5, col: 2 }
    ];
    for (var index = 0; index < anchors.length; index += 1) {
      var planted = tryNovaPrimerAt(anchors[index].row, anchors[index].col);
      if (planted) {
        novaPrimerSwap = planted;
        if (!coachSeen.novaTap) guidedMove = { a: planted.a, b: planted.b, label: "Drag to make the five" };
        return;
      }
    }
  }

  function tryNovaPrimerAt(row, startCol) {
    var cells = [];
    for (var col = startCol; col < startCol + 5; col += 1) cells.push({ row: row, col: col });
    var donor = { row: row - 1, col: startCol + 2 };
    var gap = cells[2];
    var all = cells.concat([donor]);
    // Guards keep the first refill from detonating the debut nova: the
    // donor-row gems fall into the cleared line beside it, and the gem
    // under the gap sits below it. None of them may hold the line color.
    var guards = [
      { row: row - 1, col: startCol },
      { row: row - 1, col: startCol + 1 },
      { row: row - 1, col: startCol + 3 },
      { row: row - 1, col: startCol + 4 },
      { row: row + 1, col: startCol + 2 }
    ].filter(function (cell) {
      var gem = board[cell.row] && board[cell.row][cell.col];
      return isCellActive(cell.row, cell.col) && gem && !gem.special && !isPhaseLocked(cell.row, cell.col);
    });
    for (var index = 0; index < all.length; index += 1) {
      var probe = all[index];
      var probeGem = board[probe.row] && board[probe.row][probe.col];
      if (!isCellActive(probe.row, probe.col) || !probeGem || probeGem.special || isPhaseLocked(probe.row, probe.col)) return null;
    }
    var snapshot = all.concat(guards).map(function (cell) {
      return { cell: cell, type: board[cell.row][cell.col].type };
    });
    var restore = function () {
      snapshot.forEach(function (entry) {
        board[entry.cell.row][entry.cell.col].type = entry.type;
      });
    };
    var offset = Math.floor(boardRandom() * TYPES.length);
    for (var t = 0; t < TYPES.length; t += 1) {
      var lineType = (offset + t) % TYPES.length;
      for (var gapType = 0; gapType < TYPES.length; gapType += 1) {
        if (gapType === lineType) continue;
        restore();
        all.forEach(function (cell) {
          board[cell.row][cell.col].type = sameCell(cell, gap) ? gapType : lineType;
        });
        // No instant match allowed; the swap itself is a five by shape.
        if (findMatches().length > 0) continue;
        if (!clearNovaPrimerGuards(guards, lineType)) continue;
        all.forEach(function (cell) {
          var gem = board[cell.row][cell.col];
          gem.pop = Math.max(gem.pop, 0.3);
        });
        return {
          a: { row: donor.row, col: donor.col },
          b: { row: gap.row, col: gap.col }
        };
      }
    }
    restore();
    return null;
  }

  function clearNovaPrimerGuards(guards, lineType) {
    for (var index = 0; index < guards.length; index += 1) {
      var guard = guards[index];
      var gem = board[guard.row][guard.col];
      if (gem.type !== lineType) continue;
      var cleared = false;
      for (var alt = 0; alt < TYPES.length; alt += 1) {
        if (alt === lineType) continue;
        gem.type = alt;
        if (findMatches().length === 0) {
          cleared = true;
          break;
        }
      }
      if (!cleared) return false;
    }
    return true;
  }

  function pickDropType(row, col) {
    var blocked = {};
    if (col >= 2 && board[row] && board[row][col - 1] && board[row][col - 2] && board[row][col - 1].type === board[row][col - 2].type) {
      blocked[board[row][col - 1].type] = true;
    }
    if (row <= GRID - 3 && board[row + 1] && board[row + 2] && board[row + 1][col] && board[row + 2][col] && board[row + 1][col].type === board[row + 2][col].type) {
      blocked[board[row + 1][col].type] = true;
    }
    var choices = activeColorIndices().filter(function (type) {
      return !blocked[type];
    });
    return pickWeightedType(choices);
  }

  function pickWeightedType(choices) {
    if (!choices || choices.length === 0) return Math.floor(boardRandom() * TYPES.length);
    if (gameMode !== MODE_CAMPAIGN || !currentLevel || !currentLevel.modifiers) {
      return choices[Math.floor(boardRandom() * choices.length)];
    }

    var bias = currentLevel.modifiers.colorBias;
    var adjacentBias = (bias + 2) % TYPES.length;
    var total = 0;
    var weighted = choices.map(function (type) {
      var weight = 1;
      if (type === bias) weight += 0.48 + mercyBias;
      if (type === adjacentBias) weight += 0.2;
      total += weight;
      return { type: type, weight: weight };
    });

    var roll = boardRandom() * total;
    for (var i = 0; i < weighted.length; i += 1) {
      roll -= weighted[i].weight;
      if (roll <= 0) return weighted[i].type;
    }
    return weighted[weighted.length - 1].type;
  }

  function boardRandom() {
    return boardRng();
  }

  function forEachGem(callback) {
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        if (board[row] && board[row][col]) callback(board[row][col], row, col);
      }
    }
  }

  function getCellFromPoint(clientX, clientY, edgeSnap) {
    var point = getCanvasPoint(clientX, clientY);
    var localX = point.x - view.boardX;
    var localY = point.y - view.boardY;
    var col = Math.floor(localX / view.cell);
    var row = Math.floor(localY / view.cell);
    if (row < 0 || row >= GRID || col < 0 || col >= GRID) return edgeSnap ? getNearestActiveCellFromPoint(point.x, point.y) : null;
    if (!isCellActive(row, col)) return edgeSnap ? getNearestActiveCellFromPoint(point.x, point.y) : null;
    return { row: row, col: col };
  }

  function getCanvasPoint(clientX, clientY) {
    var rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : null;
    return {
      x: clientX - (rect ? rect.left : 0),
      y: clientY - (rect ? rect.top : 0)
    };
  }

  function getNearestActiveCellFromPoint(canvasX, canvasY) {
    if (!view.cell) return null;
    var best = null;
    var bestDistance = Infinity;
    var maxDistance = view.cell * 0.68;
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        if (!isCellActive(row, col)) continue;
        var center = getBoardCellCenter({ row: row, col: col });
        var dx = canvasX - center.x;
        var dy = canvasY - center.y;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = { row: row, col: col };
        }
      }
    }
    return bestDistance <= maxDistance ? best : null;
  }

  function shouldProxyBoardPointer(event) {
    if (!event || event.target === canvas) return false;
    if (hudSheetOpen) return false;
    if (isInteractivePointerTarget(event.target)) return false;
    if (isGameplayPaused()) return false;
    if (pointerStart) return true;
    return Boolean(getCellFromPoint(event.clientX, event.clientY, true));
  }

  function isInteractivePointerTarget(target) {
    var node = target;
    while (node && node !== document.body) {
      var tag = node.tagName ? String(node.tagName).toLowerCase() : "";
      if (tag === "button" || tag === "input" || tag === "select" || tag === "textarea" || tag === "a" || tag === "label") return true;
      if (node.id === "debugPanel" || node.id === "hudSheet") return true;
      node = node.parentElement || node.parentNode;
    }
    return false;
  }

  function proxyBoardPointerDown(event) {
    if (shouldProxyBoardPointer(event)) onPointerDown(event);
  }

  function proxyBoardPointerMove(event) {
    if (shouldProxyBoardPointer(event)) onPointerMove(event);
  }

  function proxyBoardPointerUp(event) {
    if (shouldProxyBoardPointer(event)) onPointerUp(event);
  }

  function proxyBoardPointerCancel(event) {
    if (!pointerStart) return;
    if (activePointerId !== null && event && event.pointerId !== undefined && event.pointerId !== activePointerId) return;
    cancelPointerCapture();
  }

  function sameCell(a, b) {
    return a && b && a.row === b.row && a.col === b.col;
  }

  function adjacent(a, b) {
    if (!a || !b) return false;
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
  }

  function hasAnyMove() {
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        if (!isCellActive(row, col)) continue;
        var cell = { row: row, col: col };
        if (isCellActive(row, col + 1) && wouldMatchAfterSwap(cell, { row: row, col: col + 1 })) return true;
        if (isCellActive(row + 1, col) && wouldMatchAfterSwap(cell, { row: row + 1, col: col })) return true;
      }
    }
    return false;
  }

  function findSuggestedMove() {
    var moves = getLegalMoves();
    if (moves.length === 0) return null;
    return moves[Math.floor(boardRandom() * moves.length)];
  }

  function findGuidedFirstMove() {
    var moves = getLegalMoves();
    if (moves.length === 0) return null;
    var best = moves[0];
    var bestScore = -Infinity;
    for (var i = 0; i < moves.length; i += 1) {
      var move = moves[i];
      var moveScore = move.a.row + move.b.row;
      if (move.a.col >= 2 && move.a.col <= 5 && move.b.col >= 2 && move.b.col <= 5) moveScore += 3;
      if (moveScore > bestScore) {
        bestScore = moveScore;
        best = move;
      }
    }
    return best;
  }

  function getLegalMoves() {
    var moves = [];
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        if (!isCellActive(row, col)) continue;
        var cell = { row: row, col: col };
        var right = { row: row, col: col + 1 };
        var down = { row: row + 1, col: col };
        if (isCellActive(right.row, right.col) && wouldMatchAfterSwap(cell, right)) moves.push({ a: cell, b: right });
        if (isCellActive(down.row, down.col) && wouldMatchAfterSwap(cell, down)) moves.push({ a: cell, b: down });
      }
    }
    return moves;
  }

  function wouldMatchAfterSwap(a, b) {
    if (!isCellActive(a.row, a.col) || !isCellActive(b.row, b.col)) return false;
    if (isPhaseLocked(a.row, a.col) || isPhaseLocked(b.row, b.col)) return false;
    if (!board[a.row] || !board[b.row] || !board[a.row][a.col] || !board[b.row][b.col]) return false;
    if (hasSpecialComboAt(a, b)) return true;
    swapDataOnly(a, b);
    var found = findMatches().length > 0;
    swapDataOnly(a, b);
    return found;
  }

  function hasSpecialComboAt(a, b) {
    var gemA = board[a.row] && board[a.row][a.col];
    var gemB = board[b.row] && board[b.row][b.col];
    return Boolean(gemA && gemB && gemA.special && gemB.special);
  }

  function resetSwapHint() {
    hintIdle = 0;
    swapHint = null;
    swapHintAge = 0;
  }

  function isGuidedCell(cell) {
    if (!guidedMove || !cell) return false;
    return sameCell(cell, guidedMove.a) || sameCell(cell, guidedMove.b);
  }

  function isGuidedPair(a, b) {
    if (!guidedMove || !a || !b) return false;
    return (sameCell(a, guidedMove.a) && sameCell(b, guidedMove.b)) || (sameCell(a, guidedMove.b) && sameCell(b, guidedMove.a));
  }

  function maybeArmNovaPrimerTapGuide() {
    // Nova primer stage two: once a nova sits on a settled board, guide
    // the tap that fires it (a==b marks a tap guide; swaps stay blocked
    // so the sweep lesson lands before free play resumes).
    if (gameMode !== MODE_CAMPAIGN || levelState !== "playing" || !novaPrimerSwap || coachSeen.novaTap) return;
    if (novaPrimerGem && (!board[novaPrimerGem.row] || board[novaPrimerGem.row][novaPrimerGem.col] !== novaPrimerGem || novaPrimerGem.special !== "nova")) {
      // The cascade detonated the debut nova: its sweep played, but the
      // tap did not. Drop the stale handle and re-attach below.
      novaPrimerGem = null;
      if (guidedMove && guidedMove.tap) guidedMove = null;
    }
    if (!novaPrimerGem) novaPrimerGem = findBoardNova();
    if (novaPrimerGem) {
      guidedMove = { a: { row: novaPrimerGem.row, col: novaPrimerGem.col }, b: { row: novaPrimerGem.row, col: novaPrimerGem.col }, tap: true };
      updateHud();
      return;
    }
    // No nova left to tap: re-seed the five so the lesson stays
    // performable (mandate A7: named-but-unperformable is a failing build).
    if (!guidedMove && movesLeft >= 3) {
      plantNovaPrimer();
      updateHud();
    }
  }

  function findBoardNova() {
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        var gem = board[row] && board[row][col];
        if (gem && gem.special === "nova" && !isPhaseLocked(row, col)) return gem;
      }
    }
    return null;
  }

  function finishNovaPrimerGuide() {
    novaPrimerGem = null;
    if (guidedMove && guidedMove.tap) guidedMove = null;
    if (!coachSeen.novaTap) {
      coachSeen.novaTap = true;
      writeCoachSeen();
    }
    updateHud();
  }

  function updateArmedSpecial() {
    if (!armedSpecial) return;
    // Disarm on level end, pause, or booster activation; also when
    // cascades removed or transformed the armed piece under us.
    if (levelState !== "playing" || isGameplayPaused() || activeBooster) {
      armedSpecial = null;
      return;
    }
    var gem = board[armedSpecial.row] && board[armedSpecial.row][armedSpecial.col];
    if (!gem || gem.special !== armedSpecial.special) armedSpecial = null;
  }

  function updateSwapHint(dt) {
    if (guidedMove) return;
    if (gameMode !== MODE_CAMPAIGN || levelState !== "playing" || animating || selected || activeBooster) {
      hintIdle = 0;
      swapHint = null;
      swapHintAge = 0;
      return;
    }

    hintIdle += dt;
    if (!swapHint) {
      var delay = currentLevel.id <= 5 ? 1.8 : 7.5;
      if (hintIdle >= delay) {
        swapHint = findSuggestedMove();
        swapHintAge = 0;
        if (!swapHint) hintIdle = 0;
      }
      return;
    }

    swapHintAge += dt;
    if (swapHintAge >= 4.6) {
      hintIdle = 0;
      swapHint = null;
      swapHintAge = 0;
    }
  }

  function swapDataOnly(a, b) {
    if (!isCellActive(a.row, a.col) || !isCellActive(b.row, b.col)) return;
    var gemA = board[a.row][a.col];
    var gemB = board[b.row][b.col];
    board[a.row][a.col] = gemB;
    board[b.row][b.col] = gemA;
    if (gemA) {
      gemA.row = b.row;
      gemA.col = b.col;
    }
    if (gemB) {
      gemB.row = a.row;
      gemB.col = a.col;
    }
  }

  function onPointerDown(event) {
    event.preventDefault();
    // A result/fail card is queued but not yet on screen: swallow board taps so
    // the exposed board can't restart a loss (skipping the fail card + Continue
    // offer) or fall through to a swap before the card opens.
    if (shareCardPending) return;
    if (gameMode === MODE_CAMPAIGN && levelState === "lost" && !isGameplayPaused() && performance.now() > failLockUntil) {
      startLevel(currentLevelIndex);
      return;
    }
    if (isGameplayPaused()) return;
    resetSwapHint();
    var cell = getCellFromPoint(event.clientX, event.clientY, true);
    if (!cell || levelState !== "playing") return;
    if (guidedMove && !isGuidedCell(cell)) return;
    pointerStart = cell;
    pointerStartPoint = { x: event.clientX, y: event.clientY };
    activePointerId = event.pointerId;
    if (canvas.setPointerCapture && event.pointerId !== undefined) {
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (error) {
        return;
      }
    }
  }

  function onPointerMove(event) {
    event.preventDefault();
    if (isGameplayPaused()) {
      cancelPointerCapture();
      return;
    }
    if (pointerStart) resetSwapHint();
    if (!pointerStart || levelState !== "playing") return;
    var cell = getCellFromPoint(event.clientX, event.clientY);
    if (cell && adjacent(pointerStart, cell)) {
      if (animating) queuePendingSwap(pointerStart, cell);
      else attemptSwap(pointerStart, cell);
      clearPointerStart(event);
      return;
    }
    var swipeTarget = getSwipeTarget(event.clientX, event.clientY);
    if (swipeTarget) {
      if (animating) queuePendingSwap(pointerStart, swipeTarget);
      else attemptSwap(pointerStart, swipeTarget);
      clearPointerStart(event);
      return;
    }
  }

  function onPointerUp(event) {
    event.preventDefault();
    if (shareCardPending || isGameplayPaused()) {
      clearPointerStart(event);
      return;
    }
    resetSwapHint();
    var cell = getCellFromPoint(event.clientX, event.clientY, true);
    if (levelState !== "playing") {
      clearPointerStart(event);
      return;
    }
    if (guidedMove && cell && !isGuidedCell(cell)) {
      clearPointerStart(event);
      return;
    }

    if (activeBooster === "hammer") {
      if (cell && !animating) useHammer(cell);
      clearPointerStart(event);
      return;
    }

    if (pointerStart && cell && !sameCell(pointerStart, cell) && adjacent(pointerStart, cell)) {
      if (animating) queuePendingSwap(pointerStart, cell);
      else attemptSwap(pointerStart, cell);
      clearPointerStart(event);
      return;
    }

    var swipeTarget = getSwipeTarget(event.clientX, event.clientY);
    if (swipeTarget) {
      if (animating) queuePendingSwap(pointerStart, swipeTarget);
      else attemptSwap(pointerStart, swipeTarget);
      clearPointerStart(event);
      return;
    }

    if (pointerStart && !animating && hasSwipeIntent(event.clientX, event.clientY)) {
      rejectPointerGesture(pointerStart);
      clearPointerStart(event);
      return;
    }

    if (!cell || animating) {
      clearPointerStart(event);
      return;
    }

    // Tap-to-fire specials (mandate A5). First tap on a special arms it and
    // shows the footprint preview; a second tap on the same cell fires it.
    if (armedSpecial) {
      if (sameCell(armedSpecial, cell)) {
        fireArmedSpecial();
        clearPointerStart(event);
        return;
      }
      if (adjacent(armedSpecial, cell) && hasSpecialComboAt(armedSpecial, cell)) {
        // Adjacent special while armed: fusion swap via the existing
        // createSpecialCombo/triggerSpecialCombo path.
        var armedCell = { row: armedSpecial.row, col: armedSpecial.col };
        armedSpecial = null;
        selected = null;
        attemptSwap(armedCell, cell);
        clearPointerStart(event);
        return;
      }
      // Any other cell disarms, then falls through to normal select logic.
      armedSpecial = null;
    }

    if (selected && adjacent(selected, cell)) {
      attemptSwap(selected, cell);
      selected = null;
    } else {
      var tappedGem = board[cell.row] && board[cell.row][cell.col];
      if (tappedGem && tappedGem.special && !isPhaseLocked(cell.row, cell.col)) {
        armedSpecial = { row: cell.row, col: cell.col, special: tappedGem.special };
        selected = null;
        pulseGem(cell.row, cell.col, 0.2);
        playTap(cell);
        playArmSpecial();
      } else {
        selected = cell;
        pulseGem(cell.row, cell.col, 0.14);
        playTap(cell);
      }
    }
    clearPointerStart(event);
  }

  function hasSwipeIntent(clientX, clientY) {
    if (!pointerStart || !pointerStartPoint || !view.cell) return false;
    var dx = clientX - pointerStartPoint.x;
    var dy = clientY - pointerStartPoint.y;
    return Math.max(Math.abs(dx), Math.abs(dy)) >= view.cell * 0.34;
  }

  function getSwipeTarget(clientX, clientY) {
    if (!hasSwipeIntent(clientX, clientY)) return null;
    var dx = clientX - pointerStartPoint.x;
    var dy = clientY - pointerStartPoint.y;
    var target = { row: pointerStart.row, col: pointerStart.col };
    if (Math.abs(dx) >= Math.abs(dy)) target.col += dx > 0 ? 1 : -1;
    else target.row += dy > 0 ? 1 : -1;
    if (target.row < 0 || target.row >= GRID || target.col < 0 || target.col >= GRID) return null;
    if (!isCellActive(target.row, target.col)) return null;
    return target;
  }

  function rejectPointerGesture(cell) {
    if (!cell) return;
    pulseGem(cell.row, cell.col, 0.16);
    playReject();
    vibrate("reject");
  }

  function queuePendingSwap(a, b) {
    if (!a || !b) return;
    if (activeBooster === "hammer") return;
    pendingSwap = {
      a: { row: a.row, col: a.col },
      b: { row: b.row, col: b.col },
      at: performance.now()
    };
    pulseGem(a.row, a.col, 0.1);
    pulseGem(b.row, b.col, 0.1);
  }

  function flushPendingSwap() {
    if (!pendingSwap) return;
    var p = pendingSwap;
    pendingSwap = null;
    if (performance.now() - p.at > PENDING_SWAP_MAX_AGE) return;
    if (levelState !== "playing") return;
    if (!isCellActive(p.a.row, p.a.col) || !isCellActive(p.b.row, p.b.col)) return;
    if (!board[p.a.row] || !board[p.b.row] || !board[p.a.row][p.a.col] || !board[p.b.row][p.b.col]) return;
    window.setTimeout(function () {
      attemptSwap(p.a, p.b);
    }, 0);
  }

  function clearPointerStart(event) {
    releasePointerCapture(event);
    pointerStart = null;
    pointerStartPoint = null;
    activePointerId = null;
  }

  function cancelPointerCapture() {
    releasePointerCapture(null);
    pointerStart = null;
    pointerStartPoint = null;
    activePointerId = null;
  }

  function releasePointerCapture(event) {
    var pointerId = event && event.pointerId !== undefined ? event.pointerId : activePointerId;
    if (pointerId === null || pointerId === undefined || !canvas.releasePointerCapture) return;
    try {
      canvas.releasePointerCapture(pointerId);
    } catch (error) {
      return;
    }
  }

  function bindPrimaryPress(element, handler) {
    element.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse") return;
      event.preventDefault();
      handler(event);
      suppressClicksUntil = Date.now() + 400;
      suppressClickSource = element;
    });
    element.addEventListener("click", handler);
  }

  function bindMenuPress(element, handler) {
    var touchHandledUntil = 0;
    element.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "mouse") return;
      event.preventDefault();
      event.stopPropagation();
      touchHandledUntil = Date.now() + 500;
      handler(event);
      suppressClicksUntil = Date.now() + 400;
      suppressClickSource = element;
    });
    element.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      if (Date.now() < touchHandledUntil) return;
      handler(event);
    });
  }

  function pulseGem(row, col, amount) {
    var gem = board[row] && board[row][col];
    if (gem) gem.pop = Math.max(gem.pop, amount);
  }

  function toggleBooster(name) {
    if (isGameplayPaused()) return;
    if (levelState !== "playing" || animating) return;
    if (!canUseBooster(name)) return;
    armedSpecial = null;
    activeBooster = activeBooster === name ? null : name;
    addCallout(activeBooster ? name.toUpperCase() : "READY", activeBooster ? "#ffd166" : "#46f4ff", 18);
    updateHud();
  }

  function spendBooster(name) {
    if ((campaignSave.boosters[name] || 0) <= 0) return false;
    campaignSave.boosters[name] -= 1;
    activeBooster = null;
    writeCampaignSave();
    updateHud();
    return true;
  }

  function canUseBooster(name) {
    if ((campaignSave.boosters[name] || 0) <= 0) return false;
    if (gameMode === MODE_DAILY) return false;
    if (gameMode !== MODE_RUSH) return true;
    return pulse > (RUSH_BOOSTER_COST[name] || 0) + 0.04;
  }

  function spendRushPulseCost(name) {
    if (!isPulseMode()) return;
    var cost = RUSH_BOOSTER_COST[name] || 0;
    pulse = Math.max(0.04, pulse - cost);
    addCallout("-" + Math.round(cost * 100) + "% PULSE", "#ff5e7a", 18);
    updateHud();
  }

  function useHammer(cell) {
    if (isGameplayPaused()) return;
    if (isBeatGateClosed(cell.row, cell.col)) {
      beatGateFlash = 1;
      playReject();
      vibrate("reject");
      return;
    }
    var cageHit = phaseLockMap[cell.row + ":" + cell.col];
    if (cageHit) {
      // The hammer cracks the cage; the freed piece survives (two-step).
      if (!spendBooster("hammer")) return;
      if (isPulseMode()) {
        spendRushPulseCost("hammer");
      } else {
        if (!debugUnlimitedMoves) movesLeft = Math.max(0, movesLeft - 1);
      }
      // Free the caged piece first; advancing the gate first could dissolve
      // the freed gem if the cage shares a cell with a closing gate.
      shatterPhaseLock(cageHit, board[cell.row] && board[cell.row][cell.col]);
      if (!isPulseMode()) advanceBeatGates();
      playBoosterHit("hammer");
      announceCompletedGoals();
      resolveLevelOutcome();
      updateHud();
      return;
    }
    if (!spendBooster("hammer")) return;
    beginAnimation();
    var gem = board[cell.row] && board[cell.row][cell.col];
    if (!gem) {
      endAnimation();
      return;
    }
    if (isPulseMode()) {
      spendRushPulseCost("hammer");
    } else {
      if (!debugUnlimitedMoves) movesLeft = Math.max(0, movesLeft - 1);
    }
    recordMatchProgress([cell], 1, [], null);
    score += 140;
    announceCompletedGoals();
    burstMatches([cell], 1);
    addShockwave(gem.x, gem.y, "#ffd166", view.cell * 0.12, view.cell * 1.2, 0.26, 8);
    board[cell.row][cell.col] = null;
    // Score/clear the hammered cell first, then tick the gate so a gem in a
    // closing gate cell still counts toward the goal before the shutter drops.
    if (!isPulseMode()) advanceBeatGates();
    playBoosterHit("hammer");
    updateHud();
    runLater(TIMING.clear, function () {
      markAnimationProgress();
      collapseBoard(1);
      runLater(TIMING.drop, function () {
        markAnimationProgress();
        processMatches(2);
      });
    });
  }

  function useShuffle() {
    if (isGameplayPaused()) return;
    if (levelState !== "playing" || animating || !canUseBooster("shuffle") || !spendBooster("shuffle")) return;
    beginAnimation();
    if (isPulseMode()) {
      spendRushPulseCost("shuffle");
    } else {
      if (!debugUnlimitedMoves) movesLeft = Math.max(0, movesLeft - 1);
      // Gates toggle per MOVE: every campaign move spend ticks the clock,
      // boosters included, so the countdown pips never lie.
      advanceBeatGates();
    }
    reshuffleBoard();
    playBoosterHit("shuffle");
    addCallout("SHUFFLE", "#46f4ff", 22);
    runLater(TIMING.drop, function () {
      endAnimation();
      resolveLevelOutcome();
      updateHud();
    });
  }

  function useCharge() {
    if (isGameplayPaused()) return;
    if (isPulseMode() && isPulseReleaseReady()) {
      triggerPulseRelease();
      return;
    }
    if (isPulseMode()) return;
    if (levelState !== "playing" || animating || !canUseBooster("charge") || !spendBooster("charge")) return;
    if (!debugUnlimitedMoves) movesLeft = Math.max(0, movesLeft - 1);
    // Gates toggle per MOVE: Charge spends a campaign move, so it ticks
    // the gate clock like swaps and the other boosters.
    advanceBeatGates();
    drive = Math.max(drive, OVERDRIVE_THRESHOLD);
    playBoosterHit("charge");
    triggerOverdrive();
    announceCompletedGoals();
    resolveLevelOutcome();
    updateHud();
  }

  function attemptSwap(a, b) {
    if (isGameplayPaused()) return;
    if (!adjacent(a, b) || animating || levelState !== "playing") return;
    if (!isCellActive(a.row, a.col) || !isCellActive(b.row, b.col)) return;
    if (isBeatGateClosed(a.row, a.col) || isBeatGateClosed(b.row, b.col)) {
      beatGateFlash = 1;
      playReject();
      vibrate("reject");
      return;
    }
    if (isPhaseLocked(a.row, a.col) || isPhaseLocked(b.row, b.col)) {
      // Caged pieces reject swaps until an adjacent same-color match
      // frees them; the cage flares to say why.
      flashPhaseLockAt(a);
      flashPhaseLockAt(b);
      playReject();
      vibrate("reject");
      return;
    }
    if (!board[a.row] || !board[b.row] || !board[a.row][a.col] || !board[b.row][b.col]) return;
    if (guidedMove) {
      if (!isGuidedPair(a, b)) return;
      guidedMove = null;
      coachSeen.swap = true;
      writeCoachSeen();
      var guidedTipIndex = coachQueue.indexOf("swap");
      if (guidedTipIndex !== -1) coachQueue.splice(guidedTipIndex, 1);
    }
    resetSwapHint();
    beginAnimation();
    selected = null;
    swapCells(a, b);
    pulseGem(a.row, a.col, 0.22);
    pulseGem(b.row, b.col, 0.22);
    playSwap(a, b);
    vibrate("swap");

    runLater(TIMING.swapCheck, function () {
      markAnimationProgress();
      var specialCombo = createSpecialCombo(a, b);
      if (specialCombo) {
        if (gameMode === MODE_CAMPAIGN) {
          if (!debugUnlimitedMoves) movesLeft = Math.max(0, movesLeft - 1);
        }
        levelStats.movesMade += 1;
        // Resolve the fusion first: its synchronous clear scores and empties
        // the cells while the gate is still open. Advancing first would null
        // any combo piece sitting in a closing gate cell and eat the fusion.
        triggerSpecialCombo(specialCombo);
        advanceBeatGates();
        producerEmitPending = true;
        updateHud();
        return;
      }

      var pendingMatches = findMatches();
      if (pendingMatches.length === 0) {
        swapCells(a, b);
        playReject();
        vibrate("reject");
        runLater(TIMING.reject, endAnimation);
        return;
      }
      if (gameMode === MODE_CAMPAIGN) {
        if (!debugUnlimitedMoves) movesLeft = Math.max(0, movesLeft - 1);
      }
      levelStats.movesMade += 1;
      // Resolve the validated match first. processMatches does its scoring and
      // cell-nulling synchronously (before scheduling cascades) while the gate
      // is still open, so the run clears normally. Advancing the gate first
      // nulls any matched gem inside a closing gate cell, so findMatchData no
      // longer sees the run and the move is burned with nothing cleared.
      processMatches(1, [a, b]);
      advanceBeatGates();
      producerEmitPending = true;
      updateHud();
    });
  }

  function createSpecialCombo(a, b) {
    var gemA = board[a.row] && board[a.row][a.col];
    var gemB = board[b.row] && board[b.row][b.col];
    if (!gemA || !gemB || !gemA.special || !gemB.special) return null;

    return {
      a: { row: a.row, col: a.col },
      b: { row: b.row, col: b.col },
      specialA: gemA.special,
      specialB: gemB.special,
      typeA: gemA.type,
      typeB: gemB.type
    };
  }

  function triggerSpecialCombo(comboData) {
    var clearMap = {};
    var exclude = {};
    var comboLabel = getSpecialComboLabel(comboData);
    var comboCells = [comboData.a, comboData.b];

    comboCells.forEach(function (cell) {
      markCell(clearMap, cell.row, cell.col);
      exclude[cellKey(cell)] = true;
      // A fused wired special still arms its network.
      var comboGem = board[cell.row] && board[cell.row][cell.col];
      if (comboGem && comboGem.fuse && !comboGem.fuse.fired) primeFuseNetwork(comboGem.fuse, comboGem);
    });
    markSpecialComboCells(comboData, clearMap);
    scrubLockedCells(clearMap);

    var specialHits = comboCells.map(function (cell) {
      var gem = board[cell.row] && board[cell.row][cell.col];
      return {
        cell: { row: cell.row, col: cell.col },
        special: gem ? gem.special : "nova",
        type: gem ? gem.type : 0
      };
    });
    var chainedHits = collectSpecialHitsFromCells(cellsFromMap(clearMap), exclude);
    specialHits = specialHits.concat(chainedHits);
    expandSpecialClears(chainedHits, clearMap, 3);

    var clearCells = cellsFromMap(clearMap);
    var wasOverdrive = drive >= OVERDRIVE_THRESHOLD;
    var multiplier = wasOverdrive ? 2 : 1;
    var comboScore = Math.floor((clearCells.length * 145 + specialHits.length * 220) * multiplier);

    // Name the fusion through the single-anchor callout and flash its whole
    // footprint. Added before the goal/mission callouts (like the line/nova
    // labels ride expandSpecialClears) so the fusion name headlines the anchor.
    addCallout(comboLabel.toUpperCase(), "#ffd166", 24);
    addCellFlash(clearCells, "#ffd166");

    combo = Math.max(combo, 2);
    levelStats.fusions += 1;
    recordMatchProgress(clearCells, 2, specialHits, null);
    score += comboScore;
    flash = Math.min(1, flash + 0.72);
    energy = Math.min(1, energy + 0.36 + clearCells.length * 0.012);
    drive = Math.min(1, drive + 0.22 + clearCells.length * 0.012 + specialHits.length * 0.055);
    refillRushPulse(clearCells, 2, specialHits, wasOverdrive);
    recordSpecialComboClip(clearCells, comboScore, comboLabel, wasOverdrive || drive >= OVERDRIVE_THRESHOLD);
    recordDailyMissionProgress("clear", clearCells.length);
    recordDailyMissionProgress("special", specialHits.length + 2);
    recordDailyMissionProgress("fusion", 1);
    if (drive >= OVERDRIVE_THRESHOLD && !wasOverdrive) triggerOverdrive();
    announceCompletedGoals();

    addSpecialComboVfx(comboData, comboLabel, clearCells);
    hitStop = TIMING.hitStopFusion / 1000;
    burstMatches(clearCells, 2);
    addMatchFloaters(clearCells, 2, comboScore, multiplier, specialHits.length + 2, null);
    playSpecialCombo(comboData, clearCells.length);
    bumpShake(0.48);
    vibrate("special");

    clearCells.forEach(function (cell) {
      board[cell.row][cell.col] = null;
    });

    updateHud();
    runLater(TIMING.clear + 42, function () {
      markAnimationProgress();
      collapseBoard(2);
      runLater(TIMING.drop, function () {
        markAnimationProgress();
        processMatches(3);
      });
    });
  }

  function swapCells(a, b) {
    if (!isCellActive(a.row, a.col) || !isCellActive(b.row, b.col)) return;
    if (!board[a.row] || !board[b.row]) return;
    var gemA = board[a.row][a.col];
    var gemB = board[b.row][b.col];
    board[a.row][a.col] = gemB;
    board[b.row][b.col] = gemA;
    if (gemA) {
      gemA.row = b.row;
      gemA.col = b.col;
    }
    if (gemB) {
      gemB.row = a.row;
      gemB.col = a.col;
    }
    setTargets();
  }

  function findMatches() {
    return findMatchData().cells;
  }

  function findMatchData() {
    var marked = {};
    var groups = [];

    for (var row = 0; row < GRID; row += 1) {
      var runType = null;
      var runStart = 0;
      var runLength = 0;
      for (var col = 0; col <= GRID; col += 1) {
        var gem = col < GRID ? board[row][col] : null;
        // Caged pieces are phased out of runs: they can't be matched
        // directly, only freed by their color matched alongside.
        var type = gem && !gem.locked ? gem.type : null;
        if (type !== null && type === runType) {
          runLength += 1;
        } else {
          recordRun(groups, marked, row, runStart, runLength, true, runType);
          runType = type;
          runStart = col;
          runLength = type === null ? 0 : 1;
        }
      }
    }

    for (var colIndex = 0; colIndex < GRID; colIndex += 1) {
      var colRunType = null;
      var colRunStart = 0;
      var colRunLength = 0;
      for (var rowIndex = 0; rowIndex <= GRID; rowIndex += 1) {
        var colGem = rowIndex < GRID ? board[rowIndex][colIndex] : null;
        var colType = colGem && !colGem.locked ? colGem.type : null;
        if (colType !== null && colType === colRunType) {
          colRunLength += 1;
        } else {
          recordRun(groups, marked, colIndex, colRunStart, colRunLength, false, colRunType);
          colRunType = colType;
          colRunStart = rowIndex;
          colRunLength = colType === null ? 0 : 1;
        }
      }
    }

    var cells = Object.keys(marked).map(function (key) {
      var parts = key.split(":");
      return { row: Number(parts[0]), col: Number(parts[1]) };
    });

    return { groups: groups, cells: cells };
  }

  function recordRun(groups, marked, fixed, start, length, horizontal, type) {
    if (length < 3 || type === null) return;
    var cells = [];
    for (var offset = 0; offset < length; offset += 1) {
      var row = horizontal ? fixed : start + offset;
      var col = horizontal ? start + offset : fixed;
      marked[row + ":" + col] = true;
      cells.push({ row: row, col: col });
    }
    groups.push({
      type: type,
      length: length,
      horizontal: horizontal,
      cells: cells
    });
  }

  function processMatches(chain, anchors) {
    if (chain > MAX_CASCADE_CHAIN) {
      combo = Math.max(combo, MAX_CASCADE_CHAIN);
      addCallout("CHAIN STABILIZED", "#46f4ff", 18);
      reshuffleBoard();
      endAnimation();
      resolveLevelOutcome();
      updateHud();
      return;
    }

    var matchData = findMatchData();
    var matches = matchData.cells;
    if (matches.length === 0) {
      if (!hasAnyMove()) {
        reshuffleBoard();
        runLater(TIMING.drop, endAnimation);
        return;
      }
      endAnimation();
      combo = 0;
      resolveLevelOutcome();
      updateHud();
      return;
    }

    var clearMap = cellsToMap(matches);
    var specialSpawn = chooseSpecialSpawn(matchData.groups, anchors);
    var specialHits = collectSpecialHits(matches, specialSpawn);
    releasePhaseLocks(matches, clearMap, specialHits);
    expandSpecialClears(specialHits, clearMap, chain);

    var clearCells = cellsFromMap(clearMap);
    var preserveKey = specialSpawn ? cellKey(specialSpawn.cell) : null;
    var burstCells = clearCells.filter(function (cell) {
      return cellKey(cell) !== preserveKey;
    });
    var types = collectMatchedTypes(clearCells);
    var wasOverdrive = drive >= 0.72;
    var multiplier = wasOverdrive ? 2 : 1;
    var matchScore = Math.floor(clearCells.length * 90 * chain * multiplier * getCascadeBonus());

    combo = Math.max(combo, chain);
    recordMatchProgress(clearCells, chain, specialHits, specialSpawn);
    score += matchScore;
    flash = Math.min(1, flash + 0.26 + chain * 0.1);
    energy = Math.min(1, energy + clearCells.length * 0.018 + chain * 0.11);
    drive = Math.min(1, drive + clearCells.length * 0.014 + chain * 0.052 + specialHits.length * 0.09);
    var rushTriggeredOverdrive = refillRushPulse(clearCells, chain, specialHits, wasOverdrive);
    recordClipMoment(clearCells, chain, specialHits.length, Boolean(specialSpawn), matchScore, wasOverdrive || drive >= OVERDRIVE_THRESHOLD);
    recordDailyMissionProgress("clear", clearCells.length);
    recordDailyMissionProgress("special", specialHits.length + (specialSpawn ? 1 : 0));
    if (chain >= 3) recordDailyMissionProgress("chain", 1);
    if (!wasOverdrive && drive >= 0.72 && !rushTriggeredOverdrive) triggerOverdrive();
    announceCompletedGoals();
    bumpShake(0.1 + chain * 0.04 + specialHits.length * 0.14);
    vibrate(specialHits.length > 0 || specialSpawn ? "special" : "match");

    burstMatches(burstCells, chain);
    addMatchShockwave(clearCells, chain, multiplier);
    addMatchFloaters(clearCells, chain, matchScore, multiplier, specialHits.length, specialSpawn);
    playBurst(types, clearCells.length, chain, specialHits.length, specialSpawn, drive >= 0.72);
    if (specialSpawn) createSpecialPiece(specialSpawn);
    collectRewardDrops(clearMap);

    clearCells.forEach(function (cell) {
      if (cellKey(cell) !== preserveKey) board[cell.row][cell.col] = null;
    });
    maybeSpawnRewardDrop(matchData.groups, chain, clearMap);

    updateHud();

    runLater(TIMING.clear, function () {
      markAnimationProgress();
      collapseBoard(chain);
      runLater(TIMING.drop, function () {
        markAnimationProgress();
        processMatches(chain + 1);
      });
    });
  }

  function getCascadeBonus() {
    if (isPulseMode()) return 1.16;
    return currentLevel.modifiers.cascadeBonus;
  }

  function refillRushPulse(cells, chain, specialHits, wasOverdrive) {
    if (!isPulseMode()) return false;
    var before = pulse;
    var gain = cells.length * 0.017 + chain * 0.055 + specialHits.length * 0.075;
    if (chain >= 3) gain += 0.04;
    var cappedGain = Math.min(0.46, gain);
    var rawPulse = pulse + cappedGain;
    pulse = Math.min(1, rawPulse);

    var center = averageCellPosition(cells);
    var bankGain = Math.max(0, rawPulse - 1);
    if (before >= 0.92) bankGain += cappedGain * 0.16;
    if (chain >= 3) bankGain += 0.035;
    addPulseBank(bankGain, center, chain);
    if (before < 0.24 && pulse >= 0.42) triggerRushSave(center, chain);
    if (pulse >= 0.98 && before < 0.9 && rushSurgeCooldown <= 0) {
      triggerRushSurge(center, chain);
      rushSurgeCooldown = 0.9;
    }
    if (pulse >= 0.98 && !wasOverdrive && drive < OVERDRIVE_THRESHOLD) {
      drive = Math.max(drive, OVERDRIVE_THRESHOLD);
      triggerOverdrive();
      return true;
    }
    return false;
  }

  function addPulseBank(amount, center, chain) {
    if (!isPulseMode() || amount <= 0) return;
    var before = pulseBank;
    pulseBank = Math.min(PULSE_RELEASE_BANK_MAX, pulseBank + amount);
    if (pulseBank >= PULSE_RELEASE_THRESHOLD && before < PULSE_RELEASE_THRESHOLD) {
      triggerPulseReleaseReady(center, chain);
    } else if (pulseBank > before && chain >= 3) {
      addFloater(center.x, center.y + view.cell * 0.46, "+" + Math.round((pulseBank - before) * 100) + "% BANK", "#ff4fd8", 0.72, 16);
    }
  }

  function isPulseReleaseReady() {
    return isPulseMode() && pulseBank >= PULSE_RELEASE_THRESHOLD;
  }

  function triggerPulseReleaseReady(center, chain) {
    flash = Math.min(1, flash + 0.24);
    bumpShake(0.16);
    addCallout("TAP RELEASE", "#ff4fd8", 24 + Math.min(8, chain * 2));
    addShockwave(center.x, center.y, "#ff4fd8", view.cell * 0.2, view.cell * 1.6, 0.34, 12);
    playRushSave(chain + 2);
    updateHud();
  }

  function triggerPulseRelease() {
    if (!isPulseReleaseReady() || levelState !== "playing" || animating) return;
    beginAnimation();
    activeBooster = null;
    var storedBank = pulseBank;
    pulseBank = Math.max(0, pulseBank - PULSE_RELEASE_THRESHOLD);

    var clearMap = buildPulseReleaseMap(storedBank);
    var releaseSeeds = cellsFromMap(clearMap);
    var specialHits = collectSpecialHitsFromCells(releaseSeeds, {});
    expandSpecialClears(specialHits, clearMap, 5);

    var clearCells = cellsFromMap(clearMap);
    var wasOverdrive = drive >= OVERDRIVE_THRESHOLD;
    var multiplier = wasOverdrive ? 2 : 1;
    var releaseScore = Math.floor((clearCells.length * 128 + specialHits.length * 210 + 900) * multiplier);

    combo = Math.max(combo, 5);
    levelStats.pulseReleases += 1;
    recordWaveformEvent("release");
    recordMatchProgress(clearCells, 5, specialHits, null);
    score += releaseScore;
    pulse = Math.min(1, pulse + 0.18);
    flash = 1;
    energy = 1;
    drive = Math.min(1, drive + 0.3 + clearCells.length * 0.008 + specialHits.length * 0.045);
    recordPulseReleaseClip(clearCells, releaseScore, wasOverdrive || drive >= OVERDRIVE_THRESHOLD);
    recordDailyMissionProgress("clear", clearCells.length);
    recordDailyMissionProgress("special", specialHits.length);
    if (!wasOverdrive && drive >= OVERDRIVE_THRESHOLD) triggerOverdrive();
    announceCompletedGoals();

    addPulseReleaseVfx(clearCells, releaseScore, multiplier);
    burstMatches(clearCells, 5);
    addMatchFloaters(clearCells, 5, releaseScore, multiplier, specialHits.length, null);
    playPulseRelease(clearCells.length, specialHits.length);
    bumpShake(0.42);
    vibrate("overdrive");

    clearCells.forEach(function (cell) {
      board[cell.row][cell.col] = null;
    });

    updateHud();
    runLater(TIMING.clear + 72, function () {
      markAnimationProgress();
      collapseBoard(5);
      runLater(TIMING.drop, function () {
        markAnimationProgress();
        processMatches(6);
      });
    });
  }

  function buildPulseReleaseMap(storedBank) {
    var map = {};
    var markedCount = 0;
    var centerRows = [Math.floor(GRID / 2) - 1, Math.floor(GRID / 2)];
    var centerCols = [Math.floor(GRID / 2) - 1, Math.floor(GRID / 2)];
    var target = Math.min(GRID * GRID, Math.floor(24 + Math.min(1.2, storedBank) * 12 + levelStats.maxChain * 1.5));
    var add = function (row, col) {
      var key = row + ":" + col;
      var before = map[key];
      markCell(map, row, col);
      if (!before && map[key]) markedCount += 1;
    };

    centerRows.forEach(function (row) {
      for (var col = 0; col < GRID; col += 1) add(row, col);
    });
    centerCols.forEach(function (col) {
      for (var row = 0; row < GRID; row += 1) add(row, col);
    });

    for (var index = 0; index < GRID; index += 1) {
      if (markedCount >= target) break;
      add(index, index);
      add(index, GRID - 1 - index);
    }

    forEachGem(function (gem, row, col) {
      if (gem.special) add(row, col);
    });

    for (var pass = 0; pass < 2 && markedCount < target; pass += 1) {
      for (var fillRow = 0; fillRow < GRID && markedCount < target; fillRow += 1) {
        for (var fillCol = 0; fillCol < GRID && markedCount < target; fillCol += 1) {
          if ((fillRow + fillCol + pass + levelStats.pulseReleases) % 2 === 0) add(fillRow, fillCol);
        }
      }
    }

    return map;
  }

  function addPulseReleaseVfx(clearCells, points, multiplier) {
    var center = averageCellPosition(clearCells);
    addCallout("PULSE RELEASE", "#ffffff", 30);
    addShockwave(center.x, center.y, "#ffffff", view.cell * 0.28, view.boardSize * 0.72, 0.54, 20);
    addShockwave(center.x, center.y, "#ff4fd8", view.cell * 0.12, view.boardSize * 0.44, 0.42, 16);
    addMatchShockwave(clearCells, 6, multiplier);
    addFloater(center.x, center.y + view.cell * 0.74, "+" + points, "#ffd166", 0.75, 24, true);
    trimEffects();
  }

  function triggerRushSave(center, chain) {
    flash = Math.min(1, flash + 0.28);
    bumpShake(0.18);
    rushCritical = false;
    addCallout("PULSE SAVE", "#8cff6b", 22 + Math.min(8, chain * 2));
    addShockwave(center.x, center.y, "#8cff6b", view.cell * 0.18, view.cell * (1.15 + chain * 0.18), 0.32, 9);
    playRushSave(chain);
  }

  function triggerRushSurge(center, chain) {
    flash = Math.min(1, flash + 0.18);
    addCallout("FULL PULSE", "#ffd166", 21 + Math.min(8, chain * 2));
    addShockwave(center.x, center.y, "#ffd166", view.cell * 0.2, view.cell * 1.35, 0.34, 12);
  }

  function collectMatchedTypes(matches) {
    var counts = {};
    matches.forEach(function (cell) {
      var gem = board[cell.row] && board[cell.row][cell.col];
      if (!gem) return;
      counts[gem.type] = (counts[gem.type] || 0) + 1;
    });
    return Object.keys(counts).map(function (type) {
      return { type: Number(type), count: counts[type] };
    });
  }

  // Waveform artifact capture. The bar clock runs at the level's effective
  // BPM (base 124, clamped to 138 inside getActiveBpm), 4 beats per bar.
  function getWaveformBarIndex() {
    var barSeconds = 240 / getActiveBpm();
    return Math.max(0, Math.floor((levelStats.takeSeconds || 0) / barSeconds));
  }

  function recordWaveformClear(piecesCleared, chain) {
    if (!levelStats.barIntensity) return;
    var bar = getWaveformBarIndex();
    levelStats.barIntensity[bar] = (levelStats.barIntensity[bar] || 0) + piecesCleared + chain * 2;
  }

  function recordWaveformEvent(type) {
    if (!levelStats.barEvents) return;
    levelStats.barEvents.push({ bar: getWaveformBarIndex(), type: type });
  }

  function recordMatchProgress(cells, chain, specialHits, specialSpawn) {
    recordWaveformClear(cells.length, chain);
    if (specialHits.length > 0) recordWaveformEvent("special");
    levelStats.maxChain = Math.max(levelStats.maxChain, chain);
    levelStats.specialsActivated += specialHits.length;
    if (specialSpawn) levelStats.specialsCreated += 1;

    // Collect goals count only cleared gems. The special-spawn cell survives
    // (it becomes a beam/nova), so drop it here — matches burstCells, not clearCells.
    var preserveKey = specialSpawn ? cellKey(specialSpawn.cell) : null;
    cells.forEach(function (cell) {
      if (preserveKey && cellKey(cell) === preserveKey) return;
      var gem = board[cell.row] && board[cell.row][cell.col];
      if (gem) {
        levelStats.collected[gem.type] = (levelStats.collected[gem.type] || 0) + 1;
      }
    });

    emitSignalPackets(cells);
    hitSpectrumShields(cells);
    damageFluxTiles(cells, specialHits.length > 0 ? 2 : 1);
    clearSpreaders(cells);
  }

  function emitSignalPackets(cells) {
    if (signalNodeList.length === 0 || cells.length === 0) return;
    signalNodeList.forEach(function (node) {
      var adjacent = cells.some(function (cell) {
        return Math.abs(cell.row - node.row) + Math.abs(cell.col - node.col) === 1;
      });
      if (!adjacent) return;
      // Every adjacent match emits one packet. The goal counts it now
      // (deterministic for the sim); the tracer launch rides the next beat.
      levelStats.signalCollected += 1;
      launchSignalPacket(node);
    });
  }

  function launchSignalPacket(node) {
    var delayMs = 0;
    if (audio.started && audio.ctx) {
      var fireAt = quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.signalSnapSteps);
      delayMs = Math.max(0, (fireAt - audio.ctx.currentTime) * 1000);
      playSignalPacket(fireAt);
    }
    var fromX = view.boardX + node.col * view.cell + view.cell / 2;
    var fromY = view.boardY + node.row * view.cell + view.cell / 2 - view.cell * 0.14;
    runLater(delayMs, function () {
      node.flashAt = performance.now();
      var chipEl = goalRailEl ? goalRailEl.querySelector(".goal-chip--signal") : null;
      var destEl = resolveFlyTarget(chipEl);
      if (destEl) spawnSignalTracer(fromX, fromY, destEl);
    });
  }

  function spawnSignalTracer(fromX, fromY, destEl) {
    if (signalPacketCount >= effectLimit("signalPackets")) return;
    var canvasRect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
    var startX = canvasRect.left + fromX;
    var startY = canvasRect.top + fromY;
    var destRect = destEl.getBoundingClientRect();
    var endX = destRect.left + destRect.width / 2;
    var endY = destRect.top + destRect.height / 2;
    // Quadratic bezier: the midpoint pushed perpendicular gives the neon
    // tracer its swoop toward the goal counter.
    var dx = endX - startX;
    var dy = endY - startY;
    var length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    var bend = Math.min(150, length * 0.3 + 40);
    var ctrlX = (startX + endX) / 2 - (dy / length) * bend;
    var ctrlY = (startY + endY) / 2 + (dx / length) * bend;
    var el = document.createElement("span");
    el.className = "signal-packet";
    el.style.transform = "translate(" + startX + "px, " + startY + "px) translate(-50%, -50%)";
    document.body.appendChild(el);
    signalPacketCount += 1;
    addShockwave(fromX, fromY, "#46f4ff", view.cell * 0.08, view.cell * 0.5, 0.2, 5);

    var duration = 520 + 150 * fxScale();
    var startTime = 0;
    function step(now) {
      if (!startTime) startTime = now;
      var t = Math.min(1, (now - startTime) / duration);
      var eased = t * t * (3 - 2 * t);
      var inv = 1 - eased;
      var x = inv * inv * startX + 2 * inv * eased * ctrlX + eased * eased * endX;
      var y = inv * inv * startY + 2 * inv * eased * ctrlY + eased * eased * endY;
      el.style.transform = "translate(" + x + "px, " + y + "px) translate(-50%, -50%) scale(" + (1.1 - t * 0.35) + ")";
      el.style.opacity = t > 0.86 ? String(1 - (t - 0.86) / 0.14) : "1";
      if (t < 1) {
        requestAnimationFrame(step);
        return;
      }
      if (el.parentNode) el.parentNode.removeChild(el);
      signalPacketCount = Math.max(0, signalPacketCount - 1);
      pulseFlyTarget(destEl);
    }
    requestAnimationFrame(step);
  }

  function hitSpectrumShields(cells) {
    if (spectrumList.length === 0 || cells.length === 0) return;
    spectrumList.forEach(function (shield) {
      if (shield.remaining.length === 0) return;
      cells.forEach(function (cell) {
        if (shield.remaining.length === 0) return;
        if (Math.abs(cell.row - shield.row) + Math.abs(cell.col - shield.col) > 1) return;
        var gem = board[cell.row] && board[cell.row][cell.col];
        if (!gem) return;
        var index = shield.remaining.indexOf(gem.type);
        if (index === -1) return;
        shield.remaining.splice(index, 1);
        shield.segmentFlash[gem.type] = performance.now();
        var x = view.boardX + shield.col * view.cell + view.cell / 2;
        var y = view.boardY + shield.row * view.cell + view.cell / 2;
        addShockwave(x, y, TYPES[gem.type].color, view.cell * 0.1, view.cell * 0.55, 0.2, 5);
        playSpectrumSegment(gem.type);
      });
      if (shield.remaining.length === 0) {
        shield.brokeAt = performance.now();
        // The shield goal reuses the flux counter: one break per shield.
        levelStats.fluxCleared += 1;
        var bx = view.boardX + shield.col * view.cell + view.cell / 2;
        var by = view.boardY + shield.row * view.cell + view.cell / 2;
        addShockwave(bx, by, "#ff4fd8", view.cell * 0.12, view.cell * 0.85, 0.26, 8);
        playSpectrumBreak();
      }
    });
  }

  function releasePhaseLocks(matchCells, clearMap, specialHits) {
    // Matching a cage's color on an orthogonal neighbor breaks the phase.
    // The freed piece joins that clear (collect goals count it through
    // the normal pipeline) and a caged special detonates on release: the
    // authored domino.
    if (phaseLockList.length === 0 || matchCells.length === 0) return;
    phaseLockList.slice().forEach(function (lock) {
      if (!phaseLockMap[lock.row + ":" + lock.col]) return;
      var gem = board[lock.row] && board[lock.row][lock.col];
      if (!gem) {
        shatterPhaseLock(lock, null);
        return;
      }
      var freed = matchCells.some(function (cell) {
        if (Math.abs(cell.row - lock.row) + Math.abs(cell.col - lock.col) !== 1) return false;
        var neighbor = board[cell.row] && board[cell.row][cell.col];
        return Boolean(neighbor && neighbor.type === gem.type);
      });
      if (!freed) return;
      shatterPhaseLock(lock, gem);
      markCell(clearMap, lock.row, lock.col);
      if (gem.special) {
        specialHits.push({ cell: { row: lock.row, col: lock.col }, special: gem.special, type: gem.type });
      }
    });
  }

  function scrubLockedCells(clearMap) {
    // Blasts crack cages instead of clearing the caged piece: the cage
    // absorbs the hit and the piece survives, unlocked (two-step order).
    if (phaseLockList.length === 0) return;
    Object.keys(clearMap).forEach(function (key) {
      var lock = phaseLockMap[key];
      if (!lock) return;
      delete clearMap[key];
      shatterPhaseLock(lock, board[lock.row] && board[lock.row][lock.col]);
    });
  }

  function shatterPhaseLock(lock, gem) {
    var key = lock.row + ":" + lock.col;
    if (!phaseLockMap[key]) return;
    delete phaseLockMap[key];
    lock.brokeAt = performance.now();
    if (gem) gem.locked = false;
    addCageShatterBurst(lock, gem);
    playCageShatter(gem ? gem.type : 0);
  }

  function flashPhaseLockAt(cell) {
    var lock = phaseLockMap[cell.row + ":" + cell.col];
    if (lock) lock.flashAt = performance.now();
  }

  function addCageShatterBurst(lock, gem) {
    var x = view.boardX + lock.col * view.cell + view.cell / 2;
    var y = view.boardY + lock.row * view.cell + view.cell / 2;
    var color = gem ? TYPES[gem.type].color : "#7a6bff";
    // Glitch shatter: square vector chips on jittered diagonals.
    var count = scaledEffectCount(30, 10);
    for (var i = 0; i < count; i += 1) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      var speed = view.cell * (5 + Math.random() * 7);
      var span = 0.3 + Math.random() * 0.26;
      particles.push({
        x: x + (Math.random() - 0.5) * view.cell * 0.4,
        y: y + (Math.random() - 0.5) * view.cell * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: span,
        ttl: span,
        size: i % 4 === 0 ? 3 : 1.4 + Math.random() * 2.2,
        color: i % 3 === 0 ? "#ffffff" : color,
        line: i % 4 !== 0,
        vector: i % 4 === 0,
        sides: 4,
        rotation: angle,
        spin: -8 + Math.random() * 16
      });
    }
    addShockwave(x, y, color, view.cell * 0.1, view.cell * 0.9, 0.24, 6);
    trimEffects();
  }

  function announceCompletedGoals() {
    if (gameMode !== MODE_CAMPAIGN || levelState !== "playing" || !currentLevel || !levelStats) return;
    if (!levelStats.goalAnnouncements) levelStats.goalAnnouncements = {};
    var announced = 0;

    currentLevel.goals.slice().sort(compareGoalAnnouncementPriority).forEach(function (goal) {
      var key = getGoalAnnouncementKey(goal);
      if (levelStats.goalAnnouncements[key]) return;
      if (getGoalValue(goal) < goal.target) return;
      levelStats.goalAnnouncements[key] = true;
      showGoalComplete(goal, announced);
      announced += 1;
    });
  }

  function compareGoalAnnouncementPriority(a, b) {
    if (a.kind === "score" && b.kind !== "score") return 1;
    if (a.kind !== "score" && b.kind === "score") return -1;
    return 0;
  }

  function getGoalAnnouncementKey(goal) {
    if (goal.kind === "collect") return "collect:" + goal.type;
    return goal.kind;
  }

  function getGoalChipFlashElapsed(key) {
    var startedAt = goalChipFlash[key];
    if (!startedAt) return -1;
    var elapsed = performance.now() - startedAt;
    return elapsed > 1100 ? -1 : elapsed;
  }

  function showGoalComplete(goal, index) {
    var color = getGoalCompleteColor(goal);
    var y = calloutAnchorY();

    // Brighten + pop the gold goal-rail icon (DOM chip is-flash scale + glow).
    goalChipFlash[getGoalAnnouncementKey(goal)] = performance.now();
    // Name the win through the single-anchor callout queue so completions read
    // in the board band and never overlap another named callout (the queue
    // serializes to one anchor; stacked goals de-emphasize by index).
    addCallout(getGoalShortName(goal).toUpperCase() + " ✓", color, Math.max(16, 22 - index * 2));
    // Neon ring pop wrapped on the callout anchor; budgeted through fxScale /
    // effectLimit inside addShockwave.
    addShockwave(centerBoardX(), y, color, view.cell * 0.18, view.cell * (1.05 + index * 0.16), 0.3, 8);
    flash = Math.min(1, flash + 0.1);
    // In-key beat blip on the hero-snap grid, in place of the generic booster hit.
    playGoalComplete(index);
    if (index === 0) vibrate("special");
    updateHud();
  }

  function getGoalCompleteColor(goal) {
    if (goal.kind === "collect") return TYPES[goal.type].color;
    if (goal.kind === "score") return "#ffd166";
    if (goal.kind === "flux") return "#ff4fd8";
    if (goal.kind === "signal") return "#46f4ff";
    if (goal.kind === "spread") return SPREAD_COLOR;
    if (goal.kind === "chain") return "#8cff6b";
    if (goal.kind === "overdrive") return "#ffd166";
    return "#46f4ff";
  }

  function damageFluxTiles(cells, amount) {
    if (cells.length === 0) return;
    // Shields are blockers now: a clear damages every shield orthogonally
    // ADJACENT to a cleared cell (the masked blocker itself is never matched).
    var hit = {};
    cells.forEach(function (cell) {
      var neighbors = [[cell.row - 1, cell.col], [cell.row + 1, cell.col], [cell.row, cell.col - 1], [cell.row, cell.col + 1]];
      for (var i = 0; i < 4; i += 1) {
        var r = neighbors[i][0];
        var c = neighbors[i][1];
        if (r < 0 || r >= GRID || c < 0 || c >= GRID) continue;
        if (tileCharges[r] && tileCharges[r][c] > 0) hit[r + ":" + c] = true;
      }
    });
    var brokeCount = 0;
    var crackedCount = 0;
    Object.keys(hit).forEach(function (key) {
      var parts = key.split(":");
      var r = Number(parts[0]);
      var c = Number(parts[1]);
      var current = tileCharges[r][c];
      var next = Math.max(0, current - amount);
      levelStats.fluxCleared += current - next;
      tileCharges[r][c] = next;
      var x = view.boardX + c * view.cell + view.cell / 2;
      var y = view.boardY + r * view.cell + view.cell / 2;
      if (next === 0) {
        // Broken: the wall opens. Un-mask the cell so the next collapse fills it.
        boardMask[r][c] = isCellActiveForShape(currentBoardShape || "full", r, c);
        // Bigger, brighter smash: a double shockwave (white flash + magenta ring).
        addShockwave(x, y, "#ffffff", view.cell * 0.1, view.cell * 0.7, 0.18, 6);
        addShockwave(x, y, "#ff4fd8", view.cell * 0.16, view.cell * 1.05, 0.3, 10);
        brokeCount += 1;
      } else {
        addShockwave(x, y, "#ff4fd8", view.cell * 0.1, view.cell * 0.6, 0.22, 6);
        crackedCount += 1;
      }
    });
    // Impact: a weighty break sound + shake + haptic (Jung's ask), or a lighter
    // crack when a reinforced wall only chips.
    if (brokeCount > 0) {
      playShieldBreak(brokeCount);
      flash = Math.min(1, flash + 0.14 + brokeCount * 0.05);
      bumpShake(0.12 + brokeCount * 0.06);
      vibrate("special");
    } else if (crackedCount > 0) {
      playShieldCrack();
      bumpShake(0.06);
      vibrate("match");
    }
  }

  function resolveLevelOutcome() {
    if (levelState !== "playing") return;
    if (isPulseMode()) return;

    // Producers emit and Spreaders creep once per resolved player move, on the
    // now-stable board.
    if (producerEmitPending) {
      producerEmitPending = false;
      emitProducers();
      stepSpreaders();
    }

    if (areGoalsComplete()) {
      completeLevel();
      return;
    }

    if (movesLeft <= 0) {
      // A primed fuse network still owes detonations: let the wire finish
      // before calling the take (its clears can still win the level).
      if (fuseQueue.length > 0) return;
      failLevel();
    }
  }

  function areGoalsComplete() {
    return currentLevel.goals.every(function (goal) {
      return getGoalValue(goal) >= goal.target;
    });
  }

  function getGoalValue(goal) {
    if (goal.kind === "score") return score;
    if (goal.kind === "collect") return levelStats.collected[goal.type] || 0;
    if (goal.kind === "flux") return levelStats.fluxCleared;
    if (goal.kind === "signal") return levelStats.signalCollected;
    if (goal.kind === "spread") return levelStats.spreadCleared;
    if (goal.kind === "specials") return levelStats.specialsCreated;
    if (goal.kind === "fusion") return levelStats.fusions;
    if (goal.kind === "chain") return levelStats.maxChain;
    if (goal.kind === "overdrive") return levelStats.overdrives;
    return 0;
  }

  function completeLevel() {
    levelState = "won";
    pendingSwap = null;
    var savedMoves = movesLeft;
    if (savedMoves > 0) score += savedMoves * 200;
    var stars = calculateStars();
    var savedStars = campaignSave.stars[currentLevel.id] || 0;
    var firstClear = savedStars === 0;
    campaignSave.stars[currentLevel.id] = Math.max(savedStars, stars);
    campaignSave.unlocked = Math.max(campaignSave.unlocked, Math.min(campaign.length, currentLevel.id + 1));
    grantLevelRewards(stars, savedStars);
    claimStarRewards(true);
    recordDailyMissionProgress("campaignWin", 1);
    recordWeeklyEventPoints(calculateCampaignEventPoints(savedMoves, stars), "level clear", true);
    delete campaignSave.failStreaks[currentLevel.id];

    // Hums: record one recording segment per level. firstClear (a level always
    // clears with >=1 star) is the per-level guard, so replays never double-count.
    // The Finale forces the outline full and wakes the Hum. Deterministic, cap 15.
    var humId = getHumIdForLevel(currentLevel);
    var hum = ensureHumState(humId);
    var humFromProgress = Math.max(0, Math.min(1, hum.segments / HUM_SEGMENTS));
    var finaleWake = isFinaleLevel(currentLevel);
    // Early first wake: on a fresh save (no Hum awake yet) wake the very first
    // Hum on an early clear instead of making the player wait for the L15 Finale,
    // so the collection shows a live payoff in the first minutes. Fires once.
    var earlyFirstWake = !hum.awake && !finaleWake
      && currentLevel.id === HUM_FIRST_WAKE_LEVEL
      && humId === HUM_IDS[0]
      && greenroomAwakeCount() === 0;
    var wakeNow = finaleWake || earlyFirstWake;
    if (wakeNow) {
      hum.segments = HUM_SEGMENTS;
      hum.awake = true;
      greenroomSpotlightHum = humId; // spotlight the freshest wake in the Greenroom
    } else if (firstClear && hum.segments < HUM_SEGMENTS) {
      hum.segments += 1;
    }
    writeCampaignSave();

    flash = Math.min(1, flash + 0.45);
    bumpShake(0.22);
    vibrate("win");
    var celebrationMs = startLevelClearCelebration(savedMoves, stars, wakeNow);
    if (wakeNow && celebration) {
      // Center-stage wake ritual on the win card: complete the outline,
      // born-from-light color lerp, one blink, then a beat-locked dance, all
      // clocked to the beat. A bright in-key chord lands on the born beat.
      celebration.wake = {
        humId: humId,
        fromProgress: humFromProgress,
        beatMs: getCelebrationBeatMs(),
        age: 0,
        alpha: 0
      };
      playHumWakeChord();
    }
    // Hum corner cameo on level clear REMOVED (Jung 2026-07-07: the "random Bip
    // spawner" that pops on the board every clear). The woken-Hum payoff is now
    // the track voice layer + the move perk + the Greenroom, not a corner hop.
    // The Finale wake ritual (above, wakeNow) stays — it's a deterministic,
    // once-per-track born-from-light moment, not a random per-clear pop.
    if (!AUDIO_TUNING.continuousGroove && audio.started && audio.ctx && audio.bed) {
      // Crossfade tail: ease the arrangement bus out under the win sting so the
      // next level fades in on the tonic instead of hard-cutting. The sting rings
      // through on the impact bus, which bypasses this bed. Three time constants
      // reach the floor across transitionTailBars.
      var tailNow = audio.ctx.currentTime;
      var tailConstant = ((60 / getActiveBpm()) / 4) * 16 * AUDIO_TUNING.transitionTailBars / 3;
      audio.bed.gain.cancelScheduledValues(tailNow);
      audio.bed.gain.setValueAtTime(audio.bed.gain.value, tailNow);
      audio.bed.gain.setTargetAtTime(AUDIO_TUNING.transitionTailFloor, tailNow, tailConstant);
    }
    // Play the win sting first, then duck the impact bus *after* it rings out (below).
    var stingEnd = playLevelWin(stars);
    if (!AUDIO_TUNING.continuousGroove && audio.started && audio.ctx && audio.impact) {
      // Drums bypass the bed on the impact bus, so the bed tail alone leaves the kick
      // thumping straight through the hand-off (the "drums drums drums" gap). Ramp the
      // impact bus down toward silence for the bridge so the groove clears out;
      // resetMusicPhrase restores it before the next groove re-enters. The win sting
      // (kick + motif arpeggio + 3-star bonus) also routes through impact, so start the
      // duck at stingEnd rather than now -- otherwise the payoff decrescendos across its
      // own arpeggio as the bus ramps down under it. A bounded linearRamp (not
      // setTargetAtTime) so the restore's setValueAtTime always overrides it.
      var duckNow = audio.ctx.currentTime;
      var duckStart = Math.max(duckNow, stingEnd || 0);
      var impactTailConstant = ((60 / getActiveBpm()) / 4) * 16 * AUDIO_TUNING.transitionTailBars / 3;
      var impactFloor = (audio.muted ? 0 : audio.volume * AUDIO_TUNING.impactLevel) * (1 - AUDIO_TUNING.bridgeDuckDepth);
      var impactTailSeconds = impactTailConstant * 3;
      audio.impact.gain.cancelScheduledValues(duckStart);
      audio.impact.gain.setValueAtTime(audio.impact.gain.value, duckStart);
      audio.impact.gain.linearRampToValueAtTime(impactFloor, duckStart + impactTailSeconds);
    }
    scheduleShareCard(buildCampaignSharePayload(savedMoves, stars, true, firstClear), getLevelClearResultDelay(savedMoves, stars, firstClear, celebrationMs));
  }

  function shouldAutoOpenCampaignShare(savedMoves, stars, firstClear) {
    if (currentLevel.id === 1 && firstClear) return true;
    if (currentLevel.id === 5 || currentLevel.id === 8 || currentLevel.id === 10) return true;
    if (levelStats.fusions > 0) return true;
    if (levelStats.maxChain >= 3) return true;
    if (levelStats.overdrives > 0 && currentLevel.id >= 5) return true;
    if (savedMoves >= Math.ceil(currentLevel.moves * 0.62) && currentLevel.id >= 6) return true;
    return stars >= 3 && currentLevel.id % 10 === 0;
  }

  function getLevelClearResultDelay(savedMoves, stars, firstClear, celebrationMs) {
    // The result card may open only after the staged celebration finishes.
    var hasFinale = savedMoves > 0;
    var viralClear = shouldAutoOpenCampaignShare(savedMoves, stars, firstClear);
    var base;
    if (hasFinale && viralClear) base = 2100;
    else if (hasFinale) base = 1900;
    else base = viralClear ? 1000 : 850;
    return Math.max(base, celebrationMs || 0);
  }

  function getCelebrationBeatMs() {
    // One stage per beat on the music grid; fixed spacing when muted.
    if (audio.started && audio.ctx) return (60 / getActiveBpm()) * 1000;
    return 480;
  }

  function getCelebrationStartDelayMs() {
    // Anchor the first pop on the audio grid like the win sting.
    if (audio.started && audio.ctx && audio.ctx.state === "running") {
      var start = quantize(audio.ctx.currentTime + 0.02, AUDIO_TUNING.heroSnapSteps);
      return Math.max(16, Math.round((start - audio.ctx.currentTime) * 1000));
    }
    return 160;
  }

  // Level-clear celebration: center-board text pops staged one per beat,
  // nothing simultaneous. LEVEL CLEAR, then each earned star, then ENCORE +N
  // (skipped at 0 saved moves). Pops bypass the callout queue so match
  // callouts cannot interleave; the queue is parked during the sequence and
  // flushed at the end. Returns the total sequence length in ms so the
  // result card never clips it.
  function startLevelClearCelebration(savedMoves, stars, holdForWake) {
    var beatMs = getCelebrationBeatMs();
    var startMs = getCelebrationStartDelayMs();
    var stages = [{ kind: "title" }];
    for (var s = 0; s < stars; s += 1) stages.push({ kind: "star" });
    if (savedMoves > 0) stages.push({ kind: "encore" });

    activeCallout = null;
    calloutQueue = [];
    // Fast-expire in-flight score floaters so they don't render through the
    // LEVEL CLEAR title (e.g. a nova sweep winning with +NNNN still airborne).
    for (var f = 0; f < floaters.length; f += 1) {
      if (floaters[f].life > 0.25) floaters[f].life = 0.25;
    }
    celebration = { starTotal: stars, starsLanded: 0, pops: [], fading: false };

    stages.forEach(function (stage, index) {
      runLater(startMs + index * beatMs, function () {
        popCelebrationStage(stage.kind, savedMoves, stars, index, stages.length);
      });
    });

    if (savedMoves > 0) {
      recordClipFinale(savedMoves, stars);
      var blastCount = Math.min(14, Math.max(3, savedMoves));
      for (var i = 0; i < blastCount; i += 1) {
        scheduleFinaleBurst(i, blastCount, savedMoves, stars, startMs, beatMs, stages.length);
      }
    }

    var totalMs = Math.round(startMs + (stages.length - 1) * beatMs + beatMs * 1.5);
    // Hold the card long enough for the Hum wake ritual (~3 beats) so the result
    // card never opens over the born-from-light sequence. Applies to the Finale
    // wake and the early first wake alike (holdForWake).
    if (gameMode === MODE_CAMPAIGN && (holdForWake || isFinaleLevel(currentLevel))) {
      totalMs = Math.max(totalMs, Math.round(startMs + beatMs * 3.2));
    }
    runLater(Math.max(0, totalMs - Math.round(beatMs * 0.4)), endLevelClearCelebration);
    return totalMs;
  }

  function popCelebrationStage(kind, savedMoves, stars, stageIndex, stageCount) {
    if (!celebration || celebration.fading) return;
    var pop = { kind: kind, age: 0, scale: 0.5, alpha: 1 };
    if (kind === "title") {
      pop.text = "LEVEL CLEAR";
      pop.color = "#8cff6b";
    } else if (kind === "star") {
      pop.index = celebration.starsLanded;
      celebration.starsLanded += 1;
      pop.text = "★";
      pop.color = "#ffd166";
    } else {
      pop.text = "ENCORE +" + savedMoves;
      pop.color = "#ffd166";
      triggerCameoHop(); // the encore beat is an encore blast: hop the corner Hum
    }
    celebration.pops.push(pop);

    var pos = getCelebrationPopPosition(pop);
    flash = Math.min(1, flash + (kind === "title" ? 0.24 : 0.14));
    bumpShake(kind === "title" ? 0.16 : 0.09);
    addShockwave(pos.x, pos.y, pop.color, view.cell * 0.2, view.cell * (kind === "title" ? 2.6 : 1.6), 0.36, 10);
    addImpactRays(pos.x, pos.y, pop.color, 4 + stars, kind !== "star");
    addFinaleParticles(pos.x, pos.y, pop.color, stars);
    // No encore blasts to carry the audio at 0 saved moves: give each pop a beat hit.
    if (savedMoves <= 0) playFinaleHit(stageIndex, stageCount, stars);
  }

  function getCelebrationPopPosition(pop) {
    if (pop.kind === "title") return { x: centerBoardX(), y: centerBoardY() - view.cell * 1.15 };
    if (pop.kind === "star") {
      var total = celebration ? celebration.starTotal : 3;
      return { x: centerBoardX() + (pop.index - (total - 1) / 2) * view.cell * 1.2, y: centerBoardY() };
    }
    return { x: centerBoardX(), y: centerBoardY() + view.cell * 1.15 };
  }

  function endLevelClearCelebration() {
    if (!celebration) return;
    celebration.fading = true;
    calloutQueue = []; // flush callouts parked during the sequence
  }

  function scheduleFinaleBurst(index, total, savedMoves, stars, startMs, beatMs, stageCount) {
    // Blasts land on the 16th grid between the beat-aligned text pops:
    // skip every 4th 16th (the pop beats) so bursts punctuate, not compete.
    var slots = [];
    for (var sixteenth = 1; slots.length < total && sixteenth <= stageCount * 4 + 2; sixteenth += 1) {
      if (sixteenth % 4 !== 0) slots.push(sixteenth);
    }
    runLater(Math.round(startMs + slots[index % slots.length] * (beatMs / 4)), function () {
      var row = (index * 3 + stars + currentLevel.id) % GRID;
      var col = (index * 5 + savedMoves + currentLevel.id) % GRID;
      var gem = board[row] && board[row][col];
      var typeIndex = gem ? gem.type : (index + currentLevel.id) % TYPES.length;
      var color = TYPES[typeIndex].color;
      var x = view.boardX + col * view.cell + view.cell / 2;
      var y = view.boardY + row * view.cell + view.cell / 2;
      var radius = view.cell * (1.1 + index / Math.max(1, total) * 1.25);

      flash = Math.min(1, flash + 0.12);
      bumpShake(0.08);
      addShockwave(x, y, color, view.cell * 0.18, radius, 0.32, 8 + (index % 6));
      addImpactRays(x, y, color, 4 + stars, true);
      addFinaleParticles(x, y, color, stars);

      if (index % 3 === 0) addSpecialBeam(index % 2 === 0 ? "lineH" : "lineV", row, col, color);
      if (index === total - 1) {
        addShockwave(centerBoardX(), centerBoardY(), "#ffffff", view.cell * 0.4, view.boardSize * 0.72, 0.5, 18);
      }

      playFinaleHit(index, total, stars);
      triggerCameoHop(); // sync the corner Hum's hop to this encore blast
    });
  }

  // One-shot amplified hop on the win-card corner-groove Hum, fired in sync with
  // each encore blast/beat. Sets a poke envelope the celebration update decays;
  // no-ops on the Finale card (no cameo) and off-campaign. Pure cosmetic.
  // Capped: a high savedMoves schedules up to 14 encore blasts, and re-poking the
  // hop on every one buzzes the cameo into a jitter. A few punches read as beats.
  var CAMEO_HOP_CAP = 4;
  function triggerCameoHop() {
    var cameo = celebration && celebration.cameo;
    if (!cameo) return;
    if ((cameo.hops || 0) >= CAMEO_HOP_CAP) return;
    cameo.hops = (cameo.hops || 0) + 1;
    cameo.hop = 1;
  }

  function addFinaleParticles(x, y, color, stars) {
    var count = scaledEffectCount(18 + stars * 8, 8);
    for (var i = 0; i < count; i += 1) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 180 + Math.random() * 420 + stars * 50;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.42 + Math.random() * 0.36,
        ttl: 0.42 + Math.random() * 0.36,
        size: 1.8 + Math.random() * 4,
        color: color,
        line: true
      });
    }
    trimEffects();
  }

  function centerBoardX() {
    return view.boardX + view.boardSize / 2;
  }

  function centerBoardY() {
    return view.boardY + view.boardSize / 2;
  }

  function calloutAnchorY() {
    // In-board callout band (upper third). Computed only from the board rect so
    // no DOM element (HUD strip, mission panel) can ever cover a named callout.
    return view.boardY + view.boardSize * 0.18;
  }

  function grantLevelRewards(stars, savedStars) {
    if (stars <= savedStars) return;
    var delta = stars - savedStars;
    if (savedStars === 0) grantFirstClearReward(currentLevel.id);
    if (savedStars === 0 && currentLevel.id > 10 && !FIRST_CLEAR_REWARDS[currentLevel.id]) {
      var drip = currentLevel.id % 15 === 0 ? 40 : 15;
      grantCredits(drip);
      recordGrant("First clear", "+" + drip + " Credits");
      flyRewardBundle(centerBoardX(), centerBoardY(), null, drip);
    }
    if (currentLevel.id > 16 && delta >= 1 && currentLevel.id % 3 === 0) grantStarDeltaBooster("hammer", stars);
    if (currentLevel.id > 16 && delta >= 2 && currentLevel.id % 5 === 0) grantStarDeltaBooster("shuffle", stars);
    if (currentLevel.id > 16 && delta >= 3 && currentLevel.id % 8 === 0) grantStarDeltaBooster("charge", stars);
  }

  function grantStarDeltaBooster(name, stars) {
    campaignSave.boosters[name] += 1;
    recordGrant(stars + "-star clear", "+1 " + boosterDisplayName(name));
    flyRewardToTarget(centerBoardX(), centerBoardY(), boosterFlyTargetEl(name), REWARD_FLY[name].glyph, REWARD_FLY[name].color);
  }

  function grantFirstClearReward(levelId) {
    var reward = FIRST_CLEAR_REWARDS[levelId];
    if (!reward) return;
    grantRewardBundle(reward.rewards);
    grantCredits(reward.credits);
    recordGrant("First clear", "+" + describeRewardGrant(reward));
    flyRewardBundle(centerBoardX(), view.boardY + view.boardSize * 0.24, reward.rewards, reward.credits);
    showFirstClearReward(reward);
  }

  function claimStarRewards(showFx) {
    campaignSave.rewards = campaignSave.rewards || {};
    var totalStars = getTotalStars();
    var granted = [];
    STAR_REWARDS.forEach(function (reward) {
      var key = String(reward.threshold);
      if (totalStars < reward.threshold || campaignSave.rewards[key]) return;
      grantRewardBundle(reward.rewards);
      campaignSave.rewards[key] = true;
      granted.push(reward);
      if (showFx) {
        recordGrant("Star Reactor " + reward.threshold, "+" + describeRewardBundle(reward.rewards));
        flyRewardBundle(centerBoardX(), view.boardY + view.boardSize * 0.32, reward.rewards, 0);
      }
    });

    if (showFx && granted.length > 0) {
      showStarReward(granted[granted.length - 1], granted.length);
    }
    return granted;
  }

  function grantRewardBundle(rewards) {
    campaignSave.boosters.hammer += rewards.hammer || 0;
    campaignSave.boosters.shuffle += rewards.shuffle || 0;
    campaignSave.boosters.charge += rewards.charge || 0;
  }

  function grantCredits(amount) {
    var value = Math.max(0, Math.floor(amount) || 0);
    if (value <= 0) return;
    campaignSave.wallet = normalizeWallet(campaignSave.wallet);
    campaignSave.wallet.credits += value;
  }

  function resetGrantLedger() {
    levelGrantLedger = [];
    rewardDropState = { dropped: 0, lastDropMove: -99 };
  }

  function recordGrant(cause, rewardText) {
    if (!cause || !rewardText) return;
    levelGrantLedger.push({ cause: cause, reward: rewardText });
    if (levelGrantLedger.length > 8) levelGrantLedger.shift();
  }

  function buildGrantLedgerStats() {
    return levelGrantLedger.slice(-6).map(function (entry) {
      return { label: "Earned", value: entry.cause + " → " + entry.reward };
    });
  }

  function boosterDisplayName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  function boosterFlyTargetEl(name) {
    if (name === "hammer") return hammerButton;
    if (name === "shuffle") return shuffleButton;
    if (name === "charge") return chargeButton;
    return storeButton;
  }

  function isElementVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    var rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function resolveFlyTarget(targetEl) {
    if (isElementVisible(targetEl)) return targetEl;
    // Hidden readouts (store wallet, locked booster row) route to the Store entry instead.
    if (isElementVisible(storeButton)) return storeButton;
    return null;
  }

  function flyRewardToTarget(fromX, fromY, targetEl, glyph, color) {
    var destEl = resolveFlyTarget(targetEl);
    if (!destEl || flyRewardCount >= effectLimit("flyRewards")) return;
    var canvasRect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
    var startX = canvasRect.left + fromX;
    var startY = canvasRect.top + fromY;
    var destRect = destEl.getBoundingClientRect();
    var endX = destRect.left + destRect.width / 2;
    var endY = destRect.top + destRect.height / 2;
    var el = document.createElement("span");
    el.className = "fly-reward";
    el.textContent = glyph;
    el.style.color = color;
    el.style.transform = "translate(" + startX + "px, " + startY + "px) translate(-50%, -50%)";
    document.body.appendChild(el);
    flyRewardCount += 1;
    addShockwave(fromX, fromY, color, view.cell * 0.1, view.cell * 0.7, 0.24, 6);

    var duration = 560 + 160 * fxScale();
    var arcLift = Math.min(120, Math.abs(endY - startY) * 0.35 + 46);
    var startTime = 0;
    function step(now) {
      if (!startTime) startTime = now;
      var t = Math.min(1, (now - startTime) / duration);
      var eased = t * t * (3 - 2 * t);
      var x = startX + (endX - startX) * eased;
      var y = startY + (endY - startY) * eased - Math.sin(t * Math.PI) * arcLift;
      el.style.transform = "translate(" + x + "px, " + y + "px) translate(-50%, -50%) scale(" + (1.15 - t * 0.45) + ")";
      el.style.opacity = t > 0.85 ? String(1 - (t - 0.85) / 0.15) : "1";
      if (t < 1) {
        requestAnimationFrame(step);
        return;
      }
      if (el.parentNode) el.parentNode.removeChild(el);
      flyRewardCount = Math.max(0, flyRewardCount - 1);
      pulseFlyTarget(destEl);
    }
    requestAnimationFrame(step);
  }

  function pulseFlyTarget(el) {
    if (!el) return;
    el.classList.remove("reward-pulse");
    // Force a reflow so back-to-back arrivals restart the pulse animation.
    void el.offsetWidth;
    el.classList.add("reward-pulse");
    window.setTimeout(function () {
      el.classList.remove("reward-pulse");
    }, 460);
  }

  function flyRewardBundle(fromX, fromY, rewards, credits) {
    var flights = [];
    ["hammer", "shuffle", "charge"].forEach(function (name) {
      var count = (rewards && rewards[name]) || 0;
      for (var i = 0; i < count; i += 1) flights.push(name);
    });
    var glyphCount = flights.length > 0 ? Math.min(flights.length, scaledEffectCount(flights.length, 1)) : 0;
    for (var index = 0; index < glyphCount; index += 1) {
      (function (name, order) {
        runLater(order * 110, function () {
          flyRewardToTarget(fromX, fromY, boosterFlyTargetEl(name), REWARD_FLY[name].glyph, REWARD_FLY[name].color);
        });
      })(flights[index], index);
    }
    if (credits > 0) {
      runLater(glyphCount * 110, function () {
        flyRewardToTarget(fromX, fromY, creditCountEl, REWARD_FLY.credits.glyph, REWARD_FLY.credits.color);
      });
    }
  }

  function maybeSpawnRewardDrop(groups, chain, clearMap) {
    if (gameMode !== MODE_CAMPAIGN || levelState !== "playing" || !currentLevel) return;
    // Feel lock: the booster row stays hidden until the first booster is earned. No drops before that.
    if (boosterRow.classList.contains("is-locked")) return;
    if (rewardDropState.dropped >= REWARD_DROP.maxPerLevel) return;
    if (levelStats.movesMade - rewardDropState.lastDropMove < REWARD_DROP.cooldownMoves) return;
    var big = false;
    for (var g = 0; g < groups.length; g += 1) {
      if (groups[g].length >= 5) big = true;
    }
    if (!big && chain < 4) return;
    var chance = big ? REWARD_DROP.dropChanceBig : REWARD_DROP.dropChanceChain;
    // Math.random on purpose: boardRng is the deterministic level seed and must not advance here.
    if (Math.random() >= chance) return;

    var candidates = [];
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        if (!isCellActive(row, col)) continue;
        if (clearMap[row + ":" + col]) continue;
        var gem = board[row] && board[row][col];
        if (!gem || gem.special || gem.drop) continue;
        candidates.push({ row: row, col: col, gem: gem });
      }
    }
    if (candidates.length === 0) return;
    var pick = candidates[Math.floor(Math.random() * candidates.length)];
    var allowed = REWARD_DROP.allowedBoosters;
    var name = allowed[Math.floor(Math.random() * allowed.length)] || "hammer";
    pick.gem.drop = name;
    pick.gem.dropCause = big ? "Big match" : "Chain x" + chain;
    rewardDropState.dropped += 1;
    rewardDropState.lastDropMove = levelStats.movesMade;
    var center = getBoardCellCenter(pick);
    addShockwave(center.x, center.y, REWARD_FLY[name].color, view.cell * 0.12, view.cell * 0.9, 0.3, 7);
  }

  function isDropCollected(row, col, clearMap) {
    if (clearMap[row + ":" + col]) return true;
    return Boolean(
      clearMap[(row - 1) + ":" + col] ||
      clearMap[(row + 1) + ":" + col] ||
      clearMap[row + ":" + (col - 1)] ||
      clearMap[row + ":" + (col + 1)]
    );
  }

  function collectRewardDrops(clearMap) {
    if (gameMode !== MODE_CAMPAIGN) return;
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        var gem = board[row] && board[row][col];
        if (!gem || !gem.drop || !isDropCollected(row, col, clearMap)) continue;
        var name = gem.drop;
        var cause = gem.dropCause || "Board drop";
        gem.drop = null;
        gem.dropCause = null;
        campaignSave.boosters[name] = (campaignSave.boosters[name] || 0) + 1;
        writeCampaignSave();
        recordGrant(cause, "+1 " + boosterDisplayName(name));
        var center = getBoardCellCenter({ row: row, col: col });
        flyRewardToTarget(center.x, center.y, boosterFlyTargetEl(name), REWARD_FLY[name].glyph, REWARD_FLY[name].color);
        playBoosterHit(name);
      }
    }
  }

  function showFirstClearReward(reward) {
    var label = describeRewardGrant(reward);
    if (!label) return;
    var centerX = view.boardX + view.boardSize / 2;
    var centerY = view.boardY + view.boardSize * 0.24;
    addShockwave(centerX, centerY, "#46f4ff", view.cell * 0.16, view.cell * 1.2, 0.28, 8);
    playBoosterHit("shuffle");
  }

  function describeRewardGrant(reward) {
    var parts = [];
    var boosters = describeRewardBundle(reward.rewards || {});
    if (boosters) parts.push(boosters);
    if (reward.credits) parts.push(reward.credits + " Credits");
    return parts.join(" + ");
  }

  function describeRewardGrantCompact(reward) {
    var rewards = reward.rewards || {};
    var boosterCount = (rewards.hammer || 0) + (rewards.shuffle || 0) + (rewards.charge || 0);
    var boosterTypes = [];
    if (rewards.hammer) boosterTypes.push({ name: "Hammer", count: rewards.hammer });
    if (rewards.shuffle) boosterTypes.push({ name: "Shuffle", count: rewards.shuffle });
    if (rewards.charge) boosterTypes.push({ name: "Charge", count: rewards.charge });

    var parts = [];
    if (boosterTypes.length === 1) {
      var only = boosterTypes[0];
      parts.push((only.count > 1 ? only.count + " " : "") + only.name);
    } else if (boosterCount > 0) {
      parts.push(boosterCount + " boosts");
    }
    if (reward.credits) parts.push(reward.credits + "C");
    return parts.join("+");
  }

  function showStarReward(reward, count) {
    var label = describeRewardBundle(reward.rewards);
    var centerX = view.boardX + view.boardSize / 2;
    var centerY = view.boardY + view.boardSize * 0.32;
    addCallout("STAR REACTOR " + reward.threshold + " +" + label, "#ffd166", 24);
    addShockwave(centerX, centerY, "#ffd166", view.cell * 0.2, view.cell * 1.8, 0.38, 12);
    playBoosterHit("charge");
    vibrate("special");
  }

  function describeRewardBundle(rewards) {
    var parts = [];
    if (rewards.hammer) parts.push(rewards.hammer + " Hammer");
    if (rewards.shuffle) parts.push(rewards.shuffle + " Shuffle");
    if (rewards.charge) parts.push(rewards.charge + " Charge");
    return parts.join(" + ");
  }

  function getNextStarReward(totalStars) {
    for (var i = 0; i < STAR_REWARDS.length; i += 1) {
      if (totalStars < STAR_REWARDS[i].threshold) return STAR_REWARDS[i];
    }
    return null;
  }

  function getLevelRewardPreview(level) {
    if (!level || (campaignSave.stars[level.id] || 0) > 0) return "";
    var reward = FIRST_CLEAR_REWARDS[level.id];
    if (!reward) return "";
    return describeRewardGrant(reward);
  }

  function getLevelRewardPreviewCompact(level) {
    if (!level || (campaignSave.stars[level.id] || 0) > 0) return "";
    var reward = FIRST_CLEAR_REWARDS[level.id];
    if (!reward) return "";
    return describeRewardGrantCompact(reward);
  }

  function failLevel() {
    // Snapshot the live arrangement before the state flips so the music can
    // ramp down to the base floor instead of cutting on the loss.
    audio.failRamp = getCampaignArrangement();
    if (audio.failRamp) audio.failRamp.step = audio.step;
    levelState = "lost";
    pendingSwap = null;
    recordWaveformEvent("flatline");
    campaignSave.failStreaks[currentLevel.id] = (campaignSave.failStreaks[currentLevel.id] || 0) + 1;
    audio.director.failPressure = 1;
    writeCampaignSave();
    flash = Math.min(1, flash + 0.2);
    bumpShake(0.14);
    vibrate("fail");
    var nm = getNearMissFraming();
    // A near-miss lands warm ("SO CLOSE" gold) instead of the defeat-red "OUT OF
    // MOVES", so the emotion hits on the board where the retry decision is made.
    addCallout(nm.near ? nm.callout : "OUT OF MOVES", nm.near ? (nm.strong ? "#ffd166" : "#ff9f4f") : "#ff5e7a", nm.strong ? 30 : 26);
    addCallout(canAffordContinue() ? "CONTINUE +5" : "NEW TAKE", "#ffd166", 18);
    playLevelFail();
    updateHud();
    // Hold the tap-to-restart lock through the full card delay so no board tap
    // can restart the level before the fail card (and its Continue +5 offer) is
    // on screen. shareCardPending covers the same window; this is the timing
    // backstop that matches the 900ms scheduleShareCard delay below.
    failLockUntil = performance.now() + 900;
    scheduleShareCard(buildFailPayload(), 900);
  }

  function endRush() {
    if (!isPulseMode() || levelState !== "playing") return;
    levelState = "lost";
    recordWaveformEvent("flatline");
    pulse = 0;
    drive = 0;
    updatePulseBestScore();
    recordDailyTake();
    flash = Math.min(1, flash + 0.34);
    bumpShake(0.24);
    vibrate("fail");
    addCallout(gameMode === MODE_DAILY ? (isDailyRehearsal() ? "REHEARSAL ENDED" : "DAILY ENDED") : "PULSE LOST", "#ff5e7a", 26);
    addCallout(isDailyRehearsal() ? "REHEARSAL · UNSCORED" : hasPulseNewBest() ? "NEW BEST " + score : "SCORE " + score, "#eff9ff", 20);
    addShockwave(centerBoardX(), centerBoardY(), "#ff5e7a", view.cell * 0.24, view.boardSize * 0.64, 0.42, 14);
    playRushEnd();
    recordDailyMissionProgress("rushTime", Math.floor(rushSeconds));
    // Rehearsal runs stay unscored everywhere: no Cup points to farm.
    if (!isDailyRehearsal()) recordWeeklyEventPoints(calculatePulseEventPoints(), gameMode === MODE_DAILY ? "daily pulse" : "pulse run", true);
    updateHud();
    scheduleShareCard(buildPulseSharePayload(), 700);
  }

  function calculateStars() {
    var stars = 0;
    currentLevel.starTargets.forEach(function (target) {
      if (score >= target) stars += 1;
    });
    if (movesLeft >= Math.ceil(currentLevel.moves * 0.28)) stars = Math.max(stars, 2);
    if (movesLeft >= Math.ceil(currentLevel.moves * 0.42) && score >= currentLevel.starTargets[1]) stars = 3;
    return Math.max(1, Math.min(3, stars));
  }

  function calculateCampaignEventPoints(savedMoves, stars) {
    var sectorGateBonus = currentLevel.id % 15 === 0 ? 30 : 0;
    return (
      stars * 28 +
      Math.max(0, savedMoves) * 5 +
      levelStats.maxChain * 7 +
      levelStats.overdrives * 18 +
      levelStats.fusions * 24 +
      sectorGateBonus
    );
  }

  function calculatePulseEventPoints() {
    var base = Math.floor(score / 1200) + Math.floor(rushSeconds / 2);
    var skill = levelStats.maxChain * 9 + levelStats.overdrives * 18 + levelStats.fusions * 24;
    var dailyBonus = gameMode === MODE_DAILY ? 28 : 0;
    var bestBonus = hasPulseNewBest() ? 36 : 0;
    return Math.min(340, Math.max(18, base + skill + dailyBonus + bestBonus));
  }

  function renderStars(count) {
    var text = "";
    for (var i = 0; i < 3; i += 1) {
      text += i < count ? "\u2605" : "\u2606";
    }
    return text;
  }

  function recordClipMoment(cells, chain, specialHitCount, specialSpawned, points, overdriveActive) {
    var clearCount = cells.length;
    var previousScore = levelStats.clipScore;
    var momentScore = Math.round(
      points / 45 +
      clearCount * 10 +
      chain * 22 +
      specialHitCount * 35 +
      (specialSpawned ? 18 : 0) +
      (overdriveActive ? 32 : 0)
    );
    var reason = describeMatchMoment(clearCount, chain, specialHitCount, specialSpawned, overdriveActive);

    levelStats.biggestClear = Math.max(levelStats.biggestClear, clearCount);
    levelStats.bestMatchScore = Math.max(levelStats.bestMatchScore, points);

    if (momentScore <= levelStats.clipScore) return;
    levelStats.clipScore = momentScore;
    levelStats.clipReason = reason;

    if (momentScore >= 150 && momentScore >= previousScore + 20) {
      announceClipMoment(cells, momentScore, reason);
    }
  }

  function recordSpecialComboClip(cells, points, label, overdriveActive) {
    var clearCount = cells.length;
    var momentScore = Math.round(points / 35 + clearCount * 14 + 110 + (overdriveActive ? 42 : 0));
    var reason = label + " fusion";

    levelStats.biggestClear = Math.max(levelStats.biggestClear, clearCount);
    levelStats.bestMatchScore = Math.max(levelStats.bestMatchScore, points);

    if (momentScore > levelStats.clipScore) {
      levelStats.clipScore = momentScore;
      levelStats.clipReason = reason;
    }

    if (momentScore >= 150) {
      announceClipMoment(cells, momentScore, reason);
    }
  }

  function recordPulseReleaseClip(cells, points, overdriveActive) {
    var clearCount = cells.length;
    var momentScore = Math.round(points / 34 + clearCount * 16 + levelStats.pulseReleases * 52 + (overdriveActive ? 54 : 0));
    var reason = "Pulse Release fireworks";

    levelStats.biggestClear = Math.max(levelStats.biggestClear, clearCount);
    levelStats.bestMatchScore = Math.max(levelStats.bestMatchScore, points);

    if (momentScore > levelStats.clipScore) {
      levelStats.clipScore = momentScore;
      levelStats.clipReason = reason;
    }

    if (momentScore >= 150) {
      announceClipMoment(cells, momentScore, reason);
    }
  }

  function describeMatchMoment(clearCount, chain, specialHitCount, specialSpawned, overdriveActive) {
    if (specialHitCount >= 3) return "Special chain";
    if (clearCount >= 14) return "Board burst";
    if (overdriveActive && chain >= 3) return "Overdrive chain";
    if (chain >= 4) return "Cascade chain";
    if (specialHitCount > 0) return "Special detonation";
    if (specialSpawned) return "Special formed";
    if (overdriveActive) return "Overdrive hit";
    return clearCount + " shapes cleared";
  }

  function announceClipMoment(cells, momentScore, reason) {
    var center = averageCellPosition(cells);
    var tier = getClipTier(momentScore);
    addCallout("CLIP GRADE " + tier.grade, tier.color, 22);
    if (momentScore >= 240) {
      addCallout("POST THIS", "#ffd166", 20);
      addShockwave(center.x, center.y, tier.color, view.cell * 0.22, view.cell * 1.75, 0.36, 12);
    }
  }

  function recordClipFinale(savedMoves, stars) {
    if (savedMoves <= 0) return;
    var finaleScore = savedMoves * 18 + stars * 38 + levelStats.maxChain * 12 + levelStats.overdrives * 20;
    var reason = savedMoves >= 10 ? "Encore bomb: " + savedMoves + " moves" : "Encore release: " + savedMoves + " moves";
    if (finaleScore > levelStats.clipScore) {
      levelStats.clipScore = finaleScore;
      levelStats.clipReason = reason;
    }
  }

  function getClipTier(value) {
    if (value >= 320) return { grade: "S", color: "#ffffff" };
    if (value >= 240) return { grade: "A", color: "#ffd166" };
    if (value >= 160) return { grade: "B", color: "#46f4ff" };
    return { grade: "C", color: "#90a4af" };
  }

  function buildClipProof(savedMoves, stars) {
    var value = levelStats.clipScore;
    var reason = levelStats.clipReason || "Score chase";

    if (savedMoves > 0) {
      var finaleValue = savedMoves * 18 + stars * 38 + levelStats.maxChain * 12 + levelStats.overdrives * 20;
      if (finaleValue >= value) {
        value = finaleValue;
        reason = savedMoves >= 10 ? "Encore bomb: " + savedMoves + " moves" : "Encore release: " + savedMoves + " moves";
      }
    }

    if (isPulseMode()) {
      var pulseValue = Math.floor(rushSeconds * 1.5) + levelStats.maxChain * 30 + levelStats.overdrives * 26 + levelStats.pulseReleases * 58 + Math.floor(score / 3500);
      if (hasPulseNewBest()) pulseValue += 60;
      if (pulseValue >= value) {
        value = pulseValue;
        if (levelStats.pulseReleases > 0) reason = "Pulse releases: " + levelStats.pulseReleases;
        else reason = hasPulseNewBest() ? "New best Pulse run" : "Pulse survival: " + formatRunTime(rushSeconds);
      }
    }

    var tier = getClipTier(value);
    return {
      grade: tier.grade,
      score: Math.max(0, value),
      reason: reason,
      stat: tier.grade + " " + Math.max(0, value)
    };
  }

  function addMatchFloaters(cells, chain, points, multiplier, specialHitCount, specialSpawn) {
    var center = averageCellPosition(cells);
    var color = multiplier > 1 ? "#ffd166" : "#eff9ff";
    var mergeRadius = view.cell * 2.2;
    var merged = null;
    var newest = null;
    var scoreCount = 0;
    for (var i = floaters.length - 1; i >= 0; i -= 1) {
      var existing = floaters[i];
      if (!existing.value) continue;
      scoreCount += 1;
      if (!newest) newest = existing;
      if (merged) continue;
      if (existing.ttl - existing.life > 0.55) continue;
      var dx = existing.x - center.x;
      var dy = existing.y - center.y;
      if (dx * dx + dy * dy > mergeRadius * mergeRadius) continue;
      merged = existing;
    }
    if (!merged && scoreCount >= 2) merged = newest;

    if (merged) {
      merged.value += points;
      merged.text = "+" + merged.value;
      merged.color = color;
      merged.life = merged.ttl;
    } else {
      addFloater(center.x, center.y, "+" + points, color, 0.7, 18 + Math.min(8, chain * 2), true);
      var fresh = floaters[floaters.length - 1];
      fresh.value = points;
      fresh.scale = 0.5;
    }

    if (chain >= 3) {
      addCallout("CHAIN " + chain, "#46f4ff", 18 + chain);
    }
  }

  function averageCellPosition(cells) {
    if (cells.length === 0) {
      return {
        x: view.boardX + view.boardSize / 2,
        y: view.boardY + view.boardSize / 2
      };
    }

    var totalX = 0;
    var totalY = 0;
    cells.forEach(function (cell) {
      var gem = board[cell.row] && board[cell.row][cell.col];
      totalX += gem ? gem.x : view.boardX + cell.col * view.cell + view.cell / 2;
      totalY += gem ? gem.y : view.boardY + cell.row * view.cell + view.cell / 2;
    });
    return {
      x: totalX / cells.length,
      y: totalY / cells.length
    };
  }

  function addMatchShockwave(cells, chain, multiplier) {
    var center = averageCellPosition(cells);
    addShockwave(
      center.x,
      center.y,
      multiplier > 1 ? "#ffd166" : "#46f4ff",
      view.cell * 0.16,
      view.cell * (0.7 + chain * 0.2),
      0.24 + chain * 0.04,
      Math.min(14, 5 + chain * 2)
    );
  }

  function addFloater(x, y, text, color, ttl, size, isScore) {
    floaters.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 28,
      vy: -54 - Math.random() * 22,
      text: text,
      color: color,
      life: ttl,
      ttl: ttl,
      size: size,
      scale: 0.72,
      value: isScore ? 1 : 0
    });
    if (isScore) {
      var scoreCount = 0;
      for (var i = floaters.length - 1; i >= 0; i -= 1) {
        if (!floaters[i].value) continue;
        scoreCount += 1;
        if (scoreCount > 2) floaters.splice(i, 1);
      }
    }
    var limit = effectLimit("floaters");
    if (floaters.length > limit) floaters.splice(0, floaters.length - limit);
  }

  function parkActiveCallout() {
    if (!activeCallout) return;
    calloutQueue.unshift(activeCallout);
    activeCallout = null;
  }

  function isSectorRevealActive() {
    for (var i = 0; i < floaters.length; i += 1) {
      var text = floaters[i].text || "";
      if (text.indexOf("TRACK ") === 0 || text.indexOf("NEW FREQUENCY") === 0) return true;
    }
    return false;
  }

  function addCallout(text, color, size) {
    size = size || 18;
    if (activeCallout && activeCallout.text === text) return;
    for (var i = 0; i < calloutQueue.length; i += 1) {
      if (calloutQueue[i].text === text) return;
    }

    var callout = {
      text: text,
      color: color,
      size: size,
      life: 0.65,
      ttl: 0.65,
      scale: 0.5
    };

    if (!activeCallout && !isSectorRevealActive() && !celebration) {
      activeCallout = callout;
      return;
    }
    calloutQueue.push(callout);
    if (calloutQueue.length > 4) calloutQueue.shift();
  }

  // Footprint flash: a brief bright tint on the exact cells a special or fusion
  // clears, so a big clear reads instead of just flickering. New VFX budgeted
  // through fxScale / effectLimit and stripped in lean mode like the glow passes.
  function addCellFlash(cells, color) {
    if (!cells || cells.length === 0 || fxScale() <= 0.2) return;
    var limit = effectLimit("cellFlashes");
    for (var i = 0; i < cells.length; i += 1) {
      if (cellFlashes.length >= limit) break;
      var c = cells[i];
      if (!c || !isCellActive(c.row, c.col)) continue;
      cellFlashes.push({ row: c.row, col: c.col, color: color, life: CELL_FLASH_TTL, ttl: CELL_FLASH_TTL });
    }
    if (cellFlashes.length > limit) cellFlashes.splice(0, cellFlashes.length - limit);
  }

  // Names a fired special through the single-anchor callout queue (same queue as
  // OVERDRIVE, so it never overlaps another named callout) and flashes the exact
  // beam/sweep footprint. Called per detonation from activateSpecial.
  function announceSpecialClear(special, cells, color) {
    var label = special === "lineH" ? "ROW CLEAR" : special === "lineV" ? "COLUMN CLEAR" : "COLOR CLEAR";
    addCallout(label, "#ffffff", special === "nova" ? 22 : 18);
    addCellFlash(cells, color);
  }

  function addShockwave(x, y, color, radius, maxRadius, ttl, spokes, delay) {
    var scale = fxScale();
    shockwaves.push({
      x: x,
      y: y,
      color: color,
      radius: radius,
      startRadius: radius,
      maxRadius: maxRadius * (0.78 + scale * 0.22),
      life: ttl * (0.82 + scale * 0.18),
      ttl: ttl * (0.82 + scale * 0.18),
      spokes: Math.max(4, Math.floor(spokes * (0.7 + scale * 0.3))),
      delay: delay || 0
    });
    var limit = effectLimit("shockwaves");
    if (shockwaves.length > limit) {
      shockwaves.splice(0, shockwaves.length - limit);
    }
  }

  function trimEffects() {
    trimEffectList(particles, "particles");
    trimEffectList(beams, "beams");
    trimEffectList(rays, "rays");
  }

  function trimEffectList(list, key) {
    var limit = effectLimit(key);
    if (list.length > limit) list.splice(0, list.length - limit);
  }

  function effectLimit(key) {
    var base = LIMITS[key];
    if (!base) return 0;
    var manualScale = settings.fullFx ? 1 : 0.48;
    var adaptiveScale = getAdaptiveFxMultiplier();
    return Math.max(12, Math.floor(base * manualScale * adaptiveScale));
  }

  function triggerOverdrive() {
    overdrivePulse = 1;
    overdriveExitPulse = 0;
    meterHotActive = true;
    levelStats.overdrives += 1;
    flash = Math.min(1, flash + 0.26);
    bumpShake(0.16);
    recordDailyMissionProgress("overdrive", 1);
    vibrate("overdrive");
    addCallout("OVERDRIVE", "#ffd166", 28);
    playOverdriveStart();
  }

  // Cool-down edge for the drive meter: the enter beat lives in triggerOverdrive,
  // so this only marks the OVERDRIVE badge leaving with a matching callout, a soft
  // in-key fall (playOverdriveEnd), and a short badge contraction (overdriveExitPulse).
  function triggerOverdriveExit() {
    overdriveExitPulse = 1;
    addCallout("OVERDRIVE ENDED", "#7fdfff", 20);
    playOverdriveEnd();
  }

  function reshuffleBoard() {
    combo = 0;
    armedSpecial = null;
    flash = Math.min(1, flash + 0.3);
    bumpShake(0.18);
    // Caged pieces and fuse-wired specials are authored geometry: they
    // hold their cells through the reshuffle.
    var anchored = [];
    forEachGem(function (gem, row, col) {
      if (gem.locked || gem.fuse) anchored.push({ gem: gem, row: row, col: col });
    });
    var restampAnchored = function () {
      anchored.forEach(function (entry) {
        entry.gem.row = entry.row;
        entry.gem.col = entry.col;
        board[entry.row][entry.col] = entry.gem;
      });
    };
    // Re-stamping anchored gems can undo buildFreshBoard's guarantees
    // (no instant match, at least one legal move), so rebuild until the
    // stamped board comes up clean, then re-force a move if none survived.
    var guard = 0;
    do {
      buildFreshBoard(true);
      restampAnchored();
      guard += 1;
    } while (anchored.length > 0 && findMatches().length > 0 && guard < 40);
    if (!hasAnyMove()) forcePlayableMove();
    setTargets();
    playReshuffle();
    updateHud();
  }

  function cellKey(cell) {
    return cell.row + ":" + cell.col;
  }

  function cellsToMap(cells) {
    var map = {};
    cells.forEach(function (cell) {
      markCell(map, cell.row, cell.col);
    });
    return map;
  }

  function markCell(map, row, col) {
    if (row < 0 || row >= GRID || col < 0 || col >= GRID) return;
    if (!isCellActive(row, col)) return;
    // Closed beat gates are solid walls: specials never clear through them.
    if (isBeatGateClosed(row, col)) return;
    map[row + ":" + col] = { row: row, col: col };
  }

  function markRow(map, row) {
    for (var col = 0; col < GRID; col += 1) {
      markCell(map, row, col);
    }
  }

  function markColumn(map, col) {
    for (var row = 0; row < GRID; row += 1) {
      markCell(map, row, col);
    }
  }

  function markBox(map, center, radius) {
    for (var row = center.row - radius; row <= center.row + radius; row += 1) {
      for (var col = center.col - radius; col <= center.col + radius; col += 1) {
        markCell(map, row, col);
      }
    }
  }

  function markBoard(map) {
    for (var row = 0; row < GRID; row += 1) {
      markRow(map, row);
    }
  }

  function markType(map, type) {
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        var gem = board[row] && board[row][col];
        if (gem && gem.type === type) markCell(map, row, col);
      }
    }
  }

  function cellsFromMap(map) {
    return Object.keys(map).map(function (key) {
      return map[key];
    });
  }

  function markSpecialComboCells(comboData, clearMap) {
    var specials = [comboData.specialA, comboData.specialB];
    var hasNova = specials.indexOf("nova") !== -1;
    var lineCells = [];
    if (comboData.specialA !== "nova") lineCells.push({ cell: comboData.a, special: comboData.specialA });
    if (comboData.specialB !== "nova") lineCells.push({ cell: comboData.b, special: comboData.specialB });

    if (hasNova && comboData.specialA === "nova" && comboData.specialB === "nova") {
      markBoard(clearMap);
      return;
    }

    if (hasNova) {
      var novaCell = comboData.specialA === "nova" ? comboData.a : comboData.b;
      // Nova Link must outrank a solo nova sweep (one full color): it sweeps
      // the partner piece's color AND fires a full row + column from the
      // swap site, on top of the tripled line blast below.
      var partnerType = comboData.specialA === "nova" ? comboData.typeB : comboData.typeA;
      markType(clearMap, partnerType);
      markRow(clearMap, novaCell.row);
      markColumn(clearMap, novaCell.col);
      lineCells.forEach(function (entry) {
        if (entry.special === "lineH") {
          markRow(clearMap, entry.cell.row);
          markRow(clearMap, entry.cell.row - 1);
          markRow(clearMap, entry.cell.row + 1);
        } else {
          markColumn(clearMap, entry.cell.col);
          markColumn(clearMap, entry.cell.col - 1);
          markColumn(clearMap, entry.cell.col + 1);
        }
      });
      return;
    }

    lineCells.forEach(function (entry) {
      if (entry.special === "lineH") markRow(clearMap, entry.cell.row);
      else markColumn(clearMap, entry.cell.col);
    });

    if (comboData.specialA === comboData.specialB) {
      if (comboData.specialA === "lineH") {
        markRow(clearMap, comboData.a.row - 1);
        markRow(clearMap, comboData.b.row + 1);
      } else {
        markColumn(clearMap, comboData.a.col - 1);
        markColumn(clearMap, comboData.b.col + 1);
      }
    } else {
      markBox(clearMap, comboData.a, 1);
      markBox(clearMap, comboData.b, 1);
    }
  }

  function collectSpecialHitsFromCells(cells, exclude) {
    var hits = [];
    cells.forEach(function (cell) {
      if (exclude && exclude[cellKey(cell)]) return;
      var gem = board[cell.row] && board[cell.row][cell.col];
      if (gem && gem.special) {
        hits.push({
          cell: { row: cell.row, col: cell.col },
          special: gem.special,
          type: gem.type
        });
      }
    });
    return hits;
  }

  function getSpecialComboLabel(comboData) {
    var specials = [comboData.specialA, comboData.specialB];
    if (specials[0] === "nova" && specials[1] === "nova") return "Total Nova";
    if (specials.indexOf("nova") !== -1) return "Nova Link";
    if (specials[0] !== specials[1]) return "Cross Beam";
    return specials[0] === "lineH" ? "Row Storm" : "Column Storm";
  }

  function chooseSpecialSpawn(groups, anchors) {
    var crossCell = findCrossCell(groups);
    if (crossCell) {
      return {
        cell: crossCell,
        special: "nova"
      };
    }

    var worthy = groups.filter(function (group) {
      return group.length >= 4;
    });
    if (worthy.length === 0) return null;

    worthy.sort(function (a, b) {
      return b.length - a.length;
    });

    var group = worthy[0];
    return {
      cell: pickSpawnCell(group, anchors),
      special: group.length >= 5 ? "nova" : group.horizontal ? "lineH" : "lineV"
    };
  }

  function findCrossCell(groups) {
    var counts = {};
    groups.forEach(function (group) {
      group.cells.forEach(function (cell) {
        var key = cellKey(cell);
        counts[key] = (counts[key] || 0) + 1;
      });
    });

    var crossKey = Object.keys(counts).find(function (key) {
      return counts[key] > 1;
    });
    if (!crossKey) return null;

    var parts = crossKey.split(":");
    return { row: Number(parts[0]), col: Number(parts[1]) };
  }

  function pickSpawnCell(group, anchors) {
    var candidates = [];
    if (anchors) {
      anchors.forEach(function (anchor) {
        if (groupHasCell(group, anchor)) candidates.push({ row: anchor.row, col: anchor.col });
      });
    }
    candidates = candidates.concat(group.cells);

    var open = candidates.find(function (cell) {
      var gem = board[cell.row] && board[cell.row][cell.col];
      return gem && !gem.special;
    });
    if (open) return { row: open.row, col: open.col };

    var middle = group.cells[Math.floor(group.cells.length / 2)];
    return { row: middle.row, col: middle.col };
  }

  function groupHasCell(group, cell) {
    return group.cells.some(function (candidate) {
      return candidate.row === cell.row && candidate.col === cell.col;
    });
  }

  function collectSpecialHits(matches, specialSpawn) {
    var skipKey = specialSpawn ? cellKey(specialSpawn.cell) : null;
    var hits = [];
    matches.forEach(function (cell) {
      if (cellKey(cell) === skipKey) return;
      var gem = board[cell.row] && board[cell.row][cell.col];
      if (gem && gem.special) {
        hits.push({
          cell: { row: cell.row, col: cell.col },
          special: gem.special,
          type: gem.type
        });
      }
    });
    return hits;
  }

  function expandSpecialClears(hits, clearMap, chain) {
    var queue = hits.slice();
    var visited = {};
    while (queue.length > 0) {
      var hit = queue.shift();
      var key = cellKey(hit.cell);
      if (visited[key]) continue;
      visited[key] = true;
      activateSpecial(hit, clearMap, queue, visited, chain);
    }
  }

  function activateSpecial(hit, clearMap, queue, visited, chain) {
    var cell = hit.cell;
    var gem = board[cell.row] && board[cell.row][cell.col];
    if (!gem) return;

    // Detonating a fuse-wired special arms its network: the wired others
    // fire in sequence one beat apart.
    if (gem.fuse && !gem.fuse.fired) primeFuseNetwork(gem.fuse, gem);

    addSpecialBeam(hit.special, cell.row, cell.col, TYPES[gem.type].color);
    addSpecialDetonation(hit.special, cell.row, cell.col, TYPES[gem.type].color, chain);
    playSpecialActivate(hit.special, gem.type, chain);
    flash = Math.min(1, flash + (hit.special === "nova" ? 0.56 : 0.24));
    bumpShake(hit.special === "nova" ? 0.44 : 0.22);
    if (hit.special === "nova") {
      // Solo nova is the biggest non-fusion beat: longer stop than the old
      // 3x3 pop (TIMING.hitStopNova), still under hitStopFusion.
      hitStop = Math.max(hitStop, TIMING.hitStopNovaSweep / 1000);
      novaWarpPulse = Math.min(1, novaWarpPulse + 0.85 * fxScale());
    }

    if (hit.special === "lineH") {
      var rowFlash = [];
      for (var col = 0; col < GRID; col += 1) {
        markSpecialCandidate(cell.row, col, clearMap, queue, visited);
        rowFlash.push({ row: cell.row, col: col });
      }
      announceSpecialClear("lineH", rowFlash, TYPES[gem.type].color);
      return;
    }

    if (hit.special === "lineV") {
      var colFlash = [];
      for (var row = 0; row < GRID; row += 1) {
        markSpecialCandidate(row, cell.col, clearMap, queue, visited);
        colFlash.push({ row: row, col: cell.col });
      }
      announceSpecialClear("lineV", colFlash, TYPES[gem.type].color);
      return;
    }

    // Solo nova: board-wide color sweep. Every piece of the nova's own
    // color detonates with it, beams radiating out over ~2 beats.
    markSpecialCandidate(cell.row, cell.col, clearMap, queue, visited);
    var sweptCells = [];
    for (var r = 0; r < GRID; r += 1) {
      for (var c = 0; c < GRID; c += 1) {
        if (r === cell.row && c === cell.col) continue;
        var target = board[r] && board[r][c];
        if (!target || target.type !== gem.type) continue;
        markSpecialCandidate(r, c, clearMap, queue, visited);
        sweptCells.push({ row: r, col: c });
      }
    }
    addNovaSweepVfx(cell, sweptCells, TYPES[gem.type].color);
    announceSpecialClear("nova", [{ row: cell.row, col: cell.col }].concat(sweptCells), TYPES[gem.type].color);
  }

  function markSpecialCandidate(row, col, clearMap, queue, visited) {
    if (row < 0 || row >= GRID || col < 0 || col >= GRID) return;
    var lock = phaseLockMap[row + ":" + col];
    if (lock) {
      // A blast cracks the cage; the caged piece survives, unlocked.
      shatterPhaseLock(lock, board[row] && board[row][col]);
      return;
    }
    markCell(clearMap, row, col);
    var gem = board[row] && board[row][col];
    if (!gem || !gem.special) return;

    var key = row + ":" + col;
    if (!visited[key]) {
      queue.push({
        cell: { row: row, col: col },
        special: gem.special,
        type: gem.type
      });
    }
  }

  function createSpecialPiece(spawn) {
    var gem = board[spawn.cell.row] && board[spawn.cell.row][spawn.cell.col];
    if (!gem) return;
    // Nova primer: remember the debut nova so the tap guide can find it
    // after the cascade settles (the gem may fall with the board).
    if (gameMode === MODE_CAMPAIGN && novaPrimerSwap && spawn.special === "nova" && !novaPrimerGem && !coachSeen.novaTap) {
      novaPrimerGem = gem;
    }
    gem.special = spawn.special;
    gem.pop = Math.max(gem.pop, 0.72);
    gem.scale = Math.max(gem.scale, 1.16);
    gem.birth = 1;
    bumpShake(spawn.special === "nova" ? 0.18 : 0.08);
    addSpecialCreationBurst(gem, spawn.special);
    addCallout(spawn.special === "nova" ? "NOVA" : "LINE", "#ffffff", spawn.special === "nova" ? 24 : 18);
    playSpecialCreate(spawn.special, gem.type);
  }

  function primeFuseNetwork(network, sourceGem) {
    // Detonating any wired special arms the network: the others fire in
    // wire order, one beat apart, the current pulse hopping the trace to
    // each target ahead of its detonation.
    network.fired = true;
    var hopMs = getFuseHopMs();
    var from = sourceGem;
    var delay = 0;
    network.gems.forEach(function (gem) {
      if (gem === sourceGem) return;
      delay += hopMs;
      fuseQueue.push({ gem: gem, fireAt: performance.now() + delay });
      spawnFusePulse(from, gem, delay - hopMs, hopMs);
      from = gem;
    });
  }

  function getFuseHopMs() {
    // wireBeatSteps 16ths per wire hop (4 = one beat of the track).
    var stepMs = (60 / getActiveBpm() / 4) * 1000;
    var hop = stepMs * AUDIO_TUNING.wireBeatSteps;
    return debugTimeScale !== 1 ? Math.max(30, hop / debugTimeScale) : hop;
  }

  function spawnFusePulse(fromGem, toGem, startDelayMs, durationMs) {
    fusePulses.push({
      from: fromGem,
      to: toGem,
      startAt: performance.now() + startDelayMs,
      duration: Math.max(1, durationMs)
    });
  }

  function updateFuseState() {
    var now = performance.now();
    for (var i = fusePulses.length - 1; i >= 0; i -= 1) {
      if (now - fusePulses[i].startAt > fusePulses[i].duration + 220) fusePulses.splice(i, 1);
    }
    if (fuseQueue.length === 0) return;
    if (levelState !== "playing") {
      fuseQueue = [];
      return;
    }
    if (animating || isGameplayPaused()) return;
    if (now < fuseQueue[0].fireAt) return;
    detonateFuseGem(fuseQueue.shift().gem);
  }

  function detonateFuseGem(gem) {
    if (!gem || !gem.special) return;
    if (!board[gem.row] || board[gem.row][gem.col] !== gem) return;
    // A caged wired special waits for its own unlock instead.
    if (isPhaseLocked(gem.row, gem.col)) return;
    beginAnimation();
    var clearMap = {};
    markCell(clearMap, gem.row, gem.col);
    var hit = { cell: { row: gem.row, col: gem.col }, special: gem.special, type: gem.type };
    expandSpecialClears([hit], clearMap, 3);
    var clearCells = cellsFromMap(clearMap);
    var wasOverdrive = drive >= OVERDRIVE_THRESHOLD;
    var multiplier = wasOverdrive ? 2 : 1;
    var points = Math.floor(clearCells.length * 90 * multiplier);

    combo = Math.max(combo, 2);
    recordMatchProgress(clearCells, 2, [hit], null);
    score += points;
    flash = Math.min(1, flash + 0.2);
    energy = Math.min(1, energy + 0.16 + clearCells.length * 0.012);
    drive = Math.min(1, drive + 0.08 + clearCells.length * 0.012);
    if (!wasOverdrive && drive >= OVERDRIVE_THRESHOLD) triggerOverdrive();
    announceCompletedGoals();

    playWirePulse();
    burstMatches(clearCells, 2);
    addMatchFloaters(clearCells, 2, points, multiplier, 1, null);
    bumpShake(0.2);
    vibrate("special");

    clearCells.forEach(function (cell) {
      board[cell.row][cell.col] = null;
    });

    updateHud();
    runLater(TIMING.clear, function () {
      markAnimationProgress();
      collapseBoard(2);
      runLater(TIMING.drop, function () {
        markAnimationProgress();
        processMatches(3);
      });
    });
  }

  function fireArmedSpecial() {
    var arm = armedSpecial;
    armedSpecial = null;
    if (!arm || animating || levelState !== "playing" || isGameplayPaused()) return;
    var gem = board[arm.row] && board[arm.row][arm.col];
    if (!gem || gem.special !== arm.special) return;
    if (isBeatGateClosed(arm.row, arm.col)) {
      beatGateFlash = 1;
      playReject();
      vibrate("reject");
      return;
    }
    if (isPhaseLocked(arm.row, arm.col)) {
      flashPhaseLockAt(arm);
      playReject();
      vibrate("reject");
      return;
    }
    resetSwapHint();
    beginAnimation();
    selected = null;
    // Nova primer: the guided tap fired. Mark the lesson learned and
    // release the input gate.
    if (guidedMove && guidedMove.tap && sameCell(guidedMove.a, arm)) finishNovaPrimerGuide();

    // DESIGN REVIEW (mandate A5): tap-firing a special costs a move, same
    // bookkeeping as attemptSwap's committed path. Revisit if free-fire
    // reads better in playtests.
    if (gameMode === MODE_CAMPAIGN) {
      if (!debugUnlimitedMoves) movesLeft = Math.max(0, movesLeft - 1);
    }
    levelStats.movesMade += 1;

    // Synthetic hit through expandSpecialClears so the nova color sweep /
    // full line clear runs, then cascades resolve like a swap-triggered clear.
    var clearMap = {};
    markCell(clearMap, arm.row, arm.col);
    var hit = { cell: { row: arm.row, col: arm.col }, special: gem.special, type: gem.type };
    expandSpecialClears([hit], clearMap, 3);
    var clearCells = cellsFromMap(clearMap);
    var wasOverdrive = drive >= OVERDRIVE_THRESHOLD;
    var multiplier = wasOverdrive ? 2 : 1;
    var points = Math.floor(clearCells.length * 90 * multiplier);

    combo = Math.max(combo, 2);
    recordMatchProgress(clearCells, 2, [hit], null);
    score += points;
    flash = Math.min(1, flash + 0.2);
    energy = Math.min(1, energy + 0.16 + clearCells.length * 0.012);
    drive = Math.min(1, drive + 0.08 + clearCells.length * 0.012);
    var rushTriggeredOverdrive = refillRushPulse(clearCells, 2, [hit], wasOverdrive);
    recordDailyMissionProgress("clear", clearCells.length);
    recordDailyMissionProgress("special", 1);
    if (!wasOverdrive && drive >= OVERDRIVE_THRESHOLD && !rushTriggeredOverdrive) triggerOverdrive();
    announceCompletedGoals();

    burstMatches(clearCells, 2);
    addMatchFloaters(clearCells, 2, points, multiplier, 1, null);
    bumpShake(0.2);
    vibrate("special");

    clearCells.forEach(function (cell) {
      board[cell.row][cell.col] = null;
    });

    // Tick the gate only after the special has scored and cleared, so a nova
    // sitting in a closing gate cell isn't nulled before it fires.
    advanceBeatGates();
    updateHud();
    runLater(TIMING.clear, function () {
      markAnimationProgress();
      collapseBoard(2);
      runLater(TIMING.drop, function () {
        markAnimationProgress();
        processMatches(3);
      });
    });
  }

  function burstMatches(matches, chain) {
    var center = averageCellPosition(matches);
    matches.forEach(function (cell) {
      var gem = board[cell.row][cell.col];
      if (!gem) return;
      var type = TYPES[gem.type];
      var dx = gem.x - center.x;
      var dy = gem.y - center.y;
      var delay = Math.min(0.12, (Math.sqrt(dx * dx + dy * dy) / view.cell) * 0.028);
      var count = scaledEffectCount(26 + chain * 8, 10);
      for (var i = 0; i < count; i += 1) {
        var angle = Math.random() * Math.PI * 2;
        var ember = i % 3 === 2;
        var speed = ember
          ? 120 + Math.random() * 300 + chain * 36
          : view.cell * (8 + Math.random() * 11);
        var span = ember ? 0.6 + Math.random() * 0.5 : 0.55 + Math.random() * 0.35;
        particles.push({
          x: gem.x,
          y: gem.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (ember ? 60 + Math.random() * 120 : 0),
          life: span,
          ttl: span,
          size: 1.4 + Math.random() * 3.4,
          color: !ember && Math.random() < 0.3 ? "#ffffff" : type.color,
          line: !ember,
          ember: ember,
          delay: delay
        });
      }
      particles.push({
        x: gem.x,
        y: gem.y,
        vx: 0,
        vy: 0,
        life: 0.09,
        ttl: 0.09,
        size: view.cell * 0.15,
        color: "#ffffff",
        line: false,
        delay: delay
      });
      addImpactRays(gem.x, gem.y, type.color, chain, drive >= 0.72);
    });
  }

  function addImpactRays(x, y, color, chain, overdrive) {
    var count = scaledEffectCount(Math.min(18, 5 + chain * 2 + (overdrive ? 5 : 0)), 3);
    for (var i = 0; i < count; i += 1) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.18;
      rays.push({
        x: x,
        y: y,
        angle: angle,
        length: view.cell * (0.2 + Math.random() * 0.25),
        speed: view.cell * (4.8 + chain * 0.8 + Math.random() * 2.4),
        life: 0.18 + Math.random() * 0.12,
        ttl: 0.18 + Math.random() * 0.12,
        color: color,
        width: 1.5 + Math.random() * 2.4
      });
    }
    trimEffects();
  }

  function addSpecialCreationBurst(gem, special) {
    var type = TYPES[gem.type];
    var count = scaledEffectCount(special === "nova" ? 60 : 28, special === "nova" ? 16 : 10);
    for (var i = 0; i < count; i += 1) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.14;
      var speed = 180 + Math.random() * 280;
      particles.push({
        x: gem.x,
        y: gem.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.38 + Math.random() * 0.32,
        ttl: 0.38 + Math.random() * 0.32,
        size: 1.8 + Math.random() * 3.2,
        color: type.color,
        line: true
      });
    }
    addShockwave(
      gem.x,
      gem.y,
      type.color,
      view.cell * 0.18,
      view.cell * (special === "nova" ? 1.9 : 1.15),
      special === "nova" ? 0.48 : 0.34,
      special === "nova" ? 12 : 6
    );
    addImpactRays(gem.x, gem.y, type.color, special === "nova" ? 4 : 2, special === "nova");
    trimEffects();
  }

  function addSpecialBeam(special, row, col, color) {
    var cx = view.boardX + col * view.cell + view.cell / 2;
    var cy = view.boardY + row * view.cell + view.cell / 2;
    var beam = {
      special: special,
      x: cx,
      y: cy,
      row: row,
      col: col,
      color: color,
      life: special === "nova" ? 0.48 : 0.38,
      ttl: special === "nova" ? 0.48 : 0.38,
      width: view.cell * (special === "nova" ? 0.2 : 0.18)
    };
    beams.push(beam);
    addShockwave(cx, cy, color, view.cell * 0.15, view.cell * (special === "nova" ? 2.6 : 1.35), 0.36, special === "nova" ? 14 : 6);
  }

  function addNovaSweepVfx(origin, cells, color) {
    if (cells.length === 0) return;
    var ox = view.boardX + origin.col * view.cell + view.cell / 2;
    var oy = view.boardY + origin.row * view.cell + view.cell / 2;
    // Radiate outward: near targets fire first, the whole sweep spanning
    // ~2 beats of the track. Beam count rides the FX budget so low-end
    // devices draw a thinned but same-shape sweep.
    var sorted = cells.slice().sort(function (a, b) {
      var da = Math.abs(a.row - origin.row) + Math.abs(a.col - origin.col);
      var db = Math.abs(b.row - origin.row) + Math.abs(b.col - origin.col);
      return da - db;
    });
    var sweepSeconds = (60 / getActiveBpm()) * 2;
    var budget = Math.max(1, Math.min(effectLimit("beams"), scaledEffectCount(sorted.length, 6)));
    budget = Math.min(budget, sorted.length);
    var stride = sorted.length / budget;
    for (var i = 0; i < budget; i += 1) {
      var cell = sorted[Math.min(sorted.length - 1, Math.floor(i * stride))];
      beams.push({
        special: "sweep",
        x: ox,
        y: oy,
        tx: view.boardX + cell.col * view.cell + view.cell / 2,
        ty: view.boardY + cell.row * view.cell + view.cell / 2,
        row: cell.row,
        col: cell.col,
        color: color,
        delay: (i / budget) * sweepSeconds,
        life: 0.3,
        ttl: 0.3,
        width: view.cell * 0.14
      });
    }
    trimEffects();
  }

  function addSpecialDetonation(special, row, col, color, chain) {
    var cx = view.boardX + col * view.cell + view.cell / 2;
    var cy = view.boardY + row * view.cell + view.cell / 2;
    var nova = special === "nova";
    var count = nova ? scaledEffectCount(90, 24) : scaledEffectCount(48, 14);
    var spread = nova ? view.cell * 16 : view.cell * 11;
    for (var i = 0; i < count; i += 1) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.18;
      var speed = spread * (0.5 + Math.random() * 0.7) + chain * 24;
      var span = nova ? 0.7 + Math.random() * 0.4 : 0.38 + Math.random() * 0.28;
      var shard = nova && i % 5 === 0;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: span,
        ttl: span,
        size: shard ? 3.2 : 1.4 + Math.random() * 3.4,
        color: !shard && Math.random() < 0.3 ? "#ffffff" : color,
        line: !shard,
        vector: shard,
        sides: 5,
        rotation: angle,
        spin: shard ? -10 + Math.random() * 20 : 0
      });
    }
    addShockwave(cx, cy, "#ffffff", view.cell * 0.2, view.boardSize * 0.5, 0.6, 0, 0.09);
    addImpactRays(cx, cy, color, special === "nova" ? chain + 3 : chain + 1, special === "nova");
    trimEffects();
  }

  function scaledEffectCount(base, minimum) {
    return Math.max(minimum, Math.floor(base * Math.max(0.34, fxScale())));
  }

  function addSpecialComboVfx(comboData, label, clearCells) {
    var center = averageCellPosition(clearCells);
    var gemA = board[comboData.a.row] && board[comboData.a.row][comboData.a.col];
    var gemB = board[comboData.b.row] && board[comboData.b.row][comboData.b.col];
    var colorA = TYPES[gemA ? gemA.type : comboData.typeA].color;
    var colorB = TYPES[gemB ? gemB.type : comboData.typeB].color;
    var a = getBoardCellCenter(comboData.a);
    var b = getBoardCellCenter(comboData.b);

    var implodeCount = scaledEffectCount(36, 12);
    for (var imp = 0; imp < implodeCount; imp += 1) {
      var impAngle = (Math.PI * 2 * imp) / implodeCount + Math.random() * 0.2;
      particles.push({
        x: center.x + Math.cos(impAngle) * view.cell * 2.2,
        y: center.y + Math.sin(impAngle) * view.cell * 2.2,
        vx: -Math.cos(impAngle) * view.cell * 14,
        vy: -Math.sin(impAngle) * view.cell * 14,
        life: 0.18,
        ttl: 0.18,
        size: 1.6 + Math.random() * 2,
        color: imp % 2 === 0 ? colorA : colorB,
        line: true
      });
    }
    var sprayCount = scaledEffectCount(60, 20);
    for (var spray = 0; spray < sprayCount; spray += 1) {
      var sprayAngle = Math.random() * Math.PI * 2;
      var spraySpeed = view.cell * (10 + Math.random() * 10);
      var sprayLife = 0.34 + Math.random() * 0.3;
      particles.push({
        x: center.x,
        y: center.y,
        vx: Math.cos(sprayAngle) * spraySpeed,
        vy: Math.sin(sprayAngle) * spraySpeed,
        life: sprayLife,
        ttl: sprayLife,
        size: 1.4 + Math.random() * 2.6,
        color: "#ffffff",
        line: true
      });
    }
    trimEffects();

    addCallout(label.toUpperCase(), "#ffffff", 30);
    addShockwave(center.x, center.y, "#ffffff", view.cell * 0.24, view.boardSize * 0.58, 0.48, 17);
    addShockwave(a.x, a.y, colorA, view.cell * 0.18, view.cell * 2.2, 0.38, 12);
    addShockwave(b.x, b.y, colorB, view.cell * 0.18, view.cell * 2.2, 0.38, 12);
    addImpactRays(a.x, a.y, colorA, 8, true);
    addImpactRays(b.x, b.y, colorB, 8, true);

    if (comboData.specialA === "lineH" || comboData.specialB === "lineH") {
      addSpecialBeam("lineH", comboData.a.row, comboData.a.col, colorA);
      addSpecialBeam("lineH", comboData.b.row, comboData.b.col, colorB);
    }
    if (comboData.specialA === "lineV" || comboData.specialB === "lineV") {
      addSpecialBeam("lineV", comboData.a.row, comboData.a.col, colorA);
      addSpecialBeam("lineV", comboData.b.row, comboData.b.col, colorB);
    }
    if (comboData.specialA === "nova" || comboData.specialB === "nova") {
      addSpecialBeam("nova", comboData.a.row, comboData.a.col, colorA);
      addSpecialBeam("nova", comboData.b.row, comboData.b.col, colorB);
    }
  }

  function collapseBoard(chain) {
    // Closed beat gates and phase-locked cages are solid walls: they
    // split each column into segments. Gems compact within their segment
    // and only the top segment refills from the spawn edge; cells starved
    // below a wall stay empty until the gate reopens or the cage breaks.
    // With no walls every column is one fed segment: the original
    // behavior. A cage keeps its gem; a closed gate holds no piece.
    for (var col = 0; col < GRID; col += 1) {
      var segTop = 0;
      for (var boundary = 0; boundary <= GRID; boundary += 1) {
        var gateWall = boundary < GRID && isBeatGateClosed(boundary, col);
        var cageWall = boundary < GRID && isPhaseLocked(boundary, col);
        if (boundary < GRID && !gateWall && !cageWall) continue;
        collapseColumnSegment(col, segTop, boundary - 1, chain, segTop === 0);
        if (gateWall) board[boundary][col] = null;
        segTop = boundary + 1;
      }
    }
    setTargets();
  }

  function collapseColumnSegment(col, fromRow, toRow, chain, feed) {
    var stack = [];
    for (var row = toRow; row >= fromRow; row -= 1) {
      if (!isCellActive(row, col)) continue;
      var gem = board[row][col];
      if (gem) stack.push(gem);
    }

    for (var fillRow = toRow; fillRow >= fromRow; fillRow -= 1) {
      if (!isCellActive(fillRow, col)) {
        board[fillRow][col] = null;
        continue;
      }
      var next = stack.shift();
      if (!next && feed) {
        next = createGem(pickDropType(fillRow, col), fillRow, col, true);
        next.y -= chain * view.cell * 0.4;
      }
      if (!next) {
        board[fillRow][col] = null;
        continue;
      }
      board[fillRow][col] = next;
      next.row = fillRow;
      next.col = col;
      next.pop = Math.max(next.pop, 0.1);
      next.trail = Math.max(next.trail || 0, 0.32 + chain * 0.03);
    }
  }

  function updateHud() {
    boosterRow.classList.toggle("is-locked", gameMode === MODE_CAMPAIGN && !!currentLevel && currentLevel.id < 3 && getCompletedLevels() < 3);
    if (isPulseMode()) {
      var pulseBest = updatePulseBestScore();
      levelLabelEl.textContent = "Mode";
      levelEl.textContent = gameMode === MODE_DAILY ? "Daily" : "Rush";
      movesLabelEl.textContent = "Pulse";
      movesEl.textContent = Math.ceil(pulse * 100) + "%";
      scoreEl.textContent = String(score);
      bestEl.textContent = String(pulseBest);
      chainEl.textContent = String(combo);
      layersEl.textContent = String(audio.layers.length);
      levelTitleEl.textContent = gameMode === MODE_DAILY ? "Daily Pulse " + formatDailyId(dailyId) + " · " + getDailyTakeLabel() : "Pulse Rush";
      objectiveEl.textContent = gameMode === MODE_DAILY
        ? (isDailyRehearsal() ? "Rehearsal run. Best take is already on the record." : "Same daily seed. Bank release energy.")
        : "Match to refill pulse. Bank overflow for Release.";
      renderGoalRail(getPulseGoalRailItems());
      goalNowEl.textContent = pulse <= 0.32 ? "Now: refill" : isPulseReleaseReady() ? "Now: Release" : "Now: chains";
      goalLevelEl.textContent = "Run: " + formatRunTime(rushSeconds) + " + best";
      goalMacroEl.textContent = gameMode === MODE_DAILY ? "Daily: no boosts" : "Event: Cup points";
      if (goalHintEl) {
        goalHintEl.style.display = "";
        goalHintEl.textContent = getGoalHintText();
      }
      updateChallengeStrip();
      coachEl.textContent = getCoachText();
      dailyMissionEl.textContent = getDailyMissionHudText();
      progressEl.textContent = Math.ceil(pulse * 100) + "%";
      progressEl.removeAttribute("aria-label");
      starsEl.textContent = hasPulseNewBest() ? "NEW BEST" : "BEST " + pulseBest;
      prevLevelButton.disabled = true;
      nextLevelButton.disabled = true;
      nextLevelButton.classList.toggle("is-attention", false);
      hammerCountEl.textContent = gameMode === MODE_DAILY ? "OFF" : String(campaignSave.boosters.hammer || 0);
      shuffleCountEl.textContent = gameMode === MODE_DAILY ? "OFF" : String(campaignSave.boosters.shuffle || 0);
      if (chargeLabelEl) chargeLabelEl.textContent = "Release";
      chargeCountEl.textContent = Math.min(100, Math.floor((pulseBank / PULSE_RELEASE_THRESHOLD) * 100)) + "%";
      modeButton.textContent = "Campaign";
      modeButton.setAttribute("aria-pressed", "true");
      dailyButton.textContent = gameMode === MODE_DAILY ? formatDailyId(dailyId) : "Daily";
      dailyButton.setAttribute("aria-pressed", gameMode === MODE_DAILY ? "true" : "false");
      resetButton.textContent = "Restart";
      storeButton.textContent = "Store";
      shareButton.hidden = score <= 0;
      if (mapBuilt) updateCampaignMap();
      updateBoosterButton(hammerButton, "hammer");
      updateBoosterButton(shuffleButton, "shuffle");
      updatePulseReleaseButton();
      storeButton.classList.toggle("is-attention", false);
      if (storePanel.classList.contains("is-open")) renderStore();
      if (menuPanel.classList.contains("is-open")) updateMenuPanel();
      if (coachPanel.classList.contains("is-open")) positionCoachPanel();
      return;
    }

    if (score > bestScore) {
      bestScore = score;
      writeBestScore(bestScore);
    }
    levelLabelEl.textContent = "Level";
    levelEl.textContent = String(currentLevel.id);
    movesLabelEl.textContent = "Moves";
    movesEl.textContent = String(movesLeft);
    scoreEl.textContent = String(score);
    bestEl.textContent = String(bestScore);
    chainEl.textContent = String(combo);
    layersEl.textContent = String(audio.layers.length);
    levelTitleEl.textContent = getLevelDisplayTitle(currentLevel);
    objectiveEl.textContent = describeGoals(currentLevel.goals);
    renderGoalRail(getCampaignGoalRailItems());
    goalNowEl.textContent = getNowGoalText();
    goalLevelEl.textContent = getLevelGoalText();
    goalMacroEl.textContent = getMacroGoalText();
    if (goalHintEl) {
      // FTUE dedupe: on the first-session presets (1-10) the coach line
      // carries the instruction; the How chip would stack the same words.
      // Inline style because the phone media query re-displays the chip.
      var hideHowChip = currentLevel.id <= 10 && Boolean(getFirstSessionPreset(currentLevel.id));
      goalHintEl.style.display = hideHowChip ? "none" : "";
      if (!hideHowChip) goalHintEl.textContent = getGoalHintText();
    }
    updateChallengeStrip();
    coachEl.textContent = getCoachText();
    dailyMissionEl.textContent = getDailyMissionHudText();
    var overallProgress = getOverallProgress();
    var overallPercent = Math.floor(overallProgress * 100);
    var sectionWord = getSongSectionWord(overallProgress);
    progressEl.textContent = sectionWord + " " + overallPercent + "%";
    progressEl.setAttribute("aria-label", "Song section " + sectionWord + ", " + overallPercent + " percent");
    starsEl.textContent = renderStars(campaignSave.stars[currentLevel.id] || (levelState === "won" ? calculateStars() : 0));
    prevLevelButton.disabled = currentLevelIndex <= 0;
    nextLevelButton.disabled = currentLevelIndex + 1 >= campaignSave.unlocked || currentLevelIndex >= campaign.length - 1;
    nextLevelButton.classList.toggle("is-attention", false);
    modeButton.textContent = "Pulse Rush";
    modeButton.setAttribute("aria-pressed", "false");
    dailyButton.textContent = "Daily";
    dailyButton.setAttribute("aria-pressed", "false");
    resetButton.textContent = getCampaignResetLabel();
    storeButton.textContent = canAffordContinue() ? "Continue" : "Store";
    shareButton.hidden = score <= 0;
    if (mapBuilt) updateCampaignMap();
    hammerCountEl.textContent = String(campaignSave.boosters.hammer || 0);
    shuffleCountEl.textContent = String(campaignSave.boosters.shuffle || 0);
    if (chargeLabelEl) chargeLabelEl.textContent = "Charge";
    chargeCountEl.textContent = String(campaignSave.boosters.charge || 0);
    updateBoosterButton(hammerButton, "hammer");
    updateBoosterButton(shuffleButton, "shuffle");
    updateBoosterButton(chargeButton, "charge");
    storeButton.classList.toggle("is-attention", canAffordContinue());
    if (storePanel.classList.contains("is-open")) renderStore();
    if (menuPanel.classList.contains("is-open")) updateMenuPanel();
    if (coachPanel.classList.contains("is-open")) positionCoachPanel();
  }

  function getCoachText() {
    if (isPulseMode()) {
      if (levelState === "lost") return "Pulse empty. Restart and chase a cleaner rhythm.";
      if (activeBooster === "hammer") return "Choose one piece. It costs pulse.";
      if (isPulseReleaseReady()) return "Release is armed. Fire it at a dense board.";
      if (pulse <= 0.22) return "Critical. Make any match now.";
      if (pulse <= 0.38) return "Low pulse. Chains buy breathing room.";
      if (pulseBank > 0.5) return "Overflow is banking. Keep the bar full.";
      if (drive >= OVERDRIVE_THRESHOLD) return "Overdrive is live. Stack clears fast.";
      if (combo >= 3) return "The chain is feeding the timer.";
      if (gameMode === MODE_DAILY) return "Daily seed " + formatDailyId(dailyId) + ". Same board for everyone.";
      return "Keep the strings charged as long as possible.";
    }
    if (guidedMove && guidedMove.tap) return "Tap the nova to arm it, then tap again to fire the sweep.";
    // Guided swaps carry their own board label; the inline line stands
    // down so one instruction reads at a time (L1 first move, L5 primer).
    if (guidedMove) return "";
    // FTUE dedupe: while a coach toast is up on a preset level, the inline
    // line stands down so only one instruction reads at a time.
    if (activeCoachTip && currentLevel.id <= 10 && getFirstSessionPreset(currentLevel.id)) return "";
    if (levelState === "won") return "Track clear. Tap OK after the score card.";
    if (levelState === "lost") return canAffordContinue() ? "Continue adds 5 moves, or retry the level." : "Retry the level with a fresh board.";
    if (activeBooster === "hammer") return "Choose one piece to fracture.";
    if (movesLeft <= 5) return "Last moves. Specials matter now.";
    return currentLevel.coach;
  }

  function getCampaignResetLabel() {
    if (levelState === "lost") return "Retry";
    if (levelState === "won") return "Replay";
    return "New Board";
  }

  function updateBoosterButton(button, name) {
    var count = campaignSave.boosters[name] || 0;
    button.disabled = levelState !== "playing" || count <= 0 || animating || !canUseBooster(name);
    button.classList.toggle("is-active", activeBooster === name);
    button.classList.remove("is-release-ready");
  }

  function updatePulseReleaseButton() {
    var ready = isPulseReleaseReady();
    chargeButton.disabled = levelState !== "playing" || animating || !ready;
    chargeButton.classList.toggle("is-active", ready);
    chargeButton.classList.toggle("is-release-ready", ready);
  }

  function describeGoals(goals) {
    return goals.slice().sort(compareGoalDisplayPriority).map(function (goal) {
      var value = Math.min(goal.target, getGoalValue(goal));
      if (goal.kind === "score") return "Score " + value + "/" + goal.target;
      if (goal.kind === "collect") return "Clear " + TYPES[goal.type].name + " " + value + "/" + goal.target;
      if (goal.kind === "flux") return "Break Shields " + value + "/" + goal.target;
      if (goal.kind === "signal") return "Catch Signals " + value + "/" + goal.target;
      if (goal.kind === "spread") return "Clear Creep " + value + "/" + goal.target;
      if (goal.kind === "specials") return "Make Specials " + value + "/" + goal.target;
      if (goal.kind === "fusion") return "Swap Specials " + value + "/" + goal.target;
      if (goal.kind === "chain") return "Build Cascade " + value + "/" + goal.target;
      if (goal.kind === "overdrive") return "Hit Overdrive " + value + "/" + goal.target;
      return "";
    }).filter(Boolean).join("  |  ");
  }

  function renderGoalRail(items) {
    if (!goalRailEl) return;
    goalRailEl.textContent = "";
    (items || []).forEach(function (item) {
      var card = document.createElement("div");
      var visual = document.createElement("span");
      var copy = document.createElement("span");
      var label = document.createElement("strong");
      var count = document.createElement("em");

      card.className = "goal-chip goal-chip--" + item.kind + (item.complete ? " is-complete" : "");
      if (item.flash >= 0) {
        card.classList.add("is-flash");
        card.style.setProperty("--flash-delay", "-" + Math.round(item.flash) + "ms");
      }
      card.style.setProperty("--guide-color", item.color || "#46f4ff");
      card.style.setProperty("--guide-fill", item.fill || "rgba(70,244,255,0.08)");
      card.style.setProperty("--goal-fill", String(Math.max(0, Math.min(1, item.progress || 0))));
      card.setAttribute("aria-label", item.aria || item.label + " " + item.count);

      visual.className = "goal-chip-visual goal-guide-visual goal-guide-visual--" + item.kind;
      visual.setAttribute("aria-hidden", "true");
      renderGoalGuideVisual(visual, item.visual || item);

      copy.className = "goal-chip-copy";
      label.textContent = item.label;
      count.textContent = item.count;
      copy.appendChild(label);
      copy.appendChild(count);

      card.appendChild(visual);
      card.appendChild(copy);
      goalRailEl.appendChild(card);
    });
  }

  function getCampaignGoalRailItems() {
    if (!currentLevel || !currentLevel.goals) return [];
    return currentLevel.goals.slice().sort(compareGoalDisplayPriority).map(function (goal) {
      var guide = getGoalGuide(goal);
      var value = Math.min(goal.target, getGoalValue(goal));
      return {
        kind: goal.kind,
        label: getGoalChipLabel(goal),
        count: formatGoalChipCount(goal, value),
        progress: goal.target > 0 ? value / goal.target : 0,
        complete: value >= goal.target,
        flash: getGoalChipFlashElapsed(getGoalAnnouncementKey(goal)),
        color: guide ? guide.color : "#46f4ff",
        fill: guide ? guide.fill : "rgba(70,244,255,0.08)",
        visual: guide || { kind: goal.kind },
        aria: getGoalShortName(goal) + " " + value + " of " + goal.target
      };
    });
  }

  function getPulseGoalRailItems() {
    var rivalTarget = getChallengeTargetScore();
    var releaseProgress = Math.min(1, pulseBank / PULSE_RELEASE_THRESHOLD);
    return [
      {
        kind: "pulse",
        label: "Pulse",
        count: Math.ceil(pulse * 100) + "%",
        progress: pulse,
        complete: pulse > 0.7,
        color: "#46f4ff",
        fill: "rgba(70,244,255,0.09)",
        aria: "Pulse " + Math.ceil(pulse * 100) + " percent"
      },
      {
        kind: "score",
        label: "Score",
        count: formatCompactNumber(score) + "/" + formatCompactNumber(rivalTarget),
        progress: rivalTarget > 0 ? score / rivalTarget : 0,
        complete: score >= rivalTarget,
        color: "#ffd166",
        fill: "rgba(255,209,102,0.09)",
        aria: "Score " + score + " of " + rivalTarget
      },
      {
        kind: "specials",
        label: "Release",
        count: Math.floor(releaseProgress * 100) + "%",
        progress: releaseProgress,
        complete: isPulseReleaseReady(),
        color: "#ff4fd8",
        fill: "rgba(255,79,216,0.08)",
        visual: {
          kind: "fusion",
          color: "#ff4fd8",
          fill: "rgba(255,79,216,0.08)"
        },
        aria: "Release " + Math.floor(releaseProgress * 100) + " percent"
      }
    ];
  }

  function getGoalChipLabel(goal) {
    if (goal.kind === "score") return "Score";
    if (goal.kind === "collect") return TYPES[goal.type].name;
    if (goal.kind === "flux") return "Shield";
    if (goal.kind === "signal") return "Signal";
    if (goal.kind === "spread") return "Creep";
    if (goal.kind === "specials") return "Special";
    if (goal.kind === "fusion") return "Swap";
    if (goal.kind === "chain") return "Chain";
    if (goal.kind === "overdrive") return "Drive";
    return "Goal";
  }

  function formatGoalChipCount(goal, value) {
    if (goal.kind === "score") return formatCompactNumber(value) + "/" + formatCompactNumber(goal.target);
    if (goal.kind === "overdrive" && goal.target === 1) return value >= 1 ? "Live" : "0/1";
    return value + "/" + goal.target;
  }

  function formatCompactNumber(value) {
    var amount = Math.max(0, Math.floor(Number(value) || 0));
    if (amount >= 1000000) return stripTrailingZero((amount / 1000000).toFixed(1)) + "M";
    if (amount >= 1000) return stripTrailingZero((amount / 1000).toFixed(1)) + "K";
    return String(amount);
  }

  function stripTrailingZero(value) {
    return String(value).replace(/\.0$/, "");
  }

  function getGoalShortName(goal) {
    if (goal.kind === "score") return "Score";
    if (goal.kind === "collect") return "Clear " + TYPES[goal.type].name;
    if (goal.kind === "flux") return "Break Shields";
    if (goal.kind === "signal") return "Catch Signals";
    if (goal.kind === "spread") return "Clear Creep";
    if (goal.kind === "specials") return "Make Specials";
    if (goal.kind === "fusion") return "Swap 2 Specials";
    if (goal.kind === "chain") return "Build Cascade";
    if (goal.kind === "overdrive") return "Hit Overdrive";
    return "Goal";
  }

  function getNowGoalText() {
    if (levelState === "won") return currentLevelIndex + 1 < campaignSave.unlocked ? "Now: tap OK" : "Now: replay";
    if (levelState === "lost") return canAffordContinue() ? "Now: continue" : "Now: retry";
    if (movesLeft <= Math.max(3, Math.ceil(currentLevel.moves * 0.14))) return "Now: specials";
    var firstOpen = getPrimaryOpenGoal();
    if (!firstOpen) return "Now: cascade";
    if (firstOpen.kind === "flux") return "Now: break";
    if (firstOpen.kind === "signal") return "Now: feed nodes";
    if (firstOpen.kind === "spread") return "Now: clear creep";
    if (firstOpen.kind === "collect") return "Now: clear " + TYPES[firstOpen.type].name;
    if (firstOpen.kind === "specials") return "Now: make 4+";
    if (firstOpen.kind === "fusion") return "Now: swap 2";
    if (firstOpen.kind === "chain") return "Now: cascade";
    if (firstOpen.kind === "overdrive") return "Now: overdrive";
    return "Now: score";
  }

  function getPrimaryOpenGoal() {
    var openGoals = currentLevel.goals.filter(function (goal) {
      return getGoalValue(goal) < goal.target;
    });
    return openGoals.find(function (goal) {
      return goal.kind !== "score";
    }) || openGoals[0] || null;
  }

  function getLevelGoalText() {
    var openGoals = currentLevel.goals.filter(function (goal) {
      return getGoalValue(goal) < goal.target;
    });
    if (levelState === "won") return currentLevelIndex + 1 < campaignSave.unlocked && currentLevelIndex + 1 < campaign.length ? "OK: L" + (currentLevel.id + 1) : "Level: clear";
    if (levelState === "lost") return "Retry Level";
    var focusGoals = openGoals.filter(function (goal) {
      return goal.kind !== "score";
    });
    var names = (focusGoals.length > 0 ? focusGoals : openGoals).map(getGoalShortName);
    if (names.length === 1) return names[0];
    if (names.length === 2) return names[0] + "+" + names[1];
    return "Goals: " + names.length;
  }

  function getMacroGoalText() {
    if (levelState === "lost") return canAffordContinue() ? "Continue: " + CONTINUE_COST + "C" : "Retry: free";
    if (levelState === "won") return currentLevelIndex + 1 < campaignSave.unlocked && currentLevelIndex + 1 < campaign.length ? "Share: proof" : "Map: replay";
    var levelReward = getLevelRewardPreviewCompact(currentLevel);
    if (levelReward) return levelReward;
    var totalStars = getTotalStars();
    var nextReward = getNextStarReward(totalStars);
    if (nextReward) return "Stars " + totalStars + "/" + nextReward.threshold;
    return "Clear " + getCompletedLevels() + "/" + campaign.length;
  }

  function getGoalHintText() {
    if (isPulseMode()) {
      if (levelState === "lost") return "How: restart and chase a longer pulse.";
      if (isPulseReleaseReady()) return "How: fire Release on a dense board.";
      return "How: matches refill pulse before it empties.";
    }
    if (!currentLevel) return "How: match three pieces.";
    if (levelState === "won") return "How: tap OK after your score.";
    if (levelState === "lost") return canAffordContinue() ? "How: Continue adds 5 moves. Retry is free." : "How: tap Retry for a fresh board.";
    var firstOpen = getPrimaryOpenGoal();
    if (!firstOpen || firstOpen.kind === "score") return "How: every clear scores.";
    if (firstOpen.kind === "collect") return "How: match " + getPieceGuidePhrase(firstOpen.type) + ".";
    if (firstOpen.kind === "flux") return "How: match the pieces on Shield walls to smash them.";
    if (firstOpen.kind === "signal") return "How: match beside the antenna nodes.";
    if (firstOpen.kind === "spread") return "How: match the infected cells to clear the creep.";
    if (firstOpen.kind === "specials") return "How: match 4+ for beams or novas.";
    if (firstOpen.kind === "fusion") return "How: swap two specials together.";
    if (firstOpen.kind === "chain") return "How: one swap triggers cascades.";
    if (firstOpen.kind === "overdrive") return "How: keep clearing to ignite frame.";
    return "How: match three pieces.";
  }

  function updateChallengeStrip() {
    if (!challengeRivalEl || !challengeHookEl || !challengeCodeEl) return;
    var challenge = buildChallengeState();
    challengeRivalEl.textContent = formatNumber(getChallengeTargetScore());
    challengeHookEl.textContent = challenge.hook;
    challengeCodeEl.textContent = challenge.code;
  }

  function compareGoalDisplayPriority(a, b) {
    return getGoalDisplayPriority(a) - getGoalDisplayPriority(b);
  }

  function getGoalDisplayPriority(goal) {
    if (!goal) return 99;
    if (goal.kind === "fusion") return 1;
    if (goal.kind === "collect") return 2;
    if (goal.kind === "flux") return 3;
    if (goal.kind === "signal") return 3;
    if (goal.kind === "spread") return 3;
    if (goal.kind === "specials") return 4;
    if (goal.kind === "chain") return 5;
    if (goal.kind === "overdrive") return 6;
    if (goal.kind === "score") return 9;
    return 8;
  }

  function getGoalGuide(goal) {
    if (!goal) return null;
    if (goal.kind === "score") {
      return {
        kind: "score",
        title: "Score " + formatNumber(goal.target),
        detail: "Every clear adds points.",
        color: "#ffd166",
        fill: "rgba(255,209,102,0.09)"
      };
    }
    if (goal.kind === "collect") {
      var type = TYPES[goal.type] || TYPES[0];
      return {
        kind: "collect",
        pieceType: goal.type,
        title: "Clear " + goal.target + " " + type.name,
        detail: "Match " + getPieceGuidePhrase(goal.type) + ". Every " + type.name + " cleared counts.",
        color: type.color,
        fill: type.fill
      };
    }
    if (goal.kind === "flux") {
      return {
        kind: "flux",
        title: "Break " + goal.target + " Shields",
        detail: "Match the pieces on Shield walls to smash them.",
        color: "#ff4fd8",
        fill: "rgba(255,79,216,0.08)"
      };
    }
    if (goal.kind === "signal") {
      return {
        kind: "signal",
        title: "Catch " + goal.target + " Signals",
        detail: "Match beside the antenna nodes. Every packet rides the beat.",
        color: "#46f4ff",
        fill: "rgba(70,244,255,0.08)"
      };
    }
    if (goal.kind === "spread") {
      return {
        kind: "spread",
        title: "Clear " + goal.target + " Creep",
        detail: "Match the infected cells. Clear beside the creep to keep it from spreading.",
        color: SPREAD_COLOR,
        fill: "rgba(200,255,46,0.08)"
      };
    }
    if (goal.kind === "specials") {
      return {
        kind: "specials",
        title: "Make " + goal.target + " Specials",
        detail: "Match 4+ pieces to arm beams or novas.",
        color: "#46f4ff",
        fill: "rgba(70,244,255,0.08)"
      };
    }
    if (goal.kind === "fusion") {
      return {
        kind: "fusion",
        title: goal.target === 1 ? "Swap 2 Specials" : "Swap Specials x" + goal.target,
        detail: currentLevel && currentLevel.id === 8 ? "Swap the two center specials together." : "Make two specials. Swap them together.",
        color: "#7a6bff",
        fill: "rgba(122,107,255,0.1)"
      };
    }
    if (goal.kind === "chain") {
      return {
        kind: "chain",
        title: "Build Chain " + goal.target,
        detail: "One swap must trigger multiple clears.",
        color: "#8cff6b",
        fill: "rgba(140,255,107,0.08)"
      };
    }
    if (goal.kind === "overdrive") {
      return {
        kind: "overdrive",
        title: "Hit Overdrive",
        detail: "Keep clearing until the frame meter ignites.",
        color: "#ffd166",
        fill: "rgba(255,209,102,0.09)"
      };
    }
    return null;
  }

  function getPieceGuidePhrase(typeIndex) {
    var type = TYPES[typeIndex] || TYPES[0];
    return (PIECE_COLOR_NAMES[typeIndex] || "neon").toLowerCase() + " " + formatPieceShape(type.shape) + "s";
  }

  function buildPieceGlyphSvg(shape) {
    // Inline SVG straight off PIECE_GLYPH_SHAPES: the same silhouette source the
    // board gems draw (drawShape / drawAtom), so a goal chip and its piece can
    // never drift. Board radius = 1 maps to R units inside a 48-unit box; the
    // tall rhombus (1.18) and wide atom ellipse (1.06) still clear the edges.
    var spec = PIECE_GLYPH_SHAPES[shape] || PIECE_GLYPH_SHAPES.circle;
    var R = 18;
    function u(n) { return Math.round(n * R * 100) / 100; }
    var body;
    if (spec.kind === "rings") {
      body =
        '<circle class="piece-glyph-fill" cx="0" cy="0" r="' + u(spec.radii[0]) + '"/>' +
        '<circle cx="0" cy="0" r="' + u(spec.radii[1]) + '"/>';
    } else if (spec.kind === "atom") {
      var rx = u(spec.rx);
      var ry = u(spec.ry);
      body =
        '<ellipse cx="0" cy="0" rx="' + rx + '" ry="' + ry + '"/>' +
        '<ellipse cx="0" cy="0" rx="' + rx + '" ry="' + ry + '" transform="rotate(90)"/>' +
        '<circle class="piece-glyph-dot" cx="0" cy="0" r="' + u(spec.nucleus) + '"/>';
    } else {
      var pts = spec.kind === "path"
        ? spec.points
        : polygonPoints(spec.sides, spec.radius, spec.offset);
      var d = "";
      for (var i = 0; i < pts.length; i += 1) {
        d += (i === 0 ? "M" : "L") + u(pts[i][0]) + " " + u(pts[i][1]);
      }
      d += "Z";
      body = '<path class="piece-glyph-fill" d="' + d + '"/>';
      if (spec.dot) body += '<circle class="piece-glyph-dot" cx="0" cy="0" r="' + u(spec.dot) + '"/>';
    }
    return '<svg class="piece-glyph-svg" viewBox="-24 -24 48 48" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  function renderGoalGuideVisual(visual, guide) {
    if (guide.kind === "collect") {
      var type = TYPES[guide.pieceType] || TYPES[0];
      var glyph = document.createElement("span");
      glyph.className = "piece-glyph piece-glyph--svg";
      glyph.innerHTML = buildPieceGlyphSvg(type.shape);
      visual.appendChild(glyph);
      return;
    }
    if (guide.kind === "fusion") {
      appendSpecialIcon(visual, "line");
      appendGuideMark(visual, "+");
      appendSpecialIcon(visual, "nova");
      appendGuideMark(visual, "=");
      appendSpecialIcon(visual, "burst");
      return;
    }
    if (guide.kind === "specials") {
      appendSpecialIcon(visual, "line");
      appendSpecialIcon(visual, "nova");
      return;
    }
    if (guide.kind === "chain") {
      appendChainPip(visual);
      appendChainPip(visual);
      appendChainPip(visual);
      return;
    }
    var mark = document.createElement("span");
    mark.className = "goal-guide-mark";
    visual.appendChild(mark);
  }

  function appendSpecialIcon(parent, type) {
    var icon = document.createElement("span");
    icon.className = "goal-special goal-special--" + type;
    parent.appendChild(icon);
  }

  function appendGuideMark(parent, text) {
    var mark = document.createElement("span");
    mark.className = "goal-guide-symbol";
    mark.textContent = text;
    parent.appendChild(mark);
  }

  function appendChainPip(parent) {
    var pip = document.createElement("span");
    pip.className = "goal-chain-pip";
    parent.appendChild(pip);
  }

  function formatPieceShape(shape) {
    if (shape === "hex") return "hex";
    if (shape === "atom") return "atom";
    return shape;
  }

  function closeSplashPanel() {
    if (!splashPanel) return;
    splashPanel.classList.remove("is-open");
    splashPanel.setAttribute("aria-hidden", "true");
  }

  function updateSplashStartLabel() {
    if (!splashStartButton) return;
    if (campaignSave.unlocked > 1 || getCompletedLevels() > 0) {
      splashStartButton.textContent = "Continue: Level " + (currentLevelIndex + 1);
    } else {
      splashStartButton.textContent = "Play";
    }
    updateSplashDailyCard();
  }

  function updateSplashDailyCard() {
    // Daily goes front-and-center on the splash: today's track, take count,
    // and streak, one tap to play (Jung round 3, section 8).
    if (!splashDailyButton) return;
    var today = getDailyId();
    var entry = getDailyTakeEntry(today);
    var takeText = entry.count >= DAILY_TAKE_LIMIT
      ? "On the record " + formatNumber(entry.best)
      : "Take " + (entry.count + 1) + "/" + DAILY_TAKE_LIMIT;
    campaignSave.streak = normalizeStreakState(campaignSave.streak);
    var streakText = getStreakDisplayState() === "paused"
      ? "Streak paused"
      : "Streak " + (campaignSave.streak.current || 0) + "d";
    if (splashDailyTitleEl) splashDailyTitleEl.textContent = getDailyTrackTitle(today);
    if (splashDailyMetaEl) splashDailyMetaEl.textContent = takeText + " · " + streakText;
  }

  function startDailyFromSplash(event) {
    closeMenu();
    if (!isSplashOpen()) return;
    closeSplashPanel();
    startAudio(event);
    startDaily();
  }

  function isSplashOpen() {
    return Boolean(splashPanel && splashPanel.classList.contains("is-open"));
  }

  function willStartSectorReveal() {
    // First level of a sector (id 1, 16, 31, ...) whose reveal has not yet fired.
    // Read before maybeStartSectorReveal runs so a transition can tell whether the
    // reveal hold will supply the intro (leave bed at 1) or a plain fade-in is needed.
    if (gameMode !== MODE_CAMPAIGN || !currentLevel) return false;
    return (((currentLevel.id - 1) % 15) + 1) === 1 && !campaignSave.reveals[currentLevel.episodeTheme];
  }

  function maybeStartSectorReveal(force) {
    if (gameMode !== MODE_CAMPAIGN || !currentLevel) return;
    if (!force && !willStartSectorReveal()) return;
    // First entry into a sector: hold the groove for two bars so the new frequency gets its reveal.
    audio.revealUntilStep = audio.step + AUDIO_TUNING.revealSteps;
    campaignSave.reveals[currentLevel.episodeTheme] = true;
    writeCampaignSave();
    var revealTheme = getLevelEpisodeTheme(currentLevel);
    parkActiveCallout();
    addFloater(centerBoardX(), calloutAnchorY(), "TRACK " + pad2(currentLevel.episode) + ": " + revealTheme.name.toUpperCase(), "#46f4ff", 0.92, 24);
    runLater(900, function spawnFrequencyReveal() {
      // Hold until the sector line is fully gone so nothing stacks over the frequency reveal.
      for (var i = 0; i < floaters.length; i += 1) {
        if ((floaters[i].text || "").indexOf("TRACK ") === 0) {
          runLater(150, spawnFrequencyReveal);
          return;
        }
      }
      parkActiveCallout();
      addFloater(centerBoardX(), calloutAnchorY(), "NEW FREQUENCY: " + (getMusicPalette().label || "").toUpperCase(), "#ff4fd8", 1.2, 18);
    });
    if (audio.ctx && audio.master) {
      // Upsweep into the hold, shaped like playUnlockChirp but climbing an extra step.
      var revealStart = audio.ctx.currentTime + 0.01;
      playTone(getHarmonyToneFreq(0, 0, 1), revealStart, 0.12, "sine", 0.045, 0, 2200);
      playTone(getHarmonyToneFreq(0, 2, 1), revealStart + 0.055, 0.1, "sine", 0.04, 0, 2500);
      playTone(getHarmonyToneFreq(0, 3, 1), revealStart + 0.11, 0.1, "triangle", 0.036, 0, 2800);
      playTone(getHarmonyToneFreq(0, 5, 1), revealStart + 0.165, 0.16, "triangle", 0.032, 0, 3300);
    }
  }

  function maybeQueueFinaleIntro() {
    if (gameMode !== MODE_CAMPAIGN || !isFinaleLevel(currentLevel)) return;
    // One FINALE floater after the standard level intro. Defers to the
    // sector-entry reveal and live cascades so nothing interrupts either,
    // and parks the anchor per the single-anchor callout contract.
    runLater(1100, function spawnFinaleIntro() {
      if (isSectorRevealActive() || animating) {
        runLater(150, spawnFinaleIntro);
        return;
      }
      parkActiveCallout();
      addFloater(centerBoardX(), calloutAnchorY(), "FINALE", "#ffd166", 1.1, 22);
    });
  }

  function startSplashRun(event) {
    closeMenu();
    if (!isSplashOpen()) return;
    runLater(200, function () {
      forEachGem(function (gem) {
        gem.y = view.boardY - (GRID - gem.row + 1) * view.cell;
        gem.birth = 1;
        gem.trail = 0.45;
        gem.scale = 0.78;
      });
    });
    closeSplashPanel();
    commitCurrentLevelAttempt();
    claimRunStartRewards();
    startAudio(event);
    maybeStartSectorReveal();
    maybeQueueFinaleIntro();
    if (gameMode === MODE_CAMPAIGN && currentLevel && currentLevel.id === 1 && !coachSeen.swap) {
      // Guided-move eligibility is decided here, at schedule time. Dismissing the
      // "swap" coach card inside the 900ms window marks coachSeen.swap, so re-checking
      // it at fire time would permanently cancel the guided first move.
      runLater(900, function () {
        if (gameMode !== MODE_CAMPAIGN || !currentLevel || currentLevel.id !== 1 || levelState !== "playing" || guidedMove) return;
        guidedMove = findGuidedFirstMove();
      });
    }
    showNextCoachTip();
  }

  function buildChallengeState() {
    return {
      rival: "Beat " + formatNumber(getChallengeTargetScore()),
      hook: getChallengeHook(),
      code: getChallengeCode()
    };
  }

  function getChallengeTargetScore() {
    if (gameMode === MODE_DAILY) {
      return 16000 + hashString("daily-rival:" + dailyId) % 12000;
    }
    if (gameMode === MODE_RUSH) {
      var weeklyFloor = 14000 + hashString("rush-rival:" + getWeeklyEventId()) % 10000;
      return Math.max(weeklyFloor, rushBestScore + 2500);
    }
    if (!currentLevel || !currentLevel.starTargets) return 0;
    if (levelState === "won") return currentLevel.starTargets[2];
    return currentLevel.starTargets[1] || currentLevel.starTargets[0];
  }

  function getChallengeHook() {
    if (isPulseMode()) {
      if (levelState === "lost") return score > getChallengeTargetScore() ? "Post score" : "Restart run";
      if (isPulseReleaseReady()) return "Fire Release";
      if (pulse <= 0.28) return "Pulse save";
      if (gameMode === MODE_DAILY) return "No boosters";
      if (pulseBank > 0.5) return "Bank Release";
      return "Stay alive";
    }

    if (levelState === "won") return movesLeft > 0 ? "Encore +" + movesLeft : "Clear proof";
    if (levelState === "lost") return canAffordContinue() ? "Continue +5" : "Retry level";

    var firstOpen = getPrimaryOpenGoal();
    if (!firstOpen) return "Finish cascade";
    if (firstOpen.kind === "flux") return "Break shields";
    if (firstOpen.kind === "spread") return "Clear creep";
    if (firstOpen.kind === "signal") return "Feed the nodes";
    if (firstOpen.kind === "collect") return "Clear " + TYPES[firstOpen.type].name;
    if (firstOpen.kind === "specials") return "Make specials";
    if (firstOpen.kind === "fusion") return "Swap 2 specials";
    if (firstOpen.kind === "chain") return "Stack cascades";
    if (firstOpen.kind === "overdrive") return "Hit Overdrive";
    if (movesLeft >= Math.ceil(currentLevel.moves * 0.42)) return "Save moves";
    return getCurrentEpisodeTheme().hook;
  }

  function getChallengeCode() {
    if (gameMode === MODE_DAILY) return GAME_CODE_PREFIX + "-D" + dailyId.slice(4) + "-" + shortHash("daily:" + dailyId);
    if (gameMode === MODE_RUSH) return GAME_CODE_PREFIX + "-R" + getWeeklyEventId().slice(4) + "-" + shortHash("rush:" + getWeeklyEventId());
    if (!currentLevel) return GAME_CODE_PREFIX + "-000";
    return GAME_CODE_PREFIX + "-L" + pad3(currentLevel.id) + "-A" + (currentLevelAttempt || 1) + "-" + shortHash(getCampaignSeedLabel(currentLevel, currentLevelAttempt || 1));
  }

  function shortHash(text) {
    return hashString(text).toString(36).toUpperCase().slice(0, 4).padStart(4, "0");
  }

  function pad3(value) {
    var number = Math.max(0, Math.floor(Number(value) || 0));
    if (number < 10) return "00" + number;
    if (number < 100) return "0" + number;
    return String(number);
  }

  function getOverallProgress() {
    if (!currentLevel || currentLevel.goals.length === 0) return 0;
    var sum = currentLevel.goals.reduce(function (total, goal) {
      return total + Math.min(1, getGoalValue(goal) / goal.target);
    }, 0);
    return Math.min(1, sum / currentLevel.goals.length);
  }

  // Song-section words paired one-to-one with AUDIO_TUNING.arrangeFloors entries
  // (matched top-down), so the HUD readout steps exactly when the arrangement
  // floor steps: 90%+ CLIMAX, 75% LIFT, 50% BUILD, 25% VERSE, 0% INTRO.
  var SONG_SECTION_WORDS = ["CLIMAX", "LIFT", "BUILD", "VERSE", "INTRO"];

  function getSongSectionWord(progress) {
    if (levelState === "won") return movesLeft > 0 ? "ENCORE" : "CLEAR";
    for (var i = 0; i < AUDIO_TUNING.arrangeFloors.length; i += 1) {
      if (progress >= AUDIO_TUNING.arrangeFloors[i].progress) return SONG_SECTION_WORDS[i] || "INTRO";
    }
    return "INTRO";
  }

  var MECHANIC_TIPS = ["swap", "special", "flux", "chain", "overdrive", "movePressure", "fusion", "gate"];

  function queueCoachTip(id) {
    if (coachSeen[id] || (activeCoachTip && activeCoachTip.id === id)) return;
    if (coachQueue.indexOf(id) !== -1) {
      // Already queued (e.g. level restart): re-kick the display loop so the
      // toast still surfaces after runSerial killed the pending retry.
      if (!activeCoachTip) showNextCoachTip();
      return;
    }
    if ((id === "event" || id === "streak") && getCompletedLevels() < 2) return;
    var tip = createCoachTip(id);
    if (!tip) return;
    if (MECHANIC_TIPS.indexOf(id) !== -1) {
      var insertAt = 0;
      while (insertAt < coachQueue.length && MECHANIC_TIPS.indexOf(coachQueue[insertAt]) !== -1) insertAt += 1;
      coachQueue.splice(insertAt, 0, id);
    } else {
      coachQueue.push(id);
    }
    if (!activeCoachTip) showNextCoachTip();
  }

  function createCoachTip(id) {
    // One-line toast copy. Keep every string on one line and <= 60 chars.
    var tips = {
      swap: "Ion pieces are cyan circles. Match 3+ to collect goals.",
      special: "Match four in a line to make a beam piece.",
      flux: "Match the pieces on Shield walls to crack and break them.",
      chain: "One swap can cascade. Chains thicken the music.",
      overdrive: "Fill the string frame. High drive doubles score.",
      movePressure: "Clear goals early. Saved moves become finale blasts.",
      fusion: "Swap two specials together for a fusion clear.",
      gate: "Gate levels mix shields and specials. Finish clean.",
      booster: "Hammer smashes. Shuffle remixes. Charge fills specials.",
      map: "Replay unlocked sectors on the map to chase stars.",
      rush: "Pulse drains every second. Matches refill it.",
      daily: "Daily Pulse: the frame drains. Match to refill. No boosts.",
      streak: "Play daily to build your streak and earn boosters.",
      event: "Clears and Pulse runs score weekly cup points.",
      share: "Share cards pack score, stars, and seed to challenge."
    };
    var body = tips[id];
    if (!body) return null;
    return {
      id: id,
      body: body
    };
  }

  function showNextCoachTip() {
    if (activeCoachTip || coachQueue.length === 0) return;
    if (isGameplayPaused()) {
      // Overlays (map, store, settings, share, splash) defer the toast
      // instead of dropping it; it surfaces once play resumes.
      runLater(1500, showNextCoachTip);
      return;
    }
    if (guidedMove) {
      runLater(1500, showNextCoachTip);
      return;
    }
    if (isSplashOpen()) {
      // Never toast behind the splash: auto-expire would mark the tip seen
      // before the player could ever read it.
      runLater(1500, showNextCoachTip);
      return;
    }
    if (sharePanel.classList.contains("is-open") || levelState !== "playing" || animating || isBoardSettling()) {
      runLater(1500, showNextCoachTip);
      return;
    }
    if (MECHANIC_TIPS.indexOf(coachQueue[0]) === -1 && performance.now() - coachLastShownAt < 45000) {
      runLater(1500, showNextCoachTip);
      return;
    }
    if (currentLevel && currentLevel.id > 3 && coachLateTipCount >= 2) return;
    activeCoachTip = createCoachTip(coachQueue.shift());
    if (!activeCoachTip) {
      showNextCoachTip();
      return;
    }
    coachLastShownAt = performance.now();
    if (currentLevel && currentLevel.id > 3) coachLateTipCount += 1;
    coachBodyEl.textContent = activeCoachTip.body;
    positionCoachPanel();
    coachPanel.classList.add("is-open");
    coachPanel.setAttribute("aria-hidden", "false");
    updateHud();
    var shownTip = activeCoachTip;
    // Toasts auto-expire after 6s of REAL time; window.setTimeout on
    // purpose, so debug setSpeed cannot race a toast away (runLater
    // divides by debugTimeScale). The identity guard replaces the serial
    // guard: a parked-and-reshown tip is a new object with its own timer.
    window.setTimeout(function () {
      if (activeCoachTip !== shownTip) return;
      dismissActiveCoachTip();
      showNextCoachTip();
    }, 6000);
  }

  function isBoardSettling() {
    // The intro fall-in glides gems outside the animating flag: a coach
    // toast must wait until every gem sits on its target.
    var settling = false;
    forEachGem(function (gem) {
      if (Math.abs(gem.y - gem.ty) > 2 || gem.birth > 0.08) settling = true;
    });
    return settling;
  }

  function parkActiveCoachTip() {
    // Level transitions must not eat a mechanic toast mid-read: under 6s
    // of display time it goes back to the queue head, unseen, and
    // resurfaces once the new board settles. Anything older, or any
    // non-mechanic tip, dismisses as before.
    if (!activeCoachTip) return;
    if (MECHANIC_TIPS.indexOf(activeCoachTip.id) !== -1 && performance.now() - coachLastShownAt < 6000) {
      coachQueue.unshift(activeCoachTip.id);
      activeCoachTip = null;
      coachPanel.classList.remove("is-open");
      coachPanel.setAttribute("aria-hidden", "true");
      return;
    }
    dismissActiveCoachTip();
  }

  function dismissActiveCoachTip() {
    if (!activeCoachTip) return;
    coachSeen[activeCoachTip.id] = true;
    writeCoachSeen();
    activeCoachTip = null;
    coachPanel.classList.remove("is-open");
    coachPanel.setAttribute("aria-hidden", "true");
    updateHud();
  }

  function positionCoachPanel() {
    coachPanel.style.top = "auto";
    coachPanel.style.bottom = Math.round(window.innerHeight - missionPanel.getBoundingClientRect().top + 12) + "px";
  }

  function readCoachSeen() {
    try {
      var raw = window.localStorage.getItem("neon-lattice-coach-seen");
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      return {};
    }
  }

  function writeCoachSeen() {
    try {
      window.localStorage.setItem("neon-lattice-coach-seen", JSON.stringify(coachSeen));
    } catch (error) {
      return;
    }
  }

  function openMap() {
    cancelPointerCapture();
    closeMenu();
    closeShareCard();
    closeStore();
    closeSettings();
    closeSetlist();
    buildCampaignMap();
    updateCampaignMap();
    queueCoachTip("map");
    mapPanel.classList.add("is-open");
    mapPanel.setAttribute("aria-hidden", "false");
    window.setTimeout(function () {
      var current = mapGridEl.querySelector(".map-node.is-current");
      if (current) current.scrollIntoView({ block: "center", inline: "nearest" });
    }, 40);
  }

  function closeMap() {
    if (!mapPanel) return;
    mapPanel.classList.remove("is-open");
    mapPanel.setAttribute("aria-hidden", "true");
  }

  function openSetlist() {
    if (!setlistPanel) return;
    cancelPointerCapture();
    closeMenu();
    closeShareCard();
    closeMap();
    closeStore();
    closeSettings();
    renderSetlist();
    setlistPanel.classList.add("is-open");
    setlistPanel.setAttribute("aria-hidden", "false");
  }

  function closeSetlist() {
    if (!setlistPanel) return;
    setlistPanel.classList.remove("is-open");
    setlistPanel.setAttribute("aria-hidden", "true");
  }

  function isSetlistOpen() {
    return Boolean(setlistPanel && setlistPanel.classList.contains("is-open"));
  }

  // The Greenroom: the Backstage band screen. A 4x4 grid of all 16 Hums that all
  // dance to the currently selected palette on the shared beat clock; awake ones
  // move, undiscovered ones show as dim closed-eye silhouettes. Pure cosmetic:
  // opening it pauses gameplay timers (isGameplayPaused) like every other overlay.
  function openGreenroom() {
    if (!greenroomPanel) return;
    cancelPointerCapture();
    closeMenu();
    closeShareCard();
    closeMap();
    closeStore();
    closeSettings();
    closeSetlist();
    greenroomSparks.length = 0;
    updateGreenroomLedger();
    greenroomPanel.classList.add("is-open");
    greenroomPanel.setAttribute("aria-hidden", "false");
  }

  function closeGreenroom() {
    if (!greenroomPanel) return;
    greenroomPanel.classList.remove("is-open");
    greenroomPanel.setAttribute("aria-hidden", "true");
    greenroomSparks.length = 0;
  }

  function isGreenroomOpen() {
    return Boolean(greenroomPanel && greenroomPanel.classList.contains("is-open"));
  }

  function openGreenroomFromMenu() {
    openGreenroom();
  }

  // Set-completion ledger: how many of the 16 Hums have woken (the Finale-drop
  // state). Reads the migrated campaignSave.hums; missing entries count as asleep.
  function greenroomAwakeCount() {
    var count = 0;
    var hums = campaignSave.hums || {};
    for (var i = 0; i < HUM_IDS.length; i += 1) {
      if (hums[HUM_IDS[i]] && hums[HUM_IDS[i]].awake) count += 1;
    }
    return count;
  }

  function updateGreenroomLedger() {
    if (!greenroomLedgerEl) return;
    greenroomLedgerEl.textContent = greenroomAwakeCount() + "/" + HUM_IDS.length + " awake · each woken Hum adds a voice to its track and gives +1 move there · clear a Track's Finale to wake its Hum";
  }

  function getSetlistStreakLine() {
    // Discography copy only: the streak reads like a release run, never a loss.
    campaignSave.streak = normalizeStreakState(campaignSave.streak);
    var current = campaignSave.streak.current || 0;
    var best = campaignSave.streak.best || 0;
    var state = getStreakDisplayState();
    if (state === "paused") return "Run paused. " + best + " day" + (best === 1 ? "" : "s") + " stays on the record. Today starts the next one.";
    if (state === "covered") return "Backstage Pass is holding your spot. Play today and the run keeps rolling.";
    if (current <= 0) return "Day one of the discography starts with today's take.";
    return current + " day" + (current === 1 ? "" : "s") + " on the record. Longest run " + best + ".";
  }

  function renderSetlist() {
    campaignSave.daily = normalizeDailyState(campaignSave.daily);
    campaignSave.streak = normalizeStreakState(campaignSave.streak);
    var today = getDailyId();
    var entry = getDailyTakeEntry(today);
    var takesLeft = Math.max(0, DAILY_TAKE_LIMIT - entry.count);
    if (setlistTitleEl) setlistTitleEl.textContent = getDailyTrackTitle(today);
    if (setlistSummaryEl) {
      setlistSummaryEl.textContent = takesLeft > 0
        ? takesLeft + " scored take" + (takesLeft === 1 ? "" : "s") + " left today."
        : "Today is on the record. Rehearse any time.";
    }
    if (setlistStreakEl) {
      var state = getStreakDisplayState();
      setlistStreakEl.textContent = state === "paused" ? "Paused" : (campaignSave.streak.current || 0) + "d";
    }
    if (setlistPassesEl) setlistPassesEl.textContent = campaignSave.streak.passes + "/" + BACKSTAGE_PASS_MAX;
    if (setlistBestEl) setlistBestEl.textContent = formatNumber(entry.best);
    if (setlistStreakLineEl) setlistStreakLineEl.textContent = getSetlistStreakLine();
    if (setlistPlayButton) {
      setlistPlayButton.textContent = takesLeft > 0
        ? "Play Take " + (entry.count + 1) + "/" + DAILY_TAKE_LIMIT
        : "Rehearse Today's Track";
    }

    if (!setlistMonthEl || !setlistGridEl) return;
    var now = new Date();
    setlistMonthEl.textContent = MONTH_NAMES[now.getMonth()] + " " + now.getFullYear();
    setlistGridEl.textContent = "";
    var firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    var leadBlanks = (firstOfMonth.getDay() + 6) % 7;
    var i;
    for (i = 0; i < 7; i += 1) {
      var head = document.createElement("span");
      head.className = "setlist-day setlist-day--head";
      head.textContent = WEEKDAY_NAMES[(i + 1) % 7].slice(0, 2);
      setlistGridEl.appendChild(head);
    }
    for (i = 0; i < leadBlanks; i += 1) {
      var blank = document.createElement("span");
      blank.className = "setlist-day is-empty";
      setlistGridEl.appendChild(blank);
    }
    for (var day = 1; day <= daysInMonth; day += 1) {
      var id = getDailyId(new Date(now.getFullYear(), now.getMonth(), day));
      var cell = document.createElement("span");
      var num = document.createElement("span");
      var mark = document.createElement("strong");
      cell.className = "setlist-day";
      num.textContent = String(day);
      var dayEntry = campaignSave.daily.takes[id];
      if (campaignSave.streak.patchedDates[id]) {
        cell.classList.add("is-patched");
        mark.textContent = "Pass";
      } else if (dayEntry && dayEntry.count > 0) {
        cell.classList.add("is-played");
        mark.textContent = formatNumber(dayEntry.best);
      } else {
        mark.textContent = day > now.getDate() ? "" : "·";
      }
      if (id === today) cell.classList.add("is-today");
      cell.appendChild(num);
      cell.appendChild(mark);
      setlistGridEl.appendChild(cell);
    }
  }

  function openSetlistFromMenu() {
    openSetlist();
  }

  function startDailyFromSetlist() {
    closeSetlist();
    closeSplashPanel();
    startDaily();
  }

  function openStore() {
    cancelPointerCapture();
    closeMenu();
    closeShareCard();
    closeMap();
    closeSettings();
    closeSetlist();
    renderStore();
    storePanel.classList.add("is-open");
    storePanel.setAttribute("aria-hidden", "false");
  }

  function closeStore() {
    if (!storePanel) return;
    storePanel.classList.remove("is-open");
    storePanel.setAttribute("aria-hidden", "true");
    if (storeStatusEl) storeStatusEl.textContent = "";
  }

  function openMenu() {
    cancelPointerCapture();
    closeShareCard();
    closeMap();
    closeStore();
    closeSettings();
    closeSetlist();
    updateMenuPanel();
    menuPanel.classList.add("is-open");
    menuPanel.setAttribute("aria-hidden", "false");
  }

  function closeMenu() {
    if (!menuPanel) return;
    menuPanel.classList.remove("is-open");
    menuPanel.setAttribute("aria-hidden", "true");
  }

  function updateMenuPanel() {
    if (!menuPanel) return;
    var modeLabel = isPulseMode() ? (gameMode === MODE_DAILY ? "Daily Pulse" : "Pulse Rush") : "Level " + currentLevel.id;
    menuSummaryEl.textContent = modeLabel + " / " + getMenuStateLine();
    menuResumeButton.textContent = isSplashOpen() ? "Start" : "Resume";
    menuAudioButton.textContent = audio.started ? "Audio On" : "Audio";
    menuRushButton.textContent = isPulseMode() && gameMode === MODE_RUSH ? "Campaign" : "Rush";
    menuDailyButton.textContent = "Daily";
    if (menuSetlistButton) menuSetlistButton.textContent = "Setlist";
    menuRestartButton.textContent = isPulseMode() ? "Restart" : getCampaignResetLabel();
    menuStoreButton.textContent = canAffordContinue() ? "Continue" : "Store";
    menuShareButton.disabled = score <= 0;
    menuShareButton.textContent = score <= 0 ? "Share (play first)" : "Share";
    if (menuRivalEl && menuHookEl && menuCodeEl) {
      var challenge = buildChallengeState();
      menuRivalEl.textContent = challenge.rival;
      menuHookEl.textContent = challenge.hook;
      menuCodeEl.textContent = challenge.code;
    }
    if (menuDailyMissionEl) menuDailyMissionEl.textContent = getDailyMissionHudText();
  }

  function getMenuStateLine() {
    if (levelState === "won") return "clear ready";
    if (levelState === "lost") return "retry ready";
    if (isPulseMode()) return Math.ceil(pulse * 100) + "% pulse";
    var firstOpen = getPrimaryOpenGoal();
    if (!firstOpen) return movesLeft + " moves";
    return getGoalChipLabel(firstOpen) + " " + formatGoalChipCount(firstOpen, Math.min(firstOpen.target, getGoalValue(firstOpen))) + " / " + movesLeft + " moves";
  }

  function resumeFromMenu(event) {
    if (isSplashOpen()) {
      startSplashRun(event);
      return;
    }
    closeMenu();
  }

  function startAudioFromMenu(event) {
    startAudio(event);
    updateMenuPanel();
  }

  function openMapFromMenu() {
    openMap();
  }

  function openStoreFromMenu() {
    openStore();
  }

  function openShareFromMenu() {
    if (score <= 0) return;
    openShareCard(buildCurrentSharePayload());
  }

  function startRushFromMenu() {
    closeMenu();
    closeSplashPanel();
    // The menu button reads "Campaign" only in Rush mode; everywhere else
    // (campaign AND Daily Pulse) it reads "Rush", so the action must match.
    if (gameMode === MODE_RUSH) {
      startLevel(currentLevelIndex);
      return;
    }
    startRush();
  }

  function startDailyFromMenu() {
    closeMenu();
    closeSplashPanel();
    startDaily();
  }

  function restartFromMenu() {
    closeMenu();
    closeSplashPanel();
    newBoard();
  }

  function openSettingsFromMenu() {
    openSettings();
  }

  function renderStore() {
    campaignSave.wallet = normalizeWallet(campaignSave.wallet);
    campaignSave.purchases = normalizePurchases(campaignSave.purchases);
    creditCountEl.textContent = formatNumber(campaignSave.wallet.credits);
    storeSummaryEl.textContent = getStoreSummaryText();
    storeOffersEl.textContent = "";
    renderStoreRecoveryOffer();

    STORE_ITEMS.forEach(function (item) {
      var offer = document.createElement("article");
      var copy = document.createElement("div");
      var title = document.createElement("strong");
      var subtitle = document.createElement("span");
      var meta = document.createElement("em");
      var button = document.createElement("button");
      var disabledReason = getStoreDisabledReason(item);

      offer.className = "store-offer";
      copy.className = "store-offer-copy";
      title.textContent = item.title;
      subtitle.textContent = item.subtitle;
      meta.textContent = getStoreOfferMeta(item);
      button.type = "button";
      button.textContent = getStoreButtonText(item);
      button.disabled = Boolean(disabledReason);
      button.addEventListener("click", function () {
        buyStoreItem(item.id);
      });

      if (disabledReason) offer.classList.add("is-disabled");
      copy.appendChild(title);
      copy.appendChild(subtitle);
      copy.appendChild(meta);
      offer.appendChild(copy);
      offer.appendChild(button);
      storeOffersEl.appendChild(offer);
    });
  }

  function renderStoreRecoveryOffer() {
    if (levelState !== "lost") return;
    var offer = document.createElement("article");
    var copy = document.createElement("div");
    var title = document.createElement("strong");
    var subtitle = document.createElement("span");
    var meta = document.createElement("em");
    var button = document.createElement("button");

    offer.className = "store-offer store-offer--recovery";
    copy.className = "store-offer-copy";

    if (gameMode === MODE_CAMPAIGN) {
      title.textContent = "Retry Level";
      subtitle.textContent = "Restart this level with a fresh board.";
      meta.textContent = canAffordContinue() ? "Free retry, or buy Continue below." : "Free recovery. No credits needed.";
      button.textContent = "Retry";
    } else {
      title.textContent = "Restart Run";
      subtitle.textContent = gameMode === MODE_DAILY ? "Replay today's Pulse seed." : "Start a fresh Pulse Rush.";
      meta.textContent = "Free recovery. No credits needed.";
      button.textContent = "Restart";
    }

    button.type = "button";
    button.addEventListener("click", function () {
      newBoard();
    });

    copy.appendChild(title);
    copy.appendChild(subtitle);
    copy.appendChild(meta);
    offer.appendChild(copy);
    offer.appendChild(button);
    storeOffersEl.appendChild(offer);
  }

  function getStoreOfferMeta(item) {
    if (item.continueMoves && !canUseContinueOffer()) return "Appears after a failed campaign level";
    var prefix = item.tag ? item.tag + ". " : "";
    if (item.mockPrice) return prefix + "Mock IAP SKU.";
    return prefix + "Spends credits.";
  }

  function getStoreButtonText(item) {
    if (item.singleClaim && campaignSave.purchases[item.id]) return "Claimed";
    if (item.mockPrice) return "Mock " + item.mockPrice;
    return item.creditCost + " Credits";
  }

  function getStoreDisabledReason(item) {
    if (item.singleClaim && campaignSave.purchases[item.id]) return "Already claimed";
    if (item.continueMoves && !canUseContinueOffer()) return "Continue locked";
    if (item.creditCost && campaignSave.wallet.credits < item.creditCost) return "Need credits";
    return "";
  }

  function getStoreSummaryText() {
    if (canAffordContinue()) return "Continue is available for this failed level.";
    if (canUseContinueOffer()) return "Retry is free. Earn more credits from clears.";
    if (isPulseMode()) return "Pulse modes earn Release. Store boosters stay campaign-focused.";
    var firstOpen = getPrimaryOpenGoal();
    if (firstOpen && firstOpen.kind === "flux") return "Hammer helps break stubborn Shield walls.";
    if (firstOpen && firstOpen.kind === "chain") return "Shuffle can reset a board with no cascade setup.";
    if (firstOpen && firstOpen.kind === "overdrive") return "Charge can force overdrive for this goal.";
    if (firstOpen && firstOpen.kind === "specials") return "Hammer and Shuffle help set up special pieces.";
    return "Mock economy. No real payments.";
  }

  function canUseContinueOffer() {
    return gameMode === MODE_CAMPAIGN && levelState === "lost";
  }

  function canAffordContinue() {
    campaignSave.wallet = normalizeWallet(campaignSave.wallet);
    return canUseContinueOffer() && campaignSave.wallet.credits >= CONTINUE_COST;
  }

  function buyStoreItem(id) {
    var item = STORE_ITEMS.find(function (candidate) {
      return candidate.id === id;
    });
    if (!item) return;

    campaignSave.wallet = normalizeWallet(campaignSave.wallet);
    campaignSave.purchases = normalizePurchases(campaignSave.purchases);

    if (item.singleClaim && campaignSave.purchases[item.id]) return;

    if (item.continueMoves) {
      buyContinue(item);
      return;
    }

    if (item.creditCost && campaignSave.wallet.credits < item.creditCost) {
      storeStatusEl.textContent = "Not enough credits.";
      return;
    }

    if (item.creditCost) campaignSave.wallet.credits -= item.creditCost;
    if (item.credits) campaignSave.wallet.credits += item.credits;
    if (item.rewards) grantRewardBundle(item.rewards);
    campaignSave.purchases[item.id] = (campaignSave.purchases[item.id] || 0) + 1;
    writeCampaignSave();
    storeStatusEl.textContent = item.mockPrice ? "Mock purchase granted." : "Offer claimed.";
    showStoreReward(item);
    updateHud();
    closeStore();
  }

  function buyContinue(item) {
    if (!canUseContinueOffer()) {
      storeStatusEl.textContent = "Continue appears after a failed campaign level.";
      renderStore();
      return;
    }
    if (campaignSave.wallet.credits < item.creditCost) {
      storeStatusEl.textContent = "Not enough credits.";
      return;
    }
    campaignSave.wallet.credits -= item.creditCost;
    campaignSave.purchases[item.id] = (campaignSave.purchases[item.id] || 0) + 1;
    levelState = "playing";
    movesLeft = Math.max(movesLeft, 0) + item.continueMoves;
    activeBooster = null;
    selected = null;
    armedSpecial = null;
    writeCampaignSave();
    closeStore();
    addCallout("CONTINUE +" + item.continueMoves + " MOVES", "#ffd166", 24);
    addShockwave(centerBoardX(), centerBoardY(), "#ffd166", view.cell * 0.2, view.cell * 1.4, 0.32, 10);
    playBoosterHit("charge");
    updateHud();
  }

  function showStoreReward(item) {
    var bonus = item.rewards ? " +" + describeRewardBundle(item.rewards) : item.credits ? " +" + item.credits + " CREDITS" : "";
    addCallout(item.title.toUpperCase() + bonus, "#ffd166", 18);
    playBoosterHit("charge");
  }

  function buildCampaignMap() {
    if (mapBuilt) return;
    mapGridEl.textContent = "";
    var episodes = Math.ceil(campaign.length / 15);
    for (var episode = 1; episode <= episodes; episode += 1) {
      var theme = getEpisodeTheme(episode);
      var section = document.createElement("section");
      var title = document.createElement("div");
      var label = document.createElement("span");
      var levels = document.createElement("div");
      section.className = "map-sector";
      title.className = "map-sector-title";
      title.dataset.episode = String(episode);
      // Tracklist card: title, liner line (episode tagline), status tag,
      // and a lock-condition line filled in by updateCampaignMap.
      var liner = document.createElement("em");
      liner.className = "map-sector-liner";
      liner.textContent = theme.tag;
      label.className = "map-sector-tag";
      var condition = document.createElement("span");
      condition.className = "map-sector-condition";
      condition.hidden = true;
      // Sleeping Hum in the card corner: the half-drawn outline recording as the
      // track's levels clear (Zeigarnik pull), painted by updateTracklistCards.
      var humCanvas = document.createElement("canvas");
      humCanvas.className = "map-sector-hum";
      humCanvas.setAttribute("aria-hidden", "true");
      title.appendChild(document.createTextNode("TRACK " + pad2(episode) + " - " + theme.name));
      title.appendChild(liner);
      title.appendChild(label);
      title.appendChild(condition);
      title.appendChild(humCanvas);
      levels.className = "map-sector-levels";

      for (var slot = 1; slot <= 15; slot += 1) {
        var levelNumber = (episode - 1) * 15 + slot;
        if (levelNumber > campaign.length) break;
        levels.appendChild(createMapNode(levelNumber));
      }

      section.appendChild(title);
      section.appendChild(levels);
      mapGridEl.appendChild(section);
    }
    mapBuilt = true;
  }

  function createMapNode(levelNumber) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "map-node";
    button.dataset.level = String(levelNumber);
    button.textContent = String(levelNumber);
    var level = campaign[levelNumber - 1];
    // Finale positions ((n-1)%10 = 4 or 9) never collide with the HARD/
    // SUPER HARD badge slots (7/8), so one badge line is always enough.
    var badgeText = level && level.badge ? level.badge : isFinaleLevel(level) ? "FINALE" : "";
    if (badgeText) {
      var badgeEl = document.createElement("span");
      badgeEl.textContent = badgeText;
      badgeEl.style.display = "block";
      badgeEl.style.fontSize = "0.42em";
      badgeEl.style.letterSpacing = "0.08em";
      badgeEl.style.color = "#ffd166";
      button.appendChild(badgeEl);
    }
    button.addEventListener("click", function () {
      var target = Number(button.dataset.level);
      if (target > campaignSave.unlocked) return;
      startLevel(target - 1);
    });
    return button;
  }

  function updateCampaignMap() {
    if (!mapBuilt) return;
    var claimed = claimStarRewards(false);
    if (claimed.length > 0) writeCampaignSave();
    var totalStars = getTotalStars();
    var totalPossibleStars = campaign.length * 3;
    var nextReward = getNextStarReward(totalStars);
    var levelReward = getLevelRewardPreview(currentLevel);
    var theme = getCurrentEpisodeTheme();
    mapTitleEl.textContent = "Tracklist";
    mapSummaryEl.textContent = theme.name + ". " + theme.tag + ". Track " + pad2(currentLevel.episode) + " of " + Math.ceil(campaign.length / 15) + ".";
    updateTracklistCards();
    mapUnlockedEl.textContent = Math.min(campaignSave.unlocked, campaign.length) + "/" + campaign.length;
    mapStarsEl.textContent = totalStars + "/" + totalPossibleStars;
    mapCurrentEl.textContent = String(currentLevel.id);
    mapRewardEl.textContent = levelReward ? "L" + currentLevel.id + " +" + levelReward : nextReward ? nextReward.threshold + " stars " + describeRewardBundle(nextReward.rewards) : "Complete";
    mapMissionEl.textContent = getDailyMissionMapText();
    mapStreakEl.textContent = getStreakMapText();
    mapEventEl.textContent = getWeeklyEventMapText();

    var nodes = mapGridEl.querySelectorAll(".map-node");
    nodes.forEach(function (node) {
      var levelNumber = Number(node.dataset.level);
      var stars = campaignSave.stars[levelNumber] || 0;
      var locked = levelNumber > campaignSave.unlocked;
      node.disabled = locked;
      node.dataset.stars = stars > 0 ? "★★★".slice(0, stars) : "";
      node.classList.toggle("is-locked", locked);
      node.classList.toggle("is-complete", stars > 0);
      node.classList.toggle("is-current", levelNumber === currentLevel.id && gameMode === MODE_CAMPAIGN);
      node.setAttribute("aria-label", createMapNodeLabel(levelNumber, stars, locked));
    });
  }

  function updateTracklistCards() {
    // Album framing per sector card: Now Playing / Unreleased / star tally.
    // Display only; unlock logic stays in campaignSave.unlocked.
    var titles = mapGridEl.querySelectorAll(".map-sector-title");
    titles.forEach(function (titleEl) {
      var episode = Number(titleEl.dataset.episode);
      var tagEl = titleEl.querySelector(".map-sector-tag");
      var conditionEl = titleEl.querySelector(".map-sector-condition");
      if (!episode || !tagEl || !conditionEl) return;
      var locked = (episode - 1) * 15 + 1 > campaignSave.unlocked;
      var playing = gameMode === MODE_CAMPAIGN && currentLevel && currentLevel.episode === episode;
      var tag = playing ? "Now Playing" : locked ? "Unreleased" : getSectorStarTotal(episode) + "/45";
      tagEl.textContent = tag;
      tagEl.classList.toggle("is-unreleased", !playing && locked);
      conditionEl.hidden = playing || !locked;
      conditionEl.textContent = !playing && locked ? "Clear the Track " + pad2(episode - 1) + " Finale" : "";
      var humCanvas = titleEl.querySelector(".map-sector-hum");
      if (humCanvas) drawTracklistHum(humCanvas, episode, locked);
    });
  }

  // Repaint every track card's corner Hum. Called when the map updates and again
  // once the async creature specs finish loading.
  function redrawTracklistHums() {
    if (!mapBuilt || !mapGridEl) return;
    var titles = mapGridEl.querySelectorAll(".map-sector-title");
    titles.forEach(function (titleEl) {
      var episode = Number(titleEl.dataset.episode);
      var humCanvas = titleEl.querySelector(".map-sector-hum");
      if (!episode || !humCanvas) return;
      var locked = (episode - 1) * 15 + 1 > campaignSave.unlocked;
      drawTracklistHum(humCanvas, episode, locked);
    });
  }

  // Paint one track's Hum on its own card canvas. Sleeping tracks show the
  // half-drawn recording outline; woken Finales show the full creature. drawHum
  // strokes through the shared module ctx, so we point it at the card canvas for
  // the duration of the call, then restore it (synchronous, off the rAF loop).
  function drawTracklistHum(canvasEl, episode, locked) {
    if (!canvasEl || !canvasEl.getContext) return;
    var dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    var cssSize = 30;
    var pxSize = Math.round(cssSize * dpr);
    if (canvasEl.width !== pxSize) { canvasEl.width = pxSize; canvasEl.height = pxSize; }
    var hctx = canvasEl.getContext("2d");
    hctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    hctx.clearRect(0, 0, cssSize, cssSize);
    var humId = getHumIdForEpisode(episode);
    var spec = findHumSpec(humId);
    if (!spec) return; // specs not loaded yet or contract failure: blank corner
    var state = (campaignSave.hums && campaignSave.hums[humId]) || { segments: 0, awake: false };
    if (locked && state.segments <= 0) return; // undiscovered track: leave blank
    var size = cssSize * 0.34;
    var t = typeof lastTime === "number" ? lastTime : 0;
    var saved = ctx;
    ctx = hctx;
    try {
      if (state.awake) {
        drawHum(hctx, spec, cssSize / 2, cssSize / 2, size, t, { still: true });
      } else {
        drawHum(hctx, spec, cssSize / 2, cssSize / 2, size, t, { sleeping: true, drawProgress: state.segments / HUM_SEGMENTS });
      }
    } finally {
      ctx = saved;
    }
  }

  function getSectorStarTotal(episode) {
    var total = 0;
    for (var slot = 1; slot <= 15; slot += 1) {
      var levelNumber = (episode - 1) * 15 + slot;
      total += Math.max(0, Math.min(3, Number(campaignSave.stars[levelNumber]) || 0));
    }
    return total;
  }

  function createMapNodeLabel(levelNumber, stars, locked) {
    var level = campaign[levelNumber - 1];
    var theme = getLevelEpisodeTheme(level);
    var name = isFinaleLevel(level) ? theme.name + " Finale" : theme.name;
    if (locked) return name + " level " + levelNumber + " locked";
    if (stars > 0) return name + " level " + levelNumber + ", " + stars + " stars";
    return name + " level " + levelNumber + ", unlocked";
  }

  function getTotalStars() {
    return Object.keys(campaignSave.stars).reduce(function (total, id) {
      return total + Math.max(0, Math.min(3, Number(campaignSave.stars[id]) || 0));
    }, 0);
  }

  function getCompletedLevels() {
    return Object.keys(campaignSave.stars).filter(function (id) {
      return (campaignSave.stars[id] || 0) > 0;
    }).length;
  }

  function scheduleShareCard(payload, delay) {
    shareCardPending = true;
    runLater(delay, function () {
      openShareCard(payload);
    });
  }

  function buildCurrentSharePayload() {
    if (isPulseMode()) return buildPulseSharePayload();
    var stars = levelState === "won" ? calculateStars() : (campaignSave.stars[currentLevel.id] || 0);
    return buildCampaignSharePayload(Math.max(0, movesLeft), stars, levelState === "won", false);
  }

  // Waveform artifact: one model, three surfaces (unicode strip, PNG proof
  // hero, result-card body). Hard cap 24 glyphs: bars merge in repeated 2:1
  // passes until bars + trail fit; encore glyphs trail the take, one per
  // banked move, capped at 8 so a big bank never crowds out the take's own
  // bars (checklist waveform lock, amended).
  var WAVEFORM_GLYPH_CAP = 24;
  var WAVEFORM_BLOCKS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  var WAVEFORM_EVENT_GLYPHS = { flatline: "✕", special: "✦", release: "◯", encore: "♪" };
  var WAVEFORM_EVENT_PRIORITY = ["flatline", "special", "release"];

  function buildWaveformModel(encoreMoves) {
    var barCount = Math.max(1, levelStats.barIntensity.length, getWaveformBarIndex() + 1);
    var bars = [];
    for (var i = 0; i < barCount; i += 1) {
      bars.push({ value: levelStats.barIntensity[i] || 0, event: null });
    }
    levelStats.barEvents.forEach(function (event) {
      var bar = bars[Math.min(event.bar, bars.length - 1)];
      if (!bar.event || WAVEFORM_EVENT_PRIORITY.indexOf(event.type) < WAVEFORM_EVENT_PRIORITY.indexOf(bar.event)) {
        bar.event = event.type;
      }
    });
    var trail = Math.max(0, Math.min(Math.floor(encoreMoves || 0), 8));
    while (bars.length > 1 && bars.length + trail > WAVEFORM_GLYPH_CAP) {
      var merged = [];
      for (var j = 0; j < bars.length; j += 2) {
        var a = bars[j];
        var b = bars[j + 1] || { value: 0, event: null };
        var keep = !b.event || (a.event && WAVEFORM_EVENT_PRIORITY.indexOf(a.event) <= WAVEFORM_EVENT_PRIORITY.indexOf(b.event)) ? a.event : b.event;
        merged.push({ value: Math.max(a.value, b.value), event: keep });
      }
      bars = merged;
    }
    for (var k = 0; k < trail; k += 1) bars.push({ value: 0, event: "encore" });
    return bars;
  }

  function renderWaveformStrip(model) {
    var max = 1;
    model.forEach(function (bar) {
      max = Math.max(max, bar.value);
    });
    return model
      .map(function (bar) {
        if (bar.event) return WAVEFORM_EVENT_GLYPHS[bar.event] || "·";
        if (bar.value <= 0) return "·";
        return WAVEFORM_BLOCKS[Math.min(WAVEFORM_BLOCKS.length - 1, Math.floor((bar.value / max) * WAVEFORM_BLOCKS.length))];
      })
      .join("");
  }

  function buildWaveformHookLine() {
    // Feel-locks 83/99: rival target, post hook, and code stay in every
    // payload. This line plus the code line satisfy them.
    return "Rival " + formatNumber(getChallengeTargetScore()) + ". Every move you see, you hear. Beat it.";
  }

  function buildCampaignSharePayload(savedMoves, stars, finished, firstClear) {
    var title = finished ? currentLevel.title + " Clear" : currentLevel.title + " Run";
    var theme = getCurrentEpisodeTheme();
    var challenge = buildChallengeState();
    var waveform = buildWaveformModel(finished ? savedMoves : 0);
    var strip = renderWaveformStrip(waveform);
    var movesText = finished ? String(levelStats.movesMade) : movesLeft + " left";
    var hookLine = buildWaveformHookLine();
    var text = [
      GAME_TITLE + " Campaign: Track " + pad2(currentLevel.episode) + " Level " + currentLevel.id + " · " + theme.name,
      strip,
      "Score " + formatNumber(score) + " · Moves " + movesText + " · Best chain " + levelStats.maxChain,
      hookLine,
      challenge.code
    ].join("\n");

    var stats = [
      { label: "Score", value: formatNumber(score) },
      { label: "One Take", value: strip },
      { label: "Moves", value: movesText },
      { label: "Best chain", value: String(levelStats.maxChain) },
      { label: "Rival", value: challenge.rival },
      { label: "Code", value: challenge.code }
    ];
    if (finished) stats = stats.concat(buildGrantLedgerStats());

    // Per-Hum segment progress (X/15) on the win card: the current Track's Hum
    // records one outline stroke per clear and wakes on the Finale. Shows the
    // player the collection is filling and how it wakes.
    var humId = getHumIdForLevel(currentLevel);
    var humSpec = findHumSpec(humId);
    var humName = (humSpec && humSpec.name) || "Hum";
    var humAwake = isHumAwake(humId);
    var humStateNow = (campaignSave.hums && campaignSave.hums[humId]) || { segments: 0, awake: false };
    var humSeg = humAwake ? HUM_SEGMENTS : Math.max(0, Math.min(HUM_SEGMENTS, humStateNow.segments || 0));
    if (finished) stats = stats.concat([{ label: humAwake ? humName : "Hum", value: humSeg + "/" + HUM_SEGMENTS }]);

    return {
      eyebrow: "Campaign",
      title: title,
      subtitle: finished
        ? savedMoves > 0
          ? savedMoves + " moves became the encore blast."
          : "One take, one clear."
        : "Live take. Every move plays a note.",
      text: text,
      waveform: waveform,
      code: challenge.code,
      hookLine: hookLine,
      stats: stats,
      humId: humId,
      humProgress: { name: humName, segments: humSeg, total: HUM_SEGMENTS, awake: humAwake },
      hero: finished ? { score: score, stars: stars, next: getNextLevelGoalTease() } : null
    };
  }

  function getNearMissFraming() {
    // Frame a loss by how close it was (RM principle 3: losses feel "almost had
    // it", not "cheated"). Shared by the board callout and the fail card so both
    // agree. strong = a true 1-short / 95%+, the retry-bait beat.
    var goal = getPrimaryOpenGoal();
    var scoreTarget = currentLevel.starTargets[0];
    var out = { near: false, strong: false, title: "Out of Moves", subtitle: "One more take.", callout: "OUT OF MOVES" };
    if (!goal) return out;
    if (goal.kind !== "score") {
      var remaining = Math.max(0, goal.target - getGoalValue(goal));
      if (remaining > 0 && remaining <= 3) {
        out.near = true;
        out.strong = remaining <= 1;
        out.title = "So Close";
        out.subtitle = "Only " + remaining + " " + getGoalShortName(goal) + " left.";
        out.callout = out.strong ? "SO CLOSE" : "ALMOST";
      }
    } else if (scoreTarget > 0 && score >= 0.85 * scoreTarget) {
      var pct = score / scoreTarget;
      out.near = true;
      out.strong = pct >= 0.95;
      out.title = Math.floor(100 * pct) + "% There";
      out.subtitle = formatNumber(scoreTarget - score) + " points from the clear.";
      out.callout = out.strong ? "SO CLOSE" : "ALMOST";
    }
    return out;
  }

  function buildFailPayload() {
    var goal = getPrimaryOpenGoal();
    var nm = getNearMissFraming();
    var title = nm.title;
    var subtitle = nm.subtitle;
    var challenge = buildChallengeState();
    var waveform = buildWaveformModel(0);
    var strip = renderWaveformStrip(waveform);
    var hookLine = buildWaveformHookLine();
    var text = [
      GAME_TITLE + " Campaign: Track " + pad2(currentLevel.episode) + " Level " + currentLevel.id + " · " + getCurrentEpisodeTheme().name,
      strip,
      "Score " + formatNumber(score) + " · Moves " + levelStats.movesMade + " · Best chain " + levelStats.maxChain,
      hookLine,
      challenge.code
    ].join("\n");
    return {
      eyebrow: "Campaign",
      title: title,
      subtitle: subtitle,
      text: text,
      waveform: waveform,
      code: challenge.code,
      hookLine: hookLine,
      humId: getHumIdForLevel(currentLevel),
      stats: [
        { label: "Score", value: formatNumber(score) },
        { label: "One Take", value: strip },
        { label: "Goal", value: goal ? getGoalValue(goal) + "/" + goal.target : "Done" },
        { label: "Moves", value: String(levelStats.movesMade) }
      ]
    };
  }

  function getNextLevelGoalTease() {
    if (currentLevelIndex + 1 >= campaign.length) return "";
    // Finale clears tease the next track drop, not the next goal; the
    // sector-entry reveal is the payoff this line points at.
    if (isFinaleLevel(currentLevel)) return "Next: Track " + pad2(currentLevel.episode + 1) + " drops";
    var nextLevel = campaign[currentLevelIndex + 1];
    var goals = nextLevel.goals.filter(function (goal) {
      return goal.kind !== "score";
    });
    var primary = goals[0] || nextLevel.goals[0];
    if (!primary) return "";
    return "Next: " + getGoalShortName(primary);
  }

  function getCampaignViralMoment(savedMoves, stars, finished, clip) {
    if (!finished) return "Live seed chase";
    if (isFinaleLevel(currentLevel)) return "Track " + pad2(currentLevel.episode) + " Finale cleared";
    if (currentLevel.id === 1) return "Ion sweep";
    if (currentLevel.id === 2 && levelStats.specialsCreated + levelStats.specialsActivated > 0) return "First beam spark";
    if (currentLevel.id === 3) return "Shield break";
    if (currentLevel.id === 4) return "Cascade signal";
    if (currentLevel.id === 5) return "Overdrive ignition";
    if (currentLevel.id === 6) return "Prism shield sweep";
    if (currentLevel.id === 7 && levelStats.specialsCreated + levelStats.specialsActivated > 0) return "Nova primer";
    if (currentLevel.id === 8) return "Fusion fireworks";
    if (currentLevel.id === 9) return "Core reactor chain";
    if (currentLevel.id === 10) return "First Gate cracked";
    if (levelStats.fusions > 0) return "Fusion fireworks";
    if (savedMoves >= 10) return "Encore bomb";
    if (levelStats.maxChain >= 3) return "Chain reaction";
    if (levelStats.overdrives > 0) return "Overdrive clear";
    if (stars >= 3) return "Three-star clear";
    return clip.reason || "Clean clear";
  }

  function getCampaignShareSubtitle(momentLine, savedMoves) {
    if (savedMoves > 0) return momentLine + ". " + savedMoves + " moves became the encore blast.";
    return momentLine + ". Clear proof is ready.";
  }

  function getLevelRewardShareLine(level, firstClear, finished) {
    var reward = level && FIRST_CLEAR_REWARDS[level.id];
    if (!reward) {
      if (!level || level.id <= 10) return "Star Reactor chase";
      var drip = level.id % 15 === 0 ? 40 : 15;
      if (firstClear) return "CLEAR BONUS +" + drip + " Credits";
      if ((campaignSave.stars[level.id] || 0) > 0) return "First reward claimed";
      return "+" + drip + " Credits on clear";
    }
    if (firstClear) return reward.label + " +" + describeRewardGrant(reward);
    if ((campaignSave.stars[level.id] || 0) > 0) return "First reward claimed";
    if (!finished) return reward.label + " on clear";
    return reward.label + " +" + describeRewardGrant(reward);
  }

  function buildPulseSharePayload() {
    var daily = gameMode === MODE_DAILY;
    updatePulseBestScore();
    var modeLabel = daily ? "Daily Pulse" : "Pulse Rush";
    var title = daily ? getDailyTrackTitle(dailyId) : "Pulse Rush";
    var challenge = buildChallengeState();
    var waveform = buildWaveformModel(0);
    var strip = renderWaveformStrip(waveform);
    var hookLine = buildWaveformHookLine();
    var statLine = "Score " + formatNumber(score) + " · Time " + formatRunTime(rushSeconds) + " · Best chain " + levelStats.maxChain;
    if (daily) statLine += " · " + getDailyTakeLabel();
    var text = [
      daily ? GAME_TITLE + " " + title : GAME_TITLE + " " + title + " · " + getMusicPalette().label,
      strip,
      statLine,
      hookLine,
      challenge.code
    ].join("\n");

    var stats = [
      { label: "Score", value: formatNumber(score) },
      { label: "One Take", value: strip },
      { label: "Time", value: formatRunTime(rushSeconds) },
      { label: "Best chain", value: String(levelStats.maxChain) },
      { label: "Rival", value: challenge.rival },
      { label: "Code", value: challenge.code }
    ];
    if (daily) stats.splice(4, 0, { label: "Take", value: getDailyTakeValue() });

    return {
      eyebrow: modeLabel,
      title: title,
      subtitle: daily ? "Same seed. No boosters. Beat today's board." : "Keep pulse alive and build the beat.",
      text: text,
      waveform: waveform,
      code: challenge.code,
      hookLine: hookLine,
      stats: stats
    };
  }

  function openShareCard(payload) {
    // Card is now (about to be) on screen: the pending pre-card tap block ends
    // and isGameplayPaused()'s is-open check takes over.
    shareCardPending = false;
    cancelPointerCapture();
    closeMenu();
    closeStore();
    closeMap();
    closeSettings();
    closeSetlist();
    lastSharePayload = payload || buildCurrentSharePayload();
    if (!lastSharePayload) return;

    var resultClear = isCampaignClearResult() || (gameMode === MODE_CAMPAIGN && levelState === "lost");
    sharePanel.classList.toggle("is-result", resultClear);
    shareEyebrowEl.textContent = lastSharePayload.eyebrow;
    shareTitleEl.textContent = lastSharePayload.title;
    shareSubtitleEl.textContent = lastSharePayload.subtitle;
    shareTextEl.value = lastSharePayload.text;
    shareStatsEl.textContent = "";
    // Payloads are lean post-waveform: the result card renders the full set
    // (strip, three stats, rival, code, and the Earned WHY ledger).
    var renderStats = lastSharePayload.stats;
    renderStats.forEach(function (stat) {
      var item = document.createElement("div");
      var label = document.createElement("span");
      var value = document.createElement("strong");
      item.className = "share-stat";
      label.textContent = stat.label;
      value.textContent = stat.value;
      item.appendChild(label);
      item.appendChild(value);
      shareStatsEl.appendChild(item);
    });

    // Album cover (share feature #2): render the run's generative cover art and show it at
    // the top of the card, so the share reads as art first, not a wall of text. Best-effort;
    // if the canvas export throws, hide it and keep the rest of the card intact.
    if (shareCoverImg) {
      try {
        shareCoverImg.src = drawAlbumCover(lastSharePayload).toDataURL("image/png");
        shareCoverImg.classList.add("is-shown");
      } catch (coverError) {
        shareCoverImg.classList.remove("is-shown");
      }
    }

    stopShareScoreCount();
    removeShareStars();
    if (isCampaignClearResult() && lastSharePayload.hero) {
      animateShareScoreCount(lastSharePayload.hero.score);
      insertShareStars(lastSharePayload.hero.stars);
      if (lastSharePayload.hero.next) {
        shareSubtitleEl.textContent = lastSharePayload.subtitle + " " + lastSharePayload.hero.next;
      }
    }

    nativeShareButton.disabled = resultClear ? false : !navigator.share;
    shareCopyButton.textContent = resultClear ? "Copy Proof" : "Copy";
    nativeShareButton.textContent = resultClear ? "Share" : "Native Share";
    shareImageButton.textContent = canTryNativeImageShare() ? "Share PNG" : "Save PNG";
    shareStatusEl.textContent = gameMode === MODE_DAILY && levelState === "lost" ? getShareTakeNote() : "";
    // Campaign clear: one line on the Hum, so the collection payoff and how to
    // wake it are visible on every win card, not only in the Greenroom.
    if (isCampaignClearResult() && lastSharePayload.humProgress) {
      var hp = lastSharePayload.humProgress;
      shareStatusEl.textContent = hp.awake
        ? hp.name + " is awake · poke it in the Greenroom."
        : "Hum " + hp.segments + "/" + hp.total + " · clear this Track's Finale to wake " + hp.name + ".";
    }
    closeShareButton.textContent = getShareCloseLabel();
    removeShareContinueButton();
    removeShareSetlistButton();
    if (gameMode === MODE_CAMPAIGN && levelState === "lost" && canAffordContinue()) insertShareContinueButton();
    if (gameMode === MODE_DAILY) insertShareSetlistButton();
    sharePanel.classList.add("is-open");
    sharePanel.setAttribute("aria-hidden", "false");
  }

  function animateShareScoreCount(finalScore) {
    var strong = shareStatsEl.querySelector(".share-stat strong");
    if (!strong) return;
    var duration = 800;
    var startTime = 0;
    strong.textContent = formatNumber(0);
    function step(now) {
      if (!startTime) startTime = now;
      var t = Math.min(1, (now - startTime) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      strong.textContent = formatNumber(Math.round(finalScore * eased));
      shareScoreCountFrame = t < 1 ? requestAnimationFrame(step) : 0;
    }
    shareScoreCountFrame = requestAnimationFrame(step);
  }

  function stopShareScoreCount() {
    if (!shareScoreCountFrame) return;
    cancelAnimationFrame(shareScoreCountFrame);
    shareScoreCountFrame = 0;
  }

  function insertShareStars(stars) {
    var row = document.createElement("div");
    row.id = "shareStars";
    row.className = "share-stars";
    for (var i = 0; i < 3; i += 1) {
      var glyph = document.createElement("span");
      glyph.textContent = i < stars ? "\u2605" : "\u2606";
      if (i < stars) glyph.className = "is-earned";
      glyph.style.animationDelay = 200 + i * 200 + "ms";
      row.appendChild(glyph);
    }
    shareStatsEl.parentNode.insertBefore(row, shareStatsEl);
  }

  function removeShareStars() {
    var row = document.getElementById("shareStars");
    if (row && row.parentNode) row.parentNode.removeChild(row);
  }

  function insertShareContinueButton() {
    var button = document.createElement("button");
    button.type = "button";
    button.id = "shareContinueButton";
    button.textContent = "Continue +" + CONTINUE_MOVES + " (" + CONTINUE_COST + "C)";
    button.addEventListener("click", function () {
      closeShareCard(false);
      buyStoreItem("continue");
    });
    closeShareButton.parentNode.insertBefore(button, closeShareButton);
  }

  function removeShareContinueButton() {
    var button = document.getElementById("shareContinueButton");
    if (button && button.parentNode) button.parentNode.removeChild(button);
  }

  function insertShareSetlistButton() {
    var button = document.createElement("button");
    button.type = "button";
    button.id = "shareSetlistButton";
    button.textContent = "Setlist";
    button.addEventListener("click", function () {
      closeShareCard(false);
      openSetlist();
    });
    closeShareButton.parentNode.insertBefore(button, closeShareButton);
  }

  function removeShareSetlistButton() {
    var button = document.getElementById("shareSetlistButton");
    if (button && button.parentNode) button.parentNode.removeChild(button);
  }

  function closeShareCard(resumeRun) {
    if (!sharePanel) return;
    shareCardPending = false;
    var wasOpen = sharePanel.classList.contains("is-open");
    sharePanel.classList.remove("is-open");
    sharePanel.classList.remove("is-result");
    sharePanel.setAttribute("aria-hidden", "true");
    stopShareScoreCount();
    removeShareStars();
    removeShareContinueButton();
    removeShareSetlistButton();
    shareStatusEl.textContent = "";
    shareCopyButton.textContent = "Copy";
    nativeShareButton.textContent = "Native Share";
    closeShareButton.textContent = "Close";
    if (resumeRun && wasOpen) resumeAfterShareCard();
    showNextCoachTip();
  }

  function isCampaignClearResult() {
    return gameMode === MODE_CAMPAIGN && levelState === "won";
  }

  function getShareCloseLabel() {
    if (isCampaignClearResult()) return currentLevelIndex + 1 < campaign.length ? "Next Level" : "OK";
    if (gameMode === MODE_CAMPAIGN && levelState === "lost") return "Retry";
    if (gameMode === MODE_DAILY && levelState === "lost") {
      // Setlist vocabulary: a scored retry is a NEW TAKE; past the take
      // limit the button starts an unscored rehearsal instead.
      return getDailyTakeEntry(dailyId).count >= DAILY_TAKE_LIMIT ? "Rehearse" : "NEW TAKE";
    }
    if (isPulseMode() && levelState === "lost") return "Restart";
    return "Close";
  }

  function getShareTakeNote() {
    // NEW TAKE consumes a scored take, so the card says which one up front.
    var entry = getDailyTakeEntry(dailyId);
    if (entry.count >= DAILY_TAKE_LIMIT) return "Takes done. Rehearsal is unscored.";
    return "Uses take " + (entry.count + 1) + "/" + DAILY_TAKE_LIMIT + ".";
  }

  function resumeAfterShareCard() {
    if (gameMode === MODE_CAMPAIGN && levelState === "won") {
      if (currentLevelIndex + 1 < campaign.length && currentLevelIndex + 1 < campaignSave.unlocked) {
        startLevel(currentLevelIndex + 1);
      }
      return;
    }
    if (gameMode === MODE_CAMPAIGN && levelState === "lost") {
      startLevel(currentLevelIndex);
      return;
    }
    if (gameMode === MODE_RUSH && levelState === "lost") {
      startRush();
      return;
    }
    if (gameMode === MODE_DAILY && levelState === "lost") {
      startDaily();
    }
  }

  function copyShareCard() {
    if (!lastSharePayload) lastSharePayload = buildCurrentSharePayload();
    if (!lastSharePayload) return;
    var text = lastSharePayload.text;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        shareStatusEl.textContent = "Copied challenge card.";
      }).catch(function () {
        fallbackCopyShareText();
      });
      return;
    }
    fallbackCopyShareText();
  }

  function fallbackCopyShareText() {
    shareTextEl.focus();
    shareTextEl.select();
    try {
      document.execCommand("copy");
      shareStatusEl.textContent = "Copied challenge card.";
    } catch (error) {
      shareStatusEl.textContent = "Select the text and copy it.";
    }
  }

  function nativeShareCard() {
    if (!lastSharePayload) lastSharePayload = buildCurrentSharePayload();
    if (!lastSharePayload) return;
    if (!navigator.share) {
      copyShareCard();
      return;
    }
    navigator.share({
      title: GAME_TITLE,
      text: lastSharePayload.text
    }).then(function () {
      shareStatusEl.textContent = "Share sheet opened.";
    }).catch(function () {
      shareStatusEl.textContent = "Share cancelled.";
    });
  }

  function saveShareImage() {
    if (!lastSharePayload) lastSharePayload = buildCurrentSharePayload();
    if (!lastSharePayload) return;
    shareStatusEl.textContent = "Rendering cover.";

    try {
      var imageCanvas = drawAlbumCover(lastSharePayload);
      var fileName = createShareImageName(lastSharePayload);
      shareOrDownloadImage(imageCanvas, fileName, lastSharePayload);
    } catch (error) {
      shareStatusEl.textContent = "PNG export failed.";
    }
  }

  function albumRgba(hex, alpha) {
    var h = hex.replace("#", "");
    return "rgba(" + parseInt(h.substring(0, 2), 16) + "," + parseInt(h.substring(2, 4), 16) + "," + parseInt(h.substring(4, 6), 16) + "," + alpha + ")";
  }

  function albumCoverColors(rng) {
    // Seeded pick of three distinct neon accents from the six piece colors, so each run's
    // cover leans into its own scheme (the seed folds in score + best chain + code + track).
    var idx = [0, 1, 2, 3, 4, 5];
    for (var i = idx.length - 1; i > 0; i -= 1) {
      var j = Math.floor(rng() * (i + 1));
      var tmp = idx[i]; idx[i] = idx[j]; idx[j] = tmp;
    }
    return [TYPES[idx[0]].color, TYPES[idx[1]].color, TYPES[idx[2]].color];
  }

  function drawAlbumCover(payload) {
    // Share feature #2: a square, art-forward "album cover" for a run. A neon mandala seeded
    // by the run (score + best chain + challenge code + track name) over three seeded accent
    // colors, with the track name + score + stars. Distinct from drawShareImage (the 9:16
    // stats proof) — this is cover art, the shareable/postable hero. 1080 square = post-native.
    var size = 1080;
    var canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext("2d");

    var score = (payload.hero && payload.hero.score) ||
      parseInt(String(findPayloadStat(payload, "Score") || "0").replace(/[^0-9]/g, ""), 10) || 0;
    var stars = (payload.hero && payload.hero.stars) || 0;
    var chain = parseInt(String(findPayloadStat(payload, "Best chain") || "0").replace(/[^0-9]/g, ""), 10) || 0;
    var track = String(payload.title || GAME_TITLE).replace(/\s+(Run|Clear)$/i, "").toUpperCase();
    var rng = createSeededRandom(hashString((payload.code || "") + ":" + track + ":" + score + ":" + chain));
    var colors = albumCoverColors(rng);
    var cx = size / 2;
    var cy = size * 0.44;

    // Background: a radial bloom in the lead accent over near-black, plus a faint skew grid.
    var bg = ctx.createRadialGradient(cx, cy, 40, cx, cy, size * 0.82);
    bg.addColorStop(0, albumRgba(colors[0], 0.12));
    bg.addColorStop(0.5, "#070b14");
    bg.addColorStop(1, "#04050a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 1;
    for (var gx = -size; gx <= size; gx += 62) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx + size * 0.3, size);
      ctx.stroke();
    }
    ctx.restore();

    // Radial rays fanning out of the center bloom.
    var rays = 12 + Math.floor(rng() * 5) * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rng() * Math.PI);
    for (var r = 0; r < rays; r += 1) {
      ctx.save();
      ctx.rotate((r / rays) * Math.PI * 2);
      ctx.globalAlpha = 0.08 + rng() * 0.12;
      ctx.strokeStyle = colors[r % colors.length];
      ctx.lineWidth = 2 + rng() * 3;
      ctx.shadowBlur = 22;
      ctx.shadowColor = colors[r % colors.length];
      ctx.beginPath();
      ctx.moveTo(0, size * 0.05);
      ctx.lineTo(0, size * (0.3 + rng() * 0.18));
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // Concentric rings, each carrying rotating piece glyphs — more rings with more stars/chain.
    var ringCount = 3 + Math.max(0, Math.min(3, stars)) + (chain > 6 ? 1 : 0);
    ctx.save();
    ctx.translate(cx, cy);
    var baseRot = rng() * Math.PI * 2;
    for (var ring = 0; ring < ringCount; ring += 1) {
      var radius = size * (0.075 + ring * 0.06);
      var col = colors[ring % colors.length];
      ctx.save();
      ctx.globalAlpha = Math.max(0.12, 0.5 - ring * 0.05);
      ctx.strokeStyle = col;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 28;
      ctx.shadowColor = col;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      var count = 3 + ring * 2;
      var rot = baseRot + ring * 0.5;
      for (var k = 0; k < count; k += 1) {
        var ga = rot + (k / count) * Math.PI * 2;
        ctx.save();
        ctx.globalAlpha = Math.max(0.3, 0.9 - ring * 0.08);
        drawShareGlyph(ctx, Math.cos(ga) * radius, Math.sin(ga) * radius, 14 + ring * 2 + rng() * 8, (ring + k) % TYPES.length);
        ctx.restore();
      }
    }
    ctx.save();
    ctx.globalAlpha = 0.96;
    drawShareGlyph(ctx, 0, 0, 44 + Math.min(28, chain * 3), 0);
    ctx.restore();
    ctx.restore();

    // Bottom scrim so the type stays legible over the art.
    var scrim = ctx.createLinearGradient(0, size * 0.6, 0, size);
    scrim.addColorStop(0, "rgba(4,5,10,0)");
    scrim.addColorStop(0.55, "rgba(4,5,10,0.85)");
    scrim.addColorStop(1, "rgba(4,5,10,0.98)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, size * 0.6, size, size * 0.4);

    // Wordmark + side label.
    ctx.save();
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "#eff9ff";
    ctx.font = "900 30px Inter, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("S T R I N G", 64, 80);
    ctx.textAlign = "right";
    ctx.fillStyle = albumRgba(colors[0], 0.92);
    ctx.fillText((payload.eyebrow || "SIDE A").toUpperCase(), size - 64, 80);
    ctx.restore();

    // Track name (big).
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 26;
    ctx.shadowColor = albumRgba(colors[0], 0.85);
    var titleFont = track.length > 13 ? 62 : (track.length > 9 ? 80 : 98);
    ctx.font = "950 " + titleFont + "px Inter, system-ui, sans-serif";
    fillWrappedText(ctx, track, 64, size - 150, size - 128, titleFont, 2);
    ctx.restore();

    // Score + stars.
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = albumRgba(colors[1], 1);
    ctx.font = "900 42px Inter, system-ui, sans-serif";
    var starStr = "";
    for (var s = 0; s < 3; s += 1) starStr += s < stars ? "★" : "☆";
    ctx.fillText(formatNumber(score) + "   " + starStr, 64, size - 64);
    ctx.restore();

    // Challenge code.
    ctx.save();
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = "#90a4af";
    ctx.font = "800 26px Inter, system-ui, sans-serif";
    ctx.fillText(payload.code || findPayloadStat(payload, "Code") || GAME_CODE_PREFIX, size - 64, size - 64);
    ctx.restore();

    return canvas;
  }

  function drawShareImage(payload) {
    var exportCanvas = document.createElement("canvas");
    var imageWidth = 1080;
    var imageHeight = 1920;
    var imageCtx = exportCanvas.getContext("2d");
    var stats = selectShareImageStats(payload.stats);
    var rng = createSeededRandom(hashString(payload.title + ":" + payload.text));

    exportCanvas.width = imageWidth;
    exportCanvas.height = imageHeight;

    drawShareImageBackground(imageCtx, imageWidth, imageHeight, rng);
    drawShareImageGlyphField(imageCtx, imageWidth, imageHeight, rng);

    imageCtx.save();
    imageCtx.fillStyle = "#eff9ff";
    imageCtx.textAlign = "left";
    imageCtx.textBaseline = "top";
    imageCtx.font = "900 34px Inter, system-ui, sans-serif";
    imageCtx.fillText(GAME_TITLE.toUpperCase(), 86, 92);

    imageCtx.fillStyle = "#46f4ff";
    imageCtx.font = "900 28px Inter, system-ui, sans-serif";
    imageCtx.fillText(payload.eyebrow.toUpperCase(), 86, 154);

    imageCtx.fillStyle = "#ffffff";
    imageCtx.font = "950 92px Inter, system-ui, sans-serif";
    fillWrappedText(imageCtx, payload.title, 86, 230, 900, 98, 2);

    drawShareWaveformHero(imageCtx, payload.waveform || [], 86, 485, 908, 240);
    if (payload.humId && isHumAwake(payload.humId)) drawShareHumFeat(imageCtx, payload.humId, 86, 485, 908);
    drawShareStats(imageCtx, stats, 86, 780, 908);

    imageCtx.fillStyle = "#ffd166";
    imageCtx.font = "900 38px Inter, system-ui, sans-serif";
    fillWrappedText(imageCtx, payload.subtitle, 86, 1272, 870, 48, 3);

    imageCtx.fillStyle = "rgba(239, 249, 255, 0.74)";
    imageCtx.font = "800 29px Inter, system-ui, sans-serif";
    fillWrappedText(imageCtx, payload.hookLine || "Every move you see, you hear. Beat it.", 86, 1460, 840, 42, 2);

    imageCtx.strokeStyle = "rgba(70, 244, 255, 0.55)";
    imageCtx.lineWidth = 3;
    imageCtx.beginPath();
    imageCtx.moveTo(86, 1618);
    imageCtx.lineTo(994, 1618);
    imageCtx.stroke();

    imageCtx.fillStyle = "#90a4af";
    imageCtx.font = "900 26px Inter, system-ui, sans-serif";
    imageCtx.fillText("Challenge code", 86, 1662);
    imageCtx.fillStyle = "#eff9ff";
    imageCtx.font = "950 44px Inter, system-ui, sans-serif";
    imageCtx.fillText(payload.code || findPayloadStat(payload, "Code") || GAME_CODE_PREFIX, 86, 1708);
    imageCtx.restore();

    return exportCanvas;
  }

  function drawShareImageBackground(imageCtx, imageWidth, imageHeight, rng) {
    var gradient = imageCtx.createLinearGradient(0, 0, imageWidth, imageHeight);
    gradient.addColorStop(0, "#05060a");
    gradient.addColorStop(0.44, "#07111c");
    gradient.addColorStop(1, "#020308");
    imageCtx.fillStyle = gradient;
    imageCtx.fillRect(0, 0, imageWidth, imageHeight);

    imageCtx.save();
    imageCtx.globalAlpha = 0.28;
    imageCtx.strokeStyle = "#46f4ff";
    imageCtx.lineWidth = 1;
    for (var x = 0; x <= imageWidth; x += 54) {
      imageCtx.beginPath();
      imageCtx.moveTo(x, 0);
      imageCtx.lineTo(x + imageHeight * 0.18, imageHeight);
      imageCtx.stroke();
    }
    imageCtx.globalAlpha = 0.18;
    imageCtx.strokeStyle = "#ff4fd8";
    for (var y = 0; y <= imageHeight; y += 54) {
      imageCtx.beginPath();
      imageCtx.moveTo(0, y);
      imageCtx.lineTo(imageWidth, y + imageWidth * 0.1);
      imageCtx.stroke();
    }
    imageCtx.restore();

    for (var i = 0; i < 48; i += 1) {
      imageCtx.fillStyle = i % 3 === 0 ? "rgba(255, 79, 216, 0.2)" : "rgba(70, 244, 255, 0.18)";
      imageCtx.beginPath();
      imageCtx.arc(rng() * imageWidth, rng() * imageHeight, 1 + rng() * 3.5, 0, Math.PI * 2);
      imageCtx.fill();
    }
  }

  function drawShareImageGlyphField(imageCtx, imageWidth, imageHeight, rng) {
    for (var i = 0; i < 18; i += 1) {
      var typeIndex = i % TYPES.length;
      var x = 120 + rng() * (imageWidth - 240);
      var y = 90 + rng() * (imageHeight - 180);
      var size = 22 + rng() * 36;
      imageCtx.save();
      imageCtx.globalAlpha = 0.22 + rng() * 0.18;
      drawShareGlyph(imageCtx, x, y, size, typeIndex);
      imageCtx.restore();
    }
  }

  function drawShareClipBadge(imageCtx, clip, reason, x, y, width) {
    fillRoundRect(imageCtx, x, y, width, 210, 22, "rgba(255, 255, 255, 0.055)");
    strokeRoundRect(imageCtx, x, y, width, 210, 22, "rgba(255, 209, 102, 0.62)", 3);
    drawShareGlyph(imageCtx, x + 104, y + 105, 58, 5);

    imageCtx.fillStyle = "#ffd166";
    imageCtx.font = "950 36px Inter, system-ui, sans-serif";
    imageCtx.fillText("WHY POST", x + 196, y + 34);

    imageCtx.fillStyle = "#ffffff";
    imageCtx.font = "950 74px Inter, system-ui, sans-serif";
    imageCtx.fillText(clip, x + 196, y + 82);

    imageCtx.fillStyle = "#46f4ff";
    imageCtx.font = "900 32px Inter, system-ui, sans-serif";
    fillWrappedText(imageCtx, reason, x + 196, y + 158, width - 230, 38, 1);
  }

  function drawShareWaveformHero(imageCtx, model, x, y, width, height) {
    // PNG proof-card hero: the waveform strip in the sector palette colors.
    // Spoiler-free: it shows how the take sounded, never the board.
    fillRoundRect(imageCtx, x, y, width, height, 22, "rgba(255, 255, 255, 0.055)");
    strokeRoundRect(imageCtx, x, y, width, height, 22, "rgba(70, 244, 255, 0.45)", 3);

    imageCtx.fillStyle = "#46f4ff";
    imageCtx.font = "950 30px Inter, system-ui, sans-serif";
    imageCtx.fillText("ONE TAKE", x + 32, y + 26);

    if (model.length === 0) return;
    var max = 1;
    model.forEach(function (bar) {
      max = Math.max(max, bar.value);
    });
    var laneX = x + 32;
    var laneWidth = width - 64;
    var baseY = y + height - 34;
    var barMaxHeight = height - 116;
    var slot = laneWidth / model.length;
    var barWidth = Math.max(6, slot * 0.62);
    model.forEach(function (bar, index) {
      var cx = laneX + slot * index + slot / 2;
      var color = TYPES[index % TYPES.length].color;
      if (bar.event) {
        imageCtx.save();
        imageCtx.textAlign = "center";
        imageCtx.fillStyle = bar.event === "flatline" ? "#ff5e7a" : bar.event === "encore" ? "#ffd166" : color;
        imageCtx.shadowBlur = 14;
        imageCtx.shadowColor = imageCtx.fillStyle;
        imageCtx.font = "950 " + Math.max(24, Math.min(38, Math.floor(slot * 0.9))) + "px Inter, system-ui, sans-serif";
        imageCtx.fillText(WAVEFORM_EVENT_GLYPHS[bar.event] || "·", cx, baseY - 44);
        imageCtx.restore();
        return;
      }
      if (bar.value <= 0) {
        fillRoundRect(imageCtx, cx - barWidth / 2, baseY - 5, barWidth, 5, 2, "rgba(144, 164, 175, 0.55)");
        return;
      }
      var barHeight = Math.max(12, (bar.value / max) * barMaxHeight);
      imageCtx.save();
      imageCtx.shadowBlur = 18;
      imageCtx.shadowColor = color;
      fillRoundRect(imageCtx, cx - barWidth / 2, baseY - barHeight, barWidth, barHeight, Math.min(6, barWidth / 2), color);
      imageCtx.restore();
    });
  }

  // "feat. <Name>" stamp on the Waveform proof card: a tiny static Hum glyph in
  // the hero header band, right of the ONE TAKE label. Only called when that
  // track's Hum is awake, so old saves and undiscovered tracks omit it cleanly.
  // Reuses drawHum via the shared-ctx swap (like the tracklist corner), still and
  // trail-free so it emits zero particles into the export.
  function drawShareHumFeat(imageCtx, humId, heroX, heroY, heroWidth) {
    var spec = findHumSpec(humId);
    if (!spec || !spec.body) return;
    var name = (spec.name || "Hum");
    var size = 28;
    var cx = heroX + heroWidth - 40 - size;
    var cy = heroY + 44;
    imageCtx.save();
    imageCtx.shadowBlur = 0;
    imageCtx.textAlign = "right";
    imageCtx.textBaseline = "middle";
    imageCtx.fillStyle = "rgba(239, 249, 255, 0.85)";
    imageCtx.font = "900 26px Inter, system-ui, sans-serif";
    imageCtx.fillText("feat. " + name, cx - size - 14, cy);
    imageCtx.restore();
    var saved = ctx;
    ctx = imageCtx;
    try {
      drawHum(imageCtx, spec, cx, cy, size, 0, { still: true, noTrail: true, eyeOpen: 1 });
    } finally {
      ctx = saved;
    }
  }

  function drawShareStats(imageCtx, stats, x, y, width) {
    var gap = 18;
    var cols = 2;
    var boxWidth = (width - gap) / cols;
    var boxHeight = 132;
    stats.forEach(function (stat, index) {
      var col = index % cols;
      var row = Math.floor(index / cols);
      var boxX = x + col * (boxWidth + gap);
      var boxY = y + row * (boxHeight + gap);
      fillRoundRect(imageCtx, boxX, boxY, boxWidth, boxHeight, 18, "rgba(255, 255, 255, 0.052)");
      strokeRoundRect(imageCtx, boxX, boxY, boxWidth, boxHeight, 18, "rgba(70, 244, 255, 0.28)", 2);

      imageCtx.fillStyle = "#90a4af";
      imageCtx.font = "900 24px Inter, system-ui, sans-serif";
      imageCtx.fillText(stat.label.toUpperCase(), boxX + 24, boxY + 22);

      imageCtx.fillStyle = "#eff9ff";
      imageCtx.font = "950 39px Inter, system-ui, sans-serif";
      fillWrappedText(imageCtx, stat.value, boxX + 24, boxY + 66, boxWidth - 48, 42, 1);
    });
  }

  function drawShareGlyph(imageCtx, x, y, size, typeIndex) {
    var type = TYPES[typeIndex % TYPES.length];
    imageCtx.save();
    imageCtx.translate(x, y);
    imageCtx.shadowBlur = 28;
    imageCtx.shadowColor = type.color;
    imageCtx.strokeStyle = type.color;
    imageCtx.fillStyle = type.fill;
    imageCtx.lineWidth = Math.max(3, size * 0.07);

    if (type.shape === "circle") {
      imageCtx.beginPath();
      imageCtx.arc(0, 0, size, 0, Math.PI * 2);
      imageCtx.fill();
      imageCtx.stroke();
    } else if (type.shape === "triangle") {
      imageCtx.beginPath();
      imageCtx.moveTo(0, -size);
      imageCtx.lineTo(size * 0.9, size * 0.72);
      imageCtx.lineTo(-size * 0.9, size * 0.72);
      imageCtx.closePath();
      imageCtx.fill();
      imageCtx.stroke();
    } else if (type.shape === "diamond") {
      imageCtx.beginPath();
      imageCtx.moveTo(0, -size);
      imageCtx.lineTo(size, 0);
      imageCtx.lineTo(0, size);
      imageCtx.lineTo(-size, 0);
      imageCtx.closePath();
      imageCtx.fill();
      imageCtx.stroke();
    } else if (type.shape === "square") {
      imageCtx.rotate(Math.PI / 4);
      fillRoundRect(imageCtx, -size * 0.78, -size * 0.78, size * 1.56, size * 1.56, 10, type.fill);
      strokeRoundRect(imageCtx, -size * 0.78, -size * 0.78, size * 1.56, size * 1.56, 10, type.color, imageCtx.lineWidth);
    } else if (type.shape === "hex") {
      imageCtx.beginPath();
      for (var i = 0; i < 6; i += 1) {
        var angle = Math.PI / 6 + i * Math.PI / 3;
        var px = Math.cos(angle) * size;
        var py = Math.sin(angle) * size;
        if (i === 0) imageCtx.moveTo(px, py);
        else imageCtx.lineTo(px, py);
      }
      imageCtx.closePath();
      imageCtx.fill();
      imageCtx.stroke();
    } else {
      imageCtx.beginPath();
      imageCtx.arc(0, 0, size * 0.46, 0, Math.PI * 2);
      imageCtx.fill();
      imageCtx.stroke();
      imageCtx.beginPath();
      imageCtx.ellipse(0, 0, size * 1.12, size * 0.35, 0, 0, Math.PI * 2);
      imageCtx.stroke();
      imageCtx.beginPath();
      imageCtx.ellipse(0, 0, size * 1.12, size * 0.35, Math.PI / 2, 0, Math.PI * 2);
      imageCtx.stroke();
    }
    imageCtx.restore();
  }

  function selectShareImageStats(stats) {
    // The strip already owns the PNG hero panel, so skip its stat twin here.
    var preferred = ["Score", "Time", "Moves", "Best chain", "Take", "Rival", "Code"];
    var output = [];
    preferred.forEach(function (label) {
      if (output.length >= 6) return;
      var stat = stats.find(function (candidate) {
        return candidate.label === label;
      });
      if (stat) output.push(stat);
    });
    stats.forEach(function (stat) {
      if (output.length >= 6) return;
      if (stat.label === "One Take") return;
      if (output.indexOf(stat) === -1) output.push(stat);
    });
    return output;
  }

  function findPayloadStat(payload, label) {
    var stat = payload.stats.find(function (candidate) {
      return candidate.label === label;
    });
    return stat ? stat.value : "";
  }

  function extractShareLine(text, prefix) {
    var lines = String(text || "").split("\n");
    for (var i = 0; i < lines.length; i += 1) {
      if (lines[i].indexOf(prefix + ": ") === 0) return lines[i].slice(prefix.length + 2);
    }
    return "";
  }

  function fillWrappedText(imageCtx, text, x, y, maxWidth, lineHeight, maxLines) {
    var words = String(text || "").split(/\s+/);
    var line = "";
    var drawn = 0;
    for (var i = 0; i < words.length; i += 1) {
      var nextLine = line ? line + " " + words[i] : words[i];
      if (imageCtx.measureText(nextLine).width <= maxWidth || !line) {
        line = nextLine;
      } else {
        imageCtx.fillText(line, x, y + drawn * lineHeight);
        drawn += 1;
        line = words[i];
        if (drawn >= maxLines) return y + drawn * lineHeight;
      }
    }
    if (line && drawn < maxLines) {
      imageCtx.fillText(line, x, y + drawn * lineHeight);
      drawn += 1;
    }
    return y + drawn * lineHeight;
  }

  function fillRoundRect(imageCtx, x, y, width, height, radius, fillStyle) {
    pathRoundRect(imageCtx, x, y, width, height, radius);
    imageCtx.fillStyle = fillStyle;
    imageCtx.fill();
  }

  function strokeRoundRect(imageCtx, x, y, width, height, radius, strokeStyle, lineWidth) {
    pathRoundRect(imageCtx, x, y, width, height, radius);
    imageCtx.strokeStyle = strokeStyle;
    imageCtx.lineWidth = lineWidth;
    imageCtx.stroke();
  }

  function pathRoundRect(imageCtx, x, y, width, height, radius) {
    var r = Math.min(radius, width / 2, height / 2);
    imageCtx.beginPath();
    imageCtx.moveTo(x + r, y);
    imageCtx.lineTo(x + width - r, y);
    imageCtx.quadraticCurveTo(x + width, y, x + width, y + r);
    imageCtx.lineTo(x + width, y + height - r);
    imageCtx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    imageCtx.lineTo(x + r, y + height);
    imageCtx.quadraticCurveTo(x, y + height, x, y + height - r);
    imageCtx.lineTo(x, y + r);
    imageCtx.quadraticCurveTo(x, y, x + r, y);
    imageCtx.closePath();
  }

  function createShareImageName(payload) {
    var title = String(payload.title || "run").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return "string-" + (title || "run") + ".png";
  }

  function getStartupMode() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      var mode = String(params.get("mode") || "").toLowerCase();
      if (mode === "rush" || mode === "daily") return mode;
    } catch (error) {
      return "";
    }
    return "";
  }

  function startInitialRun() {
    var mode = getStartupMode();
    if (mode === "rush") {
      startRush();
      return;
    }
    if (mode === "daily") {
      startDaily();
      return;
    }
    newBoard();
  }

  function downloadShareDataUrl(imageCanvas, fileName) {
    triggerShareDownload(imageCanvas.toDataURL("image/png"), fileName);
  }

  function canTryNativeImageShare() {
    return Boolean(navigator.share && navigator.canShare && typeof File === "function");
  }

  function shareOrDownloadImage(imageCanvas, fileName, payload) {
    if (!canTryNativeImageShare() || !imageCanvas.toBlob) {
      downloadShareDataUrl(imageCanvas, fileName);
      return;
    }

    imageCanvas.toBlob(function (blob) {
      if (!blob) {
        downloadShareDataUrl(imageCanvas, fileName);
        return;
      }

      try {
        var file = new File([blob], fileName, { type: "image/png" });
        var sharePayload = {
          title: GAME_TITLE,
          text: payload.text,
          files: [file]
        };

        if (!navigator.canShare(sharePayload)) {
          downloadShareDataUrl(imageCanvas, fileName);
          return;
        }

        shareStatusEl.textContent = "Opening PNG share sheet.";
        navigator.share(sharePayload).then(function () {
          shareStatusEl.textContent = "PNG share sheet opened.";
        }).catch(function () {
          shareStatusEl.textContent = "PNG share cancelled.";
        });
      } catch (error) {
        downloadShareDataUrl(imageCanvas, fileName);
      }
    }, "image/png");
  }

  function triggerShareDownload(url, fileName) {
    var link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    shareStatusEl.textContent = "Saved PNG share card.";
  }

  function formatNumber(value) {
    return Math.floor(value).toLocaleString("en-US");
  }

  function formatRunTime(seconds) {
    var whole = Math.max(0, Math.floor(seconds));
    var minutes = Math.floor(whole / 60);
    var rest = whole % 60;
    return minutes + ":" + (rest < 10 ? "0" + rest : String(rest));
  }

  function readBestScore() {
    try {
      return Number(window.localStorage.getItem("neon-lattice-best") || 0);
    } catch (error) {
      return 0;
    }
  }

  function writeBestScore(value) {
    try {
      window.localStorage.setItem("neon-lattice-best", String(value));
    } catch (error) {
      return;
    }
  }

  function readRushBestScore() {
    try {
      return Number(window.localStorage.getItem("neon-lattice-rush-best") || 0);
    } catch (error) {
      return 0;
    }
  }

  function writeRushBestScore(value) {
    try {
      window.localStorage.setItem("neon-lattice-rush-best", String(value));
    } catch (error) {
      return;
    }
  }

  function readDailyBestScore(id) {
    try {
      return Number(window.localStorage.getItem("neon-lattice-daily-best-" + id) || 0);
    } catch (error) {
      return 0;
    }
  }

  function writeDailyBestScore(id, value) {
    try {
      window.localStorage.setItem("neon-lattice-daily-best-" + id, String(value));
    } catch (error) {
      return;
    }
  }

  function readSettings() {
    try {
      var raw = window.localStorage.getItem("neon-lattice-settings");
      var parsed = raw ? JSON.parse(raw) : {};
      return {
        haptics: parsed.haptics !== false,
        fullFx: parsed.fullFx !== false,
        muted: parsed.muted === true,
        musicPalette: normalizeMusicPaletteId(parsed.musicPalette),
        musicGenre: normalizeMusicGenre(parsed.musicGenre),
        musicAuto: parsed.musicAuto !== false
      };
    } catch (error) {
      return { haptics: true, fullFx: true, muted: false, musicPalette: "neon", musicGenre: "electronic", musicAuto: true };
    }
  }

  function writeSettings() {
    try {
      window.localStorage.setItem("neon-lattice-settings", JSON.stringify(settings));
    } catch (error) {
      return;
    }
  }

  function populateMusicPaletteSelect() {
    var reachedSector = Math.floor((campaignSave.unlocked - 1) / 15);
    musicPaletteSelect.innerHTML = "";
    MUSIC_PALETTES.forEach(function (palette) {
      var alwaysOn = palette.id === "neon" || palette.id === "pulse" || palette.id === "arc";
      if (!alwaysOn) {
        var sectorIndex = EPISODE_THEMES.findIndex(function (theme) {
          return theme.palette === palette.id;
        });
        if (sectorIndex < 0 || sectorIndex > reachedSector) return;
      }
      var option = document.createElement("option");
      option.value = palette.id;
      option.textContent = palette.label;
      musicPaletteSelect.appendChild(option);
    });
  }

  // The four genres are always available (genre gates nothing behind progression), so this
  // is a static fill unlike the unlock-gated palette list (music genres seq 9). Fixed order
  // Electronic, Pop, Jazzy, Trip-Hop; labels read from GENRES so the select mirrors the data.
  var MUSIC_GENRE_ORDER = ["electronic", "pop", "jazzy", "triphop"];

  function populateMusicGenreSelect() {
    musicGenreSelect.innerHTML = "";
    MUSIC_GENRE_ORDER.forEach(function (id) {
      var genre = GENRES[id];
      if (!genre) return;
      var option = document.createElement("option");
      option.value = genre.id;
      option.textContent = genre.label;
      musicGenreSelect.appendChild(option);
    });
  }

  function syncSettingsUi() {
    var hapticSupport = getHapticSupportKind();
    hapticsToggle.disabled = !hapticSupport;
    hapticsToggle.checked = Boolean(hapticSupport && settings.haptics);
    hapticsTestButton.disabled = !hapticSupport || !settings.haptics;
    updateHapticsStatus(hapticSupport);
    fullFxToggle.checked = settings.fullFx;
    musicPaletteSelect.value = getManualMusicPalette().id;
    if (musicPaletteSelect.selectedIndex < 0 && musicPaletteSelect.options.length) {
      musicPaletteSelect.selectedIndex = 0;
    }
    musicGenreSelect.value = normalizeMusicGenre(settings.musicGenre);
    musicAutoToggle.checked = settings.musicAuto !== false;
    if (unlockAllButton) {
      unlockAllButton.textContent = campaignSave.unlocked >= campaign.length
        ? "All " + campaign.length + " Levels Unlocked ✓"
        : "Unlock All Levels";
    }
    updateQualityStatus();
  }

  function openSettings() {
    cancelPointerCapture();
    closeMenu();
    closeShareCard();
    closeMap();
    closeStore();
    closeSetlist();
    populateMusicPaletteSelect();
    populateMusicGenreSelect();
    syncSettingsUi();
    settingsPanel.classList.add("is-open");
    settingsPanel.setAttribute("aria-hidden", "false");
  }

  function closeSettings() {
    clearResetProgressArm();
    settingsPanel.classList.remove("is-open");
    settingsPanel.setAttribute("aria-hidden", "true");
  }

  function unlockAllLevels() {
    // Playtest access (Jung 2026-07-06): unlock every campaign level so the Map becomes a full
    // level browser — each map node is tappable once its number <= campaignSave.unlocked. No
    // debug URL needed. Progress-only: never touches scoring, seeds, or Daily determinism.
    campaignSave.unlocked = campaign.length;
    writeCampaignSave();
    updateCampaignMap();
    updateHud();
    if (unlockAllButton) unlockAllButton.textContent = "All " + campaign.length + " Levels Unlocked ✓";
    addCallout("ALL LEVELS UNLOCKED", "#8cff6b", 18);
  }

  function resetLocalProgress() {
    var now = Date.now();
    if (now < resetProgressArmedUntil) {
      wipeLocalProgress();
      return;
    }

    resetProgressArmedUntil = now + 4200;
    resetProgressButton.textContent = "Tap Again To Reset";
    resetProgressButton.classList.add("is-armed");
    if (resetProgressTimer) window.clearTimeout(resetProgressTimer);
    resetProgressTimer = window.setTimeout(clearResetProgressArm, 4200);
  }

  function clearResetProgressArm() {
    resetProgressArmedUntil = 0;
    if (resetProgressTimer) {
      window.clearTimeout(resetProgressTimer);
      resetProgressTimer = 0;
    }
    resetProgressButton.textContent = "Reset Progress";
    resetProgressButton.classList.remove("is-armed");
  }

  function wipeLocalProgress() {
    try {
      window.localStorage.removeItem("neon-lattice-campaign");
      window.localStorage.removeItem("neon-lattice-coach-seen");
      window.localStorage.removeItem("neon-lattice-best");
      window.localStorage.removeItem("neon-lattice-rush-best");
      for (var index = window.localStorage.length - 1; index >= 0; index -= 1) {
        var key = window.localStorage.key(index);
        if (key && key.indexOf("neon-lattice-daily-best-") === 0) {
          window.localStorage.removeItem(key);
        }
      }
      window.location.reload();
    } catch (error) {
      resetProgressArmedUntil = 0;
      resetProgressButton.textContent = "Reset Failed";
      resetProgressButton.classList.remove("is-armed");
      runLater(1100, function () {
        resetProgressButton.textContent = "Reset Progress";
      });
    }
  }

  function isGameplayPaused() {
    return (
      isSplashOpen() ||
      hudSheetOpen ||
      menuPanel.classList.contains("is-open") ||
      mapPanel.classList.contains("is-open") ||
      isSetlistOpen() ||
      isGreenroomOpen() ||
      storePanel.classList.contains("is-open") ||
      sharePanel.classList.contains("is-open") ||
      settingsPanel.classList.contains("is-open")
    );
  }

  function updateHaptics(value) {
    var hapticSupport = getHapticSupportKind();
    if (!hapticSupport) {
      hapticsToggle.checked = false;
      updateHapticsStatus(hapticSupport);
      return;
    }
    settings.haptics = value;
    writeSettings();
    hapticsTestButton.disabled = !value;
    updateHapticsStatus(hapticSupport);
    if (value) vibrate("tap");
  }

  function testHaptics() {
    var hapticSupport = getHapticSupportKind();
    if (!hapticSupport) {
      updateHapticsStatus(hapticSupport);
      return;
    }
    if (!settings.haptics) {
      updateHapticsStatus(hapticSupport);
      return;
    }
    hapticsStatusEl.textContent = vibrate("tap") ? "Pulse sent" : "No pulse";
    runLater(900, function () {
      updateHapticsStatus(getHapticSupportKind());
    });
  }

  function updateHapticsStatus(kind) {
    if (!hapticsStatusEl) return;
    if (!kind) {
      hapticsStatusEl.textContent = "No support";
      return;
    }
    if (kind === "native" && settings.haptics) {
      hapticsStatusEl.textContent = "Native";
      return;
    }
    hapticsStatusEl.textContent = settings.haptics ? "On" : "Off";
  }

  function updateFullFx(value) {
    settings.fullFx = value;
    writeSettings();
    resize();
    updateQualityStatus();
  }

  function updateMusicPalette(id) {
    settings.musicPalette = normalizeMusicPaletteId(id);
    settings.musicAuto = false;
    writeSettings();
    musicAutoToggle.checked = false;
    applyAudioPalette();
    addCallout(getManualMusicPalette().label.toUpperCase(), "#46f4ff", 18);
    updateHud();
  }

  function updateMusicAuto(value) {
    settings.musicAuto = value;
    writeSettings();
    applyAudioPalette();
    addCallout(value ? "TRACK MUSIC" : "MANUAL MUSIC", "#ffd166", 18);
    updateHud();
  }

  function updateMusicGenre(id) {
    // Player-facing genre swap (music genres seq 9). Genre is orthogonal to the palette: it
    // never touches board/score/seed/determinism, so unlike updateMusicPalette it does NOT
    // clear musicAuto. Sector Music keeps rotating palettes WITHIN the chosen genre. Safe
    // mid-level: applyAudioGenre retunes the only persistent nodes (vinyl bed + genre layer),
    // and groove/swing/chords/voices/filter all read getGenre() live on the next step.
    settings.musicGenre = normalizeMusicGenre(id);
    writeSettings();
    applyAudioGenre();
    addCallout(getGenre().label.toUpperCase(), "#7a6bff", 18);
    updateHud();
  }

  function normalizeMusicPaletteId(id) {
    return MUSIC_PALETTES.some(function (palette) {
      return palette.id === id;
    }) ? id : "neon";
  }

  function normalizeMusicGenre(id) {
    // Any non-key falls back to the identity genre so a bad/absent stored value
    // never changes the shipped sound (music genres seq 1).
    return Object.prototype.hasOwnProperty.call(GENRES, id) ? id : "electronic";
  }

  function getGenre() {
    // The one accessor every genre-aware helper reads. Defaults to the identity
    // element (all no-ops) so existing behavior is unchanged until the player picks
    // another. No accessor consumes this yet (music genres seq 1).
    return GENRES[settings && settings.musicGenre] || GENRES.electronic;
  }

  function getMusicPaletteById(id) {
    var normalizedId = normalizeMusicPaletteId(id);
    return MUSIC_PALETTES.find(function (palette) {
      return palette.id === normalizedId;
    }) || MUSIC_PALETTES[0];
  }

  function getManualMusicPalette() {
    return getMusicPaletteById(settings && settings.musicPalette);
  }

  function getActiveMusicPaletteId() {
    // The Daily always plays its canonical track: hash over the whole album,
    // unlock state ignored, no manual swap (synthesis 15).
    if (gameMode === MODE_DAILY) return getDailyPalette(dailyId).id;
    if (settings && settings.musicAuto !== false && gameMode === MODE_CAMPAIGN && currentLevel && currentLevel.musicPalette) {
      return normalizeMusicPaletteId(currentLevel.musicPalette);
    }
    return normalizeMusicPaletteId(settings && settings.musicPalette);
  }

  function getMusicPalette() {
    return getMusicPaletteById(getActiveMusicPaletteId());
  }

  function getActiveGroove() {
    // Genre reskins only the DRUMS and keeps the sector's own bassline, key, and
    // swing (music genres seq 3). Electronic (or any genre with drums unset)
    // returns palette.groove untouched, so every shipped sector groove is
    // byte-for-byte unchanged. A non-electronic genre merges the GENRE_DRUMS
    // kick/snare/hat/kickHi template over the palette's bass + swing.
    var palette = getMusicPalette();
    var g = getGenre();
    if (!g.drums) return palette.groove;
    var dr = GENRE_DRUMS[g.drums];
    return { kick: dr.kick, snare: dr.snare, hat: dr.hat, kickHi: dr.kickHi, bass: palette.groove.bass, swing: palette.groove.swing };
  }

  function getBaseFreq() {
    return getMusicPalette().base || BASE_FREQ;
  }

  function getMusicScale() {
    return getMusicPalette().scale || SCALE;
  }

  function getActiveBpm() {
    // Cap at 138 so 16th-step quantize latency never drops below the scheduler lookahead feel.
    if (gameMode === MODE_CAMPAIGN && currentLevel && currentLevel.modifiers) {
      return Math.min(138, BPM + currentLevel.modifiers.tempoLift + (getMusicPalette().bpmOffset || 0));
    }
    if (gameMode === MODE_DAILY) return Math.min(138, BPM + 2);
    return Math.min(138, BPM);
  }

  function getDelaySeconds() {
    var stepSeconds = (60 / getActiveBpm()) / 4;
    return stepSeconds * (getMusicPalette().delaySteps || AUDIO_TUNING.defaultDelaySteps);
  }

  function scaleDegreeSemitoneIn(scale, index) {
    var length = scale.length;
    var wrapped = ((index % length) + length) % length;
    var octave = Math.floor(index / length);
    return scale[wrapped] + octave * 12;
  }

  function getScaleDegreeSemitone(index) {
    // borrowedChord surprise: while borrowUntilStep is active the whole harmony
    // (pad, bass, motif all route through here) reads the parallel pentatonic on
    // the same root, then home returns. One check borrows every voice together.
    if (audio.surprise.borrowUntilStep && audio.step < audio.surprise.borrowUntilStep) {
      return scaleDegreeSemitoneIn(getParallelPentatonic(getMusicScale()), index);
    }
    return scaleDegreeSemitoneIn(getGenreScale(), index);
  }

  function getParallelPentatonic(scale) {
    // borrowedPad surprise: the parallel pentatonic on the same root.
    // MIN<->MAJ, SUS<->RIT, MAN->MIN; anything unrecognized borrows the minor.
    var key = scale.join(",");
    if (key === PENT_MIN.join(",")) return PENT_MAJ;
    if (key === PENT_MAJ.join(",")) return PENT_MIN;
    if (key === PENT_SUS.join(",")) return PENT_RIT;
    if (key === PENT_RIT.join(",")) return PENT_SUS;
    return PENT_MIN;
  }

  function getGenreScale() {
    // Bright-scale bias (music genres seq 2, pop): a genre with preferBrightScale lifts a
    // dark sector (minor / "man" pentatonic) to its parallel major on the same root, so the
    // whole track reads brighter and more radio. getScaleDegreeSemitone routes pad, bass,
    // motif, and every harmony read through here, so one wrap re-keys them together. Value
    // comparison (not reference ===) because some palettes inline the scale literal instead
    // of the PENT_ constant. Electronic/jazz/trip-hop leave the sector scale untouched.
    var scale = getMusicScale();
    var g = getGenre();
    if (g.preferBrightScale) {
      var key = scale.join(",");
      if (key === PENT_MIN.join(",") || key === PENT_MAN.join(",")) return getParallelPentatonic(scale);
    }
    return scale;
  }

  function getBridgeProgression(palette) {
    // Bridge chord order: optional palette.progressionB, else a motifRotate-style
    // rotation of the home progression by 2 (same chords, a variation order).
    // Both draw from the same pentatonic, so a bridge re-voices without changing key.
    // Jazz-only (music genres seq 7): inside the already-seeded, campaign-only bridge
    // window, walk a ii-V-I turnaround instead. jazzTurnaround holds scale-degree ROOT
    // indices (1=supertonic, 3=dominant fifth, 0=tonic), so every root resolves through
    // getScaleDegreeSemitone and stays in the sector's key. On a major-pentatonic sector
    // 1->3->0 is a textbook ii-V-I; on a minor sector it is a dominant->tonic resolution.
    // The pad, bass, and motif all read getHarmonyRootIndex, so they follow the turnaround
    // together. Length 4 divides the 8-bar bridge into two clean cycles, the bridge gate is
    // already seeded per section, and genre never touches the board/score/seed, so a long
    // jazz take occasionally walks a turnaround with full determinism and no change to the
    // sector's home progression. Electronic/pop/trip-hop keep the shipped rotation below.
    if (getGenre().id === "jazzy") return AUDIO_TUNING.jazzTurnaround;
    if (palette.progressionB) return palette.progressionB;
    var prog = palette.progression || [0, 3, 4, 2];
    var shift = prog.length ? 2 % prog.length : 0;
    return prog.slice(shift).concat(prog.slice(0, shift));
  }

  function getSectionState(step) {
    // Seeded bridge sections (Music Variety item 7): the level divides into
    // sectionBars-long sections. At each section boundary a level-seeded roll (like
    // computeLevelMotif, keyed on id/seed) decides whether the first bridgeBars of that
    // section open as a bridge. Seeded per section index, so a take is reproducible and
    // never turns chaotic under random event timing (ghost/Daily determinism intact).
    // Read-only harmony: no audio nodes, so nothing to disconnect.
    var bar = Math.floor(Math.max(0, step || 0) / 16);
    var sectionIndex = Math.floor(bar / AUDIO_TUNING.sectionBars);
    var id = (currentLevel && currentLevel.id) || 0;
    var seed = (currentLevel && currentLevel.seed) || 0;
    var cache = audio.sectionCache;
    var key = id + ":" + seed + ":" + sectionIndex;
    if (!cache || cache.key !== key) {
      var rng = createSeededRandom(hashString("neon-lattice-section:" + id + ":" + seed + ":" + sectionIndex));
      cache = audio.sectionCache = { key: key, bridgeRoll: rng() < AUDIO_TUNING.sectionBridgeChance };
    }
    // Section 0 always states the home progression (the track establishes itself);
    // bridges open only at later section boundaries, so a long session unfolds.
    var barInSection = bar - sectionIndex * AUDIO_TUNING.sectionBars;
    // Bridges are campaign-only: Rush/Daily open on a hard, unmodified groove and
    // never get the matching level-clear tail, so they stay on the home progression.
    var bridge = gameMode === MODE_CAMPAIGN && sectionIndex > 0 && cache.bridgeRoll && barInSection < AUDIO_TUNING.bridgeBars;
    return { bridge: bridge, sectionIndex: sectionIndex };
  }

  function getHarmonyStepsPerChord(step) {
    // Temporary phrase-length overrides on the 32-step norm: the doubleHarmony
    // surprise halves the chord length for one phrase; the half-time feel
    // doubles it (the same mechanism, inverted); a seeded bridge section runs a
    // faster harmonic rhythm (harmonicRhythmBridge) for its bridgeBars.
    var override = audio.surprise.harmony;
    if (override && step < override.untilStep) return override.steps;
    if (audio.director.grooveOverride) return AUDIO_TUNING.halfHarmonySteps;
    if (getSectionState(step).bridge) return AUDIO_TUNING.harmonicRhythmBridge;
    return 32;
  }

  function getHarmonyRootIndex(step) {
    var palette = getMusicPalette();
    // In a seeded bridge the roots walk the variation order (progressionB); otherwise
    // the home progression. The director, motif, and surprise systems all read this,
    // so they follow the bridge with no extra wiring; both orders stay in-scale.
    var progression = getSectionState(step).bridge
      ? getBridgeProgression(palette)
      : (palette.progression || [0, 3, 4, 2]);
    var phrase = Math.floor(Math.max(0, step || 0) / getHarmonyStepsPerChord(step));
    return progression[phrase % progression.length];
  }

  function getHarmonyToneFreq(step, degreeOffset, octave) {
    var semitone = getScaleDegreeSemitone(getHarmonyRootIndex(step) + (degreeOffset || 0)) + (octave || 0) * 12;
    return getBaseFreq() * Math.pow(2, semitone / 12);
  }

  function getPadChordDegrees() {
    return energy > 0.58 ? [0, 2, 3, 5] : [0, 2, 3];
  }

  function getChordDegrees() {
    // Genre chord vocabulary (music genres seq 2). Routes the pad/comp voicing through the
    // genre's scale-degree stack; every degree stays a pentatonic offset, so it reads through
    // getScaleDegreeSemitone and stays consonant on any 16th. Electronic returns the shipped
    // triad -> add-degree stack unchanged. Pop [0,2,4]/[0,2,4,6] is a fuller 6/9; jazz
    // [0,2,4,6]/[0,2,4,6,8] stacks a 7th/9th in-scale; trip-hop [0,2]/[0,2,4] leaves space.
    var g = getGenre();
    if (!g.chordDegrees) return getPadChordDegrees();
    return energy > 0.58 ? g.chordDegrees.high : g.chordDegrees.low;
  }

  function getWalkingBassDegree(step) {
    // Jazz walking bass (music genres seq 2): a quarter-note walk that lands the chord root on
    // beat 1 and steps toward the next chord's root across the bar. Returns a scale-degree
    // index, so it resolves through getScaleDegreeSemitone and every walk note stays in-key.
    var stepsPerChord = getHarmonyStepsPerChord(step);
    var beatsPerChord = Math.max(1, stepsPerChord / 4);
    var beat = Math.floor((step % stepsPerChord) / 4);
    var thisRoot = getHarmonyRootIndex(step);
    if (beat === 0) return thisRoot; // beat 1 lands home
    var nextRoot = getHarmonyRootIndex(step + stepsPerChord);
    return Math.round(thisRoot + (nextRoot - thisRoot) * (beat / beatsPerChord)); // walk toward the next root
  }

  // Call-and-response phrase machine: the front half of each phraseBars window
  // is the band's call (motif at full gain), the back half is the player's
  // response (motif ducked, player tones boosted).
  function getPhraseBar(step) {
    return Math.floor(Math.max(0, step || 0) / 16) % AUDIO_TUNING.phraseBars;
  }

  function isResponsePhrase(step) {
    return getPhraseBar(step) >= AUDIO_TUNING.phraseBars / 2;
  }

  function getResponseBoost() {
    // Player tones ring louder over the ducked band; callers clamp under existing caps.
    return isResponsePhrase(audio.step) ? AUDIO_TUNING.responseBoost : 1;
  }

  // Motif grammar: every track owns a hook (palette.motif, the prime form).
  // Operators are pure transforms on {deg, dur, register}; each campaign level
  // hears a seed-derived variant of its track's hook, the sector reveal plays
  // the prime form, and level 15 reprises the prime an octave up.
  var MOTIF_OPS = {
    "T1": function (m) { return motifTranspose(m, 1); },
    "T-1": function (m) { return motifTranspose(m, -1); },
    "T2": function (m) { return motifTranspose(m, 2); },
    "T-2": function (m) { return motifTranspose(m, -2); },
    "T3": function (m) { return motifTranspose(m, 3); },
    "I2": function (m) { return motifInvert(m, 2); },
    "R": motifRetrograde,
    "A2": function (m) { return motifStretch(m, 2); },
    "D2O1": function (m) { return motifOctave(motifStretch(m, 0.5), 1); }, // diminish then lift: urgency without noise
    "Rot1": function (m) { return motifRotate(m, 1); },
    "Rot2": function (m) { return motifRotate(m, 2); },
    "O1": function (m) { return motifOctave(m, 1); }
  };
  var MOTIF_TENSION_POOLS = {
    calm: ["A2", "Rot1", "T-2"],
    neutral: ["T1", "T-1", "T2", "Rot2", "R"],
    urgent: ["D2O1", "I2", "T3"]
  };

  function normalizeMotif(motif) {
    return { deg: motif.deg.slice(), dur: motif.dur.slice(), register: motif.register || 1 };
  }

  function motifTranspose(m, n) {
    var out = normalizeMotif(m);
    out.deg = out.deg.map(function (d) { return d + n; });
    return out;
  }

  function motifInvert(m, axis) {
    var out = normalizeMotif(m);
    out.deg = out.deg.map(function (d) { return axis * 2 - d; });
    return out;
  }

  function motifRetrograde(m) {
    var out = normalizeMotif(m);
    out.deg.reverse();
    out.dur.reverse();
    return out;
  }

  function motifStretch(m, k) {
    var out = normalizeMotif(m);
    out.dur = out.dur.map(function (d) { return Math.max(1, Math.round(d * k)); });
    return out;
  }

  function motifRotate(m, n) {
    // Degrees rotate against a fixed rhythm; rotating both arrays together
    // would only phase-shift the loop and sound identical once it cycles.
    var out = normalizeMotif(m);
    var shift = ((n % out.deg.length) + out.deg.length) % out.deg.length;
    out.deg = out.deg.slice(shift).concat(out.deg.slice(0, shift));
    return out;
  }

  function motifOctave(m, n) {
    var out = normalizeMotif(m);
    out.register += n;
    return out;
  }

  function clampMotifDegrees(m) {
    m.deg = m.deg.map(function (d) {
      return Math.max(AUDIO_TUNING.motifDegreeMin, Math.min(AUDIO_TUNING.motifDegreeMax, d));
    });
    return m;
  }

  function isMotifIdentity(a, b) {
    return a.register === b.register && a.deg.join(",") === b.deg.join(",") && a.dur.join(",") === b.dur.join(",");
  }

  function getTrackMotif() {
    return getMusicPalette().motif || MUSIC_PALETTES[0].motif;
  }

  function getMotifSpan(motif) {
    var span = 0;
    for (var i = 0; i < motif.dur.length; i += 1) span += motif.dur[i];
    return Math.max(1, span);
  }

  function getMotifNoteAt(motif, pos) {
    // Note index whose onset (in 16th steps within the motif span) equals pos, or -1.
    var onset = 0;
    for (var i = 0; i < motif.dur.length; i += 1) {
      if (onset === pos) return i;
      onset += motif.dur[i];
      if (onset > pos) return -1;
    }
    return -1;
  }

  function computeLevelMotif(level) {
    var prime = normalizeMotif(getTrackMotif());
    var chapter = ((level.id - 1) % 15) + 1;
    if (chapter === 15) {
      // Track finale reprises the prime form an octave up: the hook returns.
      return { ops: ["O1"], motif: clampMotifDegrees(MOTIF_OPS.O1(prime)) };
    }
    var tier = chapter <= 5 ? 0 : chapter <= 10 ? 1 : 2;
    var tension = tier; // difficulty tier only: live director arousal would change the pool per take
    var pool = tension >= AUDIO_TUNING.motifTensionUrgentMin
      ? MOTIF_TENSION_POOLS.urgent
      : tension < AUDIO_TUNING.motifTensionCalmMax
        ? MOTIF_TENSION_POOLS.calm
        : MOTIF_TENSION_POOLS.neutral;
    // Level seed only (no attempt): a level hums the same variant on every take.
    var rng = createSeededRandom(hashString("neon-lattice-motif:" + level.id + ":" + level.seed));
    for (var attempt = 0; attempt < 6; attempt += 1) {
      var count = 1 + Math.floor(rng() * AUDIO_TUNING.motifOpsMax);
      var ops = [];
      for (var pick = 0; pick < 12 && ops.length < count; pick += 1) {
        var id = pool[Math.floor(rng() * pool.length)];
        if (ops.indexOf(id) === -1) ops.push(id);
      }
      var variant = prime;
      for (var o = 0; o < ops.length; o += 1) variant = MOTIF_OPS[ops[o]](variant);
      variant = clampMotifDegrees(variant);
      if (!isMotifIdentity(variant, prime)) return { ops: ops, motif: variant };
    }
    return { ops: ["T1"], motif: clampMotifDegrees(MOTIF_OPS.T1(prime)) };
  }

  function computeLevelDrift(level) {
    // Felt-not-heard per-level timbre color. Keyed off the level seed only (like
    // computeLevelMotif), so a level drifts identically on every take (ghost/Daily
    // determinism intact) without touching sector identity. Each field is a tight
    // symmetric range from AUDIO_TUNING. detuneCents/cutoffMul/feedbackNudge color the
    // primitive now; filtEnvOctaveBias/voiceBias are stored for the voice engine (seq 4).
    var rng = createSeededRandom(hashString("neon-lattice-drift:" + level.id + ":" + level.seed));
    return {
      detuneCents: (rng() * 2 - 1) * AUDIO_TUNING.driftDetuneCents,
      cutoffMul: (rng() * 2 - 1) * AUDIO_TUNING.driftCutoffMul,
      feedbackNudge: (rng() * 2 - 1) * AUDIO_TUNING.driftFeedbackNudge,
      filtEnvOctaveBias: (rng() * 2 - 1) * AUDIO_TUNING.driftFiltEnvOctaves,
      voiceBias: (rng() * 2 - 1) * AUDIO_TUNING.driftVoiceBias
    };
  }

  function applyAudioPalette() {
    if (!audio.ctx || !audio.delay || !audio.feedback || !audio.wet) return;
    var palette = getMusicPalette();
    audio.wet.gain.setTargetAtTime(palette.delayBase, audio.ctx.currentTime, 0.08);
    audio.feedback.gain.setTargetAtTime(palette.feedbackBase, audio.ctx.currentTime, 0.08);
    audio.delay.delayTime.setTargetAtTime(getDelaySeconds(), audio.ctx.currentTime, AUDIO_TUNING.delayGlide);
    trimAudioLayers(8);
  }

  function nextMutationBar(rng, fromBar) {
    var span = AUDIO_TUNING.mutateBarsMax - AUDIO_TUNING.mutateBarsMin;
    return fromBar + AUDIO_TUNING.mutateBarsMin + Math.floor(rng() * (span + 1));
  }

  function resetMusicPhrase() {
    // Phase-continuous hand-off (Jung's "remove the seam"): when the groove is already
    // running and the next level is the SAME track (same palette/key, no sector reveal),
    // carry the beat clock instead of snapping it to 0. Harmony, polyloop phase, and the bar
    // grid all read audio.step, so keeping it running flows the groove across the boundary
    // with no rhythmic/harmonic restart -- only the per-level motif (set in startLevel)
    // changes. Palette match is the signal: a track boundary or a replay of a track's first
    // level carries a different palette and correctly falls back to a step-0 reset.
    var phaseContinuous = AUDIO_TUNING.continuousGroove
      && gameMode === MODE_CAMPAIGN
      && audio.started && audio.ctx
      && !willStartSectorReveal()
      && audio.lastPaletteId != null
      && audio.lastPaletteId === getActiveMusicPaletteId();
    audio.lastPaletteId = gameMode === MODE_CAMPAIGN ? getActiveMusicPaletteId() : null;
    // Energy carry (increment 3): a continuous hand-off opens the next level at the energy this
    // session was ending on, then eases it down (getCampaignArrangement). A reset clears the
    // carry so a new track / mode starts from its own opening floor.
    if (phaseContinuous) {
      audio.carryFloor = audio.lastArrangeFloor;
      audio.carryFloorStep = audio.step;
    } else {
      audio.carryFloor = 0;
    }
    if (!phaseContinuous) audio.step = 0;
    audio.climaxStep = -1;
    audio.revealUntilStep = 0;
    audio.gateState = { snare: false, hat: false, hat16: false, bass: false, kickHi: false };
    // Layer-growth meter/callouts re-arm with the step clock: clear the latch and
    // pip state so the next take announces its voices fresh.
    bandLatch = {};
    bandActive = [];
    bandPop = [];
    bandsPrimed = false;
    audio.failRamp = null;
    audio.phrase = { topDegree: null, callShift: 0 };
    // Per-level timbre drift defaults to zero; the campaign level-start overwrites it
    // with computeLevelDrift. Rush/Daily (no currentLevel) stay neutral.
    audio.levelDrift = { detuneCents: 0, cutoffMul: 0, feedbackNudge: 0, filtEnvOctaveBias: 0, voiceBias: 0 };
    // Habituation clock: jittered from the level seed so surface mutations
    // never land on a fixed schedule (Rush/Daily fall back to Math.random).
    var mutateRng = gameMode === MODE_CAMPAIGN && currentLevel
      ? createSeededRandom(hashString("neon-lattice-mutate:" + currentLevel.id + ":" + currentLevel.seed))
      : Math.random;
    // In a phase-continuous hand-off the bar clock keeps running, so schedule the next
    // habituation mutation relative to the current bar (bar 0 on a normal step-0 reset).
    audio.mutation = { rng: mutateRng, nextBar: nextMutationBar(mutateRng, phaseContinuous ? Math.floor(audio.step / 16) : 0), hatPattern: null, delayWetOffset: 0, log: [] };
    // Iso principle: open every take at the player's estimated arousal, then
    // tickDirector slews it toward the music state bar by bar.
    // Keep the director's arousal slewing across a continuous hand-off (don't snap it back to
    // the iso-open) so the mix energy carries with the floor instead of re-opening cold.
    if (!phaseContinuous) audio.director.currentArousal = audio.director.playerArousal;
    audio.director.bias = 0;
    audio.director.recoveryUntilStep = 0;
    audio.director.grooveOverride = null;
    // Surprise budget rides the session; staged overrides and the spend gap
    // reset because the step clock re-anchors to 0.
    audio.surprise.lastSpendBar = -999;
    audio.surprise.lastProgress = 0;
    audio.surprise.scaleOverride = null;
    audio.surprise.padDegrees = null;
    audio.surprise.harmony = null;
    audio.surprise.borrowUntilStep = 0;
    // Section memo re-anchors with the step clock; the seeded roll recomputes per
    // section index, so a replayed level plays the identical bridge form.
    audio.sectionCache = null;
    audio.layers = [];
    // Re-anchor the scheduler so every mode opens at step 0 on the tonic -- but NOT on a
    // phase-continuous hand-off, where the running scheduler already holds the beat grid.
    if (audio.ctx && !phaseContinuous) audio.nextStepTime = audio.ctx.currentTime + 0.05;
    // Restore the arrangement bus after a level-clear tail. On a new-sector entry the
    // reveal hold is the intro, so snap the bed back to full and let the hold ramp the
    // groove. Otherwise open a musical bridge: hold the groove out for bridgeIntroBars
    // while the bed swells from transitionFadeInStart under a per-palette pad+lead cadence.
    audio.bridgeUntilStep = 0;
    if (audio.ctx && audio.bed) {
      var bedNow = audio.ctx.currentTime;
      audio.bed.gain.cancelScheduledValues(bedNow);
      // Restore the drum/impact bus the level-clear tail ducked, so the groove that
      // re-enters on the bridge downbeat lands at full weight (kick = the payoff).
      if (audio.impact) {
        audio.impact.gain.cancelScheduledValues(bedNow);
        audio.impact.gain.setValueAtTime(audio.muted ? 0 : audio.volume * AUDIO_TUNING.impactLevel, bedNow);
      }
      // Campaign-only bridge: Rush/Daily never get the level-clear tail this swells up
      // from, so snap the bed to full and start hard. A new-sector reveal (its own intro
      // hold) also snaps; so does continuousGroove (the groove already ran unbroken through
      // the win, so keep the bed at full and let the next level re-anchor under it — no
      // drum-free bridge). Otherwise run the bridge hand-off (scheduleStep bridge branch).
      if (gameMode !== MODE_CAMPAIGN || willStartSectorReveal() || AUDIO_TUNING.continuousGroove) {
        audio.bed.gain.setValueAtTime(1, bedNow);
      } else {
        audio.bridgeUntilStep = AUDIO_TUNING.bridgeIntroBars * 16;
        audio.bed.gain.setValueAtTime(AUDIO_TUNING.transitionFadeInStart, bedNow);
        audio.bed.gain.linearRampToValueAtTime(1, bedNow + ((60 / getActiveBpm()) / 4) * 16 * AUDIO_TUNING.bridgeIntroBars);
      }
    }
  }

  function fxScale() {
    var base = settings.fullFx ? 1 : 0.42;
    return base * getAdaptiveFxMultiplier();
  }

  function bumpShake(amount) {
    screenShake = Math.min(1, screenShake + amount * fxScale());
  }

  function getAdaptiveFxMultiplier() {
    if (frameQuality.level === 0) return 1;
    if (frameQuality.level === 1) return 0.55;
    return 0.32;
  }

  function glowBlur(value) {
    if (!settings.fullFx) return 0;
    if (frameQuality.level === 1) return value * 0.48;
    if (frameQuality.level >= 2) return value * 0.16;
    return value;
  }

  // Single gate for the additive glow detail passes: auto quality AND the Full FX
  // setting. Lean mode (fullFx off) must strip glow overdraw even at 60fps.
  function neonDetail() {
    return frameQuality.level < 2 && settings.fullFx;
  }

  // Strokes the current path twice (halo + core) without allocating a closure.
  // Hot per-frame paths should build the path inline and call this directly.
  function strokeNeonPath(color, coreWidth) {
    ctx.strokeStyle = color;
    if (neonDetail()) {
      var baseAlpha = ctx.globalAlpha;
      ctx.globalAlpha = baseAlpha * 0.22;
      ctx.lineWidth = coreWidth * 3.5;
      ctx.stroke();
      ctx.globalAlpha = baseAlpha;
    }
    ctx.lineWidth = coreWidth;
    ctx.stroke();
  }

  function strokeNeon(drawPath, color, coreWidth) {
    drawPath();
    strokeNeonPath(color, coreWidth);
  }

  function updateFrameQuality(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    var instantFps = Math.min(60, 1 / dt);
    frameQuality.smoothedFps += (instantFps - frameQuality.smoothedFps) * 0.045;
    frameQuality.cooldown = Math.max(0, frameQuality.cooldown - dt);

    if (isGameplayPaused()) return;

    if (frameQuality.smoothedFps < 50) {
      frameQuality.lowTimer += dt;
      frameQuality.highTimer = 0;
    } else if (frameQuality.smoothedFps > 58) {
      frameQuality.highTimer += dt;
      frameQuality.lowTimer = 0;
    } else {
      frameQuality.lowTimer = Math.max(0, frameQuality.lowTimer - dt * 0.5);
      frameQuality.highTimer = Math.max(0, frameQuality.highTimer - dt * 0.5);
    }

    if (frameQuality.lowTimer >= 0.75 && frameQuality.level < 2 && frameQuality.cooldown <= 0) {
      setFrameQuality(frameQuality.level + 1);
      frameQuality.lowTimer = 0;
      frameQuality.cooldown = 2.2;
      return;
    }

    if (frameQuality.highTimer >= 7 && frameQuality.level > 0 && frameQuality.cooldown <= 0) {
      setFrameQuality(frameQuality.level - 1);
      frameQuality.highTimer = 0;
      frameQuality.cooldown = 3.5;
    }
  }

  function setFrameQuality(level) {
    var next = Math.max(0, Math.min(2, level));
    if (next === frameQuality.level) return;
    frameQuality.level = next;
    trimEffects();
    resize();
    updateQualityStatus();
  }

  function getFrameQualityLabel() {
    if (!settings.fullFx) return "Manual Low";
    if (frameQuality.level === 0) return "Full";
    if (frameQuality.level === 1) return "Balanced";
    return "Lean";
  }

  function updateQualityStatus() {
    if (!qualityStatusEl) return;
    qualityStatusEl.textContent = getFrameQualityLabel();
  }

  function getHapticSupportKind() {
    var bridge = getNativeHapticsBridge();
    if (bridge) return "native";
    if (hasWebHaptics()) return "web";
    return "";
  }

  function hasWebHaptics() {
    return Boolean(navigator && typeof navigator.vibrate === "function");
  }

  function getNativeHapticsBridge() {
    if (window.NeonLatticeHaptics && (
      typeof window.NeonLatticeHaptics.vibrate === "function" ||
      typeof window.NeonLatticeHaptics.postMessage === "function" ||
      typeof window.NeonLatticeHaptics.impact === "function" ||
      typeof window.NeonLatticeHaptics.selection === "function" ||
      typeof window.NeonLatticeHaptics.notification === "function"
    )) {
      return window.NeonLatticeHaptics;
    }
    if (window.webkit && window.webkit.messageHandlers) {
      return (
        window.webkit.messageHandlers.neonLatticeHaptics ||
        window.webkit.messageHandlers.neonHaptics ||
        window.webkit.messageHandlers.haptics ||
        window.webkit.messageHandlers.hapticFeedback ||
        window.webkit.messageHandlers.vibration ||
        null
      );
    }
    return null;
  }

  function getNativeHapticStyle(kind) {
    if (kind === "tap" || kind === "swap") return "selection";
    if (kind === "reject" || kind === "warning") return "warning";
    if (kind === "win") return "success";
    if (kind === "fail") return "error";
    if (kind === "special" || kind === "overdrive") return "heavy";
    return "light";
  }

  function triggerNativeHaptic(kind, pattern) {
    var bridge = getNativeHapticsBridge();
    if (!bridge) return false;
    var style = getNativeHapticStyle(kind);
    try {
      if (typeof bridge.vibrate === "function") {
        bridge.vibrate(kind, pattern, style);
        return true;
      }
      if (typeof bridge.selection === "function" && style === "selection") {
        bridge.selection();
        return true;
      }
      if (typeof bridge.notification === "function" && (style === "success" || style === "warning" || style === "error")) {
        bridge.notification(style);
        return true;
      }
      if (typeof bridge.impact === "function") {
        bridge.impact(style === "heavy" || style === "light" ? style : "medium");
        return true;
      }
      if (typeof bridge.postMessage === "function") {
        bridge.postMessage({ kind: kind, pattern: pattern, style: style });
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }

  function vibrate(kind) {
    if (!settings.haptics) return false;
    var patterns = {
      tap: 8,
      swap: 10,
      reject: [18, 24, 18],
      match: 16,
      special: [18, 28, 26],
      overdrive: [22, 30, 42],
      win: [22, 36, 60],
      warning: [28, 42, 28],
      fail: [34, 28, 34]
    };
    var pattern = patterns[kind] || 10;
    if (triggerNativeHaptic(kind, pattern)) return true;
    if (navigator && typeof navigator.vibrate === "function") {
      try {
        return navigator.vibrate(pattern) !== false;
      } catch (error) {
        return false;
      }
    }
    return false;
  }

  function updatePulseBestScore() {
    if (gameMode === MODE_DAILY) {
      // Rehearsal runs never touch the record: only the three scored takes count.
      if (!isDailyRehearsal() && score > dailyBestScore) {
        dailyNewBest = true;
        dailyBestScore = score;
        writeDailyBestScore(dailyId, dailyBestScore);
      }
      return dailyBestScore;
    }

    if (score > rushBestScore) {
      rushNewBest = true;
      rushBestScore = score;
      writeRushBestScore(rushBestScore);
    }
    return rushBestScore;
  }

  function hasPulseNewBest() {
    return gameMode === MODE_DAILY ? dailyNewBest : rushNewBest;
  }

  function getDailyId(date) {
    var now = date || new Date();
    return String(now.getFullYear()) + pad2(now.getMonth() + 1) + pad2(now.getDate());
  }

  function getWeeklyEventId(date) {
    return getDailyId(getWeekStartDate(date || new Date()));
  }

  function getWeekStartDate(date) {
    var local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    var offset = (local.getDay() + 6) % 7;
    return new Date(local.getFullYear(), local.getMonth(), local.getDate() - offset);
  }

  function isNextDailyId(previousId, nextId) {
    var previous = dailyIdToDate(previousId);
    var next = dailyIdToDate(nextId);
    if (!previous || !next) return false;
    var nextExpected = new Date(previous.getFullYear(), previous.getMonth(), previous.getDate() + 1);
    return getDailyId(nextExpected) === getDailyId(next);
  }

  function dailyIdToDate(id) {
    var text = String(id || "");
    if (!/^\d{8}$/.test(text)) return null;
    var year = Number(text.slice(0, 4));
    var month = Number(text.slice(4, 6)) - 1;
    var day = Number(text.slice(6, 8));
    return new Date(year, month, day);
  }

  function formatDailyId(id) {
    return id.slice(4, 6) + "/" + id.slice(6, 8);
  }

  function pad2(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function hashString(text) {
    var hash = 2166136261;
    for (var i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function createSeededRandom(seed) {
    var state = seed >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) >>> 0;
      var t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getMeterFill() {
    return isPulseMode() ? pulse : drive;
  }

  function getPulseDangerAmount() {
    if (!isPulseMode() || levelState !== "playing") return 0;
    return Math.max(0, Math.min(1, (0.34 - pulse) / 0.34));
  }

  function isMeterHot() {
    if (isPulseMode()) return pulse >= 0.98 || drive >= OVERDRIVE_THRESHOLD;
    return drive >= OVERDRIVE_THRESHOLD;
  }

  function getVisualDrive() {
    if (isPulseMode()) return Math.max(drive, pulse * 0.72);
    return drive;
  }

  function draw(now) {
    var time = now / 1000;
    var rawDt = Math.max(0.001, time - lastTime || 0.016);
    var dt = Math.min(0.033, rawDt);
    lastTime = time;
    updateFrameQuality(rawDt);
    update(dt);
    render(time);
    window.requestAnimationFrame(draw);
  }

  function update(dt) {
    if (hitStop > 0) {
      hitStop -= dt;
      dt *= 0.12;
    }
    if (isGameplayPaused()) {
      beatPulse = Math.max(0, beatPulse - dt * 3.8);
      overdrivePulse = Math.max(0, overdrivePulse - dt * 2.6);
      overdriveExitPulse = Math.max(0, overdriveExitPulse - dt * 2.4);
      flash = Math.max(0, flash - dt * 1.8);
      screenShake = Math.max(0, screenShake - dt * 2.35);
      return;
    }

    // Waveform artifact bar clock: only live play advances the take, so
    // overlay pauses (checklist: overlays pause gameplay timers) never
    // stretch the strip.
    if (levelState === "playing") levelStats.takeSeconds += dt;

    energy = Math.max(0.1, energy - dt * 0.035);
    updateDirectorEmas(dt);
    drive = Math.max(0, drive - dt * (drive >= 0.72 ? 0.028 : 0.018));
    rushSurgeCooldown = Math.max(0, rushSurgeCooldown - dt);
    beatGateAnim = Math.min(1, beatGateAnim + dt * 5.5);
    beatGateFlash = Math.max(0, beatGateFlash - dt * 3.2);
    beatPulse = Math.max(0, beatPulse - dt * 3.8);
    overdrivePulse = Math.max(0, overdrivePulse - dt * 2.6);
    flash = Math.max(0, flash - dt * 1.8);
    novaWarpPulse = Math.max(0, novaWarpPulse - dt * 2.2);
    screenShake = Math.max(0, screenShake - dt * 2.35);
    updateArmedSpecial();
    updateSwapHint(dt);
    updateInputWatchdog(dt);
    updateFuseState();

    if (isPulseMode()) {
      if (levelState === "playing") {
        rushSeconds += dt;
        var drain = RUSH_DRAIN_BASE + Math.min(0.052, rushSeconds * RUSH_DRAIN_GROWTH) + Math.min(0.028, score / 260000);
        var actionScale = animating ? 0.45 : 1;
        var overdriveScale = drive >= OVERDRIVE_THRESHOLD ? 0.68 : 1;
        pulse = Math.max(0, pulse - dt * drain * actionScale * overdriveScale);
        if (pulse <= 0.24 && !rushCritical) {
          rushCritical = true;
          addCallout("PULSE LOW", "#ff5e7a", 20);
          playRushWarning();
          vibrate("warning");
        }
        if (pulse > 0.4) rushCritical = false;
        if (pulse <= 0) endRush();
      }
      hudClock += dt;
      if (hudClock >= 0.12) {
        hudClock = 0;
        updateHud();
      }
    }

    // Drive-meter hot edge: enter fires inside triggerOverdrive, so here we only
    // catch the drop back to normal so the OVERDRIVE badge exits with a matching
    // cool-down cue. Guarded on play so a fail/end drive-reset never mis-fires it.
    var meterHotNow = isMeterHot();
    if (meterHotActive && !meterHotNow && levelState === "playing") triggerOverdriveExit();
    meterHotActive = meterHotNow;
    overdriveExitPulse = Math.max(0, overdriveExitPulse - dt * 2.4);

    forEachGem(function (gem) {
      gem.x += (gem.tx - gem.x) * Math.min(1, dt * MOTION.gemLerp);
      gem.y += (gem.ty - gem.y) * Math.min(1, dt * MOTION.gemLerp);
      gem.scale += (1 - gem.scale) * Math.min(1, dt * MOTION.scaleLerp);
      gem.pop = Math.max(0, gem.pop - dt * 2.8);
      gem.birth = Math.max(0, (gem.birth || 0) - dt * 4.4);
      gem.trail = Math.max(0, (gem.trail || 0) - dt * 2.8);
      gem.spin += dt * (0.4 + energy * 0.8);
    });

    for (var i = particles.length - 1; i >= 0; i -= 1) {
      var p = particles[i];
      if (p.delay > 0) {
        p.delay -= dt;
        continue;
      }
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.ember) {
        p.vy += 420 * dt;
        p.vx *= Math.pow(0.4, dt);
        p.vy *= Math.pow(0.75, dt);
      } else if (p.line) {
        p.vx *= Math.pow(0.03, dt);
        p.vy *= Math.pow(0.03, dt);
      } else {
        p.vx *= Math.pow(0.1, dt);
        p.vy *= Math.pow(0.1, dt);
      }
      if (Number.isFinite(p.rotation)) p.rotation += (p.spin || 0) * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (var k = beams.length - 1; k >= 0; k -= 1) {
      var beam = beams[k];
      if (beam.delay > 0) {
        beam.delay -= dt;
        continue;
      }
      beam.life -= dt;
      beam.width += dt * view.cell * 0.8;
      if (beam.life <= 0) beams.splice(k, 1);
    }

    for (var cf = cellFlashes.length - 1; cf >= 0; cf -= 1) {
      cellFlashes[cf].life -= dt;
      if (cellFlashes[cf].life <= 0) cellFlashes.splice(cf, 1);
    }

    for (var r = rays.length - 1; r >= 0; r -= 1) {
      var ray = rays[r];
      ray.life -= dt;
      ray.length += ray.speed * dt;
      if (ray.life <= 0) rays.splice(r, 1);
    }

    for (var s = shockwaves.length - 1; s >= 0; s -= 1) {
      var shockwave = shockwaves[s];
      if (shockwave.delay > 0) {
        shockwave.delay -= dt;
        continue;
      }
      shockwave.life -= dt;
      var progress = 1 - Math.max(0, shockwave.life / shockwave.ttl);
      var eased = 1 - Math.pow(1 - progress, 2);
      shockwave.radius = shockwave.startRadius + (shockwave.maxRadius - shockwave.startRadius) * eased;
      if (shockwave.life <= 0) shockwaves.splice(s, 1);
    }

    for (var f = floaters.length - 1; f >= 0; f -= 1) {
      var floater = floaters[f];
      floater.life -= dt;
      floater.x += floater.vx * dt;
      floater.y += floater.vy * dt;
      floater.vx *= Math.pow(0.35, dt);
      floater.vy *= Math.pow(0.18, dt);
      var floaterAge = floater.ttl - floater.life;
      if (floaterAge < 0.18) {
        floater.scale += (1.06 - floater.scale) * Math.min(1, dt * 11);
      } else {
        floater.scale += (1 - floater.scale) * Math.min(1, dt * 9);
      }
      if (floater.life <= 0) floaters.splice(f, 1);
    }

    if (activeCallout) {
      activeCallout.life -= dt;
      var calloutAge = activeCallout.ttl - activeCallout.life;
      if (calloutAge < 0.16) {
        activeCallout.scale = 0.5 + 0.62 * (calloutAge / 0.16);
      } else {
        activeCallout.scale += (1 - activeCallout.scale) * Math.min(1, dt * 11);
      }
      if (activeCallout.life <= 0) {
        activeCallout = calloutQueue.length > 0 && !isSectorRevealActive() && !celebration ? calloutQueue.shift() : null;
      }
    } else if (calloutQueue.length > 0 && !isSectorRevealActive() && !celebration) {
      activeCallout = calloutQueue.shift();
    }

    // Layer-enter pip pops decay independently of the audio step clock.
    for (var bp = 0; bp < bandPop.length; bp += 1) {
      if (bandPop[bp] > 0) bandPop[bp] = Math.max(0, bandPop[bp] - dt * 2.4);
    }

    if (celebration) {
      for (var cp = celebration.pops.length - 1; cp >= 0; cp -= 1) {
        var pop = celebration.pops[cp];
        pop.age += dt;
        if (pop.age < 0.16) {
          pop.scale = 0.5 + 0.62 * (pop.age / 0.16);
        } else {
          pop.scale += (1 - pop.scale) * Math.min(1, dt * 11);
        }
        if (celebration.fading) {
          pop.alpha -= dt * 3.2;
          if (pop.alpha <= 0) celebration.pops.splice(cp, 1);
        }
      }
      if (celebration.wake) {
        var wake = celebration.wake;
        wake.age += dt;
        var wakeBeatS = Math.max(0.12, (wake.beatMs || 480) / 1000);
        // One-shot born-from-light flourish, fired once as the Hum takes form.
        if (!wake.burstFired && wake.age >= wakeBeatS) {
          wake.burstFired = true;
          fireHumWakeBurst(wake);
        }
        // Fade in on birth; only fade out once the ritual has fully played and
        // the celebration is retiring, so the sequence never gets cut short.
        var ritualDone = wake.age > wakeBeatS * 3.0;
        if (celebration.fading && ritualDone) wake.alpha = Math.max(0, wake.alpha - dt * 2.4);
        else wake.alpha = Math.min(1, wake.alpha + dt * 5);
      }
      if (celebration.cameo) {
        var cameo = celebration.cameo;
        cameo.hop = Math.max(0, cameo.hop - dt * 3.4); // decay the one-shot encore hop
        if (celebration.fading) cameo.alpha = Math.max(0, cameo.alpha - dt * 3);
        else cameo.alpha = Math.min(1, cameo.alpha + dt * 5);
      }
      if (celebration.fading && celebration.pops.length === 0
        && (!celebration.wake || celebration.wake.alpha <= 0)
        && (!celebration.cameo || celebration.cameo.alpha <= 0)) celebration = null;
    }

    trimEffects();
  }

  function updateInputWatchdog(dt) {
    if (!animating || levelState !== "playing") {
      animatingClock = 0;
      return;
    }
    animatingClock += dt;
    if (animatingClock > 5.5) {
      recoverInputLock("INPUT RESET");
    }
  }

  function render(time) {
    ctx.clearRect(0, 0, view.width, view.height);
    var shake = screenShake * screenShake * 13 * fxScale();
    ctx.save();
    if (shake > 0.05) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }
    drawStage(time);
    drawBoardBase(time);
    drawFluxTiles(time);
    drawSpectrumShields(time);
    drawFuseWires(time);
    drawShockwaves();
    drawBeams();
    drawGems(time);
    drawCellFlashes();
    drawPhaseLocks(time);
    drawFusePulses(time);
    drawBeatGates(time);
    drawSignalNodes(time);
    drawProducers(time);
    drawSpreaders(time);
    drawSwapHint(time);
    drawPendingSwap(time);
    drawGuidedMove(time);
    drawRays();
    drawParticles();
    drawFloaters(time);
    drawBoardFrame(time);
    drawArrangementHud(time);
    ctx.restore();
    drawScreenWash(time);
    drawVignette();
    if (humPreview) drawHumPreview(time);
    if (isGreenroomOpen()) drawGreenroom(time);
  }

  function drawScreenWash(time) {
    if (flash <= 0) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var wash = isMeterHot() ? washGold : washCyan;
    if (wash) {
      ctx.globalAlpha = Math.min(0.07, flash * 0.12);
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, view.width, view.height);
    }
    ctx.restore();
  }

  function drawStage(time) {
    var visualDrive = getVisualDrive();
    var pulse = beatPulse * 0.6 + energy * 0.4 + visualDrive * 0.32;
    ctx.save();
    ctx.fillStyle = stageBgGradient || "#04050a";
    ctx.fillRect(0, 0, view.width, view.height);
    if (frameQuality.level < 2) drawNebula(time, visualDrive);

    var gap = Math.max(34, Math.min(54, view.width / 22)) * (1 + frameQuality.level * 0.34);
    var shift = (time * (22 + visualDrive * 34)) % gap;
    drawVectorField(time, pulse);
    drawWarpedLattice(time, gap, shift, pulse);
    drawVectorArena(time, pulse);

    ctx.globalAlpha = 0.08 + energy * 0.16 + visualDrive * 0.08;
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 1.2;
    var cx = view.width / 2;
    var cy = view.boardY + view.boardSize / 2;
    var ringStep = view.cell * (0.84 + frameQuality.level * 0.42);
    for (var r = view.boardSize * 0.62; r < view.boardSize * 1.15; r += ringStep) {
      ctx.beginPath();
      ctx.arc(cx, cy, r + Math.sin(time * 1.8 + r) * 4, time * 0.18, Math.PI * 1.35 + time * 0.18);
      ctx.stroke();
    }

    if (isMeterHot()) {
      ctx.globalAlpha = 0.04 + Math.sin(time * 22) * 0.0125;
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 1;
      var spikeCount = frameQuality.level >= 2 ? 8 : frameQuality.level === 1 ? 12 : 18;
      for (var spike = 0; spike < spikeCount; spike += 1) {
        var angle = time * 0.9 + spike * 0.72;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * view.boardSize * 0.42, cy + Math.sin(angle) * view.boardSize * 0.42);
        ctx.lineTo(cx + Math.cos(angle) * view.boardSize * 1.05, cy + Math.sin(angle) * view.boardSize * 1.05);
        ctx.stroke();
      }
    }
    if (isSplashOpen()) drawAttractFrame(time);
    ctx.restore();
  }

  function getNebulaCanvas() {
    if (nebulaCanvas) return nebulaCanvas;
    nebulaCanvas = document.createElement("canvas");
    nebulaCanvas.width = 192;
    nebulaCanvas.height = 192;
    var nctx = nebulaCanvas.getContext("2d");
    var blobs = [
      { x: 72, y: 82, r: 88, rgb: "70,244,255", alpha: 0.1 },
      { x: 128, y: 106, r: 74, rgb: "255,79,216", alpha: 0.08 },
      { x: 98, y: 54, r: 60, rgb: "255,209,102", alpha: 0.05 }
    ];
    for (var i = 0; i < blobs.length; i += 1) {
      var blob = blobs[i];
      var gradient = nctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.r);
      gradient.addColorStop(0, "rgba(" + blob.rgb + "," + blob.alpha + ")");
      gradient.addColorStop(1, "rgba(" + blob.rgb + ",0)");
      nctx.fillStyle = gradient;
      nctx.fillRect(0, 0, 192, 192);
    }
    return nebulaCanvas;
  }

  function drawNebula(time, visualDrive) {
    var sprite = getNebulaCanvas();
    var cx = view.width / 2;
    var cy = view.boardY + view.boardSize / 2;
    var drift = view.boardSize * 0.2;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = (0.05 + visualDrive * 0.05) * fxScale();
    var sizeA = view.boardSize * 2.6;
    var angleA = time * 0.008;
    ctx.drawImage(sprite, cx + Math.cos(angleA) * drift - sizeA / 2, cy + Math.sin(angleA) * drift - sizeA / 2, sizeA, sizeA);
    var sizeB = view.boardSize * 1.8;
    var angleB = -time * 0.005;
    ctx.drawImage(sprite, cx + Math.cos(angleB) * drift - sizeB / 2, cy + Math.sin(angleB) * drift - sizeB / 2, sizeB, sizeB);
    ctx.restore();
  }

  function buildVectorField(count) {
    var random = createSeededRandom(0x51a7e9);
    var colors = ["#46f4ff", "#ff4fd8", "#ffd166", "#8cff6b", "#ffffff"];
    var field = [];
    for (var i = 0; i < count; i += 1) {
      var depth = 0.35 + random() * 0.65;
      field.push({
        x: random(),
        y: random(),
        depth: depth,
        speedX: (-18 + random() * 36) * depth,
        speedY: (18 + random() * 48) * depth,
        size: (3 + random() * 9) * (0.5 + depth * 0.6),
        phase: random() * Math.PI * 2,
        spin: -0.8 + random() * 1.6,
        shape: Math.floor(random() * 5),
        color: colors[Math.floor(random() * colors.length)]
      });
    }
    return field;
  }

  function drawVectorField(time, pulseAmount) {
    var count = frameQuality.level >= 2 ? 28 : frameQuality.level === 1 ? 52 : vectorField.length;
    var driveAmount = getVisualDrive();
    var width = view.width + 80;
    var height = view.height + 80;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < count; i += 1) {
      var node = vectorField[i];
      var x = ((node.x * width + time * node.speedX * (1.2 + driveAmount)) % width + width) % width - 40;
      var y = ((node.y * height + time * node.speedY * (1.1 + pulseAmount)) % height + height) % height - 40;
      var twinkle = 0.55 + Math.sin(time * 2.1 + node.phase) * 0.45;
      var size = node.size * (0.82 + twinkle * 0.32 + driveAmount * 0.24);
      ctx.globalAlpha = (0.05 + twinkle * 0.09 + driveAmount * 0.08) * (0.4 + node.depth * 0.6) * fxScale();
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 1;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(node.phase + time * node.spin);
      drawMiniGlyph(node.shape, size);
      ctx.restore();
    }
    ctx.restore();
  }

  function drawMiniGlyph(shape, size) {
    ctx.beginPath();
    if (shape === 0) {
      ctx.moveTo(-size, 0);
      ctx.lineTo(size, 0);
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.stroke();
      return;
    }
    if (shape === 1) {
      ctx.rect(-size * 0.72, -size * 0.72, size * 1.44, size * 1.44);
      ctx.stroke();
      return;
    }
    if (shape === 2) {
      ctx.moveTo(0, -size);
      ctx.lineTo(size * 0.88, size * 0.62);
      ctx.lineTo(-size * 0.88, size * 0.62);
      ctx.closePath();
      ctx.stroke();
      return;
    }
    if (shape === 3) {
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.stroke();
      return;
    }
    ctx.arc(0, 0, size * 0.72, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawVectorArena(time, pulseAmount) {
    if (frameQuality.level >= 2) return;
    var cx = view.width / 2;
    var cy = view.boardY + view.boardSize / 2;
    var maxRadius = Math.min(Math.max(view.width, view.height) * 0.54, view.boardSize * 1.42);
    var rings = frameQuality.level === 0 ? 4 : 3;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < rings; i += 1) {
      var radius = maxRadius * (0.42 + i * 0.19) + Math.sin(time * 1.4 + i) * (4 + pulseAmount * 8);
      ctx.globalAlpha = 0.06 + pulseAmount * 0.055 - i * 0.008;
      ctx.strokeStyle = i % 2 === 0 ? "#46f4ff" : "#ff4fd8";
      ctx.lineWidth = 1;
      drawRotatedPolygon(cx, cy, radius, 5 + i, time * (0.08 + i * 0.025), true);
    }

    ctx.globalAlpha = 0.12 + pulseAmount * 0.1;
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 1.2;
    var armCount = frameQuality.level === 0 ? 10 : 6;
    for (var arm = 0; arm < armCount; arm += 1) {
      var angle = time * 0.22 + arm * (Math.PI * 2 / armCount);
      var inner = view.boardSize * (0.48 + Math.sin(time + arm) * 0.02);
      var outer = view.boardSize * (0.76 + pulseAmount * 0.16);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
      ctx.lineTo(cx + Math.cos(angle + 0.04) * outer, cy + Math.sin(angle + 0.04) * outer);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawAttractFrame(time) {
    var cx = view.width / 2;
    var cy = view.boardY + view.boardSize / 2;
    var pulseAmount = 0.5 + Math.sin(time * 2.4) * 0.5;
    var radius = Math.min(view.boardSize * 0.72, Math.min(view.width, view.height) * 0.36);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.24 + pulseAmount * 0.18;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.4;
    drawRotatedPolygon(cx, cy, radius + pulseAmount * 18, 4, time * 0.36, true);
    ctx.globalAlpha = 0.18 + pulseAmount * 0.1;
    ctx.strokeStyle = "#46f4ff";
    drawRotatedPolygon(cx, cy, radius * 1.32, 8, -time * 0.18, true);
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = "#ff4fd8";
    drawRotatedPolygon(cx, cy, radius * 1.7, 3, time * 0.12, true);
    ctx.restore();
  }

  function drawRotatedPolygon(cx, cy, radius, sides, rotation, skipEveryOther) {
    ctx.beginPath();
    for (var i = 0; i <= sides; i += 1) {
      var angle = rotation + (Math.PI * 2 * i) / sides;
      var r = skipEveryOther && i % 2 === 1 ? radius * 0.86 : radius;
      var x = cx + Math.cos(angle) * r;
      var y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  function drawWarpedLattice(time, gap, shift, pulse) {
    var segments = frameQuality.level >= 2 ? 2 : frameQuality.level === 1 ? 4 : 6;
    var visualDrive = getVisualDrive();
    var waveEnergy = Math.min(0.22, shockwaves.reduce(function (sum, wave) {
      return wave.delay > 0 ? sum : sum + wave.life * 0.12;
    }, 0));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.12 + pulse * 0.14 + waveEnergy;
    ctx.strokeStyle = "#46f4ff";
    ctx.lineWidth = 1;
    for (var x = -gap + shift; x < view.width + gap; x += gap) {
      drawWarpedLine(x, 0, x + view.height * 0.22, view.height, segments, time, 8 + visualDrive * 18);
    }
    if (frameQuality.level < 2) {
      ctx.globalAlpha = 0.07 + pulse * 0.08 + waveEnergy;
      ctx.strokeStyle = "#ff4fd8";
      for (var y = -gap + shift; y < view.height + gap; y += gap) {
        drawWarpedLine(0, y, view.width, y - view.width * 0.18, segments, time + 1.7, 7 + visualDrive * 14);
      }
    }
    ctx.globalAlpha = 0.09 + visualDrive * 0.1;
    ctx.strokeStyle = "#ffffff";
    drawWarpedLine(view.boardX, view.boardY, view.boardX + view.boardSize, view.boardY + view.boardSize, segments, time, 10);
    drawWarpedLine(view.boardX + view.boardSize, view.boardY, view.boardX, view.boardY + view.boardSize, segments, time + 0.9, 10);
    ctx.restore();
  }

  function drawWarpedLine(x1, y1, x2, y2, segments, time, strength) {
    ctx.beginPath();
    for (var i = 0; i <= segments; i += 1) {
      var t = i / segments;
      var x = x1 + (x2 - x1) * t;
      var y = y1 + (y2 - y1) * t;
      var point = warpPoint(x, y, time, strength);
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
  }

  function warpPoint(x, y, time, strength) {
    var cx = view.width / 2;
    var cy = view.boardY + view.boardSize / 2;
    var dx = x - cx;
    var dy = y - cy;
    var dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    var force = (Math.sin(dist * 0.018 - time * 3.2) + Math.cos((x - y) * 0.012 + time * 2.1)) * strength * 0.18;
    var driveForce = getVisualDrive() * strength * 0.55;
    shockwaves.forEach(function (wave) {
      if (wave.delay > 0) return;
      var wx = x - wave.x;
      var wy = y - wave.y;
      var wd = Math.sqrt(wx * wx + wy * wy);
      var bandWidth = wave.maxRadius > view.boardSize * 0.4 ? view.cell * 1.5 : Math.max(24, view.cell * 0.9);
      var band = Math.max(0, 1 - Math.abs(wd - wave.radius) / bandWidth);
      force += band * wave.life * strength * 3.4;
    });
    // Nova sweep grid-warp pulse: a short radial kick on top of the usual
    // drive/flash warp (novaWarpPulse is set through fxScale at detonation).
    var amount = force + driveForce + (flash + novaWarpPulse * 1.4) * strength * 0.7;
    return {
      x: x + (dx / dist) * amount,
      y: y + (dy / dist) * amount
    };
  }

  function drawBoardBase(time) {
    ctx.save();
    var x = view.boardX;
    var y = view.boardY;
    var size = view.boardSize;

    ctx.fillStyle = "rgba(2, 4, 10, 0.9)";
    ctx.fillRect(x, y, size, size);

    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        if (!isCellActive(row, col)) continue;
        var cellX = x + col * view.cell;
        var cellY = y + row * view.cell;
        ctx.globalAlpha = 0.88;
        ctx.fillStyle = (row + col) % 2 === 0 ? "rgba(8, 18, 28, 0.74)" : "rgba(5, 11, 19, 0.66)";
        ctx.fillRect(cellX + 1.5, cellY + 1.5, view.cell - 3, view.cell - 3);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "rgba(166, 244, 255, 0.08)";
        ctx.lineWidth = 1;
        ctx.strokeRect(Math.round(cellX) + 0.5, Math.round(cellY) + 0.5, view.cell, view.cell);
        if (neonDetail()) {
          ctx.strokeStyle = "rgba(196, 240, 255, 0.07)";
          ctx.beginPath();
          ctx.moveTo(cellX + 2, Math.round(cellY) + 2.5);
          ctx.lineTo(cellX + view.cell - 2, Math.round(cellY) + 2.5);
          ctx.stroke();
          ctx.strokeStyle = "rgba(0, 0, 0, 0.32)";
          ctx.beginPath();
          ctx.moveTo(cellX + 2, Math.round(cellY + view.cell) - 2.5);
          ctx.lineTo(cellX + view.cell - 2, Math.round(cellY + view.cell) - 2.5);
          ctx.stroke();
        }
      }
    }

    drawBoardMaskOutline(time, "rgba(70, 244, 255, 0.26)", 1.1, 2 + getVisualDrive() * 6);

    var scanY = y + ((time * 72) % size);
    ctx.globalAlpha = 0.24;
    ctx.strokeStyle = "#46f4ff";
    ctx.beginPath();
    ctx.moveTo(x, scanY);
    ctx.lineTo(x + size, scanY);
    ctx.stroke();
    ctx.restore();
  }

  function drawBoardMaskOutline(time, color, lineWidth, warpStrength) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.shadowBlur = glowBlur(10);
    ctx.shadowColor = "#46f4ff";
    var steps = frameQuality.level >= 2 ? 1 : 2;
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        if (!isCellActive(row, col)) continue;
        var left = view.boardX + col * view.cell;
        var top = view.boardY + row * view.cell;
        var right = left + view.cell;
        var bottom = top + view.cell;
        if (!isCellActive(row - 1, col)) drawWarpedLine(left, top, right, top, steps, time, warpStrength);
        if (!isCellActive(row + 1, col)) drawWarpedLine(left, bottom, right, bottom, steps, time + 0.2, warpStrength);
        if (!isCellActive(row, col - 1)) drawWarpedLine(left, top, left, bottom, steps, time + 0.4, warpStrength);
        if (!isCellActive(row, col + 1)) drawWarpedLine(right, top, right, bottom, steps, time + 0.6, warpStrength);
      }
    }
    ctx.restore();
  }

  function drawFluxTiles(time) {
    var maxCharge = Math.max(1, (currentLevel && currentLevel.layout && currentLevel.layout.strength) || 1);
    var intensity = Math.max(0.4, fxScale());
    ctx.save();
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        // Shield blockers live on masked (inactive) cells, so don't gate on
        // isCellActive — render wherever there is a live charge.
        var charge = tileCharges[row] && tileCharges[row][col];
        if (!charge) continue;
        var x = view.boardX + col * view.cell;
        var y = view.boardY + row * view.cell;
        var pulse = 0.55 + Math.sin(time * 5 + row * 0.7 + col * 0.4) * 0.18;
        drawShieldWall(x, y, view.cell, {
          pulse: pulse,
          intensity: intensity,
          alpha: 1,
          reinforced: charge > 1,
          cracks: Math.max(0, maxCharge - charge),
          seed: row * 131 + col * 17 + 1
        });
      }
    }
    ctx.restore();
  }

  function drawBeatGates(time) {
    if (beatGateList.length === 0) return;
    // Iris/shutter aperture strobing on the beat clock; the waveform ring
    // plus countdown pips preview moves-until-toggle. State changes only
    // per move, so this layer is pure readout: no timing pressure.
    var closeAmount = beatGatePhaseOpen ? 1 - beatGateAnim : beatGateAnim;
    var movesUntil = movesUntilBeatGateToggle();
    var warn = beatGatePhaseOpen && movesUntil <= 1 ? 1 : beatGatePhaseOpen && movesUntil === 2 ? 0.45 : 0;
    var strobe = beatPulse * (0.4 + closeAmount * 0.6);
    var intensity = Math.max(0.4, fxScale());
    var samples = frameQuality.level >= 2 ? 12 : 20;

    ctx.save();
    for (var i = 0; i < beatGateList.length; i += 1) {
      var cell = beatGateList[i];
      var x = view.boardX + cell.col * view.cell;
      var y = view.boardY + cell.row * view.cell;
      var cx = x + view.cell / 2;
      var cy = y + view.cell / 2;

      if (closeAmount > 0.02) {
        // Shutter blades slide in from top and bottom.
        var blade = (view.cell / 2 - 3) * closeAmount;
        ctx.globalAlpha = Math.min(0.92, 0.55 + closeAmount * 0.3 + strobe * 0.12 + beatGateFlash * 0.3);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(6, 12, 22, 0.94)";
        ctx.fillRect(x + 2, y + 2, view.cell - 4, blade);
        ctx.fillRect(x + 2, y + view.cell - 2 - blade, view.cell - 4, blade);
        ctx.shadowBlur = glowBlur(10 + strobe * 14);
        ctx.shadowColor = "#ffd166";
        ctx.strokeStyle = "rgba(255, 209, 102, " + (0.5 + strobe * 0.4).toFixed(3) + ")";
        ctx.lineWidth = Math.max(1.5, view.cell * 0.03);
        ctx.beginPath();
        ctx.moveTo(x + 3, y + 2 + blade);
        ctx.lineTo(x + view.cell - 3, y + 2 + blade);
        ctx.moveTo(x + 3, y + view.cell - 2 - blade);
        ctx.lineTo(x + view.cell - 3, y + view.cell - 2 - blade);
        ctx.stroke();
      }

      // Waveform ring: aperture rides the beat, contracts as it closes.
      var radius = view.cell * (0.34 - closeAmount * 0.16);
      ctx.globalAlpha = Math.min(0.85, 0.3 + strobe * 0.35 + warn * 0.3 + beatGateFlash * 0.4) * intensity;
      ctx.shadowBlur = glowBlur(8 + warn * 12);
      ctx.shadowColor = warn > 0 || closeAmount > 0.5 ? "#ffd166" : "#46f4ff";
      ctx.strokeStyle = closeAmount > 0.5 || warn > 0 ? "rgba(255, 209, 102, 0.82)" : "rgba(70, 244, 255, 0.7)";
      ctx.lineWidth = Math.max(1.2, view.cell * 0.024);
      ctx.beginPath();
      for (var s = 0; s <= samples; s += 1) {
        var angle = (Math.PI * 2 * s) / samples;
        var wobble = Math.sin(angle * 5 + time * 6) * view.cell * 0.028 * (0.5 + strobe);
        var px = cx + Math.cos(angle) * (radius + wobble);
        var py = cy + Math.sin(angle) * (radius + wobble);
        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();

      // Phase preview: one countdown pip per move until the next toggle.
      var pipCount = Math.min(4, movesUntil);
      var pipSpan = view.cell * 0.16;
      ctx.shadowBlur = glowBlur(6);
      for (var p = 0; p < pipCount; p += 1) {
        var pipX = cx + (p - (pipCount - 1) / 2) * pipSpan;
        ctx.globalAlpha = (p === 0 ? 0.85 : 0.5) * intensity;
        ctx.fillStyle = beatGatePhaseOpen ? (movesUntil <= 1 ? "#ffd166" : "#46f4ff") : "#ff4fd8";
        ctx.beginPath();
        ctx.arc(pipX, y + view.cell * 0.88, Math.max(1.4, view.cell * 0.028), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawSpectrumShields(time) {
    if (spectrumList.length === 0) return;
    var intensity = Math.max(0.4, fxScale());
    var now = performance.now();
    ctx.save();
    for (var i = 0; i < spectrumList.length; i += 1) {
      var shield = spectrumList[i];
      var broken = shield.remaining.length === 0;
      var breakFade = broken ? Math.max(0, 1 - (now - shield.brokeAt) / 460) : 1;
      if (broken && breakFade <= 0) continue;
      var x = view.boardX + shield.col * view.cell;
      var y = view.boardY + shield.row * view.cell;
      var pulse = 0.55 + Math.sin(time * 5 + shield.row * 0.7 + shield.col * 0.4) * 0.18;

      // Solid neon wall that cracks per hit (same look as flux Shields), with
      // the required colors named as pips beneath so multi-color walls stay
      // legible. Purely visual; the color-match/break mechanic is unchanged.
      var hits = shield.colors.length - shield.remaining.length;
      drawShieldWall(x, y, view.cell, {
        pulse: pulse,
        intensity: intensity,
        alpha: breakFade,
        reinforced: false,
        cracks: broken ? shield.colors.length : hits,
        seed: shield.row * 131 + shield.col * 17 + 1
      });
      drawShieldColorPips(shield, x, y, view.cell, now, breakFade, intensity, pulse);
    }
    ctx.restore();
  }

  function drawSignalNodes(time) {
    if (signalNodeList.length === 0) return;
    var intensity = Math.max(0.4, fxScale());
    var now = performance.now();
    ctx.save();
    for (var i = 0; i < signalNodeList.length; i += 1) {
      var node = signalNodeList[i];
      var x = view.boardX + node.col * view.cell;
      var y = view.boardY + node.row * view.cell;
      var cx = x + view.cell / 2;
      var cy = y + view.cell / 2;
      var flash = node.flashAt ? Math.max(0, 1 - (now - node.flashAt) / 420) : 0;
      var pulseAmt = 0.5 + beatPulse * 0.5;

      // Dark backing so the static masked cell reads solid under falls.
      ctx.globalAlpha = 0.88;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(6, 12, 22, 0.92)";
      ctx.fillRect(x + 2, y + 2, view.cell - 4, view.cell - 4);

      // Antenna mast and base bar.
      ctx.globalAlpha = Math.min(0.9, 0.5 + pulseAmt * 0.3 + flash * 0.4) * intensity;
      ctx.shadowBlur = glowBlur(10 + flash * 14);
      ctx.shadowColor = "#46f4ff";
      ctx.strokeStyle = "rgba(70, 244, 255, " + (0.66 + flash * 0.3).toFixed(3) + ")";
      ctx.lineWidth = Math.max(1.5, view.cell * 0.03);
      ctx.beginPath();
      ctx.moveTo(cx, cy + view.cell * 0.26);
      ctx.lineTo(cx, cy - view.cell * 0.1);
      ctx.moveTo(cx - view.cell * 0.12, cy + view.cell * 0.26);
      ctx.lineTo(cx + view.cell * 0.12, cy + view.cell * 0.26);
      ctx.stroke();

      // Beacon head flares when a packet fires.
      ctx.fillStyle = flash > 0.1 ? "#bffcff" : "#46f4ff";
      ctx.beginPath();
      ctx.arc(cx, cy - view.cell * 0.14, Math.max(2, view.cell * (0.05 + flash * 0.02)), 0, Math.PI * 2);
      ctx.fill();

      // Broadcast ring rides the beat clock.
      var ringRadius = view.cell * (0.16 + pulseAmt * 0.14 + flash * 0.1);
      ctx.globalAlpha = Math.min(0.7, 0.22 + pulseAmt * 0.3 + flash * 0.4) * intensity;
      ctx.beginPath();
      ctx.arc(cx, cy - view.cell * 0.14, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawProducers(time) {
    if (producerList.length === 0) return;
    var intensity = Math.max(0.4, fxScale());
    var now = performance.now();
    var type = producerEmitType();
    var color = TYPES[type] ? TYPES[type].color : "#46f4ff";
    ctx.save();
    for (var i = 0; i < producerList.length; i += 1) {
      var p = producerList[i];
      var x = view.boardX + p.col * view.cell;
      var y = view.boardY + p.row * view.cell;
      var cx = x + view.cell / 2;
      var cy = y + view.cell / 2;
      var flash = p.flashAt ? Math.max(0, 1 - (now - p.flashAt) / 360) : 0;
      var pulse = 0.5 + Math.sin(time * 3 + p.row * 0.7 + p.col * 0.5) * 0.25;

      // Emit beam to the neighbor it just fed (fades fast).
      if (p.beamTo) {
        var beam = Math.max(0, 1 - (now - p.beamTo.at) / 300);
        if (beam > 0) {
          var bx = view.boardX + p.beamTo.col * view.cell + view.cell / 2;
          var by = view.boardY + p.beamTo.row * view.cell + view.cell / 2;
          ctx.globalAlpha = beam * 0.85;
          ctx.shadowBlur = glowBlur(10);
          ctx.shadowColor = color;
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(2, view.cell * 0.05) * beam;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(bx, by);
          ctx.stroke();
        } else {
          p.beamTo = null;
        }
      }

      // Dark hex housing.
      var r = view.cell * 0.3 * (1 + flash * 0.14);
      ctx.beginPath();
      for (var h = 0; h < 6; h += 1) {
        var ha = -Math.PI / 2 + (Math.PI * 2 * h) / 6;
        var hx = cx + Math.cos(ha) * r;
        var hy = cy + Math.sin(ha) * r;
        if (h === 0) ctx.moveTo(hx, hy); else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.globalAlpha = 0.85;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(8, 14, 26, 0.82)";
      ctx.fill();

      // Glowing hex frame in the goal color (strokes the same path).
      ctx.globalAlpha = Math.min(1, 0.55 + pulse * 0.3 + flash * 0.4) * intensity;
      ctx.shadowBlur = glowBlur(12 + pulse * 8 + flash * 16);
      ctx.shadowColor = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(2, view.cell * 0.05);
      ctx.stroke();

      // Rotating emitter ticks.
      ctx.globalAlpha = (0.5 + pulse * 0.4) * intensity;
      ctx.lineWidth = Math.max(1.5, view.cell * 0.03);
      var spin = time * 1.2;
      for (var t = 0; t < 3; t += 1) {
        var ta = spin + (Math.PI * 2 * t) / 3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ta) * r * 0.5, cy + Math.sin(ta) * r * 0.5);
        ctx.lineTo(cx + Math.cos(ta) * r * 0.92, cy + Math.sin(ta) * r * 0.92);
        ctx.stroke();
      }

      // Core dot: the goal piece it emits.
      ctx.globalAlpha = Math.min(1, 0.7 + flash * 0.3) * intensity;
      ctx.shadowBlur = glowBlur(8 + flash * 12);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, view.cell * (0.1 + flash * 0.05), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSpreaders(time) {
    if (spreaderList.length === 0) return;
    var intensity = Math.max(0.4, fxScale());
    var now = performance.now();
    ctx.save();
    for (var i = 0; i < spreaderList.length; i += 1) {
      var sp = spreaderList[i];
      var x = view.boardX + sp.col * view.cell;
      var y = view.boardY + sp.row * view.cell;
      var cx = x + view.cell / 2;
      var cy = y + view.cell / 2;
      var spawn = sp.spawnAt ? Math.max(0, 1 - (now - sp.spawnAt) / 420) : 0;
      var pulse = 0.5 + Math.sin(time * 4 + sp.row * 0.9 + sp.col * 0.7) * 0.25;
      var pad = view.cell * 0.08;

      // Toxic veil over the gem (the gem still reads through it, stays matchable).
      ctx.globalAlpha = (0.2 + pulse * 0.14 + spawn * 0.25) * intensity;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(200, 255, 46, 0.16)";
      ctx.fillRect(x + pad, y + pad, view.cell - pad * 2, view.cell - pad * 2);

      // Creep border.
      ctx.globalAlpha = Math.min(0.9, 0.4 + pulse * 0.3 + spawn * 0.4) * intensity;
      ctx.shadowBlur = glowBlur(8 + pulse * 6 + spawn * 12);
      ctx.shadowColor = SPREAD_COLOR;
      ctx.strokeStyle = SPREAD_COLOR;
      ctx.lineWidth = Math.max(1.5, view.cell * 0.03);
      ctx.strokeRect(x + pad, y + pad, view.cell - pad * 2, view.cell - pad * 2);

      // Tendrils reaching toward the edges (the creep toward neighbors).
      ctx.globalAlpha = (0.4 + pulse * 0.35) * intensity;
      ctx.lineWidth = Math.max(1, view.cell * 0.02);
      var reach = view.cell * (0.34 + pulse * 0.06);
      ctx.beginPath();
      for (var t = 0; t < 4; t += 1) {
        var a = (Math.PI / 2) * t + Math.sin(time * 2 + t + sp.row) * 0.2;
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * reach, cy + Math.sin(a) * reach);
      }
      ctx.stroke();

      // Contained: a small inner ring when a clear held it back this cycle.
      if (sp.contained) {
        ctx.globalAlpha = 0.6 * intensity;
        ctx.shadowBlur = glowBlur(6);
        ctx.beginPath();
        ctx.arc(cx, cy, view.cell * 0.12, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawPhaseLocks(time) {
    if (phaseLockList.length === 0) return;
    var intensity = Math.max(0.4, fxScale());
    var now = performance.now();
    ctx.save();
    for (var i = 0; i < phaseLockList.length; i += 1) {
      var lock = phaseLockList[i];
      var live = Boolean(phaseLockMap[lock.row + ":" + lock.col]);
      var breakFade = live ? 1 : Math.max(0, 1 - (now - lock.brokeAt) / 420);
      if (!live && breakFade <= 0) continue;
      var x = view.boardX + lock.col * view.cell;
      var y = view.boardY + lock.row * view.cell;
      var rejectFlash = lock.flashAt ? Math.max(0, 1 - (now - lock.flashAt) / 320) : 0;
      var shimmer = 0.5 + Math.sin(time * 4 + lock.row * 1.3 + lock.col * 0.9) * 0.22;
      // Glitch offset while the shatter fades.
      var gx = live ? x : x + (Math.random() - 0.5) * (1 - breakFade) * view.cell * 0.16;

      // Translucent cage panel dims the piece inside.
      ctx.globalAlpha = (0.28 + shimmer * 0.1 + rejectFlash * 0.2) * breakFade;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(10, 20, 34, 0.6)";
      ctx.fillRect(gx + 4, y + 4, view.cell - 8, view.cell - 8);

      // Wireframe phase cage: outer frame plus a lattice of phase bars.
      ctx.globalAlpha = Math.min(0.9, 0.42 + shimmer * 0.22 + rejectFlash * 0.4) * intensity * breakFade;
      ctx.shadowBlur = glowBlur(9 + rejectFlash * 12);
      ctx.shadowColor = "#7a6bff";
      ctx.strokeStyle = rejectFlash > 0.1 ? "#ffffff" : "rgba(122, 107, 255, 0.85)";
      ctx.lineWidth = Math.max(1.5, view.cell * 0.028);
      ctx.strokeRect(gx + 4, y + 4, view.cell - 8, view.cell - 8);
      ctx.globalAlpha *= 0.55;
      ctx.lineWidth = Math.max(1, view.cell * 0.016);
      var third = (view.cell - 8) / 3;
      ctx.beginPath();
      for (var bar = 1; bar <= 2; bar += 1) {
        ctx.moveTo(gx + 4 + third * bar, y + 4);
        ctx.lineTo(gx + 4 + third * bar, y + view.cell - 4);
        ctx.moveTo(gx + 4, y + 4 + third * bar);
        ctx.lineTo(gx + view.cell - 4, y + 4 + third * bar);
      }
      ctx.stroke();

      // Shimmer scanline rides the cage face.
      var scanY = y + 4 + ((time * 18 + i * 7) % (view.cell - 8));
      ctx.globalAlpha = (0.2 + shimmer * 0.2) * intensity * breakFade;
      ctx.beginPath();
      ctx.moveTo(gx + 5, scanY);
      ctx.lineTo(gx + view.cell - 5, scanY);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawFuseWires(time) {
    if (fuseNetworkList.length === 0) return;
    var intensity = Math.max(0.4, fxScale());
    ctx.save();
    ctx.lineWidth = Math.max(1.5, view.cell * 0.03);
    ctx.setLineDash([view.cell * 0.16, view.cell * 0.1]);
    ctx.lineDashOffset = -time * view.cell * 0.9;
    for (var i = 0; i < fuseNetworkList.length; i += 1) {
      var live = getLiveFuseGems(fuseNetworkList[i]);
      if (live.length < 2) continue;
      // Circuit trace between the wired specials, marching on the clock.
      ctx.globalAlpha = (0.3 + beatPulse * 0.24) * intensity;
      ctx.shadowBlur = glowBlur(8 + beatPulse * 8);
      ctx.shadowColor = "#ffd166";
      ctx.strokeStyle = "rgba(255, 209, 102, 0.75)";
      ctx.beginPath();
      for (var g = 0; g < live.length - 1; g += 1) {
        traceFuseWirePath(live[g], live[g + 1]);
      }
      ctx.stroke();
      // Node pips ring each wired special.
      ctx.setLineDash([]);
      ctx.globalAlpha = (0.4 + beatPulse * 0.3) * intensity;
      for (var n = 0; n < live.length; n += 1) {
        ctx.beginPath();
        ctx.arc(live[n].x, live[n].y, view.cell * 0.42, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([view.cell * 0.16, view.cell * 0.1]);
    }
    ctx.restore();
  }

  function getLiveFuseGems(network) {
    return network.gems.filter(function (gem) {
      return gem.special && board[gem.row] && board[gem.row][gem.col] === gem;
    });
  }

  function traceFuseWirePath(from, to) {
    // Grid-quantized L path: the trace runs the row first, then the column.
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, from.y);
    ctx.lineTo(to.x, to.y);
  }

  function drawFusePulses(time) {
    if (fusePulses.length === 0) return;
    var now = performance.now();
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < fusePulses.length; i += 1) {
      var pulseEntry = fusePulses[i];
      var t = (now - pulseEntry.startAt) / pulseEntry.duration;
      if (t < 0 || t > 1) continue;
      // The current pulse rides the same L path as the trace.
      var fx = pulseEntry.from.x;
      var fy = pulseEntry.from.y;
      var tx = pulseEntry.to.x;
      var ty = pulseEntry.to.y;
      var rowLen = Math.abs(tx - fx);
      var total = Math.max(1, rowLen + Math.abs(ty - fy));
      var travelled = t * total;
      var px;
      var py;
      if (travelled <= rowLen) {
        px = fx + (tx >= fx ? 1 : -1) * travelled;
        py = fy;
      } else {
        px = tx;
        py = fy + (ty >= fy ? 1 : -1) * (travelled - rowLen);
      }
      ctx.globalAlpha = 0.85;
      ctx.shadowBlur = glowBlur(14);
      ctx.shadowColor = "#ffd166";
      ctx.fillStyle = "#fff3c4";
      ctx.beginPath();
      ctx.arc(px, py, Math.max(2.5, view.cell * 0.07), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.4;
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = Math.max(1, view.cell * 0.02);
      ctx.beginPath();
      ctx.arc(px, py, Math.max(4, view.cell * (0.12 + beatPulse * 0.05)), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawShieldBrackets(x, y, width, height, corner) {
    ctx.beginPath();
    ctx.moveTo(x, y + corner);
    ctx.lineTo(x, y);
    ctx.lineTo(x + corner, y);
    ctx.moveTo(x + width - corner, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + corner);
    ctx.moveTo(x + width, y + height - corner);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width - corner, y + height);
    ctx.moveTo(x + corner, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x, y + height - corner);
    ctx.stroke();
  }

  // Shield retheme (Sector-1 slice, increment 1): render a Shield as a solid
  // neon "wall that cracks" instead of an abstract outlined bracket. The cell
  // still holds a matchable gem underneath, so the pane is a translucent
  // frosted wash + a chunky glowing frame (reads as a reinforced pane you can
  // still see through), and cracks accumulate per hit. Purely visual; the
  // hit/break mechanic is unchanged (feel-first, reversible).
  function crackRng(seed) {
    var s = (seed | 0) || 1;
    return function () {
      s = (s * 1664525 + 1013904223) | 0;
      return ((s >>> 0) % 100000) / 100000;
    };
  }

  function drawWallCracks(x, y, size, count, seed, alpha) {
    if (count <= 0) return;
    var cx = x + size / 2;
    var cy = y + size / 2;
    var rand = crackRng(seed);
    ctx.save();
    ctx.globalAlpha = 0.85 * (alpha == null ? 1 : alpha);
    ctx.strokeStyle = "rgba(255, 240, 252, 0.92)";
    ctx.shadowBlur = glowBlur(6);
    ctx.shadowColor = "#ffffff";
    ctx.lineCap = "round";
    for (var i = 0; i < count; i += 1) {
      var ang = rand() * Math.PI * 2;
      var reach = size * (0.32 + rand() * 0.14);
      var perpX = Math.cos(ang + Math.PI / 2);
      var perpY = Math.sin(ang + Math.PI / 2);
      ctx.lineWidth = Math.max(1.5, size * 0.026);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      var steps = 3;
      for (var st = 1; st <= steps; st += 1) {
        var t = st / steps;
        var jit = (rand() - 0.5) * size * 0.16;
        ctx.lineTo(cx + Math.cos(ang) * reach * t + perpX * jit,
          cy + Math.sin(ang) * reach * t + perpY * jit);
      }
      ctx.stroke();
      if (rand() > 0.45) {
        var bx = cx + Math.cos(ang) * reach * 0.55;
        var by = cy + Math.sin(ang) * reach * 0.55;
        var bang = ang + (rand() - 0.5) * 1.7;
        ctx.lineWidth = Math.max(1, size * 0.018);
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(bx + Math.cos(bang) * reach * 0.32, by + Math.sin(bang) * reach * 0.32);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawShieldWall(x, y, size, opts) {
    var pulse = opts.pulse != null ? opts.pulse : 0.5;
    var alpha = opts.alpha != null ? opts.alpha : 1;
    if (alpha <= 0) return;
    var reinforced = Boolean(opts.reinforced);
    var frameCol = reinforced ? "#ffd166" : "#ff4fd8";
    var pad = Math.max(3, size * 0.07);
    var px = x + pad;
    var py = y + pad;
    var pw = size - pad * 2;
    var ph = size - pad * 2;
    ctx.save();
    // Frosted magenta wash: the gem beneath still glows through, tinted.
    var grad = ctx.createLinearGradient(px, py, px, py + ph);
    grad.addColorStop(0, "rgba(255, 122, 226, " + (0.32 * alpha).toFixed(3) + ")");
    grad.addColorStop(1, "rgba(196, 40, 168, " + (0.44 * alpha).toFixed(3) + ")");
    ctx.fillStyle = grad;
    ctx.fillRect(px, py, pw, ph);
    // Recessed inner seam so it reads as a panel/crate face, not flat tint.
    ctx.globalAlpha = 0.45 * alpha;
    ctx.strokeStyle = "rgba(52, 6, 46, 0.7)";
    ctx.lineWidth = Math.max(1, size * 0.02);
    ctx.strokeRect(px + size * 0.06, py + size * 0.06, pw - size * 0.12, ph - size * 0.12);
    // Top sheen (glass bevel).
    ctx.globalAlpha = (0.45 + pulse * 0.3) * alpha;
    ctx.strokeStyle = "rgba(255, 220, 248, 0.85)";
    ctx.lineWidth = Math.max(1.5, size * 0.03);
    ctx.beginPath();
    ctx.moveTo(px + size * 0.1, py + size * 0.13);
    ctx.lineTo(px + pw - size * 0.1, py + size * 0.13);
    ctx.stroke();
    // Bright neon frame — the wall edge.
    ctx.globalAlpha = Math.min(1, 0.6 + pulse * 0.3) * alpha;
    ctx.shadowBlur = glowBlur(12 + pulse * 8);
    ctx.shadowColor = frameCol;
    ctx.strokeStyle = frameCol;
    ctx.lineWidth = Math.max(2, size * 0.055);
    ctx.strokeRect(px, py, pw, ph);
    if (reinforced) {
      // A second inner frame signals a two-hit (reinforced) wall.
      ctx.globalAlpha = 0.7 * alpha;
      ctx.lineWidth = Math.max(1.5, size * 0.03);
      ctx.strokeRect(px + size * 0.1, py + size * 0.1, pw - size * 0.2, ph - size * 0.2);
    }
    ctx.shadowBlur = 0;
    ctx.restore();
    if (opts.cracks) drawWallCracks(x, y, size, opts.cracks, opts.seed || 1, alpha);
  }

  function drawShieldColorPips(shield, x, y, size, now, alpha, intensity, pulse) {
    // The multi-color (L61+) wall shows which colors crack it as small pips
    // along the bottom edge; needed colors burn bright, collected ones dim.
    var n = shield.colors.length;
    if (n === 0) return;
    var pipR = size * 0.056;
    var stride = pipR * 2.5;
    var startX = x + size / 2 - (stride * (n - 1)) / 2;
    var pipY = y + size - size * 0.17;
    ctx.save();
    for (var s = 0; s < n; s += 1) {
      var typeIndex = shield.colors[s];
      var needed = shield.remaining.indexOf(typeIndex) !== -1;
      var flashAt = shield.segmentFlash[typeIndex] || 0;
      var segFlash = flashAt ? Math.max(0, 1 - (now - flashAt) / 420) : 0;
      var color = TYPES[typeIndex].color;
      var pipX = startX + s * stride;
      ctx.beginPath();
      ctx.arc(pipX, pipY, pipR, 0, Math.PI * 2);
      if (needed) {
        ctx.globalAlpha = Math.min(0.95, 0.6 + pulse * 0.2) * intensity * alpha;
        ctx.shadowBlur = glowBlur(8);
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.fill();
      } else if (segFlash > 0) {
        ctx.globalAlpha = Math.min(1, 0.6 + segFlash * 0.4) * alpha;
        ctx.shadowBlur = glowBlur(10 + segFlash * 12);
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.fill();
      } else {
        ctx.globalAlpha = 0.3 * alpha;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(1, size * 0.015);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function drawBoardFrame(time) {
    var x = view.boardX;
    var y = view.boardY;
    var size = view.boardSize;
    var overdrive = isMeterHot() ? 0.24 : 0;
    var pulse = 0.35 + energy * 0.35 + beatPulse * 0.3 + overdrive;

    ctx.save();
    ctx.lineWidth = 2;
    ctx.shadowBlur = 20 + pulse * 28;
    ctx.shadowColor = "#46f4ff";
    ctx.strokeStyle = "rgba(70, 244, 255, 0.66)";
    ctx.strokeRect(x - 1, y - 1, size + 2, size + 2);

    ctx.globalAlpha = 0.62;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.54)";
    ctx.lineWidth = 1.5;
    var corner = Math.max(18, view.cell * 0.58);
    ctx.beginPath();
    ctx.moveTo(x - 6, y + corner);
    ctx.lineTo(x - 6, y - 6);
    ctx.lineTo(x + corner, y - 6);
    ctx.moveTo(x + size - corner, y - 6);
    ctx.lineTo(x + size + 6, y - 6);
    ctx.lineTo(x + size + 6, y + corner);
    ctx.moveTo(x + size + 6, y + size - corner);
    ctx.lineTo(x + size + 6, y + size + 6);
    ctx.lineTo(x + size - corner, y + size + 6);
    ctx.moveTo(x + corner, y + size + 6);
    ctx.lineTo(x - 6, y + size + 6);
    ctx.lineTo(x - 6, y + size - corner);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.shadowBlur = 18;
    ctx.shadowColor = "#ff4fd8";
    ctx.strokeStyle = "rgba(255, 79, 216, 0.34)";
    ctx.beginPath();
    ctx.moveTo(x + 18, y - 8);
    ctx.lineTo(x + size * 0.42 + Math.sin(time) * 12, y - 8);
    ctx.moveTo(x + size - 18, y + size + 8);
    ctx.lineTo(x + size * 0.58 + Math.cos(time * 0.8) * 12, y + size + 8);
    ctx.stroke();

    drawDriveMeter(x, y, size, time);
    drawBoardMaskOutline(time, "rgba(255, 79, 216, 0.24)", 1.5, 6 + pulse * 8);

    if (armedSpecial) drawArmedSpecialPreview(x, y, time);

    if (selected && isCellActive(selected.row, selected.col)) {
      ctx.shadowBlur = 22;
      ctx.shadowColor = "#ffd166";
      ctx.strokeStyle = "rgba(255, 209, 102, 0.85)";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        x + selected.col * view.cell + 5,
        y + selected.row * view.cell + 5,
        view.cell - 10,
        view.cell - 10
      );
    }

    if (flash > 0) {
      ctx.globalAlpha = flash * 0.16;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, size, size);
    }
    drawMeterChip(x, y, size, time);
    ctx.restore();
  }

  // Layer-growth payoff for "every swap plays the track": a promoted song-arc bar
  // (INTRO -> CLIMAX with the live section word) and a Voices EQ meter that lights
  // one rising pip per audible band as the arranger fills in. Sits in the free
  // canvas band above the board (HUD is fixed-top, mission fixed-bottom), so it
  // never covers gems or DOM chrome. Reads the arranger's own gate/climax/progress
  // state; draws nothing that changes the music. Glow rides glowBlur/fxScale, so
  // lean mode and the adaptive quality steps strip it like the other passes.
  function drawArrangementHud(time) {
    if (levelState !== "playing" || !view.boardSize || isSplashOpen()) return;
    var campaign = gameMode === MODE_CAMPAIGN;
    if (!campaign && !isPulseMode()) return;

    var scale = fxScale();
    var cx = centerBoardX();
    // Sit above the board-frame DRIVE/PULSE meter chip (drawMeterChip), which is
    // centered just above the frame; clear its worst-case hot height and hint line
    // so the two never overlap. Short phones without the headroom fall back to the
    // DOM Voices/section text rather than crowding the top row of gems.
    var chipFontPx = Math.max(12, Math.round(view.cell * 0.42));
    var chipClear = Math.round(chipFontPx * 1.7 * 1.16) + 28;
    var meterBottom = view.boardY - chipClear;
    if (meterBottom < 58) return;
    var pipCount = ARRANGEMENT_BANDS.length;
    var pipW = Math.max(5, Math.min(8, view.boardSize / 58));
    var pipGap = pipW * 0.8;
    var totalW = pipCount * pipW + (pipCount - 1) * pipGap;
    var startX = cx - totalW / 2;
    var baseH = 5;
    var stepH = 2.6;
    var voiceCount = 0;

    ctx.save();
    // Voices EQ meter: rising pips, lit per audible band, popping on entry.
    for (var i = 0; i < pipCount; i += 1) {
      var band = ARRANGEMENT_BANDS[i];
      var lit = !!bandActive[i];
      if (lit) voiceCount += 1;
      var pop = bandPop[i] || 0;
      var h = baseH + i * stepH + pop * 6 * scale;
      var px = startX + i * (pipW + pipGap);
      ctx.globalAlpha = lit ? 0.92 : 0.2;
      ctx.fillStyle = lit ? band.color : "#39465f";
      ctx.shadowColor = band.color;
      ctx.shadowBlur = lit ? glowBlur(7) * (0.55 + pop) : 0;
      ctx.fillRect(px, meterBottom - h, pipW, h);
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.9;
    ctx.font = "800 12px Inter, ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.fillStyle = "#cfe8ff";
    ctx.fillText(String(voiceCount), startX + totalW + 8, meterBottom);
    ctx.globalAlpha = 0.5;
    ctx.font = "700 8px Inter, ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "right";
    ctx.fillStyle = "#7f93b5";
    ctx.fillText("VOICES", startX - 8, meterBottom);

    // Promoted song-arc bar (campaign only): INTRO -> CLIMAX progress with the
    // live section word, colored by energy. Reads the same progress the arrange
    // floors step on, so the bar and the word move exactly with the music.
    if (campaign) {
      var progress = getOverallProgress();
      var word = getSongSectionWord(progress);
      var arcW = Math.min(view.boardSize * 0.82, 300);
      var arcX = cx - arcW / 2;
      var arcY = meterBottom - (baseH + (pipCount - 1) * stepH) - 16;
      var barH = 5;
      var wordColor = progress >= 0.9 ? "#ff4fd8" : progress >= 0.75 ? "#ffd166" : progress >= 0.5 ? "#8cff6b" : "#46f4ff";
      ctx.globalAlpha = 0.24;
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#25324a";
      ctx.fillRect(arcX, arcY, arcW, barH);
      // Section boundaries mirror the arrange-floor progress thresholds.
      ctx.globalAlpha = 0.34;
      ctx.fillStyle = "#4a5b7a";
      var ticks = [0.25, 0.5, 0.75, 0.9];
      for (var t = 0; t < ticks.length; t += 1) {
        ctx.fillRect(arcX + arcW * ticks[t] - 0.5, arcY - 1, 1, barH + 2);
      }
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = wordColor;
      ctx.shadowColor = wordColor;
      ctx.shadowBlur = glowBlur(8);
      ctx.fillRect(arcX, arcY, Math.max(2, arcW * Math.min(1, progress)), barH);
      ctx.globalAlpha = 0.96;
      ctx.font = "900 12px Inter, ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.shadowBlur = glowBlur(10);
      ctx.fillText(word, arcX, arcY - 6);
      ctx.globalAlpha = 0.6;
      ctx.font = "700 10px Inter, ui-sans-serif, system-ui, sans-serif";
      ctx.textAlign = "right";
      ctx.fillStyle = "#cfe8ff";
      ctx.shadowBlur = 0;
      ctx.fillText(Math.round(progress * 100) + "%", arcX + arcW, arcY - 6);
    }
    ctx.restore();
  }

  // Legible label for the board-frame meter (mandate: the frame IS the meter, so
  // name it). Same frame reads opposite per mode: DRIVE (fill it) in Campaign vs
  // PULSE (a draining timer) in Daily/Rush. Shows the fill %, and while hot swaps
  // to a persistent OVERDRIVE x2 badge with a "keep clearing to hold it" hint and
  // enter/exit pops. Text-only HUD; glow rides glowBlur so lean mode strips it.
  function drawMeterChip(x, y, size, time) {
    if (levelState !== "playing") return;
    var hot = isMeterHot();
    var pulseMode = isPulseMode();
    var critical = pulseMode && pulse <= 0.24;
    var fillPct = Math.round(Math.min(1, Math.max(0, getMeterFill())) * 100);
    var mainText = hot ? "OVERDRIVE ×2" : (pulseMode ? "PULSE " : "DRIVE ") + fillPct + "%";
    var accent = hot ? "#ffd166" : critical ? "#ff5e7a" : pulseMode ? "#ff8fe0" : "#46f4ff";
    // Enter pop (overdrivePulse) and exit contraction (overdriveExitPulse) give
    // the badge a matching in/out beat without spawning a new particle system.
    var pop = hot ? 1 + overdrivePulse * 0.16 : 1 + overdriveExitPulse * 0.1;
    var hotGlow = hot ? 0.6 + Math.sin(time * 9) * 0.4 : 0;

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var fontPx = Math.max(12, Math.round(view.cell * 0.42));
    ctx.font = "800 " + fontPx + "px Inter, ui-sans-serif, system-ui, sans-serif";
    var chipW = (ctx.measureText(mainText).width + 28) * pop;
    var chipH = Math.round(fontPx * 1.7) * pop;
    var chipX = Math.min(x + size - chipW / 2 - 4, Math.max(x + chipW / 2 + 4, x + size / 2));
    var chipY = y - chipH / 2 - 8;

    fillRoundRect(ctx, chipX - chipW / 2, chipY - chipH / 2, chipW, chipH, chipH / 2, "rgba(3, 5, 10, 0.85)");
    ctx.shadowBlur = glowBlur(hot ? 10 + hotGlow * 16 : 6);
    ctx.shadowColor = accent;
    strokeRoundRect(ctx, chipX - chipW / 2, chipY - chipH / 2, chipW, chipH, chipH / 2, accent, hot ? 2.2 : 1.5);
    ctx.shadowBlur = 0;

    ctx.fillStyle = accent;
    if (hot) ctx.globalAlpha = 0.85 + hotGlow * 0.15;
    ctx.fillText(mainText, chipX, chipY + 0.5);
    ctx.globalAlpha = 1;

    // Hold rule surfaces only while hot; sits above the badge so it never covers
    // the top board row.
    if (hot) {
      var hintPx = Math.max(9, Math.round(fontPx * 0.6));
      ctx.font = "700 " + hintPx + "px Inter, ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255, 209, 102, 0.72)";
      ctx.fillText("keep clearing to hold it", chipX, chipY - chipH / 2 - hintPx * 0.9);
    }
    ctx.restore();
  }

  function drawArmedSpecialPreview(x, y, time) {
    // Footprint preview for an armed tap-to-fire special (mandate A5). This
    // is the teaching surface: it strokes exactly the cells the special will
    // clear. Cheap by design — outline strokes only, no particles.
    var gem = board[armedSpecial.row] && board[armedSpecial.row][armedSpecial.col];
    if (!gem || !gem.special) return;
    var color = TYPES[gem.type].color;
    var previewPulse = 0.4 + Math.sin(time * 6) * 0.2;
    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = previewPulse;
    ctx.fillStyle = color;
    var strokeCell = function (row, col) {
      if (!isCellActive(row, col)) return;
      var px = x + col * view.cell;
      var py = y + row * view.cell;
      // Faint fill tint plus outline so the footprint reads on every gem
      // shape (a square stroke alone vanishes against square gems).
      ctx.globalAlpha = previewPulse * 0.24;
      ctx.fillRect(px + 4, py + 4, view.cell - 8, view.cell - 8);
      ctx.globalAlpha = previewPulse;
      ctx.strokeRect(px + 7, py + 7, view.cell - 14, view.cell - 14);
    };
    if (gem.special === "lineH") {
      for (var col = 0; col < GRID; col += 1) strokeCell(armedSpecial.row, col);
    } else if (gem.special === "lineV") {
      for (var row = 0; row < GRID; row += 1) strokeCell(row, armedSpecial.col);
    } else {
      // Nova sweep: every board piece of the nova's own color.
      for (var r = 0; r < GRID; r += 1) {
        for (var c = 0; c < GRID; c += 1) {
          var target = board[r] && board[r][c];
          if (target && target.type === gem.type) strokeCell(r, c);
        }
      }
    }
    // The armed special itself gets the bright ring, matching the
    // selected-cell highlight weight.
    ctx.globalAlpha = Math.min(1, previewPulse + 0.45);
    ctx.lineWidth = 3;
    ctx.strokeRect(
      x + armedSpecial.col * view.cell + 5,
      y + armedSpecial.row * view.cell + 5,
      view.cell - 10,
      view.cell - 10
    );

    // Loud "TAP TO FIRE" prompt so the armed state reads as an action, not a
    // selection. Sits just off the armed cell (below it near the top row),
    // pulsing and high-contrast, clamped to stay on the board horizontally.
    var promptScale = 1 + Math.sin(time * 6) * 0.06;
    var promptPx = Math.max(13, Math.round(view.cell * 0.4 * promptScale));
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 " + promptPx + "px Inter, ui-sans-serif, system-ui, sans-serif";
    var halfW = ctx.measureText("TAP TO FIRE").width / 2 + 4;
    var promptX = Math.max(x + halfW, Math.min(x + view.boardSize - halfW, x + armedSpecial.col * view.cell + view.cell / 2));
    var promptY = armedSpecial.row <= 1
      ? y + (armedSpecial.row + 1) * view.cell + view.cell * 0.5
      : y + armedSpecial.row * view.cell - view.cell * 0.42;
    ctx.globalAlpha = 1;
    ctx.shadowBlur = glowBlur(16);
    ctx.shadowColor = color;
    ctx.lineWidth = Math.max(3, promptPx * 0.2);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.82)";
    ctx.strokeText("TAP TO FIRE", promptX, promptY);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("TAP TO FIRE", promptX, promptY);
    ctx.restore();
  }

  function drawDriveMeter(x, y, size, time) {
    var inset = 7;
    var fill = Math.min(1, getMeterFill());
    var hot = isMeterHot();
    var critical = isPulseMode() && pulse <= 0.24;
    var glow = hot ? 0.28 + Math.sin(time * 18) * 0.08 : 0.12;

    ctx.save();
    ctx.shadowBlur = 12 + glow * 42;
    ctx.shadowColor = critical ? "#ff5e7a" : hot ? "#ffd166" : "#46f4ff";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + inset, y + inset, size - inset * 2, size - inset * 2);

    ctx.strokeStyle = critical ? "rgba(255, 94, 122, 0.92)" : hot ? "rgba(255, 209, 102, 0.9)" : "rgba(70, 244, 255, 0.76)";
    ctx.lineWidth = 3;
    drawRectProgress(x + inset, y + inset, size - inset * 2, size - inset * 2, fill);

    var inner = size - inset * 2;
    var notchDist = inner * 4 * 0.72;
    var notch = pointOnRectPerimeter(x + inset, y + inset, inner, inner, notchDist);
    var notchX = notch.x;
    var notchY = notch.y;
    var notchA = pointOnRectPerimeter(x + inset, y + inset, inner, inner, notchDist - 2);
    var notchAX = notchA.x;
    var notchAY = notchA.y;
    var notchB = pointOnRectPerimeter(x + inset, y + inset, inner, inner, notchDist + 2);
    var ndx = notchB.x - notchAX;
    var ndy = notchB.y - notchAY;
    var nlen = Math.max(1, Math.sqrt(ndx * ndx + ndy * ndy));
    ctx.shadowBlur = 8;
    ctx.shadowColor = "#ffffff";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(notchX - (ndy / nlen) * 4, notchY + (ndx / nlen) * 4);
    ctx.lineTo(notchX + (ndy / nlen) * 4, notchY - (ndx / nlen) * 4);
    ctx.stroke();

    if (fill > 0.6 && fill < 0.72 && neonDetail() && Math.random() < 0.3) {
      var head = pointOnRectPerimeter(x + inset, y + inset, inner, inner, inner * 4 * fill);
      var headX = head.x;
      var headY = head.y;
      var sparkCount = scaledEffectCount(2, 1);
      for (var s = 0; s < sparkCount; s += 1) {
        var sparkAngle = Math.random() * Math.PI * 2;
        var sparkSpeed = 30 + Math.random() * 70;
        var sparkSpan = 0.14 + Math.random() * 0.12;
        particles.push({
          x: headX,
          y: headY,
          vx: Math.cos(sparkAngle) * sparkSpeed,
          vy: Math.sin(sparkAngle) * sparkSpeed,
          life: sparkSpan,
          ttl: sparkSpan,
          size: 1 + Math.random() * 1.4,
          color: hot ? "#ffd166" : "#46f4ff",
          line: true
        });
      }
      trimEffectList(particles, "particles");
    }

    if (isPulseMode() && pulseBank > 0) {
      var bankFill = Math.min(1, pulseBank / PULSE_RELEASE_THRESHOLD);
      var bankInset = inset + 8;
      var ready = isPulseReleaseReady();
      ctx.shadowBlur = ready ? 32 : 18;
      ctx.shadowColor = ready ? "#ffffff" : "#ff4fd8";
      ctx.strokeStyle = ready ? "rgba(255, 255, 255, 0.94)" : "rgba(255, 79, 216, 0.78)";
      ctx.lineWidth = ready ? 4 : 2;
      drawRectProgress(x + bankInset, y + bankInset, size - bankInset * 2, size - bankInset * 2, bankFill);
    }

    if (overdrivePulse > 0) {
      ctx.globalAlpha = overdrivePulse * 0.45;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.strokeRect(
        x - 8 - overdrivePulse * 14,
        y - 8 - overdrivePulse * 14,
        size + 16 + overdrivePulse * 28,
        size + 16 + overdrivePulse * 28
      );
    }
    drawDriveTicks(x, y, size, time, fill, hot, critical);
    ctx.restore();
  }

  function drawDriveTicks(x, y, size, time, fill, hot, critical) {
    if (frameQuality.level >= 2) return;
    var tickCount = frameQuality.level === 0 ? 32 : 20;
    var perimeter = size * 4;
    var active = Math.max(1, Math.floor(tickCount * fill));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = hot ? 2 : 1;
    for (var i = 0; i < tickCount; i += 1) {
      var p = (i / tickCount + time * (hot ? 0.08 : 0.035)) % 1;
      var point = pointOnRectPerimeter(x - 9, y - 9, size + 18, size + 18, p * perimeter);
      var pointX = point.x;
      var pointY = point.y;
      var next = pointOnRectPerimeter(x - 9, y - 9, size + 18, size + 18, p * perimeter + 9);
      ctx.globalAlpha = i < active ? 0.25 + fill * 0.36 : 0.055;
      ctx.strokeStyle = critical ? "#ff5e7a" : hot ? "#ffd166" : i % 2 === 0 ? "#46f4ff" : "#ff4fd8";
      ctx.beginPath();
      ctx.moveTo(pointX, pointY);
      ctx.lineTo(next.x, next.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Reused scratch point: pointOnRectPerimeter runs dozens of times per frame for
  // the drive meter, so it writes here instead of allocating. Callers that need two
  // points at once must copy x/y before the next call.
  var rectPerimeterPoint = { x: 0, y: 0 };

  function pointOnRectPerimeter(x, y, width, height, distance) {
    var total = width * 2 + height * 2;
    var d = ((distance % total) + total) % total;
    var point = rectPerimeterPoint;
    if (d <= width) {
      point.x = x + d;
      point.y = y;
      return point;
    }
    d -= width;
    if (d <= height) {
      point.x = x + width;
      point.y = y + d;
      return point;
    }
    d -= height;
    if (d <= width) {
      point.x = x + width - d;
      point.y = y + height;
      return point;
    }
    d -= width;
    point.x = x;
    point.y = y + height - d;
    return point;
  }

  function drawRectProgress(x, y, width, height, fill) {
    var total = width * 2 + height * 2;
    var remaining = total * fill;
    var segments = [
      { x1: x, y1: y, x2: x + width, y2: y, length: width },
      { x1: x + width, y1: y, x2: x + width, y2: y + height, length: height },
      { x1: x + width, y1: y + height, x2: x, y2: y + height, length: width },
      { x1: x, y1: y + height, x2: x, y2: y, length: height }
    ];

    segments.forEach(function (segment) {
      if (remaining <= 0) return;
      var drawLength = Math.min(segment.length, remaining);
      var ratio = drawLength / segment.length;
      ctx.beginPath();
      ctx.moveTo(segment.x1, segment.y1);
      ctx.lineTo(
        segment.x1 + (segment.x2 - segment.x1) * ratio,
        segment.y1 + (segment.y2 - segment.y1) * ratio
      );
      ctx.stroke();
      remaining -= drawLength;
    });
  }

  function hexToRgb(hex) {
    var value = parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }

  function mixColor(hexA, hexB, t) {
    var a = hexToRgb(hexA);
    var b = hexToRgb(hexB);
    return "rgb(" +
      Math.round(a[0] + (b[0] - a[0]) * t) + "," +
      Math.round(a[1] + (b[1] - a[1]) * t) + "," +
      Math.round(a[2] + (b[2] - a[2]) * t) + ")";
  }

  function drawGems(time) {
    forEachGem(function (gem) {
      drawSingleGem(gem, time);
    });
  }

  function drawSingleGem(gem, time) {
    var type = TYPES[gem.type];
    var radius = view.cell * (0.34 + gem.pop * 0.09);
    var coreWidth = Math.max(2.5, view.cell * 0.05);
    var scale = gem.scale + gem.pop * 0.25 + beatPulse * 0.035;
    var driftX = gem.x - gem.tx;
    var driftY = gem.y - gem.ty;
    var drift = Math.sqrt(driftX * driftX + driftY * driftY);

    if (drift > view.cell * 0.04) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.min(0.56, drift / view.cell + gem.trail * 0.28);
      ctx.beginPath();
      ctx.moveTo(gem.x, gem.y);
      ctx.lineTo(gem.x + driftX * 0.62, gem.y + driftY * 0.62);
      strokeNeonPath(type.color, Math.max(2, view.cell * (0.06 + gem.trail * 0.04)));
      ctx.restore();

      if (frameQuality.level < 2) {
        for (var ghost = 1; ghost <= 2; ghost += 1) {
          ctx.save();
          ctx.translate(gem.x + driftX * ghost * 0.22, gem.y + driftY * ghost * 0.22);
          ctx.globalAlpha = Math.max(0, 0.22 - ghost * 0.07);
          ctx.shadowBlur = 0;
          ctx.strokeStyle = type.color;
          ctx.lineWidth = Math.max(1, view.cell * 0.026);
          drawShape(type.shape, radius * (1 - ghost * 0.08), time + gem.spin, type.color);
          ctx.restore();
        }
      }
    }

    var breathPhase = (gem.tx + gem.ty) * 0.021;
    var breath = 1 + Math.sin(time * 1.7 + breathPhase) * 0.013;
    var haloPulse = Math.sin(time * 1.7 + breathPhase) * 0.06;

    ctx.save();
    ctx.translate(gem.x, gem.y);
    ctx.scale(scale * breath, scale * breath);
    drawGemBacking(radius, type.color, gem.special, gem.birth);

    if (neonDetail()) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.24 + haloPulse + gem.pop * 0.3;
      ctx.lineWidth = coreWidth * 3.5;
      ctx.strokeStyle = type.color;
      drawShape(type.shape, radius, time + gem.spin, type.color);
      ctx.restore();
    }

    ctx.globalAlpha = 0.95;
    ctx.lineWidth = coreWidth;
    var birthWhite = Math.min(1, (gem.birth || 0) / 0.8);
    ctx.strokeStyle = birthWhite > 0 ? type.birthColors[Math.min(3, Math.round(birthWhite * 3))] : type.coreColor;
    drawShape(type.shape, radius, time + gem.spin, type.color);
    ctx.globalAlpha = 1;
    if (gem.special) drawSpecialOverlay(gem.special, radius, time + gem.spin, type.color);
    if (gem.drop) drawDropBadge(gem.drop, radius, time);
    ctx.restore();
  }

  function drawDropBadge(name, radius, time) {
    var fly = REWARD_FLY[name] || REWARD_FLY.hammer;
    var pulseAmount = 0.5 + Math.sin(time * 5.4) * 0.5;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.5 + pulseAmount * 0.35;
    ctx.strokeStyle = fly.color;
    ctx.lineWidth = Math.max(1.5, view.cell * 0.03);
    ctx.shadowBlur = glowBlur(10 + pulseAmount * 8);
    ctx.shadowColor = fly.color;
    ctx.beginPath();
    ctx.arc(0, 0, radius * (1.34 + pulseAmount * 0.08), 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = fly.color;
    ctx.font = "900 " + Math.max(9, Math.round(radius * 0.85)) + "px Inter, ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fly.glyph, radius * 0.95, -radius * 0.95);
    ctx.restore();
  }

  function drawSwapHint(time) {
    if (!swapHint || levelState !== "playing" || animating) return;
    var a = getBoardCellCenter(swapHint.a);
    var b = getBoardCellCenter(swapHint.b);
    var pulseAmount = 0.55 + Math.sin(time * 8.2) * 0.45;
    var alpha = Math.min(0.82, 0.24 + swapHintAge * 0.6);
    var radius = view.cell * (0.34 + pulseAmount * 0.08);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = alpha;
    ctx.shadowBlur = 20 + pulseAmount * 24;
    ctx.shadowColor = "#ffd166";
    drawHintRing(a.x, a.y, radius, "#ffd166", pulseAmount);
    drawHintRing(b.x, b.y, radius, "#46f4ff", 1 - pulseAmount * 0.35);
    drawHintArrow(a, b, pulseAmount);
    ctx.restore();
  }

  function drawPendingSwap(time) {
    if (!pendingSwap || levelState !== "playing") return;
    if (performance.now() - pendingSwap.at > PENDING_SWAP_MAX_AGE) {
      pendingSwap = null;
      return;
    }
    var a = getBoardCellCenter(pendingSwap.a);
    var b = getBoardCellCenter(pendingSwap.b);
    var pulseAmount = 0.5 + Math.sin(time * 6.4) * 0.5;
    var radius = view.cell * 0.4;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.26 + pulseAmount * 0.18;
    ctx.strokeStyle = "#46f4ff";
    ctx.lineWidth = Math.max(2, view.cell * 0.035);
    ctx.shadowBlur = 12 + pulseAmount * 10;
    ctx.shadowColor = "#46f4ff";
    ctx.beginPath();
    ctx.arc(a.x, a.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(b.x, b.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawHintRing(x, y, radius, color, pulseAmount) {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(2, view.cell * 0.04);
    ctx.beginPath();
    ctx.arc(x, y, radius, Math.PI * (0.1 + pulseAmount * 0.2), Math.PI * (1.78 + pulseAmount * 0.16));
    ctx.stroke();

    ctx.globalAlpha *= 0.55;
    ctx.beginPath();
    ctx.arc(x, y, radius + view.cell * 0.12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha /= 0.55;
  }

  function drawHintArrow(a, b, pulseAmount) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var length = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    var nx = dx / length;
    var ny = dy / length;
    var startX = a.x + nx * view.cell * 0.22;
    var startY = a.y + ny * view.cell * 0.22;
    var endX = b.x - nx * view.cell * 0.22;
    var endY = b.y - ny * view.cell * 0.22;
    var head = view.cell * (0.12 + pulseAmount * 0.03);

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(2, view.cell * 0.045);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - nx * head - ny * head * 0.62, endY - ny * head + nx * head * 0.62);
    ctx.lineTo(endX - nx * head + ny * head * 0.62, endY - ny * head - nx * head * 0.62);
    ctx.closePath();
    ctx.fill();
  }

  function drawGuidedMove(time) {
    if (!guidedMove || animating || levelState !== "playing") return;
    if (guidedMove.tap) {
      drawGuidedTap(time);
      return;
    }
    var gemA = board[guidedMove.a.row] && board[guidedMove.a.row][guidedMove.a.col];
    var gemB = board[guidedMove.b.row] && board[guidedMove.b.row][guidedMove.b.col];
    if (!gemA || !gemB) return;

    ctx.save();
    ctx.fillStyle = "rgba(3, 5, 10, 0.62)";
    ctx.fillRect(view.boardX, view.boardY, view.boardSize, view.boardSize);
    ctx.restore();

    drawSingleGem(gemA, time);
    drawSingleGem(gemB, time);

    var a = getBoardCellCenter(guidedMove.a);
    var b = getBoardCellCenter(guidedMove.b);
    var pulseAmount = 0.55 + Math.sin(time * 8.2) * 0.45;
    var radius = view.cell * (0.34 + pulseAmount * 0.08);

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.92;
    ctx.shadowBlur = 20 + pulseAmount * 24;
    ctx.shadowColor = "#ffd166";
    drawHintRing(a.x, a.y, radius, "#ffd166", pulseAmount);
    drawHintRing(b.x, b.y, radius, "#46f4ff", 1 - pulseAmount * 0.35);
    drawHintArrow(a, b, pulseAmount);

    var handT = (time % 1.1) / 1.1;
    var handEase = handT * handT * (3 - 2 * handT);
    var dotX = a.x + (b.x - a.x) * handEase;
    var dotY = a.y + (b.y - a.y) * handEase;
    ctx.globalAlpha = 0.55 + Math.sin(handT * Math.PI) * 0.4;
    ctx.fillStyle = "#ffffff";
    ctx.shadowBlur = 14;
    ctx.shadowColor = "#ffffff";
    ctx.beginPath();
    ctx.arc(dotX, dotY, view.cell * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    drawGuidedLabel(guidedMove.label || "Drag to match 3", a, b, Math.max(guidedMove.a.row, guidedMove.b.row));
  }

  function drawGuidedTap(time) {
    // Nova primer tap stage: dim the board, ring the nova, and name the
    // tap grammar. Once the first tap arms it, stand down so the armed
    // footprint preview (drawn with the gems) reads unobstructed.
    var cell = guidedMove.a;
    var gem = board[cell.row] && board[cell.row][cell.col];
    if (!gem || !gem.special) return;
    if (armedSpecial && sameCell(armedSpecial, cell)) return;

    ctx.save();
    ctx.fillStyle = "rgba(3, 5, 10, 0.62)";
    ctx.fillRect(view.boardX, view.boardY, view.boardSize, view.boardSize);
    ctx.restore();

    drawSingleGem(gem, time);

    var center = getBoardCellCenter(cell);
    var pulseAmount = 0.55 + Math.sin(time * 8.2) * 0.45;
    var radius = view.cell * (0.4 + pulseAmount * 0.1);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.92;
    ctx.shadowBlur = 20 + pulseAmount * 24;
    ctx.shadowColor = "#ffd166";
    drawHintRing(center.x, center.y, radius, "#ffd166", pulseAmount);
    ctx.restore();

    drawGuidedLabel("Tap the nova twice", center, center, cell.row);
  }

  function drawGuidedLabel(labelText, a, b, maxGuidedRow) {
    ctx.save();
    ctx.font = "800 15px Inter, ui-sans-serif, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    var labelWidth = ctx.measureText(labelText).width + 26;
    var labelHeight = 30;
    var labelY = maxGuidedRow >= GRID - 2
      ? Math.min(a.y, b.y) - view.cell * 0.72 - labelHeight / 2
      : Math.max(a.y, b.y) + view.cell * 0.72 + labelHeight / 2;
    var labelX = Math.min(
      view.boardX + view.boardSize - labelWidth / 2 - 6,
      Math.max(view.boardX + labelWidth / 2 + 6, (a.x + b.x) / 2)
    );
    fillRoundRect(ctx, labelX - labelWidth / 2, labelY - labelHeight / 2, labelWidth, labelHeight, labelHeight / 2, "rgba(3, 5, 10, 0.85)");
    strokeRoundRect(ctx, labelX - labelWidth / 2, labelY - labelHeight / 2, labelWidth, labelHeight, labelHeight / 2, "rgba(255, 209, 102, 0.55)", 1.5);
    ctx.fillStyle = "#ffd166";
    ctx.fillText(labelText, labelX, labelY + 0.5);
    ctx.restore();
  }

  function getBoardCellCenter(cell) {
    return {
      x: view.boardX + cell.col * view.cell + view.cell / 2,
      y: view.boardY + cell.row * view.cell + view.cell / 2
    };
  }

  function drawGemBacking(radius, color, special, birth) {
    var core = radius * (special ? 1.28 : 1.12);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = birth * 0.3;
    ctx.fillStyle = color;
    ctx.shadowBlur = 22 + birth * 26;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(0, 0, core, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawShape(shape, radius, time, color) {
    // Every ratio comes from PIECE_GLYPH_SHAPES so the board gem and its goal-chip
    // icon share one silhouette source (see buildPieceGlyphSvg).
    var spec = PIECE_GLYPH_SHAPES[shape];

    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, radius * spec.radii[0], 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, radius * spec.radii[1], 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    if (shape === "triangle") {
      polygon(spec.sides, radius * spec.radius, spec.offset);
      ctx.stroke();
      return;
    }

    if (shape === "diamond") {
      // Tall vertical rhombus (point top and bottom) so it reads distinct from
      // Pulse's flat-top square. Custom path, not a rotated square.
      var dp = spec.points;
      ctx.beginPath();
      ctx.moveTo(dp[0][0] * radius, dp[0][1] * radius);
      for (var i = 1; i < dp.length; i += 1) ctx.lineTo(dp[i][0] * radius, dp[i][1] * radius);
      ctx.closePath();
      ctx.stroke();
      return;
    }

    if (shape === "square") {
      // Flat-top axis-aligned square (corners at PI/4 give horizontal top/bottom
      // edges), inset so it does not overfill the cell.
      polygon(spec.sides, radius * spec.radius, spec.offset);
      ctx.stroke();
      return;
    }

    if (shape === "hex") {
      polygon(spec.sides, radius * spec.radius, spec.offset);
      ctx.stroke();
      // Single filled center dot: names Core and separates it from Ion's hollow center.
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, radius * spec.dot, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    drawAtom(radius, time, color);
  }

  function drawSpecialOverlay(special, radius, time, color) {
    ctx.save();
    ctx.fillStyle = color;
    var railWidth = Math.max(2, radius * 0.12);

    if (special === "lineH" || special === "lineV") {
      var vertical = special === "lineV";
      ctx.globalAlpha = 0.96;
      strokeNeon(function () {
        ctx.beginPath();
        if (vertical) {
          ctx.moveTo(0, -radius * 1.18);
          ctx.lineTo(0, radius * 1.18);
        } else {
          ctx.moveTo(-radius * 1.18, 0);
          ctx.lineTo(radius * 1.18, 0);
        }
      }, "#ffffff", railWidth);

      if (neonDetail()) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = 0.6;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = railWidth * 1.7;
        ctx.setLineDash([radius * 0.22, radius * 0.66]);
        ctx.lineDashOffset = -time * radius * 2.4;
        ctx.beginPath();
        if (vertical) {
          ctx.moveTo(0, -radius * 1.18);
          ctx.lineTo(0, radius * 1.18);
        } else {
          ctx.moveTo(-radius * 1.18, 0);
          ctx.lineTo(radius * 1.18, 0);
        }
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalAlpha = 0.86;
      ctx.lineWidth = Math.max(1, radius * 0.05);
      ctx.strokeStyle = color;
      ctx.beginPath();
      if (vertical) {
        ctx.moveTo(-radius * 0.28, -radius * 1.05);
        ctx.lineTo(-radius * 0.28, radius * 1.05);
        ctx.moveTo(radius * 0.28, -radius * 1.05);
        ctx.lineTo(radius * 0.28, radius * 1.05);
      } else {
        ctx.moveTo(-radius * 1.05, -radius * 0.28);
        ctx.lineTo(radius * 1.05, -radius * 0.28);
        ctx.moveTo(-radius * 1.05, radius * 0.28);
        ctx.lineTo(radius * 1.05, radius * 0.28);
      }
      ctx.stroke();

      ctx.globalAlpha = 0.62;
      ctx.lineWidth = Math.max(1, radius * 0.05);
      ctx.strokeStyle = "#ffffff";
      ctx.beginPath();
      if (vertical) {
        ctx.moveTo(-radius * 0.34, -radius * 0.82);
        ctx.lineTo(radius * 0.34, -radius * 0.82);
        ctx.moveTo(-radius * 0.34, radius * 0.82);
        ctx.lineTo(radius * 0.34, radius * 0.82);
      } else {
        ctx.moveTo(-radius * 0.82, -radius * 0.34);
        ctx.lineTo(-radius * 0.82, radius * 0.34);
        ctx.moveTo(radius * 0.82, -radius * 0.34);
        ctx.lineTo(radius * 0.82, radius * 0.34);
      }
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.rotate(time * 0.95);
    ctx.globalAlpha = 0.88;
    strokeNeon(function () {
      ctx.beginPath();
      for (var i = 0; i < 10; i += 1) {
        var spokeAngle = (Math.PI * 2 * (i + 1)) / 10;
        var spokeLength = radius * (i % 2 === 0 ? 1.34 : 1.02);
        ctx.moveTo(Math.cos(spokeAngle) * radius * 0.28, Math.sin(spokeAngle) * radius * 0.28);
        ctx.lineTo(Math.cos(spokeAngle) * spokeLength, Math.sin(spokeAngle) * spokeLength);
      }
    }, "#ffffff", railWidth);
    ctx.globalAlpha = 0.8;
    strokeNeon(function () {
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.72, 0, Math.PI * 2);
    }, "#ffffff", railWidth);
    if (neonDetail()) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#ffffff";
      for (var dot = 0; dot < 2; dot += 1) {
        var dotAngle = time * 2.3 + dot * Math.PI;
        ctx.beginPath();
        ctx.arc(Math.cos(dotAngle) * radius * 0.72, Math.sin(dotAngle) * radius * 0.72, radius * 0.09, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 0.36;
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Regular-polygon vertices, normalized-friendly: the canvas polygon() and the
  // SVG glyph builder both consume this so their silhouettes are identical.
  function polygonPoints(sides, radius, offset) {
    var pts = [];
    for (var i = 0; i < sides; i += 1) {
      var angle = offset + (Math.PI * 2 * i) / sides;
      pts.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
    }
    return pts;
  }

  function polygon(points, radius, offset) {
    var pts = polygonPoints(points, radius, offset);
    ctx.beginPath();
    for (var i = 0; i < pts.length; i += 1) {
      if (i === 0) ctx.moveTo(pts[i][0], pts[i][1]);
      else ctx.lineTo(pts[i][0], pts[i][1]);
    }
    ctx.closePath();
  }

  function drawAtom(radius, time, color) {
    // Two crossed wide ellipses + nucleus dot. Rotation frozen so the lens/orbit
    // cluster holds its silhouette instead of spinning into a blob.
    var spec = PIECE_GLYPH_SHAPES.atom;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, radius * spec.nucleus, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.globalAlpha *= 0.86;
    var rings = 2;
    for (var i = 0; i < rings; i += 1) {
      ctx.rotate((Math.PI / rings) * i);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * spec.rx, radius * spec.ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- Hum renderer: procedural GCS creature on the gem neon pipeline -------
  // Renders one Glyph Creature Spec doc (handoff/creatures.json) as Geometry
  // Wars line-art, reusing strokeNeon (thin bright core + wide dim halo), the
  // drawShape path builders, and the gem breathing math. Idle motion is
  // beat-locked to the audio step clock so Hums dance in time. Pure cosmetic:
  // touches no board state and emits only budgeted particles through
  // scaledEffectCount / effectLimit. Any stroke API renders it in ~200 lines.
  var HUM_EASE = {
    linear: function (t) { return t; },
    easeInOut: function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; },
    easeInQuad: function (t) { return t * t; },
    easeOutQuad: function (t) { return 1 - (1 - t) * (1 - t); },
    easeInCubic: function (t) { return t * t * t; },
    easeOutCubic: function (t) { return 1 - Math.pow(1 - t, 3); },
    easeInBack: function (t) { return 2.70158 * t * t * t - 1.70158 * t * t; },
    easeOutBack: function (t) { var c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); },
    easeOutElastic: function (t) {
      if (t === 0 || t === 1) return t;
      return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI / 3)) + 1;
    }
  };
  function humEase(name) { return HUM_EASE[name] || HUM_EASE.easeOutBack; }

  // Continuous fractional 16th-step position off the audio step scheduler
  // (nextStepTime / audioCtx.currentTime), so motion locks to the track. Falls
  // back to wall-clock so a Hum still dances before audio starts.
  function humStepFloat(time) {
    var stepSeconds = (60 / getActiveBpm()) / 4;
    if (audio.ctx && audio.started) {
      return audio.step - (audio.nextStepTime - audio.ctx.currentTime) / stepSeconds;
    }
    return time / stepSeconds;
  }

  // Bounce envelope: 1 at each bounce beat (peak), settling to 0 by the next
  // one with the named curve's personality (easeOutBack overshoots = eager).
  function humBounce(stepInBar, bounce) {
    var beats = bounce.beats || [0];
    var prev = -Infinity, next = Infinity;
    for (var i = 0; i < beats.length; i += 1) {
      var b = beats[i];
      if (b <= stepInBar && b > prev) prev = b;
      if (b > stepInBar && b < next) next = b;
    }
    if (prev === -Infinity) prev = beats[beats.length - 1] - 16; // wrap from prior bar
    if (next === Infinity) next = beats[0] + 16;                 // wrap into next bar
    var span = Math.max(0.001, next - prev);
    var t = Math.min(1, Math.max(0, (stepInBar - prev) / span));
    return 1 - humEase(bounce.curve)(t);
  }

  function drawHum(ctx, gcs, cx, cy, size, time, opts) {
    if (!gcs || !gcs.body) return;
    opts = opts || {};
    var body = gcs.body;
    var primary = (gcs.palette && gcs.palette.primary) || "#ffffff";
    var motion = gcs.motion || {};
    var features = gcs.features || {};
    var radius = size * (body.radius || 1);
    var coreWidth = Math.max(1.5, size * 0.05 * (body.stroke || 1));
    var seed = hashString(gcs.id || gcs.name || "hum");
    var phase = (seed % 1000) / 1000 * Math.PI * 2;

    // Recording reveal: draw only the first N of 15 outline segments and stop
    // (the half-drawn Hum sleeping in the corner, Zeigarnik pull).
    if (opts.drawProgress != null && opts.drawProgress < 1) {
      ctx.save();
      ctx.translate(cx, cy);
      drawHumOutlineProgress(ctx, body, radius, primary, coreWidth, Math.max(0, opts.drawProgress));
      ctx.restore();
      return;
    }

    var sleeping = Boolean(opts.sleeping);
    var dim = sleeping ? 0.32 : 1;
    // Wake ritual hooks: born (1..0) lerps the stroke white->palette over the
    // born-from-light beat; still holds the body (no bounce/trail) while it wakes;
    // eyeOpen (0..1 or null) overrides the natural blink for the single wake blink.
    var born = Math.max(0, Math.min(1, opts.born || 0));
    var still = Boolean(opts.still);
    var bodyColor = born > 0 ? mixColor(primary, "#ffffff", born) : primary;

    // Gem breathing: 1 + sin(t*hz*2PI + phase) * amp, plus a halo-alpha pulse.
    var breath = motion.breath || { amp: 0.02, hz: 0.3 };
    var breathOsc = Math.sin(time * breath.hz * Math.PI * 2 + phase);
    var breathScale = 1 + breathOsc * breath.amp;
    var haloPulse = breathOsc * 0.06;

    // Beat-locked bounce + squash-on-landing off the audio clock.
    var stepInBar = ((humStepFloat(time) % 16) + 16) % 16;
    var bounce = motion.bounce || { beats: [0], amp: 0, curve: "easeOutBack" };
    var hop = (sleeping || still) ? 0 : humBounce(stepInBar, bounce);
    var hopPrev = (sleeping || still) ? 0 : humBounce(((stepInBar - 0.4) % 16 + 16) % 16, bounce);
    var hopVel = hop - hopPrev;
    var bounceY = -hop * (bounce.amp || 0) * size;         // negative y = up on the beat
    var squash = (motion.squash || 0) * Math.max(0, -hopVel) * 1.6; // compress as it lands
    // Poke signature move: a one-shot amplified lift (opts.poke) plus a landing
    // squash pulse (opts.pokeSquash), both 0..1 and driven by the caller's clock.
    var poke = (sleeping || still) ? 0 : Math.max(0, Math.min(1, opts.poke || 0));
    if (poke > 0.001) bounceY -= poke * size * 0.55;
    var pokeSquash = (sleeping || still) ? 0 : Math.max(0, Math.min(1, opts.pokeSquash || 0));
    if (pokeSquash > 0.001) squash = Math.max(squash, pokeSquash * 0.5);
    var squashX = 1 + squash * 0.6;
    var squashY = 1 - squash;

    // Velocity-streaked trail from the shared spark system, rate = motion.trail.
    // Suppressed under opts.noTrail: the Greenroom paints its own budgeted sparks,
    // and the global particle list is off its overlay canvas.
    if (!sleeping && !still && !opts.noTrail && motion.trail > 0 && fxScale() > 0.2 && Math.abs(hopVel) > 0.05) {
      emitHumTrail(cx, cy + bounceY, primary, motion.trail, hopVel * size);
    }

    ctx.save();
    ctx.translate(cx, cy + bounceY);
    drawHumSatellites(ctx, features.satellites, size, time, primary, dim);

    ctx.save();
    ctx.scale(breathScale * squashX, breathScale * squashY);
    ctx.globalCompositeOperation = "lighter";
    // Born-from-light backing: a white glow flash that fades as the Hum takes on
    // its palette color (reuses the gem-birth language from drawGemBacking).
    if (born > 0) {
      ctx.save();
      ctx.globalAlpha = born * 0.32;
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = glowBlur(20 + born * 26);
      ctx.shadowColor = primary;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 1.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = dim * (1 + haloPulse);
    strokeNeon(function () { humBodyPath(ctx, body.shape, radius); }, bodyColor, coreWidth);
    if (!sleeping) {
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = Math.max(1, coreWidth * 0.55);
      ctx.strokeStyle = mixColor(primary, "#ffffff", Math.max(0.7, born));
      humBodyPath(ctx, body.shape, radius);
      ctx.stroke();
    }
    humBodyDetail(ctx, body.shape, radius, bodyColor, dim);
    ctx.restore();

    drawHumAntennae(ctx, features.antennae, radius, coreWidth, bodyColor, hopVel, time, sleeping);
    drawHumTendrils(ctx, features.tendrils, radius, coreWidth, bodyColor, time, dim);
    drawHumEyes(ctx, features.eyes, size, time, primary, seed, sleeping, opts.eyeOpen);
    ctx.restore();
  }

  // Body silhouette path builder (no stroke) mirroring drawShape's geometry so
  // strokeNeon lays the core + halo over it exactly like a gem.
  function humBodyPath(ctx, shape, radius) {
    if (shape === "triangle") { polygon(3, radius, -Math.PI / 2); return; }
    if (shape === "square") { polygon(4, radius * 0.82, Math.PI / 4); return; }
    if (shape === "hex") { polygon(6, radius, Math.PI / 6); return; }
    if (shape === "diamond") {
      ctx.beginPath();
      ctx.moveTo(0, -radius * 1.18);
      ctx.lineTo(radius * 0.72, 0);
      ctx.lineTo(0, radius * 1.18);
      ctx.lineTo(-radius * 0.72, 0);
      ctx.closePath();
      return;
    }
    if (shape === "atom") {
      ctx.beginPath();
      ctx.moveTo(radius * 1.06, 0);
      ctx.ellipse(0, 0, radius * 1.06, radius * 0.38, 0, 0, Math.PI * 2);
      ctx.moveTo(0, radius * 1.06);
      ctx.ellipse(0, 0, radius * 1.06, radius * 0.38, Math.PI / 2, 0, Math.PI * 2);
      return;
    }
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
  }

  // Inner accents that name the silhouette (gem circle ring, Core dot, Atom nucleus).
  function humBodyDetail(ctx, shape, radius, color, dim) {
    if (shape === "circle") {
      ctx.globalAlpha = 0.5 * dim;
      ctx.lineWidth = Math.max(1, radius * 0.03);
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (shape === "hex" || shape === "atom") {
      ctx.globalAlpha = 0.9 * dim;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, radius * (shape === "atom" ? 0.22 : 0.16), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Eyes: the only filled elements. Two bright dots with a per-Hum arc-squint
  // blink whose interval jitters within features.eyes.blinkS, stateless.
  // eyeOpen (0..1) overrides the natural blink so the wake ritual can drive the
  // single deliberate blink; null keeps the stateless idle blink.
  function drawHumEyes(ctx, eyes, size, time, color, seed, sleeping, eyeOpen) {
    if (!eyes) return;
    var ex = (eyes.x || 0) * size, ey = (eyes.y || 0) * size, er = Math.max(1.2, (eyes.r || 0.07) * size);
    var open = sleeping ? 0 : (eyeOpen != null ? Math.max(0, Math.min(1, eyeOpen)) : humBlink(time, eyes.blinkS || [2, 4], seed));
    var eyeColor = mixColor(color, "#ffffff", 0.75);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (var s = -1; s <= 1; s += 2) {
      ctx.save();
      ctx.translate(s * ex, ey);
      if (open > 0.12) {
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.ellipse(0, 0, er, er * open, 0, 0, Math.PI * 2);
        ctx.fill();
        if (neonDetail()) {
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.ellipse(0, 0, er * 1.9, er * open * 1.9, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Closed-eye squint arc. Undiscovered (sleeping) Hums draw it faint and
        // color-dimmed so the whole silhouette reads dark, not a bright shut eye.
        ctx.globalAlpha = sleeping ? 0.22 : 0.9;
        ctx.strokeStyle = sleeping ? mixColor(color, "#101821", 0.6) : eyeColor;
        ctx.lineWidth = Math.max(1.2, er * 0.5);
        ctx.beginPath();
        ctx.arc(0, er * 0.35, er, Math.PI * 1.15, Math.PI * 1.85);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();
  }

  // Stateless per-Hum blink: fixed interval seeded from id within blinkS, with
  // the exact blink moment jittered per cycle. Returns eye openness (1..0..1).
  function humBlink(time, blinkS, seed) {
    var lo = blinkS[0], hi = blinkS[1];
    var interval = Math.max(0.3, lo + ((seed % 997) / 997) * Math.max(0.001, hi - lo));
    var cyc = Math.floor(time / interval);
    var jitter = (hashString(seed + ":" + cyc) % 1000) / 1000;
    var blinkAt = jitter * Math.max(0.001, interval - 0.18);
    var tb = time - cyc * interval - blinkAt;
    if (tb < 0 || tb > 0.16) return 1;
    return 1 - Math.sin((tb / 0.16) * Math.PI); // dip closed then reopen
  }

  // Hoisted strokeNeon path builders for the Hum features below. Built once
  // (module scope) and fed through scratch state, so drawHumAntennae/Tendrils/
  // OutlineProgress don't allocate a fresh closure per feature per frame. The
  // scratch carries the target context (drawHum runs against the main ctx and
  // the offscreen greenroom/export ctxs) so the path lands on the same surface
  // the original inline closures used. Safe because strokeNeon runs the path
  // builder synchronously (no re-entrancy).
  var humAntennaScratch = { ctx: null, bx: 0, by: 0, mx: 0, my: 0, tx: 0, ty: 0 };
  function humAntennaPath() {
    var s = humAntennaScratch, c = s.ctx;
    c.beginPath();
    c.moveTo(s.bx, s.by);
    c.quadraticCurveTo(s.mx, s.my, s.tx, s.ty);
  }
  var humTendrilScratch = { ctx: null, bx: 0, by: 0, segs: 4, time: 0, i: 0, sway: 0, radius: 0, len: 0 };
  function humTendrilPath() {
    var s = humTendrilScratch, c = s.ctx;
    c.beginPath();
    c.moveTo(s.bx, s.by);
    for (var k = 1; k <= s.segs; k += 1) {
      var f = k / s.segs;
      c.lineTo(s.bx + Math.sin(s.time * 1.6 + f * Math.PI * 2 + s.i) * s.sway * s.radius * f, s.by + s.len * f);
    }
  }
  var humOutlineProgressScratch = { ctx: null, pts: null };
  function humOutlineProgressPath() {
    var s = humOutlineProgressScratch, c = s.ctx, pts = s.pts;
    c.beginPath();
    c.moveTo(pts[0][0], pts[0][1]);
    for (var k = 1; k < pts.length; k += 1) c.lineTo(pts[k][0], pts[k][1]);
  }

  // Antennae: line strokes whose tip springs with lag against the body's
  // vertical velocity, plus a gentle beat wobble scaled by the spring constant.
  function drawHumAntennae(ctx, antennae, radius, coreWidth, color, hopVel, time, sleeping) {
    if (!antennae || !antennae.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = sleeping ? 0.3 : 0.9;
    for (var i = 0; i < antennae.length; i += 1) {
      var a = antennae[i];
      var baseX = (a.x || 0) * radius, baseY = -radius * 0.95;
      var spring = a.spring != null ? a.spring : 0.5;
      var wob = sleeping ? 0 : Math.sin(time * (2 + spring * 4) + i) * 0.12 * spring;
      var lag = sleeping ? 0 : -hopVel * 6 * spring;
      var tipAng = (a.angle || 0) * Math.PI / 180 + wob + lag;
      var len = (a.len || 0.5) * radius;
      var tipX = baseX + Math.sin(tipAng) * len, tipY = baseY - Math.cos(tipAng) * len;
      var midX = baseX + Math.sin(tipAng * 0.5) * len * 0.5, midY = baseY - Math.cos(tipAng * 0.5) * len * 0.5;
      var as = humAntennaScratch;
      as.ctx = ctx; as.bx = baseX; as.by = baseY; as.mx = midX; as.my = midY; as.tx = tipX; as.ty = tipY;
      strokeNeon(humAntennaPath, color, Math.max(1, coreWidth * 0.6));
      if (!sleeping) {
        ctx.fillStyle = mixColor(color, "#ffffff", 0.7);
        ctx.beginPath();
        ctx.arc(tipX, tipY, Math.max(1.2, coreWidth * 0.8), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Satellites: filled dots on elliptical orbits (Atom trio, Shield twin).
  function drawHumSatellites(ctx, sats, size, time, color, dim) {
    if (!sats || !sats.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    var dot = mixColor(color, "#ffffff", 0.6);
    for (var i = 0; i < sats.length; i += 1) {
      var s = sats[i];
      var ang = time * (s.hz || 0.4) * Math.PI * 2 + (s.phase || 0) * Math.PI * 2;
      var orbit = (s.orbit || 1) * size;
      var x = Math.cos(ang) * orbit, y = Math.sin(ang) * orbit * 0.5;
      var r = Math.max(1.5, (s.size || 0.08) * size);
      ctx.fillStyle = dot;
      if (neonDetail()) {
        ctx.globalAlpha = 0.28 * dim;
        ctx.beginPath();
        ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 0.85 * dim;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Tendrils: swaying jellyfish line-strokes hanging below the body.
  function drawHumTendrils(ctx, tendrils, radius, coreWidth, color, time, dim) {
    if (!tendrils || !tendrils.length) return;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.7 * dim;
    for (var i = 0; i < tendrils.length; i += 1) {
      var t = tendrils[i];
      var baseX = (t.x || 0) * radius, baseY = radius * 0.8;
      var len = (t.len || 1) * radius, sway = t.sway || 0.25;
      var segs = Math.max(2, Math.floor(t.segments || 4));
      var ts = humTendrilScratch;
      ts.ctx = ctx; ts.bx = baseX; ts.by = baseY; ts.segs = segs; ts.time = time; ts.i = i; ts.sway = sway; ts.radius = radius; ts.len = len;
      strokeNeon(humTendrilPath, color, Math.max(1, coreWidth * 0.5));
    }
    ctx.restore();
  }

  // Recording reveal: resample the silhouette into 15 equal segments and stroke
  // only the first N, so the outline draws in stroke-by-stroke across a track.
  function drawHumOutlineProgress(ctx, body, radius, color, coreWidth, progress) {
    var verts = humOutlineVerts(body.shape, radius);
    var n = verts.length, segLen = [], total = 0;
    for (var i = 0; i < n; i += 1) {
      var a = verts[i], b = verts[(i + 1) % n];
      var d = Math.hypot(b[0] - a[0], b[1] - a[1]);
      segLen.push(d); total += d;
    }
    var SEGMENTS = 15, step = total / SEGMENTS;
    var shown = Math.max(1, Math.round(progress * SEGMENTS));
    var pts = [humArcPoint(verts, segLen, 0)];
    for (var s = 1; s <= shown; s += 1) pts.push(humArcPoint(verts, segLen, Math.min(total, s * step)));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.55;
    var os = humOutlineProgressScratch;
    os.ctx = ctx; os.pts = pts;
    strokeNeon(humOutlineProgressPath, color, coreWidth);
    ctx.restore();
  }

  function humOutlineVerts(shape, radius) {
    if (shape === "triangle") return humPolyVerts(3, radius, -Math.PI / 2);
    if (shape === "square") return humPolyVerts(4, radius * 0.82, Math.PI / 4);
    if (shape === "hex") return humPolyVerts(6, radius, Math.PI / 6);
    if (shape === "diamond") return [[0, -radius * 1.18], [radius * 0.72, 0], [0, radius * 1.18], [-radius * 0.72, 0]];
    var out = [], rx = shape === "atom" ? radius * 1.06 : radius, ry = shape === "atom" ? radius * 0.38 : radius;
    for (var i = 0; i < 24; i += 1) {
      var ang = (Math.PI * 2 * i) / 24;
      out.push([Math.cos(ang) * rx, Math.sin(ang) * ry]);
    }
    return out;
  }

  function humPolyVerts(points, radius, offset) {
    var out = [];
    for (var i = 0; i < points; i += 1) {
      var ang = offset + (Math.PI * 2 * i) / points;
      out.push([Math.cos(ang) * radius, Math.sin(ang) * radius]);
    }
    return out;
  }

  function humArcPoint(verts, segLen, dist) {
    var n = verts.length, acc = 0;
    for (var i = 0; i < n; i += 1) {
      var l = segLen[i];
      if (acc + l >= dist || i === n - 1) {
        var t = l > 0 ? Math.max(0, Math.min(1, (dist - acc) / l)) : 0;
        var a = verts[i], b = verts[(i + 1) % n];
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      }
      acc += l;
    }
    return verts[0].slice();
  }

  function emitHumTrail(x, y, color, rate, velY) {
    if (Math.random() > rate) return; // rate throttles per-frame emission
    var count = scaledEffectCount(Math.ceil(rate * 3), 1);
    for (var i = 0; i < count; i += 1) {
      var spread = Math.random() - 0.5;
      var life = 0.22 + Math.random() * 0.18;
      particles.push({
        x: x + spread * 6,
        y: y,
        vx: spread * 40,
        vy: velY * (0.4 + Math.random() * 0.4),
        life: life,
        ttl: life,
        size: 1 + Math.random() * 1.4,
        color: color,
        line: true
      });
    }
    trimEffectList(particles, "particles");
  }

  // Debug-only overlay: render the staged Hum center-screen each frame so the
  // renderer can be eyeballed / screenshotted (set via NeonLatticeDebug.previewHum).
  function drawHumPreview(time) {
    if (!humPreview) return;
    var spec = creatureSpecs[humPreview.index];
    if (!spec) return;
    drawHum(ctx, spec, view.width * 0.5, view.height * 0.42, Math.min(view.width, view.height) * 0.16, time, humPreview.opts);
  }

  // 4x4 band grid geometry in the greenroom canvas's own CSS pixels.
  function greenroomLayout(cssW, cssH) {
    var cols = GREENROOM_COLS;
    var rows = Math.ceil(HUM_IDS.length / cols);
    var cellW = cssW / cols;
    var cellH = cssH / rows;
    return { cols: cols, rows: rows, cellW: cellW, cellH: cellH, size: Math.min(cellW, cellH) * 0.34 };
  }

  function greenroomCellCenter(lay, index) {
    var col = index % lay.cols;
    var row = Math.floor(index / lay.cols);
    return { x: (col + 0.5) * lay.cellW, y: (row + 0.5) * lay.cellH - lay.cellH * 0.08 };
  }

  // One-shot signature-move envelope from the per-cell poke clock: an amplified
  // lift (up then down, slight decay) plus a squash pulse on the way back down.
  function greenroomPokeEnv(index, time) {
    var at = greenroomPokeAt[index];
    if (at == null) return { lift: 0, squash: 0 };
    var s = time - at;
    if (s < 0 || s >= GREENROOM_POKE_DUR) return { lift: 0, squash: 0 };
    var u = s / GREENROOM_POKE_DUR;
    var lift = Math.sin(u * Math.PI) * (1 - u * 0.35);
    var squash = u > 0.5 ? Math.sin(((u - 0.5) / 0.5) * Math.PI) : 0;
    return { lift: Math.max(0, lift), squash: Math.max(0, squash) };
  }

  // Staggered idle bob so the awake band always shows life, even with audio muted:
  // a slow out-of-phase sine per index, returned as a 0..1 poke lift. Cosmetic.
  function greenroomAmbientLift(index, time) {
    var phase = time * GREENROOM_AMBIENT_HZ + index * 0.7;
    return Math.max(0, Math.sin(phase * Math.PI * 2)) * GREENROOM_AMBIENT_LIFT;
  }

  // Grid index of the freshest woken Hum, or -1. Drives the spotlight below.
  function greenroomSpotlightIndex() {
    var id = latestAwakeHumId();
    return id ? HUM_IDS.indexOf(id) : -1;
  }

  // Soft pulsing radial wash behind the newest Hum so a fresh wake stands out in
  // the band. Budgeted like the other greenroom passes (skips in lean mode).
  function drawGreenroomSpotlight(gctx, cell, lay, spec, time) {
    if (fxScale() <= 0.2) return;
    var primary = (spec.palette && spec.palette.primary) || "#ffffff";
    var pulse = 0.5 + 0.5 * Math.sin(time * 2.2);
    var r = lay.size * (2.2 + pulse * 0.4);
    gctx.save();
    gctx.globalCompositeOperation = "lighter";
    gctx.globalAlpha = 0.12 + pulse * 0.08;
    var grad = gctx.createRadialGradient(cell.x, cell.y, lay.size * 0.2, cell.x, cell.y, r);
    grad.addColorStop(0, mixColor(primary, "#ffffff", 0.5));
    grad.addColorStop(1, "rgba(0,0,0,0)");
    gctx.fillStyle = grad;
    gctx.beginPath();
    gctx.arc(cell.x, cell.y, r, 0, Math.PI * 2);
    gctx.fill();
    gctx.restore();
  }

  // Under each cell: an awake Hum's name, or an undiscovered Hum's recording
  // progress (X/15) so the collection reads as "in progress", not a blank lock.
  function drawGreenroomName(gctx, spec, cell, lay, sleeping, seg) {
    var y = cell.y + lay.size + lay.cellH * 0.17;
    if (sleeping) {
      var progressText = Math.max(0, Math.min(HUM_SEGMENTS, seg || 0)) + "/" + HUM_SEGMENTS;
      gctx.save();
      gctx.globalCompositeOperation = "source-over";
      gctx.globalAlpha = 0.5;
      gctx.fillStyle = "#7c9099";
      gctx.font = "800 " + Math.max(9, Math.round(lay.size * 0.3)) + "px system-ui, -apple-system, sans-serif";
      gctx.textAlign = "center";
      gctx.textBaseline = "middle";
      gctx.fillText(progressText, cell.x, y);
      gctx.restore();
      return;
    }
    var label = spec.name || "";
    if (!label) return;
    gctx.save();
    gctx.globalCompositeOperation = "lighter";
    gctx.globalAlpha = 0.85;
    gctx.fillStyle = mixColor((spec.palette && spec.palette.primary) || "#ffffff", "#ffffff", 0.35);
    gctx.font = "800 " + Math.max(9, Math.round(lay.size * 0.32)) + "px system-ui, -apple-system, sans-serif";
    gctx.textAlign = "center";
    gctx.textBaseline = "middle";
    gctx.fillText(label, cell.x, y);
    gctx.restore();
  }

  // Budgeted poke sparkle burst, stored in greenroom CSS-pixel space and drawn
  // only on the greenroom canvas. Count and cap route through scaledEffectCount.
  function emitGreenroomSparks(x, y, color) {
    if (fxScale() <= 0.2) return;
    var count = scaledEffectCount(14, 4);
    var born = typeof lastTime === "number" ? lastTime : 0;
    for (var i = 0; i < count; i += 1) {
      var ang = Math.random() * Math.PI * 2;
      var spd = 40 + Math.random() * 90;
      greenroomSparks.push({
        x: x, y: y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 30,
        born: born,
        ttl: 0.35 + Math.random() * 0.3,
        size: 1.2 + Math.random() * 1.8,
        color: color
      });
    }
    var cap = scaledEffectCount(120, 40);
    if (greenroomSparks.length > cap) greenroomSparks.splice(0, greenroomSparks.length - cap);
  }

  function drawGreenroomSparks(gctx, time) {
    if (!greenroomSparks.length) return;
    gctx.save();
    gctx.globalCompositeOperation = "lighter";
    for (var i = greenroomSparks.length - 1; i >= 0; i -= 1) {
      var s = greenroomSparks[i];
      var age = time - s.born;
      if (age < 0 || age >= s.ttl) { greenroomSparks.splice(i, 1); continue; }
      var life = 1 - age / s.ttl;
      var x = s.x + s.vx * age;
      var y = s.y + s.vy * age + 60 * age * age; // gentle gravity settle
      gctx.globalAlpha = life * 0.9;
      gctx.fillStyle = s.color;
      if (neonDetail()) {
        gctx.shadowBlur = glowBlur(8);
        gctx.shadowColor = s.color;
      } else {
        gctx.shadowBlur = 0;
      }
      gctx.beginPath();
      gctx.arc(x, y, Math.max(0.6, s.size * life), 0, Math.PI * 2);
      gctx.fill();
    }
    gctx.restore();
  }

  // Greenroom frame: draws the 16-Hum grid onto its own overlay canvas. Awake
  // Hums idle to the selected palette with full motion (plus any live poke move);
  // undiscovered ones show as dim closed-eye silhouettes. strokeNeon and the
  // humBody* builders draw through the module ctx, so we point it at the greenroom
  // context for the pass (mirrors drawTracklistHum) and restore it afterward.
  function drawGreenroom(time) {
    var el = greenroomCanvas;
    if (!el || !el.getContext) return;
    var cssW = el.clientWidth, cssH = el.clientHeight;
    if (!cssW || !cssH) return;
    var dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
    var pxW = Math.round(cssW * dpr), pxH = Math.round(cssH * dpr);
    if (el.width !== pxW || el.height !== pxH) { el.width = pxW; el.height = pxH; }
    var gctx = el.getContext("2d");
    gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    gctx.clearRect(0, 0, cssW, cssH);
    var lay = greenroomLayout(cssW, cssH);
    var saved = ctx;
    ctx = gctx;
    var spotlightIdx = greenroomSpotlightIndex();
    try {
      for (var i = 0; i < HUM_IDS.length; i += 1) {
        var spec = findHumSpec(HUM_IDS[i]);
        if (!spec) continue; // specs not loaded yet: leave the cell blank
        var cell = greenroomCellCenter(lay, i);
        var state = (campaignSave.hums && campaignSave.hums[HUM_IDS[i]]) || { segments: 0, awake: false };
        if (state.awake) {
          var env = greenroomPokeEnv(i, time);
          var newest = i === spotlightIdx;
          if (newest) drawGreenroomSpotlight(gctx, cell, lay, spec, time);
          // Poke overrides the idle bob; otherwise the staggered showcase wave
          // keeps the band moving. The spotlit Hum is drawn a touch bigger.
          var lift = Math.max(env.lift, greenroomAmbientLift(i, time));
          drawHum(gctx, spec, cell.x, cell.y, newest ? lay.size * 1.18 : lay.size, time, { noTrail: true, poke: lift, pokeSquash: env.squash });
          drawGreenroomName(gctx, spec, cell, lay, false, HUM_SEGMENTS);
        } else {
          drawHum(gctx, spec, cell.x, cell.y, lay.size, time, { sleeping: true });
          drawGreenroomName(gctx, spec, cell, lay, true, state.segments || 0);
        }
      }
      drawGreenroomSparks(gctx, time);
    } finally {
      ctx = saved;
    }
  }

  // Poke-to-sing: tap an awake Hum to fire its signature move and sing its track's
  // prime motif through voice.motif/wave/base (no new audio assets).
  function handleGreenroomPress(event) {
    if (!isGreenroomOpen() || !greenroomCanvas) return;
    var rect = greenroomCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var px = (event.clientX || 0) - rect.left;
    var py = (event.clientY || 0) - rect.top;
    if (px < 0 || py < 0 || px > rect.width || py > rect.height) return;
    var lay = greenroomLayout(rect.width, rect.height);
    var col = Math.floor(px / lay.cellW);
    var row = Math.floor(py / lay.cellH);
    if (col < 0 || col >= lay.cols || row < 0) return;
    var index = row * lay.cols + col;
    if (index < 0 || index >= HUM_IDS.length) return;
    var spec = findHumSpec(HUM_IDS[index]);
    if (!spec) return;
    var state = (campaignSave.hums && campaignSave.hums[HUM_IDS[index]]) || { awake: false };
    if (!state.awake) return; // silhouettes stay quiet until their Finale wakes them
    greenroomPokeAt[index] = typeof lastTime === "number" ? lastTime : 0;
    vibrate("tap");
    var cell = greenroomCellCenter(lay, index);
    emitGreenroomSparks(cell.x, cell.y, (spec.palette && spec.palette.primary) || "#ffffff");
    if (!audio.started) startAudio(event);
    singHum(spec);
  }

  // Sing one Hum's prime motif: walk voice.motif over voice.base with the palette
  // scale (so all sixteen sing in one key), voice.wave timbre, durations in 16th
  // steps off the active BPM. Reuses playTone only; no new audio assets.
  function singHum(spec) {
    if (!spec || !spec.voice || !audio.ctx || !audio.master) return;
    var voice = spec.voice;
    var motif = voice.motif;
    if (!motif || !Array.isArray(motif.deg) || !Array.isArray(motif.dur)) return;
    var wave = voice.wave || "triangle";
    var base = voice.base > 0 ? voice.base : getBaseFreq();
    var stepSeconds = (60 / getActiveBpm()) / 4;
    var n = Math.min(motif.deg.length, motif.dur.length);
    var t = audio.ctx.currentTime + 0.03;
    for (var i = 0; i < n; i += 1) {
      var freq = base * Math.pow(2, getScaleDegreeSemitone(motif.deg[i]) / 12);
      var slot = Math.max(1, motif.dur[i]) * stepSeconds;
      var pan = n > 1 ? -0.3 + (i / (n - 1)) * 0.6 : 0;
      playTone(freq, t, slot * AUDIO_TUNING.motifNoteDurScale, wave, 0.055, pan, 3200);
      t += slot;
    }
  }

  // Finale wake ritual, drawn over the win card. Beat 1: complete the sleeping
  // outline (whitening). Beat 2: the full Hum is born from light, its stroke
  // lerping white->palette while a white glow backing fades. Then it blinks once
  // and, once alive, takes its first beat-bounce off the audio clock. All phases
  // are clocked to getCelebrationBeatMs(). Degrades to nothing if the spec is
  // missing. Pure cosmetic: never touches board or save state.
  // Shared center-stage anchor for the wake ritual and its born-from-light burst,
  // so the outline, the Hum, the spotlight, and the particle flourish all line up.
  // Sits high-center, above the LEVEL CLEAR title, and larger than the cameo so
  // the wake reads as a headline moment, not a corner pop.
  function humWakeAnchor() {
    return { cx: centerBoardX(), cy: view.boardY + view.cell * 1.15, size: view.cell * 1.55 };
  }

  // One-shot born-from-light flourish for the Finale / early first wake: a white
  // bloom shockwave plus a palette ray burst, fired once as the Hum takes form.
  // Reuses addShockwave / addFinaleParticles, so it is budgeted through fxScale
  // and effectLimit like every other pop. Pure cosmetic.
  function fireHumWakeBurst(wake) {
    var spec = findHumSpec(wake.humId);
    var color = (spec && spec.palette && spec.palette.primary) || "#ffffff";
    var anchor = humWakeAnchor();
    addShockwave(anchor.cx, anchor.cy, "#ffffff", view.cell * 0.32, view.boardSize * 0.6, 0.5, 20);
    addShockwave(anchor.cx, anchor.cy, color, view.cell * 0.16, view.boardSize * 0.42, 0.42, 14);
    addFinaleParticles(anchor.cx, anchor.cy, color, 3);
  }

  function drawHumWake(wake, time) {
    var spec = findHumSpec(wake.humId);
    if (!spec || !spec.body) return;
    var appear = Math.max(0, Math.min(1, wake.alpha || 0));
    if (appear <= 0) return;
    var beatS = Math.max(0.12, (wake.beatMs || 480) / 1000);
    var age = wake.age || 0;
    var body = spec.body;
    var primary = (spec.palette && spec.palette.primary) || "#ffffff";
    var anchor = humWakeAnchor();
    var cx = anchor.cx, cy = anchor.cy, size = anchor.size;
    var radius = size * (body.radius || 1);
    var coreWidth = Math.max(1.5, size * 0.05 * (body.stroke || 1));

    ctx.save();
    ctx.globalAlpha = appear;
    // Center-stage spotlight: a soft radial wash behind the Hum that swells as it
    // is born, so the wake reads as a lit stage, not a quiet corner pop.
    if (fxScale() > 0.2) {
      var lit = Math.min(1, age / beatS);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = appear * (0.12 + 0.18 * lit);
      var grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 2.6);
      grad.addColorStop(0, mixColor(primary, "#ffffff", 0.6));
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    if (age < beatS) {
      // Beat 1: draw the outline in from the sleeping progress to full, whitening.
      var p = wake.fromProgress + (1 - wake.fromProgress) * humEase("easeOutCubic")(age / beatS);
      var col = mixColor(primary, "#ffffff", 0.5 + 0.5 * (age / beatS));
      ctx.translate(cx, cy);
      drawHumOutlineProgress(ctx, body, radius, col, coreWidth, Math.min(1, p));
    } else {
      var t2 = age - beatS;
      var born = Math.max(0, 1 - t2 / beatS);   // 1..0 over the born-from-light beat
      var eyeOpen, still;
      if (t2 < beatS) { eyeOpen = 0; still = true; }                 // being born, eyes shut, holding
      else if (t2 < beatS * 1.6) {                                    // blink once: eyes open
        eyeOpen = humEase("easeOutBack")(Math.min(1, (t2 - beatS) / (beatS * 0.6)));
        still = true;
      } else { eyeOpen = null; still = false; }                       // alive: dance
      // Once alive, sway side to side and add a beat-locked lift so the wake ends
      // on a celebration move, not a static idle. Both fold onto drawHum's own
      // beat bounce; danceX offsets the draw x, poke feeds the signature lift.
      var danceX = 0, poke = 0;
      if (!still) {
        var since = t2 - beatS * 1.6;
        danceX = Math.sin(since * Math.PI * 1.6) * size * 0.16;
        poke = Math.max(0, Math.sin(((since / beatS) % 1) * Math.PI)) * 0.5;
      }
      drawHum(ctx, spec, cx + danceX, cy, size, time, { born: born, eyeOpen: eyeOpen, still: still, poke: poke, pokeSquash: poke });
    }
    ctx.restore();
  }

  // Corner-groove cameo, drawn over the standard (non-Finale) win card. The woken
  // track Hum idles in a board corner via drawHum, beat-locked to the audio step
  // clock the celebration beat derives from, and takes an amplified one-shot hop
  // (cameo.hop -> poke) on every encore blast. Clear of the center pops; its trail
  // routes through emitHumTrail's scaledEffectCount budget. Degrades to nothing if
  // the spec is missing. Never touches board or save state.
  function drawHumCameo(cameo, time) {
    var spec = findHumSpec(cameo.humId);
    if (!spec || !spec.body) return;
    var appear = Math.max(0, Math.min(1, cameo.alpha || 0));
    if (appear <= 0) return;
    var size = view.cell * 1.05;
    var cx = view.boardX + view.boardSize - size * 1.15;
    var cy = view.boardY + view.boardSize - size * 1.15;
    var hop = Math.max(0, Math.min(1.2, cameo.hop || 0));
    ctx.save();
    ctx.globalAlpha = appear;
    drawHum(ctx, spec, cx, cy, size, time, { poke: hop, pokeSquash: hop });
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    particles.forEach(function (p) {
      if (p.delay > 0) return;
      var alpha = Math.max(0, p.life / p.ttl);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = p.color;
      ctx.fillStyle = p.color;
      if (p.vector) {
        drawVectorParticle(p, alpha);
      } else if (p.line) {
        var speed = Math.hypot(p.vx, p.vy);
        var tail = Math.min(Math.max(speed * 0.06, 4), view.cell * 0.6);
        var inv = tail / Math.max(speed, 0.001);
        ctx.globalAlpha = Math.pow(Math.min(1, Math.min((p.life / p.ttl) * 2, speed / 140)), 2);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * inv, p.y - p.vy * inv);
        strokeNeonPath(p.color, 1.5);
      } else {
        if (neonDetail()) {
          ctx.globalAlpha = alpha * 0.22;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = alpha;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  function drawVectorParticle(p, alpha) {
    var size = p.size * (2.4 + alpha * 1.7);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation || 0);
    ctx.globalAlpha = Math.min(0.9, alpha * 0.82);
    polygon(p.sides || 3, size, -Math.PI / 2);
    strokeNeonPath(p.color, Math.max(1, p.size * 0.34));
    ctx.globalAlpha *= 0.42;
    ctx.beginPath();
    ctx.moveTo(-size * 0.56, 0);
    ctx.lineTo(size * 0.56, 0);
    ctx.moveTo(0, -size * 0.56);
    ctx.lineTo(0, size * 0.56);
    ctx.stroke();
    ctx.restore();
  }

  function drawRays() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    rays.forEach(function (ray) {
      var alpha = Math.max(0, ray.life / ray.ttl);
      var inner = ray.length * 0.24;
      var outer = ray.length;
      var x1 = ray.x + Math.cos(ray.angle) * inner;
      var y1 = ray.y + Math.sin(ray.angle) * inner;
      var x2 = ray.x + Math.cos(ray.angle) * outer;
      var y2 = ray.y + Math.sin(ray.angle) * outer;
      ctx.globalAlpha = alpha * 0.88;
      strokeNeon(function () {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }, ray.color, ray.width);
    });
    ctx.restore();
  }

  function drawShockwaves() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    shockwaves.forEach(function (wave) {
      if (wave.delay > 0) return;
      var alpha = Math.max(0, wave.life / wave.ttl);
      var spokes = wave.spokes || 0;
      ctx.globalAlpha = alpha * 0.72;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
      strokeNeonPath(wave.color, Math.max(2, view.cell * 0.035 * alpha));

      if (spokes > 0) {
        ctx.globalAlpha = alpha * 0.44;
        ctx.beginPath();
        for (var i = 0; i < spokes; i += 1) {
          var angle = (Math.PI * 2 * i) / spokes;
          ctx.moveTo(
            wave.x + Math.cos(angle) * wave.radius * 0.35,
            wave.y + Math.sin(angle) * wave.radius * 0.35
          );
          ctx.lineTo(
            wave.x + Math.cos(angle) * wave.radius * 1.08,
            wave.y + Math.sin(angle) * wave.radius * 1.08
          );
        }
        strokeNeonPath(wave.color, Math.max(1, view.cell * 0.014));
      }
    });
    ctx.restore();
  }

  function drawFloaters(time) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    var blur = glowBlur(20);
    floaters.forEach(function (floater) {
      var alpha = Math.max(0, floater.life / floater.ttl);
      var size = Math.max(13, Math.min(34, floater.size * floater.scale));
      ctx.globalAlpha = Math.min(1, alpha * 1.25);
      ctx.font = "900 " + size + "px Inter, ui-sans-serif, system-ui, sans-serif";
      ctx.shadowBlur = blur;
      ctx.shadowColor = floater.color;
      ctx.lineWidth = Math.max(3, size * 0.18);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.78)";
      ctx.fillStyle = floater.value ? "#ffffff" : floater.color;
      ctx.strokeText(floater.text, floater.x, floater.y);
      ctx.fillText(floater.text, floater.x, floater.y);
    });

    if (activeCallout) {
      var calloutAlpha = Math.max(0, activeCallout.life / activeCallout.ttl);
      var calloutSize = Math.max(13, Math.min(34, activeCallout.size * activeCallout.scale));
      var calloutX = centerBoardX();
      var calloutY = calloutAnchorY();
      ctx.globalAlpha = Math.min(1, calloutAlpha * 1.6);
      ctx.font = "900 " + calloutSize + "px Inter, ui-sans-serif, system-ui, sans-serif";
      ctx.shadowBlur = blur;
      ctx.shadowColor = activeCallout.color;
      ctx.lineWidth = Math.max(3, calloutSize * 0.18);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.78)";
      ctx.fillStyle = activeCallout.color;
      ctx.strokeText(activeCallout.text, calloutX, calloutY);
      ctx.fillText(activeCallout.text, calloutX, calloutY);
    }

    if (celebration && celebration.pops.length > 0) {
      celebration.pops.forEach(function (pop) {
        var pos = getCelebrationPopPosition(pop);
        var popSize = pop.kind === "star"
          ? Math.max(18, view.cell * 0.92 * pop.scale)
          : Math.max(16, Math.min(pop.kind === "title" ? 38 : 30, (pop.kind === "title" ? 34 : 27) * pop.scale));
        ctx.globalAlpha = Math.max(0, Math.min(1, pop.alpha));
        ctx.font = "900 " + popSize + "px Inter, ui-sans-serif, system-ui, sans-serif";
        ctx.shadowBlur = blur;
        ctx.shadowColor = pop.color;
        ctx.lineWidth = Math.max(3, popSize * 0.18);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.78)";
        ctx.fillStyle = pop.color;
        ctx.strokeText(pop.text, pos.x, pos.y);
        ctx.fillText(pop.text, pos.x, pos.y);
      });
    }

    if (celebration && celebration.wake) drawHumWake(celebration.wake, time);
    if (celebration && celebration.cameo) drawHumCameo(celebration.cameo, time);

    ctx.restore();
  }

  function drawCellFlashes() {
    // Footprint flash draw: a fading color fill plus white outline on each cell a
    // special/fusion just cleared. Mirrors the armed-preview footprint look so the
    // "what will clear" preview and the "what did clear" flash read the same.
    if (cellFlashes.length === 0) return;
    ctx.save();
    for (var i = 0; i < cellFlashes.length; i += 1) {
      var flashCell = cellFlashes[i];
      var alpha = Math.max(0, flashCell.life / flashCell.ttl);
      var eased = alpha * alpha;
      var px = view.boardX + flashCell.col * view.cell;
      var py = view.boardY + flashCell.row * view.cell;
      ctx.globalAlpha = eased * 0.5;
      ctx.fillStyle = flashCell.color;
      ctx.fillRect(px + 3, py + 3, view.cell - 6, view.cell - 6);
      ctx.globalAlpha = Math.min(1, eased * 1.05);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = Math.max(1.5, view.cell * 0.05);
      ctx.strokeRect(px + 5, py + 5, view.cell - 10, view.cell - 10);
    }
    ctx.restore();
  }

  function drawBeams() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    beams.forEach(function (beam) {
      if (beam.delay > 0) return;
      var alpha = Math.max(0, beam.life / beam.ttl);
      ctx.globalAlpha = alpha * 0.86;

      if (beam.special === "sweep") {
        // Nova color-sweep tendril: a warped line from the nova to the swept
        // piece, riding the same lattice-warp field as the background grid.
        var age = beam.ttl - beam.life;
        ctx.globalAlpha = alpha * 0.4;
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = Math.max(2, beam.width * 0.9);
        drawWarpedLine(beam.x, beam.y, beam.tx, beam.ty, 4, age * 4, 7);
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(1, beam.width * 0.3);
        drawWarpedLine(beam.x, beam.y, beam.tx, beam.ty, 4, age * 4, 7);
        ctx.beginPath();
        ctx.arc(beam.tx, beam.ty, Math.max(3, view.cell * 0.24 * (1 - alpha * 0.5)), 0, Math.PI * 2);
        strokeNeonPath(beam.color, Math.max(1.5, beam.width * 0.35));
        return;
      }

      if (beam.special === "lineH" || beam.special === "lineV") {
        ctx.beginPath();
        if (beam.special === "lineH") {
          ctx.moveTo(view.boardX, beam.y);
          ctx.lineTo(view.boardX + view.boardSize, beam.y);
        } else {
          ctx.moveTo(beam.x, view.boardY);
          ctx.lineTo(beam.x, view.boardY + view.boardSize);
        }
        ctx.globalAlpha = alpha * 0.3;
        strokeNeonPath(beam.color, Math.max(2, beam.width * 1.7));
        ctx.globalAlpha = alpha * 0.95;
        strokeNeonPath("#ffffff", Math.max(1, beam.width * 0.35));
      } else {
        var novaRadius = view.cell * (1.15 + (1 - alpha) * 1.25);
        ctx.beginPath();
        ctx.arc(beam.x, beam.y, novaRadius, 0, Math.PI * 2);
        strokeNeonPath(beam.color, Math.max(2, beam.width * 0.42));

        ctx.globalAlpha = alpha * 0.28;
        ctx.beginPath();
        ctx.arc(beam.x, beam.y, novaRadius * 0.7, 0, Math.PI * 2);
        strokeNeonPath(beam.color, Math.max(2, beam.width * 0.42));
      }
    });
    ctx.restore();
  }

  function ensureVignetteGradient() {
    if (vignetteGradient) return;
    var cx = view.width / 2;
    var cy = view.boardY + view.boardSize / 2;
    vignetteGradient = ctx.createRadialGradient(cx, cy, view.boardSize * 0.3, cx, cy, Math.max(view.width, view.height) * 0.66);
    vignetteGradient.addColorStop(0, "rgba(0,0,0,0)");
    vignetteGradient.addColorStop(0.6, "rgba(2,4,12,0.22)");
    vignetteGradient.addColorStop(1, "rgba(0,1,6,0.62)");
  }

  function drawVignette() {
    ensureVignetteGradient();
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, view.width, view.height);
  }

  function setAudioButtonFace(label, state) {
    audioButton.textContent = label;
    audioButton.setAttribute("aria-label", label);
    audioButton.setAttribute("data-audio-state", state);
  }

  function startAudio(event) {
    var stamp = Date.now();
    if (stamp - audio.unlockStamp < 180 && audio.ctx && audio.ctx.state === "running") return;
    audio.unlockStamp = stamp;

    if (!ensureAudioGraph()) {
      setAudioButtonFace("No Audio", "off");
      audioButton.disabled = true;
      return;
    }

    var resumeResult = null;
    try {
      if (audio.ctx.resume) resumeResult = audio.ctx.resume();
      playUnlockChirp();
    } catch (error) {
      setAudioButtonFace("Tap Audio", "unlock");
      audioButton.disabled = false;
      return;
    }

    applyAudioPalette();
    audio.started = true;
    audioButton.disabled = false;
    updateAudioButtonState();
    startClock();

    if (resumeResult && typeof resumeResult.then === "function") {
      resumeResult.then(function () {
        playUnlockChirp();
        updateAudioButtonState();
      }).catch(function () {
        setAudioButtonFace("Tap Audio", "unlock");
        audioButton.disabled = false;
      });
    } else {
      updateAudioButtonState();
    }
  }

  function ensureAudioGraph() {
    if (audio.ctx) return true;
    var palette = getMusicPalette();
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;

    audio.ctx = new AudioContext();
    audio.master = audio.ctx.createGain();
    audio.compressor = audio.ctx.createDynamicsCompressor();
    audio.delay = audio.ctx.createDelay(0.8);
    audio.feedback = audio.ctx.createGain();
    audio.wet = audio.ctx.createGain();
    audio.macro = audio.ctx.createBiquadFilter();
    audio.macro.type = "lowpass";
    audio.macro.frequency.value = AUDIO_TUNING.macroCeilHz;
    audio.macro.Q.value = 0.5;
    audio.duck = audio.ctx.createGain();
    audio.duck.gain.value = 1;
    // Arrangement bus: sits below master so level-transition fades ride here and
    // never fight the per-step master re-assertion (applyPulseDangerMix/setVolume).
    audio.bed = audio.ctx.createGain();
    audio.bed.gain.value = 1;
    audio.impact = audio.ctx.createGain();
    audio.impact.gain.value = audio.muted ? 0 : audio.volume * AUDIO_TUNING.impactLevel;
    audio.master.gain.value = audio.muted ? 0 : audio.volume * 0.72;
    audio.compressor.threshold.value = -18;
    audio.compressor.knee.value = 18;
    audio.compressor.ratio.value = 5;
    audio.compressor.attack.value = 0.006;
    audio.compressor.release.value = 0.18;
    audio.delay.delayTime.value = getDelaySeconds();
    audio.feedback.gain.value = palette.feedbackBase;
    audio.wet.gain.value = palette.delayBase;
    audio.delay.connect(audio.feedback);
    audio.feedback.connect(audio.delay);
    audio.delay.connect(audio.wet);
    audio.wet.connect(audio.master);
    audio.master.connect(audio.bed);
    audio.bed.connect(audio.macro);
    audio.macro.connect(audio.duck);
    audio.duck.connect(audio.compressor);
    audio.impact.connect(audio.compressor);
    audio.compressor.connect(audio.ctx.destination);

    // Voice-character shared infrastructure (seq 4). One persistent triangle LFO drives a
    // slow chorus on pwm/stack detune (connected per-note to osc.detune; the edge dies with
    // the note). Pulse PeriodicWaves are precomputed per duty so no musical note ever
    // allocates a wave. Pure procedural, no sample assets.
    audio.pulseWaves = {};
    audio.pwmLfo = audio.ctx.createOscillator();
    audio.pwmLfo.type = "triangle";
    audio.pwmLfo.frequency.value = AUDIO_TUNING.voicePwmMotionHz;
    audio.pwmLfoGain = audio.ctx.createGain();
    audio.pwmLfoGain.gain.value = AUDIO_TUNING.voicePwmMotionCents;
    audio.pwmLfo.connect(audio.pwmLfoGain);
    audio.pwmLfo.start();
    for (var vkey in VOICE_CHARACTERS) {
      if (VOICE_CHARACTERS.hasOwnProperty(vkey) && VOICE_CHARACTERS[vkey].type === "pwm" && typeof VOICE_CHARACTERS[vkey].duty === "number") {
        getPulseWave(VOICE_CHARACTERS[vkey].duty);
      }
    }

    // Vinyl crackle bed (music genres seq 4): one persistent looped-noise texture behind the
    // whole mix, gated to silence by default. applyAudioGenre() lifts its gain only for
    // trip-hop, so the other three genres pay nothing for it. It starts once here and lives
    // with the graph (no per-note allocation, so nothing to stop()/GC per step).
    audio.vinyl = audio.ctx.createBufferSource();
    audio.vinyl.buffer = getNoiseBuffer();
    audio.vinyl.loop = true;
    audio.vinylFilter = audio.ctx.createBiquadFilter();
    audio.vinylFilter.type = "lowpass";
    audio.vinylFilter.frequency.value = AUDIO_TUNING.vinylNoiseCutoff;
    audio.vinylGain = audio.ctx.createGain();
    audio.vinylGain.gain.value = 0;
    audio.vinyl.connect(audio.vinylFilter);
    audio.vinylFilter.connect(audio.vinylGain);
    audio.vinylGain.connect(audio.master);
    audio.vinyl.start();
    applyAudioGenre(); // honor a persisted non-electronic genre on reload (lifts the bed if trip-hop)

    if (audio.ctx.addEventListener) {
      audio.ctx.addEventListener("statechange", updateAudioButtonState);
    }
    return true;
  }

  function playUnlockChirp() {
    if (!audio.ctx || !audio.master) return;
    var start = audio.ctx.currentTime + 0.01;
    playTone(getHarmonyToneFreq(audio.step, 0, 1), start, 0.12, "sine", 0.045, 0, 2200);
    playTone(getHarmonyToneFreq(audio.step, 3, 1), start + 0.055, 0.1, "triangle", 0.032, 0, 2800);
  }

  function updateAudioButtonState() {
    if (!audio.ctx) {
      setAudioButtonFace("Sound On", "on");
      audioButton.disabled = false;
      audioButton.classList.remove("is-muted");
      return;
    }
    if (audio.ctx.state === "running") {
      setAudioButtonFace(audio.muted ? "Muted" : "Sound On", audio.muted ? "muted" : "on");
      audioButton.disabled = false;
      audioButton.classList.toggle("is-muted", audio.muted);
      return;
    }
    setAudioButtonFace("Tap Audio", "unlock");
    audioButton.disabled = false;
    audioButton.classList.remove("is-muted");
  }

  function setMuted(value) {
    audio.muted = Boolean(value);
    settings.muted = audio.muted;
    writeSettings();
    if (audio.ctx && audio.master) {
      var masterParam = audio.master.gain;
      var now = audio.ctx.currentTime;
      masterParam.cancelScheduledValues(now);
      masterParam.setValueAtTime(masterParam.value, now);
      masterParam.setTargetAtTime(audio.muted ? 0 : audio.volume * 0.72, now, 0.06);
    }
    if (audio.ctx && audio.impact) {
      audio.impact.gain.setTargetAtTime(audio.muted ? 0 : audio.volume * AUDIO_TUNING.impactLevel, audio.ctx.currentTime, 0.06);
    }
    updateAudioButtonState();
  }

  function handleAudioButtonPress(event) {
    if (!audio.started || !audio.ctx || audio.ctx.state !== "running") {
      startAudio(event);
      return;
    }
    setMuted(!audio.muted);
  }

  function resumeAudioFromGesture() {
    if (!audio.started || !audio.ctx || audio.ctx.state === "running") return;
    try {
      var result = audio.ctx.resume ? audio.ctx.resume() : null;
      if (result && typeof result.then === "function") {
        result.then(updateAudioButtonState).catch(updateAudioButtonState);
      } else {
        updateAudioButtonState();
      }
    } catch (error) {
      updateAudioButtonState();
    }
  }

  function startClock() {
    if (audio.timer) return;
    audio.nextStepTime = audio.ctx.currentTime + 0.05;
    audio.step = 0;
    audio.timer = window.setInterval(scheduleAudio, 32);
  }

  function scheduleAudio() {
    if (!audio.ctx || !audio.started) return;
    if (audio.ctx.state && audio.ctx.state !== "running") {
      updateAudioButtonState();
      return;
    }
    var lookAhead = 0.13;
    var stepSeconds = (60 / getActiveBpm()) / 4;
    while (audio.nextStepTime < audio.ctx.currentTime + lookAhead) {
      scheduleStep(audio.nextStepTime, audio.step);
      audio.nextStepTime += stepSeconds;
      audio.step += 1;
    }
  }

  function getCampaignArrangement() {
    if (gameMode !== MODE_CAMPAIGN || !currentLevel) return null;
    if (levelState !== "playing") {
      if (levelState === "lost" && audio.failRamp) {
        // Out of moves ends the song softly: ease the arrangement floor down
        // to failFloorBase over failRampBeats instead of cutting the groove
        // dead while the board stays visible behind the fail callout.
        var ramp = audio.failRamp;
        var eased = Math.min(1, Math.max(0, (audio.step - ramp.step) / (AUDIO_TUNING.failRampBeats * 4)));
        return {
          progress: ramp.progress,
          floor: ramp.floor + (AUDIO_TUNING.failFloorBase - ramp.floor) * eased,
          cap: ramp.cap,
          tier: ramp.tier
        };
      }
      return null;
    }
    var progress = getOverallProgress();
    var floor = 0;
    for (var i = 0; i < AUDIO_TUNING.arrangeFloors.length; i += 1) {
      if (progress >= AUDIO_TUNING.arrangeFloors[i].progress) {
        floor = AUDIO_TUNING.arrangeFloors[i].floor;
        break;
      }
    }
    var chapter = ((currentLevel.id - 1) % 15) + 1;
    var tier = chapter <= 5 ? 0 : chapter <= 10 ? 1 : 2;
    var cap = 1;
    if (tier === 0) {
      floor *= AUDIO_TUNING.tier0FloorScale;
      cap = AUDIO_TUNING.tier0EnergyCap;
    } else if (tier === 2) {
      floor += AUDIO_TUNING.tier2FloorBonus;
    }
    // Genre density nudge (seq 5): add the genre floor bonus to the resolved
    // floor, clamped 0-1. Pop +0.06 keeps the bed present; trip-hop -0.04 opens
    // more space. Electronic/jazz-neutral leave it. The soft fail-ramp fade above
    // is left untouched so a lost song still eases to failFloorBase cleanly.
    floor = Math.max(0, Math.min(1, floor + getGenre().floorBonus));
    if (AUDIO_TUNING.continuousGroove && audio.carryFloor > 0) {
      // Carry the level-end energy across a continuous hand-off: open at the previous level's
      // floor and ease down over continuousCarryBars so the transition matches (no vibrant->
      // sparse drop) and then settles into this level's own progress-driven build.
      var carryEase = Math.max(0, 1 - (audio.step - audio.carryFloorStep) / (AUDIO_TUNING.continuousCarryBars * 16));
      floor = Math.max(floor, audio.carryFloor * carryEase);
    }
    return { progress: progress, floor: floor, cap: cap, tier: tier };
  }

  function updateDirectorEmas(dt) {
    // Iso-director inputs, updated in the game loop next to energy decay:
    // input rate is an EMA of the instantaneous moves/min; fail pressure is
    // set to 1 on a loss and decays linearly over failPressureDecay seconds.
    var d = audio.director;
    var moves = levelStats ? levelStats.movesMade : 0;
    if (moves < d.lastMoves) d.lastMoves = moves;
    var alpha = 1 - Math.pow(0.5, dt / AUDIO_TUNING.inputRateHalflife);
    d.inputRate += (((moves - d.lastMoves) / Math.max(dt, 0.001)) * 60 - d.inputRate) * alpha;
    d.lastMoves = moves;
    d.failPressure = Math.max(0, d.failPressure - dt / AUDIO_TUNING.failPressureDecay);
    refillSurpriseBudget(dt);
  }

  function tickDirector(step, arrange) {
    // Runs once per directorTickSteps inside the scheduler. Estimates the
    // player's arousal, slews the opener arousal toward the music state
    // (fast down, slow up), and sets the governor ceiling for this bar.
    var d = audio.director;
    var chain = levelStats ? levelStats.maxChain : 0;
    d.playerArousal = Math.max(0, Math.min(1,
      AUDIO_TUNING.arousalBase +
      AUDIO_TUNING.arousalRateWeight * Math.min(1, d.inputRate / AUDIO_TUNING.inputRateFull) +
      AUDIO_TUNING.arousalChainWeight * (chain / AUDIO_TUNING.arousalChainFull) -
      AUDIO_TUNING.arousalFailWeight * d.failPressure));
    var target = Math.max(arrange ? arrange.floor : 0, energy);
    if (d.currentArousal < target) d.currentArousal = Math.min(target, d.currentArousal + AUDIO_TUNING.isoSlewUp);
    else d.currentArousal = Math.max(target, d.currentArousal - AUDIO_TUNING.isoSlewDown);
    d.bias = d.currentArousal - target;
    var ceiling = 1;
    if ((Date.now() - d.sessionStart) / 60000 >= AUDIO_TUNING.fatigueMinutes) ceiling = Math.min(ceiling, AUDIO_TUNING.fatigueCeiling);
    if (isNightGovernorHour()) ceiling = Math.min(ceiling, AUDIO_TUNING.nightCeiling);
    if (isDirectorRecoveryActive(step)) {
      // Recovery take: open near-silent, rebuild +recoveryRebuildStep per 2 bars.
      ceiling = Math.min(ceiling, AUDIO_TUNING.recoveryCeiling + AUDIO_TUNING.recoveryRebuildStep * Math.floor(step / 32));
    }
    d.ceiling = ceiling;
  }

  function isDirectorRecoveryActive(step) {
    // Campaign only: Rush/Daily keep recovery and half-time off because the
    // pulse-danger mix owns the low state there (audio locks).
    return gameMode === MODE_CAMPAIGN && audio.director.recoveryUntilStep > 0 && step < audio.director.recoveryUntilStep;
  }

  function isNightGovernorHour() {
    var hour = debugDirectorHour != null ? debugDirectorHour : new Date().getHours();
    return hour >= AUDIO_TUNING.nightStartHour || hour < AUDIO_TUNING.nightEndHour;
  }

  function wantsHalfTimeFeel(step) {
    // Half-time entries: a recovery take (2+ fails) and the night governor's
    // first halfNightBars after a level start. Campaign only: Rush/Daily keep
    // half-time off because the pulse-danger heartbeat owns the low state
    // there (audio locks).
    if (gameMode !== MODE_CAMPAIGN) return false;
    // Forced half-time (trip-hop): reuse the entire shipped half-time path so 124
    // BPM FEELS ~62 (GROOVES.half, grooveHalf thinning, motifStretch x2,
    // halfHarmonySteps 64). Campaign-only, matching the audio locks; Rush/Daily
    // let the pulse-danger heartbeat own the low state and play straight-but-dark.
    if (getGenre().forceHalfTime && gameMode === MODE_CAMPAIGN) return true;
    if (isDirectorRecoveryActive(step)) return true;
    return isNightGovernorHour() && step < AUDIO_TUNING.halfNightBars * 16;
  }

  function refillSurpriseBudget(dt) {
    // RPE budget: refill +1 per surpriseRefillSeconds, surpriseFatigueSlow
    // slower once the fatigue governor engages. Scarcity keeps the surprises
    // rewarding instead of routine.
    var seconds = AUDIO_TUNING.surpriseRefillSeconds;
    if ((Date.now() - audio.director.sessionStart) / 60000 >= AUDIO_TUNING.fatigueMinutes) seconds *= AUDIO_TUNING.surpriseFatigueSlow;
    audio.surprise.budget = Math.min(AUDIO_TUNING.surpriseMax, audio.surprise.budget + dt / seconds);
  }

  function trySpendSurprise(kind) {
    // Spend gate: budget >= cost, >= surpriseMinGapBars since the last spend,
    // never during the reveal hold, a recovery take, or a half-time feel.
    var cost = AUDIO_TUNING.surpriseCosts[kind];
    var s = audio.surprise;
    if (!audio.started || cost == null || s.budget < cost) return false;
    var barNow = Math.floor(audio.step / 16);
    if (barNow - s.lastSpendBar < AUDIO_TUNING.surpriseMinGapBars) return false;
    if (audio.step < audio.revealUntilStep) return false;
    if (isDirectorRecoveryActive(audio.step) || audio.director.grooveOverride) return false;
    s.budget -= cost;
    s.lastSpendBar = barNow;
    s.log.push({ bar: barNow, type: kind });
    if (s.log.length > 32) s.log.shift();
    if (window.NeonLatticeDebug && window.console && window.console.log) {
      window.console.log("[neon-lattice] surprise @bar " + barNow + ": " + kind);
    }
    return true;
  }

  function maybeSurpriseBorrowedPad() {
    // borrowedPad: stage a one-chord scale override; the next pad chord plays
    // the parallel pentatonic on the same root, then the home scale returns.
    if (!trySpendSurprise("borrowedPad")) return;
    audio.surprise.scaleOverride = getParallelPentatonic(getMusicScale());
  }

  function maybeSurpriseBorrowChord() {
    // borrowedChord: the whole-harmony sibling of borrowedPad. For one phrase the
    // entire spine (pad, bass, motif) borrows the parallel pentatonic via the
    // borrowUntilStep check in getScaleDegreeSemitone, then home returns. Rarer
    // and costlier than borrowedPad; a real reward-prediction-error moment. Fire
    // it at a phrase start so the borrow window aligns to the phrase grid.
    if (!trySpendSurprise("borrowedChord")) return;
    audio.surprise.borrowUntilStep = audio.step + AUDIO_TUNING.phraseBars * 16;
  }

  function maybeSurpriseOctaveMotif() {
    // octaveMotif: restate the hook +1 octave at x1.5 gain for one phrase.
    if (!trySpendSurprise("octaveMotif")) return;
    var base = null;
    audio.layers.forEach(function (layer) {
      if (layer.persistent && layer.motif && !layer.polyloop) base = layer;
    });
    var motif = base ? base.motif : getTrackMotif();
    var gain = (base ? base.gain : AUDIO_TUNING.motifGainByTier[0]) * AUDIO_TUNING.surpriseMotifGainScale;
    audio.layers.push({
      motif: motifOctave(motif, 1),
      wave: getMusicPalette().leadWave,
      gain: Math.min(0.05, gain),
      pan: 0.18,
      filter: 4600,
      expiresAt: audio.step + AUDIO_TUNING.phraseBars * 16
    });
  }

  function updateGrooveGate(name, onThreshold, effectiveEnergy) {
    // Hysteresis pair: a part enters above its gate but exits only below
    // gate - gateHysteresis, so energy hovering at a threshold cannot flap
    // the instrument in and out between bars. Base kick stays ungated.
    // Genre density nudge (seq 5): shift the gate by the genre's gateShift.
    // Pop -0.1 lowers the gate so parts enter sooner (fuller mix); trip-hop
    // +0.12 raises it so they hold out longer (sparser). Electronic 0 no-op.
    var shifted = onThreshold + getGenre().gateShift;
    var engaged = audio.gateState[name]
      ? effectiveEnergy >= shifted - AUDIO_TUNING.gateHysteresis
      : effectiveEnergy > shifted;
    audio.gateState[name] = engaged;
    return engaged;
  }

  function applyHabituationMutation(mutationBar, palette) {
    // Exactly one surface mutation per jittered window: hats rotate on a copy,
    // the delay wet drifts within palette bounds, or the motif re-rolls its Rot
    // operator. The kick pattern is never touched (audio lock).
    var rng = audio.mutation.rng;
    var pick = Math.floor(rng() * 3);
    if (pick === 2 && !audio.levelMotif) pick = Math.floor(rng() * 2);
    var label;
    if (pick === 0) {
      var hats = audio.mutation.hatPattern || palette.groove.hat;
      audio.mutation.hatPattern = hats.map(function (s) { return (s + 1) % 16; });
      label = "hat-rotate";
    } else if (pick === 1) {
      var nudge = rng() < 0.5 ? -AUDIO_TUNING.mutateDelayWetNudge : AUDIO_TUNING.mutateDelayWetNudge;
      var drift = audio.mutation.delayWetOffset + nudge;
      drift = Math.max(-AUDIO_TUNING.mutateDelayWetRange, Math.min(AUDIO_TUNING.mutateDelayWetRange, drift));
      audio.mutation.delayWetOffset = Math.max(-palette.delayBase, drift);
      label = "delay-wet";
    } else {
      // Re-roll from the level variant every time so rotations never accumulate.
      var base = audio.levelMotif.motif;
      var rot = 1 + Math.floor(rng() * Math.max(1, base.deg.length - 1));
      var rolled = clampMotifDegrees(motifRotate(base, rot));
      audio.layers.forEach(function (layer) {
        if (layer.persistent && layer.motif && !layer.polyloop) layer.motif = rolled;
      });
      label = "motif-rot" + rot;
    }
    audio.mutation.log.push({ bar: mutationBar, type: label });
    if (audio.mutation.log.length > 32) audio.mutation.log.shift();
    if (window.NeonLatticeDebug && window.console && window.console.log) {
      window.console.log("[neon-lattice] mutation @bar " + mutationBar + ": " + label);
    }
  }

  function layerSessionFade(layer) {
    // Session-gated bloom (Music Variety item 5). A layer with sessionOnsetMin reads 0 until
    // the whole session (director.sessionStart, set once at graph create) is long enough, then
    // ramps to full over rampMinutes and persists. Lands before the fatigue governor lowers the
    // ceiling, so the track deepens first, then the ceiling caps the top: one long arc. Unset
    // layers (all shipped polyloops) return 1, so their gain is unchanged.
    if (layer.sessionOnsetMin == null) return 1;
    var minutes = (Date.now() - audio.director.sessionStart) / 60000;
    var ramp = layer.rampMinutes > 0 ? layer.rampMinutes : 1;
    var fade = (minutes - layer.sessionOnsetMin) / ramp;
    return fade < 0 ? 0 : fade > 1 ? 1 : fade;
  }

  function scheduleStep(time, step) {
    audio.layers = audio.layers.filter(function (layer) {
      return layer.expiresAt > step;
    });
    updateHud();

    var pulseDanger = getPulseDangerAmount();
    var audioDrive = getVisualDrive();
    var palette = getMusicPalette();
    var arrange = getCampaignArrangement();
    // Remember the live playing floor so a continuous hand-off can open the next level at the
    // energy this one is ending on (see the carry in getCampaignArrangement + resetMusicPhrase).
    if (arrange && levelState === "playing") audio.lastArrangeFloor = arrange.floor;
    if (step % AUDIO_TUNING.directorTickSteps === 0) tickDirector(step, arrange);
    var dir = audio.director;
    var dirBias = Math.max(-AUDIO_TUNING.directorBiasMax, Math.min(AUDIO_TUNING.directorBiasMax, dir.bias));
    // Genre density nudge (seq 5): fold the genre energy cap into the clamp so
    // trip-hop 0.72 stays laid-back even at climax and jazz 0.9 stays cool.
    // Electronic/pop 1.0 is a no-op. Applied in both campaign and Rush/Daily
    // branches, so trip-hop reads dark in every mode (half-time is still campaign-only).
    var genreEnergyCap = getGenre().energyCap;
    var effectiveEnergy = arrange
      ? Math.max(0, Math.min(Math.min(arrange.cap, dir.ceiling), genreEnergyCap, Math.max(energy, arrange.floor) + dirBias))
      : Math.max(0, Math.min(dir.ceiling, genreEnergyCap, energy + dirBias));
    audio.effectiveEnergy = effectiveEnergy;
    if (arrange && arrange.progress >= AUDIO_TUNING.climaxProgress) {
      if (audio.climaxStep < 0) audio.climaxStep = step;
    } else {
      audio.climaxStep = -1;
    }
    // doubleHarmony surprise: goal progress crossing 0.75 doubles the harmonic
    // rate (getHarmonyRootIndex advances every surpriseHarmonySteps) for one
    // phrase via a temporary phrase-length override.
    if (arrange) {
      if (audio.surprise.lastProgress < 0.75 && arrange.progress >= 0.75 && trySpendSurprise("doubleHarmony")) {
        audio.surprise.harmony = { steps: AUDIO_TUNING.surpriseHarmonySteps, untilStep: step + AUDIO_TUNING.phraseBars * 16 };
      }
      audio.surprise.lastProgress = arrange.progress;
    }
    if (audio.wet && audio.feedback) {
      audio.wet.gain.setTargetAtTime(Math.max(0, palette.delayBase + audio.mutation.delayWetOffset + audioDrive * palette.delayDrive) * (1 - pulseDanger * 0.48), time, 0.05);
      audio.feedback.gain.setTargetAtTime(Math.max(0, (palette.feedbackBase + audioDrive * palette.feedbackDrive) * (1 - pulseDanger * 0.35) + (audio.levelDrift ? audio.levelDrift.feedbackNudge : 0)), time, 0.05);
    }
    if (audio.macro) {
      var macroIntensity = Math.min(1, energy * AUDIO_TUNING.macroEnergyWeight + audioDrive * AUDIO_TUNING.macroDriveWeight + (drive >= OVERDRIVE_THRESHOLD ? AUDIO_TUNING.macroOverdriveBoost : 0));
      if (audio.climaxStep >= 0) {
        macroIntensity = Math.max(macroIntensity, Math.min(1, (step - audio.climaxStep) / AUDIO_TUNING.climaxSweepSteps));
      }
      var macroCutoff = AUDIO_TUNING.macroFloorHz * Math.pow(AUDIO_TUNING.macroCeilHz / AUDIO_TUNING.macroFloorHz, Math.pow(macroIntensity, AUDIO_TUNING.macroCurve));
      audio.macro.frequency.setTargetAtTime(macroCutoff, time, AUDIO_TUNING.macroGlide);
    }
    applyPulseDangerMix(time, pulseDanger);

    var stepSeconds = (60 / getActiveBpm()) / 4;
    var bar = step % 16;
    // Half-time feel: the groove override swaps in GROOVES.half and changes
    // only at phrase boundaries, so the palette groove never returns mid-phrase.
    if (bar === 0 && getPhraseBar(step) === 0) {
      dir.grooveOverride = wantsHalfTimeFeel(step) ? GROOVES.half : null;
    }
    var g = dir.grooveOverride || getActiveGroove();
    // Genre swing: take the wider of the palette swing and the genre swing floor,
    // capped at the genre's own swingMax (itself clamped to genreSwingMaxJazz).
    // Electronic (swingMax unset) falls back to the shipped grooveSwingMax, so its
    // feel is byte-for-byte unchanged. Jazz 0.42 pushes the off-16th toward the
    // triplet shuffle; trip-hop 0.2 is a gentler drag; pop 0.08 is near-straight.
    var genre = getGenre();
    var swingAmt = Math.max(g.swing || 0, genre.swing || 0);
    var swingCap = genre.swingMax != null ? Math.min(genre.swingMax, AUDIO_TUNING.genreSwingMaxJazz) : AUDIO_TUNING.grooveSwingMax;
    var swung = bar % 2 === 1 ? time + Math.min(swingAmt, swingCap) * stepSeconds : time;
    // Genre snare drag: a laid-back snare lands a hair behind the grid (jazz 6ms,
    // trip-hop 14ms) while kick + hat stay locked. Electronic/pop drag 0 = no-op.
    var snareTime = swung + Math.min(genre.snareDragMs, AUDIO_TUNING.genreSnareDragMax) / 1000;
    if (step < audio.revealUntilStep) {
      // Sector-entry hold: pad, root drone, and motif only. The full groove lands at revealSteps;
      // the first kick there is the payoff, so nothing here fades into it.
      var holdStep = step - (audio.revealUntilStep - AUDIO_TUNING.revealSteps);
      if (holdStep === 0 || holdStep === 16) playPadChord(time);
      if (holdStep % 8 === 0) playTone(getBaseFreq(), time, stepSeconds * 4, palette.padWave, AUDIO_TUNING.revealDroneGain, 0, 900);
      var revealMotif = getTrackMotif();
      var revealIndex = getMotifNoteAt(revealMotif, holdStep % getMotifSpan(revealMotif));
      if (revealIndex !== -1) {
        playTone(getHarmonyToneFreq(step, revealMotif.deg[revealIndex], revealMotif.register || 1), time, stepSeconds * revealMotif.dur[revealIndex] * AUDIO_TUNING.motifNoteDurScale, palette.leadWave, AUDIO_TUNING.revealMotifGain, -0.3 + (revealIndex / Math.max(1, revealMotif.deg.length - 1)) * 0.6, 2600);
      }
      if (bar === 0) beatPulse = 1;
      return;
    }
    if (gameMode === MODE_CAMPAIGN && step < audio.bridgeUntilStep) {
      // Musical level-transition bridge: the next level opens drum-free. For bridgeIntroBars
      // the groove stays out while a per-palette pad swell + a lead turnaround figure resolve
      // to the tonic and a soft riser builds; the full groove re-enters on the downbeat at
      // bridgeUntilStep (the first kick there is the payoff). resetMusicPhrase anchors step 0
      // here, so bridgeUntilStep doubles as the bridge length. Reuses the one-shot playTone/
      // playNoise contract only (each note stops() and GCs; no persistent bridge nodes).
      var bridgeSteps = audio.bridgeUntilStep;
      // Pad swell once per bar on the tonic (root index 0 at step 0): getPadChordDegrees over
      // the palette pad voice, a long filtered bloom under the fill.
      if (bar === 0) {
        var padDegrees = getChordDegrees();
        var padVoice = genreVoice(palette, "padVoice");
        for (var pd = 0; pd < padDegrees.length; pd += 1) {
          playTone(getHarmonyToneFreq(step, padDegrees[pd], 0), time + pd * 0.02, stepSeconds * 12, palette.padWave, AUDIO_TUNING.bridgePadGain, -0.3 + pd * 0.22, 900 + pd * 220, null, padVoice);
        }
      }
      // Lead turnaround: space bridgeLeadFigure evenly across the bridge so its final degree
      // (0) lands on the last slot before the downbeat, resolving the fill onto the tonic.
      var figure = AUDIO_TUNING.bridgeLeadFigure;
      if (figure.length > 0) {
        var leadSlot = Math.max(1, Math.floor(bridgeSteps / figure.length));
        if (step % leadSlot === 0) {
          var figIndex = Math.floor(step / leadSlot);
          if (figIndex < figure.length) {
            playTone(getHarmonyToneFreq(step, figure[figIndex], 1), time, stepSeconds * leadSlot * AUDIO_TUNING.motifNoteDurScale, palette.leadWave, AUDIO_TUNING.bridgeLeadGain, -0.2 + (figIndex / Math.max(1, figure.length - 1)) * 0.4, 2600, null, genreVoice(palette, "leadVoice"));
          }
        }
      }
      // Soft noise riser building through the final bar into the downbeat.
      if (bridgeSteps >= 16 && step === bridgeSteps - 16) {
        playBridgeRiser(time, stepSeconds * 16);
      }
      if (bar === 0) beatPulse = 1;
      return;
    }
    if (bar === 0 && getPhraseBar(step) === 0) {
      // New call: transpose the motif toward the register the player answered in.
      if (audio.phrase.topDegree != null) {
        audio.phrase.callShift = Math.max(-AUDIO_TUNING.callPickupRange, Math.min(AUDIO_TUNING.callPickupRange, audio.phrase.topDegree - 2));
      }
      audio.phrase.topDegree = null;
    }
    // Habituation drift: one surface mutation every mutateBarsMin-mutateBarsMax
    // bars, checked at the half-bar so it never lands on a director tick step.
    // The reveal hold returns above, recovery skips here, and the kick pattern
    // never mutates (audio lock: the kick stays stable).
    if (bar === 8 && audio.mutation.rng && step % AUDIO_TUNING.directorTickSteps !== 0 && !isDirectorRecoveryActive(step)) {
      var mutationBar = Math.floor(step / 16);
      if (mutationBar >= audio.mutation.nextBar) {
        applyHabituationMutation(mutationBar, palette);
        audio.mutation.nextBar = nextMutationBar(audio.mutation.rng, mutationBar);
      }
    }
    var gateSnare = updateGrooveGate("snare", AUDIO_TUNING.grooveSnareGate, effectiveEnergy);
    var gateHat = updateGrooveGate("hat", AUDIO_TUNING.grooveHatGate, effectiveEnergy);
    var gateHat16 = updateGrooveGate("hat16", AUDIO_TUNING.grooveHat16Gate, effectiveEnergy);
    var gateBass = updateGrooveGate("bass", AUDIO_TUNING.grooveBassGate, effectiveEnergy);
    var gateKickHi = updateGrooveGate("kickHi", AUDIO_TUNING.grooveKickHiGate, effectiveEnergy);
    updateArrangementBands(step); // presentation: light the Voices meter + headline new layers as they join

    // Half-time feel (recovery takes, night-governor opens): GROOVES.half
    // carries kick-on-1 / snare-on-3; grooveHalf keeps the sparkle parts out.
    var grooveHalf = dir.grooveOverride != null;
    // Level-clear outro: once the level is won, hold the pad/bass/motif tail but drop the
    // drums so the hand-off gap is a soft harmonic wash, not a bare kick loop. The impact
    // bus is also ducked at win time; this stops new percussion being scheduled at all.
    // Continuous mode keeps the groove whole through the win (no drum drop-out at the
    // hand-off); the win sting rings over it. Otherwise drop drums for the harmonic-wash outro.
    var suppressDrums = !AUDIO_TUNING.continuousGroove && gameMode === MODE_CAMPAIGN && levelState === "won";
    if (!suppressDrums && g.kick.indexOf(bar) !== -1 && (!grooveHalf || bar % 8 === 0)) {
      playKick(time, 0.5 + effectiveEnergy * 0.35);
      if (bar === 0) beatPulse = 1;
    }
    if (!suppressDrums && g.kickHi && gateKickHi && !grooveHalf && g.kickHi.indexOf(bar) !== -1) {
      playKick(time, 0.28 + effectiveEnergy * 0.18);
    }
    if (step % 32 === 0) playPadChord(time);
    if (!suppressDrums && gateSnare && g.snare.indexOf(bar) !== -1 && (!grooveHalf || bar === 8)) {
      playSnare(snareTime, 0.16 + effectiveEnergy * 0.16);
    }
    if (arrange && bar >= 13 && !grooveHalf) {
      var fillEvery = audio.climaxStep >= 0 ? 2 : arrange.tier === 2 && arrange.progress > 0.5 ? 4 : 0;
      if (fillEvery > 0 && Math.floor(step / 16) % fillEvery === fillEvery - 1) {
        playSnare(snareTime, bar === 13 ? 0.1 : bar === 14 ? 0.12 : 0.16);
      }
    }
    // Habituation may rotate the hats on a private copy; GROOVES itself never mutates.
    var hatSteps = audio.mutation.hatPattern || g.hat;
    if (!suppressDrums && gateHat && hatSteps.indexOf(bar) !== -1 && (!grooveHalf || bar % 4 === 0)) {
      playHat(swung, 0.05 + effectiveEnergy * 0.07);
    }
    if (!suppressDrums && gateHat16 && !grooveHalf && hatSteps.indexOf(bar) === -1) {
      playHat(swung, 0.025 + effectiveEnergy * 0.035);
    }
    if (gateBass) {
      if (getGenre().bassMode === "walking") {
        // Jazz walking bass (music genres seq 2): ignore the palette syncopation; fire one
        // quarter-note walk step per beat (bar 0/4/8/12) approaching the next chord root.
        if (bar % 4 === 0) {
          playTone(getHarmonyToneFreq(step, getWalkingBassDegree(step) - getHarmonyRootIndex(step), 0) * palette.bassRatio, swung, stepSeconds * 4, palette.bassWave, AUDIO_TUNING.walkingBassGain, -0.1, 560, null, genreVoice(palette, "bassVoice"));
        }
      } else {
        g.bass.forEach(function (entry) {
          if (entry[0] !== bar) return;
          if (grooveHalf && entry[0] % 4 !== 0) return;
          playTone(getHarmonyToneFreq(step, entry[1], 0) * palette.bassRatio * entry[2], swung, 0.2, palette.bassWave, 0.05 + effectiveEnergy * 0.07, -0.1, 560, null, genreVoice(palette, "bassVoice"));
        });
      }
    }
    if ((effectiveEnergy > 0.72 || audio.climaxStep >= 0) && (step % 16 === 6 || step % 16 === 14)) {
      playTone(getHarmonyToneFreq(step, 4, 2), time, 0.075, palette.layerWave, 0.026 + energy * 0.018, step % 16 === 6 ? -0.42 : 0.42, 4400);
    }
    if (drive >= 0.72 && step % 2 === 0) {
      var leadFreq = getHarmonyToneFreq(step, Math.floor(step / 2) % 5, 2);
      playTone(leadFreq, time, 0.055, palette.leadWave, 0.024 + drive * 0.016, step % 4 === 0 ? -0.5 : 0.5, 5200);
    }
    if (drive >= 0.9 && step % 8 === 4) {
      playTone(getHarmonyToneFreq(step, -2, 0) * palette.bassRatio, time, 0.18, palette.bassWave, 0.068, 0, 520, null, genreVoice(palette, "bassVoice"));
    }
    if (pulseDanger > 0 && step % (pulse <= 0.14 ? 4 : 8) === 0) {
      playPulseHeartbeat(time, pulseDanger);
    }

    // Response bars duck the band's motif so the player's answer owns the space.
    var motifDuck = isResponsePhrase(step) ? AUDIO_TUNING.responseDuck : 1;
    audio.layers.forEach(function (layer) {
      if (layer.motif) {
        // Motif layers follow the hook's own rhythm instead of a fixed division;
        // polyloop motifs (division set) sound the hook once per period. The call
        // shift leans the hook toward the player's last response register.
        // Half-time augments the hook A(2) on read; polyloops keep their period.
        var layerMotif = grooveHalf && !layer.polyloop ? motifStretch(layer.motif, 2) : layer.motif;
        var motifPos = layer.division ? step % layer.division : step % getMotifSpan(layerMotif);
        var motifNote = getMotifNoteAt(layerMotif, motifPos);
        if (motifNote !== -1) {
          var motifDeg = Math.max(AUDIO_TUNING.motifDegreeMin, Math.min(AUDIO_TUNING.motifDegreeMax, layerMotif.deg[motifNote] + audio.phrase.callShift));
          var motifReg = layerMotif.register == null ? 1 : layerMotif.register; // register 0 is real (ghost polyloop)
          playTone(getHarmonyToneFreq(step, motifDeg, motifReg), time, stepSeconds * layerMotif.dur[motifNote] * AUDIO_TUNING.motifNoteDurScale, layer.wave, layer.gain * motifDuck * layerSessionFade(layer), layer.pan, layer.filter, null, layer.voice || genreVoice(palette, "leadVoice"));
        }
        return;
      }
      if (step % layer.division === layer.phase) {
        var octave = layer.octave || 1;
        var layerFreq = layer.degrees
          ? getHarmonyToneFreq(step, layer.degrees[Math.floor(step / layer.division) % layer.degrees.length], 1) * octave
          : layer.freq * octave;
        playTone(layerFreq, time, layer.duration, layer.wave, layer.gain * layerSessionFade(layer), layer.pan, layer.filter, null, layer.voice);
      }
    });
  }

  function applyPulseDangerMix(time, danger) {
    if (!audio.master || !audio.ctx) return;
    if (audio.muted) return;
    var dangerAmount = typeof danger === "number" ? danger : getPulseDangerAmount();
    var target = audio.volume * (0.68 - dangerAmount * 0.36);
    audio.master.gain.setTargetAtTime(target, time, dangerAmount > 0 ? 0.18 : 0.08);
  }

  function duckMusic(atTime, scale) {
    if (!audio.duck || !audio.ctx) return;
    var depth = Math.max(0, 1 - AUDIO_TUNING.duckDepth * (scale || 1));
    var gainParam = audio.duck.gain;
    gainParam.cancelScheduledValues(atTime);
    gainParam.setValueAtTime(gainParam.value, atTime);
    gainParam.linearRampToValueAtTime(depth, atTime + AUDIO_TUNING.duckAttack);
    gainParam.setValueAtTime(depth, atTime + AUDIO_TUNING.duckAttack + AUDIO_TUNING.duckHold);
    gainParam.setTargetAtTime(1, atTime + AUDIO_TUNING.duckAttack + AUDIO_TUNING.duckHold, AUDIO_TUNING.duckRelease);
  }

  function addChordColorTones(rootSemitone, chordSemitones, time, palette) {
    // Jazz color tones (music genres seq 2): the pentatonic cannot reach a real maj7 or a
    // natural 9, so add them as extra semitones on the chord root, ONLY on the sustained
    // rhodes comp voice (never bass, kick-hits, or fast/random-timed leads). A color a min2
    // from any chord tone is skipped, so no event timing can expose a clash. Electronic, pop,
    // and trip-hop have no chordColor, so this is a no-op for them. Reuses the one-shot
    // playTone contract (each note stops()/GCs), so no persistent nodes and no leak.
    // SINGLE CALL SITE: playPadChord only, at step % 32 === 0 (once per two bars) on a 1.4s
    // sustained rhodes note. The walking bass (bassVoice=sub), the fast drive lead (voice=null),
    // the match-burst arpeggio (in-scale degrees), and the rhodes comp layer ([0,2,4] triad, no
    // color) never call this, so a color tone can never land on a bass or fast/random-timed
    // voice. That structural guarantee, plus the min2 skip below, makes a random-timed clash
    // impossible by construction, not just by tuning.
    var g = getGenre();
    if (!g.chordColor) return;
    for (var i = 0; i < g.chordColor.length; i += 1) {
      var color = rootSemitone + g.chordColor[i]; // +10 = b7, +14 = 9, +21 = 13
      var clash = false;
      for (var j = 0; j < chordSemitones.length; j += 1) {
        var iv = ((color - chordSemitones[j]) % 12 + 12) % 12;
        if (iv === 1 || iv === 11) { clash = true; break; }
      }
      if (clash) continue;
      var freq = getBaseFreq() * Math.pow(2, color / 12);
      playTone(freq, time + 0.02, 1.4, palette.padWave, AUDIO_TUNING.jazzColorGain, 0.1, 900, null, VOICE_CHARACTERS.rhodes);
    }
  }

  function playPadChord(time) {
    if (!audio.started) return;
    var palette = getMusicPalette();
    var rootIndex = getHarmonyRootIndex(audio.step);
    // Staged surprises land here and clear after a single chord: addSixthPad
    // widens the voicing once; borrowedPad borrows the parallel pentatonic.
    var chord = audio.surprise.padDegrees || getChordDegrees();
    var borrowed = audio.surprise.scaleOverride;
    audio.surprise.padDegrees = null;
    audio.surprise.scaleOverride = null;
    var chordSemitones = [];
    chord.forEach(function (degree, index) {
      var semitone = borrowed ? scaleDegreeSemitoneIn(borrowed, rootIndex + degree) : getScaleDegreeSemitone(rootIndex + degree);
      chordSemitones.push(semitone);
      var freq = getBaseFreq() * Math.pow(2, semitone / 12);
      playTone(freq, time + index * 0.018, 1.65, palette.padWave, 0.012 + energy * 0.008, -0.35 + index * 0.23, 760 + energy * 720, null, genreVoice(palette, "padVoice"));
    });
    // Jazz-only: add guarded b7/9 color tones on the chord root over the comp voice.
    var chordRootSemitone = borrowed ? scaleDegreeSemitoneIn(borrowed, rootIndex) : getScaleDegreeSemitone(rootIndex);
    addChordColorTones(chordRootSemitone, chordSemitones, time, palette);
  }

  function playTap(cell) {
    if (!audio.started) return;
    var gem = board[cell.row] && board[cell.row][cell.col];
    if (!gem) return;
    var freq = frequencyForType(gem.type, 1);
    playTone(freq * 2, audio.ctx.currentTime + 0.01, 0.055, "sine", 0.025, 0, 1500);
  }

  function playArmSpecial() {
    // Armed-special confirm: a soft two-note ascending in-key blip rolled onto the
    // hero beat grid (heroSnapSteps), so arming a beam/nova lands quantized to 124
    // BPM and consonant with the track. Reuses the hero-snap audio path and cues
    // "it's armed, tap again to fire." No music duck; stays a light blip.
    if (!audio.started) return;
    var start = quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.heroSnapSteps);
    var palette = getMusicPalette();
    playTone(getHarmonyToneFreq(audio.step, 0, 1), start, AUDIO_TUNING.armBlipDur, palette.leadWave, AUDIO_TUNING.armBlipGain, 0, 2200);
    playTone(getHarmonyToneFreq(audio.step, 4, 1), start + AUDIO_TUNING.armBlipSpread, AUDIO_TUNING.armBlipDur * 0.9, "sine", AUDIO_TUNING.armBlipGain * 0.85, 0, 3200);
  }

  function playSwap(a, b) {
    if (!audio.started) return;
    var left = (a.col / (GRID - 1)) * 2 - 1;
    playTone(getHarmonyToneFreq(audio.step, 0, 1), audio.ctx.currentTime + 0.01, 0.045, getMusicPalette().padWave, 0.025, left, 1100);
    playTone(getHarmonyToneFreq(audio.step, 2, 1), audio.ctx.currentTime + 0.055, 0.045, getMusicPalette().padWave, 0.022, -left, 1400);
  }

  function playReject() {
    if (!audio.started) return;
    // Failure subtracts music: an invalid swap lands as a muted ghost pluck
    // on the palette root, snapped to the grid like hero hits, so the reject
    // reads as a dropped beat over an unbroken groove (never a buzzer).
    var start = quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.heroSnapSteps);
    playTone(getBaseFreq(), start, AUDIO_TUNING.rejectGhostDur, getMusicPalette().bassWave, AUDIO_TUNING.rejectGhostGain, 0, 900);
  }

  function playBeatGateToggle(closing) {
    if (!audio.started) return;
    var start = quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.gateSnapSteps);
    var palette = getMusicPalette();
    if (closing) {
      // Shutter snap: short noise thunk plus a low root hit.
      playNoise(start, 0.05, AUDIO_TUNING.gateNoiseGain, 2600, 0.9);
      playTone(getHarmonyToneFreq(audio.step, 0, 0) * palette.bassRatio, start, 0.1, palette.bassWave, AUDIO_TUNING.gateToneGain, 0, 720);
    } else {
      // Iris open: rising harmonic pair.
      playTone(getHarmonyToneFreq(audio.step, 0, 1), start, 0.07, palette.padWave, AUDIO_TUNING.gateToneGain, -0.2, 1800);
      playTone(getHarmonyToneFreq(audio.step, 3, 1), start + 0.05, 0.08, palette.padWave, AUDIO_TUNING.gateToneGain, 0.2, 2400);
    }
  }

  function playSignalPacket(start) {
    if (!audio.started) return;
    var when = start || quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.signalSnapSteps);
    var palette = getMusicPalette();
    // Packet chirp: two quick rising harmonics on the beat-locked launch.
    playTone(getHarmonyToneFreq(audio.step, 2, 1), when, 0.06, palette.leadWave, AUDIO_TUNING.signalToneGain, -0.15, 2600);
    playTone(getHarmonyToneFreq(audio.step, 5, 1), when + 0.045, 0.08, "sine", AUDIO_TUNING.signalToneGain * 0.85, 0.2, 3400);
  }

  function playSpectrumSegment(type) {
    if (!audio.started) return;
    var start = quantize(audio.ctx.currentTime + 0.012, 1);
    // The segment sings the piece color's own note as it extinguishes.
    playTone(frequencyForType(type, 1) * 2, start, 0.09, getMusicPalette().layerWave, AUDIO_TUNING.spectrumToneGain, 0, 3000);
  }

  function playSpectrumBreak() {
    if (!audio.started) return;
    var start = quantize(audio.ctx.currentTime + 0.012, 1);
    var palette = getMusicPalette();
    playNoise(start, 0.05, AUDIO_TUNING.spectrumBreakGain * 0.6, 3000, 0.8);
    playTone(getHarmonyToneFreq(audio.step, 0, 1), start, 0.1, palette.layerWave, AUDIO_TUNING.spectrumBreakGain, -0.2, 2600);
    playTone(getHarmonyToneFreq(audio.step, 3, 1), start + 0.05, 0.1, palette.layerWave, AUDIO_TUNING.spectrumBreakGain, 0.2, 3200);
    playTone(getHarmonyToneFreq(audio.step, 5, 2), start + 0.1, 0.14, "sine", AUDIO_TUNING.spectrumBreakGain * 0.8, 0, 4200);
  }

  // Impactful shield-BLOCKER break (Jung: the old break was a letdown). Low-end
  // weight (sub thump + bass punch) + a bright wide shatter + a magenta ring
  // resolving upward. Scales with how many walls broke this move.
  function playShieldBreak(count) {
    if (!audio.started) return;
    var t = quantize(audio.ctx.currentTime + 0.012, 1);
    var palette = getMusicPalette();
    var w = Math.min(1.6, 1 + (Math.max(1, count) - 1) * 0.25);
    playTone(getHarmonyToneFreq(audio.step, 0, 0) * palette.subRatio, t, 0.22, "sine", 0.075 * w, 0, 190);
    playTone(getHarmonyToneFreq(audio.step, 0, 0) * palette.bassRatio, t + 0.012, 0.28, palette.bassWave, 0.055 * w, 0, 520);
    playNoise(t, 0.09, 0.075 * w, 5200, 0.7);
    playNoise(t + 0.035, 0.06, 0.045 * w, 3200, 1.0);
    playTone(getHarmonyToneFreq(audio.step, 0, 1), t + 0.01, 0.14, palette.layerWave, 0.058, -0.22, 2800);
    playTone(getHarmonyToneFreq(audio.step, 4, 1), t + 0.06, 0.14, palette.layerWave, 0.05, 0.22, 3400);
    playTone(getHarmonyToneFreq(audio.step, 7, 2), t + 0.12, 0.16, "sine", 0.045, 0, 4400);
  }

  // Lighter crack for a reinforced wall taking a hit without breaking yet.
  function playShieldCrack() {
    if (!audio.started) return;
    var t = quantize(audio.ctx.currentTime + 0.012, 1);
    playNoise(t, 0.05, 0.04, 3400, 0.9);
    playTone(getHarmonyToneFreq(audio.step, 2, 1), t, 0.08, getMusicPalette().layerWave, 0.04, 0, 3000);
  }

  function playCageShatter(type) {
    if (!audio.started) return;
    var start = quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.cageSnapSteps);
    var palette = getMusicPalette();
    // Glitch shatter: a short noise crack plus a detuned pair of the
    // freed piece's own note (the piece phasing back into the mix).
    playNoise(start, 0.055, AUDIO_TUNING.cageShatterGain * 0.65, 2400, 1.1);
    playTone(frequencyForType(type, 1) * 2, start, 0.08, palette.layerWave, AUDIO_TUNING.cageShatterGain, -0.15, 2900);
    playTone(frequencyForType(type, 1) * 2.12, start + 0.03, 0.09, palette.layerWave, AUDIO_TUNING.cageShatterGain * 0.8, 0.2, 3400);
  }

  function playWirePulse() {
    if (!audio.started) return;
    var start = quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.wireSnapSteps);
    var palette = getMusicPalette();
    // Current zap: a rising pair on the beat-locked hop arrival.
    playTone(getHarmonyToneFreq(audio.step, 2, 1), start, 0.06, palette.leadWave, AUDIO_TUNING.wirePulseGain, -0.2, 2400);
    playTone(getHarmonyToneFreq(audio.step, 4, 1), start + 0.04, 0.08, palette.leadWave, AUDIO_TUNING.wirePulseGain * 0.9, 0.2, 3000);
  }

  function playReshuffle() {
    if (!audio.started) return;
    var start = audio.ctx.currentTime + 0.02;
    var palette = getMusicPalette();
    playNoiseSweep(start, 2);
    playTone(getHarmonyToneFreq(audio.step, 0, 0), start, 0.12, palette.padWave, 0.035, -0.35, 1500);
    playTone(getHarmonyToneFreq(audio.step, 2, 0), start + 0.045, 0.12, palette.padWave, 0.035, 0, 1900);
    playTone(getHarmonyToneFreq(audio.step, 3, 0), start + 0.09, 0.12, palette.padWave, 0.035, 0.35, 2300);
  }

  function playLevelWin(stars) {
    if (!audio.started) return 0;
    var start = quantize(audio.ctx.currentTime + 0.02, AUDIO_TUNING.stingSnapSteps);
    var palette = getMusicPalette();
    duckMusic(start, 1);
    playKick(start, 1.05, audio.impact);
    playNoiseSweep(start, 3 + stars);
    // Default win sting: arpeggiate the level's motif variant, so the win
    // plays this take's hook back to the player. Track the last note's end so the
    // caller can hold the impact bus at full weight until the sting rings out.
    var motif = audio.levelMotif ? audio.levelMotif.motif : normalizeMotif(getTrackMotif());
    var stingEnd = start;
    for (var i = 0; i < motif.deg.length; i += 1) {
      var last = i === motif.deg.length - 1;
      var noteStart = start + i * AUDIO_TUNING.winMotifSpacing;
      var noteDur = last ? 0.22 : 0.18;
      playTone(getHarmonyToneFreq(audio.step, motif.deg[i], motif.register || 1), noteStart, noteDur, palette.layerWave, last ? 0.056 : 0.05, -0.35 + (i / Math.max(1, motif.deg.length - 1)) * 0.7, 2600 + i * 200, audio.impact);
      stingEnd = Math.max(stingEnd, noteStart + noteDur);
    }
    if (stars === 3) {
      var bonusStart = start + motif.deg.length * AUDIO_TUNING.winMotifSpacing + 0.07;
      playTone(getHarmonyToneFreq(audio.step, 5, 2), bonusStart, 0.28, "sine", 0.052, 0, 5600, audio.impact);
      stingEnd = Math.max(stingEnd, bonusStart + 0.28);
    }
    return stingEnd;
  }

  function playFinaleHit(index, total, stars) {
    if (!audio.started) return;
    var start = audio.ctx.currentTime + 0.01;
    var palette = getMusicPalette();
    var freq = getHarmonyToneFreq(audio.step, index + stars, 1);
    var pan = -0.72 + (index / Math.max(1, total - 1)) * 1.44;

    if (index === 0) playKick(start, 1);
    if (index % 2 === 0) playNoise(start, 0.07, 0.06 + stars * 0.012, 3600 + index * 120, 0.75);
    playTone(freq * 2, start, 0.11, index % 2 === 0 ? palette.leadWave : palette.layerWave, 0.04 + stars * 0.006, pan, 2600 + index * 130);
    playTone(freq * 4, start + 0.034, 0.09, "sine", 0.024 + stars * 0.004, -pan, 4600 + index * 180);

    if (index === total - 1) {
      playKick(start + 0.02, 1.1);
      playNoiseSweep(start + 0.03, 5);
      playTone(getHarmonyToneFreq(audio.step, 0, 0) * palette.bassRatio, start + 0.02, 0.34, palette.bassWave, 0.085, 0, 520);
      playTone(getHarmonyToneFreq(audio.step, 5, 2), start + 0.12, 0.34, palette.layerWave, 0.052, 0, 5200);
    }
  }

  function playLevelFail() {
    if (!audio.started) return;
    // Out of moves ends the song, it does not punish: one low consonant thud
    // on the root (the flatline synthesis an octave down, shortened) while the
    // arrangement eases to the base floor. No noise burst; failure subtracts.
    var start = audio.ctx.currentTime + 0.02;
    var flat = getBaseFreq() * Math.pow(2, AUDIO_TUNING.flatlineOctave - 1);
    playTone(flat, start, AUDIO_TUNING.failThudDur, "sine", AUDIO_TUNING.flatlineGain, 0, 2200);
  }

  function playPulseHeartbeat(time, danger) {
    if (!audio.started) return;
    var palette = getMusicPalette();
    var base = getHarmonyToneFreq(audio.step, -2, 0) * palette.bassRatio;
    var first = Math.max(46, Math.min(82, base));
    var second = Math.max(42, first * 0.78);
    var gain = 0.045 + danger * 0.038;

    playTone(first, time, 0.11, "sine", gain, -0.04, 190);
    playTone(second, time + 0.17, 0.1, "sine", gain * 0.78, 0.05, 170);
    if (danger > 0.62) {
      playTone(getHarmonyToneFreq(audio.step, 0, 1), time + 0.025, 0.035, "sine", 0.012 + danger * 0.012, 0, 1800);
    }
  }

  function playRushWarning() {
    if (!audio.started) return;
    var start = audio.ctx.currentTime + 0.01;
    var palette = getMusicPalette();
    playTone(getHarmonyToneFreq(audio.step, 0, 0) * palette.bassRatio, start, 0.13, palette.bassWave, 0.052, 0, 520);
    playTone(getHarmonyToneFreq(audio.step, -2, 0) * palette.bassRatio, start + 0.16, 0.12, palette.bassWave, 0.044, 0, 420);
  }

  function playRushSave(chain) {
    if (!audio.started) return;
    var start = quantize(audio.ctx.currentTime + 0.01);
    var palette = getMusicPalette();
    playKick(start, 0.92);
    playNoiseSweep(start, Math.max(2, chain));
    playTone(getHarmonyToneFreq(audio.step, 0, 1), start, 0.14, palette.layerWave, 0.05, -0.28, 2400);
    playTone(getHarmonyToneFreq(audio.step, 3, 1), start + 0.052, 0.14, palette.layerWave, 0.045, 0.28, 3600);
  }

  function playRushEnd() {
    if (!audio.started) return;
    var start = audio.ctx.currentTime + 0.02;
    var palette = getMusicPalette();
    var root = getHarmonyToneFreq(audio.step, 0, 0) * palette.bassRatio;
    playTone(root, start, 0.22, palette.bassWave, 0.076, 0, 420);
    playTone(root * Math.pow(2, -5 / 12), start + 0.12, 0.2, palette.bassWave, 0.062, 0, 300);
    playNoise(start + 0.04, 0.18, 0.064, 760, 0.8);
    var flat = getBaseFreq() * Math.pow(2, AUDIO_TUNING.flatlineOctave);
    playTone(flat, start + 0.34, AUDIO_TUNING.flatlineDur, "sine", AUDIO_TUNING.flatlineGain, 0, 2200);
    playTone(flat * 2, start + 0.34, 0.22, "sine", 0.012, 0, 4200);
  }

  function playBoosterHit(name) {
    if (!audio.started) return;
    var start = audio.ctx.currentTime + 0.01;
    var palette = getMusicPalette();
    if (name === "hammer") {
      playKick(start, 0.84);
      playNoise(start, 0.11, 0.09, 1200, 0.8);
      playTone(getHarmonyToneFreq(audio.step, 3, 1), start + 0.02, 0.12, palette.leadWave, 0.045, 0, 2400);
      return;
    }
    if (name === "shuffle") {
      playNoiseSweep(start, 2);
      playTone(getHarmonyToneFreq(audio.step, 0, 1), start, 0.12, palette.layerWave, 0.038, -0.3, 1800);
      playTone(getHarmonyToneFreq(audio.step, 2, 1), start + 0.05, 0.12, palette.layerWave, 0.038, 0.3, 2400);
      return;
    }
    playTone(getHarmonyToneFreq(audio.step, 0, 0), start, 0.18, palette.bassWave, 0.06, 0, 700);
  }

  function playGoalComplete(index) {
    // Goal-complete blip: a short in-key two-note "ding" rolled onto the hero
    // beat grid (heroSnapSteps), so it lands quantized to 124 BPM and consonant
    // with the track. Reuses the hero-snap audio path. Stacked completions
    // arpeggiate up by index instead of piling on one pitch; no music duck so
    // it stays a light blip, never a stinger.
    if (!audio.started) return;
    var start = quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.heroSnapSteps);
    var palette = getMusicPalette();
    var step = Math.min(3, index || 0);
    playTone(getHarmonyToneFreq(audio.step, 2 + step, 1), start, AUDIO_TUNING.goalBlipDur, palette.leadWave, AUDIO_TUNING.goalBlipGain, 0, 2600);
    playTone(getHarmonyToneFreq(audio.step, 4 + step, 1), start + AUDIO_TUNING.goalBlipSpread, AUDIO_TUNING.goalBlipDur * 0.85, "sine", AUDIO_TUNING.goalBlipGain * 0.8, 0, 3600);
  }

  function playLayerEnterCue(index) {
    // A soft two-note rising in-key blip rolled onto the hero-snap grid, so a new
    // music layer joining lands quantized to 124 BPM and consonant with the track.
    // Reuses the hero-snap audio path like the goal/arm blips; no music duck, so it
    // stays a light cue under the "+ BASS / + HATS / + LEAD" callout. Higher bands
    // enter a step brighter. Presentation cue only; the arrangement itself is
    // unchanged (this just voices the layer the arranger already brought in).
    if (!audio.started) return;
    var start = quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.heroSnapSteps);
    var palette = getMusicPalette();
    var lift = Math.min(3, index || 0);
    playTone(getHarmonyToneFreq(audio.step, lift, 1), start, AUDIO_TUNING.layerCueDur, palette.leadWave, AUDIO_TUNING.layerCueGain, 0, 2400);
    playTone(getHarmonyToneFreq(audio.step, 2 + lift, 1), start + AUDIO_TUNING.layerCueSpread, AUDIO_TUNING.layerCueDur * 0.85, "sine", AUDIO_TUNING.layerCueGain * 0.85, 0, 3200);
  }

  function playHumWakeChord() {
    // Hum "born from light" wake chord: a bright rising in-key arpeggio (root,
    // third, fifth, octave) rolled onto the hero-snap grid, so it lands quantized
    // to 124 BPM and consonant with the track. Reuses the hero-snap audio path
    // (no new assets) and skips the music duck, so the wake reads as a lift, not a
    // hit. Fires on both the early first wake and the Finale wake.
    if (!audio.started) return;
    var start = quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.humWakeSnapSteps);
    var palette = getMusicPalette();
    var degs = [0, 2, 4, 7];
    for (var i = 0; i < degs.length; i += 1) {
      var wave = i === degs.length - 1 ? "sine" : palette.leadWave;
      playTone(
        getHarmonyToneFreq(audio.step, degs[i], 1),
        start + i * AUDIO_TUNING.humWakeChordSpread,
        AUDIO_TUNING.humWakeChordDur * (1 - i * 0.08),
        wave,
        AUDIO_TUNING.humWakeChordGain * (1 - i * 0.12),
        i % 2 ? 0.16 : -0.16,
        3000 + i * 400
      );
    }
  }

  function updateArrangementBands(step) {
    // Read-only mirror of the arranger's per-voice state (gateState + climax lead),
    // run once per scheduled 16th after the gates settle. Lights the Voices meter
    // and fires a one-shot callout + hero-snap cue as each named layer joins. The
    // first post-reveal pass primes the latch silently so the groove drop itself
    // never spams callouts. Never mutates the music.
    if (gameMode !== MODE_CAMPAIGN && !isPulseMode()) return;
    var playing = levelState === "playing";
    var prime = !bandsPrimed;
    for (var i = 0; i < ARRANGEMENT_BANDS.length; i += 1) {
      var band = ARRANGEMENT_BANDS[i];
      var on = band.key === "spine"
        ? true
        : band.key === "climax"
          ? audio.climaxStep >= 0
          : !!audio.gateState[band.key];
      var was = !!bandLatch[band.key];
      bandActive[i] = on;
      if (on && !was && !prime) {
        bandPop[i] = 1;
        if (playing && band.label) {
          addCallout(band.label, band.color, 17);
          playLayerEnterCue(i);
        }
      }
      bandLatch[band.key] = on;
    }
    bandsPrimed = true;
  }

  function playOverdriveStart() {
    if (!audio.started) return;
    var start = quantize(audio.ctx.currentTime + 0.02, AUDIO_TUNING.heroSnapSteps);
    var palette = getMusicPalette();
    duckMusic(start, 1);
    playKick(start, 1.05, audio.impact);
    playNoiseSweep(start, 4);
    playTone(getHarmonyToneFreq(audio.step, 0, 0), start, 0.3, palette.bassWave, 0.075, 0, 700, audio.impact);
    playTone(getHarmonyToneFreq(audio.step, 2, 1), start + 0.035, 0.24, palette.layerWave, 0.056, -0.22, 2600);
    playTone(getHarmonyToneFreq(audio.step, 4, 1), start + 0.07, 0.22, palette.layerWave, 0.046, 0.22, 4200);
    addComboLayer(5, 18);
  }

  function playOverdriveEnd() {
    // Overdrive cool-down cue: a soft in-key descending two-note fall (degree 4
    // -> 0) rolled onto the hero-snap grid, so it stays quantized to 124 BPM and
    // consonant with the track. No kick, no duck: overdrive leaving should feel
    // like a release, not a hit. Reuses the hero-snap audio path.
    if (!audio.started) return;
    var start = quantize(audio.ctx.currentTime + 0.02, AUDIO_TUNING.heroSnapSteps);
    var palette = getMusicPalette();
    playTone(getHarmonyToneFreq(audio.step, 4, 1), start, AUDIO_TUNING.overdriveEndDur, palette.leadWave, AUDIO_TUNING.overdriveEndGain, -0.18, 3200);
    playTone(getHarmonyToneFreq(audio.step, 0, 1), start + AUDIO_TUNING.overdriveEndSpread, AUDIO_TUNING.overdriveEndDur * 0.9, "sine", AUDIO_TUNING.overdriveEndGain * 0.85, 0.18, 2200);
  }

  function playBurst(types, count, chain, specialHitCount, specialSpawn, overdrive) {
    if (!audio.started) return;
    var now = audio.ctx.currentTime;
    var start = quantize(now + 0.02);
    var boost = getResponseBoost();
    playImpact(start, chain, count, overdrive);
    types.forEach(function (entry, index) {
      var freq = frequencyForType(entry.type, chain);
      if (boost > 1) {
        // Response window: remember the top degree the player fired so the
        // next call can transpose the motif toward that register.
        var piece = TYPES[entry.type] || TYPES[0];
        var firedDegree = (typeof piece.scaleDegree === "number" ? piece.scaleDegree : entry.type) + Math.max(0, chain - 1);
        if (audio.phrase.topDegree == null || firedDegree > audio.phrase.topDegree) audio.phrase.topDegree = firedDegree;
      }
      var pan = -0.6 + (index / Math.max(1, types.length - 1)) * 1.2;
      var repeats = Math.min(overdrive ? 6 : 4, Math.max(1, Math.floor(entry.count / 3)) + (overdrive ? 1 : 0));
      // Per-piece voice: the player hears the color, not just the pitch. The character
      // (warm/stack/pluck/hollow/brass/air) rides the same frequencyForType degree, so
      // every match stays pentatonic-consonant. register lifts each color into its own
      // octave; chain>=4 climbs one more for the cascade walk-up. Gain keeps the shipped
      // math, then trims (voices stack 2-3 oscillators, so they read hotter than the old flat tone).
      var pv = PIECE_VOICES[entry.type] || PIECE_VOICES[0];
      var pvChar = VOICE_CHARACTERS[pv.character] || VOICE_CHARACTERS.single;
      var pvOctave = Math.pow(2, pv.register + (chain >= 4 ? AUDIO_TUNING.pieceVoiceCascadeLift : 0));
      for (var i = 0; i < repeats; i += 1) {
        playTone(
          freq * (i % 2 === 0 ? 2 : 1) * pvOctave,
          start + i * (overdrive ? 0.036 : 0.045),
          overdrive ? 0.105 : 0.13,
          overdrive ? "square" : "triangle",
          Math.min(AUDIO_TUNING.responseToneGainCap, (0.048 + chain * 0.008 + (overdrive ? 0.012 : 0)) * boost) * AUDIO_TUNING.pieceVoiceGainTrim * pv.gain,
          pan,
          pv.filter + chain * 220 + drive * 1200,
          null,
          pvChar
        );
      }
      addLayer(entry.type, chain, entry.count, pan);
    });

    if (chain >= 3) {
      var palette = getMusicPalette();
      var stepSeconds = (60 / getActiveBpm()) / 4;
      var chordPans = [-0.3, 0, 0.3];
      [0, 2, 4].forEach(function (degree, i) {
        playTone(getHarmonyToneFreq(audio.step, degree, 1), start + i * 0.012, 0.22, palette.padWave, 0.03, chordPans[i], 1600, null, genreVoice(palette, "leadVoice"));
      });
      if (chain >= 4) {
        for (var hit = 0; hit < 4; hit += 1) {
          playSnare(start + (hit * stepSeconds) / 2, 0.1 + hit * 0.04);
        }
      }
      if (chain >= 5) {
        [0, 2, 4, 5, 7, 9].forEach(function (degree, i) {
          playTone(getHarmonyToneFreq(audio.step, degree, 1), start + i * stepSeconds, 0.09, palette.leadWave, 0.042, i % 2 === 0 ? -0.35 : 0.35, 1600, null, genreVoice(palette, "leadVoice"));
        });
      }
    }

    if (count >= 4) playNoiseSweep(start, chain);
    if (chain >= 2) {
      var burstBassPal = getMusicPalette();
      playTone(getHarmonyToneFreq(audio.step, 0, 0) * burstBassPal.bassRatio, start, 0.42, burstBassPal.bassWave, 0.08, 0, 360 + chain * 90, null, genreVoice(burstBassPal, "bassVoice"));
    }
    // Consonant surprises on hot moments: a very deep chain landing on a phrase
    // start borrows the parallel pentatonic across the whole harmony for one
    // phrase; a lesser deep chain borrows it for one pad chord; a chain inside
    // the response window may restate the hook an octave up instead.
    if (chain >= 5 && getPhraseBar(audio.step) === 0) maybeSurpriseBorrowChord();
    else if (chain >= 4) maybeSurpriseBorrowedPad();
    else if (chain >= 3 && isResponsePhrase(audio.step)) maybeSurpriseOctaveMotif();
    if (chain >= 2) addComboLayer(chain, count);
    if (overdrive) addComboLayer(chain + 1, count + 4);
    if (specialHitCount > 0) playTone(getHarmonyToneFreq(audio.step, 3, 2), start, 0.18, getMusicPalette().leadWave, 0.035 + specialHitCount * 0.012, 0, 2600);
    if (specialSpawn && specialSpawn.special === "nova") playTone(getHarmonyToneFreq(audio.step, 5, 2), start + 0.04, 0.22, getMusicPalette().layerWave, 0.045, 0.18, 4200);
  }

  function playImpact(time, chain, count, overdrive) {
    var weight = Math.min(1.8, 0.6 + chain * 0.18 + count * 0.025 + (overdrive ? 0.35 : 0));
    playTone(getHarmonyToneFreq(audio.step, 0, 0) * getMusicPalette().subRatio, time, 0.16, "sine", 0.035 * weight, 0, 180 + chain * 42);
    if (chain >= 2 || overdrive) {
      playTone(getHarmonyToneFreq(audio.step, 0, 0) * getMusicPalette().bassRatio, time + 0.015, 0.24, getMusicPalette().bassWave, 0.038 * weight, 0, 420 + chain * 80);
    }
    if (overdrive) {
      playNoise(time, 0.07, 0.045, 5200, 0.8);
    }
  }

  function playSpecialCreate(special, type) {
    if (!audio.started) return;
    var start = audio.ctx.currentTime + 0.018;
    var palette = getMusicPalette();
    var freq = frequencyForType(type, Math.max(1, combo));
    if (special === "nova") {
      playTone(freq * 2, start, 0.24, palette.layerWave, 0.055, -0.24, 2800);
      playTone(freq * 3, start + 0.035, 0.22, palette.layerWave, 0.042, 0.1, 3400);
      playTone(freq * 4, start + 0.07, 0.2, "sine", 0.034, 0.32, 4800);
      playNoiseSweep(start, Math.max(2, combo));
      return;
    }

    playTone(freq * 2, start, 0.12, palette.layerWave, 0.042, special === "lineH" ? -0.25 : 0.25, 2600);
    playTone(freq * 4, start + 0.055, 0.1, "sine", 0.028, special === "lineH" ? 0.25 : -0.25, 3600);
  }

  function playSpecialActivate(special, type, chain) {
    if (!audio.started) return;
    playNoise(audio.ctx.currentTime + 0.005, 0.03, AUDIO_TUNING.tickGain, 4200, 0.7);
    var start = quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.heroSnapSteps);
    var palette = getMusicPalette();
    var freq = frequencyForType(type, chain);
    var boost = getResponseBoost();
    if (special === "nova") {
      duckMusic(start, 1);
      // Nova detonation stack rides a detuned super-saw hero (heroNovaDetuneCents); the
      // root layer stays on palette.bassWave. Pitch and duck unchanged.
      var novaVoice = heroVoice("nova", { detune: AUDIO_TUNING.heroNovaDetuneCents });
      playTone(freq, start, 0.34, palette.bassWave, Math.min(AUDIO_TUNING.responseToneGainCap, 0.085 * boost), 0, 720, audio.impact);
      playTone(freq * 2, start + 0.02, 0.2, palette.layerWave, Math.min(AUDIO_TUNING.responseToneGainCap, 0.06 * boost), -0.28, 2600, null, novaVoice);
      playTone(freq * 3, start + 0.06, 0.18, palette.layerWave, Math.min(AUDIO_TUNING.responseToneGainCap, 0.048 * boost), 0.28, 3200, null, novaVoice);
      playNoiseSweep(start, chain + 2);
      // Solo sweep hero chord: root-third-fifth stab rolled over the
      // detonation tones, beat-snapped with the rest of the hit.
      playTone(getHarmonyToneFreq(audio.step, 0, 1), start + 0.03, 0.3, palette.leadWave, Math.min(AUDIO_TUNING.responseToneGainCap, AUDIO_TUNING.novaSweepChordGain * boost), -0.22, 3000);
      playTone(getHarmonyToneFreq(audio.step, 2, 1), start + 0.03 + AUDIO_TUNING.novaSweepChordSpread, 0.28, palette.leadWave, Math.min(AUDIO_TUNING.responseToneGainCap, AUDIO_TUNING.novaSweepChordGain * 0.9 * boost), 0.22, 3400);
      playTone(getHarmonyToneFreq(audio.step, 4, 1), start + 0.03 + AUDIO_TUNING.novaSweepChordSpread * 2, 0.26, "sine", Math.min(AUDIO_TUNING.responseToneGainCap, AUDIO_TUNING.novaSweepChordGain * 0.8 * boost), 0, 4600);
      addComboLayer(chain + 2, 12);
      // addSixthPad surprise: a nova detonation may widen the next pad chord
      // to degrees [0,2,3,4,5] once.
      if (trySpendSurprise("addSixthPad")) audio.surprise.padDegrees = [0, 2, 3, 4, 5];
      return;
    }

    duckMusic(start, AUDIO_TUNING.duckSmallScale);
    var pan = special === "lineH" ? -0.45 : 0.45;
    // Line specials read as a laser: the fast FM pluck's filter-env sweep.
    playTone(freq * 2, start, 0.16, palette.leadWave, Math.min(AUDIO_TUNING.responseToneGainCap, 0.052 * boost), pan, 2400, null, VOICE_CHARACTERS.pluck);
    playTone(freq * 4, start + 0.04, 0.12, palette.layerWave, Math.min(AUDIO_TUNING.responseToneGainCap, 0.034 * boost), -pan, 4200, null, VOICE_CHARACTERS.pluck);
    playNoise(start, 0.08, 0.06 + chain * 0.01, 3600, 0.75, audio.impact);
  }

  function playSpecialCombo(comboData, clearCount) {
    if (!audio.started) return;
    playNoise(audio.ctx.currentTime + 0.005, 0.03, AUDIO_TUNING.tickGain, 4200, 0.7);
    var start = quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.heroSnapSteps);
    var palette = getMusicPalette();
    var root = getHarmonyToneFreq(audio.step, 0, 0);
    var big = comboData.specialA === "nova" || comboData.specialB === "nova";
    var total = comboData.specialA === "nova" && comboData.specialB === "nova";

    duckMusic(start, 1);
    // Fusion chord stab: the FM bell hero (heroFusionFmIndex), a produced timbre for the
    // biggest events. The sub root below stays on the sine bass. Pitch and duck unchanged.
    var bellVoice = heroVoice("bell", { index: AUDIO_TUNING.heroFusionFmIndex });
    playKick(start, total ? 1.28 : 1.08, audio.impact);
    playNoiseSweep(start + 0.02, total ? 7 : big ? 5 : 3);
    playTone(root * palette.subRatio, start, 0.42, "sine", total ? 0.11 : 0.085, 0, 220, audio.impact);
    playTone(getHarmonyToneFreq(audio.step, 2, 1), start + 0.028, 0.24, palette.layerWave, 0.062, -0.32, 2600, null, bellVoice);
    playTone(getHarmonyToneFreq(audio.step, 4, 1), start + 0.07, 0.22, palette.leadWave, 0.052, 0.28, 3800, null, bellVoice);
    playTone(getHarmonyToneFreq(audio.step, 5, 2), start + 0.14, 0.26, "sine", total ? 0.06 : 0.044, 0, 5600, null, bellVoice);
    if (clearCount >= 24) addComboLayer(6, clearCount);
    else addComboLayer(4, clearCount);
    // borrowedPad surprise: a special-piece combo may borrow the parallel
    // pentatonic for the next pad chord.
    maybeSurpriseBorrowedPad();
  }

  function playPulseRelease(clearCount, specialHitCount) {
    if (!audio.started) return;
    playNoise(audio.ctx.currentTime + 0.005, 0.03, AUDIO_TUNING.tickGain, 4200, 0.7);
    var start = quantize(audio.ctx.currentTime + 0.012, AUDIO_TUNING.heroSnapSteps);
    var palette = getMusicPalette();
    var root = getHarmonyToneFreq(audio.step, 0, 0);
    var intensity = Math.min(1.4, 0.82 + clearCount * 0.012 + specialHitCount * 0.08);

    duckMusic(start, 1);
    // Pulse-release chord stab shares the fusion bell hero (heroFusionFmIndex); the sub and
    // root stay on the sine / palette bass. Pitch and duck unchanged.
    var bellVoice = heroVoice("bell", { index: AUDIO_TUNING.heroFusionFmIndex });
    playKick(start, 1.22, audio.impact);
    playKick(start + 0.18, 0.92, audio.impact);
    playNoiseSweep(start, 7);
    playTone(root * palette.subRatio, start, 0.5, "sine", 0.1 * intensity, 0, 180, audio.impact);
    playTone(root, start + 0.02, 0.34, palette.bassWave, 0.075 * intensity, 0, 620);
    playTone(getHarmonyToneFreq(audio.step, 2, 1), start + 0.04, 0.22, palette.layerWave, 0.06, -0.34, 2800, null, bellVoice);
    playTone(getHarmonyToneFreq(audio.step, 4, 1), start + 0.09, 0.22, palette.leadWave, 0.055, 0.28, 3600, null, bellVoice);
    playTone(getHarmonyToneFreq(audio.step, 5, 2), start + 0.16, 0.3, "sine", 0.052, 0, 5600, null, bellVoice);
    playNoise(start + 0.04, 0.16, 0.075, 6200, 0.86);
    addComboLayer(7, clearCount + specialHitCount * 4);
  }

  function trimAudioLayers(max) {
    // Drop oldest transient layers first; never evict persistent layers
    // (the signature motif layer rides the whole level).
    var excess = audio.layers.length - max;
    for (var i = 0; i < audio.layers.length && excess > 0;) {
      if (audio.layers[i].persistent) {
        i += 1;
      } else {
        audio.layers.splice(i, 1);
        excess -= 1;
      }
    }
  }

  function addComboLayer(chain, count) {
    var step = Math.max(0, chain - 1);
    var semitone = getScaleDegreeSemitone(getHarmonyRootIndex(audio.step) + step + 4);
    var freq = getBaseFreq() * Math.pow(2, semitone / 12) * 2;
    // Combo harmonic layer is a track/bed element (scale-degree, not piece-typed), so it
    // maps its leadWave default to the palette leadVoice; addLayer keeps the piece color.
    var comboPalette = getMusicPalette();
    audio.layers.push({
      freq: freq,
      division: chain >= 4 ? 1 : 2,
      phase: audio.step % (chain >= 4 ? 1 : 2),
      expiresAt: audio.step + 24 + Math.min(40, count * 2),
      duration: chain >= 4 ? 0.045 : 0.065,
      wave: comboPalette.leadWave,
      gain: Math.min(0.038, 0.016 + chain * 0.004),
      pan: chain % 2 === 0 ? -0.36 : 0.36,
      filter: 1800 + chain * 620,
      octave: chain >= 5 ? 2 : 1,
      degrees: chain >= 4 ? [0, 2, 4, 2] : null,
      voice: paletteVoice(comboPalette, "leadVoice")
    });
    trimAudioLayers(24);
    updateHud();
  }

  function addLayer(type, chain, count, pan) {
    var freq = frequencyForType(type, chain);
    var division = chain >= 3 ? 2 : chain >= 2 ? 4 : 8;
    var palette = getMusicPalette();
    // Sustained cascade layer keeps the piece's own instrument, so a held cascade rings
    // in the color that fired it. wave stays as the palette fallback; the voice character
    // (voice.wave || wave inside buildVoiceSource) supersedes it at render time.
    var pvChar = VOICE_CHARACTERS[(PIECE_VOICES[type] || PIECE_VOICES[0]).character] || VOICE_CHARACTERS.single;
    var layer = {
      freq: freq * 2,
      division: division,
      phase: (audio.step + type + chain) % division,
      expiresAt: audio.step + 48 + chain * 16 + Math.min(24, count * 2),
      duration: chain >= 3 ? 0.08 : 0.12,
      wave: chain >= 2 ? palette.leadWave : palette.layerWave,
      gain: Math.min(0.046, 0.018 + chain * 0.008 + count * 0.001),
      pan: pan,
      filter: 1200 + chain * 520,
      octave: chain >= 4 ? 2 : 1,
      voice: pvChar
    };

    audio.layers.push(layer);
    trimAudioLayers(22);
    updateHud();
  }

  function frequencyForType(type, chain) {
    var piece = TYPES[type] || TYPES[0];
    var degree = typeof piece.scaleDegree === "number" ? piece.scaleDegree : type;
    var semitone = getScaleDegreeSemitone(degree + Math.max(0, chain - 1));
    return getBaseFreq() * Math.pow(2, semitone / 12);
  }

  function quantize(time, steps) {
    steps = steps || 1;
    var stepSeconds = (60 / getActiveBpm()) / 4;
    var wait = (steps - (audio.step % steps)) % steps;
    var target = audio.nextStepTime + wait * stepSeconds;
    var targetStep = audio.step + wait;
    while (target < time) {
      target += steps * stepSeconds;
      targetStep += steps;
    }
    if (steps > 1 && target - time > AUDIO_TUNING.snapMaxWait) return quantize(time, 1);
    if (targetStep % 2 === 1) {
      // Off-16ths shift by the palette swing so one-shots land on the swung grid, not the straight one.
      var groove = getMusicPalette().groove;
      target += Math.min((groove && groove.swing) || 0, AUDIO_TUNING.grooveSwingMax) * stepSeconds;
    }
    return target;
  }

  function getPulseWave(duty) {
    // Fourier pulse: cache one normalized PeriodicWave per duty so a pwm note never
    // allocates a wave. real/imag from the unipolar pulse series; DC (index 0) stays 0.
    // duty 0.5 collapses to a square (odd 1/n harmonics), narrower duties get richer tops.
    if (!audio.pulseWaves) audio.pulseWaves = {};
    var key = duty.toFixed(3);
    if (audio.pulseWaves[key]) return audio.pulseWaves[key];
    var N = 32;
    var real = new Float32Array(N + 1);
    var imag = new Float32Array(N + 1);
    var twoPi = Math.PI * 2;
    for (var n = 1; n <= N; n++) {
      var denom = Math.PI * n;
      real[n] = Math.sin(twoPi * n * duty) / denom;
      imag[n] = (1 - Math.cos(twoPi * n * duty)) / denom;
    }
    var wave = audio.ctx.createPeriodicWave(real, imag, { disableNormalization: false });
    audio.pulseWaves[key] = wave;
    return wave;
  }

  function buildVoiceSource(voice, wave, freq, start, detuneCents) {
    // Richer-oscillator layer (seq 4). Returns { sources: [osc...to start/stop], out: node
    // feeding filter } so the rest of playTone (filter->gain->pan) is untouched. Every osc
    // returned is stopped by playTone after its envelope; the intermediate gains die with
    // them (GC), matching the single-osc path. No pitch change here: detune is capped in
    // cents and FM ratios are integers, so a character note stays in-scale on any 16th.
    var ctx = audio.ctx;
    var type = voice.type || "single";
    var vwave = voice.wave || wave;
    var maxOsc = AUDIO_TUNING.voiceMaxOscPerNote;
    var sources = [];
    var out;
    var needMix = type !== "single" || voice.shimmer;
    if (needMix) {
      out = ctx.createGain();
      out.gain.setValueAtTime(1, start);
    }

    if (type === "stack") {
      // Two same-wave oscillators at +/- clamped detune summed into one gain; optional
      // sine an octave down at voiceSubMix * sub for weight. Classic supersaw-lite fatten.
      var spread = Math.min(voice.detune || 0, AUDIO_TUNING.voiceStackDetuneMax);
      var oa = ctx.createOscillator();
      var ob = ctx.createOscillator();
      oa.type = vwave;
      ob.type = vwave;
      oa.frequency.setValueAtTime(freq, start);
      ob.frequency.setValueAtTime(freq, start);
      oa.detune.setValueAtTime(detuneCents + spread, start);
      ob.detune.setValueAtTime(detuneCents - spread, start);
      var ga = ctx.createGain();
      var gb = ctx.createGain();
      ga.gain.setValueAtTime(0.5, start);
      gb.gain.setValueAtTime(0.5, start);
      oa.connect(ga);
      ga.connect(out);
      ob.connect(gb);
      gb.connect(out);
      if (voice.motion && audio.pwmLfoGain) {
        audio.pwmLfoGain.connect(oa.detune);
        audio.pwmLfoGain.connect(ob.detune);
      }
      sources.push(oa, ob);
      if (voice.sub > 0 && sources.length < maxOsc) {
        var sub = ctx.createOscillator();
        sub.type = "sine";
        sub.frequency.setValueAtTime(freq * 0.5, start);
        if (detuneCents) sub.detune.setValueAtTime(detuneCents, start);
        var gsub = ctx.createGain();
        gsub.gain.setValueAtTime(AUDIO_TUNING.voiceSubMix * voice.sub, start);
        sub.connect(gsub);
        gsub.connect(out);
        sources.push(sub);
      }
    } else if (type === "pwm") {
      // Variable-duty pulse via a cached PeriodicWave; the shared slow LFO on detune
      // adds chorus shimmer without a per-voice DelayNode. Pure procedural.
      var duty = typeof voice.duty === "number" ? voice.duty : 0.5;
      var po = ctx.createOscillator();
      po.setPeriodicWave(getPulseWave(duty));
      po.frequency.setValueAtTime(freq, start);
      if (detuneCents) po.detune.setValueAtTime(detuneCents, start);
      if (voice.motion && audio.pwmLfoGain) audio.pwmLfoGain.connect(po.detune);
      po.connect(out);
      sources.push(po);
    } else if (type === "fm") {
      // 2-operator FM: modulator at carrier*ratio drives carrier.frequency through an
      // index envelope peaking at carrier*ratio*index (capped) and decaying over fmDecay.
      var ratio = voice.ratio || 1;
      var index = Math.min(voice.index || 1, AUDIO_TUNING.voiceFmIndexMax);
      var fmDecay = Math.max(0.01, typeof voice.fmDecay === "number" ? voice.fmDecay : AUDIO_TUNING.voiceFmDecayDefault);
      var carrier = ctx.createOscillator();
      carrier.type = voice.wave || "sine";
      carrier.frequency.setValueAtTime(freq, start);
      if (detuneCents) carrier.detune.setValueAtTime(detuneCents, start);
      var mod = ctx.createOscillator();
      mod.type = "sine";
      mod.frequency.setValueAtTime(freq * ratio, start);
      var modGain = ctx.createGain();
      var peak = freq * ratio * index;
      modGain.gain.setValueAtTime(peak, start);
      modGain.gain.exponentialRampToValueAtTime(Math.max(0.0001, peak * 0.02), start + fmDecay);
      mod.connect(modGain);
      modGain.connect(carrier.frequency);
      carrier.connect(out);
      sources.push(carrier, mod);
    } else {
      // single: the shipped one-oscillator voice, still available as a named character.
      var o = ctx.createOscillator();
      o.type = vwave;
      o.frequency.setValueAtTime(freq, start);
      if (detuneCents) o.detune.setValueAtTime(detuneCents, start);
      if (needMix) o.connect(out); else out = o;
      sources.push(o);
    }

    if (voice.shimmer && out && sources.length < maxOsc) {
      // One extra low-gain sine partial N harmonics up (air: 3 = an octave+fifth) for sheen.
      var partial = typeof voice.shimmer === "number" && voice.shimmer > 1 ? voice.shimmer : 3;
      var sh = ctx.createOscillator();
      sh.type = "sine";
      sh.frequency.setValueAtTime(freq * partial, start);
      if (detuneCents) sh.detune.setValueAtTime(detuneCents, start);
      var gsh = ctx.createGain();
      gsh.gain.setValueAtTime(0.2, start);
      sh.connect(gsh);
      gsh.connect(out);
      sources.push(sh);
    }

    return { sources: sources, out: out };
  }

  function heroVoice(name, overrides) {
    // Shallow-clone a VOICE_CHARACTERS preset so a hero can retune one field (nova detune,
    // fusion FM index) from AUDIO_TUNING without mutating the shared character. filtEnv stays
    // shared by reference (never mutated). No new nodes; the clone just feeds buildVoiceSource.
    var base = VOICE_CHARACTERS[name] || VOICE_CHARACTERS.single;
    var out = {};
    for (var k in base) { if (base.hasOwnProperty(k)) out[k] = base[k]; }
    if (overrides) { for (var o in overrides) { if (overrides.hasOwnProperty(o)) out[o] = overrides[o]; } }
    return out;
  }

  function paletteVoice(palette, field) {
    // Per-palette timbre profile (Music Variety item 4): resolve a shared VOICE_CHARACTERS
    // preset from palette.leadVoice/padVoice/bassVoice. An unset field returns null so the
    // caller keeps today's flat single-oscillator path in playTone (voice=null). The preset
    // is read-only here (never mutated), so passing the shared reference is safe like the
    // PIECE_VOICES call sites; per-level drift still tints it at render time.
    return (palette && VOICE_CHARACTERS[palette[field]]) || null;
  }

  function genreVoice(palette, field) {
    // Genre voice override (music genres seq 4): a non-electronic genre may swap the whole
    // band's instrument for a given field (leadVoice / padVoice / bassVoice). An unset field,
    // or the electronic identity element (whose voices are all null), falls through to the
    // per-sector paletteVoice, so the 16 palettes keep their variety. Read-only shared preset,
    // same safe-reference contract as paletteVoice (never mutated here).
    var g = getGenre();
    var name = g[field];
    if (name && VOICE_CHARACTERS[name]) return VOICE_CHARACTERS[name];
    return paletteVoice(palette, field);
  }

  // Push the current genre's one extra persistent layer (music genres seq 5/9). Called from
  // startLevel and from applyAudioGenre on a live genre swap, so it recomputes its own
  // loopStepSeconds from getActiveBpm() to stay self-contained. Tagged genreLayer:true so a
  // later swap can strip exactly this layer. Every degree resolves through getHarmonyToneFreq,
  // so the layer stays in-scale on the 124 BPM grid. Electronic/trip-hop add nothing.
  function pushGenreExtraLayer() {
    if (!audio.layers) return;
    var genreExtra = getGenre().extraLayer;
    if (genreExtra === "topline") {
      audio.layers.push({ motif: motifOctave(getTrackMotif(), 1), wave: getMusicPalette().leadWave, gain: AUDIO_TUNING.popToplineGain, pan: 0, filter: 3800, voice: VOICE_CHARACTERS.warm, expiresAt: 1e9, persistent: true, polyloop: true, genreLayer: true });
    } else if (genreExtra === "comp") {
      var loopStepSeconds = (60 / getActiveBpm()) / 4;
      audio.layers.push({ degrees: [0, 2, 4], division: 4, phase: 2, duration: loopStepSeconds * 3, wave: getMusicPalette().padWave, gain: AUDIO_TUNING.jazzCompGain, pan: 0.12, filter: 1400, octave: 1, voice: VOICE_CHARACTERS.rhodes, expiresAt: 1e9, persistent: true, polyloop: true, genreLayer: true });
    }
  }

  function refreshGenreExtraLayer() {
    // Live genre swap: strip whatever genre layer is playing and re-push the new genre's, so
    // the topline/comp swaps mid-level without waiting for the next level start. A no-op at
    // graph init (no layers yet) and in Rush/Daily (no genre layer is ever pushed there, per
    // startLevel's campaign-only mix locks). Re-push only when the base band is actually
    // running (a persistent non-genre layer present) so we never leave a lone genre layer
    // ringing between levels.
    if (!audio.layers) return;
    var bandRunning = audio.layers.some(function (layer) { return layer.persistent && !layer.genreLayer; });
    audio.layers = audio.layers.filter(function (layer) { return !layer.genreLayer; });
    if (bandRunning && gameMode === MODE_CAMPAIGN && currentLevel) pushGenreExtraLayer();
  }

  function applyAudioGenre() {
    // Apply the genre's persistent-node state (music genres seq 4/9). Groove, swing, chords,
    // voices, and the global filter scale all read getGenre() live per step, so the only
    // persistent nodes a genre change must retune are the vinyl crackle bed and the one genre
    // extra layer. Vinyl gain is min()-clamped so a genre can never exceed the bed ceiling;
    // only trip-hop lifts it off zero. Safe to call mid-level (setTargetAtTime glides, no
    // click); the next step already reads the new genre for everything else.
    if (!audio.ctx || !audio.vinylGain) return;
    var target = Math.min(getGenre().vinylNoiseGain || 0, AUDIO_TUNING.vinylNoiseGainMax);
    audio.vinylGain.gain.setTargetAtTime(target, audio.ctx.currentTime, 0.08);
    refreshGenreExtraLayer();
  }

  function playTone(freq, start, duration, wave, gainValue, panValue, filterFreq, bus, voice) {
    if (!audio.ctx || !audio.master) return;
    var gain = audio.ctx.createGain();
    var filter = audio.ctx.createBiquadFilter();
    var pan = audio.ctx.createStereoPanner ? audio.ctx.createStereoPanner() : null;

    // Per-level seed drift tints every note a few cents; composes with the random
    // +/-2 detune and, for stack characters, the per-voice +/- stack detune.
    var drift = audio.levelDrift;
    var detuneCents = drift ? drift.detuneCents : 0;
    if (wave === "sawtooth" || wave === "square") {
      detuneCents += (Math.random() - 0.5) * 4;
    }
    // Source node(s): a voice character routes through the richer synthesis builder
    // (stack/pwm/fm/shimmer); voice=null keeps the shipped single-oscillator path exactly.
    var sources, srcOut;
    if (voice && (voice.type || voice.shimmer)) {
      var built = buildVoiceSource(voice, wave, freq, start, detuneCents);
      sources = built.sources;
      srcOut = built.out;
    } else {
      var osc = audio.ctx.createOscillator();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, start);
      if (detuneCents) osc.detune.setValueAtTime(detuneCents, start);
      sources = [osc];
      srcOut = osc;
    }

    // Global genre filter scale (music genres seq 4): darken (trip-hop 0.68) or brighten
    // (pop 1.12) the whole mix by scaling every voice's cutoff once, here, so it reaches both
    // the static path and the filter-envelope base. Clamped at genreFilterScaleMin so a genre
    // can never fully close the filter. Electronic (1) is a byte-for-byte no-op.
    var fScale = Math.max(AUDIO_TUNING.genreFilterScaleMin, getGenre().filterScale || 1);
    filter.type = "lowpass";
    if (voice && voice.filtEnv) {
      // Per-note subtractive filter envelope on the same lowpass node: turns a flat tone
      // into a pluck/swell/stab. No new nodes. base folds in the per-level cutoff drift
      // (identical nudge to the static path) and the genre filter scale. exponentialRamp needs
      // a non-zero target, hence the Math.max(60, ...) clamp. octaves is biased by drift.
      var fe = voice.filtEnv;
      var feBase = (filterFreq || 1600) * fScale * (1 + (drift ? drift.cutoffMul : 0));
      var feAttack = typeof fe.attack === "number" ? fe.attack : AUDIO_TUNING.voiceFiltEnvAttack;
      var feDecay = typeof fe.decay === "number" ? fe.decay : AUDIO_TUNING.voiceFiltEnvDecay;
      var feFloor = typeof fe.floor === "number" ? fe.floor : AUDIO_TUNING.voiceFiltEnvFloor;
      var feStart = typeof fe.start === "number" ? fe.start : AUDIO_TUNING.voiceFiltEnvStart;
      var feOctaves = Math.max(0, (typeof fe.octaves === "number" ? fe.octaves : AUDIO_TUNING.voiceFiltEnvOctaves) + (drift ? drift.filtEnvOctaveBias : 0));
      var fePeak = feBase * Math.pow(2, feOctaves);
      filter.frequency.setValueAtTime(Math.max(60, feBase * feStart), start);
      filter.frequency.exponentialRampToValueAtTime(Math.max(60, fePeak), start + feAttack);
      filter.frequency.exponentialRampToValueAtTime(Math.max(60, feBase * feFloor), start + feAttack + feDecay);
    } else {
      filter.frequency.setValueAtTime((filterFreq || 1600) * fScale * (1 + (drift ? drift.cutoffMul : 0)), start);
    }
    filter.Q.setValueAtTime(0.7 + energy * 2.4, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    srcOut.connect(filter);
    filter.connect(gain);
    var toneOut = bus || audio.master;
    if (pan) {
      pan.pan.setValueAtTime(panValue || 0, start);
      gain.connect(pan);
      pan.connect(toneOut);
    } else {
      gain.connect(toneOut);
    }
    if (!bus && audio.delay) gain.connect(audio.delay);

    var stopAt = start + duration + 0.04;
    for (var si = 0; si < sources.length; si++) {
      sources[si].start(start);
      sources[si].stop(stopAt);
    }
  }

  function playKick(time, amount, bus) {
    if (!audio.ctx) return;
    var out = bus || audio.impact || audio.master;
    var osc = audio.ctx.createOscillator();
    var gain = audio.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(100, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.12);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(AUDIO_TUNING.kickSubGain * amount, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
    osc.connect(gain);
    gain.connect(out);
    osc.start(time);
    osc.stop(time + 0.2);

    var knock = audio.ctx.createOscillator();
    var knockGain = audio.ctx.createGain();
    knock.type = "triangle";
    knock.frequency.setValueAtTime(AUDIO_TUNING.kickKnockHz, time);
    knock.frequency.exponentialRampToValueAtTime(AUDIO_TUNING.kickKnockHz * 0.5, time + 0.03);
    knockGain.gain.setValueAtTime(0.0001, time);
    knockGain.gain.exponentialRampToValueAtTime(AUDIO_TUNING.kickKnockGain * amount, time + 0.004);
    knockGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.07);
    knock.connect(knockGain);
    knockGain.connect(out);
    knock.start(time);
    knock.stop(time + 0.09);

    playNoise(time, 0.014, AUDIO_TUNING.kickClickGain * amount, AUDIO_TUNING.kickClickHz, 1.1, audio.impact);
  }

  function playSnare(time, amount) {
    // Genre drum kit (music genres seq 4): the procedural snare reroutes per genre. Electronic
    // (kit null) keeps the shipped backbeat crack byte-for-byte. Every branch is a parameter
    // swap on the same playNoise/playTone one-shot primitives (no new node type, same stop()/GC
    // contract), and any pitched body reads getHarmonyToneFreq so it stays in-key on any step.
    var kit = getGenre().drumKit;
    if (kit === "brush") {
      // Jazz: a longer, softer swept brush instead of the short crack, plus a quiet ride ping.
      playNoise(time, 0.16, amount * 0.6, 1200, 0.5);
      playTone(getHarmonyToneFreq(audio.step, 4, 3), time, 0.09, "sine", amount * 0.05, 0.12, 5200, null, VOICE_CHARACTERS.bell);
      return;
    }
    if (kit === "dusty") {
      // Trip-hop: a lower, rounder boom-bap body through a darker noise = a break under a lowpass.
      playNoise(time, 0.13, amount, 1100, 0.7);
      playTone(150, time, 0.1, "triangle", amount * 0.1, 0.05, 700);
      return;
    }
    if (kit === "clean") {
      // Pop: a tightened, clap-layered backbeat: a short 200 Hz body + a doubled clap 12 ms apart.
      playNoise(time, 0.06, amount, 1900, 1.1);
      playNoise(time + 0.012, 0.07, amount * 0.7, 1800, 1.0);
      playTone(200, time, 0.05, "triangle", amount * 0.09, 0.05, 1000);
      return;
    }
    // Electronic (default): the shipped snare.
    playNoise(time, 0.11, amount, 1600, 0.9);
    playTone(196, time, 0.08, "triangle", amount * 0.09, 0.05, 900);
  }

  function playHat(time, amount) {
    // Genre drum kit (music genres seq 4): jazz turns the tick into a swept ride, trip-hop
    // darkens it, pop/electronic keep the shipped bright hat. Same one-shot primitives.
    var kit = getGenre().drumKit;
    if (kit === "brush") {
      // Jazz ride: a longer, softer noise plus a faint sustained partial (kept in-key).
      playNoise(time, 0.09, amount * 0.7, 5200, 0.4);
      playTone(getHarmonyToneFreq(audio.step, 4, 4), time, 0.06, "sine", amount * 0.015, 0, 6000);
      return;
    }
    if (kit === "dusty") {
      // Trip-hop: a darker, dustier hat pulled down under the lowpass character.
      playNoise(time, 0.035, amount, 4800, 0.2);
      return;
    }
    // clean/electronic: the shipped bright hat.
    playNoise(time, 0.035, amount, 7200, 0.2);
  }

  function playNoiseSweep(time, chain) {
    playNoise(time, 0.18 + chain * 0.025, 0.12 + chain * 0.025, 2800 + chain * 600, 1.2);
  }

  function playNoise(time, duration, gainValue, filterFreq, q, bus) {
    if (!audio.ctx || !audio.master) return;
    var source = audio.ctx.createBufferSource();
    var filter = audio.ctx.createBiquadFilter();
    var gain = audio.ctx.createGain();
    source.buffer = getNoiseBuffer();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(filterFreq, time);
    filter.Q.setValueAtTime(q, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, gainValue), time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(bus || audio.master);
    var maxOffset = Math.max(0, 1.15 - duration);
    source.start(time, Math.random() * maxOffset);
    source.stop(time + duration + 0.02);
  }

  function playBridgeRiser(time, duration) {
    // Soft noise riser into the bridge downbeat: looped white noise through a bandpass that
    // sweeps up while the gain crescendos, then cuts at the downbeat. One-shot on the same
    // contract as playNoise/playTone: the nodes stop() at the end and GC (no persistent
    // handle), so the bridge leaves no dangling gain/source state behind.
    if (!audio.ctx || !audio.master) return;
    var source = audio.ctx.createBufferSource();
    var filter = audio.ctx.createBiquadFilter();
    var gain = audio.ctx.createGain();
    source.buffer = getNoiseBuffer();
    source.loop = true;
    filter.type = "bandpass";
    filter.Q.setValueAtTime(0.6, time);
    filter.frequency.setValueAtTime(600, time);
    filter.frequency.exponentialRampToValueAtTime(6000, time + duration);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, AUDIO_TUNING.bridgeRiserGain), time + duration);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration + 0.05);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(audio.master);
    source.start(time);
    source.stop(time + duration + 0.08);
  }

  function getNoiseBuffer() {
    if (audio.noiseBuffer) return audio.noiseBuffer;
    var length = Math.floor(audio.ctx.sampleRate * 1.2);
    var buffer = audio.ctx.createBuffer(1, length, audio.ctx.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    audio.noiseBuffer = buffer;
    return buffer;
  }

  function setVolume(value) {
    audio.volume = value;
    if (audio.muted) return;
    if (audio.master && audio.ctx) {
      audio.master.gain.setTargetAtTime(value * 0.68, audio.ctx.currentTime, 0.025);
    }
    if (audio.impact && audio.ctx) {
      audio.impact.gain.setTargetAtTime(value * AUDIO_TUNING.impactLevel, audio.ctx.currentTime, 0.025);
    }
  }

  function installDebugApi() {
    if (!window.location.search.match(/[?&]debug=1(?:&|$)/)) return;
    window.NeonLatticeDebug = {
      getState: function () {
        return {
          level: currentLevel ? currentLevel.id : null,
          levelState: levelState,
          shape: currentBoardShape,
          movesLeft: movesLeft,
          movesMade: levelStats ? levelStats.movesMade : 0,
          animating: animating,
          legalMoves: getLegalMoves().length,
          edgeLegalMoves: getEdgeLegalMoves().length,
          view: {
            boardX: view.boardX,
            boardY: view.boardY,
            boardSize: view.boardSize,
            cell: view.cell,
            width: view.width,
            height: view.height
          }
        };
      },
      validateBoard: validateDebugBoard,
      getAudioState: function () {
        return {
          started: audio.started,
          muted: audio.muted,
          ctxState: audio.ctx ? audio.ctx.state : null,
          masterGain: audio.master ? audio.master.gain.value : null,
          macroHz: audio.macro ? audio.macro.frequency.value : null,
          duckGain: audio.duck ? audio.duck.gain.value : null,
          impactGain: audio.impact ? audio.impact.gain.value : null,
          bedGain: audio.bed ? audio.bed.gain.value : null,
          step: audio.step,
          bridgeUntilStep: audio.bridgeUntilStep,
          bridgeActive: audio.step < audio.bridgeUntilStep,
          energy: energy,
          effectiveEnergy: audio.effectiveEnergy != null ? audio.effectiveEnergy : energy,
          drive: drive,
          director: {
            currentArousal: audio.director.currentArousal,
            playerArousal: audio.director.playerArousal,
            bias: audio.director.bias,
            ceiling: audio.director.ceiling,
            inputRate: audio.director.inputRate,
            failPressure: audio.director.failPressure,
            recoveryUntilStep: audio.director.recoveryUntilStep,
            grooveHalf: audio.director.grooveOverride != null
          },
          surprise: {
            budget: audio.surprise.budget,
            lastSpendBar: audio.surprise.lastSpendBar,
            harmonyOverride: audio.surprise.harmony,
            log: audio.surprise.log.slice()
          },
          gateState: {
            snare: audio.gateState.snare,
            hat: audio.gateState.hat,
            hat16: audio.gateState.hat16,
            bass: audio.gateState.bass,
            kickHi: audio.gateState.kickHi
          },
          arrangement: {
            bands: ARRANGEMENT_BANDS.map(function (b, i) {
              return { key: b.key, label: b.label, on: !!bandActive[i] };
            }),
            voices: bandActive.reduce(function (n, on) { return n + (on ? 1 : 0); }, 0)
          },
          levelMotif: audio.levelMotif,
          trackMotif: getTrackMotif(),
          phrase: {
            bar: getPhraseBar(audio.step),
            responseActive: isResponsePhrase(audio.step),
            topDegree: audio.phrase.topDegree,
            callShift: audio.phrase.callShift
          },
          mutation: {
            nextBar: audio.mutation.nextBar,
            hatPattern: audio.mutation.hatPattern ? audio.mutation.hatPattern.slice() : null,
            delayWetOffset: audio.mutation.delayWetOffset,
            log: audio.mutation.log.slice()
          },
          layerCount: audio.layers.length
        };
      },
      duckMusic: function (scale) {
        if (!audio.ctx) return null;
        duckMusic(audio.ctx.currentTime + 0.01, scale || 1);
        return true;
      },
      getLegalMoves: function () {
        return getLegalMoves().map(copyMoveForDebug);
      },
      getEdgeLegalMoves: function () {
        return getEdgeLegalMoves().map(copyMoveForDebug);
      },
      getActiveCells: getActiveCellsForDebug,
      getCellCenter: getBoardCellCenter,
      getCellFromPoint: function (x, y, edgeSnap) {
        return getCellFromPoint(x, y, Boolean(edgeSnap));
      },
      validateInputMap: validateDebugInputMap,
      startLevel: function (levelNumber) {
        var index = Math.max(0, Math.min(campaign.length - 1, Number(levelNumber || 1) - 1));
        startLevel(index);
        return this.getState();
      },
      setSpeed: function (factor) {
        debugTimeScale = Math.max(1, Math.min(40, Number(factor) || 1));
        return debugTimeScale;
      },
      setDirectorHour: function (hour) {
        debugDirectorHour = hour == null ? null : Math.max(0, Math.min(23, Math.floor(Number(hour) || 0)));
        return debugDirectorHour;
      },
      setDirectorSessionStart: function (msAgo) {
        audio.director.sessionStart = Date.now() - Math.max(0, Number(msAgo) || 0);
        return audio.director.sessionStart;
      },
      startLevelAttempt: function (levelNumber, attempt) {
        var index = Math.max(0, Math.min(campaign.length - 1, Number(levelNumber || 1) - 1));
        var level = campaign[index];
        var wantedAttempt = Math.max(1, Math.floor(Number(attempt) || 1));
        if (isSplashOpen()) closeSplashPanel();
        // Pin the attempt counter so the run seed is exactly (level, attempt), and
        // strip fail-streak mercy so measurements see the level's true tuning.
        campaignSave.attempts[String(level.id)] = wantedAttempt - 1;
        delete campaignSave.failStreaks[level.id];
        startLevel(index);
        guidedMove = null;
        return {
          level: level.id,
          attempt: currentLevelAttempt,
          seed: getCampaignRunSeed(level, currentLevelAttempt),
          moves: movesLeft,
          state: levelState
        };
      },
      executeSwap: function (move) {
        if (!move || !move.a || !move.b) return false;
        if (animating || levelState !== "playing" || isGameplayPaused()) return false;
        // Debug bots opt out of FTUE guides (startLevelAttempt already
        // nulls the swap guide; the nova tap guide and its replant loop
        // would otherwise strand the difficulty harness on level 5).
        // Session-only novaTap mark: not persisted via writeCoachSeen.
        if (guidedMove || novaPrimerGem) {
          guidedMove = null;
          novaPrimerGem = null;
        }
        if (novaPrimerSwap && !coachSeen.novaTap) coachSeen.novaTap = true;
        var before = levelStats ? levelStats.movesMade : 0;
        attemptSwap(
          { row: Number(move.a.row), col: Number(move.a.col) },
          { row: Number(move.b.row), col: Number(move.b.col) }
        );
        return animating || (levelStats ? levelStats.movesMade : 0) > before;
      },
      tapFire: function (row, col) {
        if (animating || levelState !== "playing" || isGameplayPaused()) return false;
        var cell = { row: Number(row), col: Number(col) };
        var gem = board[cell.row] && board[cell.row][cell.col];
        if (!gem || !gem.special) return false;
        armedSpecial = { row: cell.row, col: cell.col, special: gem.special };
        fireArmedSpecial();
        return animating;
      },
      scoreMoves: function () {
        return getLegalMoves().map(function (move) {
          var entry = copyMoveForDebug(move);
          if (hasSpecialComboAt(move.a, move.b)) {
            entry.comboSpecial = true;
            entry.cells = 0;
            entry.groups = [];
            return entry;
          }
          swapDataOnly(move.a, move.b);
          var data = findMatchData();
          entry.comboSpecial = false;
          entry.cells = data.cells.length;
          entry.groups = data.groups.map(function (group) {
            return { type: group.type, length: group.length };
          });
          swapDataOnly(move.a, move.b);
          return entry;
        });
      },
      getLevelInfo: function () {
        if (!currentLevel) return null;
        return {
          id: currentLevel.id,
          title: currentLevel.title,
          badge: currentLevel.badge || "",
          moves: currentLevel.moves,
          starTargets: currentLevel.starTargets.slice(),
          modifiers: {
            colorBias: currentLevel.modifiers.colorBias,
            tempoLift: currentLevel.modifiers.tempoLift,
            cascadeBonus: currentLevel.modifiers.cascadeBonus
          },
          layout: {
            pattern: currentLevel.layout.pattern,
            boardShape: currentLevel.layout.boardShape || "full",
            fluxTarget: currentLevel.layout.fluxTarget,
            gates: (currentLevel.layout.gates || []).map(function (cell) {
              return { row: cell.row, col: cell.col };
            })
          },
          beatGates: beatGateList.length === 0 ? null : {
            cells: beatGateList.map(function (cell) {
              return { row: cell.row, col: cell.col };
            }),
            openMoves: beatGateOpenMoves,
            closedMoves: beatGateClosedMoves,
            offset: beatGateOffset,
            phaseOpen: beatGatePhaseOpen,
            movesUntilToggle: movesUntilBeatGateToggle()
          },
          signalNodes: signalNodeList.length === 0 ? null : signalNodeList.map(function (node) {
            return { row: node.row, col: node.col };
          }),
          spectrum: spectrumList.length === 0 ? null : spectrumList.map(function (shield) {
            return { row: shield.row, col: shield.col, colors: shield.colors.slice(), remaining: shield.remaining.slice() };
          }),
          locks: getLivePhaseLocksForDebug(),
          fuseWires: fuseNetworkList.length === 0 ? null : fuseNetworkList.map(function (network) {
            return {
              fired: network.fired,
              cells: getLiveFuseGems(network).map(function (gem) {
                return { row: gem.row, col: gem.col, special: gem.special, type: gem.type };
              })
            };
          }),
          goals: currentLevel.goals.map(function (goal) {
            var copy = { kind: goal.kind, target: goal.target, value: getGoalValue(goal) };
            if (goal.kind === "collect") copy.type = goal.type;
            return copy;
          })
        };
      },
      getTextOverlay: function () {
        return {
          floaters: floaters.map(function (floater) {
            return {
              x: floater.x,
              y: floater.y,
              text: floater.text,
              size: floater.size,
              scale: floater.scale,
              score: Boolean(floater.value),
              life: floater.life
            };
          }),
          activeCallout: activeCallout ? { text: activeCallout.text, size: activeCallout.size, scale: activeCallout.scale } : null,
          queuedCallouts: calloutQueue.length,
          celebration: celebration ? {
            fading: celebration.fading,
            pops: celebration.pops.map(function (pop) {
              return { kind: pop.kind, text: pop.text, scale: pop.scale, alpha: pop.alpha };
            })
          } : null
        };
      },
      getOutcome: function () {
        if (!currentLevel) return null;
        return {
          level: currentLevel.id,
          attempt: currentLevelAttempt,
          state: levelState,
          movesLeft: movesLeft,
          score: score,
          stars: levelState === "won" ? calculateStars() : 0,
          goals: currentLevel.goals.map(function (goal) {
            var value = getGoalValue(goal);
            var copy = {
              kind: goal.kind,
              target: goal.target,
              value: value,
              shortfall: Math.max(0, goal.target - value)
            };
            if (goal.kind === "collect") copy.type = goal.type;
            return copy;
          })
        };
      },
      completeLevel: function () {
        if (gameMode !== MODE_CAMPAIGN || levelState !== "playing") return this.getState();
        completeLevel();
        updateHud();
        return this.getState();
      },
      forceWin: function () {
        return this.completeLevel();
      },
      forceFail: function () {
        if (gameMode !== MODE_CAMPAIGN || levelState !== "playing") return this.getState();
        failLevel();
        return this.getState();
      },
      setUnlimitedMoves: function (on) {
        debugUnlimitedMoves = Boolean(on);
        updateHud();
        return debugUnlimitedMoves;
      },
      setCredits: function (value) {
        campaignSave.wallet = normalizeWallet({ credits: Math.floor(Number(value) || 0) });
        writeCampaignSave();
        updateHud();
        return campaignSave.wallet.credits;
      },
      setBooster: function (name, count) {
        if (name !== "hammer" && name !== "shuffle" && name !== "charge") return null;
        campaignSave.boosters = normalizeBoosters(campaignSave.boosters);
        campaignSave.boosters[name] = Math.max(0, Math.floor(Number(count) || 0));
        writeCampaignSave();
        updateHud();
        return campaignSave.boosters;
      },
      setRewardDrop: function (overrides) {
        Object.keys(overrides || {}).forEach(function (key) {
          if (Object.prototype.hasOwnProperty.call(REWARD_DROP, key)) REWARD_DROP[key] = overrides[key];
        });
        return REWARD_DROP;
      },
      getRewardDropState: function () {
        var tokens = [];
        for (var row = 0; row < GRID; row += 1) {
          for (var col = 0; col < GRID; col += 1) {
            var gem = board[row] && board[row][col];
            if (gem && gem.drop) tokens.push({ row: row, col: col, drop: gem.drop, cause: gem.dropCause });
          }
        }
        return {
          dropped: rewardDropState.dropped,
          lastDropMove: rewardDropState.lastDropMove,
          movesMade: levelStats ? levelStats.movesMade : 0,
          tokens: tokens,
          ledger: levelGrantLedger.slice(),
          boosters: campaignSave.boosters
        };
      },
      setLevelStars: function (levelNumber, stars) {
        var id = Math.max(1, Math.min(campaign.length, Math.floor(Number(levelNumber) || 1)));
        var value = Math.max(0, Math.min(3, Math.floor(Number(stars) || 0)));
        if (value > 0) {
          campaignSave.stars[id] = value;
          campaignSave.unlocked = Math.max(campaignSave.unlocked, Math.min(campaign.length, id + 1));
        } else {
          delete campaignSave.stars[id];
        }
        writeCampaignSave();
        updateHud();
        return { level: id, stars: value, totalStars: getTotalStars() };
      },
      setTotalStars: function (total) {
        var remaining = Math.max(0, Math.min(campaign.length * 3, Math.floor(Number(total) || 0)));
        campaignSave.stars = {};
        var levelId = 1;
        while (remaining > 0 && levelId <= campaign.length) {
          var grant = Math.min(3, remaining);
          campaignSave.stars[levelId] = grant;
          remaining -= grant;
          levelId += 1;
        }
        campaignSave.unlocked = Math.max(campaignSave.unlocked, Math.min(campaign.length, levelId));
        writeCampaignSave();
        updateHud();
        return getTotalStars();
      },
      setStreak: function (current, best) {
        campaignSave.streak = normalizeStreakState({
          current: current,
          best: Math.max(Number(best) || 0, Number(current) || 0),
          lastDate: getDailyId(),
          claimedDates: campaignSave.streak && campaignSave.streak.claimedDates
        });
        writeCampaignSave();
        updateHud();
        return normalizeStreakState(campaignSave.streak);
      },
      startDaily: function () {
        if (isSplashOpen()) closeSplashPanel();
        startDaily();
        return this.getDailyState();
      },
      endPulseRun: function () {
        if (isPulseMode() && levelState === "playing") {
          pulse = 0.0001;
          endRush();
        }
        return this.getDailyState();
      },
      getDailyState: function () {
        campaignSave.streak = normalizeStreakState(campaignSave.streak);
        var entry = getDailyTakeEntry(dailyId);
        return {
          dailyId: dailyId,
          number: getDailyNumber(dailyId),
          track: getDailyPalette(dailyId).label,
          activePaletteId: getActiveMusicPaletteId(),
          take: dailyRunTake,
          rehearsal: isDailyRehearsal(),
          takeCount: entry.count,
          takeBest: entry.best,
          streak: {
            current: campaignSave.streak.current,
            best: campaignSave.streak.best,
            lastDate: campaignSave.streak.lastDate,
            passes: campaignSave.streak.passes,
            patchedDates: Object.keys(campaignSave.streak.patchedDates)
          },
          displayState: getStreakDisplayState()
        };
      },
      setStreakDates: function (lastDate, passes) {
        campaignSave.streak = normalizeStreakState(campaignSave.streak);
        campaignSave.streak.lastDate = String(lastDate || "");
        if (passes != null) campaignSave.streak.passes = Math.max(0, Math.min(BACKSTAGE_PASS_MAX, Math.floor(Number(passes) || 0)));
        delete campaignSave.streak.claimedDates[getDailyId()];
        writeCampaignSave();
        return this.getDailyState();
      },
      setDailyTakes: function (count, best) {
        campaignSave.daily = normalizeDailyState(campaignSave.daily);
        campaignSave.daily.takes[dailyId] = {
          count: Math.max(0, Math.min(DAILY_TAKE_LIMIT, Math.floor(Number(count) || 0))),
          best: Math.max(0, Math.floor(Number(best) || 0))
        };
        writeCampaignSave();
        return this.getDailyState();
      },
      openSetlist: function () {
        openSetlist();
        return isSetlistOpen();
      },
      setGoalProgress: function (goalIndex, value) {
        if (!currentLevel || !levelStats) return null;
        var goal = currentLevel.goals[Math.max(0, Math.floor(Number(goalIndex) || 0))];
        if (!goal) return null;
        var amount = Math.max(0, Math.floor(Number(value) || 0));
        if (goal.kind === "score") score = amount;
        if (goal.kind === "collect") levelStats.collected[goal.type] = amount;
        if (goal.kind === "flux") levelStats.fluxCleared = amount;
        if (goal.kind === "signal") levelStats.signalCollected = amount;
        if (goal.kind === "spread") levelStats.spreadCleared = amount;
        if (goal.kind === "specials") {
          levelStats.specialsCreated = amount;
          levelStats.specialsActivated = 0;
        }
        if (goal.kind === "fusion") levelStats.fusions = amount;
        if (goal.kind === "chain") levelStats.maxChain = amount;
        if (goal.kind === "overdrive") levelStats.overdrives = amount;
        announceCompletedGoals();
        updateHud();
        return { kind: goal.kind, target: goal.target, value: getGoalValue(goal) };
      },
      triggerSectorReveal: function () {
        if (gameMode !== MODE_CAMPAIGN || !currentLevel) return false;
        maybeStartSectorReveal(true);
        return true;
      },
      setMusicPalette: function (index) {
        var paletteIndex = Math.max(0, Math.min(MUSIC_PALETTES.length - 1, Math.floor(Number(index) || 0)));
        updateMusicPalette(MUSIC_PALETTES[paletteIndex].id);
        populateMusicPaletteSelect();
        syncSettingsUi();
        return MUSIC_PALETTES[paletteIndex].id;
      },
      // Genre test hook (music genres seq 9): routes through the same player path as the
      // selector (updateMusicGenre persists + applyAudioGenre + callout/hud), then syncs the
      // select so the settings UI reflects a debug-driven change. Returns the diagnostic
      // triple so a test harness can assert the live vinyl gain and chord vocabulary.
      setMusicGenre: function (id) {
        updateMusicGenre(normalizeMusicGenre(id));
        syncSettingsUi();
        return { genre: settings.musicGenre, vinylGain: audio.vinylGain ? audio.vinylGain.gain.value : null, chordDegrees: getChordDegrees() };
      },
      spawnAt: function (row, col, kind) {
        var r = Math.floor(Number(row));
        var c = Math.floor(Number(col));
        var want = String(kind == null ? "" : kind);
        if (want === "signal") return toggleSignalNodeAt(r, c);
        if (want === "spectrum") return toggleSpectrumShieldAt(r, c);
        if (want === "lock") return togglePhaseLockAt(r, c);
        if (want === "wire") return toggleFuseWireAt(r, c);
        if (!isCellActive(r, c)) return null;
        var gem = board[r] && board[r][c];
        if (!gem) return null;
        if (want === "nova" || want === "lineH" || want === "lineV") {
          createSpecialPiece({ cell: { row: r, col: c }, special: want });
        } else {
          var typeIndex = want !== "" && Number.isFinite(Number(want))
            ? Math.floor(Number(want))
            : TYPES.findIndex(function (type) {
              return type.name.toLowerCase() === want.toLowerCase();
            });
          if (typeIndex < 0 || typeIndex >= TYPES.length) return null;
          gem.type = typeIndex;
          gem.special = null;
          gem.pop = Math.max(gem.pop, 0.6);
        }
        updateHud();
        return { row: r, col: c, type: gem.type, special: gem.special };
      },
      getReadouts: function () {
        return {
          fps: Math.round(frameQuality.smoothedFps * 10) / 10,
          quality: getFrameQualityLabel(),
          level: currentLevel ? currentLevel.id : null,
          attempt: currentLevelAttempt,
          seed: currentLevel && gameMode === MODE_CAMPAIGN ? getCampaignRunSeed(currentLevel, currentLevelAttempt || 1) : null,
          levelState: levelState,
          movesLeft: movesLeft,
          score: score,
          unlimitedMoves: debugUnlimitedMoves,
          beatGates: beatGateList.length === 0 ? null : {
            count: beatGateList.length,
            phaseOpen: beatGatePhaseOpen,
            movesUntilToggle: movesUntilBeatGateToggle()
          },
          phaseLocks: Object.keys(phaseLockMap).length,
          fusePending: fuseQueue.length,
          novaPrimer: novaPrimerSwap ? {
            swap: { a: { row: novaPrimerSwap.a.row, col: novaPrimerSwap.a.col }, b: { row: novaPrimerSwap.b.row, col: novaPrimerSwap.b.col } },
            gem: novaPrimerGem ? { row: novaPrimerGem.row, col: novaPrimerGem.col, special: novaPrimerGem.special } : null
          } : null,
          guidedMove: guidedMove ? {
            a: { row: guidedMove.a.row, col: guidedMove.a.col },
            b: { row: guidedMove.b.row, col: guidedMove.b.col },
            tap: Boolean(guidedMove.tap)
          } : null,
          audio: this.getAudioState()
        };
      },
      spawnGateAt: function (row, col) {
        var r = Math.floor(Number(row));
        var c = Math.floor(Number(col));
        if (!isCellActive(r, c) || r < 2) return null;
        var key = r + ":" + c;
        if (beatGateMap[key]) {
          delete beatGateMap[key];
          beatGateList = beatGateList.filter(function (cell) {
            return cell.row !== r || cell.col !== c;
          });
        } else {
          if (beatGateList.length === 0) {
            beatGateOffset = 0;
            beatGatePhaseOpen = isBeatGateOpenAt(beatGateMoveCount);
            beatGateAnim = 1;
          }
          beatGateMap[key] = true;
          beatGateList.push({ row: r, col: c });
          if (!beatGatePhaseOpen && board[r] && board[r][c]) {
            burstMatches([{ row: r, col: c }], 1);
            board[r][c] = null;
          }
        }
        return {
          row: r,
          col: c,
          gates: beatGateList.length,
          phaseOpen: beatGatePhaseOpen,
          movesUntilToggle: movesUntilBeatGateToggle()
        };
      },
      listHums: function () {
        return creatureSpecs.map(function (h, i) { return { index: i, id: h.id, name: h.name }; });
      },
      previewHum: function (indexOrId, opts) {
        if (indexOrId == null) { humPreview = null; return null; }
        var i = -1;
        if (typeof indexOrId === "string") {
          for (var k = 0; k < creatureSpecs.length; k += 1) {
            if (creatureSpecs[k].id === indexOrId || creatureSpecs[k].name === indexOrId) { i = k; break; }
          }
        } else {
          i = Math.max(0, Math.min(creatureSpecs.length - 1, Math.floor(Number(indexOrId) || 0)));
        }
        if (i < 0 || !creatureSpecs[i]) return null;
        humPreview = { index: i, opts: opts || {} };
        return creatureSpecs[i].id;
      }
    };
    installDebugPanel();
  }

  function toggleSignalNodeAt(row, col) {
    // God-mode: drop or remove a Signal Node. Nodes keep the top-two-row
    // feel lock and never stack on gates.
    if (row < 2 || row >= GRID || col < 0 || col >= GRID) return null;
    var key = row + ":" + col;
    if (signalNodeMap[key]) {
      delete signalNodeMap[key];
      signalNodeList = signalNodeList.filter(function (node) {
        return node.row !== row || node.col !== col;
      });
      boardMask[row][col] = isCellActiveForShape(currentBoardShape || "full", row, col);
    } else {
      if (!isCellActive(row, col) || isBeatGateCell(row, col)) return null;
      signalNodeMap[key] = true;
      signalNodeList.push({ row: row, col: col, flashAt: 0 });
      if (board[row] && board[row][col]) {
        burstMatches([{ row: row, col: col }], 1);
        board[row][col] = null;
      }
      if (tileCharges[row]) tileCharges[row][col] = 0;
      boardMask[row][col] = false;
    }
    return { row: row, col: col, nodes: signalNodeList.length };
  }

  function toggleSpectrumShieldAt(row, col) {
    // God-mode: drop or remove a Spectrum Shield (3 colors from the seed).
    if (!isCellActive(row, col)) return null;
    var key = row + ":" + col;
    if (spectrumMap[key]) {
      delete spectrumMap[key];
      spectrumList = spectrumList.filter(function (shield) {
        return shield.row !== row || shield.col !== col;
      });
      return { row: row, col: col, shields: spectrumList.length };
    }
    var colors = pickSpectrumColors(currentLevel ? currentLevel.id : 0, row * GRID + col, 3);
    var shield = {
      row: row,
      col: col,
      colors: colors,
      remaining: colors.slice(),
      segmentFlash: {},
      brokeAt: 0
    };
    spectrumMap[key] = shield;
    spectrumList.push(shield);
    return { row: row, col: col, shields: spectrumList.length, colors: colors.slice() };
  }

  function getLivePhaseLocksForDebug() {
    var live = phaseLockList.filter(function (lock) {
      return Boolean(phaseLockMap[lock.row + ":" + lock.col]);
    });
    if (live.length === 0) return null;
    return live.map(function (lock) {
      var gem = board[lock.row] && board[lock.row][lock.col];
      return { row: lock.row, col: lock.col, type: gem ? gem.type : null, special: gem ? gem.special : null };
    });
  }

  function togglePhaseLockAt(row, col) {
    // God-mode: cage or free the piece in place (keeps the feel locks).
    var lock = phaseLockMap[row + ":" + col];
    if (lock) {
      shatterPhaseLock(lock, board[row] && board[row][col]);
      return { row: row, col: col, locks: Object.keys(phaseLockMap).length };
    }
    var made = lockGemAt(row, col, null);
    if (!made) return null;
    return { row: row, col: col, locks: Object.keys(phaseLockMap).length };
  }

  function toggleFuseWireAt(row, col) {
    // God-mode: wire the cell's special into the open debug network (or
    // unwire it). A pieceless or plain cell gets a lineH to wire first.
    if (!isCellActive(row, col)) return null;
    var gem = board[row] && board[row][col];
    if (!gem) return null;
    if (gem.fuse) {
      var network = gem.fuse;
      network.gems = network.gems.filter(function (wired) {
        return wired !== gem;
      });
      gem.fuse = null;
      if (network.gems.length < 2) {
        network.gems.forEach(function (wired) {
          wired.fuse = null;
        });
        fuseNetworkList = fuseNetworkList.filter(function (candidate) {
          return candidate !== network;
        });
      }
      return { row: row, col: col, networks: fuseNetworkList.length };
    }
    if (!gem.special) createSpecialPiece({ cell: { row: row, col: col }, special: "lineH" });
    var target = null;
    for (var i = 0; i < fuseNetworkList.length; i += 1) {
      if (fuseNetworkList[i].debug && !fuseNetworkList[i].fired) target = fuseNetworkList[i];
    }
    if (!target) {
      target = { gems: [], fired: false, debug: true };
      fuseNetworkList.push(target);
    }
    target.gems.push(gem);
    gem.fuse = target;
    return { row: row, col: col, wired: target.gems.length, networks: fuseNetworkList.length };
  }

  function installDebugPanel() {
    var api = window.NeonLatticeDebug;
    var panel = document.createElement("div");
    panel.id = "debugPanel";
    panel.className = "debug-panel is-collapsed";
    panel.innerHTML = [
      '<div class="debug-panel-head">',
      '<button type="button" id="dbgToggle">DEV</button>',
      '<span id="dbgHeadInfo"></span>',
      "</div>",
      '<div class="debug-panel-body">',
      '<div class="debug-row">L <input id="dbgLevel" type="number" min="1" value="1">',
      '<button type="button" id="dbgJump">Go</button>',
      '<button type="button" id="dbgWin">Win</button>',
      '<button type="button" id="dbgFail">Fail</button></div>',
      '<div class="debug-row"><label><input id="dbgUnlimited" type="checkbox"> Inf moves</label>',
      '<button type="button" id="dbgReveal">Sector reveal</button></div>',
      '<div class="debug-row">Credits <input id="dbgCredits" type="number" min="0" value="250">',
      '<button type="button" id="dbgSetCredits">Set</button></div>',
      '<div class="debug-row">H <input id="dbgHammer" type="number" min="0" value="0">',
      'S <input id="dbgShuffle" type="number" min="0" value="0">',
      'C <input id="dbgCharge" type="number" min="0" value="0">',
      '<button type="button" id="dbgSetBoosters">Set</button></div>',
      '<div class="debug-row">Stars L<input id="dbgStarLevel" type="number" min="1" value="1">',
      '= <input id="dbgStarCount" type="number" min="0" max="3" value="3">',
      '<button type="button" id="dbgSetStars">Set</button>',
      'Total <input id="dbgTotalStars" type="number" min="0" value="0">',
      '<button type="button" id="dbgSetTotalStars">Set</button></div>',
      '<div class="debug-row">Streak <input id="dbgStreak" type="number" min="0" value="0">',
      '<button type="button" id="dbgSetStreak">Set</button></div>',
      '<div class="debug-row">Goal #<input id="dbgGoalIndex" type="number" min="0" value="0">',
      '= <input id="dbgGoalValue" type="number" min="0" value="0">',
      '<button type="button" id="dbgSetGoal">Set</button></div>',
      '<div class="debug-row">Palette <select id="dbgPalette"></select>',
      '<button type="button" id="dbgSetPalette">Set</button></div>',
      '<div class="debug-row">Spawn r<input id="dbgSpawnRow" type="number" min="0" max="7" value="0">',
      'c<input id="dbgSpawnCol" type="number" min="0" max="7" value="0">',
      '<select id="dbgSpawnKind"></select>',
      '<button type="button" id="dbgSpawn">Go</button></div>',
      '<div class="debug-row">Gate r<input id="dbgGateRow" type="number" min="2" max="7" value="4">',
      'c<input id="dbgGateCol" type="number" min="0" max="7" value="3">',
      '<button type="button" id="dbgGateAdd">Gate</button>',
      '<span id="dbgGatePhase"></span></div>',
      '<pre id="dbgReadout"></pre>',
      "</div>"
    ].join("");
    document.body.appendChild(panel);
    function q(id) {
      return panel.querySelector("#" + id);
    }
    function num(id) {
      return Number(q(id).value) || 0;
    }
    MUSIC_PALETTES.forEach(function (palette, index) {
      var option = document.createElement("option");
      option.value = String(index);
      option.textContent = index + " " + palette.label;
      q("dbgPalette").appendChild(option);
    });
    ["nova", "lineH", "lineV", "signal", "spectrum", "lock", "wire"].concat(TYPES.map(function (type) { return type.name; })).forEach(function (kind) {
      var option = document.createElement("option");
      option.value = kind;
      option.textContent = kind;
      q("dbgSpawnKind").appendChild(option);
    });
    bindPrimaryPress(q("dbgToggle"), function () {
      panel.classList.toggle("is-collapsed");
    });
    bindPrimaryPress(q("dbgJump"), function () {
      api.startLevelAttempt(num("dbgLevel"), 1);
    });
    bindPrimaryPress(q("dbgWin"), function () {
      api.forceWin();
    });
    bindPrimaryPress(q("dbgFail"), function () {
      api.forceFail();
    });
    q("dbgUnlimited").addEventListener("change", function (event) {
      api.setUnlimitedMoves(event.target.checked);
    });
    bindPrimaryPress(q("dbgReveal"), function () {
      api.triggerSectorReveal();
    });
    bindPrimaryPress(q("dbgSetCredits"), function () {
      api.setCredits(num("dbgCredits"));
    });
    bindPrimaryPress(q("dbgSetBoosters"), function () {
      api.setBooster("hammer", num("dbgHammer"));
      api.setBooster("shuffle", num("dbgShuffle"));
      api.setBooster("charge", num("dbgCharge"));
    });
    bindPrimaryPress(q("dbgSetStars"), function () {
      api.setLevelStars(num("dbgStarLevel"), num("dbgStarCount"));
    });
    bindPrimaryPress(q("dbgSetTotalStars"), function () {
      api.setTotalStars(num("dbgTotalStars"));
    });
    bindPrimaryPress(q("dbgSetStreak"), function () {
      api.setStreak(num("dbgStreak"));
    });
    bindPrimaryPress(q("dbgSetGoal"), function () {
      api.setGoalProgress(num("dbgGoalIndex"), num("dbgGoalValue"));
    });
    bindPrimaryPress(q("dbgSetPalette"), function () {
      api.setMusicPalette(Number(q("dbgPalette").value) || 0);
    });
    bindPrimaryPress(q("dbgSpawn"), function () {
      api.spawnAt(num("dbgSpawnRow"), num("dbgSpawnCol"), q("dbgSpawnKind").value);
    });
    bindPrimaryPress(q("dbgGateAdd"), function () {
      api.spawnGateAt(num("dbgGateRow"), num("dbgGateCol"));
    });
    var readoutEl = q("dbgReadout");
    var headInfoEl = q("dbgHeadInfo");
    var gatePhaseEl = q("dbgGatePhase");
    window.setInterval(function () {
      var info = api.getReadouts();
      headInfoEl.textContent = "L" + (info.level || "-") + " " + info.levelState + " " + info.fps + "fps";
      gatePhaseEl.textContent = info.beatGates
        ? (info.beatGates.phaseOpen ? "OPEN" : "CLOSED") + " tgl-" + info.beatGates.movesUntilToggle + " x" + info.beatGates.count
        : "no gates";
      if (!panel.classList.contains("is-collapsed")) {
        readoutEl.textContent = JSON.stringify(info, null, 1);
      }
    }, 500);
  }

  function validateDebugBoard() {
    var nullActiveCells = [];
    var inactiveGems = [];
    var mismatchedGems = [];
    var isolatedCells = [];
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        var active = isCellActive(row, col);
        var gem = board[row] && board[row][col];
        // Beat-gate cells and cells starved under a closed gate hold no
        // piece by design; the validator must not flag them.
        // Cells starved under a phase-locked cage hold no piece by design
        // (the cage is a wall) until the cage breaks.
        if (active && !gem && !isBeatGateCell(row, col) && !isBelowClosedBeatGate(row, col) && !isBelowPhaseLock(row, col)) nullActiveCells.push({ row: row, col: col });
        if (!active && gem) inactiveGems.push({ row: row, col: col });
        if (gem && (gem.row !== row || gem.col !== col)) mismatchedGems.push({ row: row, col: col, gemRow: gem.row, gemCol: gem.col });
        if (active && !hasActiveNeighbor(row, col)) isolatedCells.push({ row: row, col: col });
      }
    }
    var legalMoves = getLegalMoves();
    return {
      ok: nullActiveCells.length === 0 && inactiveGems.length === 0 && mismatchedGems.length === 0 && isolatedCells.length === 0 && legalMoves.length > 0,
      shape: currentBoardShape,
      activeCells: countActiveCells(),
      nullActiveCells: nullActiveCells,
      inactiveGems: inactiveGems,
      mismatchedGems: mismatchedGems,
      isolatedCells: isolatedCells,
      legalMoves: legalMoves.length,
      edgeLegalMoves: getEdgeLegalMoves().length
    };
  }

  function validateDebugInputMap() {
    var misses = [];
    var rect = canvas.getBoundingClientRect ? canvas.getBoundingClientRect() : { left: 0, top: 0 };
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        if (!isCellActive(row, col)) continue;
        var center = getBoardCellCenter({ row: row, col: col });
        var mapped = getCellFromPoint(center.x + rect.left, center.y + rect.top, true);
        if (!mapped || mapped.row !== row || mapped.col !== col) {
          misses.push({
            row: row,
            col: col,
            mapped: mapped
          });
        }
      }
    }
    return {
      ok: misses.length === 0,
      misses: misses,
      topRowsActive: getActiveCellsForDebug().filter(function (cell) {
        return cell.row <= 1;
      }).length,
      topRowsLegalMoves: getLegalMoves().filter(function (move) {
        return move.a.row <= 1 || move.b.row <= 1;
      }).length
    };
  }

  function hasActiveNeighbor(row, col) {
    return isCellActive(row - 1, col) || isCellActive(row + 1, col) || isCellActive(row, col - 1) || isCellActive(row, col + 1);
  }

  function isBelowClosedBeatGate(row, col) {
    if (beatGateList.length === 0 || beatGatePhaseOpen) return false;
    for (var above = row - 1; above >= 0; above -= 1) {
      if (isBeatGateClosed(above, col)) return true;
    }
    return false;
  }

  function isBelowPhaseLock(row, col) {
    if (phaseLockList.length === 0) return false;
    for (var above = row - 1; above >= 0; above -= 1) {
      if (isPhaseLocked(above, col)) return true;
    }
    return false;
  }

  function countActiveCells() {
    return getActiveCellsForDebug().length;
  }

  function getActiveCellsForDebug() {
    var cells = [];
    for (var row = 0; row < GRID; row += 1) {
      for (var col = 0; col < GRID; col += 1) {
        if (isCellActive(row, col)) cells.push({ row: row, col: col });
      }
    }
    return cells;
  }

  function getEdgeLegalMoves() {
    return getLegalMoves().filter(function (move) {
      return isEdgeCell(move.a) || isEdgeCell(move.b);
    });
  }

  function isEdgeCell(cell) {
    return cell.row === 0 || cell.row === GRID - 1 || cell.col === 0 || cell.col === GRID - 1;
  }

  function copyMoveForDebug(move) {
    return {
      a: { row: move.a.row, col: move.a.col },
      b: { row: move.b.row, col: move.b.col }
    };
  }

  var resizeDebounceTimer = 0;
  function requestResize() {
    window.clearTimeout(resizeDebounceTimer);
    resizeDebounceTimer = window.setTimeout(function () {
      window.requestAnimationFrame(function () {
        if (!resize()) return;
        updateHud();
        render(performance.now() / 1000);
      });
    }, 120);
  }
  window.addEventListener("resize", requestResize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", requestResize);
  }
  window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
    if (event.key === "Escape") closeShareCard(true);
    if (event.key === "Escape") closeMap();
    if (event.key === "Escape") closeSetlist();
    if (event.key === "Escape") closeStore();
    if (event.key === "Escape") closeSettings();
    if (event.key === "Escape" && activeCoachTip) {
      dismissActiveCoachTip();
      showNextCoachTip();
    }
  });
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", function () {
    cancelPointerCapture();
  });
  window.addEventListener("pointerdown", proxyBoardPointerDown, true);
  window.addEventListener("pointermove", proxyBoardPointerMove, true);
  window.addEventListener("pointerup", proxyBoardPointerUp, true);
  window.addEventListener("pointercancel", proxyBoardPointerCancel, true);
  window.addEventListener(
    "pointerdown",
    function (event) {
      if (!hudSheetOpen || !hudPanel) return;
      if (hudPanel.contains(event.target)) return;
      setHudSheetOpen(false);
      event.preventDefault();
      event.stopPropagation();
    },
    true
  );

  document.addEventListener(
    "click",
    function (event) {
      if (Date.now() >= suppressClicksUntil) {
        suppressClickSource = null;
        return;
      }
      if (
        suppressClickSource &&
        (event.target === suppressClickSource ||
          suppressClickSource.contains(event.target))
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    true
  );
  bindPrimaryPress(audioButton, handleAudioButtonPress);
  bindPrimaryPress(hudToggle, function () {
    setHudSheetOpen(!hudSheetOpen);
    forceBoardRelayout();
  });
  bindPrimaryPress(splashStartButton, startSplashRun);
  bindPrimaryPress(splashDailyButton, startDailyFromSplash);
  bindPrimaryPress(splashMenuButton, openMenu);
  bindMenuPress(menuResumeButton, resumeFromMenu);
  bindMenuPress(menuAudioButton, startAudioFromMenu);
  window.addEventListener("pointerdown", resumeAudioFromGesture);
  window.addEventListener("click", resumeAudioFromGesture);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) resumeAudioFromGesture();
  });
  modeButton.addEventListener("click", toggleMode);
  dailyButton.addEventListener("click", startDaily);
  resetButton.addEventListener("click", newBoard);
  settingsButton.addEventListener("click", openSettings);
  closeSettingsButton.addEventListener("click", closeSettings);
  hapticsToggle.addEventListener("change", function (event) {
    updateHaptics(event.target.checked);
  });
  hapticsTestButton.addEventListener("click", testHaptics);
  fullFxToggle.addEventListener("change", function (event) {
    updateFullFx(event.target.checked);
  });
  musicPaletteSelect.addEventListener("change", function (event) {
    updateMusicPalette(event.target.value);
  });
  musicGenreSelect.addEventListener("change", function (event) {
    updateMusicGenre(event.target.value);
  });
  musicAutoToggle.addEventListener("change", function (event) {
    updateMusicAuto(event.target.checked);
  });
  unlockAllButton.addEventListener("click", unlockAllLevels);
  resetProgressButton.addEventListener("click", resetLocalProgress);
  settingsPanel.addEventListener("click", function (event) {
    if (event.target === settingsPanel) closeSettings();
  });
  mapButton.addEventListener("click", openMap);
  storeButton.addEventListener("click", openStore);
  menuButton.addEventListener("click", openMenu);
  bindMenuPress(closeMenuButton, closeMenu);
  bindMenuPress(menuMapButton, openMapFromMenu);
  bindMenuPress(menuStoreButton, openStoreFromMenu);
  bindMenuPress(menuShareButton, openShareFromMenu);
  bindMenuPress(menuRushButton, startRushFromMenu);
  bindMenuPress(menuDailyButton, startDailyFromMenu);
  bindMenuPress(menuSetlistButton, openSetlistFromMenu);
  if (menuGreenroomButton) bindMenuPress(menuGreenroomButton, openGreenroomFromMenu);
  bindMenuPress(menuRestartButton, restartFromMenu);
  bindMenuPress(menuSettingsButton, openSettingsFromMenu);
  closeStoreButton.addEventListener("click", closeStore);
  shareButton.addEventListener("click", function () {
    openShareCard(buildCurrentSharePayload());
  });
  shareCopyButton.addEventListener("click", copyShareCard);
  nativeShareButton.addEventListener("click", nativeShareCard);
  shareImageButton.addEventListener("click", saveShareImage);
  closeShareButton.addEventListener("click", function () {
    closeShareCard(true);
  });
  closeMapButton.addEventListener("click", closeMap);
  if (closeSetlistButton) closeSetlistButton.addEventListener("click", closeSetlist);
  if (setlistPlayButton) setlistPlayButton.addEventListener("click", startDailyFromSetlist);
  if (setlistPanel) {
    setlistPanel.addEventListener("click", function (event) {
      if (event.target === setlistPanel) closeSetlist();
    });
  }
  if (closeGreenroomButton) closeGreenroomButton.addEventListener("click", closeGreenroom);
  if (greenroomPanel) {
    greenroomPanel.addEventListener("click", function (event) {
      if (event.target === greenroomPanel) closeGreenroom();
    });
  }
  if (greenroomCanvas) {
    greenroomCanvas.addEventListener("pointerdown", function (event) {
      event.preventDefault();
      handleGreenroomPress(event);
    });
  }
  bindPrimaryPress(coachBodyEl, function () {
    dismissActiveCoachTip();
    showNextCoachTip();
  });
  mapPanel.addEventListener("click", function (event) {
    if (event.target === mapPanel) closeMap();
  });
  menuPanel.addEventListener("click", function (event) {
    if (event.target === menuPanel) closeMenu();
  });
  storePanel.addEventListener("click", function (event) {
    if (event.target === storePanel) closeStore();
  });
  sharePanel.addEventListener("click", function (event) {
    if (event.target !== sharePanel) return;
    // Result cards (win/fail) render over a translucent full-screen scrim that
    // shows the board through it. A tap on that exposed area must NOT silently
    // advance a win or restart a loss (skipping the Continue +5 offer): those
    // cards are dismissed only via their explicit Next Level / Retry / Continue
    // button. Plain (mid-run) share cards still tap-close on the scrim.
    if (sharePanel.classList.contains("is-result")) return;
    closeShareCard(true);
  });
  hammerButton.addEventListener("click", function () {
    toggleBooster("hammer");
  });
  shuffleButton.addEventListener("click", useShuffle);
  chargeButton.addEventListener("click", useCharge);
  prevLevelButton.addEventListener("click", function () {
    if (currentLevelIndex > 0) startLevel(currentLevelIndex - 1);
  });
  nextLevelButton.addEventListener("click", function () {
    if (currentLevelIndex + 1 < campaignSave.unlocked && currentLevelIndex + 1 < campaign.length) {
      startLevel(currentLevelIndex + 1);
    }
  });
  volumeInput.addEventListener("input", function (event) {
    setVolume(Number(event.target.value) / 100);
  });

  populateMusicPaletteSelect();
  populateMusicGenreSelect();
  syncSettingsUi();
  updateSplashStartLabel();
  resize();
  startInitialRun();
  loadCreatureSpecs();
  installDebugApi();
  window.requestAnimationFrame(draw);
})();
