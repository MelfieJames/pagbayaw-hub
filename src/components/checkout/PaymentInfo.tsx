
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard, Shield, Info } from "lucide-react";

export default function PaymentInfo() {
  return (
    <Card className="bg-white border rounded-xl shadow-sm">
      <CardHeader className="p-4 border-b bg-gray-50">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          Payment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Cash on Delivery (COD)</h4>
            <p className="text-sm text-blue-700 mt-1">
              Pay in cash when your order is delivered to your address. No advance payment required.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-700">Secure and convenient payment</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-700">No hidden fees or charges</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span className="text-sm text-gray-700">Free shipping on all orders</span>
          </div>
        </div>

        <div className="pt-3 border-t">
          <p className="text-xs text-gray-500">
            By proceeding with your order, you agree to pay the exact amount in cash upon delivery. 
            Please ensure you have the correct amount ready for our delivery personnel.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
