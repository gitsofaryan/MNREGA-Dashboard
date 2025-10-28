import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../lib/utils'
import { Calendar, Users, Briefcase, TrendingUp, IndianRupee, Award } from 'lucide-react'

/**
 * Shows RAW API data in card format - NO calculations, NO aggregations
 * Displays exact values as received from data.gov.in API
 */
export function DistrictDataTable({ data, districtName }) {
  const { t } = useTranslation()

  if (!data || data.length === 0) {
    return null
  }

  // Get the first (April) record - we only fetch April data now
  const record = data[0];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="shadow-xl border-2 border-bharat-saffron/30 bg-gradient-to-r from-bharat-saffron/10 to-bharat-orange/10">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3">
            <Calendar className="w-8 h-8 text-bharat-saffron" />
            <div>
              <div className="font-bold hindi-text">{districtName}</div>
              <div className="text-sm text-gray-600 font-normal">
                {record.month} {record.fin_year}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Employment Cards */}
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="Total Job Cards"
          titleHi="कुल जॉब कार्ड जारी"
          value={record.Total_No_of_JobCards_issued}
          color="blue"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="Total Workers"
          titleHi="कुल श्रमिक"
          value={record.Total_No_of_Workers}
          color="green"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="Active Workers"
          titleHi="सक्रिय श्रमिक"
          value={record.Total_No_of_Active_Workers}
          color="emerald"
          highlight
        />
        <MetricCard
          icon={<Briefcase className="w-6 h-6" />}
          title="Active Job Cards"
          titleHi="सक्रिय जॉब कार्ड"
          value={record.Total_No_of_Active_Job_Cards}
          color="teal"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="Households Worked"
          titleHi="परिवार काम किया"
          value={record.Total_Households_Worked}
          color="cyan"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="Individuals Worked"
          titleHi="व्यक्ति काम किया"
          value={record.Total_Individuals_Worked}
          color="sky"
        />

        {/* Works Cards */}
        <MetricCard
          icon={<Briefcase className="w-6 h-6" />}
          title="Ongoing Works"
          titleHi="चालू कार्य"
          value={record.Number_of_Ongoing_Works}
          color="orange"
        />
        <MetricCard
          icon={<Briefcase className="w-6 h-6" />}
          title="Completed Works"
          titleHi="पूर्ण कार्य"
          value={record.Number_of_Completed_Works}
          color="green"
          highlight
        />
        <MetricCard
          icon={<Briefcase className="w-6 h-6" />}
          title="Total Works Taken Up"
          titleHi="कुल कार्य शुरू"
          value={record.Total_No_of_Works_Takenup}
          color="indigo"
        />

        {/* Financial Cards */}
        <MetricCard
          icon={<IndianRupee className="w-6 h-6" />}
          title="Total Expenditure"
          titleHi="कुल व्यय (₹ लाख)"
          value={record.Total_Exp}
          color="purple"
          isDecimal
          isCurrency
        />
        <MetricCard
          icon={<IndianRupee className="w-6 h-6" />}
          title="Wages"
          titleHi="मजदूरी (₹ लाख)"
          value={record.Wages}
          color="violet"
          isDecimal
          isCurrency
        />
        <MetricCard
          icon={<IndianRupee className="w-6 h-6" />}
          title="Material & Skilled Wages"
          titleHi="सामग्री और कुशल मजदूरी"
          value={record.Material_and_skilled_Wages}
          color="fuchsia"
          isDecimal
          isCurrency
        />
        <MetricCard
          icon={<IndianRupee className="w-6 h-6" />}
          title="Admin Expenditure"
          titleHi="प्रशासनिक व्यय (₹ लाख)"
          value={record.Total_Adm_Expenditure}
          color="pink"
          isDecimal
          isCurrency
        />

        {/* Performance Metrics */}
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Avg Wage/Day/Person"
          titleHi="औसत मजदूरी/दिन (₹)"
          value={record.Average_Wage_rate_per_day_per_person}
          color="amber"
          isDecimal
          prefix="₹"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Avg Days Employment/HH"
          titleHi="औसत दिन रोजगार/परिवार"
          value={record.Average_days_of_employment_provided_per_Household}
          color="yellow"
        />
        <MetricCard
          icon={<Award className="w-6 h-6" />}
          title="HHs Completed 100 Days"
          titleHi="100 दिन पूर्ण परिवार"
          value={record.Total_No_of_HHs_completed_100_Days_of_Wage_Employment}
          color="lime"
          highlight
        />

        {/* Social Inclusion */}
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="SC Persondays"
          titleHi="अनुसूचित जाति व्यक्ति-दिवस"
          value={record.SC_persondays}
          color="red"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="ST Persondays"
          titleHi="अनुसूचित जनजाति व्यक्ति-दिवस"
          value={record.ST_persondays}
          color="rose"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="Women Persondays"
          titleHi="महिला व्यक्ति-दिवस"
          value={record.Women_Persondays}
          color="pink"
        />
        <MetricCard
          icon={<Users className="w-6 h-6" />}
          title="Differently Abled Persons"
          titleHi="दिव्यांग व्यक्ति"
          value={record.Differently_abled_persons_worked}
          color="purple"
        />

        {/* Percentages */}
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="SC Workers %"
          titleHi="अनुसूचित जाति श्रमिक %"
          value={record.SC_workers_against_active_workers}
          color="blue"
          isDecimal
          suffix="%"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="ST Workers %"
          titleHi="अनुसूचित जनजाति श्रमिक %"
          value={record.ST_workers_against_active_workers}
          color="indigo"
          isDecimal
          suffix="%"
        />
        <MetricCard
          icon={<Award className="w-6 h-6" />}
          title="Payment within 15 days"
          titleHi="15 दिनों में भुगतान %"
          value={record.percentage_payments_gererated_within_15_days}
          color="green"
          isDecimal
          suffix="%"
          highlight
        />
      </div>
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({ icon, title, titleHi, value, color = 'blue', isDecimal = false, isCurrency = false, prefix = '', suffix = '', highlight = false }) {
  const displayValue = value ? 
    (isDecimal ? parseFloat(value).toFixed(2) : formatNumber(Math.round(parseFloat(value) || 0))) 
    : '0';

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    emerald: 'from-emerald-500 to-emerald-600',
    teal: 'from-teal-500 to-teal-600',
    cyan: 'from-cyan-500 to-cyan-600',
    sky: 'from-sky-500 to-sky-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    violet: 'from-violet-500 to-violet-600',
    fuchsia: 'from-fuchsia-500 to-fuchsia-600',
    pink: 'from-pink-500 to-pink-600',
    amber: 'from-amber-500 to-amber-600',
    yellow: 'from-yellow-500 to-yellow-600',
    lime: 'from-lime-500 to-lime-600',
    red: 'from-red-500 to-red-600',
    rose: 'from-rose-500 to-rose-600',
  };

  const borderClass = highlight ? 'border-4 border-bharat-saffron shadow-2xl' : 'border-2 border-gray-200 shadow-xl';

  return (
    <Card className={`${borderClass} hover:scale-105 transition-all duration-300 overflow-hidden`}>
      <div className={`h-2 bg-gradient-to-r ${colorClasses[color]}`}></div>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg`}>
            {icon}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">{title}</div>
          <div className="text-xs text-gray-500 hindi-text">{titleHi}</div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900">
            {prefix}{displayValue}{suffix}
            {isCurrency && <span className="text-sm text-gray-600 ml-1">Lakh</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
