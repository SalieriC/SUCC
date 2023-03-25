export async function actor_hooks() {
    //Update Actor Hook:
    Hooks.on(`updateActor`, async (actor, change, _, userId) => {
        //Add Conviction:
        if (change?.system?.details?.conviction?.active === true && game.user.id === userId) {
            //Check if condition was toggled on token, otherwise toggle it here:
            if (await succ.check_status(actor, 'conviction') === true) { return }
            const convCondition = await succ.apply_status(actor, 'conviction', true)
            await convCondition.update({
                flags: {
                    succ: {
                        updatedAE: true,
                        userId: userId,
                    }
                }
            })
        }
        //Remove Conviction:
        if (change?.system?.details?.conviction?.active === false && game.user.id === userId) {
            await succ.apply_status(actor, 'conviction', false)
        }
    })
}