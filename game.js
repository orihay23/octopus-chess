// Octopus Chess Game using Chess.js with click-to-select interface
let game = null; // Chess.js game instance
let playerRole = null; // 'head' or 'arm'
let difficultyLevel = 0; // AI difficulty 0-5
let selectedPieceType = null; // for the piece type selection
let selectedSquare = null; // for click-to-select
let validMoves = []; // valid destination squares
let isPlayerTurn = true;

// Chess pieces unicode symbols
const PIECES = {
    w: {
        p: '♙',
        n: '♘',
        b: '♗',
        r: '♖',
        q: '♕',
        k: '♔'
    },
    b: {
        p: '♟',
        n: '♞',
        b: '♝',
        r: '♜',
        q: '♛',
        k: '♚'
    }
};

// Piece type mapping
const PIECE_TYPES = {
    'p': 'pawn',
    'n': 'knight',
    'b': 'bishop',
    'r': 'rook',
    'q': 'queen',
    'k': 'king'
};

const PIECE_SYMBOLS = {
    'pawn': '♟',
    'knight': '♞',
    'bishop': '♝',
    'rook': '♜',
    'queen': '♛',
    'king': '♚'
};

// Piece values for AI evaluation
const PIECE_VALUES = {
    'p': 1,
    'n': 3,
    'b': 3,
    'r': 5,
    'q': 9,
    'k': 0
};

// Positional bonuses for pieces (simplified)
const POSITION_BONUS = {
    'p': [
        0, 0, 0, 0, 0, 0, 0, 0,
        5, 5, 5, 5, 5, 5, 5, 5,
        1, 1, 2, 3, 3, 2, 1, 1,
        0.5, 0.5, 1, 2.5, 2.5, 1, 0.5, 0.5,
        0, 0, 0, 2, 2, 0, 0, 0,
        0.5, -0.5, -1, 0, 0, -1, -0.5, 0.5,
        0.5, 1, 1, -2, -2, 1, 1, 0.5,
        0, 0, 0, 0, 0, 0, 0, 0
    ],
    'n': [
        -5, -4, -3, -3, -3, -3, -4, -5,
        -4, -2, 0, 0, 0, 0, -2, -4,
        -3, 0, 1, 1.5, 1.5, 1, 0, -3,
        -3, 0.5, 1.5, 2, 2, 1.5, 0.5, -3,
        -3, 0, 1.5, 2, 2, 1.5, 0, -3,
        -3, 0.5, 1, 1.5, 1.5, 1, 0.5, -3,
        -4, -2, 0, 0.5, 0.5, 0, -2, -4,
        -5, -4, -3, -3, -3, -3, -4, -5
    ]
};

// Role selection
function selectRole(role) {
    playerRole = role;
    document.getElementById('role-selection').classList.add('hidden');
    document.getElementById('difficulty-selection').classList.remove('hidden');
}

// Back to role selection
function backToRoleSelection() {
    document.getElementById('difficulty-selection').classList.add('hidden');
    document.getElementById('role-selection').classList.remove('hidden');
    playerRole = null;
}

// Difficulty selection
function selectDifficulty(level) {
    difficultyLevel = level;
    document.getElementById('difficulty-selection').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    const badge = document.getElementById('role-badge');
    badge.textContent = playerRole === 'head' ? '🧠 Head' : '💪 Arm';
    badge.className = `badge ${playerRole}`;

    initGame();
}

// Initialize the game
function initGame() {
    // Create new chess game
    game = new Chess();

    // Reset game state
    selectedPieceType = null;
    selectedSquare = null;
    validMoves = [];
    isPlayerTurn = true;

    renderBoard();
    updateGameStatus();
    startPlayerTurn();
}

// Render the chess board
function renderBoard() {
    const boardElement = document.getElementById('chess-board');
    boardElement.innerHTML = '';

    const board = game.board();

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            const squareName = String.fromCharCode(97 + col) + (8 - row);

            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.square = squareName;

            const piece = board[row][col];
            if (piece) {
                const pieceSpan = document.createElement('span');
                pieceSpan.className = 'piece';
                pieceSpan.textContent = PIECES[piece.color][piece.type];
                square.appendChild(pieceSpan);
            }

            // Highlight selected square
            if (selectedSquare === squareName) {
                square.classList.add('selected');
            }

            // Highlight valid moves
            if (validMoves.includes(squareName)) {
                square.classList.add('valid-move');
                if (piece) {
                    square.classList.add('capture');
                }
            }

            square.addEventListener('click', () => handleSquareClick(squareName));
            boardElement.appendChild(square);
        }
    }
}

