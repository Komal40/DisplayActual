import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, Title, Legend } from "chart.js";
import ExcelJS from "exceljs";
import "chartjs-adapter-date-fns";
import "./ChartComponent.css";

const ExportCharts = ({ availableDates, readingData, selectedStationId, selectedShift, constVal }) => {
  const [chartData, setChartData] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    Chart.register(CategoryScale, LinearScale, Title, Legend);
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

  const exportChartToExcel = async () => {
    const chartInstance = chartRef.current;

    if (chartInstance) {
        // Set chart background color to white
        chartInstance.canvas.style.backgroundColor = "white";

        chartInstance.options.plugins.legend.labels.usePointStyle = true;
        chartInstance.options.plugins.legend.labels.boxWidth = 0;
        chartInstance.options.plugins.legend.labels.color = "white";
        chartInstance.update();

        const base64Image = chartInstance.toBase64Image();
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Chart");

        const dataHeaders = ["Date", "X bar"];
        const dataValues = chartData.labels.map((label, index) => [label, chartData.datasets[0].data[index]]);
        worksheet.addRow(dataHeaders);
        dataValues.forEach((value) => {
            worksheet.addRow(value);
        });

        worksheet.addRow([]);

        const imageId = workbook.addImage({
            base64: base64Image,
            extension: 'png',
        });

        worksheet.addImage(imageId, 'A10:E30');

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'chart.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Reset chart canvas background color
        chartInstance.canvas.style.backgroundColor = "";
    }
};


  if (!chartData) {
    return <div>Loading chart...</div>;
  }

  const options = {
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          color: "black",
        }
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
    layout: {
      padding: {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      }
    },
    elements: {
      line: {
        backgroundColor: 'white' // Set background color of line elements to white
      }
    },
    backgroundColor: 'white' // Set background color of the chart area to white
  };

  return (
    <div className="chart-container">
      <h2>X-bar chart for Shift</h2>
      <div style={{ position: "relative", height: "400px", width: "600px", backgroundColor: "white" }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      <button onClick={exportChartToExcel}>Export to Excel</button>
    </div>
  );
};

export default ExportCharts;