// Game state
let score = 0;
let level = 1;
let timeLeft = 60;
let timer;
let matchedPieces = new Set();
let currentLevelData = null;
let usedProblemsThisSession = new Set();
let mathProblems = null;
let selectedOperation = null; // Track selected operation

// Function to create operation selection screen
function showOperationSelection() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    
    // Hide game elements initially
    document.querySelector('.score-container').style.display = 'none';
    document.getElementById('next-level-btn').style.display = 'none';
    document.getElementById('hint-btn').style.display = 'none';
    
    // Create operation selection container
    const selectionContainer = document.createElement('div');
    selectionContainer.className = 'operation-selection';
    selectionContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 20px;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Choose an Operation';
    title.style.color = '#00ff9d';
    
    const operations = ['addition', 'subtraction', 'multiplication', 'division'];
    const symbols = { addition: '+', subtraction: '-', multiplication: '×', division: '÷' };
    
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
            button.style.background = 'rgba(0, 255, 157, 0.3)';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.background = 'rgba(0, 255, 157, 0.1)';
        });
        
        button.addEventListener('click', () => {
            selectedOperation = operation;
            startGame();
        });
        
        selectionContainer.appendChild(button);
    });
    
    gameBoard.appendChild(title);
    gameBoard.appendChild(selectionContainer);
}

// Modify generateProblems to use only selected operation
function generateProblems(level) {
    const problems = [];
    const usedAnswers = new Set();
    let difficulty;

    // Define difficulty based on level
    if (level <= 3) {
        difficulty = 'easy';
    } else if (level <= 6) {
        difficulty = 'medium';
    } else {
        difficulty = 'hard';
    }

    // Get problems only from selected operation
    const availableProblems = mathProblems[selectedOperation][difficulty].filter(
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

function startGame() {
    // Show game elements
    document.querySelector('.score-container').style.display = 'flex';
    document.getElementById('next-level-btn').style.display = 'block';
    document.getElementById('hint-btn').style.display = 'block';
    
    // Reset game state
    score = 0;
    level = 1;
    usedProblemsThisSession.clear();
    
    // Update instructions for selected operation
    const instructions = document.querySelector('.instructions');
    instructions.innerHTML = `
        <p>Level ${level} - Match the ${selectedOperation} problems with their answers!</p>
        <p>🎯 Drag each equation to its correct answer</p>
    `;
    
    // Start the game
    initLevel();
}

// Modify window.onload to show operation selection first
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
    
    // Load math problems then show operation selection
    loadMathProblems().then(() => {
        showOperationSelection();
    });
});

// ... rest of the existing code ...