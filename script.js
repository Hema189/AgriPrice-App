let currentLang = 'en';
let selectedCrop = '';

// 🔥 SMART CROP MATCH
function matchCrop(command){

    command = command.toLowerCase().replace(/\s+/g, '');

    const crops = {
        "Paddy": ["paddy","padi","vari","వరి","pad","pady"],
        "Tomato": ["tomato","tomatoo","టమాటా"],
        "Cotton": ["cotton","cottonn","carton","coton","పత్తి"],
        "Maize": ["maize","mys","mize","corn","మొక్కజొన్న"],
        "Mango": ["mango","mengo","mango","మామిడి"],
        "Moong": ["moong","mung","moongdal","పెసర"],
        "Sunflower-seed": ["sunflower","sunflowerseed","sunflour","సన్","suraj"]
    };

    for(let crop in crops){
        for(let word of crops[crop]){
            if(command.includes(word)){
                return crop;
            }
        }
    }
    return null;
}

// 🔥 MARKET DATA
const marketData = [
    {name:"Madanapalle", price:3200},
    {name:"Warangal", price:3100},
    {name:"Kurnool", price:3050}
];

// 🔥 SCREEN NAVIGATION

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s =>
        s.classList.remove('active')
    );

    document.getElementById(screenId).classList.add('active');

    if (screenId === 'screen-prices') {
        speak('Showing market prices');
    }

    if (screenId === 'screen-weather') {
        speak('Showing weather');
    }

    if (screenId === 'screen-graph') {
        loadChart();
    }
}


// 🔥 LANGUAGE SELECT
function selectLanguage(lang) {
    currentLang = lang;
    showScreen('screen-crops');

    if(lang === 'te'){
        speak("భాష ఎంపిక అయింది. పంట పేరు చెప్పండి");
    } else if(lang === 'hi'){
        speak("भाषा चुनी गई। फसल बताइए");
    } else{
        speak("Language selected. Tell crop");
    }
}

// 🔥 CROP SELECT
function selectCrop(crop) {
    selectedCrop = crop;
    showScreen('screen-map');
    speakMarketPrices();
}

// 🔥 AREA SELECT
function selectArea(areaName, price, transport){

    document.getElementById('selected-crop-name').innerText =
    selectedCrop + " - " + areaName;

    showScreen('screen-dashboard');

    if(currentLang === 'te'){
        speak(areaName + " ఎంపిక అయింది. ధర " + price + " రూపాయలు.");
    } else if(currentLang === 'hi'){
        speak(areaName + " चुना गया। कीमत " + price + " रुपए");
    } else{
        speak(areaName + " selected. Price " + price);
    }
}

// 🔥 MARKET VOICE
function speakMarketPrices(){

    let best = marketData[0];

    marketData.forEach(m => {
        if(m.price > best.price){
            best = m;
        }
    });

    let text = "";

    if(currentLang === 'te'){
        text = selectedCrop + " మార్కెట్లు వినండి. ";
        marketData.forEach(m => text += m.name + " ధర " + m.price + ". ");
        text += "అత్యధిక ధర " + best.name + " లో ఉంది.";
    }
    else if(currentLang === 'hi'){
        text = selectedCrop + " के बाजार सुनिए। ";
        marketData.forEach(m => text += m.name + " कीमत " + m.price + ". ");
        text += "सबसे ज्यादा कीमत " + best.name + " में है।";
    }
    else{
        text = selectedCrop + " markets. ";
        marketData.forEach(m => text += m.name + " price " + m.price + ". ");
        text += "Best price is in " + best.name;
    }

    speak(text);
}

// 🔥 SPEAK
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = currentLang === 'te' ? 'te-IN' :
                     currentLang === 'hi' ? 'hi-IN' : 'en-US';

    window.speechSynthesis.speak(utterance);
}

// 🔥 VOICE START
function startVoiceRecognition() {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Use Chrome browser");
        return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event) => {

        const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();

        console.log("User said:", command);

        // 🔥 LANGUAGE
        if(command.includes("telugu")){
            selectLanguage('te');
            return;
        }

        if(command.includes("hindi")){
            selectLanguage('hi');
            return;
        }

        if(command.includes("english")){
            selectLanguage('en');
            return;
        }

        // 🔥 CROPS (FIXED)
        const cropDetected = matchCrop(command);
        if(cropDetected){
            console.log("Crop:", cropDetected);
            selectCrop(cropDetected);
            return;
        }

        // 🔥 AREA
        if(command.includes("madanapalle")){
            selectArea('Madanapalle',3200,500);
            return;
        }

        if(command.includes("warangal")){
            selectArea('Warangal',3100,800);
            return;
        }

        if(command.includes("kurnool")){
            selectArea('Kurnool',3050,600);
            return;
        }

        // 🔥 DASHBOARD
        if(command.includes("price")){
            showScreen('screen-prices');
            return;
        }

        if(command.includes("weather")){
            showScreen('screen-weather');
            return;
        }

        if(command.includes("profit")){
            showScreen('screen-calculator');
            return;
        }

        speak("Please repeat");
    };

    recognition.start();
}


