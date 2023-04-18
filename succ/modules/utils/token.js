import { Sidekick } from "../sidekick.js";
import { SETTING_KEYS, DEFAULT_CONFIG } from "../butler.js";

export class TokenUtility {
    /**
     * Patch core methods
     */
    static patchCore() {
        Token.prototype._refreshEffects = TokenUtility._refreshEffectsOverride;
    }

    /**
   * Refresh the display of status effects, adjusting their position for the token width and height.
   * from foundry.js Token#_refreshEffects()
   */
  static _refreshEffectsOverride() {
    const effectSize = Sidekick.getSetting(SETTING_KEYS.tokenUtility.effectSize);

    // Use the default values if no setting found
    const multiplier = effectSize ? DEFAULT_CONFIG.tokenUtility.effectSize[effectSize].multiplier : 2;
    const divisor = effectSize ? DEFAULT_CONFIG.tokenUtility.effectSize[effectSize].divisor : 5;

    let i = 0;
    // OVERRIDE
    //const w = Math.round(canvas.dimensions.size / 2 / 5) * 2;
    const w = Math.round(canvas.dimensions.size / 2 / 5) * multiplier;

    // OVERRIDE
    //const rows = Math.floor(this.document.height * 5);
    const rows = Math.floor(this.document.height * divisor);
    const bg = this.effects.bg.clear().beginFill(0x000000, 0.40).lineStyle(1.0, 0x000000);
    for ( const effect of this.effects.children ) {
      if ( effect === bg ) continue;

      // Overlay effect
      if ( effect === this.effects.overlay ) {
        const size = Math.min(this.w * 0.6, this.h * 0.6);
        effect.width = effect.height = size;
        effect.position.set((this.w - size) / 2, (this.h - size) / 2);
      }

      // Status effect
      else {
        effect.width = effect.height = w;
        effect.x = Math.floor(i / rows) * w;
        effect.y = (i % rows) * w;
        bg.drawRoundedRect(effect.x + 1, effect.y + 1, w - 2, w - 2, 2);
        i++;
      }
    }
  }
}