// Handle square click
function handleSquareClick(square) {
    if (!isPlayerTurn || game.game_over()) return;

    // For HEAD role, don't allow clicking on board
    if (playerRole === 'head') return;

    // Check if clicking on a valid destination
    if (validMoves.includes(square)) {
        makeMove(selectedSquare, square);
        return;
    }

    // For ARM role: can only select pieces of the chosen type
    if (playerRole === 'arm' && selectedPieceType) {
        const piece = game.get(square);
        if (piece && piece.color === 'w' && PIECE_TYPES[piece.type] === selectedPieceType) {
            selectPiece(square);
        } else if (selectedSquare) {
            // Deselect if clicking elsewhere
            selectedSquare = null;
            validMoves = [];
            renderBoard();
        }
    }
}

// Select a piece
function selectPiece(square) {
    selectedSquare = square;

    // Get valid moves for this piece
    const moves = game.moves({ square: square, verbose: true });
    validMoves = moves.map(move => move.to);

    renderBoard();
}

// Make a move
function makeMove(from, to) {
    const move = game.move({
        from: from,
        to: to,
        promotion: 'q' // Always promote to queen
    });

    if (!move) return;

    selectedSquare = null;
    validMoves = [];
    selectedPieceType = null;

    renderBoard();
    updateGameStatus();

    // Check for game over
    if (game.game_over()) {
        setTimeout(() => {
            if (game.in_checkmate()) {
                endGame('white');
            } else {
                endGame('draw');
            }
        }, 200);
        return;
    }

    // Computer's turn
    isPlayerTurn = false;
    setTimeout(computerMove, 500);
}

// Start player turn
function startPlayerTurn() {
    isPlayerTurn = true;
    selectedSquare = null;
    validMoves = [];
    renderBoard();

    if (playerRole === 'head') {
        showHeadControls();
    } else {
        showArmControls();
    }
}

// Show head controls (choose piece type)
function showHeadControls() {
    document.getElementById('head-controls').classList.remove('hidden');
    document.getElementById('arm-controls').classList.add('hidden');
    document.getElementById('computer-thinking').classList.add('hidden');

    const buttonsContainer = document.getElementById('piece-type-buttons');
    buttonsContainer.innerHTML = '';

    // Get available piece types for white
    const availablePieces = getAvailablePieceTypes('w');

    // Create buttons for each piece type
    const types = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
    for (const type of types) {
        const button = document.createElement('button');
        button.className = 'piece-type-btn';
        button.innerHTML = `${PIECE_SYMBOLS[type]}<span>${type}</span>`;
        button.disabled = !availablePieces.has(type);
        button.onclick = () => selectPieceTypeAsHead(type);
        buttonsContainer.appendChild(button);
    }

    updateGameStatus('Choose a piece type to move');
}

// Show arm controls (computer chose piece type)
function showArmControls() {
    document.getElementById('head-controls').classList.add('hidden');
    document.getElementById('arm-controls').classList.remove('hidden');
    document.getElementById('computer-thinking').classList.add('hidden');

    // Computer (HEAD) chooses a piece type using AI
    const availablePieces = getAvailablePieceTypes('w');
    const types = Array.from(availablePieces);

    if (types.length === 0) {
        endGame('black');
        return;
    }

    const chosenType = choosePieceTypeWithAI(types, 'w');
    selectedPieceType = chosenType;

    document.getElementById('selected-type-info').textContent =
        `Computer chose: ${PIECE_SYMBOLS[chosenType]} ${chosenType.toUpperCase()}`;
    document.getElementById('arm-instruction').textContent =
        `Click a ${chosenType} to select, then click where to move:`;

    updateGameStatus(`Select a ${chosenType} to move`);
}

