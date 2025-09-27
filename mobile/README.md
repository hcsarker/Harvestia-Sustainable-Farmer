# 🌱 Harvestia Mobile - Sustainable Farming App

A React Native mobile application for sustainable farming education and management, built with Expo and TypeScript.

## 📱 Features

### 🔐 Authentication

- **Sign In/Sign Up**: Complete user registration and login system
- **Session Management**: Persistent user sessions with secure token handling
- **Profile Management**: User profile with achievements and statistics

### 🏠 Dashboard

- **Weather Integration**: Real-time weather data for farming decisions
- **Quick Actions**: Fast access to key farming tools and features
- **Progress Tracking**: Visual progress indicators and achievements
- **Stats Overview**: Farming statistics and performance metrics

### 📖 Story Mode

- **Interactive Journey**: Engaging farming story progression
- **Educational Content**: Learn sustainable farming practices through stories
- **Progress Tracking**: Track your journey through different farming scenarios

### 🎓 Courses

- **Learning Modules**: Comprehensive farming education courses
- **Progress Tracking**: Track completion and achievements
- **Interactive Content**: Engaging learning materials and quizzes
- **Certificates**: Earn certificates upon course completion

### 🎮 Games & Simulations

- **Educational Games**: Fun mini-games that teach farming concepts
- **Simulations**: Realistic farming scenario simulations
- **Progress Tracking**: Game progress and high scores
- **Learning Rewards**: Earn points and achievements through gameplay

### ⚙️ Settings

- **App Preferences**: Customize notifications, dark mode, sound
- **Data Management**: Export progress, clear cache
- **Account Settings**: Privacy policy, terms of service
- **Sign Out**: Secure logout functionality

## 🛠️ Technical Stack

### Frontend

- **React Native**: Cross-platform mobile development
- **Expo SDK 51**: Development platform and tools
- **TypeScript**: Type-safe JavaScript development
- **React Navigation**: Navigation library for screens and tabs

### Backend & Services

- **Supabase**: Backend-as-a-Service for authentication and data
- **AsyncStorage**: Local data persistence
- **Environment Variables**: Secure configuration management

### Development Tools

- **Metro**: JavaScript bundler for React Native
- **Expo CLI**: Development and build tools
- **TypeScript Compiler**: Type checking and compilation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Expo CLI (install globally: `npm install -g @expo/cli`)
- Android Studio (for Android development) or Xcode (for iOS development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Harvestia-Sustainable-Farmer/mobile
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### Running the App

#### Development Mode

```bash
npm start
```

Then scan the QR code with Expo Go app on your phone or press:

- `a` for Android emulator
- `i` for iOS simulator
- `w` for web browser

#### Production Build

```bash
# Android
npx expo build:android

# iOS
npx expo build:ios
```

## 📁 Project Structure

```
mobile/
├── App.tsx                 # Main app entry point
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create from .env.example)
├── src/
│   ├── contexts/
│   │   └── SessionContext.tsx    # Authentication context
│   ├── screens/
│   │   ├── AuthScreen.tsx        # Login/Signup screen
│   │   ├── DashboardScreen.tsx   # Main dashboard
│   │   ├── CoursesScreen.tsx     # Learning courses
│   │   ├── GamesScreen.tsx       # Games and simulations
│   │   ├── ProfileScreen.tsx     # User profile
│   │   ├── SettingsScreen.tsx    # App settings
│   │   └── index.ts              # Screen exports
│   └── types/
│       └── index.ts              # TypeScript type definitions
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the mobile directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Setup

1. Create a new Supabase project
2. Set up authentication (email/password)
3. Create necessary database tables
4. Copy your project URL and anon key to `.env`

## 📱 Screens Overview

### 🔐 Authentication Screen

- User registration and login
- Form validation and error handling
- Secure token management

### 🏠 Dashboard Screen

- Weather widget with current conditions
- Quick action buttons for common tasks
- Progress overview and statistics
- Recent activities and achievements

### 📖 Story Screen

- Interactive farming journey
- Educational storytelling
- Progress tracking through scenarios

### 🎓 Courses Screen

- Course catalog with categories
- Progress tracking and completion status
- Interactive learning modules
- Achievement system

### 🎮 Games Screen

- Mini-game collection
- Educational simulations
- Leaderboards and achievements
- Filtering and search functionality

### 👤 Profile Screen

- User information and avatar
- Achievement badges and statistics
- Progress overview
- Account management options

### ⚙️ Settings Screen

- App preferences (notifications, dark mode)
- Data management options
- About and legal information
- Sign out functionality

## 🎨 Design System

### Colors

- **Primary Green**: `#10B981` (Brand color)
- **Secondary Gray**: `#6b7280` (Text and icons)
- **Background**: `#f8f9fa` (Light background)
- **Success**: `#059669` (Positive actions)
- **Error**: `#ef4444` (Errors and warnings)

### Typography

- **Headers**: Bold, larger sizes for screen titles
- **Body**: Regular weight for content text
- **Labels**: Medium weight for form labels and buttons

### Icons

- Emoji-based icons for consistent cross-platform appearance
- Semantic icons that represent their function clearly

## 🔒 Security

- **Environment Variables**: Sensitive data stored securely
- **Authentication Tokens**: Secure storage with AsyncStorage
- **Session Management**: Automatic token refresh and validation
- **Data Validation**: Input validation on all forms

## 🚧 Development

### Code Style

- TypeScript for type safety
- Consistent component structure
- Props interfaces for all components
- Async/await for promise handling

### Testing

```bash
# Run tests (when test suite is added)
npm test
```

### Debugging

- Use Expo Developer Tools for debugging
- React Native Debugger for advanced debugging
- Metro bundler logs for build issues

## 📈 Performance

- **Optimized Images**: Compressed assets for faster loading
- **Lazy Loading**: Components loaded on demand
- **Efficient Navigation**: Optimized screen transitions
- **Memory Management**: Proper cleanup and state management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Contact the development team
- Check the documentation

## 🚀 Deployment

### Expo Build Service (EAS)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure EAS
eas build:configure

# Build for production
eas build --platform all
```

### Standalone App

```bash
# Generate APK for Android
eas build --platform android

# Generate IPA for iOS
eas build --platform ios
```

---

**Made with 💚 for sustainable farming education**
