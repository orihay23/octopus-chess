// Octopus Chess Game using Chess.js with click-to-select interface
let game = null; // Chess.js game instance
let playerRole = null; // 'head' or 'arm'
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

// Role selection
function selectRole(role) {
    playerRole = role;
    document.getElementById('role-selection').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    const badge = document.getElementById('role-badge');
    badge.textContent = role === 'head' ? '🧠 Head' : '💪 Arm';
    badge.className = `badge ${role}`;

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

    // Computer (HEAD) chooses a piece type
    const availablePieces = getAvailablePieceTypes('w');
    const types = Array.from(availablePieces);

    if (types.length === 0) {
        endGame('black');
        return;
    }

    const chosenType = types[Math.floor(Math.random() * types.length)];
    selectedPieceType = chosenType;

    document.getElementById('selected-type-info').textContent =
        `Computer chose: ${PIECE_SYMBOLS[chosenType]} ${chosenType.toUpperCase()}`;
    document.getElementById('arm-instruction').textContent =
        `Click a ${chosenType} to select, then click where to move:`;

    updateGameStatus(`Select a ${chosenType} to move`);
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

    // Pick a random move of that type
    const selectedMove = typeMoves[Math.floor(Math.random() * typeMoves.length)];

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
        // Computer just picks a random valid move
        const possibleMoves = game.moves({ verbose: true });

        if (possibleMoves.length === 0) {
            endGame('white');
            return;
        }

        const selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

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
}
