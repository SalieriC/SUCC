import * as BUTLER from "./butler.js";
import { DefaultConditionsMenu } from "./enhanced-conditions/default-conditions-menu.js";
import { EnhancedConditions } from "./enhanced-conditions/enhanced-conditions.js";
import { Sidekick } from "./sidekick.js";
import { TokenDisplaySettings } from "./token-display-settings.js";
import { TokenUtility } from "./utils/token.js";

export function registerSettings() {

    /* -------------------------------------------- */
    /*              EnhancedConditions              */
    /* -------------------------------------------- */

    // Storage for the backup of the core effects map
    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.coreEffects, {
        name: "SETTINGS.EnhancedConditions.CoreEffectsN",
        hint: "SETTINGS.EnhancedConditions.CoreEffectsH",
        scope: "world",
        type: Object,
        default: [],
        config: false,
        onChange: s => { }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.mapType, {
        name: "SETTINGS.EnhancedConditions.MapTypeN",
        hint: "SETTINGS.EnhancedConditions.MapTypeH",
        scope: "world",
        type: String,
        default: "",
        choices: BUTLER.DEFAULT_CONFIG.enhancedConditions.mapTypes,
        config: false,
        apiOnly: true,
        onChange: s => { }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions, {
        name: "SETTINGS.EnhancedConditions.DefaultMapN",
        hint: "SETTINGS.EnhancedConditions.DefaultMapH",
        scope: "world",
        type: Array,
        default: []
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.deletedConditionsMap, {
        scope: "world",
        type: Object,
        default: []
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, {
        name: "SETTINGS.EnhancedConditions.ActiveConditionMapN",
        hint: "SETTINGS.EnhancedConditions.ActiveConditionMapH",
        scope: "world",
        type: Object,
        default: [],
        onChange: async conditionMap => {
            await EnhancedConditions._updateStatusEffects(conditionMap);

            // Save the active condition map to a convenience property
            if (game.succ) {
                game.succ.conditions = conditionMap;
            }
        }
    });

    Sidekick.registerMenu(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditionsMenu, {
        name: "SETTINGS.EnhancedConditions.DefaultConditionsMenuN",
        hint: "SETTINGS.EnhancedConditions.DefaultConditionsMenuH",
        label: "SETTINGS.EnhancedConditions.DefaultConditionsMenuN",
        scope: "world",
        restricted: true,
        type: DefaultConditionsMenu
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.outputChat, {
        name: "SETTINGS.EnhancedConditions.OutputChatN",
        hint: "SETTINGS.EnhancedConditions.OutputChatH",
        scope: "world",
        type: Boolean,
        config: true,
        default: BUTLER.DEFAULT_CONFIG.enhancedConditions.outputChat,
        onChange: s => {
            if (s === true) {
                foundry.applications.api.DialogV2.confirm({
                    window: { title: `${BUTLER.NAME}.ENHANCED_CONDITIONS.OutputChatConfirm.Title` },
                    content: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.OutputChatConfirm.Content`),
                    yes: {
                        callback: () => {
                            const newMap = foundry.utils.deepClone(game.succ.conditions);
                            if (!newMap.length) return;
                            newMap.forEach(c => c.options.outputChat = true);
                            Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, newMap);
                        }
                    }
                });
            }
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.removeDefaultEffects, {
        name: "SETTINGS.EnhancedConditions.RemoveDefaultEffectsN",
        hint: "SETTINGS.EnhancedConditions.RemoveDefaultEffectsH",
        scope: "world",
        type: Boolean,
        config: true,
        default: BUTLER.DEFAULT_CONFIG.enhancedConditions.removeDefaultEffects,
        onChange: s => {
            EnhancedConditions._updateStatusEffects();
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.showSortDirectionDialog, {
        name: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.ShowSortDirectionDialogN`,
        hint: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.ShowSortDirectionDialogH`,
        scope: "world",
        type: Boolean,
        config: false,
        default: true,
        onChange: s => { }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultSpecialStatusEffects, {
        name: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.DefaultSpecialStatusEffectsN`,
        hint: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.DefaultSpecialStatusEffectsH`,
        scope: "world",
        type: Object,
        default: {},
        config: false,
        onChange: () => { }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.specialStatusEffectMapping, {
        name: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.SpecialStatusEffectMappingN`,
        hint: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.SpecialStatusEffectMappingH`,
        scope: "world",
        type: Object,
        default: {},
        config: false,
        onChange: () => { }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.enhancedConditions.useSystemIcons, {
        name: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.UseSystemIconsN`,
        hint: `${BUTLER.NAME}.SETTINGS.ENHANCED_CONDITIONS.UseSystemIconsH`,
        scope: "world",
        type: Boolean,
        default: false,
        config: true,
        onChange: async () => {
            await EnhancedConditions.loadConditionConfigMap();
            foundry.applications.api.DialogV2.confirm({
                window: { title: `${BUTLER.NAME}.ENHANCED_CONDITIONS.SystemIconRefresh.Title` },
                content: game.i18n.localize(`${BUTLER.NAME}.ENHANCED_CONDITIONS.SystemIconRefresh.Content`),
                yes: {
                    callback: () => {
                        for (const condition of game.succ.conditions) {
                            const conditionConfig = game.succ.conditionConfigMap.find(c => c.id === condition.id);
                            if (conditionConfig) {
                                condition.img = conditionConfig.img;
                            }
                        }
                        Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.map, game.succ.conditions);
                    }
                }
            });
        }
    });

    /* -------------------------------------------- */
    /*                 TokenUtility                 */
    /* -------------------------------------------- */

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.tokenUtility.clientTokenDisplaySettings, {
        name: "clientTokenDisplaySettings",
        scope: "client",
        type: Object,
        default: BUTLER.DEFAULT_CONFIG.enhancedConditions.clientTokenDisplayDefaultSettings,
        config: false,
        onChange: s => {
            TokenUtility.patchCore();
            canvas.draw();
        }
    });

    Sidekick.registerSetting(BUTLER.SETTING_KEYS.tokenUtility.worldTokenDisplaySettings, {
        name: "worldTokenDisplaySettings",
        scope: "world",
        type: Object,
        default: BUTLER.DEFAULT_CONFIG.enhancedConditions.worldTokenDisplayDefaultSettings,
        config: false,
        onChange: s => {
            TokenUtility.patchCore();
            canvas.draw();
        }
    });

    Sidekick.registerMenu(BUTLER.SETTING_KEYS.tokenUtility.tokenDisplaySettingsMenu, {
        name: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.Title",
        hint: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.Hint",
        label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.Title",
        scope: "client",
        type: TokenDisplaySettings
    });
}