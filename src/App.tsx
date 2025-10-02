import { useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Snowflake, Thermometer, Wind } from 'lucide-react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-cool flex items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Snowflake className="h-10 w-10 text-primary-600" />
            <h1 className="text-4xl font-bold text-primary-600">
              Supremo AC Services
            </h1>
          </div>
          <p className="text-neutral-600 text-lg">
            Digital Platform - HVAC Services in Ghana
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Badge variant="success">✓ Production Ready</Badge>
            <Badge variant="default">React 19</Badge>
            <Badge variant="secondary">ShadCN UI</Badge>
          </div>
        </div>

        {/* Demo Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Interactive Demo Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-primary-500" />
                Interactive Demo
              </CardTitle>
              <CardDescription>
                Test our ShadCN UI components with HVAC branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input type="email" placeholder="customer@example.com" />
              </div>

              <Button
                onClick={() => setCount((count) => count + 1)}
                className="w-full"
              >
                Clicked {count} times
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" size="sm">
                  <Wind className="mr-2 h-4 w-4" />
                  Secondary
                </Button>
                <Button variant="outline" size="sm">
                  Outline
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
              <CardDescription>
                What we've built so far
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Vite + React 19</span>
                <Badge variant="success">✓</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">TailwindCSS V3</span>
                <Badge variant="success">✓</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">TypeScript Paths (@/)</span>
                <Badge variant="success">✓</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ShadCN UI Components</span>
                <Badge variant="success">✓</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Ghana Localization</span>
                <Badge variant="success">✓</Badge>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-neutral-500">
                  Example price: <span className="font-semibold text-neutral-900">{formatCurrency(1500)}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Color Palette Card */}
        <Card>
          <CardHeader>
            <CardTitle>HVAC Color Scheme</CardTitle>
            <CardDescription>
              Cool blues for cooling & trust - optimized for brand identity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <div className="h-20 bg-primary-500 rounded-md"></div>
                <p className="text-xs font-medium text-center">Primary</p>
                <p className="text-xs text-neutral-500 text-center">#0EA5E9</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-accent-500 rounded-md"></div>
                <p className="text-xs font-medium text-center">Accent</p>
                <p className="text-xs text-neutral-500 text-center">#06B6D4</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-success rounded-md"></div>
                <p className="text-xs font-medium text-center">Success</p>
                <p className="text-xs text-neutral-500 text-center">#10B981</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-warning rounded-md"></div>
                <p className="text-xs font-medium text-center">Warning</p>
                <p className="text-xs text-neutral-500 text-center">#F59E0B</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 bg-error rounded-md"></div>
                <p className="text-xs font-medium text-center">Error</p>
                <p className="text-xs text-neutral-500 text-center">#EF4444</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-neutral-500">
          <p>✓ Foundation complete - Ready for Firebase integration</p>
        </div>
      </div>
    </div>
  )
}

export default App
