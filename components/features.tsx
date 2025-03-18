"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Receipt, FileText, CreditCard } from "lucide-react"

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  const features = [
    {
      title: "Manage Business Receipts",
      description: "Easily store your business expenses while travelling for work, securely at one place.",
      icon: <Receipt className="w-6 h-6" />,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/_Group_-at3g7261XrXzea4j4vKvGrllFgzxC6.png",
    },
    {
      title: "Manage Medical Receipts",
      description: "Easily store your medical receipts to get claim tax back easily during revenue returns.",
      icon: <FileText className="w-6 h-6" />,
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OBJECTS-BV9qhTfEq8WUs8NbbuGxYIKQyyYi8U.png",
    },
    {
      title: "Zero Paper Pay Integration",
      description:
        "Get your receipt directly delivered to your app, just ask your retailer if they accept zero paper pay terminals.",
      icon: <CreditCard className="w-6 h-6" />,
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/OBJECTS%281%29-lnfR9NiT361M8LLVY06xLqZrklT6BD.png",
    },
  ]

  return (
    <section ref={ref} id="features" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover how Zero Paper User can help you manage all your receipts efficiently
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src={feature.image || "/placeholder.svg"}
                      alt={feature.title}
                      fill
                      className="object-contain transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

