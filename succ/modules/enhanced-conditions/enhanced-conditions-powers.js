import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditionsAPIDialogs } from "./enhanced-conditions-api-dialogs.js";
import { EnhancedConditionsAPI } from "./enhanced-conditions-api.js";

/**
 * Builds a mapping between status icons and journal entries that represent conditions
 */
export class EnhancedConditionsPowers {


    /**
     * Adds a boost or lower trait effect to an actor
     * @param {Actor} actor  Actor to apply the effect to
     * @param {Object} condition  The condition being applied (should be either boost or lower trait)
     * @param {boolean} boost True if this is a boost, false if it's a lower
     */
    static async boostLowerTrait(actor, condition, boost) {
        let effect = actor.effects.find(function (e) {
            return ((e.name === game.i18n.localize(condition.name)));
        });

        let type = boost ? "boost" : "lower";
        let result = await EnhancedConditionsAPIDialogs.boostLowerTraitDialog(actor, type);

        if (!result) {
            await EnhancedConditionsAPI.removeCondition(condition.id, actor, { warn: true });
            return;
        }

        await EnhancedConditionsPowers.boostLowerBuilder(effect, actor, result.trait, type, result.degree);
    }

    /**
     * Removes the skill added by boost trait if one was added
     * @param {ActiveEffect} effect The boost effect that's being removed
     */
    static async deleteBoostSkill(effect) {
        if (!Sidekick.hasModuleFlags(effect)) {
            return;
        }

        let skillId = Sidekick.getModuleFlag(effect, BUTLER.FLAGS.enhancedConditions.addedSkillUuid);
        let skill = fromUuidSync(skillId);
        if (skill) {
            await skill.delete();
        }
    }

