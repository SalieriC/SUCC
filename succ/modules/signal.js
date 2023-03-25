/* -------------------------------------------- */
/*                    Imports                   */
/* -------------------------------------------- */
import * as BUTLER from "./butler.js";
import { Sidekick } from "./sidekick.js";
import { registerSettings } from "./settings.js";

/* ------------------ Gadgets ----------------- */

import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";

/* ------------------- Utils ------------------ */

import { TokenUtility } from "./utils/token.js";
import { ActorUtility } from "./utils/actor.js";
import { ConditionLab } from "./enhanced-conditions/condition-lab.js";
import MigrationHelper from "./utils/migration.js";

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
            game.succ.getCondition = EnhancedConditions.getCondition;
            game.succ.getConditionFrom = EnhancedConditions.getConditionFrom;
            game.succ.getConditions = EnhancedConditions.getConditions;
            game.succ.getConditionEffects = EnhancedConditions.getConditionEffects;
            game.succ.hasCondition = EnhancedConditions.hasCondition;
            game.succ.addCondition = EnhancedConditions.addCondition;
            game.succ.removeCondition = EnhancedConditions.removeCondition;
            game.succ.removeAllConditions = EnhancedConditions.removeAllConditions;

        });

        Hooks.on("ready", () => {
            EnhancedConditions._onReady();
            MigrationHelper._onReady();          
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

        /* ------------------- Token ------------------ */

        Hooks.on("preUpdateToken", (tokenDocument, updateData, options, userId) => {
            EnhancedConditions._onPreUpdateToken(tokenDocument, updateData, options, userId);
        });

        Hooks.on("updateToken", (tokenDocument, updateData, options, userId) => {
            EnhancedConditions._onUpdateToken(tokenDocument, updateData, options, userId);
        });

        /* -------------------------------------------- */
        /*                    Render                    */
        /* -------------------------------------------- */

        /* ------------------- Misc ------------------- */

        Hooks.on("renderSettings", (app, html) => {
            Sidekick.createCUBDiv(html);
            EnhancedConditions._createLabButton(html);
            EnhancedConditions._toggleLabButtonVisibility(Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.enable));
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
                
                case game.i18n.localize(`ENHANCED_CONDITIONS.Lab.RestoreDefaultsTitle`):
                    ConditionLab._onRenderRestoreDefaultsDialog(app, html, data);
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