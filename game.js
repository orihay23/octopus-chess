// Octopus Chess Game using Chess.js and Chessboard.js
let game = null; // Chess.js game instance
let board = null; // Chessboard.js board instance
let playerRole = null; // 'head' or 'arm'
let selectedPieceType = null; // for the piece type selection
let isPlayerTurn = true;

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

    // Configure board with piece theme
    const config = {
        draggable: playerRole === 'arm', // Only ARM role can drag pieces
        position: 'start',
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
    };

    // Initialize chessboard
    board = Chessboard('chess-board', config);

    // Reset game state
    selectedPieceType = null;
    isPlayerTurn = true;

    updateGameStatus();
    startPlayerTurn();
}

// Handle drag start (only for ARM role)
function onDragStart(source, piece, position, orientation) {
    // Don't allow moves if game is over
    if (game.game_over()) return false;

    // Don't allow moves if it's not player's turn
    if (!isPlayerTurn) return false;

    // Only allow white pieces to be moved by player
    if (piece.search(/^b/) !== -1) return false;

    // For ARM role: computer (head) has already chosen the piece type
    if (playerRole === 'arm') {
        if (!selectedPieceType) {
            return false;
        }
        const pieceType = PIECE_TYPES[piece.charAt(1).toLowerCase()];
        // Can only drag pieces of the chosen type
        return pieceType === selectedPieceType;
    }

    return false; // HEAD role doesn't drag
}

// Handle piece drop (only for ARM role)
function onDrop(source, target) {
    // Try to make the move
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Always promote to queen for simplicity
    });

    // Invalid move
    if (move === null) return 'snapback';

    // Valid move made
    selectedPieceType = null;
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

// Update board position after snap animation
function onSnapEnd() {
    board.position(game.fen());
}

// Start player turn
function startPlayerTurn() {
    isPlayerTurn = true;

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
        `Drag a ${chosenType} to move:`;

    updateGameStatus(`Drag a ${chosenType} to move`);
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
    board.position(game.fen());

    selectedPieceType = null;

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
        board.position(game.fen());

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
    if (board) {
        board.destroy();
    }
}
