import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell } from "lucide-react";
import { motion } from "motion/react";
import { useNotifications } from "../hooks/useQueries";

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Bell size={22} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-display">Notifications</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="notifications.loading_state">
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={k} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !notifications?.length ? (
        <Card data-ocid="notifications.empty_state">
          <CardContent className="p-12 text-center text-muted-foreground">
            <Bell size={40} className="mx-auto mb-4 opacity-30" />
            <p>No notifications at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {[...notifications]
            .sort((a, b) => Number(b.date - a.date))
            .map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                data-ocid={`notifications.item.${i + 1}`}
              >
                <Card className="shadow-card">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-base">{n.title}</CardTitle>
                    <div className="text-xs text-muted-foreground">
                      {new Date(Number(n.date) / 1_000_000).toLocaleDateString(
                        "en-IN",
                        { dateStyle: "long" },
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80">{n.message}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
        </div>
      )}
    </main>
  );
}
