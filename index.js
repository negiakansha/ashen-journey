document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('player');
    const background = document.getElementById('background');
    const messages = document.querySelectorAll('.message');

    const spriteWidth = 340;
    const spriteHeight = 340;

    // Get background's position and size
    const bgRect = background.getBoundingClientRect();

    // Set player starting position at bottom center of background
    const position = {
        x: bgRect.left + bgRect.width / 2 - spriteWidth / 2 - 120,
        y: bgRect.top + bgRect.height - spriteHeight
    };

    player.style.left = position.x + 'px';
    player.style.top = position.y + 'px';

    let backgroundX = 0;
    let isJumping = false; // Track if player is jumping
    let velocityY = 0; // Vertical speed (used for gravity effect)
    const gravity = 0.5; // Gravity force
    const jumpHeight = -15; // How high the player jumps
    let moveDirection = 0; // Used to track movement direction (left or right)

    // Set the scaling factor for message movement (how much slower the messages move)
    const backgroundMovementScale = 0.4; // Background moves at 1/4 of the player's speed
    const messageMovementScale = 1; // Messages move at the same speed as background in both directions

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'd') {
            moveDirection = -10; // move background left
            player.style.transform = 'scaleX(-1)';
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
            moveDirection = 10; // move background right
            player.style.transform = 'scaleX(1)';
        } else if ((e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w') && !isJumping) {
            // Space, up arrow, or 'W' for jumping
            isJumping = true;
            velocityY = jumpHeight;
        }
    });

    document.addEventListener('keyup', (e) => {
        // Stop movement when key is released
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') {
            moveDirection = 0; // Stop background movement
        }
    });

    function updatePlayerPosition() {
        // Update the player's vertical position (simulate gravity)
        if (isJumping) {
            position.y += velocityY; // Move up or down based on velocity
            velocityY += gravity; // Apply gravity by increasing velocityY

            // If the player reaches the ground, stop jumping
            if (position.y >= bgRect.top + bgRect.height - spriteHeight) {
                position.y = bgRect.top + bgRect.height - spriteHeight; // Ensure player stays on the ground
                isJumping = false; // Stop jumping
            }
        }

        // Update player position on the screen
        player.style.left = position.x + 'px';
        player.style.top = position.y + 'px';

        // Move the background at a slower speed compared to the player
        backgroundX += moveDirection * backgroundMovementScale;

        // Apply background movement
        background.style.backgroundPosition = `${backgroundX}px 0`;

        // Move the messages more slowly than the background, but adjust for the opposite direction
        messages.forEach((message) => {
            let signPositionX = parseInt(message.style.left, 10) || 0; // Get initial position of the message
            signPositionX += (moveDirection * backgroundMovementScale * messageMovementScale); // Adjust position

            // Check if the message is going out of bounds (left or right)
            const leftEdge = bgRect.left;
            const rightEdge = bgRect.left + bgRect.width;

            if (signPositionX < leftEdge) {
                // Fade out the message as it moves past the left edge
                const opacity = Math.max(0, 1 - ((leftEdge - signPositionX) / 100));
                message.style.opacity = opacity; // Decrease opacity as it goes out of view
            } else if (signPositionX > rightEdge) {
                // Fade out the message as it moves past the right edge
                const opacity = Math.max(0, 1 - ((signPositionX - rightEdge) / 100));
                message.style.opacity = opacity; // Decrease opacity as it goes out of view
            } else {
                message.style.opacity = 1; // Full opacity when the message is within the bounds
            }

            // Update the message position
            message.style.left = `${signPositionX}px`;
        });
    }

    // Call updatePlayerPosition repeatedly to apply gravity and jumping effect
    setInterval(updatePlayerPosition, 1000 / 60); // 60 FPS for smooth movement
});
