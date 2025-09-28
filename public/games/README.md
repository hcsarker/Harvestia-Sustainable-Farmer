# Unity WebGL Games Upload Instructions

## 📁 Upload Your Unity WebGL Build Files Here:

### Game 1 Location:

```
public/games/game1/
├── Build/
│   ├── YourGame.loader.js
│   ├── YourGame.framework.js
│   ├── YourGame.data
│   └── YourGame.wasm
├── TemplateData/
│   ├── favicon.ico
│   ├── fullscreen-button.png
│   ├── progress-bar-empty-dark.png
│   ├── progress-bar-full-dark.png
│   ├── unity-logo-dark.png
│   ├── webgl-logo.png
│   └── style.css
└── index.html
```

### Game 2 Location:

```
public/games/game2/
├── Build/
├── TemplateData/
└── index.html
```

## 🔧 After Upload:

1. Update games-config.json with your game details
2. Change "enabled": false to "enabled": true
3. Update title, description, difficulty
4. Commit and push changes

## 📋 Game Info Required:

- **Title**: Your game name
- **Description**: Brief description
- **Difficulty**: Easy/Medium/Hard
- **Duration**: Estimated play time
- **Category**: Unity Game/Simulation/Educational

## 🚀 Integration:

After uploading files, the system will automatically:

- Detect your games
- Create game cards
- Enable game launching
- Handle loading/error states
