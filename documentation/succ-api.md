# SUCC API
This provides an overview of the functionality SUCC offers for module and macro developers. Note that SUCC is still in early development and so this is subject to change as well. We'll try to keep deprecations and critical changes to a bare minimum but cannot rule them out completely at this point.

## Exposed Functions
Below you'll find a documentation of currently exposed functions that can be utilised by your macros and modules alike.

### Get Condition
An easy way to check if a condition is set up and available from the token context menu and to get the condition itself.  
`(async) succ.get_condition('conditionName')`  

This will return the requested condition if it is set up in the world, or return undefined if it is not.  
- `'conditionName'` is the name of the condition you want returned, i.e. `'shaken'`.

### Check for Conditions
SUCC provides an easy way to check whether or not a token or actor currently has a condition applied:  
`(async) succ.check_status(actorOrToken, 'conditionName')`
  
This will return `true` if the token currently has the requested condition or `false` if not. Since it is async, you'll want to `await` it.  
- `actorOrToken` is the actor or token you want to check. It also accepts the ID of an actor or token if that's all you have.
- `'conditionName'` is the name of the condition you want to check, i.e. `'shaken'`.

### Get the Condition document
Contrary to `check_status()`, with this you can get the condition itself:  
`(async) succ.get_condition_from(actorOrToken, 'conditionName')`
  
This will return the condition document itself if the token currently has the requested condition or `null` if not. Since it is async, you'll want to `await` it.  
- `actorOrToken` is the actor or token you want to check. It also accepts the ID of an actor or token if that's all you have.
- `'conditionName'` is the name of the condition you want to check, i.e. `'shaken'`.

### Apply/Remove Conditions
Foundry core and SWADE system both provide functions to apply/remove conditions (`token.toggleActiveEffect()` in case of FVTT and `actor.toggleActiveEffect()` in case of SWADE). Both however work exactly the same and have two major problems:  
1. You need to pass the full effect, you can *not* just call its name.
2. Without arguments, it'll toggle the effect (remove if active, add if not). If `active:false` is passed to it, it will remove the effect and on `active:true` it will add it. But it will force add it in this case, that means that it will add the condition *again* even if it was already there.

This is why SUCC adds its own function to be used by developers which covers both problems for ease of use. It can be called like this:  
`(async) succ.apply_status(actorOrToken, 'conditionName', boolean<sub>opt</sub>, overlay<sub>opt</sub>, additionalData<sub>opt</sub>)`
- `actorOrToken` is the actor or token you want the condition to apply to. It also accepts the ID of an actor or token if that's all you have.
- `'conditionName'` is the name of the condition you want to apply, i.e. `'shaken'`.
- `boolean`is optional. If not passed, the function will always add the effect (unless it is already present in which case it does nothing). If `false` is passed, it will remove the effect if present and do nothing if not, passing `true` will work the same as without passing it.
- `overlay` (boolean) is also optional. If passed true, the condition will be added as an overlay (displaying a big icon instead of a small one.)
- `additionalData` is optional as well. It's an object holding all sorts of information to be processed by other functions in SWADE. In order for the functions to work properly, the object must be built correctly and carefully. See the section "Additional Data" for detailed information on how to build it for your purposes.  
The function returns the AE for further use.  

### Toggle Conditions
This is closer to the way FVTT core works but doesn't need the full effect to be passed.  
`(async) succ.toggle_status(actorOrToken, 'conditionName', boolean<sub>opt</sub>, overlay<sub>opt</sub>, additionalData<sub>opt</sub>)`
- `actorOrToken` is the actor or token you want the condition to apply to. It also accepts the ID of an actor or token if that's all you have.
- `'conditionName'` is the name of the condition you want to apply, i.e. `'shaken'`.
- `boolean`is optional. If not passed, the function will *toggle* the effect (remove if present, add if not). If `false` is passed, it will remove the effect if present and do nothing if not, passing `true` will work the same as without passing it.
- `overlay` (boolean) is also optional. If passed true, the condition will be added as an overlay (displaying a big icon instead of a small one.)
- `data` is optional as well. It's an object holding all sorts of information to be processed by other functions in SWADE. In order for the functions to work properly, the object must be built correctly and carefully. See the section "Additional Data" for detailed information on how to build it for your purposes.  
The function returns the AE for further use.  

