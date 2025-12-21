import { SystemActor, SystemItem } from "./module/documents.mjs";
import { CharacterDataModel, NpcDataModel, SkillDataModel, WeaponDataModel, ArmorDataModel } from "./module/data-models.mjs";
import { CharacterSheet, NpcSheet, SkillSheet, WeaponSheet, ArmorSheet } from "./module/sheets.mjs";

Hooks.once("init", () => {
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
    weapon: WeaponDataModel,
    armor: ArmorDataModel
  };

  // Configure trackable attributes.
  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["attributes.health"],
      value: []
    },
    npc: {
      bar: ["attributes.health"],
      value: []
    }
  };

  // Register sheet classes.
  CONFIG.Actor.sheetClasses = {
    character: {
      "deus-ex-ludus.CharacterSheet": CharacterSheet
    },
    npc: {
      "deus-ex-ludus.NpcSheet": NpcSheet
    }
  };
  CONFIG.Item.sheetClasses = {
    skill: {
      "deus-ex-ludus.SkillSheet": SkillSheet
    },
    weapon: {
      "deus-ex-ludus.WeaponSheet": WeaponSheet
    },
    armor: {
      "deus-ex-ludus.ArmorSheet": ArmorSheet
    }
  };
});