"use client"
import { Megaphone } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PersonalizedAdsModalProps {
  isOpen: boolean
  onAccept: () => void
  onClose: () => void
}

export default function PersonalizedAdsModal({ isOpen, onAccept, onClose }: PersonalizedAdsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto p-3 bg-[#1B9D65]/10 rounded-full mb-4">
            <Megaphone className="w-6 h-6 text-[#1B9D65]" />
          </div>
          <DialogTitle className="text-xl text-center">Personalized ads</DialogTitle>
          <DialogDescription className="text-center">
            ZeroPaperUser and Google may use your data to show you ads that are relevant to you on the app, Google and
            websites and apps that partner with Google. To learn more about how ads work visit our{" "}
            <Link href="/privacy" className="text-[#1B9D65] hover:underline">
              View Privacy Policy
            </Link>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <button
            onClick={onAccept}
            className="w-full py-3 bg-[#1B9D65] text-white rounded-lg font-medium hover:bg-[#1B9D65]/90 transition-colors"
          >
            ACCEPT
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

