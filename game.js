// Game state
let score = 0;
let level = 1;
let timeLeft = 60;
let timer;
let matchedPieces = new Set();
let currentLevelData = null;
let usedProblemsThisSession = new Set();
let mathProblems = null;
let selectedOperation = null;
let selectedDifficulty = null;
let currentUser = '';
let userHighScores = {};

// Sound system with cooldown
const sounds = {
    correct: new Audio('sounds/correct.mp3'),
    wrong: new Audio('sounds/wrong.mp3'),
    levelComplete: new Audio('sounds/level-complete.mp3')
};

let isMuted = false;
let lastSoundTime = 0;
const SOUND_COOLDOWN = 500; // 500ms cooldown between sounds

// Sound play function with cooldown
function playSound(soundName) {
    const now = Date.now();
    if (isMuted || !sounds[soundName] || now - lastSoundTime < SOUND_COOLDOWN) {
        return;
    }
    
    // Stop all sounds
    Object.values(sounds).forEach(sound => {
        sound.pause();
        sound.currentTime = 0;
    });
    
    // Play the new sound
    try {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play();
        lastSoundTime = now;
    } catch (error) {
        console.log('Sound play failed:', error);
    }
}

// Function to create operation selection screen
function showOperationSelection() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    // Hide game elements initially
    document.querySelector('.score-container').style.display = 'none';
    document.getElementById('next-level-btn').style.display = 'none';
    document.getElementById('hint-btn').style.display = 'none';
    document.getElementById('quit-btn').style.display = 'none';
    
    // Create operation selection container
    const selectionContainer = document.createElement('div');
    selectionContainer.className = 'operation-selection';
    
    const title = document.createElement('h2');
    title.textContent = 'Choose an Operation';
    title.style.color = '#00ff9d';
    title.style.marginBottom = '20px';
    
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    const symbols = { addition: '+', subtraction: '-', multiplication: '×', division: '÷' };
    
    // Create difficulty selection first
    const difficultyTitle = document.createElement('h3');
    difficultyTitle.textContent = 'Select Difficulty';
    difficultyTitle.style.color = '#00ff9d';
    difficultyTitle.style.marginTop = '20px';
    
    const difficultyContainer = document.createElement('div');
    difficultyContainer.style.cssText = `
        display: flex;
        gap: 20px;
        margin-bottom: 30px;
        justify-content: center;
        flex-wrap: wrap;
    `;
    
    const difficulties = ['easy', 'medium', 'hard'];
    const difficultyEmojis = { easy: '😊', medium: '🤔', hard: '🤯' };
    
    difficulties.forEach(difficulty => {
        const button = document.createElement('button');
        button.className = 'difficulty-btn';
        button.innerHTML = `${difficulty.toUpperCase()} ${difficultyEmojis[difficulty]}`;
        button.style.cssText = `
            padding: 15px 30px;
            font-size: 1.2em;
            cursor: pointer;
            background: rgba(0, 255, 157, 0.1);
            border: 2px solid #00ff9d;
            color: white;
            border-radius: 10px;
            transition: all 0.3s ease;
            opacity: 0.7;
        `;
        
        button.addEventListener('mouseover', () => {
            button.style.background = 'rgba(0, 255, 157, 0.3)';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.background = 'rgba(0, 255, 157, 0.1)';
        });
        
        button.addEventListener('click', () => {
            // Update selected difficulty
            selectedDifficulty = difficulty;
            
            // Update visual feedback
            document.querySelectorAll('.difficulty-btn').forEach(btn => {
                btn.style.opacity = '0.7';
                btn.style.transform = 'scale(1)';
            });
            button.style.opacity = '1';
            button.style.transform = 'scale(1.1)';
            
            // Show operations after difficulty is selected
            document.getElementById('operations-container').style.display = 'flex';
        });
        
        difficultyContainer.appendChild(button);
    });
    
    // Create operations container
    const operationsContainer = document.createElement('div');
    operationsContainer.id = 'operations-container';
    operationsContainer.style.cssText = `
        display: none;
        flex-direction: column;
        align-items: center;
        gap: 20px;
    `;
    
    const operationsTitle = document.createElement('h3');
    operationsTitle.textContent = 'Select Operation';
    operationsTitle.style.color = '#00ff9d';
    operationsTitle.style.marginTop = '20px';
    
    operations.forEach(operation => {
        const button = document.createElement('button');
        button.className = 'operation-btn';
        button.innerHTML = `${operation.charAt(0).toUpperCase() + operation.slice(1)} ${symbols[operation]}`;
        button.style.cssText = `
            width: 200px;
            padding: 15px;
            font-size: 1.2em;
            margin: 10px;
            cursor: pointer;
            background: rgba(0, 255, 157, 0.1);
            border: 2px solid #00ff9d;
            color: white;
            border-radius: 10px;
            transition: all 0.3s ease;
        `;
        
        button.addEventListener('mouseover', () => {
            if (selectedDifficulty) {
                button.style.background = 'rgba(0, 255, 157, 0.3)';
            }
        });
        
        button.addEventListener('mouseout', () => {
            if (selectedDifficulty) {
                button.style.background = 'rgba(0, 255, 157, 0.1)';
            }
        });
        
        button.addEventListener('click', () => {
            if (selectedDifficulty) {
                selectedOperation = operation;
                startGame();
            } else {
                alert('Please select a difficulty level first!');
            }
        });
        
        operationsContainer.appendChild(button);
    });
    
    selectionContainer.appendChild(title);
    selectionContainer.appendChild(difficultyTitle);
    selectionContainer.appendChild(difficultyContainer);
    selectionContainer.appendChild(operationsTitle);
    selectionContainer.appendChild(operationsContainer);
    
    gameBoard.appendChild(selectionContainer);
}

