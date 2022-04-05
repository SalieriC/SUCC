# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]  
### Fixed
- Fixed non-GMs trying to edit tokens when applying mark dead after becoming incapacitated.  

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
