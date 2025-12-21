const UTS = {};

UTS.chess = {
  pieces: {
    pawn: {
      label: "UTS.Chess.Pieces.P",
      abbr: "P",
      value: 1
    },
    knight: {
      label: "UTS.Chess.Pieces.K",
      abbr: "N",
      value: 3
    },
    bishop: {
      label: "UTS.Chess.Pieces.B",
      abbr: "B",
      value: 3
    },
    rook: {
      label: "UTS.Chess.Pieces.R",
      abbr: "R",
      value: 5
    },
    queen: {
      label: "UTS.Chess.Pieces.Q",
      abbr: "Q",
      value: 9
    },
    king: {
      label: "UTS.Chess.Pieces.K",
      abbr: "K",
      value: Infinity
    }
  }
};

const systemID = "universal-tabletop-system";

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
    // const type = foundry.utils.getType(value)
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
      label: game.i18n.localize("UTS.Effect.Temporary"),
      effects: []
    },
    passive: {
      type: "passive",
      label: game.i18n.localize("UTS.Effect.Passive"),
      effects: []
    },
    inactive: {
      type: "inactive",
      label: game.i18n.localize("UTS.Effect.Inactive"),
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

const {api: api$1, sheets: sheets$1} = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
class UTSActorSheet extends api$1.HandlebarsApplicationMixin(sheets$1.ActorSheet) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["uts", "actor", "standard-form"],
    position: {
      width: 600,
      height: 600
    },
    actions: {
      viewDoc: this.#viewDoc,
      createDoc: this.#createDoc,
      deleteDoc: this.#deleteDoc,
      toggleEffect: this.#toggleEffect
    },
    form: {
      submitOnChange: true
    }
  };

  /* -------------------------------------------------- */

  static TABS = {
    primary: {
      tabs: [
        {
          id: "properties"
        },
        {
          id: "items"
        },
        {
          id: "effects"
        }
      ],
      initial: "properties",
      labelPrefix: "UTS.Sheets.Tabs"
    }
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static PARTS = {
    header: {
      template: systemPath("templates/actor/header.hbs")
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs"
    },
    properties: {
      template: systemPath("templates/shared/properties.hbs"),
      scrollable: [""]
    },
    items: {
      template: systemPath("templates/actor/items.hbs"),
      scrollable: [""]
    },
    effects: {
      template: systemPath("templates/shared/effects.hbs"),
      scrollable: [""]
    }
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  _initializeApplicationOptions(options) {
    const initialized = super._initializeApplicationOptions(options);

    initialized.classes.push(initialized.document.type);

    return initialized;
  }

  /* -------------------------------------------------- */

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
      config: CONFIG
    });

    return context;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case "effects":
        context.effects = prepareActiveEffectCategories(this.actor.allApplicableEffects());
        context.tab = context.tabs[partId];
        break;
      case "properties":
        context.fields = await this._getFields();
        context.tab = context.tabs[partId];
        break;
      case "items":
        context.itemTypes = this._getItems();
        context.tab = context.tabs[partId];
        break;
    }
    return context;
  }

  /* -------------------------------------------------- */

  /**
   * Handles the system fields for the form-fields generic
   * @returns {object[]}
   */
  async _getFields() {
    const doc = this.actor;
    const source = doc._source;
    const systemFields = CONFIG.Actor.dataModels[doc.type]?.schema.fields;
    const fieldSets = [];
    // TODO: Find a clever way to handle enrichment
    for (const field of Object.values(systemFields ?? {})) {
      const path = `system.${field.name}`;
      if (field instanceof foundry.data.fields.SchemaField) {
        const fieldset = {fieldset: true, legend: field.label, fields: []};
        await this.#addSystemFields(fieldset, field.fields, source, path);
        fieldSets.push(fieldset);
      } else {
        fieldSets.push({outer: {field, value: foundry.utils.getProperty(source, path)}});
      }
    }
    return fieldSets;
  }

  /* -------------------------------------------------- */

  /**
   * Recursively add system model fields to the fieldset.
   */
  async #addSystemFields(fieldset, schema, source, _path = "system") {
    for (const field of Object.values(schema)) {
      const path = `${_path}.${field.name}`;
      if (field instanceof foundry.data.fields.SchemaField) {
        this.#addSystemFields(fieldset, field.fields, source, path);
      } else if (field.constructor.hasFormSupport) {
        fieldset.fields.push({field, value: foundry.utils.getProperty(source, path)});
      }
    }
  }

  /* -------------------------------------------------- */

  /**
   * Adapted from Actor#itemTypes
   */
  _getItems() {
    const types = Object.fromEntries(game.documentTypes.Item.map((t) => {
      return [t, {label: game.i18n.localize(CONFIG.Item.typeLabels[t]), items: []}];
    }));
    for (const item of this.actor.items) {
      types[item.type].items.push(item);
    }
    // Only show Base if it's actually being used
    if (types.base.items.length === 0) delete types.base;
    return types;
  }

  /* -------------------------------------------------- */

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   * @inheritdoc
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.#disableOverrides();
  }

  /* -------------------------------------------------- */
  /*   Event handlers                                   */
  /* -------------------------------------------------- */

  /**
   * Renders an embedded document's sheet
   *
   * @this UTSActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #viewDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    doc.sheet.render(true);
  }

  /* -------------------------------------------------- */

  /**
   * Handles item deletion
   *
   * @this UTSActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #deleteDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    doc.delete();
  }

  /* -------------------------------------------------- */

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this UTSActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async #createDoc(event, target) {
    const docCls = getDocumentClass(target.dataset.documentClass);
    const docData = {
      name: docCls.defaultName({
        type: target.dataset.type,
        parent: this.actor
      })
    };
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      if (["action", "documentClass"].includes(dataKey)) continue;
      foundry.utils.setProperty(docData, dataKey, value);
    }
    docCls.create(docData, {parent: this.actor});
  }

  /* -------------------------------------------------- */

  /**
   * Determines effect parent to pass to helper
   *
   * @this UTSActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async #toggleEffect(event, target) {
    const effect = this._getEmbeddedDocument(target);
    effect.update({disabled: !effect.disabled});
  }

  /* -------------------------------------------------- */
  /*   Helper functions                                 */
  /* -------------------------------------------------- */

  /**
   * Fetches the embedded document representing the containing HTML element
   *
   * @param {HTMLElement} target      The element subject to search
   * @returns {Item|ActiveEffect}     The embedded Item or ActiveEffect
   */
  _getEmbeddedDocument(target) {
    const docRow = target.closest("li[data-document-class]");
    if (docRow.dataset.documentClass === "Item") {
      return this.actor.items.get(docRow.dataset.itemId);
    } else if (docRow.dataset.documentClass === "ActiveEffect") {
      const parent = docRow.dataset.parentId === this.actor.id ?
        this.actor :
        this.actor.items.get(docRow?.dataset.parentId);
      return parent.effects.get(docRow.dataset.effectId);
    } else {
      console.warn("Could not find document class");
    }
  }

  /* -------------------------------------------------- */
  /*   Actor override handling                          */
  /* -------------------------------------------------- */

  /**
   * Submit a document update based on the processed form data.
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {object} submitData                   Processed and validated form data to be used for a document update
   * @returns {Promise<void>}
   * @protected
   * @inheritdoc
   */
  async _processSubmitData(event, form, submitData) {
    const overrides = foundry.utils.flattenObject(this.actor.overrides);
    for (const k of Object.keys(overrides)) delete submitData[k];
    this.document.update(submitData);
  }

  /* -------------------------------------------------- */

  /**
   * Disables inputs subject to active effects
   */
  #disableOverrides() {
    const flatOverrides = foundry.utils.flattenObject(this.actor.overrides);
    for (const override of Object.keys(flatOverrides)) {
      const input = this.element.querySelector(`[name="${override}"]`);
      if (input) input.disabled = true;
    }
  }
}

class UTSCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  /** @inheritdoc */
  _getCombatContextOptions() {
    const options = super._getCombatContextOptions();
    options.unshift({
      name: "UTS.Combat.AddPlayer",
      icon: "<i class=\"fa-solid fa-user\"></i>",
      condition: () => game.user.isGM,
      callback: () => this.viewed.addPlayer()
    });
    return options;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _onCombatCreate(event, target) {
    if (Combat.TYPES.length > 1) {
      const combat = await getDocumentClass("Combat").createDialog();
      if (combat) combat.activate({render: false});
    }
    else super._onCombatCreate(event, target);
  }
}

/** @import CombatantConfig from "@client/applications/sheets/combatant-config.mjs" */
/** @import UTSCombatant from "../../documents/UTSCombatant.mjs" */

/**
 *
 * @param {CombatantConfig} app
 * @param {HTMLDivElement[]} jquery
 * @param {object} context
 */
function renderCombatantConfig(app, [html], context) {
  /** @type {UTSCombatant} */
  const combatant = app.document;
  if (combatant.type === "player") {
    const form = html.querySelector("form");
    const userGroup = combatant.system.schema.getField("user").toFormGroup({}, {value: combatant.system.user.id});
    form.prepend(userGroup);
    app.setPosition({height: app.position.height + 30});
  }
}

