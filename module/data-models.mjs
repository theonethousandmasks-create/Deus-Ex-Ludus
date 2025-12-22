const { NumberField, SchemaField, StringField, TypeDataModel } = foundry.data.fields;

/* -------------------------------------------- */
/*  Actor Models                                */
/* -------------------------------------------- */

class ActorDataModel extends TypeDataModel {
  static defineSchema() {
    return {
      health: new SchemaField({
        value: new NumberField({ required: true, integer: true, min: 0, initial: 15 }),
        min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        max: new NumberField({ required: true, integer: true, min: 0, initial: 300 })
      }),
      power: new SchemaField({
        value: new NumberField({ required: true, integer: true, min: 0, initial: 5 }),
        min: new NumberField({ required: true, integer: true, min: 0, initial: 0 }),
        max: new NumberField({ required: true, integer: true, min: 0, initial: 150 })
      }),
      biography: new StringField({ required: true, blank: true })
    };
  }
}

export class CharacterDataModel extends ActorDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      attributes: new SchemaField({
        level: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 1, initial: 1 })
        })
      }),
      abilities: new SchemaField({
        str: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 15 })
        }),
        agi: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 15 })
        }),
        tgh: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 15 })
        }),
        wis: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 15 })
        }),
        int: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 15 })
        }),
        pre: new SchemaField({
          value: new NumberField({ required: true, integer: true, min: 0, initial: 15 })
        })
      })
    };
  }
}

export class DeityDataModel extends ActorDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      level: new NumberField({ required: true, integer: true, min: 1, initial: 1 })
    };
  }
}

/* -------------------------------------------- */
/*  Item Models                                 */
/* -------------------------------------------- */

class BaseItemDataModel extends TypeDataModel {
  static defineSchema() {
    return {
      description: new StringField({ required: true, blank: true })
    };
  }
}

export class ItemDataModel extends BaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      quantity: new NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      weight: new NumberField({ required: true, min: 0, initial: 0 }),
      formula: new StringField({ required: true, blank: true, initial: "1d10 + 5 + @str.mod" })
    };
  }
}

export class TraitDataModel extends BaseItemDataModel {
  // No additional fields
}

export class ForceMajeureDataModel extends BaseItemDataModel {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      forceMajeureLevel: new NumberField({ required: true, integer: true, min: 1, initial: 1 })
    };
  }
}

export class RelicDataModel extends BaseItemDataModel {
  // No additional fields
}

export class ResourceDataModel extends BaseItemDataModel {
  // No additional fields
}