export const NAME = "succ";

export const TITLE = "SWADE Ultimate Condition Changer";
export const SHORT_TITLE = "SUCC";

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
        tokenDisplaySettingsMenu: {
            id: "succ-token-display-settings-menu",
            title: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.Title",
        },
        tokenDisplayDefaultSettings: {
            effectSize: "small",
            bgShape: "circle",
            effectPositioning: "columns"
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
            tokenDisplaySettingsMenu: `${PATH}/templates/token-display-settings.hbs`,
            chatOutput: `${PATH}/templates/chat-conditions.hbs`,
            chatConditionsPartial: `${PATH}/templates/partials/chat-card-condition-list.hbs`,
            importDialog: `${PATH}/templates/import-conditions.html`,
            macroConfig: `${PATH}/templates/enhanced-condition-macro-config.hbs`,
            optionConfig: `${PATH}/templates/enhanced-condition-option-config.hbs`,
            boostLowerDialog: `${PATH}/templates/boost-lower-dialog.hbs`,
            smiteDialog: `${PATH}/templates/smite-dialog.hbs`,
            protectionDialog: `${PATH}/templates/protection-dialog.hbs`,
            deflectionDialog: `${PATH}/templates/deflection-dialog.hbs`,
            numbDialog: `${PATH}/templates/numb-dialog.hbs`
        },
        specialStatusEffects: {
            defeated: { //Cannot be changed by users
                optionProperty: "markDefeated",
                systemProperty: "DEFEATED"
            },
            incapacitated: { //Cannot be changed by users
                optionProperty: "markIncapacitated",
                systemProperty: "INCAPACITATED"
            },
            blinded: {
                optionProperty: "blindToken",
                systemProperty: "BLIND",
                optionLabel: "succ.ENHANCED_CONDITIONS.OptionConfig.BlindToken.Label",
                optionNotes: "succ.ENHANCED_CONDITIONS.OptionConfig.BlindToken.Notes"
            },
            invisible: {
                optionProperty: "markInvisible",
                systemProperty: "INVISIBLE",
                optionLabel: "succ.ENHANCED_CONDITIONS.OptionConfig.MarkInvisible.Label",
                optionNotes: "succ.ENHANCED_CONDITIONS.OptionConfig.MarkInvisible.Notes"
            },
            coldBodied: {
                optionProperty: "coldBodied",
                systemProperty: "COLDBODIED",
                optionLabel: "succ.ENHANCED_CONDITIONS.OptionConfig.ColdBodied.Label",
                optionNotes: "succ.ENHANCED_CONDITIONS.OptionConfig.ColdBodied.Notes"
            },
            fly: {
                optionProperty: "fly",
                systemProperty: "FLY",
                optionLabel: "succ.ENHANCED_CONDITIONS.OptionConfig.Fly.Label",
                optionNotes: "succ.ENHANCED_CONDITIONS.OptionConfig.Fly.Notes"
            },
            burrow: {
                optionProperty: "burrow",
                systemProperty: "BURROW",
                optionLabel: "succ.ENHANCED_CONDITIONS.OptionConfig.Burrow.Label",
                optionNotes: "succ.ENHANCED_CONDITIONS.OptionConfig.Burrow.Notes"
            },
            boostTrait: {
                optionProperty: "boostTrait",
                optionLabel: "succ.ENHANCED_CONDITIONS.OptionConfig.BoostTrait.Label",
                optionNotes: "succ.ENHANCED_CONDITIONS.OptionConfig.BoostTrait.Notes"
            },
            lowerTrait: {
                optionProperty: "lowerTrait",
                optionLabel: "succ.ENHANCED_CONDITIONS.OptionConfig.LowerTrait.Label",
                optionNotes: "succ.ENHANCED_CONDITIONS.OptionConfig.LowerTrait.Notes"
            },
            smite: {
                optionProperty: "smite",
                optionLabel: "succ.ENHANCED_CONDITIONS.OptionConfig.Smite.Label",
                optionNotes: "succ.ENHANCED_CONDITIONS.OptionConfig.Smite.Notes"
            },
            protection: {
                optionProperty: "protection",
                optionLabel: "succ.ENHANCED_CONDITIONS.OptionConfig.Protection.Label",
                optionNotes: "succ.ENHANCED_CONDITIONS.OptionConfig.Protection.Notes"
            },
            deflection: {
                optionProperty: "deflection",
                optionLabel: "succ.ENHANCED_CONDITIONS.OptionConfig.Deflection.Label",
                optionNotes: "succ.ENHANCED_CONDITIONS.OptionConfig.Deflection.Notes"
            },
            numb: {
                optionProperty: "numb",
                optionLabel: "succ.ENHANCED_CONDITIONS.OptionConfig.Numb.Label",
                optionNotes: "succ.ENHANCED_CONDITIONS.OptionConfig.Numb.Notes"
            },
            conviction: {
                optionProperty: "conviction",
                optionLabel: "succ.ENHANCED_CONDITIONS.OptionConfig.Conviction.Label",
                optionNotes: "succ.ENHANCED_CONDITIONS.OptionConfig.Conviction.Notes"
            }
        }
    },
    tokenUtility: {
        effectSize: {
            xLarge: 5,
            large: 3.3,
            medium: 2.5,
            small: 2
        },
        effectSizeChoices: {
            "small": "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.SizeChoices.Small",
            "medium": "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.SizeChoices.Medium",
            "large": "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.SizeChoices.Large",
            "xLarge": "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.SizeChoices.XtraLarge"
        },
        effectBGShapeChoices: {
            "circle": "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.ShapeChoices.Circle",
            "roundedRect": "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.ShapeChoices.RoundedRect",
            "rect": "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.ShapeChoices.Rect",
            "none": "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.ShapeChoices.None"
        },
        effectPositioningChoices: {
            "columns": "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.PositioningChoices.Columns",
            "rows": "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.PositioningChoices.Rows",
            "counterclockwise": "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.PositioningChoices.Counterclockwise",
            "clockwise": "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.PositioningChoices.Clockwise"
        }
    }
}

export const FLAGS = {
    enhancedConditions: {
        conditionId: "conditionId",
        overlay: "overlay",
        effectOptions: "effectOptions",
        createProcessed: "createProcessed"
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
        defaultConditionsMenu: "defaultConditionsMenu",
        useSystemIcons: "useSystemIcons",
        skipIconMigration: "skipIconMigration"
    },
    tokenUtility: {
        tokenDisplaySettings: "tokenDisplaySettings",
        tokenDisplaySettingsMenu: "tokenDisplaySettingsMenu"
    }
}

