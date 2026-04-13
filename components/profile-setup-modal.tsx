"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { advisorApi } from "@/lib/advisor-api"

interface ProfileSetupModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onProfileSaved: () => void
  cancellable?: boolean
}

const SECTORS = [
  "Technology", "Healthcare", "Financials", "Real Estate", 
  "Energy", "Consumer Discretionary", "Industrials", "Utilities"
]

export function ProfileSetupModal({ isOpen, onOpenChange, onProfileSaved, cancellable = true }: ProfileSetupModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    riskTolerance: "moderate",
    investmentGoal: "growth",
    investmentHorizon: "medium",
    experienceLevel: "beginner",
    preferredSectors: [] as string[]
  })

  // Load existing profile when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProfile()
    }
  }, [isOpen])

  const loadProfile = async () => {
    try {
      const res = await advisorApi.getInvestorProfile()
      if (res.success && res.data) {
        setFormData({
          riskTolerance: res.data.riskTolerance || "moderate",
          investmentGoal: res.data.investmentGoal || "growth",
          investmentHorizon: res.data.investmentHorizon || "medium",
          experienceLevel: res.data.experienceLevel || "beginner",
          preferredSectors: res.data.preferredSectors || []
        })
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await advisorApi.updateInvestorProfile(formData)
      toast.success("Investor profile saved successfully!")
      onProfileSaved()
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to save profile. Please try again.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSector = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      preferredSectors: prev.preferredSectors.includes(sector)
        ? prev.preferredSectors.filter(s => s !== sector)
        : [...prev.preferredSectors, sector]
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && !cancellable) return; // Prevent closing if not cancellable
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Your Investor Profile</DialogTitle>
          <DialogDescription>
            Help your AI Financial Advisor personalize its recommendations by sharing your investment preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="experience" className="text-right">
              Experience
            </Label>
            <Select 
              value={formData.experienceLevel} 
              onValueChange={(val) => setFormData({...formData, experienceLevel: val})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="risk" className="text-right">
              Risk Tolerance
            </Label>
            <Select 
              value={formData.riskTolerance} 
              onValueChange={(val) => setFormData({...formData, riskTolerance: val})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select risk tolerance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="conservative">Conservative (Low Risk)</SelectItem>
                <SelectItem value="moderate">Moderate (Balanced)</SelectItem>
                <SelectItem value="aggressive">Aggressive (High Risk)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="goal" className="text-right">
              Primary Goal
            </Label>
            <Select 
              value={formData.investmentGoal} 
              onValueChange={(val) => setFormData({...formData, investmentGoal: val})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select investment goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="growth">Capital Growth</SelectItem>
                <SelectItem value="income">Dividend Income</SelectItem>
                <SelectItem value="capital_preservation">Wealth Preservation</SelectItem>
                <SelectItem value="speculation">Speculation / Day Trading</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="horizon" className="text-right">
              Time Horizon
            </Label>
            <Select 
              value={formData.investmentHorizon} 
              onValueChange={(val) => setFormData({...formData, investmentHorizon: val})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short Term (0-3 years)</SelectItem>
                <SelectItem value="medium">Medium Term (3-10 years)</SelectItem>
                <SelectItem value="long">Long Term (10+ years)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-start gap-4 mt-2">
            <Label className="text-right mt-2">
              Preferred Sectors
            </Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              {SECTORS.map(sector => (
                <Button
                  key={sector}
                  type="button"
                  variant={formData.preferredSectors.includes(sector) ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => toggleSector(sector)}
                >
                  {sector}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          {cancellable && (
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Skip for now
            </Button>
          )}
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}