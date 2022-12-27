import React, { useEffect, useState, useRef } from 'react'
import { ConsoleLogger } from '@microsoft/signalr/dist/cjs/Utils';
import axios from 'axios';
import { Chart, ChartDataLabels } from 'chart.js';
import $ from 'jquery';
import { useParams } from "react-router-dom";



const ChartFunction = (props) => {
  let pieChartConfig;
  let barChartConfig;
  let pieChart;
  let barChart;
  let pieChartData;
  let backgroundColors;
  let barChartData;
  
  //king
  const [chartData, setChartData] = useState(props.data); // accept the data as a prop and set the component's state with the data
  //king
  
  const { projectId } = useParams()
  useEffect(()=>{
    //call VS api for overall list of milestones
  })


  // Chart defaults
  Chart.defaults.font.size = 16;



  async function getChartData(projectId, milestoneId) {
    if (milestoneId === "Overall Milestone") {
      // Call the GetAllMilestones function here to retrieve the data for all milestones in the project
      let response = await axios.get(`${process.env.REACT_APP_API_SERVER}/api/projects/${projectId}/milestones/chart_data`)
      if (response.status === 200) {
        return await response.data
      }
    } else {
      // Make a call to the API to retrieve the data for the selected milestone
      let response = await axios.get(`${process.env.REACT_APP_API_SERVER}/api/projects/${projectId}/chart_data?milestoneId=${milestoneId}`)
      if (response.status === 200) {
        return await response.data
      }
    }
  }
  
  




  function getBackgroundColors(length) {
    const backgroundColors = []
    for (let i = 0; i <= length; i++) {
      let randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);
      let randomRGB = () => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;
      backgroundColors.push(randomRGB())
    }
    return backgroundColors
  }

  function toggleChartsVisibility(chartData) {
    if (chartData["data"].every(d => d === 0)) {
      $("#charts").hide();
      $("#no-data").show();
    }
    else {
      $("#charts").show();
      $("#no-data").hide();
    }
  }

  function getPieChartData(chartData, backgroundColors) {
    let labels = [];
    let data = [];
    let colors = [];
    for (let i = 0; i < chartData["labels"].length; i++) {
      if (chartData["data"][i] > 0) {
        labels.push(chartData["labels"][i]);
        data.push(chartData["data"][i]);
        colors.push(backgroundColors[i])
      }
    };

    pieChartData = {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors
      }]
    };

    return pieChartData;
  }

  function loadGraphs() {
    getChartData(projectId, $("#chart-filter").val()).then(chartData => {

      backgroundColors = getBackgroundColors(chartData["labels"].length)

      pieChartData = getPieChartData(chartData, backgroundColors);
      barChartData = {
        labels: chartData["labels"],
        datasets: [{
          data: chartData["data"],  
          backgroundColor: backgroundColors
        }]
      };

      // Chart Options

      const pieChartOptions = {
        plugins: {
          legend: {
            position: "bottom"
          },
          datalabels: {
            formatter: (value, ctx) => {
              let sum = 0;
              let dataArr = ctx.chart.data.datasets[0].data;
              dataArr.map(data => {
                sum += data;
              });
              let percentage = (value * 100 / sum).toFixed(2) + "%";
              return percentage;
            },
            color: '#fff',
          },
          maintainAspectRatio: false
        }
      }

      const barChartOptions = {
        plugins: {
          legend: {
            display: false
          },
          datalabels: {
            formatter: function (value, context) {
              return value != 0 ? value : ""
            },
            color: '#fff',
          }
        },
        scales: {
          y: {
            ticks: {
              stepSize: 1,
              precision: 0
            },
            title: {
              display: true,
              text: "Tasks Completed"
            }
          }
        },
        maintainAspectRatio: false
      }

      // Chart Configs

      pieChartConfig = {
        type: 'pie',
        data: pieChartData,
        options: pieChartOptions
      };

      barChartConfig = {
        type: 'bar',
        data: barChartData,
        options: barChartOptions
      };

      // Instantiating charts

      pieChart = new Chart(
        $("#pie-chart"),
        pieChartConfig
      );

      barChart = new Chart(
        $("#bar-chart"),
        barChartConfig
      )

      toggleChartsVisibility(chartData);

    })
  }

  $(function () {

    loadGraphs();
    //Add overall option 
    $("#chart-filter").on("change", function () {
      getChartData(projectId, $(this).val()).then(chartData => {
        const pieChartData = getPieChartData(chartData, backgroundColors)

        pieChart.data.labels = pieChartData.labels;
        pieChart.data.datasets[0] = pieChartData.datasets[0];

        barChart.data.labels = chartData["labels"];
        barChart.data.datasets.forEach(dataset => {
          dataset.data = chartData["data"]
        });

        pieChart.update();
        barChart.update();

        toggleChartsVisibility(chartData);


      })
    })
  })
}



export {  ChartFunction }
