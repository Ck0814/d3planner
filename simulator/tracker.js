(function() {
  var Sim = Simulator;

  var BucketSize = 180;
  var BucketBase = BucketSize / 2;
  var KernelSize = 1.5;
  var KernelFactor = 240;
  function Kernel(x) {
    x = Math.abs(x);
    if (x < 0.5) {
      return 0.75 - x * x;
    } else if (x < 1.5) {
      return 0.5 * (1.5 - x) * (1.5 - x);
    } else {
      return 0;
    }
  }
  var Buckets = [], HealBuckets = [];
  while (Buckets.length < Math.ceil((2 * KernelFactor * KernelSize - 1) / BucketSize) + 1) {
    Buckets.push(0);
    HealBuckets.push(0);
  }
  var TotalDamage = 0;
  var TotalHealing = 0;
  var SkillCounters = {};
  var Sample = [];
  Sim._sample = Sample;

  Sim.targetHealth = 1;
  var MaxHealth = undefined;

  Sim.register("init", function() {
    this.after(BucketBase + KernelFactor * KernelSize, function SendReport() {
      Sim.postMessage({type: "chart", time: BucketBase, damage: Buckets.shift(), healing: HealBuckets.shift(), health: Math.max(0, Sim.targetHealth)});
      Buckets.push(0);
      HealBuckets.push(0);
      BucketBase += BucketSize;
      Sim.after(BucketSize, SendReport);
    });
    if (this.target.health > 0) {
      MaxHealth = this.target.health;
    } else {
      this.after(3600, function() {
        MaxHealth = TotalDamage * 10;
        Sim.targetHealth = 0.9;
      });
    }
    if (this.params.globeRate) {
      var delay = 3600 / Sim.params.globeRate;
      this.after(Sim.random("globedelay", delay), function globes() {
        Sim.trigger("onglobe");
        Sim.after(Sim.random("globedelay", delay), globes);
      });
    }
    if (this.params.hitRate) {
      var delay = 3600 / Sim.params.hitRate;
      this.after(Sim.random("gethitdelay", delay), function hits() {
        Sim.trigger("ongethit");
        if (Sim.random("block", Sim.stats.block * 0.01)) {
          Sim.trigger("onblock");
        }
        Sim.after(Sim.random("gethitdelay", delay), hits);
      });
    }
  });

  function _counter(id) {
    if (!SkillCounters[id]) {
      SkillCounters[id] = {};
    }
    return SkillCounters[id];
  }
  var CastCounters = {};
  // 0: time
  // 1: skill
  // 2: resource
  // 3: damage
  // 4: damage/source
  // 5: buffs
  // 6: healing
  Sim.register("onhit", function(data) {
    var source = (data.skill || data.triggered || "unknown");
    if (data.pet || (data.castInfo && (data.castInfo.pet || data.castInfo.trigExplicit))) {
      source = (data.triggered || data.skill || "unknown");
    }
    //var source = ((data.skill ? (!data.pet && data.triggered) || data.skill : data.triggered) || "unknown");
    var amount = data.damage * data.targets * data.count;
    var cnt = _counter(source);
    cnt.damage = (cnt.damage || 0) + amount;
    var contrib = 0;
    for (var i = 0; i < Buckets.length; ++i) {
      contrib += Kernel((BucketBase + BucketSize * i - Sim.time) / KernelFactor);
    }
    if (contrib) {
      for (var i = 0; i < Buckets.length; ++i) {
        Buckets[i] += amount * Kernel((BucketBase + BucketSize * i - Sim.time) / KernelFactor) / contrib;
      }
    }
    TotalDamage += amount;
    if (MaxHealth) {
      Sim.targetHealth = (MaxHealth - TotalDamage) / MaxHealth;
    }
    var castId = data.castId || (data.castInfo && data.castInfo.castId);
    if (castId && CastCounters[castId]) {
      /*var source = (data.skill || data.triggered || "unknown");
      if (data.pet || (data.castInfo && data.castInfo.pet)) {
        source = (data.triggered || data.skill || "unknown");
      }*/
      var evt = CastCounters[castId];
      if ((data.triggered && data.triggered !== evt[1]) || !data.castInfo || data.castInfo.castId !== castId) {
        evt[4][source] = (evt[4][source] || 0) + amount;
      } else {
        evt[3] += amount;
      }
    }
  });
  Sim.register("healing", function(data) {
    var source = (data.castInfo && (data.castInfo.skill || data.castInfo.triggered) || "unknown");
    if (data.castInfo && (data.castInfo.pet || data.castInfo.trigExplicit)) {
      source = (data.castInfo.triggered || data.castInfo.skill || "unknown");
    }
    var cnt = _counter(source);
    cnt.healing = (cnt.healing || 0) + data.amount;
    var contrib = 0;
    for (var i = 0; i < HealBuckets.length; ++i) {
      contrib += Kernel((BucketBase + BucketSize * i - Sim.time) / KernelFactor);
    }
    if (contrib) {
      for (var i = 0; i < HealBuckets.length; ++i) {
        HealBuckets[i] += data.amount * Kernel((BucketBase + BucketSize * i - Sim.time) / KernelFactor) / contrib;
      }
    }
    TotalHealing += data.amount;
    var castId = data.castId || (data.castInfo && data.castInfo.castId);
    if (castId && CastCounters[castId]) {
      var evt = CastCounters[castId];
      evt[6] = (evt[6] || 0) + data.amount;
    }
  });
  Sim.register("oncast", function(data) {
    if (data.triggered) return;
    var cnt = _counter(data.skill);
    cnt.count = (cnt.count || 0) + 1;
    if (Sample /*&& Sample.length < 50*/) {
      var buffs = {};
      for (var id in this.buffs) {
        if (id.indexOf("uniq_") === 0) continue;
        var amount = Math.max(Sim.getBuff(id), Sim.getBuffTargets(id));
        if (amount) buffs[id] = amount;
      }
      var evt = [data.time, data.skill, Sim.resources[Sim.rcTypes[0]], 0, {}, buffs];
      if (data.castId) CastCounters[data.castId] = evt;
      Sample.push(evt);
    }
  });
  Sim.register("resourcegain", function(data) {
    if (!data.castInfo) return;
    var source = (data.castInfo.triggered || data.castInfo.skill || "unknown");
    var cnt = _counter(source);
    if (!cnt.rc) cnt.rc = {};
    cnt.rc[data.type] = (cnt.rc[data.type] || 0) + data.amount;
  });

  Sim.postResults = function() {
    Sim.postMessage({type: "report", time: Sim.time, health: Math.max(0, Sim.targetHealth),
      counters: SkillCounters,
      damage: TotalDamage,
      healing: TotalHealing,
      uptimes: Sim.uptimes,
      sample: Sample,
    });
  };
})();