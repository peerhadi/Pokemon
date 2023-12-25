let attackFinised = true;

class Boundary {
    static width = 48
    static height = 48
    constructor({position}) {
        this.position = position
        this.width = 48
        this.height = 48
    }

    draw() {
    }
}

class Sprite {
    constructor({
        position,
        image,
        frames = {max: 1, hold: 10},
        sprites,
        animate,
        rotation = 0,
    }) {
        this.position = position
        this.frames = {...frames, val: 0, elapsed: 0}
        if(!image.src){
            this.image = image;
        }else{
            this.image = new Image();
        }
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max;
            this.height = this.image.height;
        }
        
        if(image.src){
            this.image.src = image.src
        }
        this.animate = animate
        this.sprites = sprites
        this.opacity = 1
        this.rotation = rotation
    }

    draw() {
        let width = this.width / scale;
        let height = this.height / scale;
        c.save()
        if (this.rotation != 0) {
            c.translate(
                this.position.x + width / 2,
                this.position.y + height / 2,
            )
            c.rotate(this.rotation)
            c.translate(
                -this.position.x + width / 2,
                -this.position.y + height / 2,
            )
        }

        c.globalAlpha = this.opacity
        c.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.width,
            this.height,
            this.position.x,
            this.position.y,
            width,
            height,
        )

        c.restore()
        if (!this.animate) return
        if (this.frames.max > 1) {
            this.frames.elapsed++
        }
        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) this.frames.val++
            else this.frames.val = 0
        }
    }
}

class Monster extends Sprite {
    constructor({
        position,
        velocity,
        image,
        frames = {max: 1, hold: 10},
        sprites,
        animate,
        rotation,
        isEnemy = false,
        name,
        attacks,
        attackFinished,
    }) {
        super({
            position,
            velocity,
            frames,
            sprites,
            animate,
            rotation,
            image,
        })
       
        this.health = 100
        this.isEnemy = isEnemy
        this.name = name
        this.attacks = attacks
        this.attackFinished = attackFinished;
    }

    faint() {
        initPos();
        document.querySelector('#dialogueBox').innerHTML =
            this.name + ' fainted!'
        ;

        gsap.to(this.position, {
            y: this.position.y + 20
        })
        gsap.to(this, {
            opacity: 0
        })
        audio.battle.stop();
        audio.victory.play();
    }

    attack({attack, recipient, renderedSprites}) {
        document.querySelector('#dialogueBox').style.display = 'block'
        document.querySelector('#dialogueBox').innerHTML =
            this.name + ' used ' + attack.name
        ;
        let rotation = 1
        if (this.isEnemy) rotation = -1.7
        let healthBar
        this.attackFinished = false;
        recipient.health = recipient.health - attack.damage
        switch (attack.name) {
        case 'Fireball':
            audio.initFireball.play();
                const fireballImage = new Image()
                fireballImage.src = './img/fireball.png'
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y - 100 * rotation,
                    },
                    image: fireballImage,
                    frames: {
                        max: 4,
                        hold: 10,
                    },
                    animate: true,
                    rotation,
                })
                renderedSprites.splice(1, 0, fireball)
                healthBar = '#enemyHealthBar'
                if (this.isEnemy) healthBar = '#playerHealthBar'
                gsap.to(fireball.position, {
                    x: recipient.position.x + rotation * 50,
                    y: recipient.position.y - rotation * 100,
                    onComplete: () => {
                        audio.fireballHit.play();
                        gsap.to(healthBar, {                            
                            width: recipient.health + '%',
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 20,
                            yoyo: true,
                            repeat: 3,
                            duration: 0.08,
                        })

                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 3,
                            yoyo: true,
                            onComplete: () => {
                                this.attackFinished = true;
                            }
                        })
                        renderedSprites.splice(1, 1)
                    },
                })        
            
                break
            case 'Tackle':
                const tl = gsap.timeline()

                let movementDistance = 30
                if (this.isEnemy) movementDistance = -30

                healthBar = '#enemyHealthBar'
                if (this.isEnemy) healthBar = '#playerHealthBar'
                tl.to(this.position, {
                    x: this.position.x - movementDistance,
                })
                    .to(this.position, {
                        x: this.position.x + movementDistance * 2,
                        duration: 0.1,
                        onComplete: () => {
                            audio.tackleHit.play();
                            gsap.to(healthBar, {
                                width: recipient.health + '%',
                            })
                            gsap.to(recipient.position, {
                                x: recipient.position.x + 20,
                                yoyo: true,
                                repeat: 3,
                                duration: 0.08,
                            })

                            gsap.to(recipient, {
                                opacity: 0,
                                repeat: 3,
                                yoyo: true,
                            onComplete: () => {
                                this.attackFinished = true;
                            }
                            })
                        },
                    })
                    .to(this.position, {
                        x: this.position.x,
                    })
                break
        }
    }
}
