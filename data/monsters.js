
const monsters = {
    Emby: {
        position: {
            x: 500,
            y: 525,
        },
        image: {
            src: './img/embySprite.png'
        },
        frames: {
            max: 4,
            hold: 30,
        },
        animate: true,
        name: 'Emby',
        attacks: [attacks.Tackle, attacks.Fireball],
        attackFinished: true
    },
    Draggle: {
        position: {
            x: 1450,
            y: 100,
        },
        image: {
            src: './img/draggleSprite.png'
        },
        frames: {
            max: 4,
            hold: 30,
        },
        animate: true,
        isEnemy: true,
        name: 'Draggle',
        attacks: [attacks.Tackle, attacks.Fireball],
        attackFinished: true
    },
}
