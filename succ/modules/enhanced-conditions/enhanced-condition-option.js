import { DEFAULT_CONFIG, NAME, SETTING_KEYS } from "../butler.js";
import { Sidekick } from "../sidekick.js";

/**
 * Enhanced Condition Trigger Config Application
 */
export default class EnhancedConditionOptionConfig extends FormApplication {
    constructor(object, labData, options) {
        super(object, options);

        this.object = this.object ?? {};
        this.labData = labData;

        this.initialObject = foundry.utils.duplicate(this.object);
    }

    /**
     * defaultOptions
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            id: DEFAULT_CONFIG.enhancedConditions.optionConfig.id,
            template: DEFAULT_CONFIG.enhancedConditions.templates.optionConfig,
            tabs: [
                {
                    navSelector: ".sheet-tabs",
                    contentSelector: ".condition-options",
                    initial: "enable",
                },
            ],
            classes: ["sheet", "condition-options-config"],
            closeOnSubmit: false,
            width: 500,
            height: 600
        });
    }

    /**
     * Gets data for template rendering
     * @returns {Object} data
     */
    getData() {
        let specialEffectOptions = [];
        for (let specialStatusEffect of Object.keys(DEFAULT_CONFIG.enhancedConditions.specialStatusEffects)) {
            const effectProperties = DEFAULT_CONFIG.enhancedConditions.specialStatusEffects[specialStatusEffect];
            if (effectProperties.optionLabel) {
                effectProperties.key = specialStatusEffect;
                effectProperties.option = this.object.options[effectProperties.optionProperty];
                specialEffectOptions.push(effectProperties);
            }
        }

        specialEffectOptions = specialEffectOptions.sort((a, b) => a.key.localeCompare(b.key));

        const data = {
            condition: this.object,
            labData: this.labData,
            customId: this.object.id,
            specialEffectOptions
        };

        return data;
    }

    /**
     * Application listeners
     * @param {jQuery} html
     */
    activateListeners(html) {
        const checkboxes = html.find("input[type='checkbox']");

        for (const checkbox of checkboxes) {
            checkbox.addEventListener("change", (event) => this._onCheckboxChange(event));
        }

        const copyIdButton = html.find("button[name='copy-id']");
        copyIdButton.on("click", (event) => {
            navigator.clipboard.writeText(this.object.id);
        });
    }

    /**
     * Checkbox change event handler
     * @param {*} event
     */
    _onCheckboxChange(event) {
        if (!event.target?.checked) return;
        const targetName = event.target?.name;
        const propertyName = Sidekick.toCamelCase(targetName, "-");
        const specialStatusEffectsProps = Object.values(DEFAULT_CONFIG.enhancedConditions.specialStatusEffects).map((k) =>
            k.optionProperty
        );

        if (!propertyName || !specialStatusEffectsProps) return;

        if (specialStatusEffectsProps.includes(propertyName)) {
            event.detail = (event.detail && event.detail instanceof Object) ? event.detail : {};
            event.detail.statusName = targetName;
            event.detail.statusLabel = event.target.nextElementSibling?.innerText;
            event.detail.conditionId = this.object.id;
            return EnhancedConditionOptionConfig._onSpecialStatusEffectToggle(event);
        }
    }

    /**
     * Special Status Effect toggle handler
     * @param {*} event
     */
    static async _onSpecialStatusEffectToggle(event) {
        // is another condition already using this special status effect?
        const existingCondition = game.succ.conditions.find(c => {
            const optionValue = foundry.utils.getProperty(c, `options.${Sidekick.toCamelCase(event.detail.statusName, "-")}`);
            return c.id !== event.detail.conditionId && optionValue == true;
        });
        if (existingCondition) {
            event.preventDefault();
            // raise a dialog asking for override
            const title = game.i18n.localize(`${NAME}.ENHANCED_CONDITIONS.OptionConfig.SpecialStatusEffectOverride.Title`);
            const content = game.i18n.format(`${NAME}.ENHANCED_CONDITIONS.OptionConfig.SpecialStatusEffectOverride.Content`, { existingCondition: existingCondition.name, statusEffect: event.detail.statusLabel ?? event.detail.statusName });
            const yes = () => { };
            const no = () => { event.target.checked = false; };
            const defaultYes = false;
            return Dialog.confirm({ title, content, yes, no, defaultYes }, {});
        }

        return event;
    }

    /**
     * Update Object on Form Submission
     * @param {*} event
     * @param {*} formData
     */
    async _updateObject(event, formData) {
        this.object.options = {};
        const map = game.succ.conditionLab.map;
        const newMap = foundry.utils.deepClone(map);
        let conditionIndex = newMap.findIndex(c => c.id === this.object.id);

        // Loop over the list of options and see if any of them need to be pushed up to the Foundry config
        for (const field in formData) {
            if (field == "custom-id") continue;

            const value = formData[field];
            const propertyName = Sidekick.toCamelCase(field, "-");
            const specialStatusEffect = Object.values(DEFAULT_CONFIG.enhancedConditions.specialStatusEffects).find((sse) => sse.optionProperty == propertyName);

            if (specialStatusEffect?.optionProperty && value === true) {
                //If another condition already has this effect option enabled, disable it
                const existingConditionIndex = newMap.findIndex(c => c.options && c.options[propertyName]);
                const existingCondition = newMap[existingConditionIndex];
                if (existingCondition && existingCondition != this.object) {
                    existingCondition.options[propertyName] = false;
                    newMap[existingConditionIndex] = existingCondition;
                }
            }

            this.object.options[propertyName] = value;
        }

        if (this.object.addedByLab) {
            const customId = formData["custom-id"];
            if (customId) {
                let foundExisting = false;
                for (let condition of map) {
                    if (condition == this.object) continue;

                    if (customId == condition.id) {
                        foundExisting = true;
                        Sidekick.showNotification("error", game.i18n.localize("ENHANCED_CONDITIONS.Lab.Options.CustomId.DuplicateRevert"));
                        break;
                    }
                }

                if (!foundExisting) {
                    this.object.id = customId;
                }
            } else {
                this.object.id = undefined;
            }
        }

        newMap[conditionIndex] = this.object;
        await game.succ.conditionLab._saveMapping(newMap);
        await this.close();
    }
}