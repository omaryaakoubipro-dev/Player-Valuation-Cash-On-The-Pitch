"use client";

import { Info } from "lucide-react";

interface Props {
  salary: string;
  contractYears: string;
  onSalaryChange: (v: string) => void;
  onContractYearsChange: (v: string) => void;
}

export default function OptionalInputs({
  salary,
  contractYears,
  onSalaryChange,
  onContractYearsChange,
}: Props) {
  return (
    <div className="bg-surface border border-border border-dashed rounded-xl p-4">
      {/* Header */}
      <div className="flex items-start gap-2 mb-4">
        <Info size={16} className="text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-primary">
            Optional: Contract &amp; Salary Data
          </p>
          <p className="text-xs text-muted mt-0.5">
            These fields are not required but significantly improve valuation precision — especially the contract situation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Monthly salary */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide">
            Monthly Salary (EUR)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted font-medium">
              €
            </span>
            <input
              type="number"
              value={salary}
              onChange={(e) => onSalaryChange(e.target.value)}
              placeholder="e.g. 250000"
              min="0"
              className="w-full pl-7 pr-3 py-2.5 bg-surface-alt border border-border rounded-lg text-primary placeholder:text-muted text-sm outline-none focus:border-accent transition-colors"
            />
          </div>
          <p className="text-xs text-muted/60 mt-1">
            {salary
              ? `≈ €${(parseFloat(salary) * 12).toLocaleString()} / year`
              : "Monthly gross in EUR"}
          </p>
        </div>

        {/* Contract years remaining */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide">
            Contract Years Remaining
          </label>
          <div className="relative">
            <input
              type="number"
              value={contractYears}
              onChange={(e) => onContractYearsChange(e.target.value)}
              placeholder="e.g. 2"
              min="0"
              max="10"
              step="0.5"
              className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-lg text-primary placeholder:text-muted text-sm outline-none focus:border-accent transition-colors"
            />
          </div>
          <p className="text-xs text-muted/60 mt-1">
            {contractYears
              ? contractYears === "1"
                ? "Expiring soon — depresses value"
                : `${contractYears} years left`
              : "0 = out of contract, impacts value significantly"}
          </p>
        </div>
      </div>
    </div>
  );
}
