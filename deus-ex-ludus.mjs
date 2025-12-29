import { SystemActor, SystemItem } from "./module/documents.mjs";
import { CharacterDataModel, NpcDataModel, DeityDataModel, ItemDataModel, TraitDataModel, ForceMajeureDataModel, RelicDataModel, ResourceDataModel } from "./module/data-models.mjs";
import { CharacterSheet, NpcSheet, TraitSheet, DeusExLudusItemSheet, ForceMajeureSheet, RelicSheet, ResourceSheet } from "./module/sheets.mjs";

Hooks.once("init", () => {
  console.log("Deus Ex Ludus | Initializing system");

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

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("Deus-Ex-Ludus", CharacterSheet, {
    types: ["character"],
    makeDefault: true,
    label: "Character Sheet"
  });
  Actors.registerSheet("Deus-Ex-Ludus", NpcSheet, {
    types: ["npc", "Deity"],
    makeDefault: true,
    label: "NPC Sheet"
  });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("Deus-Ex-Ludus", DeusExLudusItemSheet, {
    types: ["item"],
    makeDefault: true,
    label: "Item Sheet"
  });
  Items.registerSheet("Deus-Ex-Ludus", TraitSheet, {
    types: ["Trait"],
    makeDefault: true,
    label: "Trait Sheet"
  });
  Items.registerSheet("Deus-Ex-Ludus", ForceMajeureSheet, {
    types: ["ForceMajeure"],
    makeDefault: true,
    label: "Force Majeure Sheet"
  });
  Items.registerSheet("Deus-Ex-Ludus", RelicSheet, {
    types: ["Relic"],
    makeDefault: true,
    label: "Relic Sheet"
  });
  Items.registerSheet("Deus-Ex-Ludus", ResourceSheet, {
    types: ["Resource"],
    makeDefault: true,
    label: "Resource Sheet"
  });

  console.log("Deus Ex Ludus | System initialized");
});
