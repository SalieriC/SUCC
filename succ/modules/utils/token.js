import { Sidekick } from "../sidekick.js";
import { NAME, SETTING_KEYS, DEFAULT_CONFIG, FLAGS } from "../butler.js";

export class TokenUtility {
    /**
     * Patch core methods
     */
    static patchCore() {
        TokenUtility._wrapperGetStatusEffectChoices();
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

    /**
     * Draw a status effect icon
     * @return {Promise<void>}
     * @private
     */
    static async _drawEffect(src, i, bg, w, tint) {
        const effectSize = Sidekick.getSetting(SETTING_KEYS.tokenUtility.effectSize); 

        // Use the default values if no setting found
        const multiplier = effectSize ? DEFAULT_CONFIG.tokenUtility.effectSize[effectSize].multiplier : 2;
        const divisor = effectSize ? DEFAULT_CONFIG.tokenUtility.effectSize[effectSize].divisor : 5;

        // By default the width is multipled by 2, so divide by 2 first then use the new multiplier
        w = (w / 2) * multiplier;

        let tex = await loadTexture(src, {fallback: 'icons/svg/hazard.svg'});
        let icon = this.effects.addChild(new PIXI.Sprite(tex));
        icon.width = icon.height = w;
        //const nr = Math.floor(this.data.height * 5);
        const nr = Math.floor(this.document.height * divisor);
        icon.x = Math.floor(i / nr) * w;
        icon.y = (i % nr) * w;
        if ( tint ) icon.tint = tint;
        bg.drawRoundedRect(icon.x + 1, icon.y + 1, w - 2, w - 2, 2);
    }

    static _wrapperGetStatusEffectChoices() {
        const coreMethod = TokenHUD.prototype._getStatusEffectChoices;

        TokenHUD.prototype._getStatusEffectChoices = function() {
            const effects = coreMethod.call(this);
            
            for (const src in effects) {
                const effect = effects[src];
                const condition = game.succ?.conditions?.find(c => c.icon === src);

                //if (condition && !effect.id?.includes(NAME)) {
                //    effect.id = `${NAME}.${condition.id}`;
                //    effect.label = condition.label;
                //}
            }

            return effects;
        }
    }
}