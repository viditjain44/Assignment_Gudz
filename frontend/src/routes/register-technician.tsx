import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { Wrench, Loader2, CheckCircle } from 'lucide-react'
import { technicianApi } from '@/lib/api'

export const Route = createFileRoute('/register-technician')({
  component: RegisterTechnicianPage,
})

const SKILLS = [
  'Plumber',
  'Electrician',
  'HVAC',
  'Carpenter',
  'Painter',
  'General',
  'Appliance Repair',
  'Locksmith',
  'Landscaping',
  'Cleaning',
]

function RegisterTechnicianPage() {
  const navigate = useNavigate()
  const [isSuccess, setIsSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skill: '',
    bio: '',
    hourlyRate: '',
  })

  const registerMutation = useMutation({
    mutationFn: (data: {
      name: string
      email: string
      phone?: string
      skill: string
      bio?: string
      hourlyRate?: number
    }) => technicianApi.register(data),
    onSuccess: () => {
      setIsSuccess(true)
      toast({
        title: 'Registration successful!',
        description: 'Your technician profile has been created.',
      })
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.skill) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in name, email, and skill.',
        variant: 'destructive',
      })
      return
    }

    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      skill: formData.skill,
      bio: formData.bio || undefined,
      hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Registration Complete!</CardTitle>
            <CardDescription>
              Your technician profile has been created successfully. Customers can now find and book you on TechBook.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You will receive booking notifications at <strong>{formData.email}</strong>
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Link to="/" className="w-full">
              <Button className="w-full">Back to Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Link to="/" className="flex items-center gap-2">
              <Wrench className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">TechBook</span>
            </Link>
          </div>
          <CardTitle className="text-2xl">Register as a Technician</CardTitle>
          <CardDescription>
            Join our network of skilled professionals and start getting bookings
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={registerMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={registerMutation.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={registerMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skill">Primary Skill *</Label>
                <select
                  id="skill"
                  name="skill"
                  value={formData.skill}
                  onChange={handleChange}
                  required
                  disabled={registerMutation.isPending}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select a skill</option>
                  {SKILLS.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                placeholder="50"
                min="0"
                value={formData.hourlyRate}
                onChange={handleChange}
                disabled={registerMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio / About You</Label>
              <textarea
                id="bio"
                name="bio"
                placeholder="Tell customers about your experience and expertise..."
                value={formData.bio}
                onChange={handleChange}
                disabled={registerMutation.isPending}
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register as Technician'
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Want to book a technician instead?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register as a customer
              </Link>
            </p>
            <p className="text-sm text-muted-foreground text-center">
              <Link to="/" className="text-primary hover:underline">
                ← Back to Home
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
