## Classes

<dl>
<dt><a href="#ConditionLab">ConditionLab</a></dt>
<dd><p>Form application for managing mapping of Conditions to Icons and JournalEntries</p>
</dd>
<dt><a href="#EnhancedConditionsAPI">EnhancedConditionsAPI</a></dt>
<dd><p>API functions for interacting with EnhancedConditions</p>
</dd>
<dt><a href="#EnhancedConditionsPowers">EnhancedConditionsPowers</a></dt>
<dd><p>Builds a mapping between status icons and journal entries that represent conditions</p>
</dd>
<dt><a href="#EnhancedConditions">EnhancedConditions</a></dt>
<dd><p>Builds a mapping between status icons and journal entries that represent conditions</p>
</dd>
<dt><a href="#Sidekick">Sidekick</a></dt>
<dd><p>Provides helper methods for use elsewhere in the module (and has your back in a melee)</p>
</dd>
<dt><a href="#Signal">Signal</a></dt>
<dd><p>Initiates module classes (and shines a light on the dark night sky)</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#defaultOptions">defaultOptions</a></dt>
<dd><p>defaultOptions</p>
</dd>
<dt><a href="#defaultOptions">defaultOptions</a></dt>
<dd><p>defaultOptions</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getData">getData()</a> ⇒ <code>Object</code></dt>
<dd><p>Gets data for template rendering</p>
</dd>
<dt><a href="#_updateObject">_updateObject(event, formData)</a></dt>
<dd><p>Update Object on Form Submission</p>
</dd>
<dt><a href="#getData">getData()</a> ⇒ <code>Object</code></dt>
<dd><p>Gets data for template rendering</p>
</dd>
<dt><a href="#activateListeners">activateListeners(html)</a></dt>
<dd><p>Application listeners</p>
</dd>
<dt><a href="#_onCheckboxChange">_onCheckboxChange(event)</a></dt>
<dd><p>Checkbox change event handler</p>
</dd>
<dt><a href="#_onSpecialStatusEffectToggle">_onSpecialStatusEffectToggle(event)</a></dt>
<dd><p>Special Status Effect toggle handler</p>
</dd>
<dt><a href="#_updateObject">_updateObject(event, formData)</a></dt>
<dd><p>Update Object on Form Submission</p>
</dd>
<dt><a href="#getSpecialStatusEffectByField">getSpecialStatusEffectByField(field)</a> ⇒ <code>String</code></dt>
<dd><p>Get the enum for a special status effect in Foundry based on the field name</p>
</dd>
<dt><a href="#setSpecialStatusEffectMapping">setSpecialStatusEffectMapping(effect, conditionId)</a></dt>
<dd><p>Sets the special status effect to the provided condition Id</p>
</dd>
<dt><a href="#getData">getData(options)</a></dt>
<dd><p>Get data for template rendering</p>
</dd>
<dt><a href="#_updateObject">_updateObject(formData)</a></dt>
<dd><p>Override default update object behaviour</p>
</dd>
</dl>

<a name="EnhancedConditionsAPI"></a>

## EnhancedConditionsAPI
API functions for interacting with EnhancedConditions

**Kind**: global class  

