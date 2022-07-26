// Init script
/* globals Hooks, console, CONFIG, ChatMessage, game */

/** Stuff to remember:
 * Turn on hooks: CONFIG.debug.hooks = true;
 * Turn off hooks: CONFIG.debug.hooks = false; or just reload the browser
 */

import { SUCC_DEFAULT_MAPPING, SUCC_DEFAULT_ADDITIONAL_CONDITIONS } from "./default_mappings.js";
import { register_settings } from "./settings.js"
import { output_to_chat } from "./conditions_to_chat.js"
import { effect_updater } from "./effect_updater.js"

//-----------------------------------------------------
// Stuff to do on logging in:
Hooks.on(`ready`, () => {
    console.log('SWADE Ultimate Condition Changer | Ready');
    register_settings();
    if (game.settings.get('succ', 'default_icons') === false) {
        change_conditions();
    }
    add_conditions();
    conditions_deep_change();
    // Registering templates:
    const templatePaths = ["modules/succ/templates/condition-to-chat.hbs",
        "modules/succ/templates/condition_line.hbs"]
    loadTemplates(templatePaths)

    if (game.modules.get("combat-utility-belt")?.active) {
        new Dialog({
            title: "Incompatibility Warning",
            content: `
            <p>Warning, SUCC is incompatible with Combat Utility Belt.</p>
            <p>Disable Combat Utility Belt in the module settings to avoid bad things from happening.</p>
            <p>You'll see this message on each login so make sure you obey my command or disable SUCC and leave an angry issue on the gitHub. :D</p>
            `,
            buttons: {
                done: {
                    label: "Got it!",
                }
            }
        }).render(true)
    }
    //Add Conditions w/o setting:
    CONFIG.statusEffects.splice(15, 0, { id: "the-drop", label: game.i18n.localize("SUCC.condition.the_drop"), icon: "modules/succ/assets/icons/2-the_drop.svg" })
    //Add Boost/Lower Conditions:
    if (game.settings.get('succ', 'boost_lower') === true) {
        CONFIG.statusEffects.push({ id: "boost", label: game.i18n.localize("SUCC.condition.boost"), icon: "modules/succ/assets/icons/m-boost.svg" });
        CONFIG.statusEffects.push({ id: "lower", label: game.i18n.localize("SUCC.condition.lower"), icon: "modules/succ/assets/icons/m-lower.svg" });
    }

    // Disable Shaken removal dialogue
    if (game.settings.get('succ', 'disable_status_dialogue') /*&& game.user.isGM*/) {
        for (let status of CONFIG.SWADE.statusEffects) {
            if (status.id === 'shaken' || status.id === 'stunned') {
                status.flags.swade.expiration = null
            }
        }
    }
});

