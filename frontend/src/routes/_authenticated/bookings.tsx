import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { bookingApi, type Booking } from '@/lib/api'
import { toast } from '@/components/ui/use-toast'
import { formatDate } from '@/lib/utils'
import { Calendar, Loader2, XCircle, Wrench } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/bookings')({
  component: BookingsPage,
})

function BookingsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings', 'user', statusFilter],
    queryFn: () => bookingApi.getUserBookings(statusFilter),
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id),
    onSuccess: () => {
      toast({
        title: 'Booking cancelled',
        description: 'Your booking has been cancelled successfully.',
      })
      setCancellingId(null)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to cancel',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground mt-1">Manage your booking history</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'confirmed', 'cancelled', 'completed'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking: Booking) => (
            <Card key={booking._id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Wrench className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{booking.technician.name}</h3>
                      <p className="text-sm text-muted-foreground">{booking.technician.skill}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="text-left md:text-right">
                      <p className="font-medium">{formatDate(booking.slot)}</p>
                      <span className={cn(
                        'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium border',
                        getStatusColor(booking.status)
                      )}>
                        {booking.status}
                      </span>
                    </div>
                    
                    {booking.status === 'confirmed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setCancellingId(booking._id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
                
                {booking.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Notes:</span> {booking.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No bookings found</h3>
            <p className="text-sm text-muted-foreground">
              {statusFilter === 'all' 
                ? "You haven't made any bookings yet" 
                : `No ${statusFilter} bookings`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancellingId} onOpenChange={(open) => !open && setCancellingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancellingId(null)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancellingId && cancelMutation.mutate(cancellingId)}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Cancel Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
