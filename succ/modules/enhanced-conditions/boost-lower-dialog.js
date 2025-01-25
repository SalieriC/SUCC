import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";
import { EnhancedConditions } from "./enhanced-conditions.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Dialog for configuring a boost or lower trait effect
 */
export class BoostLowerDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "boost-lower-dialog",
        tag: "form",
        window: { title: "ENHANCED_CONDITIONS.Dialog.BoostBuilder.Name", contentClasses: ["dialog succ-dialog"] },
        position: { width: 400 },
        actions: {
            success: function (event, button) {
                const trait = this.element.querySelector("#selected_trait").value;
                this.submit({ trait: trait, degree: "success" });
            },
            raise: function (event, button) {
                const trait = this.element.querySelector("#selected_trait").value;
                this.submit({ trait: trait, degree: "raise" });
            },
            cancel: function (event, button) { this.submit(false); }
        },
    };

    static PARTS = {
        form: {
            template: BUTLER.DEFAULT_CONFIG.enhancedConditions.templates.boostLowerDialog,
        }
    };

    constructor(options = {}) {
        super(options);
        this.actor = options.actor;
        this.type = options.type;
        this.showAllSkills = false;
    }

    async _prepareContext(_options) {
        let condition = EnhancedConditions.lookupConditionById(this.type);
        let traitOptions = await Sidekick.getTraitOptions(this.actor, this.showAllSkills);

        return {
            condition,
            traitOptions,
            boost: this.type == "boost",
            showAllSkills: this.showAllSkills
        };
    };

    _onRender(context, options) {
        const allSkillsCheckbox = this.element.querySelector('input[id="all-skills"]');
        allSkillsCheckbox.addEventListener("change", event => {
            //When the all skills option changes, we need to refresh the dialog to get the new list
            this.showAllSkills = event.target.checked;
            this.render();
        });
    }

    submit() {
        this.close();
    }

    /**
     * Renders the dialog and awaits until the dialog is submitted or closed
     */
    async wait() {
        return new Promise((resolve, reject) => {
            // Wrap submission handler with Promise resolution.
            this.submit = async result => {
                resolve(result);
                this.close();
            };

            this.addEventListener("close", event => {
                resolve(false);
            }, { once: true });

            this.render({ force: true });
        });
    }
}