# 🇮🇳 MGNREGA Dashboard - Build for Bharat by Aryan Jain

<div align="center">
  <h3>मनरेगा डैशबोर्ड - भारत के लिए बनाया गया</h3>
  <p>A production-quality React + Vite dashboard for MGNREGA data visualization</p>
  
  ![React](https://img.shields.io/badge/React-18.2-blue?logo=react)
  ![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)
  ![License](https://img.shields.io/badge/License-MIT-green)
</div>

---

## 🌟 Features

- 📊 **Real-time Data Visualization** - Live MGNREGA data from Government of India's data.gov.in API
- 🌐 **Bilingual Support** - Full Hindi and English translations with react-i18next + Google Translate integration
- 📱 **Mobile-First Responsive Design** - Optimized for rural users on mobile devices
- 💾 **Offline Support** - localStorage caching with Service Worker (PWA ready)
- 📍 **Smart Geolocation** - Auto-detect and auto-select user's state and district
- 📈 **Interactive Charts** - Beautiful visualizations using Recharts (Bar, Pie, Radar charts)
- 🗺️ **Interactive Maps** - LeafletJS integration for location visualization
- � **Low-Literacy Friendly** - Visual comparisons, emoji icons, colorful cards, and simple charts
- ⚡ **Fast Performance** - Optimized with 500-record limit, cache-first strategy, 4-hour TTL
- 🏆 **District Comparison** - Side-by-side comparison with winner indicators and charts
- 📊 **Data Visualizer** - Dedicated tab with visual progress bars and pie charts for easy understanding
- 🥇 **Leaderboard** - Top 10 districts ranked by 5 different categories
- � **12 Indian Languages** - Google Translate integration for Pan-India accessibility
- 🎨 **Exact API Values** - Shows real government data without modifications (24 metric cards per district)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn/pnpm
- Modern web browser with JavaScript enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/gitsofaryan/desh-lekha.git

# Navigate to project directory
cd "build for bharat 2026"

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base shadcn/ui components
│   │   ├── card.jsx
│   │   ├── button.jsx
│   │   └── select.jsx
│   ├── Charts.jsx         # Overview data visualization charts
│   ├── ComparePanel.jsx   # District comparison with charts & winner indicators
│   ├── DistrictDataTable.jsx # 24 metric cards showing exact API values
│   ├── Filters.jsx        # State/District/Year filters
│   ├── Footer.jsx         # App footer
│   ├── Header.jsx         # App header with language + Google Translate toggle
│   ├── LastUpdated.jsx    # Timestamp display
│   ├── LeaderboardPanel.jsx # Top 10 districts by category
│   ├── LoadingSkeleton.jsx  # Loading placeholder UI
│   ├── MapView.jsx        # Leaflet map component
│   ├── NavBar.jsx         # Tab navigation (Overview, Leaderboard, Compare, Visualizer)
│   ├── SideNav.jsx        # Floating quick actions drawer
│   ├── SimulatorPanel.jsx # Data visualizer with charts & visual bars
│   ├── StatsCards.jsx     # Statistics cards
│   └── Summary.jsx        # Insights summary
├── hooks/              # Custom React hooks
│   ├── useGeolocation.js   # Browser geolocation API with reverse geocoding
│   ├── useMGNREGAData.js   # Optimized API data fetching (cache-first, 500 limit)
│   └── useOnlineStatus.js  # Network status detection
├── i18n/               # Internationalization
│   ├── config.js       # i18next configuration
│   └── locales/        # Translation files
│       ├── hi.json     # Hindi translations (100+ keys)
│       └── en.json     # English translations (100+ keys)
├── lib/                # Utility functions
│   └── utils.js        # calculateStats (latest-month-per-district), generateFinancialYears, storage helpers
├── pages/              # Page components
│   └── Dashboard.jsx   # Main dashboard with tab routing
├── services/           # Service utilities
│   └── locationDetection.js # GPS + Nominatim reverse geocoding
├── App.jsx             # Root component
├── main.jsx            # Entry point
└── index.css           # Global styles with Bharat color scheme
```

---

## 🎨 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **Vite** | Build tool and dev server |
| **TailwindCSS** | Utility-first CSS framework |
| **shadcn/ui** | Beautiful UI components |
| **Recharts** | Data visualization (Bar, Pie, Radar, Line charts) |
| **react-i18next** | Internationalization framework |
| **Google Translate** | 12 Indian languages support |
| **Leaflet** | Interactive maps |
| **Lucide React** | Beautiful icons |
| **Nominatim** | Reverse geocoding API |
| **localStorage** | Client-side caching (4-hour TTL) |
| **Service Worker** | PWA offline support |

---

## 📊 API Integration

This app uses the **Government of India's Open Data API**:

```
https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722
```

**Features:**
- ✅ April-only data (financial year start month)
- ✅ 4-hour cache TTL with cache-first strategy
- ✅ Automatic offline fallback
- ✅ 500 records limit for optimal performance
- ✅ 10-second timeout with AbortSignal
- ✅ Error handling with user-friendly messages
- ✅ Latest-month-per-district aggregation logic

---

## 🌍 Internationalization

The app supports **Hindi** (default) and **English**:

- Toggle button in the header
- Complete translation coverage
- Persistent language preference
- Hindi fonts: Noto Sans Devanagari

### Adding New Languages

The app uses **react-i18next** for Hindi/English, plus **Google Translate** for 12 Indian languages:
- Hindi (हिंदी)
- English
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Bengali (বাংলা)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Malayalam (മലയാളം)
- Punjabi (ਪੰਜਾਬੀ)
- Odia (ଓଡ଼ିଆ)
- Assamese (অসমীয়া)

**To add more i18next languages:**

1. Create a new JSON file in `src/i18n/locales/` (e.g., `ta.json` for Tamil)
2. Add translations matching the structure of `hi.json` (100+ keys)
3. Import and register in `src/i18n/config.js`

---

## 🗺️ Features Breakdown

### 1. **Overview Tab** (Default)
- **Filters**: State, District, Financial Year selection
- **Smart Location Detection**: GPS + Nominatim reverse geocoding auto-selects state & district
- **Statistics Cards**: Total Job Cards, Workers, Active Workers, Month/Year
- **Summary**: AI-generated insights in Hindi/English
- **24 Metric Cards**: Exact API values with colorful borders and emojis
- **Charts**: Bar chart (top 10 districts), Overview charts
- **Interactive Map**: Leaflet map with user location marker

### 2. **Leaderboard Tab** 🏆
- **Top 10 Rankings** by 5 categories:
  - Most Job Cards Issued
  - Most Active Workers
  - Most Completed Works
  - Highest Expenditure
  - Best Payment Efficiency
- **Visual Indicators**: Trophy, Medal, Award icons for top 3
- **Sortable Table**: Rank, District Name, Score

### 3. **Compare Tab** ⚖️
- **Side-by-Side Comparison**: Select District A vs District B
- **Winner Indicators**: Green borders + Trophy icons for better-performing district
- **Overall Winner Banner**: Animated Crown icon showing which district wins most categories
- **Visual Charts**:
  - Bar Chart: Side-by-side metric comparison
  - Radar Chart: Performance comparison (normalized 0-100%)
- **Winner Summary Table**: Shows winner for each of 5 metrics
- **Difference Display**: Exact numeric difference between districts

### 4. **Visualizer Tab** 📊
- **Data Visualizer** (formerly Simulator) for low-literacy users
- **Big Number Cards**: 5 colorful metric cards with emoji icons
- **Visual Progress Bars**: Horizontal bars showing relative comparison (no math needed!)
- **Charts**:
  - Bar Chart: Metrics overview with color-coded bars
  - Pie Chart: Active vs Inactive workers distribution
- **Quick Summary**: 4 large summary boxes with emojis
- **Perfect for Rural Users**: No calculations, just visual understanding

### 5. **Google Translate Integration** 🌍
- **Toggle Button**: Globe icon in header
- **12 Indian Languages**: Hindi, English, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Assamese
- **Fixed Widget**: Shows/hides on click
- **Whole Page Translation**: Translates everything including dynamic content

---

## 🎯 User Experience

### For Low-Literacy & Rural Users
- 📱 **Mobile-optimized** design with large touch targets
- 🔤 **Large, readable fonts** (Hindi: Noto Sans Devanagari)
- 🎨 **Visual icons & emojis** instead of text-heavy UI
- 📊 **Visual progress bars** - see size, not numbers
- 🌈 **Colorful, accessible** color scheme (green, blue, orange, purple, red)
- 🏆 **Trophy icons & badges** for winners (easy to understand)
- 🔊 **Simple sentences** and clear messaging
- 🎯 **No calculations needed** - just look at bar size or pie chart

### Data Accuracy Guarantee
- ✅ **Exact API Values**: Shows real government data without modifications
- ✅ **Latest-Month-Per-District**: Aggregates using the most recent month's data (April)
- ✅ **No Summation Across Months**: MGNREGA data is cumulative, so we never sum across months
- ✅ **24 Metric Cards**: Every API field displayed in beautiful card format
- ✅ **Transparent**: "Exact API Values" label on district data

### Example UI Text (Hindi)
```
"मध्य प्रदेश में इस वित्तीय वर्ष में 12,34,567 श्रमिकों को रोजगार मिला।"
```

### Performance Optimizations
- ⚡ **500-record limit** (down from 10,000) for faster loading
- ⚡ **Cache-first strategy** with 4-hour TTL
- ⚡ **Loading skeletons** for better perceived performance
- ⚡ **Service Worker** for offline caching (PWA ready)
- ⚡ **Debounced API calls** with 10-second timeout

---

## 🚢 Deployment

### Netlify (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### VPS with Nginx

1. Build the project: `npm run build`
2. Copy `dist/` folder to server
3. Configure Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🔧 Configuration

### Environment Variables (Optional)

Create a `.env` file:

```env
VITE_API_URL=https://api.data.gov.in/resource/ee03643a-ee4c-48c2-ac30-9f2ff26ab722
VITE_API_KEY=your_api_key_here
```

### Customize Colors

Edit `tailwind.config.js`:

```js
colors: {
  bharat: {
    green: "#2D6A4F",
    lightGreen: "#52B788",
    orange: "#F77F00",
    blue: "#1E88E5",
    lightBlue: "#64B5F6",
  }
}
```

---

## 🐛 Troubleshooting

### Charts not showing in Visualizer/Compare tabs?
- Ensure Recharts is installed: `npm install recharts`
- Check browser console for errors
- Verify data is loaded (check Network tab)

### Map not loading?
- Check internet connection
- Ensure Leaflet CSS is loaded in `index.html`
- Verify Nominatim API is accessible

### Google Translate widget not appearing?
- Check internet connection (widget loads from Google CDN)
- Verify script tag in `index.html`
- Check browser console for CSP errors

### Location detection not working?
- Enable location permissions in browser
- Use HTTPS (required for geolocation API)
- Check Nominatim API rate limits

### API errors?
- Verify API endpoint is accessible: https://api.data.gov.in/
- Check network connectivity
- Review browser console for CORS errors
- Try clearing localStorage cache

### Build errors?
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Update Node.js to latest LTS version (16+)
- Delete `.vite` cache folder
- Check for conflicting dependencies

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/AmazingFeature`
3. Commit changes: `git commit -m 'Add AmazingFeature'`
4. Push to branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aryan Jain**

- 🇮🇳 Built for Bharat with focus on rural India's digital empowerment
- 💡 Designed for low-literacy users with visual-first approach
- 🎯 Accurate data representation without modifications
- 🌍 Pan-India accessibility with 12 Indian languages

---

## 🙏 Acknowledgments

- **Government of India** - [data.gov.in](https://data.gov.in) for open MGNREGA data
- **MGNREGA Program** - Mahatma Gandhi National Rural Employment Guarantee Act
- **Nominatim** - OpenStreetMap reverse geocoding service
- **Google Translate** - For multi-language support
- **Open Source Community** - React, Vite, TailwindCSS, Recharts, and all amazing libraries

---

## 📞 Support

For issues, questions, or suggestions:

- 🐛 [Open an issue](https://github.com/gitsofaryan/desh-lekha/issues)
- 💬 [Start a discussion](https://github.com/gitsofaryan/desh-lekha/discussions)

---

<div align="center">
  <p><strong>Built with ❤️ for Bharat by Aryan Jain 🇮🇳</strong></p>
  <p>भारत के लिए प्यार से बनाया गया</p>
</div>
