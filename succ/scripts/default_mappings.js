// Default mappings for icons

export const SUCC_DEFAULT_MAPPING = {
    'shaken': 'modules/succ/assets/icons/0-shaken.svg',
    'incapacitated': 'modules/succ/assets/icons/3-incapacitated.svg',
    'aiming': 'modules/succ/assets/icons/1-aiming.svg',
    'berserk': 'modules/succ/assets/icons/1-berserking.svg',
    'defending': 'modules/succ/assets/icons/1-defending.svg',
    'flying': 'modules/succ/assets/icons/1-flying.svg',
    'holding': 'modules/succ/assets/icons/1-holding.svg',
    'bound': 'modules/succ/assets/icons/2b-bound.svg',
    'entangled': 'modules/succ/assets/icons/2b-entangled.svg',
    'frightened': 'modules/succ/assets/icons/2c-frightened.svg',
    'distracted': 'modules/succ/assets/icons/2-distracted.svg',
    'encumbered': 'modules/succ/assets/icons/2-encumbered.svg',
    'prone': 'modules/succ/assets/icons/2-prone.svg',
    'stunned': 'modules/succ/assets/icons/2-stunned.svg',
    'vulnerable': 'modules/succ/assets/icons/2-vulnerable.svg',
    'the-drop': 'modules/succ/assets/icons/2-the_drop.svg',
    'bleeding-out': 'modules/succ/assets/icons/3-bleeding_out.svg',
    'diseased': 'modules/succ/assets/icons/3-diseased.svg',
    'heart-attack': 'modules/succ/assets/icons/3-heart_attack.svg',
    'on-fire': 'modules/succ/assets/icons/3-on_fire.svg',
    'poisoned': 'modules/succ/assets/icons/3-poisoned.svg',
    'cover-shield': 'modules/succ/assets/icons/4-shield.svg',
    'cover': 'modules/succ/assets/icons/4-cover.svg',
    'reach': 'modules/succ/assets/icons/5-reach.svg',
    'torch': 'modules/succ/assets/icons/5-torch.svg',
    'invisible': 'modules/succ/assets/icons/m-invisible.svg',
    'cold-bodied': 'modules/succ/assets/icons/m-cold_bodied.svg',
    'smite': 'modules/succ/assets/icons/m-smite.svg',
    'protection': 'modules/succ/assets/icons/m-protection.svg'
}

export const SUCC_DEFAULT_ADDITIONAL_CONDITIONS = {
    conviction: {
        id: 'conviction',
        icon: 'modules/succ/assets/icons/1-conviction.svg'
    },
    irradiated: {
        id: 'irradiated',
        label: 'Irradiated',
        icon: 'modules/succ/assets/icons/0-irradiated.svg'
    },
    boost: {
        id: 'boost',
        icon: 'modules/succ/assets/icons/m-boost.svg'
    },
    lower: {
        id: 'lower',
        icon: 'modules/succ/assets/icons/m-lower.svg'
    },
}