// Modify generateProblems to use selected difficulty
function generateProblems(level) {
    const problems = [];
    const usedAnswers = new Set();

    // Use the selected difficulty instead of determining by level
    const availableProblems = mathProblems[selectedOperation][selectedDifficulty].filter(
        p => !usedAnswers.has(p.answer) && !usedProblemsThisSession.has(p.text)
    );

    // Get 3 random problems
    while (problems.length < 3 && availableProblems.length > 0) {
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
        availableProblems.splice(randomIndex, 1);
    }

    // If we don't have enough problems, clear session history and try again
    if (problems.length < 3) {
        usedProblemsThisSession.clear();
        return generateProblems(level);
    }

    return problems;
}

// Update startGame function to include difficulty in instructions
function startGame() {
    // Show game elements
    document.querySelector('.score-container').style.display = 'flex';
    document.getElementById('next-level-btn').style.display = 'block';
    document.getElementById('hint-btn').style.display = 'block';
    
    // Make sure quit button is visible
    const quitBtn = document.getElementById('quit-btn');
    if (quitBtn) {
        quitBtn.style.display = 'block';
    }
    
    // Reset game state
    score = 0;
    level = 1;
    usedProblemsThisSession.clear();
    
    // Update instructions to include difficulty
    const instructions = document.querySelector('.instructions');
    instructions.innerHTML = `
        <p>Level ${level} - ${selectedDifficulty.toUpperCase()} ${selectedOperation} problems</p>
        <p>🎯 Drag each equation to its correct answer</p>
    `;
    
    // Start the game
    initLevel();
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

// Function to load high scores from localStorage
function loadHighScores() {
    const savedScores = localStorage.getItem('mathPuzzleHighScores');
    if (savedScores) {
        userHighScores = JSON.parse(savedScores);
    }
}

// Function to save high scores to localStorage
function saveHighScore(user, score) {
    userHighScores[user] = Math.max(score, userHighScores[user] || 0);
    localStorage.setItem('mathPuzzleHighScores', JSON.stringify(userHighScores));
}

// Function to show user name prompt
function showNamePrompt() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    // Hide game elements
    document.querySelector('.score-container').style.display = 'none';
    document.getElementById('next-level-btn').style.display = 'none';
    document.getElementById('hint-btn').style.display = 'none';
    
    const promptContainer = document.createElement('div');
    promptContainer.className = 'name-prompt';
    promptContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 30px;
        padding: 40px;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Welcome to Math Puzzle Master!';
    title.style.color = '#00ff9d';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter your name';
    input.style.cssText = `
        padding: 15px;
        font-size: 1.2em;
        border-radius: 10px;
        border: 2px solid #00ff9d;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        width: 250px;
        text-align: center;
    `;
    
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Playing! 🚀';
    startButton.className = 'operation-btn';
    startButton.style.cssText = `
        width: 250px;
        padding: 15px;
        font-size: 1.2em;
        margin: 10px;
        cursor: pointer;
        background: rgba(0, 255, 157, 0.1);
        border: 2px solid #00ff9d;
        color: white;
        border-radius: 10px;
        transition: all 0.3s ease;
    `;
    
    startButton.addEventListener('click', () => {
        const name = input.value.trim();
        if (name) {
            currentUser = name;
            showOperationSelection();
        } else {
            alert('Please enter your name to continue!');
        }
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startButton.click();
        }
    });
    
    promptContainer.appendChild(title);
    promptContainer.appendChild(input);
    promptContainer.appendChild(startButton);
    gameBoard.appendChild(promptContainer);
}

