import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";
import { EnhancedConditionsAPI } from "./enhanced-conditions-api.js";
import EnhancedEffectConfig from "./enhanced-effect-config.js";
import EnhancedConditionMacroConfig from "./enhanced-condition-macro.js";
import EnhancedConditionOptionConfig from "./enhanced-condition-option.js";

/**
 * Form application for managing mapping of Conditions to Icons and JournalEntries
 */
export class DefaultConditionsMenu extends FormApplication {
    constructor(object, options = {}) {
        super(object, options);
        this.defaultMap = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMap);
        this.data = {};
    }

    /**
     * Get options for the form
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: BUTLER.DEFAULT_CONFIG.enhancedConditions.defaultConditionsMenu.id,
            title: BUTLER.DEFAULT_CONFIG.enhancedConditions.defaultConditionsMenu.title,
            template: BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.defaultConditionsMenu,
            tabs: [
                {
                    navSelector: '.tabs',
                    contentSelector: '.sheet-body',
                    initial: 'required-conditions',
                },
            ],
            classes: ["succ-default-conditions"],
            width: 600,
            height: 550,
            resizable: true,
        });
    }

    async getData(_) {
        const source = "data";
        const groupsJsons = await Sidekick.fetchJsons(source, BUTLER.DEFAULT_CONFIG.enhancedConditions.defaultConditionGroupsPath);
        groupsJsons.sort((a, b) => a.sortOrder - b.sortOrder);

        let groups = {};
        for (let group of groupsJsons) {
            groups[group.id] = { id: group.id, name: group.name, conditions: [] };
            for (let condition of group.conditions) {
                let defaultCondition = this.defaultMap.find(c => c.id === condition);
                groups[group.id].conditions.push({ id: condition, enabled: !!defaultCondition });
            }
        }

        this.data = {
            groups,
        }
        return this.data;
    }

    activateListeners(html) {
        for (let group of Object.values(this.data.groups)) {
            let checkboxId = "#checkbox-" + group.id;
            let groupCheckbox = $(checkboxId);
            this.updateGroupCheckboxState(groupCheckbox);
            groupCheckbox.click((ev) => {
                // noinspection JSCheckFunctionSignatures
                const checks = $(ev.currentTarget)
                    .parent()
                    .siblings()
                    .find("input[type=checkbox]");
                if (checks.length) {
                    const newChecked = $(ev.currentTarget).prop("checked");
                    checks.prop("checked", newChecked);
                }
            });
        }
        return super.activateListeners(html);
    }

    // async _onChangeInput(event) {
    //     if (event.target.type != "checkbox" || event.target.id != "") {
    //         return;
    //     }

    //     const checks = $(event.target)
    //     .parent()
    //     .siblings()
    //     .find("input[type=checkbox]");

    //     let tab = $(event.target)
    //     .parents(".tab");

    //     let groupId = tab[0].id.replace("tab-", "");
    //     let checkboxId = "#checkbox-" + groupId;
    //     let groupCheckbox = $(checkboxId);

    //     //Check against all the other checkboxes in this group. If any of them are different then mark us as indeterminate
    //     for (let checkbox of checks) {
    //         if (event.target.checked != checkbox.checked) {
    //             groupCheckbox.prop("indeterminate", true);
    //             return;
    //         }
    //     }

    //     //All of the checkboxes are the same, so clear indeterminate and set the group check to this value
    //     groupCheckbox.prop("indeterminate", false);
    //     groupCheckbox.prop("checked", event.target.checked);
    // }

    async _onChangeInput(event) {
        if (event.target.type == "checkbox" && event.target.id == "") {
            let tab = $(event.target)
                .parents(".tab");

            let groupId = tab[0].id.replace("tab-", "");
            let checkboxId = "#checkbox-" + groupId;
            let groupCheckbox = $(checkboxId);

            this.updateGroupCheckboxState(groupCheckbox);
        }
    }

    async updateGroupCheckboxState(groupCheckbox) {
        const checks = groupCheckbox
            .parent()
            .siblings()
            .find("input[type=checkbox]");

        //Check against all the checkboxes in this group. If any of them are different then mark us as indeterminate
        let foundChecked;
        for (let checkbox of checks) {
            if (foundChecked == undefined) {
                foundChecked = checkbox.checked;
            } else if (foundChecked != checkbox.checked) {
                groupCheckbox.prop("indeterminate", true);
                return;
            }
        }

        //All of the checkboxes are the same, so clear indeterminate and set the group check to this value
        groupCheckbox.prop("indeterminate", false);
        groupCheckbox.prop("checked", foundChecked);
    }

    async _updateObject(_, formData) {
        let newDefaultMap = [];
        for (let condition of game.succ.fullConditionMap) {
            if (formData[condition.id]) {
                newDefaultMap.push(condition);
            }
        }

        await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultMap, newDefaultMap, true);
    }
}