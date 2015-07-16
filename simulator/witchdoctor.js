(function() {
  var Sim = Simulator;

  var skills = {};
  Sim.skills = skills;

  function pd_onhit(data) {
    var params = {
      duration: 121,
      tickrate: 30,
      ontick: {coeff: 0.1},
    };
    switch (data.castInfo.rune) {
    case "d": Sim.addResource(50); break;
    case "e": if (Sim.random("poisondart", 0.35)) Sim.addBuff("stunned", 90); break;
    case "c": params.status = "chilled"; break;
    }
    Sim.addBuff(undefined, undefined, params);
  }
  function pd_fd_onhit(data) {
    Sim.addBuff(undefined, undefined, {
      duration: 240,
      tickrate: 30,
      tickinitial: 1,
      ontick: {coeff: 5.65 / 8},
    });
  }
  skills.poisondart = {
    signature: true,
    offensive: true,
    speed: 58,
    oncast: function(rune) {
      var pierce = !!Sim.stats.leg_thedaggerofdarts;
      switch (rune) {
      case "x": return {pierce: pierce, type: "line", speed: 1.5, coeff: 1.85, onhit: pd_onhit};
      case "b": return {pierce: pierce, type: "line", speed: 1.5, coeff: 1.1, count: 3};
      case "c": return {pierce: pierce, type: "line", speed: 1.5, coeff: 1.85, onhit: pd_onhit};
      case "d": return {pierce: pierce, type: "line", speed: 1.5, coeff: 1.85, onhit: pd_onhit};
      case "a": return {pierce: pierce, type: "line", speed: 1.5, coeff: 0, onhit: pd_fd_onhit};
      case "e": return {pierce: pierce, type: "line", speed: 1.5, coeff: 1.85, onhit: pd_onhit};
      }
    },
    proctable: {x: 1, b: 0.333, c: 1, d: 1, a: 1, e: 1},
    elem: {x: "psn", b: "psn", c: "col", d: "phy", a: "fir", e: "psn"},
  };

  function cs_wm_onhit(data) {
    Sim.addResource(3 * data.targets);
    if (Sim.stats.leg_thespiderqueensgrasp) {
      Sim.addBuff("slowed", undefined, 180);
    }
  }
  skills.corpsespiders = {
    signature: true,
    offensive: true,
    speed: 58,
    oncast: function(rune) {
      var params = {duration: 240, tickrate: 60, tickinitial: 70, ontick: {count: 4, coeff: 0.48}};
      switch (rune) {
      case "c": params.ontick.coeff *= 1.12; break;
      case "b":
        Sim.addBuff("spiderqueen", undefined, {
          duration: 901,
          tickrate: 15,
          ontick: {type: "area", range: 10, coeff: 1.75 / 4},
        });
        return;
      case "d": params.ontick.onhit = cs_wm_onhit; break;
      case "e": params.ontick.onhit = Sim.apply_effect("slowed", 90); break;
      case "a": params.ontick.coeff *= 1.215; break;
      }
      if (Sim.stats.leg_thespiderqueensgrasp && rune !== "d") {
        params.ontick.onhit = Sim.apply_effect("slowed", 180);
      }
      Sim.addBuff(undefined, undefined, params);
    },
    proctable: {x: 0.11, c: 0.11, b: 0.15, d: 0.11, e: 0.11, a: 0.11},
    elem: {x: "phy", c: "psn", b: "psn", d: "phy", e: "col", a: "fir"},
  };

  function pot_ta_onhit(data) {
    Sim.addResource(9 * data.targets);
  }
  skills.plagueoftoads = {
    signature: true,
    offensive: true,
    speed: {x: 57.5, a: 57.5, c: 57.5, b: 55.384609 / 1.4, e: 57.5, d: 57.5},
    oncast: function(rune) {
      var fan = (Sim.stats.leg_rhenhoflayer ? undefined : 40);
      var pierce = (Sim.stats.leg_rhenhoflayer ? 1 : undefined);
      switch (rune) {
      case "x": return {pierce: pierce, fan: fan, type: "line", speed: 0.65, count: 3, coeff: 1.9};
      case "a": return {pierce: pierce, fan: fan, type: "line", speed: 0.65, count: 3, coeff: 2.45};
      case "c": return {pierce: true, fan: fan, type: "line", speed: 0.65, count: 3, coeff: 1.3};
      case "b":
        Sim.addBuff(undefined, undefined, {
          duration: 120,
          tickrate: 30,
          tickinitial: 1,
          ontick: {type: "area", range: 8, coeff: 1.3 / 4},
        });
        break;
      case "e": return {pierce: pierce, fan: fan, type: "line", speed: 0.65, count: 3, coeff: 1.9, onhit: Sim.apply_effect("charmed", 240, 0.15)};
      case "d": return {pierce: pierce, fan: fan, type: "line", speed: 0.65, count: 3, coeff: 1.9, onhit: pot_ta_onhit};
      }
    },
    proctable: {x: 0.667, a: 0.667, c: 0.5, b: 0.1667, e: 0.667, d: 0.667},
    elem: {x: "psn", a: "fir", c: "psn", b: "psn", e: "psn", d: "psn"},
  };

  function firebomb_pit_onhit(data) {
    Sim.addBuff(undefined, undefined, {
      duration: 181,
      tickrate: 30,
      ontick: {type: "area", range: 8, coeff: 0.1, proc: 0.067},
    });
  }
  skills.firebomb = {
    signature: true,
    offensive: true,
    speed: 58,
    oncast: function(rune) {
      switch (rune) {
      case "x": return {delay: Math.floor(Sim.target.distance), type: "area", range: 8, coeff: 1.55};
      case "e":
        var targets = Math.min(7, Sim.target.count);
        var dmg = (1 - Math.pow(0.85, targets)) / 0.15;
        return {delay: Math.floor(Sim.target.distance), targets: targets, coeff: 1.55 * dmg / targets};
      case "b":
        Sim.damage({delay: Math.floor(Sim.target.distance + 14), type: "area", origin: -14, range: 8, coeff: 1.55});
        Sim.damage({delay: Math.floor(Sim.target.distance + 28), type: "area", origin: -28, range: 8, coeff: 1.55});
        return {delay: Math.floor(Sim.target.distance), type: "area", range: 8, coeff: 1.55};
      case "c": return {delay: Math.floor(Sim.target.distance), type: "area", range: 8, coeff: 1.55, onhit: firebomb_pit_onhit};
      case "d":
        Sim.addBuff("pyrogeist", undefined, {
          maxstacks: 3,
          duration: 361,
          tickrate: 18,
          ontick: {coeff: 0.44},
        });
        return;
      case "a":
        Sim.damage({delay: Math.floor(Sim.target.distance), type: "area", range: 28, coeff: 0.3});
        return {delay: Math.floor(Sim.target.distance), type: "area", range: 8, coeff: 1.55};
      }
    },
    proctable: {x: 0.667, e: 0.2, b: 0.222, c: 0.067, d: 0.1, a: 0.1667},
    elem: "fir",
  };

  skills.graspofthedead = {
    offensive: true,
    speed: 57.142853,
    cost: 150,
    cooldown: {x: 8, c: 8, a: 8, e: 8, d: 6, b: 8},
    oncast: function(rune) {
      if (rune === "b" || Sim.stats.leg_deadlyrebirth) {
        Sim.addBuff(undefined, undefined, {
          duration: 481,
          tickrate: 120,
          ontick: {type: "area", range: 8, radius: 45, coeff: 1.05},
        });
      }
      Sim.addBuff("graspofthedead", undefined, {
        status: "slowed",
        duration: 480,
        tickrate: 30,
        tickinitial: 1,
        ontick: {type: "area", range: 14, coeff: (rune === "a" ? 0.55 : 0.35)},
      });
    },
    proctable: {x: 0.07, c: 0.07, a: 0.07, e: 0.07, d: 0.07, b: 0.07},
    elem: {x: "phy", c: "col", a: "phy", e: "psn", d: "psn", b: "phy"},
  };

  skills.firebats = {
    offensive: true,
    channeling: {x: 30, a: 60, d: 30, c: 30, b: 30, e: 30},
    speed: 87.804871,
    initialcost: {x: 150, a: 150, d: 225, c: 150, b: 150, e: 150},
    cost: {x: 75, a: 75, c: 75, b: 75, e: 75},
    oncast: function(rune) {
      var dmg = {type: "cone", width: 40, range: 28, coeff: 4.25 / 2};
      switch (rune) {
      case "a": dmg.coeff = 4.95; break;
      case "c":
        dmg = function(data) {
          var coeff = 4.25 * (1 + 0.1 * Math.min(5, data.buff.ticks)) / 5;
          var rate = Math.floor(60 / Sim.stats.info.aps);
          Sim.addBuff(undefined, undefined, {
            duration: rate * 5 + 1,
            tickrate: rate,
            ontick: {type: "cone", width: 40, range: 28, coeff: coeff},
          });
        };
        break;
      case "b": dmg = {coeff: 6.35}; break;
      case "e":
        dmg = function(data) {
          var coeff = 4.25 * (1 + 0.2 * Math.min(5, data.buff.ticks)) / 2;
          Sim.damage({type: "area", range: 8, self: true, coeff: coeff});
        };
        break;
      }
      Sim.channeling("firebats", this.channeling[rune], dmg);
    },
    proctable: {x: 0.1667, a: 0.333, d: 0.2, c: 0.2, b: 0.5, e: 0.25},
    elem: {x: "fir", a: "fir", d: "fir", c: "psn", b: "fir", e: "fir"},
  };

  function haunt_ontick(data) {
    Sim.damage({coeff: data.coeff});
    if (data.leech) {
      Sim.addResource(data.leech);
    }
  }
  function jade2_onrefresh(data) {
    Sim.damage({coeff: data.coeff * 50});
  }
  function haunt_onhit(data) {
    var params = {
      maxstacks: Math.min(5, Sim.target.count),
      refresh: false,
      duration: 720,
      tickrate: 12,
      tickkeep: true,
      tickinitial: 1,
      data: {coeff: 40 / 60},
      ontick: haunt_ontick,
    };
    if (Sim.stats.passives.creepingdeath) {
      params.duration = 18000;
    }
    if (Sim.stats.leg_quetzalcoatl) {
      params.duration /= 2;
      params.data.coeff *= 2;
    }
    if (Sim.stats.set_jadeharvester_2pc) {
      params.onrefresh = jade2_onrefresh;
    }
    if (data.castInfo.rune === "d") {
      params.data.leech = 2.5;
    }
    for (var i = 0; i < data.targets; ++i) {
      Sim.addBuff("haunt", data.castInfo.rune === "c" && {dmgtaken: 20}, params);
    }
  }
  skills.haunt = {
    offensive: true,
    speed: 57.499966,
    cost: 50,
    oncast: function(rune) {
      var count = 1;
      if (rune === "e") ++count;
      if (Sim.stats.leg_hauntinggirdle) ++count;
      Sim.damage({delay: Math.floor(Sim.target.distance / 2), count: count, coeff: 0, onhit: haunt_onhit});
    },
    proctable: 1,
    elem: {x: "col", a: "fir", e: "col", b: "col", c: "psn", d: "col"},
  };

  function swarm_ontick(data) {
    Sim.damage({coeff: data.coeff});
    if (data.leech) {
      Sim.addResource(data.leech);
    }
  }
  function swarm_onhit(data) {
    var params = {
      maxstacks: Sim.target.count,
      stacks: data.targets,
      refresh: false,
      duration: 480,
      tickrate: 12,
      tickinitial: 1,
      tickkeep: true,
      data: {coeff: 1.3 / 5},
      ontick: swarm_ontick,
    };
    if (data.castInfo.rune === "d" && !data.castInfo.user.spread) {
      params.data.leech = 5;
    }
    if (data.castInfo.rune === "a") {
      params.data.coeff = 1.85 / 5;
    }
    if (Sim.stats.passives.creepingdeath) {
      params.duration = 18000;
    } else if (data.castInfo.rune === "c") {
      params.duration = 960;
    }
    if (Sim.stats.leg_quetzalcoatl) {
      params.duration /= 2;
      params.data.coeff *= 2;
    }
    if (Sim.stats.leg_hwojwrap) {
      params.status = "slowed";
    }
    Sim.addBuff("locustswarm", undefined, params);
    Sim.after(45, function() {
      data.castInfo.user.spread = true;
      var spread = data.targets;
      if (data.castInfo.rune === "b") {
        spread *= 2;
      }
      spread = Math.min(Sim.target.count - Sim.getBuff("locustswarm"), spread);
      if (spread) {
        Sim.damage({coeff: 0, targets: spread, onhit: swarm_onhit, proc: data.proc});
      }
    });
  }
  skills.locustswarm = {
    offensive: true,
    speed: 56,
    cost: 300,
    oncast: function(rune) {
      Sim.damage({coeff: 0, onhit: swarm_onhit});
    },
    proctable: 0.333,
    elem: {x: "col", a: "fir", e: "col", b: "col", c: "psn", d: "col"},
  };

  function dogs_rabid_onhit(data) {
    Sim.addBuff(undefined, undefined, {
      duration: 181,
      tickrate: 60,
      ontick: {pet: true, coeff: 0.1 * Sim.stats.info.aps, count: data.targets},
    });
  }
  function dogs_chilled_onhit(data) {
    Sim.addBuff("chilledtothebone", {dmgtaken: 15}, {duration: 180, status: "chilled"});
  }
  function dogs_ontick(data) {
    Sim.damage({pet: true, distance: 5, coeff: Sim.stats.info.aps * data.coeff, onhit: data.onhit});
  }
  skills.summonzombiedogs = {
    offensive: true,
    pet: true,
    speed: 56.249996,
    cooldown: function(rune) {
      return 45 * (Sim.stats.passives.tribalrites ? 0.75 : 1);
    },
    oncast: function(rune) {
      var params = {
        maxstacks: 3,
        tickrate: [52, 58],
        refresh: false,
        data: {coeff: 0.3},
        ontick: dogs_ontick,
      };
      if (Sim.stats.passives.zombiehandler) params.maxstacks += 1;
      if (Sim.stats.passives.fierceloyalty) params.maxstacks += 1;
      if (Sim.stats.passives.midnightfeast) params.maxstacks += 1;
      if (Sim.stats.leg_thetallmansfinger) {
        params.data.coeff *= 1 + 4 * params.maxstacks;
        params.maxstacks = 1;
      }
      switch (rune) {
      case "c": params.data.onhit = dogs_rabid_onhit; break;
      case "d": params.data.onhit = dogs_chilled_onhit; break;
      }
      if (Sim.castInfo().triggered) {
        if (Sim.getBuff("zombiedogs") >= params.maxstacks) return;
      } else {
        params.stacks = params.maxstacks;
      }
      if (Sim.stats.leg_anessaziedge && Sim.getTargets(12, Sim.target.distance)) {
        Sim.addBuff("stunned", undefined, 90);
      }
      Sim.petattack("zombiedogs", undefined, params);
    },
    oninit: function(rune) {
      if (rune === "a") {
        Sim.after(30, function burning() {
          var stacks = Sim.getBuff("zombiedogs");
          if (stacks) {
            Sim.damage({type: "area", range: 8, origin: 5, coeff: 0.05 * Sim.stats.info.aps, pet: true, count: stacks});
          }
          Sim.after(30, burning);
        });
      }
    },
    elem: {x: "phy", c: "psn", d: "col", b: "phy", a: "fir", e: "phy"},
  };

  skills.horrify = {
    secondary: true,
    speed: 57.692299,
    cooldown: function(rune) {
      return 12 - (Sim.stats.passives.spiritvessel ? 2 : 0);
    },
    oncast: function(rune) {
      var duration = 180;
      var range = 18;
      switch (rune) {
      case "c": duration = 300; break;
      case "e": Sim.addBuff("stalker", {extrams: 20}, {duration: 240}); break;
      case "b": range = 24; break;
      case "a": Sim.addBuff("frighteningaspect", {armor_percent: 35}, {duration: 480}); break;
      }
      var targets = Sim.getTargets(range, Sim.target.distance);
      if (targets) {
        if (rune === "d") Sim.addResource(targets * 55);
        if (Sim.stats.leg_tiklandianvisage) {
          Sim.addBuff("horrify", undefined, {duration: 480, status: "feared", nodr: true});
        } else {
          Sim.addBuff("horrify", undefined, {duration: duration, status: "feared"});
        }
      }
      Sim.damage({type: "area", range: range, self: true, coeff: 0});
    },
    proctable: {x: 0.25, c: 0.25, e: 0.25, b: 0.2, a: 0.25, d: 0.25},
    elem: "phy",
  };

  function sw_shock(data) {
    Sim.damage({type: "area", range: 10, self: true, coeff: 7.5});
  }
  skills.spiritwalk = {
    secondary: true,
    speed: 43.902412,
    cooldown: function(rune) {
      return 12 - (Sim.stats.passives.spiritvessel ? 2 : 0);
    },
    duration: {x: 120, b: 180, d: 120, c: 120, a: 120, e: 120},
    oncast: function(rune) {
      var buffs = {extrams: 50};
      var params = {duration: 120};
      switch (rune) {
      case "b": duration = 180; break;
      case "d": Sim.addResource(0.2 * (Sim.stats.maxmana || 0)); break;
      case "c": params.onexpire = sw_shock; break;
      case "a":
        params.tickrate = 15;
        params.ontick = {type: "area", range: 5, self: true, coeff: 2.25 / 4};
        break;
      }
      Sim.addBuff("spiritwalk", buffs, params);
    },
    proctable: {c: 0.333, a: 0.2},
    elem: {x: "phy", b: "phy", d: "phy", c: "fir", a: "phy", e: "phy"},
  };

  skills.hex = {
    secondary: true,
    speed: 56.249996,
    cooldown: function(rune) {
      return 15 * (Sim.stats.passives.tribalrites ? 0.75 : 1);
    },
    oncast: function(rune) {
      if (rune === "a") return;
      if (rune === "b") {
        Sim.addBuff("angrychicken", {shift: "angrychicken", extrams: 50}, {
          duration: 120,
          onexpire: function(data) {
            Sim.damage({type: "area", range: 12, self: true, coeff: 13.5});
          },
        });
        return;
      }
      Sim.addBuff(undefined, undefined, {
        duration: 720,
        tickrate: 180,
        tickinitial: 1,
        ontick: function() {
          Sim.addBuff("hex", {dmgtaken: (rune === "e" ? 20 : 10)}, {duration: 180, status: "charmed"});
        },
      });
    },
    proctable: {c: 0.333, a: 0.2},
    elem: {x: "phy", d: "phy", e: "phy", b: "phy", a: "psn", c: "fir"},
  };
  skills.hex_explode = {
    secondary: true,
    speed: 60,
    shift: "angrychicken",
    oncast: function(rune) {
      Sim.removeBuff("angrychicken");
    },
    proctable: 0.333,
    elem: "fir",
  };

  function jade6_apply(id, targets) {
    var buff = Sim.buffs[id];
    if (!buff) return 0;
    var total = 0;
    var tickrate = buff.params.tickrate;
    for (var i = 0; i < buff.stacks && targets; ++i) {
      var stack = buff.stacklist[(buff.stackstart + i) % buff.stacklist.length];
      Sim.pushCastInfo(stack.castInfo);
      var event = Sim.calcDamage({coeff: stack.data.coeff});
      Sim.popCastInfo();
      total += event.damage * Sim.reduceStackDuration(id, stack, 2400) / tickrate;
      --targets;
    }
    return total;
  }
  skills.soulharvest = {
    secondary: true,
    speed: 58.536537,
    cooldown: function(rune) {
      return 15 - (Sim.stats.passives.spiritvessel ? 2 : 0);
    },
    oncast: function(rune) {
      Sim.removeBuff("soulharvest");
      var targets = Math.ceil(Sim.getTargets(18, Sim.target.distance));
      var buffs = {int_percent: 3};
      if (rune === "d" || Sim.stats.set_jadeharvester_4pc) {
        Sim.addResource(0.05 * targets * (Sim.stats.maxmana || 0));
        buffs.maxmana_percent = 5;
      }
      if (rune === "c" || Sim.stats.set_jadeharvester_4pc) {
        Sim.addBuff("languish", {armor_percent: 30}, {duration: 300, status: "slowed"});
      }
      var duration = 1800;
      if (rune === "b" || Sim.stats.set_jadeharvester_4pc) {
        duration = 3600;
      }
      Sim.addBuff("soulharvest", buffs, {duration: duration, stacks: targets, maxstacks: Sim.stats.leg_sacredharvester ? 10 : 5});
      if (rune === "e" || Sim.stats.set_jadeharvester_4pc) {
        Sim.damage({type: "area", range: 18, self: true, coeff: 6.3});
      }
      if (targets && Sim.stats.set_jadeharvester_6pc) {
        Sim.dealDamage({
          targets: targets,
          skill: "soulharvest",
          proc: 0,
          damage: (jade6_apply("haunt", targets) + jade6_apply("locustswarm", targets)) / targets,
          castInfo: Sim.castInfo(),
          chc: 0,
          distance: Sim.target.distance,
        });
      }
    },
    proctable: {e: 0.25},
    elem: "phy",
  };

  skills.sacrifice = {
    offensive: true,
    speed: 57.499966,
    precast: function(rune, dry) {
      if (!Sim.getBuff("zombiedogs")) return false;
    },
    oncast: function(rune) {
      var stacks = Sim.getBuff("zombiedogs");
      if (!stacks) return;
      var count = (rune === "b" ? stacks : 1);
      Sim.removeBuff("zombiedogs", count);
      var dmg = {delay: 12, type: "area", range: 12, coeff: 10.9, count: count};
      switch (rune) {
      case "c": dmg.onhit = Sim.apply_effect("stunned", 180); break;
      case "e":
        for (var i = Sim.random("nextofkin", 0.35, count, true); i > 0; --i) {
          Sim.cast("summonzombiedogs");
        }
        break;
      case "d": Sim.addResource(280 * count); break;
      case "b": dmg.coeff = 13; break;
      case "a": Sim.addBuff("provokethepack", {damage: 20}, {duration: 300, refresh: false, maxstacks: 5, stacks: count}); break;
      }
      if (Sim.stats.leg_thetallmansfinger) {
        dmg.coeff *= 3;
      }
      Sim.damage(dmg);
    },
    proctable: 0.1667,
    elem: "phy",
  };

  skills.massconfusion = {
    speed: 57.142853,
    cooldown: function(rune) {
      return (rune === "d" ? 45 : 60) * (Sim.stats.passives.tribalrites ? 0.75 : 1);
    },
    oncast: function(rune) {
      if (rune === "a") {
        Sim.addBuff("paranoia", {dmgtaken: 20}, {duration: 720});
      }
      if (rune === "c") {
        Sim.addBuff(undefined, undefined, {
          duration: 840,
          tickrate: 15,
          ontick: {type: "area", range: 8, coeff: 1.95 / 4},
        });
      }
      Sim.addBuff("massconfusion", undefined, {duration: 720, status: "charmed"});
    },
    proctable: {c: 0.13},
    elem: "phy",
  };

  skills.zombiecharger = {
    offensive: true,
    speed: 54.999996,
    cost: 150,
    oncast: function(rune) {
      switch (rune) {
      case "x": return {type: "line", speed: 0.3, radius: 6, pierce: true, coeff: 5.6, range: 22};
      case "c": return {delay: 60, type: "area", range: 6, coeff: 8};
      case "d": return {type: "line", speed: 0.3, radius: 6, pierce: true, coeff: 5.6, range: 22};
      case "b":
        for (var i = 0; i < 7; ++i) {
          Sim.damage({type: "line", speed: 0.3, radius: 6, pierce: true, coeff: 1.96, range: 22, angle: (i - 3) * 360 / 7, onhit: Sim.apply_effect("slowed", 120)});
        }
        break;
      case "e": return {type: "line", speed: 0.8, radius: 6, area: 9, coeff: 5.32, range: 42};
      case "a": return {type: "line", speed: 0.5, radius: 6, pierce: true, coeff: 3.92, count: 3, range: 44};
      }
    },
    proctable: {x: 0.5, c: 0.5, d: 0.5, b: 0.333, e: 0.5, a: 0.111},
    elem: {x: "psn", c: "phy", d: "psn", b: "col", e: "fir", a: "psn"},
  };

  function sb_siw_onhit(data) {
    Sim.addResource(12 * data.targets);
  }
  skills.spiritbarrage = {
    offensive: true,
    speed: 57.142834 / 1.2,
    cost: 100,
    oncast: function(rune) {
      switch (rune) {
      case "x": return {delay: 30, count: 4, coeff: 4.25 / 4};
      case "d": return {delay: 30, count: 4, coeff: 4.25 / 4, onhit: sb_siw_onhit};
      case "b":
        Sim.damage({delay: 30, count: 3, coeff: 0.65});
        return {delay: 30, count: 4, coeff: 4.25 / 4, onhit: sb_siw_onhit};
      case "c":
        Sim.addBuff("phantasm", undefined, {
          maxstacks: 3,
          duration: 300,
          tickrate: 30,
          tickinitial: 1,
          ontick: {type: "area", range: 10, coeff: 1.35 / 2},
        });
        break;
      case "a": return {delay: 30, count: 4, coeff: 4.25 / 4, onhit: Sim.apply_effect("charmed", 240, 0.04)};
      case "e":
        Sim.addBuff("manitou", undefined, {
          duration: 1200,
          tickrate: 36,
          ontick: {coeff: 0.87},
        });
        break;
      }
    },
    proctable: {x: 0.25, d: 0.25, b: 0.1667, c: 0.125, a: 0.25, e: 0.03},
    elem: {x: "col", d: "col", b: "fir", c: "col", a: "col", e: "col"},
  };

  skills.acidcloud = {
    offensive: true,
    speed: 55.384609,
    cost: 175,
    oncast: function(rune) {
      var dmg = {delay: 15, type: "area", range: 12, coeff: 3};
      var params = {
        duration: 181,
        tickrate: 15,
        ontick: {type: "area", range: 6, coeff: 0.3},
      };
      switch (rune) {
      case "b":
        dmg.delay = 36;
        dmg.range = 24;
        break;
      case "c":
        params.duration = 300;
        params.ontick.pet = true;
        params.maxstacks = 3;
        break;
      case "d":
        params.duration = 360;
        break;
      case "e":
        dmg.type = "cone";
        dmg.range = 30;
        dmg.width = 55;
        dmg.coeff *= 1.1;
        params.ontick.coeff *= 1.1;
        break;
      case "a":
        return {delay: 36, type: "area", range: 12, coeff: 5.25};
      }
      Sim.damage(dmg);
      Sim.addBuff("acidcloud", undefined, params);
    },
    proctable: {x: 0.2, b: 0.2, c: 0.2, d: 0.2, e: 0.1667, a: 0.333},
    elem: {x: "psn", b: "psn", c: "psn", d: "col", e: "psn", a: "fir"},
  };

  skills.wallofzombies = {
    offensive: true,
    speed: 56.249996,
    cooldown: function(rune) {
      return 8 - (Sim.stats.set_helltooth_4pc ? 2 : 0);
    },
    oncast: function(rune) {
      var params = {
        duration: 240,
        tickrate: 12,
        tickinitial: 1,
        ontick: {type: "line", origin: 14, range: 28, radius: 5, pierce: true, coeff: 0.1},
      };
      switch (rune) {
      case "b":
        params.ontick.origin -= 9.5;
        params.ontick.range += 19;
        break;
      case "d":
        params.ontick.radius = 7;
        params.ontick.onhit = Sim.apply_effect("chilled", 300);
        break;
      case "a":
        Sim.addBuff(undefined, undefined, {
          duration: 240,
          tickrate: 72,
          ontick: function(data) {
            Sim.petattack("creepers", undefined, {
              maxstacks: 10,
              duration: 480,
              tickrate: [60, 72],
              ontick: {coeff: 0.25, pet: true},
            });
          },
        });
        break;
      case "c":
        if (!Sim.target.boss) Sim.addBuff("knockback", undefined, 30);
        break;
      }
      if (Sim.stats.set_helltooth_6pc) {
        params.data = {ontick: params.ontick};
        params.pool = Sim.extend({}, params.ontick);
        params.pool.radius = 30;
        params.pool.coeff = 0.6;
        params.pool.proc = 0;
        params.ontick = function(data) {
          Sim.damage(data.ontick);
          Sim.damage(data.pool);
        };
      }
      Sim.addBuff(undefined, undefined, params);
    },
    proctable: {x: 0.08, b: 0.07, d: 0.06, a: 0.05, e: 0.03, c: 0.033},
    elem: {x: "phy", b: "phy", d: "col", a: "phy", e: "phy", c: "phy"},
  };

  function piranhas_onhit(data) {
    if (data.castInfo.rune === "c") {
      Sim.addBuff("knockback", undefined, 30);
    }
    var duration = 60;
    if (data.castInfo.rune === "d") duration = 480;
    if (Sim.stats.passives.creepingdeath) duration = 18000;
    Sim.addBuff("piranhas", {dmgtaken: 15}, {duration: duration});
  }
  skills.piranhas = {
    offensive: true,
    speed: 58.536537,
    cost: 250,
    cooldown: {x: 8, a: 8, b: 8, c: 16, d: 8, e: 8},
    oncast: function(rune) {
      var params = {
        duration: 480,
        tickrate: 24,
        tickinitial: 1,
        ontick: {type: "area", range: 13, coeff: 0.2, onhit: piranhas_onhit},
      };
      switch (rune) {
      case "a": Sim.damage({delay: 30, coeff: 11}); break;
      case "b":
        params.ontick = function(data) {
          var targets = Math.ceil(Sim.getTargets(13));
          if (targets < Sim.target.count) {
            Sim.damage({coeff: 0.2, count: Math.min(2, Sim.target.count - targets)});
          }
          Sim.damage({type: "area", range: 13, coeff: 0.2, onhit: piranhas_onhit});
        };
        break;
      case "c":
        params.duration = 240;
        params.ontick.coeff *= 2;
        break;
      case "d":
        return {type: "line", pierce: true, range: 20, speed: 0.5, radius: 36, coeff: 4.75, onhit: piranhas_onhit};
      case "e": Sim.addBuff("chilled", undefined, 480); break;
      }
      Sim.addBuff(undefined, undefined, params);
    },
    proctable: {x: 0.03, a: 0.03, b: 0.025, c: 0.05, d: 0.04, e: 0.028},
    elem: {x: "psn", a: "phy", b: "psn", c: "psn", d: "psn", e: "col"},
  };

  var nextEnrage = 0;
  function garg_ontick(data) {
    switch (data.stack.castInfo.rune) {
    case "a":
      if (Sim.time >= nextEnrage) {
        Sim.addBuff("restlessgiant", {dmgmul: {skills: ["gargantuan"], percent: 200}}, {duration: 900});
        nextEnrage = Sim.time + 7200;
      }
      data.ias = (Sim.getBuff("restlessgiant" ? 35 : 0));
      break;
    case "b": Sim.damage({pet: true, distance: 5, type: "area", range: 15, coeff: Sim.stats.info.aps * data.coeff, onhit: data.onhit}); break;
    case "d": Sim.damage({pet: true, distance: 5, type: "area", range: 5, coeff: Sim.stats.info.aps * data.coeff, onhit: data.onhit}); break;
    case "e":
      if (Sim.time >= (data.slamNext || 0)) {
        Sim.damage({pet: true, distance: 5, type: "area", range: 5, coeff: 2 * Sim.stats.info.aps * data.coeff, onhit: Sim.apply_effect("stunned", 180)});
        data.slamNext = Sim.time + 600;
        return 114;
      }
    }
    Sim.damage({pet: true, distance: 5, coeff: Sim.stats.info.aps * data.coeff, onhit: data.onhit});
  }
  skills.gargantuan = {
    offensive: true,
    pet: true,
    speed: 56.249996,
    cooldown: function(rune) {
      return 60 * (Sim.stats.passives.tribalrites ? 0.75 : 1);
    },
    oncast: function(rune) {
      var params = {
        tickrate: 84,
        refresh: false,
        data: {coeff: 1},
        ontick: garg_ontick,
      };
      switch (rune) {
      case "b": params.data.coeff = 1.3; break;
      case "d": params.data.coeff = 5.75; params.duration = 900; break;
      }
      if (Sim.stats.leg_theshortmansfinger) {
        params.stacks = 3;
      }
      Sim.petattack("gargantuan", undefined, params);
    },
    oninit: function(rune) {
      if (rune === "c") {
        Sim.after(60, function poison() {
          var stacks = Sim.getBuff("gargantuan");
          if (stacks) {
            Sim.damage({type: "area", range: 10, origin: 5, coeff: 0.45 * Sim.stats.info.aps, pet: true, count: stacks});
          }
          Sim.after(60, poison);
        });
      }
    },
    elem: {x: "phy", b: "col", a: "phy", d: "fir", c: "psn", e: "fir"},
  };

  skills.bigbadvoodoo = {
    speed: 57.499962,
    cooldown: function(rune) {
      return 120 * (Sim.stats.passives.tribalrites ? 0.75 : 1);
    },
    oncast: function(rune) {
      var buffs = {ias: 20, petias: 20, extrams: 20};
      var params = {duration: 1200};
      switch (rune) {
      case "b": params.duration = 1800; break;
      case "d": buffs.manaregen = 250; break;
      case "a": buffs.damage = 30; break;
      }
      Sim.addBuff("bigbadvoodoo", buffs, params);
    },
    elem: "phy",
  };

  function fetish_dagger_ontick(data) {
    Sim.damage({pet: true, distance: 5, coeff: 1.8 * Sim.stats.info.aps});
  }
  function fetish_shaman_ontick(data) {
    Sim.damage({pet: true, type: "cone", width: 45, range: 20, origin: 10, coeff: 0.85 * Sim.stats.info.aps});
  }
  function fetish_hunter_ontick(data) {
    Sim.damage({pet: true, type: "line", speed: 1.5, coeff: 1.3 * Sim.stats.info.aps});
  }
  skills.fetisharmy = {
    offensive: true,
    pet: true,
    speed: 60,
    cooldown: function(rune) {
      return (rune === "d" ? 90 : 120) * (Sim.stats.passives.tribalrites ? 0.75 : 1);
    },
    oncast: function(rune) {
      var daggers = 5;
      var duration = (Sim.stats.set_zunimassa_2pc ? undefined : 1200);
      switch (rune) {
      case "a": Sim.damage({pet: true, type: "area", range: 5, self: true, coeff: 6.8, count: daggers}); break;
      case "b": daggers += 3; break;
      case "c":
        Sim.petattack("fetisharmy_shaman", undefined, {
          duration: duration,
          tickrate: 40,
          refresh: false,
          stacks: 2,
          ontick: fetish_shaman_ontick,
        });
        break;
      case "e":
        Sim.petattack("fetisharmy_hunter", undefined, {
          duration: duration,
          tickrate: 48,
          refresh: false,
          stacks: 2,
          ontick: fetish_hunter_ontick,
        });
        break;
      }
      Sim.petattack("fetisharmy_dagger", undefined, {
        duration: duration,
        tickrate: 48,
        refresh: false,
        stacks: daggers,
        ontick: fetish_dagger_ontick,
      });
    },
    oninit: function(rune) {
      Sim.metaBuff("fetisharmy", ["fetisharmy_dagger", "fetisharmy_shaman", "fetisharmy_hunter"]);
    },
    elem: {x: "phy", a: "col", d: "phy", b: "phy", c: "fir", e: "psn"},
  };

  Sim.summon_sycophant = function() {
    Sim.pushCastInfo({skill: "fetishsycophants", elem: Sim.stats.info.maxelem, pet: true});
    Sim.petattack("fetishsycophants", undefined, {
      duration: 3600,
      tickrate: 48,
      refresh: false,
      maxstacks: 15,
      ontick: fetish_dagger_ontick,
    });
    Sim.popCastInfo();
  };

  Sim.passives = {
    junglefortitude: {dmgred: 15},
    circleoflife: function() {
    },
    spiritualattunement: {maxmana_percent: 10, manaregen_percent: 1},
    gruesomefeast: function() {
      Sim.register("onglobe", function() {
        Sim.addResource(0.1 * (Sim.stats.maxmana || 0));
        Sim.addBuff("gruesomefeast", {int_percent: 10}, {duration: 900, refresh: false, maxstacks: 5});
      });
    },
    bloodritual: {rcr_mana: 10, regen_percent: 1},
    badmedicine: function() {
    },
    zombiehandler: {life: 20},
    piercetheveil: {damage: 20, rcr_mana: -30},
    spiritvessel: function() {
    },
    fetishsycophants: function() {
      Sim.register("onhit_proc", function(data) {
        for (var i = Sim.random("fetishsycophants", 0.15 * data.proc, data.targets, true); i > 0; --i) {
          Sim.summon_sycophant();
        }
      });
    },
    rushofessence: function() {
      var list = ["haunt", "horrify", "massconfusion", "soulharvest", "spiritbarrage", "spiritwalk"];
      Sim.register("oncast", function(data) {
        if (list.indexOf(data.skill) >= 0) {
          Sim.addBuff(undefined, {manaregen: 10}, {duration: 600});
        }
      });
    },
    visionquest: function() {
      Sim.register("onhit", function(data) {
        if (data.skill && skills[data.skill] && skills[data.skill].signature) {
          Sim.addBuff("visionquest", {manaregen_percent: 30}, {duration: 300});
        }
      });
    },
    fierceloyalty: function() {
    },
    graveinjustice: function() {
    },
    tribalrites: function() {
    },
    creepingdeath: function() {
    },
    physicalattunement: function() {
    },
    midnightfeast: {dmgmul: {skills: ["summonzombiedogs", "gargantuan"], percent: 50}},
  };

})();