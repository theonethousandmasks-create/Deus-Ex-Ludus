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

export class CharacterDataModel extends ActorDataModel {
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

export class NpcDataModel extends ActorDataModel {
  // For now, same as character
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

export class SkillDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      tn: new NumberField({ required: true, integer: true, min: 0, initial: 50 })
    };
  }
}

export class WeaponDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      damage: new NumberField({ required: true, integer: true, min: 0, initial: 5 })
    };
  }
}

export class ArmorDataModel extends ItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      defense: new NumberField({ required: true, integer: true, min: 0, initial: 2 })
    };
  }
}

export class RelicDataModel extends ItemDataModel {
  // For now, same as base item, just description
}

export class SettlementDataModel extends ActorDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      population: new NumberField({ required: true, integer: true, min: 0, initial: 100 }),
      resources: new NumberField({ required: true, integer: true, min: 0, initial: 50 })
    };
  }
}