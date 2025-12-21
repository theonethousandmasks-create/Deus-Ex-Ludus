import { ActorSheet, ItemSheet, mergeObject } from "foundry";

export class CharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "actor"],
      template: "templates/actor/character-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.skill button').click(this._onRollSkill.bind(this));
    html.find('.item-edit').click(this._onItemEdit.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));
    html.find('button[data-action]').click(this._onAttributeChange.bind(this));
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

  _onAttributeChange(event) {
    event.preventDefault();
    const action = event.currentTarget.dataset.action;
    const attribute = event.currentTarget.dataset.attribute;
    const currentValue = this.actor.system.attributes[attribute].value;
    const newValue = action === 'increase' ? currentValue + 1 : Math.max(0, currentValue - 1);
    this.actor.update({ [`system.attributes.${attribute}.value`]: newValue });
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

export class GearSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item"],
      template: "templates/item/gear-sheet.html",
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

export class RelicSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item"],
      template: "templates/item/relic-sheet.html",
      width: 400,
      height: 400
    });
  }
}