# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]  
### Added
- New setting to mark NPCs as defeated if Incapacitated is applied to them.
- German localisation by @Razortide.
### Fixed
- The current version of the core rules did not fix the links. SUCC now displays the correct ones until they either fix it in the next update or they don't and it breaks SUCC again.

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
