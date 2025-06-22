import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";
import { EnhancedConditionsAPI } from "./enhanced-conditions-api.js";
import EnhancedEffectConfig from "./enhanced-effect-config.js";
import EnhancedConditionMacroConfig from "./enhanced-condition-macro.js";
import EnhancedConditionOptionsConfig from "./enhanced-condition-options-config.js";

/**
 * Form application for managing mapping of Conditions to Icons and JournalEntries
 */
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
export class ConditionLab extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.id,
        tag: "form",
        form: {
            handler: ConditionLab.formHandler,
            submitOnChange: false,
            closeOnSubmit: false
        },
        classes: ["sheet", "standard-form", "succ-form"],
        window: {
            title: BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.title,
            minimizable: false,
            resizable: true,
            controls: [
                {
                    icon: "fas fa-file-import",
                    label: "WORDS.Import",
                    action: "import",
                },
                {
                    icon: "fas fa-file-export",
                    label: "WORDS.Export",
                    action: "export",
                },
            ]
        },
        position: { width: 1025, height: 700 },
        dragDrop: [{ dropSelector: "input[name^='reference-item']" }],
        actions: {
            //Form actions
            resetForm: function () { this._onResetForm(); },
            refreshRefs: function () { this._onRefreshRefs(); },
            restoreDefaults: function (event) { /*event.preventDefault();*/ this._onRestoreDefaults(); },
            sortList: function () { this._onClickSortButton(); },
            //Header actions
            import: function () { this._importFromJSONDialog(); },
            export: function () { this._exportToJSON(); },
            //Row actions
            addRow: function (event) { /*event.preventDefault();*/ this._onAddRow(); },
            removeRow: function (event, target) { /*event.preventDefault();*/ this._onRemoveRow(target); },
            filePicker: function (event, target) { this._onOpenFilePicker(target); },
            optionsConfig: function (event, target) { this._onClickOptionConfig(target); },
            activeEffectConfig: function (event, target) { this._onClickActiveEffectConfig(target); },
            saveMacro: function (event, target) { this._onClickSaveMacro(target); },
            macroConfig: function (event, target) { this._onClickMacroConfig(target); },
            resetCondition: function (event, target) { this._onClickResetCondition(target); },
            changeOrder: function (event, target) { this._onChangeSortOrder(target); },
        },
    };

    static conditionLabTemplates = BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.conditionLab;
    static PARTS = {
        header: {
            template: this.conditionLabTemplates.header
        },
        form: {
            template: this.conditionLabTemplates.form,
            scrollable: [""]
        },
        footer: {
            template: this.conditionLabTemplates.footer,
        }
    };

    constructor(options = {}) {
        super(options);
        this.data = game.succ.conditionLab?.data ?? null;
        this.system = game.system.id;
        this.initialMapType = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType);
        this.mapType = null;
        this.initialMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        this.map = null;
        this.deletedConditionsMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.deletedConditionsMap);
        this.displayedMap = null;
        this.filterValue = "";
        this.sortDirection = "";
        this.dragDrop = this.createDragDropHandlers();
    }

    createDragDropHandlers() {
        return this.options.dragDrop.map((d) => {
            d.callbacks = {
                drop: this._onDrop.bind(this),
            };
            return new foundry.applications.ux.DragDrop.implementation(d);
        });
    }

    /**
     * Get updated map by combining existing in-memory map with current formdata
     */
    get updatedMap() {
        const submitData = this._buildSubmitData();
        const mergedMap = this._processFormData(submitData);
        const updatedMap = EnhancedConditions._prepareMap(mergedMap);
        return updatedMap;
    }

    /**
     * Prepare data for form rendering
     */
    async _prepareContext(options) {
        const sortDirection = this.sortDirection;
        const sortTitle = game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.ConditionLab.SortAnchorTitle${sortDirection ? `_${sortDirection}` : ""}`);
        const filterTitle = game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.ConditionLab.FilterInputTitle`);
        const filterValue = this.filterValue;

        const mapTypeChoices = BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes;

        const mapType = this.mapType = (this.mapType || this.initialMapType || "other");
        let conditionMap = this.map ? this.map : (this.map = foundry.utils.duplicate(this.initialMap));

        const isDefault = this.mapType === Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);
        const isCustom = this.mapType === Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.custom);
        const outputChatSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);
        const disableChatOutput = isDefault || !outputChatSetting;

        for (let i = 0; i < conditionMap.length; i++) {
            const entry = conditionMap[i];
            // Check if the row exists in the saved map
            const existingEntry = this.initialMap.find(e => e.id === entry.id) ?? null;
            entry.isNew = !existingEntry;
            entry.isChanged = this._hasEntryChanged(entry, existingEntry, i);

            // Set the Output to Chat checkbox
            entry.options = entry.options ?? {};
            entry.options.outputChat = entry?.options?.outputChat ?? outputChatSetting;

            entry.options.useAsStatusEffect = entry?.options?.useAsStatusEffect ?? true;

            // @TODO #711
            entry.enrichedReference = entry.referenceId ? await foundry.applications.ux.TextEditor.implementation.enrichHTML(entry.referenceId, { async: true, documents: true }) : "";

            // Default all entries to show
            entry.hidden = entry.hidden ?? false;
        }

        // Pre-apply any filter value
        this.displayedMap = filterValue ? this._filterMapByName(conditionMap, filterValue) : foundry.utils.duplicate(conditionMap);

        // Sort the displayed map based on the sort direction
        if (sortDirection) {
            this.displayedMap = this._sortMapByName(this.displayedMap, sortDirection);
        }

        const displayedMap = this.displayedMap;

        let unsavedMap = false;
        if (mapType != this.initialMapType || conditionMap?.length != this.initialMap?.length || conditionMap.some(c => c.isNew || c.isChanged)) {
            unsavedMap = true;
        }

        // Prepare final data object for template
        const data = {
            sortTitle,
            sortDirection,
            filterTitle,
            filterValue,
            mapTypeChoices,
            mapType,
            conditionMap,
            lastConditionIndex: conditionMap.length - 1,
            displayedMap,
            isCustom,
            disableChatOutput,
            unsavedMap
        };

        this.data = data;
        return data;
    }

    /**
     * Get an object of update data used to update the form's target object
     * @param {object} updateData     Additional data that should be merged with the form data
     * @returns {object}              The prepared update data
     */
    _getSubmitData(updateData = {}) {
        const fd = new foundry.applications.ux.FormDataExtended(this.form, { editors: this.editors });
        let data = fd.object;
        if (updateData) data = foundry.utils.flattenObject(foundry.utils.mergeObject(data, updateData));
        return data;
    }

    /**
     * Enriches submit data with existing map to ensure continuity
     */
    _buildSubmitData() {
        const map = this.sortDirection ? this._sortMapByName(this.map) : this.map;
        const data = map?.reduce((acc, entry, index) => {
            acc[`id-${index}`] = entry.id;
            return acc;
        }, {}) ?? {};
        return this._getSubmitData(data);
    }

    /**
     * Processes the Form Data and builds a usable Condition Map
     * @param {*} formData
     */
    _processFormData(formData) {
        let ids = [];
        let conditions = [];
        let icons = [];
        let references = [];
        let newMap = [];
        const rows = [];
        const existingMap = this.map ?? Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);


        //need to tighten these up to check for the existence of digits after the word
        const conditionRegex = new RegExp("condition", "i");
        const idRegex = new RegExp(/^id/, "i");
        const iconRegex = new RegExp("icon", "i");
        const referenceRegex = new RegExp("reference", "i");
        const rowRegex = new RegExp(/\d+$/);

        //write it back to the relevant condition map
        //@todo: maybe switch to a switch
        for (let e in formData) {
            const rowMatch = e.match(rowRegex);
            const row = rowMatch ? rowMatch[0] : null;

            if (!row) {
                continue;
            }

            rows.push(row);

            if (e.match(idRegex)) {
                ids[row] = formData[e];
            } else if (e.match(conditionRegex)) {
                conditions[row] = formData[e];
            } else if (e.match(iconRegex)) {
                icons[row] = formData[e];
            } else if (e.match(referenceRegex)) {
                references[row] = formData[e];
            }
        }

        const uniqueRows = [...new Set(rows)];

        for (let i = 0; i < uniqueRows.length; i++) {
            const id = ids[i] ?? null;
            const existingCondition = (existingMap && id) ? existingMap.find(c => c.id === id) : null;
            const name = conditions[i] ?? existingCondition?.name;
            const img = icons[i] ?? existingCondition?.img;
            const referenceId = references[i] ?? existingCondition?.referenceId;
            const activeEffect = existingCondition ? existingCondition.activeEffect : null;
            const macros = existingCondition ? existingCondition.macros : null;
            const options = existingCondition ? existingCondition.options : {};
            const addedByLab = existingCondition?.addedByLab;
            const destroyDisabled = existingCondition?.destroyDisabled;

            const condition = {
                id,
                name,
                img,
                referenceId,
                activeEffect,
                macros,
                options,
                addedByLab,
                destroyDisabled
            };

            newMap.push(condition);
        }

        return newMap;
    }

    /**
     * Restore defaults for a mapping
     */
    _restoreDefaults({ clearCache = false, resetNames = false, resetRefs = false, resetIcons = false,
        resetAEs = false, resetMacros = false, resetOptions = false, removeConditionsAddedByLab = false } = {}) {
        let defaultConditions = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions);

        const otherMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.other);
        if (clearCache) {
            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects, CONFIG.defaultStatusEffects);
            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.specialStatusEffectMapping, CONFIG.defaultSpecialStatusEffects);
        }

        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.deletedConditionsMap, []);

        // If the mapType is other then the map should be empty, otherwise it's the default map for the system
        const tempMap = (this.mapType != otherMapType && EnhancedConditions.getMapForDefaultConditions(defaultConditions)) ? EnhancedConditions.getMapForDefaultConditions(defaultConditions) : [];

        // Loop over the old map and readd any conditions that were added by the user through the Condition Lab
        const oldMap = foundry.utils.duplicate(this.map);
        this.map = foundry.utils.duplicate(tempMap);
        for (const oldCondition of oldMap) {
            if (oldCondition.addedByLab) {
                if (!removeConditionsAddedByLab) {
                    this.map.push(oldCondition);
                }
                continue;
            }

            let newCondition = this.map.find(c => c.id === oldCondition.id);
            if (!newCondition) {
                continue;
            }

            if (!resetNames) {
                newCondition.name = oldCondition.name;
            }

            if (!resetRefs) {
                newCondition.referenceId = oldCondition.referenceId;
            }

            if (!resetIcons) {
                newCondition.img = oldCondition.img;
            }

            if (!resetAEs) {
                newCondition.activeEffect = oldCondition.activeEffect;
            }

            if (!resetMacros) {
                newCondition.macros = oldCondition.macros;
            }

            if (!resetOptions) {
                newCondition.options = oldCondition.options;
            }
        }

        //If we didn't reset the options, we need to do a pass and make sure that each option is still exclusive
        if (!resetOptions) {
            Sidekick.ensureStatusEffectOptionExclusivity(this.map);
        }

        this.render(true);
    }

    _restoreConditionDefaults(conditionId, options = {}) {
        const otherMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.other);
        let defaultConditions = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions);
        const defaultMap = (this.mapType != otherMapType && EnhancedConditions.getMapForDefaultConditions(defaultConditions)) ? EnhancedConditions.getMapForDefaultConditions(defaultConditions) : [];

        let condition = this.map.find(c => c.id === conditionId);
        let defaultCondition = defaultMap.find(c => c.id === conditionId);
        if (!defaultCondition) {
            return;
        }

        if (options.resetNames) {
            condition.name = defaultCondition.name;
        }

        if (options.resetRefs) {
            condition.referenceId = defaultCondition.referenceId;
        }

        if (options.resetIcons) {
            condition.img = defaultCondition.img;
        }

        if (options.resetAEs) {
            condition.activeEffect = defaultCondition.activeEffect;
        }

        if (options.resetMacros) {
            condition.macros = defaultCondition.macros;
        }

        if (options.resetOptions) {
            condition.options = defaultCondition.options;
        }

        Sidekick.ensureStatusEffectOptionExclusivity(this.map);

        this.render(true);
    }

    /**
     * Take the new map and write it back to settings, overwriting existing
     * @param {Object} event
     * @param {Object} formData
     */
    static async formHandler(event, form, formData) {
        const showDialogSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.showSortDirectionDialog);

        if (this.sortDirection && showDialogSetting) {
            await foundry.applications.api.DialogV2.confirm({
                window: { title: `${BUTLER.NAME}.ENHANCED_CONDITIONS.ConditionLab.SortDirectionSave.Title` },
                content: await foundry.applications.handlebars.renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.sortDirectionSaveDialog),
                classes: ["succ-dialog"],
                yes: {
                    callback: (event, target, dialog) => {
                        const checkbox = dialog.element.querySelector("input[name='dont-show-again']");
                        if (checkbox.checked) {
                            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.showSortDirectionDialog, false);
                        }
                        this._processFormUpdate(formData.object);
                    }
                }
            });
        } else {
            this._processFormUpdate(formData.object);
        }
    }

    /**
     * Process Condition Lab formdata and then save changes
     * @param {*} formData
     */
    async _processFormUpdate(formData) {
        const mapType = formData["map-type"];
        let newMap = this.updatedMap;
        const defaultMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);

        if (mapType === defaultMapType) {
            const defaultMap = EnhancedConditions.getDefaultMap();
            newMap = foundry.utils.mergeObject(newMap, defaultMap);
        }

        return this._saveMapping(newMap, mapType);
    }

    /**
     * Saves a given map and option map type to storage
     * @param {*} newMap
     * @param {*} mapType
     */
    async _saveMapping(newMap, mapType = this.mapType) {
        this.mapType = this.initialMapType = mapType;
        const preparedMap = EnhancedConditions._prepareMap(newMap);

        await Sidekick.updateSpecialStatusEffectConfig(preparedMap);
        await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, mapType);
        await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, preparedMap);
        await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.deletedConditionsMap, this.deletedConditionsMap);

        return this._finaliseSave(preparedMap);
    }

    /**
     * Performs final steps after saving mapping
     * @param {*} preparedMap
     */
    async _finaliseSave(preparedMap) {
        this.map = preparedMap;
        this.initialMap = foundry.utils.duplicate(this.map);
        this.unsaved = false;
        this.sortDirection = "";

        ui.notifications.info(game.i18n.localize("ENHANCED_CONDITIONS.Lab.SaveSuccess"));
        this.render(true);
    }

    /**
     * Exports the current map to JSON
     */
    _exportToJSON() {
        const map = foundry.utils.duplicate(this.map);
        const data = {
            system: game.system.id,
            map
        };

        // Trigger file save procedure
        const filename = `succ-${game.system.id}-condition-config.json`;
        saveDataToFile(JSON.stringify(data, null, 2), "text/json", filename);
    }


    /**
     * Initiates an import via a dialog
     * Borrowed from foundry.js Entity class
     */
    async _importFromJSONDialog() {
        new foundry.applications.api.DialogV2({
            window: { title: "ENHANCED_CONDITIONS.Lab.ImportTitle" },
            content: await foundry.applications.handlebars.renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.importDialog, {}),
            classes: ["succ-dialog"],
            buttons: [
                {
                    icon: '<i class="fas fa-file-import"></i>',
                    label: game.i18n.localize("WORDS.Import"),
                    action: "import",
                    callback: (event, target, dialog) => {
                        this._processImport(dialog.element);
                    }
                },
                {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("WORDS.Cancel"),
                    action: "no",
                }
            ],
            default: "import"
        }).render(true);
    }

    /**
     * Process a Condition Map Import
     * @param {*} html
     */
    async _processImport(element) {
        const form = element.querySelector("form");

        if (!form.data.files.length) {
            return ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.Lab.Import.NoFile"));
        }

        const jsonFile = await readTextFromFile(form.data.files[0]);
        const json = JSON.parse(jsonFile);
        const map = EnhancedConditions.mapFromJson(json);

        if (!map || !map?.length) {
            return;
        }

        this.mapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.other);
        this.map = map;
        this.render();
    }


    /* -------------------------------------------- */
    /*                 Hook Handlers                */
    /* -------------------------------------------- */

    _onFirstRender(context, options) {
        ui.succ.conditionLab = this;
    }

    _onRender(context, options) {
        this.dragDrop.forEach((d) => d.bind(this.element));
        this.element.querySelector("select[class='map-type']").addEventListener("change", (event) => this._onChangeMapType(event));
        this.element.querySelector("input[name='filter-list']").addEventListener("input", (event) => this._onChangeFilter(event));
        Sidekick.addEventListenerAll(this.element, "input", "change", event => this._onChangeInputs(event));
    }

    _onClose(context, options) {
        ui.succ.conditionLab = undefined;
    }

    /**
     * Render save dialog hook handler
     * @param {*} app
     * @param {jQuery} html
     * @param {*} data
     */
    static async _onRenderSaveDialog(app, html, data) {
        const contentDiv = html[0].querySelector("div.dialog-content");
        const checkbox = `<div class="form-group"><label class="dont-show-again-checkbox">${game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.ConditionLab.SortDirectionSave.CheckboxText`)}<input type="checkbox" name="dont-show-again"></label></div>`;
        contentDiv.insertAdjacentHTML("beforeend", checkbox);
        await app.setPosition({ height: app.position.height + 25 });
    }

    /* -------------------------------------------- */
    /*                Event Handlers                */
    /* -------------------------------------------- */

    /**
     * Input change handler
     * @param {*} event
     * @returns {Application.render}
     */
    async _onChangeInputs(event) {
        const name = event.target.name;

        if (name.startsWith("filter-list")) {
            return;
        }

        this.map = this.updatedMap;

        if (name.startsWith("icon-path")) {
            this._onChangeIconPath(event);
        }

        const hasChanged = this._hasMapChanged();

        if (hasChanged) return this.render();
    }

    /**
     * Filter input change handler
     */
    _onChangeFilter(event) {
        const input = event.target;
        const inputValue = input?.value;
        this.filterValue = inputValue ?? "";
        this.displayedMap = this._filterMapByName(this.map, this.filterValue);

        this.displayedRowIds = this.displayedMap.filter(r => !r.hidden).map(r => r.id);

        const conditionRowEls = this.element.querySelectorAll("li.row");
        for (const el of conditionRowEls) {
            const conditionId = el.dataset.conditionId;
            if (this.displayedRowIds.includes(conditionId)) {
                el.classList.remove("hidden");
            } else {
                el.classList.add("hidden");
            }
        }
    }

    /**
     * Filter the given map by the name property using the supplied filter value, marking filtered entries as "hidden"
     * @param {Array} map
     * @param {String} filter
     * @returns filteredMap
     */
    _filterMapByName(map, filter) {
        return map.map((c) => ({ ...c, hidden: !c.name.toLowerCase().includes(filter.toLowerCase()) }));
    }

    /**
     * Change Map Type event handler
     * @param {*} event
     */
    async _onChangeMapType(event) {
        const selection = event.target.options[event.target.selectedIndex];
        const newType = this.mapType = selection.value;

        switch (newType) {
            case "default": {
                const defaultMap = EnhancedConditions.getDefaultMap();
                this.map = defaultMap?.length ? EnhancedConditions._prepareMap(defaultMap) : [];
                break;
            }

            case "custom":
                //When switching to custom, we just take whatever was already in the map and modify it from there
                break;

            case "other":
                this.map = this.initialMapType == "other" ? this.initialMap : [];
                break;

            default:
                break;
        }

        this.data = null;
        this.render();
    }

    /**
     * Handle icon path change
     * @param {*} event
     */
    _onChangeIconPath(event) {
        const row = event.target.name.match(/\d+$/)[0];

        //target the icon
        const icon = this.form.querySelector("img[name='icon-" + row);
        icon.setAttribute("src", event.target.value);
    }

    /**
     * Handle click Active Effect Config button
     * @param {*} event
     */
    async _onClickActiveEffectConfig(target) {
        const li = target.closest("li");
        const conditionId = li ? li.dataset.conditionId : null;

        if (!conditionId) return;

        const conditions = this.map ?? Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const condition = conditions.length ? conditions.find(c => c.id === conditionId) : null;

        if (!condition) return;

        const conditionEffect = condition.activeEffect ?? EnhancedConditionsAPI.getActiveEffect(condition);

        if (!conditionEffect) return;

        if (!foundry.utils.hasProperty(conditionEffect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.conditionId}`)) {
            foundry.utils.setProperty(conditionEffect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.conditionId}`, conditionId);
        }

        conditionEffect.img = condition.img;
        delete conditionEffect.id;

        // Build a fake effect object for the ActiveEffectConfig sheet
        const tempActor = new Actor.implementation({ name: "Temp", type: "character" });
        const effect = new ActiveEffect(conditionEffect, { parent: tempActor });
        effect.testUserPermission = (...args) => { return true; };

        new EnhancedEffectConfig({ document: effect }).render(true);
    }

    /**
     * Add Row event handler
     * @param {*} event
     */
    _onAddRow() {
        const existingNewConditions = this.map.filter(m => m.name.match(/^New Condition \d+$/));
        const newConditionIndex = existingNewConditions.length ? Math.max(...existingNewConditions.map(m => 1 * m.name.match(/\d+$/g)[0])) + 1 : 1;
        const newConditionName = `New Condition ${newConditionIndex}`;

        const newMap = foundry.utils.duplicate(this.map);
        const exisitingIds = this.map.filter(c => c.id).map(c => c.id);
        const outputChatSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);

        newMap.push({
            id: Sidekick.createId(exisitingIds),
            name: newConditionName,
            img: "icons/svg/d20-black.svg",
            referenceId: "",
            options: {
                outputChat: outputChatSetting
            },
            addedByLab: true
        });

        const customMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.custom);
        this.mapType = customMapType;
        this.map = newMap;
        this.data = null;

        this.render();
    }

    /**
     * Handler for remove row event
     * @param {*} event
     */
    _onRemoveRow(target) {
        this.map = this.updatedMap;

        const row = target.name.match(/\d+$/)[0];

        const dialog = new foundry.applications.api.DialogV2({
            window: { title: "ENHANCED_CONDITIONS.Lab.ConfirmDeleteTitle" },
            content: game.i18n.localize("ENHANCED_CONDITIONS.Lab.ConfirmDeleteContent"),
            buttons: [
                {
                    icon: `<i class="fa fa-check"></i>`,
                    label: "WORDS._Yes",
                    action: "yes",
                    callback: async event => {
                        const newMap = foundry.utils.duplicate(this.map);
                        if (!newMap[row].addedByLab) {
                            this.deletedConditionsMap.push(newMap[row]);
                        }
                        newMap.splice(row, 1);
                        this.map = newMap;
                        this.render();
                    }
                },
                {
                    icon: `<i class="fa fa-times"></i>`,
                    label: "WORDS._No",
                    action: "no",
                    callback: event => { }
                }
            ],
            default: "no"
        });

        dialog.render(true);
    }

    /**
     * Handle a change sort order click
     * @param {*} event
     */
    _onChangeSortOrder(target) {
        const anchor = target;
        const liRow = anchor?.closest("li");
        const rowNumber = parseInt(liRow?.dataset.mappingRow);
        const type = anchor?.className;
        const newMap = foundry.utils.deepClone(this.map);
        const mappingRow = newMap?.splice(rowNumber, 1) ?? [];
        let newIndex = -1;

        switch (type) {
            case "move-up":
                newIndex = rowNumber - 1;
                break;

            case "move-down":
                newIndex = rowNumber + 1;
                break;

            default:
                break;
        }

        if (newIndex <= -1) return;

        newMap.splice(newIndex, 0, ...mappingRow);
        this.map = newMap;
        this.render();
    }

    /**
     * Sort button handler
     * @param {*} event
     */
    _onClickSortButton() {
        const sortDirection = this.sortDirection;
        //const newSortDirection = sortDirection === "asc" ? "desc" : "asc";
        switch (sortDirection) {
            case "":
                this.sortDirection = "asc";
                break;

            case "asc":
                this.sortDirection = "desc";
                break;

            case "desc":
                this.sortDirection = "";
                break;

            default:
                break;
        }

        return this.render();
    }

    /**
     * Sorts the given map by the name property
     * @param {Array} map
     * @param {*} direction
     * @returns {Array}
     */
    _sortMapByName(map, direction) {
        return map.sort((a, b) => {
            if (direction === "desc") return b.name.localeCompare(a.name);
            return a.name.localeCompare(b.name);
        });
    }

    /**
     *
     * @param {*} event
     */
    async _onRestoreDefaults(condition) {
        let body;
        if (condition) {
            body = game.i18n.localize("ENHANCED_CONDITIONS.Lab.RestoreDefaults.Condition.Body");
            body = body.replace("{0}", game.i18n.localize(condition.name));
        } else {
            body = game.i18n.localize("ENHANCED_CONDITIONS.Lab.RestoreDefaults.Body");
        }

        const isDefaultMapType = game.succ.conditionLab.mapType === Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);
        const dialogData = { isDefaultMapType, body, condition };
        const content = await foundry.applications.handlebars.renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.conditionLabRestoreDefaultsDialog, dialogData);

        const confirmationDialog = new foundry.applications.api.DialogV2(
            {
                window: { title: "ENHANCED_CONDITIONS.Lab.RestoreDefaultsTitle" },
                content,
                classes: ["succ-dialog"],
                buttons: [
                    {
                        icon: `<i class="fas fa-check"></i>`,
                        label: game.i18n.localize("WORDS.Yes"),
                        action: "yes",
                        callback: (event, target, dialog) => {
                            let options = {
                                clearCache: dialog.element.querySelector("input[id='clear-cache']")?.checked,
                                resetNames: dialog.element.querySelector("input[id='reset-names']")?.checked,
                                resetRefs: dialog.element.querySelector("input[id='reset-refs']")?.checked,
                                resetIcons: dialog.element.querySelector("input[id='reset-icons']")?.checked,
                                resetAEs: dialog.element.querySelector("input[id='reset-aes']")?.checked,
                                resetMacros: dialog.element.querySelector("input[id='reset-macros']")?.checked,
                                resetOptions: dialog.element.querySelector("input[id='reset-options']")?.checked,
                                removeConditionsAddedByLab: dialog.element.querySelector("input[id='remove-added']")?.checked
                            };
                            if (condition) {
                                this._restoreConditionDefaults(condition.id, options);
                            } else {
                                this._restoreDefaults(options);
                            }
                        }
                    },
                    {
                        icon: `<i class="fas fa-times"></i>`,
                        label: game.i18n.localize("WORDS.No"),
                        action: "no",
                        callback: () => { }
                    }
                ],
                default: "no",
                close: () => { }
            });

        confirmationDialog.render(true);
    }

    /**
     * Reset form handler
     * @param {*} event
     */
    _onResetForm() {
        const dialog = new foundry.applications.api.DialogV2({
            window: { title: "ENHANCED_CONDITIONS.Lab.ResetFormTitle" },
            content: game.i18n.localize("ENHANCED_CONDITIONS.Lab.ResetFormContent"),
            classes: ["succ-dialog"],
            buttons: [
                {
                    icon: `<i class="fa fa-check"></i>`,
                    label: "WORDS._Yes",
                    action: "yes",
                    callback: event => {
                        this.map = this.initialMap;
                        this.render();
                    }
                },
                {
                    icon: `<i class="fa fa-times"></i>`,
                    label: "WORDS._No",
                    action: "no",
                    callback: event => { }
                }
            ],
            default: "no"
        });
        dialog.render(true);
    }

    async _onDrop(event) {
        const eventData = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
        const link = await foundry.applications.ux.TextEditor.implementation.getContentLink(eventData);
        const targetInput = event.currentTarget;
        if (link) {
            targetInput.value = link;
            return targetInput.dispatchEvent(new Event("change"));
        } else {
            return ui.notifications.error(game.i18n.localize(`${NAME}.ENHANCED_CONDITIONS.ConditionLab.BadReference`));
        }
    }

    /**
     * Save and Close handler
     * @param {*} event
     */
    _onRefreshRefs() {
        for (let condition of this.map) {
            let conditionConfig = game.succ.conditionConfigMap.find(c => c.id === condition.id);
            if (conditionConfig) {
                condition.referenceId = conditionConfig.referenceId;
            }
        }
        this.render(true);
    }

    /**
     * Save Macro button click handler
     * @param {*} event
     */
    async _onClickSaveMacro(target) {
        const rowLi = target.closest("li");
        const conditionId = rowLi ? rowLi.dataset.conditionId : null;

        if (!conditionId) return;

        let macroSlot = 0;
        let { page } = ui.hotbar;

        let folder = foundry.documents.collections.Macros.instance.folders.find(f => f.name == "SUCC");
        if (!folder) {
            folder = await Folder.create({ name: "SUCC", type: "Macro" });
        }

        // Starting from the current hotbar page, find the first empty slot
        do {
            let macros = game.user.getHotbarMacros(page);
            for (const macro of macros) {
                if (macro.macro === undefined || macro.macro === null) {
                    macroSlot = macro.slot;
                    break;
                }
            }
            page = page < 5 ? page + 1 : 1;
        } while (macroSlot === 0 && page !== ui.hotbar.page);


        const condition = this.map.find(c => c.id === conditionId);
        Macro.create({
            name: (game.i18n.localize("ENHANCED_CONDITIONS.Lab.CreatedToggleMacro.Name") + game.i18n.localize(condition.name)),
            img: condition.img,
            type: "script",
            command: this.getMacroCommand(condition.id),
            scope: "global",
            ownership: { default: 2 },
            folder: folder
        }).then((macro) => {
            // If we found an empty slot, assign the macro to that slot
            if (macroSlot > 0) {
                game.user.assignHotbarMacro(macro, macroSlot).catch(() => {
                    Sidekick.consoleMessage("error", "_onClickSaveMacro", "Error assigning macro to Hot Bar");
                });
            }
        });
    }

    getMacroCommand(conditionId) {
        return `` +
            `if (!game.modules.get('succ')?.active) {\n` +
            `   ui.notifications.error("You cannot execute this macro unless the SUCC module is active.");\n` +
            `   return;\n` +
            `}\n` +
            `game.succ.toggleCondition('` + conditionId + `', canvas.tokens.controlled);`;
    }

    /**
     * Macro Config button click handler
     * @param {*} event
     */
    _onClickMacroConfig(target) {
        const rowLi = target.closest("li");
        const conditionId = rowLi ? rowLi.dataset.conditionId : null;

        if (!conditionId) return;

        const condition = this.map.find(c => c.id === conditionId);

        new EnhancedConditionMacroConfig(condition).render(true);
    }

    /**
     * Option Config button click handler
     * @param {*} event
     */
    async _onClickOptionConfig(target) {
        const rowLi = target.closest("li");
        const conditionId = rowLi ? rowLi.dataset.conditionId : null;

        if (!conditionId) return;

        const condition = this.map.find(c => c.id === conditionId);
        const labData = await this._prepareContext();

        new EnhancedConditionOptionsConfig(condition, labData, {
            title: (game.i18n.localize(condition.name) + " - " + game.i18n.localize("succ.ENHANCED_CONDITIONS.OptionConfig.Heading"))
        }).render(true);
    }

    /**
     * Option Config button click handler
     * @param {*} event
     */
    async _onClickResetCondition(target) {
        const rowLi = target.closest("li");
        const conditionId = rowLi ? rowLi.dataset.conditionId : null;

        if (!conditionId) return;

        const condition = this.map.find(c => c.id === conditionId);
        this._onRestoreDefaults(condition);
    }

    /**
     * Icon picker handler
     * @param {*} target
     */
    async _onOpenFilePicker(target) {
        const inputField = this.element.querySelector(`input[name="${target.dataset.target}"`);
        new FilePicker.implementation({
            type: target.dataset.type,
            current: inputField.value,
            allowUpload: true,
            callback: (src) => {
                if (inputField.value != src) {
                    inputField.value = src;
                    inputField.dispatchEvent(new Event('change', { 'bubbles': true }));
                }
            }
        }).browse();
    }

    /**
     * Checks the updatedMap property against the initial map
     */
    _hasMapChanged() {
        let hasChanged = false;

        const conditionMap = this.updatedMap;

        conditionMap.forEach((entry, index, array) => {
            // Check if the row exists in the saved map
            const existingEntry = this.initialMap.find(e => e.id === entry.id) ?? null;
            entry.isNew = !existingEntry;

            // If row is new or if its index has changed, it is also changed
            entry.isChanged = entry.isNew || (index != this.initialMap?.indexOf(existingEntry));

            // If it's not changed, test the tracked properties until a change is found
            if (!entry.isChanged) {
                entry.isChanged = foundry.utils.isEmpty(foundry.utils.diffObject(existingEntry, entry));
                hasChanged = true;
            }
        });

        return hasChanged;
    }

    _hasEntryChanged(entry, existingEntry, index) {
        const propsToCheck = [
            "name",
            "img",
            "options",
            "referenceId",
            "activeEffect"
        ];

        const hasChanged = entry.isNew
            || (index != this.initialMap?.indexOf(existingEntry))
            || propsToCheck.some(p => this._hasPropertyChanged(p, existingEntry, entry));

        return hasChanged;
    }

    /**
     * Checks a given propertyName on an original and comparison object to see if it has changed
     * @param {*} propertyName
     * @param {*} original
     * @param {*} comparison
     * @returns {Boolean}
     */
    _hasPropertyChanged(propertyName, original, comparison) {
        let propertyChanged = false;

        if ((original[propertyName] && !comparison[propertyName])
            || (original && (JSON.stringify(original[propertyName]) != JSON.stringify(comparison[[propertyName]])))
        ) {
            propertyChanged = true;
        }

        return propertyChanged;
    }
}