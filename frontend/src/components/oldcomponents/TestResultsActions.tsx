import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface TestResultsActionsProps {
  studentId: string 
  onExport: () => void
  onImport: (file: File) => void
}

export function TestResultsActions({ onExport, onImport }: TestResultsActionsProps) {
  const [importFile, setImportFile] = useState<File | null>(null)

  const handleExport = () => {
    onExport()
    toast({
      title: "Export Successful",
      description: "Test results have been exported successfully.",
    })
  }

  const handleImport = () => {
    if (importFile) {
      onImport(importFile)
      toast({
        title: "Import Successful",
        description: "Test results have been imported successfully.",
      })
    }
  }

  return (
    <div className="flex space-x-2 mb-4">
      <Button onClick={handleExport}>Export Test Results</Button>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Import Test Results</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Test Results</DialogTitle>
            <DialogDescription>
              Upload a CSV file containing test results to import.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="import-file"
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleImport} disabled={!importFile}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

