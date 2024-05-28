import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Legend,
} from "chart.js";
import ExcelJS from "exceljs";
import "chartjs-adapter-date-fns";
import "./Chart.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ExportCharts = ({
  availableDates,
  readingData,
  selectedStationId,
  selectedShift,
  constVal,
}) => {
  const [chartData, setChartData] = useState(null);
  const [rangeValues, setRangeValues] = useState([]);
  const [dates, setDates] = useState([]);
  const [averageR, setAverageR] = useState(null);

  const chartRef = useRef(null);
  const rangeChartRef = useRef(null);

  useEffect(() => {
    Chart.register(
      CategoryScale,
      LinearScale,
      LineElement,
      PointElement,
      Title,
      Legend
    );
  }, []);

  useEffect(() => {
    if (
      availableDates &&
      availableDates.length > 0 &&
      readingData &&
      selectedStationId &&
      selectedShift
    ) {
      const labels = availableDates;
      const averages = [];

      availableDates.forEach((date) => {
        let total = 0;
        let count = 0;

        if (readingData[date] && readingData[date][selectedStationId]) {
          const shiftData = readingData[date][selectedStationId][selectedShift];
        //   if (shiftData && shiftData.length === 5) {
            
        //     const isValid = shiftData.every(
        //         (value) => value !== null
        //       );
        //       if (isValid) {
        //         shiftData.forEach((value) => {
        //           total += Number(value);
        //           count++;
        //         });
        //       }
        //   }    
        // }

        // // const average = total / 5;
        // const average = count > 0 ? total / count : 0; // Set average to 0 if count is 0
        // averages.push(average.toFixed(2));

        if (shiftData && shiftData.length === 5) {
            const isValid = shiftData.every(
              (value) => value !== null && value > 0
            );
            if (isValid) {
              shiftData.forEach((value) => {
                total += Number(value);
                count++;
              });
            }
          }
        }

        const average = count === 5 ? total / count : 0; // Set average to 0 if count is not 5
        averages.push(average.toFixed(2));
      });

      const averageOfAverages = calculateAverage(averages);
      const ucl = averageOfAverages + constVal.A2 * constVal.D2;
      const lcl = averageOfAverages - constVal.A2 * constVal.D2;

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

      const ranges = labels.map((date) => {
        const dayData = readingData[date]?.[selectedStationId]?.[selectedShift];
    //     if (Array.isArray(dayData) && dayData.length > 0) {
    //       const max = Math.max(...dayData);
    //       const min = Math.min(...dayData);
    //       return max - min;
    //     }
    //     return 0;
    //   });
    if (
        Array.isArray(dayData) &&
        dayData.length === 5 &&
        dayData.every((value) => value !== null && value > 0)
      ) {
        const max = Math.max(...dayData);
        const min = Math.min(...dayData);
        return max - min;
      }
      return 0;
    });

      setRangeValues(ranges);
      setDates(labels);

      const sumRangeValues = ranges.reduce((acc, val) => acc + val, 0);
      const averageR = ranges.length > 0 ? sumRangeValues / ranges.length : 0;
      setAverageR(averageR);
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
    const rangeChartInstance = rangeChartRef.current;

    if (chartInstance && rangeChartInstance) {
      // Set chart background color to white
      chartInstance.canvas.style.backgroundColor = "white";
      rangeChartInstance.canvas.style.backgroundColor = "white";

      chartInstance.update();
      rangeChartInstance.update();

      const base64Image1 = chartInstance.toBase64Image();
      const base64Image2 = rangeChartInstance.toBase64Image();

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Charts");

      // Add data for the first chart
      worksheet.addRow(["Date", "X bar"]);
      chartData.labels.forEach((label, index) => {
        worksheet.addRow([label, chartData.datasets[0].data[index]]);
      });

      const imageId1 = workbook.addImage({
        base64: base64Image1,
        extension: "png",
      });

      // Insert the first chart
      worksheet.addImage(imageId1, "D2:M20"); // Adjusted position to avoid overlap

      worksheet.addRow([]);
      worksheet.addRow([]);
      worksheet.addRow([]);

      // Add data for the second chart
      worksheet.addRow(["Date", "R"]);
      dates.forEach((date, index) => {
        worksheet.addRow([date, rangeValues[index]]);
      });

      const imageId2 = workbook.addImage({
        base64: base64Image2,
        extension: "png",
      });

      // Insert the second chart
      worksheet.addImage(imageId2, "D24:M42"); // Adjusted position to avoid overlap

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "charts.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Reset chart canvas background color
      chartInstance.canvas.style.backgroundColor = "";
      rangeChartInstance.canvas.style.backgroundColor = "";
    } else {
      toast.info("Both Charts are not available");
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
        },
      },
      tooltip: {
        enabled: true, // Enable tooltips
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
        },
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
      },
    },
    elements: {
      line: {
        backgroundColor: "white", // Set background color of line elements to white
      },
    },
    backgroundColor: "white", // Set background color of the chart area to white
  };

  const options2 = {
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
        position: "top",
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
      tooltip: {
        enabled: true, // Enable tooltips
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
        },
      },
    },
  };

  const UCL = constVal.D4 * averageR;
  const LCL = constVal.D3 * averageR;

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
        data: Array(dates.length).fill(averageR),
        fill: false,
        borderColor: "green",
        tension: 0.1,
      },
      {
        label: "UCL R",
        data: Array(dates.length).fill(UCL),
        fill: false,
        borderColor: "skyblue",
        tension: 0.1,
      },
      {
        label: "LCL R",
        data: Array(dates.length).fill(LCL),
        fill: false,
        borderColor: "brown",
        tension: 0.1,
      },
    ],
  };

  return (
    <>
      <ToastContainer />
      <div className="chart-container">
        <button className="task_assign_btn" onClick={exportChartToExcel}>
          Export to Excel
        </button>
        <h2>
          X-bar chart for Shift {selectedShift} Values for Station{" "}
          {selectedStationId}
        </h2>
        <div
          style={{
            position: "relative",
            height: "400px",
            width: "600px",
            backgroundColor: "white",
          }}
        >
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      </div>
      <div className="chart-container">
        <h2>R-Chart</h2>
        <div
          style={{
            position: "relative",
            height: "400px",
            width: "600px",
            backgroundColor: "white",
          }}
        >
          <Line ref={rangeChartRef} data={data} options={options2} />
        </div>
      </div>
    </>
  );
};

export default ExportCharts;