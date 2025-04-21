document.addEventListener('DOMContentLoaded', () => {
    const MAX_BACKGROUND_X = 0;
    const MIN_BACKGROUND_X = -5382;

    const player = document.getElementById('player');
    const background = document.getElementById('background');
    const messages = document.querySelectorAll('.message');
    const interactables = document.querySelectorAll('.interactable');
    const dialogueBox = document.getElementById('dialogue-box');
    const bonfire = document.getElementById('bonfire-2');
    const blackScreen = document.getElementById('black-screen');
    const birthdayText = document.getElementById('birthday-text');
    const birthdayVideo = document.getElementById('birthday-video');

    const spriteWidth = 340;
    const spriteHeight = 340;

    const bgRect = background.getBoundingClientRect();

    const position = {
        x: bgRect.left + bgRect.width / 2 - spriteWidth / 2 - 120,
        y: bgRect.top + bgRect.height - spriteHeight
    };

    player.style.left = position.x + 'px';
    player.style.top = position.y + 'px';

    let backgroundX = 0;
    let isJumping = false;
    let velocityY = 0;
    const gravity = 0.5;
    const jumpHeight = -13;
    let moveDirection = 0;

    const backgroundMovementScale = 0.4;
    const messageMovementScale = 1;

    const firekeeperTarget = { x: -1821.9999542236328, y: 332.5187759399414 };
    const bonfireTarget = { x: -3993.999954223633, y: 332.5187759399414 };
    const chestTarget = { x: -5400, y: 332 };

    const interactionRangeX = 250;

    const firekeeperDialogue = [
        "Come closer, Ashen one... Let me guide your soul, if only for a moment.",
        "<i>You received Kiss of Flame.</i>"
    ];

    const bonfireDialogue = [
        "The flames... they whisper of rest.",
        "Time marches onward, yet the embers remain...",
        "<i>You received Birthday Ember.</i>",
    ];

    let currentDialogueIndex = 0;
    let isPlayerInRange = false;
    let currentInteraction = null;

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'd') {
            moveDirection = -10;
            player.style.transform = 'scaleX(-1)';
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
            moveDirection = 10;
            player.style.transform = 'scaleX(1)';
        } else if ((e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') && !isJumping) {
            isJumping = true;
            velocityY = jumpHeight;
        } else if (e.key === 'e') {
            if (isPlayerInRange && currentInteraction === 'firekeeper') {
                const dialogue = firekeeperDialogue;
                if (currentDialogueIndex < dialogue.length) {
                    dialogueBox.style.display = 'block';
                    dialogueBox.innerHTML = dialogue[currentDialogueIndex];
                    currentDialogueIndex++;
                } else {
                    dialogueBox.style.display = 'none';
                    currentDialogueIndex = 0;
                }
            } else if (isPlayerInRange && currentInteraction === 'bonfire') {
                const dialogue = bonfireDialogue;
                if (currentDialogueIndex < dialogue.length) {
                    dialogueBox.style.display = 'block';
                    dialogueBox.innerHTML = dialogue[currentDialogueIndex];
                    currentDialogueIndex++;
                } else {
                    dialogueBox.style.display = 'none';
                    currentDialogueIndex = 0;
                }
            } else if (isPlayerInRange && currentInteraction === 'chest') {
                blackScreen.style.display = 'flex';
                setTimeout(() => {
                    birthdayText.style.opacity = '1';
                    birthdayVideo.style.opacity = '1';
                }, 500); // fade in after black screen
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') {
            moveDirection = 0;
        }
    });

    function updatePlayerPosition() {
        if (isJumping) {
            position.y += velocityY;
            velocityY += gravity;

            if (position.y >= bgRect.top + bgRect.height - spriteHeight) {
                position.y = bgRect.top + bgRect.height - spriteHeight;
                isJumping = false;
            }
        }

        player.style.left = position.x + 'px';
        player.style.top = position.y + 'px';

        const nextBackgroundX = backgroundX + moveDirection * backgroundMovementScale;
        const playerBgX = position.x + backgroundX;

        if (nextBackgroundX > MAX_BACKGROUND_X || (position.x + nextBackgroundX) < MIN_BACKGROUND_X) return;

        backgroundX = nextBackgroundX;
        background.style.backgroundPosition = `${backgroundX}px 0`;

        const distanceToFirekeeper = Math.abs(playerBgX - firekeeperTarget.x);
        const distanceToBonfire = Math.abs(playerBgX - bonfireTarget.x);
        const distanceToChest = Math.abs(playerBgX - chestTarget.x);

        if (distanceToFirekeeper <= interactionRangeX) {
            isPlayerInRange = true;
            currentInteraction = 'firekeeper';
        } else if (distanceToBonfire <= interactionRangeX) {
            isPlayerInRange = true;
            currentInteraction = 'bonfire';
            if (bonfire) bonfire.src = 'bonfire.png';
        } else if (distanceToChest <= interactionRangeX) {
            isPlayerInRange = true;
            currentInteraction = 'chest';
        } else {
            isPlayerInRange = false;
            currentInteraction = null;
            dialogueBox.style.display = 'none';
            currentDialogueIndex = 0;
            if (bonfire) bonfire.src = 'unlit-bonfire.png';
        }

        messages.forEach((msg) => {
            msg.style.color = (isPlayerInRange && currentInteraction) ? '#b4b4b4' : '#dedede';

            let signPositionX = parseInt(msg.style.left, 10) || 0;
            signPositionX += moveDirection * backgroundMovementScale * messageMovementScale;

            const leftEdge = bgRect.left;
            const rightEdge = bgRect.left + bgRect.width;

            if (signPositionX < leftEdge) {
                const opacity = Math.max(0, 1 - ((leftEdge - signPositionX) / 100));
                msg.style.opacity = opacity;
            } else if (signPositionX > rightEdge) {
                const opacity = Math.max(0, 1 - ((signPositionX - rightEdge) / 100));
                msg.style.opacity = opacity;
            } else {
                msg.style.opacity = 1;
            }

            msg.style.left = `${signPositionX}px`;
        });

        interactables.forEach((item) => {
            let itemX = parseInt(item.style.left, 10) || 0;
            itemX += moveDirection * backgroundMovementScale;
            item.style.left = `${itemX}px`;

            const leftEdge = bgRect.left;
            const rightEdge = bgRect.left + bgRect.width;
            item.style.opacity = (itemX > leftEdge && itemX < rightEdge) ? 1 : 0;
        });
    }

    setInterval(updatePlayerPosition, 1000 / 60);
});