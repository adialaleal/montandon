"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const res = await api.get("/contacts");
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted");
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "SENT": return <CheckCircle className="text-green-500 w-4 h-4" />;
      case "ERROR": return <XCircle className="text-red-500 w-4 h-4" />;
      default: return <Clock className="text-gray-400 w-4 h-4" />;
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Contacts ({contacts?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts?.map((contact: any) => (
                <TableRow key={contact.id}>
                  <TableCell>{getStatusIcon(contact.status)}</TableCell>
                  <TableCell>{contact.name}</TableCell>
                  <TableCell>{contact.phone}</TableCell>
                  <TableCell>{contact.category}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{contact.address}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(contact.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
