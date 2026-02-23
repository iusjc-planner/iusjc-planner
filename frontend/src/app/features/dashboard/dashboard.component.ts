import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  DoughnutController,
  PieController
} from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor() {
    // Enregistrer les composants Chart.js nécessaires
    Chart.register(ArcElement, Tooltip, Legend, DoughnutController, PieController);
  }

  ngOnInit(): void {
  }

  // Graphique d'occupation des salles par école
  occupationChartData = {
    labels: ["SJI", "SJM", "PrepaVogt", "CPGE"],
    datasets: [{
      label: 'Salles Occupées',
      data: [12, 8, 15, 10],
      backgroundColor: 'rgba(102, 126, 234, 0.8)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 1
    },
    {
      label: 'Salles Libres',
      data: [8, 7, 5, 8],
      backgroundColor: 'rgba(67, 233, 123, 0.8)',
      borderColor: 'rgba(67, 233, 123, 1)',
      borderWidth: 1
    }]
  };

  occupationChartOptions = {
    responsive: true,
    legend: {
      display: false
    },
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          max: 20,
          stepSize: 5
        },
        gridLines: {
          color: 'rgba(235,237,242,1)',
          drawBorder: false
        }
      }],
      xAxes: [{
        gridLines: {
          display: false,
          drawBorder: false
        },
        ticks: {
          fontColor: "#9c9fa6"
        }
      }]
    }
  };

  // Graphique de répartition des cours par type
  coursesChartData = {
    labels: ["Cours Magistraux", "Travaux Dirigés", "Travaux Pratiques"],
    datasets: [{
      data: [45, 35, 20],
      backgroundColor: [
        'rgba(102, 126, 234, 1)',
        'rgba(67, 233, 123, 1)',
        'rgba(255, 213, 0, 1)'
      ],
      borderColor: [
        'rgba(102, 126, 234, 0.2)',
        'rgba(67, 233, 123, 0.2)',
        'rgba(255, 213, 0, 0.2)'
      ],
      borderWidth: 1
    }]
  };

  coursesChartOptions = {
    responsive: true,
    legend: {
      display: false
    }
  };

  // Graphique circulaire - Répartition des utilisateurs par école
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartData = {
    labels: ['SJI', 'SJM', 'PrepaVogt', 'CPGE'],
    datasets: [{
      data: [35, 25, 20, 20],
      backgroundColor: [
        '#667eea',
        '#43e97b', 
        '#ffd500',
        '#047edf'
      ],
      borderColor: [
        '#667eea',
        '#43e97b',
        '#ffd500', 
        '#047edf'
      ],
      borderWidth: 2,
      hoverBackgroundColor: [
        '#5a6fd8',
        '#3dd370',
        '#e6c200',
        '#0369c7'
      ]
    }]
  };

  public doughnutChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      }
    }
  };

  // Graphique circulaire - Statut des salles
  public pieChartType: ChartType = 'pie';
  public pieChartData = {
    labels: ['Salles Occupées', 'Salles Libres', 'Salles en Maintenance'],
    datasets: [{
      data: [18, 12, 2],
      backgroundColor: [
        '#dc3545',
        '#28a745',
        '#ffc107'
      ],
      borderColor: [
        '#dc3545',
        '#28a745', 
        '#ffc107'
      ],
      borderWidth: 2
    }]
  };

  public pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12
          }
        }
      }
    }
  };

}
