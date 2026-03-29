// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;

const aboutBtn = document.getElementById('about-btn');
const profileBtn = document.getElementById('profile-btn');
const aboutModal = document.getElementById('about-modal');
const profileModal = document.getElementById('profile-modal');
const closeModals = document.querySelectorAll('.close-modal');

// Auth DOM Elements
const loggedOutView = document.getElementById('logged-out-view');
const loggedInView = document.getElementById('logged-in-view');
const userAvatar = document.getElementById('user-avatar');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const signOutBtn = document.getElementById('sign-out-btn');

const welcomeView = document.getElementById('welcome-view');
const chatView = document.getElementById('chat-view');
const moodBtns = document.querySelectorAll('.mood-btn');
const startChatBtn = document.getElementById('start-chat-btn');

const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const chatFeed = document.getElementById('chat-feed');
const typingIndicator = document.getElementById('typing-indicator');

const avatarItems = document.querySelectorAll('.avatar-item');

let selectedMood = '';

// --- Theme Management ---
function initTheme() {
    const savedTheme = localStorage.getItem('mindmate-theme');
    if (savedTheme) {
        htmlEl.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }
}

function toggleTheme() {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('mindmate-theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    themeToggle.innerHTML = theme === 'dark' ? "<i class='bx bx-sun'></i>" : "<i class='bx bx-moon'></i>";
}

themeToggle.addEventListener('click', toggleTheme);
initTheme();


// --- Modal Management ---
function openModal(modal) {
    modal.classList.remove('hidden');
}

function closeModal() {
    aboutModal.classList.add('hidden');
    profileModal.classList.add('hidden');
}

aboutBtn.addEventListener('click', () => openModal(aboutModal));
profileBtn.addEventListener('click', () => openModal(profileModal));
closeModals.forEach(btn => btn.addEventListener('click', closeModal));

// Close on outside click
window.addEventListener('click', (e) => {
    if (e.target === aboutModal) closeModal();
    if (e.target === profileModal) closeModal();
});

// --- Google Authentication ---
const GOOGLE_CLIENT_ID = '605123823226-63n1q2g2qo3f2dq4itkmshhgrd08fmu1.apps.googleusercontent.com';

function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    localStorage.setItem('mindmate_user', JSON.stringify({
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture
    }));
    updateAuthUI();
}

function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('mindmate_user'));
    
    if (user) {
        loggedOutView.style.display = 'none';
        loggedInView.style.display = 'flex';
        loggedInView.classList.remove('hidden');
        
        userAvatar.src = user.picture;
        userName.textContent = user.name;
        userEmail.textContent = user.email;
    } else {
        loggedOutView.style.display = 'block';
        loggedInView.style.display = 'none';
        loggedInView.classList.add('hidden');
    }
}

// Initialize Google SDK
window.onload = function () {
    if (window.google) {
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse
        });
        google.accounts.id.renderButton(
            document.getElementById("googleButton"),
            { theme: "outline", size: "large", width: 250, text: "continue_with" }
        );
        google.accounts.id.prompt();
    }
    updateAuthUI();
};

if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
        localStorage.removeItem('mindmate_user');
        updateAuthUI();
    });
}

// --- Avatar Selection ---
avatarItems.forEach(item => {
    item.addEventListener('click', () => {
        avatarItems.forEach(a => a.classList.remove('selected'));
        item.classList.add('selected');
    });
});


// --- Mood Selection & View Transitions ---
moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove selection from others
        moodBtns.forEach(b => b.classList.remove('selected'));

        // Add to clicked
        btn.classList.add('selected');
        selectedMood = btn.getAttribute('data-mood');

        // Enable start button
        startChatBtn.removeAttribute('disabled');
    });
});

startChatBtn.addEventListener('click', () => {
    if (!selectedMood) return;

    // Send mood to the mock backend API
    AIBackendMock.setMood(selectedMood);

    // Transition views
    welcomeView.classList.add('hidden');
    chatView.classList.remove('hidden');

    // Add initial greeting based on mood
    setTimeout(() => {
        addMessage(`Hi there. I see you're feeling **${selectedMood.toLowerCase()}** today. I'm here to listen. How can I help you?`, 'ai');
    }, 500);
});


// --- Chat System ---
function formatText(text) {
    // Basic markdown support for bold text
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');

    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('message-bubble');
    bubbleDiv.innerHTML = formatText(text);

    messageDiv.appendChild(bubbleDiv);
    chatFeed.appendChild(messageDiv);

    scrollToBottom();
}

function scrollToBottom() {
    chatFeed.scrollTop = chatFeed.scrollHeight;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = messageInput.value.trim();
    if (!text) return;

    // Add user message
    addMessage(text, 'user');
    messageInput.value = '';

    // Show typing indicator
    typingIndicator.classList.remove('hidden');
    scrollToBottom();

    // Fetch from mock API
    const response = await AIBackendMock.sendMessage(text);

    // Hide typing indicator
    typingIndicator.classList.add('hidden');

    // Add AI message
    addMessage(response.message, 'ai');
});
