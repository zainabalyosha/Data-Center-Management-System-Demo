"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Info, XCircle, Thermometer, Cloud } from "lucide-react"

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

interface IncidentHistoryProps {
  simulation: SimulationState
}

export function IncidentHistory({ simulation }: IncidentHistoryProps) {
  const getIncidents = () => {
    const realWeatherIncidents = [
      {
        id: 1,
        timestamp: "2022-07-19 15:30",
        type: "error",
        title: "Google Cloud London Heat Wave Outage",
        description:
          "Record-breaking 40°C temperatures caused cooling system failures, knocking multiple Google Cloud services offline for 4+ hours",
        status: "resolved",
        location: "London, UK",
        provider: "Google Cloud",
        duration: "4 hours 15 minutes",
        cause: "Extreme heat wave - cooling system overload",
        impact: "Compute Engine, App Engine, Cloud Storage affected",
        actions:
          "Emergency cooling deployed, workloads migrated to other regions, additional cooling capacity installed",
        prevention: "Enhanced cooling redundancy, improved temperature monitoring, heat wave response protocols",
      },
      {
        id: 2,
        timestamp: "2022-07-19 16:45",
        type: "error",
        title: "Oracle Cloud London Heat Outage",
        description:
          "Same heat wave that affected Google also caused Oracle Cloud infrastructure failures in London region",
        status: "resolved",
        location: "London, UK",
        provider: "Oracle Cloud",
        duration: "3 hours 30 minutes",
        cause: "Extreme heat wave - HVAC system failure",
        impact: "Compute instances, database services, networking disrupted",
        actions: "Activated backup cooling, load balancing to other regions, emergency generator deployment",
        prevention: "Upgraded HVAC systems, implemented predictive cooling algorithms",
      },
      {
        id: 3,
        timestamp: "2022-08-15 11:20",
        type: "warning",
        title: "Microsoft Azure Southeast Asia Cooling Event",
        description:
          "Power brownout during extreme heat caused data center cooling failure, impacting Teams and Azure services for 32 hours",
        status: "resolved",
        location: "Southeast Asia",
        provider: "Microsoft Azure",
        duration: "32 hours",
        cause: "Power brownout during heat wave - cooling system failure",
        impact: "Microsoft Teams, Azure compute services, storage systems",
        actions: "Emergency power restoration, manual cooling system restart, service migration",
        prevention: "Enhanced UPS systems, improved power redundancy, heat wave preparedness protocols",
      },
      {
        id: 4,
        timestamp: "2022-07-20 09:15",
        type: "error",
        title: "Twitter/X California Heat Wave Impact",
        description:
          "Extreme heat in California caused cooling issues at Twitter data center, affecting platform performance",
        status: "resolved",
        location: "California, USA",
        provider: "Twitter/X",
        duration: "6 hours",
        cause: "Record heat wave - cooling capacity exceeded",
        impact: "Platform slowdowns, intermittent service disruptions",
        actions: "Load reduction, emergency cooling deployment, traffic rerouting",
        prevention: "Cooling system upgrades, enhanced monitoring, heat response procedures",
      },
      {
        id: 5,
        timestamp: "2021-06-28 14:00",
        type: "error",
        title: "Pacific Northwest Heat Dome Multiple Outages",
        description:
          "Historic heat dome with temperatures over 46°C caused widespread data center cooling failures across the region",
        status: "resolved",
        location: "Pacific Northwest, USA",
        provider: "Multiple Providers",
        duration: "12+ hours",
        cause: "Historic heat dome - unprecedented temperatures",
        impact: "Multiple cloud services, regional internet disruptions",
        actions: "Emergency cooling, power load shedding, regional traffic rerouting",
        prevention: "Climate resilience planning, enhanced cooling capacity, heat wave protocols",
      },
      {
        id: 6,
        timestamp: "2023-07-10 13:45",
        type: "warning",
        title: "AWS Europe Heat Wave Mitigation",
        description:
          "Proactive measures taken during European heat wave to prevent outages, including load shifting and enhanced cooling",
        status: "resolved",
        location: "Europe",
        provider: "AWS",
        duration: "Preventive - No outage",
        cause: "Extreme heat wave - proactive response",
        impact: "No service disruption due to preventive measures",
        actions: "Preemptive load balancing, enhanced cooling activation, capacity scaling",
        prevention: "Predictive heat wave response, automated cooling systems, regional load distribution",
      },
    ]

    // Add current simulation-based incidents
    if (simulation.heatwaveActive) {
      realWeatherIncidents.unshift({
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        type: "warning",
        title: "Current Heatwave Conditions",
        description: `${simulation.heatwaveIntensity} heatwave detected at ${simulation.location}, enhanced cooling systems activated`,
        status: "active",
        location: simulation.location,
        provider: "Current Facility",
        duration: "Ongoing",
        cause: `${simulation.heatwaveIntensity} heat wave conditions`,
        impact: "Monitoring all systems, preventive measures active",
        actions: "Enhanced cooling, load monitoring, backup systems on standby",
        prevention: "Real-time monitoring and response protocols active",
      })
    }

    return realWeatherIncidents
  }

  const incidents = getIncidents()

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />
    }
  }

  const getProviderIcon = (provider: string) => {
    if (provider.includes("Google")) return <Cloud className="w-4 h-4 text-blue-600" />
    if (provider.includes("Microsoft")) return <Cloud className="w-4 h-4 text-blue-500" />
    if (provider.includes("Oracle")) return <Cloud className="w-4 h-4 text-red-600" />
    if (provider.includes("AWS")) return <Cloud className="w-4 h-4 text-orange-500" />
    return <Thermometer className="w-4 h-4 text-gray-500" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "destructive"
      case "resolved":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extreme Weather Data Center Incidents</CardTitle>
        <CardDescription>
          Historical extreme weather events that caused data center outages and disruptions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-96 overflow-y-auto space-y-4">
          {incidents.map((incident) => (
            <div key={incident.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                {getTypeIcon(incident.type)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{incident.title}</h4>
                    <Badge variant={getStatusColor(incident.status) as any} className="text-xs">
                      {incident.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium">Provider:</span> {incident.provider}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {incident.duration}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {incident.location}
                    </div>
                    <div>
                      <span className="font-medium">Date:</span> {incident.timestamp}
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-medium text-red-600">Root Cause:</span> {incident.cause}
                    </div>
                    <div>
                      <span className="font-medium text-orange-600">Impact:</span> {incident.impact}
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">Actions Taken:</span> {incident.actions}
                    </div>
                    <div>
                      <span className="font-medium text-green-600">Prevention Measures:</span> {incident.prevention}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
