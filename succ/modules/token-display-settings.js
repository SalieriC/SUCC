import * as BUTLER from "./butler.js";
import { Sidekick } from "./sidekick.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
export class TokenDisplaySettings extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: BUTLER.DEFAULT_CONFIG.enhancedConditions.tokenDisplaySettingsMenu.id,
        tag: "form",
        form: {
            handler: TokenDisplaySettings.formHandler,
            submitOnChange: false,
            closeOnSubmit: true
        },
        classes: ["succ-token-display-settings", "standard-form", "succ-form"],
        window: {
            title: BUTLER.DEFAULT_CONFIG.enhancedConditions.tokenDisplaySettingsMenu.title,
            minimizable: false,
            resizable: true,
        },
        position: { width: 500, height: 360 },
    };

    static PARTS = {
        form: { template: BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.tokenDisplaySettingsMenu.form },
        footer: { template: BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.tokenDisplaySettingsMenu.footer },
    };

    async _prepareContext(options) {
        let defaultEntry = { id: "default", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.WorldDefault" };
        let clientSizeChoices = foundry.utils.duplicate(BUTLER.DEFAULT_CONFIG.tokenUtility.effectSizeChoices);
        clientSizeChoices.unshift(defaultEntry);

        let clientShapeChoices = foundry.utils.duplicate(BUTLER.DEFAULT_CONFIG.tokenUtility.effectBGShapeChoices);
        clientShapeChoices.unshift(defaultEntry);

        let clientPositioningChoices = foundry.utils.duplicate(BUTLER.DEFAULT_CONFIG.tokenUtility.effectPositioningChoices);
        clientPositioningChoices.unshift(defaultEntry);

        return {
            isGM: game.user.isGM,
            sizeChoices: BUTLER.DEFAULT_CONFIG.tokenUtility.effectSizeChoices,
            shapeChoices: BUTLER.DEFAULT_CONFIG.tokenUtility.effectBGShapeChoices,
            positioningChoices: BUTLER.DEFAULT_CONFIG.tokenUtility.effectPositioningChoices,
            clientSizeChoices: clientSizeChoices,
            clientShapeChoices: clientShapeChoices,
            clientPositioningChoices: clientPositioningChoices,
            clientTokenDisplaySettings: Sidekick.getSetting(BUTLER.SETTING_KEYS.tokenUtility.clientTokenDisplaySettings),
            worldTokenDisplaySettings: Sidekick.getSetting(BUTLER.SETTING_KEYS.tokenUtility.worldTokenDisplaySettings),
        };
    }

    static async formHandler(event, form, formData) {
        let clientTokenDisplaySettings = {
            effectSize: formData.object["effect-size"],
            bgShape: formData.object["bg-shape"],
            effectPositioning: formData.object["effect-positioning"]
        };
        await Sidekick.setSetting(BUTLER.SETTING_KEYS.tokenUtility.clientTokenDisplaySettings, clientTokenDisplaySettings);

        if (game.user.isGM) {
            let worldTokenDisplaySettings = {
                effectSize: formData.object["world-effect-size"],
                bgShape: formData.object["world-bg-shape"],
                effectPositioning: formData.object["world-effect-positioning"]
            };
            await Sidekick.setSetting(BUTLER.SETTING_KEYS.tokenUtility.worldTokenDisplaySettings, worldTokenDisplaySettings);
        }
    }
}
