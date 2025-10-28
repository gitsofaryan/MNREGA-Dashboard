import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useTranslation } from 'react-i18next'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts'
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react'

const COLORS = ['#2D6A4F', '#52B788', '#F77F00', '#1E88E5']

export function Charts({ data, stats }) {
  const { t } = useTranslation()

  // Month order for proper sorting (April to March for financial year)
  const monthOrder = {
    'April': 1, 'May': 2, 'June': 3, 'July': 4, 'August': 5, 'September': 6,
    'October': 7, 'November': 8, 'December': 9, 'January': 10, 'February': 11, 'March': 12
  };

  // Get latest month data for each district (MGNREGA data is cumulative)
  const districtLatestData = {};
  
  data.forEach(item => {
    const district = item.district_name;
    if (!district) return;

    const month = item.month;
    const monthNum = monthOrder[month] || 0;

    // Keep only the latest month's data for each district
    if (!districtLatestData[district]) {
      districtLatestData[district] = { ...item, monthNum };
    } else {
      const currentMonthNum = districtLatestData[district].monthNum;
      if (monthNum > currentMonthNum) {
        districtLatestData[district] = { ...item, monthNum };
      }
    }
  });
  
  // Convert to array with proper structure
  const districtData = Object.values(districtLatestData).map(item => ({
    name: item.district_name,
    workers: parseInt(item.Total_No_of_Workers) || 0,
    jobCards: parseInt(item.Total_No_of_JobCards_issued) || 0,
    activeWorkers: parseInt(item.Total_No_of_Active_Workers) || 0,
    households: parseInt(item.Total_Households_Worked) || 0,
  }));
  
  // Sort by workers (descending) and take top 10 for bar chart
  const barChartData = districtData
    .sort((a, b) => b.workers - a.workers)
    .slice(0, 10)
    .map(item => ({
      name: item.name.substring(0, 15),
      workers: item.workers,
      jobCards: item.jobCards,
    }));

  // Prepare data for pie chart
  const pieChartData = [
    { name: t('totalJobCards'), value: stats.totalJobCards },
    { name: t('totalWorkers'), value: stats.totalWorkers },
    { name: t('activeWorkers'), value: stats.activeWorkers },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <Card className="shadow-xl border-2 border-green-100 bg-gradient-to-br from-white to-green-50/30 hover:shadow-2xl transition-all">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-md">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            {t('performance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsBarChart data={barChartData}>
              <defs>
                <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D6A4F" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#1b4332" stopOpacity={0.9}/>
                </linearGradient>
                <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F77F00" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#d16600" stopOpacity={0.9}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 11, fontWeight: 600, fill: '#6b7280' }}
              />
              <YAxis tick={{ fontSize: 12, fontWeight: 600, fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid #2D6A4F',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="workers" fill="url(#barGradient1)" name={t('totalWorkers')} radius={[8, 8, 0, 0]} />
              <Bar dataKey="jobCards" fill="url(#barGradient2)" name={t('totalJobCards')} radius={[8, 8, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card className="shadow-xl border-2 border-orange-100 bg-gradient-to-br from-white to-orange-50/30 hover:shadow-2xl transition-all">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
              <PieChartIcon className="w-5 h-5 text-white" />
            </div>
            {t('overview')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                innerRadius={50}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={3}
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid #F77F00',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
