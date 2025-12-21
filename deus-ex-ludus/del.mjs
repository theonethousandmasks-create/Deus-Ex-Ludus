const DEL = {};

// Data Models
class CharacterModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attributes: new foundry.data.fields.SchemaField({
        str: new foundry.data.fields.SchemaField({
          value: new foundry.data.fields.NumberField({ integer: true, min: 1, max: 100, initial: 50 })
        }),
        dex: new foundry.data.fields.SchemaField({
          value: new foundry.data.fields.NumberField({ integer: true, min: 1, max: 100, initial: 50 })
        }),
        con: new foundry.data.fields.SchemaField({
          value: new foundry.data.fields.NumberField({ integer: true, min: 1, max: 100, initial: 50 })
        }),
        int: new foundry.data.fields.SchemaField({
          value: new foundry.data.fields.NumberField({ integer: true, min: 1, max: 100, initial: 50 })
        }),
        wis: new foundry.data.fields.SchemaField({
          value: new foundry.data.fields.NumberField({ integer: true, min: 1, max: 100, initial: 50 })
        }),
        cha: new foundry.data.fields.SchemaField({
          value: new foundry.data.fields.NumberField({ integer: true, min: 1, max: 100, initial: 50 })
        })
      }),
      hp: new foundry.data.fields.SchemaField({
        value: new foundry.data.fields.NumberField({ integer: true, min: 0, initial: 10 }),
        max: new foundry.data.fields.NumberField({ integer: true, min: 0, initial: 10 })
      })
    };
  }
}

class NpcModel extends CharacterModel {
  // Inherits from CharacterModel
}

class SkillModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      attribute: new foundry.data.fields.StringField({
        choices: ["str", "dex", "con", "int", "wis", "cha"],
        initial: "str"
      }),
      bonus: new foundry.data.fields.NumberField({ integer: true, min: 0, initial: 0 })
    };
  }
}

class AttributeModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      value: new foundry.data.fields.NumberField({ integer: true, min: 1, max: 100, initial: 50 })
    };
  }
}

class GearModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new foundry.data.fields.StringField(),
      weight: new foundry.data.fields.NumberField({ min: 0, initial: 0 })
    };
  }
}

// Roll function
DEL.rollSkill = async function(actor, skillId) {
  const skill = actor.items.get(skillId);
  if (!skill || skill.type !== "skill") return;

  const attr = skill.system.attribute;
  const tn = actor.system.attributes[attr].value + skill.system.bonus;
  const roll = await new Roll("1d100").evaluate();
  const result = roll.total;
  let degrees = 0;
  let success = false;
  if (result <= tn) {
    success = true;
    degrees = Math.floor((tn - result) / 10) + 1;
  } else {
    degrees = Math.floor((result - tn) / 10) + 1;
  }

  const messageData = {
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `${skill.name} check`,
    content: `
      <div class="del-roll">
        <div>Rolled: ${result}</div>
        <div>Target: ${tn}</div>
        <div>${success ? "Success" : "Failure"} with ${degrees} degree${degrees > 1 ? "s" : ""}</div>
      </div>
    `
  };
  ChatMessage.create(messageData);
};

// Sheets
class DELActorSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ActorSheet) {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["del", "sheet", "actor"],
      template: "templates/actor-sheet.hbs",
      width: 600,
      height: 600,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  get template() {
    return `systems/deus-ex-ludus/templates/actor-sheet.hbs`;
  }

  async getData() {
    const data = await super.getData();
    data.system = this.document.system;
    data.items = this.document.items;
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".roll-skill").click((event) => {
      const skillId = event.currentTarget.dataset.skillId;
      DEL.rollSkill(this.document, skillId);
    });
  }
}

class DELItemSheet extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.sheets.ItemSheet) {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["del", "sheet", "item"],
      template: "templates/item-sheet.hbs",
      width: 400,
      height: 400,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "properties" }]
    });
  }

  get template() {
    return `systems/deus-ex-ludus/templates/item-sheet.hbs`;
  }

  async getData() {
    const data = await super.getData();
    data.system = this.document.system;
    return data;
  }
}

// Hooks
Hooks.once("init", () => {
  CONFIG.DEL = DEL;

  // Data Models
  CONFIG.Actor.dataModels.character = CharacterModel;
  CONFIG.Actor.dataModels.npc = NpcModel;
  CONFIG.Item.dataModels.skill = SkillModel;
  CONFIG.Item.dataModels.attribute = AttributeModel;
  CONFIG.Item.dataModels.gear = GearModel;

  // Sheets
  Actors.registerSheet("del", DELActorSheet, { makeDefault: true, label: "DEL.Sheets.ActorSheet" });
  Items.registerSheet("del", DELItemSheet, { makeDefault: true, label: "DEL.Sheets.ItemSheet" });
});