import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js"
import { EnhancedConditionsAPI } from "./enhanced-conditions-api.js";


export class SUCCTokenActionHud {

    static hasValidTokenActionHudVersion() {
        let tahModule = game.modules.get("token-action-hud-core");
        
        const minVersion = "2.0.6";
        return tahModule && (tahModule.version == minVersion || foundry.utils.isNewerVersion(tahModule.version, minVersion));
    }

    static createTokenActionHudClasses(module) {
        game.succ.SUCCActionHandlerExtender = class SUCCActionHandlerExtender extends module.api.ActionHandlerExtender {
            constructor(actionHandler) {
                super(actionHandler)
                this.actionHandler = actionHandler;
                this.actor = this.actionHandler.actor;
                this.token = this.actionHandler.token;
            }

            /**
             * @override
             */
            extendActionHandler() {
                // Update actor and token with current action handler context
                this.actor = this.actionHandler.actor;
                this.token = this.actionHandler.token;

                let actionsData = [];

                if (this.actor) {
                    let conditionMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map);
                    for (let condition of conditionMap) {
                        const encodedValue = [BUTLER.NAME, condition.id].join(this.actionHandler.delimiter);
    
                        actionsData.push({
                            id: condition.id,
                            name: game.i18n.localize(condition.name),
                            img: condition.img,
                            cssClass: this.actor.statuses.has(condition.id) ? "toggle active" : "toggle",
                            encodedValue: encodedValue,
                        });
                    }
                }

                this.actionHandler.addActions(actionsData, { id: BUTLER.NAME, type: 'system' })
            }
        }

        game.succ.SUCCRollHandlerExtender = class SUCCRollHandlerExtender extends module.api.RollHandlerExtender {
            /** @override */
            handleActionClick(event, encodedValue, actionHandler) {
                // Update variables with current action context
                const payload = encodedValue.split(this.delimiter);

                if (payload.length !== 2) return false;

                const actionType = payload[0];
                const actionId = payload[1];

                if (actionType !== BUTLER.NAME) return false;

                let options = {};
                options.forceOverlay = actionHandler.isRightClick;
                options.allowDuplicates = actionHandler.isShift;
                
                if (!options.allowDuplicates && EnhancedConditionsAPI.hasCondition(actionId, actionHandler.actor)) {
                    EnhancedConditionsAPI.removeCondition(actionId, actionHandler.actor);
                }else {    
                    EnhancedConditionsAPI.addCondition(actionId, actionHandler.actor, options);
                }

                return true;
            }
        }
    }

    static registerDefaults(defaults) {
        defaults.groups.push({
            id: BUTLER.NAME,
            name: BUTLER.SHORT_TITLE,
            listName: "Group: SUCC",
            type: "system"
        });
    }
}