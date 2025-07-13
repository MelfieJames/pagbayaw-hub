
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChatbotQAManagement } from "./ChatbotQAManagement";

export default function ChatbotConfiguration() {
  return (
    <Card className="max-w-3xl mx-auto mt-8">
        <CardHeader>
        <CardTitle></CardTitle>
        </CardHeader>
        <CardContent>
          <ChatbotQAManagement />
        </CardContent>
      </Card>
  );
}
