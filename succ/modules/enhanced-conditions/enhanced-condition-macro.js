import { DEFAULT_CONFIG, SETTING_KEYS } from "../butler.js";
import { Sidekick } from "../sidekick.js";

/**
 * Enhanced Condition Macro Config Application
 */
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
export default class EnhancedConditionMacroConfig extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
      id: DEFAULT_CONFIG.enhancedConditions.macroConfig.id,
      tag: "form",
      form: {
        handler: EnhancedConditionMacroConfig.formHandler,
        submitOnChange: false,
        closeOnSubmit: true
      },
      classes: ["standard-form", "succ-form"],
      window: {
        title: DEFAULT_CONFIG.enhancedConditions.macroConfig.title,
        minimizable: false,
        resizable: true,
        contentClasses: ["brsw-modifier-names-content"],
      },
    };

    static PARTS = {
      form: { template: DEFAULT_CONFIG.enhancedConditions.templates.macroConfig },
    };

    constructor(condition, options) {
        super(options);

        this.condition = condition ?? {};
        this.condition.macros = this.condition.macros ?? [];
    }

    async _prepareContext(options) {
        const conditionMacros = this.condition.macros;
        const applyMacroId = conditionMacros.find(m => m.type === "apply")?.id;
        const removeMacroId = conditionMacros.find(m => m.type === "remove")?.id;

        let macroChoices = game.macros?.contents?.map(m => {
            return {id: m.id, name: m.name}
        });
        macroChoices = macroChoices.sort((a, b) => a.name.localeCompare(b.name));

        return {
            condition: this.condition,
            applyMacroId,
            removeMacroId,
            macroChoices,
        };
    }

    static async formHandler(event, form, formData) {
        this.condition.macros = [];

        for (const field in formData.object) {
            const type = field.split("-").slice(-1).pop() ?? "";
            const tempMacro = {id: formData.object[field], type: type};
            this.condition.macros.push(tempMacro);
        }

        const map = game.succ.conditions;
        const newMap = foundry.utils.duplicate(map);

        let conditionIndex = newMap.findIndex(c => c.id === this.condition.id);
        newMap[conditionIndex] = this.condition;
        Sidekick.setSetting(SETTING_KEYS.enhancedConditions.map, newMap);
        this.render();
    }
}