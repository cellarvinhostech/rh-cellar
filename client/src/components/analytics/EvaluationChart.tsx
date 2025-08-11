import { BarChart3, TrendingUp } from "lucide-react";

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface EvaluationChartProps {
  data: ChartData[];
  title: string;
  subtitle?: string;
}

export function EvaluationChart({ data, title, subtitle }: EvaluationChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100" data-testid="evaluation-chart">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-end justify-between space-x-2 h-64">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center mb-2">
                <div 
                  className="chart-bar w-full max-w-12 rounded-t-lg"
                  style={{
                    backgroundColor: item.color,
                    height: `${(item.value / maxValue) * 200}px`,
                    minHeight: '20px'
                  }}
                  data-testid={`chart-bar-${index}`}
                />
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-slate-900 mb-1">{item.value}</div>
                <div className="text-xs text-slate-500 leading-tight">{item.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4 border-t border-slate-100">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-slate-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}