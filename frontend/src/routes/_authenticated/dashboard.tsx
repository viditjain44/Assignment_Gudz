import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { bookingApi, type Booking } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { formatDateShort } from '@/lib/utils'
import { Calendar, Clock, Wrench, ArrowRight, Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = useAuth()
  
  const { data: upcomingBookings, isLoading } = useQuery({
    queryKey: ['bookings', 'upcoming'],
    queryFn: () => bookingApi.getUpcoming(),
  })

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your bookings</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Book a Technician</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Find and book skilled technicians for your needs
            </p>
            <Link to="/technicians">
              <Button className="w-full">
                Browse Technicians
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">View All Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your booking history and upcoming appointments
            </p>
            <Link to="/bookings">
              <Button variant="outline" className="w-full">
                My Bookings
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '-' : upcomingBookings?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              confirmed appointments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your next scheduled bookings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : upcomingBookings && upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking: Booking) => (
                <div
                  key={booking._id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wrench className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.technician.name}</p>
                      <p className="text-sm text-muted-foreground">{booking.technician.skill}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatDateShort(booking.slot)}</p>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}
              <Link to="/bookings">
                <Button variant="ghost" className="w-full mt-2">
                  View all bookings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No upcoming appointments</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Book a technician to get started
              </p>
              <Link to="/technicians">
                <Button>Browse Technicians</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
