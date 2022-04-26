export async function effect_updater(condition, userID) {
    let actorOrToken = condition.parent

    //console.log(actorOrToken.data.effects)
    if (condition.data.flags?.succ?.additionalData) { builder_hub() }
    else if (condition.data.flags?.core?.statusId === "smite" && game.user.id === userID) {
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
                        await appliedCondition.setFlag('succ', 'updatedAE', true)

                        let selectedWeaponName = html.find(`#weapon`)[0].value
                        let damageBonus = Number(html.find("#damageBonus")[0].value)
                        if (damageBonus >= 0) { damageBonus = '+' + damageBonus }

                        await appliedCondition.setFlag('swade', 'expiration', 3)
                        let updates = appliedCondition.toObject() //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
                        let change = { key: `@Weapon{${selectedWeaponName}}[data.actions.dmgMod]`, mode: 2, priority: undefined, value: damageBonus }
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
                        await appliedCondition.setFlag('succ', 'updatedAE', true)

                        let protectionAmount = Number(html.find("#protectionAmount")[0].value)
                        let updates = appliedCondition.toObject().changes //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
                        updates[1].value = protectionAmount
                        await condition.setFlag('swade', 'expiration', 3)
                        await appliedCondition.update({ "changes": updates })
                    }
                },
                toughness: {
                    label: game.i18n.localize("SWADE.Tough"),
                    callback: async (html) => {
                        //Setting a flag to prevent repetitive chat message:                        
                        await appliedCondition.setFlag('succ', 'updatedAE', true)

                        let protectionAmount = Number(html.find("#protectionAmount")[0].value)
                        let updates = appliedCondition.toObject().changes //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
                        updates[0].value = protectionAmount
                        await appliedCondition.update({ "changes": updates })
                    }
                },
                cancel: {
                    label: game.i18n.localize("SUCC.dialogue.cancel")
                }
            }
        }).render(true)
    } else if (condition.data.flags?.core?.statusId === "boost" && game.user.id === userID) {
        let appliedCondition = actorOrToken.data.effects.find(function (e) {
            return ((e.data.label === game.i18n.localize("SUCC.condition.boost")))
        })
        //Building options
        let traitOptions = `
            <option value="agility">${game.i18n.localize("SUCC.dialogue.attribute")} ${game.i18n.localize("SWADE.AttrAgi")}</option>
            <option value="smarts">${game.i18n.localize("SUCC.dialogue.attribute")} ${game.i18n.localize("SWADE.AttrSma")}</option>
            <option value="spirit">${game.i18n.localize("SUCC.dialogue.attribute")} ${game.i18n.localize("SWADE.AttrSpr")}</option>
            <option value="strength">${game.i18n.localize("SUCC.dialogue.attribute")} ${game.i18n.localize("SWADE.AttrStr")}</option>
            <option value="vigor">${game.i18n.localize("SUCC.dialogue.attribute")} ${game.i18n.localize("SWADE.AttrVig")}</option>
        `
        // Adding Skills
        for (let each of actorOrToken.data.items) {
            if (each.type === "skill") {
                traitOptions = traitOptions + `<option value="${each.id}">${game.i18n.localize("SUCC.dialogue.skill")} ${each.name}</option>`
            }
        }
        new Dialog({
            title: game.i18n.localize("SUCC.dialogue.boost_builder_name"),
            content: `
            <h2><img src=${condition.data.icon} width="30" height="30" style="border:0;" /> ${game.i18n.localize("SUCC.dialogue.boost_builder_name")}</h2>
            ${game.i18n.localize("SUCC.dialogue.boost_builder_dialogue")}
            <div class="form-group">
                <label for="selected_trait">${game.i18n.localize("SUCC.dialogue.trait")} </label>
                <select id="selected_trait">${traitOptions}</select>
            </div>
            `,
            buttons: {
                success: {
                    label: game.i18n.localize("SUCC.dialogue.success"),
                    callback: async (html) => {
                        const trait = html.find(`#selected_trait`)[0].value;
                        const type = "boost"
                        const degree = "success"
                        await boost_lower_builder(appliedCondition, actorOrToken, trait, type, degree)
                    }
                },
                raise: {
                    label: game.i18n.localize("SUCC.dialogue.raise"),
                    callback: async (html) => {
                        const trait = html.find(`#selected_trait`)[0].value;
                        const type = "boost"
                        const degree = "raise"
                        await boost_lower_builder(appliedCondition, actorOrToken, trait, type, degree)
                    }
                },
                cancel: {
                    label: game.i18n.localize("SUCC.dialogue.cancel")
                }
            }
        }).render(true)
    } else if (condition.data.flags?.core?.statusId === "lower" && game.user.id === userID) {
        let appliedCondition = actorOrToken.data.effects.find(function (e) {
            return ((e.data.label === game.i18n.localize("SUCC.condition.lower")))
        })
        //Building options
        let traitOptions = `
            <option value="agility">${game.i18n.localize("SUCC.dialogue.attribute")} ${game.i18n.localize("SWADE.AttrAgi")}</option>
            <option value="smarts">${game.i18n.localize("SUCC.dialogue.attribute")} ${game.i18n.localize("SWADE.AttrSma")}</option>
            <option value="spirit">${game.i18n.localize("SUCC.dialogue.attribute")} ${game.i18n.localize("SWADE.AttrSpr")}</option>
            <option value="strength">${game.i18n.localize("SUCC.dialogue.attribute")} ${game.i18n.localize("SWADE.AttrStr")}</option>
            <option value="vigor">${game.i18n.localize("SUCC.dialogue.attribute")} ${game.i18n.localize("SWADE.AttrVig")}</option>
        `
        // Adding Skills
        for (let each of actorOrToken.data.items) {
            if (each.type === "skill") {
                traitOptions = traitOptions + `<option value="${each.id}">${game.i18n.localize("SUCC.dialogue.skill")} ${each.name}</option>`
            }
        }
        new Dialog({
            title: game.i18n.localize("SUCC.dialogue.lower_builder_name"),
            content: `
            <h2><img src=${condition.data.icon} width="30" height="30" style="border:0;" /> ${game.i18n.localize("SUCC.dialogue.lower_builder_name")}</h2>
            ${game.i18n.localize("SUCC.dialogue.lower_builder_dialogue")}
            <div class="form-group">
                <label for="selected_trait">${game.i18n.localize("SUCC.dialogue.trait")} </label>
                <select id="selected_trait">${traitOptions}</select>
            </div>
            `,
            buttons: {
                success: {
                    label: game.i18n.localize("SUCC.dialogue.success"),
                    callback: async (html) => {
                        const trait = html.find(`#selected_trait`)[0].value;
                        const type = "lower"
                        const degree = "success"
                        await boost_lower_builder(appliedCondition, actorOrToken, trait, type, degree)
                    }
                },
                raise: {
                    label: game.i18n.localize("SUCC.dialogue.raise"),
                    callback: async (html) => {
                        const trait = html.find(`#selected_trait`)[0].value;
                        const type = "lower"
                        const degree = "raise"
                        await boost_lower_builder(appliedCondition, actorOrToken, trait, type, degree)
                    }
                },
                cancel: {
                    label: game.i18n.localize("SUCC.dialogue.cancel")
                }
            }
        }).render(true)
    }

    async function builder_hub() {
        //Setting a flag to prevent repetitive chat message:                        
        await condition.setFlag('succ', 'updatedAE', true)
        const attributes = [
            `${game.i18n.localize("SWADE.AttrAgi").toLowerCase()}`,
            `${game.i18n.localize("SWADE.AttrSma").toLowerCase()}`,
            `${game.i18n.localize("SWADE.AttrSpr").toLowerCase()}`,
            `${game.i18n.localize("SWADE.AttrStr").toLowerCase()}`,
            `${game.i18n.localize("SWADE.AttrVig").toLowerCase()}`]

        if (condition.data.flags.succ.additionalData.smite) {
            let weaponName
            if (typeof condition.data.flags.succ.additionalData.smite.weapon === "string") {
                weaponName = condition.data.flags.succ.additionalData.smite.weapon
            } else {
                weaponName = condition.data.flags.succ.additionalData.smite.weapon.name
            }

            let damageBonus = condition.data.flags.succ.additionalData.smite.bonus
            if (damageBonus >= 0) { damageBonus = '+' + damageBonus }

            await condition.setFlag('swade', 'expiration', 3)
            let updates = condition.toObject() //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
            updates.icon =  condition.data.flags.succ.additionalData.smite.icon ? condition.data.flags.succ.additionalData.smite.icon : updates.icon
            let change = { key: `@Weapon{${weaponName}}[data.actions.dmgMod]`, mode: 2, priority: undefined, value: damageBonus }
            updates.changes = [change]
            updates.duration.rounds = condition.data.flags.succ.additionalData.smite.duration
            await condition.update(updates)
        } else if (condition.data.flags.succ.additionalData.protection) {
            await condition.setFlag('swade', 'expiration', 3)
            if (condition.data.flags.succ.additionalData.protection.type === "armor") {
                let protectionAmount = condition.data.flags.succ.additionalData.protection.bonus
                let updates = condition.toObject() //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
                updates.icon =  condition.data.flags.succ.additionalData.protection.icon ? condition.data.flags.succ.additionalData.protection.icon : updates.icon
                updates.changes[1].value = protectionAmount
                await condition.update(updates)
            } else if (condition.data.flags.succ.additionalData.protection.type === "toughness") {
                let protectionAmount = condition.data.flags.succ.additionalData.protection.bonus
                let updates = condition.toObject() //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
                updates.icon =  condition.data.flags.succ.additionalData.protection.icon ? condition.data.flags.succ.additionalData.protection.icon : updates.icon
                updates.changes[0].value = protectionAmount
                await condition.update(updates)
            } else {
                console.error("Wrong protection type passed in additional data. It needs to be a string of 'armor' or 'toughness'.")
            }
        } else if (condition.data.flags.succ.additionalData.boost) {
            let trait = condition.data.flags.succ.additionalData.boost.trait
            if (typeof trait === "string" && (attributes.includes(trait.toLowerCase()) === false)) {
                trait = actorOrToken.items.find(i => i.name.toLowerCase() === trait.toLowerCase()).id
            } else if (typeof trait != "string") {trait = traid.id}
            let type = "boost"
            let degree = condition.data.flags.succ.additionalData.boost.degree
            let duration = condition.data.flags.succ.additionalData.boost.duration
            let icon = condition.data.flags.succ.additionalData.boost.icon
            boost_lower_builder(condition, actorOrToken, trait, type, degree, duration, icon)
        } else if (condition.data.flags.succ.additionalData.lower) {
            let trait = condition.data.flags.succ.additionalData.lower.trait
            if (typeof trait === "string" && (attributes.includes(trait.toLowerCase()) === false)) {
                trait = actorOrToken.items.find(i => i.name.toLowerCase() === trait.toLowerCase()).id
            } else if (typeof trait != "string") {trait = traid.id}
            let type = "lower"
            let degree = condition.data.flags.succ.additionalData.lower.degree
            let duration = condition.data.flags.succ.additionalData.lower.duration
            let icon = condition.data.flags.succ.additionalData.lower.icon
            boost_lower_builder(condition, actorOrToken, trait, type, degree, duration, icon)
        }
    }

    async function boost_lower_builder(appliedCondition, actorOrToken, trait, type, degree, duration = 5, icon = false) {
        let dieType
        let dieMod
        let keyPath
        let valueMod
        if (type === "lower") { duration = 1 }
        let change = []
        if (
            trait === "agility" ||
            trait === "smarts" ||
            trait === "spirit" ||
            trait === "strength" ||
            trait === "vigor"
        ) {
            //Get current die type:
            dieType = actorOrToken.data.data.attributes[trait].die.sides
            dieMod = actorOrToken.data.data.attributes[trait].die.modifier
            if (dieType === 12) {
                keyPath = `data.attributes.${trait}.die.modifier`
                valueMod = 1
                if (type === "boost" && degree === "raise" && dieType != 10) { valueMod = 2 }
                else if (type === "lower" && degree === "success" && dieMod <= 0) {
                    keyPath = `data.attributes.${trait}.die.sides`
                    valueMod = -2
                } else if (type === "lower" && degree === "raise" && dieMod <= 0) {
                    keyPath = `data.attributes.${trait}.die.sides`
                    valueMod = -4
                } else if (type === "lower" && degree === "success" && dieMod >= 1) {
                    valueMod = -1
                } else if (type === "lower" && degree === "raise" && dieMod > 1) {
                    valueMod = -2
                } else if (type === "lower" && degree === "raise" && dieMod === 1) {
                    keyPath = `data.attributes.${trait}.die.sides`
                    valueMod = -2
                    change.push({ key: `data.attributes.${trait}.die.modifier`, mode: 2, priority: undefined, value: -1 })
                }
            } else {
                keyPath = `data.attributes.${trait}.die.sides`
                valueMod = 2
                if (type === "boost" && degree === "raise" && dieType === 10) {
                    valueMod = 2
                    change.push({ key: `data.attributes.${trait}.die.modifier`, mode: 2, priority: undefined, value: 1 })
                } else if (type === "boost" && degree === "raise") {
                    valueMod = 4
                } else if (type === "lower" && degree === "raise") { valueMod = -4 }
                else if (type === "lower" && degree === "success") { valueMod = -2 }
            }
        } else {
            //Getting the skill:
            let skill = actorOrToken.data.items.find(s => s.id === trait)
            dieType = skill.data.data.die.sides
            dieMod = skill.data.data.die.modifier

            if (dieType === 12) {
                keyPath = `@Skill{${skill.name}}[data.die.modifier]`
                valueMod = 1
                if (type === "boost" && degree === "raise" && dieType != 10) { valueMod = 2 }
                else if (type === "lower" && degree === "success" && dieMod <= 0) {
                    keyPath = `@Skill{${skill.name}}[data.die.sides]`
                    valueMod = -2
                } else if (type === "lower" && degree === "raise" && dieMod <= 0) {
                    keyPath = `@Skill{${skill.name}}[data.die.sides]`
                    valueMod = -4
                } else if (type === "lower" && degree === "success" && dieMod >= 1) {
                    valueMod = -1
                } else if (type === "lower" && degree === "raise" && dieMod > 1) {
                    valueMod = -2
                } else if (type === "lower" && degree === "raise" && dieMod === 1) {
                    keyPath = `@Skill{${skill.name}}[data.die.sides]`
                    valueMod = -2
                    change.push({ key: `@Skill{${skill.name}}[data.die.modifier]`, mode: 2, priority: undefined, value: -1 })
                }
            } else {
                keyPath = `@Skill{${skill.name}}[data.die.sides]`
                valueMod = 2
                if (type === "boost" && degree === "raise" && dieType === 10) {
                    valueMod = 2
                    change.push({ key: `@Skill{${skill.name}}[data.die.modifier]`, mode: 2, priority: undefined, value: 1 })
                } else if (type === "boost" && (skill.name === game.i18n.localize("SWADE.Unskilled") || skill.name === game.i18n.localize("SUCC.effectBuilder.unskilled-coreRules"))) {
                    if (dieMod <= -2 && dieType === 4) {
                        change.push({ key: `@Skill{${skill.name}}[data.die.modifier]`, mode: 2, priority: undefined, value: 2 })
                        if (degree === "success") { valueMod = 0 }
                    }
                } else if (type === "boost" && degree === "raise") {
                    valueMod = 4
                } else if (type === "lower" && degree === "success" && dieType === 4) {
                    valueMod = 0
                } else if (type === "lower" && degree === "raise" && dieType <= 6) {
                    if (dieType === 6) {valueMod = -2}
                    else if (dieType === 4) {valueMod = 0}
                } else if (type === "lower" && degree === "raise") { valueMod = -4 }
                else if (type === "lower" && degree === "success") { valueMod = -2 }
            }
        }
        //Setting a flag to prevent repetitive chat message:                        
        await appliedCondition.setFlag('succ', 'updatedAE', true)

        await appliedCondition.setFlag('swade', 'expiration', 3)
        let updates = appliedCondition.toObject() //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
        updates.icon = icon ? icon : updates.icon
        change.push({ key: keyPath, mode: 2, priority: undefined, value: valueMod })
        updates.changes = change
        updates.duration.rounds = duration
        await appliedCondition.update(updates)
    }
}