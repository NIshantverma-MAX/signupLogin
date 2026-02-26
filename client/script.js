const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let maxParticles = window.innerWidth < 768 ? 100 : 250; // Increased density to match screenshot

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    maxParticles = window.innerWidth < 768 ? 100 : 250;
}

window.addEventListener('resize', resize);
resize();

class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }

    reset() {
        this.x = Math.floor(Math.random() * canvas.width);
        this.y = -10;

        // Exact sizes based on screenshot: 2px to 5px squares
        const r = Math.random();
        if (r > 0.95) this.size = 5;
        else if (r > 0.8) this.size = 4;
        else if (r > 0.4) this.size = 3;
        else this.size = 2;

        // Very slow drifting speed
        this.speedY = (Math.random() * 0.3 + 0.1) * (this.size / 3);
        this.speedX = (Math.random() - 0.5) * 0.1; // tiny amount of horizontal drift

        // Varied opacities to match the dull and bright particles in screenshot
        this.opacity = Math.random() * 0.7 + 0.1;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;

        // Wrap around at bottom
        if (this.y > canvas.height + this.size) {
            this.reset();
        }
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
    }
}

function init() {
    particles = [];
    for (let i = 0; i < maxParticles; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (particles.length < maxParticles) {
        particles.push(new Particle());
    } else if (particles.length > maxParticles) {
        particles.splice(0, particles.length - maxParticles);
    }

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

init();
animate();

// --- Authentication Logic ---
const API_URL = 'http://localhost:5005/api/auth';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }));
                alert('Login successful!');
                window.location.href = 'dashboard.html';
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Ensure the backend server is running.');
        }
    });
}

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = registerForm.name.value;
        const email = registerForm.email.value;
        const password = registerForm.password.value;

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }));
                alert('Registration successful!');
                window.location.href = 'dashboard.html';
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong. Ensure the backend server is running.');
        }
    });
}
