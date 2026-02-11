import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Wrench, Calendar, Star, Shield, UserPlus } from 'lucide-react'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">TechBook</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/register-technician">
              <Button variant="ghost">Become a Technician</Button>
            </Link>
            <Link to="/login" search={{redirect: "/"}}>
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Book Trusted Technicians
            <span className="text-primary"> Online</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Find and book skilled technicians for all your needs. From plumbing to electrical work,
            we connect you with verified professionals in minutes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex items-center justify-center gap-x-6">
              <Link to="/register">
                <Button size="lg" className="px-8">
                  Book a Technician
                </Button>
              </Link>
              <Link to="/login" search={{redirect: "/"}}>
                <Button variant="outline" size="lg">
                  View Dashboard
                </Button>
              </Link>
            </div>
            <Link to="/register-technician" className="text-primary hover:underline flex items-center gap-1">
              <UserPlus className="h-4 w-4" />
              Are you a technician? Join our network
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={<Wrench className="h-8 w-8" />}
            title="Skilled Professionals"
            description="Access a network of verified and experienced technicians"
          />
          <FeatureCard
            icon={<Calendar className="h-8 w-8" />}
            title="Easy Scheduling"
            description="Book appointments that fit your schedule in just a few clicks"
          />
          <FeatureCard
            icon={<Star className="h-8 w-8" />}
            title="Rated & Reviewed"
            description="Choose technicians based on real customer ratings"
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Secure Booking"
            description="Your bookings and data are protected with enterprise security"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t">
        <div className="text-center text-gray-500">
          <p>&copy; 2024 TechBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
