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
            await EnhancedConditions.checkForSystemUpdates();
        }

        let defaultMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMap);
        let conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        const mapType = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType);
        const defaultMapType = Sidekick.getKeyByValue(BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes, BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes.default);

        // If there's no defaultMap, check storage then set appropriately
        if (!defaultMap || (Object.keys(defaultMap).length === 0 && defaultMap.constructor === Object)) {
            if (game.user.isGM) {
                defaultMap = await EnhancedConditions._loadDefaultMap();
                Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMap, defaultMap);
            }
        }

        // If map type is not set, set maptype to default
        if (!mapType) {            
            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, defaultMapType);
        }

        // If there's no condition map, get the default one
        if (!conditionMap.length) {
            // Pass over defaultMap since the storage version is still empty
            conditionMap = EnhancedConditions.getDefaultMap(defaultMap);

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
    }

    /**
     * Hooks on token updates. If the update includes effects, calls the journal entry lookup
     */
    static async _onUpdateActor(actor, update, options, userId) {
        if (game.userId !== userId) {
            return;
        }
        
        //Add Conviction:
        if (update?.system?.details?.conviction?.active === true) {
            //Check if condition was toggled on token, otherwise toggle it here:
            if (await EnhancedConditionsAPI.hasCondition('conviction', actor, {warn: false}) === true) { return; }

            await EnhancedConditionsAPI.addCondition('conviction', actor);
        }

        //Remove Conviction:
        if (update?.system?.details?.conviction?.active === false) {
            await EnhancedConditionsAPI.removeCondition('conviction', actor, {warn:false});
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

        EnhancedConditions._processActiveEffectChange(effect, "create", userId);
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

        EnhancedConditions._processActiveEffectChange(effect, "delete", userId);
    }

    /**
     * Render Chat Message handler
     * @param {*} app 
     * @param {*} html 
     * @param {*} data 
     * @todo move to chatlog render?
     */
    static async _onRenderChatMessage(app, html, data) {
        if (data.message.content && !data.message.content.match("enhanced-conditions")) {
            return;
        }

        const speaker = data.message.speaker;

        if (!speaker) return;

        const removeConditionAnchor = html.find("a[name='remove-row']");
        const undoRemoveAnchor = html.find("a[name='undo-remove']");

        if (!game.user.isGM) {
            removeConditionAnchor.parent().hide();
            undoRemoveAnchor.parent().hide();
        }

        /**
         * @todo #284 move to chatlog listener instead
         */
        removeConditionAnchor.on("click", event => {
            const conditionListItem = event.target.closest("li");
            const conditionId = conditionListItem.dataset.conditionId;
            const messageListItem = conditionListItem?.parentElement?.closest("li");
            const messageId = messageListItem?.dataset?.messageId;
            const message = messageId ? game.messages.get(messageId) : null;

            if (!message) return;

            const actor = ChatMessage.getSpeakerActor(message.speaker);

            EnhancedConditionsAPI.removeCondition(conditionId, actor, {warn: false});
        });

        undoRemoveAnchor.on("click", event => {
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
            const entity = token ?? actor;

            if (!entity) return;

            EnhancedConditionsAPI.addCondition(conditionId, entity);
        });
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
        const effectIcons = html.find("img[class='token-effect']");

        effectIcons.each((index, element) => {
            const url = new URL(element.src);
            const path = url?.pathname?.substring(1); 
            const conditions = EnhancedConditions.getConditionsByIcon(path);
            const statusEffect = CONFIG.statusEffects.find(e => e.icon === path);

            if (conditions?.length) {
                element.title = conditions[0];
            } else if (statusEffect?.label) {
                element.title = game.i18n.localize(statusEffect.label);
            }
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
    static _processActiveEffectChange(effect, type="create", userId) {
        if (!(effect instanceof ActiveEffect)) return;
        
        const effectId = effect.getFlag(`${BUTLER.NAME}`, `${BUTLER.FLAGS.enhancedConditions.conditionId}`);
        if (!effectId) return;

        const condition = EnhancedConditions.lookupEntryMapping(effectId);

        if (!condition) return;

        const shouldOutput = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat) && condition.options.outputChat;
        const outputType = type === "delete" ? "removed" : "added";
        const actor = effect.parent;
        
        if (shouldOutput) EnhancedConditions.outputChatMessage(actor, condition, {type: outputType});
        let macros = [];

        switch (type) {
            case "create":
                macros = condition.macros?.filter(m => m.type === "apply");

                const hasEffectOptions = hasProperty(effect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.effectOptions}`);
                if (hasEffectOptions && Object.keys(effect.flags.succ.effectOptions).length > 0) {
                    EnhancedConditions.applyEffectOptions(effect, actor);                  
                } else {
                    EnhancedConditions.applyConditionOptions(condition, actor, "create");
                }
                break;

            case "delete":
                macros = condition.macros?.filter(m => m.type === "remove");
                EnhancedConditions.applyConditionOptions(condition, actor, "delete");
                break;

            default:
                break;
        }

        const macroIds = macros?.length ? macros.filter(m => m.id).map(m => m.id) : null;

        if (macroIds?.length) EnhancedConditions._processMacros(macroIds, actor);
    }

    static applyConditionOptions(condition, actor, type="create") {
        switch (type) {
            case "create":
                if (condition.options?.removeOthers) EnhancedConditions.removeOtherConditions(actor, condition.id);
                if (condition.options?.markDefeated) EnhancedConditions.toggleDefeated(actor, {markDefeated: true});
                if (condition.options?.boostTrait) EnhancedConditionsPowers.boostLowerTrait(actor, condition, true);
                if (condition.options?.lowerTrait) EnhancedConditionsPowers.boostLowerTrait(actor, condition, false);
                if (condition.options?.smite) EnhancedConditionsPowers.smite(actor, condition);
                if (condition.options?.protection) EnhancedConditionsPowers.protection(actor, condition);
                if (condition.options?.conviction) EnhancedConditions.activateConviction(actor);
                
                break;

            case "delete":
                if (condition.options?.markDefeated) EnhancedConditions.toggleDefeated(actor, {markDefeated: false});
                if (condition.options?.conviction) EnhancedConditions.deactivateConviction(actor);
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
            foundry.utils.mergeObject(updates.flags, options.flags, {overwrite: false});
            if (options.icon) { updates.icon = options.icon; }
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
            EnhancedConditionsPowers.smiteBuilder(activeEffect, options.weapon, options.bonus);
        }

        if (effect.flags.succ.effectOptions.protection) {
            let options = effect.flags.succ.effectOptions.protection;
            await applySharedOptions(options);
            EnhancedConditionsPowers.protectionBuilder(activeEffect, options.bonus, options.type);
        }
    }
        

    /**
     * Checks statusEffect icons against map and returns matching condition mappings
     * @param {Array | String} effectIds  A list of effectIds, or a single effectId to check
     * @param {Array} [map=[]]  the condition map to look in
     */
    static lookupEntryMapping(effectIds, map=[]) {
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
    static async outputChatMessage(entity, entries, options={type: "active"}) {
        const isActorEntity = entity instanceof Actor;
        const isTokenEntity = entity instanceof Token || entity instanceof TokenDocument;
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
        //const token = token || this.currentToken;
        const chatType = CONST.CHAT_MESSAGE_TYPES.OTHER;
        const speaker = isActorEntity ? ChatMessage.getSpeaker({actor: entity}) : ChatMessage.getSpeaker({token: entity});
        const timestamp = type.active ? null : Date.now();

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
        const sameSpeaker = isActorEntity ? lastMessageSpeaker?.actor === speaker.actor : lastMessageSpeaker?.token === speaker.token;
        const hasPermissions = game.user.isGM || lastMessage?.user?.id == game.userId;
        
        // hard code the recent timestamp to 30s for now
        const recentTimestamp = Date.now() <= lastMessage?.timestamp + 30000;
        const enhancedConditionsDiv = lastMessage?.content.match("enhanced-conditions");

        if (!type.active && enhancedConditionsDiv && sameSpeaker && recentTimestamp && hasPermissions) {
            let newContent = "";
            for (const condition of entries) {
                const newRow = await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.chatConditionsPartial, {condition, type, timestamp});
                newContent += newRow;
            }
            const existingContent = lastMessage.content;
            const ulEnd = existingContent?.indexOf(`</ul>`);
            if (!ulEnd) return;
            const content = existingContent.slice(0, ulEnd) + newContent + existingContent.slice(ulEnd);
            await lastMessage.update({content});
            EnhancedConditions.updateConditionTimestamps();
            ui.chat.scrollBottom();
        } else {
            const content = await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.chatOutput, templateData);

            await ChatMessage.create({
                speaker,
                content,
                type: chatType,
                user: chatUser
            });
        }
    }

    /**
     * Marks a Combatants for a particular entity as defeated
     * @param {Actor | Token} entities  the entity to mark defeated
     * @param {Boolean} options.markDefeated  an optional state flag (default=true)
     */
    static toggleDefeated(entities, {markDefeated=true}={}) {
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

        const tokens = entities.flatMap(e => (e instanceof Token || e instanceof TokenDocument) ? e : e instanceof Actor ? e.getActiveTokens() : null);

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
            await EnhancedConditionsAPI.removeCondition('conviction', actor, {warn: true});
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
        const entityConditions = await EnhancedConditionsAPI.getConditions(entity, {warn: false});
        let conditions = entityConditions ? entityConditions.conditions : [];
        conditions = conditions instanceof Array ? conditions : [conditions];

        if (!conditions.length) return;

        const removeConditions = conditions.filter(c => c.id !== conditionId);

        if (!removeConditions.length) return;

        for (const c of removeConditions) await EnhancedConditionsAPI.removeCondition(c.id, entity, {warn: true});
    }

    /**
     * Process macros based on given Ids
     * @param {*} macroIds 
     * @param {*} entity 
     */
    static async _processMacros(macroIds, entity=null) {
        const isToken = entity instanceof Token || entity instanceof TokenDocument;
        const isActor = entity instanceof Actor;

        for (const macroId of macroIds) {
            const macro = game.macros.get(macroId);
            if (!macro) continue;

            const scope = isToken ? {token: entity} : (isActor ? {actor: entity} : null);
            await macro.execute(scope);
        }
    }

    /**
     * Update condition added/removed timestamps
     */
    static updateConditionTimestamps() {
        const conditionRows = document.querySelectorAll("ol#chat-log ul.condition-list li");
        for ( const li of conditionRows ) {
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
     * Creates a button for the Condition Lab
     * @param {Object} html the html element where the button will be created
     */
    static _createLabButton(html) {
        if (!game.user.isGM) return;

        const succDiv = html.find("#succ");

        const labButton = $(
            `<button id="condition-lab" data-action="condition-lab">
                    <i class="fas fa-flask"></i> ${BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionLab.title}
                </button>`
        );
        
        succDiv.append(labButton);

        labButton.on("click", event => {
            return game.succ.conditionLab = new ConditionLab().render(true);
        });
    }

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
     * Returns the default maps supplied with the module
     * 
     * @todo: map to entryId and then rebuild on import
     */
    static async _loadDefaultMap() {
        const source = "data";
        const conditionMapFilePath = BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionMapFilePath;
        const overridesPath = BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionModuleOverridesPath;
        const conditionMapJson = await Sidekick.fetchJson(conditionMapFilePath);
        const overridesJsons = await Sidekick.fetchJsons(source, overridesPath);
        
        const defaultMap = conditionMapJson.map;
        
        //Loop over our overrides and check if any of them are active
        for (let overrides of overridesJsons) {
            if (game.modules.get(overrides.module)?.active) {
                for (const override of overrides.map) {
                    const condition = defaultMap.find(c => c.id === override.id);
                    if (!condition) {
                        //If the condition doesn't exist, add it to the map
                        defaultMap.push(override);
                    } else {
                        //If the condition exists, merge the data instead
                        foundry.utils.mergeObject(condition, override);
                    }
                }
                break;
            }
        }

        // We have to add the fighting die modifier for prone here rather than in the json because we need to know the fighting skill name
        let proneCondition = defaultMap.find(c => c.id === BUTLER.DEFAULT_CONFIG.enhancedConditions.proneId);
        if (proneCondition) {
            const fightingSkill = game.settings.get("swade", "parryBaseSkill");
            proneCondition.activeEffect.changes.push({
                "key": `@Skill{${fightingSkill}}[system.die.modifier]`,
                "value": "-2",
                "mode": 2
            });
        }
        
        // If the default config contains changes and we have not overridden them in the system definition, copy those over
        const statusEffects = CONFIG.defaultStatusEffects ? CONFIG.defaultStatusEffects : CONFIG.statusEffects;
        for (let statusEffect of statusEffects) {
            let condition = defaultMap.find(c => c.name === statusEffect.label);
            if (!condition) {
                continue;
            }                
            
            if (!condition.activeEffect) {
                condition.activeEffect = {...statusEffect};
            } else {
                foundry.utils.mergeObject(condition.activeEffect, statusEffect, {overwrite: false});
            }
        }

        for (let condition of defaultMap) {
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
                condition.activeEffect.label = game.i18n.localize(condition.name);
                condition.activeEffect.icon = condition.icon;
            }
        }

        return defaultMap;
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
            let condition = duplicate(conditionMap[i]);

            // Delete falsy values
            if (!condition) preparedMap.splice(i, 1);

            if (!condition.name) {
                condition.name = condition.label ?? (condition.icon ? Sidekick.getNameFromFilePath(condition.icon) : "");
            }

            //If this condition matches something in our default status effects, copy its id
            let statusEffects = CONFIG.defaultStatusEffects ? CONFIG.defaultStatusEffects : CONFIG.statusEffects;
            const statusEffect = statusEffects.find(e => e.label === condition.name);
            if (statusEffect) {
                condition.id = statusEffect.id;
            } else if (!condition.id) {
                condition.id = condition.name;
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
        CONFIG.defaultStatusEffects = CONFIG.defaultStatusEffects || duplicate(CONFIG.statusEffects);
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
    static lookupConditionById(conditionId, map=null) {
        if (!conditionId) return;

        conditionId = conditionId instanceof Array ? conditionId : [conditionId];

        if (!map) map = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        const conditions = map.filter(c => conditionId.includes(c.id)) ?? [];

        if (!conditions.length) return null;

        return conditions.length > 1 ? conditions : conditions.shift();
    }

    /**
     * Updates the CONFIG.statusEffect effects with Condition Map ones
     * @param {*} conditionMap 
     */
    static _updateStatusEffects(conditionMap) {
        let entries;
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

        const activeConditionEffects = EnhancedConditions._prepareStatusEffects(activeConditionMap);

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

            const defaultCondition = activeConditionMap.find(c => c.id === CONFIG.specialStatusEffects[key]);
            if (defaultCondition) {
                //The name of this effect matches one of our effect. Check its options
                if (hasProperty(defaultCondition.options, optionName)) {
                    if (getProperty(defaultCondition.options, optionName)) {
                        //This effect has the option enabled, so just leave it as is
                        return;
                    }

                    //This effect does not have the option enabled, so disable it in the special effects
                    CONFIG.specialStatusEffects[key] = "";
                }
            }

            //Check our map to see if any of our conditions have this option enabled
            const configCondition = activeConditionMap.find(c => {
                if (hasProperty(c.options, optionName)) {
                    const optionValue = getProperty(c.options, optionName);
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
    static _prepareStatusEffects(conditionMap) {
        conditionMap = conditionMap instanceof Array ? conditionMap : [conditionMap];

        if (!conditionMap.length) return;

        const existingIds = conditionMap.filter(c => c.id).map(c => c.id);
        
        const statusEffects = [];
        
        for (const c of conditionMap) {
            const id = c.id ?? Sidekick.createId(existingIds);
            const effect = {
                id: id,
                flags: {
                    ...c.activeEffect?.flags,
                    core: {
                        statusId: id
                    },
                    [BUTLER.NAME]: {
                        [BUTLER.FLAGS.enhancedConditions.conditionId]: id,
                        [BUTLER.FLAGS.enhancedConditions.overlay]: c?.options?.overlay ?? false
                    }
                },
                label: c.name,
                icon: c.icon,
                changes: c.activeEffect?.changes || [],
                duration: c.duration || c.activeEffect?.duration || {},
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
            const overlay = getProperty(effect, `flags.${BUTLER.NAME}.${BUTLER.FLAGS.enhancedConditions.overlay}`);
            // If the parent Condition for the ActiveEffect defines it as an overlay, mark the ActiveEffect as an overlay
            if (overlay) {
                effect.flags.core.overlay = overlay;
            }
        }
        
        return effects;
    }

    /**
     * Returns just the icon side of the map
     */
    static getConditionIcons(conditionMap={}) {
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
            return conditionMap.map(mapEntry => mapEntry.icon);
        }

        return [];
    }

    /**
     * Retrieves a condition icon by its mapped name
     * @param {*} condition 
     */
    static getIconsByCondition(condition, {firstOnly=false}={}) {
        const conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (!conditionMap || !condition) {
            return;
        }

        if (conditionMap instanceof Array) {
            const filteredConditions = conditionMap.filter(c => c.name === condition).map(c => c.icon);
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
    static getConditionsByIcon(icon, {firstOnly=false}={}) {
        const conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);

        if (!conditionMap || !icon) {
            return;
        }

        if (conditionMap instanceof Array && conditionMap.length) {
            const filteredIcons = conditionMap.filter(c => c.icon === icon).map(c => c.name);
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
     * Returns the default condition map for a given system
     */
    static getDefaultMap(defaultMap=null) {
        defaultMap = defaultMap ? defaultMap : Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMap);

        if (!defaultMap) {
            defaultMap = EnhancedConditions.buildDefaultMap();
        }

        return defaultMap;
    }

    /**
     * Builds a default map for a given system
     * @todo #281 update for active effects
     */
    static buildDefaultMap() {
        const coreEffectsSetting = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects) 
        const coreEffects = (coreEffectsSetting && coreEffectsSetting.length) ? coreEffectsSetting : CONFIG.statusEffects;
        const map = EnhancedConditions._prepareMap(coreEffects);

        return map;
    }
    
    /**
     * Checks the status effects from the system and compares it to our condition map to determine if there are any updates
     */
    static async checkForSystemUpdates() {
        const conditionMapFilePath = BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionMapFilePath;
        const conditionMapJson = await Sidekick.fetchJson(conditionMapFilePath);
        
        if (!isNewerVersion(game.system.version,  conditionMapJson.swadeVersion)) {
            //Our condition map is up to date with the latest version of SWADE. Nothing to do
            return;
        }
        
        const ignoredVersion = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.systemVersionIgnore);
        if (!isNewerVersion(game.system.version,  ignoredVersion)) {
            //The user has already ignored updates for this version, so no need to ask again
            return;
        }

        const oldMapJson = duplicate(conditionMapJson);
        const newMapJson = EnhancedConditions.getSystemUpdateMapJson(conditionMapJson);
        if (JSON.stringify(oldMapJson) != JSON.stringify(newMapJson)) {
            //There were no changes between versions so there's no need to build a new config file
            //Mark this version as ignored so we won't process this again
            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.systemVersionIgnore, game.system.version);
            return;
        }

        const content = await renderTemplate(BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.systemUpdateDialog);

        await Dialog.wait({
            title: game.i18n.localize("ENHANCED_CONDITIONS.Dialog.ApplySystemUpdate.Title"),
            content,
            buttons: {
                yes: {
                    icon: `<i class="fas fa-check"></i>`,
                    label: game.i18n.localize("WORDS.Yes"),
                    callback: ($html) => {
                        EnhancedConditions.applySystemUpdate(oldMapJson, newMapJson);
                    }
                },
                no: {
                    icon: `<i class="fas fa-times"></i>`,
                    label: game.i18n.localize("WORDS.No"),
                    callback: ($html) => {
                        const checkbox = $html[0].querySelector("input[id='dont-ask']");
                        const dontAskAgain = checkbox?.checked;
                        if (dontAskAgain) {
                            //If the user doesn't want us to ask again, update the ignored system version
                            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.systemVersionIgnore, game.system.version);
                            return;
                        }
                    }
                }
            },
            default: "no",
            close: () => {}
        });
    }

    /**
     * Takes the current json map and updates it for the new version of SWADE
     * This does not make any modifications to the succ settings
     */
    static async getSystemUpdateMapJson(conditionMapJson) {      
        //Loop over our map and apply any changes from the SWADE system
        const newMapJson = duplicate(conditionMapJson);
        for (let condition of newMapJson.map) {
            if (condition.activeEffect) {
                Object.keys(condition.activeEffect).every(key => {
                    if (key == "flags") {
                        if (condition.activeEffect.flags.swade) {
                            let statusEffect = CONFIG.statusEffects.find(e => e.id === condition.id);
                            if (statusEffect?.flags?.swade) {
                                condition.activeEffect.flags.swade = statusEffect.flags.swade;
                            }
                        }
                    } else if (key != "icon" && key != "name") {
                        let statusEffect = CONFIG.statusEffects.find(e => e.id === condition.id);
                        if (statusEffect && statusEffect[key]) {
                            condition.activeEffect[key] = statusEffect[key];
                        }
                    }
                });
            }
        }
    }

    /**
     * Backs up and updates the condition map json file
     */
    static async applySystemUpdate(oldMapJson, newMapJson) {
        //Start by backing up the old condition map, just in case
        const conditionMapFilePath = BUTLER.DEFAULT_CONFIG.enhancedConditions.conditionMapFilePath;
        const conditionMapFileName = conditionMapFilePath.split('/').pop();
        const backupFilename = oldMapJson.swadeVersion + "-backup-" + conditionMapFileName;
        Sidekick.uploadConditionMapJson(backupFilename, JSON.stringify(oldMapJson));
        
        //Update the version in the JSON so that we know it's up to date
        newMapJson.swadeVersion = game.system.version;
        
        //Finally, overwrite our existing condition map with the updated values
        Sidekick.uploadConditionMapJson(conditionMapFileName, JSON.stringify(newMapJson));
    }
}