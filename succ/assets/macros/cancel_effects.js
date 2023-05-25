//Place Dialogue to detail what's going to habben and to warn that this is not reversable and ask for confirmation.

/* 
* This will process all tokens placed on the current scene and delete all active Effects from their actors if:
* - the token is not in combat AND
* - the effect is temporary (has a duration)
* It will NOT touch actors in combat and permanent effects (such without duration)
*/

const sceneTokens = game.scenes.current.tokens
const nonCombatTokens = sceneTokens.filter(t => t.inCombat === false)
if (!nonCombatTokens) {
    return
}
for (let token of nonCombatTokens) {
    const actor = token.actor
    const tokenEffects = actor.effects
    const durationEffects = tokenEffects.filter(e => typeof e.duration.rounds === "number" && !isNaN(e.duration.rounds) && isFinite(e.duration.rounds))
    let effectsToDeleteIds = []
    for (let effect of durationEffects) {
        effectsToDeleteIds.push(effect.id)
    }
    if (durationEffects) {
        await actor.deleteEmbeddedDocuments('ActiveEffect', effectsToDeleteIds)
    }
}