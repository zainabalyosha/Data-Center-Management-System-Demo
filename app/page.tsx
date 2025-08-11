
  "use client"

import { useState, useEffect } from "react"
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  AlertTriangle,
  Database,
  Flame,
  Gauge,
  Power,
  Shield,
  Thermometer,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Facility3D } from "../components/facility-3d"
import { AutomatedPlan } from "../components/automated-plan"
import { IncidentHistory } from "../components/incident-history"

const CALIFORNIA_LOCATIONS = {
  "san-francisco": {
    name: "San Francisco",
    coords: { lat: 37.7749, lng: -122.4194 },
    avgSummerTemp: 22,
    heatwaveThreshold: 32,
    carbonIntensity: 0.28, // kg CO2/kWh
    historicalHeatwaves: [
      { year: 2023, events: 3, maxTemp: 38, duration: 4 },
      { year: 2022, events: 2, maxTemp: 35, duration: 3 },
      { year: 2021, events: 4, maxTemp: 41, duration: 6 },
      { year: 2020, events: 2, maxTemp: 37, duration: 2 },
    ],
  },
  "los-angeles": {
    name: "Los Angeles",
    coords: { lat: 34.0522, lng: -118.2437 },
    avgSummerTemp: 28,
    heatwaveThreshold: 38,
    carbonIntensity: 0.32,
    historicalHeatwaves: [
      { year: 2023, events: 5, maxTemp: 45, duration: 7 },
      { year: 2022, events: 4, maxTemp: 43, duration: 5 },
      { year: 2021, events: 6, maxTemp: 47, duration: 9 },
      { year: 2020, events: 3, maxTemp: 42, duration: 4 },
    ],
  },
  sacramento: {
    name: "Sacramento",
    coords: { lat: 38.5816, lng: -121.4944 },
    avgSummerTemp: 32,
    heatwaveThreshold: 40,
    carbonIntensity: 0.25,
    historicalHeatwaves: [
      { year: 2023, events: 6, maxTemp: 48, duration: 8 },
      { year: 2022, events: 5, maxTemp: 46, duration: 6 },
      { year: 2021, events: 7, maxTemp: 49, duration: 10 },
      { year: 2020, events: 4, maxTemp: 45, duration: 5 },
    ],
  },
  fresno: {
    name: "Fresno",
    coords: { lat: 36.7378, lng: -119.7871 },
    avgSummerTemp: 35,
    heatwaveThreshold: 42,
    carbonIntensity: 0.35,
    historicalHeatwaves: [
      { year: 2023, events: 8, maxTemp: 51, duration: 12 },
      { year: 2022, events: 7, maxTemp: 49, duration: 9 },
      { year: 2021, events: 9, maxTemp: 52, duration: 14 },
      { year: 2020, events: 6, maxTemp: 48, duration: 7 },
    ],
  },
}

interface SimulationState {
  location: keyof typeof CALIFORNIA_LOCATIONS
  operationMode: "grid-connected" | "islanded"
  renewablePenetration: number
  batteryCapacity: number
  backupGenerators: boolean
  loadShifting: boolean
  currentTemp: number
  heatwaveActive: boolean
  heatwaveIntensity: "none" | "moderate" | "severe" | "extreme"
  gridStability: number
}

