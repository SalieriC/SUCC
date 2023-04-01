export const NAME = "succ";

export const TITLE = "SWADE Ultimate Condition Changer";

export const PATH = "modules/succ";

/**
 * Stores information about well known game systems. All other systems will resolve to "other"
 * Keys must match id
 */
export const KNOWN_GAME_SYSTEMS = {
    "swade": {
        id: "swade",
        name: "SWADE"
    },
    "swpf": {
        id: "swpf",
        name: "Pathfinder for Savage Worlds"
    },
    other: {
        id: "other",
        name: "Custom/Other",
        concentrationAttribute: "--Unknown--",
        healthAttribute: "--Unknown--",
        initiative: "--Unknown--"
    }
} 

export const DEFAULT_CONFIG = {
    enhancedConditions: {
        iconPath: `${PATH}/icons/`,
        conditionMapFile: `${PATH}/config/condition-map.json`,
        conditionModuleOverridesPath: `${PATH}/config/condition-map-module-overrides`,
        enable: true,
        outputChat: true,
        removeDefaultEffects: true,
        conditionLab: {
            id: "succ-condition-lab",
            title: "Condition Lab",
        },
        macroConfig: {
            id: "succ-enhanced-condition-macro-config",
            title: "SUCC Enhanced Condition - Macro Config"
        },
        optionConfig: {
            id: "succ-enhanced-condition-option-config",
            title: "SUCC Enhanced Condition - Option Config"
        },
        title: "Enhanced Conditions",
        mapTypes: {
            default: "System - Default",
            custom: "System - Custom",
            other: "Other/Imported"
        },
        templates: {
            conditionLab: `${PATH}/templates/condition-lab.hbs`,
            chatOutput: `${PATH}/templates/chat-conditions.hbs`,
            chatConditionsPartial: `${PATH}/templates/partials/chat-card-condition-list.hbs`,
            importDialog: `${PATH}/templates/import-conditions.html`,
            macroConfig: `${PATH}/templates/enhanced-condition-macro-config.hbs`,
            optionConfig: `${PATH}/templates/enhanced-condition-option-config.hbs`,
            boostLowerDialog: `${PATH}/templates/boost-lower-dialog.hbs`,
            smiteDialog: `${PATH}/templates/smite-dialog.hbs`,
            protectionDialog: `${PATH}/templates/protection-dialog.hbs`
        },
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
            },
            conviction: {
                optionProperty: "conviction"
            }
        },
        proneId : "prone"
    },
    tokenUtility: {
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
        coreEffects: "coreStatusEffects",
        system: "activeSystem",
        map: "activeConditionMap",
        defaultMaps: "defaultConditionMaps",
        mapType: "conditionMapType",
        removeDefaultEffects: "removeDefaultEffects",
        outputChat: "conditionsOutputToChat",
        showSortDirectionDialog: "showSortDirectionDialog",
        defaultSpecialStatusEffects: "defaultSpecialStatusEffects",
        specialStatusEffectMapping: "specialStatusEffectMapping"
    },
    tokenUtility: {
        effectSize: "effectSize"
    }
}