// Modify handleLevelComplete to check for high score
function handleLevelComplete() {
    clearInterval(timer);
    playSound('levelComplete');
    score += Math.ceil(timeLeft / 10);
    
    // Check if this is a new high score
    const currentHighScore = userHighScores[currentUser] || 0;
    const isNewHighScore = score > currentHighScore;
    
    if (isNewHighScore) {
        saveHighScore(currentUser, score);
        // Create high score celebration
        const rocket = document.createElement('div');
        rocket.className = 'rocket';
        rocket.innerHTML = '🚀';
        rocket.style.cssText = `
            position: fixed;
            font-size: 3em;
            left: -50px;
            top: 50%;
            transform: translateY(-50%);
            animation: flyAcross 2s linear forwards;
            z-index: 1000;
        `;
        document.body.appendChild(rocket);
        
        // Add animation style if not already present
        if (!document.querySelector('#rocket-animation')) {
            const style = document.createElement('style');
            style.id = 'rocket-animation';
            style.textContent = `
                @keyframes flyAcross {
                    from { left: -50px; }
                    to { left: calc(100% + 50px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Remove rocket after animation
        setTimeout(() => rocket.remove(), 2000);
    }
    
    const message = document.createElement('div');
    message.className = 'level-complete-message';
    message.innerHTML = `
        <h2>Level ${level} Complete! 🎉</h2>
        <p>Time Bonus: +${Math.ceil(timeLeft / 10)} ⭐</p>
        <p>Total Score: ${score} ⭐</p>
        ${isNewHighScore ? `<p class="new-high-score">🏆 New High Score! 🏆</p>` : 
        `<p>High Score: ${currentHighScore} ⭐</p>`}
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

// Add touch support variables
let isDragging = false;
let currentDragElement = null;
let touchOffset = { x: 0, y: 0 };

function handleTouchStart(e) {
    const touch = e.touches[0];
    const piece = e.target.closest('.puzzle-piece');
    if (!piece) return;
    
    e.preventDefault(); // Prevent scrolling while dragging
    isDragging = true;
    currentDragElement = piece;
    
    // Calculate offset between touch point and element position
    const rect = piece.getBoundingClientRect();
    touchOffset.x = touch.clientX - rect.left;
    touchOffset.y = touch.clientY - rect.top;
    
    // Add visual feedback
    piece.classList.add('dragging');
    piece.style.zIndex = '1000';
}

function handleTouchMove(e) {
    if (!isDragging || !currentDragElement) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    
    // Update element position
    const gameBoard = document.getElementById('gameBoard');
    const boardRect = gameBoard.getBoundingClientRect();
    
    // Calculate new position relative to game board
    let newX = touch.clientX - boardRect.left - touchOffset.x;
    let newY = touch.clientY - boardRect.top - touchOffset.y;
    
    // Keep the piece within the game board bounds
    newX = Math.max(0, Math.min(newX, boardRect.width - currentDragElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, boardRect.height - currentDragElement.offsetHeight));
    
    currentDragElement.style.left = `${newX}px`;
    currentDragElement.style.top = `${newY}px`;
    
    // Handle target spot highlighting
    const targetSpots = document.querySelectorAll('.target-spot');
    targetSpots.forEach(spot => {
        const spotRect = spot.getBoundingClientRect();
        if (touch.clientX >= spotRect.left && touch.clientX <= spotRect.right &&
            touch.clientY >= spotRect.top && touch.clientY <= spotRect.bottom) {
            spot.classList.add('drag-over');
        } else {
            spot.classList.remove('drag-over');
        }
    });
}

function handleTouchEnd(e) {
    if (!isDragging || !currentDragElement) return;
    
    const touch = e.changedTouches[0];
    const targetSpots = document.querySelectorAll('.target-spot');
    let matchFound = false;
    
    targetSpots.forEach(spot => {
        const spotRect = spot.getBoundingClientRect();
        if (touch.clientX >= spotRect.left && touch.clientX <= spotRect.right &&
            touch.clientY >= spotRect.top && touch.clientY <= spotRect.bottom) {
            
            // Handle the drop using the same logic as handleDrop
            const pieceId = currentDragElement.id;
            const correctTarget = currentLevelData.targets.find(t => t.id === pieceId);
            
            if (correctTarget && spot.dataset.answer === correctTarget.text) {
                matchedPieces.add(pieceId);
                currentDragElement.style.opacity = '0.5';
                currentDragElement.setAttribute('draggable', 'false');
                spot.classList.add('matched');
                playSound('correct');
                
                if (matchedPieces.size === currentLevelData.pieces.length) {
                    handleLevelComplete();
                }
                matchFound = true;
            }
        }
        spot.classList.remove('drag-over');
    });
    
    if (!matchFound) {
        // Return to original position
        const originalPiece = currentLevelData.pieces.find(p => p.id === currentDragElement.id);
        currentDragElement.style.left = `${originalPiece.x}px`;
        currentDragElement.style.top = `${originalPiece.y}px`;
        playSound('wrong');
    }
    
    currentDragElement.classList.remove('dragging');
    currentDragElement.style.zIndex = '1';
    isDragging = false;
    currentDragElement = null;
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
        
        // Add both touch and mouse event listeners
        pieceElement.addEventListener('dragstart', handleDragStart);
        pieceElement.addEventListener('dragend', handleDragEnd);
        pieceElement.addEventListener('touchstart', handleTouchStart);
        
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
        
        // Show operation selection instead of initializing game directly
        showOperationSelection();
    } catch (error) {
        console.error('Error loading math problems:', error);
        alert('Error loading math problems. Please check the console for details.');
    }
}

function quitGame() {
    // Clear any ongoing game state
    clearInterval(timer);
    matchedPieces.clear();
    usedProblemsThisSession.clear();
    
    // Remove any level complete message if present
    document.querySelector('.level-complete-message')?.remove();
    
    // Reset scores and level
    score = 0;
    level = 1;
    
    // Show operation selection
    showOperationSelection();
}

// Set up event listeners
window.addEventListener('load', () => {
    // Load high scores
    loadHighScores();
    
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
    
    // Add quit button
    const quitBtn = document.createElement('button');
    quitBtn.id = 'quit-btn';
    quitBtn.innerHTML = 'Quit Game 🚪';
    quitBtn.className = 'game-button';
    quitBtn.style.cssText = `
        background: rgba(255, 75, 75, 0.8);
        color: white;
        display: none;
        margin-right: 10px;
    `;
    
    quitBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
            quitGame();
        }
    });
    
    const buttonContainer = document.querySelector('.button-container');
    buttonContainer.insertBefore(quitBtn, buttonContainer.firstChild);
    buttonContainer.appendChild(muteBtn);
    
    // Start with name prompt
    loadMathProblems().then(() => {
        showNamePrompt();
    });
    
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
    gameBoard.addEventListener('touchend', handleTouchEnd);
});