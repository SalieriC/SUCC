/* -------------------------------------------- */
/*                    Imports                   */
/* -------------------------------------------- */
import * as BUTLER from "./butler.js";
import { Sidekick } from "./sidekick.js";
import { registerSettings } from "./settings.js";

/* ------------------ Gadgets ----------------- */

import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";
import { EnhancedConditionsAPI } from "./enhanced-conditions/enhanced-conditions-api.js";

/* ------------------- Utils ------------------ */

import { TokenUtility } from "./utils/token.js";
import { ConditionLab } from "./enhanced-conditions/condition-lab.js";

/* -------------------------------------------- */
/*                     Class                    */
/* -------------------------------------------- */

/**
 * Initiates module classes (and shines a light on the dark night sky)
 */
export class Signal {
    /**
     * Registers hooks
     */
    static lightUp() {

        /* -------------------------------------------- */
        /*                    System                    */
        /* -------------------------------------------- */

        /* ------------------- Init/Ready ------------------- */

        Hooks.on("init", () => {
            // Assign the namespace Object if it already exists or instantiate it as an object if not
            game.succ = game.succ ?? {};
            ui.succ = ui.succ ?? {};

            // Execute housekeeping
            Sidekick.showCUBWarning();
            Sidekick.handlebarsHelpers();
            Sidekick.jQueryHelpers();
            Sidekick.loadTemplates();
            registerSettings();

            // Instantiate gadget classes
            game.succ.enhancedConditions = new EnhancedConditions();

            // Instantiate utility classes
            game.succ.tokenUtility = new TokenUtility();
            
            // Handle any monkeypatching
            const effectSize = Sidekick.getSetting(BUTLER.SETTING_KEYS.tokenUtility.effectSize);
            
            if (effectSize) {
                TokenUtility.patchCore();
            }

            // Expose API methods
            game.succ.getCondition = EnhancedConditionsAPI.getCondition;
            game.succ.getConditionFrom = EnhancedConditionsAPI.getConditionFrom;
            game.succ.getConditions = EnhancedConditionsAPI.getConditions;
            game.succ.getConditionEffects = EnhancedConditionsAPI.getConditionEffects;
            game.succ.hasCondition = EnhancedConditionsAPI.hasCondition;
            game.succ.addCondition = EnhancedConditionsAPI.addCondition;
            game.succ.removeCondition = EnhancedConditionsAPI.removeCondition;
            game.succ.removeAllConditions = EnhancedConditionsAPI.removeAllConditions;
            game.succ.toggleCondition = EnhancedConditionsAPI.toggleCondition;
            game.succ.removeTemporaryEffects = EnhancedConditionsAPI.removeTemporaryEffects;
        });

        Hooks.on("ready", () => {
            EnhancedConditions._onReady();       
        });

        /* -------------------------------------------- */
        /*                    Entity                    */
        /* -------------------------------------------- */

        /* ------------------- Actor ------------------ */

        Hooks.on("createActiveEffect", (effect, options, userId) => {
            EnhancedConditions._onCreateActiveEffect(effect, options, userId);
        });

        Hooks.on("deleteActiveEffect", (effect, options, userId) => {
            EnhancedConditions._onDeleteActiveEffect(effect, options, userId);
        });

        Hooks.on("updateActor", (tokenDocument, updateData, options, userId) => {
            EnhancedConditions._onUpdateActor(tokenDocument, updateData, options, userId);
        });

        /* -------------------------------------------- */
        /*                    Render                    */
        /* -------------------------------------------- */

        /* ------------------- Misc ------------------- */

        Hooks.on("renderSettings", (app, html) => {
            Sidekick.createSUCCDiv(html);
            EnhancedConditions._createLabButton(html);
            EnhancedConditions._toggleLabButtonVisibility(true);
        });

        /* ------------------- Chat ------------------- */

        Hooks.on("renderChatLog", (app, html, data) => {
            EnhancedConditions._onRenderChatLog(app, html, data);
        });

        Hooks.on("renderChatMessage", (app, html, data) => {
            EnhancedConditions._onRenderChatMessage(app, html, data);
        });
        
        Hooks.on("renderDialog", (app, html, data) => {
            switch (app.title) {
                case game.i18n.localize("COMBAT.EndTitle"):
                    break;
                
                case game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.ConditionLab.SortDirectionSave.Title`):
                    ConditionLab._onRenderSaveDialog(app, html, data);
                    break;

                default:
                    break;
            }
        });
        
        /* -------------- Combat Tracker -------------- */

        Hooks.on("renderCombatTracker", (app, html, data) => {
            EnhancedConditions._onRenderCombatTracker(app, html, data);
        });

        /* ---------------- Custom Apps --------------- */

        Hooks.on("renderConditionLab", (app, html, data) => {
            ConditionLab._onRender(app, html, data);
        });
    }
}