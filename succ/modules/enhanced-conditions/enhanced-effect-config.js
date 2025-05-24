import { NAME, FLAGS } from "../butler.js";
import { Sidekick } from "../sidekick.js";

export default class EnhancedEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {

    async _onSubmitForm(formConfig, event) {
        event.preventDefault();
        const formData = new foundry.applications.ux.FormDataExtended(event.currentTarget);

        const conditionId = Sidekick.getModuleFlag(this.document, FLAGS.enhancedConditions.conditionId);
        if (!conditionId) return;

        const map = ui.succ?.conditionLab?.map;
        if (!map || !map.length) return;

        const condition = map.find(c => c.id === conditionId);
        if (!condition) return;

        //Update the effect data
        condition.activeEffect = condition.activeEffect ? foundry.utils.mergeObject(condition.activeEffect, formData.object) : formData.object;
        await Sidekick.setModuleFlag(condition.activeEffect, FLAGS.enhancedConditions.activeEffectCustomized, true);

        if (ui.succ.conditionLab) {
            ui.succ.conditionLab.render();
        }

        await this.close({submitted: true});
    }
}