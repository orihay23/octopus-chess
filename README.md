# 🐙 Octopus Chess

A unique chess game where you play against the computer with a twist! In Octopus Chess, you control either the "head" or the "arm" of an octopus, creating a cooperative yet challenging gameplay experience.

## 🎮 How to Play

### Game Concept

In Octopus Chess, the player and computer work as different parts of an octopus controlling the same chess pieces:

- **The Head (🧠)**: Decides WHICH TYPE of piece to move (e.g., knight, bishop, pawn, etc.)
- **The Arm (💪)**: Chooses WHICH SPECIFIC piece of that type to move and where it goes

You choose one role at the start, and play against the computer who takes the opposite role.

### Gameplay

1. **Choose Your Role**: At the start, select whether you want to be the Head or the Arm
2. **Your Turn**:
   - If you're the **Head**: Select which type of piece (pawn, knight, bishop, rook, queen, king) you want to move
   - If you're the **Arm**: The computer will choose a piece type, and you select which specific piece of that type to move
3. **Computer's Turn**: The computer takes the opposite role and makes its move
4. **Win Condition**: Capture the opponent's king to win!

### Chess Rules

- All standard chess movement rules apply
- Pawns promote to queens when reaching the opposite end
- The game ends when either king is captured

## 📱 Mobile-Friendly Features

- **Responsive Design**: Optimized for mobile browsers
- **Touch Controls**: Large, touch-friendly buttons and board squares
- **Portrait & Landscape**: Works in both orientations
- **No Scrolling**: All controls fit on screen
- **Fast Loading**: No external dependencies

## 🚀 Getting Started

Simply open `index.html` in any modern web browser (desktop or mobile):

```bash
# If you have Python installed, you can run a local server:
python -m http.server 8000

# Then open: http://localhost:8000
```

Or just double-click `index.html` to open it directly in your browser.

## 🛠️ Technical Details

- **Pure JavaScript**: No frameworks or libraries required
- **Mobile-First CSS**: Optimized for touch devices
- **Responsive Grid**: Chess board adapts to screen size
- **Simple AI**: Computer makes random valid moves

## 📁 Project Structure

```
octopus-chess/
├── index.html      # Main game interface
├── styles.css      # Mobile-responsive styling
├── game.js         # Chess logic and game mechanics
└── README.md       # This file
```

## 🎯 Features

- ✅ Full chess piece movement (pawns, knights, bishops, rooks, queens, kings)
- ✅ Octopus chess mechanic with Head/Arm roles
- ✅ Simple computer AI opponent
- ✅ Mobile-optimized touch controls
- ✅ Visual feedback for valid moves
- ✅ Pawn promotion
- ✅ Win/lose detection
- ✅ Clean, modern UI

## 🌟 Future Enhancements

Potential improvements:
- Check and checkmate detection (currently simplified to king capture)
- En passant and castling moves
- Move history and undo
- Difficulty levels for AI
- Multiplayer mode
- Move timer

## 📄 License

Open source - feel free to modify and share!

---

Enjoy playing Octopus Chess! 🐙♟️
