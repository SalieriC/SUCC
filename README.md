# SUCC - SWADE Unlimited Condition Changer

This module is meant to change the condition icons in the SWADE system (v.1+) on Foundry VTT. It will not be customisable until we find the time to do so. For now its main purpose is to provide the features [Combat Utility Belt](https://github.com/death-save/combat-utility-belt) cannot offer to the SWADE system for the time being (since the change of how conditions work and are applied in SWADE v.1+) which I need for [SWIM](https://github.com/SalieriC/SWADE-Immersive-Macros).  
[![Ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/salieric)

## Priotisation roadmap
1. Forced (for now) custom icons for existing status effects and their AEs. ✓
2. Adding new status effects needed in SWIM. ✓
3. Adding output to chat when conditions are applied. ✓
4. Custimising Active Effects to conditions.
5. A proper GUI for customisability.

As you can see, customisability is both, low in priority but our ultimate goal. We love customisation but getting a working module done is top priority. Only if it all works as we need it to work, we can start implementing a GUI for non-devs to work with.

## Mentions & Credits
### Chat messages
The style (CSS) and part of the template (HBS) for the condition to chat messages are used from [Combat Utility Belt](https://github.com/death-save/combat-utility-belt) with kind permission from errational.
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
All of these icons were modified by SalieriC, their original files are published under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).
### Mentions
Thank you very much to Javier Rivera Castro for his tireless efforts to teach me JavaScript, CSS, HTML and HBS.  
Many thanks also go to the fine people of the Foundry VTT Discord server and their helpful advice and explanations.  
### Module Developers
This module is brought to you by SalieriC and Javier Rivera Castro.
Salieri is accepting donations, so if you wish to support him financially, please head over to his Ko-fi and leave him a donation. =)  
[![Ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/salieric)
