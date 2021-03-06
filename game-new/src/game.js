const charClasses = {
  demonhunter: "Demon Hunter",
  barbarian: "Barbarian",
  wizard: "Wizard",
  witchdoctor: "Witchdoctor",
  monk: "Monk",
  crusader: "Crusader",
  necromancer: "Necromancer",
};

const itemClasses = ["Demon Hunter", "Barbarian", "Wizard", "Witchdoctor", "Monk", "Crusader", "Necromancer"];
const allClassIcons = [
  "/css/images/demonhunter_male.png",
  "/css/images/demonhunter_female.png",
  "/css/images/barbarian_male.png",
  "/css/images/barbarian_female.png",
  "/css/images/wizard_male.png",
  "/css/images/wizard_female.png",
  "/css/images/witchdoctor_male.png",
  "/css/images/witchdoctor_female.png",
  "/css/images/monk_male.png",
  "/css/images/monk_female.png",
  "/css/images/crusader_male.png",
  "/css/images/crusader_female.png",
  "/css/images/necromancer_male.png",
  "/css/images/necromancer_female.png",
];
const classIcons = {
  "Demon Hunter": allClassIcons[1],
  "Barbarian": allClassIcons[2],
  "Wizard": allClassIcons[5],
  "Witchdoctor": allClassIcons[6],
  "Monk": allClassIcons[8],
  "Crusader": allClassIcons[10],
  "Necromancer": allClassIcons[12],
};

const typeToSlot = {
  "Amulet": "Neck",
  "Axe": "1-Hand",
  "Belt": "Waist",
  "Boots": "Feet",
  "Bow": "2-Hand",
  "Bracers": "Wrists",
  "Ceremonial Knife": "1-Hand",
  "Chest Armor": "Torso",
  "Cloak": "Torso",
  "Crossbow": "2-Hand",
  "Crusader Shield": "Off-Hand",
  "Dagger": "1-Hand",
  "Daibo": "2-Hand",
  "Fist Weapon": "1-Hand",
  "Flail": "1-Hand",
  "Gloves": "Hands",
  "Hand Crossbow": "1-Hand",
  "Helm": "Head",
  "Mace": "1-Hand",
  "Mighty Belt": "Waist",
  "Mighty Weapon": "1-Hand",
  "Mojo": "Off-Hand",
  "Pants": "Legs",
  "Phylactery": "Off-Hand",
  "Polearm": "2-Hand",
  "Quiver": "Off-Hand",
  "Ring": "Finger",
  "Scythe": "1-Hand",
  "Shield": "Off-Hand",
  "Shoulders": "Shoulders",
  "Source": "Off-Hand",
  "Spear": "1-Hand",
  "Spirit Stone": "Head",
  "Staff": "2-Hand",
  "Sword": "1-Hand",
  "Two-Handed Axe": "2-Hand",
  "Two-Handed Flail": "2-Hand",
  "Two-Handed Mace": "2-Hand",
  "Two-Handed Mighty Weapon": "2-Hand",
  "Two-Handed Scythe": "2-Hand",
  "Two-Handed Sword": "2-Hand",
  "Voodoo Mask": "Head",
  "Wand": "1-Hand",
  "Wizard Hat": "Head",
};

export { itemClasses, allClassIcons, classIcons, typeToSlot, charClasses };