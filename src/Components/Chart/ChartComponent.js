import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, LineElement, PointElement, Title, Legend } from "chart.js";
import "chartjs-adapter-date-fns";
import "./ChartComponent.css";

const ChartComponent = forwardRef(({ availableDates, readingData, selectedStationId, selectedShift, constVal }, ref) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    Chart.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Legend);
  }, []);

  useEffect(() => {
    if (availableDates && availableDates.length > 0 && readingData && selectedStationId && selectedShift) {
      const labels = availableDates;
      const averages = [];
      const uclXBarConstant = calculateAverage(averages) + (constVal.A2 * constVal.D2);

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
      const ucl = (averageOfAverages) + (constVal.A2 * constVal.D2);
      const lcl = (averageOfAverages) - (constVal.A2 * constVal.D2);

      const newData = {
        labels: labels,
        datasets: [
          {
            label: "X bar",
            data: averages,
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
          {
            label: "X2 bar",
            data: Array(averages.length).fill(averageOfAverages),
            fill: false,
            borderColor: "orange",
            tension: 0,
          },
          {
            label: "UCL X bar",
            data: Array(averages.length).fill(ucl),
            fill: false,
            borderColor: "grey",
            tension: 0,
          },
          {
            label: "LCL X bar",
            data: Array(averages.length).fill(lcl),
            fill: false,
            borderColor: "red",
            tension: 0,
          },
        ],
      };

      setChartData(newData);
    } else {
      setChartData(null);
    }
  }, [availableDates, readingData, selectedStationId, selectedShift, constVal]);

  const calculateAverage = (array) => {
    const sum = array.reduce((acc, value) => acc + parseFloat(value), 0);
    return sum / array.length;
  };

  useImperativeHandle(ref, () => ({
    chartInstance: ref.current.chartInstance,
  }));

  if (!chartData) {
    return <div>Loading chart...</div>;
  }

  const options = {
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
    scales: {
      y: {
        type: "linear",
        beginAtZero: true,
        title: {
          display: true,
          text: "Average Shift Values",
        },
      },
      x: {
        type: "category",
        title: {
          display: true,
          text: "Dates",
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="chart-container">
      <h2>X-bar chart for Shift {selectedShift} Values for Station {selectedStationId}</h2>
      <div style={{ position: "relative", height: "400px", width: "600px", backgroundColor: "white" }}>
        <Line ref={ref} data={chartData} options={options} />
      </div>
    </div>
  );
});

export default ChartComponent;
