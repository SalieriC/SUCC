# SUCC - SWADE Ultimate Condition Changer
<p align="center"> <img src="https://raw.githubusercontent.com/SalieriC/SUCC/refs/heads/main/documentation/assets/succ-header-new.webp" style="width: 900px; height: auto;"> </p>

This module is meant to change the condition icons and effects in the SWADE system (v.1+) on Foundry VTT. SUCC is based on [Combat Utility Belt](https://github.com/death-save/combat-utility-belt) but specifically tailored for the SWADE system which allows maximum support and compatibility for players and game masters on that system without the need to ignore any incompatible features found on CUB. We can also react more quickly to changes made in the system. It provides many of the features found in CUB (such as the condition lab which enables game masters to customise existing conditions and set up their own). SUCC also provides a strong API other developers can use within their modules.

## Mentions & Credits
### Chat messages & code base
The style (CSS) and part of the template (HBS) for the condition to chat messages are used from [Combat Utility Belt](https://github.com/death-save/combat-utility-belt) (CUB) with kind permission from errational. The Condition Lab and underlying code base was also taken from CUB which is in line with its license.
Great thanks go to @ddbrown30 for all his work and his patience. Without him SUCC wouldn't be as user friendly and powerful as it is today. He basically took CUB as a base and rebuilt SUCC on that to bring over as many features from CUB as possible without loosing any of SUCCs own functionality it had at that point.
### Icons
The icons are modified icons used from [game-icons.net](https://game-icons.net/), modified in [photopea.com](https://www.photopea.com/).
- Intoxicated: [Poison Bottle by Lorc](https://game-icons.net/1x1/lorc/poison-bottle.html)
- Irradiated: [Radioactive by Lorc](https://game-icons.net/1x1/lorc/radioactive.html)
- Shaken: [Pummeled by Lorc](https://game-icons.net/1x1/lorc/pummeled.html)
- Aiming: [Archery Target by Lorc](https://game-icons.net/1x1/lorc/archery-target.html)
- Berserking: [Enraged by Delapouite](https://game-icons.net/1x1/delapouite/enrage.html)
- Defending: [Arrows Shield by Lorc](https://game-icons.net/1x1/lorc/arrows-shield.html)
- Flying: [Feathered Wing by Lorc](https://game-icons.net/1x1/lorc/feathered-wing.html)
- Holding: [Empty Hourglass by Lorc](https://game-icons.net/1x1/lorc/empty-hourglass.html)
- Bound: [Handcuffed by Delapouite](https://game-icons.net/1x1/delapouite/handcuffed.html)
- Entangled: [Daemon Pull by Delapoutite](https://game-icons.net/1x1/delapouite/daemon-pull.html)
- Frightened: [Screaming by Lorc](https://game-icons.net/1x1/lorc/screaming.html)
- Distracted: [Distraction by DarkZaitzev](https://game-icons.net/1x1/darkzaitzev/distraction.html)
- Encumbered: [Light Backpack by Delapoutite](https://game-icons.net/1x1/delapouite/light-backpack.html)
- Out of Control: [City Car by Delapoutite](https://game-icons.net/1x1/delapouite/city-car.html)
- Prone: [Oppression by Lorc](https://game-icons.net/1x1/lorc/oppression.html)
- Stunned: [Knockout by Skoll](https://game-icons.net/1x1/skoll/knockout.html)
- The Drop: [Target Dummy by Lorc](https://game-icons.net/1x1/lorc/target-dummy.html)
- Vulnerable: [On Sight by Darkzaitzev](https://game-icons.net/1x1/darkzaitzev/on-sight.html)
- Bleeding Out: [Heart by Skoll](https://game-icons.net/1x1/skoll/hearts.html) and [Drop by Lorc](https://game-icons.net/1x1/lorc/drop.html)
- Diseased: [Virus by Lorc](https://game-icons.net/1x1/lorc/virus.html)
- Heart Attack: [Heart Beats by Delapoutite](https://game-icons.net/1x1/delapouite/heart-beats.html)
- Incapacitated: [Dead Head by Delapoutite](https://game-icons.net/1x1/delapouite/dead-head.html)
- On Fire: [Flame by Carl Olsen](https://game-icons.net/1x1/carl-olsen/flame.html)
- Poisoned: [Drop by Lorc](https://game-icons.net/1x1/lorc/drop.html) and [Skull Crossed Bones by Lorc](https://game-icons.net/1x1/lorc/skull-crossed-bones.html)
- Wrecked: [Ship Wreck by Delapoutite](https://game-icons.net/1x1/delapouite/ship-wreck.html)
- Cover: [Wooden Crate by Delapoutite](https://game-icons.net/1x1/delapouite/wooden-crate.html) and [Person by Delapoutite](https://game-icons.net/1x1/delapouite/person.html)
- Shield: [Shield by sbed](https://game-icons.net/1x1/sbed/shield.html) and [Person by Delapoutite](https://game-icons.net/1x1/delapouite/person.html)
- Reach: [Arrowhead by Lorc](https://game-icons.net/1x1/lorc/arrowhead.html)
- Torch: [Primitive Torch by Delapoutite](https://game-icons.net/1x1/delapouite/primitive-torch.html)
- Boost: [Mighty Force by Delapoutite](https://game-icons.net/1x1/delapouite/mighty-force.html)
- Invisible: [Invisible by Delapoutite](https://game-icons.net/1x1/delapouite/invisible.html)
- Lower: [Oppression by Lorc](https://game-icons.net/1x1/lorc/oppression.html)
- Protection: [Lamellar by Lorc](https://game-icons.net/1x1/lorc/lamellar.html)
- Smite: [Pointy Sword by Lorc](https://game-icons.net/1x1/lorc/pointy-sword.html)  
- Conviction: [Angel wings by Lorc](https://game-icons.net/1x1/lorc/angel-wings.html)  
- Cold Blooded: [Thermometer cold by Delapoutite](https://game-icons.net/1x1/delapouite/thermometer-cold.html)  
- Blind: [Sight disabled by Skoll](https://game-icons.net/1x1/skoll/sight-disabled.html)  
- Deflection: [Divert by Lorc](https://game-icons.net/1x1/lorc/divert.html)  
- Slumber: [Night sleep by Delapoutite](https://game-icons.net/1x1/delapouite/night-sleep.html)  
- Wild Attack: [Axe swing by Lorc](https://game-icons.net/1x1/lorc/axe-swing.html)  
- Deafeated: [Death skull by sbed](https://game-icons.net/1x1/sbed/death-skull.html)
- Plus: [Health normal by Sbed](https://game-icons.net/1x1/sbed/health-normal.html)
- Sloth: [Sloth by Caro Asercion](https://game-icons.net/1x1/caro-asercion/sloth.html)
- Slumber: [Night sleep by Delapouite](https://game-icons.net/1x1/delapouite/night-sleep.html)
- Speed: [Sprint by Lorc](https://game-icons.net/1x1/lorc/sprint.html)
- Wall Walker: [Gecko by Lorc](https://game-icons.net/1x1/lorc/gecko.html)
- Warriors Gift: [Master Of Arms by Lorc](https://game-icons.net/1x1/lorc/master-of-arms.html)
- Let the Devil out: [Devil mask by Delapouite](https://game-icons.net/1x1/delapouite/devil-mask.html)
- Ammo Whammy: [Silver bullet by Delapouite](https://game-icons.net/1x1/delapouite/silver-bullet.html)
- Arcane Protection: [Moebius star by Lorc](https://game-icons.net/1x1/lorc/moebius-star.html)
- Burrow: [Mole by Caro Asercion](https://game-icons.net/1x1/caro-asercion/mole.html)
- Confusion: [Misdirection by Delapouite](https://game-icons.net/1x1/delapouite/misdirection.html)
- Damage Field: [Barbed sun by Lorc](https://game-icons.net/1x1/lorc/barbed-sun.html)
- Silence: [Silenced by Delapouite](https://game-icons.net/1x1/delapouite/silenced.html)
- Elemental Manipulation: [Triple yin by Lorc](https://game-icons.net/1x1/lorc/triple-yin.html)
- Feather Fall: [Feather by Lorc](https://game-icons.net/1x1/lorc/feather.html)
- Glow: [Beams aura by Lorc](https://game-icons.net/1x1/lorc/beams-aura.html)
- Growth & Shrink: [Growth by Delapouite](https://game-icons.net/1x1/delapouite/growth.html)
- Hinder: [Snail by Lorc](https://game-icons.net/1x1/lorc/snail.html)
- Holy Symbol: [Crucifix by Delapouite](https://game-icons.net/1x1/delapouite/crucifix.html)
- Hurry: [Ostrich by Delapouite](https://game-icons.net/1x1/delapouite/ostrich.html)
- Intagibility: [Ghost ally by Lorc](https://game-icons.net/1x1/lorc/ghost-ally.html)
- Numb: [Nested hearts by Delapouite](https://game-icons.net/1x1/delapouite/nested-hearts.html)
- Puppet: [Puppet by Lorc](https://game-icons.net/1x1/lorc/puppet.html)
- Sanctuary: [Magic swirl by Lorc](https://game-icons.net/1x1/lorc/magic-swirl.html)
- Shroud: [Cultist by Lorc](https://game-icons.net/1x1/lorc/cultist.html)
- Minus: [Minus SVG Vector by SVG Repo](https://www.svgrepo.com/svg/8923/minus)
All of these icons were modified by SalieriC, their original files are published under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
### Mentions
Thank you very much to Javier Rivera Castro for his initial work that helped to get SUCC started but since moved on.  
Many thanks also go to the fine people of the Foundry VTT Discord server and their helpful advice and explanations.
Status effects circle around the token inspired by [PF2e Dorako UI](https://foundryvtt.com/packages/pf2e-dorako-ui) and [Status Halo](https://foundryvtt.com/packages/status-halo).
### Module Developers
This module is currently maintained by TheChemist (ddbrown30). Original development was made by SalieriC and Javier Rivera Castro. While Javier has since moved on, SalieriC is still involved but not actively writing code for it anymore.  
Salieri is accepting donations, so if you wish to support him financially, please head over to his Ko-fi and leave him a donation. =)  
[![Ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/salieric)
