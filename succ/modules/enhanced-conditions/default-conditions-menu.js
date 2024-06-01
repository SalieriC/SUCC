import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";

/**
 * Form application for managing mapping of Conditions to Icons and JournalEntries
 */
export class DefaultConditionsMenu extends FormApplication {
    constructor(object, options = {}) {
        super(object, options);
        this.defaultConditions = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions);
        this.data = {};
    }

    /**
     * Get options for the form
     */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
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
            height: 650,
            resizable: true,
        });
    }

    async getData(_) {
        const source = "data";
        const groupsJsons = await Sidekick.fetchJsons(source, BUTLER.DEFAULT_CONFIG.enhancedConditions.defaultConditionGroupsPath);
        groupsJsons.sort((a, b) => a.sortOrder - b.sortOrder);

        let groups = {};
        for (let group of groupsJsons) {
            groups[group.id] = { id: group.id, name: group.name, description: group.description, canBeDisabled: group.canBeDisabled, conditions: [] };
            for (let condition of group.conditions) {
                let defaultCondition = this.defaultConditions.find(c => c.id === condition.id);
                const conditionConfig = game.succ.conditionConfigMap.find(c => c.id === condition.id);
                groups[group.id].conditions.push({ id: condition.id, name: conditionConfig.name, enabled: defaultCondition.enabled });
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
        for (let condition of game.succ.conditionConfigMap) {
            let defaultCondition = this.defaultConditions.find(c => c.id === condition.id);
            defaultCondition.enabled = (formData[condition.id] != undefined && formData[condition.id]) || condition.destroyDisabled == true;
        }
        
        await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions, this.defaultConditions);

        new Dialog({
            title: game.i18n.localize("succ.ENHANCED_CONDITIONS.DefaultConditionsMenu.Dialog.RefreshMapDefaultsT"),
            content: game.i18n.localize("succ.ENHANCED_CONDITIONS.DefaultConditionsMenu.Dialog.RefreshMapDefaultsB"),
            buttons: {
                yes: {
                    icon: `<i class="fa fa-check"></i>`,
                    label: game.i18n.localize("WORDS._Yes"),
                    callback: html => {
                        EnhancedConditions.refreshMapDefaults();
                    }
                },
                no: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize("WORDS._No")
                }
            },
            default: "yes"
        }).render(true);
    }
}