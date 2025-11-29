// Octopus Chess Game
// Chess pieces unicode symbols
const PIECES = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

// Game state
let gameState = {
    board: [],
    currentPlayer: 'white',
    playerRole: null, // 'head' or 'arm'
    selectedPieceType: null, // for head's choice
    selectedSquare: null,
    validMoves: [],
    gameOver: false,
    winner: null
};

// Initialize the game
function initGame() {
    gameState.board = createInitialBoard();
    gameState.currentPlayer = 'white';
    gameState.selectedPieceType = null;
    gameState.selectedSquare = null;
    gameState.validMoves = [];
    gameState.gameOver = false;
    gameState.winner = null;
}

// Create initial chess board
function createInitialBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));

    // Black pieces
    board[0] = [
        { type: 'rook', color: 'black' },
        { type: 'knight', color: 'black' },
        { type: 'bishop', color: 'black' },
        { type: 'queen', color: 'black' },
        { type: 'king', color: 'black' },
        { type: 'bishop', color: 'black' },
        { type: 'knight', color: 'black' },
        { type: 'rook', color: 'black' }
    ];
    board[1] = Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' }));

    // White pieces
    board[6] = Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' }));
    board[7] = [
        { type: 'rook', color: 'white' },
        { type: 'knight', color: 'white' },
        { type: 'bishop', color: 'white' },
        { type: 'queen', color: 'white' },
        { type: 'king', color: 'white' },
        { type: 'bishop', color: 'white' },
        { type: 'knight', color: 'white' },
        { type: 'rook', color: 'white' }
    ];

    return board;
}

// Role selection
function selectRole(role) {
    gameState.playerRole = role;
    document.getElementById('role-selection').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    const badge = document.getElementById('role-badge');
    badge.textContent = role === 'head' ? '🧠 Head' : '💪 Arm';
    badge.className = `badge ${role}`;

    initGame();
    renderBoard();
    updateGameStatus();
    startPlayerTurn();
}

// Render the chess board
function renderBoard() {
    const boardElement = document.getElementById('chess-board');
    boardElement.innerHTML = '';

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
            square.dataset.row = row;
            square.dataset.col = col;

            const piece = gameState.board[row][col];
            if (piece) {
                square.textContent = PIECES[piece.color][piece.type];
                square.classList.add('has-piece');
            }

            // Highlight selected square
            if (gameState.selectedSquare &&
                gameState.selectedSquare.row === row &&
                gameState.selectedSquare.col === col) {
                square.classList.add('selected');
            }

            // Highlight valid moves
            if (gameState.validMoves.some(move => move.row === row && move.col === col)) {
                square.classList.add('valid-move');
            }

            square.addEventListener('click', () => handleSquareClick(row, col));
            boardElement.appendChild(square);
        }
    }
}

// Handle square click
function handleSquareClick(row, col) {
    if (gameState.gameOver || gameState.currentPlayer === 'black') return;

    const clickedPiece = gameState.board[row][col];

    // Check if clicking on a valid move
    const validMove = gameState.validMoves.find(move => move.row === row && move.col === col);
    if (validMove) {
        makeMove(gameState.selectedSquare.row, gameState.selectedSquare.col, row, col);
        return;
    }

    // For ARM role: can only select pieces of the chosen type
    if (gameState.playerRole === 'arm' && gameState.selectedPieceType) {
        if (clickedPiece &&
            clickedPiece.color === gameState.currentPlayer &&
            clickedPiece.type === gameState.selectedPieceType) {
            selectSquare(row, col);
        }
        return;
    }

    // For HEAD role: can select any own piece
    if (gameState.playerRole === 'head') {
        if (clickedPiece && clickedPiece.color === gameState.currentPlayer) {
            selectSquare(row, col);
        }
    }
}

// Select a square
function selectSquare(row, col) {
    gameState.selectedSquare = { row, col };
    gameState.validMoves = getValidMoves(row, col);
    renderBoard();
}

// Make a move
function makeMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameState.board[fromRow][fromCol];
    gameState.board[toRow][toCol] = piece;
    gameState.board[fromRow][fromCol] = null;

    // Pawn promotion
    if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
        gameState.board[toRow][toCol] = { type: 'queen', color: piece.color };
    }

    gameState.selectedSquare = null;
    gameState.validMoves = [];
    gameState.selectedPieceType = null;

    // Check for game over
    if (isKingCaptured('black')) {
        endGame('white');
        return;
    }

    // Switch turns
    gameState.currentPlayer = 'black';
    renderBoard();
    updateGameStatus();

    // Computer's turn
    setTimeout(computerMove, 800);
}

