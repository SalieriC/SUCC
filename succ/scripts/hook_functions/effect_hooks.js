import { output_to_chat } from "../conditions_to_chat.js";
import { SUCC_DEFAULT_MAPPING, SUCC_DEFAULT_ADDITIONAL_CONDITIONS } from "../default_mappings.js";

export async function effect_hooks() {
    //-----------------------------------------------------
    // To avoid spamming the chat, implement a collecting debouncer outside of the hooks like here: https://discord.com/channels/170995199584108546/722559135371231352/941704126272770118
    // Listening to hooks for creating the chat messages:
    Hooks.on(`createActiveEffect`, async (condition, _, userID) => {
        if ((condition.flags?.core?.statusId in SUCC_DEFAULT_MAPPING ||
            condition.flags?.core?.statusId in SUCC_DEFAULT_ADDITIONAL_CONDITIONS) &&
            game.settings.get('succ', 'output_to_chat') === true &&
            game.user.isGM === true) {
            const removed = false
            output_to_chat(condition, removed, userID)
        }
        if (condition.flags?.core?.statusId === "smite" ||
            condition.flags?.core?.statusId === "protection" ||
            condition.flags?.core?.statusId === "boost" ||
            condition.flags?.core?.statusId === "lower") {
            effect_updater(condition, userID)
        }
        if (condition.flags?.core?.statusId === "incapacitated" && game.settings.get('succ', 'mark_inc_defeated') === true) {
            let actor = condition.parent
            if (actor.type === "npc" && game.user.isGM) {
                game.combat?.combatants.forEach(combatant => {
                    if (combatant.token.id === actor.token.id) {
                        game.combat.updateEmbeddedDocuments('Combatant',
                            [{ _id: combatant.id, defeated: true }]);
                    }
                });
            }
        }
        if (condition.flags?.core?.statusId === "conviction") {
            const actor = condition.parent
            if (actor.system.details.conviction.active === true) {
                //Condition was toggled due to click on the actor sheet.
                return
            } else if (actor.system.details.conviction.value >= 1 && actor.system.details.conviction.active === false) {
                //Condition was toggled instead of the button on the actor sheet and actor has at least one conviction token.
                const currValue = actor.system.details.conviction.value
                await actor.update({
                    "system.details.conviction.value": currValue -1,
                    "system.details.conviction.active": true
                })
                ChatMessage.create({
                    speaker: {
                      actor: actor.id,
                      alias: actor.name,
                    },
                    content: game.i18n.localize('SWADE.ConvictionActivate'),
                })
                //Add the same flags as if toggled from the sheet:
                await condition.update({
                    flags: {
                        succ: {
                            updatedAE: true,
                            userId: userID,
                        }
                    }
                })
            } else if (actor.system.details.conviction.value < 1 && actor.system.details.conviction.active === false) {
                //Condition was toggled instead of the button on the actor sheet but actor has no conviction tokens.
                ui.notifications.warn(game.i18n.localize("SUCC.notification.no_conviction_token_left"))
                await succ.apply_status(actor, 'conviction', false)
            }
        }
    });
    Hooks.on(`deleteActiveEffect`, async (condition, _, userID) => {
        // __ is the ID of the user who executed the hook, possibly irrelevant in this context.
        if ((condition.flags?.core?.statusId in SUCC_DEFAULT_MAPPING ||
            condition.flags?.core?.statusId in SUCC_DEFAULT_ADDITIONAL_CONDITIONS) &&
            game.settings.get('succ', 'output_to_chat') === true &&
            game.user.isGM === true) {
            const removed = true
            output_to_chat(condition, removed, userID)
        }
        if (condition.flags?.core?.statusId === "incapacitated" && game.settings.get('succ', 'mark_inc_defeated') === true) {
            let actor = condition.parent
            if (actor.type === "npc" && game.user.isGM) {
                game.combat?.combatants.forEach(combatant => {
                    if (combatant.token.id === actor.token.id) {
                        game.combat.updateEmbeddedDocuments('Combatant',
                            [{ _id: combatant.id, defeated: false }]);
                    }
                });
            }
        }
        if (condition.flags?.core?.statusId === "conviction") {
            const actor = condition.parent
            if (actor.system.details.conviction.active === false) {
                //Condition was toggled due to click on the actor sheet.
                return
            } else if (actor.system.details.conviction.active === true) {
                //Condition was toggled instead of the button on the actor sheet.
                await actor.update({
                    "system.details.conviction.active": false
                })
                ChatMessage.create({
                    speaker: {
                      actor: actor.id,
                      alias: actor.name,
                    },
                    content: `${actor.name} ${game.i18n.localize('SWADE.ConvictionEnd')}`,
                })
            }
        }
    });
    Hooks.on(`updateActiveEffect`, (condition, toggle, _, userID) => {
        // __ is the ID of the user who executed the hook, possibly irrelevant in this context.
        if ((condition.flags?.core?.statusId in SUCC_DEFAULT_MAPPING ||
            condition.flags?.core?.statusId in SUCC_DEFAULT_ADDITIONAL_CONDITIONS) &&
            game.settings.get('succ', 'output_to_chat') === true &&
            game.user.isGM === true) {
            // Checking for the updated flag to prevent a repetitive message:
            if (condition.flags?.succ?.updatedAE === true) {
                return
            }

            let removed
            if (toggle.disabled === true) {
                removed = true
            } else if (toggle.disabled === false) {
                removed = false
            }
            output_to_chat(condition, removed, userID);
        }
    })
}