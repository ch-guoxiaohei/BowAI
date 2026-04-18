# Archer AI Project

Archer Training Assistant - Professional Archery Training and Scoring Application

## Project Overview

This is a professional archery training and scoring application built with the uni-app framework, supporting cross-platform deployment (Web, Android, iOS). The application provides counter functionality, scoring system, data statistics, and other features to help archery enthusiasts record training data, calculate scores, and improve training effectiveness.

## Features

### ✅ Completed Features

#### Counter Module
- Arrow counting functionality
- Custom step value setting (1-50 arrows)
- Real-time timer
- Training record saving
- Date range filtering
- Training trend charts (line/bar charts)
- Pagination display (default 10 items per page)

#### Scoring Module
- Complete scoring system
- Support for multiple bow types (Recurve, Compound, Traditional)
- Support for multiple distances (18m, 30m, 50m, 70m, 90m)
- Support for multiple target faces (122cm, 80cm, 60cm, 40cm)
- Real-time scoring and timing
- Round score bar charts
- Detailed record display
- Date range filtering
- Pagination display (default 10 items per page)

#### Settings Module
- Dark mode toggle
- Language switching (Simplified Chinese/English)
- Notification settings
- Data export (JSON format)
- Data clearing functionality
- About information

### ⏳ Pending Features
- Data statistics and analysis
- Global dark mode application
- Multi-language translation completion

## Tech Stack

- **Framework**: uni-app (Vue 3)
- **State Management**: Vuex
- **Chart Library**: @qiun/ucharts
- **Build Tool**: Vite
- **Code Standards**: ESLint
- **Styling**: SCSS

## Project Structure

```
archer-ai-project/
├── src/
│   ├── pages/
│   │   ├── index/           # Home page
│   │   ├── training/        # Counter module
│   │   │   ├── training.vue # Counter list
│   │   │   └── current.vue  # Counting page
│   │   ├── scoring/         # Scoring module
│   │   │   ├── scoring.vue  # Scoring list
│   │   │   ├── current.vue  # Scoring page
│   │   │   └── details.vue  # Scoring details
│   │   └── settings/        # Settings page
│   ├── store/
│   │   └── modules/
│   │       ├── app.js       # App state
│   │       ├── training.js  # Counter state
│   │       └── scoring.js   # Scoring state
│   ├── utils/
│   │   └── storage.js      # Storage utilities
│   └── App.vue
├── docs/                    # Documentation directory
├── dist/                    # Build output
├── package.json
├── vite.config.js
├── .eslintrc.js
└── POC文档.md
```

## Quick Start

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
# H5 Development
npm run dev:h5

# Android Development
npm run dev:app-android

# iOS Development
npm run dev:app-ios
```

### Production Build

```bash
# H5 Build
npm run build:h5

# Android Build
npm run build:app-android

# iOS Build
npm run build:app-ios
```

## Data Storage

The application uses uni-app's local storage API for data persistence:

- **Training Records**: `training_sessions`
- **Scoring Records**: `scoring_sessions`
- **App Settings**: `settings`

### Data Management Strategy

- Automatic data archiving: Automatically archive when exceeding 100 records
- Regular data cleanup: Automatically clean data older than 30 days
- Paginated loading: Support paginated display of large amounts of data
- Storage monitoring: Real-time monitoring of storage space usage

For detailed documentation, please refer to [STORAGE_GUIDE.md](docs/STORAGE_GUIDE.md)

## Platform Support

### Web (H5)
- ✅ Full support
- ✅ Responsive design
- ✅ PWA support

### Android
- ✅ Full support
- ✅ Local data persistence
- ✅ Native performance

### iOS
- ⏳ Pending testing

## Development Guide

### Code Standards

The project uses ESLint for code standards checking:

```bash
npm run lint
```

### Documentation

- [POC文档.md](POC文档.md) - Project concept validation document
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide
- [STORAGE_GUIDE.md](docs/STORAGE_GUIDE.md) - Storage strategy guide
- [SECURITY.md](docs/SECURITY.md) - Security guide

## Known Limitations

1. **Dark Mode**: Currently only supports dark mode styling for the settings page, other pages need to be added later
2. **Language Switching**: Language switching functionality is implemented, but multi-language translation needs to be completed in future versions
3. **Data Statistics**: Data statistics and analysis features are under development

## Version History

### v1.7 (2026-04-18)
- ✅ Add settings system: Preferences and data management features
- ✅ Add dark mode toggle: Support real-time switching between dark/light themes
- ✅ Add language switching: Support Simplified Chinese/English
- ✅ Add data export: Export all data in JSON format
- ✅ Add data clearing: Clear all training and scoring records
- ✅ Remove history page: Features integrated into respective modules
- ✅ Remove personal info: Simplify settings page, focus on core features

### v1.6 (2026-04-18)
- ✅ Add scoring system: Complete scoring functionality implementation
- ✅ Add scoring list page: Display all scoring records with date filtering and pagination
- ✅ Add scoring current page: Real-time scoring, timing, score input
- ✅ Add scoring details page: Round score bar charts and detailed records

### v1.5 (2026-04-17)
- ✅ Add training trend charts: Line charts showing arrow count trends
- ✅ Add date range filtering
- ✅ Add pagination functionality

### v1.4 (2026-04-16)
- ✅ Add custom step value: Users can set arrow increment (1-50 arrows)
- ✅ Add data management strategy: Automatic archiving and cleanup

### v1.3 (2026-04-15)
- ✅ Implement basic counter functionality
- ✅ Add local storage support
- ✅ Implement data persistence

## Contributing

Contributions are welcome! Feel free to submit issues, feature requests, or pull requests.

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Contact

For questions or suggestions, please contact via:

- Submit an Issue
- Send an email

## Acknowledgments

Thanks to all developers who contributed to this project!

---

**Note**: This project is a Proof of Concept (POC) project, and some features may still be under development.