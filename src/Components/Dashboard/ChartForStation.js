import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const calculateXBarAndR = (data) => {
  return data.map(entry => {
    const values = entry.values.filter(value => value !== null).map(Number);
    if (values.length === 5) { // Check if there are exactly 5 readings
      const sum = values.reduce((a, b) => a + b, 0);
      const average = sum / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      const range = max - min;

      return {
        date: entry.date,
        process: entry.process,
        xBar: average,
        r: range
      };
    }
    return null;
  }).filter(entry => entry !== null);
};

const ChartComponent = ({ data }) => {
  // Check if data is an array
  if (!Array.isArray(data) || data.length === 0) {
    return <p>No data to display</p>;
  }

  // Calculate X-bar and R
  const processedData = calculateXBarAndR(data);

  // Prepare chart data
  const chartLabels = processedData.map(d => d.date);

  const xBarDataset = {
    label: 'X-bar',
    data: processedData.map(d => d.xBar),
    borderColor: 'rgba(75, 192, 192, 1)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    yAxisID: 'y'
  };

  const rDataset = {
    label: 'R',
    data: processedData.map(d => d.r),
    borderColor: 'rgba(255, 99, 132, 1)',
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    yAxisID: 'y1'
  };

  const chartData = {
    labels: chartLabels,
    datasets: [xBarDataset, rDataset],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Station Data Chart',
      },
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default ChartComponent;
