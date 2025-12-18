"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SearchPage() {
  const [terms, setTerms] = useState("");
  const [locations, setLocations] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const searchMutation = useMutation({
    mutationFn: async () => {
      // Split by comma and clean up
      const termList = terms.split(",").map(t => t.trim()).filter(Boolean);
      const locationList = locations.split(",").map(l => l.trim()).filter(Boolean);

      if (termList.length === 0 || locationList.length === 0) {
        throw new Error("Please enter at least one term and one location.");
      }

      const res = await api.post("/search", {
        terms: termList,
        locations: locationList,
        limit: 50
      });
      return res.data;
    },
    onSuccess: (data) => {
      setResults(data);
      setSelected(new Set()); // Reset selection
      toast.success(`Found ${data.length} contacts`);
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(error.message || "Search failed");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (contacts: any[]) => {
      const res = await api.post("/contacts", contacts);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(`Saved ${data.length} contacts`);
      // Optionally clear results or mark as saved
    },
    onError: () => {
      toast.error("Failed to save contacts");
    },
  });

  const handleToggleSelect = (index: number) => {
    const newSelected = new Set(selected);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelected(newSelected);
  };

  const handleSelectAll = () => {
    if (selected.size === results.length) {
      setSelected(new Set());
    } else {
      const all = new Set(results.map((_, i) => i));
      setSelected(all);
    }
  };

  const handleSave = () => {
    const contactsToSave = results.filter((_, i) => selected.has(i));
    if (contactsToSave.length === 0) return;
    saveMutation.mutate(contactsToSave);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Google Maps</CardTitle>
          <CardDescription>Enter multiple terms and locations separated by commas.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="terms">Search Terms (comma separated)</Label>
            <Input
              id="terms"
              placeholder="e.g. Pizza, Burger, Sushi"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="locations">Locations (comma separated)</Label>
            <Input
              id="locations"
              placeholder="e.g. New York, Brooklyn"
              value={locations}
              onChange={(e) => setLocations(e.target.value)}
            />
          </div>
          <Button
            onClick={() => searchMutation.mutate()}
            disabled={searchMutation.isPending || !terms || !locations}
          >
            {searchMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Search
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Results ({results.length})</CardTitle>
            <Button onClick={handleSave} disabled={selected.size === 0 || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Import ({selected.size})
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={results.length > 0 && selected.size === results.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((contact, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(i)}
                        onCheckedChange={() => handleToggleSelect(i)}
                      />
                    </TableCell>
                    <TableCell>{contact.name}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{contact.category}</TableCell>
                    <TableCell>{contact.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
