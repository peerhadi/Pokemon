const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
let scale = 1.0;
let BACKGROUND_IMAGE_HEIGHT = 1920;

let clicked = false;
addEventListener("click", () => {
    if (!clicked) {
        audio.Map.play();
        clicked = true;
    }
});

window.addEventListener("load", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scale = BACKGROUND_IMAGE_HEIGHT / window.innerHeight;
    initPos();
});

const image = new Image();
image.src = "./img/Pellet Town.png";
const foregroundImage = new Image();
foregroundImage.src = "./img/foregroundObjects.png";

const playerDownImage = new Image();
playerDownImage.src = "./img/playerDown.png";
const playerUpImage = new Image();
playerUpImage.src = "./img/playerUp.png";
const playerLeftImage = new Image();
playerLeftImage.src = "./img/playerLeft.png";
const playerRightImage = new Image();
playerRightImage.src = "./img/playerRight.png";

let keyMap = {
    w: "up",
    a: "left",
    s: "down",
    d: "right",
};

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i));
}

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
    battleZonesMap.push(battleZonesData.slice(i, 70 + i));
}

let player;
let offset;
let background;
let foreground;
let boundaries;
let battleZones;
let directions = [];
let movables;

class Player extends Sprite {
    constructor() {
        let x = 1225 / scale;
        let y = 880 / scale;
        super({
            position: {
                x,
                y,
            },
            image: playerDownImage,
            frames: {
                max: 4,
                hold: 10,
            },
            sprites: {
                up: playerUpImage,
                left: playerLeftImage,
                right: playerRightImage,
                down: playerDownImage,
            },
            animate: true,
        });

        this.change = {
            up: {
                x: 0,
                y: 3,
            },
            down: {
                x: 0,
                y: -3,
            },
            left: {
                x: 3,
                y: 0,
            },
            right: {
                x: -3,
                y: 0,
            },
        };
    }

    move(direction) {
        this.animate = true;
        let moving = true;
        this.image = player.sprites[direction];

        for (const boundary of boundaries) {
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x + this.change[direction].x,
                            y: boundary.position.y + this.change[direction].y,
                        },
                    },
                })
            ) {
                moving = false;
                break;
            }
        }

        if (moving)
            movables.forEach((movable) => {
                movable.position.x += this.change[direction].x;
                movable.position.y += this.change[direction].y;
            });
    }
}

function initPos() {
    player = new Player();
    let boundaryPos = 1025;
    offset = {
        x: 0,
        y: 0,
    };

    background = new Sprite({
        position: {
            x: offset.x,
            y: offset.y,
        },
        image,
    });

    foreground = new Sprite({
        position: {
            x: offset.x,
            y: offset.y,
        },
        image: foregroundImage,
    });

    boundaries = createBoundaries(collisionsMap, boundaryPos);
    battleZones = createBoundaries(battleZonesMap, boundaryPos);
    movables = [background, ...boundaries, foreground, ...battleZones];
}

function createBoundaries(map, boundaryPos) {
    let result = [];
    map.forEach((row, i) => {
        row.forEach((symbol, j) => {
            if (symbol === boundaryPos) {
                result.push(
                    new Boundary({
                        position: {
                            x: j * Boundary.width + offset.x,
                            y: i * Boundary.height + offset.y,
                        },
                    })
                );
            }
        });
    });
    return result;
}

initPos();
function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
        rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
        rectangle1.position.y <= rectangle2.position.y + rectangle2.height
    );
}

const battle = {
    initiated: false,
};

function animate() {
    const animationId = window.requestAnimationFrame(animate);
    background.draw();
    document.querySelector("#userInterface").style.display = "none";
    battleZones.forEach((battleZone) => {
        battleZone.draw();
    });
    player.draw();
    foreground.draw();

    player.animate = false;
    if (battle.initiated) return;
    if (directions.length === 0) {
        return;
    }
    startBattle(animationId);

    let direction = directions[directions.length - 1];
    player.move(direction);
}

animate();

function startBattle(animationId) {
    for (const battleZone of battleZones) {
        const overlappingArea =
            (Math.min(
                player.position.x + player.width,
                battleZone.position.x + battleZone.width
            ) -
                Math.max(player.position.x, battleZone.position.x)) *
            (Math.min(
                player.position.y + player.height,
                battleZone.position.y + battleZone.height
            ) -
                Math.max(player.position.y, battleZone.position.y));
        if (
            rectangularCollision({
                rectangle1: player,
                rectangle2: battleZone,
            }) &&
            overlappingArea > (player.width * player.height) / 2 &&
            Math.random() < 0.01
        ) {
            window.cancelAnimationFrame(animationId);
            audio.Map.stop();
            audio.initBattle.play();
            audio.battle.play();
            battle.initiated = true;
            gsap.to("#overlappingDiv", {
                opacity: 1,
                repeat: 3,
                yoyo: true,
                duration: 0.4,
                onComplete() {
                    gsap.to("#overlappingDiv", {
                        opacity: 1,
                        duration: 0.4,
                        onComplete() {
                            initBattle();
                            animateBattle();
                            gsap.to("#overlappingDiv", {
                                opacity: 0,
                                duration: 0.4,
                            });
                        },
                    });
                },
            });

            break;
        }
    }
}

window.addEventListener("keydown", ({ key }) => {
    if ("wasd".includes(key) && !directions.includes(keyMap[key])) {
        directions.push(keyMap[key]);
    }
});

window.addEventListener("keyup", ({ key }) => {
    if ("wasd".includes(key)) {
        directions.pop();
    }
});
