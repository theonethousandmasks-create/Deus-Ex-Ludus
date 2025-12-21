import { ActorSheet, ItemSheet, mergeObject } from "foundry:api";

export class CharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "actor"],
      template: "templates/actor/character-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", group: "primary", initial: "skills" }]
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.skill button').click(this._onRollSkill.bind(this));
    html.find('.item-edit').click(this._onItemEdit.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));
  }

  _onRollSkill(event) {
    event.preventDefault();
    const skill = event.currentTarget.dataset.skill;
    this.actor.rollSkill(skill);
  }

  _onItemEdit(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }
}

export class NpcSheet extends CharacterSheet {
  // For now, same as character
}

export class SkillSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item"],
      template: "templates/item/skill-sheet.html",
      width: 400,
      height: 400
    });
  }
}

export class WeaponSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item"],
      template: "templates/item/weapon-sheet.html",
      width: 400,
      height: 400
    });
  }
}

export class ArmorSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item"],
      template: "templates/item/armor-sheet.html",
      width: 400,
      height: 400
    });
  }
}