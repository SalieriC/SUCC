import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { BoostLowerDialog } from "./boost-lower-dialog.js";
import { EnhancedConditions } from "./enhanced-conditions.js";

/**
 * API functions for using the various EnhancedConditions dialogs
 */
export class EnhancedConditionsAPIDialogs {

    /* -------------------------------------------- */
    /*                      API                     */
    /* -------------------------------------------- */

    /**
     * Shows the boost/lower trait dialog and returns the result
     */
    static async boostLowerTraitDialog(actor, type) {
        let result = await new BoostLowerDialog({actor: actor, type: type}).wait();
        return result;
    }

    /**
     * Shows the smite dialog and returns the result
     */
    static async smiteDialog(actor) {
        let condition = EnhancedConditions.lookupConditionById("smite");

        //Get the list of weapons this actor owns
        const weapons = actor.items.filter(i => i.type === "weapon");
        if (weapons.length === 0) {
            return ui.notifications.warn(`${game.i18n.localize("ENHANCED_CONDITIONS.Dialog.NoWeapons")}`);
        }

        //Build the options list for the dialog from our list of weapons
        let weapOptions;
        for (let weapon of weapons) {
            weapOptions = weapOptions + `<option value="${weapon.name}">${weapon.name}</option>`
        }

        const smiteData = { condition, weapOptions };
        const content = await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.smiteDialog, smiteData);

        let result = await foundry.applications.api.DialogV2.wait({
            window: { title: game.i18n.localize("ENHANCED_CONDITIONS.Dialog.SmiteBuilder.Name") },
            position: { width: 400 },
            content: content,
            classes: ["succ-dialog"],
            rejectClose: false,
            buttons: [
                {
                    label: game.i18n.localize("ENHANCED_CONDITIONS.Dialog.Apply"),
                    action: "apply",
                    callback: (event, button, dialog) => {
                        let selectedWeaponName = dialog.querySelector("#weapon").value;
                        let damageBonus = dialog.querySelector("#damageBonus").value;
                        if (damageBonus[0] != '+') { damageBonus = '+' + damageBonus; }
                        return { weapon: selectedWeaponName, bonus: damageBonus };
                    }
                },
                {
                    label: game.i18n.localize("ENHANCED_CONDITIONS.Dialog.Cancel"),
                    action: "cancel",
                    callback: () => false
                }
            ]
        });
        return result;
    }

    /**
     * Shows the protection dialog and returns the result
     */
    static async protectionDialog() {
        let condition = EnhancedConditions.lookupConditionById("protection");
        const protectionData = { condition };
        const content = await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.protectionDialog, protectionData);

        let result = await foundry.applications.api.DialogV2.wait({
            window: { title: game.i18n.localize("ENHANCED_CONDITIONS.Dialog.ProtectionBuilder.Name") },
            position: { width: 400 },
            content: content,
            classes: ["succ-dialog"],
            rejectClose: false,
            buttons: [
                {
                    label: game.i18n.localize("SWADE.Armor"),
                    action: "armor",
                    callback: (event, button, dialog) => {
                        let protectionAmount = Number(dialog.querySelector("#protectionAmount").value);
                        return { bonus: protectionAmount, type: "armor" };
                    }
                },
                {
                    label: game.i18n.localize("SWADE.Tough"),
                    action: "toughness",
                    callback: (event, button, dialog) => {
                        let protectionAmount = Number(dialog.querySelector("#protectionAmount").value);
                        return { bonus: protectionAmount, type: "toughness" };
                    }
                },
                {
                    label: game.i18n.localize("ENHANCED_CONDITIONS.Dialog.Cancel"),
                    action: "cancel",
                    callback: () => false
                }
            ]
        });
        return result;
    }

    /**
     * Shows the deflection dialog and returns the result
     */
    static async deflectionDialog() {
        let condition = EnhancedConditions.lookupConditionById("deflection");
        const deflectionData = { condition };
        const content = await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.deflectionDialog, deflectionData);

        let result = await foundry.applications.api.DialogV2.wait({
            window: { title: game.i18n.localize("ENHANCED_CONDITIONS.Dialog.DeflectionBuilder.Name") },
            position: { width: 400 },
            content: content,
            classes: ["succ-dialog"],
            rejectClose: false,
            buttons: [
                {
                    label: game.i18n.localize("ENHANCED_CONDITIONS.Dialog.DeflectionBuilder.Melee"),
                    action: "Melee",
                    callback: () => { return { type: "Melee" }; }
                },
                {
                    label: game.i18n.localize("ENHANCED_CONDITIONS.Dialog.DeflectionBuilder.Ranged"),
                    action: "Ranged",
                    callback: () => { return { type: "Ranged" }; }
                },
                {
                    label: game.i18n.localize("ENHANCED_CONDITIONS.Dialog.DeflectionBuilder.Raise"),
                    action: "Raise",
                    callback: () => { return { type: "Raise" }; }
                },
                {
                    label: game.i18n.localize("ENHANCED_CONDITIONS.Dialog.Cancel"),
                    action: "cancel",
                    callback: () => false
                }
            ]
        });
        return result;
    }
}