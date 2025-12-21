const { api, sheets } = foundry.applications;

export class CharacterSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheet) {
  static DEFAULT_OPTIONS = {
    classes: ["Deus-Ex-Ludus", "sheet", "actor"],
    position: {
      width: 800,
      height: 800
    },
    actions: {
      editItem: this._onItemEdit,
      deleteItem: this._onItemDelete,
      rollSkill: this._onRollSkill,
      attributeChange: this._onAttributeChange
    },
    form: {
      submitOnChange: true
    }
  };

  static TABS = {
    primary: {
      tabs: [
        { id: "attributes" },
        { id: "items" },
        { id: "notes" },
        { id: "effects" }
      ],
      initial: "attributes",
      labelPrefix: "DeusExLudus.Sheets.Tabs"
    }
  };

  static PARTS = {
    header: {
      template: "templates/actor/header.hbs"
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs"
    },
    attributes: {
      template: "templates/actor/attributes.hbs",
      scrollable: [""]
    },
    items: {
      template: "templates/actor/items.hbs",
      scrollable: [""]
    },
    notes: {
      template: "templates/actor/notes.hbs",
      scrollable: [""]
    },
    effects: {
      template: "templates/actor/effects.hbs",
      scrollable: [""]
    }
  };

  activateListeners(html) {
    super.activateListeners(html);
    html.find('button[data-action="attributeChange"]').click(this._onAttributeChange.bind(this));
    html.find('.item-edit').click(this._onItemEdit.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));
    html.find('.item-description').change(this._onItemDescriptionChange.bind(this));
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find('.skill button').click(this._onRollSkill.bind(this));
    html.find('.item-edit').click(this._onItemEdit.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));
    html.find('button[data-action]').click(this._onAttributeChange.bind(this));
    html.find('.item-description').change(this._onItemDescriptionChange.bind(this));
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
    const attribute = event.currentTarget.dataset.attribute;
    const direction = event.currentTarget.dataset.direction;
    const currentValue = this.actor.system.attributes[attribute].value;
    const newValue = direction === 'increase' ? currentValue + 1 : Math.max(0, currentValue - 1);
    this.actor.update({ [`system.attributes.${attribute}.value`]: newValue });
  }

  _onItemDescriptionChange(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const newDescription = event.currentTarget.value;
    const item = this.actor.items.get(itemId);
    item.update({ 'system.description': newDescription });
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
      height: 600
    });
  }
}

export class GearSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item"],
      template: "templates/item/gear-sheet.html",
      width: 400,
      height: 600
    });
  }
}

export class ArmorSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item"],
      template: "templates/item/armor-sheet.html",
      width: 400,
      height: 600
    });
  }
}

export class RelicSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "item"],
      template: "templates/item/relic-sheet.html",
      width: 400,
      height: 600
    });
  }
}

export class SettlementSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["Deus-Ex-Ludus", "sheet", "actor"],
      template: "templates/actor/settlement-sheet.html",
      width: 600,
      height: 600
    });
  }
}