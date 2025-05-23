import { NAME, FLAGS } from "../butler.js";
import { Sidekick } from "../sidekick.js";

const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api
export default class EnhancedEffectConfig extends foundry.applications.sheets.ActiveEffectConfig {

    async _preparePartContext(partId, context) {
        if (partId == "details") {
            //Temp super hack until Foundry fixes editing in-memory effects
            const grandparentPreparePartContext = HandlebarsApplicationMixin(DocumentSheetV2).prototype._preparePartContext;
            const partContext = await grandparentPreparePartContext.call(this, partId, context);
            if ( partId in partContext.tabs ) partContext.tab = partContext.tabs[partId];
            partContext.legacyTransfer = CONFIG.ActiveEffect.legacyTransferral
              ? {label: game.i18n.localize("EFFECT.TransferLegacy"), hint: game.i18n.localize("EFFECT.TransferHintLegacy")}
              : null;
            partContext.statuses = CONFIG.statusEffects.map(s => ({value: s.id, label: game.i18n.localize(s.name)}));
            return {
                ...partContext,
                // Manually set effect type
                isActorEffect: true,
                isItemEffect: false,
            }
        }
        return await super._preparePartContext(partId, context);
    }

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