document.addEventListener('DOMContentLoaded', () => {

    const music = document.getElementById('bg-music');
    const musicToggleButton = document.getElementById('music-toggle');
    const volumeOnIcon = musicToggleButton.querySelector('.feather-volume-2');
    const volumeOffIcon = musicToggleButton.querySelector('.feather-volume-x');
    const entryOverlay = document.getElementById('entry-overlay');

    // --- Entry and Music Logic ---
    entryOverlay.addEventListener('click', () => {
        entryOverlay.classList.add('hidden');
        
        music.play().then(() => {
            // Success
            volumeOnIcon.style.display = 'block';
            volumeOffIcon.style.display = 'none';
        }).catch(error => {
            console.log("Music playback failed, user may need to interact with the mute button.", error);
        });

    }, { once: true });
    
    musicToggleButton.addEventListener('click', () => {
        if (music.paused) {
            music.play();
            volumeOnIcon.style.display = 'block';
            volumeOffIcon.style.display = 'none';
        } else {
            music.pause();
            volumeOnIcon.style.display = 'none';
            volumeOffIcon.style.display = 'block';
        }
    });

    // --- Wishing & Sharing Logic ---
    const wishesHeaderEl = document.getElementById('wishes-header');
    const senderNameDisplayEl = document.getElementById('sender-name-display');
    const userNameInput = document.getElementById('userName');
    const shareButton = document.getElementById('shareButton');
    
    const shareModal = document.getElementById('shareModal');
    const shareLinkInput = document.getElementById('shareLinkInput');
    const closeModalButton = document.getElementById('closeModal');
    const copyButton = document.getElementById('copyButton');
    const copyFeedback = document.getElementById('copyFeedback');
    const whatsappShareLink = document.getElementById('whatsappShareLink');

    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Function to get the sender's name from the URL and display it
    function displaySenderName() {
        const urlParams = new URLSearchParams(window.location.search);
        const senderName = urlParams.get('from');
        
        if (senderName) {
            wishesHeaderEl.textContent = "A Special Wish From:";
            senderNameDisplayEl.textContent = decodeURIComponent(senderName.trim());
        } else {
            // This is the default state if no name is in the URL
            wishesHeaderEl.textContent = "A Wish For You";
            senderNameDisplayEl.textContent = "This beautiful wish is sent to you with joy.";
        }
    }

    // Share button click handler
    
    shareButton.addEventListener('click', () => {
        const yourName = userNameInput.value.trim();
        if (!yourName) {
            showToast('Please enter your name.');
            return;
        }

        // The new URL will only contain the new sender's name
        const newUrl = `${window.location.origin}${window.location.pathname}?from=${encodeURIComponent(yourName)}`;
        
        shareLinkInput.value = newUrl;
        
        // Create and update the WhatsApp share link
        // We no longer add the video URL directly to the message.
        // The meta tags in index.html will handle the video preview.
        const wishMessage = `*🪔 Happy Diwali! 🪔*\n\n${yourName} is sending you a special video greeting for the festival of lights!\n\nClick here to see your wish: ${newUrl}`;
        
        whatsappShareLink.href = `https://wa.me/?text=${encodeURIComponent(wishMessage)}`;
        
        shareModal.style.display = 'flex';
        copyFeedback.textContent = '';
        copyButton.textContent = 'Copy Link';
    });
    
    // Modal handling
    closeModalButton.addEventListener('click', () => {
        shareModal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === shareModal) {
            shareModal.style.display = 'none';
        }
    });

    copyButton.addEventListener('click', () => {
        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999);
        try {
            document.execCommand('copy');
            copyFeedback.textContent = 'Copied to clipboard!';
        } catch (err) {
            copyFeedback.textContent = 'Could not copy.';
        }
    });
    
    // --- Canvas & Animation Logic (No changes here) ---
    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let fireworks = [];
    let particles = [];

    class Firework {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = canvas.height;
            this.targetX = Math.random() * canvas.width;
            this.targetY = Math.random() * (canvas.height / 2);
            this.speed = 2;
            this.angle = Math.atan2(this.targetY - this.y, this.targetX - this.x);
            this.hue = Math.random() * 360;
        }
        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.speed *= 1.01;
            return this.y < this.targetY;
        }
        draw() {
            ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    class Particle {
        constructor(x, y, hue) {
            this.x = x;
            this.y = y;
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 5 + 1;
            this.friction = 0.97;
            this.gravity = 0.5;
            this.hue = hue;
            this.alpha = 1;
            this.decay = Math.random() * 0.03 + 0.01;
        }
        update() {
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;
        }
        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    function createParticles(x, y, hue) {
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle(x, y, hue));
        }
    }

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (Math.random() < 0.03) fireworks.push(new Firework());
        for (let i = fireworks.length - 1; i >= 0; i--) {
            fireworks[i].draw();
            if (fireworks[i].update()) {
                createParticles(fireworks[i].x, fireworks[i].y, fireworks[i].hue);
                fireworks.splice(i, 1);
            }
        }
        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].draw();
            particles[i].update();
            if (particles[i].alpha <= 0) particles.splice(i, 1);
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    function createDiyaGarland() {
        const garland = document.querySelector('.diya-garland');
        const numDiyas = Math.floor(window.innerWidth / 35);
        let garlandHTML = '';
        for (let i = 0; i < numDiyas; i++) {
            garlandHTML += `
                <div class="garland-diya" style="animation-delay: ${Math.random() * 2}s;">
                    <div class="diya-flame"></div>
                    <div class="diya-wick"></div>
                    <div class="diya-body"></div>
                </div>`;
        }
        garland.innerHTML = garlandHTML;
    }

    // --- Initializations ---
    displaySenderName();
    createDiyaGarland();
    animate();
});