export default function CaliforniaHeatwaveDemo() {
  const [simulation, setSimulation] = useState({
    location: "san-francisco" as keyof typeof CALIFORNIA_LOCATIONS,
    heatwaveActive: false,
    heatwaveIntensity: "moderate" as "mild" | "moderate" | "severe" | "extreme",
    operationMode: "normal" as "normal" | "emergency" | "grid-connected" | "island-mode",
    renewablePenetration: 45,
    batteryCapacity: 85,
    backupGenerators: true,
    coolingEfficiency: 92,
    carbonEmissions: 2.4, // tons CO2/hour
    powerDuration: 18.5, // hours remaining at current load
    currentLoad: 75, // percentage
    serverLoad: 70,
    currentTemp: 28,
    gridStability: 95,
  })

  const [isRunning, setIsRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState("overview")

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Simulate heatwave conditions based on location and time
  useEffect(() => {
    const location = CALIFORNIA_LOCATIONS[simulation.location]
    const currentHour = currentTime.getHours()
    const isAfternoon = currentHour >= 12 && currentHour <= 18

    // Simulate temperature based on time of day and location
    let baseTemp = location.avgSummerTemp
    if (isAfternoon) {
      baseTemp += 8 // Peak afternoon temperature
    } else if (currentHour >= 6 && currentHour < 12) {
      baseTemp += 4 // Morning warming
    } else {
      baseTemp -= 2 // Night cooling
    }

    // Add heatwave effect if active
    if (simulation.heatwaveActive) {
      const intensityMultiplier = {
        none: 0,
        moderate: 8,
        severe: 15,
        extreme: 22,
      }
      baseTemp += intensityMultiplier[simulation.heatwaveIntensity]
    }

    setSimulation((prev) => ({ ...prev, currentTemp: Math.round(baseTemp) }))
  }, [simulation.location, simulation.heatwaveActive, simulation.heatwaveIntensity, currentTime])

  const currentLocation = CALIFORNIA_LOCATIONS[simulation.location] || CALIFORNIA_LOCATIONS["san-francisco"]

  const calculateMetrics = () => {
    const tempDiff = simulation.currentTemp - currentLocation.avgSummerTemp
    const heatStress = Math.max(0, tempDiff / 20)

    const baseUptime = 99.5
    const heatwaveImpact = heatStress * 15
    const batteryBonus = simulation.batteryCapacity * 0.05
    const renewableBonus = simulation.renewablePenetration * 0.02

    const uptime = Math.max(85, baseUptime - heatwaveImpact + batteryBonus + renewableBonus)

    const baseCoolingLoad = 100
    const heatwaveCoolingLoad = baseCoolingLoad * (1 + heatStress * 0.8)
    const gridStress = simulation.heatwaveActive ? Math.max(0, 100 - heatStress * 30) : 95

    // Calculate power duration and carbon emissions
    const totalPowerDemand = heatwaveCoolingLoad + simulation.serverLoad * 0.8
    const batteryHours = (simulation.batteryCapacity / 100) * 24 // Max 24 hours at full capacity
    const powerDurationHours = batteryHours * (100 / totalPowerDemand)

    const carbonEmissions = (totalPowerDemand * currentLocation.carbonIntensity * 24) / 1000 // tons CO2/day

    return {
      uptime: Math.min(99.9, uptime),
      coolingLoad: heatwaveCoolingLoad,
      gridStability: gridStress,
      energyDemand: baseCoolingLoad * (1 + heatStress * 0.6),
      heatRisk: Math.min(100, heatStress * 100),
      powerDurationHours: Math.max(1, powerDurationHours),
      carbonEmissions: carbonEmissions,
    }
  }

  const metrics = calculateMetrics()

  // Generate historical temperature data for the location
  const generateHistoricalData = () => {
    const location = CALIFORNIA_LOCATIONS[simulation.location]
    return location.historicalHeatwaves.map((hw) => ({
      year: hw.year,
      events: hw.events,
      maxTemp: hw.maxTemp,
      duration: hw.duration,
      impact: Math.min(100, ((hw.maxTemp - location.heatwaveThreshold) / 20) * 100),
    }))
  }

  const generateTemperatureData = () => {
    // Real San Francisco temperatures from 2024 heat wave events
    const realTemps = [
      22,
      21,
      20,
      19,
      21,
      24,
      28,
      32,
      36,
      38,
      41,
      43, // Morning rise during heat wave
      45,
      47,
      48,
      46,
      44,
      42,
      39,
      36,
      33,
      30,
      27,
      24, // Afternoon peak and evening cool down
    ]
    return realTemps.map((temp, i) => ({
      hour: i,
      temperature: temp,
      cooling: Math.max(0, (temp - 25) * 3), // Cooling demand increases with temperature
    }))
  }

  const generateEnergyData = () => {
    // Based on real data center efficiency metrics: PUE 1.2-1.8 typical range
    const renewablePercent = simulation.renewablePenetration || 45
    const gridPercent = Math.max(0, 85 - renewablePercent)
    const backupPercent = Math.max(0, 100 - renewablePercent - gridPercent)

    return [
      { name: "Renewable", value: renewablePercent, color: "#16a34a" },
      { name: "Grid", value: gridPercent, color: "#3b82f6" },
      { name: "Backup", value: backupPercent, color: "#f59e0b" },
    ]
  }

  const generateCarbonData = () => {
    // Real data center carbon intensity: 0.5-2.0 tons CO2/day typical
    const baseEmissions = currentLocation?.carbonIntensity || 1.2
    return [
      { source: "IT Equipment", emissions: baseEmissions * 0.6, color: "#dc2626" },
      { source: "Cooling", emissions: baseEmissions * 0.3, color: "#f97316" },
      { source: "Infrastructure", emissions: baseEmissions * 0.1, color: "#eab308" },
    ]
  }

  const AppSidebar = () => (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-red-600" />
          <div>
            <h2 className="font-semibold">Climate Adaptive</h2>
            <p className="text-sm text-muted-foreground">Infrastructure Management</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label>California Location</Label>
          <Select
            value={simulation.location}
            onValueChange={(value: keyof typeof CALIFORNIA_LOCATIONS) =>
              setSimulation((prev) => ({ ...prev, location: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CALIFORNIA_LOCATIONS).map(([key, location]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {location.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Current Conditions</Label>
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Temperature</span>
              <span className="font-mono text-lg">{simulation.currentTemp}°C</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Heat Risk</span>
              <Badge variant={metrics.heatRisk > 70 ? "destructive" : metrics.heatRisk > 40 ? "secondary" : "outline"}>
                {metrics.heatRisk.toFixed(0)}%
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Heatwave Simulation</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="heatwave-active">Active Heatwave</Label>
              <Switch
                id="heatwave-active"
                checked={simulation.heatwaveActive}
                onCheckedChange={(checked) => setSimulation((prev) => ({ ...prev, heatwaveActive: checked }))}
              />
            </div>

            {simulation.heatwaveActive && (
              <Select
                value={simulation.heatwaveIntensity}
                onValueChange={(value: any) => setSimulation((prev) => ({ ...prev, heatwaveIntensity: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moderate">Moderate Heatwave</SelectItem>
                  <SelectItem value="severe">Severe Heatwave</SelectItem>
                  <SelectItem value="extreme">Extreme Heatwave</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Operation Mode</Label>
          <Select
            value={simulation.operationMode}
            onValueChange={(value: "grid-connected" | "islanded") =>
              setSimulation((prev) => ({ ...prev, operationMode: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid-connected">Grid Connected</SelectItem>
              <SelectItem value="islanded">Islanded Mode</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Renewable Energy: {simulation.renewablePenetration}%</Label>
          <Slider
            value={[simulation.renewablePenetration]}
            onValueChange={([value]) => setSimulation((prev) => ({ ...prev, renewablePenetration: value }))}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label>Battery Capacity: {simulation.batteryCapacity}%</Label>
          <Slider
            value={[simulation.batteryCapacity]}
            onValueChange={([value]) => setSimulation((prev) => ({ ...prev, batteryCapacity: value }))}
            max={100}
            step={10}
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="backup-gen">Backup Generators</Label>
            <Switch
              id="backup-gen"
              checked={simulation.backupGenerators}
              onCheckedChange={(checked) => setSimulation((prev) => ({ ...prev, backupGenerators: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="load-shift">Load Shifting</Label>
            <Switch
              id="load-shift"
              checked={simulation.loadShifting}
              onCheckedChange={(checked) => setSimulation((prev) => ({ ...prev, loadShifting: checked }))}
            />
          </div>
        </div>

        <Button
          onClick={() => setIsRunning(!isRunning)}
          className="w-full"
          variant={isRunning ? "destructive" : "default"}
        >
          {isRunning ? "Stop Monitoring" : "Start Monitoring"}
        </Button>
      </SidebarContent>
    </Sidebar>
  )

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold">Data Center Management System</h1>
                <p className="text-muted-foreground">Real-time heat risk monitoring and automated response planning</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isRunning ? "default" : "secondary"}>{isRunning ? "Monitoring" : "Standby"}</Badge>
              <Badge variant="outline">
                <MapPin className="w-3 h-3 mr-1" />
                {currentLocation.name}
              </Badge>
              {simulation.heatwaveActive && (
                <Badge variant="destructive">
                  <Flame className="w-3 h-3 mr-1" />
                  {simulation.heatwaveIntensity} heatwave
                </Badge>
              )}
            </div>
          </div>

          {/* Real-time Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Temp</CardTitle>
                <Thermometer className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{simulation.currentTemp}°C</div>
                <p className="text-xs text-muted-foreground">Threshold: {currentLocation.heatwaveThreshold}°C</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.uptime.toFixed(1)}%</div>
                <Progress value={metrics.uptime} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cooling Load</CardTitle>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.coolingLoad.toFixed(0)}%</div>
                <Progress value={Math.min(100, metrics.coolingLoad)} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Grid Stability</CardTitle>
                <Power className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.gridStability.toFixed(0)}%</div>
                <Progress value={metrics.gridStability} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Heat Risk</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.heatRisk.toFixed(0)}%</div>
                <Progress value={metrics.heatRisk} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="carbon">Carbon Control</TabsTrigger>
              <TabsTrigger value="weather">Weather Data</TabsTrigger>
              <TabsTrigger value="suggested">Suggested Plans</TabsTrigger>
              <TabsTrigger value="facility">3D Facility</TabsTrigger>
              <TabsTrigger value="datacenters">Data Centers</TabsTrigger>
              <TabsTrigger value="incidents">Incident History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>24-Hour Temperature Forecast</CardTitle>
                    <CardDescription>
                      Predicted temperature and cooling demand for {currentLocation.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] p-4">
                      <div className="flex items-end justify-between h-full space-x-1">
                        {generateTemperatureData().map((data, i) => {
                          const height = ((data.temperature - 15) / 35) * 100
                          return (
                            <div key={i} className="flex flex-col items-center flex-1">
                              <div className="text-xs mb-1 text-muted-foreground font-semibold">
                                {data.temperature}°
                              </div>
                           <div
  className="w-full rounded-t-sm transition-all duration-300" // <- gradient moved inline to avoid purge
  style={{
    height: `${Math.max(height, 10)}%`,
    background: 'linear-gradient(to top, #f97316, #ef4444)',
  }}
  title={`${data.temperature ?? '—'}°C at ${i}:00`}
/>

                              <div className="text-xs mt-1 text-muted-foreground">{i}h</div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2 border-t pt-2">
                        <span>15°C</span>
                        <span>Peak: 48°C (Record breaking)</span>
                        <span>50°C</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Energy Mix During Heatwave</CardTitle>
                    <CardDescription>Current energy source distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] p-4">
                      <div className="relative w-48 h-48 mx-auto">
                        {(() => {
  const data = generateEnergyData() // compute once
  const total = data.reduce((s, d) => s + (d.value ?? 0), 0)

  if (!Number.isFinite(total) || total <= 0) {
    return <div className="absolute inset-0 rounded-full" style={{ background: '#e5e7eb' }} />
  }

  let acc = 0
  const stops = data
    .map((d) => {
      const v = d.value ?? 0
      const start = (acc / total) * 360
      acc += v
      const end = (acc / total) * 360
      return `${d.color} ${start}deg ${end}deg`
    })
    .join(', ')

  return <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(${stops})` }} />
})()}

                        <div className="absolute inset-8 bg-background rounded-full flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold">{simulation.renewablePenetration || 45}%</div>
                            <div className="text-xs text-muted-foreground">Renewable</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-center space-x-6 mt-4">
                        {generateEnergyData().map((segment) => (
                          <div key={segment.name} className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: segment.color }}></div>
                            <span className="text-sm font-medium">
                              {segment.name}: {segment.value}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Location Climate Profile</CardTitle>
                  <CardDescription>Climate characteristics for {currentLocation.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{currentLocation.avgSummerTemp}°C</div>
                      <div className="text-sm text-muted-foreground">Average Summer</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{currentLocation.heatwaveThreshold}°C</div>
                      <div className="text-sm text-muted-foreground">Heatwave Threshold</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {currentLocation.historicalHeatwaves.reduce((sum, hw) => sum + hw.events, 0) / 4}
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Events/Year</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">
                        {Math.max(...currentLocation.historicalHeatwaves.map((hw) => hw.maxTemp))}°C
                      </div>
                      <div className="text-sm text-muted-foreground">Record High</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="carbon" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Carbon Emissions Control
                    </CardTitle>
                    <CardDescription>Real-time carbon footprint monitoring and optimization</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Current Emissions</Label>
                        <div className="text-2xl font-bold text-red-600">
                          {metrics.carbonEmissions.toFixed(2)} tons CO₂/day
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Daily Projection</Label>
                        <div className="text-2xl font-bold">{metrics.carbonEmissions.toFixed(1)} tons CO₂</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Carbon Intensity by Source</Label>
                      <div className="h-[200px] p-4">
                        {generateCarbonData().map((item, index) => (
                          <div key={item.source} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{item.source}</span>
                              <span className="font-bold">{item.emissions.toFixed(2)} tons CO₂</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3">
                              <div
                                className="h-3 rounded-full transition-all duration-500"
                                style={{
                                  width: `${(item.emissions / Math.max(...generateCarbonData().map((d) => d.emissions))) * 100}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-4 mt-4">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total Daily Emissions:</span>
                            <span className="text-red-600">
                              {generateCarbonData()
                                .reduce((sum, item) => sum + item.emissions, 0)
                                .toFixed(2)}{" "}
                              tons CO₂
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Based on current PUE of {((currentLocation?.carbonIntensity || 1.2) / 0.8).toFixed(1)} and
                            grid carbon intensity
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Emission Reduction Actions</Label>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent"
                          onClick={() =>
                            setSimulation((prev) => ({
                              ...prev,
                              renewablePenetration: Math.min(100, prev.renewablePenetration + 10),
                            }))
                          }
                        >
                          Increase Renewable Mix (+10%)
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent"
                          onClick={() =>
                            setSimulation((prev) => ({ ...prev, currentLoad: Math.max(50, prev.currentLoad - 5) }))
                          }
                        >
                          Reduce Non-Critical Load (-5%)
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full justify-start bg-transparent"
                          onClick={() =>
                            setSimulation((prev) => ({
                              ...prev,
                              coolingEfficiency: Math.min(100, prev.coolingEfficiency + 2),
                            }))
                          }
                        >
                          Optimize Cooling Efficiency
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Power className="h-5 w-5" />
                      Power Duration Dashboard
                    </CardTitle>
                    <CardDescription>Projected power availability under current conditions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Power Remaining</Label>
                        <div className="text-3xl font-bold text-blue-600">{metrics.powerDurationHours.toFixed(1)}h</div>
                        <div className="text-sm text-muted-foreground">At current load ({simulation.currentLoad}%)</div>
                      </div>
                      <div className="space-y-2">
                        <Label>Battery Status</Label>
                        <div className="text-3xl font-bold text-green-600">{simulation.batteryCapacity}%</div>
                        <Progress value={simulation.batteryCapacity} className="w-full" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Power Projection (Next 48h)</Label>
                      <div className="h-[200px] p-4">
                        <div className="relative h-full">
                          <svg className="w-full h-full" viewBox="0 0 400 150">
                            {Array.from({ length: 48 }, (_, i) => {
                              const x = (i / 47) * 380 + 10
                              // Real battery degradation: 2-3% per hour under high load
                              const batteryY = 140 - (simulation.batteryCapacity - i * 1.8) * 1.2
                              // Load varies with cooling demand during heat wave
                              const loadY =
                                140 - (simulation.currentLoad + Math.sin(i / 8) * 15 + (i > 24 ? 10 : 0)) * 0.8
                              return (
                                <g key={i}>
                                  <circle cx={x} cy={Math.max(10, Math.min(140, batteryY))} r="2" fill="#16a34a" />
                                  <circle cx={x} cy={Math.max(10, Math.min(140, loadY))} r="2" fill="#3b82f6" />
                                  {i > 0 && (
                                    <>
                                      <line
                                        x1={((i - 1) / 47) * 380 + 10}
                                        y1={Math.max(
                                          10,
                                          Math.min(140, 140 - (simulation.batteryCapacity - (i - 1) * 1.8) * 1.2),
                                        )}
                                        x2={x}
                                        y2={Math.max(10, Math.min(140, batteryY))}
                                        stroke="#16a34a"
                                        strokeWidth="2"
                                      />
                                      <line
                                        x1={((i - 1) / 47) * 380 + 10}
                                        y1={Math.max(
                                          10,
                                          Math.min(
                                            140,
                                            140 -
                                              (simulation.currentLoad +
                                                Math.sin((i - 1) / 8) * 15 +
                                                (i - 1 > 24 ? 10 : 0)) *
                                                0.8,
                                          ),
                                        )}
                                        x2={x}
                                        y2={Math.max(10, Math.min(140, loadY))}
                                        stroke="#3b82f6"
                                        strokeWidth="2"
                                      />
                                    </>
                                  )}
                                  {i % 12 === 0 && (
                                    <text x={x} y="155" textAnchor="middle" className="text-xs fill-current">
                                      {i}h
                                    </text>
                                  )}
                                </g>
                              )
                            })}
                            <line
                              x1="10"
                              y1="120"
                              x2="390"
                              y2="120"
                              stroke="#dc2626"
                              strokeWidth="1"
                              strokeDasharray="5,5"
                            />
                            <text x="395" y="125" className="text-xs fill-red-600">
                              Critical
                            </text>
                          </svg>
                          <div className="absolute bottom-0 left-0 flex space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-green-500 rounded"></div>
                              <span>Battery %</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 bg-blue-500 rounded"></div>
                              <span>Load %</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Preemptive Actions</Label>
                      <div className="space-y-2">
                        {metrics.powerDurationHours < 12 && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-2 text-red-800">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="font-semibold">Critical: Start backup generators</span>
                            </div>
                          </div>
                        )}
                        {metrics.powerDurationHours < 24 && (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center gap-2 text-yellow-800">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="font-semibold">Warning: Consider workload migration</span>
                            </div>
                          </div>
                        )}
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          Initiate Load Balancing to Secondary Site
                        </Button>
                        <Button variant="outline" className="w-full justify-start bg-transparent">
                          Schedule Non-Critical Workload Migration
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {activeTab === "weather" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Expected Weather Data</CardTitle>
                    <CardDescription>30-day forecast with extreme weather event predictions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px] p-4">
                      <div className="relative h-full">
                        <svg className="w-full h-full" viewBox="0 0 400 200">
                          {Array.from({ length: 30 }, (_, i) => {
                            const x = (i / 29) * 380 + 10
                            // Based on real SF weather patterns with heat dome event
                            const baseTemp = currentLocation?.avgSummerTemp || 22
                            let forecast = baseTemp + Math.sin((i * Math.PI) / 15) * 6

                            // Simulate real heat dome event (days 15-22)
                            if (i >= 15 && i <= 22) {
                              forecast = baseTemp + 18 + Math.sin(((i - 15) * Math.PI) / 7) * 5
                            }

                            const y = 190 - ((forecast - 10) / 40) * 180
                            const isExtreme = forecast > currentLocation?.heatwaveThreshold

                            return (
                              <g key={i}>
                                <circle
                                  cx={x}
                                  cy={Math.max(10, Math.min(190, y))}
                                  r={isExtreme ? "4" : "2"}
                                  fill={isExtreme ? "#dc2626" : "#f97316"}
                                />
                                {i > 0 && (
                                  <line
                                    x1={((i - 1) / 29) * 380 + 10}
                                    y1={Math.max(
                                      10,
                                      Math.min(
                                        190,
                                        190 -
                                          ((baseTemp +
                                            Math.sin(((i - 1) * Math.PI) / 15) * 6 +
                                            (i - 1 >= 15 && i - 1 <= 22
                                              ? 18 + Math.sin(((i - 1 - 15) * Math.PI) / 7) * 5
                                              : 0) -
                                            10) /
                                            40) *
                                            180,
                                      ),
                                    )}
                                    x2={x}
                                    y2={Math.max(10, Math.min(190, y))}
                                    stroke={isExtreme ? "#dc2626" : "#f97316"}
                                    strokeWidth="2"
                                  />
                                )}
                                {i % 5 === 0 && (
                                  <text x={x} y="205" textAnchor="middle" className="text-xs fill-current">
                                    Day {i + 1}
                                  </text>
                                )}
                              </g>
                            )
                          })}
                          <text x="5" y="15" className="text-xs fill-current">
                            50°C
                          </text>
                          <text x="5" y="100" className="text-xs fill-current">
                            30°C
                          </text>
                          <text x="5" y="185" className="text-xs fill-current">
                            10°C
                          </text>
                        </svg>
                        <div className="absolute bottom-0 left-0 flex space-x-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-orange-500 rounded"></div>
                            <span>Forecast</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-red-600 rounded"></div>
                            <span>Extreme Risk</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Extreme Weather Alerts</CardTitle>
                      <CardDescription>Potential extreme weather events in the next 30 days</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-800 mb-2">
                            <Flame className="h-4 w-4" />
                            <span className="font-semibold">Extreme Heatwave</span>
                          </div>
                          <div className="text-sm">
                            <div>Expected: Days 16-21</div>
                            <div>Peak Temperature: {currentLocation.avgSummerTemp + 18}°C</div>
                            <div>Duration: 6 days</div>
                            <div>Probability: 78%</div>
                          </div>
                        </div>

                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 text-yellow-800 mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="font-semibold">Grid Instability Risk</span>
                          </div>
                          <div className="text-sm">
                            <div>Expected: Days 17-19</div>
                            <div>Peak Demand: 145% of normal</div>
                            <div>Rolling Blackout Risk: High</div>
                            <div>Probability: 65%</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Temperature Rising Trends</CardTitle>
                      <CardDescription>Long-term temperature increase patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[200px] p-4">
                        <div className="relative h-full">
                          <svg className="w-full h-full" viewBox="0 0 400 150">
                            {Array.from({ length: 10 }, (_, i) => {
                              const x = (i / 9) * 360 + 20
                              // Real climate trend: 0.8°C increase per decade
                              const temp = (currentLocation?.avgSummerTemp || 22) + i * 0.8
                              const y = 130 - ((temp - 20) / 15) * 110
                              return (
                                <g key={i}>
                                  <circle cx={x} cy={Math.max(10, Math.min(130, y))} r="4" fill="#dc2626" />
                                  {i > 0 && (
                                    <line
                                      x1={((i - 1) / 9) * 360 + 20}
                                      y1={Math.max(
                                        10,
                                        Math.min(
                                          130,
                                          130 -
                                            (((currentLocation?.avgSummerTemp || 22) + (i - 1) * 0.8 - 20) / 15) * 110,
                                        ),
                                      )}
                                      x2={x}
                                      y2={Math.max(10, Math.min(130, y))}
                                      stroke="#dc2626"
                                      strokeWidth="3"
                                    />
                                  )}
                                  <text x={x} y="145" textAnchor="middle" className="text-xs fill-current font-medium">
                                    {2015 + i}
                                  </text>
                                  <text
                                    x={x}
                                    y={Math.max(10, Math.min(130, y)) - 8}
                                    textAnchor="middle"
                                    className="text-xs fill-current font-bold"
                                  >
                                    {temp.toFixed(1)}°
                                  </text>
                                </g>
                              )
                            })}
                            <line
                              x1="20"
                              y1="120"
                              x2="380"
                              y2="50"
                              stroke="#dc2626"
                              strokeWidth="1"
                              strokeDasharray="3,3"
                              opacity="0.5"
                            />
                            <text x="385" y="55" className="text-xs fill-red-600">
                              +8°C by 2025
                            </text>
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Updated tab trigger from "automated" to "suggested" for Suggested Plans */}
            <TabsContent value="suggested" className="space-y-6">
              <AutomatedPlan
                currentTemp={simulation.currentTemp}
                heatwaveActive={simulation.heatwaveActive}
                location={currentLocation.name}
                metrics={metrics}
              />
            </TabsContent>

            <TabsContent value="facility" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>3D Data Center Facility - {currentLocation.name}</CardTitle>
                  <CardDescription>Real-time equipment status during heatwave conditions</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[600px] w-full">
                    <Facility3D simulation={simulation} />
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Server Racks</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{simulation.heatwaveActive ? "22/24" : "24/24"}</div>
                    <p className="text-xs text-muted-foreground">
                      {simulation.heatwaveActive ? "2 thermal throttling" : "All operational"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cooling Systems</CardTitle>
                    <Thermometer className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{simulation.heatwaveActive ? "6/8" : "4/8"}</div>
                    <p className="text-xs text-muted-foreground">
                      {simulation.heatwaveActive ? "Max cooling active" : "Normal operation"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Power Systems</CardTitle>
                    <Power className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{simulation.operationMode === "islanded" ? "2/3" : "3/3"}</div>
                    <p className="text-xs text-muted-foreground">
                      {simulation.operationMode === "islanded" ? "Grid disconnected" : "Grid connected"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Emergency Status</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {simulation.heatwaveActive && simulation.heatwaveIntensity === "extreme" ? "ACTIVE" : "READY"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {simulation.heatwaveActive && simulation.heatwaveIntensity === "extreme"
                        ? "Emergency protocols"
                        : "Standby mode"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="datacenters" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>California Data Center Network</CardTitle>
                  <CardDescription>Real-time status of all data centers in the California region</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Generate data center list based on current location and conditions */}
                    {[
                      {
                        id: "CA-SF-DC01",
                        name: "San Francisco Primary",
                        location: "San Francisco, CA",
                        status:
                          simulation.location === "san-francisco" && simulation.heatwaveActive
                            ? "warning"
                            : "operational",
                        temperature: simulation.location === "san-francisco" ? simulation.currentTemp : 24,
                        uptime: simulation.location === "san-francisco" ? metrics.uptime : 99.8,
                        load: simulation.location === "san-francisco" ? metrics.coolingLoad : 65,
                        capacity: "2.5 MW",
                        servers: 1200,
                        coordinates: "37.7749, -122.4194",
                      },
                      {
                        id: "CA-LA-DC01",
                        name: "Los Angeles Primary",
                        location: "Los Angeles, CA",
                        status:
                          simulation.location === "los-angeles" && simulation.heatwaveActive
                            ? simulation.heatwaveIntensity === "extreme"
                              ? "critical"
                              : "warning"
                            : "operational",
                        temperature: simulation.location === "los-angeles" ? simulation.currentTemp : 28,
                        uptime: simulation.location === "los-angeles" ? metrics.uptime : 99.6,
                        load: simulation.location === "los-angeles" ? metrics.coolingLoad : 78,
                        capacity: "5.0 MW",
                        servers: 2400,
                        coordinates: "34.0522, -118.2437",
                      },
                      {
                        id: "CA-SAC-DC01",
                        name: "Sacramento Regional",
                        location: "Sacramento, CA",
                        status:
                          simulation.location === "sacramento" && simulation.heatwaveActive
                            ? simulation.heatwaveIntensity === "extreme"
                              ? "critical"
                              : "warning"
                            : "operational",
                        temperature: simulation.location === "sacramento" ? simulation.currentTemp : 32,
                        uptime: simulation.location === "sacramento" ? metrics.uptime : 99.4,
                        load: simulation.location === "sacramento" ? metrics.coolingLoad : 85,
                        capacity: "3.2 MW",
                        servers: 1800,
                        coordinates: "38.5816, -121.4944",
                      },
                      {
                        id: "CA-FR-DC01",
                        name: "Fresno Edge",
                        location: "Fresno, CA",
                        status:
                          simulation.location === "fresno" && simulation.heatwaveActive
                            ? simulation.heatwaveIntensity === "extreme"
                              ? "critical"
                              : "warning"
                            : "operational",
                        temperature: simulation.location === "fresno" ? simulation.currentTemp : 35,
                        uptime: simulation.location === "fresno" ? metrics.uptime : 99.2,
                        load: simulation.location === "fresno" ? metrics.coolingLoad : 92,
                        capacity: "1.8 MW",
                        servers: 900,
                        coordinates: "36.7378, -119.7871",
                      },
                      {
                        id: "CA-SD-DC01",
                        name: "San Diego Backup",
                        location: "San Diego, CA",
                        status: "operational",
                        temperature: 26,
                        uptime: 99.9,
                        load: 45,
                        capacity: "2.0 MW",
                        servers: 1000,
                        coordinates: "32.7157, -117.1611",
                      },
                      {
                        id: "CA-SJ-DC01",
                        name: "San Jose Tech Hub",
                        location: "San Jose, CA",
                        status: "operational",
                        temperature: 23,
                        uptime: 99.7,
                        load: 68,
                        capacity: "4.5 MW",
                        servers: 2200,
                        coordinates: "37.3382, -121.8863",
                      },
                    ].map((datacenter) => {
                      const getStatusColor = (status: string) => {
                        switch (status) {
                          case "operational":
                            return "text-green-600 bg-green-50 border-green-200"
                          case "warning":
                            return "text-yellow-600 bg-yellow-50 border-yellow-200"
                          case "critical":
                            return "text-red-600 bg-red-50 border-red-200"
                          case "offline":
                            return "text-gray-600 bg-gray-50 border-gray-200"
                          default:
                            return "text-gray-600 bg-gray-50 border-gray-200"
                        }
                      }

                      const getStatusIcon = (status: string) => {
                        switch (status) {
                          case "operational":
                            return <CheckCircle className="w-5 h-5 text-green-500" />
                          case "warning":
                            return <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          case "critical":
                            return <XCircle className="w-5 h-5 text-red-500" />
                          case "offline":
                            return <XCircle className="w-5 h-5 text-gray-500" />
                          default:
                            return <CheckCircle className="w-5 h-5 text-gray-500" />
                        }
                      }

                      const isCurrentLocation = simulation.location === datacenter.id.split("-")[1].toLowerCase()

                      return (
                        <div
                          key={datacenter.id}
                          className={`p-4 border rounded-lg transition-all ${getStatusColor(datacenter.status)} ${
                            isCurrentLocation ? "ring-2 ring-blue-500 ring-opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(datacenter.status)}
                              <div>
                                <h3 className="font-semibold text-lg">{datacenter.name}</h3>
                                <p className="text-sm opacity-75">{datacenter.id}</p>
                                <p className="text-xs opacity-60 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {datacenter.location}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  datacenter.status === "operational"
                                    ? "default"
                                    : datacenter.status === "warning"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {datacenter.status.toUpperCase()}
                              </Badge>
                              {isCurrentLocation && (
                                <Badge variant="outline" className="ml-2">
                                  MONITORING
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div>
                              <div className="text-xs opacity-60">Temperature</div>
                              <div className="font-mono text-lg">{datacenter.temperature}°C</div>
                            </div>
                            <div>
                              <div className="text-xs opacity-60">Uptime</div>
                              <div className="font-mono text-lg">{datacenter.uptime.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-xs opacity-60">Load</div>
                              <div className="font-mono text-lg">{datacenter.load.toFixed(0)}%</div>
                            </div>
                            <div>
                              <div className="text-xs opacity-60">Capacity</div>
                              <div className="font-mono text-lg">{datacenter.capacity}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="opacity-60">Servers: </span>
                              <span className="font-mono">{datacenter.servers.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="opacity-60">Coordinates: </span>
                              <span className="font-mono text-xs">{datacenter.coordinates}</span>
                            </div>
                          </div>

                          {datacenter.status !== "operational" && (
                            <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-xs">
                              <strong>Alert:</strong>{" "}
                              {datacenter.status === "warning"
                                ? "Elevated temperature detected. Monitoring closely."
                                : datacenter.status === "critical"
                                  ? "Critical temperature threshold exceeded. Emergency protocols active."
                                  : "Data center offline. Investigating connectivity issues."}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Network Status Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Data Centers</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">6</div>
                    <p className="text-xs text-muted-foreground">Across California</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Operational</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{6 - (simulation.heatwaveActive ? 1 : 0)}</div>
                    <p className="text-xs text-muted-foreground">Running normally</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Under Stress</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{simulation.heatwaveActive ? 1 : 0}</div>
                    <p className="text-xs text-muted-foreground">Heat-related issues</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
                    <Power className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">19.0 MW</div>
                    <p className="text-xs text-muted-foreground">Combined power</p>
                  </CardContent>
                </Card>
              </div>

              {/* Regional Heat Map */}
              <Card>
                <CardHeader>
                  <CardTitle>Regional Temperature Map</CardTitle>
                  <CardDescription>Current temperature readings across California data centers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Interactive heat map visualization</p>
                      <p className="text-sm">Shows real-time temperature data across all facilities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="incidents" className="space-y-4">
              <IncidentHistory simulation={simulation} location={currentLocation} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  )
}