// Get valid moves for a piece
function getValidMoves(row, col) {
    const piece = gameState.board[row][col];
    if (!piece || piece.color !== gameState.currentPlayer) return [];

    const moves = [];

    switch (piece.type) {
        case 'pawn':
            moves.push(...getPawnMoves(row, col, piece.color));
            break;
        case 'rook':
            moves.push(...getRookMoves(row, col, piece.color));
            break;
        case 'knight':
            moves.push(...getKnightMoves(row, col, piece.color));
            break;
        case 'bishop':
            moves.push(...getBishopMoves(row, col, piece.color));
            break;
        case 'queen':
            moves.push(...getQueenMoves(row, col, piece.color));
            break;
        case 'king':
            moves.push(...getKingMoves(row, col, piece.color));
            break;
    }

    return moves;
}

// Pawn moves
function getPawnMoves(row, col, color) {
    const moves = [];
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;

    // Move forward
    if (isValidPosition(row + direction, col) && !gameState.board[row + direction][col]) {
        moves.push({ row: row + direction, col });

        // Double move from start
        if (row === startRow && !gameState.board[row + 2 * direction][col]) {
            moves.push({ row: row + 2 * direction, col });
        }
    }

    // Capture diagonally
    for (const dcol of [-1, 1]) {
        const newRow = row + direction;
        const newCol = col + dcol;
        if (isValidPosition(newRow, newCol)) {
            const target = gameState.board[newRow][newCol];
            if (target && target.color !== color) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }

    return moves;
}

// Rook moves
function getRookMoves(row, col, color) {
    const moves = [];
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

    for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        while (isValidPosition(r, c)) {
            const target = gameState.board[r][c];
            if (!target) {
                moves.push({ row: r, col: c });
            } else {
                if (target.color !== color) {
                    moves.push({ row: r, col: c });
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }

    return moves;
}

// Knight moves
function getKnightMoves(row, col, color) {
    const moves = [];
    const jumps = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const [dr, dc] of jumps) {
        const r = row + dr;
        const c = col + dc;
        if (isValidPosition(r, c)) {
            const target = gameState.board[r][c];
            if (!target || target.color !== color) {
                moves.push({ row: r, col: c });
            }
        }
    }

    return moves;
}

// Bishop moves
function getBishopMoves(row, col, color) {
    const moves = [];
    const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

    for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        while (isValidPosition(r, c)) {
            const target = gameState.board[r][c];
            if (!target) {
                moves.push({ row: r, col: c });
            } else {
                if (target.color !== color) {
                    moves.push({ row: r, col: c });
                }
                break;
            }
            r += dr;
            c += dc;
        }
    }

    return moves;
}

// Queen moves
function getQueenMoves(row, col, color) {
    return [...getRookMoves(row, col, color), ...getBishopMoves(row, col, color)];
}

// King moves
function getKingMoves(row, col, color) {
    const moves = [];
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (const [dr, dc] of directions) {
        const r = row + dr;
        const c = col + dc;
        if (isValidPosition(r, c)) {
            const target = gameState.board[r][c];
            if (!target || target.color !== color) {
                moves.push({ row: r, col: c });
            }
        }
    }

    return moves;
}

// Check if position is valid
function isValidPosition(row, col) {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Check if king is captured
function isKingCaptured(color) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.type === 'king' && piece.color === color) {
                return false;
            }
        }
    }
    return true;
}

// Computer move (simple AI)
function computerMove() {
    if (gameState.gameOver) return;

    showComputerThinking();

    setTimeout(() => {
        // Get all possible moves for computer (black)
        const allMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = gameState.board[row][col];
                if (piece && piece.color === 'black') {
                    const moves = getValidMoves(row, col);
                    for (const move of moves) {
                        allMoves.push({
                            from: { row, col },
                            to: move,
                            piece: piece.type
                        });
                    }
                }
            }
        }

        if (allMoves.length === 0) {
            endGame('white');
            return;
        }

        // Octopus chess mechanic for computer
        let selectedMove;
        if (gameState.playerRole === 'head') {
            // Computer is ARM: player chose piece type, computer chooses which piece
            // Simulate this by randomly selecting from all moves
            selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        } else {
            // Computer is HEAD: computer chooses piece type, player will choose which piece
            // For computer's turn, just pick a random valid move
            selectedMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        }

        // Make the move
        const { from, to } = selectedMove;
        const piece = gameState.board[from.row][from.col];
        gameState.board[to.row][to.col] = piece;
        gameState.board[from.row][from.col] = null;

        // Pawn promotion
        if (piece.type === 'pawn' && to.row === 7) {
            gameState.board[to.row][to.col] = { type: 'queen', color: 'black' };
        }

        hideComputerThinking();

        // Check for game over
        if (isKingCaptured('white')) {
            endGame('black');
            return;
        }

        // Switch back to player
        gameState.currentPlayer = 'white';
        renderBoard();
        updateGameStatus();
        startPlayerTurn();
    }, 1000);
}

