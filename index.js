document.addEventListener('DOMContentLoaded', () => {
    const MAX_BACKGROUND_X = 0;
    const player = document.getElementById('player');
    const background = document.getElementById('background');
    const messages = document.querySelectorAll('.message');
    const interactables = document.querySelectorAll('.interactable');
    const dialogueBox = document.getElementById('dialogue-box');

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
    const jumpHeight = -15;
    let moveDirection = 0;

    const backgroundMovementScale = 0.4;
    const messageMovementScale = 1;

    const targetPosition = {
        x: -1821.9999542236328,
        y: 332.5187759399414
    };

    const interactionRangeX = 400;
    const proximityThreshold = 20;

    const dialogueOptions = [
        "Welcome, Ashen One...",
        "Let my flames guide you.",
        "You are held in her embrace.",
        "You received the Kiss of Flame."
    ];
    let currentDialogueIndex = 0;
    let isPlayerInRange = false;

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
            if (isPlayerInRange) {
                if (currentDialogueIndex < dialogueOptions.length) {
                    dialogueBox.style.display = 'block';
                    dialogueBox.innerHTML = dialogueOptions[currentDialogueIndex];
                    currentDialogueIndex++;
                } else {
                    dialogueBox.style.display = 'none';
                    currentDialogueIndex = 0;
                }
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

        if (nextBackgroundX > MAX_BACKGROUND_X) {
            return;
        }

        backgroundX = nextBackgroundX;
        background.style.backgroundPosition = `${backgroundX}px 0`;

        const playerInBgX = position.x + backgroundX;
        const distanceToTargetX = Math.abs(playerInBgX - targetPosition.x);
        const distanceToTargetY = Math.abs(position.y - targetPosition.y);

        // Update if player is in range
        if (distanceToTargetX <= interactionRangeX && distanceToTargetY <= proximityThreshold) {
            isPlayerInRange = true;
        } else {
            isPlayerInRange = false;
            dialogueBox.style.display = 'none';
            currentDialogueIndex = 0;
        }

        // Messages
        messages.forEach((message) => {
            let signPositionX = parseInt(message.style.left, 10) || 0;
            signPositionX += (moveDirection * backgroundMovementScale * messageMovementScale);

            const leftEdge = bgRect.left;
            const rightEdge = bgRect.left + bgRect.width;

            if (signPositionX < leftEdge) {
                const opacity = Math.max(0, 1 - ((leftEdge - signPositionX) / 100));
                message.style.opacity = opacity;
            } else if (signPositionX > rightEdge) {
                const opacity = Math.max(0, 1 - ((signPositionX - rightEdge) / 100));
                message.style.opacity = opacity;
            } else {
                message.style.opacity = 1;
            }

            message.style.left = `${signPositionX}px`;
        });

        // Interactables
        interactables.forEach((item) => {
            let itemX = parseInt(item.style.left, 10) || 0;
            itemX += moveDirection * backgroundMovementScale;
            item.style.left = `${itemX}px`;

            const leftEdge = bgRect.left;
            const rightEdge = bgRect.left + bgRect.width;

            if (itemX > leftEdge && itemX < rightEdge) {
                item.style.opacity = 1;
            } else {
                item.style.opacity = 0;
            }
        });
    }

    setInterval(updatePlayerPosition, 1000 / 60);
});
