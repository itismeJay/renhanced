"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  ChevronUp,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
  GripVertical,
  Check,
  X,
  Sparkles,
  Loader2,
} from "lucide-react";

interface ExperienceEntry {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

interface ExperienceSectionProps {
  experienceInfo: ExperienceEntry[];
  onChange: (updated: ExperienceEntry[]) => void;
  jobDescription?: string;
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  sectionName?: string;
  onSectionNameChange?: (name: string) => void;
}

export function ExperienceInfoSection({
  experienceInfo,
  onChange,
  jobDescription = "",
  visible: externalVisible,
  onVisibilityChange,
  sectionName: externalSectionName,
  onSectionNameChange,
}: ExperienceSectionProps) {
  const ensureIds = (items: ExperienceEntry[]) =>
    items.map((e) => ({ ...e, id: e.id || crypto.randomUUID() }));

  const [entries, setEntries] = useState<ExperienceEntry[]>(() =>
    ensureIds(experienceInfo),
  );
  const [collapsed, setCollapsed] = useState(false);
  const [visible, setVisible] = useState<boolean>(externalVisible ?? true);
  const [isRenamingSection, setIsRenamingSection] = useState(false);

  const sectionName = externalSectionName || "Experience";

  const [tempSectionName, setTempSectionName] = useState(sectionName);
  const [loadingBullet, setLoadingBullet] = useState<string | null>(null);

  // Sync entries state when experienceInfo prop changes
  useEffect(() => {
    setEntries(ensureIds(experienceInfo));
  }, [experienceInfo]);

  // Sync visible state with external prop
  useEffect(() => {
    if (externalVisible !== undefined) {
      setVisible(externalVisible);
    }
  }, [externalVisible]);

  // Sync tempSectionName
  useEffect(() => {
    setTempSectionName(sectionName);
  }, [sectionName]);

  // Handle toggle visibility
  const handleToggleVisibility = () => {
    const newVisible = !visible;
    setVisible(newVisible);
    if (onVisibilityChange) {
      onVisibilityChange(newVisible);
    }
  };

  // Update entry field
  const handleFieldChange = (
    id: string,
    field: keyof ExperienceEntry,
    value: string | string[],
  ) => {
    const updated = entries.map((entry) =>
      entry.id === id ? { ...entry, [field]: value } : entry,
    );
    setEntries(updated);
    onChange(updated);
  };

  // Add new experience entry
  const handleAddEntry = () => {
    const newEntry: ExperienceEntry = {
      id: crypto.randomUUID(),
      position: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: [""],
    };

    const updated = [...entries, newEntry];
    setEntries(updated);
    onChange(updated);
  };

  // Delete experience entry
  const handleDeleteEntry = (id: string) => {
    const updated = entries.filter((entry) => entry.id !== id);
    setEntries(updated);
    onChange(updated);
  };

  // Add bullet point to specific entry
  const handleAddBullet = (id: string) => {
    const updated = entries.map((entry) => {
      if (entry.id === id) {
        return { ...entry, bullets: [...entry.bullets, ""] };
      }
      return entry;
    });
    setEntries(updated);
    onChange(updated);
  };

  // Update specific bullet point
  const handleBulletChange = (
    id: string,
    bulletIndex: number,
    value: string,
  ) => {
    const updated = entries.map((entry) => {
      if (entry.id === id) {
        const newBullets = [...entry.bullets];
        newBullets[bulletIndex] = value;
        return { ...entry, bullets: newBullets };
      }
      return entry;
    });
    setEntries(updated);
    onChange(updated);
  };

  // Delete specific bullet point
  const handleDeleteBullet = (id: string, bulletIndex: number) => {
    const updated = entries.map((entry) => {
      if (entry.id === id) {
        const newBullets = entry.bullets.filter(
          (_, idx) => idx !== bulletIndex,
        );
        return { ...entry, bullets: newBullets.length > 0 ? newBullets : [""] };
      }
      return entry;
    });
    setEntries(updated);
    onChange(updated);
  };

  // Handle rename section
  const handleStartRename = () => {
    setTempSectionName(sectionName);
    setIsRenamingSection(true);
  };

  const handleConfirmRename = () => {
    if (onSectionNameChange) {
      onSectionNameChange(tempSectionName);
    }
    setIsRenamingSection(false);
  };

  const handleCancelRename = () => {
    setTempSectionName(sectionName);
    setIsRenamingSection(false);
  };

  // ============================================
  // IMPROVE EXISTING BULLET (what user typed)
  // ============================================
  const handleGenerateBullet = async (entryId: string, bulletIndex: number) => {
    // Find the entry
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    // Get current bullet text
    const currentBullet = entry.bullets[bulletIndex];

    // ✅ VALIDATE: User must have typed something!
    if (!currentBullet || currentBullet.trim().length === 0) {
      toast.error(
        "Please write something first, then click 'Improve with AI'",
        {
          description:
            "Type what you did in your own words, then I'll make it professional!",
        },
      );
      return;
    }

    if (currentBullet.trim().length < 5) {
      toast.error("Please write at least 5 characters", {
        description: "Give me a bit more detail about what you did!",
      });
      return;
    }

    // Show loading state
    const bulletKey = `${entryId}-${bulletIndex}`;
    setLoadingBullet(bulletKey);

    try {
      // Call API to improve bullet
      const response = await fetch("/api/ai/improve-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: currentBullet,
          context: {
            jobTitle: entry.position,
            company: entry.company,
            type: "experience",
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to improve bullet");
      }

      // Validate the response contains a valid bullet before updating
      if (
        !data.bullet ||
        typeof data.bullet !== "string" ||
        data.bullet.trim().length === 0
      ) {
        throw new Error("Received an invalid response from the AI service");
      }

      // Update the bullet with improved version
      handleBulletChange(entryId, bulletIndex, data.bullet.trim());

      // Show success
      toast.success("Bullet point improved!", {
        description: "Your text has been enhanced to sound more professional!",
      });
    } catch (error: any) {
      console.error("Failed to improve bullet:", error);
      toast.error("Failed to improve bullet point", {
        description: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoadingBullet(null);
    }
  };

  return (
    <Card
      className={`border border-border shadow-none ${!visible ? "opacity-50" : ""}`}
    >
      {/* Header */}
      <CardHeader className="pb-3 pt-4 px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Drag Handle */}
            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing" />

            {isRenamingSection ? (
              <Input
                value={tempSectionName}
                onChange={(e) => setTempSectionName(e.target.value)}
                autoFocus
                className="h-7 w-40 text-base font-semibold p-1"
              />
            ) : (
              <h3 className="font-semibold text-base">{sectionName}</h3>
            )}

            {!isRenamingSection ? (
              <Pencil
                className="w-3.5 h-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                onClick={handleStartRename}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Check
                  className="w-4 h-4 text-green-500 cursor-pointer hover:text-green-600 transition-colors"
                  onClick={handleConfirmRename}
                />
                <X
                  className="w-4 h-4 text-red-500 cursor-pointer hover:text-red-600 transition-colors"
                  onClick={handleCancelRename}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="text-xs">
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>

            {/* Visibility Toggle */}
            {visible ? (
              <Eye
                className="w-4 h-4 cursor-pointer hover:text-foreground transition-colors"
                onClick={handleToggleVisibility}
              />
            ) : (
              <EyeOff
                className="w-4 h-4 cursor-pointer hover:text-foreground transition-colors"
                onClick={handleToggleVisibility}
              />
            )}

            {/* Collapse Toggle */}
            <ChevronUp
              className={`w-4 h-4 cursor-pointer hover:text-foreground transition-all ${collapsed ? "rotate-180" : ""}`}
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>
        </div>
      </CardHeader>

      {/* Content */}
      {!collapsed && (
        <CardContent className="px-5 pb-5 space-y-6">
          {entries.map((entry, entryIndex) => (
            <div
              key={entry.id}
              className="space-y-4 p-4 rounded-lg border border-border relative bg-muted/20"
            >
              {/* Delete Entry Button */}
              {entries.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteEntry(entry.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}

              {/* Position */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">
                  Position / Job Title
                </Label>
                <Input
                  placeholder="e.g., Senior Software Engineer"
                  className="h-10"
                  value={entry.position}
                  onChange={(e) =>
                    handleFieldChange(entry.id, "position", e.target.value)
                  }
                />
              </div>

              {/* Company */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">
                  Company / Organization
                </Label>
                <Input
                  placeholder="e.g., Google"
                  className="h-10"
                  value={entry.company}
                  onChange={(e) =>
                    handleFieldChange(entry.id, "company", e.target.value)
                  }
                />
              </div>

              {/* Location and Dates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">
                    Location
                  </Label>
                  <Input
                    placeholder="e.g., San Francisco, CA"
                    className="h-10"
                    value={entry.location}
                    onChange={(e) =>
                      handleFieldChange(entry.id, "location", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">
                    Start Date
                  </Label>
                  <Input
                    placeholder="e.g., Jan 2023"
                    className="h-10"
                    value={entry.startDate}
                    onChange={(e) =>
                      handleFieldChange(entry.id, "startDate", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground font-medium">
                    End Date
                  </Label>
                  <Input
                    placeholder="e.g., Present"
                    className="h-10"
                    value={entry.endDate}
                    onChange={(e) =>
                      handleFieldChange(entry.id, "endDate", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Bullets Section */}
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground font-medium">
                  Key Achievements & Responsibilities
                </Label>

                {entry.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex gap-2 items-start">
                    <span className="text-muted-foreground mt-3 text-xs">
                      •
                    </span>
                    <div className="flex-1 relative">
                      <Textarea
                        placeholder="Type what you did in your own words... (e.g., 'Built APIs for the payment system')"
                        className="min-h-[80px] text-sm resize-none pr-28 pb-10"
                        value={bullet}
                        onChange={(e) =>
                          handleBulletChange(
                            entry.id,
                            bulletIndex,
                            e.target.value,
                          )
                        }
                      />

                      {/* Improve Button inside Textarea */}
                      <Button
                        type="button"
                        variant="gradient"
                        size="sm"
                        className="absolute bottom-2 right-2 group gap-1 text-xs px-3 py-1.5 rounded-md shadow-md border hover:shadow-lg active:scale-[0.98] transition-all duration-300 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] hover:bg-[position:100%_0]"
                        onClick={() =>
                          handleGenerateBullet(entry.id, bulletIndex)
                        }
                        disabled={
                          loadingBullet === `${entry.id}-${bulletIndex}`
                        }
                      >
                        {loadingBullet === `${entry.id}-${bulletIndex}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        )}
                        Improve with AI
                      </Button>
                    </div>

                    {entry.bullets.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          handleDeleteBullet(entry.id, bulletIndex)
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}

                {/* Add Bullet Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-dashed"
                  onClick={() => handleAddBullet(entry.id)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Bullet Point
                </Button>
              </div>

              {/* Entry Number Badge */}
              <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center">
                {entryIndex + 1}
              </div>
            </div>
          ))}

          {/* Add New Experience Entry Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-14 gap-3 border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-muted-foreground hover:text-foreground"
            onClick={handleAddEntry}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-medium">Add Another Experience</span>
          </Button>

          {/* Job Description Helper (if provided) */}
          {jobDescription && (
            <div className="mt-4 p-3 rounded-md bg-primary/5 border border-primary/20">
              <p className="text-xs text-muted-foreground">
                💡 Tip: Tailor your bullet points to match keywords from the job
                description
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
