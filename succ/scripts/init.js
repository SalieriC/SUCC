// Init script
/* globals Hooks, console, CONFIG */

/** Stuff to remember:
 * Turn on hooks: CONFIG.debug.hooks = true;
 * Turn off hooks: CONFIG.debug.hooks = false; (d'oh!)
 */

import { SUCC_DEFAULT_MAPPING } from "./default_mappings.js";
import { SUCC_DEFAULT_SWADE_LINKS } from "./default_mappings.js";
import { SUCC_DEFAULT_SWPF_LINKS } from "./default_mappings.js";

Hooks.on(`ready`, () => {
    console.log('SWADE Ultimate Condition Changer | Ready');
    change_conditions();

    /*
    if (game.modules.get("combat-utility-belt")?.active) {
        new Dialog({
            title: "Incokmpatibility Warning",
            content: `
            <p>Warning, SUCC is incompatible with Combat Utility Belts Enhanced Conditions feature.</p>
            <p>Make sure Enhanced Conditions in CUB are turned off.</p>
            <p>You'll see this message on each login so make sure you obey my command or disable SUCC and leave an angry issue on the gitHub. :D</p>
            `,
            buttons: {
                done: {
                    label: "Got it!",
                }
            }
        }).render(true)
    }
    */
});

// Listening to hooks for creating the chat messages
Hooks.on(`createActiveEffect`, (condition, _, __) => {
    // __ is the ID of the user who executed the hook, possibly irrelevant in this context.
    const createOrDelete = game.i18n.localize("SUCC.added");
    output_to_chat(condition, createOrDelete);
});
Hooks.on(`deleteActiveEffect`, (condition, _, __) => {
    // __ is the ID of the user who executed the hook, possibly irrelevant in this context.
    const createOrDelete = game.i18n.localize("SUCC.removed");
    output_to_chat(condition, createOrDelete);
});

function change_conditions() {
    for (let status of CONFIG.statusEffects) {
        if (status.id in SUCC_DEFAULT_MAPPING) {
            status.icon = SUCC_DEFAULT_MAPPING[status.id]
        }
    }
}

async function add_conditions() {
    // Add custom conditions:
}

async function output_to_chat(condition, createOrDelete) {
    //console.log(condition);
    let actorOrTokenName = condition.parent.name;
    if (condition.parent.parent) {
        // Use the tokens name if unlinked:
        actorOrTokenName = condition.parent.parent.name;
    }
    const conditionName = condition.data.label;
    const icon = condition.data.icon;
    let journalLink;
    if (game.modules.get("swpf-core-rules")?.active) {
        if (condition.data.flags?.core?.statusId in SUCC_DEFAULT_SWPF_LINKS) {
            journalLink = SUCC_DEFAULT_SWPF_LINKS[condition.data.flags.core.statusId]
        }
    } else if (game.modules.get("swade-core-rules")?.active) {
        if (condition.data.flags?.core?.statusId in SUCC_DEFAULT_SWADE_LINKS) {
            journalLink = SUCC_DEFAULT_SWADE_LINKS[condition.data.flags.core.statusId]
        }
    }

    let conditionAndLink = conditionName;
    if (journalLink) {
        conditionAndLink = `${journalLink}{${conditionName}}`;
    }

    ChatMessage.create({
        speaker: {
            alias: actorOrTokenName
        },
        content: `${createOrDelete} ${conditionAndLink}.`
    })
}