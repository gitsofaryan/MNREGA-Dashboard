import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../lib/utils'
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Home, 
  Calendar,
  DollarSign,
  Construction,
  CheckCircle2,
  Clock
} from 'lucide-react'

/**
 * Detailed view of a single district's MGNREGA data
 * Shows exact values from API for the latest month
 */
export function DistrictDetails({ data, districtName }) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return null
  }

  // Month order for proper sorting
  const monthOrder = {
    'April': 1, 'May': 2, 'June': 3, 'July': 4, 'August': 5, 'September': 6,
    'October': 7, 'November': 8, 'December': 9, 'January': 10, 'February': 11, 'March': 12
  };

  // Find the latest month's data for this district
  const latestData = data.reduce((latest, current) => {
    const currentMonthNum = monthOrder[current.month] || 0;
    const latestMonthNum = monthOrder[latest?.month] || 0;
    return currentMonthNum > latestMonthNum ? current : latest;
  }, data[0]);

  const metrics = [
    {
      icon: Briefcase,
      label: 'Total Job Cards Issued',
      labelHi: 'कुल जॉब कार्ड जारी',
      value: latestData.Total_No_of_JobCards_issued,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Users,
      label: 'Total Workers',
      labelHi: 'कुल श्रमिक',
      value: latestData.Total_No_of_Workers,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: TrendingUp,
      label: 'Active Job Cards',
      labelHi: 'सक्रिय जॉब कार्ड',
      value: latestData.Total_No_of_Active_Job_Cards,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      icon: Users,
      label: 'Active Workers',
      labelHi: 'सक्रिय श्रमिक',
      value: latestData.Total_No_of_Active_Workers,
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50'
    },
    {
      icon: Home,
      label: 'Total Households Worked',
      labelHi: 'कुल परिवार काम किया',
      value: latestData.Total_Households_Worked,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      icon: Users,
      label: 'Total Individuals Worked',
      labelHi: 'कुल व्यक्ति काम किया',
      value: latestData.Total_Individuals_Worked,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      icon: Construction,
      label: 'Ongoing Works',
      labelHi: 'चल रहे काम',
      value: latestData.Number_of_Ongoing_Works,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      icon: CheckCircle2,
      label: 'Completed Works',
      labelHi: 'पूर्ण काम',
      value: latestData.Number_of_Completed_Works,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: DollarSign,
      label: 'Total Expenditure (₹ Lakh)',
      labelHi: 'कुल व्यय (₹ लाख)',
      value: latestData.Total_Exp,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      isAmount: true
    },
    {
      icon: DollarSign,
      label: 'Wages (₹ Lakh)',
      labelHi: 'मजदूरी (₹ लाख)',
      value: latestData.Wages,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      isAmount: true
    },
    {
      icon: DollarSign,
      label: 'Avg Wage/Day/Person (₹)',
      labelHi: 'औसत मजदूरी/दिन/व्यक्ति (₹)',
      value: latestData.Average_Wage_Rate_Per_Day_Per_Person,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      isAmount: true
    },
    {
      icon: Calendar,
      label: 'Avg Days Employment/Household',
      labelHi: 'औसत दिन रोजगार/परिवार',
      value: latestData.Average_Days_Of_Employment_Provided_Per_Household,
      color: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-xl border-2 border-bharat-saffron/30 bg-gradient-to-br from-orange-50 to-white">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-bharat-saffron to-orange-600 rounded-xl shadow-lg">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-800">{districtName}</div>
              <div className="text-sm md:text-base text-gray-600 font-normal">
                <Calendar className="w-4 h-4 inline mr-2" />
                {latestData.month} {latestData.fin_year}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const value = parseFloat(metric.value) || 0;
          const displayValue = metric.isAmount 
            ? value.toFixed(2)
            : formatNumber(Math.round(value));

          return (
            <Card 
              key={index}
              className={`shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 ${metric.bgColor}/30`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 bg-gradient-to-br ${metric.color} rounded-lg shadow-md flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 mb-1 line-clamp-2">
                      {metric.label}
                    </p>
                    <p className="text-xs text-gray-500 mb-2 hindi-text line-clamp-1">
                      {metric.labelHi}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">
                      {displayValue}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <Card className="shadow-lg border-2 border-gray-100">
        <CardHeader>
          <CardTitle className="text-lg">Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">SC Workers %:</span>{' '}
              {latestData.SC_Workers_Against_Active_Workers || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">ST Workers %:</span>{' '}
              {latestData.ST_Workers_Against_Active_Workers || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">Women Persondays:</span>{' '}
              {formatNumber(latestData.Women_Persondays || 0)}
            </div>
            <div>
              <span className="font-semibold">Total Persondays:</span>{' '}
              {formatNumber(latestData.Persondays_Of_Central_Liability_So_Far || 0)}
            </div>
            <div>
              <span className="font-semibold">Payment within 15 days %:</span>{' '}
              {latestData.Percentage_Payments_Gererated_Within_15_Days || 'N/A'}
            </div>
            <div>
              <span className="font-semibold">HHs completed 100 days:</span>{' '}
              {formatNumber(latestData.Total_No_Of_HHs_Completed_100_Days_Of_Wage_Employment || 0)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
