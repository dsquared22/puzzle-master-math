// Game state
let score = 0;
let level = 1;
let timeLeft = 60;
let timer;
let matchedPieces = new Set();
let currentLevelData = null;
let usedProblemsThisSession = new Set();
let mathProblems = null;

// Sound effects
const sounds = {};

// Function to load sounds with enhanced error handling and debugging
function loadSounds() {
    console.log('Starting to load sounds...');
    const soundFiles = {
        correct: 'sounds/correct.mp3',
        wrong: 'sounds/wrong.mp3',
        levelComplete: 'sounds/level-complete.mp3'
    };

    for (const [name, path] of Object.entries(soundFiles)) {
        console.log(`Attempting to load sound: ${name} from path: ${path}`);
        const audio = new Audio();
        
        audio.addEventListener('canplaythrough', () => {
            console.log(`Sound ${name} loaded successfully`);
        });
        
        audio.addEventListener('error', (e) => {
            console.error(`Sound ${name} failed to load from path ${path}:`, e);
            console.error('Error code:', e.target.error ? e.target.error.code : 'unknown');
            sounds[name] = null; // Mark as unavailable
        });
        
        audio.src = path;
        sounds[name] = audio;
    }
}

// Function to play sound with enhanced error handling
function playSound(soundName) {
    console.log(`Attempting to play sound: ${soundName}`);
    console.log(`Mute state: ${isMuted}`);
    
    if (!sounds[soundName]) {
        console.warn(`Sound ${soundName} is not available`);
        return;
    }
    
    if (!isMuted) {
        const sound = sounds[soundName].cloneNode();
        sound.play()
            .then(() => {
                console.log(`Sound ${soundName} played successfully`);
            })
            .catch(e => {
                console.error(`Sound ${soundName} failed to play:`, e);
                // Try playing without cloning as fallback
                sounds[soundName].play().catch(e => {
                    console.error(`Fallback play for ${soundName} also failed:`, e);
                });
            });
    }
}

// Mute state
let isMuted = false;

// Function to generate problems for a level
function generateProblems(level) {
    const problems = [];
    const usedAnswers = new Set();
    let difficulty;
    let operations;

    // Define difficulty and operations based on level
    if (level <= 3) {
        difficulty = 'easy';
        operations = level === 1 ? ['addition'] 
                  : level === 2 ? ['addition', 'subtraction']
                  : ['addition', 'subtraction', 'multiplication'];
    } else if (level <= 6) {
        difficulty = 'medium';
        operations = ['addition', 'subtraction', 'multiplication', 'division'];
    } else {
        difficulty = 'hard';
        operations = ['addition', 'subtraction', 'multiplication', 'division'];
    }

    // Get random problems with unique answers
    while (problems.length < 3) {
        const operation = operations[Math.floor(Math.random() * operations.length)];
        if (!mathProblems[operation]) continue; // Skip if operation not found
        
        const availableProblems = mathProblems[operation][difficulty].filter(
            p => !usedAnswers.has(p.answer) && !usedProblemsThisSession.has(p.text)
        );
        
        if (availableProblems.length === 0) {
            // If we run out of unused problems, clear the session history for this difficulty
            usedProblemsThisSession.clear();
            continue;
        }
        
        const randomIndex = Math.floor(Math.random() * availableProblems.length);
        const problem = availableProblems[randomIndex];
        
        problems.push({
            id: `eq${problems.length + 1}`,
            text: problem.text,
            answer: problem.answer,
            x: 50,
            y: 50 + (problems.length * 120)
        });
        
        usedAnswers.add(problem.answer);
        usedProblemsThisSession.add(problem.text);
    }

    return problems;
}

// Function to create level data with random problems
function createLevelData(level) {
    console.log('Creating level data for level:', level);
    const pieces = generateProblems(level);
    console.log('Generated pieces:', pieces);
    
    const targets = pieces.map((piece, index) => ({
        id: piece.id,
        text: piece.answer,
        x: 750,
        y: [170, 290, 50][index] // Keep the same target positions as original levels
    }));
    
    console.log('Generated targets:', targets);
    return { pieces, targets };
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.target.closest('.target-spot')?.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.target.closest('.target-spot')?.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    const targetSpot = e.target.closest('.target-spot');
    if (!targetSpot) return;
    
    targetSpot.classList.remove('drag-over');
    const pieceId = e.dataTransfer.getData('text/plain');
    const piece = document.getElementById(pieceId);
    if (!piece) return;
    
    const correctTarget = currentLevelData.targets.find(t => t.id === pieceId);
    if (correctTarget && targetSpot.dataset.answer === correctTarget.text) {
        // Correct match
        matchedPieces.add(pieceId);
        piece.style.opacity = '0.5';
        piece.setAttribute('draggable', 'false');
        targetSpot.classList.add('matched');
        playSound('correct');
        
        // Check if level is complete
        if (matchedPieces.size === currentLevelData.pieces.length) {
            handleLevelComplete();
        }
    } else {
        // Wrong match
        playSound('wrong');
        piece.style.left = `${currentLevelData.pieces.find(p => p.id === pieceId).x}px`;
        piece.style.top = `${currentLevelData.pieces.find(p => p.id === pieceId).y}px`;
    }
}

