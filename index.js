const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

let clicked = false;
addEventListener("click", () => {
    if (!clicked) {
        audio.Map.play();
        clicked = true;
    }
});

canvas.width = 1853;
canvas.height = 900;
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
let keys;
let movables;

function initPos() {
    player = new Sprite({
        position: {
            x: canvas.width / 2.28 - 192 / 4 / 2,
            y: canvas.height / 3.6 - 68 / 2,
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

    offset = {
        x: -435,
        y: -650,
    };

    background = new Sprite({
        position: {
            x: offset.x,
            y: offset.y,
        },
        image: image,
    });

    foreground = new Sprite({
        position: {
            x: offset.x,
            y: offset.y,
        },
        image: foregroundImage,
    });

    boundaries = [];

    collisionsMap.forEach((row, i) => {
        row.forEach((symbol, j) => {
            if (symbol === 1025) {
                boundaries.push(
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

    battleZones = [];

    battleZonesMap.forEach((row, i) => {
        row.forEach((symbol, j) => {
            if (symbol === 1025) {
                battleZones.push(
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

    keys = {
        w: {
            pressed: false,
        },
        a: {
            pressed: false,
        },
        s: {
            pressed: false,
        },
        d: {
            pressed: false,
        },
    };

    movables = [background, ...boundaries, foreground, ...battleZones];
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

    let moving = true;
    player.animate = false;
    if (battle.initiated) return;
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i];
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

    if (keys.w.pressed && lastKey === "w") {
        player.animate = true;
        player.image = player.sprites.up;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y + 2,
                        },
                    },
                })
            ) {
                moving = false;
                break;
            }
        }
        if (moving) {
            movables.forEach((movable) => {
                movable.position.y += 3;
            });
        }
    } else if (keys.a.pressed && lastKey === "a") {
        player.animate = true;
        player.image = player.sprites.left;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x + 2,
                            y: boundary.position.y,
                        },
                    },
                })
            ) {
                moving = false;
                break;
            }
        }
        if (moving) {
            movables.forEach((movable) => {
                movable.position.x += 3;
            });
        }
    } else if (keys.s.pressed && lastKey === "s") {
        player.animate = true;
        player.image = player.sprites.down;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x,
                            y: boundary.position.y - 2,
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
                movable.position.y -= 3;
            });
    } else if (keys.d.pressed && lastKey === "d") {
        player.animate = true;
        player.image = player.sprites.right;
        for (let i = 0; i < boundaries.length; i++) {
            const boundary = boundaries[i];
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: {
                        ...boundary,
                        position: {
                            x: boundary.position.x - 2,
                            y: boundary.position.y,
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
                movable.position.x -= 3;
            });
    }
}
animate();

let lastKey = "";

window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = true;
            lastKey = "w";
            break;
        case "a":
            keys.a.pressed = true;
            lastKey = "a";
            break;
        case "s":
            keys.s.pressed = true;
            lastKey = "s";
            break;
        case "d":
            keys.d.pressed = true;
            lastKey = "d";
            break;
    }
});

window.addEventListener("keyup", (e) => {
    switch (e.key) {
        case "w":
            keys.w.pressed = false;
            break;
        case "a":
            keys.a.pressed = false;
            break;
        case "s":
            keys.s.pressed = false;
            break;
        case "d":
            keys.d.pressed = false;
            break;
    }
});
