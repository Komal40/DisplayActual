import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, LinearScale } from "chart.js"; // Updated import statements
import "./ChartComponent.css";

const ChartComponent2 = ({ availableDates, readingData, selectedStationId, selectedShift ,constVal}) => {
  const [rangeValues, setRangeValues] = useState([]);
  const [dates, setDates] = useState([]);
  const [averageR, setAverageR] = useState(null); // State to hold the calculated average R (Rbar)

  useEffect(() => {
    Chart.register(LinearScale);
  }, []);

  useEffect(() => {
    if (availableDates && Object.keys(readingData).length > 0 && selectedStationId && selectedShift) {
      const dates = availableDates;
      setDates(dates);
  
      // Calculate the range for each day
      const ranges = dates.map(date => {
        const dayData = readingData[date]?.[selectedStationId]?.[selectedShift]; // Safely access nested properties
        if (Array.isArray(dayData) && dayData.length > 0) {
          const max = Math.max(...dayData);
          const min = Math.min(...dayData);
          return max - min;
        }
        return 0; // Default value if data is missing or invalid
      });
      setRangeValues(ranges);
  
      // Calculate the average R (Rbar)
      const sumRangeValues = ranges.reduce((acc, val) => acc + val, 0);
      const averageR = ranges.length > 0 ? sumRangeValues / ranges.length : 0; // Prevent division by zero
      setAverageR(averageR);
    }
  }, [availableDates, readingData, selectedStationId, selectedShift]);
  

  const options = {
    scales: {
      y: {
        suggestedMin: Math.min(0, ...rangeValues),
        suggestedMax: Math.max(25, ...rangeValues),
        stepSize: 2,
      },
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          generateLabels: (chart) => {
            const labels = [];
            chart.data.datasets.forEach((dataset) => {
              labels.push({
                text: dataset.label,
                fillStyle: dataset.borderColor,
                strokeStyle: dataset.borderColor,
                lineWidth: 2,
              });
            });
            return labels;
          },
        },
      },
    },
  };

  const ucl=(constVal.D4*averageR )
  const lcl=(constVal.D3*averageR)

  const data = {
    labels: dates,
    datasets: [
      {
        label: "R",
        data: rangeValues,
        fill: false,
        borderColor: "rgb(255, 99, 132)",
        tension: 0.1,
      },
      {
        label: "Rbar",
        data: Array(dates.length).fill(averageR), // Use average R (Rbar) for Rbar dataset
        fill: false,
        borderColor: "green",
        tension: 0.1,
      },
      {
        label: "UCL R",
        data: Array(dates.length).fill(ucl), // Use average R (Rbar) for Rbar dataset
        fill: false,
        borderColor: "skyblue",
        tension: 0.1,
      },
      {
        label: "LCL R",
        data: Array(dates.length).fill(lcl), // Use average R (Rbar) for Rbar dataset
        fill: false,
        borderColor: "brown",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="chart-container">
      <h2>R-Chart</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default ChartComponent2;
