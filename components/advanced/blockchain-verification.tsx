"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, CheckCircle, Hash, Clock, FileText } from "lucide-react"

interface BlockchainRecord {
  id: string
  type: "identity" | "incident" | "evidence" | "insurance"
  hash: string
  timestamp: Date
  verified: boolean
  description: string
}

export function BlockchainVerification() {
  const [records] = useState<BlockchainRecord[]>([
    {
      id: "BLK-001",
      type: "identity",
      hash: "0x1a2b3c4d5e6f7890abcdef1234567890",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      verified: true,
      description: "Digital Tourist ID verification",
    },
    {
      id: "BLK-002",
      type: "incident",
      hash: "0x9876543210fedcba0987654321abcdef",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      verified: true,
      description: "Emergency SOS activation record",
    },
    {
      id: "BLK-003",
      type: "evidence",
      hash: "0xabcdef1234567890fedcba0987654321",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      verified: true,
      description: "Photo evidence uploaded to incident report",
    },
  ])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "identity":
        return <Shield className="h-4 w-4 text-blue-500" />
      case "incident":
        return <FileText className="h-4 w-4 text-red-500" />
      case "evidence":
        return <Hash className="h-4 w-4 text-purple-500" />
      case "insurance":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Hash className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "identity":
        return "bg-blue-500"
      case "incident":
        return "bg-red-500"
      case "evidence":
        return "bg-purple-500"
      case "insurance":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 shadow-2xl rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Blockchain Verification
        </CardTitle>
        <CardDescription>Immutable records and smart contract verification</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Verified Records</p>
              <p className="text-2xl font-bold text-green-600">{records.filter((r) => r.verified).length}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Hash className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Total Blocks</p>
              <p className="text-2xl font-bold text-blue-600">{records.length}</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Shield className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Security Level</p>
              <p className="text-2xl font-bold text-purple-600">256-bit</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-sm">Recent Blockchain Records</h4>
            {records.map((record) => (
              <div key={record.id} className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(record.type)}
                    <span className="text-sm font-medium capitalize">{record.type}</span>
                    <Badge className={`${getTypeColor(record.type)} text-white text-xs`}>{record.id}</Badge>
                  </div>
                  {record.verified && (
                    <Badge className="bg-green-500 text-white text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground mb-2">{record.description}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">{record.hash.slice(0, 16)}...</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{record.timestamp.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1 bg-purple-500 hover:bg-purple-600 text-white">
              <Hash className="h-4 w-4 mr-2" />
              Verify Record
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              View Chain
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
