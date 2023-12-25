const battleBackgroundImage = new Image()
battleBackgroundImage.src = './img/battleBackground.png'


const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    image: battleBackgroundImage,
})

let draggle
let emby
let renderedSprites
let battleAnimationId
let queue
queue = []

function initBattle() {
    document.querySelector('#userInterface').style.display = 'block'
    document.querySelector('#dialogueBox').style.display = 'none'
    document.querySelector('#enemyHealthBar').style.width = '100%'
    document.querySelector('#playerHealthBar').style.width = '100%'
    document.querySelector('#attackBox').replaceChildren()

    draggle = new Monster(monsters.Draggle)
    emby = new Monster(monsters.Emby)
    renderedSprites = [draggle, emby]
    queue = []

    emby.attacks.forEach((attack) => {
        const button = document.createElement('button')
        button.innerHTML = attack.name
        document.querySelector('#attackBox').append(button)
    })

    document.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML]

            if (draggle.attackFinished === true) {
                emby.attack({
                    attack: selectedAttack,
                    recipient: draggle,
                    renderedSprites,
                })
            }

            if (draggle.health <= 0) {
                draggle.faint()
                return
            }
            
                if (emby.health <= 0) {
                    emby.faint()

                    return
                }
        
        
            if(queue.length === 0){
                
                queue.push(() => {
                    draggle.attack({
                        attack: draggle.attacks[
                            Math.floor(Math.random() * draggle.attacks.length)
                        ],
                        recipient: emby,
                        renderedSprites,
                    })
                    
                    button.addEventListener('mouseenter', (e) => {
                        const selectedAttack = attacks[e.currentTarget.innerHTML]
                        document.querySelector('#attackType').innerHTML =
                            selectedAttack.type
                        document.querySelector('#attackType').style.color =
                            selectedAttack.color
                    })
                })
            }
        })
    })
}

function animateBattle() {
    battleAnimationId = window.requestAnimationFrame(animateBattle)
    battleBackground.draw()

    renderedSprites.forEach((sprite) => {
        sprite.draw()
    })
}
let s = 0
document.querySelector('#dialogueBox').addEventListener('click', (e) => {
    if (emby.attackFinished === true) {

        if(draggle.health <= 0 || emby.health <= 0){
                gsap.to('#overlappingDiv', {
                    opacity: 1,
                    onComplete: () => {
                        initPos();
                        cancelAnimationFrame(battleAnimationId)
                        animate()
                        document.querySelector(
                            '#userInterface',
                        ).style.display = 'none'
                        gsap.to('#overlappingDiv', {
                            opacity: 0,
                        })
                        battle.initiated = false;
                        audio.Map.stop();
                        audio.Map.play();                        
                    },
                })
            }else {
                if (queue.length > 0) {
                    queue[0]()
                    queue.shift()
                }else{
                    e.currentTarget.style.display = 'none'
                }
            }
    }
})
                                                        
                                                       
