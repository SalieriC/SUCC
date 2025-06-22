import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { ConditionLab } from "./condition-lab.js";
import { EnhancedConditionsAPI } from "./enhanced-conditions-api.js";
import { EnhancedConditionsPowers } from "./enhanced-conditions-powers.js";

/**
 * Builds a mapping between status icons and journal entries that represent conditions
 */
export class EnhancedConditions {


    /* -------------------------------------------- */
    /*                   Handlers                   */
    /* -------------------------------------------- */

    /**
     * Ready Hook handler
     * Steps:
     * 1. Get default maps
     * 2. Get mapType
     * 3. Get Condition Map
     * 4. Override status effects
     */
    static async _onReady() {
        if (game.user.isGM) {
            await EnhancedConditions.loadConditionConfigMap();
            await EnhancedConditions.migrateFlagsToSystem();
            await EnhancedConditions.updateConditionMapFromDefaults();
        }

        let defaultConditions = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions);
        let conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        const mapType = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType);
        const defaultMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);

        if (game.user.isGM) {
            if (!defaultConditions || defaultConditions.length === 0) {
                //If there's no defaultConditions, load them and save them
                defaultConditions = await EnhancedConditions._loadDefaultConditions();
                Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions, defaultConditions);
            } else {
                //If we do have defaultConditions, ensure that the list matches our list of defaults without changing any of the current values
                let newDefaultConditions = await EnhancedConditions._loadDefaultConditions();
                for (let newDefault of newDefaultConditions) {
                    const oldDefault = defaultConditions.find(c => c.id === newDefault.id);
                    if (oldDefault) {
                        Object.assign(newDefault, oldDefault);
                    }
                }

                if (JSON.stringify(defaultConditions) !== JSON.stringify(newDefaultConditions)) {
                    //Our defaults have changed for some reason. Update our defaults and refresh
                    defaultConditions = newDefaultConditions;
                    await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions, defaultConditions);
                    await EnhancedConditions.refreshMapDefaults();
                    conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
                }
            }
        }

        // If map type is not set, set maptype to default
        if (!mapType) {
            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, defaultMapType);
        }

        // If there's no condition map, get the default one
        if (!conditionMap.length) {
            // Pass over defaultConditions since the storage version is still empty
            conditionMap = EnhancedConditions.getMapForDefaultConditions(defaultConditions);

            if (game.user.isGM) {
                const preparedMap = EnhancedConditions._prepareMap(conditionMap);

                if (preparedMap?.length) {
                    conditionMap = preparedMap?.length ? preparedMap : conditionMap;
                    Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, preparedMap);
                }
            }
        }

        // If map type is not set, now set to default
        if (!mapType && conditionMap.length) {
            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, defaultMapType);
        }

        if (game.user.isGM) {
            EnhancedConditions._backupCoreEffects();
            EnhancedConditions._backupCoreSpecialStatusEffects();
        }

        const specialStatusEffectMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.specialStatusEffectMapping);
        if (conditionMap.length) EnhancedConditions._updateStatusEffects(conditionMap);
        if (specialStatusEffectMap) foundry.utils.mergeObject(CONFIG.specialStatusEffects, specialStatusEffectMap);
        setInterval(EnhancedConditions.updateConditionTimestamps, 15000);

        // Save the active condition map to a convenience property
        if (game.succ) {
            game.succ.conditions = conditionMap;
        }

        ui.combat.render(true);
        Hooks.callAll('succReady', game.succ);
    }

    /**
     * Hooks on token updates. If the update includes effects, calls the journal entry lookup
     */
    static async _onUpdateActor(actor, update, options, userId) {
        if (game.userId !== userId) {
            return;
        }

        const convictionCondition = EnhancedConditions.lookupConditionByOption("conviction");
        if (convictionCondition) {
            //Add Conviction:
            if (update?.system?.details?.conviction?.active === true) {
                //Check if condition was toggled on token, otherwise toggle it here:
                if (EnhancedConditionsAPI.hasCondition(convictionCondition.id, actor, { warn: false }) === true) { return; }

                await EnhancedConditionsAPI.addCondition(convictionCondition.id, actor);
            }

            //Remove Conviction:
            if (update?.system?.details?.conviction?.active === false) {
                await EnhancedConditionsAPI.removeCondition(convictionCondition.id, actor, { warn: false });
            }
        }
    }

    static async _onSwadeActorPrepareDerivedData(actor) {
        if (!game.succ.conditions || actor.type === "vehicle") {
            //The conditions map has not yet been set or the actor is a vehicle, either way we cannot apply encumbrance
            return;
        }

        //Get the user defined ID for the condition to be added if overencumbered:
        const encumberedId = game.succ.conditions.find(c => c.options?.encumbered)?.id
        //Add/Remove Encumbrance if game setting for that is true and a condition is set for it:
        if (game.settings.get('swade', 'applyEncumbrance') && encumberedId) {
            //Check if overencumbered and if the condition is already applied:
            const hasEncumberedCondition = EnhancedConditionsAPI.hasCondition(encumberedId, actor)
            let isEncumbered = actor.system.details.encumbrance.value > actor.system.details.encumbrance.max ? true : false
            //If BRSW is enabled also check if NPCs should get encumbrance:
            if (game.modules.get('betterrolls-swade2')?.active) {
                const npcAvoidEncumbrance = game.settings
                    .get('betterrolls-swade2', 'optional_rules_enabled')
                    .indexOf('NPCDontUseEncumbrance') > -1;
                if (npcAvoidEncumbrance && actor.type === 'npc') { isEncumbered = false }
            }
            if (isEncumbered && !hasEncumberedCondition) { EnhancedConditionsAPI.addCondition(encumberedId, actor) }
            else if (!isEncumbered && hasEncumberedCondition) { EnhancedConditionsAPI.removeCondition(encumberedId, actor) }
        }
    }

    /**
     * Create Active Effect handler
     * @param {*} actor
     * @param {*} update
     * @param {*} options
     * @param {*} userId
     */
    static _onCreateActiveEffect(effect, options, userId) {
        if (game.userId !== userId) {
            return;
        }

        const createProcessed = effect.getFlag(`${BUTLER.NAME}`, `${BUTLER.FLAGS.enhancedConditions.createProcessed}`);
        if (createProcessed){
            return;
        }

        EnhancedConditions._processActiveEffectChange(effect, "create", options);
        effect.setFlag(`${BUTLER.NAME}`, `${BUTLER.FLAGS.enhancedConditions.createProcessed}`, true);
    }

    /**
     * Create Active Effect handler
     * @param {*} actor
     * @param {*} update
     * @param {*} options
     * @param {*} userId
     */
    static _onDeleteActiveEffect(effect, options, userId) {
        if (game.userId !== userId) {
            return;
        }

        EnhancedConditions._processActiveEffectChange(effect, "delete", options);
    }

    /**
     * Render Chat Message handler
     * @param {*} message
     * @param {*} html
     * @param {*} data
     */
    static async _onRenderChatMessageHTML(message, html, data) {
        if (!data || (data.message.content && !data.message.content.match("enhanced-conditions"))) {
            return;
        }

        const speaker = data.message.speaker;

        if (!speaker) return;

        const removeConditionAnchors = [...html.querySelectorAll("a[name='remove-row']")];
        const undoRemoveAnchors = [...html.querySelectorAll("a[name='undo-remove']")];

        if (!game.user.isGM) {
            removeConditionAnchors.forEach( (anchor) => anchor.parentElement.hidden = true);
            undoRemoveAnchors.forEach( (anchor) => anchor.parentElement.hidden = true);
            return;
        }

        removeConditionAnchors.forEach( (anchor) => anchor.addEventListener("click", (event) => {
            const conditionListItem = event.target.closest("li");
            const conditionId = conditionListItem.dataset.conditionId;
            const messageListItem = conditionListItem?.parentElement?.closest("li");
            const messageId = messageListItem?.dataset?.messageId;
            const message = messageId ? game.messages.get(messageId) : null;

            if (!message) return;

            const speaker = message?.speaker;

            if (!speaker) return;

            const token = canvas.tokens.get(speaker.token);
            const actor = game.actors.get(speaker.actor);
            if (speaker.token && !token && !actor?.prototypeToken.actorLink) {
                //This condition was originally associated with an unlinked token that has been deleted
                ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.ChatCard.Error.TokenDeleted"));
                return;
            }

            const entity = token ?? actor;

            if (!entity) return;

            EnhancedConditionsAPI.removeCondition(conditionId, entity, { warn: false });
        }));

        undoRemoveAnchors.forEach( (anchor) => anchor.addEventListener("click", (event) => {
            const conditionListItem = event.target.closest("li");
            const conditionId = conditionListItem.dataset.conditionId;
            const messageListItem = conditionListItem?.parentElement?.closest("li");
            const messageId = messageListItem?.dataset?.messageId;
            const message = messageId ? game.messages.get(messageId) : null;

            if (!message) return;

            const speaker = message?.speaker;

            if (!speaker) return;

            const token = canvas.tokens.get(speaker.token);
            const actor = game.actors.get(speaker.actor);
            if (speaker.token && !token && !actor?.prototypeToken.actorLink) {
                //This condition was originally associated with an unlinked token that has been deleted
                ui.notifications.error(game.i18n.localize("ENHANCED_CONDITIONS.ChatCard.Error.TokenDeleted"));
                return;
            }

            const entity = token ?? actor;

            if (!entity) return;

            EnhancedConditionsAPI.addCondition(conditionId, entity);
        }));
    }

    /**
     * ChatLog render hook
     * @param {*} app
     * @param {*} html
     * @param {*} data
     */
    static async _onRenderChatLog(app, html, data) {
        EnhancedConditions.updateConditionTimestamps();
    }

    /**
     *
     * @param {*} app
     * @param {*} html
     * @param {*} data
     */
    static async _onRenderCombatTracker(app, html, data) {
        const effectIcons = html.querySelectorAll("img[class='token-effect']");

        effectIcons.forEach((element, index) => {
            const url = new URL(element.src);
            const path = url?.pathname?.substring(1);
            const conditions = EnhancedConditions.getConditionsByImg(path);
            const statusEffect = CONFIG.statusEffects.find(e => e.img === path);

            if (conditions?.length) {
                element.title = conditions[0];
            } else if (statusEffect?.name) {
                element.title = statusEffect.name;
            }
            element.title = game.i18n.localize(element.title);
        });
    }

    /* -------------------------------------------- */
    /*                    Workers                   */
    /* -------------------------------------------- */

    /**
     * Process the addition/removal of an Active Effect
     * @param {ActiveEffect} effect  the effect
     * @param {String} type  the type of change to process
     */
    static _processActiveEffectChange(effect, type = "create", options) {
        if (!(effect instanceof ActiveEffect)) return;

        const conditionId = effect.getFlag(`${BUTLER.NAME}`, `${BUTLER.FLAGS.enhancedConditions.conditionId}`);
        if (!conditionId) return;

        const condition = EnhancedConditions.lookupEntryMapping(conditionId);

        if (!condition) return;

        const shouldOutput = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat) && condition.options?.outputChat && (options?.render ?? true);
        const outputType = type === "delete" ? "removed" : "added";
        const actor = effect.parent;

        if (shouldOutput) EnhancedConditions.outputChatMessage(actor, condition, { type: outputType });
        let macros = [];

        switch (type) {
            case "create":
                macros = condition.macros?.filter(m => m.type === "apply");

                const hasEffectOptions = foundry.utils.hasProperty(effect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.effectOptions}`);
                if (hasEffectOptions && Object.keys(effect.flags.succ.effectOptions).length > 0) {
                    EnhancedConditions.applyEffectOptions(effect, actor);
                } else {
                    EnhancedConditions.applyConditionOptions(effect, condition, actor, "create");
                }
                break;

            case "delete":
                macros = condition.macros?.filter(m => m.type === "remove");
                EnhancedConditions.applyConditionOptions(effect, condition, actor, "delete");
                break;

            default:
                break;
        }

        const macroIds = macros?.length ? macros.filter(m => m.id).map(m => m.id) : null;

        if (macroIds?.length) EnhancedConditions._processMacros(macroIds, actor, conditionId);
    }

    static applyConditionOptions(effect, condition, actor, type = "create") {
        switch (type) {
            case "create":
                if (condition.options?.removeOthers) EnhancedConditions.removeOtherConditions(actor, condition.id);
                if (condition.options?.markDefeated) EnhancedConditions.toggleDefeated(actor, { markDefeated: true });
                if (condition.options?.boostTrait) EnhancedConditionsPowers.boostLowerTrait(actor, condition, true);
                if (condition.options?.lowerTrait) EnhancedConditionsPowers.boostLowerTrait(actor, condition, false);
                if (condition.options?.smite) EnhancedConditionsPowers.smite(actor, condition);
                if (condition.options?.protection) EnhancedConditionsPowers.protection(actor, condition);
                if (condition.options?.deflection) EnhancedConditionsPowers.deflection(actor, condition);
                if (condition.options?.numb) EnhancedConditionsPowers.numb(actor, condition);
                if (condition.options?.fly) EnhancedConditionsPowers.flying(actor, condition);
                if (condition.options?.conviction) EnhancedConditions.activateConviction(actor);

                break;

            case "delete":
                if (condition.options?.markDefeated) EnhancedConditions.toggleDefeated(actor, { markDefeated: false });
                if (condition.options?.conviction) EnhancedConditions.deactivateConviction(actor);
                if (condition.options?.boostTrait) EnhancedConditionsPowers.deleteBoostSkill(effect);
                break;

            default:
                break;
        }
    }

    /**
     * Processes effect options and applies them to active effects
     * @param {*} effect The effect containing the effect options
     * @param {*} actor The actor containing the effect
     */
    static async applyEffectOptions(effect, actor) {
        const activeEffect = actor.effects.find(function (e) {
            return (e.id === effect._id)
        })

        //Local function to apply the options that are shared between all effects
        async function applySharedOptions(options) {
            let updates = activeEffect.toObject();
            foundry.utils.mergeObject(updates.flags, options.flags, { overwrite: false });
            if (options.img) { updates.img = options.img; }
            await activeEffect.update(updates);
        }

        if (effect.flags.succ.effectOptions.boost) {
            let options = effect.flags.succ.effectOptions.boost;
            await applySharedOptions(options);
            EnhancedConditionsPowers.boostLowerBuilder(activeEffect, actor, options.trait, "boost", options.degree);
        }

        if (effect.flags.succ.effectOptions.lower) {
            let options = effect.flags.succ.effectOptions.lower;
            await applySharedOptions(options);
            EnhancedConditionsPowers.boostLowerBuilder(activeEffect, actor, options.trait, "lower", options.degree);
        }

        if (effect.flags.succ.effectOptions.smite) {
            let options = effect.flags.succ.effectOptions.smite;
            await applySharedOptions(options);
            EnhancedConditionsPowers.smiteBuilder(activeEffect, { weaponName: options.weapon, damageBonus: options.bonus, apBonus: options.apBonus, heavy: options.heavy });
        }

        if (effect.flags.succ.effectOptions.protection) {
            let options = effect.flags.succ.effectOptions.protection;
            await applySharedOptions(options);
            EnhancedConditionsPowers.protectionBuilder(activeEffect, options.bonus, options.type);
        }

        if (effect.flags.succ.effectOptions.deflection) {
            let options = effect.flags.succ.effectOptions.deflection;
            await applySharedOptions(options);
            EnhancedConditionsPowers.deflectionBuilder(activeEffect, options.type);
        }

        if (effect.flags.succ.effectOptions.numb) {
            let options = effect.flags.succ.effectOptions.numb;
            await applySharedOptions(options);
            EnhancedConditionsPowers.numbBuilder(activeEffect, options.bonus);
        }
    }


    /**
     * Checks statusEffect icons against map and returns matching condition mappings
     * @param {Array | String} effectIds  A list of effectIds, or a single effectId to check
     * @param {Array} [map=[]]  the condition map to look in
     */
    static lookupEntryMapping(effectIds, map = []) {
        if (!(effectIds instanceof Array)) {
            effectIds = [effectIds];
        }

        if (!map.length) {
            map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
            if (!map.length) return null;
        }

        const conditionEntries = map.filter(row => effectIds.includes(row.id ?? Sidekick.generateUniqueSlugId(row.name)));

        if (conditionEntries.length === 0) return;

        return conditionEntries.length > 1 ? conditionEntries : conditionEntries.shift();
    }

    /**
     * Output one or more condition entries to chat
     * @todo refactor to use actor or token
     */
    static async outputChatMessage(entity, entries, options = { type: "active" }) {
        const isActorEntity = entity instanceof Actor;
        // Turn a single condition mapping entry into an array
        entries = entries instanceof Array ? entries : [entries];

        if (!entity || !entries.length) return;

        const type = {};

        switch (options.type) {
            case "added":
                type.added = true;
                type.title = game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.ChatCard.Title.Added`);
                break;

            case "removed":
                type.removed = true;
                type.title = game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.ChatCard.Title.Removed`);
                break;

            case "active":
            default:
                type.active = true;
                type.title = game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.ChatCard.Title.Active`);
                break;
        }

        const chatUser = game.userId;
        const chatType = CONST.CHAT_MESSAGE_STYLES.OTHER;
        const speaker = isActorEntity ? ChatMessage.getSpeaker({ actor: entity }) : ChatMessage.getSpeaker({ token: entity });
        const timestamp = type.active ? null : Date.now();

        if (speaker.token && isActorEntity && (!entity.prototypeToken.actorLink || !entity.token?.actorLink)) {
            delete speaker.actor;
        }

        // iterate over the entries and mark any with references for use in the template
        entries.forEach((v, i, a) => {
            if (v.referenceId) {
                a[i].hasReference = true;
            }
        });

        const chatCardHeading = game.i18n.localize(type.active ? `${BUTLER.NAME}.ENHANCED_CONDITIONS.ChatCard.HeadingActive` : `${BUTLER.NAME}.ENHANCED_CONDITIONS.ChatCard.Heading`);

        const templateData = {
            chatCardHeading,
            type,
            timestamp,
            entityId: entity.id,
            alias: speaker.alias,
            conditions: entries,
            isOwner: entity.isOwner || game.user.isGM
        };


        // if the last message Enhanced conditions, append instead of making a new one
        const lastMessage = game.messages.contents[game.messages.contents.length - 1];
        const lastMessageSpeaker = lastMessage?.speaker;
        const sameSpeaker = (isActorEntity && speaker.actor) ? lastMessageSpeaker?.actor === speaker.actor : lastMessageSpeaker?.token === speaker.token;
        const hasPermissions = game.user.isGM || lastMessage?.author?.id == game.userId;

        // hard code the recent timestamp to 30s for now
        const recentTimestamp = Date.now() <= lastMessage?.timestamp + 30000;
        const enhancedConditionsDiv = lastMessage?.content.match("enhanced-conditions");

        if (!type.active && enhancedConditionsDiv && sameSpeaker && recentTimestamp && hasPermissions) {
            let newContent = "";
            for (const condition of entries) {
                const newRow = await foundry.applications.handlebars.renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.chatConditionsPartial, { condition, type, timestamp });
                newContent += newRow;
            }
            const existingContent = lastMessage.content;
            const ulEnd = existingContent?.indexOf(`</ul>`);
            if (!ulEnd) return;
            const content = existingContent.slice(0, ulEnd) + newContent + existingContent.slice(ulEnd);
            await lastMessage.update({ content });
            EnhancedConditions.updateConditionTimestamps();
            ui.chat.scrollBottom();
        } else {
            const content = await foundry.applications.handlebars.renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.chatOutput, templateData);

            await ChatMessage.create({
                speaker,
                content,
                type: chatType,
                author: chatUser
            });
        }
    }

    /**
     * Marks a Combatants for a particular entity as defeated
     * @param {Actor | Token} entities  the entity to mark defeated
     * @param {Boolean} options.markDefeated  an optional state flag (default=true)
     */
    static toggleDefeated(entities, { markDefeated = true } = {}) {
        const combat = game.combat;

        if (!entities) {
            // First check for any controlled tokens
            if (canvas?.tokens?.controlled.length) entities = canvas.tokens.controlled;
            else if (game.user.character) entities = game.user.character;
        }

        if (!entities) {
            return;
        }

        entities = entities instanceof Array ? entities : [entities];

        const tokens = entities.flatMap(e => (e instanceof foundry.canvas.placeables.Token || e instanceof TokenDocument) ? e : e instanceof Actor ? e.getActiveTokens() : null);

        const updates = [];

        // loop through tokens, and if there's matching combatants, add them to the update
        for (const token of tokens) {

            const combatants = combat ? combat.combatants?.contents?.filter(c => c.tokenId === token.id && c.defeated != markDefeated) : [];

            if (!combatants.length) return;

            const update = combatants.map(c => {
                return {
                    _id: c.id,
                    defeated: markDefeated
                }
            });

            updates.push(update);
        }

        if (!updates.length) return;

        // update all combatants at once
        combat.updateEmbeddedDocuments("Combatant", updates.length > 1 ? update : updates.shift());
    }

    /**
     */
    static async activateConviction(actor) {
        if (actor.system.details.conviction.active === true) {
            //Condition was toggled due to click on the actor sheet.
            return;
        } else if (actor.system.details.conviction.value >= 1 && actor.system.details.conviction.active === false) {
            //Condition was toggled instead of the button on the actor sheet and actor has at least one conviction token.
            actor.toggleConviction();
        } else if (actor.system.details.conviction.value < 1 && actor.system.details.conviction.active === false) {
            //Condition was toggled instead of the button on the actor sheet but actor has no conviction tokens.
            ui.notifications.warn(game.i18n.localize("ENHANCED_CONDITIONS.Notification.NoConvictionToken"));
            await EnhancedConditionsAPI.removeCondition('conviction', actor, { warn: true });
        }
    }

    /**
     */
    static async deactivateConviction(actor) {
        if (actor.system.details.conviction.active === false) {
            //Condition was toggled due to click on the actor sheet.
            return;
        } else if (actor.system.details.conviction.active === true) {
            //Condition was toggled instead of the button on the actor sheet.
            actor.toggleConviction();
        }
    }

    /**
     * For a given entity, removes conditions other than the one supplied
     * @param {*} entity
     * @param {*} conditionId
     */
    static async removeOtherConditions(entity, conditionId) {
        const entityConditions = await EnhancedConditionsAPI.getConditions(entity, { warn: false });
        let conditions = entityConditions ? entityConditions.conditions : [];
        conditions = conditions instanceof Array ? conditions : [conditions];

        if (!conditions.length) return;

        const removeConditions = conditions.filter(c => c.id !== conditionId);

        if (!removeConditions.length) return;

        for (const c of removeConditions) await EnhancedConditionsAPI.removeCondition(c.id, entity, { warn: true });
    }

    /**
     * Process macros based on given Ids
     * @param {*} macroIds
     * @param {*} entity
     * @param {*} conditionId
     */
    static async _processMacros(macroIds, actor, conditionId) {
        for (const macroId of macroIds) {
            const macro = game.macros.get(macroId);
            if (!macro) continue;

            const scope = {
                actor: actor,
                conditionId: conditionId,
            };

            await macro.execute(scope);
        }
    }

    /**
     * Update condition added/removed timestamps
     */
    static updateConditionTimestamps() {
        const conditionRows = document.querySelectorAll("ol#chat-log ul.condition-list li");
        for (const li of conditionRows) {
            const timestamp = typeof li.dataset.timestamp === "string" ? parseInt(li.dataset.timestamp) : li.dataset.timestamp;
            const iconSpanWrapper = li.querySelector("span.add-remove-icon");

            if (!timestamp || !iconSpanWrapper) continue;

            const type = li.dataset.changeType;
            iconSpanWrapper.title = `${type} ${foundry.utils.timeSince(timestamp)}`;
        }
    }

    /* -------------------------------------------- */
    /*                    Helpers                   */
    /* -------------------------------------------- */

    /**
     * Determines whether to display the combat utility belt div in the settings sidebar
     * @param {Boolean} display
     * @todo: extract to helper in sidekick class?
     */
    static _toggleLabButtonVisibility(display) {
        if (!game.user.isGM) {
            return;
        }

        let labButton = document.getElementById("condition-lab");

        if (display && labButton && labButton.style.display !== "block") {
            return labButton.style.display = "block";
        }

        if (labButton && !display && labButton.style.display !== "none") {
            return labButton.style.display = "none";
        }
    }

    /**
     * Loads teh condition map json and applies any system overrides
     */
    static async loadConditionConfigMap() {
        const source = "data";
        const overridesJsons = await Sidekick.fetchJsons(source, BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionModuleOverridesPath);
        const conditionConfigJson = await Sidekick.fetchJson(BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionConfigFilePath);
        const groupsJsons = await Sidekick.fetchJsons(source, BUTLER.DEFAULT_CONFIG.enhancedConditions.defaultConditionGroupsPath);

        groupsJsons.sort((a, b) => a.sortOrder - b.sortOrder);
        this.conditionGroups = [];
        for (let group of groupsJsons) {
            this.conditionGroups.push({ ...group });
        }

        game.succ.conditionConfigMap = conditionConfigJson.map;

        let defaultConditions = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions);
        if (!defaultConditions || defaultConditions.length === 0) {
            defaultConditions = undefined;
        }

        for (let condition of game.succ.conditionConfigMap) {
            for (let group of groupsJsons) {
                if (group.canBeDisabled) {
                    continue;
                }

                let conditionId = group.conditions.find(c => c.id === condition.id);
                if (conditionId) {
                    condition.destroyDisabled = true;
                    break;
                }
            }
        }

        const useSystemIcons = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.useSystemIcons)

        //Loop over the default conditions and look for ones that are missing from our full map
        const statusEffects = CONFIG.defaultStatusEffects ? CONFIG.defaultStatusEffects : CONFIG.statusEffects;
        for (let statusEffect of statusEffects) {
            const conditionConfig = game.succ.conditionConfigMap.find(c => c.id === statusEffect.id);
            if (!conditionConfig) {
                //If the condition doesn't exist in the full map, it must be something new that was added to the system, so we need to add it
                let newCondition = {
                    id: statusEffect.id,
                    name: statusEffect.name,
                    img: statusEffect.img
                };

                if (statusEffect.changes) {
                    newCondition.activeEffect = {
                        changes: statusEffect.changes,
                        duration: statusEffect.duration,
                        flags: statusEffect.flags,
                        system: statusEffect.system
                    };
                }
                game.succ.conditionConfigMap.push(newCondition);
            } else if (useSystemIcons) {
                conditionConfig.img = statusEffect.img;
            }
        }

        //Loop over our overrides and check if any of them are active
        overridesJsons.sort((a, b) => a.priority - b.priority);
        for (let overrides of overridesJsons) {
            if (game.modules.get(overrides.module)?.active) {
                for (const override of overrides.map) {
                    const condition = game.succ.conditionConfigMap.find(c => c.id === override.id);
                    if (!condition) {
                        //If the condition doesn't exist, add it to the map
                        game.succ.conditionConfigMap.push(override);
                    } else {
                        //If the condition exists, merge the data instead
                        foundry.utils.mergeObject(condition, override);
                    }
                }
            }
        }

        // If the default config contains changes and we have not overridden them in the system definition, copy those over
        for (let statusEffect of statusEffects) {
            if (!statusEffect.changes && !statusEffect.duration && !statusEffect.flags && !statusEffect.system) {
                continue;
            }

            let conditionConfig = game.succ.conditionConfigMap.find(c => c.id === statusEffect.id);
            if (conditionConfig) {
                if (conditionConfig.ignoreSystemSettings) {
                    // We've decided that we want to prioritize what we have in our condition-config.json file
                    continue;
                }

                conditionConfig.activeEffect = conditionConfig.activeEffect ? conditionConfig.activeEffect : {};

                //Take anything that the system has set while prioritizing anything we've set in the config
                //This allows us to use the system logic while overriding pieces of it
                //This is most often used when the system effect does not have a duration but we want to add one
                conditionConfig.activeEffect = foundry.utils.mergeObject(conditionConfig.activeEffect, {
                    ...statusEffect.duration != undefined ? { duration: statusEffect.duration } : null,
                    ...statusEffect.system != undefined ? { system: statusEffect.system } : null,
                });

                //Combine the list of changes rather than stomping
                //This allows us to add keys in the config while keeping the ones from the system
                if (statusEffect.changes != undefined) {
                    conditionConfig.activeEffect.changes = conditionConfig.activeEffect.changes ?? [];
                    conditionConfig.activeEffect.changes = conditionConfig.activeEffect.changes.concat(statusEffect.changes);

                    //Remove duplicate keys, keeping what is in our config
                    conditionConfig.activeEffect.changes = conditionConfig.activeEffect.changes.filter((condition, pos) =>
                    conditionConfig.activeEffect.changes.findIndex(c => c.key == condition.key) === pos);
                }
            }
        }

        for (let condition of game.succ.conditionConfigMap) {
            if (condition.referenceId) {
                let regex = /(?<=\{).+(?=\})/;
                let match = condition.referenceId.match(regex);
                if (match) {
                    //Our referenceId already contains a name, so let's attempt to localize it in case it is a loc id
                    condition.referenceId = condition.referenceId.replace(regex, `${game.i18n.localize(match[0])}`);
                } else {
                    //Our referenceId does not have a name, so use the condition's name
                    condition.referenceId += `{${game.i18n.localize(condition.name)}}`;
                }
            }

            if (condition.activeEffect) {
                condition.activeEffect.name = game.i18n.localize(condition.name);
            }
        }
    }

    /**
     * Returns the default maps supplied with the module
     */
    static async _loadDefaultConditions() {
        const source = "data";
        const groupsJsons = await Sidekick.fetchJsons(source, BUTLER.DEFAULT_CONFIG.enhancedConditions.defaultConditionGroupsPath);

        const defaultConditions = [];

        for (let condition of game.succ.conditionConfigMap) {
            let foundCondition = false;
            for (let group of groupsJsons) {
                const defaultCondition = group.conditions.find(c => c.id === condition.id);
                if (defaultCondition) {
                    foundCondition = true;
                    defaultConditions.push({id: condition.id, enabled: !!defaultCondition.enabledByDefault});
                    break;
                }
            }

            if (!foundCondition) {
                //This condition doesn't exist in any of our groups so we'll assume it came from the system
                //Add it to the default map so that the user can see it
                defaultConditions.push({id: condition.id, enabled: true});
            }
        }

        return defaultConditions;
    }

    /**
     * Parse the provided Condition Map and prepare it for storage, validating and correcting bad or missing data where possible
     * @param {*} conditionMap
     */
    static _prepareMap(conditionMap) {
        const preparedMap = [];

        if (!conditionMap || !conditionMap?.length) {
            return preparedMap;
        }

        const outputChatSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat);

        // Map existing ids for ease of access
        const existingIds = conditionMap.filter(c => c.id).map(c => c.id);
        const processedIds = [];

        // Iterate through the map validating/preparing the data
        for (let i = 0; i < conditionMap.length; i++) {
            let condition = foundry.utils.duplicate(conditionMap[i]);

            // Delete falsy values
            if (!condition) preparedMap.splice(i, 1);

            if (!condition.name) {
                condition.name = condition.name ?? (condition.img ? Sidekick.getNameFromFilePath(condition.img) : "");
            }

            //If this condition matches something in our default status effects, copy its id
            let statusEffects = CONFIG.defaultStatusEffects ? CONFIG.defaultStatusEffects : CONFIG.statusEffects;
            const statusEffect = statusEffects.find(e => e.name === condition.name);
            if (statusEffect) {
                condition.id = statusEffect.id;
            } else if (condition.options?.customId) {
                condition.id = condition.options.customId;
            } else if (!condition.id) {
                condition.id = Sidekick.createId(existingIds);
            }

            // If conditionId doesn't exist, or is a duplicate, create a new Id
            condition.id = (!condition.id || processedIds.includes(condition.id)) ? Sidekick.createId(existingIds) : condition.id;
            processedIds.push(condition.id);

            condition.options = condition.options || {};
            if (condition.options.outputChat === undefined) condition.options.outputChat = outputChatSetting;
            preparedMap.push(condition);
        }

        return preparedMap;
    }

    /**
     * Duplicate the core status icons, freeze the duplicate then store a copy in settings
     */
    static _backupCoreEffects() {
        CONFIG.defaultStatusEffects = CONFIG.defaultStatusEffects || foundry.utils.duplicate(CONFIG.statusEffects);
        if (!Object.isFrozen(CONFIG.defaultStatusEffects)) {
            Object.freeze(CONFIG.defaultStatusEffects);
        }
    }

    /**
     * Duplicate the core special status effect mappings, freeze the duplicate then store a copy in settings
     */
    static _backupCoreSpecialStatusEffects() {
        CONFIG.defaultSpecialStatusEffects = CONFIG.defaultSpecialStatusEffects || foundry.utils.duplicate(CONFIG.specialStatusEffects);
        if (!Object.isFrozen(CONFIG.defaultSpecialStatusEffects)) {
            Object.freeze(CONFIG.defaultSpecialStatusEffects);
        }
        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultSpecialStatusEffects, CONFIG.defaultSpecialStatusEffects);
    }

    /**
     * Gets one or more conditions from the map by their name
     * @param {String} conditionId  the condition to get
     * @param {Array} map  the condition map to search
     */
    static lookupConditionById(conditionId, map = null) {
        if (!conditionId) return;

        conditionId = conditionId instanceof Array ? conditionId : [conditionId];

        if (!map) map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        const conditions = map.filter(c => conditionId.includes(c.id)) ?? [];

        if (!conditions.length) return null;

        return conditions.length > 1 ? conditions : conditions.shift();
    }

    /**
     * Gets one or more conditions from the map by their name
     * @param {String} conditionId  the condition to get
     * @param {Array} map  the condition map to search
     */
    static lookupConditionByOption(option) {
        if (!option) return;

        const map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        return map.find(c => c.options && c.options[option]);
    }

    /**
     * Updates the CONFIG.statusEffect effects with Condition Map ones
     * @param {*} conditionMap
     */
    static _updateStatusEffects(conditionMap) {
        const coreEffectsSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects);

        //save the original icons
        if (!coreEffectsSetting.length) {
            EnhancedConditions._backupCoreEffects();
        }

        const removeDefaultEffects = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.removeDefaultEffects);
        const activeConditionMap = conditionMap || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (!removeDefaultEffects && !activeConditionMap) {
            return;
        }

        const activeConditionEffects = EnhancedConditions._prepareStatusEffects(activeConditionMap, {excludeDisabledStatusEffects: true});

        if (removeDefaultEffects) {
            CONFIG.statusEffects = activeConditionEffects ?? [];
        } else if (activeConditionMap instanceof Array) {
            //add the icons from the condition map to the status effects array
            const coreEffects = CONFIG.defaultStatusEffects || Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects);

            // Create a Set based on the core status effects and the Enhanced Condition effects. Using a Set ensures unique icons only
            CONFIG.statusEffects = coreEffects.concat(activeConditionEffects);
        }

        //Loop over our list of special effect and update them to match our settings
        Object.keys(CONFIG.specialStatusEffects).forEach((key) => {
            const optionName = Sidekick.getOptionBySpecialStatusEffect(key);
            if (!optionName) {
                //We don't support this effect
                CONFIG.specialStatusEffects[key] = "";
                return;
            }

            const activeCondition = activeConditionMap.find(c => c.id === CONFIG.specialStatusEffects[key]);
            if (activeCondition) {
                //The name of this effect matches one of our effects. Check its options
                if (foundry.utils.hasProperty(activeCondition.options, optionName)) {
                    if (foundry.utils.getProperty(activeCondition.options, optionName)) {
                        //This effect has the option enabled, so just leave it as is
                        return;
                    }

                    //This effect does not have the option enabled, so disable it in the special effects
                    CONFIG.specialStatusEffects[key] = "";
                }
            }

            //Check our map to see if any of our conditions have this option enabled
            const configCondition = activeConditionMap.find(c => {
                if (foundry.utils.hasProperty(c.options, optionName)) {
                    const optionValue = foundry.utils.getProperty(c.options, optionName);
                    return optionValue;
                }
                return false;
            });

            if (configCondition) {
                //We found a condition with this option enabled, so set it as the condition to use for the special effect
                CONFIG.specialStatusEffects[key] = configCondition.id;
            }
        });
    }

    /**
     * Converts the given Condition Map (one or more Conditions) into a Status Effects array or object
     * @param {Array | Object} conditionMap
     * @returns {Array} statusEffects
     */
    static _prepareStatusEffects(conditionMap, {excludeDisabledStatusEffects=false}={}) {
        conditionMap = conditionMap instanceof Array ? conditionMap : [conditionMap];

        if (!conditionMap.length) return;

        const existingIds = conditionMap.filter(c => c.id).map(c => c.id);

        const statusEffects = [];

        for (const c of conditionMap) {
            if (excludeDisabledStatusEffects && !c.destroyDisabled &&
                c.options?.useAsStatusEffect != undefined &&
                !c.options.useAsStatusEffect) {
                continue;
            }

            const id = c.id ?? Sidekick.createId(existingIds);
            const effect = {
                id: id,
                flags: {
                    ...c.activeEffect?.flags,
                    [BUTLER.NAME]: {
                        [BUTLER.FLAGS.enhancedConditions.conditionId]: id,
                        [BUTLER.FLAGS.enhancedConditions.overlay]: c?.options?.overlay ?? false
                    }
                },
                system: c.activeEffect?.system,
                name: c.name,
                img: c.img,
                changes: c.activeEffect?.changes || [],
                duration: c.duration || c.activeEffect?.duration || {},
                description: c.activeEffect?.description || '',
                statuses: [id]
            }
            statusEffects.push(effect);
        };

        return statusEffects.length > 1 ? statusEffects : statusEffects.shift();
    }

    /**
     * Prepares one or more ActiveEffects from Conditions for placement on an actor
     * @param {Object | Array} effects  a single ActiveEffect data object or an array of ActiveEffect data objects
     */
    static _prepareActiveEffects(effects) {
        if (!effects) return;

        for (const effect of effects) {
            const overlay = foundry.utils.getProperty(effect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.overlay}`);
            // If the parent Condition for the ActiveEffect defines it as an overlay, mark the ActiveEffect as an overlay
            if (overlay) {
                effect.flags.core = effect.flags.core ? effect.flags.core : {};
                effect.flags.core.overlay = overlay;
            }
        }

        return effects;
    }

    /**
     * Returns just the icon side of the map
     */
    static getConditionIcons(conditionMap = {}) {
        if (!conditionMap) {
            //maybe log an error?
            return;
        }

        if (Object.keys(conditionMap).length === 0) {
            conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

            if (!conditionMap || Object.keys(conditionMap).length === 0) {
                return [];
            }
        }

        if (conditionMap instanceof Array) {
            return conditionMap.map(mapEntry => mapEntry.img);
        }

        return [];
    }

    /**
     * Retrieves a condition icon by its mapped name
     * @param {*} condition
     */
    static getIconsByCondition(condition, { firstOnly = false } = {}) {
        const conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (!conditionMap || !condition) {
            return;
        }

        if (conditionMap instanceof Array) {
            const filteredConditions = conditionMap.filter(c => c.name === condition).map(c => c.img);
            if (!filteredConditions.length) {
                return;
            }

            return firstOnly ? filteredConditions[0] : filteredConditions;
        }

        return null;
    }

    /**
     * Retrieves a condition name by its mapped icon
     * @param {*} icon
     */
    static getConditionsByImg(img, { firstOnly = false } = {}) {
        const conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (!conditionMap || !img) {
            return;
        }

        if (conditionMap instanceof Array && conditionMap.length) {
            const filteredIcons = conditionMap.filter(c => c.img === img).map(c => c.name);
            if (!filteredIcons.length) {
                return null;
            }
            return firstOnly ? filteredIcons[0] : filteredIcons;
        }

        return null;
    }

    /**
     * Parses a condition map JSON and returns a map
     * @param {*} json
     */
    static mapFromJson(json) {
        if (json.system !== game.system.id) {
            ui.notifications.warn(game.i18n.localize("ENHANCED_CONDITIONS.MapMismatch"));
        }

        const map = json.map ? EnhancedConditions._prepareMap(json.map) : [];

        return map;
    }

    /**
     * Builds a map of default conditions from a list of conditions
     */
    static getMapForDefaultConditions(defaultConditions) {
        let map = [];
        for (let defaultCondition of defaultConditions) {
            if (defaultCondition.enabled) {
                map.push(game.succ.conditionConfigMap.find(c => c.id === defaultCondition.id));
            }
        }
        return map;
    }

    /**
     * Returns the default condition map for a given system
     */
    static getDefaultMap(defaultConditions = null) {
        defaultConditions = defaultConditions ? defaultConditions : Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions);

        return EnhancedConditions.getMapForDefaultConditions(defaultConditions);
    }
    /**
     * The system changed AEs to use system instead of flags.swade. This function migrates our data to that structure
     */
    static async migrateFlagsToSystem() {
        let conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        for (let condition of conditionMap) {
            if (!condition.activeEffect) {
                continue;
            }

            if (condition.activeEffect.system == undefined) {
                const conditionConfig = game.succ.conditionConfigMap.find(c => c.id === condition.id);
                if (conditionConfig?.activeEffect?.system) {
                    condition.activeEffect.system = conditionConfig.activeEffect.system;
                }
            }

            if (condition.activeEffect.flags?.swade) {
                const flags = condition.activeEffect.flags.swade;
                condition.activeEffect.system = condition.activeEffect.system ?? {};
                condition.activeEffect.system = foundry.utils.mergeObject(condition.activeEffect.system, flags);

                delete condition.activeEffect.system.related; //Hack to deal with a temp issue in the system code effect definitions
                delete condition.activeEffect.flags.swade.expiration;
                delete condition.activeEffect.flags.swade.loseTurnOnHold;
                if (Object.keys(condition.activeEffect.flags.swade).length == 0) {
                    delete condition.activeEffect.flags.swade;

                    if (Object.keys(condition.activeEffect.flags).length == 0) {
                        delete condition.activeEffect.flags;
                    }
                }
            }
        }

        await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, conditionMap);
    }

    /**
     * Updates the condition map to include any changes from the default map and system settings
     * If the user has made their own changes to a condition, the condition in the default map will be ignored
     */
    static async updateConditionMapFromDefaults() {
        let conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        let defaultConditions = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions);
        let deletedConditionsMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.deletedConditionsMap);

        for (let conditionConfig of game.succ.conditionConfigMap) {
            const condition = conditionMap.find(c => c.id === conditionConfig.id);
            if (!condition) {
                const defaultCondition = defaultConditions.find(c => c === conditionConfig.id);
                const deletedCondition = deletedConditionsMap.find(c => c.id === conditionConfig.id);
                if (defaultCondition && !deletedCondition) {
                    conditionMap.push(foundry.utils.duplicate(conditionConfig));
                }
            } else {
                if (!conditionConfig.activeEffect) {
                    //The default condition doesn't have an active effect, so we'll just leave whatever is in the condition alone
                    //We're making the assumption here that none of the core system effects will ever have an active effect in one version and then remove it later
                    //It's very unlikely to ever happen and in the rare case it does, the user can manually reset their map to fix it
                    continue;
                }

                const activeEffectCustomized = condition.activeEffect && Sidekick.getModuleFlag(condition.activeEffect, BUTLER.FLAGS.enhancedConditions.activeEffectCustomized);
                if (activeEffectCustomized) {
                    //If the user has made changes to this condition, we'll assume they want it that way and leave it as is
                    continue;
                }

                //If we didn't have local changes, we'll assume the user wants the most up to date functionality
                //For simplicity, we set the value here regardless of if it's changed or not
                condition.activeEffect = { ...conditionConfig.activeEffect };
            }
        }

        await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, conditionMap);
    }

    /**
     * Adds/removes default conditions to the map
     * This does not touch conditions that are already in the map and so won't overwrite any changes from the user
     */
    static async refreshMapDefaults() {
        const newMap = EnhancedConditions.getDefaultMap();
        const conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
        const deletedConditionsMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.deletedConditionsMap);

        for (let newCondition of newMap) {
            let condition = conditionMap.find(c => c.id === newCondition.id);
            if (condition) {
                //We had this condition in the old map
                //Copy over its settings to the new map
                let conditionIndex = newMap.findIndex(c => c.id === condition.id);
                newMap[conditionIndex] = condition;
            }
        }

        //Loop over the old map and add any manually added conditions to the new map
        for (let condition of conditionMap) {
            if (condition.addedByLab) {
                let conditionIndex = conditionMap.findIndex(c => c.id === condition.id);
                newMap.splice(conditionIndex, 0, condition);
            }
        }

        const oldDeletedConditionsMap = foundry.utils.duplicate(deletedConditionsMap);
        for (let deletedCondition of oldDeletedConditionsMap) {
            const newIdx = newMap.findIndex(c => c.id === deletedCondition.id);
            if (newIdx < 0) {
                //This condition doesn't exist in the new map which means it has been disabled in the options
                //Let's remove it from the deleted conditions so that it will reappear if it's reenabled
                const delIdx = deletedConditionsMap.findIndex(c => c.id === deletedCondition.id);
                deletedConditionsMap.splice(delIdx, 1);
            } else {
                //This condition exists in the new map but we manually deleted it
                //Remove it from the new map
                newMap.splice(newIdx, 1);
            }
        }

        //Sort the map in an attempt to maintain as close to the same sort as we had before
        //If a condition wasn't in the old map, we'll use its position in the new map as a rough estimate for where it should be
        newMap.sort((a, b) => {
            let aIdx = conditionMap.findIndex(c => c.id === a.id);
            let bIdx = conditionMap.findIndex(c => c.id === b.id);
            if (aIdx == -1) {
                aIdx = newMap.findIndex(c => c.id === a.id);
            }
            if (bIdx == -1) {
                bIdx = newMap.findIndex(c => c.id === b.id);
            }
            return aIdx - bIdx;
        });

        await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);
        await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.deletedConditionsMap, deletedConditionsMap);
    }
}