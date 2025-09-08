# Mug Punters Investment Research Platform

A modern, full-stack investment research platform specifically designed for Australian Stock Exchange (ASX) analysis. Built with React, TypeScript, FastAPI, and PostgreSQL.

## 🚀 Features

### Core Functionality
- **Real-time Market Data**: Live ASX stock prices and market data integration
- **Investment Analysis**: Comprehensive fundamental and technical analysis tools
- **Report Management**: Create, track, and re-evaluate investment research reports
- **Portfolio Tracking**: Monitor your investment portfolio performance
- **Watchlist Management**: Track stocks of interest
- **User Authentication**: Secure user accounts and data protection

### Technical Features
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live market data and portfolio updates
- **Advanced Analytics**: Technical indicators, financial ratios, and valuation models
- **Data Visualization**: Interactive charts and graphs for market analysis

## 🏗️ Architecture

```
mug-punters-investment-research-platform/
├── frontend/          # React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── backend/           # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core configuration
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
├── database/          # PostgreSQL schemas and migrations
├── data_sources/      # Market data API integrations
├── analysis/          # Investment analysis modules
└── docker-compose.yml # Development environment setup
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Recharts** - Data visualization library
- **Axios** - HTTP client for API requests

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM
- **PostgreSQL** - Robust, open-source database
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type annotations
- **JWT** - JSON Web Token authentication
- **Redis** - In-memory data store for caching

### Data Sources
- **Alpha Vantage API** - Real-time and historical market data
- **Yahoo Finance** - Additional market data source
- **ASX Data** - Australian Stock Exchange specific data

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Option 1: Docker Development (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd investment-research-platform
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Start the development environment**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Option 2: Local Development

#### Backend Setup
1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start PostgreSQL and Redis**
   ```bash
   # Using Docker for databases
   docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15
   docker run -d --name redis -p 6379:6379 redis:7-alpine
   ```

6. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

7. **Start the backend server**
   ```bash
   uvicorn app.main:app --reload
   ```

#### Frontend Setup
1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=asx_research
POSTGRES_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379

# API Keys
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key

# Security
SECRET_KEY=your_secret_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

### API Keys Setup

1. **Alpha Vantage API**
   - Sign up at https://www.alphavantage.co/support/#api-key
   - Add your API key to the `.env` file

2. **Optional: Additional Data Sources**
   - Yahoo Finance (no API key required)
   - ASX data feeds (if available)

## 📊 Usage

### Getting Started

1. **Register an Account**
   - Visit http://localhost:3000/register
   - Create your user account

2. **Explore the Dashboard**
   - View market overview and your portfolio summary
   - Access recent reports and watchlists

3. **Research Stocks**
   - Search for ASX stocks by symbol or name
   - View detailed stock information and analysis
   - Access real-time price data and charts

4. **Create Investment Reports**
   - Write comprehensive investment analysis
   - Set target prices and recommendations
   - Track report performance over time

5. **Manage Portfolio**
   - Add holdings to track your investments
   - Monitor performance and gains/losses
   - View portfolio analytics

### Key Features

#### Market Data
- Real-time ASX stock prices
- Historical price data and charts
- Market indices and sector performance
- Top gainers, losers, and most active stocks

#### Investment Analysis
- **Fundamental Analysis**: Financial ratios, valuation metrics, DCF analysis
- **Technical Analysis**: Moving averages, RSI, MACD, Bollinger Bands
- **Risk Assessment**: Volatility analysis, correlation studies
- **Industry Comparison**: Benchmark against sector peers

#### Report Management
- Create detailed investment research reports
- Set buy/hold/sell recommendations
- Track target prices and actual performance
- Re-evaluate and update reports over time

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Integration Tests
```bash
# Run full test suite with Docker
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 📈 Performance

### Optimization Features
- **Caching**: Redis-based caching for market data
- **Database Indexing**: Optimized queries for large datasets
- **API Rate Limiting**: Respectful API usage
- **Lazy Loading**: Efficient data loading strategies
- **Code Splitting**: Optimized bundle sizes

### Monitoring
- Application performance metrics
- Database query optimization
- API response time monitoring
- Error tracking and logging

## 🔒 Security

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- SQL injection prevention
- XSS protection
- Rate limiting

### Best Practices
- Environment variable management
- Secure API key storage
- Regular dependency updates
- Security headers implementation

## 🚀 Deployment

### Production Deployment

1. **Build for Production**
   ```bash
   # Frontend
   cd frontend
   npm run build
   
   # Backend
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment Setup**
   - Set up production PostgreSQL database
   - Configure Redis instance
   - Set production environment variables
   - Set up SSL certificates

3. **Deploy with Docker**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Cloud Deployment Options
- **AWS**: ECS, RDS, ElastiCache
- **Google Cloud**: Cloud Run, Cloud SQL, Memorystore
- **Azure**: Container Instances, Database, Cache
- **DigitalOcean**: App Platform, Managed Databases

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Documentation](docs/)
- Join our [Discord Community](https://discord.gg/your-invite)

### Common Issues
- **Database Connection**: Ensure PostgreSQL is running and accessible
- **API Keys**: Verify your Alpha Vantage API key is valid
- **CORS Errors**: Check your CORS configuration in the backend
- **Build Errors**: Ensure all dependencies are installed correctly

## 🗺️ Roadmap

### Upcoming Features
- [ ] Advanced charting with TradingView integration
- [ ] Options analysis and Greeks calculation
- [ ] Portfolio optimization algorithms
- [ ] Social features and report sharing
- [ ] Mobile app (React Native)
- [ ] AI-powered investment insights
- [ ] Real-time news integration
- [ ] Advanced screening tools

### Version History
- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Enhanced analysis tools and reporting
- **v1.2.0** - Portfolio optimization and advanced charts

---

**Built with ❤️ for Mug Punters - The Australian investment community**
