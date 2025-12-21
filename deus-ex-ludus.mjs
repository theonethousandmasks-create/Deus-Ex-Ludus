import { SystemActor, SystemItem } from "./module/documents.mjs";
import { CharacterDataModel, NpcDataModel, SkillDataModel, GearDataModel, ArmorDataModel, RelicDataModel } from "./module/data-models.mjs";
import { CharacterSheet, NpcSheet, SkillSheet, GearSheet, ArmorSheet, RelicSheet } from "./module/sheets.mjs";

Hooks.once("init", () => {
  // Register Handlebars helpers
  Handlebars.registerHelper('eq', (a, b) => a === b);

  // Configure custom Document implementations.
  CONFIG.Actor.documentClass = SystemActor;
  CONFIG.Item.documentClass = SystemItem;

  // Configure System Data Models.
  CONFIG.Actor.dataModels = {
    character: CharacterDataModel,
    npc: NpcDataModel
  };
  CONFIG.Item.dataModels = {
    skill: SkillDataModel,
    gear: GearDataModel,
    armor: ArmorDataModel,
    relic: RelicDataModel
  };

  // Configure trackable attributes.
  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["attributes.health", "attributes.faith"],
      value: []
    },
    npc: {
      bar: ["attributes.health", "attributes.faith"],
      value: []
    }
  };

  // Register sheet classes.
  CONFIG.Actor.sheetClasses = {
    character: {
      "Deus-Ex-Ludus.CharacterSheet": CharacterSheet
    },
    npc: {
      "Deus-Ex-Ludus.NpcSheet": NpcSheet
    }
  };
  CONFIG.Item.sheetClasses = {
    skill: {
      "Deus-Ex-Ludus.SkillSheet": SkillSheet
    },
    gear: {
      "Deus-Ex-Ludus.GearSheet": GearSheet
    },
    armor: {
      "Deus-Ex-Ludus.ArmorSheet": ArmorSheet
    },
    relic: {
      "Deus-Ex-Ludus.RelicSheet": RelicSheet
    }
  };
});