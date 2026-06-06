import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

interface Props {
  currentTry: number;
  didGuess: boolean;
  sessionDate: string;
}

interface HistoricalPlayData {
  sessionDates?: string[];
  guesses?: number[];
  didGuess?: boolean[];
}

type GuessCount = 1 | 2 | 3 | 4 | 5 | 6;
type Distribution = Record<GuessCount, number> & { NS: number };

function getHistoricalPlayData(): HistoricalPlayData {
  try {
    return JSON.parse(localStorage.getItem("historicalPlayData") || "{}");
  } catch {
    return {};
  }
}

function addResultToDistribution(
  distribution: Distribution,
  guessCount: number,
  didGuess: boolean
) {
  if (!didGuess) {
    distribution.NS += 1;
    return;
  }

  if (guessCount >= 1 && guessCount <= 6) {
    distribution[guessCount as GuessCount] += 1;
  }
}

export default function GuessDistributionChart({
  currentTry,
  didGuess,
  sessionDate,
}: Props) {
  const historicalPlayData = getHistoricalPlayData();

  const distribution: Distribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    NS: 0,
  };

  if (historicalPlayData.guesses && historicalPlayData.didGuess) {
    historicalPlayData.guesses.forEach((guessCount, index) => {
      addResultToDistribution(
        distribution,
        guessCount,
        historicalPlayData.didGuess?.[index] ?? false
      );
    });
  }

  if (!historicalPlayData.sessionDates?.includes(sessionDate)) {
    addResultToDistribution(distribution, currentTry, didGuess);
  }

  const data = {
    labels: ["1", "2", "3", "4", "5", "6", "NS"],
    datasets: [
      {
        data: [
          distribution[1],
          distribution[2],
          distribution[3],
          distribution[4],
          distribution[5],
          distribution[6],
          distribution.NS,
        ],
        backgroundColor: "#6aaa64",
        borderRadius: 4,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  return (
    <div style={{ maxWidth: 500, width: "100%", marginBottom: "20px" }}>
      <h3>Statistics</h3>
      <Bar data={data} options={options} />
    </div>
  );
}
