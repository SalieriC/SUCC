class succ {
  static async apply_status(target, status_name, final_state=true) {
    // Always apply to the actor:
    if (target.actor) {
      target = target.actor
    }
    const effect = CONFIG.statusEffect.find(effect => effect.id === status_name.toLowerCase())
    const applied_effects = target.effects.find(eff => eff.getFlag('core', 'statusId') === status_name)
    if (applied_effects && !final_state) {
      // Actor has this effect, so it will be removed:
      applied_effects.delete()
    } else if (!applied_effects && final_state) {
      // Actor does not have the desired effect, thus it will be applied:
      const new_effect = foundry.utils.deepClone(effect)
      new_effect.label = game.i18n.localize(new_effect.label)
      setProperty(new_effect, 'flags.core.statusId', effect.id)
      new_effect.id = undefined
      const doc_class = getDocumentClass('ActiveEffect')
      await doc_class.create(new_effect, {parent target})
    }
  }
}
