'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { processReceiptWithFormData, createReceiptFormData } from '@/services/receipt-processing-service'
import { format } from 'date-fns'

const categories = [
  { value: 'products', label: 'Products' },
  { value: 'services', label: 'Services' },
  { value: 'food', label: 'Food & Drinks' },
  { value: 'travel', label: 'Travel' },
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'medical', label: 'Medical' },
  { value: 'education', label: 'Education' },
  { value: 'business', label: 'Business' },
  { value: 'other', label: 'Other' },
]

const currencies = [
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CHF', label: 'Swiss Franc' },
  { value: 'PLN', label: 'Polish Złoty' },
]

export function ReceiptUploadForm() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    productName: '',
    price: '',
    category: 'products',
    storeName: '',
    storeLocation: '',
    currency: 'EUR',
    date: format(new Date(), 'dd.MM.yyyy HH:mm'),
    validUptoDate: '',
    refundableUptoDate: '',
  })

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Clean up the preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Get the file from the input
      const file = fileInputRef.current?.files?.[0]
      if (!file) {
        toast({
          title: 'Error',
          description: 'Please select a receipt image to upload',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      // Validate required fields
      const requiredFields = ['productName', 'price', 'category', 'storeName', 'storeLocation', 'currency', 'date']
      const missingFields = requiredFields.filter(field => !formData[field])
      if (missingFields.length > 0) {
        toast({
          title: 'Error',
          description: `Please fill in all required fields: ${missingFields.join(', ')}`,
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      // Validate price is a number
      if (isNaN(Number(formData.price))) {
        toast({
          title: 'Error',
          description: 'Price must be a valid number',
          variant: 'destructive',
        })
        setIsSubmitting(false)
        return
      }

      // Create form data with receipt details and image
      const receiptFormData = await createReceiptFormData(
        {
          ...formData,
          price: Number(formData.price),
        },
        file
      )

      // Create FormData with receipt details
      const apiFormData = new FormData()
      apiFormData.append('uid', localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).uid : '')
      apiFormData.append('productName', formData.productName)
      apiFormData.append('price', String(formData.price))
      apiFormData.append('category', formData.category)
      apiFormData.append('storeName', formData.storeName)
      apiFormData.append('storeLocation', formData.storeLocation)
      apiFormData.append('currency', formData.currency)
      apiFormData.append('date', formData.date)
      apiFormData.append('validUptoDate', formData.validUptoDate)
      apiFormData.append('refundableUptoDate', formData.refundableUptoDate)
      apiFormData.append('receiptImage', file)

      // Process the receipt with FormData
      const response = await fetch('/api/receipts/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: apiFormData
      })

      // Process the response
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'API request failed')
      }

      const result = await response.json()
      const result = await processReceiptWithFormData(apiFormData)

      // Show success message
      toast({
        title: 'Success',
        description: 'Receipt processed successfully!',
      })

      // Reset form
      setFormData({
        productName: '',
        price: '',
        category: 'products',
        storeName: '',
        storeLocation: '',
        currency: 'EUR',
        date: format(new Date(), 'dd.MM.yyyy HH:mm'),
        validUptoDate: '',
        refundableUptoDate: '',
      })
      setPreviewUrl(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Error processing receipt:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process receipt',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Receipt</CardTitle>
        <CardDescription>
          Upload a receipt image and provide details for processing
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Receipt Image Upload */}
            <div className="md:col-span-2">
              <Label htmlFor="receipt-image">Receipt Image</Label>
              <Input
                id="receipt-image"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="mt-1"
              />
              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    className="max-h-40 rounded-md object-contain"
                  />
                </div>
              )}
            </div>

            {/* Product Name */}
            <div>
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price">Price</Label>
              <div className="flex mt-1">
                <Input
                  id="price"
                  name="price"
                  type="text"
                  inputMode="decimal"
                  value={formData.price}
                  onChange={handleChange}
                  className="rounded-r-none"
                  required
                />
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleSelectChange('currency', value)}
                >
                  <SelectTrigger className="w-24 rounded-l-none">
                    <SelectValue placeholder="Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Store Name */}
            <div>
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                name="storeName"
                value={formData.storeName}
                onChange={handleChange}
                className="mt-1"
                required
              />
            </div>

            {/* Store Location */}
            <div>
              <Label htmlFor="storeLocation">Store Location</Label>
              <Input
                id="storeLocation"
                name="storeLocation"
                value={formData.storeLocation}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">Date (DD.MM.YYYY HH:MM)</Label>
              <Input
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="mt-1"
                required
                placeholder="31.12.2023 14:30"
              />
            </div>

            <Separator className="md:col-span-2 my-2" />

            {/* Optional Dates */}
            <div>
              <Label htmlFor="validUptoDate">Valid Until (DD.MM.YYYY HH:MM)</Label>
              <Input
                id="validUptoDate"
                name="validUptoDate"
                value={formData.validUptoDate}
                onChange={handleChange}
                className="mt-1"
                placeholder="31.12.2023 23:59"
              />
            </div>

            <div>
              <Label htmlFor="refundableUptoDate">Refundable Until (DD.MM.YYYY HH:MM)</Label>
              <Input
                id="refundableUptoDate"
                name="refundableUptoDate"
                value={formData.refundableUptoDate}
                onChange={handleChange}
                className="mt-1"
                placeholder="15.01.2024 23:59"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Processing...' : 'Process Receipt'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}