// Init script
/* globals Hooks, console, CONFIG, ChatMessage, game */

/** Stuff to remember:
 * Turn on hooks: CONFIG.debug.hooks = true;
 * Turn off hooks: CONFIG.debug.hooks = false; or just reload the browser
 */

import { SUCC_DEFAULT_MAPPING, SUCC_DEFAULT_SWADE_LINKS, SUCC_DEFAULT_SWPF_LINKS } from "./default_mappings.js";
import { register_settings } from "./settings.js"

Hooks.on(`ready`, () => {
    console.log('SWADE Ultimate Condition Changer | Ready');
    register_settings();
    change_conditions();

    /* Need to find the Enhanced Conditions setting first, so that CUB can be used without.
    if (game.modules.get("combat-utility-belt")?.active) {
        new Dialog({
            title: "Incompatibility Warning",
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
    const state = game.i18n.localize("SUCC.added");
    output_to_chat(condition, state);
});
Hooks.on(`deleteActiveEffect`, (condition, _, __) => {
    // __ is the ID of the user who executed the hook, possibly irrelevant in this context.
    const state = game.i18n.localize("SUCC.removed");
    output_to_chat(condition, state);
});
Hooks.on (`updateActiveEffect`, (condition, toggle, _, __) => {
    // __ is the ID of the user who executed the hook, possibly irrelevant in this context.
    let state;
    if (toggle.disabled === true) {
        state = game.i18n.localize("SUCC.removed");
    } else if (toggle.disabled === false) {
        state = game.i18n.localize("SUCC.added");
    }
    output_to_chat(condition, state);
})

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
                console.log(json_icons)
            }
        }
    }
}

async function add_conditions() {
    // Add custom conditions:
}

function output_to_chat(condition, state) {
    //console.log(condition);
    let actorOrTokenName = condition.parent.name;
    if (condition.parent.parent) {
        // Use the tokens name if unlinked:
        actorOrTokenName = condition.parent.parent.name;
    }
    const conditionName = condition.data.label;
    const icon = condition.data.icon;

    // Get the journal link from the default mapping for SWADE/SWPF:
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

    // Add the journal link if found, otherwise just use the name of the condition:
    let conditionAndLink = conditionName;
    if (journalLink) {
        conditionAndLink = `${journalLink}{${conditionName}}`;
    }

    // Chat message content soon to be replaced by a template... hopefully.
    ChatMessage.create({
        speaker: {
            alias: actorOrTokenName
        },
        content: `${state} ${conditionAndLink}.`
    })
}