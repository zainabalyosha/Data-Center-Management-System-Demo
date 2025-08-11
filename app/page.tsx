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
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
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

          <Tabs defaultValue="overview" className="space-y-4">
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
                    <ChartContainer
                      config={{
                        temperature: { label: "Temperature (°C)", color: "hsl(0, 84%, 60%)" },
                        coolingDemand: { label: "Cooling Demand (%)", color: "hsl(220, 91%, 60%)" },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={Array.from({ length: 24 }, (_, i) => {
                            const baseTemp = currentLocation.avgSummerTemp + 8 * Math.sin((i * Math.PI) / 12)
                            const heatwaveEffect = simulation.heatwaveActive
                              ? simulation.heatwaveIntensity === "extreme"
                                ? 20
                                : simulation.heatwaveIntensity === "severe"
                                  ? 15
                                  : 10
                              : 0
                            const temp = baseTemp + heatwaveEffect
                            return {
                              hour: i,
                              temperature: Math.round(temp),
                              coolingDemand: Math.min(150, 100 + (temp - currentLocation.avgSummerTemp) * 3),
                            }
                          })}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line
                            type="monotone"
                            dataKey="temperature"
                            stroke="var(--color-temperature)"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="coolingDemand"
                            stroke="var(--color-coolingDemand)"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Energy Mix During Heatwave</CardTitle>
                    <CardDescription>Current energy source distribution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer
                      config={{
                        renewable: { label: "Renewable", color: "hsl(120, 70%, 50%)" },
                        grid: { label: "Grid", color: "hsl(45, 93%, 47%)" },
                        backup: { label: "Backup", color: "hsl(0, 84%, 60%)" },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Renewable",
                                value: simulation.heatwaveActive
                                  ? Math.max(20, simulation.renewablePenetration - 15)
                                  : simulation.renewablePenetration,
                                fill: "hsl(120, 70%, 50%)",
                              },
                              {
                                name: "Grid",
                                value:
                                  simulation.operationMode === "grid-connected"
                                    ? simulation.heatwaveActive
                                      ? 45
                                      : 35
                                    : 0,
                                fill: "hsl(var(--chart-4))",
                              },
                              {
                                name: "Backup",
                                value: simulation.backupGenerators ? (simulation.heatwaveActive ? 35 : 15) : 0,
                                fill: "hsl(0, 84%, 60%)",
                              },
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}
                          />
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
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

            {/* Added new Carbon Control tab with emissions tracking and power duration dashboard */}
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
                      <ChartContainer
                        config={{
                          grid: { label: "Grid Power", color: "hsl(0, 84%, 60%)" },
                          renewable: { label: "Renewable", color: "hsl(120, 70%, 50%)" },
                          backup: { label: "Backup Gen", color: "hsl(25, 95%, 53%)" },
                        }}
                        className="h-[200px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { source: "Grid", emissions: 0.85, percentage: 45 },
                              { source: "Renewable", emissions: 0.02, percentage: 35 },
                              { source: "Backup", emissions: 1.2, percentage: 20 },
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="source" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="emissions" fill="var(--color-grid)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
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
                      <ChartContainer
                        config={{
                          battery: { label: "Battery %", color: "hsl(120, 70%, 50%)" },
                          load: { label: "Load %", color: "hsl(220, 91%, 60%)" },
                        }}
                        className="h-[200px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={Array.from({ length: 48 }, (_, i) => {
                              const batteryDrain = simulation.currentLoad * 0.8
                              const remainingBattery = Math.max(0, simulation.batteryCapacity - (batteryDrain * i) / 24)
                              return {
                                hour: i,
                                battery: remainingBattery,
                                load:
                                  simulation.currentLoad +
                                  (simulation.heatwaveActive ? Math.sin((i * Math.PI) / 12) * 10 : 0),
                              }
                            })}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line type="monotone" dataKey="battery" stroke="var(--color-battery)" strokeWidth={2} />
                            <Line type="monotone" dataKey="load" stroke="var(--color-load)" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
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

            {/* Replaced Historical Data tab with Weather Data tab showing expected weather and extreme events */}
            <TabsContent value="weather" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Expected Weather Data & Extreme Events</CardTitle>
                  <CardDescription>
                    Forecasted weather patterns and potential extreme weather events for {currentLocation.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      forecast: { label: "Forecasted Temp (°C)", color: "hsl(25, 95%, 53%)" },
                      extreme: { label: "Extreme Event Risk", color: "hsl(0, 84%, 60%)" },
                      historical: { label: "Historical Average", color: "hsl(220, 91%, 60%)" },
                    }}
                    className="h-[400px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={Array.from({ length: 30 }, (_, i) => ({
                          day: i + 1,
                          forecast:
                            currentLocation.avgSummerTemp +
                            Math.sin((i * Math.PI) / 15) * 8 +
                            (Math.random() - 0.5) * 6,
                          extreme: i > 15 && i < 22 ? currentLocation.avgSummerTemp + 18 : null,
                          historical: currentLocation.avgSummerTemp + Math.sin((i * Math.PI) / 15) * 5,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="forecast" stroke="var(--color-forecast)" strokeWidth={2} />
                        <Line
                          type="monotone"
                          dataKey="extreme"
                          stroke="var(--color-extreme)"
                          strokeWidth={3}
                          strokeDasharray="5 5"
                        />
                        <Line
                          type="monotone"
                          dataKey="historical"
                          stroke="var(--color-historical)"
                          strokeWidth={1}
                          opacity={0.6}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
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
                    <ChartContainer
                      config={{
                        trend: { label: "Temperature Trend", color: "hsl(0, 84%, 60%)" },
                      }}
                      className="h-[200px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={Array.from({ length: 10 }, (_, i) => ({
                            year: 2015 + i,
                            trend: currentLocation.avgSummerTemp + i * 0.8 + Math.sin(i) * 2,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Line type="monotone" dataKey="trend" stroke="var(--color-trend)" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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
