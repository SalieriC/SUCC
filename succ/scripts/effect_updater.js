export async function effect_updater(condition, userID) {
    let actorOrToken = condition.parent

    //console.log(actorOrToken.data.effects)
    if (condition.data.flags?.core?.statusId === "smite" && game.user.id === userID) {
        let appliedCondition = actorOrToken.data.effects.find(function (e) {
            return ((e.data.label === game.i18n.localize("SWADE.Smite")))
        })
        
        const weapons = actorOrToken.data.items.filter(i => i.type === "weapon")
        if (weapons.length === 0) {
            return ui.notifications.warn(`${game.i18n.localize("SUCC.smite.no_weapons")}`)
        }
        let weapOptions
        for (let weapon of weapons) {
            weapOptions = weapOptions + `<option value="${weapon.data.name}">${weapon.data.name}</option>`
        }

        new Dialog({
            title: game.i18n.localize("SUCC.dialogue.smite_builder_name"),
            content: `
            <h2><img src=${condition.data.icon} width="30" height="30" style="border:0;" /> ${game.i18n.localize("SUCC.dialogue.smite_builder_name")}</h2>
            ${game.i18n.localize("SUCC.dialogue.smite_builder_dialogue")}
            <div style="display:flex">
                <p style="flex:3">${game.i18n.localize("SUCC.dialogue.weapon_to_affect")}</p>
                <select id="weapon">${weapOptions}</select>
            </div>
            <div style="display:flex">
                <p style="flex:3">${game.i18n.localize("SUCC.dialogue.amount_to_increase")}</p>
                <input type="number" id="damageBonus" value="2" style="flex:1"/></input>
            </div>
            `,
            buttons: {
                apply: {
                    label: game.i18n.localize("SUCC.dialogue.apply"),
                    callback: async (html) => {
                        //Setting a flag to prevent repetitive chat message:                        
                        appliedCondition.setFlag('succ', 'updatedAE', true)

                        let selectedWeaponName = html.find(`#weapon`)[0].value
                        let damageBonus = Number(html.find("#damageBonus")[0].value)
                        if (damageBonus >= 0) { damageBonus = '+' + damageBonus }

                        appliedCondition.setFlag('swade', 'expiration', 3)
                        let updates = appliedCondition.toObject() //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
                        let change = {key: `@Weapon{${selectedWeaponName}}[data.actions.dmgMod]`, mode: 2, priority: undefined, value: damageBonus}
                        updates.changes = [change]
                        updates.duration.rounds = 5
                        await appliedCondition.update(updates)
                    }
                },
                cancel: {
                    label: game.i18n.localize("SUCC.dialogue.cancel")
                }
            }
        }).render(true)
    } else if (condition.data.flags?.core?.statusId === "protection" && game.user.id === userID) {
        let appliedCondition = actorOrToken.data.effects.find(function (e) {
            return ((e.data.label === game.i18n.localize("SWADE.Protection")))
        })
        //console.log(appliedCondition)
        //Protection stuff
        new Dialog({
            title: game.i18n.localize("SUCC.dialogue.protection_builder_name"),
            content: `
            <h2><img src=${condition.data.icon} width="30" height="30" style="border:0;" /> ${game.i18n.localize("SUCC.dialogue.protection_builder_name")}</h2>
            ${game.i18n.localize("SUCC.dialogue.protection_builder_dialogue")}
            <div style="display:flex">
                <p style="flex:3">${game.i18n.localize("SUCC.dialogue.amount_to_increase")}</p>
                <input type="number" id="protectionAmount" value="2" style="flex:1"/></input>
            </div>
            `,
            buttons: {
                armor: {
                    label: game.i18n.localize("SWADE.Armor"),
                    callback: async (html) => {
                        //Setting a flag to prevent repetitive chat message:                        
                        appliedCondition.setFlag('succ', 'updatedAE', true)

                        let protectionAmount = Number(html.find("#protectionAmount")[0].value)
                        let updates = appliedCondition.toObject().changes //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
                        updates[1].value = protectionAmount
                        await appliedCondition.update({"changes": updates})
                    }
                },
                toughness: {
                    label: game.i18n.localize("SWADE.Tough"),
                    callback: async (html) => {
                        //Setting a flag to prevent repetitive chat message:                        
                        appliedCondition.setFlag('succ', 'updatedAE', true)

                        let protectionAmount = Number(html.find("#protectionAmount")[0].value)
                        let updates = appliedCondition.toObject().changes //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
                        updates[0].value = protectionAmount
                        await appliedCondition.update({"changes": updates})
                    }
                },
                cancel: {
                    label: game.i18n.localize("SUCC.dialogue.cancel")
                }
            }
        }).render(true)
    }
}