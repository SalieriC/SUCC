# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
☮️ Peace in the world, or the world in pieces. 🕊️

## [3.0.0] - 2024-03-24 aka "Open the flood gates!"
### Added
- `game.succ.toggleCondition()` to toggle a condition on or off.
- Added several new optional conditions for various powers, modifiers, etc. from core and some official settings.
- - These can be easily added/removed to the Condition Lab from the game settings of SUCC.
- Added a new setting to add/remove the new conditions to the Condition Lab.
- Added several icons for the new conditions.
- Added an option that allows a condition to be automatically added to actors that exceed their carry limit.
- - This will only work if 1) a single condition has this option (set in the Condition Lab) and 2) the 'Apply Encumbrance Penalties' in the SWADE system settings is enabled.
- - This will also respect a setting in BRSW regarding encumbrance penalties for NPCs. If NPCs ignore Encumbrance penalties as per this setting, NPCs will not get the above defined condition.
- - This condition is added and removed automatically when carry weight changes which *could* cause slight lag. In our testing we didn't notice any decrease in performance however. 
### Fixed
- Fixed a bug that caused the api to not create a requested overlay.

## [2.4.0] - 2024-02-25 aka "A condition not based on the rules"
### Added
- Added support for the new defeated condition.
### Fixed
- Fixed a bug that prevented deletion of default conditions.
- Fixed the default mapping for SWPF.

## [2.3.0] - 2024-01-20 aka "Enduring Effects"
### Added
- Conviction will now prompt to end at start of round.
- Duration can be passed to `game.succ.addContition` now. The full syntax is as follows:
```js
game.succ.addCondition(status_name, target, {allowDuplicates: allowDuplicates, forceOverlay: overlay, effectOptions: additionalData, duration:duration});
```

## [2.2.0] - 2023-10-15 aka "Long time no see"
### Added
- Added trait / weapon name to Boost/Lower and Smite functions to make it clear what they are affecting. This does not allow for multiple instances of said conditions on the same actor.
- Started Documentation.
- Added support for "cold bodied" status to the condition lab and specifically the cold bodied condition. If that still doesn't work for you please check that it is enabled in the condition lab by opening the settings for the condition. Default mappings should be updated automatically.
- Automatic update functionality that automatically gets newly added or changed conditions from the SWADE system unless overwritten by the user. In case of new conditions you'll see the system icons until SUCC is updated.
### Changed
- Cleaned up the localisation files.
### Removed
- System update flow as it is automatic now.

## [2.1.0] - 2023-07-02 aka "A condition no one ever wanted"
### Added
- Wild Attack icon and effect to the condition lab.
- Allow editing the description on active effects.
- Hook once the SUCC API is ready (`succReady`).
### Changed
- `addCondition` now returns an array of added and changed effects instead of just the updates.
- Updated default condition map for SWADE 3.0.4.
### Removed
- Removed the special case handling of prone now that it's handled by core.
### Fixed
- Fixed bugs with v11.
- Fixed bugs with the system update.

## [2.0.0] - 2023-05-28 aka "V11 came too soon"
### Added
- FVTT v11 compatibility.
### Fixed
- A bug when applying Incapacitation on FVTT v11 and compatible SWADE version.

## [1.0.0] - 2023-05-28 aka "One PR to rule them all"
### Added
- Added CUB as a baseline to build SUCC around it for what now is a full release.
- New icons for added conditions.
- Loads of new features, some from CUB, others specifically made for SUCC and tailored for SWADE games.
- As a result, the users are now able to set up exactly the conditions they want and configure them to suit their needs.
- New API. Devs are advised to migrate to the new API, the old one is still there and nothing should break but this can't be guaranteed for future updates.
### Deprecated
- Old json input for customising conditions as the condition lab is much more user-friendly.

## [0.2.7] - 2023-03-25 aka "Convicted to do a hotfix"
### Added
- Blind condition icon and default mapping.
### Fixed
- Fixed a bug that caused Conviction to be added multiple times.
- Fixed a bug that caused forced conditions to not get updated properly.

## [0.2.6] - 2022-11-07 aka "Things you'll never notice."
### Added
- Cold Bodied to the default mapping (and thus chat output) and an icon that is in line with the rest of SUCCs icons.
### Changed
- Effect Builder Dialogues for boost/lower now sort skills alphabetically.
- SUCC now uses the `actor.toggleConviction()` function of SWADE v. 2.1.0 instead of recreating it.
- SUCC now lets the system figure out the proper values for boost/lower in case of going above a d12 / below a d4.

## [0.2.5] - 2022-11-07 aka "Exporting bugs since 2022."
### Fixed
- Fixed Effect Builder (Protection, Smite, Boost/Lower Trait) not functioning due to missing import.

