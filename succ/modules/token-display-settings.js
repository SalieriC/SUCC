import * as BUTLER from "./butler.js";
import { Sidekick } from "./sidekick.js";

export class TokenDisplaySettings extends FormApplication {

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: BUTLER.DEFAULT_CONFIG.enhancedConditions.tokenDisplaySettingsMenu.id,
      title: BUTLER.DEFAULT_CONFIG.enhancedConditions.tokenDisplaySettingsMenu.title,
      template: BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.tokenDisplaySettingsMenu,
      classes: ["succ-token-display-settings"],
      minimizable: false,
      width: 500,
      height: 400,
      resizable: true
    });
  }

  getData() {
    let defaultEntry = { id: "default", label: "succ.ENHANCED_CONDITIONS.TokenDisplaySettingsMenu.WorldDefault" };
    let clientSizeChoices = foundry.utils.duplicate(BUTLER.DEFAULT_CONFIG.tokenUtility.effectSizeChoices);
    clientSizeChoices.unshift(defaultEntry);

    let clientShapeChoices = foundry.utils.duplicate(BUTLER.DEFAULT_CONFIG.tokenUtility.effectBGShapeChoices);
    clientShapeChoices.unshift(defaultEntry);

    let clientPositioningChoices = foundry.utils.duplicate(BUTLER.DEFAULT_CONFIG.tokenUtility.effectPositioningChoices);
    clientPositioningChoices.unshift(defaultEntry);

    const data = {
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
    return data;
  }

  async _updateObject(event, formData) {
    let clientTokenDisplaySettings = {
      effectSize: formData["effect-size"],
      bgShape: formData["bg-shape"],
      effectPositioning: formData["effect-positioning"]
    };
    await Sidekick.setSetting(BUTLER.SETTING_KEYS.tokenUtility.clientTokenDisplaySettings, clientTokenDisplaySettings);

    if (game.user.isGM) {
      let worldTokenDisplaySettings = {
        effectSize: formData["world-effect-size"],
        bgShape: formData["world-bg-shape"],
        effectPositioning: formData["world-effect-positioning"]
      };
      await Sidekick.setSetting(BUTLER.SETTING_KEYS.tokenUtility.worldTokenDisplaySettings, worldTokenDisplaySettings);
    }
  }
}
