"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap, Thermometer, Server, AlertTriangle, Activity, Gauge } from "lucide-react"
import { useState } from "react"

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

interface AutomatedPlanProps {
  currentTemp: number
  heatwaveActive: boolean
  location: string
  metrics: any
}

interface Plan {
  id: string
  name: string
  description: string
  riskLevel: "low" | "medium" | "high" | "critical"
  successRate: number
  estimatedCost: number
  energySavings: number
  coolingEfficiency: number
  paybackPeriod: number
  executionTime: number
  actions: PlanAction[]
  dependencies: string[]
  criticalPath: string[]
}

interface PlanAction {
  category: "load-shifting" | "cooling" | "energy" | "infrastructure" | "automation" | "monitoring"
  title: string
  description: string
  technicalDetails: string
  impact: string
  cost: number
  operationalCost: number
  duration: string
  priority: "critical" | "high" | "medium" | "low"
  prerequisites: string[]
  risks: string[]
  kpis: string[]
}

export function AutomatedPlan({ currentTemp, heatwaveActive, location, metrics }: AutomatedPlanProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [expandedActions, setExpandedActions] = useState<Set<string>>(new Set())

  const generatePlanOptions = (): Plan[] => {
    const baseTemp = currentTemp || 75
    const isExtreme = metrics?.heatwaveIntensity === "extreme" || currentTemp > 40
    const hasRenewables = metrics?.renewablePenetration > 50

    return [
      {
        id: "emergency",
        name: "Plan 1", // Changed from "Emergency Response" to "Plan 1"
        description: "Immediate crisis response with maximum cooling and load reduction",
        riskLevel: "critical",
        successRate: 92,
        estimatedCost: 75000,
        energySavings: 45,
        coolingEfficiency: 65,
        paybackPeriod: 2.5,
        executionTime: 90,
        dependencies: ["Grid stability", "Backup power", "Cooling systems"],
        criticalPath: ["Immediate cooling", "Load shedding", "Power management"],
        actions: [
          {
            category: "cooling",
            title: "Emergency Liquid Cooling Deployment",
            description: "Deploy mobile liquid cooling units to critical server racks",
            technicalDetails: "Install 12x portable immersion cooling units, 500kW capacity each",
            impact: "Reduces critical rack temps by 15-20°C within 30 minutes",
            cost: 25000,
            operationalCost: 3500,
            duration: "30 min",
            priority: "critical",
            prerequisites: ["Cooling technicians on-site", "Emergency cooling inventory"],
            risks: ["Potential condensation", "Installation complexity"],
            kpis: ["Temperature reduction", "Installation time", "System stability"],
          },
          {
            category: "load-shifting",
            title: "Massive Workload Evacuation",
            description: "Emergency migration of 80% workloads to partner facilities",
            technicalDetails: "Live migration via 100Gbps dedicated links to 3 partner DCs",
            impact: "Reduces local heat generation by 60%, frees cooling capacity",
            cost: 15000,
            operationalCost: 8000,
            duration: "45 min",
            priority: "critical",
            prerequisites: ["Partner DC capacity confirmed", "Network links verified"],
            risks: ["Migration failures", "Service interruption", "Data consistency"],
            kpis: ["Migration success rate", "Service uptime", "Data integrity"],
          },
          {
            category: "energy",
            title: "Grid Disconnect & Battery Mode",
            description: "Switch to full battery/generator power to reduce grid heat",
            technicalDetails: "Activate 50MW battery bank + 25MW diesel generators",
            impact: "Eliminates grid dependency, reduces transformer heat by 100%",
            cost: 20000,
            operationalCost: 12000,
            duration: "15 min",
            priority: "high",
            prerequisites: ["Battery charge >90%", "Generator fuel levels"],
            risks: ["Limited runtime", "Generator reliability", "Fuel consumption"],
            kpis: ["Power stability", "Runtime remaining", "Fuel efficiency"],
          },
          {
            category: "infrastructure",
            title: "Non-Essential System Shutdown",
            description: "Controlled shutdown of 40% non-critical infrastructure",
            technicalDetails: "Graceful shutdown of dev/test environments, backup systems",
            impact: "Reduces heat load by 35%, frees cooling for critical systems",
            cost: 5000,
            operationalCost: 2000,
            duration: "20 min",
            priority: "high",
            prerequisites: ["Service dependency mapping", "Shutdown procedures"],
            risks: ["Service impact", "Restart complexity", "Data loss"],
            kpis: ["Shutdown success", "Heat reduction", "Service availability"],
          },
          {
            category: "monitoring",
            title: "Crisis Command Center Activation",
            description: "24/7 monitoring with predictive analytics and automated responses",
            technicalDetails: "Deploy advanced monitoring with 30-second response cycles",
            impact: "Enables real-time optimization and prevents cascade failures",
            cost: 10000,
            operationalCost: 5000,
            duration: "10 min",
            priority: "medium",
            prerequisites: ["Monitoring team available", "Analytics systems online"],
            risks: ["False alarms", "System complexity", "Staff fatigue"],
            kpis: ["Response time", "Prediction accuracy", "System uptime"],
          },
        ],
      },
      {
        id: "conservative",
        name: "Plan 2", // Changed from "Conservative Approach" to "Plan 2"
        description: "Low-risk gradual response with proven technologies",
        riskLevel: "low",
        successRate: 96,
        estimatedCost: 22000,
        energySavings: 18,
        coolingEfficiency: 25,
        paybackPeriod: 8.5,
        executionTime: 120,
        dependencies: ["Standard cooling systems", "Basic load balancing"],
        criticalPath: ["Cooling optimization", "Load adjustment", "Monitoring"],
        actions: [
          {
            category: "cooling",
            title: "Gradual CRAC Enhancement",
            description: "Incrementally increase cooling capacity with existing systems",
            technicalDetails: "Boost 24x CRAC units from 70% to 90% capacity over 2 hours",
            impact: "Steady 4-6°C temperature reduction with minimal system stress",
            cost: 3500,
            operationalCost: 1200,
            duration: "60 min",
            priority: "high",
            prerequisites: ["CRAC maintenance current", "Chilled water capacity"],
            risks: ["Gradual response", "Limited capacity", "Energy increase"],
            kpis: ["Temperature stability", "Energy efficiency", "Equipment health"],
          },
          {
            category: "load-shifting",
            title: "Scheduled Workload Balancing",
            description: "Move non-critical workloads to off-peak hours",
            technicalDetails: "Reschedule batch jobs, analytics, and backups to 2-6 AM window",
            impact: "Reduces daytime heat generation by 12-15%",
            cost: 2000,
            operationalCost: 800,
            duration: "45 min",
            priority: "medium",
            prerequisites: ["Job scheduling system", "Workload classification"],
            risks: ["Delayed processing", "Resource conflicts", "SLA impact"],
            kpis: ["Load reduction", "Job completion", "SLA compliance"],
          },
          {
            category: "energy",
            title: "Power Efficiency Optimization",
            description: "Fine-tune power distribution and reduce inefficiencies",
            technicalDetails: "Optimize PDU load balancing, reduce power factor losses",
            impact: "Improves overall efficiency by 8%, reduces waste heat",
            cost: 1500,
            operationalCost: 400,
            duration: "30 min",
            priority: "medium",
            prerequisites: ["Power monitoring data", "Electrical expertise"],
            risks: ["Minimal impact", "Complex tuning", "Measurement accuracy"],
            kpis: ["Power efficiency", "Load balance", "Heat reduction"],
          },
          {
            category: "infrastructure",
            title: "Preventive Maintenance Acceleration",
            description: "Fast-track cooling system maintenance and optimization",
            technicalDetails: "Clean air filters, calibrate sensors, optimize airflow",
            impact: "Improves cooling efficiency by 10-15%",
            cost: 8000,
            operationalCost: 2000,
            duration: "90 min",
            priority: "low",
            prerequisites: ["Maintenance team", "Spare parts inventory"],
            risks: ["Time intensive", "System downtime", "Limited impact"],
            kpis: ["Maintenance completion", "Efficiency gain", "System reliability"],
          },
          {
            category: "monitoring",
            title: "Enhanced Environmental Monitoring",
            description: "Deploy additional sensors and monitoring capabilities",
            technicalDetails: "Install 50x wireless temperature sensors, upgrade DCIM",
            impact: "Provides granular visibility for optimization decisions",
            cost: 7000,
            operationalCost: 1500,
            duration: "75 min",
            priority: "low",
            prerequisites: ["Sensor inventory", "Network capacity"],
            risks: ["Installation time", "Sensor accuracy", "Data overload"],
            kpis: ["Sensor coverage", "Data accuracy", "Response time"],
          },
        ],
      },
      {
        id: "balanced",
        name: "Plan 3", // Changed from "Balanced Strategy" to "Plan 3"
        description: "Optimal mix of proven and innovative solutions",
        riskLevel: "medium",
        successRate: 89,
        estimatedCost: 38000,
        energySavings: 32,
        coolingEfficiency: 42,
        paybackPeriod: 4.2,
        executionTime: 105,
        dependencies: ["Hybrid cooling", "Smart load management", "Battery systems"],
        criticalPath: ["Smart cooling", "Dynamic load shifting", "Energy optimization"],
        actions: [
          {
            category: "cooling",
            title: "Advanced Cooling Optimization",
            description: "Deploy machine learning for dynamic cooling management",
            technicalDetails: "Implement predictive cooling with 200+ sensors and advanced algorithms",
            impact: "Optimizes cooling efficiency by 35%, reduces hotspots by 80%",
            cost: 12000,
            operationalCost: 2500,
            duration: "40 min",
            priority: "high",
            prerequisites: ["Analytics platform ready", "Sensor network", "Historical data"],
            risks: ["Algorithm complexity", "Learning period", "Sensor dependencies"],
            kpis: ["Cooling efficiency", "Hotspot reduction", "Energy savings"],
          },
          {
            category: "load-shifting",
            title: "Dynamic Multi-Site Load Balancing",
            description: "Real-time workload distribution across multiple data centers",
            technicalDetails: "Implement SDN-based load balancing across 5 regional DCs",
            impact: "Distributes heat load, improves performance by 25%",
            cost: 8500,
            operationalCost: 3000,
            duration: "35 min",
            priority: "high",
            prerequisites: ["Inter-DC connectivity", "Load balancing software"],
            risks: ["Network latency", "Complexity", "Failover scenarios"],
            kpis: ["Load distribution", "Response time", "Availability"],
          },
          {
            category: "energy",
            title: "Smart Battery Peak Shaving",
            description: "Intelligent battery usage to reduce peak energy consumption",
            technicalDetails: "Deploy 20MW smart battery system with predictive discharge",
            impact: "Reduces peak energy costs by 40%, improves grid stability",
            cost: 15000,
            operationalCost: 1800,
            duration: "25 min",
            priority: "high",
            prerequisites: ["Battery capacity", "Grid monitoring", "Prediction models"],
            risks: ["Battery degradation", "Prediction accuracy", "Grid regulations"],
            kpis: ["Peak reduction", "Cost savings", "Battery health"],
          },
          {
            category: "automation",
            title: "Automated Response Orchestration",
            description: "Deploy automated systems for coordinated response execution",
            technicalDetails: "Implement workflow automation with 50+ response scenarios",
            impact: "Reduces response time by 60%, improves coordination",
            cost: 2500,
            operationalCost: 800,
            duration: "20 min",
            priority: "medium",
            prerequisites: ["Automation platform", "Response procedures", "Testing"],
            risks: ["Automation failures", "Complex scenarios", "Override needs"],
            kpis: ["Response time", "Automation success", "Coordination quality"],
          },
        ],
      },
      {
        id: "aggressive",
        name: "Plan 4", // Changed from "High-Performance Response" to "Plan 4"
        description: "Maximum efficiency with calculated high-impact measures",
        riskLevel: "high",
        successRate: 82,
        estimatedCost: 65000,
        energySavings: 55,
        coolingEfficiency: 70,
        paybackPeriod: 2.8,
        executionTime: 75,
        dependencies: ["Advanced cooling", "Cloud integration", "Automation systems"],
        criticalPath: ["Immersion cooling", "Cloud bursting", "Grid independence"],
        actions: [
          {
            category: "cooling",
            title: "Rapid Immersion Cooling Deployment",
            description: "Deploy modular immersion cooling for maximum efficiency",
            technicalDetails: "Install 8x modular immersion tanks, 2-phase cooling fluid",
            impact: "Achieves 70% cooling efficiency, handles 200% heat density",
            cost: 35000,
            operationalCost: 4500,
            duration: "45 min",
            priority: "critical",
            prerequisites: ["Immersion equipment", "Specialized coolant", "Trained staff"],
            risks: ["Complex installation", "Coolant leaks", "Equipment compatibility"],
            kpis: ["Cooling efficiency", "Heat density", "Installation success"],
          },
          {
            category: "load-shifting",
            title: "Massive Cloud Burst Integration",
            description: "Shift 70% of workloads to public cloud during peak heat",
            technicalDetails: "Auto-scale to AWS/Azure with 100Gbps dedicated connections",
            impact: "Reduces local heat by 65%, maintains full service capacity",
            cost: 18000,
            operationalCost: 12000,
            duration: "30 min",
            priority: "critical",
            prerequisites: ["Cloud contracts", "Data replication", "Network capacity"],
            risks: ["Cloud costs", "Data transfer", "Vendor lock-in", "Latency"],
            kpis: ["Migration speed", "Cost efficiency", "Performance impact"],
          },
          {
            category: "energy",
            title: "Renewable Energy Maximization",
            description: "Switch to 100% renewable energy with storage optimization",
            technicalDetails: "Activate 30MW solar + 40MW wind + 25MW battery storage",
            impact: "Achieves carbon neutrality, reduces energy costs by 60%",
            cost: 8000,
            operationalCost: 2000,
            duration: "15 min",
            priority: "high",
            prerequisites: ["Renewable capacity", "Storage systems", "Grid disconnect"],
            risks: ["Weather dependency", "Storage limits", "Grid regulations"],
            kpis: ["Renewable percentage", "Cost reduction", "Carbon footprint"],
          },
          {
            category: "automation",
            title: "Full Autonomous Operation Mode",
            description: "Enable complete automated data center operation",
            technicalDetails: "Deploy autonomous systems with 1000+ control points and advanced algorithms",
            impact: "Optimizes all systems in real-time, 90% faster responses",
            cost: 4000,
            operationalCost: 1500,
            duration: "20 min",
            priority: "medium",
            prerequisites: ["Automation platform", "Control integration", "Safety systems"],
            risks: ["System reliability", "Complex interactions", "Human oversight"],
            kpis: ["Response speed", "Optimization quality", "System stability"],
          },
        ],
      },
      {
        id: "innovative",
        name: "Plan 5", // Changed from "Next-Gen Solutions" to "Plan 5"
        description: "Cutting-edge experimental technologies for maximum impact",
        riskLevel: "high",
        successRate: 75,
        estimatedCost: 95000,
        energySavings: 65,
        coolingEfficiency: 85,
        paybackPeriod: 3.5,
        executionTime: 120,
        dependencies: ["Experimental tech", "R&D partnerships", "Specialized expertise"],
        criticalPath: ["Quantum cooling", "Edge computing", "Neural optimization"],
        actions: [
          {
            category: "cooling",
            title: "Quantum Cooling Integration",
            description: "Deploy experimental quantum-enhanced cooling systems",
            technicalDetails: "Implement quantum heat pumps with 400% efficiency gains",
            impact: "Revolutionary cooling efficiency, near-zero energy consumption",
            cost: 45000,
            operationalCost: 8000,
            duration: "60 min",
            priority: "critical",
            prerequisites: ["Quantum equipment", "Specialized technicians", "R&D approval"],
            risks: ["Experimental technology", "High complexity", "Unknown failures"],
            kpis: ["Quantum efficiency", "Energy reduction", "System stability"],
          },
          {
            category: "infrastructure",
            title: "Distributed Edge Computing Network",
            description: "Deploy micro data centers to distribute heat load geographically",
            technicalDetails: "Activate 50x edge nodes with 5G connectivity and AI routing",
            impact: "Distributes 80% of heat load across wide geographic area",
            cost: 25000,
            operationalCost: 6000,
            duration: "45 min",
            priority: "high",
            prerequisites: ["Edge infrastructure", "5G network", "Orchestration platform"],
            risks: ["Network complexity", "Edge reliability", "Data consistency"],
            kpis: ["Heat distribution", "Network performance", "Service quality"],
          },
          {
            category: "automation",
            title: "Advanced Algorithm Optimization",
            description: "Deploy advanced algorithms for predictive optimization",
            technicalDetails: "Implement advanced analytics with 10,000+ parameters for prediction",
            impact: "Predicts and prevents issues 4 hours in advance",
            cost: 15000,
            operationalCost: 3500,
            duration: "30 min",
            priority: "high",
            prerequisites: ["Analytics models", "Training data", "Compute resources"],
            risks: ["Model accuracy", "Training time", "Computational overhead"],
            kpis: ["Prediction accuracy", "Prevention rate", "Optimization quality"],
          },
          {
            category: "energy",
            title: "Fusion Power Integration",
            description: "Connect to experimental fusion power source for unlimited clean energy",
            technicalDetails: "Interface with 50MW compact fusion reactor via smart grid",
            impact: "Unlimited clean energy, zero carbon footprint, 90% cost reduction",
            cost: 10000,
            operationalCost: 1000,
            duration: "25 min",
            priority: "medium",
            prerequisites: ["Fusion reactor online", "Grid integration", "Safety protocols"],
            risks: ["Experimental technology", "Safety concerns", "Regulatory approval"],
            kpis: ["Power stability", "Safety metrics", "Cost reduction"],
          },
        ],
      },
      {
        id: "cost-optimized",
        name: "Plan 6", // Changed from "Cost-Optimized Response" to "Plan 6"
        description: "Maximum efficiency with minimal financial impact",
        riskLevel: "medium",
        successRate: 85,
        estimatedCost: 12000,
        energySavings: 28,
        coolingEfficiency: 35,
        paybackPeriod: 1.8,
        executionTime: 90,
        dependencies: ["Existing systems", "Software optimization", "Process improvements"],
        criticalPath: ["Software optimization", "Process efficiency", "Smart scheduling"],
        actions: [
          {
            category: "automation",
            title: "Software-Based Cooling Optimization",
            description: "Optimize cooling through software algorithms and existing sensors",
            technicalDetails: "Deploy advanced algorithms using existing 150+ sensors",
            impact: "Improves cooling efficiency by 30% with zero hardware cost",
            cost: 2000,
            operationalCost: 500,
            duration: "20 min",
            priority: "high",
            prerequisites: ["Existing sensors", "Software platform", "Historical data"],
            risks: ["Limited by hardware", "Algorithm complexity", "Sensor accuracy"],
            kpis: ["Efficiency improvement", "Cost per degree"],
          },
          {
            category: "load-shifting",
            title: "Intelligent Workload Scheduling",
            description: "Optimize workload timing to minimize heat during peak hours",
            technicalDetails: "Implement smart scheduling with heat-aware algorithms",
            impact: "Reduces peak heat by 25% through optimal timing",
            cost: 1500,
            operationalCost: 300,
            duration: "15 min",
            priority: "high",
            prerequisites: ["Workload analysis", "Scheduling system", "Heat models"],
            risks: ["Scheduling conflicts", "Performance impact", "User acceptance"],
            kpis: ["Heat reduction", "Schedule efficiency", "User satisfaction"],
          },
          {
            category: "energy",
            title: "Demand Response Participation",
            description: "Participate in utility demand response programs for cost savings",
            technicalDetails: "Automated participation in grid demand response events",
            impact: "Generates $15,000 annual revenue while reducing peak load",
            cost: 3000,
            operationalCost: 200,
            duration: "30 min",
            priority: "medium",
            prerequisites: ["Utility agreements", "Load flexibility", "Automation systems"],
            risks: ["Revenue variability", "Service impact", "Grid requirements"],
            kpis: ["Revenue generation", "Load reduction", "Program compliance"],
          },
          {
            category: "monitoring",
            title: "Predictive Maintenance Optimization",
            description: "Use AI to optimize maintenance schedules and prevent failures",
            technicalDetails: "Deploy predictive analytics on existing maintenance data",
            impact: "Reduces maintenance costs by 40%, improves efficiency by 15%",
            cost: 5500,
            operationalCost: 800,
            duration: "45 min",
            priority: "medium",
            prerequisites: ["Maintenance history", "Analytics platform", "Sensor data"],
            risks: ["Prediction accuracy", "Maintenance timing", "Equipment reliability"],
            kpis: ["Maintenance cost", "Equipment uptime", "Prediction accuracy"],
          },
        ],
      },
    ]
  }

  const planOptions = generatePlanOptions()
  const currentPlan = planOptions.find((p) => p.id === selectedPlan)

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "load-shifting":
        return <Server className="w-4 h-4" />
      case "cooling":
        return <Thermometer className="w-4 h-4" />
      case "energy":
        return <Zap className="w-4 h-4" />
      case "infrastructure":
        return <AlertTriangle className="w-4 h-4" />
      case "automation":
        return <Activity className="w-4 h-4" />
      case "monitoring":
        return <Gauge className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "border-red-300 bg-red-50 text-red-800"
      case "high":
        return "border-orange-300 bg-orange-50 text-orange-800"
      case "medium":
        return "border-yellow-300 bg-yellow-50 text-yellow-800"
      case "low":
        return "border-green-300 bg-green-50 text-green-800"
      default:
        return "border-gray-300 bg-gray-50 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Suggested Plans</CardTitle>
        <CardDescription>Advanced response planning with detailed cost analysis and risk assessment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {planOptions.map((plan) => (
            <Card key={plan.id} className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge
                      variant={
                        plan.riskLevel === "critical"
                          ? "destructive"
                          : plan.riskLevel === "high"
                            ? "secondary"
                            : "default"
                      }
                    >
                      {plan.riskLevel} risk
                    </Badge>
                    <div className="text-sm font-medium">Success: {plan.successRate}%</div>
                    <div className="text-sm font-medium">Cost: ${plan.estimatedCost.toLocaleString()}</div>
                    <div className="text-sm font-medium">Duration: {plan.executionTime} min</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plan.actions.map((action) => (
                    <Card key={action.title} className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(action.category)}
                        <div className="flex-1">
                          <div className="font-medium text-sm">{action.title}</div>
                          <div className="flex gap-1 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {action.category.replace("-", " ")}
                            </Badge>
                            <Badge className={`text-xs ${getPriorityColor(action.priority)}`}>{action.priority}</Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{action.description}</p>
                      <div className="text-xs font-medium text-blue-600 mb-2">{action.technicalDetails}</div>
                      <div className="text-xs font-medium text-green-600 mb-2">{action.impact}</div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-semibold">${action.cost.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{action.duration}</div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
