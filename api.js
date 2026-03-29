/**
 * api.js - Service layer for MindMate Backend Integration
 * This file isolates all backend API communication.
 * For the hackathon MVP, we are simulating local latency
 * so the frontend UI can be fully functional before the Python API is ready.
 */

// Simulated AI responses based on selected Mood
const MOCK_INTENTS = {
    'Happy': [
        "That's wonderful to hear! What's making you feel happy today?",
        "I'm glad you're feeling good! Embracing positive emotions is so important. Would you like to save this memory?",
        "Awesome! It's a great time to channel that energy into something you love."
    ],
    'Calm': [
        "It's great that you're feeling calm. Staying rooted in the present is wonderful.",
        "Peace of mind is a beautiful thing. If there's anything you'd like to reflect on, I'm here.",
        "Nice and relaxed. Let me know if you want to log your thoughts for the day."
    ],
    'Stressed': [
        "I hear you. Stress can really build up. Try to take a moment for yourself. How does a quick 4-7-8 breathing exercise sound?",
        "It's okay to feel stressed. Let's break down whatever is on your plate. What is weighing heavily on your mind?",
        "I'm sorry you're feeling stressed. Remember to be kind to yourself. Would you like a mindful breathing tip?"
    ],
    'Anxious': [
        "Anxiety can be really overwhelming, but you're in a safe space right now. Try to take a slow, deep breath. Can you tell me 3 things you can see near you?",
        "I'm here for you. When anxiety hits, grounding techniques can help. Would you like to talk about what's making you anxious?",
        "It's completely normal to feel anxious sometimes. Your feelings are valid. Let’s focus on the present moment together."
    ],
    'Sad': [
        "I'm really sorry you're feeling this way. I'm here to listen if you want to share why you're feeling sad.",
        "It takes courage to admit when we're down. Be gentle with yourself today. Do you want to talk about it?",
        "Sadness can feel heavy. But it's temporary. Remember, reaching out to friends or professionals is always a good idea when the weight is too much."
    ],
    'Overwhelmed': [
        "When things feel like too much, it's totally okay to hit pause. Take a deep breath with me: Inhale... Exhale. What's the smallest step you could take right now?",
        "It happens to the best of us. Let's not worry about the big picture right now. What's just one thing we can focus on?",
        "Being overwhelmed is tough. Please remember you don't have to carry it all. This is a safe space to vent."
    ],
    'Default': [
        "I'm here to listen. Tell me more about what's on your mind.",
        "Thank you for sharing that with me. How can I support you best right now?",
        "I'm a safe space. No judgment here, just an open ear."
    ]
};

// State to hold the current session mood
let currentSessionMood = 'Default';

const AIBackendMock = {
    /**
     * Initializes the session with a mood.
     */
    setMood: (mood) => {
        currentSessionMood = mood;
        console.log(`[API] Session mood set to: ${mood}`);
    },

    /**
     * Sends a message to the AI Engine and returns a promise resolving the response.
     * Replace this with actual `fetch` to Python backend later.
     */
    sendMessage: async (userMessage) => {
        console.log(`[API] Sending to Python Backend: "${userMessage}"`);
        
        return new Promise((resolve) => {
            // Simulate network latency (1.5 to 3 seconds)
            const delay = Math.random() * 1500 + 1500;
            
            setTimeout(() => {
                // Return a mock response matching the initial mood context, with some randomness
                const potentialResponses = MOCK_INTENTS[currentSessionMood] || MOCK_INTENTS['Default'];
                const randomResponse = potentialResponses[Math.floor(Math.random() * potentialResponses.length)];
                
                // For hackathon: If user mentions "exercise" or "breathe", inject our breathing widget (future feature placeholder)
                let reply = randomResponse;
                if (userMessage.toLowerCase().includes('breathe') || userMessage.toLowerCase().includes('help')) {
                    reply = "Take a moment to breathe with me. Inhale for 4 seconds... Hold for 7 seconds... Exhale for 8 seconds. You're doing great.";
                }

                resolve({
                    success: true,
                    message: reply,
                    timestamp: new Date().toISOString()
                });
                
            }, delay);
        });
    }
};
