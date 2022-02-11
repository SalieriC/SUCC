// Setting scripts
/* globals game */

export function register_settings() {
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
}