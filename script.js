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
            // Even if it fails, hide the overlay. The user can use the manual toggle.
        });

    }, { once: true }); // This listener will only run once.
    
    // Toggle music play/pause
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


    // --- Community Chain Logic ---
    const nameChainEl = document.getElementById('name-chain');
    const userNameInput = document.getElementById('userName');
    const shareButton = document.getElementById('shareButton');
    
    // Modal elements
    const shareModal = document.getElementById('shareModal');
    const shareLinkInput = document.getElementById('shareLinkInput');
    const closeModalButton = document.getElementById('closeModal');
    const copyButton = document.getElementById('copyButton');
    const copyFeedback = document.getElementById('copyFeedback');

    let currentNames = [];

    // --- Toast Notification Logic ---
    function showToast(message) {
        const toast = document.getElementById('toast-notification');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000); // Hide after 3 seconds
    }


    // Function to update the name chain display
    function updateNameChain() {
        const urlParams = new URLSearchParams(window.location.search);
        const namesParam = urlParams.get('names');
        
        if (namesParam) {
            currentNames = namesParam.split(',').map(name => decodeURIComponent(name.trim()));
            nameChainEl.textContent = currentNames.join(' → ');
        } else {
            nameChainEl.innerHTML = `<em>Be the first to share the light!</em>`;
        }
    }

    // Share button click handler
    shareButton.addEventListener('click', () => {
        const newName = userNameInput.value.trim();
        if (!newName) {
            showToast('Please enter your name.'); // Replaced alert
            return;
        }

        const newNamesList = [...currentNames, newName];
        const newNamesParam = newNamesList.map(name => encodeURIComponent(name)).join(',');

        const newUrl = `${window.location.origin}${window.location.pathname}?names=${newNamesParam}`;
        
        shareLinkInput.value = newUrl;
        shareModal.style.display = 'flex';
        copyFeedback.textContent = '';
    });
    
    // Modal close button
    closeModalButton.addEventListener('click', () => {
        shareModal.style.display = 'none';
    });
    
    // Close modal if clicked outside
    window.addEventListener('click', (event) => {
        if (event.target === shareModal) {
            shareModal.style.display = 'none';
        }
    });

    // Copy to clipboard
    copyButton.addEventListener('click', () => {
        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999); // For mobile devices

        try {
            document.execCommand('copy');
            copyFeedback.textContent = 'Copied to clipboard!';
        } catch (err) {
            copyFeedback.textContent = 'Could not copy. Please copy manually.';
            console.error('Failed to copy text: ', err);
        }
    });
    

    // --- Fireworks Canvas Logic ---
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
            this.speed *= 1.01; // Accelerate slightly
            if (this.y < this.targetY) {
                return true; // Explode
            }
            return false;
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
        const particleCount = 100;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(x, y, hue));
        }
    }

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (Math.random() < 0.03) {
            fireworks.push(new Firework());
        }

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
            if (particles[i].alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    
    // --- Diya Garland Logic ---
    function createDiyaGarland() {
        const garland = document.querySelector('.diya-garland');
        const numDiyas = Math.floor(window.innerWidth / 35); // Adjust density
        let garlandHTML = '';
        for (let i = 0; i < numDiyas; i++) {
            garlandHTML += `
                <div class="garland-diya" style="animation-delay: ${Math.random() * 2}s;">
                    <div class="diya-flame"></div>
                    <div class="diya-wick"></div>
                    <div class="diya-body"></div>
                </div>
            `;
        }
        garland.innerHTML = garlandHTML;
    }


    // --- Initializations ---
    updateNameChain();
    createDiyaGarland();
    animate();
});

