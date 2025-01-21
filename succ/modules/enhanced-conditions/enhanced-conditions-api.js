import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";

/**
 * API functions for interacting with EnhancedConditions
 */
export class EnhancedConditionsAPI {

    /* -------------------------------------------- */
    /*                      API                     */
    /* -------------------------------------------- */

    /**
     * Applies the named condition to the provided entities (Actors or Tokens)
     * @param {String[] | String} conditionId  the id of the condition to add
     * @param {(Actor[] | Token[] | Actor | Token)} [entities=null] one or more Actors or Tokens to apply the Condition to
     * @param {Boolean} [options.allowDuplicates=false]  if one or more of the Conditions specified is already active on the Entity, this will still add the Condition. Use in conjunction with `replaceExisting` to determine how duplicates are handled
     * @param {Boolean} [options.replaceExisting=false]  whether or not to replace existing Conditions with any duplicates in the `conditionName` parameter. If `allowDuplicates` is true and `replaceExisting` is false then a duplicate condition is created. Has no effect if `allowDuplicates` is `false`
     * @param {Boolean} [options.forceOverlay=false]  if true, this condition will appear as an overlay regardless of its normal behaviour
     * @param {Boolean} [options.duration=undefined]  if set, this will override the duration on the effect
     * @param {Boolean} [options.effectOptions]  additional options that are added to a property to be used by elsewhere in the code
     * @example
     * // Add the Condition "Blinded" to an Actor named "Bob". Duplicates will not be created.
     * game.succ.addCondition("Blinded", game.actors.getName("Bob"));
     * @example
     * // Add the Condition "Charmed" to the currently controlled Token/s. Duplicates will not be created.
     * game.succ.addCondition("Charmed");
     * @example
     * // Add the Conditions "Blinded" and "Charmed" to the targeted Token/s and create duplicates, replacing any existing Conditions of the same names.
     * game.succ.addCondition(["Blinded", "Charmed"], [...game.user.targets], {allowDuplicates: true, replaceExisting: true});
     */
    static async addCondition(conditionId, entities=null, {allowDuplicates=false, replaceExisting=false, forceOverlay=false, duration=undefined, effectOptions={}}={}) {
        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
            else if (game.user.character) entities = game.user.character;
        }
        
