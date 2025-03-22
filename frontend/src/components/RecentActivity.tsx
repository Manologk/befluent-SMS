import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from "lucide-react"

interface AttendanceRecord {
  student: {
    id: number
    name: string
    email: string
    qr_code: string
  }
  scanned_at: string
  session: {
    language: string
    level: string
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentAttendance = async () => {
      try {
        const response = await fetch('/api/attendance/recent')
        if (!response.ok) {
          throw new Error('Failed to fetch recent attendance')
        }
        const data = await response.json()
        setActivities(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recent activity')
      } finally {
        setLoading(false)
      }
    }

    fetchRecentAttendance()
    // Set up polling every 5 minutes
    const interval = setInterval(fetchRecentAttendance, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {error}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent attendance records
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {activities.map((record, index) => (
        <div className="flex items-center" key={`${record.student.id}-${index}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${record.student.name}`} alt="Avatar" />
            <AvatarFallback>{record.student.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{record.student.name}</p>
            <p className="text-sm text-muted-foreground">
              Attended {record.session.language} ({record.session.level})
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(record.scanned_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
