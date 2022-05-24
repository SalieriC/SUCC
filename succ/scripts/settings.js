// Setting scripts
/* globals game */

export function register_settings() {
    game.settings.register('succ', 'default_icons', {
        name : game.i18n.localize("SUCC.setting.default_icons"),
        hint: game.i18n.localize("SUCC.setting.default_icons_hint"),
        scope: "world",
        default: false,
        type: Boolean,
        config: true,
        onChange: () => {
            window.location.reload();
        }
    })
    game.settings.register('succ', 'icon_overwrites', {
        name : game.i18n.localize("SUCC.setting.icon_definitions"),
        hint: game.i18n.localize("SUCC.setting.icon_definitions_hint"),
        scope: "world",
        default: '',
        type: String,
        config: true,
    })
    game.settings.register('succ', 'output_to_chat', {
        name : game.i18n.localize("SUCC.setting.output_to_chat"),
        hint: game.i18n.localize("SUCC.setting.output_to_chat_hint"),
        scope: "world",
        default: true,
        type: Boolean,
        config: true,
    })
    game.settings.register('succ', 'mark_inc_defeated', {
        name : game.i18n.localize("SUCC.setting.mark_inc_defeated"),
        hint: game.i18n.localize("SUCC.setting.mark_inc_defeated_hint"),
        scope: "world",
        default: true,
        type: Boolean,
        config: true,
    })
    game.settings.register('succ', 'boost_lower', {
        name : game.i18n.localize("SUCC.setting.boost_lower"),
        hint: game.i18n.localize("SUCC.setting.boost_lower_hint"),
        scope: "world",
        default: true,
        type: Boolean,
        config: true,
    })
    game.settings.register('succ', 'modify_status', {
        name : game.i18n.localize("SUCC.setting.modify_status_definitions"),
        hint: game.i18n.localize("SUCC.setting.modify_status_definitions_hint"),
        scope: "world",
        default: '',
        type: String,
        config: true,
    })
    game.settings.register('succ', 'disable_status_dialogue', {
        name : game.i18n.localize("SUCC.setting.disable_status_dialogue"),
        hint: game.i18n.localize("SUCC.setting.disable_status_dialogue_hint"),
        scope: "world",
        default: false,
        type: Boolean,
        config: true,
    })
}