class succ {
  /**
   * Applies/Removes an active effect based status to either an actor or a token
   * @param {SwadeActor, Token, abstract.Document, String} target: Who to apply the status
   * @param {string} status_name: Name of the status
   * @param {boolean} final_state: True if we want the status applied, false to remove.
   */
  static async apply_status(target, status_name, final_state = true) {
    if (typeof(target) === 'string') {
        let new_target = await canvas.tokens.get(target)
        if (! new_target) {
            new_target = await game.actors.get(target)
        }
        if (! new_target) {
            return
        }
        target = new_target
    }
    console.log(target)
    // We are going to apply the effect always to the actor
    if (target.actor) {
      // noinspection JSValidateTypes
      target = target.actor
    }
    const effect = CONFIG.statusEffects.find(effect => effect.id === status_name)
    const applied_effects = target.effects.find(eff => eff.getFlag('core', 'statusId') === status_name)
    if (applied_effects && !final_state) {
      // The actor has the effect but we want it off
      applied_effects.delete()
    } else if (!applied_effects && final_state) {
      // We want the effect but the actor doesn't have it
      const new_effect = foundry.utils.deepClone(effect)
      new_effect.label = game.i18n.localize(new_effect.label)
      setProperty(new_effect, 'flags.core.statusId', effect.id)
      new_effect.id = undefined
      const doc_class = getDocumentClass('ActiveEffect')
      await doc_class.create(new_effect, { parent: target })
    }
  }

  /**
   * Toggles an active effect based status to either an actor or a token
   * @param {SwadeActor, Token, abstract.Document} target: Who to apply the status
   * @param {string} status_name: Name of the status
   * @param {boolean} final_state: True if we want the status toggled, false to remove.
   */
   static async toggle_status(target, status_name, final_state = true) {
    // We are going to apply the effect always to the actor
    if (target.actor) {
      // noinspection JSValidateTypes
      target = target.actor
    }
    const effect = CONFIG.statusEffects.find(effect => effect.id === status_name)
    const applied_effects = target.effects.find(eff => eff.getFlag('core', 'statusId') === status_name)
    if (applied_effects && !final_state || applied_effects && final_state) {
      applied_effects.delete()
    } else if (!applied_effects && final_state) {
      const new_effect = foundry.utils.deepClone(effect)
      new_effect.label = game.i18n.localize(new_effect.label)
      setProperty(new_effect, 'flags.core.statusId', effect.id)
      new_effect.id = undefined
      const doc_class = getDocumentClass('ActiveEffect')
      await doc_class.create(new_effect, { parent: target })
    }
  }
}
