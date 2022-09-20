/* globals game, renderTemplate, ChatMessage */

import { SUCC_DEFAULT_SWADE_LINKS, SUCC_DEFAULT_SWPF_LINKS_NEW, SUCC_DEFAULT_SWADE_LINKS_106 } from "./default_mappings.js";


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
    const conditionName = condition.label
    const conditionIcon = condition.icon

    let state = game.i18n.localize("SUCC.added")
    if (removed === true) {
        state = game.i18n.localize("SUCC.removed")
    }

    // Get the journal link from the default mapping for SWADE/SWPF:
    let journalLink
    let hasReference = false
    if (game.modules.get("swpf-core-rules")?.active) {
        if (condition.flags?.core?.statusId in SUCC_DEFAULT_SWPF_LINKS_NEW) {
            journalLink = SUCC_DEFAULT_SWPF_LINKS_NEW[condition.flags.core.statusId]
            hasReference = true
        }
    } else if (game.modules.get("swade-core-rules")?.active && (game.modules.get("swade-core-rules").data.version === "1.0.6" || game.modules.get("swade-core-rules").data.version === "1.0.7") ) { //temporary solution for changed IDs in SWADE core 1.0.6
        if (condition.flags?.core?.statusId in SUCC_DEFAULT_SWADE_LINKS_106) {
            journalLink = SUCC_DEFAULT_SWADE_LINKS_106[condition.flags.core.statusId]
            hasReference = true
        }
    } else if (game.modules.get("swade-core-rules")?.active) {
        if (condition.flags?.core?.statusId in SUCC_DEFAULT_SWADE_LINKS) {
            journalLink = SUCC_DEFAULT_SWADE_LINKS[condition.flags.core.statusId]
            hasReference = true
        }
    }

    // Add the journal link if found, otherwise just use the name of the condition:
    let conditionAndLink = conditionName
    if (journalLink) {
        conditionAndLink = `${journalLink}{${conditionName}}`
    }
    const last_message = game.messages.contents[game.messages.size - 1]
    if (last_message && last_message.flags.hasOwnProperty("succ") &&
            last_message.speaker.alias === actorOrTokenName &&
            last_message.flags.succ.state === state) {
        // We can Merge with the last message
        let content = last_message.content
        const variables = {conditionID, conditionIcon, conditionName,
            hasReference, conditionAndLink, removed}
        const new_li = await renderTemplate(
            "modules/succ/templates/condition_line.hbs", variables)
        const las_ul_position = content.indexOf("</ul>")
        content = content.substring(0,las_ul_position)
        content += new_li
        last_message.update({content: content})
    } else {
        const template = "modules/succ/templates/condition-to-chat.hbs"
        const variables = {
            state,
            actorOrTokenID,
            conditionID,
            conditionName,
            conditionIcon,
            hasReference,
            conditionAndLink,
            removed
        }
        let chatContent = await renderTemplate(template, variables)
        ChatMessage.create({
            speaker: {
                alias: actorOrTokenName
            },
            content: chatContent,
            user: userID,
            flags: {
                succ: variables
            }
        })
    }
}
