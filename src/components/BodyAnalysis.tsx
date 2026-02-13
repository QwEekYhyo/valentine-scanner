import { useState, useCallback, Dispatch, SetStateAction, useEffect } from "react";
import { PROBLEMS, Problem, SavedDiagnosis } from "../data/problems";
import BodySchema from "./BodySchema";
import DiagnosisList from "./DiagnosisList";

interface BodyAnalysisProps {
    onBack?: () => void;
    notified: boolean;
    setNotified: Dispatch<SetStateAction<boolean>>;
    bleMocked: boolean;
}

type AnalysisStep = "waiting" | "scanning" | "results";

const BodyAnalysis = ({ onBack, notified, setNotified, bleMocked }: BodyAnalysisProps) => {
    const [step, setStep] = useState<AnalysisStep>("waiting");
    const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
    const [selectedTreatments, setSelectedTreatments] = useState<Set<string>>(new Set());
    const [diagnoses, setDiagnoses] = useState<SavedDiagnosis[]>([]);

    const nextStep = useCallback(() => {
        setStep((prev) => {
            if (prev === "waiting") return "scanning";
            if (prev === "scanning") return "results";
            return prev;
        });
    }, []);

    useEffect(() => {
        if (notified) {
            nextStep();
            setNotified(false);
        }
    }, [notified]);

    const toggleTreatment = (t: string) => {
        setSelectedTreatments((prev) => {
            const next = new Set(prev);
            if (next.has(t)) next.delete(t);
            else next.add(t);
            return next;
        });
    };

    const saveDiagnosis = () => {
        if (!selectedProblem || selectedTreatments.size === 0) return;
        setDiagnoses((prev) => [
            ...prev.filter((d) => d.problemId !== selectedProblem.id),
            {
                problemId: selectedProblem.id,
                label: selectedProblem.label,
                selectedTreatments: Array.from(selectedTreatments),
            },
        ]);
        setSelectedProblem(null);
        setSelectedTreatments(new Set());
    };

    const scheduleTreatment = (problemId: string, time: string) => {
        setDiagnoses((prev) =>
            prev.map((d) => (d.problemId === problemId ? { ...d, scheduledTime: time } : d)),
        );
    };

    const savedIds = new Set(diagnoses.map((d) => d.problemId));
    const visibleProblems = step === "results" ? PROBLEMS.filter((p) => !savedIds.has(p.id)) : [];

    return (
        <div className="flex-1 overflow-hidden p-6">
            <button
                onClick={onBack}
                className="absolute left-4 flex items-center gap-1 text-sm font-medium text-primary hover:opacity-80 transition-opacity"
            >
                <span className="text-lg">‹</span> Retour
            </button>
            {/* Top bar */}
            <div
                className={`flex items-center mb-4 max-w-xl mx-auto justify-${bleMocked ? "between" : "center"}`}
            >
                <div>
                    <h2 className="text-2xl font-semibold text-foreground mb-1">
                        Analyse corporelle
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {step === "waiting" && "En attente du scan..."}
                        {step === "scanning" && "Scan du corps entier..."}
                        {step === "results" && `${PROBLEMS.length} problèmes détectés`}
                    </p>
                </div>

                {bleMocked && step !== "results" && (
                    <button
                        onClick={nextStep}
                        className="rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        {step === "waiting" ? "Démarrer le scan" : "Terminer le scan"}
                    </button>
                )}
            </div>

            {/* 3-column layout */}
            <div className="flex gap-4 max-w-6xl mx-auto h-[calc(100%-4rem)]">
                {/* Left: Saved diagnoses */}
                <div className="w-80 flex-shrink-0 overflow-y-auto">
                    <DiagnosisList diagnoses={diagnoses} onSchedule={scheduleTreatment} />
                </div>

                {/* Center: Body schema */}
                <div className="flex-1 flex items-start justify-center">
                    <div className="glass-panel-strong rounded-3xl p-6 relative overflow-hidden w-full max-w-xs">
                        {step === "scanning" && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="scan-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
                            </div>
                        )}

                        <BodySchema
                            problems={PROBLEMS}
                            visibleProblems={visibleProblems}
                            selectedProblem={selectedProblem}
                            onSelectProblem={setSelectedProblem}
                        />

                        {step === "waiting" && (
                            <div className="text-center mt-4 text-muted-foreground text-sm">
                                {bleMocked
                                    ? "Appuyez sur « Démarrer le scan » pour commencer"
                                    : "Appuyez sur le bouton du scanner pour commencer"}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Selected problem detail */}
                <div className="w-80 flex-shrink-0 overflow-y-auto">
                    {selectedProblem && (
                        <div className="glass-panel rounded-2xl p-5 space-y-4 animate-fade-in">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">
                                    {selectedProblem.label}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {selectedProblem.description}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Traitements recommandés
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProblem.treatments.map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => toggleTreatment(t)}
                                            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                                selectedTreatments.has(t)
                                                    ? "bg-primary text-primary-foreground shadow-sm"
                                                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={saveDiagnosis}
                                disabled={selectedTreatments.size === 0}
                                className="w-full rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Enregistrer le diagnostic
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BodyAnalysis;
