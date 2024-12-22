import React from 'react';
import { DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react';

const FinancialOverview = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Financial Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Monthly Earnings</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">$3,250</p>
          <p className="text-sm text-gray-600">+12% from last month</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">Hours Taught</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">48</p>
          <p className="text-sm text-gray-600">This month</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Classes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">32</p>
          <p className="text-sm text-gray-600">Completed this month</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-600">Average Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">$45/hr</p>
          <p className="text-sm text-gray-600">All class types</p>
        </div>
      </div>

      {/* Payment History */}
      <div className="border rounded-lg">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h3 className="font-medium text-gray-700">Recent Payments</h3>
        </div>
        <div className="divide-y">
          {[
            { date: '2024-03-15', amount: 850, status: 'Paid', type: 'Group Classes' },
            { date: '2024-03-10', amount: 600, status: 'Pending', type: 'Private Lessons' },
            { date: '2024-03-05', amount: 750, status: 'Paid', type: 'Online Classes' },
          ].map((payment, index) => (
            <div key={index} className="px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">${payment.amount}</p>
                <p className="text-sm text-gray-500">{payment.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{payment.date}</p>
                <span className={`text-sm ${
                  payment.status === 'Paid' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {payment.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialOverview;