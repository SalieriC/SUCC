
import { DEFAULT_CONFIG } from "../butler.js";
import * as BUTLER from "../butler.js";
import { Sidekick } from "../sidekick.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Dialog for selecting and applying conditions
 */
export class ApplyConditionsDialog extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        id: "apply-conditions-dialog",
        tag: "form",
        window: { title: "succ.ENHANCED_CONDITIONS.ApplyConditionsDialog.Title", contentClasses: ["succ-dialog", "app-cond-dialog"] },
        position: { width: "auto", height: "auto" },
        actions: {
            apply: function (event, button) {
                const selectedConditions = [];
                const checkboxes = this.element.querySelectorAll(".condition input");
                for (const checkbox of checkboxes) {
                    if (checkbox.checked) {
                        selectedConditions.push(checkbox.value);
                    }
                }
                this.submit({ conditions: selectedConditions });
            },
            cancel: function (event, button) { this.submit(false); },
            sortList: function () { this._onClickSortButton(); },
        },
    };

    static PARTS = {
        form: {
            template: DEFAULT_CONFIG.enhancedConditions.templates.applyConditionsDialog,
        }
    };

    constructor(options = {}) {
        super(options);
        this.conditionMap = foundry.utils.duplicate(Sidekick.getSetting(BUTLER.SETTING_KEYS.enhancedConditions.map));
        this.conditionMap.forEach(c => c.name = game.i18n.localize(c.name));

        this.searchFilter = new foundry.applications.ux.SearchFilter({
            inputSelector: 'input[name="filter-list"]',
            contentSelector: ".condition-selection",
            callback: (event, query, rgx, html) => {
                this.filterValue = query;
                for (let div of html.children) {
                    if (!query) {
                        div.classList.remove("hidden");
                        continue;
                    }
                    const name = (div.innerText || "").trim();
                    const match = rgx.test(foundry.applications.ux.SearchFilter.cleanQuery(name));
                    div.classList.toggle("hidden", !match);
                }
            },
        });
    }

    async _prepareContext(options) {
        const displayedMap = foundry.utils.duplicate(this.conditionMap);
        if (this.sortDirection) {
            displayedMap.sort((a, b) => this.sortDirection === "desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name));
        }

        return {
            conditions: displayedMap,
            sortDirection: this.sortDirection,
            filterValue: this.filterValue,
        };
    }

    _preRender(context, options) {
        if (options.isFirstRender) return;
        for (const condition of this.conditionMap) {
            condition.hidden = this.element.querySelector(`div[data-condition-id="${condition.id}"]`)?.classList?.contains("hidden") ?? false;
        }
    }

    _onRender(context, options) {
        this.searchFilter.bind(this.element);
        Sidekick.addEventListenerAll(this.element, ".condition input", "change", event => this._onCheckboxChanged(event));
    }

    _onCheckboxChanged(event) {
        const condition = this.conditionMap.find(c => c.id == event.target.closest(".condition").dataset.conditionId);
        condition.checked = event.target.checked;
    }

    _onClickSortButton() {
        const sortDirection = this.sortDirection ?? "";
        switch (sortDirection) {
            case "":
                this.sortDirection = "asc";
                break;

            case "asc":
                this.sortDirection = "desc";
                break;

            case "desc":
                this.sortDirection = "";
                break;

            default:
                break;
        }

        return this.render(true);
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