## [0.2.4] - 2022-11-05 aka "Convicted to eternal maintenance."
### Added
- Conviction condition if the systems setting is enabled.
- Toggling conviction (as condition or from the character sheet) (de-)activates both, condition and conviction and deducts one conviction token.
- Added Bleeding Out callback function removal to the option that disables callback functions.
### Changed
- Refactored init.js
- Translation key `SUCC.setting.disable_status_dialogue` was changed.
- SWPF Journal Links to conditions for the chat messages.

## [0.2.3] - 2022-11-03 aka "Little without 'Many' and 'Mickle'."
### Added
- Added hesitant effect to frightened condition.

## [0.2.2] - 2022-10-28 aka "Getting ready for SWIM."
### Added
- Proper changes to Fighting and Parry on the Prone status effect.
### Changed
- The additional data for the `apply_status` function now accepts a new property (`force`). It allows devs to apply the same condition multiple times as active effects. [See the Wiki on details how it works.](https://github.com/SalieriC/SUCC/wiki/SUCC-API#the-force-property)

## [0.2.1] - 2022-10-21 aka "A job half done."
### Changed
- **Potetntially breaking:** Changed the `apply_status()` function so that it renews effects if they are already applied. This means that your code now needs be aware of applied status effects and don't apply them if already active unless you want to renew it.
- Journal Links to conditions for the chat messages (SWADE core rules only, SWPF still needs to be done).

## [0.2.0] - 2022-10-05 aka "Javier doing everything, Sal doing nothing."
### Changed
- Updated the module to be v10 compatible.

## [0.1.0] - 2022-07-26 aka "...and now, for the grand reveal!"
### Added
- The Drop condition.
- Chat output on applying conditions merge into a single chat message when multiple conditions are applied/removed.
- Translation update via weblate (german).

## [0.1.0-pre.9] - 2022-05-27
### Added
- New setting to disable the dialogue to remove shaken and stunned, making removal rolls from Modules like SWIM and BR2 more viable.

## [0.1.0-pre.8] - 2022-05-21
### Fixed
- A small error in the effect changer that caused it to not get the correct data.

## [0.1.0-pre.7] - 2022-05-07
### Added
- Support for calling the builders using script with predefined values, bypassing the dalogues in the process. This also allows to apply the effects to multiple tokens at once.  
- - The builders also accept additional changes to incorporate changes of your choice in addition to their usual changes.
- - The builders accept flags as well, see documentation and only use if you have to and know what you're doing.
- Documentation updates in the API detailing the above feature.
- Apply and toggle status functions now return the applied condition.
- The add and toggle functions now can take a boolean variable to make an overlay instead of the small icon.

## [0.1.0-pre.6] - 2022-04-16
### Added
- Status Definition strings to de.json and typos (@Razortide)
### Fixed
- Fixed non-GMs trying to edit tokens when applying mark dead after becoming incapacitated.
- Correct compendium links for Pathfinder statuses (@samuelboland)  


## [0.1.0-pre.5] - 2022-03-28
**Make peace please!**
### Added
- Boost/Lower Trait conditions and builder dialogues to apply the effects. Tries to respect all the rules as per SWADE.  
- German translation update by @Razortide.
### Fixed
- Mark Dead was applied on Incapacitation to all combatants with the same actor, this should now be fixed.

## [0.1.0-pre.4] - 2022-03-24
**Make peace please!**
### Added
- New setting to mark NPCs as defeated if Incapacitated is applied to them.
- German localisation by @Razortide.
- Functionality to change conditions in any way the user would like. For now this requires in-depth knowledge (or a template). It will be well documented later.
### Fixed
- The current version of the core rules did not fix the links. SUCC now displays the correct ones until they either fix it in the next update or they don't and it breaks SUCC again.
- Broken SWPF links by @nchiasson.

## [0.1.0-pre.3] - 2022-02-26
**Make peace please!**
### Added
- A warning message was added when applying *smite* to an actor or token without weapons. The condition is still applied, but no dialogue to add the effect to a weapon is prompted. This caused confusion which is why I added the warning.
### Fixed
- Fixed a bug where smite and protection couldn't be applied to unlinked tokens.
- Fixed a bug that caused multiple chat messages and issued a warning to players that they have no permission to create chat messages. SUCC now handles the chat messages completely on the GMs side. A GM account logged in is thus required to make the chat messages work. (Might not even be the worst thing to do, like this players testing around don't fill the chat.)

## [0.1.0-pre.2] - 2022-02-25
**Make peace please!**
### Added
- Smite Builder: When applying the Smite condition, a dialogue is prompted that allows the player to select a weapon and a number. The AE will then be set up to add the number to the weapons damage modifier. It also sets the duration to 5 and prompts a dialogue asking to remove it after it expires.
- Protection Builder: When applying the Protection condition, a dialogue is prompted, that allows the player to select a number. The AE will then be set up to add that number as armour or toughness (users choice) (expiration and duration works but is already handled by the system).

## [0.1.0-pre] - 2022-02-15
### Added
- Pre-Release with the most basic functionality.
