// Init script
/* globals Hooks, console, CONFIG */

/** Stuff to remember:
 * Turn on hooks: CONFIG.debug.hooks = true;
 * Turn off hooks: CONFIG.debug.hooks = false; (d'oh!)
 */

import {SUCC_DEFAULT_MAPPING} from "./default_mappings.js";

Hooks.on(`ready`, () => {
    console.log('SWADE Ultimate Condition Changer | Ready');
    change_conditions();
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

    ChatMessage.create({
        speaker: {
            alias: actorOrTokenName
        },
        content: `${createOrDelete} ${conditionName}.`
    })
}