* [EnhancedConditionsAPI](#EnhancedConditionsAPI)
    * [.addCondition(conditionId, [entities])](#EnhancedConditionsAPI.addCondition)
    * [.removeCondition(conditionId, entities)](#EnhancedConditionsAPI.removeCondition)
    * [.removeAllConditions(entities)](#EnhancedConditionsAPI.removeAllConditions)
    * [.getCondition(conditionId, map)](#EnhancedConditionsAPI.getCondition)
    * [.getConditionFrom(conditionId, entity)](#EnhancedConditionsAPI.getConditionFrom)
    * [.getConditions(entities)](#EnhancedConditionsAPI.getConditions) ⇒ <code>Array</code>
    * [.getActiveEffect(condition)](#EnhancedConditionsAPI.getActiveEffect)
    * [.getConditionEffects(entities, map, warn)](#EnhancedConditionsAPI.getConditionEffects) ⇒ <code>Map</code> \| <code>Object</code>
    * [.hasCondition(conditionId, entities, [options])](#EnhancedConditionsAPI.hasCondition) ⇒ <code>Boolean</code>
    * [.getActorFromEntity(entity)](#EnhancedConditionsAPI.getActorFromEntity) ⇒ <code>Actor</code>
    * [.removeTemporaryEffects(sceneId, confirmed)](#EnhancedConditionsAPI.removeTemporaryEffects)

<a name="EnhancedConditionsAPI.addCondition"></a>

### EnhancedConditionsAPI.addCondition(conditionId, [entities])
Applies the named condition to the provided entities (Actors or Tokens)

**Kind**: static method of [<code>EnhancedConditionsAPI</code>](#EnhancedConditionsAPI)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| conditionId | <code>Array.&lt;String&gt;</code> \| <code>String</code> |  | the id of the condition to add |
| [entities] | <code>Array.&lt;Actor&gt;</code> \| <code>Array.&lt;Token&gt;</code> \| <code>Actor</code> \| <code>Token</code> | <code></code> | one or more Actors or Tokens to apply the Condition to |
| [options.allowDuplicates] | <code>Boolean</code> | <code>false</code> | if one or more of the Conditions specified is already active on the Entity, this will still add the Condition. Use in conjunction with `replaceExisting` to determine how duplicates are handled |
| [options.replaceExisting] | <code>Boolean</code> | <code>false</code> | whether or not to replace existing Conditions with any duplicates in the `conditionName` parameter. If `allowDuplicates` is true and `replaceExisting` is false then a duplicate condition is created. Has no effect if `allowDuplicates` is `false` |
| [options.forceOverlay] | <code>Boolean</code> | <code>false</code> | if true, this condition will appear as an overlay regardless of its normal behaviour |
| [options.effectOptions] | <code>Boolean</code> |  | additional options that are added to a property to be used by elsewhere in the code |

**Example**  
```js
// Add the Condition "Blinded" to an Actor named "Bob". Duplicates will not be created.game.succ.addCondition("Blinded", game.actors.getName("Bob"));
```
**Example**  
```js
// Add the Condition "Charmed" to the currently controlled Token/s. Duplicates will not be created.game.succ.addCondition("Charmed");
```
**Example**  
```js
// Add the Conditions "Blinded" and "Charmed" to the targeted Token/s and create duplicates, replacing any existing Conditions of the same names.game.succ.addCondition(["Blinded", "Charmed"], [...game.user.targets], {allowDuplicates: true, replaceExisting: true});
```
<a name="EnhancedConditionsAPI.removeCondition"></a>

### EnhancedConditionsAPI.removeCondition(conditionId, entities)
Removes one or more named conditions from an Entity (Actor/Token)

**Kind**: static method of [<code>EnhancedConditionsAPI</code>](#EnhancedConditionsAPI)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| conditionId | <code>String</code> |  | the id of the Condition to remove |
| entities | <code>Actor</code> \| <code>Token</code> | <code></code> | One or more Actors or Tokens |
| options.warn | <code>Boolean</code> |  | whether or not to raise warnings on errors |

**Example**  
```js
// Remove Condition named "Blinded" from an Actor named Bobgame.succ.removeCondition("Blinded", game.actors.getName("Bob"));
```
**Example**  
```js
// Remove Condition named "Charmed" from the currently controlled Token, but don't show any warnings if it fails.game.succ.removeCondition("Charmed", {warn=false});
```
<a name="EnhancedConditionsAPI.removeAllConditions"></a>

### EnhancedConditionsAPI.removeAllConditions(entities)
Removes all conditions from the provided entities

**Kind**: static method of [<code>EnhancedConditionsAPI</code>](#EnhancedConditionsAPI)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| entities | <code>Actors</code> \| <code>Tokens</code> | <code></code> | One or more Actors or Tokens to remove Conditions from |
| options.warn | <code>Boolean</code> |  | output notifications |

**Example**  
```js
// Remove all Conditions on an Actor named Bobgame.succ.removeAllConditions(game.actors.getName("Bob"));
```
**Example**  
```js
// Remove all Conditions on the currently controlled Tokengame.succ.removeAllConditions();
```
<a name="EnhancedConditionsAPI.getCondition"></a>

### EnhancedConditionsAPI.getCondition(conditionId, map)
Gets a condition by id from the Condition Map

**Kind**: static method of [<code>EnhancedConditionsAPI</code>](#EnhancedConditionsAPI)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| conditionId | <code>\*</code> |  | the id of the Condition to find |
| map | <code>\*</code> | <code></code> | the map to search through. If null, we'll use the current map |
| options.warn | <code>\*</code> |  | whether or not to raise warnings on errors |

<a name="EnhancedConditionsAPI.getConditionFrom"></a>

### EnhancedConditionsAPI.getConditionFrom(conditionId, entity)
Gets a condition by id from given Actor or String

**Kind**: static method of [<code>EnhancedConditionsAPI</code>](#EnhancedConditionsAPI)  

| Param | Type | Description |
| --- | --- | --- |
| conditionId | <code>\*</code> | the id of the Condition to find |
| entity | <code>Actor</code> \| <code>String</code> \| <code>Object</code> | the Actor or Token to get the condition from |
| options.warn | <code>\*</code> | whether or not to raise warnings on errors |

<a name="EnhancedConditionsAPI.getConditions"></a>

### EnhancedConditionsAPI.getConditions(entities) ⇒ <code>Array</code>
Retrieves all active conditions for one or more given entities (Actors or Tokens)

**Kind**: static method of [<code>EnhancedConditionsAPI</code>](#EnhancedConditionsAPI)  
**Returns**: <code>Array</code> - entityConditionMap  a mapping of conditions for each provided entity  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| entities | <code>Actor</code> \| <code>Token</code> | <code></code> | one or more Actors or Tokens to get Conditions from |
| options.warn | <code>Boolean</code> |  | whether or not to raise warnings on errors |

**Example**  
```js
// Get conditions for an Actor named "Bob"game.succ.getConditions(game.actors.getName("Bob"));
```
**Example**  
```js
// Get conditions for the currently controlled Tokengame.succ.getConditions();
```
<a name="EnhancedConditionsAPI.getActiveEffect"></a>

### EnhancedConditionsAPI.getActiveEffect(condition)
Gets the Active Effect data (if any) for the given condition

**Kind**: static method of [<code>EnhancedConditionsAPI</code>](#EnhancedConditionsAPI)  

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>\*</code> | the id of the Condition to get |

<a name="EnhancedConditionsAPI.getConditionEffects"></a>

### EnhancedConditionsAPI.getConditionEffects(entities, map, warn) ⇒ <code>Map</code> \| <code>Object</code>
Gets any Active Effect instances present on the entities (Actor/s or Token/s) that are mapped Conditions

**Kind**: static method of [<code>EnhancedConditionsAPI</code>](#EnhancedConditionsAPI)  
**Returns**: <code>Map</code> \| <code>Object</code> - A Map containing the Actor Id and the Condition Active Effect instances if any  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| entities | <code>String</code> |  | the entities to check |
| map | <code>Array</code> | <code></code> | the Condition map to check (optional) |
| warn | <code>Boolean</code> |  | whether or not to raise warnings on errors |

<a name="EnhancedConditionsAPI.hasCondition"></a>

### EnhancedConditionsAPI.hasCondition(conditionId, entities, [options]) ⇒ <code>Boolean</code>
Checks if the provided Entity (Actor or Token) has the given condition

**Kind**: static method of [<code>EnhancedConditionsAPI</code>](#EnhancedConditionsAPI)  
**Returns**: <code>Boolean</code> - hasCondition  Returns true if one or more of the provided entities has one or more of the provided conditions  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| conditionId | <code>String</code> \| <code>Array</code> |  | the id/s of the condition or conditions to check for |
| entities | <code>Actor</code> \| <code>Token</code> \| <code>Array</code> | <code></code> | the entity or entities to check (Actor/s or Token/s) |
| [options] | <code>Object</code> |  | options object |
| [options.warn] | <code>Boolean</code> |  | whether or not to output notifications |

**Example**  
```js
// Check for the "Blinded" condition on Actor "Bob"game.succ.hasCondition("Blinded", game.actors.getName("Bob"));
```
**Example**  
```js
// Check for the "Charmed" and "Deafened" conditions on the controlled tokensgame.succ.hasCondition(["Charmed", "Deafened"]);
```
<a name="EnhancedConditionsAPI.getActorFromEntity"></a>

### EnhancedConditionsAPI.getActorFromEntity(entity) ⇒ <code>Actor</code>
Converts the provided entity into an Actor

**Kind**: static method of [<code>EnhancedConditionsAPI</code>](#EnhancedConditionsAPI)  
**Returns**: <code>Actor</code> - Returns the converted Actor or null if none was found  

| Param | Type | Description |
| --- | --- | --- |
| entity | <code>Actor</code> \| <code>Token</code> \| <code>TokenDocument</code> \| <code>String</code> | The entity to convert |

<a name="EnhancedConditionsAPI.removeTemporaryEffects"></a>

### EnhancedConditionsAPI.removeTemporaryEffects(sceneId, confirmed)
**Kind**: static method of [<code>EnhancedConditionsAPI</code>](#EnhancedConditionsAPI)  

| Param | Default | Description |
| --- | --- | --- |
| sceneId | <code>false</code> | The scene ID on which the function looks for token actors to remove the conditions from; defaults to current scene. |
| confirmed | <code>false</code> | Boolean to skip the confirmation dialogue. |

<a name="EnhancedConditionsPowers"></a>

## EnhancedConditionsPowers
Builds a mapping between status icons and journal entries that represent conditions

**Kind**: global class  

* [EnhancedConditionsPowers](#EnhancedConditionsPowers)
    * [.boostLowerTrait(actor, condition, boost)](#EnhancedConditionsPowers.boostLowerTrait)
    * [.boostLowerBuilder(effect, actor, trait, type, degree)](#EnhancedConditionsPowers.boostLowerBuilder)
    * [.smite(actor, condition)](#EnhancedConditionsPowers.smite)
    * [.smiteBuilder(effect, weaponName, damageBonus)](#EnhancedConditionsPowers.smiteBuilder)
    * [.protection(actor, condition)](#EnhancedConditionsPowers.protection)
    * [.protectionBuilder(effect, protectionBonus, type)](#EnhancedConditionsPowers.protectionBuilder)

<a name="EnhancedConditionsPowers.boostLowerTrait"></a>

### EnhancedConditionsPowers.boostLowerTrait(actor, condition, boost)
Adds a boost or lower trait effect to an actor

**Kind**: static method of [<code>EnhancedConditionsPowers</code>](#EnhancedConditionsPowers)  

| Param | Type | Description |
| --- | --- | --- |
| actor | <code>Actor</code> | Actor to apply the effect to |
| condition | <code>Object</code> | The condition being applied (should be either boost or lower trait) |
| boost | <code>boolean</code> | True if this is a boost, false if it's a lower |

<a name="EnhancedConditionsPowers.boostLowerBuilder"></a>

### EnhancedConditionsPowers.boostLowerBuilder(effect, actor, trait, type, degree)
Creates and applies the active effects for a boost or lower trait condition

**Kind**: static method of [<code>EnhancedConditionsPowers</code>](#EnhancedConditionsPowers)  

| Param | Type | Description |
| --- | --- | --- |
| effect | <code>Object</code> | The active effect being updated |
| actor | <code>Actor</code> | Actor to update |
| trait | <code>String</code> | The trait being affected |
| type | <code>String</code> | Specifies if this a boost or lower |
| degree | <code>String</code> | Specifies if this a success or a raise |

<a name="EnhancedConditionsPowers.smite"></a>

### EnhancedConditionsPowers.smite(actor, condition)
Adds a smite effect to an actor

**Kind**: static method of [<code>EnhancedConditionsPowers</code>](#EnhancedConditionsPowers)  

| Param | Type | Description |
| --- | --- | --- |
| actor | <code>Actor</code> | Actor to apply the effect to |
| condition | <code>Object</code> | The condition being applied (should be smite) |

<a name="EnhancedConditionsPowers.smiteBuilder"></a>

### EnhancedConditionsPowers.smiteBuilder(effect, weaponName, damageBonus)
Creates and applies the active effects for a smite condition

**Kind**: static method of [<code>EnhancedConditionsPowers</code>](#EnhancedConditionsPowers)  

| Param | Type | Description |
| --- | --- | --- |
| effect | <code>Object</code> | The active effect being updated |
| weaponName | <code>String</code> | The name of the weapon being affected |
| damageBonus | <code>String</code> | The damage bonus |

<a name="EnhancedConditionsPowers.protection"></a>

### EnhancedConditionsPowers.protection(actor, condition)
Adds a protection effect to an actor

**Kind**: static method of [<code>EnhancedConditionsPowers</code>](#EnhancedConditionsPowers)  

| Param | Type | Description |
| --- | --- | --- |
| actor | <code>Actor</code> | Actor to apply the effect to |
| condition | <code>Object</code> | The condition being applied (should be protection) |

<a name="EnhancedConditionsPowers.protectionBuilder"></a>

### EnhancedConditionsPowers.protectionBuilder(effect, protectionBonus, type)
Creates and applies the active effects for a protection condition

**Kind**: static method of [<code>EnhancedConditionsPowers</code>](#EnhancedConditionsPowers)  

| Param | Type | Description |
| --- | --- | --- |
| effect | <code>Object</code> | The active effect being updated |
| protectionBonus | <code>String</code> | The amount to apply |
| type | <code>String</code> | Whether this is affected toughness or armor |

<a name="EnhancedConditions"></a>

## EnhancedConditions
Builds a mapping between status icons and journal entries that represent conditions

**Kind**: global class  

* [EnhancedConditions](#EnhancedConditions)
    * [._onReady()](#EnhancedConditions._onReady)
    * [._onUpdateActor()](#EnhancedConditions._onUpdateActor)
    * [._onCreateActiveEffect(actor, update, options, userId)](#EnhancedConditions._onCreateActiveEffect)
    * [._onDeleteActiveEffect(actor, update, options, userId)](#EnhancedConditions._onDeleteActiveEffect)
    * [._onRenderChatMessage(app, html, data)](#EnhancedConditions._onRenderChatMessage)
    * [._onRenderChatLog(app, html, data)](#EnhancedConditions._onRenderChatLog)
    * [._onRenderCombatTracker(app, html, data)](#EnhancedConditions._onRenderCombatTracker)
    * [._processActiveEffectChange(effect, type)](#EnhancedConditions._processActiveEffectChange)
    * [.applyEffectOptions(effect, actor)](#EnhancedConditions.applyEffectOptions)
    * [.lookupEntryMapping(effectIds, [map])](#EnhancedConditions.lookupEntryMapping)
    * [.outputChatMessage()](#EnhancedConditions.outputChatMessage)
    * [.toggleDefeated(entities)](#EnhancedConditions.toggleDefeated)
    * [.activateConviction()](#EnhancedConditions.activateConviction)
    * [.deactivateConviction()](#EnhancedConditions.deactivateConviction)
    * [.removeOtherConditions(entity, conditionId)](#EnhancedConditions.removeOtherConditions)
    * [._processMacros(macroIds, entity)](#EnhancedConditions._processMacros)
    * [.updateConditionTimestamps()](#EnhancedConditions.updateConditionTimestamps)
    * [._createLabButton(html)](#EnhancedConditions._createLabButton)
    * [._toggleLabButtonVisibility(display)](#EnhancedConditions._toggleLabButtonVisibility)
    * [._loadDefaultMap()](#EnhancedConditions._loadDefaultMap)
    * [._prepareMap(conditionMap)](#EnhancedConditions._prepareMap)
    * [._backupCoreEffects()](#EnhancedConditions._backupCoreEffects)
    * [._backupCoreSpecialStatusEffects()](#EnhancedConditions._backupCoreSpecialStatusEffects)
    * [.lookupConditionById(conditionId, map)](#EnhancedConditions.lookupConditionById)
    * [._updateStatusEffects(conditionMap)](#EnhancedConditions._updateStatusEffects)
    * [._prepareStatusEffects(conditionMap)](#EnhancedConditions._prepareStatusEffects) ⇒ <code>Array</code>
    * [._prepareActiveEffects(effects)](#EnhancedConditions._prepareActiveEffects)
    * [.getConditionIcons()](#EnhancedConditions.getConditionIcons)
    * [.getIconsByCondition(condition)](#EnhancedConditions.getIconsByCondition)
    * [.getConditionsByIcon(icon)](#EnhancedConditions.getConditionsByIcon)
    * [.mapFromJson(json)](#EnhancedConditions.mapFromJson)
    * [.getDefaultMap()](#EnhancedConditions.getDefaultMap)
    * [.buildDefaultMap()](#EnhancedConditions.buildDefaultMap)
    * [.updateConditionMapFromDefaults()](#EnhancedConditions.updateConditionMapFromDefaults)

<a name="EnhancedConditions._onReady"></a>

### EnhancedConditions.\_onReady()
Ready Hook handlerSteps:1. Get default maps2. Get mapType3. Get Condition Map4. Override status effects

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
<a name="EnhancedConditions._onUpdateActor"></a>

### EnhancedConditions.\_onUpdateActor()
Hooks on token updates. If the update includes effects, calls the journal entry lookup

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
<a name="EnhancedConditions._onCreateActiveEffect"></a>

### EnhancedConditions.\_onCreateActiveEffect(actor, update, options, userId)
Create Active Effect handler

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type |
| --- | --- |
| actor | <code>\*</code> | 
| update | <code>\*</code> | 
| options | <code>\*</code> | 
| userId | <code>\*</code> | 

<a name="EnhancedConditions._onDeleteActiveEffect"></a>

### EnhancedConditions.\_onDeleteActiveEffect(actor, update, options, userId)
Create Active Effect handler

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type |
| --- | --- |
| actor | <code>\*</code> | 
| update | <code>\*</code> | 
| options | <code>\*</code> | 
| userId | <code>\*</code> | 

<a name="EnhancedConditions._onRenderChatMessage"></a>

### EnhancedConditions.\_onRenderChatMessage(app, html, data)
Render Chat Message handler

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
**Todo**

- [ ] move to chatlog render?


| Param | Type |
| --- | --- |
| app | <code>\*</code> | 
| html | <code>\*</code> | 
| data | <code>\*</code> | 

<a name="EnhancedConditions._onRenderChatLog"></a>

### EnhancedConditions.\_onRenderChatLog(app, html, data)
ChatLog render hook

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type |
| --- | --- |
| app | <code>\*</code> | 
| html | <code>\*</code> | 
| data | <code>\*</code> | 

<a name="EnhancedConditions._onRenderCombatTracker"></a>

### EnhancedConditions.\_onRenderCombatTracker(app, html, data)
**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type |
| --- | --- |
| app | <code>\*</code> | 
| html | <code>\*</code> | 
| data | <code>\*</code> | 

<a name="EnhancedConditions._processActiveEffectChange"></a>

### EnhancedConditions.\_processActiveEffectChange(effect, type)
Process the addition/removal of an Active Effect

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| effect | <code>ActiveEffect</code> |  | the effect |
| type | <code>String</code> | <code>create</code> | the type of change to process |

<a name="EnhancedConditions.applyEffectOptions"></a>

### EnhancedConditions.applyEffectOptions(effect, actor)
Processes effect options and applies them to active effects

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type | Description |
| --- | --- | --- |
| effect | <code>\*</code> | The effect containing the effect options |
| actor | <code>\*</code> | The actor containing the effect |

<a name="EnhancedConditions.lookupEntryMapping"></a>

### EnhancedConditions.lookupEntryMapping(effectIds, [map])
Checks statusEffect icons against map and returns matching condition mappings

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| effectIds | <code>Array</code> \| <code>String</code> |  | A list of effectIds, or a single effectId to check |
| [map] | <code>Array</code> | <code>[]</code> | the condition map to look in |

<a name="EnhancedConditions.outputChatMessage"></a>

### EnhancedConditions.outputChatMessage()
Output one or more condition entries to chat

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
**Todo**

- [ ] refactor to use actor or token

<a name="EnhancedConditions.toggleDefeated"></a>

### EnhancedConditions.toggleDefeated(entities)
Marks a Combatants for a particular entity as defeated

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type | Description |
| --- | --- | --- |
| entities | <code>Actor</code> \| <code>Token</code> | the entity to mark defeated |
| options.markDefeated | <code>Boolean</code> | an optional state flag (default=true) |

<a name="EnhancedConditions.activateConviction"></a>

### EnhancedConditions.activateConviction()
**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
<a name="EnhancedConditions.deactivateConviction"></a>

### EnhancedConditions.deactivateConviction()
**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
<a name="EnhancedConditions.removeOtherConditions"></a>

### EnhancedConditions.removeOtherConditions(entity, conditionId)
For a given entity, removes conditions other than the one supplied

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type |
| --- | --- |
| entity | <code>\*</code> | 
| conditionId | <code>\*</code> | 

<a name="EnhancedConditions._processMacros"></a>

### EnhancedConditions.\_processMacros(macroIds, entity)
Process macros based on given Ids

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type | Default |
| --- | --- | --- |
| macroIds | <code>\*</code> |  | 
| entity | <code>\*</code> | <code></code> | 

<a name="EnhancedConditions.updateConditionTimestamps"></a>

### EnhancedConditions.updateConditionTimestamps()
Update condition added/removed timestamps

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
<a name="EnhancedConditions._createLabButton"></a>

### EnhancedConditions.\_createLabButton(html)
Creates a button for the Condition Lab

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type | Description |
| --- | --- | --- |
| html | <code>Object</code> | the html element where the button will be created |

<a name="EnhancedConditions._toggleLabButtonVisibility"></a>

### EnhancedConditions.\_toggleLabButtonVisibility(display)
Determines whether to display the combat utility belt div in the settings sidebar

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
**Todo:**: extract to helper in sidekick class?  

| Param | Type |
| --- | --- |
| display | <code>Boolean</code> | 

<a name="EnhancedConditions._loadDefaultMap"></a>

### EnhancedConditions.\_loadDefaultMap()
Returns the default maps supplied with the module

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
**Todo:**: map to entryId and then rebuild on import  
<a name="EnhancedConditions._prepareMap"></a>

### EnhancedConditions.\_prepareMap(conditionMap)
Parse the provided Condition Map and prepare it for storage, validating and correcting bad or missing data where possible

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type |
| --- | --- |
| conditionMap | <code>\*</code> | 

<a name="EnhancedConditions._backupCoreEffects"></a>

### EnhancedConditions.\_backupCoreEffects()
Duplicate the core status icons, freeze the duplicate then store a copy in settings

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
<a name="EnhancedConditions._backupCoreSpecialStatusEffects"></a>

### EnhancedConditions.\_backupCoreSpecialStatusEffects()
Duplicate the core special status effect mappings, freeze the duplicate then store a copy in settings

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
<a name="EnhancedConditions.lookupConditionById"></a>

### EnhancedConditions.lookupConditionById(conditionId, map)
Gets one or more conditions from the map by their name

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| conditionId | <code>String</code> |  | the condition to get |
| map | <code>Array</code> | <code></code> | the condition map to search |

<a name="EnhancedConditions._updateStatusEffects"></a>

### EnhancedConditions.\_updateStatusEffects(conditionMap)
Updates the CONFIG.statusEffect effects with Condition Map ones

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type |
| --- | --- |
| conditionMap | <code>\*</code> | 

<a name="EnhancedConditions._prepareStatusEffects"></a>

### EnhancedConditions.\_prepareStatusEffects(conditionMap) ⇒ <code>Array</code>
Converts the given Condition Map (one or more Conditions) into a Status Effects array or object

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
**Returns**: <code>Array</code> - statusEffects  

| Param | Type |
| --- | --- |
| conditionMap | <code>Array</code> \| <code>Object</code> | 

<a name="EnhancedConditions._prepareActiveEffects"></a>

### EnhancedConditions.\_prepareActiveEffects(effects)
Prepares one or more ActiveEffects from Conditions for placement on an actor

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type | Description |
| --- | --- | --- |
| effects | <code>Object</code> \| <code>Array</code> | a single ActiveEffect data object or an array of ActiveEffect data objects |

<a name="EnhancedConditions.getConditionIcons"></a>

### EnhancedConditions.getConditionIcons()
Returns just the icon side of the map

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
<a name="EnhancedConditions.getIconsByCondition"></a>

### EnhancedConditions.getIconsByCondition(condition)
Retrieves a condition icon by its mapped name

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type |
| --- | --- |
| condition | <code>\*</code> | 

<a name="EnhancedConditions.getConditionsByIcon"></a>

### EnhancedConditions.getConditionsByIcon(icon)
Retrieves a condition name by its mapped icon

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type |
| --- | --- |
| icon | <code>\*</code> | 

<a name="EnhancedConditions.mapFromJson"></a>

### EnhancedConditions.mapFromJson(json)
Parses a condition map JSON and returns a map

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  

| Param | Type |
| --- | --- |
| json | <code>\*</code> | 

<a name="EnhancedConditions.getDefaultMap"></a>

### EnhancedConditions.getDefaultMap()
Returns the default condition map for a given system

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
<a name="EnhancedConditions.buildDefaultMap"></a>

### EnhancedConditions.buildDefaultMap()
Builds a default map for a given system

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
**Todo**

- [ ] #281 update for active effects

<a name="EnhancedConditions.updateConditionMapFromDefaults"></a>

### EnhancedConditions.updateConditionMapFromDefaults()
Updates the condition map to include any changes from the default map and system settingsIf the user has made their own changes to a condition, the condition in the default map will be ignored

**Kind**: static method of [<code>EnhancedConditions</code>](#EnhancedConditions)  
<a name="Sidekick"></a>

## Sidekick
Provides helper methods for use elsewhere in the module (and has your back in a melee)

**Kind**: global class  

* [Sidekick](#Sidekick)
    * [.createSUCCDiv(html)](#Sidekick.createSUCCDiv)
    * [.getSetting(key)](#Sidekick.getSetting) ⇒ <code>Object</code>
    * [.getAllSettings()](#Sidekick.getAllSettings) ⇒ <code>Array</code>
    * [.setSetting(key, value, awaitResult)](#Sidekick.setSetting) ⇒ <code>Promise</code> \| <code>ClientSetting</code>
    * [.registerSetting(key, metadata)](#Sidekick.registerSetting) ⇒ <code>ClientSettings.register</code>
    * [.registerMenu(key, metadata)](#Sidekick.registerMenu) ⇒ <code>ClientSettings.registerMenu</code>
    * [.registerAllSettings(settingsData)](#Sidekick.registerAllSettings) ⇒ <code>Array</code>
    * [.fetchJsons(source, path)](#Sidekick.fetchJsons)
    * [.fetchJson(file)](#Sidekick.fetchJson) ⇒
    * [.validateObject(object)](#Sidekick.validateObject) ⇒ <code>Boolean</code>
    * [.convertMapToArray(map)](#Sidekick.convertMapToArray)
    * [.getKeyByValue(object, value)](#Sidekick.getKeyByValue)
    * [.getInverseMap()](#Sidekick.getInverseMap)
    * [.handlebarsHelpers()](#Sidekick.handlebarsHelpers)
    * [.jQueryHelpers()](#Sidekick.jQueryHelpers)
    * [.getTerms(arr)](#Sidekick.getTerms)
    * [.escapeRegExp(string)](#Sidekick.escapeRegExp) ⇒ <code>String</code>
    * [.coerceType(target, type)](#Sidekick.coerceType) ⇒ <code>\*</code>
    * [.buildFormData(FD)](#Sidekick.buildFormData)
    * [.createId(existingIds)](#Sidekick.createId)
    * [.toTitleCase(string)](#Sidekick.toTitleCase)
    * [.replaceOnDocument(pattern, string, param2)](#Sidekick.replaceOnDocument)
    * [.getTextNodesIn(el)](#Sidekick.getTextNodesIn) ⇒ <code>jQuery</code>
    * [.generateUniqueSlugId(string, idList)](#Sidekick.generateUniqueSlugId)
    * [.getNameFromFilePath(path)](#Sidekick.getNameFromFilePath) ⇒ <code>String</code>
    * [.getFirstGM()](#Sidekick.getFirstGM) ⇒ <code>GM</code> \| <code>null</code>
    * [.isFirstGM()](#Sidekick.isFirstGM) ⇒ <code>Boolean</code>
    * [.getActorFromUuid(uuid)](#Sidekick.getActorFromUuid)
    * [.findArrayDuplicates(arrayToCheck, filterProperty)](#Sidekick.findArrayDuplicates) ⇒ <code>Array</code>
    * [.identifyArrayDuplicatesByProperty(arrayToCheck, filterProperty)](#Sidekick.identifyArrayDuplicatesByProperty) ⇒ <code>Boolean</code>
    * [.loadTemplates()](#Sidekick.loadTemplates)
    * [.getDocumentOwners(document)](#Sidekick.getDocumentOwners) ⇒ <code>Array</code>
    * [.toCamelCase(string, delimiter)](#Sidekick.toCamelCase) ⇒
    * [.shallowCompare()](#Sidekick.shallowCompare)
    * [.getTraitOptions(actor)](#Sidekick.getTraitOptions)
    * [.getLocalizedAttributeName(actor)](#Sidekick.getLocalizedAttributeName)
    * [.sortSkills(allSkills)](#Sidekick.sortSkills)
    * [.getOptionBySpecialStatusEffect(option)](#Sidekick.getOptionBySpecialStatusEffect) ⇒ <code>String</code>

<a name="Sidekick.createSUCCDiv"></a>

### Sidekick.createSUCCDiv(html)
Creates the SUCC div in the Sidebar

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| html | <code>\*</code> | 

<a name="Sidekick.getSetting"></a>

### Sidekick.getSetting(key) ⇒ <code>Object</code>
Get a single setting using the provided key

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
**Returns**: <code>Object</code> - setting  

| Param | Type |
| --- | --- |
| key | <code>\*</code> | 

<a name="Sidekick.getAllSettings"></a>

### Sidekick.getAllSettings() ⇒ <code>Array</code>
Get all SUCC settings

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
**Returns**: <code>Array</code> - settings  
<a name="Sidekick.setSetting"></a>

### Sidekick.setSetting(key, value, awaitResult) ⇒ <code>Promise</code> \| <code>ClientSetting</code>
Sets a single game setting

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type | Default |
| --- | --- | --- |
| key | <code>\*</code> |  | 
| value | <code>\*</code> |  | 
| awaitResult | <code>\*</code> | <code>false</code> | 

<a name="Sidekick.registerSetting"></a>

### Sidekick.registerSetting(key, metadata) ⇒ <code>ClientSettings.register</code>
Register a single setting using the provided key and setting data

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| key | <code>\*</code> | 
| metadata | <code>\*</code> | 

<a name="Sidekick.registerMenu"></a>

### Sidekick.registerMenu(key, metadata) ⇒ <code>ClientSettings.registerMenu</code>
Register a menu setting using the provided key and setting data

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| key | <code>\*</code> | 
| metadata | <code>\*</code> | 

<a name="Sidekick.registerAllSettings"></a>

### Sidekick.registerAllSettings(settingsData) ⇒ <code>Array</code>
Register all provided setting data

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| settingsData | <code>\*</code> | 

<a name="Sidekick.fetchJsons"></a>

### Sidekick.fetchJsons(source, path)
Use FilePicker to browse then Fetch one or more JSONs and return them

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| source | <code>\*</code> | 
| path | <code>\*</code> | 

<a name="Sidekick.fetchJson"></a>

### Sidekick.fetchJson(file) ⇒
Fetch a JSON from a given file

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
**Returns**: JSON | null  

| Param | Type |
| --- | --- |
| file | <code>File</code> | 

<a name="Sidekick.validateObject"></a>

### Sidekick.validateObject(object) ⇒ <code>Boolean</code>
Validate that an object is actually an object

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| object | <code>Object</code> | 

<a name="Sidekick.convertMapToArray"></a>

### Sidekick.convertMapToArray(map)
Convert any ES6 Maps/Sets to objects for settings use

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| map | <code>Map</code> | 

<a name="Sidekick.getKeyByValue"></a>

### Sidekick.getKeyByValue(object, value)
Retrieves a key using the given value

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type | Description |
| --- | --- | --- |
| object | <code>Object</code> | - the object that contains the key/value |
| value | <code>\*</code> |  |

<a name="Sidekick.getInverseMap"></a>

### Sidekick.getInverseMap()
Inverts the key and value in a map

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
**Todo:**: rework  
<a name="Sidekick.handlebarsHelpers"></a>

### Sidekick.handlebarsHelpers()
Adds additional handlebars helpers

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
<a name="Sidekick.jQueryHelpers"></a>

### Sidekick.jQueryHelpers()
Adds additional jquery helpers

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
<a name="Sidekick.getTerms"></a>

### Sidekick.getTerms(arr)
Takes an array of terms (eg. name parts) and returns groups of neighbouring terms

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| arr | <code>\*</code> | 

<a name="Sidekick.escapeRegExp"></a>

### Sidekick.escapeRegExp(string) ⇒ <code>String</code>
Escapes regex special chars

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
**Returns**: <code>String</code> - escapedString  

| Param | Type |
| --- | --- |
| string | <code>String</code> | 

<a name="Sidekick.coerceType"></a>

### Sidekick.coerceType(target, type) ⇒ <code>\*</code>
Attempts to coerce a target value into the exemplar's type

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
**Returns**: <code>\*</code> - coercedValue  

| Param | Type |
| --- | --- |
| target | <code>\*</code> | 
| type | <code>\*</code> | 

<a name="Sidekick.buildFormData"></a>

### Sidekick.buildFormData(FD)
Builds a FD returned from FormDataExtended into a formData arrayBorrowed from foundry.js

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| FD | <code>\*</code> | 

<a name="Sidekick.createId"></a>

### Sidekick.createId(existingIds)
Get a random unique Id, checking an optional supplied array of ids for a match

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| existingIds | <code>\*</code> | 

<a name="Sidekick.toTitleCase"></a>

### Sidekick.toTitleCase(string)
Sets a string to Title Case

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| string | <code>\*</code> | 

<a name="Sidekick.replaceOnDocument"></a>

### Sidekick.replaceOnDocument(pattern, string, param2)
Parses HTML and replaces instances of a matched pattern

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| pattern | <code>\*</code> | 
| string | <code>\*</code> | 
| param2 | <code>\*</code> | 

<a name="Sidekick.getTextNodesIn"></a>

### Sidekick.getTextNodesIn(el) ⇒ <code>jQuery</code>
Get text nodes in a given element

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| el | <code>\*</code> | 

<a name="Sidekick.generateUniqueSlugId"></a>

### Sidekick.generateUniqueSlugId(string, idList)
For a given string generate a slug, optionally checking a list of existing Ids for uniqueness

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| string | <code>\*</code> | 
| idList | <code>\*</code> | 

<a name="Sidekick.getNameFromFilePath"></a>

### Sidekick.getNameFromFilePath(path) ⇒ <code>String</code>
For a given file path, find the filename and then apply title case

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| path | <code>String</code> | 

<a name="Sidekick.getFirstGM"></a>

### Sidekick.getFirstGM() ⇒ <code>GM</code> \| <code>null</code>
Gets the first GM user

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
**Returns**: <code>GM</code> \| <code>null</code> - a GM object or null if none found  
<a name="Sidekick.isFirstGM"></a>

### Sidekick.isFirstGM() ⇒ <code>Boolean</code>
Checks if the current user is the first active GM

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
<a name="Sidekick.getActorFromUuid"></a>

### Sidekick.getActorFromUuid(uuid)
Gets an Actor from an Actor or Token UUID

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| uuid | <code>\*</code> | 

<a name="Sidekick.findArrayDuplicates"></a>

### Sidekick.findArrayDuplicates(arrayToCheck, filterProperty) ⇒ <code>Array</code>
Filters an array down to just its duplicate elements based on the property specified

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| arrayToCheck | <code>\*</code> | 
| filterProperty | <code>\*</code> | 

<a name="Sidekick.identifyArrayDuplicatesByProperty"></a>

### Sidekick.identifyArrayDuplicatesByProperty(arrayToCheck, filterProperty) ⇒ <code>Boolean</code>
Returns true for each array element that is a duplicate based on the property specified

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| arrayToCheck | <code>\*</code> | 
| filterProperty | <code>\*</code> | 

<a name="Sidekick.loadTemplates"></a>

### Sidekick.loadTemplates()
Loads templates for partials

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
<a name="Sidekick.getDocumentOwners"></a>

### Sidekick.getDocumentOwners(document) ⇒ <code>Array</code>
Retrieves all the owners of a given document

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| document | <code>\*</code> | 

<a name="Sidekick.toCamelCase"></a>

### Sidekick.toCamelCase(string, delimiter) ⇒
Converts the given string to camelCase using the provided delimiter to break up words

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
**Returns**: the converted string  

| Param | Type |
| --- | --- |
| string | <code>String</code> | 
| delimiter | <code>String</code> | 

**Example**  
```js
Sidekick.toCamelCase("my-cool-string", "-") // returns "myCoolString"
```
<a name="Sidekick.shallowCompare"></a>

### Sidekick.shallowCompare()
Compares all the keys within two objectsReturns true if the objects matchThis function is not recursive so if either object contains objects, the check will return false even if the values match

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
<a name="Sidekick.getTraitOptions"></a>

### Sidekick.getTraitOptions(actor)
Creates an array with the full list of traits for a given actor

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| actor | <code>Actor</code> | 

<a name="Sidekick.getLocalizedAttributeName"></a>

### Sidekick.getLocalizedAttributeName(actor)
Returns the localized string for a given attribute

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type |
| --- | --- |
| actor | <code>Actor</code> | 

<a name="Sidekick.sortSkills"></a>

### Sidekick.sortSkills(allSkills)
Sorts a list of skills

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  

| Param | Type | Description |
| --- | --- | --- |
| allSkills | <code>\*</code> | List of skills to be sorted |

<a name="Sidekick.getOptionBySpecialStatusEffect"></a>

### Sidekick.getOptionBySpecialStatusEffect(option) ⇒ <code>String</code>
Get the enum for a special status effect in Foundry based on the option name

**Kind**: static method of [<code>Sidekick</code>](#Sidekick)  
**Returns**: <code>String</code> - enum for the special status effect  

| Param | Type |
| --- | --- |
| option | <code>\*</code> | 

<a name="Signal"></a>

## Signal
Initiates module classes (and shines a light on the dark night sky)

**Kind**: global class  
<a name="Signal.lightUp"></a>

### Signal.lightUp()
Registers hooks

**Kind**: static method of [<code>Signal</code>](#Signal)  
<a name="defaultOptions"></a>

## defaultOptions
defaultOptions

**Kind**: global variable  
<a name="defaultOptions"></a>

## defaultOptions
defaultOptions

**Kind**: global variable  
<a name="getData"></a>

## getData() ⇒ <code>Object</code>
Gets data for template rendering

**Kind**: global function  
**Returns**: <code>Object</code> - data  
<a name="_updateObject"></a>

## \_updateObject(event, formData)
Update Object on Form Submission

**Kind**: global function  

| Param | Type |
| --- | --- |
| event | <code>\*</code> | 
| formData | <code>\*</code> | 

<a name="getData"></a>

## getData() ⇒ <code>Object</code>
Gets data for template rendering

**Kind**: global function  
**Returns**: <code>Object</code> - data  
<a name="activateListeners"></a>

## activateListeners(html)
Application listeners

**Kind**: global function  

| Param | Type |
| --- | --- |
| html | <code>jQuery</code> | 

<a name="_onCheckboxChange"></a>

## \_onCheckboxChange(event)
Checkbox change event handler

**Kind**: global function  

| Param | Type |
| --- | --- |
| event | <code>\*</code> | 

<a name="_onSpecialStatusEffectToggle"></a>

## \_onSpecialStatusEffectToggle(event)
Special Status Effect toggle handler

**Kind**: global function  

| Param | Type |
| --- | --- |
| event | <code>\*</code> | 

<a name="_updateObject"></a>

## \_updateObject(event, formData)
Update Object on Form Submission

**Kind**: global function  

| Param | Type |
| --- | --- |
| event | <code>\*</code> | 
| formData | <code>\*</code> | 

<a name="getSpecialStatusEffectByField"></a>

## getSpecialStatusEffectByField(field) ⇒ <code>String</code>
Get the enum for a special status effect in Foundry based on the field name

**Kind**: global function  
**Returns**: <code>String</code> - enum for the special status effect  

| Param | Type |
| --- | --- |
| field | <code>\*</code> | 

<a name="setSpecialStatusEffectMapping"></a>

## setSpecialStatusEffectMapping(effect, conditionId)
Sets the special status effect to the provided condition Id

**Kind**: global function  

| Param | Type | Default |
| --- | --- | --- |
| effect | <code>\*</code> |  | 
| conditionId | <code>\*</code> | <code></code> | 

<a name="getData"></a>

## getData(options)
Get data for template rendering

**Kind**: global function  

| Param | Type |
| --- | --- |
| options | <code>\*</code> | 

<a name="_updateObject"></a>

## \_updateObject(formData)
Override default update object behaviour

**Kind**: global function  

| Param | Type |
| --- | --- |
| formData | <code>\*</code> | 

