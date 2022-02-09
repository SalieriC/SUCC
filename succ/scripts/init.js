Hooks.on(`ready`, () => {
    console.log('SWADE Ultimate Condition Changer | Ready');
    change_conditions();
});

async function change_conditions() {
    //First, change all the default condition images:
    CONFIG.statusEffects.find(st => st.id === 'shaken').icon = "modules/succ/assets/icons/0-Shaken.png"
}

async function add_conditions() {
    //Add custom conditions:
}