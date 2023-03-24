import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";

export const NAME = "succ";

export const TITLE = "Combat Utility Belt";

export const SHORTNAME = "cub";

export const PATH = "modules/succ";

export const WIKIPATH = "https://github.com/death-save/succ/wiki"

export const GADGETS = {
    enhancedConditions: {
        name: "Enhanced Conditions",
        info: "Provides the ability to map Conditions to Status Effect icons",
        wiki: `${WIKIPATH}/enhanced-conditions`
    },
    actorUtility: {
        name: "Misc Actor",
        info: "Miscellaneous Actor enhancements",
        wiki: `${WIKIPATH}/actor-misc`
    },
    tokenUtility: {
        name: "Misc Token",
        info: "Miscellaneous Token enhancements",
        wiki: null
    }
}
/**
 * Stores information about well known game systems. All other systems will resolve to "other"
 * Keys must match id
 */
export const KNOWN_GAME_SYSTEMS = {
    "swade": {
        id: "swade",
        name: "SWADE"
    },
    other: {
        id: "other",
        name: "Custom/Other",
        concentrationAttribute: "--Unknown--",
        healthAttribute: "--Unknown--",
        initiative: "--Unknown--"
    }
} 
     
export const HEALTH_STATES = {
    HEALTHY: "healthy",
    INJURED: "injured",
    DEAD: "dead",
    UNCONSCIOUS: "unconscious"
}

export const DEFAULT_CONFIG = {
    enhancedConditions: {
        iconPath: `${PATH}/icons/`,
        conditionMapsPath: `${PATH}/condition-maps`,
        outputChat: false,
        outputCombat: false,
        removeDefaultEffects: false,
        conditionLab: {
            id: "cub-condition-lab",
            title: "Condition Lab",
        },
        macroConfig: {
            id: "cub-enhanced-condition-macro-config",
            title: "CUB Enhanced Condition - Macro Config"
        },
        optionConfig: {
            id: "cub-enhanced-condition-option-config",
            title: "CUB Enhanced Condition - Option Config"
        },
        title: "Enhanced Conditions",
        mapTypes: {
            default: "System - Default",
            custom: "System - Custom",
            other: "Other/Imported"
        },
        referenceTypes: [
            {
                id: "journalEntry",
                name: "Journal",
                icon: `fas fa-book-open`
            },
            {
                id: "compendium.journalEntry",
                name: "Journal (C)",
                icon: `fas fa-atlas`
            },
            {
                id: "item",
                name: "Item",
                icon: `fas fa-suitcase`
            },
            {
                id: "compendium.item",
                name: "Item (C)",
                icon: `fas fa-suitcase`
            }
        ],
        templates: {
            conditionLab: `${PATH}/templates/condition-lab.hbs`,
            chatOutput: `${PATH}/templates/chat-conditions.hbs`,
            chatConditionsPartial: `${PATH}/templates/partials/chat-card-condition-list.hbs`,
            importDialog: `${PATH}/templates/import-conditions.html`,
            macroConfig: `${PATH}/templates/enhanced-condition-macro-config.hbs`,
            optionConfig: `${PATH}/templates/enhanced-condition-option-config.hbs`
        },
        migrationVersion: "",
        specialStatusEffects: {
            blinded: {
                optionProperty: "blindToken"
            },
            invisible: {
                optionProperty: "markInvisible"
            },
            boostTrait: {
                optionProperty: "boostTrait"
            },
            lowerTrait: {
                optionProperty: "lowerTrait"
            },
            smite: {
                optionProperty: "smite"
            },
            protection: {
                optionProperty: "protection"
            }
        }
    },
    actorUtility: {
        initiativeFromSheet: false
    },
    tokenUtility: {
        autoRollHP: false,
        hideAutoRoll: false,
        effectSize: {
            xLarge: {
                multiplier: 5,
                divisor: 2
            },
            large: {
                multiplier: 3.3,
                divisor: 3
            },
            medium: {
                multiplier: 2.5,
                divisor: 4
            },
            small: {
                multiplier: 2,
                divisor: 5
            }
        },
        effectSizeChoices: {
            "small": "Small (Default) - 5x5",
            "medium": "Medium - 4x4",
            "large": "Large - 3x3",
            "xLarge": "Extra Large - 2x2"
        }
    }
}

export const FLAGS = {
    enhancedConditions: {
        conditionId: "conditionId",
        overlay: "overlay"
    }
}

export const SETTING_KEYS = {
    enhancedConditions: {
        enable: "enableEnhancedConditions",
        coreIcons: "coreStatusIcons",
        coreEffects: "coreStatusEffects",
        system: "activeSystem",
        map: "activeConditionMap",
        defaultMaps: "defaultConditionMaps",
        mapType: "conditionMapType",
        removeDefaultEffects: "removeDefaultEffects",
        outputChat: "conditionsOutputToChat",
        outputCombat: "conditionsOutputDuringCombat",
        suppressPreventativeSaveReminder: "conditionsSuppressPreventativeSaveReminder",
        migrationVersion: "enhancedConditionsMigrationVersion",
        showSortDirectionDialog: "showSortDirectionDialog",
        defaultSpecialStatusEffects: "defaultSpecialStatusEffects",
        specialStatusEffectMapping: "specialStatusEffectMapping"
    },
    tokenUtility: {
        effectSize: "effectSize"
    }
}

