"use client";

import { useState, useMemo, useEffect, Fragment } from "react";
import dynamic from "next/dynamic";
import crawlerData from "../../crawler.json";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Phone, MessageCircle, Save, ChevronDown, ChevronUp, MapPin, CheckCircle, XCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Dynamically import Map
const ClientMap = dynamic(() => import("@/components/ClientMap"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-muted animate-pulse flex items-center justify-center">Loading Map...</div>,
});

const sanitizeForWhatsapp = (phone: string) => phone.replace(/\D/g, "");
const sanitizeForTel = (phone: string) => phone.replace(/[^\d+]/g, "");

// Individual Row Component for easier state management per row
function ContactRow({
  item,
  index,
  isSelected,
  isContacted,
  onToggleSelect,
  onToggleContacted
}: {
  item: any,
  index: number,
  isSelected: boolean,
  isContacted: boolean,
  onToggleSelect: () => void,
  onToggleContacted: () => void
}) {
  const [expanded, setExpanded] = useState(false);

  const waPhone = sanitizeForWhatsapp(item.phone || item.phoneUnformatted || "");
  const telPhone = sanitizeForTel(item.phone || item.phoneUnformatted || "");

  const googleMapsUrl = item.location?.lat && item.location?.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${item.location.lat},${item.location.lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.address || "")}`;

  return (
    <Fragment>
      <TableRow className={cn(isContacted ? "bg-muted/50 text-muted-foreground" : "")}>
        <TableCell>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
          />
        </TableCell>
        <TableCell className="w-[300px]">
          <div className="font-medium leading-tight whitespace-normal">{item.title}</div>
        </TableCell>
        <TableCell className="max-w-[150px] whitespace-nowrap truncate" title={item.categoryName}>
          {item.categoryName}
        </TableCell>
        <TableCell className="whitespace-nowrap truncate">
          {item.phone}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? "Hide Details" : "Show Details"}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleContacted}
              className={isContacted ? "text-green-500" : "text-muted-foreground hover:text-green-500"}
              title={isContacted ? "Mark as Not Contacted" : "Mark as Contacted"}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>

            <Button size="icon" variant="outline" asChild title="Route on Google Maps">
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                <MapPin className="h-4 w-4" />
              </a>
            </Button>

            {telPhone && (
              <Button size="icon" variant="outline" asChild title="Call">
                <a href={`tel:${telPhone}`}>
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            )}
            {waPhone && (
              <Button size="icon" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" asChild title="WhatsApp">
                <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow className="bg-muted/30">
          <TableCell colSpan={5}>
            <div className="p-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold block text-muted-foreground">Address:</span>
                <div>{item.address}</div>
                {item.neighborhood && <div>{item.neighborhood}, {item.city} - {item.state}</div>}
                {item.postalCode && <div>CEP: {item.postalCode}</div>}
              </div>
              <div>
                <span className="font-semibold block text-muted-foreground">Additional Info:</span>
                {item.website && (
                  <div className="mb-1">
                    Website: <a href={item.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">{item.website}</a>
                  </div>
                )}
                <div>Coordinates: {item.location?.lat}, {item.location?.lng}</div>
                <div>Raw Phone: {item.phoneUnformatted}</div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}

export default function CrawlerResultsPage() {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [contacted, setContacted] = useState<Set<number>>(new Set());

  // Load from Local Storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("crawler_contacted_indices");
      if (saved) {
        setContacted(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
  }, []);

  const data = useMemo(() => crawlerData.slice(0, 500), []);

  const saveMutation = useMutation({
    mutationFn: async (contacts: any[]) => {
      const res = await api.post("/contacts", contacts);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Saved ${data.length} contacts for Campaign`);
      setSelected(new Set());
    },
    onError: () => {
      toast.error("Failed to save contacts");
    },
  });

  const handleToggleSelect = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) newSelected.delete(index);
    else newSelected.add(index);
    setSelected(newSelected);
  };

  const handleToggleContacted = (index: number) => {
    const newContacted = new Set(contacted);
    if (newContacted.has(index)) newContacted.delete(index);
    else newContacted.add(index);

    setContacted(newContacted);
    localStorage.setItem("crawler_contacted_indices", JSON.stringify(Array.from(newContacted)));
  };

  const handleSelectAll = () => {
    if (selected.size === data.length) {
      setSelected(new Set());
    } else {
      const all = new Set(data.map((_, i) => i));
      setSelected(all);
    }
  };

  const handleBulkAction = () => {
    const contactsToSave = data
      .filter((_, i) => selected.has(i))
      .map(item => ({
        name: item.title,
        phone: sanitizeForWhatsapp(item.phone || item.phoneUnformatted || ""),
        address: item.address,
        category: item.categoryName,
        google_maps_link: item.website || (item.location ? `https://maps.google.com/?q=${item.location.lat},${item.location.lng}` : "")
      }))
      .filter(c => c.phone);

    if (contactsToSave.length === 0) return;
    saveMutation.mutate(contactsToSave);
  };

  return (
    <div className="space-y-6 container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Map Visualization (Brasília)</CardTitle>
          <CardDescription>Showing top {data.length} entries from crawler data.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientMap data={data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Contact List</CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleBulkAction} disabled={selected.size === 0 || saveMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : `Import Selected (${selected.size})`}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={data.length > 0 && selected.size === data.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-[300px]">Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, i) => (
                  <ContactRow
                    key={i}
                    index={i}
                    item={item}
                    isSelected={selected.has(i)}
                    isContacted={contacted.has(i)}
                    onToggleSelect={() => handleToggleSelect(i)}
                    onToggleContacted={() => handleToggleContacted(i)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
