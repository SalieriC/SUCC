import { NAME, FLAGS } from "../butler.js";

export default class EnhancedEffectConfig extends ActiveEffectConfig {

    /**
     * Get data for template rendering
     * @param {*} options 
     * @inheritdoc
     */
    getData(options) {
        return {
            effect: this.object.toObject(), // Backwards compatibility
            data: this.object.toObject(),
            editable: true,
            // Manually set effect type
            isActorEffect: true,
            isItemEffect: false,
            submitText: "EFFECT.Submit",
            modes: Object.entries(CONST.ACTIVE_EFFECT_MODES).reduce((obj, e) => {
                obj[e[1]] = game.i18n.localize("EFFECT.MODE_"+e[0]);
                return obj;
            }, {})
          };
    }

    /**
     * Override default update object behaviour
     * @param {*} formData 
     * @override
     */
    async _updateObject(event, formData) {
        const conditionIdFlag = foundry.utils.getProperty(this.object.flags, `${NAME}.${FLAGS.enhancedConditions.conditionId}`);
        if (!conditionIdFlag) return;

        // find the matching condition row
        const map = ui.succ?.conditionLab?.map;

        if (!map || !map.length) return;

        const conditionId = conditionIdFlag.replace(`${NAME}.`, "");
        const condition = map.find(c => c.id === conditionId);

        if (!condition) return;

        // update the effect data
        
        condition.activeEffect = condition.activeEffect ? foundry.utils.mergeObject(condition.activeEffect, formData) : formData;
        
        this.object.updateSource(formData);
        if (this._state == 2) await this.render();
        if (ui.succ.conditionLab) {
            ui.succ.conditionLab.map = ui.succ.conditionLab.updatedMap;
            //ui.succ.conditionLab.unsaved = true;
            ui.succ.conditionLab.render();
        }
    }
}