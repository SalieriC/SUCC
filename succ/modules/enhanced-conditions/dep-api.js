import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditionsAPI } from "./enhanced-conditions-api.js";

export class DeprecatedAPI {

    /**
     * Apply the named condition to the provided entities (Actors or Tokens)
     * @deprecated
     * @param  {...any} params 
     * @see EnhancedConditions#addCondition
     * @see EnhancedConditions#removeCondition
     */
    static async apply_status(target, status_name, final_state = true, overlay = false, additionalData) {
        Sidekick.consoleMessage("warn", BUTLER.NAME, {message: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.Deprecation.apply_status`)});
        const allowDuplicates = additionalData ? additionalData.force : false;
        if (final_state) {
            return await EnhancedConditionsAPI.addCondition(status_name, target, {allowDuplicates: allowDuplicates, forceOverlay: overlay, effectOptions: additionalData});
        } else {
            return await EnhancedConditionsAPI.removeCondition(status_name, target);
        }
    }

    /**
     * Apply the named condition to the provided entities (Actors or Tokens)
     * @deprecated
     * @param  {...any} params 
     * @see EnhancedConditions#addCondition
     * @see EnhancedConditions#removeCondition
     */
    static async toggle_status(target, status_name, final_state = true, overlay = false, additionalData) {
        Sidekick.consoleMessage("warn", BUTLER.NAME, {message: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.Deprecation.toggle_status`)});
        if (final_state) {
            return await EnhancedConditionsAPI.addCondition(status_name, target, {forceOverlay: overlay});
        } else {
            return await EnhancedConditionsAPI.removeCondition(status_name, target);
        }
    }
    
    /**
     * Apply the named condition to the provided entities (Actors or Tokens)
     * @deprecated
     * @param  {...any} params 
     * @see EnhancedConditions#hasCondition
     */
    static async check_status(target, status_name) {
        Sidekick.consoleMessage("warn", BUTLER.NAME, {message: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.Deprecation.check_status`)});
        return await EnhancedConditionsAPI.hasCondition(status_name, target);
    }
    
    /**
     * Apply the named condition to the provided entities (Actors or Tokens)
     * @deprecated
     * @param  {...any} params 
     * @see EnhancedConditions#getCondition
     */
    static async get_condition(condition_name) {
        Sidekick.consoleMessage("warn", BUTLER.NAME, {message: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.Deprecation.get_condition`)});
        return await EnhancedConditionsAPI.getCondition(condition_name);
    }
    
    /**
     * Apply the named condition to the provided entities (Actors or Tokens)
     * @deprecated
     * @param  {...any} params 
     * @see EnhancedConditions#getConditionFrom
     */
    static async get_condition_from(target, status_name) {
        Sidekick.consoleMessage("warn", BUTLER.NAME, {message: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.Deprecation.get_condition_from`)});
        return await EnhancedConditionsAPI.getConditionFrom(status_name, target);
    }
}