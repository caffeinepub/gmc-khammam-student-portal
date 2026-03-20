import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone } from "lucide-react";
import { motion } from "motion/react";
import { AnnouncementCategory } from "../backend.d";
import { useAnnouncements } from "../hooks/useQueries";

const CATEGORY_COLORS: Record<string, string> = {
  [AnnouncementCategory.urgent]: "bg-destructive text-destructive-foreground",
  [AnnouncementCategory.exam]: "bg-amber-500 text-white",
  [AnnouncementCategory.academic]: "bg-primary text-primary-foreground",
  [AnnouncementCategory.general]: "bg-muted text-muted-foreground",
};

export default function Announcements() {
  const { data: announcements, isLoading } = useAnnouncements();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Megaphone size={22} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-display">Announcements</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="announcements.loading_state">
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={k} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : !announcements?.length ? (
        <Card data-ocid="announcements.empty_state">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Megaphone size={40} className="mx-auto mb-4 opacity-30" />
            <p>No announcements at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {[...announcements]
            .sort((a, b) => Number(b.date - a.date))
            .map((ann, i) => (
              <motion.div
                key={ann.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`announcements.item.${i + 1}`}
              >
                <Card className="shadow-card hover:shadow-nav transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-start justify-between gap-2">
                      <span>{ann.title}</span>
                      <Badge
                        className={`text-xs shrink-0 ${CATEGORY_COLORS[ann.category] ?? ""}`}
                      >
                        {ann.category}
                      </Badge>
                    </CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {new Date(
                        Number(ann.date) / 1_000_000,
                      ).toLocaleDateString("en-IN", { dateStyle: "long" })}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                      {ann.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      )}
    </main>
  );
}
