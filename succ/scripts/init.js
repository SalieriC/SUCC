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
import { actor_hooks } from "./hook_functions/actor_hooks.js"
import { effect_hooks } from "./hook_functions/effect_hooks.js";

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

    //Changing and adding current status effects:
    const fightingSkill = game.settings.get("swade", "parryBaseSkill")
    if (game.settings.get('swade', 'enableConviction') === true) {
        CONFIG.statusEffects.splice(7, 0, { id: "conviction", label: game.i18n.localize("SWADE.Conv"), icon: "modules/succ/assets/icons/1-conviction.svg" });
    }
    for (let status of CONFIG.statusEffects) {
        if (status.id === 'prone') {
            status.changes = [{
                "key": "system.stats.parry.value",
                "value": "-2",
                "mode": 2
            },
            {
                "key": `@Skill{${fightingSkill}}[system.die.modifier]`,
                "value": "-2",
                "mode": 2
            }]
        } if (status.id === "frightened") {
            status.changes = [{
                "key": "system.initiative.hasHesitant",
                "value": "true",
                "mode": 5
            }]
        }
    }

    // Disable Shaken removal dialogue
    if (game.settings.get('succ', 'disable_status_dialogue') /*&& game.user.isGM*/) {
        game.swade.effectCallbacks.set('shaken', ()=>{})
        game.swade.effectCallbacks.set('stunned', ()=>{})
        game.swade.effectCallbacks.set("bleeding-out", ()=>{})
    }
});

actor_hooks()
effect_hooks()

// Add buttons to the chat message:
Hooks.on("renderChatMessage", (message, html) => {
    const undo_divs = html[0].querySelectorAll("div.undo-remove.succ-undo")
    const redo_divs = html[0].querySelectorAll("div.remove-row.succ-remove")
    if (undo_divs.length) {
        for (let undo_div of undo_divs) {
            undo_div.addEventListener("click", (ev) => {
                const condition = ev.currentTarget.dataset.conditionName.toLowerCase().replace(
                    " - ", "-").replace(" ", "-")
                let actorOrTokenID = message.flags.succ.actorOrTokenID
                succ.apply_status(actorOrTokenID, condition, true)
            });
        }
    } else if (redo_divs.length) {
        console.log(redo_divs)
        for (let redo_div of redo_divs) {
            redo_div.addEventListener("click", (ev) => {
                const condition = ev.currentTarget.dataset.conditionName.toLowerCase().replace(
                    " - ", "-").replace(" ", "-")
                let actorOrTokenID = message.flags.succ.actorOrTokenID
                console.log(condition)
                succ.apply_status(actorOrTokenID, condition, false)
            });
        }
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