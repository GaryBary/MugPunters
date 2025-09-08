# How to View the ReportHistory Component

## Quick Start Guide

### 1. Start the Frontend Application

Navigate to the frontend directory and start the development server:

```bash
cd frontend
npm install  # if you haven't already
npm start
```

The application will start on `http://localhost:3000`

### 2. Access the Report History

Once the app is running, you can view the ReportHistory component in several ways:

#### Option A: Through the Reports Page (Recommended)
1. Open your browser and go to `http://localhost:3000`
2. Navigate to the **Reports** section in the sidebar
3. You'll see the ReportHistory component with sample data

#### Option B: Direct URL
- Go directly to `http://localhost:3000/reports`

### 3. Demo Authentication

The component includes a demo authentication system:
- A mock user is automatically created when you access the app
- No login required for demo purposes
- The component will show sample report data

## What You'll See

### Report History Features:
- **Sample Reports**: 3 pre-loaded reports for CBA, BHP, and WBC
- **Performance Tracking**: Shows actual vs predicted returns
- **Filtering**: Filter by risk level and timeframe
- **Re-evaluation**: Click "Re-evaluate" to update performance data
- **Performance Metrics**: Accuracy scores and performance grades

### Sample Data Includes:
- **CBA Report**: Moderate risk, 1-year timeframe, 4.29% actual return
- **BHP Report**: Aggressive risk, 6-month timeframe, -3.40% actual return  
- **WBC Report**: Conservative risk, 2-year timeframe, 5.43% actual return

## Interactive Features

### 1. Filtering
- Use the dropdown filters to filter by:
  - Risk Level (Conservative, Moderate, Aggressive)
  - Timeframe (6 Months, 1 Year, 2 Years)

### 2. Re-evaluation
- Click the "Re-evaluate" button on any report
- Watch the loading animation
- See updated performance data

### 3. Performance Tracking
- View accuracy scores (0-100%)
- See performance grades (A-F)
- Compare predicted vs actual returns

## Troubleshooting

### If the component doesn't load:
1. Check that the frontend server is running on port 3000
2. Open browser developer tools and check for console errors
3. Ensure all dependencies are installed with `npm install`

### If you see authentication errors:
- The demo uses mock authentication
- Check that localStorage has an access_token (it should be set automatically)
- Refresh the page if needed

### If the API calls fail:
- The component includes fallback to mock data
- You'll still see the sample reports even if the backend isn't running
- Check the browser console for any error messages

## Backend Integration (Optional)

If you want to test with the real backend:

1. Start the backend server:
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

2. The frontend will automatically try to connect to the backend API
3. If the backend is running, you'll get real data instead of mock data

## File Structure

The ReportHistory component is located at:
- **Component**: `frontend/src/components/ReportHistory.tsx`
- **Page Integration**: `frontend/src/pages/Reports.tsx`
- **API Service**: `frontend/src/services/reportApi.ts`
- **Types**: `frontend/src/types/index.ts`

## Next Steps

Once you can see the component working:
1. Try the filtering functionality
2. Click "Re-evaluate" on different reports
3. Explore the performance metrics
4. Check the responsive design on different screen sizes

The component is fully functional with mock data and ready for integration with your backend API when available.
