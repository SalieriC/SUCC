import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";

/**
 * Form application for managing mapping of Conditions to Icons and JournalEntries
 */
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
export class DefaultConditionsMenu extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: BUTLER.DEFAULT_CONFIG.enhancedConditions.defaultConditionsMenu.id,
        tag: "form",
        form: {
            handler: DefaultConditionsMenu.formHandler,
            submitOnChange: false,
            closeOnSubmit: true
        },
        classes: ["standard-form", "succ-form"],
        window: {
            title: BUTLER.DEFAULT_CONFIG.enhancedConditions.defaultConditionsMenu.title,
            minimizable: false,
            resizable: true,
            contentClasses: ["succ-default-conditions",],
        },
        position: { width: 600, height: 650 },
    };

    static defaultConditionsMenuTemplates = BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.defaultConditionsMenu;
    static PARTS = {
        tabs: { template: 'templates/generic/tab-navigation.hbs' },
        form: { template: this.defaultConditionsMenuTemplates.form },
        footer: { template: this.defaultConditionsMenuTemplates.footer }
    };

    constructor(options = {}) {
        super(options);
        this.defaultConditions = Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions);
        this.data = {};
    }


    prepareTabs(groups) {
      return Object.values(EnhancedConditions.conditionGroups).reduce((tabs, group) => {
        const isActive = this.tabGroups.main === group.id;
        tabs[group.id] = {
          id: group.id,
          group: "primary",
          label: group.name,
          active: isActive,
          cssClass: isActive ? "active" : "",
          tabCssClass: isActive ? 'tab active' : 'tab',
        };
        return tabs;
      }, {});
    }

    async _prepareContext(options) {
        await super._prepareContext(options);

        let groups = {};
        for (let group of EnhancedConditions.conditionGroups) {
            groups[group.id] = { ...group, conditions: [] };
            for (let condition of group.conditions) {
                let defaultCondition = this.defaultConditions.find(c => c.id === condition.id);
                const conditionConfig = game.succ.conditionConfigMap.find(c => c.id === condition.id);
                groups[group.id].conditions.push({ id: condition.id, name: conditionConfig.name, enabled: defaultCondition.enabled });
            }
        }

        this.data = {
            groups,
        }
        return {
            ...this.data,
            tabs: this.prepareTabs(groups),
            verticalTabs: true,
        };
    }

    _onRender(context, options) {
        for (let group of Object.values(this.data.groups)) {
            const checkboxId = "#checkbox-" + group.id;
            const groupCheckbox = this.element.querySelector(checkboxId);
            if (groupCheckbox) {
                this.updateGroupCheckboxState(groupCheckbox);
                groupCheckbox.addEventListener("click", (ev) => {
                    const checks = groupCheckbox.closest("section").querySelectorAll("input[type=checkbox]");
                    const newChecked = ev.currentTarget.checked;
                    for (let check of checks) {
                        check.checked = newChecked;
                    }
                });
            }
        }
        Sidekick.addEventListenerAll(this.element, "input[type='checkbox']", "change", event => this._onChangeInput(event));
    }

    async _onChangeInput(event) {
        if (event.target.type == "checkbox" && !event.target.dataset.headerBox) {
            let tab = event.target.closest(".tab");

            let checkboxId = "#checkbox-" + tab.id;
            const groupCheckbox = this.element.querySelector(checkboxId);

            this.updateGroupCheckboxState(groupCheckbox);
        }
    }

    async updateGroupCheckboxState(groupCheckbox) {
        const checks = groupCheckbox.closest("section").querySelectorAll("input[type=checkbox]");

        //Check against all the checkboxes in this group. If any of them are different then mark us as indeterminate
        let foundChecked;
        for (let checkbox of checks) {
            if (checkbox == groupCheckbox) continue;

            if (foundChecked == undefined) {
                foundChecked = checkbox.checked;
            } else if (foundChecked != checkbox.checked) {
                groupCheckbox.checked = false;
                groupCheckbox.indeterminate = true;
                return;
            }
        }

        //All of the checkboxes are the same, so clear indeterminate and set the group check to this value
        groupCheckbox.indeterminate = false;
        groupCheckbox.checked = foundChecked;
    }

    static async formHandler(event, form, formData) {
        for (let condition of game.succ.conditionConfigMap) {
            let defaultCondition = this.defaultConditions.find(c => c.id === condition.id);
            defaultCondition.enabled = (formData.object[condition.id] != undefined && formData.object[condition.id]) || condition.destroyDisabled == true;
        }

        await Sidekick.setSetting(BUTLER.SETTING_KEYS.enhancedConditions.defaultConditions, this.defaultConditions);

        foundry.applications.api.DialogV2.confirm({
            window: { title: "succ.ENHANCED_CONDITIONS.DefaultConditionsMenu.Dialog.RefreshMapDefaultsT" },
            content: game.i18n.localize("succ.ENHANCED_CONDITIONS.DefaultConditionsMenu.Dialog.RefreshMapDefaultsB"),
            yes: {
                icon: "fa fa-check",
                label: "WORDS._Yes",
                callback: () => {
                    EnhancedConditions.refreshMapDefaults();
                }
            },
            no: {
                icon: "fas fa-times",
                label: "WORDS._No"
            }
        });
    }
}