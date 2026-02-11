import { createFileRoute} from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { technicianApi, bookingApi, type Technician } from '@/lib/api'
import { toast } from '@/components/ui/use-toast'
import { Search, Star, Loader2, Calendar, Filter } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/technicians')({
  component: TechniciansPage,
})

function TechniciansPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState('all')
  const [ratingFilter, setRatingFilter] = useState<number | undefined>()
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [bookingNotes, setBookingNotes] = useState('')
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const { data: technicians, isLoading } = useQuery({
    queryKey: ['technicians', { search, skill: skillFilter, rating: ratingFilter }],
    queryFn: () => technicianApi.getAll({ search, skill: skillFilter, rating: ratingFilter }),
  })

  const bookingMutation = useMutation({
    mutationFn: (data: { technicianId: string; slot: string; notes?: string }) =>
      bookingApi.create(data),
    onSuccess: () => {
      toast({
        title: 'Booking confirmed!',
        description: 'You will receive a confirmation email shortly.',
      })
      setShowConfirmDialog(false)
      setSelectedTechnician(null)
      setSelectedSlot('')
      setBookingNotes('')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (error: Error) => {
      toast({
        title: 'Booking failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleBookClick = (technician: Technician) => {
    setSelectedTechnician(technician)
  }

  const handleConfirmBooking = () => {
    if (!selectedTechnician || !selectedSlot) return
    
    bookingMutation.mutate({
      technicianId: selectedTechnician._id,
      slot: selectedSlot,
      notes: bookingNotes || undefined,
    })
  }

  // Generate time slots for the next 7 days
  const generateTimeSlots = () => {
    const slots: string[] = []
    const now = new Date()
    
    for (let day = 1; day <= 7; day++) {
      const date = new Date(now)
      date.setDate(date.getDate() + day)
      
      for (let hour = 9; hour <= 17; hour++) {
        date.setHours(hour, 0, 0, 0)
        slots.push(date.toISOString())
      }
    }
    return slots
  }

  const skills = ['all', 'Plumber', 'Electrician', 'HVAC', 'Carpenter', 'Painter', 'General']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find a Technician</h1>
        <p className="text-muted-foreground mt-1">Browse and book skilled professionals</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {skills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill === 'all' ? 'All Skills' : skill}
                  </option>
                ))}
              </select>
              <select
                value={ratingFilter || ''}
                onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : undefined)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technician List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : technicians && technicians.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {technicians.map((technician) => (
            <Card key={technician._id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{technician.name}</CardTitle>
                    <CardDescription>{technician.skill}</CardDescription>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{technician.rating.toFixed(1)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {technician.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {technician.bio}
                  </p>
                )}
                {technician.hourlyRate && (
                  <p className="text-sm font-medium mb-4">
                    ${technician.hourlyRate}/hour
                  </p>
                )}
                <Button 
                  className="w-full" 
                  onClick={() => handleBookClick(technician)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No technicians found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      )}

      {/* Booking Dialog */}
      <Dialog open={!!selectedTechnician} onOpenChange={(open) => !open && setSelectedTechnician(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Book {selectedTechnician?.name}</DialogTitle>
            <DialogDescription>
              Select a time slot to book this {selectedTechnician?.skill.toLowerCase()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Date & Time</Label>
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Choose a time slot</option>
                {generateTimeSlots().map((slot) => (
                  <option key={slot} value={slot}>
                    {new Date(slot).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="Any special instructions..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTechnician(null)}>
              Cancel
            </Button>
            <Button 
              onClick={() => setShowConfirmDialog(true)} 
              disabled={!selectedSlot}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
            <DialogDescription>
              Please review your booking details before confirming
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Technician</span>
                <span className="font-medium">{selectedTechnician?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{selectedTechnician?.skill}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time</span>
                <span className="font-medium">
                  {selectedSlot && new Date(selectedSlot).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              {bookingNotes && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Notes</span>
                  <span className="font-medium">{bookingNotes}</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Go Back
            </Button>
            <Button 
              onClick={handleConfirmBooking}
              disabled={bookingMutation.isPending}
            >
              {bookingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
