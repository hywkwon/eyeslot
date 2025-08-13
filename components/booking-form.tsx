"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, ExternalLink } from "lucide-react"
import { submitBooking } from "@/lib/actions"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { motion } from "framer-motion"

interface PrescriptionData {
  rightEye: {
    spherical: string
    cylindrical: string
    axis: string
  }
  leftEye: {
    spherical: string
    cylindrical: string
    axis: string
  }
}

interface SavedPrescription {
  id: string
  name: string
  powerType: string
  prescription: PrescriptionData
  createdDate: string
}

interface FormData {
  user_name: string
  email: string
  phone: string
  store_id: string
  visit_date: string
  visit_time: string
  request_note: string
  prescription?: PrescriptionData
}

interface FormErrors {
  user_name?: string
  email?: string
  phone?: string
  visit_date?: string
  visit_time?: string
  store_id?: string
}

interface StoreMapLinks {
  googleMaps: string
  naverMaps: string
}

export default function BookingForm() {
  const { data: session } = useSession()
  
  const [form, setForm] = useState<FormData>({
    user_name: "",
    email: "",
    phone: "",
    store_id: "viewraum", // Set default to viewraum
    visit_date: "",
    visit_time: "",
    request_note: "",
    prescription: {
      rightEye: { spherical: "", cylindrical: "", axis: "" },
      leftEye: { spherical: "", cylindrical: "", axis: "" }
    }
  })

  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  
  // Prescription states
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false)
  const [savedPrescriptions, setSavedPrescriptions] = useState<SavedPrescription[]>([])
  const [showSavedPrescriptions, setShowSavedPrescriptions] = useState(false)

  // Auto-fill user data from session and load saved prescriptions
  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        email: session.user.email || "",
        user_name: session.user.name || "",
      }))
      
      // Load saved prescriptions from localStorage
      loadSavedPrescriptions()
    }
  }, [session])

  // Load saved prescriptions from localStorage
  const loadSavedPrescriptions = () => {
    try {
      const saved = localStorage.getItem('savedPrescriptions')
      if (saved) {
        setSavedPrescriptions(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Failed to load saved prescriptions:', error)
    }
  }

  // Save prescription to localStorage
  const savePrescription = (name: string, powerType: string) => {
    if (!form.prescription) return

    const newPrescription: SavedPrescription = {
      id: Date.now().toString(),
      name,
      powerType,
      prescription: form.prescription,
      createdDate: new Date().toISOString().split('T')[0]
    }

    const updatedPrescriptions = [...savedPrescriptions, newPrescription]
    setSavedPrescriptions(updatedPrescriptions)
    localStorage.setItem('savedPrescriptions', JSON.stringify(updatedPrescriptions))
  }

  // Load saved prescription
  const loadPrescription = (prescription: SavedPrescription) => {
    setForm(prev => ({
      ...prev,
      prescription: prescription.prescription
    }))
    setShowSavedPrescriptions(false)
  }

  // Delete saved prescription
  const deletePrescription = (id: string) => {
    const updatedPrescriptions = savedPrescriptions.filter(p => p.id !== id)
    setSavedPrescriptions(updatedPrescriptions)
    localStorage.setItem('savedPrescriptions', JSON.stringify(updatedPrescriptions))
  }

  // Store map links configuration
  const storeMapLinks: Record<string, StoreMapLinks> = {
    viewraum: {
      googleMaps: "https://maps.app.goo.gl/3Z2pxvik9kzrEQtC7",
      naverMaps: "https://naver.me/FzSZ0p4u",
    },
    lacitpo: {
      googleMaps: "https://maps.app.goo.gl/u8MU7vdEnjc7A2Wt8",
      naverMaps: "https://naver.me/53lKMqVj",
    },
    eyecatcher: {
      googleMaps: "https://maps.app.goo.gl/ZVQfqPoh3K1Ekj8p7",
      naverMaps: "https://naver.me/5jJHt6Gm",
    },
    oror: {
      googleMaps: "https://maps.app.goo.gl/Jqrxswfe3JfUwrop9",
      naverMaps: "https://naver.me/FvEPfG8g",
    },
  }

  // Get today's date in YYYY-MM-DD format for min date
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // 기존 import 문 아래에 새로운 함수 추가
  // handleChange 함수 위에 다음 함수를 추가합니다:

  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, "")

    // Country-specific formatting
    if (numbers.startsWith('1')) {
      // USA/Canada: 1-XXX-XXX-XXXX
      if (numbers.length <= 1) return numbers
      if (numbers.length <= 4) return `${numbers.slice(0, 1)}-${numbers.slice(1)}`
      if (numbers.length <= 7) return `${numbers.slice(0, 1)}-${numbers.slice(1, 4)}-${numbers.slice(4)}`
      return `${numbers.slice(0, 1)}-${numbers.slice(1, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 11)}`
    }
    
    if (numbers.startsWith('81')) {
      // Japan: 81-XX-XXXX-XXXX or 81-XXX-XXXX-XXXX
      if (numbers.length <= 2) return numbers
      if (numbers.length <= 4) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`
      if (numbers.length <= 8) return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(4)}`
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 12)}`
    }
    
    if (numbers.startsWith('82')) {
      // Korea: 82-XX-XXXX-XXXX
      if (numbers.length <= 2) return numbers
      if (numbers.length <= 4) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`
      if (numbers.length <= 8) return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(4)}`
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 4)}-${numbers.slice(4, 8)}-${numbers.slice(8, 12)}`
    }
    
    if (numbers.startsWith('86')) {
      // China: 86-XXX-XXXX-XXXX
      if (numbers.length <= 2) return numbers
      if (numbers.length <= 5) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`
      if (numbers.length <= 9) return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5, 9)}-${numbers.slice(9, 13)}`
    }
    
    // 2-digit country codes (most European countries)
    if (numbers.length >= 2 && ['20','27','30','31','32','33','34','36','39','40','41','43','44','45','46','47','48','49','51','52','53','54','55','56','57','58','60','61','62','63','64','65','66','84','90','91','92','93','94','95','98'].includes(numbers.slice(0, 2))) {
      if (numbers.length <= 2) return numbers
      if (numbers.length <= 5) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`
      if (numbers.length <= 8) return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`
      return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5, 8)}-${numbers.slice(8, 12)}`
    }
    
    // 3-digit country codes
    if (numbers.length >= 3 && numbers.slice(0, 3).match(/^(212|213|216|218|220|221|222|223|224|225|226|227|228|229|230|231|232|233|234|235|236|237|238|239|240|241|242|243|244|245|246|248|249|250|251|252|253|254|255|256|257|258|260|261|262|263|264|265|266|267|268|269|290|291|297|298|299|350|351|352|353|354|355|356|357|358|359|370|371|372|373|374|375|376|377|378|380|381|382|383|385|386|387|389|420|421|423|500|501|502|503|504|505|506|507|508|509|590|591|592|593|594|595|596|597|598|599|670|672|673|674|675|676|677|678|679|680|681|682|683|684|685|686|687|688|689|690|691|692|850|852|853|855|856|880|886|960|961|962|963|964|965|966|967|968|970|971|972|973|974|975|976|977|992|993|994|995|996|998)$/)) {
      if (numbers.length <= 3) return numbers
      if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
      if (numbers.length <= 9) return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 9)}-${numbers.slice(9, 13)}`
    }
    
    // Single digit country code (Russia: 7)
    if (numbers.startsWith('7')) {
      if (numbers.length <= 1) return numbers
      if (numbers.length <= 4) return `${numbers.slice(0, 1)}-${numbers.slice(1)}`
      if (numbers.length <= 7) return `${numbers.slice(0, 1)}-${numbers.slice(1, 4)}-${numbers.slice(4)}`
      return `${numbers.slice(0, 1)}-${numbers.slice(1, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7, 11)}`
    }
    
    // Default formatting for unknown patterns
    if (numbers.length <= 3) {
      return numbers
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}-${numbers.slice(10, 14)}`
    }
  }

  // 전화번호 입력을 위한 특별한 핸들러 추가
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value)
    setForm({ ...form, phone: formattedPhone })

    // 에러 상태 업데이트
    setErrors({ ...errors, phone: undefined })

    // 제출 에러 지우기
    if (submitError) {
      setSubmitError("")
    }
  }

  // 기존 handleChange 함수는 그대로 유지
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: undefined })

    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError("")
    }
  }

  // Handle prescription input changes
  const handlePrescriptionChange = (eye: 'rightEye' | 'leftEye', field: 'spherical' | 'cylindrical' | 'axis', value: string) => {
    setForm(prev => ({
      ...prev,
      prescription: {
        ...prev.prescription!,
        [eye]: {
          ...prev.prescription![eye],
          [field]: value
        }
      }
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!form.user_name.trim()) newErrors.user_name = "Name is required"
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Valid email is required"
    }
    
    // Enhanced phone validation with international code requirement for all countries
    if (!form.phone.trim()) {
      newErrors.phone = "Phone is required"
    } else {
      const phoneNumbers = form.phone.replace(/\D/g, "")
      
      // Common country codes (1-4 digits)
      const validCountryCodes = [
        '1',    // USA, Canada
        '7',    // Russia, Kazakhstan
        '20',   // Egypt
        '27',   // South Africa
        '30',   // Greece
        '31',   // Netherlands
        '32',   // Belgium
        '33',   // France
        '34',   // Spain
        '36',   // Hungary
        '39',   // Italy
        '40',   // Romania
        '41',   // Switzerland
        '43',   // Austria
        '44',   // UK
        '45',   // Denmark
        '46',   // Sweden
        '47',   // Norway
        '48',   // Poland
        '49',   // Germany
        '51',   // Peru
        '52',   // Mexico
        '53',   // Cuba
        '54',   // Argentina
        '55',   // Brazil
        '56',   // Chile
        '57',   // Colombia
        '58',   // Venezuela
        '60',   // Malaysia
        '61',   // Australia
        '62',   // Indonesia
        '63',   // Philippines
        '64',   // New Zealand
        '65',   // Singapore
        '66',   // Thailand
        '81',   // Japan
        '82',   // South Korea
        '84',   // Vietnam
        '86',   // China
        '90',   // Turkey
        '91',   // India
        '92',   // Pakistan
        '93',   // Afghanistan
        '94',   // Sri Lanka
        '95',   // Myanmar
        '98',   // Iran
        '212',  // Morocco
        '213',  // Algeria
        '216',  // Tunisia
        '218',  // Libya
        '220',  // Gambia
        '221',  // Senegal
        '222',  // Mauritania
        '223',  // Mali
        '224',  // Guinea
        '225',  // Ivory Coast
        '226',  // Burkina Faso
        '227',  // Niger
        '228',  // Togo
        '229',  // Benin
        '230',  // Mauritius
        '231',  // Liberia
        '232',  // Sierra Leone
        '233',  // Ghana
        '234',  // Nigeria
        '235',  // Chad
        '236',  // Central African Republic
        '237',  // Cameroon
        '238',  // Cape Verde
        '239',  // São Tomé and Príncipe
        '240',  // Equatorial Guinea
        '241',  // Gabon
        '242',  // Republic of the Congo
        '243',  // Democratic Republic of the Congo
        '244',  // Angola
        '245',  // Guinea-Bissau
        '246',  // British Indian Ocean Territory
        '248',  // Seychelles
        '249',  // Sudan
        '250',  // Rwanda
        '251',  // Ethiopia
        '252',  // Somalia
        '253',  // Djibouti
        '254',  // Kenya
        '255',  // Tanzania
        '256',  // Uganda
        '257',  // Burundi
        '258',  // Mozambique
        '260',  // Zambia
        '261',  // Madagascar
        '262',  // Réunion, Mayotte
        '263',  // Zimbabwe
        '264',  // Namibia
        '265',  // Malawi
        '266',  // Lesotho
        '267',  // Botswana
        '268',  // Swaziland
        '269',  // Comoros
        '290',  // Saint Helena
        '291',  // Eritrea
        '297',  // Aruba
        '298',  // Faroe Islands
        '299',  // Greenland
        '350',  // Gibraltar
        '351',  // Portugal
        '352',  // Luxembourg
        '353',  // Ireland
        '354',  // Iceland
        '355',  // Albania
        '356',  // Malta
        '357',  // Cyprus
        '358',  // Finland
        '359',  // Bulgaria
        '370',  // Lithuania
        '371',  // Latvia
        '372',  // Estonia
        '373',  // Moldova
        '374',  // Armenia
        '375',  // Belarus
        '376',  // Andorra
        '377',  // Monaco
        '378',  // San Marino
        '380',  // Ukraine
        '381',  // Serbia
        '382',  // Montenegro
        '383',  // Kosovo
        '385',  // Croatia
        '386',  // Slovenia
        '387',  // Bosnia and Herzegovina
        '389',  // North Macedonia
        '420',  // Czech Republic
        '421',  // Slovakia
        '423',  // Liechtenstein
        '500',  // Falkland Islands
        '501',  // Belize
        '502',  // Guatemala
        '503',  // El Salvador
        '504',  // Honduras
        '505',  // Nicaragua
        '506',  // Costa Rica
        '507',  // Panama
        '508',  // Saint Pierre and Miquelon
        '509',  // Haiti
        '590',  // Guadeloupe
        '591',  // Bolivia
        '592',  // Guyana
        '593',  // Ecuador
        '594',  // French Guiana
        '595',  // Paraguay
        '596',  // Martinique
        '597',  // Suriname
        '598',  // Uruguay
        '599',  // Netherlands Antilles
        '670',  // East Timor
        '672',  // Australian External Territories
        '673',  // Brunei
        '674',  // Nauru
        '675',  // Papua New Guinea
        '676',  // Tonga
        '677',  // Solomon Islands
        '678',  // Vanuatu
        '679',  // Fiji
        '680',  // Palau
        '681',  // Wallis and Futuna
        '682',  // Cook Islands
        '683',  // Niue
        '684',  // American Samoa
        '685',  // Samoa
        '686',  // Kiribati
        '687',  // New Caledonia
        '688',  // Tuvalu
        '689',  // French Polynesia
        '690',  // Tokelau
        '691',  // Micronesia
        '692',  // Marshall Islands
        '850',  // North Korea
        '852',  // Hong Kong
        '853',  // Macau
        '855',  // Cambodia
        '856',  // Laos
        '880',  // Bangladesh
        '886',  // Taiwan
        '960',  // Maldives
        '961',  // Lebanon
        '962',  // Jordan
        '963',  // Syria
        '964',  // Iraq
        '965',  // Kuwait
        '966',  // Saudi Arabia
        '967',  // Yemen
        '968',  // Oman
        '970',  // Palestine
        '971',  // United Arab Emirates
        '972',  // Israel
        '973',  // Bahrain
        '974',  // Qatar
        '975',  // Bhutan
        '976',  // Mongolia
        '977',  // Nepal
        '992',  // Tajikistan
        '993',  // Turkmenistan
        '994',  // Azerbaijan
        '995',  // Georgia
        '996',  // Kyrgyzstan
        '998'   // Uzbekistan
      ]
      
      if (phoneNumbers.length < 8) {
        newErrors.phone = "Phone number is too short"
      } else {
        // Check if phone starts with a valid country code
        const hasValidCountryCode = validCountryCodes.some(code => phoneNumbers.startsWith(code))
        
        if (!hasValidCountryCode) {
          newErrors.phone = "Please include a valid country code (e.g., 82 for Korea, 81 for Japan, 1 for USA)"
        } else {
          // Additional length validation based on country code
          const minTotalLength = phoneNumbers.startsWith('1') ? 11 : // USA/Canada: 1 + 10 digits
                                phoneNumbers.startsWith('81') ? 12 : // Japan: 81 + 10-11 digits  
                                phoneNumbers.startsWith('82') ? 12 : // Korea: 82 + 10-11 digits
                                phoneNumbers.startsWith('86') ? 12 : // China: 86 + 11 digits
                                10 // Other countries: minimum 10 total digits
          
          if (phoneNumbers.length < minTotalLength) {
            newErrors.phone = "Phone number is too short for the selected country code"
          }
        }
      }
    }
    
    if (!form.visit_date) newErrors.visit_date = "Date is required"
    if (!form.visit_time) newErrors.visit_time = "Time is required"
    if (!form.store_id) newErrors.store_id = "Store selection is required"

    // Validate future date
    if (form.visit_date) {
      const selectedDate = new Date(form.visit_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.visit_date = "Please select today or a future date"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setSubmitError("")

    try {
      const result = await submitBooking(form)

      if (result.success) {
        setSubmitted(true)
      } else {
        setSubmitError(result.message || "Submission failed. Please try again.")
      }
    } catch (err) {
      console.error("Form submission error:", err)

      // Handle different types of errors
      if (err instanceof Error) {
        if (err.message.includes("fetch") || err.message.includes("network")) {
          setSubmitError("Network error. Please check your connection and try again.")
        } else {
          setSubmitError(`Error: ${err.message}`)
        }
      } else {
        setSubmitError("Network error. Please try again later.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewReservation = () => {
    setSubmitted(false)
    setForm({
      user_name: session?.user?.name || "",
      email: session?.user?.email || "",
      phone: "",
      store_id: "viewraum", // Reset to default
      visit_date: "",
      visit_time: "",
      request_note: "",
      prescription: {
        rightEye: { spherical: "", cylindrical: "", axis: "" },
        leftEye: { spherical: "", cylindrical: "", axis: "" }
      }
    })
    setErrors({})
    setSubmitError("")
    setShowPrescriptionForm(false)
    setShowSavedPrescriptions(false)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50">
        <AuroraBackground className="bg-white">
          <motion.div
            initial={{ opacity: 0.0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="relative flex flex-col items-center justify-center px-4"
          >
            <Card className="max-w-xl mx-auto backdrop-blur-sm bg-white/95 shadow-2xl border border-white/20">
              <CardContent className="py-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
                </motion.div>
                <CardTitle className="text-2xl mb-4 font-bold">Reservation Complete!</CardTitle>
                <CardDescription className="mb-6 text-base">
                  Thank you! Your booking has been submitted successfully.
                </CardDescription>
                
                {/* Next Steps Guide */}
                <div className="bg-gradient-to-br from-gray-50/90 to-white/90 rounded-xl p-6 text-left backdrop-blur-sm border border-white/30">
                  <h4 className="font-bold text-gray-900 mb-4 text-center text-lg">What's Next?</h4>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-500 font-bold text-lg">•</span>
                      <span><strong>Head to the store</strong> at your reserved time</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-500 font-bold text-lg">•</span>
                      <span><strong>Show your reservation details</strong> when you arrive</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-500 font-bold text-lg">•</span>
                      <span><strong>Get your free eye exam</strong> and prescription check</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-500 font-bold text-lg">•</span>
                      <span><strong>Need frames?</strong> Our team will help you find the perfect pair</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-500 font-bold text-lg">•</span>
                      <span><strong>Share your experience</strong> with a review after your visit</span>
                    </div>
                  </div>
                  <p className="text-center text-gray-600 text-base mt-6 font-medium">See you soon!</p>
                </div>
              </CardContent>
              <CardFooter className="justify-center pb-8">
                <Button 
                  onClick={handleNewReservation} 
                  className="bg-black hover:bg-gray-800 text-white px-8 py-3 text-base font-semibold transition-all duration-300 hover:scale-105"
                >
                  Make Another Reservation
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </AuroraBackground>
      </div>
    )
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Make a Reservation</CardTitle>
        <CardDescription>Please fill out the form below to book your visit.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="user_name">Name *</Label>
          <Input
            id="user_name"
            name="user_name"
            value={form.user_name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
          {errors.user_name && <p className="text-sm text-red-500">{errors.user_name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="example@email.com"
            type="email"
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handlePhoneChange}
            placeholder="82-10-1234-5678"
            inputMode="numeric"
            maxLength={18}
          />
          <p className="text-xs text-gray-500">Must include country code</p>
          {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="visit_date">Visit Date *</Label>
          <Input
            id="visit_date"
            name="visit_date"
            type="date"
            value={form.visit_date}
            onChange={handleChange}
            min={getTodayDate()}
          />
          {errors.visit_date && <p className="text-sm text-red-500">{errors.visit_date}</p>}
          <p className="text-xs text-gray-500">Please select today or a future date</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visit_time">Visit Time *</Label>
          <select
            id="visit_time"
            name="visit_time"
            value={form.visit_time}
            onChange={handleChange}
            className="w-full border rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
              backgroundPosition: "right 0.5rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.25em 1.25em",
              paddingRight: "2rem"
            }}
          >
            <option value="">Select a time</option>
            {[...Array(10)].map((_, i) => {
              const hour = 11 + i
              return (
                <option key={hour} value={`${hour}:00`}>
                  {hour === 12 ? "12:00 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
                </option>
              )
            })}
          </select>
          {errors.visit_time && <p className="text-sm text-red-500">{errors.visit_time}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="store_id">Store *</Label>
          <select
            id="store_id"
            name="store_id"
            value={form.store_id}
            onChange={handleChange}
            className="w-full border rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
              backgroundPosition: "right 0.5rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.25em 1.25em",
              paddingRight: "2rem"
            }}
          >
            <option value="">Select a store</option>
            <option value="viewraum">viewraum (seoul)</option>
            <option value="lacitpo">lacitpo (seoul)</option>
            <option value="eyecatcher">eyecatcher (seoul)</option>
            <option value="oror">oror (seoul)</option>
          </select>
          {errors.store_id && <p className="text-sm text-red-500">{errors.store_id}</p>}

          {/* Map Links Section */}
          {form.store_id && storeMapLinks[form.store_id] && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md border">
              <div className="flex gap-2">
                <a
                  href={storeMapLinks[form.store_id].googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Google Maps
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={storeMapLinks[form.store_id].naverMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-600 bg-white border border-green-200 rounded-md hover:bg-green-50 transition-colors"
                >
                  Naver Maps
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Prescription Section */}
        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">Lens Prescription (Optional)</Label>
            <div className="flex gap-2">
              {savedPrescriptions.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSavedPrescriptions(!showSavedPrescriptions)}
                  className="text-xs"
                >
                  My Saved Prescriptions
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPrescriptionForm(!showPrescriptionForm)}
                className="text-xs"
              >
                {showPrescriptionForm ? 'Hide' : 'Add Prescription'}
              </Button>
            </div>
          </div>

          {/* Saved Prescriptions */}
          {showSavedPrescriptions && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-sm">My Saved Prescriptions</h4>
              {savedPrescriptions.length === 0 ? (
                <p className="text-sm text-gray-500">No saved prescriptions yet</p>
              ) : (
                <div className="space-y-2">
                  {savedPrescriptions.map((prescription) => (
                    <div key={prescription.id} className="bg-white rounded-md p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium text-sm">{prescription.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({prescription.powerType})</span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => loadPrescription(prescription)}
                            className="text-xs px-2 py-1"
                          >
                            Use
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => deletePrescription(prescription.id)}
                            className="text-xs px-2 py-1 text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        Created: {prescription.createdDate}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Prescription Form */}
          {showPrescriptionForm && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Enter Your Prescription</h4>
              </div>
              
              {/* Prescription Table */}
              <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-600 text-white">
                    <tr>
                      <th className="py-3 px-4 text-left font-medium">EYE</th>
                      <th className="py-3 px-4 text-center font-medium">RIGHT</th>
                      <th className="py-3 px-4 text-center font-medium">LEFT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 bg-gray-600 text-white font-medium">Spherical</td>
                      <td className="py-2 px-4">
                        <Input
                          type="text"
                          placeholder="-2.50"
                          value={form.prescription?.rightEye.spherical || ''}
                          onChange={(e) => handlePrescriptionChange('rightEye', 'spherical', e.target.value)}
                          className="text-center text-sm border-gray-300"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <Input
                          type="text"
                          placeholder="-2.00"
                          value={form.prescription?.leftEye.spherical || ''}
                          onChange={(e) => handlePrescriptionChange('leftEye', 'spherical', e.target.value)}
                          className="text-center text-sm border-gray-300"
                        />
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 bg-gray-600 text-white font-medium">Cylindrical</td>
                      <td className="py-2 px-4">
                        <Input
                          type="text"
                          placeholder="-2.00"
                          value={form.prescription?.rightEye.cylindrical || ''}
                          onChange={(e) => handlePrescriptionChange('rightEye', 'cylindrical', e.target.value)}
                          className="text-center text-sm border-gray-300"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <Input
                          type="text"
                          placeholder="-2.75"
                          value={form.prescription?.leftEye.cylindrical || ''}
                          onChange={(e) => handlePrescriptionChange('leftEye', 'cylindrical', e.target.value)}
                          className="text-center text-sm border-gray-300"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 bg-gray-600 text-white font-medium">Axis</td>
                      <td className="py-2 px-4">
                        <Input
                          type="text"
                          placeholder="175"
                          value={form.prescription?.rightEye.axis || ''}
                          onChange={(e) => handlePrescriptionChange('rightEye', 'axis', e.target.value)}
                          className="text-center text-sm border-gray-300"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <Input
                          type="text"
                          placeholder="10"
                          value={form.prescription?.leftEye.axis || ''}
                          onChange={(e) => handlePrescriptionChange('leftEye', 'axis', e.target.value)}
                          className="text-center text-sm border-gray-300"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Save Prescription */}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Prescription name"
                  className="flex-1 text-sm"
                  id="prescriptionName"
                />
                <select
                  className="border rounded-md pl-3 pr-10 py-2 text-sm appearance-none bg-white"
                  id="powerType"
                  defaultValue="SINGLE_VISION"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e\")",
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.25em 1.25em",
                    paddingRight: "2rem"
                  }}
                >
                  <option value="SINGLE_VISION">Single Vision</option>
                  <option value="PROGRESSIVE">Progressive</option>
                  <option value="BIFOCAL">Bifocal</option>
                </select>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const nameInput = document.getElementById('prescriptionName') as HTMLInputElement
                    const powerTypeSelect = document.getElementById('powerType') as HTMLSelectElement
                    if (nameInput.value.trim()) {
                      savePrescription(nameInput.value.trim(), powerTypeSelect.value)
                      nameInput.value = ''
                      alert('Prescription saved!')
                    }
                  }}
                  className="text-xs px-3"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="request_note">Special Requests</Label>
          <Textarea
            id="request_note"
            name="request_note"
            value={form.request_note}
            onChange={handleChange}
            placeholder="Any special requirements or preferences for your visit"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Reservation"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
