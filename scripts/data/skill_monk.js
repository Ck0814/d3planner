if (!DiabloCalc.skillcat) DiabloCalc.skillcat = {};
if (!DiabloCalc.skills) DiabloCalc.skills = {};
if (!DiabloCalc.passives) DiabloCalc.passives = {};
if (!DiabloCalc.partybuffs) DiabloCalc.partybuffs = {};
DiabloCalc.skillcat.monk = {
  primary: "Primary",
  secondary: "Secondary",
  defensive: "Defensive",
  techniques: "Techniques",
  focus: "Focus",
  mantras: "Mantras",
};
DiabloCalc.skills.monk = {
  fistsofthunder: {
    id: "fists-of-thunder",
    name: "Fists of Thunder",
    category: "primary",
    row: 0,
    col: 0,
    runes: {
      a: "Thunderclap",
      e: "Wind Blast",
      c: "Static Charge",
      d: "Quickening",
      b: "Bounding Light",
    },
    info: function(rune, stats) {
      var res;
      switch (rune) {
      case "x": res = {"Damage": {elem: "lit", coeff: 2}, "Third Hit Damage": {elem: "lit", coeff: 4}}; break;
      case "a": res = {"Damage": {elem: "lit", coeff: 2}, "Third Hit Damage": {elem: "lit", coeff: 4}, "Shockwave Damage": {elem: "lit", coeff: 1.2}}; break;
      case "e": res = {"Damage": {elem: "col", coeff: 2}, "Third Hit Damage": {elem: "col", coeff: 4}}; break;
      case "c": res = {"Damage": {elem: "lit", coeff: 2}, "Third Hit Damage": {elem: "lit", coeff: 4}, "Static Charge Damage": {elem: "lit", coeff: 1.8}}; break;
      case "d": res = {"Damage": {elem: "phy", coeff: 2}, "Third Hit Damage": {elem: "phy", coeff: 4}}; break;
      case "b": res = {"Damage": {elem: "hol", coeff: 2}, "Third Hit Damage": {elem: "hol", coeff: 4}, "Arc Damage": {elem: "hol", coeff: 2.4}}; break;
      }
      var speed = 1 / (1/1.64 + 1/1.64 + 1);
      var ias = (stats.passives.alacrity ? 15 : 0) + (stats.set_storms_2pc ? 25 : 0);
      res["DPS"] = {sum: true, "Damage": {speed: speed, ias: ias, count: 2}, "Third Hit Damage": {speed: speed, ias: ias}};
//      res["DPS"] = {sum: true, "Damage": {speed: 1, fpa: [37, 38, 59], ias: ias, count: 2}, "Third Hit Damage": {speed: speed, fpa: [37, 38, 59], ias: ias, nobp: true}};
      if (res["Shockwave Damage"]) res["DPS"]["Shockwave Damage"] = {speed: speed, ias: ias, count: 3};
      if (res["Arc Damage"]) res["DPS"]["Arc Damage"] = {speed: speed, ias: ias};
      var spirit = (rune === "d" ? 20 : 14);
      if (stats.skills.breathofheaven === "d" && DiabloCalc.isSkillActive("breathofheaven")) {
        spirit += 14;
      }
      spirit *= (1 + 0.01 * (stats.leg_bandofruechambers || 0)) * (1 + 0.01 * (stats.resourcegen || 0));
      res["Spirit/sec"] = DiabloCalc.formatNumber(stats.info.aps * 3 * speed * (1 + 0.01 * ias) * spirit, 1, 10000);
      return res;
    },
  },
  deadlyreach: {
    id: "deadly-reach",
    name: "Deadly Reach",
    category: "primary",
    row: 0,
    col: 1,
    runes: {
      b: "Piercing Trident",
      e: "Searing Grasp",
      c: "Scattered Blows",
      d: "Strike from Beyond",
      a: "Foresight",
    },
    info: function(rune, stats) {
      var res;
      switch (rune) {
      case "x": res = {"Damage": {elem: "phy", coeff: 1.5}}; break;
      case "b": res = {"Damage": {elem: "phy", coeff: 1.5}}; break;
      case "e": res = {"Damage": {elem: "fir", coeff: 2.6}}; break;
      case "c": res = {"Damage": {elem: "lit", coeff: 1.5}, "Blast Damage": {elem: "lit", coeff: 2.15}}; break;
      case "d": res = {"Damage": {elem: "col", coeff: 1.5}}; break;
      case "a": res = {"Damage": {elem: "phy", coeff: 1.5}}; break;
      }
      var speed = 1 / (1/1.59 + 1/1.59 + 1);
      var ias = (stats.passives.alacrity ? 15 : 0) + (stats.set_storms_2pc ? 25 : 0);
      res["DPS"] = {sum: true, "Damage": {speed: speed, ias: ias, count: 3}};
      var spirit = 12;
      if (stats.skills.breathofheaven === "d" && DiabloCalc.isSkillActive("breathofheaven")) {
        spirit += 14;
      }
      spirit *= (1 + 0.01 * (stats.leg_bandofruechambers || 0)) * (1 + 0.01 * (stats.resourcegen || 0));
      res["Spirit/sec"] = DiabloCalc.formatNumber(stats.info.aps * 3 * speed * (1 + 0.01 * ias) * spirit, 1, 10000);
      return res;
    },
    active: false,
    buffs: {
      a: {damage: 15},
    },
  },
  cripplingwave: {
    id: "crippling-wave",
    name: "Crippling Wave",
    category: "primary",
    row: 0,
    col: 2,
    runes: {
      a: "Mangle",
      c: "Concussion",
      d: "Rising Tide",
      b: "Tsunami",
      e: "Breaking Wave",
    },
    info: function(rune, stats) {
      var res;
      switch (rune) {
      case "x": res = {"Damage": {elem: "phy", coeff: 1.55}}; break;
      case "a": res = {"Damage": {elem: "fir", coeff: 2.55}}; break;
      case "c": res = {"Damage": {elem: "phy", coeff: 1.55}}; break;
      case "d": res = {"Damage": {elem: "hol", coeff: 1.55}}; break;
      case "b": res = {"Damage": {elem: "col", coeff: 1.55}}; break;
      case "e": res = {"Damage": {elem: "phy", coeff: 1.55}}; break;
      }
      var speed = 1 / (1/1.53 + 1/1.53 + 1);
      var ias = (stats.passives.alacrity ? 15 : 0) + (stats.set_storms_2pc ? 25 : 0);
      res["DPS"] = {sum: true, "Damage": {speed: speed, ias: ias, count: 3}};
      var spirit = (rune === "d" ? 12 + 2.5 : 12);
      if (stats.skills.breathofheaven === "d" && DiabloCalc.isSkillActive("breathofheaven")) {
        spirit += 14;
      }
      spirit *= (1 + 0.01 * (stats.leg_bandofruechambers || 0)) * (1 + 0.01 * (stats.resourcegen || 0));
      res["Spirit/sec"] = DiabloCalc.formatNumber(stats.info.aps * 3 * speed * (1 + 0.01 * ias) * spirit, 1, 10000);
      return res;
    },
    active: true,
    buffs: {
      e: {dmgtaken: 10},
    },
  },
  wayofthehundredfists: {
    id: "way-of-the-hundred-fists",
    name: "Way of the Hundred Fists",
    category: "primary",
    row: 0,
    col: 3,
    runes: {
      b: "Hands of Lightning",
      c: "Blazing Fists",
      a: "Fists of Fury",
      d: "Assimilation",
      e: "Windforce Flurry",
    },
    info: function(rune, stats) {
      var res;
      switch (rune) {
      case "x": res = {"Damage": {elem: "phy", coeff: 1.9}}; break;
      case "b": res = {"Damage": {elem: "lit", coeff: 1.9}, "Second Hit Damage": {elem: "lit", coeff: 4.23, total: true}}; break;
      case "c": res = {"Damage": {elem: "fir", coeff: 1.9}}; break;
      case "a": res = {"Damage": {elem: "hol", coeff: 1.9}, "Dash Damage": {elem: "hol", coeff: 0.6, total: true}}; break;
      case "d": res = {"Damage": {elem: "phy", coeff: 1.9}}; break;
      case "e": res = {"Damage": {elem: "col", coeff: 1.9}, "Wave Damage": {elem: "col", coeff: 5}}; break;
      }
      var speed = 1 / (1/1.53 + 1/1.53 + 1);
      var ias = (stats.passives.alacrity ? 15 : 0) + (stats.set_storms_2pc ? 25 : 0);
      res["DPS"] = {sum: true, "Damage": {speed: speed, ias: ias, count: (rune == "b" ? 2 : 3)}};
      if (res["Second Hit Damage"]) res["DPS"]["Second Hit Damage"] = {speed: speed, ias: ias};
      if (res["Dash Damage"]) res["DPS"]["Dash Damage"] = {speed: speed, ias: ias};
      if (res["Wave Damage"]) res["DPS"]["Wave Damage"] = {speed: speed, ias: ias};
      var spirit = 12;
      if (stats.skills.breathofheaven === "d" && DiabloCalc.isSkillActive("breathofheaven")) {
        spirit += 14;
      }
      spirit *= (1 + 0.01 * (stats.leg_bandofruechambers || 0)) * (1 + 0.01 * (stats.resourcegen || 0));
      res["Spirit/sec"] = DiabloCalc.formatNumber(stats.info.aps * 3 * speed * (1 + 0.01 * ias) * spirit, 1, 10000);
      return res;
    },
    active: true,
    params: [{rune: "c", min: 0, max: 3, val: 0, name: "Stacks"},
             {rune: "d", min: 0, max: 10, val: 0, name: "Stacks", inf: true}],
    buffs: function(rune, stats) {
      if (rune === "c") return {ias: this.params[0].val * 5, extrams: this.params[0].val * 5};
      if (rune === "d") return {damage: this.params[1].val * 5};
    },
  },
  lashingtailkick: {
    id: "lashing-tail-kick",
    name: "Lashing Tail Kick",
    category: "secondary",
    row: 1,
    col: 0,
    runes: {
      a: "Vulture Claw Kick",
      d: "Sweeping Armada",
      b: "Spinning Flame Kick",
      e: "Scorpion Sting",
      c: "Hand of Ytar",
    },
    info: function(rune, stats) {
      var res;
      switch (rune) {
      case "x": res = {"Damage": {elem: "phy", coeff: 7.55}}; break;
      case "a": res = {"Damage": {elem: "fir", coeff: 7.55}, "Burn Damage": {elem: "fir", coeff: 2.3, total: true}}; break;
      case "d": res = {"Damage": {elem: "phy", coeff: 8.25}}; break;
      case "b": res = {"Damage": {elem: "fir", coeff: 7.55}}; break;
      case "e": res = {"Damage": {elem: "lit", coeff: 7.55}}; break;
      case "c": res = {"Damage": {elem: "col", coeff: 7.55}}; break;
      }
      if (stats.set_inna_6pc) {
        var ext = {pet: true, weapon: "mainhand", percent: {"Ally %": stats.skill_monk_mystically}};
        res["Ally Damage"] = $.extend({}, res["Damage"], ext);
        if (res["Burn Damage"]) res["Ally Burn Damage"] = $.extend({}, res["Burn Damage"], ext);
        var count = (stats.leg_thecrudestboots ? 2 : 1);
        var total = {sum: true, "Damage": {}, "Ally Damage": {count: count}};
        if (res["Burn Damage"]) {
          total["Burn Damage"] = {};
          total["Ally Burn Damage"] = {count: count};
        }
        res["Total Damage"] = total;
      }
      return res;
    },
  },
  tempestrush: {
    id: "tempest-rush",
    name: "Tempest Rush",
    category: "secondary",
    row: 1,
    col: 1,
    runes: {
      d: "Northern Breeze",
      b: "Tailwind",
      e: "Flurry",
      c: "Electric Field",
      a: "Bluster",
    },
    params: [{rune: "e", min: 1, max: 100, name: "Flurry Stacks", buffs: false}],
    info: function(rune, stats) {
      var res;
      switch (rune) {
      case "x": res = {"DPS": {elem: "phy", aps: true, coeff: 3.9, total: true}}; break;
      case "d": res = {"DPS": {elem: "hol", aps: true, coeff: 5, total: true}}; break;
      case "b": res = {"DPS": {elem: "phy", aps: true, coeff: 3.9, total: true}}; break;
      case "e": res = {"DPS": {elem: "col", aps: true, coeff: 3.9, total: true}, "Flurry Damage": {elem: "col", coeff: 1.5 * this.params[0].val + 1.35}}; break;
      case "c": res = {"DPS": {elem: "lit", aps: true, coeff: 3.9, total: true}, "Field DPS": {elem: "lit", aps: true, coeff: 1.35, total: true}}; break;
      case "a": res = {"DPS": {elem: "fir", aps: true, coeff: 3.9, total: true}}; break;
      }
      return res;
    },
  },
  waveoflight: {
    id: "wave-of-light",
    name: "Wave of Light",
    category: "secondary",
    row: 1,
    col: 2,
    runes: {
      a: "Wall of Light",
      b: "Explosive Light",
      d: "Empowered Wave",
      e: "Shattering Light",
      c: "Pillar of the Ancients",
    },
    info: function(rune, stats) {
      var res;
      switch (rune) {
      case "x": res = {"Damage": {elem: "hol", coeff: 8.35}}; break;
      case "a": res = {"Damage": {elem: "phy", coeff: 8.35}}; break;
      case "b": res = {"Damage": {elem: "fir", coeff: 8.3}}; break;
      case "d": res = {"Damage": {elem: "hol", coeff: 10.45}}; break;
      case "e": res = {"Damage": {elem: "col", coeff: 8.35}, "Wave Damage": {elem: "col", coeff: 8.2}}; break;
      case "c": res = {"Damage": {elem: "lit", coeff: 6.35}, "Residual Damage": {elem: "lit", coeff: 7.85, total: true}}; break;
      }
      if (stats.set_inna_6pc) {
        var ext = {pet: true, weapon: "mainhand", percent: {"Ally %": stats.skill_monk_mystically}};
        res["Ally Damage"] = $.extend({}, res["Damage"], ext);
        if (res["Wave Damage"]) res["Ally Wave Damage"] = $.extend({}, res["Wave Damage"], ext);
        if (res["Residual Damage"]) res["Ally Residual Damage"] = $.extend({}, res["Residual Damage"], ext);
        var count = (stats.leg_thecrudestboots ? 2 : 1);
        var total = {sum: true, "Damage": {}, "Ally Damage": {count: count}};
        if (res["Wave Damage"]) {
          total["Wave Damage"] = {};
          total["Ally Wave Damage"] = {count: count};
        }
        if (res["Residual Damage"]) {
          total["Residual Damage"] = {};
          total["Ally Residual Damage"] = {count: count};
        }
        res["Total Damage"] = total;
      }
      return res;
    },
  },
  blindingflash: {
    id: "blinding-flash",
    name: "Blinding Flash",
    category: "defensive",
    row: 2,
    col: 0,
    nolmb: true,
    runes: {
      d: "Self Reflection",
      c: "Mystifying Light",
      b: "Replenishing Light",
      e: "Soothing Light",
      a: "Faith in the Light",
    },
    info: {
      x: {"Uptime": {duration: 3, cooldown: 15}},
      d: {"Uptime": {duration: 6, cooldown: 15}},
      c: {"Uptime": {duration: 3, cooldown: 15}},
      b: {"Uptime": {duration: 3, cooldown: 15}},
      e: {"Uptime": {duration: 3, cooldown: 15}},
      a: {"Uptime": {duration: 3, cooldown: 15}},
    },
    active: false,
    buffs: function(rune, stats) {
      if (rune === "a") return {damage: 29};
      if (rune === "e") return {regen: 26821 + 0.9 * stats.info.itemregen};
    },
  },
  breathofheaven: {
    id: "breath-of-heaven",
    name: "Breath of Heaven",
    category: "defensive",
    row: 2,
    col: 1,
    nolmb: true,
    runes: {
      a: "Circle of Scorn",
      b: "Circle of Life",
      c: "Blazing Wrath",
      d: "Infused with Light",
      e: "Zephyr",
    },
    info: {
      a: {"Damage": {elem: "hol", coeff: 5.05}},
      c: {"Uptime": {duration: 9, cooldown: 15}},
    },
    active: true,
    buffs: {
      c: {damage: 10},
      d: {},
    },
  },
  serenity: {
    id: "serenity",
    name: "Serenity",
    category: "defensive",
    row: 2,
    col: 2,
    nolmb: true,
    runes: {
      a: "Peaceful Repose",
      e: "Unwelcome Disturbance",
      d: "Tranquility",
      c: "Ascension",
      b: "Instant Karma",
    },
    info: {
      x: {"Uptime": {duration: 3, cooldown: 16, after: true}},
      a: {"Uptime": {duration: 3, cooldown: 16, after: true}},
      e: {"DPS": {elem: "phy", coeff: 4.38, total: true}, "Uptime": {duration: 3, cooldown: 16, after: true}},
      d: {"Uptime": {duration: 3, cooldown: 16, after: true}},
      c: {"Uptime": {duration: 4, cooldown: 16, after: true}},
      b: {"Uptime": {duration: 3, cooldown: 16, after: true}},
    },
  },
  innersanctuary: {
    id: "inner-sanctuary",
    name: "Inner Sanctuary",
    category: "defensive",
    row: 2,
    col: 3,
    nolmb: true,
    runes: {
      b: "Sanctified Ground",
      d: "Safe Haven",
      c: "Temple of Protection",
      a: "Intervene",
      e: "Forbidden Palace",
    },
    info: {
      x: {"Uptime": {duration: 6, cooldown: 20}},
      b: {"Uptime": {duration: 8, cooldown: 20}},
      d: {"Uptime": {duration: 6, cooldown: 20}},
      c: {"Uptime": {duration: 6, cooldown: 20}},
      a: {"Uptime": {duration: 6, cooldown: 20}},
      e: {"Uptime": {duration: 6, cooldown: 20}},
    },
    active: false,
    buffs: {
      x: {dmgred: 55},
      b: {dmgred: 55},
      d: {dmgred: 55, regen: 35779},
      c: {dmgred: 55},
      a: {dmgred: 55},
      e: {dmgred: 55, dmgtaken: 30},
    },
  },
  dashingstrike: {
    id: "dashing-strike",
    name: "Dashing Strike",
    category: "techniques",
    row: 3,
    col: 0,
    runes: {
      b: "Way of the Falling Star",
      c: "Blinding Speed",
      d: "Quicksilver",
      e: "Radiance",
      a: "Barrage",
    },
    info: function(rune, stats) {
      var res;
      switch (rune) {
      case "x": res = {"Damage": {elem: "phy", coeff: 3.7}}; break;
      case "b": res = {"Damage": {elem: "hol", coeff: 3.7}}; break;
      case "c": res = {"Damage": {elem: "col", coeff: 3.7}}; break;
      case "d": res = {"Damage": {elem: "lit", coeff: 3.7}}; break;
      case "e": res = {"Damage": {elem: "fir", coeff: 3.7}}; break;
      case "a": res = {"Damage": {elem: "phy", coeff: 3.7}, "Barrage Damage": {elem: "phy", coeff: 9.75, total: true}}; break;
      }
      if (stats.set_storms_6pc && DiabloCalc.itemaffixes.set_storms_6pc.active) {
        res["Damage"].coeff = 125;
      }
      return res;
    },
  },
  explodingpalm: {
    id: "exploding-palm",
    name: "Exploding Palm",
    category: "techniques",
    row: 3,
    col: 1,
    runes: {
      c: "The Flesh is Weak",
      d: "Strong Spirit",
      b: "Impending Doom",
      a: "Shocking Grasp",
      e: "Essence Burn",
    },
    info: function(rune, stats) {
      var expl = {"The Fist of Az'Turrasq": stats.leg_thefistofazturrasq};
      var res;
      switch (rune) {
      case "x": res = {"Damage": {elem: "phy", coeff: 12, total: true}, "Explosion Damage": {elem: "phy", coeff: 27.7, percent: expl}}; break;
      case "c": res = {"Damage": {elem: "phy", coeff: 12, total: true}, "Explosion Damage": {elem: "phy", coeff: 27.7, percent: expl}}; break;
      case "d": res = {"Damage": {elem: "hol", coeff: 12, total: true}, "Explosion Damage": {elem: "hol", coeff: 27.7, percent: expl}}; break;
      case "b": res = {"Explosion Damage": {elem: "col", coeff: 63.05, percent: expl}}; break;
      case "a": res = {"Damage": {elem: "lit", coeff: 12, total: true}, "Explosion Damage": {elem: "lit", coeff: 27.7, percent: expl}}; break;
      case "e": res = {"Damage": {elem: "fir", coeff: 18.75, total: true}, "Explosion Damage": {elem: "fir", coeff: 32.6, percent: expl, total: true}}; break;
      }
      if (stats.set_inna_6pc) {
        var ext = {pet: true, weapon: "mainhand", percent: {"Ally %": stats.skill_monk_mystically}};
        if (res["Damage"]) {
          res["Ally Damage"] = $.extend({}, res["Damage"], ext);
          res["Total Damage"] = {sum: true, "Damage": {}, "Ally Damage": {count: (stats.leg_thecrudestboots ? 2 : 1)}};
        }
        res["Ally Explosion Damage"] = $.extend({}, res["Explosion Damage"], ext);
        res["Total Explosion Damage"] = {sum: true, "Explosion Damage": {}, "Ally Explosion Damage": {count: (stats.leg_thecrudestboots ? 2 : 1)}};
      }
      return res;
    },
    active: false,
    buffs: {
      c: {dmgtaken: 20},
    },
  },
  sweepingwind: {
    id: "sweeping-wind",
    name: "Sweeping Wind",
    category: "techniques",
    row: 3,
    col: 2,
    nolmb: true,
    runes: {
      e: "Master of Wind",
      a: "Blade Storm",
      b: "Fire Storm",
      d: "Inner Storm",
      c: "Cyclone",
    },
    params: [{min: 1, max: "leg_vengefulwind?6:3", name: "Stacks", buffs: false}],
    info: {
      x: {"DPS": {elem: "phy", aps: true, coeff: 1.05, factors: {"Stacks": "$1"}, total: true}},
      e: {"DPS": {elem: "col", aps: true, coeff: 1.05, factors: {"Stacks": "$1"}, total: true}},
      a: {"DPS": {elem: "phy", aps: true, coeff: 1.45, factors: {"Stacks": "$1"}, total: true}},
      b: {"DPS": {elem: "fir", aps: true, coeff: 1.05, factors: {"Stacks": "$1"}, total: true}},
      d: {"DPS": {elem: "hol", aps: true, coeff: 1.05, factors: {"Stacks": "$1"}, total: true}},
      c: {"DPS": {elem: "lit", aps: true, coeff: 1.05, factors: {"Stacks": "$1"}, total: true}, "Tornado Damage": {elem: "lit", coeff: 0.95}},
    },
    passive: function(rune, stats) {
      if (rune === "d" && this.params[0].val >= 3) return {spiritregen: 8};
    },
  },
  cyclonestrike: {
    id: "cyclone-strike",
    name: "Cyclone Strike",
    category: "focus",
    row: 4,
    col: 0,
    runes: {
      d: "Eye of the Storm",
      b: "Implosion",
      a: "Sunburst",
      e: "Wall of Wind",
      c: "Soothing Breeze",
    },
    info: function(rune, stats) {
      var res;
      switch (rune) {
      case "x": res = {"Damage": {elem: "hol", coeff: 2.61}}; break;
      case "d": res = {"Damage": {elem: "lit", coeff: 2.61}}; break;
      case "b": res = {"Damage": {elem: "hol", coeff: 2.61}}; break;
      case "a": res = {"Damage": {elem: "fir", coeff: 4.54}}; break;
      case "e": res = {"Damage": {elem: "col", coeff: 2.61}}; break;
      case "c": res = {"Damage": {elem: "hol", coeff: 2.61}, "Healing": DiabloCalc.formatNumber(31036 + (stats.healbonus || 0) * 0.17, 0, 1000)}; break;
      }
      if (stats.set_inna_6pc) {
        var ext = {pet: true, weapon: "mainhand", percent: {"Ally %": stats.skill_monk_mystically}};
        res["Ally Damage"] = $.extend({}, res["Damage"], ext);
        res["Total Damage"] = {sum: true, "Damage": {}, "Ally Damage": {count: (stats.leg_thecrudestboots ? 2 : 1)}};
      }
      return res;
    },
  },
  sevensidedstrike: {
    id: "sevensided-strike",
    name: "Seven-Sided Strike",
    category: "focus",
    row: 4,
    col: 1,
    runes: {
      a: "Sudden Assault",
      b: "Incinerate",
      c: "Pandemonium",
      d: "Sustained Attack",
      e: "Fulminating Onslaught",
    },
    info: function(rune, stats) {
      var res;
      switch (rune) {
      case "x": res = {"Damage": {elem: "phy", coeff: 56.77, divide: {"Hits": 7}}, "Total Damage": {sum: true, "Damage": {count: 7}}}; break;
      case "a": res = {"Damage": {elem: "lit", coeff: 82.85, divide: {"Hits": 7}}, "Total Damage": {sum: true, "Damage": {count: 7}}}; break;
      case "b": res = {"Damage": {elem: "fir", coeff: 56.77, divide: {"Hits": 7}}, "Burn Damage": {elem: "fir", coeff: 6.3, total: true}, "Total Damage": {sum: true, "Damage": {count: 7}, "Burn Damage": {count: 7}}}; break;
      case "c": res = {"Damage": {elem: "col", coeff: 56.77, divide: {"Hits": 7}}, "Total Damage": {sum: true, "Damage": {count: 7}}}; break;
      case "d": res = {"Damage": {elem: "phy", coeff: 56.77, divide: {"Hits": 7}}, "Total Damage": {sum: true, "Damage": {count: 7}}}; break;
      case "e": res = {"Damage": {elem: "hol", coeff: 8.77}, "Total Damage": {sum: true, "Damage": {count: 7}}}; break;
      }
      if (stats.set_inna_6pc) {
        var ext = {pet: true, weapon: "mainhand", percent: {"Ally %": stats.skill_monk_mystically}};
        res["Ally Damage"] = $.extend({}, res["Damage"], ext);
        if (rune == "e") {
          res["Ally Damage"].factors = {"Hits": 7};
        } else {
          res["Ally Damage"].divide = undefined;
        }
        res["Total Damage"]["Ally Damage"] = {count: (stats.leg_thecrudestboots ? 2 : 1)};
      }
      return res;
    },
  },
  mystically: {
    id: "mystic-ally",
    name: "Mystic Ally",
    category: "focus",
    row: 4,
    col: 2,
    nolmb: true,
    runes: {
      b: "Water Ally",
      a: "Fire Ally",
      d: "Air Ally",
      e: "Enduring Ally",
      c: "Earth Ally",
    },
    info: {
      x: {"Damage": {elem: "phy", pet: true, coeff: 1.3, percent: {"Inna's Mantra": "set_inna_2pc?100:0"}}, "DPS": {sum: true, "Damage": {pet: 42, speed: 1, count: "leg_thecrudestboots?2:1"}}, "Activated Damage": {elem: "phy", pet: true, aps: true, coeff: 1.3, percent: {"Activation": 50, "Inna's Mantra": "set_inna_2pc?100:0"}}, "Activated DPS": {sum: true, "Activated Damage": {pet: 42, count: "leg_thecrudestboots?2:1"}}},
      b: {"Damage": {elem: "col", pet: true, coeff: 1.3, percent: {"Inna's Mantra": "set_inna_2pc?100:0"}}, "DPS": {sum: true, "Damage": {pet: 42, speed: 1, count: "leg_thecrudestboots?2:1"}}, "Activation Damage": {elem: "col", pet: true, coeff: 6.25}, "Total Activation Damage": {sum: true, "Activation Damage": {count: "7*(leg_thecrudestboots?2:1)"}}},
      a: {"Damage": {elem: "fir", pet: true, coeff: 1.3, percent: {"Inna's Mantra": "set_inna_2pc?100:0"}}, "DPS": {sum: true, "Damage": {pet: 42, speed: 1, count: "leg_thecrudestboots?2:1"}}, "Explosion Damage": {elem: "fir", pet: true, coeff: 2.9}},
      d: {"Damage": {elem: "hol", pet: true, coeff: 1.3, percent: {"Inna's Mantra": "set_inna_2pc?100:0"}}, "DPS": {sum: true, "Damage": {pet: 42, speed: 1, count: "leg_thecrudestboots?2:1"}}},
      e: {"Damage": {elem: "phy", pet: true, coeff: 1.3, percent: {"Inna's Mantra": "set_inna_2pc?100:0"}}, "DPS": {sum: true, "Damage": {pet: 42, speed: 1, count: "leg_thecrudestboots?2:1"}}},
      c: {"Damage": {elem: "phy", pet: true, coeff: 1.3, percent: {"Inna's Mantra": "set_inna_2pc?100:0"}}, "DPS": {sum: true, "Damage": {pet: 42, speed: 1, count: "leg_thecrudestboots?2:1"}}, "Boulder DPS": {elem: "phy", pet: true, aps: true, coeff: 3.8, total: true}},
    },
    passive: function(rune, stats) {
      var count = (stats.leg_thecrudestboots ? 2 : 1) * (stats.set_inna_2pc ? 2 : 1);
      switch (rune) {
      case "a": return {damage: 10 * count};
      case "d": return {spiritregen: 4 * count};
      case "e": return {regen: (10728.42 + stats.info.itemregen * 0.3) * count};
      case "c": return {life: 20 * count};
      }
    },
  },
  epiphany: {
    id: "epiphany",
    name: "Epiphany",
    category: "focus",
    row: 4,
    col: 3,
    nolmb: true,
    runes: {
      a: "Desert Shroud",
      e: "Ascendance",
      b: "Soothing Mist",
      c: "Insight",
      d: "Inner Fire",
    },
    info: {
      x: {"Uptime": {duration: 15, cooldown: 60}},
      a: {"Uptime": {duration: 15, cooldown: 60}},
      e: {"Uptime": {duration: 15, cooldown: 60}},
      b: {"Uptime": {duration: 15, cooldown: 60}},
      c: {"Uptime": {duration: 15, cooldown: 60}},
      d: {"Extra Damage": {elem: "fir", coeff: 3.53}, "Uptime": {duration: 15, cooldown: 60}},
    },
    active: false,
    buffs: {
      x: {spiritregen: 20},
      a: {spiritregen: 20, dmgred: 50},
      e: {spiritregen: 20},
      b: {spiritregen: 20},
      c: {spiritregen: 45},
      d: {spiritregen: 20},
    },
  },
  mantraofsalvation: {
    id: "mantra-of-salvation",
    name: "Mantra of Salvation",
    category: "mantras",
    row: 5,
    col: 0,
    nolmb: true,
    runes: {
      c: "Hard Target",
      e: "Divine Protection",
      d: "Wind through the Reeds",
      b: "Perseverance",
      a: "Agility",
    },
    active: false,
    buffs: {
      x: {resist_percent: 20},
      c: {resist_percent: 20},
      e: {resist_percent: 20},
      d: {resist_percent: 20},
      b: {resist_percent: 20},
      a: {resist_percent: 20},
    },
    passive: function(rune, stats) {
      var base = 20 * (stats.set_inna_2pc ? 2 : 1);
      switch (rune) {
      case "x": return {resist_percent: base};
      case "c": return {resist_percent: base, armor_percent: 20};
      case "e": return {resist_percent: base};
      case "d": return {resist_percent: base, extrams: 10};
      case "b": return {resist_percent: base + 20};
      case "a": return {resist_percent: base, dodge: 35};
      }
    },
  },
  mantraofretribution: {
    id: "mantra-of-retribution",
    name: "Mantra of Retribution",
    category: "mantras",
    row: 5,
    col: 1,
    nolmb: true,
    runes: {
      a: "Retaliation",
      b: "Transgression",
      c: "Indignation",
      d: "Against All Odds",
      e: "Collateral Damage",
    },
    info: function(rune, stats) {
      var base = 1.01 * (stats.set_inna_2pc ? 2 : 1);
      switch (rune) {
      case "x": return {"Damage": {elem: "hol", coeff: base}, "Activated Damage": {elem: "hol", coeff: base * 2}};
      case "a": return {"Damage": {elem: "fir", coeff: base + 1.01}, "Activated Damage": {elem: "fir", coeff: (base + 1.01) * 2}};
      case "b": return {"Damage": {elem: "hol", coeff: base}, "Activated Damage": {elem: "hol", coeff: base * 2}};
      case "c": return {"Damage": {elem: "hol", coeff: base}, "Activated Damage": {elem: "hol", coeff: base * 2}};
      case "d": return {"Damage": {elem: "hol", coeff: base}, "Activated Damage": {elem: "hol", coeff: base * 2}};
      case "e": return {"Damage": {elem: "hol", coeff: base}, "Activated Damage": {elem: "hol", coeff: base * 2}};
      }
    },
    passive: {
      b: {ias: 10},
    },
  },
  mantraofhealing: {
    id: "mantra-of-healing",
    name: "Mantra of Healing",
    category: "mantras",
    row: 5,
    col: 2,
    nolmb: true,
    runes: {
      a: "Sustenance",
      d: "Circular Breathing",
      b: "Boon of Inspiration",
      c: "Heavenly Body",
      e: "Time of Need",
    },
    info: {
      x: {"Shield": "@62064+healbonus*0.15"},
      a: {"Shield": "@62064+healbonus*0.15"},
      d: {"Shield": "@62064+healbonus*0.15"},
      b: {"Shield": "@62064+healbonus*0.15"},
      c: {"Shield": "@62064+healbonus*0.15"},
      e: {"Shield": "@62064+healbonus*0.15"},
    },
    passive: function(rune, stats) {
      var regen = 10728.42;
      regen += (stats.regen || 0) * 0.3;
      regen *= (stats.set_inna_2pc ? 2 : 1);
      switch (rune) {
      case "x": return {regen: regen};
      case "a": return {regen: regen + 10728.42 + (stats.regen || 0) * 0.3};
      case "d": return {regen: regen, spiritregen: 3};
      case "b": return {regen: regen};
      case "c": return {regen: regen, life: 20};
      case "e": return {regen: regen};
      }
    },
  },
  mantraofconviction: {
    id: "mantra-of-conviction",
    name: "Mantra of Conviction",
    category: "mantras",
    row: 5,
    col: 3,
    nolmb: true,
    runes: {
      a: "Overawe",
      e: "Intimidation",
      c: "Dishearten",
      d: "Annihilation",
      b: "Submission",
    },
    info: {
      b: {"DPS": {elem: "hol", aps: true, coeff: 0.38, total: true}},
    },
    active: false,
    buffs: {
      x: {dmgtaken: 10},
      a: {dmgtaken: 8},
      e: {dmgtaken: 10},
      c: {dmgtaken: 10},
      d: {dmgtaken: 10},
      b: {dmgtaken: 10},
    },
    passive: function(rune, stats) {
      var base = 10 * (stats.set_inna_2pc ? 2 : 1);
      switch (rune) {
      case "x": return {dmgtaken: base};
      case "a": return {dmgtaken: base + 6};
      case "e": return {dmgtaken: base};
      case "c": return {dmgtaken: base};
      case "d": return {dmgtaken: base};
      case "b": return {dmgtaken: base};
      }
    },
  },
};
DiabloCalc.passives.monk = {
  resolve: {
    id: "resolve",
    name: "Resolve",
    index: 0,
  },
  fleetfooted: {
    id: "fleet-footed",
    name: "Fleet Footed",
    index: 1,
    buffs: {extrams: 10},
  },
  exaltedsoul: {
    id: "exalted-soul",
    name: "Exalted Soul",
    index: 2,
    buffs: {maxspirit: 50, spiritregen: 4},
  },
  transcendence: {
    id: "transcendence",
    name: "Transcendence",
    index: 3,
    buffs: function(stats) {
      return {lifespirit: 429 + 0.004 * stats.healbonus};
    },
  },
  chantofresonance: {
    id: "chant-of-resonance",
    name: "Chant of Resonance",
    index: 4,
    buffs: function(stats) {
      if (stats.skills.mantraofsalvation || stats.skills.mantraofretribution ||
          stats.skills.mantraofhealing || stats.skills.mantraofconviction) {
        return {spiritregen: 4};
      }
    },
  },
  seizetheinitiative: {
    id: "seize-the-initiative",
    name: "Seize the Initiative",
    index: 5,
    active: false,
    buffs: {ias: 30},
  },
  theguardianspath: {
    id: "the-guardians-path",
    name: "The Guardian's Path",
    index: 6,
    buffs: function(stats) {
      if (stats.info.mainhand.slot == "onehand" && stats.info.offhand && stats.info.offhand.slot == "onehand") {
        return {dodge: 35};
      } else if (stats.info.mainhand.slot == "twohand") {
        return {resourcegen: 15};
      }
    },
  },
  sixthsense: {
    id: "sixth-sense",
    name: "Sixth Sense",
    index: 7,
    buffs: {nonphys: 25},
  },
  determination: {
    id: "determination",
    name: "Determination",
    index: 8,
    params: [{min: 0, max: 5, name: "Nearby Enemies"}],
    buffs: function(stats) {return {damage: 4 * this.params[0].val};},
  },
  relentlessassault: {
    id: "relentless-assault",
    name: "Relentless Assault",
    index: 9,
    active: true,
    buffs: {dmgmul: 20},
  },
  beaconofytar: {
    id: "beacon-of-ytar",
    name: "Beacon of Ytar",
    index: 10,
    buffs: {cdr: 20},
  },
  alacrity: {
    id: "alacrity",
    name: "Alacrity",
    index: 11,
  },
  harmony: {
    id: "harmony",
    name: "Harmony",
    index: 12,
    buffs: function(stats) {
      var single = (stats.resphy || 0) + (stats.resfir || 0) + (stats.rescol || 0) +
                   (stats.respsn || 0) + (stats.resarc || 0) + (stats.reslit || 0);
      single *= 0.4;
      return {
        resphy: single - (stats.resphy || 0) * 0.4,
        resfir: single - (stats.resfir || 0) * 0.4,
        rescol: single - (stats.rescol || 0) * 0.4,
        respsn: single - (stats.respsn || 0) * 0.4,
        resarc: single - (stats.resarc || 0) * 0.4,
        reslit: single - (stats.reslit || 0) * 0.4,
      };
    },
  },
  combinationstrike: {
    id: "combination-strike",
    name: "Combination Strike",
    params: [{min: 0, max: 4, val: 1, name: "Stacks"}],
    buffs: function(stats) {return {damage: 10 * this.params[0].val};},
    index: 13,
  },
  neardeathexperience: {
    id: "near-death-experience",
    name: "Near Death Experience",
    index: 14,
  },
  unity: {
    id: "unity",
    name: "Unity",
    index: 15,
    params: [{min: 0, max: 4, val: 1, name: "Stacks"}],
    buffs: function(stats) {return {damage: 5 * this.params[0].val};},
  },
  momentum: {
    id: "momentum",
    name: "Momentum",
    index: 16,
    active: true,
    buffs: {damage: 20},
  },
  mythicrhythm: {
    id: "mythic-rhythm",
    name: "Mythic Rhythm",
    index: 17,
    active: false,
    buffs: {dmgmul: {skills: ["lashingtailkick", "tempestrush", "waveoflight",
      "dashingstrike", "explodingpalm", "sweepingwind", "cyclonestrike", "sevensidedstrike"], percent: 40}},
  },
};
DiabloCalc.partybuffs.monk = {
  cripplingwave: {
    runelist: "e",
  },
  blindingflash: {
    runelist: "e",
    buffs: {e: {regen: 26821}},
  },
  innersanctuary: {
    runelist: "*",
  },
  explodingpalm: {
    runelist: "c",
  },

  mantraofsalvation: {
    runelist: "*",
    boxnames: ["Activated", "Inna's Mantra 2p"],
    buffs: function(rune, stats) {
      var base = 20 * (this.boxvals[1] ? 2 : 1);
      var res = {resist_percent: base + (this.boxvals[0] ? 20 : 0)};
      if (rune === "c") res.armor_percent = 20;
      if (rune === "d") res.extrams = 10;
      if (rune === "b") res.resist_percent += 20;
      if (rune === "a") res.dodge = 35;
      return res;
    },
  },
  mantraofretribution: {
    runelist: "b",
  },
  mantraofhealing: {
    runelist: "*",
    boxnames: ["Inna's Mantra 2p"],
    buffs: function(rune, stats) {
      var base = 10728.42 * (this.boxvals[0] ? 2 : 1);
      switch (rune) {
      case "x": return {regen: base};
      case "a": return {regen: base + 10728.42};
      case "d": return {regen: base, spiritregen: 3};
      case "b": return {regen: base};
      case "c": return {regen: base, life: 20};
      case "e": return {regen: base};
      }
    },
  },
  mantraofconviction: {
    runelist: "*",
    boxnames: ["Activated", "Inna's Mantra 2p"],
    buffs: function(rune, stats) {
      var base = 10 * (this.boxvals[1] ? 2 : 1);
      var res = {dmgtaken: base};
      if (rune === "a") res.dmgtaken += 6;
      if (this.boxvals[0]) res.dmgtaken += (rune === "a" ? 8 : 10);
      return res;
    },
  },

  unity: {
    buffs: {damage: 5},
  },
};