## Additional Data
As mentioned above, SUCC enables you to pass an object holding additional data. This object is set up in the flags of the AE in question. These flags are utilised by SUCC in other scripts such as the effect builder for smite, protection and the like. This allows you as a dev to bypass the effect builder dialogues, i.e. to further enhance the automation of your game.  
Of course there is also the possibility of using the set up flags for your own purposes, as they contain all the information you want them to contain, making this a very useful and flexible tool.  

### Basic data structure
If additional data is passed to the `succ.apply_status()` and `succ.toogle_status()` functions, it will be set up like this on the active effect:  
`data.flags.succ.additionalData`  
Inside is the data object placed, which were passed to the aforementioned functions.  

### Caveat
It is highly recommended you pass the execution of the setup to a GMs account. Otherwise the person executing the script will get error messages for actors they have no permission to edit. Passing the script execution to a GM will circumvent this. For macros you can do this using the Advances Macros module. For Modules you can either do it via a Hook only a GM listens to (preferably only the first active GM) or using the notification feature of the Warp Gate module.  
Ideally you will create the data as below and pass it to another function that calls the apply or toggle function of SUCC on the first active GMs account.  
Be very vareful when executing scripts that may be edited by players on a GMs account though. Mischievous players can do all sorts of things then.

### How to build data
If you're an experienced developer you may skip this section.  
Building the data object is rather simple. Here is an example:  
```js
const data = {
    string: "randomString",
    object: {
        property1: /*some property*/,
        property2: /*some property*/,
    },
    number: 4
}
await succ.apply_status(token, 'shaken', true, false, data)
```

### Additional Data for *smite*
This is the data you want to use to bypass the smite effect builder dialogue:
```js
const smiteData = {
    smite: {                            //This is where SUCC will look for the data.
        bonus: 2,                       //This is the bonus applied by the AE. Negative numbers are possible so be careful what you pass.
        weapon: weaponItem,             //Safest way is to pass the weapon item itself but you can pass a string which SUCC will just assume to be the name (i.e. "Bow"). SUCC will not check if that item exists!
        duration: 5,                    //A number specifying the duration of the effect. It defaults to 5.
        icon: false                     //A string type file path to change the icon of the Active Effect. Will use the default icon if 'false'.
    }
}
```

### Additional Data for *protection*
This is the data you want to use to bypass the protection effect builder dialogue:
```js
const protectionData = {
    protection: {                       //This is where SUCC will look for the data.
        bonus: 2,                       //This is the bonus applied by the AE. Negative numbers are possible so be careful what you pass.
        type: "armor",                  //This can also be "toughness". It defines to which the bonus is applied to.
        duration: 5,                    //A number specifying the duration of the effect. It defaults to 5.
        icon: false                     //A string type file path to change the icon of the Active Effect. Will use the default icon if 'false'.
    }
}
```

### Additional Data for *boost/lower*
This is the data you want to use to bypass the boost/lower effect builder dialogue:
```js
const boostLowerData = {
    boost: {                            //This is where SUCC will look for the data, use 'lower' if the spell was cast using lower.
        degree: "success",              //This is the degree of success and failure. Can also be 'raise'.
        trait: skillItem,               //It's the safest to pass the skills' item directly but you can pass a string and the builder will search for that. For Attributes this is the only way to pass it.
        duration: 5,                    //A number specifying the duration of the effect. It defaults to 5.
        icon: false                     //A string type file path to change the icon of the Active Effect. Will use the default icon if 'false'.
    }
}
```

### Additional Changes
You have the ability to push additional changes as well, those will be incorporated into the changes of the effect just before upading the effect. It uses the `concat` method to merge the changes into the changes array. This means that you have to pass an object which holds all the arrays of changes you want to include. Failing to build this properly will result in failure, so be extra careful when doing so. Taking *protection* as an example, it would look like this:  
```js
const protectionData = {
    protection: {
        bonus: 2,
        type: "armor",
        duration: 5,
        icon: false,
        additionalChanges: [{ key: `@Skill{Spellcasting}[data.die.modifier]`, mode: 2, priority: undefined, value: -1 }]
    }
}
```
There is no harm in not passing additionalChanges. If you don't need them it's best to ignore them and to take the other examples above. If you do need them, they can be incredibly powerful if you build them properly.