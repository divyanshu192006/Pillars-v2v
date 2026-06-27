import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
  },
};

interface RiskTrendChartProps {
  labels: string[];
  green: number[];
  yellow: number[];
  red: number[];
}

export function RiskTrendChart({ labels, green, yellow, red }: RiskTrendChartProps) {
  return (
    <div className="h-64">
      <Line
        data={{
          labels,
          datasets: [
            { label: 'Green', data: green, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
            { label: 'Yellow', data: yellow, borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.4 },
            { label: 'Red', data: red, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
          ],
        }}
        options={{
          ...chartDefaults,
          plugins: { legend: { display: true, position: 'bottom' } },
          scales: { y: { beginAtZero: true } },
        }}
      />
    </div>
  );
}

interface RiskDistributionChartProps {
  green: number;
  yellow: number;
  red: number;
}

export function RiskDistributionChart({ green, yellow, red }: RiskDistributionChartProps) {
  return (
    <div className="mx-auto h-56 w-56">
      <Doughnut
        data={{
          labels: ['Low Risk', 'Medium Risk', 'High Risk'],
          datasets: [{
            data: [green, yellow, red],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
            borderWidth: 0,
          }],
        }}
        options={{
          ...chartDefaults,
          plugins: { legend: { display: true, position: 'bottom' } },
          cutout: '65%',
        }}
      />
    </div>
  );
}

interface RiskProgressionChartProps {
  weeks: number[];
  scores: number[];
}

export function RiskProgressionChart({ weeks, scores }: RiskProgressionChartProps) {
  return (
    <div className="h-56">
      <Line
        data={{
          labels: weeks.map(w => `W${w}`),
          datasets: [{
            label: 'Risk Score',
            data: scores,
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236,72,153,0.15)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: scores.map(s => s >= 70 ? '#ef4444' : s >= 40 ? '#f59e0b' : '#10b981'),
          }],
        }}
        options={{
          ...chartDefaults,
          scales: {
            y: { beginAtZero: true, max: 100 },
          },
        }}
      />
    </div>
  );
}

interface VillageHeatmapChartProps {
  villages: { name: string; red: number; yellow: number; green: number }[];
}

export function VillageRiskBarChart({ villages }: VillageHeatmapChartProps) {
  return (
    <div className="h-72">
      <Bar
        data={{
          labels: villages.map(v => v.name),
          datasets: [
            { label: 'High Risk', data: villages.map(v => v.red), backgroundColor: '#ef4444', borderRadius: 6 },
            { label: 'Medium Risk', data: villages.map(v => v.yellow), backgroundColor: '#f59e0b', borderRadius: 6 },
            { label: 'Low Risk', data: villages.map(v => v.green), backgroundColor: '#10b981', borderRadius: 6 },
          ],
        }}
        options={{
          ...chartDefaults,
          plugins: { legend: { display: true, position: 'bottom' } },
          scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
        }}
      />
    </div>
  );
}
