export const NAME = "succ";

export const TITLE = "SWADE Ultimate Condition Changer";

export const PATH = "modules/succ";
export const CONFIG_PATH = PATH + "/config";


export const DEFAULT_CONFIG = {
    enhancedConditions: {
        iconPath: `${PATH}/icons/`,
        conditionConfigFilePath: `${CONFIG_PATH}/condition-config.json`,
        conditionModuleOverridesPath: `${CONFIG_PATH}/condition-config-module-overrides`,
        defaultConditionGroupsPath: `${CONFIG_PATH}/default-condition-groups`,
        outputChat: true,
        removeDefaultEffects: true,
        conditionLab: {
            id: "succ-condition-lab",
            title: "Condition Lab",
        },
        defaultConditionsMenu: {
            id: "succ-default-conditions-menu",
            title: "succ.ENHANCED_CONDITIONS.DefaultConditionsMenu.Title",
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
            conditionLabRestoreDefaultsDialog: `${PATH}/templates/condition-lab-restore-defaults-dialog.hbs`,
            defaultConditionsMenu: `${PATH}/templates/default-conditions-menu.hbs`,
            chatOutput: `${PATH}/templates/chat-conditions.hbs`,
            chatConditionsPartial: `${PATH}/templates/partials/chat-card-condition-list.hbs`,
            importDialog: `${PATH}/templates/import-conditions.html`,
            macroConfig: `${PATH}/templates/enhanced-condition-macro-config.hbs`,
            optionConfig: `${PATH}/templates/enhanced-condition-option-config.hbs`,
            boostLowerDialog: `${PATH}/templates/boost-lower-dialog.hbs`,
            smiteDialog: `${PATH}/templates/smite-dialog.hbs`,
            protectionDialog: `${PATH}/templates/protection-dialog.hbs`,
            deflectionDialog: `${PATH}/templates/deflection-dialog.hbs`
        },
        specialStatusEffects: {
            blinded: {
                optionProperty: "blindToken"
            },
            invisible: {
                optionProperty: "markInvisible"
            },
            coldBodied: {
                optionProperty: "coldBodied"
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
            deflection: {
                optionProperty: "deflection"
            },
            conviction: {
                optionProperty: "conviction"
            }
        }
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
        overlay: "overlay",
        effectOptions: "effectOptions"
    }
}

export const SETTING_KEYS = {
    enhancedConditions: {
        coreEffects: "coreStatusEffects",
        map: "activeConditionMap",
        defaultConditions: "defaultConditions",
        deletedConditionsMap: "deletedConditionsMap",
        mapType: "conditionMapType",
        removeDefaultEffects: "removeDefaultEffects",
        outputChat: "conditionsOutputToChat",
        showSortDirectionDialog: "showSortDirectionDialog",
        defaultSpecialStatusEffects: "defaultSpecialStatusEffects",
        specialStatusEffectMapping: "specialStatusEffectMapping",
        defaultConditionsMenu: "defaultConditionsMenu"
    },
    tokenUtility: {
        effectSize: "effectSize"
    }
}

