import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle2, Loader2, X } from "lucide-react";
import { useState, useEffect } from "react";

export function DocumentUploadModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  
  const findings = [
    "Identified: 2024 Renewal Application.pdf",
    "Extracted: Total Insured Value $412.5M",
    "Detected: 4 prior claims totaling $187K in Loss Runs",
    "Recognized: COPE survey for 34 properties",
    "Cross-referenced: NAIC code 8211 (Education)",
    "Appetite match computed: 87% alignment"
  ];

  useEffect(() => {
    if (step < findings.length) {
      const timer = setTimeout(() => {
        setStep(s => s + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-border overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors z-20">
          <X size={16} />
        </button>

        <div className="p-10 flex flex-col items-center text-center">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-secondary rounded-full" />
            <motion.div 
              className="absolute inset-0 border-4 border-brand-blue rounded-full border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-brand-blue">
              <FileText size={28} />
            </div>
          </div>
          
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Analyzing Documents</h2>
          <p className="text-muted-foreground text-sm mb-8">Please wait while UE Intelligence comprehends the upload...</p>

          <div className="w-full space-y-3 min-h-[250px] flex flex-col justify-end">
            <AnimatePresence mode="popLayout">
              {findings.slice(0, step).map((finding, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  layout
                  className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl border border-border/50 text-left"
                >
                  <CheckCircle2 size={16} className="text-green-600 shrink-0" />
                  <span className="text-sm font-medium text-foreground">{finding}</span>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {step < findings.length && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 text-left text-muted-foreground"
              >
                <Loader2 size={16} className="animate-spin shrink-0" />
                <span className="text-sm">Processing next item...</span>
              </motion.div>
            )}
          </div>

          {step === findings.length && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onClose}
              className="mt-8 w-full py-3 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-brand-blue-dark transition-all shadow-md"
            >
              View Comprehended Results
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
