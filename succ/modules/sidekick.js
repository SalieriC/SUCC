import * as BUTLER from "./butler.js";
/**
 * Provides helper methods for use elsewhere in the module (and has your back in a melee)
 */
export class Sidekick {
    /**
     * Creates the SUCC div in the Sidebar
     * @param {*} html 
     */
    static createSUCCDiv(html) {
        if (!game.user.isGM) return;
        
        const succDiv = $(
            `<div id="succ">
                    <h4>SWADE Ultimate Condition Changer</h4>
                </div>`
        );

        const setupButton = html.find("div#settings-game");
        setupButton.append(succDiv);
    }

    /**
     * Get a single setting using the provided key
     * @param {*} key 
     * @returns {Object} setting
     */
    static getSetting(key) {
        return game.settings.get(BUTLER.NAME, key);
    }

    /**
     * Get all SUCC settings
     * @returns {Array} settings
     */
    static getAllSettings() {
        const settings = [...game.settings.settings].filter((k,v) => String(k).startsWith(BUTLER.NAME));
        return settings;
    }

    /**
     * Sets a single game setting
     * @param {*} key 
     * @param {*} value 
     * @param {*} awaitResult 
     * @returns {Promise | ClientSetting}
     */
    static async setSetting(key, value) {
        await game.settings.set(BUTLER.NAME, key, value).then(result => {
            return result;
        }).catch(rejected => {
            throw rejected;
        });
    }

    /**
     * Register a single setting using the provided key and setting data
     * @param {*} key 
     * @param {*} metadata 
     * @returns {ClientSettings.register}
     */
    static registerSetting(key, metadata) {
        game.settings.register(BUTLER.NAME, key, metadata);
    }

    /**
     * Register a menu setting using the provided key and setting data
     * @param {*} key 
     * @param {*} metadata 
     * @returns {ClientSettings.registerMenu}
     */
    static registerMenu(key, metadata) {
        game.settings.registerMenu(BUTLER.NAME, key, metadata);
    }

    /**
     * Register all provided setting data
     * @param {*} settingsData 
     * @returns {Array}
     */
    static registerAllSettings(settingsData) {
        return Object.keys(settingsData).forEach((key) => Sidekick.registerSetting(key, settingsData[key]));
    }

    /**
     * Use FilePicker to browse then Fetch one or more JSONs and return them
     * @param {*} source
     * @param {*} path 
     */
    static async fetchJsons(source, path) {
        const extensions = [".json"];
        const fp = await FilePicker.browse(source, path, {extensions});
        const fetchedJsons = fp?.files?.length ? await Promise.all(fp.files.map(f => Sidekick.fetchJson(f))) : [];
        const jsons = fetchedJsons.filter(j => !!j);
        
        return jsons;
    }

    /**
     * Fetch a JSON from a given file
     * @param {File} file 
     * @returns JSON | null
     */
    static async fetchJson(file) {
        try {
            const jsonFile = await fetch(file);
            const json = await jsonFile.json();
            if (!json instanceof Object) throw new Error("Not a valid JSON!");
            return json;
        } catch (e) {
            console.warn(e.message);
            return null;
        }
    }

    /**
     * Validate that an object is actually an object
     * @param {Object} object 
     * @returns {Boolean}
     */
    static validateObject(object) {
        return !!(object instanceof Object);
    }

    /**
     * Convert any ES6 Maps/Sets to objects for settings use
     * @param {Map} map 
     */
    static convertMapToArray(map) {
        return map instanceof Map ? Array.from(map.entries()) : null;
    }