// Start player turn
function startPlayerTurn() {
    if (gameState.gameOver) return;

    if (gameState.playerRole === 'head') {
        showHeadControls();
    } else {
        showArmControls();
    }
}

// Show head controls
function showHeadControls() {
    document.getElementById('head-controls').classList.remove('hidden');
    document.getElementById('arm-controls').classList.add('hidden');

    const buttonsContainer = document.getElementById('piece-type-buttons');
    buttonsContainer.innerHTML = '';

    // Get available piece types
    const pieceTypes = new Set();
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.color === 'white') {
                pieceTypes.add(piece.type);
            }
        }
    }

    const types = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
    for (const type of types) {
        const button = document.createElement('button');
        button.className = 'piece-type-btn';
        button.innerHTML = `${PIECES.white[type]}<span>${type}</span>`;
        button.disabled = !pieceTypes.has(type);
        button.onclick = () => selectPieceType(type);
        buttonsContainer.appendChild(button);
    }
}

// Show arm controls
function showArmControls() {
    document.getElementById('head-controls').classList.add('hidden');
    document.getElementById('arm-controls').classList.remove('hidden');

    // Computer (HEAD) chooses a piece type randomly
    const pieceTypes = new Set();
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = gameState.board[row][col];
            if (piece && piece.color === 'white') {
                pieceTypes.add(piece.type);
            }
        }
    }

    const types = Array.from(pieceTypes);
    const chosenType = types[Math.floor(Math.random() * types.length)];
    gameState.selectedPieceType = chosenType;

    document.getElementById('selected-type-info').textContent =
        `Computer chose: ${PIECES.white[chosenType]} ${chosenType.toUpperCase()}`;
    document.getElementById('arm-instruction').textContent =
        `Select which ${chosenType} to move:`;
}

// Select piece type (HEAD role)
function selectPieceType(type) {
    gameState.selectedPieceType = type;

    // Highlight the selected button
    const buttons = document.querySelectorAll('.piece-type-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    event.target.closest('.piece-type-btn').classList.add('selected');

    // Show instruction
    document.getElementById('selected-type-info').textContent =
        `You chose: ${PIECES.white[type]} ${type.toUpperCase()}. Now select which ${type} to move.`;

    updateGameStatus(`Select a ${type} to move`);
}

// Show/hide computer thinking
function showComputerThinking() {
    document.getElementById('head-controls').classList.add('hidden');
    document.getElementById('arm-controls').classList.add('hidden');
    document.getElementById('computer-thinking').classList.remove('hidden');
}

function hideComputerThinking() {
    document.getElementById('computer-thinking').classList.add('hidden');
}

// Update game status
function updateGameStatus(message) {
    const statusElement = document.getElementById('game-status');
    if (message) {
        statusElement.textContent = message;
    } else if (gameState.currentPlayer === 'white') {
        statusElement.textContent = 'Your turn';
    } else {
        statusElement.textContent = "Computer's turn";
    }
}

// End game
function endGame(winner) {
    gameState.gameOver = true;
    gameState.winner = winner;

    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const message = document.getElementById('game-over-message');

    if (winner === 'white') {
        title.textContent = '🎉 Victory!';
        message.textContent = 'Congratulations! You won the game!';
    } else {
        title.textContent = '😔 Defeat';
        message.textContent = 'The computer won this time. Try again!';
    }

    modal.classList.remove('hidden');
}

// Reset game
function resetGame() {
    document.getElementById('game-over-modal').classList.add('hidden');
    document.getElementById('game-screen').classList.add('hidden');
    document.getElementById('role-selection').classList.remove('hidden');
    gameState.playerRole = null;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Game starts with role selection
});
