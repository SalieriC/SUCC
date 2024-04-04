import * as BUTLER from "./butler.js";
import { Sidekick } from "./sidekick.js";

export class TokenDisplaySettings extends FormApplication {
  
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
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
    const data = {
      sizeChoices: BUTLER.DEFAULT_CONFIG.tokenUtility.effectSizeChoices,
      shapeChoices: BUTLER.DEFAULT_CONFIG.tokenUtility.effectBGShapeChoices,
      positioningChoices: BUTLER.DEFAULT_CONFIG.tokenUtility.effectPositioningChoices,
      tokenDisplaySettings: Sidekick.getSetting(BUTLER.SETTING_KEYS.tokenUtility.tokenDisplaySettings)
    };
    return data;
  }

  async _updateObject(event, formData) {
    let tokenDisplaySettings = {
      effectSize: formData["effect-size"],
      bgShape: formData["bg-shape"],
      effectPositioning: formData["effect-positioning"]
    };
    await Sidekick.setSetting(BUTLER.SETTING_KEYS.tokenUtility.tokenDisplaySettings, tokenDisplaySettings);
  }
}