    /**
     * Creates and applies the active effects for a boost or lower trait condition
     * @param {ActiveEffect} effect  The active effect being updated
     * @param {Actor} actor  Actor to update
     * @param {String} trait  The trait being affected
     * @param {String} type  Specifies if this a boost or lower
     * @param {String} degree  Specifies if this a success or a raise
     */
    static async boostLowerBuilder(effect, actor, trait, type, degree) {
        let keyPath;
        let valueMod;
        let traitName;

        //Foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over
        //It loses .data in the middle because toObject() is just the cleaned up datalet updates = effect.toObject();
        let updates = effect.toObject();

        if (trait === "agility" ||
            trait === "smarts" ||
            trait === "spirit" ||
            trait === "strength" ||
            trait === "vigor") {
            //Setting values:
            keyPath = `system.attributes.${trait}.die.sides`;
            if (type === "lower") { valueMod = degree === "raise" ? -4 : -2; }
            else { valueMod = degree === "raise" ? 4 : 2; }
            traitName = Sidekick.getLocalizedAttributeName(trait);
        } else {
            //Getting the skill:
            let skill = actor.items.find(s => s.type == "skill" && s.name.toLowerCase() === trait.toLowerCase());
            if (skill) {
                keyPath = `@Skill{${skill.name}}[system.die.sides]`;
                if (type === "lower") { valueMod = degree === "raise" ? -4 : -2; }
                else { valueMod = degree === "raise" ? 4 : 2; }
                traitName = skill.name;
            } else if (type === "boost") {
                //We're boosting and this actor does not have this skill. Try to add it
                let skills = await Sidekick.getSkillOptions(actor, true);
                let skillItem = skills.find(s => s.name.toLowerCase() === trait.toLowerCase()).toObject();
                if (!skillItem) {
                    //This skill doesn't seem to exist anywhere
                    //This shouldn't happen but just early out anyway
                    return;
                }

                traitName = skillItem.name; //Set the trait name to be the original skill name before we add the suffix

                skillItem.name += game.i18n.localize("ENHANCED_CONDITIONS.Dialog.BoostBuilder.TempSkillSuffix");
                skill = (await actor.createEmbeddedDocuments("Item", [skillItem], { render: false, renderSheet: false }))[0];

                //Set the skill flag on the effect so we know to remove it when the effect is removed
                foundry.utils.setProperty(updates, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.addedSkillUuid}`, skill.uuid);

                if (degree === "raise") {
                    //Since we just added the skill, that already handles the success (unskilled to a d4)
                    //If it's a raise, we only need to increase it by another 2 sides
                    keyPath = `@Skill{${skillItem.name}}[system.die.sides]`;
                    valueMod = 2;
                }
            }

            if (!skill) {
                //If we make it here with no skill, just early out since we don't need to change the effect
                return;
            }
        }

        if (keyPath) {
            let change = [];
            change.push({ key: keyPath, mode: 2, priority: undefined, value: valueMod });
            updates.changes = change;
        }

        updates.name += " (" + traitName + ")";
        await effect.update(updates);
    }

    /**
     * Adds a smite effect to an actor
     * @param {Actor} actor  Actor to apply the effect to
     * @param {Object} condition  The condition being applied (should be smite)
     */
    static async smite(actor, condition) {
        //Get the active effect from the actor
        let effect = actor.effects.find(function (e) {
            return ((e.name === game.i18n.localize(condition.name)));
        });

        let result = await EnhancedConditionsAPIDialogs.smiteDialog(actor);

        if (!result) {
            await EnhancedConditionsAPI.removeCondition(condition.id, actor, { warn: true });
            return;
        }

        await EnhancedConditionsPowers.smiteBuilder(effect, result);
    }

    /**
     * Creates and applies the active effects for a smite condition
     * @param {Object} effect  The active effect being updated
     * @param {String} weaponName  The name of the weapon being affected
     * @param {String} damageBonus  The damage bonus
     * @param {String} apBonus  The AP bonus
     * @param {Boolean} heavy  If the weapon should be made heavy or not
     */
    static async smiteBuilder(effect, {weaponName, damageBonus, apBonus, heavy}) {
        let changes = [{ key: `@Weapon{${weaponName}}[system.actions.dmgMod]`, mode: 2, priority: undefined, value: damageBonus }];
        if(apBonus != 0) {
            changes.push({ key: `@Weapon{${weaponName}}[system.ap]`, mode: 2, priority: undefined, value: apBonus });
        }

        if(heavy) {
            changes.push({ key: `@Weapon{${weaponName}}[system.isHeavyWeapon]`, mode: 5, priority: undefined, value: true });
        }

        //Foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over
        //It loses .data in the middle because toObject() is just the cleaned up datalet updates = effect.toObject();
        let updates = effect.toObject();
        updates.changes = changes;
        updates.name += " (" + weaponName + ")";
        await effect.update(updates);
    }

    /**
     * Adds a protection effect to an actor
     * @param {Actor} actor  Actor to apply the effect to
     * @param {Object} condition  The condition being applied (should be protection)
     */
    static async protection(actor, condition) {
        //Get the active effect from the actor
        let effect = actor.effects.find(function (e) {
            return ((e.name === game.i18n.localize(condition.name)));
        });

        let result = await EnhancedConditionsAPIDialogs.protectionDialog();

        if (!result) {
            await EnhancedConditionsAPI.removeCondition(condition.id, actor, { warn: true });
            return;
        }

        await EnhancedConditionsPowers.protectionBuilder(effect, result.bonus, result.type);
    }

    /**
     * Creates and applies the active effects for a protection condition
     * @param {Object} effect  The active effect being updated
     * @param {String} protectionBonus  The amount to apply
     * @param {String} type  Whether this is affected toughness or armor
     */
    static async protectionBuilder(effect, protectionBonus, type) {
        let index = type === "armor" ? 1 : 0; //Toughness is stored in index 0 of the changes array and armor is in 1
        //Foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over
        //It loses .data in the middle because toObject() is just the cleaned up data
        let updates = effect.toObject().changes;
        updates[index].value = protectionBonus;
        await effect.update({ "changes": updates });
    }

    /**
     * Adds a deflection effect to an actor
     * @param {Actor} actor  Actor to apply the effect to
     * @param {Object} condition  The condition being applied (should be deflection)
     */
    static async deflection(actor, condition) {
        //Get the active effect from the actor
        let effect = actor.effects.find(function (e) {
            return ((e.name === game.i18n.localize(condition.name)));
        });

        let result = await EnhancedConditionsAPIDialogs.deflectionDialog();

        if (!result) {
            await EnhancedConditionsAPI.removeCondition(condition.id, actor, { warn: true });
            return;
        }

        await EnhancedConditionsPowers.deflectionBuilder(effect, result.type);
    }

    /**
     * Creates and applies the active effects for a protection condition
     * @param {Object} effect  The active effect being updated
     * @param {String} type  Whether this applies to melee, ranged, or both
     */
    static async deflectionBuilder(effect, type) {
        //Foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over
        //It loses .data in the middle because toObject() is just the cleaned up data
        let updates = effect.toObject();
        updates.name += " (" + type + ")";
        await effect.update(updates);
    }

    /**
     * Adds a numb effect to an actor
     * @param {Actor} actor  Actor to apply the effect to
     * @param {Object} condition  The condition being applied (should be numb)
     */
    static async numb(actor, condition) {
        //Get the active effect from the actor
        let effect = actor.effects.find(function (e) {
            return ((e.name === game.i18n.localize(condition.name)));
        });

        let result = await EnhancedConditionsAPIDialogs.numbDialog();

        if (!result) {
            await EnhancedConditionsAPI.removeCondition(condition.id, actor, { warn: true });
            return;
        }

        await EnhancedConditionsPowers.numbBuilder(effect, result.bonus);
    }

    /**
     * Creates and applies the active effects for a numb condition
     * @param {Object} effect  The active effect being updated
     * @param {Number} bonus  The number of wounds/fatigue to ignore
     */
    static async numbBuilder(effect, bonus) {
        //Foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over
        //It loses .data in the middle because toObject() is just the cleaned up data
        let updates = effect.toObject();
        updates.changes[0].value = bonus;
        await effect.update(updates);
    }

    /**
     * Adds a flying effect to an actor
     * @param {Actor} actor  Actor to apply the effect to
     * @param {Object} condition  The condition being applied (should be flying)
     */
    static async flying(actor, condition) {
        //Get the active effect from the actor
        let effect = actor.effects.find(function (e) {
            return ((e.name === game.i18n.localize(condition.name)));
        });

        let result = await EnhancedConditionsAPIDialogs.flyingDialog();

        if (!result) {
            await EnhancedConditionsAPI.removeCondition(condition.id, actor, { warn: true });
            return;
        }

        if (result.pace != null) {
            await EnhancedConditionsPowers.flyingBuilder(effect, result.pace);
        }
    }

    /**
     * Creates and applies the active effects for a flying condition
     * @param {Object} effect  The active effect being updated
     * @param {Number} pace  The pace to use
     */
    static async flyingBuilder(effect, pace) {
        //Foundry rejects identical objects -> You need to toObject() the effect then change the result of that then pass that over
        //It loses .data in the middle because toObject() is just the cleaned up data
        let updates = effect.toObject();
        updates.changes.push({ key: "system.pace.fly", mode: 5, priority: undefined, value: pace });
        await effect.update(updates);
    }
}