//-----------------------------------------------------
// To avoid spamming the chat, implement a collecting debouncer outside of the hooks like here: https://discord.com/channels/170995199584108546/722559135371231352/941704126272770118
// Listening to hooks for creating the chat messages:
Hooks.on(`createActiveEffect`, async (condition, _, userID) => {
    if ((condition.data.flags?.core?.statusId in SUCC_DEFAULT_MAPPING ||
        condition.data.flags?.core?.statusId in SUCC_DEFAULT_ADDITIONAL_CONDITIONS) &&
        game.settings.get('succ', 'output_to_chat') === true &&
        game.user.isGM === true) {
        const removed = false
        output_to_chat(condition, removed, userID)
    }
    if (condition.data.flags?.core?.statusId === "smite" ||
        condition.data.flags?.core?.statusId === "protection" ||
        condition.data.flags?.core?.statusId === "boost" ||
        condition.data.flags?.core?.statusId === "lower") {
        effect_updater(condition, userID)
    }
    if (condition.data.flags?.core?.statusId === "incapacitated" && game.settings.get('succ', 'mark_inc_defeated') === true) {
        let actor = condition.parent
        if (actor.data.type === "npc" && game.user.isGM) {
            game.combat?.combatants.forEach(combatant => {
                if (combatant.token.id === actor.token.id) {
                    game.combat.updateEmbeddedDocuments('Combatant',
                        [{ _id: combatant.id, defeated: true }]);
                }
            });
        }
    }
});
Hooks.on(`deleteActiveEffect`, async (condition, _, userID) => {
    // __ is the ID of the user who executed the hook, possibly irrelevant in this context.
    if ((condition.data.flags?.core?.statusId in SUCC_DEFAULT_MAPPING ||
        condition.data.flags?.core?.statusId in SUCC_DEFAULT_ADDITIONAL_CONDITIONS) &&
        game.settings.get('succ', 'output_to_chat') === true &&
        game.user.isGM === true) {
        const removed = true
        output_to_chat(condition, removed, userID)
    }
    if (condition.data.flags?.core?.statusId === "incapacitated" && game.settings.get('succ', 'mark_inc_defeated') === true) {
        let actor = condition.parent
        if (actor.data.type === "npc" && game.user.isGM) {
            game.combat?.combatants.forEach(combatant => {
                if (combatant.token.id === actor.token.id) {
                    game.combat.updateEmbeddedDocuments('Combatant',
                        [{ _id: combatant.id, defeated: false }]);
                }
            });
        }
    }
});
Hooks.on(`updateActiveEffect`, (condition, toggle, _, userID) => {
    // __ is the ID of the user who executed the hook, possibly irrelevant in this context.
    if ((condition.data.flags?.core?.statusId in SUCC_DEFAULT_MAPPING ||
        condition.data.flags?.core?.statusId in SUCC_DEFAULT_ADDITIONAL_CONDITIONS) &&
        game.settings.get('succ', 'output_to_chat') === true &&
        game.user.isGM === true) {
        // Checking for the updated flag to prevent a repetitive message:
        if (condition.data.flags?.succ?.updatedAE === true) {
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

// Add buttons to the chat message:
Hooks.on("renderChatMessage", (message, html) => {
    const undo_div = html[0].querySelector("div.undo-remove.succ-undo")
    const redo_div = html[0].querySelector("div.remove-row.succ-remove")
    if (undo_div) {
        undo_div.addEventListener("click", () => {
            let actorOrTokenID = message.data.flags.succ.actorOrTokenID
            let condition = message.data.flags.succ.conditionName.toLowerCase().replace(" - ", "-").replace(" ", "-")
            succ.apply_status(actorOrTokenID, condition, true)
        });
    } else if (redo_div) {
        redo_div.addEventListener("click", () => {
            let actorOrTokenID = message.data.flags.succ.actorOrTokenID
            let condition = message.data.flags.succ.conditionName.toLowerCase().replace(" - ", "-").replace(" ", "-")
            succ.apply_status(actorOrTokenID, condition, false)
        });
    }
});
//-----------------------------------------------------

//-----------------------------------------------------
// Changing and adding condition icons
function change_conditions() {
    for (let status of CONFIG.statusEffects) {
        if (status.id in SUCC_DEFAULT_MAPPING) {
            status.icon = SUCC_DEFAULT_MAPPING[status.id]
        }
    }
    let json_icons = game.settings.get('succ', 'icon_overwrites')
    if (json_icons) {
        json_icons = JSON.parse(json_icons)
        for (let status of CONFIG.statusEffects) {
            if (status.id in json_icons) {
                status.icon = json_icons[status.id]
                //console.log(json_icons)
            }
        }
    }
}

function conditions_deep_change() {
    const json_modify_conditions = game.settings.get('succ', 'modify_status')
    if (json_modify_conditions) {
        const json_conditions = JSON.parse(json_modify_conditions)
        let change_conditions = {}
        for (let i = 0; i < CONFIG.statusEffects.length; i++) {
            //console.log(i, CONFIG.statusEffects[i])
            if (CONFIG.statusEffects[i].id in json_conditions) {
                const new_obj = {...CONFIG.statusEffects[i],
                    ...json_conditions[CONFIG.statusEffects[i].id]}
                //console.log(new_obj)
                change_conditions[i] = new_obj
            }
        }
        //console.log(change_conditions)
        if (change_conditions) {
            for (let change in change_conditions) {
                CONFIG.statusEffects[change] = change_conditions[change]
            }
        }
    }
}

async function add_conditions() {
    // Add custom conditions:
    //CONFIG.statusEffects.push({ id: "irradiated", label: "Irradiated", icon: "modules/succ/assets/icons/0-irradiated.svg" });
}
//-----------------------------------------------------