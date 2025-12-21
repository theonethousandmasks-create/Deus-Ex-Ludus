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
    weapon: {
      "Deus-Ex-Ludus.WeaponSheet": WeaponSheet
    },
    armor: {
      "Deus-Ex-Ludus.ArmorSheet": ArmorSheet
    }
  };
});