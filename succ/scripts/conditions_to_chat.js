import { SUCC_DEFAULT_SWADE_LINKS, SUCC_DEFAULT_SWPF_LINKS } from "./default_mappings.js";

//-----------------------------------------------------
// First, collect all changes:
/*
let conditions = [];
let timer;
function condition_collector(condition) {
    clearTimeout(timer);
    conditions.push(condition);
    setTimeout(test(conditions), 250);
}
function test(conditions) {
    console.log(conditions)
}
*/
// Condition output to chat:
export async function output_to_chat(condition, removed, userID) {
    //console.log(condition);
    let conditionID = condition.id
    let actorOrTokenName = condition.parent.name
    let actorOrTokenID = condition.parent.id
    if (condition.parent.parent) {
        // Use the tokens name if unlinked:
        actorOrTokenName = condition.parent.parent.name
        actorOrTokenID = condition.parent.parent.id
    }
    const conditionName = condition.data.label
    const conditionIcon = condition.data.icon

    let state = game.i18n.localize("SUCC.added")
    if (removed === true) {
        state = game.i18n.localize("SUCC.removed")
    }

    // Get the journal link from the default mapping for SWADE/SWPF:
    let journalLink
    let hasReference = false
    if (game.modules.get("swpf-core-rules")?.active) {
        if (condition.data.flags?.core?.statusId in SUCC_DEFAULT_SWPF_LINKS) {
            journalLink = SUCC_DEFAULT_SWPF_LINKS[condition.data.flags.core.statusId]
            hasReference = true
        }
    } else if (game.modules.get("swade-core-rules")?.active) {
        if (condition.data.flags?.core?.statusId in SUCC_DEFAULT_SWADE_LINKS) {
            journalLink = SUCC_DEFAULT_SWADE_LINKS[condition.data.flags.core.statusId]
            hasReference = true
        }
    }

    // Add the journal link if found, otherwise just use the name of the condition:
    let conditionAndLink = conditionName
    if (journalLink) {
        conditionAndLink = `${journalLink}{${conditionName}}`
    }

    // Rendering template:
    const template = "modules/succ/templates/condition-to-chat.hbs"
    const variables = {
        state,
        actorOrTokenID,
        conditionID,
        conditionName,
        conditionIcon,
        hasReference,
        conditionAndLink,
        removed,
    }
    let chatContent = await renderTemplate(template, variables)

    // Chat message content soon to be replaced by a template... hopefully.
    ChatMessage.create({
        speaker: {
            alias: actorOrTokenName
        },
        content: chatContent,
        user: userID,
        flags: {
            succ: 
                variables/*
                actorOrTokenID: actorOrTokenID,
                conditionName: conditionName*/
            
        }
    })
}
//-----------------------------------------------------