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
        clientTokenDisplayDefaultSettings: {
            effectSize: "default",
            bgShape: "default",
            effectPositioning: "default"
        },
        worldTokenDisplayDefaultSettings: {
            effectSize: "small",
            bgShape: "circle",
            effectPositioning: "columns"
        },
        macroConfig: {
            id: "succ-enhanced-condition-macro-config",
            title: "SUCC Enhanced Condition - Macro Config"
        },
        optionConfig: {
            id: "succ-enhanced-condition-options-config",
            title: "SUCC Enhanced Condition - Option Config"
        },
        title: "Enhanced Conditions",
        mapTypes: {
            default: "System - Default",
            custom: "System - Custom",
            other: "Other/Imported"
        },
        templates: {
            conditionLab: {
                form: `${PATH}/templates/condition-lab/form.hbs`,
                header: `${PATH}/templates/condition-lab/header.hbs`,
                footer: `${PATH}/templates/condition-lab/footer.hbs`,
            },
            optionsConfig: {
                generalTab: `${PATH}/templates/options-config/general-options-tab.hbs`,
                specialTab: `${PATH}/templates/options-config/special-effects-tab.hbs`,
                footer: `${PATH}/templates/options-config/footer.hbs`,
            },
            conditionLabRestoreDefaultsDialog: `${PATH}/templates/condition-lab-restore-defaults-dialog.hbs`,
            defaultConditionsMenu: `${PATH}/templates/default-conditions-menu.hbs`,
            tokenDisplaySettingsMenu: `${PATH}/templates/token-display-settings.hbs`,
            chatOutput: `${PATH}/templates/chat-conditions.hbs`,
            chatConditionsPartial: `${PATH}/templates/partials/chat-card-condition-list.hbs`,
            sortDirectionSaveDialog: `${PATH}/templates/sort-direction-save-dialog.hbs`,
            importDialog: `${PATH}/templates/import-conditions.html`,
            macroConfig: `${PATH}/templates/enhanced-condition-macro-config.hbs`,
            boostLowerDialog: `${PATH}/templates/boost-lower-dialog.hbs`,
            smiteDialog: `${PATH}/templates/smite-dialog.hbs`,
            protectionDialog: `${PATH}/templates/protection-dialog.hbs`,
            deflectionDialog: `${PATH}/templates/deflection-dialog.hbs`,
            numbDialog: `${PATH}/templates/numb-dialog.hbs`,
            flyingDialog: `${PATH}/templates/flying-dialog.hbs`
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
        effectSizeChoices: [
            { id: "small", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.SizeChoices.Small" },
            { id: "medium", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.SizeChoices.Medium" },
            { id: "large", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.SizeChoices.Large" },
            { id: "xLarge", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.SizeChoices.XtraLarge" },
        ],
        effectBGShapeChoices: [
            { id: "circle", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.ShapeChoices.Circle" },
            { id: "roundedRect", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.ShapeChoices.RoundedRect" },
            { id: "rect", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.ShapeChoices.Rect" },
            { id: "none", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.ShapeChoices.None" },
        ],
        effectPositioningChoices: [
            { id: "columns", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.PositioningChoices.Columns" },
            { id: "rows", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.PositioningChoices.Rows" },
            { id: "counterclockwise", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.PositioningChoices.Counterclockwise" },
            { id: "clockwise", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.PositioningChoices.Clockwise" },
        ],
    }
}

export const FLAGS = {
    enhancedConditions: {
        conditionId: "conditionId",
        overlay: "overlay",
        effectOptions: "effectOptions",
        createProcessed: "createProcessed",
        addedSkillUuid: "addedSkillUuid",
        activeEffectCustomized: "activeEffectCustomized"
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
        clientTokenDisplaySettings: "clientTokenDisplaySettings",
        worldTokenDisplaySettings: "worldTokenDisplaySettings",
        tokenDisplaySettingsMenu: "tokenDisplaySettingsMenu"
    }
}

