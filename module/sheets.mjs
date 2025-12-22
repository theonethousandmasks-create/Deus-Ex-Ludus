import { ActorSheet, ItemSheet, mergeObject } from "foundry:api";

export class CharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "actor"],
      template: "templates/actor/character-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", group: "primary", initial: "abilities" }]
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.ability button').click(this._onRollAbility.bind(this));
    html.find('.item-edit').click(this._onItemEdit.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));
  }

  _onRollAbility(event) {
    event.preventDefault();
    const ability = event.currentTarget.dataset.ability;
    this.actor.rollAbility(ability);
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

export class TraitSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item"],
      template: "templates/item/trait-sheet.html",
      width: 400,
      height: 400
    });
  }
}

export class ItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item"],
      template: "templates/item/item-sheet.html",
      width: 400,
      height: 400
    });
  }
}

export class ForceMajeureSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item"],
      template: "templates/item/force-majeure-sheet.html",
      width: 400,
      height: 400
    });
  }
}