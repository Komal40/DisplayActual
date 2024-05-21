import React, { useRef } from "react";
import ChartComponent from "./ChartComponent";
import ChartComponent2 from "./ChartComponent2";
import ExcelJS from "exceljs";

export default function ExportCharts({ availableDates, readingData, selectedStationId, selectedShift, constVal }) {
  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);

  const exportChartsToExcel = async () => {
    const chartInstance1 = chartRef1.current.chartInstance;
    const chartInstance2 = chartRef2.current.chartInstance;

    const base64Image1 = chartInstance1.toBase64Image();
    const base64Image2 = chartInstance2.toBase64Image();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Charts");

    // Add chart data from ChartComponent
    const chart1Data = chartInstance1.data.datasets[0].data;
    const chart1Labels = chartInstance1.data.labels;
    worksheet.addRow(["Date", "X bar"]);
    chart1Labels.forEach((label, index) => {
      worksheet.addRow([label, chart1Data[index]]);
    });

    // Add a blank row before inserting the image
    worksheet.addRow([]);
    
    // Add the first chart image to the worksheet
    const imageId1 = workbook.addImage({
      base64: base64Image1,
      extension: 'png',
    });
    worksheet.addImage(imageId1, 'A10:E30'); // Adjust the position as needed

    // Add chart data from ChartComponent2
    worksheet.addRow([]);
    worksheet.addRow(["Date", "R", "Rbar", "UCL R", "LCL R"]);
    const chart2Data = chartInstance2.data.datasets[0].data;
    const chart2Labels = chartInstance2.data.labels;
    chart2Labels.forEach((label, index) => {
      worksheet.addRow([
        label, 
        chart2Data[index], 
        chartInstance2.data.datasets[1].data[index], 
        chartInstance2.data.datasets[2].data[index], 
        chartInstance2.data.datasets[3].data[index]
      ]);
    });

    // Add a blank row before inserting the image
    worksheet.addRow([]);
    
    // Add the second chart image to the worksheet
    const imageId2 = workbook.addImage({
      base64: base64Image2,
      extension: 'png',
    });
    worksheet.addImage(imageId2, 'A50:E70'); // Adjust the position as needed

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'charts.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <ChartComponent
        ref={chartRef1}
        availableDates={availableDates}
        readingData={readingData}
        selectedStationId={selectedStationId}
        selectedShift={selectedShift}
        constVal={constVal}
      />
      <ChartComponent2
        ref={chartRef2}
        availableDates={availableDates}
        readingData={readingData}
        selectedStationId={selectedStationId}
        selectedShift={selectedShift}
        constVal={constVal}
      />
      <button onClick={exportChartsToExcel}>Export Both Charts to Excel</button>
    </div>
  );
};