        if (!entities) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.AddCondition.Failed.NoToken"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.AddCondition.Failed.NoToken")}`);
            return;
        }

        let conditions = EnhancedConditions.lookupConditionById(conditionId);
        
        if (!conditions) {
            ui.notifications.error(`${game.i18n.localize("ENHANCED_CONDITIONS.AddCondition.Failed.NoCondition")} ${conditionId}`);
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.AddCondition.Failed.NoCondition")}`, conditionId);
            return;
        }

        conditions = conditions instanceof Array ? conditions : [conditions];
        const conditionIds = conditions.map(c => c.id);

        let effects = EnhancedConditionsAPI.getActiveEffect(conditions);
        
        if (!effects) {
            ui.notifications.error(`${game.i18n.localize("ENHANCED_CONDITIONS.AddCondition.Failed.NoEffect")} ${conditions}`);
            console.log(`SWADE Ultimate Condition Changer - Enhanced Condition | ${game.i18n.localize("ENHANCED_CONDITIONS.AddCondition.Failed.NoEffect")}`, conditions);
            return;
        }

        effects = effects instanceof Array ? EnhancedConditions._prepareActiveEffects(effects) : EnhancedConditions._prepareActiveEffects([effects]);
        
        if (entities && !(entities instanceof Array)) {
            entities = [entities];
        }

        let resultEffects = []

        for (let entity of entities) {
            const actor = EnhancedConditionsAPI.getActorFromEntity(entity);
            
            if (!actor) continue;

            for (const effect of effects) {
                if (forceOverlay) {
                    effect.flags.core = effect.flags.core ? effect.flags.core : {};
                    effect.flags.core.overlay = true;
                }

                if (duration != undefined) {
                    effect.duration.rounds = duration;
                }
                
                if (effectOptions) {
                    foundry.utils.setProperty(effect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.effectOptions}`, effectOptions);
                }
            }

            const hasDuplicates = EnhancedConditionsAPI.hasCondition(conditionIds, actor, {warn: false});
            const newEffects = [];
            const updateEffects = [];
            

            // If there are duplicate Condition effects on the Actor take extra steps
            if (hasDuplicates) {
                // @todo #348 determine the best way to raise warnings in this scenario
                /*
                if (warn) {
                    ui.notifications.warn(`${entity.name}: ${conditionId} ${game.i18n.localize("ENHANCED_CONDITIONS.AddCondition.Failed.AlreadyActive")}`);
                    console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${entity.name}: ${conditionId} ${game.i18n.localize("ENHANCED_CONDITIONS.AddCondition.Failed.AlreadyActive")}`);
                }
                */

                // Get the existing conditions on the actor
                let existingConditionEffects = EnhancedConditionsAPI.getConditionEffects(actor, {warn: false});
                existingConditionEffects = existingConditionEffects instanceof Array ? existingConditionEffects : [existingConditionEffects];

                // Loop through the effects sorting them into either existing or new effects
                for (const effect of effects) {
                    if (!allowDuplicates) {
                        conditions = conditions.filter(c => c.id != effect.id);
                    }

                    // Scenario 1: if duplicates are allowed, but existing conditions are not replaced, everything is new
                    if (allowDuplicates && !replaceExisting) {
                        newEffects.push(effect);
                        continue;
                    }

                    const conditionId = foundry.utils.getProperty(effect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.conditionId}`);
                    const matchedConditionEffects = existingConditionEffects.filter(e => e.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId) === conditionId);

                    // Scenario 2: if duplicates are allowed, and existing conditions should be replaced, add any existing conditions to update
                    if (replaceExisting) {
                        for (const matchedCondition of matchedConditionEffects) {
                            updateEffects.push({id: matchedCondition.id, ...effect});
                        }
                    }
                    
                    // Scenario 2 cont'd: if the condition is not matched, it must be new, so add to the new effects
                    // Scenario 3: if duplicates are not allowed, and existing conditions are not replaced, just add the new conditions
                    if (!matchedConditionEffects.length) newEffects.push(effect);
                }
            }

            // If the any of the conditions remove others, remove all conditions
            // @todo maybe add this to the logic above?
            if (conditions.some(c => c?.options?.removeOthers)) {
                await EnhancedConditionsAPI.removeAllConditions(actor, {warn: false});
            }

            const createData = hasDuplicates ? newEffects : effects;
            const updateData = updateEffects;

            if (createData.length) {
                const createdDocuments = await actor.createEmbeddedDocuments("ActiveEffect", createData);
                resultEffects = resultEffects.concat(createdDocuments);
            }
              
            if (updateData.length) {
                const updatedDocuments = await actor.updateEmbeddedDocuments("ActiveEffect", updateData);
                resultEffects = resultEffects.concat(updatedDocuments);
            }
        }

        return resultEffects;
    }

    /**
     * Removes one or more named conditions from an Entity (Actor/Token)
     * @param {String} conditionId  the id of the Condition to remove
     * @param {Actor | Token} entities  One or more Actors or Tokens
     * @param {Boolean} options.warn  whether or not to raise warnings on errors
     * @example 
     * // Remove Condition named "Blinded" from an Actor named Bob
     * game.succ.removeCondition("Blinded", game.actors.getName("Bob"));
     * @example 
     * // Remove Condition named "Charmed" from the currently controlled Token, but don't show any warnings if it fails.
     * game.succ.removeCondition("Charmed", {warn=false});
     */
    static async removeCondition(conditionId, entities=null, {warn=false}={}) {
        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
            else if (game.user.character) entities = game.user.character;
            else entities = null;
        }        

        if (!entities) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken")}`);
            return;
        }

        if (!(conditionId instanceof Array)) conditionId = [conditionId];

        const conditions = EnhancedConditions.lookupConditionById(conditionId);

        if (!conditions || (conditions instanceof Array && !conditions.length)) {
            if (warn) ui.notifications.error(`${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoCondition")} ${conditionId}`);
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoCondition")}`, conditionId);
            return;
        }

        let effects = EnhancedConditionsAPI.getActiveEffect(conditions);

        if (!effects) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDTIONS.RemoveCondition.Failed.NoEffect"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Condition | ${game.i18n.localize("ENHANCED_CONDTIONS.RemoveCondition.Failed.NoEffect")}`, condition);
            return;
        }

        if (!(effects instanceof Array)) effects = [effects];
        
        if (entities && !(entities instanceof Array)) entities = [entities];

        for (let entity of entities) {
            const actor = EnhancedConditionsAPI.getActorFromEntity(entity);
            const activeEffects = actor.effects.contents.filter(e => effects.map(e => e.flags[BUTLER.NAME].conditionId).includes(e.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId)));

            if (!activeEffects || (activeEffects && !activeEffects.length)) {
                if (warn) ui.notifications.warn(`${conditionId} ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NotActive")}`);
                console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${conditionId} ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NotActive")}")`);
                return;
            }

            const effectIds = activeEffects.map(e => e.id);

            await actor.deleteEmbeddedDocuments("ActiveEffect", effectIds);
        }
    }

    /**
     * Removes all conditions from the provided entities
     * @param {Actors | Tokens} entities  One or more Actors or Tokens to remove Conditions from
     * @param {Boolean} options.warn  output notifications
     * @example 
     * // Remove all Conditions on an Actor named Bob
     * game.succ.removeAllConditions(game.actors.getName("Bob"));
     * @example
     * // Remove all Conditions on the currently controlled Token
     * game.succ.removeAllConditions();
     */
    static async removeAllConditions(entities=null, {warn=true}={}) {
        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
            else if (game.user.character) entities = game.user.character;
        }
        
        if (!entities) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken")}`);
            return;
        }

        entities = entities instanceof Array ? entities : [entities];

        for (let entity of entities) {
            const actor = EnhancedConditionsAPI.getActorFromEntity(entity);

            let actorConditionEffects = EnhancedConditionsAPI.getConditionEffects(actor, {warn: false});

            if (!actorConditionEffects) continue;

            actorConditionEffects = actorConditionEffects instanceof Array ? actorConditionEffects : [actorConditionEffects];

            const effectIds = actorConditionEffects.map(ace => ace.id);

            await actor.deleteEmbeddedDocuments("ActiveEffect", effectIds);
        }
    }
    
    /**
     * Apply the named condition to the provided entities (Actors or Tokens)
     * @param {*} conditionId the id of the Condition to find
     * @param {(Actor[] | Token[] | Actor | Token)} [entities=null] one or more Actors or Tokens to apply the Condition to
     * @param {Boolean} finalState true if we want to end up with the condition added, false if removed. If undefined, we toggle between added and removed
     * @param {Object} [options]  options object
     * @see EnhancedConditions#addCondition
     * @see EnhancedConditions#removeCondition
     */
    static async toggleCondition(conditionId, entities=null, finalState, options={}) {
        if (typeof finalState === 'undefined') {
            let currentState = EnhancedConditionsAPI.hasCondition(conditionId, entities)
            finalState = !currentState
        }
        if (finalState) {
            return await EnhancedConditionsAPI.addCondition(conditionId, entities, options);
        } else {
            return await EnhancedConditionsAPI.removeCondition(conditionId, entities);
        }
    }

    /**
     * Gets a condition by id from the Condition Map
     * @param {*} conditionId the id of the Condition to find
     * @param {*} map the map to search through. If null, we'll use the current map
     * @param {*} options.warn whether or not to raise warnings on errors
     */
    static getCondition(conditionId, map=null, {warn=false}={}) {
        if (!conditionId) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.GetCondition.Failed.NoCondition"));
        }

        if (!map) map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        return EnhancedConditions.lookupConditionById(conditionId, map);
    }

    /**
     * Gets a condition by id from given Actor or String
     * @param {*} conditionId the id of the Condition to find
     * @param {Actor | String | Object} entity the Actor or Token to get the condition from
     * @param {*} options.warn whether or not to raise warnings on errors
     */
    static getConditionFrom(conditionId, entity, {warn=false}={}) {
        if (!conditionId) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.GetCondition.Failed.NoCondition"));
        }        
        if (!entity) {
            ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.AddCondition.Failed.NoToken"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.AddCondition.Failed.NoToken")}`);
            return;
        }

        const actor = EnhancedConditionsAPI.getActorFromEntity(entity);
        
        if (!actor) {
            return;
        }

        let conditions = EnhancedConditions.lookupConditionById(conditionId);

        if (!conditions) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.HasCondition.Failed.NoMapping"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoMapping")}`);
            return;
        }

        conditions = EnhancedConditions._prepareStatusEffects(conditions);
        conditions = conditions instanceof Array ? conditions : [conditions];

        const conditionEffect = actor.effects.contents.find(ae => {
            return conditions.find(e => e?.flags[BUTLER.NAME][BUTLER.FLAGS.enhancedConditions.conditionId] === ae.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId));
        });

        return conditionEffect;
    }

    /**
     * Retrieves all active conditions for one or more given entities (Actors or Tokens)
     * @param {Actor | Token} entities  one or more Actors or Tokens to get Conditions from
     * @param {Boolean} options.warn  whether or not to raise warnings on errors
     * @returns {Array} entityConditionMap  a mapping of conditions for each provided entity
     * @example
     * // Get conditions for an Actor named "Bob"
     * game.succ.getConditions(game.actors.getName("Bob"));
     * @example
     * // Get conditions for the currently controlled Token
     * game.succ.getConditions();
     */
    static getConditions(entities=null, {warn=true}={}) {
        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;

            // Then check if the user has an assigned character
            else if (game.user.character) entities = game.user.character;
        }
        

        if (!entities) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoToken"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoToken")}`);
            return;
        }

        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (!map || !map.length) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoCondition"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoCondition")}`);
            return;
        }

        if (!(entities instanceof Array)) {
            entities = [entities];
        }

        const results = [];

        for (let entity of entities) {
            const actor = EnhancedConditionsAPI.getActorFromEntity(entity);

            const effects = actor?.effects.contents;

            if (!effects) continue;

            const effectIds = effects instanceof Array ? effects.map(e => e.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId)) : effects.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId);

            if (!effectIds.length) continue;

            const entityConditions = {
                entity: entity, 
                conditions: EnhancedConditions.lookupEntryMapping(effectIds)
            };

            results.push(entityConditions);
        }
        
        if (!results.length) {
            if (warn) ui.notifications.notify(game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoResults"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.GetConditions.Failed.NoResults")}`);
            return null;
        }

        return results.length > 1 ? results : results.shift();
    }

    /**
     * Gets the Active Effect data (if any) for the given condition
     * @param {*} condition the id of the Condition to get
     */
    static getActiveEffect(condition) {
        return EnhancedConditions._prepareStatusEffects(condition);
    }

    /**
     * Gets any Active Effect instances present on the entities (Actor/s or Token/s) that are mapped Conditions
     * @param {String} entities  the entities to check
     * @param {Array} map  the Condition map to check (optional)
     * @param {Boolean} warn  whether or not to raise warnings on errors
     * @returns {Map | Object} A Map containing the Actor Id and the Condition Active Effect instances if any
     */
    static getConditionEffects(entities, map=null, {warn=true}={}) {
        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
            else if (game.user.character) entities = game.user.character;
        }
        
        if (!entities) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.GetConditionEffects.Failed.NoEntity"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoToken")}`);
            return;
        }

        entities = entities instanceof Array ? entities : [entities];

        if (!map) map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        let results = new Collection();

        for (const entity of entities) {
            const actor = EnhancedConditionsAPI.getActorFromEntity(entity);
            const activeEffects = actor.effects.contents;

            if (!activeEffects.length) continue;
            
            const conditionEffects = activeEffects.filter(ae => ae.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId));

            if (!conditionEffects.length) continue;

            results.set(entity.id, conditionEffects.length > 1 ? conditionEffects : conditionEffects.shift());
        }

        if (!results.size) return null;

        return results.size > 1 ? results : results.values().next().value;
    }

    /**
     * Checks if the provided Entity (Actor or Token) has the given condition
     * @param {String | Array} conditionId  the id/s of the condition or conditions to check for
     * @param {Actor | Token | Array} entities  the entity or entities to check (Actor/s or Token/s)
     * @param {Object} [options]  options object  
     * @param {Boolean} [options.warn]  whether or not to output notifications
     * @returns {Boolean} hasCondition  Returns true if one or more of the provided entities has one or more of the provided conditions
     * @example
     * // Check for the "Blinded" condition on Actor "Bob"
     * game.succ.hasCondition("Blinded", game.actors.getName("Bob"));
     * @example
     * // Check for the "Charmed" and "Deafened" conditions on the controlled tokens
     * game.succ.hasCondition(["Charmed", "Deafened"]);
     */
    static hasCondition(conditionId, entities=null, {warn=true}={}) {
        if (!conditionId) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.HasCondition.Failed.NoCondition"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.HasCondition.Failed.NoCondition")}`);
            return false;
        }

        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;

            // Then check if the user has an assigned character
            else if (game.user.character) entities = game.user.character;
        }

        if (!entities) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.HasCondition.Failed.NoToken"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.HasCondition.Failed.NoToken")}`);
            return false;
        }

        entities = entities instanceof Array ? entities : [entities];

        let conditions = EnhancedConditions.lookupConditionById(conditionId);

        if (!conditions) {
            if (warn) ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.HasCondition.Failed.NoMapping"));
            console.log(`SWADE Ultimate Condition Changer - Enhanced Conditions | ${game.i18n.localize("ENHANCED_CONDITIONS.RemoveCondition.Failed.NoMapping")}`);
            return false;
        }

        conditions = EnhancedConditions._prepareStatusEffects(conditions);
        conditions = conditions instanceof Array ? conditions : [conditions];

        for (let entity of entities) {
            const actor = EnhancedConditionsAPI.getActorFromEntity(entity);

            if (!actor.effects.size) continue;

            const conditionEffect = actor.effects.contents.some(ae => {
                return conditions.some(e => e?.flags[BUTLER.NAME][BUTLER.FLAGS.enhancedConditions.conditionId] === ae.getFlag(BUTLER.NAME, BUTLER.FLAGS.enhancedConditions.conditionId));
            });

            if (conditionEffect) return true;
        }

        return false;
    }

    /**
     * Converts the provided entity into an Actor
     * @param {Actor | Token | TokenDocument | String} entity  The entity to convert
     * @returns {Actor} Returns the converted Actor or null if none was found
     */
    static getActorFromEntity(entity) {
        return entity instanceof Actor ? entity : entity instanceof Token || entity instanceof TokenDocument ? entity.actor : null;
    }

    /**
     * @param sceneId The scene ID on which the function looks for token actors to remove the conditions from; defaults to current scene.
     * @param confirmed Boolean to skip the confirmation dialogue.
     */
    static async removeTemporaryEffects(sceneId = false, confirmed = false) {
        const scene = sceneId ? game.scenes.get(sceneId) : game.scenes.current
        if (confirmed) {
            proceedRemoval()
        } else {
            new Dialog({
                title: game.i18n.localize("ENHANCED_CONDITIONS.Dialog.RemoveTemporaryEffects.Name"),
                content: game.i18n.format("ENHANCED_CONDITIONS.Dialog.RemoveTemporaryEffects.Body", {sceneName: `${scene.navName} (${scene.name})`}),
                buttons: {
                    one: {
                        label: `<i class="fa-solid fa-check"></i> ${game.i18n.localize("succ.WORDS.Proceed")}`,
                        callback: async (_) => {
                            proceedRemoval()
                        }
                    },
                    two: {
                        label: `<i class="fa-solid fa-ban"></i> ${game.i18n.localize("succ.WORDS.Cancel")}`,
                        callback: async (_) => {
                            return
                        }
                    }
                },
            }).render(true);
        }

        async function proceedRemoval() {
            const sceneTokens = scene.tokens
            const nonCombatTokens = sceneTokens.filter(t => t.inCombat === false)
            if (!nonCombatTokens) {
                return
            }
            for (let token of nonCombatTokens) {
                const actor = token.actor
                const tokenEffects = actor.effects
                const durationEffects = tokenEffects.filter(e => typeof e.duration.rounds === "number" && !isNaN(e.duration.rounds) && isFinite(e.duration.rounds))
                let effectsToDeleteIds = []
                for (let effect of durationEffects) {
                    effectsToDeleteIds.push(effect.id)
                }
                if (durationEffects) {
                    await actor.deleteEmbeddedDocuments('ActiveEffect', effectsToDeleteIds)
                }
            }
        }
    }
}