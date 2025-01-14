# Space Explorer Math Puzzle

A fun, interactive math puzzle game for kids where players match equations with their answers by dragging and dropping. Built with pure HTML, CSS, and JavaScript.

## Features

- Drag and drop math puzzles
- Multiple levels with increasing difficulty
- Score tracking and time bonuses
- Sound effects and music
- Dynamic math problem generation
- Responsive design
- No dependencies required

## Quick Start

### Option 1: Local Testing

1. Download all files
2. Create a `sounds` folder and add these sound effects (or your own):
   - `correct.mp3` - played when correct match is made
   - `wrong.mp3` - played when incorrect match is made
   - `level-complete.mp3` - played when level is completed
   
   You can get free sound effects from:
   - https://freesound.org/people/LittleRobotSoundFactory/sounds/270404/ (correct)
   - https://freesound.org/people/LittleRobotSoundFactory/sounds/270403/ (wrong)
   - https://freesound.org/people/LittleRobotSoundFactory/sounds/270402/ (level complete)
   
   Note: Download as MP3 format and rename the files as specified above.
3. Open `index.html` in a web browser

### Option 2: Deploy to GitHub Pages (Free Hosting)

1. Create a GitHub account if you don't have one
2. Create a new repository
3. Upload these files to your repository:
   ```
   space-explorer-puzzle/
   ├── index.html           # Main HTML file
   ├── game.js             # Game logic
   ├── README.md           # This file
   └── sounds/             # Sound effects directory
       ├── correct.mp3     # Sound for correct match
       ├── wrong.mp3       # Sound for wrong match
       └── level-complete.mp3  # Sound for level completion
   ```
4. Go to repository Settings > Pages
5. Select 'main' branch and click Save
6. Your game will be available at `https://[your-username].github.io/[repository-name]`

### Sound Effects Setup

The game uses three sound effects that need to be placed in a `sounds` directory:
1. `correct.mp3` - A short positive sound for correct matches
2. `wrong.mp3` - A short negative sound for incorrect matches
3. `level-complete.mp3` - A victory fanfare for completing a level

If the sound files are missing:
- The game will continue to work without sound
- A warning will appear in the browser console
- The mute button will still be visible but won't affect anything

### Option 3: Deploy to Netlify (Free Hosting)

1. Create a Netlify account at https://www.netlify.com
2. Click "New site from Git"
3. Connect to your GitHub repository
4. Your game will be deployed automatically with a Netlify subdomain

### Option 4: Deploy to Vercel (Free Hosting)

1. Create a Vercel account at https://vercel.com
2. Import your GitHub repository
3. Your game will be deployed automatically with a Vercel subdomain

## File Structure

```
space-explorer-puzzle/
├── index.html           # Main HTML file
├── game.js             # Game logic
├── README.md           # This file
└── sounds/             # Sound effects directory
    ├── correct.mp3     # Correct match sound
    ├── wrong.mp3       # Wrong match sound
    └── level-complete.mp3  # Level completion sound
```

## Features Added

1. **Dynamic Math Problems**:
   - Problems are randomly generated for each level
   - Difficulty increases as you progress
   - Level 1-3: Addition only → Addition & Subtraction → All basic operations
   - Level 4-6: Medium difficulty with all operations
   - Level 7+: Hard difficulty with all operations

2. **Sound Effects**:
   - Correct match sound
   - Wrong match sound
   - Level completion celebration
   - Mute/unmute toggle

## Development

The game is built with vanilla JavaScript and doesn't require any build tools or dependencies. To modify:

1. Edit `index.html` for layout changes
2. Edit `game.js` for game logic changes
3. Test by opening `index.html` in a browser

## License

MIT License - feel free to use, modify, and distribute as needed.

## Contributing

Feel free to open issues or submit pull requests for improvements! 