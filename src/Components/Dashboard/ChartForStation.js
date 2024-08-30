// import React, { useEffect, useState } from 'react';
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// const calculateXBarAndR = (data) => {

//   console.log("calculateXBarAndR",data)
//   return data.map(entry => {
//     const values = entry.values.filter(value => value !== null).map(Number);
//     if (values.length === 5) { // Check if there are exactly 5 readings
//       const sum = values.reduce((a, b) => a + b, 0);
//       const average = sum / values.length;
//       const max = Math.max(...values);
//       const min = Math.min(...values);
//       const range = max - min;

//       return {
//         date: entry.date,
//         process: entry.process,
//         xBar: average,
//         r: range
//       };
//     }
//     return null;
//   }).filter(entry => entry !== null);
// };



// const ChartComponentForStation = ({ data, station, onChartDataReady }) => {
//   console.log("ChartComponent",data, station, onChartDataReady )
//   // Calculate X-bar and R
//   const processedData = calculateXBarAndR(data);
//   console.log("processeddata",processedData)

//   // Prepare chart data
//   const chartLabels = processedData.map(d => d.date);

//   const xBarDataset = {
//     label: 'X-bar',
//     data: processedData.map(d => d.xBar),
//     borderColor: 'rgba(75, 192, 192, 1)',
//     backgroundColor: 'rgba(75, 192, 192, 0.2)',
//     yAxisID: 'y'
//   };

//   const rDataset = {
//     label: 'R',
//     data: processedData.map(d => d.r),
//     borderColor: 'rgba(255, 99, 132, 1)',
//     backgroundColor: 'rgba(255, 99, 132, 0.2)',
//     yAxisID: 'y1'
//   };

//   const chartData = {
//     labels: chartLabels,
//     datasets: [xBarDataset, rDataset],
//   };

//   const options = {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top',
//       },
//       title: {
//         display: true,
//         text: `Station ${station} Data Chart`,
//       },
//     },
//     scales: {
//       y: {
//         type: 'linear',
//         position: 'left',
//       },
//       y1: {
//         type: 'linear',
//         position: 'right',
//         grid: {
//           drawOnChartArea: false,
//         },
//       },
//     },
//   };

//   useEffect(() => {
//     if (onChartDataReady) {
//       onChartDataReady(processedData, station);
//     }
//   }, [processedData, onChartDataReady, station]);

//   return <Line data={chartData} options={options} />;
// };

// export default ChartComponentForStation;




import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ChartComponent = ({ data, type, process}) => {
  const isXBar = type === 'xBar';
  const isR = type === 'r';

  return (
    <ResponsiveContainer width="100%" height={300}>
       <h5>{process}</h5>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          tick={{ angle: -45, textAnchor: 'end' }} 
          height={100} 
          interval={0} 
          tickMargin={10} 
        />
        <YAxis />
        <Tooltip />
        <Legend />
        {isXBar && <Line type="monotone" dataKey="xBar" stroke="#8884d8" />}
        {isR && <Line type="monotone" dataKey="r" stroke="#82ca9d" />}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ChartComponent;