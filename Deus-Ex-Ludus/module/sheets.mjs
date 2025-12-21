export class CharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["deus-ex-ludus", "sheet", "actor"],
      template: "templates/actor/character-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.skill button').click(this._onRollSkill.bind(this));
  }

  _onRollSkill(event) {
    event.preventDefault();
    const skill = event.currentTarget.dataset.skill;
    this.actor.rollSkill(skill);
  }
}

export class NpcSheet extends CharacterSheet {
  // For now, same as character
}

export class SkillSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["deus-ex-ludus", "sheet", "item"],
      template: "templates/item/skill-sheet.html",
      width: 400,
      height: 400
    });
  }
}

export class WeaponSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["deus-ex-ludus", "sheet", "item"],
      template: "templates/item/weapon-sheet.html",
      width: 400,
      height: 400
    });
  }
}

export class ArmorSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["deus-ex-ludus", "sheet", "item"],
      template: "templates/item/armor-sheet.html",
      width: 400,
      height: 400
    });
  }
}