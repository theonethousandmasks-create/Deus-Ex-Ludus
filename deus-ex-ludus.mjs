import { SystemActor, SystemItem } from "./module/documents.mjs";
import { CharacterDataModel, NpcDataModel, DeityDataModel, ItemDataModel, TraitDataModel, ForceMajeureDataModel, RelicDataModel, ResourceDataModel } from "./module/data-models.mjs";
import { CharacterSheet, NpcSheet, TraitSheet, ItemSheet, ForceMajeureSheet, RelicSheet, ResourceSheet } from "./module/sheets.mjs";

Hooks.once("init", () => {
  // Configure custom Document implementations.
  CONFIG.Actor.documentClass = SystemActor;
  CONFIG.Item.documentClass = SystemItem;

  // Configure System Data Models.
  CONFIG.Actor.dataModels = {
    character: CharacterDataModel,
    npc: NpcDataModel,
    Deity: DeityDataModel
  };
  CONFIG.Item.dataModels = {
    item: ItemDataModel,
    Trait: TraitDataModel,
    ForceMajeure: ForceMajeureDataModel,
    Relic: RelicDataModel,
    Resource: ResourceDataModel
  };

  // Configure trackable attributes.
  CONFIG.Actor.trackableAttributes = {
    character: {
      bar: ["health"],
      value: []
    },
    npc: {
      bar: ["health"],
      value: []
    },
    Deity: {
      bar: ["health"],
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
    },
    Deity: {
      "Deus-Ex-Ludus.NpcSheet": NpcSheet
    }
  };
  CONFIG.Item.sheetClasses = {
    item: {
      "Deus-Ex-Ludus.ItemSheet": ItemSheet
    },
    Trait: {
      "Deus-Ex-Ludus.TraitSheet": TraitSheet
    },
    ForceMajeure: {
      "Deus-Ex-Ludus.ForceMajeureSheet": ForceMajeureSheet
    },
    Relic: {
      "Deus-Ex-Ludus.RelicSheet": RelicSheet
    },
    Resource: {
      "Deus-Ex-Ludus.ResourceSheet": ResourceSheet
    }
  };
});