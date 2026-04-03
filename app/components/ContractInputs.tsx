"use client";

interface Props {
  salary: string;
  contractYears: string;
  onSalaryChange: (v: string) => void;
  onContractYearsChange: (v: string) => void;
}

export default function ContractInputs({
  salary,
  contractYears,
  onSalaryChange,
  onContractYearsChange,
}: Props) {
  const salaryNum = parseFloat(salary);
  const contractNum = parseFloat(contractYears);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-primary uppercase tracking-wider">
          3. Contract &amp; Salary
        </span>
        <span className="text-xs text-red-400 font-medium">required</span>
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              className={`w-full pl-7 pr-3 py-2.5 bg-surface-alt border rounded-lg text-primary placeholder:text-muted text-sm outline-none transition-colors ${
                salary && !isNaN(salaryNum) && salaryNum > 0
                  ? "border-emerald-500/50 focus:border-emerald-500"
                  : "border-border focus:border-accent"
              }`}
            />
          </div>
          <p className="text-xs text-muted/60 mt-1">
            {salary && !isNaN(salaryNum) && salaryNum > 0
              ? `≈ €${(salaryNum * 12).toLocaleString()} / year`
              : "Monthly gross in EUR"}
          </p>
        </div>

        {/* Contract years remaining */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5 uppercase tracking-wide">
            Contract Years Remaining
          </label>
          <input
            type="number"
            value={contractYears}
            onChange={(e) => onContractYearsChange(e.target.value)}
            placeholder="e.g. 2"
            min="0"
            max="10"
            step="0.5"
            className={`w-full px-3 py-2.5 bg-surface-alt border rounded-lg text-primary placeholder:text-muted text-sm outline-none transition-colors ${
              contractYears && !isNaN(contractNum) && contractNum >= 0
                ? "border-emerald-500/50 focus:border-emerald-500"
                : "border-border focus:border-accent"
            }`}
          />
          <p className="text-xs text-muted/60 mt-1">
            {contractYears && !isNaN(contractNum)
              ? contractNum === 0
                ? "Out of contract — major impact on value"
                : contractNum <= 1
                ? "Expiring soon — depresses value"
                : `${contractNum} years left`
              : "0 = out of contract"}
          </p>
        </div>
      </div>
    </div>
  );
}
