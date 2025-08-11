"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, Clock, Zap } from "lucide-react"

interface SimulationState {
  location: string
  currentTemp: number
  heatwaveActive: boolean
  heatwaveIntensity: string
  operationMode: string
  renewablePenetration: number
  batteryCapacity: number
  backupGenerators: boolean
  loadShifting: boolean
}

interface RecommendedActionsProps {
  simulation: SimulationState
}

export function RecommendedActions({ simulation }: RecommendedActionsProps) {
  const getRecommendations = () => {
    const recommendations = []

    if (simulation.heatwaveActive) {
      recommendations.push({
        id: 1,
        title: "Activate Emergency Cooling",
        description: "Increase cooling capacity to maximum to prevent thermal throttling",
        priority: "high",
        icon: AlertTriangle,
        action: "Activate Now",
        estimated: "2 minutes",
      })

      if (simulation.heatwaveIntensity === "extreme") {
        recommendations.push({
          id: 2,
          title: "Enable Load Shedding",
          description: "Reduce non-critical workloads to minimize heat generation",
          priority: "high",
          icon: Zap,
          action: "Enable",
          estimated: "30 seconds",
        })
      }
    }

    if (simulation.batteryCapacity < 50) {
      recommendations.push({
        id: 3,
        title: "Charge Battery Systems",
        description: "Increase battery capacity before peak demand hours",
        priority: "medium",
        icon: Clock,
        action: "Start Charging",
        estimated: "45 minutes",
      })
    }

    if (simulation.operationMode === "grid-connected" && simulation.renewablePenetration < 30) {
      recommendations.push({
        id: 4,
        title: "Optimize Renewable Usage",
        description: "Increase solar/wind utilization during peak generation",
        priority: "low",
        icon: CheckCircle,
        action: "Optimize",
        estimated: "5 minutes",
      })
    }

    if (!simulation.loadShifting && simulation.heatwaveActive) {
      recommendations.push({
        id: 5,
        title: "Enable Load Shifting",
        description: "Move non-critical workloads to cooler periods",
        priority: "medium",
        icon: Clock,
        action: "Enable",
        estimated: "1 minute",
      })
    }

    return recommendations
  }

  const recommendations = getRecommendations()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Actions</CardTitle>
        <CardDescription>Smart recommendations based on current conditions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <p>All systems operating optimally</p>
            <p className="text-sm">No immediate actions required</p>
          </div>
        ) : (
          recommendations.map((rec) => {
            const IconComponent = rec.icon
            return (
              <div key={rec.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <IconComponent className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge variant={getPriorityColor(rec.priority) as any}>{rec.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Est. time: {rec.estimated}</span>
                    <Button size="sm" variant="outline">
                      {rec.action}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
