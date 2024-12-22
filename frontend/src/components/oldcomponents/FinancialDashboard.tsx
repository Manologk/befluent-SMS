import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Subscription } from '../types/admin'

interface FinancialDashboardProps {
  subscriptions: Subscription[]
}

export function FinancialDashboard({ subscriptions }: FinancialDashboardProps) {
  const totalEarnings = subscriptions.reduce((sum, sub) => sum + sub.amountPaid, 0)
  const totalOutstanding = subscriptions.reduce((sum, sub) => sum + (sub.totalAmount - sub.amountPaid), 0)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalOutstanding.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subscriptions.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Subscription Value</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${(totalEarnings / subscriptions.length).toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