// AI chooses best piece type
function choosePieceTypeWithAI(types, color) {
    if (difficultyLevel === 0) {
        return types[Math.floor(Math.random() * types.length)];
    }

    // For higher levels, evaluate which piece type has best moves
    let bestType = types[0];
    let bestScore = -Infinity;

    for (const type of types) {
        const allMoves = game.moves({ verbose: true });
        const typeMoves = allMoves.filter(move => {
            const piece = game.get(move.from);
            return piece && PIECE_TYPES[piece.type] === type;
        });

        if (typeMoves.length === 0) continue;

        // Evaluate moves for this type
        let typeScore = 0;
        for (const move of typeMoves) {
            const score = evaluateMove(move, color, 0);
            typeScore = Math.max(typeScore, score);
        }

        if (typeScore > bestScore) {
            bestScore = typeScore;
            bestType = type;
        }
    }

    return bestType;
}

// Select piece type as HEAD - computer makes the move
function selectPieceTypeAsHead(type) {
    selectedPieceType = type;

    // Highlight the selected button
    const buttons = document.querySelectorAll('.piece-type-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    event.target.closest('.piece-type-btn').classList.add('selected');

    updateGameStatus(`Computer is moving a ${type}...`);

    // Computer makes a move with the selected piece type
    setTimeout(() => {
        makePlayerTeamMove(type);
    }, 800);
}

// Make a move for the player's team (when player is HEAD)
function makePlayerTeamMove(pieceType) {
    if (game.game_over()) return;

    // Get all moves for the selected piece type
    const allMoves = game.moves({ verbose: true });
    const typeMoves = allMoves.filter(move => {
        const piece = game.get(move.from);
        return piece && PIECE_TYPES[piece.type] === pieceType;
    });

    if (typeMoves.length === 0) {
        updateGameStatus('No valid moves for that piece type!');
        selectedPieceType = null;
        showHeadControls();
        return;
    }

    // Pick best move using AI
    const selectedMove = chooseBestMove(typeMoves, 'w');

    // Make the move
    game.move(selectedMove);
    selectedPieceType = null;

    renderBoard();
    updateGameStatus();

    // Check for game over
    if (game.game_over()) {
        setTimeout(() => {
            if (game.in_checkmate()) {
                endGame('white');
            } else {
                endGame('draw');
            }
        }, 200);
        return;
    }

    // Computer's turn
    isPlayerTurn = false;
    setTimeout(computerMove, 500);
}

// Choose best move from available moves using AI
function chooseBestMove(moves, color) {
    if (difficultyLevel === 0) {
        return moves[Math.floor(Math.random() * moves.length)];
    }

    let bestMove = moves[0];
    let bestScore = -Infinity;

    for (const move of moves) {
        const score = evaluateMove(move, color, 0); // Start at depth 0
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }

    return bestMove;
}

// Evaluate a move based on difficulty level (with depth to prevent infinite recursion)
function evaluateMove(move, color, depth = 0) {
    let score = 0;

    // Level 1+: Prefer captures
    if (difficultyLevel >= 1 && move.captured) {
        score += PIECE_VALUES[move.captured] * 10;
    }

    // Level 2+: Avoid hanging pieces
    if (difficultyLevel >= 2) {
        // Simple check: is the destination square attacked?
        game.move(move);
        const isAttacked = isSquareAttacked(move.to, color === 'w' ? 'b' : 'w');
        game.undo();

        if (isAttacked) {
            score -= PIECE_VALUES[move.piece] * 5;
        }
    }

    // Level 3+: Material evaluation
    if (difficultyLevel >= 3) {
        game.move(move);
        const materialScore = evaluateMaterial(color);
        game.undo();
        score += materialScore;
    }

    // Level 4+: Positional evaluation
    if (difficultyLevel >= 4) {
        const posScore = evaluatePosition(move, color);
        score += posScore;
    }

    // Level 5: Look ahead one move (only at depth 0 to prevent infinite recursion)
    if (difficultyLevel >= 5 && depth === 0) {
        game.move(move);
        const opponentColor = color === 'w' ? 'b' : 'w';
        const opponentMoves = game.moves({ verbose: true });

        let worstResponse = Infinity;
        // Evaluate top opponent responses
        for (let i = 0; i < Math.min(10, opponentMoves.length); i++) {
            const oppMove = opponentMoves[i];
            // Evaluate opponent's move at depth 1 (won't trigger look-ahead)
            const oppScore = evaluateMove(oppMove, opponentColor, 1);
            worstResponse = Math.min(worstResponse, -oppScore);
        }

        score += worstResponse * 0.5;
        game.undo();
    }

    // Add small random factor
    score += Math.random() * 0.5;

    return score;
}

// Check if a square is attacked by a color
function isSquareAttacked(square, attackerColor) {
    const moves = game.moves({ verbose: true });
    for (const move of moves) {
        const piece = game.get(move.from);
        if (piece && piece.color === attackerColor && move.to === square) {
            return true;
        }
    }
    return false;
}

// Evaluate material advantage
function evaluateMaterial(color) {
    const board = game.board();
    let score = 0;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece) {
                const value = PIECE_VALUES[piece.type];
                if (piece.color === color) {
                    score += value;
                } else {
                    score -= value;
                }
            }
        }
    }

    return score;
}

// Evaluate position
function evaluatePosition(move, color) {
    let score = 0;

    // Use position tables if available
    if (POSITION_BONUS[move.piece]) {
        const board = game.board();
        let toIndex = 0;

        // Find the index in the position table
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const sq = String.fromCharCode(97 + col) + (8 - row);
                if (sq === move.to) {
                    toIndex = row * 8 + col;
                    break;
                }
            }
        }

        score += POSITION_BONUS[move.piece][toIndex];
    }

    // Bonus for central control
    const centerSquares = ['d4', 'd5', 'e4', 'e5'];
    if (centerSquares.includes(move.to)) {
        score += 0.5;
    }

    return score;
}

// Get available piece types that have valid moves
function getAvailablePieceTypes(color) {
    const types = new Set();
    const moves = game.moves({ verbose: true });

    for (const move of moves) {
        const piece = game.get(move.from);
        if (piece && piece.color === color) {
            types.add(PIECE_TYPES[piece.type]);
        }
    }

    return types;
}

// Computer move (opponent)
function computerMove() {
    if (game.game_over()) return;

    showComputerThinking();

    setTimeout(() => {
        // Computer just picks best move using AI
        const possibleMoves = game.moves({ verbose: true });

        if (possibleMoves.length === 0) {
            endGame('white');
            return;
        }

        const selectedMove = chooseBestMove(possibleMoves, 'b');

        // Make the move
        game.move(selectedMove);

        renderBoard();
        hideComputerThinking();

        // Check for game over
        if (game.game_over()) {
            setTimeout(() => {
                if (game.in_checkmate()) {
                    endGame('black');
                } else {
                    endGame('draw');
                }
            }, 200);
            return;
        }

        // Player's turn
        startPlayerTurn();
    }, 1000);
}

// Show/hide computer thinking
function showComputerThinking() {
    document.getElementById('head-controls').classList.add('hidden');
    document.getElementById('arm-controls').classList.add('hidden');
    document.getElementById('computer-thinking').classList.remove('hidden');
    updateGameStatus("Computer's turn");
}

function hideComputerThinking() {
    document.getElementById('computer-thinking').classList.add('hidden');
}

// Update game status
function updateGameStatus(message) {
    const statusElement = document.getElementById('game-status');
    if (message) {
        statusElement.textContent = message;
    } else if (isPlayerTurn) {
        statusElement.textContent = 'Your turn';
    } else {
        statusElement.textContent = "Computer's turn";
    }
}

// End game
function endGame(winner) {
    isPlayerTurn = false;

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const message = document.getElementById('game-over-message');

    if (winner === 'white') {
        title.textContent = '🎉 Victory!';
        message.textContent = 'Congratulations! You won the game!';
    } else if (winner === 'black') {
        title.textContent = '😔 Defeat';
        message.textContent = 'The computer won this time. Try again!';
    } else {
        title.textContent = '🤝 Draw';
        message.textContent = 'The game ended in a draw!';
    }

    modal.classList.remove('hidden');
}

// Reset game
function resetGame() {
    document.getElementById('game-over-modal').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('role-selection').classList.remove('hidden');
    playerRole = null;
    selectedPieceType = null;
    selectedSquare = null;
    validMoves = [];
    difficultyLevel = 0;
}
