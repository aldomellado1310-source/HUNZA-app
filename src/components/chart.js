import Chart from 'chart.js/auto'

const mesesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                      'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

let chartInstance = null

export function initChart(filters) {
  const ctx = document.getElementById('proceduresChart')
  if (!ctx) return

  if (chartInstance) chartInstance.destroy()

  const { period, month } = filters
  const monthFactor = parseInt(month) / 10 + 0.5

  let labels, data, chartTitle

  if (period === 'anual') {
    labels = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
    data = [120,140,115,160,185,170,200,220,190,210,250,280]
    chartTitle = 'Total Procedimientos Anuales'
  } else if (period === 'mensual') {
    labels = ['Lipo Láser','Drawn Face','Armonización','Toxina B.','Lipomarcación']
    data = [45,25,30,50,15].map(v => Math.round(v * monthFactor))
    chartTitle = `Procedimientos en ${mesesNombres[parseInt(month) - 1]}`
  } else {
    labels = ['Lun','Mar','Mié','Jue','Vie','Sáb']
    data = [8,5,12,10,16,7].map(v => Math.round(v * monthFactor))
    chartTitle = `Flujo Diario (Semana Actual, ${mesesNombres[parseInt(month) - 1]})`
  }

  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: chartTitle,
        data,
        backgroundColor: '#57534e',
        borderRadius: period === 'anual' ? 4 : 6,
        barThickness: period === 'anual' ? 12 : 24,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 500, easing: 'easeOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: ctx => ` ${ctx.parsed.y} procedimientos` },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { borderDash: [4,4], color: '#f5f5f4' },
          border: { display: false },
        },
        x: {
          grid: { display: false },
          border: { display: false },
        },
      },
    },
  })
}
