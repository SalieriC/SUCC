// Setting scripts
/* globals game */

export function register_settings() {
    game.settings.register('succ', 'icon_overwrites', {
        name : game.i18n.localize("SUCC.setting.icon_definitions"),
        hint: game.i18n.localize("SUCC.setting.icon_definitions_hint"),
        default: '',
        type: String,
        config: true,
    })
}