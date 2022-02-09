// Init script
/* globals Hooks, console, CONFIG */

import {SUCC_DEFAULT_MAPPING} from "./default_mappings.js";

Hooks.on(`ready`, () => {
    console.log('SWADE Ultimate Condition Changer | Ready');
    change_conditions();
});

function change_conditions() {
    for (let status of CONFIG.statusEffects) {
        if (status.id in SUCC_DEFAULT_MAPPING) {
            status.icon = SUCC_DEFAULT_MAPPING[status.id]
        }
    }
}

async function add_conditions() {
    //Add custom conditions:
}