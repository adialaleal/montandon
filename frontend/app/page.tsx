import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome to Montandon</CardTitle>
          <CardDescription>Prospecting and Messaging Automation</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Link href="/search">
            <Button className="w-full">Start Searching</Button>
          </Link>
          <Link href="/templates">
            <Button variant="outline" className="w-full">Manage Templates</Button>
          </Link>
          <Link href="/map-results">
            <Button variant="secondary" className="w-full">View Map Results (Brasília)</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