const {api, sheets} = foundry.applications;

/**
 * Extend the basic ItemSheet with some very simple modifications
 */
class UTSItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheet) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    position: {
      width: 600
    },
    classes: ["uts", "item", "standard-form"],
    actions: {
      viewDoc: this.#viewEffect,
      createDoc: this.#createEffect,
      deleteDoc: this.#deleteEffect,
      toggleEffect: this.#toggleEffect
    },
    form: {
      submitOnChange: true
    },
    // Custom property that's merged into `this.options`
    dragDrop: [{dragSelector: ".draggable", dropSelector: null}]
  };

  /* -------------------------------------------------- */

  static TABS = {
    primary: {
      tabs: [
        {
          id: "properties"
        },
        {
          id: "effects"
        }
      ],
      initial: "properties",
      labelPrefix: "UTS.Sheets.Tabs"
    }
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static PARTS = {
    header: {
      template: systemPath("templates/item/header.hbs")
    },
    tabs: {
      // Foundry-provided generic template
      template: "templates/generic/tab-navigation.hbs"
    },
    properties: {
      template: systemPath("templates/shared/properties.hbs"),
      scrollable: [""]
    },
    effects: {
      template: systemPath("templates/shared/effects.hbs"),
      scrollable: [""]
    }
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  _initializeApplicationOptions(options) {
    const initialized = super._initializeApplicationOptions(options);

    initialized.classes.push(initialized.document.type);

    return initialized;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    Object.assign(context, {
      owner: this.document.isOwner,
      limited: this.document.limited,
      item: this.item,
      actor: this.actor,
      system: this.item.system,
      flags: this.item.flags,
      itemFields: this.item.schema.fields,
      config: CONFIG
    });

    return context;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _preparePartContext(partId, context) {
    // TODO: Come up with clever way to automatically handle enriching HTML fields
    switch (partId) {
      case "effects":
        context.effects = prepareActiveEffectCategories(this.item.effects);
        context.tab = context.tabs[partId];
        break;
      case "properties":
        context.fields = await this._getFields();
        context.tab = context.tabs[partId];
        break;
    }
    return context;
  }

  /* -------------------------------------------------- */

  /**
   * Handles the system fields for the form-fields generic
   */
  async _getFields() {
    const doc = this.item;
    const source = doc._source;
    const systemFields = CONFIG.Item.dataModels[doc.type]?.schema.fields;
    const fieldSets = [];
    // TODO: Find a clever way to handle enrichment
    for (const field of Object.values(systemFields ?? {})) {
      const path = `system.${field.name}`;
      if (field instanceof foundry.data.fields.SchemaField) {
        const fieldset = {fieldset: true, legend: field.label, fields: []};
        await this.#addSystemFields(fieldset, field.fields, source, path);
        fieldSets.push(fieldset);
      } else {
        fieldSets.push({outer: {field, value: foundry.utils.getProperty(source, path)}});
      }
    }
    return fieldSets;
  }

  /* -------------------------------------------------- */

  /**
   * Recursively add system model fields to the fieldset.
   */
  async #addSystemFields(fieldset, schema, source, _path = "system") {
    for (const field of Object.values(schema)) {
      const path = `${_path}.${field.name}`;
      if (field instanceof foundry.data.fields.SchemaField) {
        this.#addSystemFields(fieldset, field.fields, source, path);
      } else if (field.constructor.hasFormSupport) {
        fieldset.fields.push({field, value: foundry.utils.getProperty(source, path)});
      }
    }
  }

  /* -------------------------------------------------- */

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
  }

  /* -------------------------------------------------- */
  /*   Event handlers                                   */
  /* -------------------------------------------------- */

  /**
   * Renders an embedded document's sheet
   *
   * @this UTSItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #viewEffect(event, target) {
    const effect = this._getEffect(target);
    effect.sheet.render(true);
  }

  /* -------------------------------------------------- */

  /**
   * Handles item deletion
   *
   * @this UTSItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #deleteEffect(event, target) {
    const effect = this._getEffect(target);
    effect.delete();
  }

  /* -------------------------------------------------- */

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this UTSItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async #createEffect(event, target) {
    const aeCls = getDocumentClass("ActiveEffect");
    const effectData = {
      name: aeCls.defaultName({
        type: target.dataset.type,
        parent: this.item
      })
    };
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      if (["action", "documentClass"].includes(dataKey)) continue;
      foundry.utils.setProperty(effectData, dataKey, value);
    }

    aeCls.create(effectData, {parent: this.item});
  }

  /* -------------------------------------------------- */

  /**
   * Determines effect parent to pass to helper
   *
   * @this UTSItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async #toggleEffect(event, target) {
    const effect = this._getEffect(target);
    effect.update({disabled: !effect.disabled});
  }

  /* -------------------------------------------------- */
  /*   Helper functions                                 */
  /* -------------------------------------------------- */

  /**
   * Fetches the row with the data for the rendered embedded document
   *
   * @param {HTMLElement} target  The element with the action
   * @returns {HTMLLIElement} The document's row
   */
  _getEffect(target) {
    const li = target.closest(".effect");
    return this.item.effects.get(li?.dataset?.effectId);
  }

  /* -------------------------------------------------- */
  /*   Drag and drop                                    */
  /* -------------------------------------------------- */

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    return this.isEditable;
  }

  /* -------------------------------------------------- */

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    return this.isEditable;
  }

  /* -------------------------------------------------- */

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ("link" in event.target.dataset) return;

    let dragData = null;

    if (li.dataset.effectId) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if (!dragData) return;

    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  /* -------------------------------------------------- */

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) {}

  /* -------------------------------------------------- */

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    const item = this.item;
    const allowed = Hooks.call("dropItemSheetData", item, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case "ActiveEffect":
        return this._onDropActiveEffect(event, data);
      case "Actor":
        return this._onDropActor(event, data);
      case "Item":
        return this._onDropItem(event, data);
      case "Folder":
        return this._onDropFolder(event, data);
    }
  }

  /* -------------------------------------------------- */

  /**
   * Handle the dropping of ActiveEffect data onto an Actor Sheet
   * @param {DragEvent} event                  The concluding DragEvent which contains drop data
   * @param {object} data                      The data transfer extracted from the event
   * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
   * @protected
   */
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass("ActiveEffect");
    const effect = await aeCls.fromDropData(data);
    if (!this.item.isOwner || !effect) return false;

    if (this.item.uuid === effect.parent?.uuid) return this._onEffectSort(event, effect);
    aeCls.create(effect, {parent: this.item});
  }

  /* -------------------------------------------------- */

  /**
   * Sorts an Active Effect based on its surrounding attributes
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  _onEffectSort(event, effect) {
    const effects = this.item.effects;
    const dropTarget = event.target.closest("[data-effect-id]");
    if (!dropTarget) return;
    const target = effects.get(dropTarget.dataset.effectId);

    // Don't sort on yourself
    if (effect.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      if (siblingId && (siblingId !== effect.id)) siblings.push(effects.get(el.dataset.effectId));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(effect, {
      target,
      siblings
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    this.item.updateEmbeddedDocuments("ActiveEffect", updateData);
  }

  /* -------------------------------------------------- */

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.item.isOwner) return false;
  }

  /* -------------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    if (!this.item.isOwner) return false;
  }

  /* -------------------------------------------------- */

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @returns {Promise<Item[]>}
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.item.isOwner) return [];
  }

  /* -------------------------------------------------- */
  /*   The following pieces set up drag                 */
  /*   handling and are unlikely to need modification   */
  /* -------------------------------------------------- */

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop = this.#createDragDropHandlers();

  /**
   * Returns an array of DragDrop instances
   * @type {DragDrop[]}
   */
  get dragDrop() {
    return this.#dragDrop;
  }

  /* -------------------------------------------------- */

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this)
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this)
      };
      return new foundry.applications.ux.DragDrop(d);
    });
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class UTSActiveEffect extends foundry.documents.ActiveEffect {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {UTSActiveEffect} effect      The effect preparing derived data.
     */
    Hooks.callAll("UTS.prepareActiveEffectData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class UTSActor extends foundry.documents.Actor {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {UTSActor} actor      The actor preparing derived data.
     */
    Hooks.callAll("UTS.prepareActorData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class UTSCard extends foundry.documents.Card {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {UTSCard} card      The card preparing derived data.
     */
    Hooks.callAll("UTS.prepareCardData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class UTSCards extends foundry.documents.Cards {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {UTSCards} cards      The cards preparing derived data.
     */
    Hooks.callAll("UTS.prepareCardsData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class UTSChatMessage extends foundry.documents.ChatMessage {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {UTSChatMessage} message      The chat message preparing derived data.
     */
    Hooks.callAll("UTS.prepareChatMessageData", this);
  }
}

/**
 * A "turns belong to users rather than tokens" variant of combatant
 */
class Player extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["UTS.Combat.player"];

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    return {
      user: new foundry.data.fields.ForeignDocumentField(foundry.documents.User)
    };
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class UTSCombat extends foundry.documents.Combat {
  /** @inheritdoc */
  prepareDerivedData() {

    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {UTSCombat} combat      The combat preparing derived data.
     */
    Hooks.callAll("UTS.prepareCombatData", this);
  }

  /* -------------------------------------------------- */

  /**
   * Adds a player combatant to the current combat
   * @returns {Promise<import("./UTSCombatant.mjs").default>} The created Combatant
   */
  async addPlayer() {
    const data = {
      type: "player",
      system: {}
    };
    const fdObject = await foundry.applications.api.DialogV2.input({
      window: {title: "UTS.Combat.AddPlayerCombatTracker"},
      content: Player.schema.getField("user").toFormGroup().outerHTML
    });
    foundry.utils.mergeObject(data, fdObject);
    const user = game.users.get(data.system.user);
    if (!user) return;
    data.name = user.name;
    data.img = user.avatar;
    const created = await this.createEmbeddedDocuments("Combatant", [data]);
    return created.shift();
  }

  /* -------------------------------------------------- */

  /**
   * @remarks Variant createDialog that includes the Base type
   * @inheritdoc
   * @param {import("@common/types.mjs").CombatData} data
   * @param {import("@common/abstract/_types.mjs").DatabaseCreateOperation} createOptions
   * @param {context} context Options forwarded to DialogV2.prompt
   * @param {string[]} [context.types]   A restriction of the selectable sub-types of the Dialog.
   * @param {string} [context.template]  A template to use for the dialog contents instead of the default.
   * @returns {Promise<UTSCombat|null>}   A Promise which resolves to the created Document, or null if the dialog was
    *                                     closed.
   */
  static async createDialog(data = {}, createOptions = {}, {types, template, ...dialogOptions} = {}) {
    const applicationOptions = {
      top: "position", left: "position", width: "position", height: "position", scale: "position", zIndex: "position",
      title: "window", id: "", classes: "", jQuery: ""
    };

    for (const [k, v] of Object.entries(createOptions)) {
      if (k in applicationOptions) {
        foundry.utils.logCompatibilityWarning("The ClientDocument.createDialog signature has changed. "
          + "It now accepts database operation options in its second parameter, "
          + "and options for DialogV2.prompt in its third parameter.", {since: 13, until: 15, once: true});
        const dialogOption = applicationOptions[k];
        if (dialogOption) foundry.utils.setProperty(dialogOptions, `${dialogOption}.${k}`, v);
        else dialogOptions[k] = v;
        delete createOptions[k];
      }
    }

    const {parent, pack} = createOptions;
    const cls = this.implementation;

    // Identify allowed types
    const documentTypes = [];
    let defaultType = CONFIG[this.documentName]?.defaultType;
    let defaultTypeAllowed = false;
    let hasTypes = false;
    if (types?.length === 0) throw new Error("The array of sub-types to restrict to must not be empty");

    // Register supported types
    for (const type of this.TYPES) {
      if (types && !types.includes(type)) continue;
      let label = CONFIG[this.documentName]?.typeLabels?.[type];
      label = label && game.i18n.has(label) ? game.i18n.localize(label) : type;
      documentTypes.push({value: type, label});
      if (type === defaultType) defaultTypeAllowed = true;
    }
    if (!documentTypes.length) throw new Error("No document types were permitted to be created");

    if (!defaultTypeAllowed) defaultType = documentTypes[0].value;
    // Sort alphabetically
    documentTypes.sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));

    // Collect data
    const label = game.i18n.localize(this.metadata.label);
    const title = game.i18n.format("DOCUMENT.Create", {type: label});
    const type = data.type || defaultType;

    // Render the document creation form
    template ??= systemPath("templates/combat/create-dialog.hbs");
    const html = await renderTemplate(template, {
      hasTypes, type,
      name: data.name || "",
      defaultName: cls.defaultName({type, parent, pack}),
      hasFolders: false,
      types: documentTypes
    });

    // Render the confirmation dialog window
    return foundry.applications.api.DialogV2.prompt(foundry.utils.mergeObject({
      content: html,
      window: {title},
      position: {width: 360},
      ok: {
        label: title,
        callback: (event, button) => {
          const fd = new foundry.applications.ux.FormDataExtended(button.form);
          foundry.utils.mergeObject(data, fd.object);
          if (!data.name?.trim()) data.name = cls.defaultName({type: data.type, parent, pack});
          return cls.create(data, {renderSheet: false, ...createOptions});
        }
      }
    }, dialogOptions));
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class UTSCombatant extends foundry.documents.Combatant {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {UTSCombatant} combatant      The combatant preparing derived data.
     */
    Hooks.callAll("UTS.prepareCombatantData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class UTSItem extends foundry.documents.Item {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {UTSItem} item      The item preparing derived data.
     */
    Hooks.callAll("UTS.prepareItemData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class UTSScene extends foundry.documents.Scene {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {UTSScene} scene      The scene preparing derived data.
     */
    Hooks.callAll("UTS.prepareSceneData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class UTSUser extends foundry.documents.User {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {UTSUser} user      The user preparing derived data.
     */
    Hooks.callAll("UTS.prepareUserData", this);
  }
}

var documents = /*#__PURE__*/Object.freeze({
  __proto__: null,
  UTSActiveEffect: UTSActiveEffect,
  UTSActor: UTSActor,
  UTSCard: UTSCard,
  UTSCards: UTSCards,
  UTSChatMessage: UTSChatMessage,
  UTSCombat: UTSCombat,
  UTSCombatant: UTSCombatant,
  UTSItem: UTSItem,
  UTSScene: UTSScene,
  UTSUser: UTSUser
});

/**
 * Simple data model for chess pieces as a type of actor
 */
class ChessModel extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["UTS.Chess"];

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    return {
      piece: new foundry.data.fields.StringField({
        required: true,
        choices: CONFIG.UTS.chess.pieces,
        initial: "pawn"
      })
    };
  }
}

/**
 * Simple data model for game tokens as a type of actor
 */
class GameTokenModel extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["UTS.GameToken"];

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    return {
      count: new foundry.data.fields.NumberField()
    };
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    if (!foundry.utils.hasProperty(data, "prototypeToken.bar1.attribute")) {
      this.parent.updateSource({"prototypeToken.bar1.attribute": "count"});
    }
  }
}

const config$2 = {
  chess: ChessModel,
  token: GameTokenModel
};

const config$1 = {
  player: Player
};

/**
 * Base data model for active effects. Can be replaced if duration logic is not desired.
 */
class BaseEffectData extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static defineSchema() {
    return { };
  }

  /* -------------------------------------------------- */

  /**
   * Disable effects whose durations has expired.
   * @type {boolean}
   */
  get isSuppressed() {
    const remaining = this.parent.duration.remaining;
    if (Number.isNumeric(remaining)) return remaining <= 0;
    else return false;
  }
}

const config = {
  base: BaseEffectData
};

Hooks.once("init", () => {
  CONFIG.UTS = UTS;

  // Assign document classes
  for (const docCls of Object.values(documents)) {
    CONFIG[docCls.documentName].documentClass = docCls;
  }

  Object.assign(CONFIG.ActiveEffect.dataModels, config);
  Object.assign(CONFIG.Actor.dataModels, config$2);
  Object.assign(CONFIG.Combatant.dataModels, config$1);

  CONFIG.Actor.defaultType = "token";

  // Document Sheets
  foundry.documents.collections.Actors.registerSheet("uts", UTSActorSheet, {
    makeDefault: true, label: "UTS.Sheets.Labels.ActorSheet"
  });
  foundry.documents.collections.Items.registerSheet("uts", UTSItemSheet, {
    makeDefault: true, label: "UTS.Sheets.Labels.ActorSheet"
  });

  // Sidebar tabs
  CONFIG.ui.combat = UTSCombatTracker;
});

Hooks.once("i18nInit", () => {
  // Localizing the system's CONFIG object
  localizeHelper(CONFIG.UTS);
});

Hooks.on("renderCombatantConfig", renderCombatantConfig);