    /**
     * Retrieves a key using the given value
     * @param {Object} object -- the object that contains the key/value
     * @param {*} value 
     */
    static getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }

    /**
     * Inverts the key and value in a map
     * @todo: rework
     */
    static getInverseMap(map) {
        let newMap = new Map();
        for (let [k, v] of map) {
            newMap.set(v, k);
        }
        return newMap;
    }

    /**
     * Adds additional handlebars helpers
     */
    static handlebarsHelpers() {
        Handlebars.registerHelper("succ-concat", () => {
            let result;

            for (let a in arguments) {
                result += (typeof arguments[a] === "string" ? arguments[a] : "");
            }
            return result;
        });
    }

    /**
     * Adds additional jquery helpers
     */
    static jQueryHelpers() {
        jQuery.expr[':'].icontains = function(a, i, m) {
            return jQuery(a).text().toUpperCase()
                .indexOf(m[3].toUpperCase()) >= 0;
        };
    }

    /**
     * Takes an array of terms (eg. name parts) and returns groups of neighbouring terms
     * @param {*} arr 
     */
    static getTerms(arr) {
        const terms = [];
        const rejectTerms = ["of", "its", "the", "a", "it's", "if", "in", "for", "on", "by", "and"];
        for ( let i of arr.keys() ) {
            let len = arr.length - i;
            for ( let p=0; p<=i; p++ ) {
                let part = arr.slice(p, p+len);
                if (part.length === 1 && rejectTerms.includes(part[0])) {
                    continue;
                } 
                terms.push(part.join(" "));
            }
        }
        return terms;
    }

    /**
     * Escapes regex special chars
     * @param {String} string 
     * @return {String} escapedString
     */
    static escapeRegExp(string) {
        return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Attempts to coerce a target value into the exemplar's type
     * @param {*} target 
     * @param {*} type
     * @returns {*} coercedValue 
     */
    static coerceType(value, type) {
        switch (type) {
            case "number":
                return value * 1;
                
            case "string":
                return value.toString();

            case "boolean":
                return value.toString().toLowerCase() === "true" ? true : value.toString().toLowerCase() === "false" ? false : value;

            default:
                return value;
        }
    }

    /**
     * Builds a FD returned from FormDataExtended into a formData array
     * Borrowed from foundry.js
     * @param {*} FD 
     */
    static buildFormData(FD) {
        const dtypes = FD._dtypes;

        // Construct update data object by casting form data
        let formData = Array.from(FD).reduce((obj, [k, v]) => {
        let dt = dtypes[k];
        if ( dt === "Number" ) obj[k] = v !== "" ? Number(v) : null;
        else if ( dt === "Boolean" ) obj[k] = v === "true";
        else if ( dt === "Radio" ) obj[k] = JSON.parse(v);
        else obj[k] = v;
        return obj;
        }, {});

        return formData;
    }

    /**
    * Get a random unique Id, checking an optional supplied array of ids for a match
    * @param {*} existingIds 
    */
    static createId(existingIds=[], {iterations=10000, length=16}={}) {
       
       let i = 0;
       while(i < iterations) {
           const id = foundry.utils.randomID(length);
           if (!existingIds.includes(id)) {
               return id;
           }
           i++;
           console.log(`SWADE Ultimate Condition Changer - Sidekick | Id ${id} already exists in the provided list of ids. ${i ? `This is attempt ${i} of ${iterations} `: ""}Trying again...`);
       }

       throw new Error(`SWADE Ultimate Condition Changer - Sidekick | Tried to create a unique id over ${iterations} iterations and failed.`)
    };

    /**
     * Sets a string to Title Case
     * @param {*} string 
     */
    static toTitleCase(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    /**
     * Parses HTML and replaces instances of a matched pattern
     * @param {*} pattern 
     * @param {*} string 
     * @param {*} param2 
     */
    static replaceOnDocument(pattern, string, {target = document.body} = {}) {
        // Handle `string` — see the last section
        [target,...target.querySelectorAll("*:not(script):not(noscript):not(style)")]
        .forEach(({childNodes: [...nodes]}) => nodes
        .filter(({nodeType}) => nodeType === document.TEXT_NODE)
        .forEach((textNode) => textNode.textContent = textNode.textContent.replace(pattern, string)));
    };

    /**
     * Get text nodes in a given element
     * @param {*} el 
     * @returns {jQuery}
     */
    static getTextNodesIn(el) {
        return $(el).find(":not(iframe)").addBack().contents().filter((i, e) => e.nodeType == 3 && /\S/.test(e.nodeValue));
    };

    /**
     * For a given string generate a slug, optionally checking a list of existing Ids for uniqueness
     * @param {*} string 
     * @param {*} idList 
     */
    static generateUniqueSlugId(string, idList=[]) {
        let slug = string.slugify();

        const existingIds = idList.filter(id => id === slug);

        if (!existingIds.length) return slug;

        const uniqueIndex = existingIds.length > 1 ? Math.max(...existingIds.map(id => id.match(/\d+/g)[0])) + 1 : 1;
        slug = slug.replace(/\d+$/g, uniqueIndex);
        
        return slug;
    }

    /**
     * For a given file path, find the filename and then apply title case
     * @param {String} path 
     * @returns {String}
     */
    static getNameFromFilePath(path) {
        if (!path) return null;

        const file = path.split("\\").pop().split("/").pop();

        if (!file) return null;

        const filename = file.replace(/\.[^/.]+$/, "");

        if (!filename) return null;

        const name = Sidekick.toTitleCase(filename);
        return name;
    }

    /**
     * Gets the first GM user
     * @returns {GM | null} a GM object or null if none found
     */
    static getFirstGM() {
        const gmUsers = game.users.filter(u => u.isGM && u.active).sort((a, b) => a.name.localeCompare(b.name));

        return gmUsers.length ? gmUsers[0] : null;
    }

    /**
     * Checks if the current user is the first active GM
     * @returns {Boolean}
     */
    static isFirstGM() {
        return game.user.id === this.getFirstGM()?.id;
    }

    /**
     * Gets an Actor from an Actor or Token UUID
     * @param {*} uuid 
     */
    static async getActorFromUuid(uuid) {
        const isActor = uuid.includes("Actor");
        const isToken = uuid.includes("Token");

        if (isActor) return await fromUuid(uuid);
        else if (isToken) {
            const tokenDocument = await fromUuid(uuid);
            return tokenDocument?.actor ?? undefined;
        }

        return;
    }

    /**
     * Filters an array down to just its duplicate elements based on the property specified
     * @param {*} arrayToCheck 
     * @param {*} filterProperty 
     * @returns {Array}
     */
    static findArrayDuplicates(arrayToCheck, filterProperty) {
        const lookup = arrayToCheck.reduce((a, e) => {
            a.set(e[filterProperty], (a.get(e[filterProperty]) ?? 0) + 1);
            return a;
        }, new Map());

        return arrayToCheck.filter(e => lookup.get(e[filterProperty] > 1));
    }

    /**
     * Returns true for each array element that is a duplicate based on the property specified
     * @param {*} arrayToCheck 
     * @param {*} filterProperty 
     * @returns {Boolean}
     */
    static identifyArrayDuplicatesByProperty(arrayToCheck, filterProperty) {
        const seen = new Set();
        return arrayToCheck.map(e => {
            if (seen.size === seen.add(e[filterProperty]).size) {
                return true;
            } else {
                return false;
            }
        });
    }

    /**
     * Loads templates for partials
     */
    static async loadTemplates() {
        const templates = [
            `${BUTLER.PATH}/templates/partials/chat-card-condition-list.hbs`,
            `${BUTLER.PATH}/templates/partials/condition-lab-row.hbs`
        ];
        await loadTemplates(templates)
    }

    /**
     * Shows notification messages with the SUCC format
     */
    static showNotification(type, message, options) {
        const msg = `${BUTLER.SHORT_TITLE} | ${message}`;
        return ui.notifications[type](msg, options);
    }

    /**
     * Retrieves all the owners of a given document
     * @param {*} document 
     * @returns {Array}
     */
    static getDocumentOwners(document) {
        const permissions = document.ownership ?? document.data?.ownership;
        if (!permissions) return null;
        const owners = [];
        for (const userId in permissions) {
            if (permissions[userId] === foundry.CONST.DOCUMENT_PERMISSION_LEVELS.OWNER) owners.push(userId);
        }
        return owners;
    }

    static consoleMessage(type, source, {objects=[], message="", subStr=[]}) {
        const msg = `${BUTLER.TITLE} | ${source} :: ${message}`;
        const params = [];
        if (objects && objects.length) params.push(objects);
        if (msg) params.push(msg);
        if (subStr && subStr.length) params.push(subStr);
        return console[type](...params);
    }

    /**
     * Converts the given string to camelCase using the provided delimiter to break up words
     * @param {String} string 
     * @param {String} delimiter 
     * @returns the converted string
     * @example Sidekick.toCamelCase("my-cool-string", "-") // returns "myCoolString"
     */
    static toCamelCase(string, delimiter) {
        const stringParts = string.split(delimiter);
        return stringParts instanceof Array ? stringParts.reduce((camelString, part, index) => {
            return camelString += index > 0 ? Sidekick.toTitleCase(part) : part;
        }, "") : stringParts;
    }

    /**
     * Compares all the keys within two objects
     * Returns true if the objects match
     * This function is not recursive so if either object contains objects, the check will return false even if the values match
     */
    static shallowCompare(obj1, obj2) {
        if (!obj1 && !obj2) {
            //If they're both undefined, they are equal
            return true;
        }
        
        if ((!obj1 && obj2) || (obj1 && !obj2)) {
            //If only one is undefined, they are not equal
            return false;
        }

        return Object.keys(obj1).length === Object.keys(obj2).length &&
        Object.keys(obj1).every(key => obj2.hasOwnProperty(key) && obj1[key] === obj2[key]);
    }

    static showCUBWarning() {
        if (game.modules.get("combat-utility-belt")?.active) {
            new Dialog({
                title: "Incompatibility Warning",
                content: `
                <p>Warning, SUCC is incompatible with Combat Utility Belt.</p>
                <p>Disable Combat Utility Belt in the module settings to avoid bad things from happening.</p>
                <p>You'll see this message on each login so make sure you obey my command or disable SUCC and leave an angry issue on the gitHub. :D</p>
                `,
                buttons: {
                    done: {
                        label: "Got it!",
                    }
                }
            }).render(true)
        }
    }
    
    /**
     * Creates an array with the full list of traits for a given actor
     * @param {Actor} actor 
     */
    static getTraitOptions(actor) {
        // Start with attributes
        let traitOptions = `
            <option value="agility">${game.i18n.localize("ENHANCED_CONDITIONS.Dialog.Attribute")} ${Sidekick.getLocalizedAttributeName("agility")}</option>
            <option value="smarts">${game.i18n.localize("ENHANCED_CONDITIONS.Dialog.Attribute")} ${Sidekick.getLocalizedAttributeName("smarts")}</option>
            <option value="spirit">${game.i18n.localize("ENHANCED_CONDITIONS.Dialog.Attribute")} ${Sidekick.getLocalizedAttributeName("spirit")}</option>
            <option value="strength">${game.i18n.localize("ENHANCED_CONDITIONS.Dialog.Attribute")} ${Sidekick.getLocalizedAttributeName("strength")}</option>
            <option value="vigor">${game.i18n.localize("ENHANCED_CONDITIONS.Dialog.Attribute")} ${Sidekick.getLocalizedAttributeName("vigor")}</option>
        `
        // Adding Skills
        let allSkills = actor.items.filter(i => i.type === "skill")
        if (allSkills.length >= 1) {
            allSkills = Sidekick.sortSkills(allSkills)
            for (let each of allSkills) {
                traitOptions = traitOptions + `<option value="${each.id}">${game.i18n.localize("ENHANCED_CONDITIONS.Dialog.Skill")} ${each.name}</option>`
            }
        }

        return traitOptions;
    }
    
    /**
     * Returns the localized string for a given attribute
     * @param {Actor} actor 
     */
    static getLocalizedAttributeName(attribute) {
        if (attribute === "agility") {
            return game.i18n.localize("SWADE.AttrAgi");
        } else if (attribute === "smarts") {
            return game.i18n.localize("SWADE.AttrSma");
        } else if (attribute === "spirit") {
            return game.i18n.localize("SWADE.AttrSpr");
        } else if (attribute === "strength") {
            return game.i18n.localize("SWADE.AttrStr");
        } else if (attribute === "vigor") {
            return game.i18n.localize("SWADE.AttrVig");
        }

        return "Invalid Attribute";
    }
    
    /**
     * Sorts a list of skills
     * @param {*} allSkills List of skills to be sorted
     */
    static sortSkills(allSkills) {
        allSkills.sort(function (a, b) {
            let textA = a.name.toUpperCase();
            let textB = b.name.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });
        return allSkills
    }

    /**
     * Get the enum for a special status effect in Foundry based on the option name
     * @param {*} option 
     * @returns {String} enum for the special status effect 
     */
    static getOptionBySpecialStatusEffect(specialEffect) {
        const specialStatusEffect = Object.values(BUTLER.DEFAULT_CONFIG.enhancedConditions.specialStatusEffects).find((sse) => sse.systemProperty == specialEffect);
        return specialStatusEffect?.optionProperty;
    }

    /**
     * Get the enum for a special status effect in Foundry based on the option name
     * @param {*} conditionMap 
     */
    static ensureStatusEffectOptionExclusivity(conditionMap) {
        for (let specialStatusEffect of Object.values(BUTLER.DEFAULT_CONFIG.enhancedConditions.specialStatusEffects)) {
            const existingConditions = conditionMap.filter(c => {
                const optionValue = foundry.utils.getProperty(c, `options.${specialStatusEffect.optionProperty}`);
                return optionValue == true;
            });

            if (existingConditions.length < 2) {
                continue;
            }

            let defaultConditionConfig = game.succ.conditionConfigMap.find(c => foundry.utils.getProperty(c, `options.${specialStatusEffect.optionProperty}`) == true);
            if (!defaultConditionConfig) {
                //This shouldn't be possible but we'll just disable everything so that we're in a safe state
                for (let condition of existingConditions) {
                    condition.options[specialStatusEffect.optionProperty] = false;
                }
                continue;
            }

            if (existingConditions.length == 2) {
                //If we're here, we're likely in an edge case where the user removed the original default condition and then set the option on a different condition
                //We need to figure out which is the default and disable that
                let defaultCondition = conditionMap.find(c => c.id === defaultConditionConfig.id);
                defaultCondition.options[specialStatusEffect.optionProperty] = false;
            } else {
                //Something got very borked. Fall back to the default
                for (let condition of existingConditions) {
                    condition.options[specialStatusEffect.optionProperty] = defaultConditionConfig.id == condition.id;
                }
            }
        }
        
        Sidekick.updateSpecialStatusEffectConfig(this.map);
    }

    /**
     * Updates CONFIG.specialStatusEffects to match the settings in our condition map
     * @param {*} conditionMap 
     */
    static async updateSpecialStatusEffectConfig(conditionMap) {
        for (let specialStatusEffect of Object.values(BUTLER.DEFAULT_CONFIG.enhancedConditions.specialStatusEffects)) {
            if (!specialStatusEffect.systemProperty) continue; //This status doesn't have a system property so nothing to do

            const existingCondition = conditionMap.find(c => foundry.utils.getProperty(c, `options.${specialStatusEffect.optionProperty}`));
            CONFIG.specialStatusEffects[specialStatusEffect.systemProperty] = existingCondition ? existingCondition.id : "";
        }
        
        await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.specialStatusEffectMapping, CONFIG.specialStatusEffects);
    }
}