const DEL = {};

const systemID = "Deus-Ex-Ludus";

/**
 * Translates repository paths to Foundry Data paths
 * @param {string} path - A path relative to the root of this repository
 * @returns {string} The path relative to the Foundry data folder
 */
const systemPath = (path) => `systems/${systemID}/${path}`;

/**
 * Searches through an object recursively and localizes strings
 * @param {Record<string, unknown>} object
 */
function localizeHelper(object) {
  for (const [key, value] of Object.entries(object)) {
    switch (typeof value) {
      case "object":
        if (value) localizeHelper(value);
        break;
      case "string":
        if (key === "label") object[key] = game.i18n.localize(value);
        break;
    }
  }
}

/* -------------------------------------------------- */

/**
 * Prepare the data structure for Active Effects which are currently embedded in an Actor or Item.
 * @param {ActiveEffect[]} effects    A collection or generator of Active Effect documents to prepare sheet data for
 * @return {object}                   Data for rendering
 */
function prepareActiveEffectCategories(effects) {
  const categories = {
    temporary: {
      type: "temporary",
      label: game.i18n.localize("EFFECT.Temporary"),
      effects: []
    },
    passive: {
      type: "passive",
      label: game.i18n.localize("EFFECT.Passive"),
      effects: []
    },
    inactive: {
      type: "inactive",
      label: game.i18n.localize("EFFECT.Inactive"),
      effects: []
    }
  };

  // Iterate over active effects, classifying them into categories
  for (const e of effects) {
    if (!e.active) categories.inactive.effects.push(e);
    else if (e.isTemporary) categories.temporary.effects.push(e);
    else categories.passive.effects.push(e);
  }

  // Sort each category
  for (const c of Object.values(categories)) {
    c.effects.sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  return categories;
}

/* -------------------------------------------------- */

const { NumberField, SchemaField, StringField } = foundry.data.fields;

/* -------------------------------------------- */
/*  Actor Models                                */
/* -------------------------------------------- */

class ActorDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attributes: new SchemaField({
        health: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 10 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 10 })
        }),
        faith: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 5 }),
          max: new NumberField({ required: true, integer: true, min: 0, initial: 10 })
        })
      }),
      notes: new StringField({ required: true, blank: true })
    };
  }
}

class CharacterDataModel extends ActorDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      skills: new SchemaField({
        athletics: new NumberField({ required: true, integer: true, min: 0, initial: 50 }),
        combat: new NumberField({ required: true, integer: true, min: 0, initial: 50 }),
        stealth: new NumberField({ required: true, integer: true, min: 0, initial: 50 }),
        knowledge: new NumberField({ required: true, integer: true, min: 0, initial: 50 })
      })
    };
  }
}

class NpcDataModel extends ActorDataModel {
  // For now, same as character
}

class SettlementDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      population: new NumberField({ required: true, integer: true, min: 0, initial: 100 }),
      resources: new NumberField({ required: true, integer: true, min: 0, initial: 50 }),
      notes: new StringField({ required: true, blank: true })
    };
  }
}

/* -------------------------------------------- */
/*  Item Models                                 */
/* -------------------------------------------- */

class ItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new StringField({ required: true, blank: true })
    };
  }
}

class SkillDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      target: new NumberField({ required: true, integer: true, min: 0, initial: 50 })
    };
  }
}

class GearDataModel extends ItemDataModel {
  // Additional fields if needed
}

class RelicDataModel extends ItemDataModel {
  // Additional fields if needed
}

/* -------------------------------------------- */
/*  Documents                                  */
/* -------------------------------------------- */

