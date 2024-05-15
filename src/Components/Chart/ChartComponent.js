import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "./ChartComponent.css";
import { Chart,LineElement,PointElement, LinearScale, TimeScale} from "chart.js";
import "chartjs-adapter-date-fns"; 

const ChartComponent = ({ availableDates, readingData, selectedStationId, selectedShift }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    // Register necessary scales (LinearScale and TimeScale)
    Chart.register(LinearScale, TimeScale, PointElement, LineElement);
  }, []);

  useEffect(() => {
    if (availableDates && availableDates.length > 0 && readingData && selectedStationId && selectedShift) {
      const labels = availableDates;
      const averages = [];

      availableDates.forEach((date) => {
        let total = 0;
        let count = 0;

        if (readingData[date] && readingData[date][selectedStationId]) {
          const shiftData = readingData[date][selectedStationId][selectedShift];
          if (shiftData && shiftData.length === 5) {
            shiftData.forEach((value) => {
              if (value !== null && !isNaN(Number(value))) {
                total += Number(value);
                count++;
              }
            });
          }
        }

        const average = total / 5;
        averages.push(average.toFixed(2));
      });

      const averageOfAverages = calculateAverage(averages);

      setChartData({
        labels: labels,
        datasets: [
          {
            // label: `Average Shift ${selectedShift} Values for Station ${selectedStationId}`,
            label:"X ",
            data: averages,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
          {
            label: "X bar",
            data: Array(averages.length).fill(averageOfAverages), // Constant line graph with average of averages
            fill: false,
            borderColor: "orange",
            tension: 0,
          },
        ],
      });
    } else {
      setChartData(null); // Reset chart data if data is not available
    }
  }, [availableDates, readingData, selectedStationId, selectedShift]);
  const tooltipLabelCallback = (tooltipItem) => {
    console.log(tooltipItem); // Log the tooltipItem to inspect its properties
    const dataIndex = tooltipItem.dataIndex;
    const averageValue = chartData.datasets[0].data[dataIndex];
    return `Average Value: ${averageValue}`;
  };

  const calculateAverage = (array) => {
    const sum = array.reduce((acc, value) => acc + parseFloat(value), 0);
    return sum / array.length;
  };

  if (!chartData) {
    return <div>Loading chart...</div>; // Render a loading state while data is being fetched
  }

  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#aaa',
        borderWidth: 1,
        callbacks: {
          label: (tooltipItem) => `Value: ${tooltipItem.raw}`,
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Average Shift Values',
        },
      },
      x: {
        type: 'time',
        title: {
          display: true,
          text: 'Dates',
        },
        time: {
          unit: 'day',
        },
      },
    },
  };

  console.log(options.plugins.tooltip); // Log the tooltip configuration

  return (
    <div className="chart-container">
      <h2>Average Shift {selectedShift} Values for Station {selectedStationId}</h2>
      <Line
        data={chartData}
        options={options}
      />
    </div>
  );
};

export default ChartComponent;
