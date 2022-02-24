export async function effect_updater(condition, userID) {
    let actorOrToken = condition.parent
    if (condition.parent.parent) {
        // Use the token if unlinked:
        actorOrToken = condition.parent.parent
    }
    console.log(actorOrToken.data.effects)
    if (condition.data.flags?.core?.statusId === "smite" && game.user.id === userID) {
        const appliedCondition = actorOrToken.data.effects.find(function (e) {
            return ((e.data.label === game.i18n.localize("SWADE.Smite")))
        })
    } else if (condition.data.flags?.core?.statusId === "protection" && game.user.id === userID) {
        const appliedCondition = actorOrToken.data.effects.find(function (e) {
            return ((e.data.label === game.i18n.localize("SWADE.Protection")))
        })
        console.log(appliedCondition)
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
                    label: "Armor",
                    callback: async (html) => {
                        let protectionAmount = Number(html.find("#protectionAmount")[0].value);
                        let updates = appliedCondition.toObject().changes //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
                        updates[1].value = protectionAmount
                        await appliedCondition.update({"changes": updates})
                    }
                },
                toughness: {
                    label: "Toughness",
                    callback: async (html) => {
                        let protectionAmount = Number(html.find("#protectionAmount")[0].value);
                        let updates = appliedCondition.toObject().changes //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
                        updates[0].value = protectionAmount
                        await appliedCondition.update({"changes": updates})
                    }
                },
                cancel: {
                    label: "Cancel"
                }
            }
        }).render(true)
    }
}