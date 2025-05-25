import { Sidekick } from "../sidekick.js";
import { SETTING_KEYS, DEFAULT_CONFIG } from "../butler.js";

export class TokenUtility {
  /**
   * Patch core methods
   */
  static patchCore() {
    foundry.canvas.placeables.Token.prototype._refreshEffects = TokenUtility._refreshEffectsOverride;
  }

  /**
 * Refresh the display of status effects, adjusting their position for the token width and height.
 * from foundry.js Token#_refreshEffects()
 */
  static _refreshEffectsOverride() {
    const clientTokenDisplaySettings = Sidekick.getSetting(SETTING_KEYS.tokenUtility.clientTokenDisplaySettings);
    let tokenDisplaySettings = Sidekick.getSetting(SETTING_KEYS.tokenUtility.worldTokenDisplaySettings);
    for (let [key, value] of Object.entries(clientTokenDisplaySettings)) {
      if (value != "default") {
        tokenDisplaySettings[key] = value;
      }
    }

    const tokenHeight = this.document.height * canvas.dimensions.size;
    const tokenWidth = this.document.width * canvas.dimensions.size;

    const params = {
      token: this,
      tokenDisplaySettings: tokenDisplaySettings,
      iconWidth: Math.round(canvas.dimensions.size / 2 / 5) * DEFAULT_CONFIG.tokenUtility.effectSize[tokenDisplaySettings.effectSize],
      bg: this.effects.bg.clear().beginFill(0x000000, 0.40).lineStyle(1.0, 0x000000)
    }

    switch (tokenDisplaySettings.effectPositioning) {
      case "columns": {
        TokenUtility.drawColumns(params, tokenHeight);
      }
        break;

      case "rows": {
        TokenUtility.drawRows(params, tokenWidth);
      }
        break;

      case "counterclockwise":
      case "clockwise": {
        TokenUtility.drawCircular(params, tokenWidth);
      }
        break;
    }

    params.bg.endFill();
  }

  static drawColumns(params, tokenHeight) {
    const rows = Math.floor(tokenHeight / params.iconWidth);

    let iconCount = 0;
    for (const effect of params.token.effects.children) {
      if (effect === params.bg) continue;
      if (effect === params.token.effects.overlay) { TokenUtility.drawOverlay(params, effect); continue; }

      effect.width = effect.height = params.iconWidth;
      effect.x = Math.floor(iconCount / rows) * params.iconWidth;
      effect.y = (iconCount % rows) * params.iconWidth;
      TokenUtility.drawBackground(params, effect);
      ++iconCount;
    }
  }

  static drawRows(params, tokenWidth) {
    const columns = Math.floor(tokenWidth / params.iconWidth);

    let iconCount = 0;
    for (const effect of params.token.effects.children) {
      if (effect === params.bg) continue;
      if (effect === params.token.effects.overlay) { TokenUtility.drawOverlay(params, effect); continue; }

      effect.width = effect.height = params.iconWidth;
      effect.x = (iconCount % columns) * params.iconWidth;
      effect.y = Math.floor(iconCount / columns) * params.iconWidth;
      TokenUtility.drawBackground(params, effect);
      ++iconCount;
    }
  }

  static drawCircular(params, tokenWidth) {
    let iconCount = 0;
    let circleCount = 0;
    const tokenCenter = (tokenWidth / 2) - (params.iconWidth / 2);
    let circleValues = TokenUtility.calcCircleValues(params, tokenWidth, circleCount);
    for (const effect of params.token.effects.children) {
      if (effect === params.bg) continue;
      if (effect === params.token.effects.overlay) { TokenUtility.drawOverlay(params, effect); continue; }

      effect.width = effect.height = params.iconWidth;

      const angle = circleValues.startingAngle + (circleValues.angleIncrements * iconCount);
      effect.x = tokenCenter + circleValues.radius * Math.cos(angle);
      effect.y = tokenCenter + circleValues.radius * Math.sin(angle);

      TokenUtility.drawBackground(params, effect);
      ++iconCount;

      if (iconCount >= circleValues.numSlots) {
        iconCount = 0;
        ++circleCount;
        circleValues = TokenUtility.calcCircleValues(params, tokenWidth, circleCount);
      }
    }
  }

  static calcCircleValues(params, tokenWidth, circleCount) {
    const dir = params.tokenDisplaySettings.effectPositioning === "clockwise" ? 1 : -1;
    const radius = (tokenWidth / 2) + (params.iconWidth / 2) + (params.iconWidth * circleCount);
    const circum = 2 * Math.PI * radius;
    const numSlots = Math.floor(circum / params.iconWidth);
    const angleIncrements = ((Math.PI * 2) / numSlots) * dir;
    const startingAngle = (Math.PI * 1.5) + angleIncrements;

    return {
      radius: radius,
      numSlots: numSlots,
      angleIncrements: angleIncrements,
      startingAngle: startingAngle,
    };
  }

  static drawOverlay(params, effect) {
    const size = Math.min(params.token.w * 0.6, params.token.h * 0.6);
    effect.width = effect.height = size;
    effect.position.set((params.token.w - size) / 2, (params.token.h - size) / 2);
  }

  static drawBackground(params, effect) {
    switch (params.tokenDisplaySettings.bgShape) {
      case "circle": {
        const r = effect.width / 2;
        params.bg.drawCircle(effect.position.x + r, effect.position.y + r, r);
      }
        break;

      case "roundedRect": {
        params.bg.drawRoundedRect(effect.position.x, effect.position.y, effect.width, effect.width, 5);
      }
        break;

      case "rect": {
        params.bg.drawRect(effect.position.x, effect.position.y, effect.width, effect.width);
      }
        break;

      default:
        break;
    }
  }
}