import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";

export class DeprecatedAPI {

    /**
     * Apply the named condition to the provided entities (Actors or Tokens)
     * @deprecated
     * @param  {...any} params 
     * @see EnhancedConditions#addCondition
     * @see EnhancedConditions#removeCondition
     */
    static async apply_status(target, status_name, final_state = true, overlay = false, additionalData) {
        Sidekick.consoleMessage("warn", BUTLER.GADGETS.enhancedConditions.name, {message: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.Warnings.apply_status`)});
        const allowDuplicates = additionalData ? additionalData.force : false;
        if (final_state) {
            return EnhancedConditions.addCondition(status_name, target, {allowDuplicates: allowDuplicates});
        } else {
            return EnhancedConditions.removeCondition(status_name, target);
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
        Sidekick.consoleMessage("warn", BUTLER.GADGETS.enhancedConditions.name, {message: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.Warnings.toggle_status`)});
        if (final_state) {
            return EnhancedConditions.addCondition(status_name, target);
        } else {
            return EnhancedConditions.removeCondition(status_name, target);
        }
    }
    
    /**
     * Apply the named condition to the provided entities (Actors or Tokens)
     * @deprecated
     * @param  {...any} params 
     * @see EnhancedConditions#hasCondition
     */
    static async check_status(target, status_name) {
        Sidekick.consoleMessage("warn", BUTLER.GADGETS.enhancedConditions.name, {message: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.Warnings.check_status`)});
        return EnhancedConditions.hasCondition(status_name, target);
    }
    
    /**
     * Apply the named condition to the provided entities (Actors or Tokens)
     * @deprecated
     * @param  {...any} params 
     * @see EnhancedConditions#getCondition
     */
    static async get_condition(condition_name) {
        Sidekick.consoleMessage("warn", BUTLER.GADGETS.enhancedConditions.name, {message: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.Warnings.get_condition`)});
        return EnhancedConditions.getCondition(condition_name);
    }
    
    /**
     * Apply the named condition to the provided entities (Actors or Tokens)
     * @deprecated
     * @param  {...any} params 
     * @see EnhancedConditions#getConditionFrom
     */
    static async get_condition_from(target, status_name) {
        Sidekick.consoleMessage("warn", BUTLER.GADGETS.enhancedConditions.name, {message: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.Warnings.get_condition_from`)});
        return EnhancedConditions.getConditionFrom(status_name, target);
    }
}