function calculateProfit() {
    const quantity = Number(document.getElementById('qty').value);
    const investment = Number(document.getElementById('invest').value);
    const transport = Number(document.getElementById('trans').value);

    if (
        document.getElementById('qty').value.trim() === '' ||
        document.getElementById('invest').value.trim() === '' ||
        document.getElementById('trans').value.trim() === '' ||
        !Number.isFinite(quantity) ||
        !Number.isFinite(investment) ||
        !Number.isFinite(transport) ||
        quantity <= 0 ||
        investment < 0 ||
        transport < 0
    ) {
        alert('Please enter a valid quantity, investment, and transport cost.');
        return;
    }

    // Sample selling price per quintal
    const marketPrice = 3200;

    const totalRevenue = quantity * marketPrice;
    const totalCost = investment + transport;
    const profit = totalRevenue - totalCost;

    const result = document.getElementById('calc-result');

    result.innerHTML =
        '<p><strong>Market Price:</strong> ₹' + marketPrice.toLocaleString('en-IN') + ' per quintal</p>' +
        '<p><strong>Total Revenue:</strong> ₹' + totalRevenue.toLocaleString('en-IN') + '</p>' +
        '<p><strong>Investment:</strong> ₹' + investment.toLocaleString('en-IN') + '</p>' +
        '<p><strong>Transport Cost:</strong> ₹' + transport.toLocaleString('en-IN') + '</p>' +
        '<p><strong>Total Cost:</strong> ₹' + totalCost.toLocaleString('en-IN') + '</p>' +
        '<p><strong>Estimated ' + (profit >= 0 ? 'Profit' : 'Loss') +
        ':</strong> ₹' + Math.abs(profit).toLocaleString('en-IN') + '</p>';

    speak(
        currentLang === 'te'
            ? 'అంచనా ' + (profit >= 0 ? 'లాభం ' : 'నష్టం ') + Math.abs(profit) + ' రూపాయలు'
            : currentLang === 'hi'
                ? 'अनुमानित ' + (profit >= 0 ? 'लाभ ' : 'नुकसान ') + Math.abs(profit) + ' रुपये'
                : 'Estimated ' + (profit >= 0 ? 'profit ' : 'loss ') + Math.abs(profit) + ' rupees'
    );
}

function calculateTransport() {
    const distanceInput = document.getElementById('distance');
    const costPerKmInput = document.getElementById('costkm');
    const result = document.getElementById('transport-result');

    const distance = Number(distanceInput.value);
    const costPerKm = Number(costPerKmInput.value);

    if (
        distanceInput.value.trim() === '' ||
        costPerKmInput.value.trim() === '' ||
        !Number.isFinite(distance) ||
        !Number.isFinite(costPerKm) ||
        distance <= 0 ||
        costPerKm < 0
    ) {
        alert('Please enter a valid distance and cost per kilometre.');
        return;
    }

    const totalCost = distance * costPerKm;

    result.innerHTML =
        '<p><strong>Distance:</strong> ' + distance + ' km</p>' +
        '<p><strong>Cost per KM:</strong> ₹' +
        costPerKm.toLocaleString('en-IN') + '</p>' +
        '<p><strong>Total Transport Cost:</strong> ₹' +
        totalCost.toLocaleString('en-IN') + '</p>';

    speak(
        currentLang === 'te'
            ? 'రవాణా ఖర్చు ' + totalCost + ' రూపాయలు'
            : currentLang === 'hi'
                ? 'परिवहन लागत ' + totalCost + ' रुपये'
                : 'Total transport cost is ' + totalCost + ' rupees'
    );
}

let weeklyChart = null;

function loadChart() {
    const canvas = document.getElementById('priceChart');

    if (!canvas) {
        console.error('Weekly graph canvas was not found.');
        return;
    }

    if (typeof Chart === 'undefined') {
        console.error('Chart.js is not loaded.');
        return;
    }

    if (weeklyChart) {
        weeklyChart.destroy();
    }

    weeklyChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday',
                     'Friday', 'Saturday', 'Sunday'],
            datasets: [{
                label: 'Market Price (₹ per quintal)',
                data: [2900, 3000, 2950, 3100, 3050, 3200, 3200],
                borderColor: '#2e7d32',
                backgroundColor: 'rgba(46, 125, 50, 0.15)',
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#2e7d32',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                },
                title: {
                    display: true,
                    text: 'Weekly Market Price Trends'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price (₹ per quintal)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Day'
                    }
                }
            }
        }
    });
}
