(function() {
  var Sim = Simulator;

  Sim.initClass = {};
  Sim.affixes = {};
  Sim.gems = {};

/*  Sim.run = function() {
    var baseStats = new DC.Stats();
    baseStats.loadItems();
    DC.addPartyBuffs(baseStats);
  };*/

  Sim.extend = function() {
    var deep = false;
    var i = 1;
    var target = arguments[0] || {};
    if (typeof target === "boolean") {
      deep = target;
      target = arguments[1] || {};
      i = 2;
    }

    if (typeof target !== "object") {
      target = {};
    }

    for (; i < arguments.length; ++i) {
      var options = arguments[i];
      if (options != null) {
        for (var name in options) {
          var src = target[name];
          var copy = options[name];
          if (target === copy) {
            continue;
          }
          if (deep && copy && copy instanceof Object) {
            var clone;
            if (copy instanceof Array) {
              clone = (src && src instanceof Array ? src : []);
            } else {
              clone = (src && src instanceof Object ? src : {});
            }
            target[name] = this.extend(deep, clone, copy);
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    }

    return target;
  };

  Sim.eventQueue = new Sim.Heap(function(e) {
    return e.time;
  });
  Sim.handlers = {};

  Sim.after = function(frames, func, data) {
    frames = Math.ceil(frames);
    var e = {
      time: this.time + frames,
      func: func,
      data: data,
      castInfo: this.castInfo(),
    };
    this.eventQueue.push(e);
    return e;
  };

  Sim.register = function(event, func, data) {
    if (!this.handlers[event]) {
      this.handlers[event] = [];
    }
    var castInfo = this.castInfo();
    if (castInfo) {
      castInfo = this.extend(true, {}, castInfo);
      delete castInfo.user;
    }
    this.handlers[event].push({func: func, castInfo: castInfo, data: data});
  };
  Sim.unregister = function(event, func) {
    var handlers = this.handlers[event];
    if (handlers) {
      for (var i = 0; i < handlers.length; ++i) {
        if (handlers[i].func === func) {
          handlers.splice(i, 1);
          return;
        }
      }
    }
  }
  Sim.trigger = function(event, data) {
    var results = [];
    if (this.handlers[event]) {
      data = data || {};
      data.time = this.time;
      for (var i = 0; i < this.handlers[event].length; ++i) {
        var handler = this.handlers[event][i];
        this.pushCastInfo(handler.castInfo);
        data.data = handler.data;
        results.push(handler.func.call(this, data));
        this.popCastInfo();
      }
      delete data.data;
      delete data.time;
    }
    return results;
  };

  Sim.removeEvent = function(e) {
    Sim.eventQueue.remove(e);
  };

  Sim.init = function(stats, target, params) {
    this.baseStats = stats;
    this.target = target;
    this.time = 0;
    this.target.radius = Math.max(this.target.radius, 1);
    this.target.area = Math.PI * Math.pow(this.target.radius, 2);
    this.target.density = this.target.count / this.target.area;
    this.params = params || {};
    if (this.initClass[stats.charClass]) {
      this.initClass[stats.charClass]();
    }
    this.trigger("update");
    this.trigger("init");
    for (var id in this.affixes) {
      if (this.stats[id]) {
        this.pushCastInfo({triggered: id});
        this.affixes[id].call(id, this.stats[id]);
        this.popCastInfo();
      }
    }
    for (var id in this.stats.gems) {
      if (this.gems[id]) {
        this.pushCastInfo({triggered: id});
        this.gems[id].call(id, this.stats.gems[id]);
        this.popCastInfo();
      }
    }
  };

  Sim.verbose = false;
  Sim.run = function(duration, verbose) {
    duration = (duration || 36000);
    Sim.verbose = (verbose || 0);
    console.time("run");
    var start = this.time;
    while (!this.eventQueue.empty() && this.time < start + duration) {
      var e = this.eventQueue.pop();
      this.time = e.time;
      this.trigger("update");
      this.pushCastInfo(e.castInfo);
      e.data = (e.data || {});
      e.data.time = e.time;
      e.data.event = e;
      e.func(e.data);
      this.popCastInfo();
    }
    this.trigger("finish");
    console.timeEnd("run");
    console.log("DPS: " + this.totalDamage / duration * 60);
    console.log("Uptimes:", this.uptimes);
    console.log("Skill breakdown:", this.counters);
    console.log("Resource gains:", this.rcgains);
  };

  var rngBuffer = {};
  Sim.random = function(id, chance) {
    rngBuffer[id] = (rngBuffer[id] === undefined ? 0.5 : rngBuffer[id]) + Math.min(1, chance);
    var result = Math.floor(rngBuffer[id]);
    rngBuffer[id] -= result;
    return result;
  };

  Sim.castInfoStack = [];
  Sim.pushCastInfo = function(info) {
    this.castInfoStack.push(info);
  };
  Sim.popCastInfo = function() {
    this.castInfoStack.pop();
  };
  Sim.castInfo = function() {
    if (this.castInfoStack.length) {
      return this.castInfoStack[this.castInfoStack.length - 1];
    }
  };


  Sim.counters = {};
  Sim.rcgains = {};
  Sim.buckets = [];
  Sim.bucket_size = 300;
  Sim.totalDamage = 0;
  function _counter(id) {
    if (!Sim.counters[id]) {
      Sim.counters[id] = {count: 0, damage: 0};
    }
    return Sim.counters[id];
  }
  Sim.register("onhit", function(data) {
    var source = (data.triggered || data.skill || "unknown");
    var amount = data.damage * data.targets;
    _counter(source).damage += amount;
    var bucket = Math.floor(this.time / this.bucket_size);
    while (this.buckets.length <= bucket) {
      this.buckets.push(0);
    }
    this.buckets[bucket] += amount;
    this.totalDamage += amount;
    if (this.verbose >= 3) {
      console.log(this.extend(true, {}, data));
    }
  });
  Sim.register("oncast", function(data) {
    if (this.verbose >= 1) {
      console.log("[" + this.time + "] Casting " + data.skill + " " + JSON.stringify(this.resources));
/*      var buffs = {};
      for (var x in this.buffs) {
        buffs[x] = [this.buffs[x].stacks, this.buffs[x].time];
      }
      console.log(buffs);*/
    }
    _counter(data.skill).count += 1;
  });
  Sim.register("resourcegain", function(data) {
    if (!data.castInfo) return;
    var id = (data.castInfo.triggered || data.castInfo.skill);
    if (id) {
      if (!Sim.rcgains[id]) Sim.rcgains[id] = {};
      Sim.rcgains[id][data.type] = (Sim.rcgains[id][data.type] || 0) + data.amount;
      if (this.verbose >= 2) {
        console.log("Add " + data.amount + " " + data.type + " (" + id + ")");
      }
    }
  });
})();