function handleLevelComplete() {
    clearInterval(timer);
    playSound('levelComplete');
    score += Math.ceil(timeLeft / 10);
    
    const message = document.createElement('div');
    message.className = 'level-complete-message';
    message.innerHTML = `
        <h2>Level ${level} Complete! 🎉</h2>
        <p>Time Bonus: +${Math.ceil(timeLeft / 10)} ⭐</p>
        <p>Total Score: ${score} ⭐</p>
    `;
    document.body.appendChild(message);
    
    document.getElementById('next-level-btn').disabled = false;
}

function nextLevel() {
    level++;
    document.querySelector('.level-complete-message')?.remove();
    document.getElementById('next-level-btn').disabled = true;
    initLevel();
}

function updateTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        document.getElementById('timer').textContent = timeLeft;
    } else {
        clearInterval(timer);
        alert('Time\'s up! Try again.');
        initLevel(); // Restart the current level
    }
}

function initLevel() {
    console.log('Initializing level:', level);
    // Reset game state
    timeLeft = 60;
    matchedPieces.clear();
    document.getElementById('level').textContent = level;
    document.getElementById('score').textContent = score;
    document.getElementById('timer').textContent = timeLeft;
    
    // Clear previous level
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    // Create new level data
    currentLevelData = createLevelData(level);
    console.log('Current level data:', currentLevelData);
    
    // Create puzzle pieces
    currentLevelData.pieces.forEach(piece => {
        const pieceElement = document.createElement('div');
        pieceElement.id = piece.id;
        pieceElement.className = 'puzzle-piece';
        pieceElement.textContent = piece.text;
        pieceElement.draggable = true;
        pieceElement.style.left = `${piece.x}px`;
        pieceElement.style.top = `${piece.y}px`;
        
        pieceElement.addEventListener('dragstart', handleDragStart);
        pieceElement.addEventListener('dragend', handleDragEnd);
        
        gameBoard.appendChild(pieceElement);
    });
    
    // Create target spots
    currentLevelData.targets.forEach(target => {
        const targetSpot = document.createElement('div');
        targetSpot.className = 'target-spot';
        targetSpot.textContent = target.text;
        targetSpot.style.left = `${target.x}px`;
        targetSpot.style.top = `${target.y}px`;
        targetSpot.dataset.answer = target.text;
        
        targetSpot.addEventListener('dragover', handleDragOver);
        targetSpot.addEventListener('dragleave', handleDragLeave);
        targetSpot.addEventListener('drop', handleDrop);
        
        gameBoard.appendChild(targetSpot);
    });
    
    // Start timer
    clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
}

// Load math problems from JSON file
async function loadMathProblems() {
    try {
        console.log('Attempting to load math problems...');
        const response = await fetch('mathProblems.json');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        mathProblems = JSON.parse(text);
        console.log('Math problems loaded successfully');
        console.log('Available operations:', Object.keys(mathProblems));
        
        // Initialize game after loading problems
        initLevel();
    } catch (error) {
        console.error('Error loading math problems:', error);
        alert('Error loading math problems. Please check the console for details.');
    }
}

// Set up event listeners
window.addEventListener('load', () => {
    // Load sounds first
    loadSounds();
    
    // Set up button listeners
    document.getElementById('next-level-btn').addEventListener('click', nextLevel);
    document.getElementById('hint-btn').addEventListener('click', () => {
        alert('Match the math problems on the left with their answers on the right!');
    });
    
    // Add mute button
    const muteBtn = document.createElement('button');
    muteBtn.id = 'mute-btn';
    muteBtn.innerHTML = '🔊';
    muteBtn.style.marginLeft = '10px';
    muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        muteBtn.innerHTML = isMuted ? '🔇' : '🔊';
    });
    document.querySelector('.button-container').appendChild(muteBtn);
    
    // Load math problems and start the game
    loadMathProblems();
});