class SystemActor extends Actor {
  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    // Add any derived data here
  }

  /**
   * Roll a skill check
   * @param {string} skill - The skill to roll
   */
  async rollSkill(skill) {
    const target = this.system.skills?.[skill] || 50;
    const roll = await new Roll("1d100").evaluate();
    const result = roll.total;
    let degree = "";
    if (result <= target) {
      const diff = target - result;
      if (diff >= 20) degree = "Critical Success";
      else if (diff >= 10) degree = "Great Success";
      else degree = "Success";
    } else {
      const diff = result - target;
      if (diff >= 20) degree = "Critical Failure";
      else if (diff >= 10) degree = "Great Failure";
      else degree = "Failure";
    }
    const message = `Rolling ${skill}: ${result} vs ${target} - ${degree}`;
    ChatMessage.create({ content: message, rolls: [roll] });
  }
}

class SystemItem extends Item {
  // Custom item logic if needed
}

/* -------------------------------------------- */
/*  Sheets                                     */
/* -------------------------------------------- */

const { api, sheets } = foundry.applications;

class CharacterSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheet) {
  static DEFAULT_OPTIONS = {
    classes: ["Deus-Ex-Ludus", "sheet", "actor"],
    position: {
      width: 800,
      height: 800
    },
    actions: {
      rollSkill: CharacterSheet.#rollSkill,
      attributeChange: CharacterSheet.#attributeChange,
      viewDoc: CharacterSheet.#viewDoc,
      createDoc: CharacterSheet.#createDoc,
      deleteDoc: CharacterSheet.#deleteDoc,
      editEffect: CharacterSheet.#editEffect,
      deleteEffect: CharacterSheet.#deleteEffect
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
      template: "templates/shared/effects.hbs",
      scrollable: [""]
    }
  };

  /** @inheritdoc */
  _initializeApplicationOptions(options) {
    const initialized = super._initializeApplicationOptions(options);
    initialized.classes.push(initialized.document.type);

    // Set PARTS and TABS based on actor type
    if (initialized.document.type === 'settlement') {
      initialized.parts = {
        header: {
          template: "templates/actor/header.hbs"
        },
        tabs: {
          template: "templates/generic/tab-navigation.hbs"
        },
        attributes: {
          template: "templates/actor/settlement-attributes.hbs",
          scrollable: [""]
        },
        notes: {
          template: "templates/actor/notes.hbs",
          scrollable: [""]
        },
        effects: {
          template: "templates/shared/effects.hbs",
          scrollable: [""]
        }
      };
      initialized.tabs = {
        primary: {
          tabs: [
            { id: "attributes" },
            { id: "notes" },
            { id: "effects" }
          ],
          initial: "attributes",
          labelPrefix: "DeusExLudus.Sheets.Tabs"
        }
      };
    }

    return initialized;
  }

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    Object.assign(context, {
      owner: this.document.isOwner,
      limited: this.document.limited,
      actor: this.actor,
      system: this.actor.system,
      flags: this.actor.flags,
      actorFields: this.actor.schema.fields,
      config: CONFIG,
      effects: prepareActiveEffectCategories(this.actor.effects),
      itemTypes: this._prepareItemTypes()
    });
    return context;
  }

  _prepareItemTypes() {
    const itemTypes = {};
    for (const item of this.actor.items) {
      const type = item.type;
      if (!itemTypes[type]) {
        itemTypes[type] = {
          label: CONFIG.Item.typeLabels?.[type] || type,
          items: []
        };
      }
      itemTypes[type].items.push(item);
    }
    return itemTypes;
  }

  /** @inheritdoc */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case "tabs":
        context.group = "primary";
        context.tabs = this.constructor.TABS.primary.tabs;
        context.labelPrefix = this.constructor.TABS.primary.labelPrefix;
        break;
      case "effects":
        context.effects = prepareActiveEffectCategories(this.actor.allApplicableEffects());
        context.tab = context.tabs[partId];
        break;
      case "items":
        context.itemTypes = this._prepareItemTypes();
        context.tab = context.tabs[partId];
        break;
    }
    return context;
  }

  static #rollSkill(event, app) {
    const skill = event.target.dataset.skill;
    app.document.rollSkill(skill);
  }

  static #attributeChange(event, app) {
    const attribute = event.target.dataset.attribute;
    const direction = event.target.dataset.direction;
    const currentValue = app.document.system.attributes[attribute].value;
    const newValue = direction === 'increase' ? currentValue + 1 : Math.max(0, currentValue - 1);
    app.document.update({ [`system.attributes.${attribute}.value`]: newValue });
  }

  static #viewDoc(event, app) {
    const itemId = event.target.closest('[data-item-id]').dataset.itemId;
    const item = app.document.items.get(itemId);
    item.sheet.render(true);
  }

  static #createDoc(event, app) {
    const type = event.target.dataset.type;
    app.document.createEmbeddedDocuments("Item", [{ type }]);
  }

  static #deleteDoc(event, app) {
    const itemId = event.target.closest('[data-item-id]').dataset.itemId;
    app.document.deleteEmbeddedDocuments("Item", [itemId]);
  }

  static #editEffect(event, app) {
    const effectId = event.target.closest('[data-effect-id]').dataset.effectId;
    const effect = app.document.effects.get(effectId);
    effect.sheet.render(true);
  }

  static #deleteEffect(event, app) {
    const effectId = event.target.closest('[data-effect-id]').dataset.effectId;
    app.document.deleteEmbeddedDocuments("ActiveEffect", [effectId]);
  }
}

class ItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheet) {
  static DEFAULT_OPTIONS = {
    classes: ["Deus-Ex-Ludus", "sheet", "item"],
    position: {
      width: 600,
      height: 400
    },
    form: {
      submitOnChange: true
    }
  };

  static PARTS = {
    header: {
      template: "templates/item/header.hbs"
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs"
    },
    description: {
      template: "templates/item/description.hbs",
      scrollable: [""]
    }
  };

  static TABS = {
    primary: {
      tabs: [
        { id: "description" }
      ],
      initial: "description",
      labelPrefix: "DeusExLudus.Item.Tabs"
    }
  };

  /** @inheritdoc */
  _initializeApplicationOptions(options) {
    const initialized = super._initializeApplicationOptions(options);
    initialized.classes.push(initialized.document.type);
    return initialized;
  }

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    Object.assign(context, {
      owner: this.document.isOwner,
      item: this.item,
      system: this.item.system,
      flags: this.item.flags,
      itemFields: this.item.schema.fields,
      config: CONFIG
    });
    return context;
  }

  /** @inheritdoc */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case "tabs":
        context.group = "primary";
        context.tabs = this.constructor.TABS.primary.tabs;
        context.labelPrefix = this.constructor.TABS.primary.labelPrefix;
        break;
    }
    return context;
  }
}

/* -------------------------------------------- */
/*  Initialization                             */
/* -------------------------------------------- */

const configActors = {
  character: CharacterDataModel,
  npc: NpcDataModel,
  settlement: SettlementDataModel
};

const configItems = {
  skill: SkillDataModel,
  gear: GearDataModel,
  relic: RelicDataModel
};

Hooks.once("init", () => {
  CONFIG.DEL = DEL;

  // Assign document classes
  CONFIG.Actor.documentClass = SystemActor;
  CONFIG.Item.documentClass = SystemItem;

  Object.assign(CONFIG.Actor.dataModels, configActors);
  Object.assign(CONFIG.Item.dataModels, configItems);

  CONFIG.Actor.defaultType = "character";

  CONFIG.Actor.typeLabels = {
    character: "Character",
    npc: "NPC",
    settlement: "Settlement"
  };

  CONFIG.Item.typeLabels = {
    skill: "Skill",
    gear: "Gear",
    relic: "Relic"
  };

  // Document Sheets
  foundry.documents.collections.Actors.registerSheet("Deus-Ex-Ludus", CharacterSheet, {
    makeDefault: true, label: "Deus Ex Ludus Sheet"
  });
  foundry.documents.collections.Items.registerSheet("Deus-Ex-Ludus", ItemSheet, {
    makeDefault: true, label: "Deus Ex Ludus Item Sheet"
  });
});

Hooks.once("i18nInit", () => {
  // Localizing if needed
});