Simulator.initClass["wizard"] = function() {
  var Sim = Simulator;

  var skills = {};
  Sim.skills = skills;

  function apply_effect(effect, duration) {
    return function() {
      Sim.addBuff(effect, null, duration);
    };
  }

  function channeling_ontick(data) {
    if (typeof data.func === "function") {
      data.func(data);
    } else {
      Sim.damage(data.func);
    }
    data.buff.params.tickrate = Math.floor(data.speed / Sim.stats.info.aps);
  }
  function channeling(name, speed, dmg, data) {
    var rate = Math.floor(speed / Sim.stats.info.aps);
    Sim.addBuff(name, undefined, {
      duration: rate + 1,
      tickrate: rate,
      tickinitial: 1,
      ontick: channeling_ontick,
      data: Sim.extend({func: dmg, speed: speed}, data),
    });
  }

  var mm_glacial_next = undefined;
  function mm_glacial_onhit(event) {
    if (!mm_glacial_next || event.time >= mm_glacial_next) {
      Sim.addBuff("frozen", null, 60);
      mm_glacial_next = event.time + 300;
    } else {
      Sim.addBuff("chilled", null, 36);
    }
  }
  function mm_conflag_refresh(event) {
    if (event.elem === "fir" && event.skill !== "magicmissile") {
      Sim.refreshBuff("conflagrate", 180);
    }
  }
  function mm_conflag_onhit(event) {
    Sim.addBuff("conflagrate", null, {
      maxstacks: 3,
      duration: 180,
      data: {targets: event.targets},
/*      onapply: function() {
        Sim.register("onhit", mm_conflag_refresh);
      },
      onexpire: function() {
        Sim.unregister("onhit", mm_conflag_refresh);
      },*/ // <- buff cannot be refreshed (bug?)
      ontick: function(data) {
        Sim.damage({coeff: 1.3 * data.stacks / 12, count: data.targets});
      },
      tickrate: 15,
    });
  }
  skills.magicmissile = {
    signature: true,
    speed: 57.599991,
    oncast: function(rune) {
      var count = 1 + (Sim.stats.leg_mirrorball || 0);
      switch (rune) {
      case "x": return {type: "line", coeff: 2.3, speed: 1.25, fan: 20, count: count};
      case "a": return {type: "line", coeff: 3.25, speed: 1.25, fan: 20, count: count};
      case "d": return {type: "line", coeff: 1.75, area: 4.5, onhit: mm_glacial_onhit, speed: 0.95, fan: 20, count: count};
      case "b": return {type: "line", coeff: 0.8, speed: 1.25, fan: 20, count: count + 2};
      case "e": return {type: "line", coeff: 2.85, speed: 1.25, count: count};
      case "c": return {type: "line", coeff: 0, pierce: true, onhit: mm_conflag_onhit, speed: 1.5, count: count};
      }
    },
    proctable: {x: 1, a: 1, d: 0.77, b: 0.333, e: 1, c: 0.5},
    elem: {x: "arc", a: "arc", d: "col", b: "arc", e: "arc", c: "fir"},
  };

  skills.shockpulse = {
    signature: true,
    speed: 57.142834,
    oncast: {
      x: {type: "line", coeff: 1.94, speed: 0.65, fan: 45, count: 3, range: 40},
      e: {type: "line", coeff: 1.94, speed: 0.65, fan: 45, count: 3, range: 40},
      a: {type: "line", coeff: 2.74, speed: 0.65, fan: 45, count: 3, range: 40},
      c: {type: "line", coeff: 2.14, speed: 0.65, radius: 6},
      d: {type: "line", coeff: 1.94, speed: 0.65, fan: 45, count: 3, range: 40, onhit: function(event) {
        Sim.addResource(event.targets * 2);
      }},
      b: {type: "ball", coeff: 0.33, speed: 0.25, radius: 12, range: 32, rate: 12},
    },
    proctable: {x: 0.931, e: 0.931, a: 0.931, c: 0.77, d: 0.931, b: 0.054},
    elem: {x: "lit", e: "col", a: "fir", c: "lit", d: "arc", b: "lit"},
  };

  skills.spectralblade = {
    signature: true,
    speed: 56.249996,
    oncast: function(rune) {
      switch (rune) {
      case "x": return {type: "cone", coeff: 0.56, count: 3, range: 15};
      case "a": return {type: "cone", coeff: 0.56, count: 3, range: 15, onhit: function(event) {
        Sim.addBuff("flameblades", {dmgfir: 1}, {maxstacks: 999, stacks: Math.ceil(event.targets / 3), duration: 600, refresh: false});
      }};
      case "d": return {type: "cone", coeff: 0.56, count: 3, range: 15, onhit: function(event) {
        Sim.addResource(event.targets * 2 / 3);
      }};
      case "b": return {type: "cone", coeff: 0.77, count: 3, range: 20};
      case "e": return {type: "cone", coeff: 0.56, count: 3, range: 15};
      case "c": return {type: "cone", coeff: 0.56, chc: (Sim.stats.frozen ? 5 : 0),
                        count: 3, range: 15, onhit: function(event) {
        if (Sim.stats.chilled && Sim.random("sb_iceblades", 0.05)) {
          Sim.addBuff("frozen", undefined, 60);
        }
        Sim.addBuff("chilled", undefined, 36);
      }};
      }
    },
    proctable: {x: 0.31, a: 0.31, d: 0.31, b: 0.295, e: 0.31, c: 0.31},
    elem: {x: "arc", a: "fir", d: "arc", b: "lit", e: "arc", c: "col"},
  };

  function ec_forked_onhit(event) {
    Sim.damage({type: "line", origin: 0, coeff: 0.44, cmod: -1,
      count: 0.01 * Sim.stats.final.chc * event.targets * 4});
  }
  function ec_surge_onhit(event) {
    Sim.addResource(event.targets);
  }

  skills.electrocute = {
    signature: true,
    channeling: true,
    speed: 30,
    oncast: function(rune) {
      var dmg;
      switch (rune) {
      case "x": dmg = {coeff: 0.69, targets: 3}; break;
      case "b": dmg = {coeff: 0.69, targets: 10}; break;
      case "e": dmg = {coeff: 0.69, targets: 3, onhit: ec_forked_onhit}; break;
      case "a": dmg = {type: "line", coeff: 1.4, speed: 1.5}; break;
      case "d": dmg = {coeff: 0.69, targets: 3, onhit: ec_surge_onhit}; break;
      case "c": dmg = {type: "cone", coeff: 1.55, range: 15}; break;
      }
      if (Sim.stats.leg_velvetcamaral && dmg.targets) {
        dmg.targets *= 2;
      }
      if (Sim.stats.leg_mykensballofhate && Sim.target.count > 1 && dmg.targets) {
        dmg.count = dmg.targets;
        delete dmg.targets;
      }
      channeling("electrocute", this.speed, dmg);
    },
    proctable: {x: 0.25, b: 0.083, e: 0.1667, a: 0.1667, d: 0.25, c: 0.1},
    elem: {x: "lit", b: "lit", e: "fir", a: "lit", d: "lit", c: "lit"},
  };

  function rof_numb_onhit(event) {
    if (Sim.random("rof_numb", 0.1)) {
      Sim.addBuff("frozen", undefined, 60);
    }
    Sim.addBuff("chilled", undefined, 180);
  }
  function rof_snowblast_onhit(event) {
    Sim.addBuff("snowblast", {dmgtaken: {elems: ["col"], percent: 15}}, 240);
    Sim.addBuff("chilled", undefined, 180);
  }
  function rof_ontick(data) {
    var bonus = Math.floor((Sim.time - data.buff.start) / 60);
    data.dmg.coeff = data.dmg.coeff_base + Math.min(bonus, 2) * data.dmg.coeff_delta;
    if (data.rune === "b") {
      data.dmg.range = 10 + Math.min(bonus, 3) * 4;
    }
    data.dmg.coeff *= Sim.stats.info.aps * data.buff.params.tickrate / 60;
    Sim.damage(data.dmg);
  }
  skills.rayoffrost = {
    channeling: true,
    speed: 30,
    cost: {x: 16, d: 11, c: 16, e: 16, b: 16, a: 16},
    oncast: function(rune) {
      var dmg;
      switch (rune) {
      case "x": dmg = {type: "line", coeff_base: 4.3, coeff_delta: 4.05, radius: 2, area: 5, onhit: apply_effect("chilled", 180)}; break;
      case "d": dmg = {type: "line", coeff_base: 4.3, coeff_delta: 4.05, radius: 2, area: 5, onhit: apply_effect("chilled", 180)}; break;
      case "c": dmg = {type: "line", coeff_base: 4.3, coeff_delta: 4.05, radius: 2, area: 5, onhit: rof_numb_onhit}; break;
      case "e": dmg = {type: "line", coeff_base: 4.3, coeff_delta: 4.05, radius: 2, area: 5, onhit: apply_effect("chilled", 180)}; break;
      case "b": dmg = {type: "area", self: true, coeff_base: 3, coeff_delta: 2.2, onhit: apply_effect("chilled", 180)}; break;
      case "a": dmg = {type: "line", coeff_base: 4.3, coeff_delta: 4.05, radius: 2, area: 5, onhit: rof_snowblast_onhit}; break;
      }
      if (Sim.stats.leg_lightofgrace) {
        dmg.pierce = true;
      }
      channeling("rayoffrost", this.speed, rof_ontick, {dmg: dmg, rune: rune});
    },
    proctable: {x: 0.333, d: 0.333, c: 0.333, e: 0.333, b: 0.1875, a: 0.333},
    elem: {x: "col", d: "col", c: "col", e: "col", b: "col", a: "col"},
  };

  function ao_scorch_ontick(event) {
    Sim.damage({type: "line", coeff: 0.1468, radius: 6, range: Math.min(50, event.time - event.buff.start), proc: 0.003});
  }
  skills.arcaneorb = {
    speed: 57.857109,
    cost: 30,
    oncast: function(rune) {
      switch (rune) {
      case "x": return {type: "line", coeff: 4.35, area: 15, speed: 0.5};
      case "a": return {type: "line", coeff: 7, area: 8, speed: 1.5};
      case "c": return {delay: 60, type: "area", self: true, range: 8, coeff: 2.65, count: 4};
      case "b": return {type: "line", coeff: 1.745, count: 2, range: 45, radius: 15, pierce: true, speed: 0.5, onhit: function(event) {
        Sim.buffNextCast({elem: "lit", percent: event.targets});
      }};
      case "d":
        Sim.addBuff("scorch", undefined, {duration: 300, tickrate: 6, ontick: ao_scorch_ontick});
        return {type: "line", coeff: 2.21, range: 50, radius: 6, pierce: true, speed: 1};
      case "e":
        Sim.damage({type: "area", origin: Sim.target.distance - 30, coeff: 3.93, range: 15, delay: 30 / 0.6});
        Sim.damage({type: "line", coeff: 2.62, pierce: true, range: 30, speed: 0.6, radius: 15});
        Sim.damage({type: "line", coeff: 1.28, pierce: true, range: 30, radius: 15, delay: 30 / 0.6 + 0.6, proc: 0.013});
      }
    },
    proctable: {x: 0.31, a: 0.655, c: 0.00925, b: 0.1, d: 0.067, e: 0.067},
    elem: {x: "arc", a: "arc", c: "arc", b: "lit", d: "fir", e: "col"},
  };

  function at_ontick(data) {
    var bonus = Math.floor((Sim.time - data.buff.start) / 60);
    data.dmg.coeff = data.dmg.coeff_base + Math.min(bonus, 2) * data.dmg.coeff_delta;
    Sim.damage(data.dmg);
  }
  function at_mines_explode(data) {
    Sim.damage({delay: 30, type: "area", range: 8, coeff: 8.25, onhit: apply_effect("slow", 180)});
  }
  function at_mines_ontick(data) {
    Sim.addBuff("arcanetorrent_mines", undefined, {
      maxstacks: 6,
      refresh: false,
      duration: 121,
      tickrate: 120,
      ontick: at_mines_explode,
    });
  }
  function at_static_onhit(event) {
    Sim.damage({type: "line", origin: 0, coeff: 1.5, cmod: -1,
      pierce: true, count: 2, speed: 0.5});
  }
  function at_cascade_onhit(event) {
    if (Sim.target.count > 1) {
      //TODO: if 1 target?
      Sim.damage({delay: 24, coeff: 5.82, count: event.targets * 0.125});
    }
  }
  skills.arcanetorrent = {
    channeling: true,
    speed: {x: 20, a: 20, e: 30, c: 40, d: 20, b: 20},
    cost: 16,
    oncast: function(rune) {
      var dmg;
      switch (rune) {
      case "x": dmg = {delay: 24, type: "area", coeff_base: 4, coeff_delta: 3.05, range: 6}; break;
      case "a": dmg = {delay: 24, type: "area", coeff_base: 4, coeff_delta: 3.05, range: 6}; break;
      case "e": dmg = {delay: 24, type: "area", self: true, spread: 7, inner: 35,
        coeff_base: 12.15, coeff_delta: 6.4, range: 6}; break;
      case "c":
        channeling("arcanetorrent", this.speed[rune], at_mines_ontick);
        return;
      case "d": dmg = {delay: 24, type: "area", coeff_base: 4, coeff_delta: 3.05, range: 6,
        onhit: et_static_onhit}; break;
      case "b": dmg = {delay: 24, type: "area", coeff_base: 4, coeff_delta: 3.05, range: 6,
        onhit: et_cascade_onhit}; break;
      }
      var factor = this.speed[rune] / 60;
      dmg.coeff_base *= factor;
      dmg.coeff_delta *= factor;
      channeling("arcanetorrent", this.speed, dmg);
    },
    proctable: {x: 0.2, a: 0.2, e: 0.6, c: 0.5, d: 0.2, b: 0.16},
    elem: {x: "arc", a: "fir", e: "arc", c: "arc", d: "lit", b: "arc"},
  };

  function dis_intensify_onhit(event) {
    Sim.addBuff("intensify", {dmgtaken: {elems: ["arc"], percent: 15}}, 240);
  }
  function dis_ontick(data) {
    var bonus = Math.floor((Sim.time - data.buff.start) / 60);
    data.dmg.coeff = data.dmg.coeff_base + Math.min(bonus, 2) * data.dmg.coeff_delta;
    data.dmg.coeff *= Sim.stats.info.aps * data.buff.params.tickrate / 60;
    Sim.damage(data.dmg);
    if (data.rune === "d") {
      Sim.damage({coeff: 1.15});
    }
  }
  skills.disintegrate = {
    channeling: true,
    speed: 20,
    cost: 18,
    oncast: function(rune) {
      var dmg;
      switch (rune) {
      case "x": dmg = {type: "line", pierce: true, coeff_base: 3.9, coeff_delta: 2.5, radius: 2}; break;
      case "b": dmg = {type: "line", pierce: true, coeff_base: 3.9, coeff_delta: 2.5, radius: 3.2}; break;
      case "e": dmg = {type: "line", pierce: true, coeff_base: 3.9, coeff_delta: 2.5, radius: 2}; break;
      case "c": dmg = {type: "cone", coeff_base: 4.35, coeff_delta: 3.4, range: 20}; break;
      case "d": dmg = {type: "line", pierce: true, coeff_base: 3.9, coeff_delta: 2.5, radius: 2}; break;
      case "a": dmg = {type: "line", pierce: true, coeff_base: 3.9, coeff_delta: 2.5, radius: 2,
        onhit: dis_intensify_onhit}; break;
      }
      channeling("disintegrate", this.speed, dis_ontick, {dmg: dmg, rune: rune});
    },
    proctable: {x: 0.1667, b: 0.111, e: 0.125, c: 0.1667, d: 0.111, a: 0.1667},
    elem: {x: "arc", d: "fir", c: "arc", e: "arc", b: "arc", a: "arc"},
  };

  function fn_mist_ontick(data) {
    Sim.damage({type: "area", coeff: 9.15 / 27, range: 19, self: true});
  }
  skills.frostnova = {
    secondary: true,
    speed: 57.142834,
    cooldown: {x: 11, b: 11, d: 7.5, c: 11, e: 11, a: 11},
    oncast: function(rune) {
      switch (rune) {
      case "x": return {type: "area", coeff: 0, range: 19, self: true, onhit: apply_effect("frozen", 120)};
      case "b": return {type: "area", coeff: 0, range: 19, self: true, onhit: apply_effect("frozen", 120)};
      case "d": return {type: "area", coeff: 0, range: 19, self: true, onhit: apply_effect("frozen", 180)};
      case "c":
        Sim.addBuff("frostnova", undefined, {
          status: "chilled",
          duration: 480,
          tickrate: 18,
          tickinitial: 1,
          ontick: fn_mist_ontick,
        });
        return;
      case "e": return {type: "area", coeff: 0, range: 19, self: true, onhit: function(event) {
        Sim.addBuff("frozen", undefined, {duration: 120});
        if (event.targets >= 5) {
          Sim.addBuff("frostnova", {chc: 10}, {duration: 660});
        }
      }};
      case "a": return {type: "area", coeff: 0, range: 19, self: true, onhit: function(event) {
        Sim.addBuff("frostnova", {dmgtaken: 33}, {duration: 120, status: "frozen"});
      }};
      }
    },
    proctable: {x: 0.1667, b: 0.1667, d: 0.1667, c: 0.05, e: 0.1667, a: 0.1667},
    elem: {x: "col", b: "col", d: "col", c: "col", e: "col", a: "col"},
  };

  function ds_shards_onexpire(data) {
    Sim.damage({type: "area", self: true, range: 15, coeff: 8.63});
  }
  skills.diamondskin = {
    secondary: true,
    speed: 56.249996,
    cooldown: 15,
    oncast: function(rune) {
      switch (rune) {
      case "x": Sim.addBuff("diamondskin", null, {duration: 180}); break;
      case "c": Sim.addBuff("diamondskin", null, {duration: 180}); break;
      case "d": Sim.addBuff("diamondskin", {rcrint: 9}, {duration: 180}); break;
      case "a": Sim.addBuff("diamondskin", {extrams: 30}, {duration: 180}); break;
      case "b": Sim.addBuff("diamondskin", null, {duration: 360}); break;
      case "e": Sim.addBuff("diamondskin", null, {duration: 180, onexpire: ds_shards_onexpire, onreapply: ds_shards_onexpire}); break;
      }
    },
    proctable: {e: 0.1},
    elem: {x: "arc", c: "arc", d: "arc", a: "arc", b: "arc", e: "arc"},
  };

  function st_dmo_ontick(data) {
    Sim.damage({type: "area", range: 21, coeff: 10});
  }
  skills.slowtime = {
    speed: 56.249996,
    cooldown: {x: 15, c: 12, d: 15, a: 15, b: 15, e: 15},
    oncast: function(rune) {
      var params = {duration: 900, status: "slowed"};
      if (Sim.stats.set_magnumopus_4pc) {
        params.tickrate = 30;
        params.ontick = st_dmo_ontick;
      }
      if (Sim.stats.leg_crownoftheprimus) {
        Sim.addBuff("slowtime", {dmgtaken: 15, ias: 10}, params);
      } else {
        switch (rune) {
        case "a": Sim.addBuff("slowtime", {dmgtaken: 15}, params); break;
        case "e": Sim.addBuff("slowtime", {ias: 10}, params); break;
        default: Sim.addBuff("slowtime", undefined, params); break;
        }
      }
    },
    elem: function(rune) {
      return (Sim.stats.set_magnumopus_4pc ? Sim.stats.info.maxelem : "arc");
    },
  };

  skills.teleport = {
    speed: 51.428570,
    cost: function(rune) {
      if (Sim.stats.leg_aetherwalker) return 25;
    },
    cooldown: function(rune) {
      return Sim.stats.leg_aetherwalker ? 0.5 : 11;
    },
    oncast: function(rune) {
      switch (rune) {
      case "c": Sim.addBuff("teleport", {dmgred: 25}, {duration: 300}); break;
      case "a": Sim.damage({type: "area", self: true, range: 20, coeff: 1.75, onhit: apply_effect("stunned", 60)}); break;
      }
    },
    elem: "arc",
    proctable: {a: 0.1667},
  };

  skills.waveofforce = {
    speed: 58.181816,
    cooldown: {a: 5},
    cost: 25,
    oncast: {
      x: {type: "area", self: true, range: 30, coeff: 3.9},
      a: {type: "area", self: true, range: 30, coeff: 3.9, onhit: apply_effect("slowed", 180)},
      e: {type: "area", self: true, range: 30, coeff: 3.9},
      d: {type: "area", self: true, range: 30, coeff: 3.9, onhit: function(event) {
        Sim.buffNextCast({elem: "arc", percent: event.targets * 4});
      }},
      b: {type: "area", self: true, range: 30, coeff: 3.9, onhit: function(event) {
        Sim.addResource(event.targets);
      }},
      c: {type: "area", self: true, range: 30, coeff: 4.75},
    },
    proctable: {x: 0.2, a: 0.25, e: 0.2, d: 0.2, b: 0.2, c: 0.2},
    elem: {x: "arc", a: "arc", e: "arc", d: "arc", b: "lit", c: "fir"},
  };

  function et_gale_onhit(event) {
    Sim.addBuff("galeforce", {dmgtaken: {elems: ["fir"], percent: 15}}, {duration: 240});
  }
  function et_ontick(data) {
    var dmg = {type: "area", coeff: data.base / 12, range: 8};
    if (data.rune === "a") {
      dmg.onhit = et_gale_onhit;
    }
    if (data.rune !== "e") {
      dmg.origin = (Sim.time - data.buff.start) * 0.25;
    }
    Sim.damage(dmg);
  }
  skills.energytwister = {
    speed: 57.599991,
    cost: {x: 35, d: 25, a: 35, b: 35, e: 35, c: 35},
    oncast: function(rune) {
      var base = 15.25;
      if (rune === "e") {
        base = 8.35;
      }
      var id = undefined;
      if (rune === "b") {
        if (Sim.getBuff("energytwister")) {
          Sim.removeBuff("energytwister");
          base = 32;
        } else {
          id = "energytwister";
        }
      }
      Sim.addBuff(id, undefined, {duration: 360, tickrate: 30, tickinitial: 1,
        ontick: et_ontick, data: {rune: rune, base: base}});
      if (rune === "c") {
        Sim.addBuff("stormchaser", undefined, {duration: 900, maxstacks: 3});
      }
    },
    oninit: function(rune) {
      if (rune === "c") {
        Sim.register("oncast", function(event) {
          if (Sim.skills[event.skill].signature) {
            var stacks = Sim.getBuff("stormchaser");
            if (stacks) {
              Sim.removeBuff("stormchaser");
              Sim.damage({type: "line", elem: "lit", coeff: 1.96 * stacks, speed: 0.25 + 0.05 * stacks, skill: "energytwister"});
            }
          }
        });
      }
    },
    elem: {x: "arc", d: "col", a: "fir", b: "arc", e: "arc", c: "lit"},
    proctable: {x: 0.15625, d: 0.15625, a: 0.15625, b: 0.15625, e: 0.03125, c: 0.15625},
  };

  function hydra_fpa(rune) {
    var base = {x: 76.300583, e: 76.300583, b: 76.300583, c: 76.300583, a: 86, d: 76.595741}[rune];
    return Math.ceil(Math.floor(base / Sim.stats.info.aps / (1 + 0.01 * (Sim.stats.leg_taskerandtheo || 0))) / 6) * 6;
  }
  function hydra_mammoth_ontick(data) {
    var range = Math.min(50, (Sim.time - data.stack.start) * 50 / 108);
    var origin = 30;
    if (Sim.params.hydra) {
      origin = Sim.params.hydra[0][1] || origin;
    }
    Sim.damage({type: "line", origin: origin, pierce: true, range: range, radius: 5, coeff: 0.99});
  }
  function hydra_ontick(data) {
    var origin = 30;
    if (Sim.params.hydra) {
      origin = Sim.params.hydra[0][1] || origin;
    }
    switch (data.rune) {
    case "x":
      Sim.damage({type: "line", origin: origin, speed: 0.45, range: 50, coeff: 1.65, count: 3});
      break;
    case "e":
      Sim.damage({type: "line", origin: origin, speed: 1, range: 50, coeff: 2.05, area: 7.5, count: 3});
      break;
    case "b":
      Sim.damage({coeff: 2.55, count: 3});
      break;
    case "c":
      Sim.damage({type: "line", origin: origin, speed: 1, range: 50, coeff: 1.55, area: 8, count: 3});
      break;
    case "a":
      Sim.damage({type: "cone", origin: origin, range: 35, coeff: 2.55, count: 3});
      //TODO: frost nova?
      break;
    case "d":
      data.buffid = Sim.addBuff(data.buffid, undefined, {
        duration: 288,
        refresh: false,
        maxstacks: 50,
        tickrate: 18,
        tickinitial: 1,
        ontick: hydra_mammoth_ontick,
      });
      break;
    }
    data.buff.params.tickrate = hydra_fpa(data.rune);
  }
  function hydra_onexpire(data) {
    if (data.buffid) {
      Sim.removeBuff(data.buffid);
    }
  }
  skills.hydra = {
    speed: 56.249996,
    cost: 15,
    pet: true,
    oncast: function(rune) {
      var speed = 
      Sim.addBuff("hydra", undefined, {
        maxstacks: (Sim.stats.leg_serpentssparker ? 2 : 1),
        refresh: false,
        duration: 900,
        tickrate: hydra_fpa(rune),
        ontick: hydra_ontick,
        onexpire: hydra_onexpire,
        data: {rune: rune},
      });
    },
    elem: {x: "fir", e: "arc", b: "lit", c: "fir", a: "col", d: "fir"},
  };

  function meteor_nilfurs_fix(data) {
    if (this.targets <= 3) {
      this.factor = 1 + 0.01 * Sim.stats.leg_nilfursboast;
    } else {
      this.factor = 2;
    }
  }
  function meteor_ontick(data) {
    var dmg = {type: "area", proc: data.proc};
    dmg.range = (data.rune === "a" ? 18 : 12);
    dmg.coeff = (data.rune === "a" ? 6.25/3 : (data.rune === "b" ? 0.7 / 2 : 2.35 / 3));
    if (data.rune === "b") {
      dmg.count = 7;
      dmg.spread = 25;
    }
    if (Sim.stats.leg_nilfursboast) dmg.fix = meteor_nilfurs_fix;
    Sim.damage(dmg);
  }
  function meteor_onhit(data) {
    var rune = data.castInfo.rune;
    Sim.addBuff(undefined, undefined, {
      duration: (rune === "b" ? 120 : 180),
      tickrate: 60,
      tickinitial: 1,
      ontick: meteor_ontick,
      data: {rune: rune, proc: data.proc},
    });
    if (rune === "c") {
      if (Sim.stats.chilled) Sim.addBuff("frozen", undefined, 60);
      Sim.addBuff("chilled", undefined, 180);
    }
  }
  skills.meteor = {
    speed: 57.142834,
    cost: function(rune) {
      return 40 * (1 - 0.01 * (Sim.stats.leg_thegrandvizier || 0));
    },
    cooldown: {a: 15},
    oncast: function(rune) {
      var dmg;
      switch (rune) {
      case "x": dmg = {delay: 75, type: "area", range: 12, coeff: 7.4}; break;
      case "e": dmg = {type: "area", range: 12, coeff: 7.4}; break;
      case "d":
        dmg = {delay: 75, type: "area", range: 12, coeff: 7.4 + 0.2 * Sim.resources.ap};
        if (!Sim.castInfo().triggered) {
          Sim.resources.ap = 0;
        }
        break;
      case "c": dmg = {delay: 75, type: "area", range: 12, coeff: 7.4}; break;
      case "b": dmg = {delay: 75, type: "area", range: 12, coeff: 2.77, count: 7, spread: 25}; break;
      case "a": dmg = {delay: 75, type: "area", range: 18, coeff: 16.48}; break;
      }
      dmg.onhit = meteor_onhit;
      if (Sim.stats.leg_nilfursboast) {
        dmg.fix = meteor_nilfurs_fix;
      }
      return dmg;
    },
    elem: {x: "fir", e: "lit", d: "arc", c: "col", b: "fir", a: "fir"},
    proctable: {x: 0.0625, e: 0.04167, d: 0.0625, c: 0.0625, b: 0.025, a: 0.109375},
  };

  function blizzard_ls_onhit(data) {
    Sim.addBuff("lightningstorm", {dmgtaken: {elems: ["lit"], percent: 15}}, {duration: 16});
  }
  function blizzard_ontick(data) {
    var dmg = {type: "area", range: (data.rune === "b" ? 30 : 12), coeff: (data.rune === "a" ? 18.10 / 32 : 10.75 / 24)};
    if (data.rune === "c") {
      dmg.onhit = blizzard_ls_onhit;
    }
    Sim.damage(dmg);
  }
  skills.blizzard = {
    speed: 57.692265,
    cost: {x: 40, c: 40, e: 40, d: 10, b: 40, a: 40},
    oncast: function(rune) {
      var data = {duration: (rune === "a" ? 480 : 360), tickrate: 15, tickinitial: 1, ontick: blizzard_ontick, rune: rune};
      Sim.addBuff("blizzard", undefined, data);
      if (rune === "e") {
        Sim.addBuff("frozen", undefined, 150);
      }
    },
    elem: {x: "col", c: "lit", e: "col", d: "col", b: "fir", a: "col"},
    proctable: {x: 0.0125, c: 0.0125, e: 0.0125, d: 0.0125, b: 0.0125, a: 0.0125},
  };

  function ia_storm_ontick(data) {
    Sim.damage({type: "area", self: true, range: 15, coeff: 0.4});
  }
  skills.icearmor = {
    speed: 56.249996,
    cost: 25,
    oncast: function(rune) {
      var params = {};
      switch (rune) {
      case "b":
        params.status = "chilled";
        break;
      case "c":
        params.tickrate = 30;
        params.ontick = ia_storm_ontick;
        break;
      }
      Sim.addBuff("icearmor", {meleedef: (Sim.stats.leg_haloofarlyse || 12)}, params);
    },
    oninit: function(rune) {
      this.oncast(rune);
    },
    elem: "col",
    proctable: {c: 0.125},
  };

  function sa_ontick(data) {
    Sim.damage({coeff: (data.rune === "a" ? 3.15 : 1.75)});
  }
  function sa_shocking_onhit(data) {
    Sim.damage({coeff: 4.25, count: data.targets * data.proc * 0.01 * Sim.stats.final.chc, proc: 0});
  }
  skills.stormarmor = {
    speed: 56.249996,
    cost: 25,
    oncast: function(rune) {
      var params = {tickrate: this.rate, ontick: sa_ontick, rune: rune};
      switch (rune) {
      case "b": params.status = "chilled"; break;
      case "c":
        params.tickrate = 30;
        params.ontick = ia_storm_ontick;
        break;
      case "e":
        params.onapply = function() {Sim.register("onhit_proc", sa_shocking_onhit);};
        params.onexpire = function() {Sim.unregister("onhit_proc", sa_shocking_onhit);};
        break;
      }
      Sim.addBuff("stormarmor", rune === "d" ? {rcrint: 3} : undefined, params);
    },
    oninit: function(rune) {
      var chance = 0.06;
      var sum = 0;
      var product = 1;
      do {
        sum += product;
        product *= 1 - chance;
        chance += 0.06;
      } while (chance < 1);
      this.rate = sum * 12;
      this.oncast(rune);
    },
    elem: "lit",
    proctable: {x: 0.1, c: 0.1, d: 0.1, a: 0.1, b: 0.1, e: 0.1},
  };

  function mw_electrify_onhit(data) {
    Sim.damage({targets: 3, count: data.count * data.proc, coeff: 0.61});
  }
  function mw_conduit_onhit(data) {
    if (data.castInfo && data.castInfo.user && !data.castInfo.triggered) {
      var user = data.castInfo.user;
      user.conduit = (user.conduit || 0);
      if (data.targets > user.conduit) {
        Sim.addResource((data.targets - user.conduit) * 3);
        user.conduit = data.targets;
      }
    }
  }
  function mw_ignite_onhit(data) {
    Sim.damage({skill: "magicweapon", elem: "fir", count: data.count * data.proc, coeff: 3});
  }
  skills.magicweapon = {
    speed: 56.249996,
    cost: 25,
    oncast: function(rune) {
      var params;
      switch (rune) {
      case "b":
        params = {
          onapply: function() {Sim.register("onhit_proc", mw_electrify_onhit);},
          onexpire: function() {Sim.unregister("onhit_proc", mw_electrify_onhit);}
        };
        break;
      case "d":
        params = {
          onapply: function() {Sim.register("onhit_proc", mw_conduit_onhit);},
          onexpire: function() {Sim.unregister("onhit_proc", mw_conduit_onhit);}
        };
        break;
      case "a":
        params = {
          onapply: function() {Sim.register("onhit_proc", mw_ignite_onhit);},
          onexpire: function() {Sim.unregister("onhit_proc", mw_ignite_onhit);}
        };
        break;
      }
      Sim.addBuff("magicweapon", {damage: (rune === "c" ? 20 : 10)}, params);
    },
    oninit: function(rune) {
      this.oncast(rune);
    },
    elem: {x: "arc", b: "lit", c: "arc", d: "arc", a: "fir", e: "arc"},
  };

  function familiar_icicle_onhit(data) {
    if (Sim.random("familiar", 0.35)) {
      Sim.addBuff("frozen", undefined, 60);
    }
  }
  function familiar_oncast(event) {
    var data = event.data;
    if (data.last === undefined || data.last + data.icd <= event.time) {
      var dmg = {type: "line", speed: 1, coeff: 2.4};
      if (data.rune === "c") dmg.onhit = familiar_icicle_onhit;
      if (data.rune === "b") dmg.area = 6;
      Sim.damage(dmg);
      data.last = event.time;
    }
  }
  skills.familiar = {
    speed: 56.249996,
    cost: 20,
    oncast: function(rune) {
      var buffs = undefined;
      if (rune === "a") buffs = {damage: 10};
      if (rune === "d") buffs = {apregen: 4.5};
      Sim.addBuff("familiar", buffs, {
        data: {rune: rune},
        onapply: function(data) {
          Sim.register("oncast", familiar_oncast, data);
          data.icd = 54 / Sim.stats.info.aps;
        },
        onrefresh: function(data) {
          data.icd = 54 / Sim.stats.info.aps;
        },
        onexpire: function(data) {
          Sim.unregister("oncast", familiar_oncast);
        },
      });
    },
    oninit: function(rune) {
      this.oncast(rune);
    },
    elem: {x: "arc", a: "fir", c: "col", e: "arc", d: "arc", b: "arc"},
  };

  skills.energyarmor = {
    speed: 56.249996,
    cost: 20,
    oncast: function(rune) {
      var buffs = {armor_percent: 35, maxap: -20};
      switch (rune) {
      case "e": buffs.chc = 5; break;
      case "b": buffs.maxap = 20; break;
      case "a": buffs.resist_percent = 25; break;
      }
      Sim.addBuff("energyarmor", buffs);
    },
    oninit: function(rune) {
      this.oncast(rune);
    },
    elem: "arc",
  };

  skills.explosiveblast = {
    secondary: true,
    speed: 56.249996,
    cost: 20,
    cooldown: {x: 6, d: 6, c: 3, a: 6, b: 6, e: 6},
    oncast: function(rune) {
      var dmg = {delay: 90, type: "area", range: 12, coeff: 9.45};
      switch (rune) {
      case "d": dmg.coeff = 14.85; break;
      case "a": dmg.delay = 6; dmg.coeff = 9.09; break;
      case "b": dmg.range = 18; dmg.coeff = 9.9; break;
      case "e":
        var delay = Math.floor(60 / Sim.stats.info.aps);
        Sim.damage(Sim.extend({}, dmg, {delay: 90 + delay}));
        Sim.damage(Sim.extend({}, dmg, {delay: 90 + 2 * delay}));
      }
      Sim.damage(dmg);
    },
    elem: {x: "arc", d: "arc", c: "lit", a: "fir", b: "col", e: "fir"},
    proctable: {x: 0.04, d: 0.04, c: 0.04, a: 0.04, b: 0.025, e: 0.04 / 3},
  };

  skills.mirrorimage = {
    speed: 57.692265,
    cooldown: 15,
    oncast: function(rune) {
    },
    elem: "arc",
  };

  skills.archon = {
    speed: 57.391354,
    cooldown: function(rune) {
      return (rune === "d" || Sim.stats.set_vyr_4pc ? 100 : 120);
    },
    oncast: function(rune) {
      if (rune === "e" || Sim.stats.set_vyr_4pc) {
        Sim.damage({delay: 1, type: "area", range: 15, coeff: 36.8, elem: this.default_elem[rune]});
      }
      Sim.addBuff("archon", {archon: 1, damage: 20, armor_percent: 20, resist_percent: 20}, {
        duration: 20,
      });
    },
    default_elem: {x: "arc", e: "fir", c: "arc", d: "lit", b: "col", a: "arc"},
    elem: function(rune) {
      if (Sim.stats.set_vyr_4pc) return Sim.stats.info.maxelem;
      return this.default_elem[rune];
    },
  };

  skills.archon_arcanestrike = {
    speed: 57.599954,
    requires: ["archon"],
    oncast: function(rune) {
      var improved = (Sim.stats.skills.archon === "a" || Sim.stats.set_vyr_4pc);
      return {type: "area", range: 9, coeff: 7.9, dibs: (improved ? 22 : 0)};
    },
    elem: function(rune) {
      return skills.archon.elem(Sim.stats.skills.archon);
    },
    proctable: 0.5,
  };
  skills.archon_arcaneblast = {
    speed: 100,
    secondary: true,
    cooldown: 2,
    requires: ["archon"],
    oncast: function(rune) {
      var improved = (Sim.stats.skills.archon === "a" || Sim.stats.set_vyr_4pc);
      return {type: "area", range: 15, coeff: 6.04, dibs: (improved ? 22 : 0)};
    },
    elem: function(rune) {
      return skills.archon.elem(Sim.stats.skills.archon);
    },
  };
  function archon_wave_ontick(data) {
    data.dmg.factor = Sim.stats.info.aps * data.buff.params.tickrate / 60;
    Sim.damage(data.dmg);
  }
  skills.archon_disintegrationwave = {
    speed: 20,
    requires: ["archon"],
    oncast: function(rune) {
      var improved = (Sim.stats.skills.archon === "a" || Sim.stats.set_vyr_4pc);
      var dmg = {type: "line", pierce: true, coeff: 7.79, dibs: (improved ? 22 : 0), radius: 2};
      channeling("archon_disintegrationwave", this.speed, archon_wave_ontick, {dmg: dmg});
    },
    elem: function(rune) {
      return skills.archon.elem(Sim.stats.skills.archon);
    },
  };

  function bh_zero_onhit(data) {
    Sim.addBuff("blackhole", {damage: {elems: ["col"], percent: 3 * data.targets}}, {duration: 600});
  }
  function bh_spellsteal_onhit(data) {
    Sim.addBuff("blackhole", {damage: 3 * data.targets}, {duration: 300});
  }
  function bh_ontick(data) {
    var dmg = {type: "area", range: 15, coeff: 7 / 15};
    switch (data.rune) {
    case "a":
      dmg.range = 20;
      dmg.coeff = 12.9 / 15;
      break;
    case "e":
      if (!data.buffed) {
        dmg.onhit = bh_zero_onhit;
        data.buffed = true;
      }
      break;
    case "d":
      if (!data.buffed) {
        dmg.onhit = bh_spellsteal_onhit;
        data.buffed = true;
      }
      break;
    }
    Sim.damage(dmg);
  }
  function bh_blazar_onexpire(data) {
    Sim.damage({type: "area", range: 15, coeff: 7.25, proc: 0});
  }
  skills.blackhole = {
    speed: 56.842068,
    cost: 20,
    cooldown: 12,
    oncast: function(rune) {
      var params = {duration: 120, tickrate: 8, tickinitial: 1, ontick: bh_ontick, data: {rune: rune}};
      if (rune === "c") {
        params.onexpire = bh_blazar_onexpire;
      }
      Sim.addBuff(undefined, undefined, params);
    },
    elem: {x: "arc", a: "lit", e: "col", b: "arc", c: "fir", d: "arc"},
    proctable: {x: 0.026672, a: 0.0213376, e: 0.026672, b: 0.026672, c: 0.026672, d: 0.026672},
  };

  Sim.passives = {
    powerhungry: function() {
    },
    blur: function() {
      Sim.addBuff("blur", {dmgred: 17});
    },
    evocation: function() {
      Sim.addBuff("evocation", {cdr: 20});
    },
    glasscannon: function() {
      Sim.addBuff("glasscannon", {damage: 15, armor_percent: -10, resist_percent: -10});
    },
    prodigy: function() {
      Sim.register("oncast", function(data) {
        if (skills[data.skill] && skills[data.skill].signature) {
          if (data.skill !== "electrocute" || Sim.random("prodigy", 0.5)) {
            Sim.addResource(5);
          }
        }
      });
    },
    astralpresence: function() {
      Sim.addBuff("astralpresence", {maxap: 20, apregen: 2.5});
    },
    illusionist: function() {
    },
    coldblooded: function() {
      Sim.register("statschanged", function(data) {
        if (data.stats.chilled || data.stats.frozen) {
          data.stats.add("dmgtaken", 10);
        }
      });
    },
    conflagration: function() {
      Sim.register("onhit", function(data) {
        if (data.elem === "fir") {
          Sim.addBuff("conflagration", {chctaken: 6}, {duration: 180});
        }
      });
    },
    paralysis: function() {
      Sim.register("onhit_proc", function(data) {
        if (data.elem === "lit" && Sim.random("paralysis", data.targets * data.proc * 0.15)) {
          Sim.addBuff("stunned", undefined, 90);
        }
      });
    },
    galvanizingward: function() {
    },
    temporalflux: function() {
      Sim.register("onhit", function(data) {
        if (data.elem === "arc") {
          Sim.addBuff("slowed", undefined, 120);
        }
      });
    },
    dominance: function() {
    },
    arcanedynamo: function() {
      var bufflist = ["rayoffrost", "arcaneorb", "arcanetorrent", "disintegrate", "hydra",
                      "waveofforce", "energytwister", "meteor", "blizzard", "explosiveblast"];
      Sim.register("oncast", function(data) {
        if (skills[data.skill] && skills[data.skill].signature) {
          Sim.addBuff("arcanedynamo", undefined, {maxstacks: 5});
        } else if (bufflist.indexOf(data.skill) >= 0) {
          if (Sim.getBuff("arcanedynamo") >= 5) {
            Sim.removeBuff("arcanedynamo");
            var result = {percent: 60};
            if (data.skill === "meteor" && data.rune === "d") {
              result.percent = 156;
            }
            return result;
          }
        }
      });
    },
    unstableanomaly: function() {
    },
    unwaveringwill: function() {
      Sim.addBuff("unwaveringwill", {armor_percent: 20, resist_percent: 20, damage: 10});
    },
    audacity: function() {
      if (Sim.target.distance - Sim.target.size < 15) {
        Sim.addBuff("audacity", {dmgmul: {pet: false, percent: 15}});
      }
    },
    elementalexposure: function() {
      var stacks = {"fir": "ee_fire", "col": "ee_cold", "arc": "ee_arcane", "lit": "ee_lightning"};
      function trigger(elem) {
        var name = stacks[elem];
        if (!name) return;
        Sim.addBuff(name, {dmgtaken: 5}, {duration: 300});
      }
      Sim.register("onhit", function(data) {
        if (data.elem) trigger(data.elem);
        if (Sim.stats.info.mhelement) trigger(Sim.stats.info.mhelement);
      });
      Sim.metaBuff("elementalexposure", ["ee_fire", "ee_cold", "ee_arcane", "ee_lightning"]);
    },
  };

};
