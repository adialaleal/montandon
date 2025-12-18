"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function CampaignsPage() {
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());

  // Fetch Templates
  const { data: templates } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await api.get("/templates");
      return res.data;
    },
  });

  // Fetch Contacts
  const { data: contacts } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await api.get("/contacts");
      return res.data;
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        template_id: parseInt(templateId),
        contact_ids: Array.from(selectedContacts),
      };
      const res = await api.post("/campaigns", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Campaign started successfully!");
      setName("");
      setTemplateId("");
      setSelectedContacts(new Set());
    },
    onError: () => {
      toast.error("Failed to start campaign");
    },
  });

  const handleToggleSelect = (id: number) => {
    const newSelected = new Set(selectedContacts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedContacts(newSelected);
  };

  const handleSelectAll = () => {
    if (!contacts) return;
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map((c: any) => c.id)));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-100px)]">
      {/* Campaign Configuration */}
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>New Campaign</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. March Promo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <select
              id="template"
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              <option value="" disabled>Select a template</option>
              {templates?.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-2">
              Selected Contacts: <span className="font-bold text-foreground">{selectedContacts.size}</span>
            </p>
            <Button
              className="w-full"
              onClick={() => createCampaignMutation.mutate()}
              disabled={createCampaignMutation.isPending || !name || !templateId || selectedContacts.size === 0}
            >
              {createCampaignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Campaign
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact Selection */}
      <Card className="lg:col-span-2 flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>Select Contacts</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-[50px] pl-6">
                  <Checkbox
                    checked={contacts && contacts.length > 0 && selectedContacts.size === contacts.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts?.map((contact: any) => (
                <TableRow key={contact.id}>
                  <TableCell className="pl-6">
                    <Checkbox
                      checked={selectedContacts.has(contact.id)}
                      onCheckedChange={() => handleToggleSelect(contact.id)}
                    />
                  </TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.category}</TableCell>
                </TableRow>
              ))}
              {(!contacts || contacts.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No contacts found. Go to Search to add some.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
