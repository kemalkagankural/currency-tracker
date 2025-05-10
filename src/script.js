const amountInput = document.getElementById("amount");
const convertedInput = document.getElementById("converted");
const fromSelect = document.getElementById("from");
const toSelect = document.getElementById("to");

const fromText = document.getElementById("fromText");
const toText = document.getElementById("toText");
const exchangeValue = document.getElementById("exchangeValue");

let chart;

async function fetchRate(from, to, amount = 1) {
  const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}&amount=${amount}`);
  const data = await res.json();
  return { value: data.rates[to], date: data.date };
}

async function fetchHistory(from, to) {
  const today = new Date();
  const past = new Date();
  past.setDate(today.getDate() - 30);

  const format = (d) => d.toISOString().split("T")[0];
  const url = `https://api.frankfurter.app/${format(past)}..${format(today)}?from=${from}&to=${to}`;
  const res = await fetch(url);
  const data = await res.json();
  return data;
}

function drawChart(data, to) {
  const labels = Object.keys(data.rates);
  const values = labels.map(date => data.rates[date][to]);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: to,
        data: values,
        borderColor: '#81c995',
        backgroundColor: 'rgba(129, 201, 149, 0.1)',
        tension: 0.3,
        fill: true
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#ccc' } },
        y: { ticks: { color: '#ccc' } }
      }
    }
  });
}

async function updateUI() {
    const rawAmount = amountInput.value;
    const amount = parseFloat(rawAmount);
    const from = fromSelect.value;
    const to = toSelect.value;
  
    // Üst başlık (her zaman 1 birim için gösterilecek)
    fromText.textContent = fromSelect.options[fromSelect.selectedIndex].text;
    toText.textContent = toSelect.options[toSelect.selectedIndex].text;
  
    // 1 birim için kuru al (üst bilgi için her zaman gerekli)
    const { value: singleRate } = await fetchRate(from, to, 1);
    exchangeValue.textContent = singleRate.toFixed(2);
  
    // input tamamen silindiyse alt input temizlenir ama üstteki bilgi sabit kalır
    if (rawAmount === "") {
      convertedInput.value = "";
      return;
    }
  
    // sıfırsa alt taraf 0 gösterir
    if (amount === 0 || from === to) {
      convertedInput.value = "0";
      return;
    }
  
    // normal hesaplama
    const { value } = await fetchRate(from, to, amount);
    convertedInput.value = value.toFixed(2).replace(".", ",");
  
    const historyData = await fetchHistory(from, to);
    drawChart(historyData, to);
  }
[fromSelect, toSelect, amountInput].forEach(el => el.addEventListener("input", updateUI));
window.addEventListener("DOMContentLoaded", updateUI);