export const SUCC_DEFAULT_SWADE_LINKS = {
    //These are the compendium links for the entries in the SWADE Module
    'shaken': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03damageeffect00#shaken]',
    'incapacitated': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03damageeffect00#incapacitation]',
    'aiming': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03aim00000000000#aim]',
    'berserk': '@UUID[Compendium.swade-core-rules.swade-edges.Xv6TAc0VcnkEqt20]',
    'defending': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03defend00000000#defend]',
    'flying': '@UUID[Compendium.swade-core-rules.swade-specialabilities.bvNxxTm14d8tD9aF]',
    'holding': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03hold0000000000#hold]',
    'conviction': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor04theadv.JournalEntryPage.04conviction0000#conviction]',
    'bound': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03boundandenta00#bound-and-entangled]',
    'entangled': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03boundandenta00#bound-and-entangled]',
    'frightened': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor04theadv.JournalEntryPage.04fear0000000000#fear]',
    'distracted': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03distractedan00#distracted-and-vulnerable]',
    'encumbered': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor02gear00.JournalEntryPage.02gearnotes00000#encumbrance]',
    'prone': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03prone000000000#prone]',
    'stunned': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03stunned0000000#stunned]',
    'vulnerable': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03distractedan00#distracted-and-vulnerable]',
    'the-drop': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03thedrop0000000#the-drop]',
    'bleeding-out': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03damageeffect00#incapacitation]',
    'diseased': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor04theadv.JournalEntryPage.04disease0000000#disease]',
    'heart-attack': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor04theadv.JournalEntryPage.04fear0000000000#fear-table$1]',
    'on-fire': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor04theadv.JournalEntryPage.04fire0000000000#fire]',
    'poisoned': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor04theadv.JournalEntryPage.04poison00000000#poison]',
    'cover-shield': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor02gear00.JournalEntryPage.02shields0000000#shields]',
    'cover': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03coverandobst00#cover-and-obstacles]',
    'reach': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor02gear00.JournalEntryPage.02reach000000000#reach]',
    'torch': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor03rules0.JournalEntryPage.03illumination00#illumination]',
    'invisible': '@UUID[Compendium.swade-core-rules.swade-powers.iS3duGwyTywaMOF7]',
    'cold-bodied': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor06bestia.JournalEntryPage.06specialabili18#infravision]',
    'smite': '@UUID[Compendium.swade-core-rules.swade-powers.AlGYtSZmjUDRfUGM]',
    'protection': '@UUID[Compendium.swade-core-rules.swade-powers.9Ia8jJNOCy0z7yXn]',
    'irradiated': '@UUID[Compendium.swade-core-rules.swade-rules.swadecor04theadv.JournalEntryPage.04radiation00000#radiation]',
    'boost': '@UUID[Compendium.swade-core-rules.swade-powers.FSwGNyzYvYRMhOkV]',
    'lower': '@UUID[Compendium.swade-core-rules.swade-powers.FSwGNyzYvYRMhOkV]'
}

export const SUCC_DEFAULT_SWPF_LINKS = {
    //These are the compendium links for the entries in the SWADE Module
    'shaken': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03combat00000000#damage-effects]',
    'incapacitated': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03combat00000000#incapacitation]',
    'aiming': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03situationalr00#aim]',
    'berserk': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore01charac.JournalEntryPage.01edges000000000#barbarian]',
    'defending': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03situationalr00#defend]',
    'flying': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore08bestia.JournalEntryPage.08specialabili00#flight]',
    'holding': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03situationalr00#hold]',
    'conviction': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03rules000000000#conviction]',
    'bound': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03situationalr00#bound-and-entangled]',
    'entangled': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03situationalr00#bound-and-entangled]',
    'frightened': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore04theadv.JournalEntryPage.04fear0000000000]',
    'distracted': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03situationalr00#distracted-and-vulnerable]',
    'encumbered': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore02gear00.JournalEntryPage.02gear0000000000#encumbrance]',
    'prone': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03situationalr00#prone]',
    'stunned': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03situationalr00#stunned]',
    'vulnerable': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03situationalr00#distracted-and-vulnerable]',
    'the-drop': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03situationalr00#the-drop]',
    'bleeding-out': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03combat00000000#incapacitation]',
    'diseased': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore04theadv.JournalEntryPage.04hazards0000000#disease]',
    'heart-attack': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore04theadv.JournalEntryPage.04fear0000000000]',
    'on-fire': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore04theadv.JournalEntryPage.04hazards0000000#fire]',
    'poisoned': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore04theadv.JournalEntryPage.04hazards0000000#poison]',
    'cover-shield': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore02gear00.JournalEntryPage.02armor000000000#armor]',
    'cover': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03situationalr00#cover-and-obstacles]',
    'reach': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore02gear00.JournalEntryPage.02gear0000000000#reach]',
    'torch': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore03rules0.JournalEntryPage.03situationalr00#illumination]',
    'invisible': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore05powers.JournalEntryPage.05powers00000001#invisibility]',
    //'cold-bodied': '',
    'smite': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore05powers.JournalEntryPage.05powers00000001#smite]',
    'protection': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore05powers.JournalEntryPage.05powers00000001#protection]',
    'boost': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore05powers.JournalEntryPage.05powers00000001#boost/lower-trait]',
    'lower': '@UUID[Compendium.swpf-core-rules.swpf-rules.swpfcore05powers.JournalEntryPage.05powers00000001#boost/lower-trait]'
}