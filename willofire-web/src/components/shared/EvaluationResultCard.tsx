import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export function EvaluationResultCard() {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="border-b border-slate-200 bg-slate-50 px-6 md:px-8 py-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Evaluation Report</h2>
                    <p className="text-sm text-slate-500 mt-1">For: Q3 from Thermodynamics Mock Test</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Willofire AI v2.1 • Just now
                </div>
            </div>

            <div className="p-6 md:p-8">
                <div className="flex items-center gap-6 mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                        <span className="text-2xl font-bold text-white">8/10</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-slate-900">Grade: A</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">
                            Excellent grasp of the core concepts, with minor structural issues.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            Key Strengths
                        </h3>
                        <ul className="space-y-3">
                            {[
                                "Correctly identified and stated all parts of the First Law.",
                                "Used appropriate mathematical expressions to support the claim.",
                                "Clear conclusion that directly answered the question prompt."
                            ].map((strength, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0" />
                                    <span className="text-sm text-slate-700 leading-relaxed">{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2 mb-4">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Areas for Improvement
                        </h3>
                        <ul className="space-y-3">
                            {[
                                "Did not define 'internal energy' before using it in the equation.",
                                "Could have improved readability by structuring the derivation step-by-step."
                            ].map((improvement, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                                    <span className="text-sm text-slate-700 leading-relaxed">{improvement}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
