import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Calendar, Clock, CreditCard, Mail, Phone } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const BookingConfirmation = () => {
  const { id } = useParams();

  // Mock booking data
  const bookingDetails = {
    bookingId: "BK-2024-001",
    mentorName: "Sarah Johnson",
    date: "March 25, 2024",
    time: "2:00 PM",
    duration: "60 minutes",
    topic: "React best practices",
    amount: "₹90",
    paymentMode: "Bank Transfer"
  };

  const bankDetails = {
    accountName: "Preplaced Technologies Pvt Ltd",
    accountNumber: "1234567890123456",
    ifscCode: "HDFC0001234",
    bankName: "HDFC Bank",
    branch: "Koramangala Branch"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your mentorship session has been successfully booked.</p>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>Reference ID: {bookingDetails.bookingId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Date</div>
                  <div className="font-medium">{bookingDetails.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Time</div>
                  <div className="font-medium">{bookingDetails.time}</div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Mentor:</span>
                <span className="font-medium">{bookingDetails.mentorName}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{bookingDetails.duration}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Topic:</span>
                <span className="font-medium">{bookingDetails.topic}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount:</span>
                <span className="text-xl font-bold text-primary">{bookingDetails.amount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Instructions
            </CardTitle>
            <CardDescription>Complete your payment using bank transfer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <Badge variant="secondary" className="mb-3">Bank Transfer Details</Badge>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span className="font-medium">{bankDetails.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Number:</span>
                  <span className="font-medium font-mono">{bankDetails.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IFSC Code:</span>
                  <span className="font-medium font-mono">{bankDetails.ifscCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="font-medium">{bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Branch:</span>
                  <span className="font-medium">{bankDetails.branch}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">Important Payment Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Transfer exactly <strong>{bookingDetails.amount}</strong> to the above account</li>
                <li>• Use reference: <strong>{bookingDetails.bookingId}</strong></li>
                <li>• Share payment screenshot via email or WhatsApp</li>
                <li>• Session will be confirmed once payment is verified</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">1</div>
                <div>
                  <div className="font-medium">Complete Payment</div>
                  <div className="text-sm text-muted-foreground">Transfer the amount using the bank details provided above</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">2</div>
                <div>
                  <div className="font-medium">Share Payment Proof</div>
                  <div className="text-sm text-muted-foreground">Email the transaction screenshot to confirm payment</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">3</div>
                <div>
                  <div className="font-medium">Get Session Link</div>
                  <div className="text-sm text-muted-foreground">Receive meeting link 30 minutes before the session</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">support@preplaced.in</div>
                  <div className="text-sm text-muted-foreground">For booking & payment queries</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">+91 98765 43210</div>
                  <div className="text-sm text-muted-foreground">WhatsApp support (9 AM - 7 PM)</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link to="/candidate/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">Go to Dashboard</Button>
          </Link>
          <Link to="/mentors" className="flex-1">
            <Button className="w-full">Book Another Session</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmation;