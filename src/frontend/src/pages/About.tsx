import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Phone, User } from "lucide-react";
import { useCollegeInfo } from "../hooks/useQueries";

export default function About() {
  const { data: info, isLoading } = useCollegeInfo();

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Building2 size={22} className="text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-display">About GMC Khammam</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-3 text-navy">
                About the College
              </h2>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {info?.about ??
                  "Government Medical College, Khammam is a premier medical institution in Telangana, providing quality medical education under CBME (Competency Based Medical Education) curriculum. The college is affiliated to Kaloji Narayana Rao University of Health Sciences, Warangal."}
              </p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-card">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-muted-foreground mb-1">
                    Principal
                  </div>
                  <div className="font-bold text-foreground">
                    {info?.principalName ?? "Dr. (To be updated)"}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Phone size={20} className="text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-muted-foreground mb-1">
                    Contact
                  </div>
                  <div className="text-foreground">
                    {info?.contact ?? "Contact details to be updated"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-3 text-navy">
                CBME Curriculum
              </h2>
              <p className="text-sm text-foreground/80">
                This portal tracks attendance and marks as per the Competency
                Based Medical Education (CBME) circular for all MBBS phases
                (1st, 2nd, 3rd, and Final MBBS). Theory attendance threshold is
                75% and practical attendance threshold is 80% as per MCI/NMC
                norms.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
