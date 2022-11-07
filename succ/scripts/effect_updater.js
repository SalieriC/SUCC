export async function effect_updater(condition, userID) {
    let actorOrToken = condition.parent

    if (condition.flags?.succ?.additionalData) { builder_hub() }
    else if (condition.flags?.core?.statusId === "smite" && game.user.id === userID) {
        let appliedCondition = actorOrToken.effects.find(function (e) {
            return ((e.label === game.i18n.localize("SWADE.Smite")))
        })

        const weapons = actorOrToken.items.filter(i => i.type === "weapon")
        if (weapons.length === 0) {
            return ui.notifications.warn(`${game.i18n.localize("SUCC.smite.no_weapons")}`)
        }
        let weapOptions
        for (let weapon of weapons) {
            weapOptions = weapOptions + `<option value="${weapon.name}">${weapon.name}</option>`
        }

        new Dialog({
            title: game.i18n.localize("SUCC.dialogue.smite_builder_name"),
            content: `
            <h2><img src=${condition.icon} width="30" height="30" style="border:0;" /> ${game.i18n.localize("SUCC.dialogue.smite_builder_name")}</h2>
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
                        let change = { key: `@Weapon{${selectedWeaponName}}[system.actions.dmgMod]`, mode: 2, priority: undefined, value: damageBonus }
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
    } else if (condition.flags?.core?.statusId === "protection" && game.user.id === userID) {
        let appliedCondition = actorOrToken.effects.find(function (e) {
            return ((e.label === game.i18n.localize("SWADE.Protection")))
        })
        //console.log(appliedCondition)
        //Protection stuff
        new Dialog({
            title: game.i18n.localize("SUCC.dialogue.protection_builder_name"),
            content: `
            <h2><img src=${condition.icon} width="30" height="30" style="border:0;" /> ${game.i18n.localize("SUCC.dialogue.protection_builder_name")}</h2>
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
    } else if (condition.flags?.core?.statusId === "boost" && game.user.id === userID) {
        let appliedCondition = actorOrToken.effects.find(function (e) {
            return ((e.label === game.i18n.localize("SUCC.condition.boost")))
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
        let allSkills = actorOrToken.items.filter(i => i.type === "skill")
        if (allSkills.length >= 1) {
            allSkills = skill_sorter(allSkills)
            for (let each of allSkills) {
                traitOptions = traitOptions + `<option value="${each.id}">${game.i18n.localize("SUCC.dialogue.skill")} ${each.name}</option>`
            }
        }
        new Dialog({
            title: game.i18n.localize("SUCC.dialogue.boost_builder_name"),
            content: `
            <h2><img src=${condition.icon} width="30" height="30" style="border:0;" /> ${game.i18n.localize("SUCC.dialogue.boost_builder_name")}</h2>
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
    } else if (condition.flags?.core?.statusId === "lower" && game.user.id === userID) {
        let appliedCondition = actorOrToken.effects.find(function (e) {
            return ((e.label === game.i18n.localize("SUCC.condition.lower")))
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
        let allSkills = actorOrToken.items.filter(i => i.type === "skill")
        if (allSkills.length >= 1) {
            allSkills = skill_sorter(allSkills)
            for (let each of allSkills) {
                traitOptions = traitOptions + `<option value="${each.id}">${game.i18n.localize("SUCC.dialogue.skill")} ${each.name}</option>`
            }
        }
        new Dialog({
            title: game.i18n.localize("SUCC.dialogue.lower_builder_name"),
            content: `
            <h2><img src=${condition.icon} width="30" height="30" style="border:0;" /> ${game.i18n.localize("SUCC.dialogue.lower_builder_name")}</h2>
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

        if (condition.flags.succ.additionalData.smite) {
            let weaponName
            if (typeof condition.flags.succ.additionalData.smite.weapon === "string") {
                weaponName = condition.flags.succ.additionalData.smite.weapon
            } else {
                weaponName = condition.flags.succ.additionalData.smite.weapon.name
            }

            let damageBonus = condition.flags.succ.additionalData.smite.bonus
            if (damageBonus >= 0) { damageBonus = '+' + damageBonus }

            await condition.setFlag('swade', 'expiration', 3)
            let updates = condition.toObject() //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
            updates.icon = condition.flags.succ.additionalData.smite.icon ? condition.flags.succ.additionalData.smite.icon : updates.icon
            let change = { key: `@Weapon{${weaponName}}[data.actions.dmgMod]`, mode: 2, priority: undefined, value: damageBonus }
            updates.changes = [change]
            updates.duration.rounds = condition.flags.succ.additionalData.smite.duration
            if (condition.flags.succ.additionalData.smite.additionalChanges) {
                updates.changes = updates.changes.concat(condition.flags.succ.additionalData.smite.additionalChanges)
            }
            if (condition.flags.succ.additionalData.smite.flags) {
                {
                    updates.flags = {
                        ...updates.flags,
                        ...condition.flags.succ.additionalData.smite.flags
                    }
                }
            }
            await condition.update(updates)
        } else if (condition.flags.succ.additionalData.protection) {
            await condition.setFlag('swade', 'expiration', 3)
            if (condition.flags.succ.additionalData.protection.type === "armor") {
                let protectionAmount = condition.flags.succ.additionalData.protection.bonus
                let updates = condition.toObject() //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
                updates.icon = condition.flags.succ.additionalData.protection.icon ? condition.flags.succ.additionalData.protection.icon : updates.icon
                updates.changes[1].value = protectionAmount
                if (condition.flags.succ.additionalData.protection.additionalChanges) {
                    updates.changes = updates.changes.concat(condition.flags.succ.additionalData.protection.additionalChanges)
                }
                if (condition.flags.succ.additionalData.protection.flags) {
                    {
                        updates.flags = {
                            ...updates.flags,
                            ...condition.flags.succ.additionalData.protection.flags
                        }
                    }
                }
                await condition.update(updates)
            } else if (condition.flags.succ.additionalData.protection.type === "toughness") {
                let protectionAmount = condition.flags.succ.additionalData.protection.bonus
                let updates = condition.toObject() //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
                updates.icon = condition.flags.succ.additionalData.protection.icon ? condition.flags.succ.additionalData.protection.icon : updates.icon
                updates.changes[0].value = protectionAmount
                if (condition.flags.succ.additionalData.protection.additionalChanges) {
                    updates.changes = updates.changes.concat(condition.flags.succ.additionalData.protection.additionalChanges)
                }
                if (condition.flags.succ.additionalData.protection.flags) {
                    {
                        updates.flags = {
                            ...updates.flags,
                            ...condition.flags.succ.additionalData.protection.flags
                        }
                    }
                }
                await condition.update(updates)
            } else {
                console.error("Wrong protection type passed in additional data. It needs to be a string of 'armor' or 'toughness'.")
            }
        } else if (condition.flags.succ.additionalData.boost) {
            let trait = condition.flags.succ.additionalData.boost.trait
            if (typeof trait === "string" && (attributes.includes(trait.toLowerCase()) === false)) {
                trait = actorOrToken.items.find(i => i.name.toLowerCase() === trait.toLowerCase()).id
            } else if (typeof trait != "string") { trait = traid.id }
            let type = "boost"
            let degree = condition.flags.succ.additionalData.boost.degree
            let duration = condition.flags.succ.additionalData.boost.duration
            let icon = condition.flags.succ.additionalData.boost.icon
            let additionalChanges = condition.flags.succ.additionalData.boost.additionalChanges
            let flags
            if (condition.flags.succ.additionalData.boost.flags) { flags = condition.flags.succ.additionalData.boost.flags }
            boost_lower_builder(condition, actorOrToken, trait, type, degree, duration, icon, additionalChanges, flags)
        } else if (condition.flags.succ.additionalData.lower) {
            let trait = condition.flags.succ.additionalData.lower.trait
            if (typeof trait === "string" && (attributes.includes(trait.toLowerCase()) === false)) {
                trait = actorOrToken.items.find(i => i.name.toLowerCase() === trait.toLowerCase()).id
            } else if (typeof trait != "string") { trait = traid.id }
            let type = "lower"
            let degree = condition.flags.succ.additionalData.lower.degree
            let duration = condition.flags.succ.additionalData.lower.duration
            let icon = condition.flags.succ.additionalData.lower.icon
            let additionalChanges = condition.flags.succ.additionalData.lower.additionalChanges
            let flags
            if (condition.flags.succ.additionalData.lower.flags) { flags = condition.flags.succ.additionalData.lower.flags }
            boost_lower_builder(condition, actorOrToken, trait, type, degree, duration, icon, additionalChanges, flags)
        }
    }

    async function boost_lower_builder(appliedCondition, actorOrToken, trait, type, degree, duration = 5, icon = false, additionalChanges, flags = false) {
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
            //Setting values:
            keyPath = `system.attributes.${trait}.die.sides`
            if (type === "lower") { valueMod = degree === "raise" ? -4 : -2 }
            else { valueMod = degree === "raise" ? 4 : 2 } //System now handles going over d12 or under d4.
        } else {
            //Getting the skill:
            let skill = actorOrToken.items.find(s => s.id === trait)
            keyPath = `@Skill{${skill.name}}[system.die.sides]`
            if (type === "lower") { valueMod = degree === "raise" ? -4 : -2 }
            else { valueMod = degree === "raise" ? 4 : 2 } //System now handles going over d12 or under d4.
        }
        //Setting a flag to prevent repetitive chat message:                        
        await appliedCondition.setFlag('succ', 'updatedAE', true)

        await appliedCondition.setFlag('swade', 'expiration', 3)
        let updates = appliedCondition.toObject() //foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over; it looses .data in the middle because toObject() is just the cleaned up data
        updates.icon = icon ? icon : updates.icon
        change.push({ key: keyPath, mode: 2, priority: undefined, value: valueMod })
        updates.changes = change
        if (additionalChanges) {
            updates.changes = updates.changes.concat(additionalChanges)
        }
        updates.duration.rounds = duration
        if (flags) {
            updates.flags = {
                ...updates.flags,
                ...flags
            }
        }
        await appliedCondition.update(updates)
    }
}

function skill_sorter(allSkills) {
    allSkills.sort(function (a, b) {
        let textA = a.name.toUpperCase();
        let textB = b.name.toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    return allSkills
}