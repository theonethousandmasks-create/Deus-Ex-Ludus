// Character Sheet for player characters
export class CharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "actor"],
      template: "systems/Deus-Ex-Ludus/templates/actor/character-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "abilities" }]
    });
  }

  getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    
    if (!this.isEditable) return;

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

// NPC Sheet
export class NpcSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "actor", "npc"],
      template: "systems/Deus-Ex-Ludus/templates/actor/npc-sheet.html",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".tabs", contentSelector: ".sheet-body", initial: "abilities" }]
    });
  }

  getData() {
    const context = super.getData();
    const actorData = this.actor.toObject(false);
    context.system = actorData.system;
    context.flags = actorData.flags;
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.isEditable) return;
    // Add NPC-specific listeners here if needed
  }
}

// Trait Sheet
export class TraitSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item", "trait"],
      template: "systems/Deus-Ex-Ludus/templates/item/trait-sheet.html",
      width: 400,
      height: 400
    });
  }

  getData() {
    const context = super.getData();
    const itemData = this.item.toObject(false);
    context.system = itemData.system;
    context.flags = itemData.flags;
    return context;
  }
}

// Generic Item Sheet (renamed to avoid collision with Foundry's ItemSheet)
export class DeusExLudusItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item"],
      template: "systems/Deus-Ex-Ludus/templates/item/item-sheet.html",
      width: 400,
      height: 400
    });
  }

  getData() {
    const context = super.getData();
    const itemData = this.item.toObject(false);
    context.system = itemData.system;
    context.flags = itemData.flags;
    return context;
  }
}

// Force Majeure Sheet
export class ForceMajeureSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item", "force-majeure"],
      template: "systems/Deus-Ex-Ludus/templates/item/force-majeure-sheet.html",
      width: 400,
      height: 400
    });
  }

  getData() {
    const context = super.getData();
    const itemData = this.item.toObject(false);
    context.system = itemData.system;
    context.flags = itemData.flags;
    return context;
  }
}

// Relic Sheet
export class RelicSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item", "relic"],
      template: "systems/Deus-Ex-Ludus/templates/item/relic-sheet.html",
      width: 400,
      height: 400
    });
  }

  getData() {
    const context = super.getData();
    const itemData = this.item.toObject(false);
    context.system = itemData.system;
    context.flags = itemData.flags;
    return context;
  }
}

// Resource Sheet
export class ResourceSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item", "resource"],
      template: "systems/Deus-Ex-Ludus/templates/item/resource-sheet.html",
      width: 400,
      height: 400
    });
  }

  getData() {
    const context = super.getData();
    const itemData = this.item.toObject(false);
    context.system = itemData.system;
    context.flags = itemData.flags;
    return context;
  }
}
