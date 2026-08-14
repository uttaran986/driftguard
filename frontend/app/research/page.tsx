"use client";

import React, { useState } from "react";
import { BookOpen, Award, FileText, CheckCircle2, ChevronRight, CornerDownRight } from "lucide-react";

export default function ResearchPage() {
  const [activeSection, setActiveSection] = useState("objective");

  const sections = [
    { id: "objective", label: "Research Objective" },
    { id: "methodology", label: "Methodology & KS Test" },
    { id: "drift", label: "Drift Detection & Analysis" },
    { id: "validation", label: "Statistical Validation" },
    { id: "results", label: "Experimental Results" },
    { id: "limitations", label: "Limitations & Conclusion" },
  ];

  const handleAnchorClick = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Sidebar Layout Navigation */}
      <div className="lg:col-span-3 sticky top-24 space-y-6">
        <div className="rounded-2xl border border-gray-900 bg-gray-950/60 p-5 space-y-4">
          <div className="flex items-center gap-2 text-sky-400">
            <BookOpen size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Report Chapters</span>
          </div>

          <div className="flex flex-col gap-1.5 text-xs">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleAnchorClick(sec.id)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all ${
                  activeSection === sec.id
                    ? "bg-sky-500/10 text-sky-400 border border-sky-950/50 font-bold"
                    : "text-gray-400 hover:text-white hover:bg-gray-900/30 border border-transparent"
                }`}
              >
                <span>{sec.label}</span>
                {activeSection === sec.id && <ChevronRight size={12} />}
              </button>
            ))}
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="rounded-2xl border border-gray-900 bg-gray-950/40 p-5 space-y-4 text-xs">
          <h4 className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            Academic Figures
          </h4>
          <div className="space-y-3 font-mono">
            <div className="flex justify-between border-b border-gray-900 pb-1.5">
              <span className="text-gray-500">Overall MAE Imp.</span>
              <span className="font-bold text-emerald-400">2.0665%</span>
            </div>
            <div className="flex justify-between border-b border-gray-900 pb-1.5">
              <span className="text-gray-500">Overall RMSE Imp.</span>
              <span className="font-bold text-emerald-400">4.6628%</span>
            </div>
            <div className="flex justify-between border-b border-gray-900 pb-1.5">
              <span className="text-gray-500">Avg Monthly Imp.</span>
              <span className="font-bold text-emerald-400">2.007%</span>
            </div>
            <div className="flex justify-between border-b border-gray-900 pb-1.5">
              <span className="text-gray-500">Improved Months</span>
              <span className="font-bold text-white">8 / 12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Retrain Triggers</span>
              <span className="font-bold text-white">7 Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content Area (Scrollable layout) */}
      <div className="lg:col-span-9 space-y-12 pb-24">
        {/* Section 1: Objective */}
        <section id="objective" className="scroll-mt-24 rounded-2xl border border-gray-900 bg-gray-950/40 p-8 space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-900 pb-3">
            <CornerDownRight size={16} className="text-sky-400" />
            Research Objective
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            Electrical grids operate under dynamic loading patterns influenced by seasonal factors, industrial shifts, and consumer behavior. Traditional Machine Learning (ML) demand-forecasting systems employ static weights which decay over time due to <strong>concept drift</strong>.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            The core objective of this research is to build, evaluate, and benchmark an <strong>event-driven adaptive retraining strategy</strong> (DriftGuard) that tracks data distribution shifts in real-time. By utilizing non-parametric statistical tests, the system aims to trigger weight updates only when grid shifts occur, maximizing prediction accuracy while minimizing computational costs and training overhead.
          </p>
        </section>

        {/* Section 2: Methodology */}
        <section id="methodology" className="scroll-mt-24 rounded-2xl border border-gray-900 bg-gray-950/40 p-8 space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-900 pb-3">
            <CornerDownRight size={16} className="text-sky-400" />
            Methodology & Kolmogorov-Smirnov Test
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            The DriftGuard detection module uses the two-sample **Kolmogorov-Smirnov (KS) Test** to monitor distribution shifts. The KS test evaluates the null hypothesis (\(H_0\)) that the baseline load shape profile and the monitored live grid profile originate from the same statistical distribution.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            The KS statistic is defined as the supremum of the absolute differences between the empirical cumulative distribution functions (eCDFs) of the baseline and evaluation samples:
          </p>
          <div className="bg-gray-950/60 p-4 rounded-xl border border-gray-900 text-center font-mono text-sm my-2 text-sky-400">
            {"\\[D_{n,m} = \\sup_x |F_{1,n}(x) - F_{2,m}(x)|\\]"}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            {"Where \\(F_{1,n}(x)\\) is the baseline cumulative distribution function and \\(F_{2,m}(x)\\) is the cumulative distribution of the evaluation window."}
            A concept drift event is triggered if:
          </p>
          <ul className="text-xs text-gray-400 list-disc list-inside space-y-1.5 pl-2 font-mono">
            <li>KS Statistic (\(D\)) &gt; 0.10</li>
            <li>p-value &lt; 0.05</li>
          </ul>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            When drift is flagged, the system initiates an online retraining run, updating model weights with the most recent evaluation records.
          </p>
        </section>

        {/* Section 3: Drift Detection */}
        <section id="drift" className="scroll-mt-24 rounded-2xl border border-gray-900 bg-gray-950/40 p-8 space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-900 pb-3">
            <CornerDownRight size={16} className="text-sky-400" />
            Drift Detection & Analysis
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            Evaluating historical data for the year 2014, the KS test was executed on monthly aggregated demand windows. Concept drift was statistically flagged in 5 months: January, February, April, June, and July.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            To evaluate the relationship between distribution drift intensity and model forecast errors, we calculated the correlation coefficients:
          </p>
          <div className="grid grid-cols-2 gap-4 my-2">
            <div className="p-4 rounded-xl border border-gray-900 bg-gray-950/20 text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Pearson Correlation</p>
              <p className="text-sm font-bold text-white mt-1 font-mono">-0.4848 (p = 0.1102)</p>
            </div>
            <div className="p-4 rounded-xl border border-gray-900 bg-gray-950/20 text-center">
              <p className="text-[10px] text-gray-500 font-bold uppercase">Spearman Correlation</p>
              <p className="text-sm font-bold text-white mt-1 font-mono">-0.5524 (p = 0.0625)</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            <strong>Key Analysis:</strong> Because the p-values for both correlation tests are greater than 0.05, we cannot reject the null hypothesis that there is no correlation between the KS distance and forecasting error. The negative direction is counter-intuitive and suggests that larger distribution shifts do not directly cause larger MAE values during this observation window. Thus, correlation does not imply causation.
          </p>
        </section>

        {/* Section 4: Validation */}
        <section id="validation" className="scroll-mt-24 rounded-2xl border border-gray-900 bg-gray-950/40 p-8 space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-900 pb-3">
            <CornerDownRight size={16} className="text-sky-400" />
            Statistical Validation (Wilcoxon Test)
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            To scientifically validate if the Adaptive DriftGuard V3 model significantly improves predictions over the Static Baseline, a non-parametric **Wilcoxon Signed-Rank Test** was conducted on the monthly MAE distributions.
          </p>
          <div className="p-4 rounded-xl border border-gray-900 bg-gray-950/60 flex items-center justify-between gap-6">
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Wilcoxon Test Statistic</p>
              <p className="text-lg font-bold text-white font-mono mt-0.5">16.0000</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Asymptotic p-value</p>
              <p className="text-lg font-bold text-amber-400 font-mono mt-0.5">0.147461</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded text-[9px] font-bold bg-rose-950 text-rose-400 border border-rose-900/40 uppercase">
                p &gt; 0.05 (Insig.)
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            <strong>Discussion:</strong> Adaptive DriftGuard V3 achieved better numerical performance (overall MAE of 3817.83 vs 3898.39 for the static model). However, the Wilcoxon test yielded a p-value of 0.1475. Because this exceeds the significance level (\(\alpha = 0.05\)), the numerical improvement is <strong>not statistically significant</strong>.
          </p>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            This outcome indicates that while Adaptive V3 exhibits promising error-reduction trends, we cannot confidently declare it statistically superior based solely on this 12-month evaluation dataset. The observed difference could be a result of random variance rather than systematic superiority.
          </p>
        </section>

        {/* Section 5: Results */}
        <section id="results" className="scroll-mt-24 rounded-2xl border border-gray-900 bg-gray-950/40 p-8 space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-900 pb-3">
            <CornerDownRight size={16} className="text-sky-400" />
            Experimental Results & Benchmark
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            The table below benchmarks the forecasting strategies across the evaluation timeline:
          </p>

          <div className="rounded-xl border border-gray-900 bg-gray-950 p-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-gray-850 text-gray-500 uppercase font-semibold">
                  <th className="pb-3 pr-4">Strategy</th>
                  <th className="pb-3 pr-4 text-right">MAE</th>
                  <th className="pb-3 pr-4 text-right">RMSE</th>
                  <th className="pb-3 pr-4 text-right">sMAPE</th>
                  <th className="pb-3 text-right">Retrain Events</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900 font-mono text-gray-300">
                <tr>
                  <td className="py-3 pr-4 font-sans">Static Model</td>
                  <td className="py-3 pr-4 text-right">3898.3948</td>
                  <td className="py-3 pr-4 text-right">5828.8307</td>
                  <td className="py-3 pr-4 text-right">1.8000%</td>
                  <td className="py-3 text-right">0</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-sans">Periodic Retraining</td>
                  <td className="py-3 pr-4 text-right">3893.8152</td>
                  <td className="py-3 pr-4 text-right">5830.1407</td>
                  <td className="py-3 pr-4 text-right">1.8017%</td>
                  <td className="py-3 text-right">4</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 font-sans">One-Time DriftGuard</td>
                  <td className="py-3 pr-4 text-right">3867.5332</td>
                  <td className="py-3 pr-4 text-right">5815.2680</td>
                  <td className="py-3 pr-4 text-right">1.7874%</td>
                  <td className="py-3 text-right">1</td>
                </tr>
                <tr className="text-emerald-400 font-bold">
                  <td className="py-3 pr-4 font-sans">Adaptive DriftGuard V3</td>
                  <td className="py-3 pr-4 text-right">3817.8330</td>
                  <td className="py-3 pr-4 text-right">5557.0440</td>
                  <td className="py-3 pr-4 text-right">1.7628%</td>
                  <td className="py-3 text-right">7</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            Adaptive DriftGuard V3 achieved the lowest forecasting error across all strategies.
            This performance is achieved by executing event-driven retraining (7 events) in response to data drifts, compared to 4 events for periodic updates which showed negligible improvements.
          </p>
        </section>

        {/* Section 6: Limitations & Conclusion */}
        <section id="limitations" className="scroll-mt-24 rounded-2xl border border-gray-900 bg-gray-950/40 p-8 space-y-4">
          <h2 className="text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-gray-900 pb-3">
            <CornerDownRight size={16} className="text-sky-400" />
            Limitations & Conclusion
          </h2>
          <div className="space-y-4 text-xs text-gray-400 leading-relaxed">
            <div>
              <p className="font-bold text-white uppercase tracking-wide">Study Limitations</p>
              <ul className="list-disc list-inside space-y-1.5 mt-1.5 pl-2">
                <li><strong>Sample Length:</strong> Evaluation is restricted to 12 monthly aggregated data blocks, limiting Wilcoxon rank-test sample count to \(N=12\).</li>
                <li><strong>Retraining Window:</strong> Standard online retraining parameters overwrite previous neural weights entirely, risking catastrophic forgetting during localized anomalies.</li>
                <li><strong>Environmental Indicators:</strong> The KS test monitors only load magnitudes, omitting weather variables, grid price structures, and time indicators.</li>
              </ul>
            </div>

            <div>
              <p className="font-bold text-white uppercase tracking-wide">Final Conclusion</p>
              <p className="mt-1.5">
                The experimental results demonstrate that Adaptive DriftGuard V3 achieves superior numerical accuracy over static and periodic retraining schedules, lowering overall MAE by 2.07% and RMSE by 4.66% while utilizing only 7 drift-triggered updates.
              </p>
              <p className="mt-1.5">
                However, statistical validation using the Wilcoxon test did not show significance (p = 0.1475). In conclusion, while the adaptive retraining system shows strong numerical utility for energy forecasting, larger seasonal cycles and datasets are required to confirm statistical superiority.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
