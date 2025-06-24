import { DEFAULT_CONFIG, NAME } from "../butler.js";
import { Sidekick } from "../sidekick.js";

/**
 * Enhanced Condition Trigger Config Application
 */
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
export default class EnhancedConditionOptionsConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: DEFAULT_CONFIG.enhancedConditions.optionConfig.id,
        tag: "form",
        form: {
            handler: EnhancedConditionOptionsConfig.formHandler,
            submitOnChange: false,
            closeOnSubmit: false
        },
        classes: ["sheet", "condition-options-config", "succ-form"],
        window: {
            title: DEFAULT_CONFIG.enhancedConditions.optionConfig.title,
            minimizable: false,
            resizable: false,
            contentClasses: ["condition-options"],
        },
        position: { width: 500, height: 600 },
        actions: {
            copyId: function () { navigator.clipboard.writeText(this.condition.id); }
        },
    };

    static optionsConfigTemplates = DEFAULT_CONFIG.enhancedConditions.templates.optionsConfig;
    static PARTS = {
        tabs: { template: 'templates/generic/tab-navigation.hbs' },
        general: { template: this.optionsConfigTemplates.generalTab },
        special: { template: this.optionsConfigTemplates.specialTab },
        footer: { template: this.optionsConfigTemplates.footer }
    };

    static TABS = {
        general: {
            id: 'general',
            group: 'primary',
            label: 'succ.ENHANCED_CONDITIONS.OptionConfig.Tabs.General',
        },
        special: {
            id: 'special',
            group: 'primary',
            label: 'succ.ENHANCED_CONDITIONS.OptionConfig.Tabs.SpecialEffects',
        },
    };

    constructor(condition, labData, options) {
        super(options);

        this.condition = condition ?? {};
        this.labData = labData;
    }

    _getTabs() {
        return Object.values(this.constructor.TABS).reduce(
            (acc, v) => {
                const isActive = this.tabGroups[v.group] === v.id;
                acc[v.id] = {
                    ...v,
                    active: isActive,
                    cssClass: isActive ? 'active' : '',
                    tabCssClass: isActive ? 'tab scrollable active' : 'tab scrollable',
                };
                return acc;
            },
            {},
        );
    }

    async _prepareContext(options) {
        await super._prepareContext(options);
        return { tabs: this._getTabs() };
    }

    async _preparePartContext(partId, context, _options) {
        context = {
            ...context,
            condition: this.condition,
            labData: this.labData,
            customId: this.condition.id
        };

        switch (partId) {
            case 'special': {
                let specialEffectOptions = [];
                for (let specialStatusEffect of Object.keys(DEFAULT_CONFIG.enhancedConditions.specialStatusEffects)) {
                    const effectProperties = DEFAULT_CONFIG.enhancedConditions.specialStatusEffects[specialStatusEffect];
                    if (effectProperties.optionLabel) {
                        effectProperties.key = specialStatusEffect;
                        effectProperties.option = this.condition.options[effectProperties.optionProperty];
                        specialEffectOptions.push(effectProperties);
                    }
                }

                context.specialEffectOptions = specialEffectOptions.sort((a, b) => a.key.localeCompare(b.key));
                break;
            }

            case 'general':
            case 'footer':
                break;
        }

        return context;
    }

    _onRender(context, options) {
        Sidekick.addEventListenerAll(this.element, "input[type='checkbox']", "change", event => this._onCheckboxChange(event));
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
            event.detail.conditionId = this.condition.id;
            EnhancedConditionOptionsConfig._onSpecialStatusEffectToggle(event);
        }
    }

    /**
     * Special Status Effect toggle handler
     * @param {*} event
     */
    static _onSpecialStatusEffectToggle(event) {
        // is another condition already using this special status effect?
        const existingCondition = game.succ.conditions.find(c => {
            const optionValue = foundry.utils.getProperty(c, `options.${Sidekick.toCamelCase(event.detail.statusName, "-")}`);
            return c.id !== event.detail.conditionId && optionValue == true;
        });
        if (existingCondition) {
            event.preventDefault();

            // raise a dialog asking for override
            const content = game.i18n.format(`${NAME}.ENHANCED_CONDITIONS.OptionConfig.SpecialStatusEffectOverride.Content`, { existingCondition: existingCondition.name, statusEffect: event.detail.statusLabel ?? event.detail.statusName });
            foundry.applications.api.DialogV2.confirm({
                window: { title: "succ.ENHANCED_CONDITIONS.OptionConfig.SpecialStatusEffectOverride.Title" },
                content: content,
                no: {
                    callback: () => {
                        event.target.checked = false;
                    }
                }
            });
        }
    }

    /**
     * Update Object on Form Submission
     * @param {*} event
     * @param {*} formData
     */
    static async formHandler(event, form, formData) {
        this.condition.options = {};
        const map = game.succ.conditionLab.map;
        const newMap = foundry.utils.deepClone(map);
        let conditionIndex = newMap.findIndex(c => c.id === this.condition.id);

        // Loop over the list of options and see if any of them need to be pushed up to the Foundry config
        for (const field in formData.object) {
            if (field == "custom-id") continue;

            const value = formData.object[field];
            const propertyName = Sidekick.toCamelCase(field, "-");
            const specialStatusEffect = Object.values(DEFAULT_CONFIG.enhancedConditions.specialStatusEffects).find((sse) => sse.optionProperty == propertyName);

            if (specialStatusEffect?.optionProperty && value === true) {
                //If another condition already has this effect option enabled, disable it
                const existingConditionIndex = newMap.findIndex(c => c.options && c.options[propertyName]);
                const existingCondition = newMap[existingConditionIndex];
                if (existingCondition && existingCondition != this.condition) {
                    existingCondition.options[propertyName] = false;
                    newMap[existingConditionIndex] = existingCondition;
                }
            }

            this.condition.options[propertyName] = value;
        }

        if (this.condition.addedByLab) {
            const customId = formData.object["custom-id"];
            if (customId) {
                let foundExisting = false;
                for (let condition of map) {
                    if (condition == this.condition) continue;

                    if (customId == condition.id) {
                        foundExisting = true;
                        Sidekick.showNotification("error", game.i18n.localize("ENHANCED_CONDITIONS.Lab.Options.CustomId.DuplicateRevert"));
                        break;
                    }
                }

                if (!foundExisting) {
                    this.condition.id = customId;
                }
            } else {
                this.condition.id = undefined;
            }
        }

        newMap[conditionIndex] = this.condition;
        await game.succ.conditionLab._saveMapping(newMap);
        await this.close();
    }
}