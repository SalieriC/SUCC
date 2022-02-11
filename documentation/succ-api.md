# SUCC API
This provides an overview of the functionality SUCC offers for module and macro developers. Note that SUCC is still in early development and so this is subject to change as well. We'll try to keep deprecations and critical changes to a bare minimum but cannot rule them out completely at this point.

## Apply/Remove Conditions
Foundry core and SWADE system both provide functions to apply/remove conditions (`token.toggleActiveEffect()` in case of FVTT and `actor.toggleActiveEffect()` in case of SWADE). Both however work exactly the same and have two major problems:
1. You need to pass the full effect, you can *not* just call its name.
2. Without arguments, it'll toggle the effect (remove if active, add if not). If `active:false` is passed to it, it will remove the effect and on `active:true` it will add it. But it will force add it in this case, that means that it will add the condition *again* even if it was already there.

This is why SUCC adds its own function to be used by developers which covers both problems for ease of use. It can be called like this:
> succ.apply_status(actorOrToken, 'conditionName', boolean<sub>opt</sub>)
- `actorOrToken` is the actor or token you want the condition to apply to.
- `'conditionName'` is the name of the condition you want to apply, i.e. `'shaken'`.
- `boolean`is optional. If not passed, the function will always add the effect (unless it is already present in which case it does nothing). If `false` is passed, it will remove the effect if present and do nothing if not, passing `true` will work the same as without passing it.

### Toggle Conditions
This is closer to the way FVTT core works but doesn't need the full effect to be passed.
> succ.toggle_status(actorOrToken, 'conditionName', boolean<sub>opt</sub>)
- `actorOrToken` is the actor or token you want the condition to apply to.
- `'conditionName'` is the name of the condition you want to apply, i.e. `'shaken'`.
- `boolean`is optional. If not passed, the function will *toggle* the effect (remove if present, add if not). If `false` is passed, it will remove the effect if present and do nothing if not, passing `true` will work the same as without passing it.