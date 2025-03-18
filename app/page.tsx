"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import SplashScreen from "@/components/splash-screen"
import OnboardingScreen from "@/components/onboarding-screen"
import PersonalizedAdsModal from "@/components/personalized-ads-modal"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<"splash" | "onboarding" | "auth">("splash")
  const [currentStep, setCurrentStep] = useState(0)
  const [showAdsModal, setShowAdsModal] = useState(false)
  const router = useRouter()

  const onboardingSteps = [
    {
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_Group_-CYyiDZoNMxktUKOdcSfkvExf7Z6TLO.png",
      title: "Manage Business Receipts",
      description: "Easily Store your business expenses while travelling for work, securely at one place.",
    },
    {
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OBJECTS-hl0ENwJq5JUSKAnsEtbCSBkbKWP5Nh.png",
      title: "Manage Medical Receipts",
      description: "Easily Store your medical receipts to get claim tax back easily during revenue returns.",
    },
    {
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OBJECTS%281%29-YHrw5rEOampVb7q6oFo3oej8hNs73m.png",
      title: "Perfect Match With Zero Paper Pay",
      description:
        "Get your receipt directly delivered to your app, just ask your retailer if they accept zero paper pay terminals.",
    },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentScreen("onboarding")
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowAdsModal(true)
    }
  }

  const handleAdsAccept = () => {
    setShowAdsModal(false)
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence mode="wait">
        {currentScreen === "splash" && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full h-screen"
          >
            <SplashScreen />
          </motion.div>
        )}

        {currentScreen === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full min-h-screen"
          >
            <OnboardingScreen
              image={onboardingSteps[currentStep].image}
              title={onboardingSteps[currentStep].title}
              description={onboardingSteps[currentStep].description}
              currentStep={currentStep}
              totalSteps={onboardingSteps.length}
              onNext={handleNext}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <PersonalizedAdsModal isOpen={showAdsModal} onAccept={handleAdsAccept} onClose={() => setShowAdsModal(false)} />
    </div>
  )
}

