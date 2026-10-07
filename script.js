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
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    if(screenId === "screen-prices"){
        speak("Showing market prices");
    }

    if(screenId === "screen-weather"){
        speak("Showing weather");
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
