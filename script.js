document.addEventListener('DOMContentLoaded', () => {
    console.log('Tabs container:', document.querySelector('.tabs')); // Debugging log
    const barTypeRadios = document.querySelectorAll('input[name="bar"]');
    const unitRadios = document.querySelectorAll('input[name="unit"]');
    const plateInputs = {
        black: document.getElementById('black'),
        green: document.getElementById('green'),
        yellow: document.getElementById('yellow'),
        blue: document.getElementById('blue'),
        red: document.getElementById('red')
    };
    const totalLbsSpan = document.getElementById('totalLbs');
    const totalKgSpan = document.getElementById('totalKg');
    const percent25LbsSpan = document.getElementById('percent25Lbs');
    const percent25KgSpan = document.getElementById('percent25Kg');
    const percent50LbsSpan = document.getElementById('percent50Lbs');
    const percent50KgSpan = document.getElementById('percent50Kg');
    const percent75LbsSpan = document.getElementById('percent75Lbs');
    const percent75KgSpan = document.getElementById('percent75Kg');
    const saveResultButton = document.getElementById('saveResult');
    const savedResultsTable = document.getElementById('savedResultsTable'); // Changed from List to Table
    const clearSavedResultsButton = document.getElementById('clearSavedResults');
    const movementSelect = document.getElementById('movementSelect');
    // Removed filterMovementSelect
    const bodyWeightKgInput = document.getElementById('bodyWeightKg');
    const bodyWeightPercentageSpan = document.getElementById('bodyWeightPercentage');
    const loadInput = document.getElementById('loadInput'); // New: Get load input
    const loadUnitRadios = document.querySelectorAll('input[name="loadUnit"]'); // New: Get load unit radios
    const loadEvolutionChartCanvas = document.getElementById('loadEvolutionChart'); // New: Get chart canvas
    let loadChart; // Declare chart variable globally or in a scope accessible by update function

    const BAR_WEIGHTS_LBS = {
        male: 45,
        female: 35
    };

    const PLATE_WEIGHTS_LBS = {
        black: 10,
        green: 25,
        yellow: 35,
        blue: 45,
        red: 55
    };

    const LBS_TO_KG_FACTOR = 0.453592;

    function getSelectedUnit() {
        let selectedUnit = 'lbs';
        unitRadios.forEach(radio => {
            if (radio.checked) {
                selectedUnit = radio.value;
            }
        });
        return selectedUnit;
    }

    function updateLabels() {
        const currentUnit = getSelectedUnit();

        // Update bar type labels
        const maleBarLabel = document.querySelector('label input[value="male"]').parentNode;
        const femaleBarLabel = document.querySelector('label input[value="female"]').parentNode;

        maleBarLabel.childNodes[2].textContent = ` Masculina (${currentUnit === 'lbs' ? BAR_WEIGHTS_LBS.male + 'lb' : (BAR_WEIGHTS_LBS.male * LBS_TO_KG_FACTOR).toFixed(2) + 'kg'})`;
        femaleBarLabel.childNodes[2].textContent = ` Feminina (${currentUnit === 'lbs' ? BAR_WEIGHTS_LBS.female + 'lb' : (BAR_WEIGHTS_LBS.female * LBS_TO_KG_FACTOR).toFixed(2) + 'kg'})`;

        // Update plate labels
        for (const color in PLATE_WEIGHTS_LBS) {
            const weightLbs = PLATE_WEIGHTS_LBS[color];
            const weightDisplay = currentUnit === 'lbs' ? `${weightLbs}lb` : `${(weightLbs * LBS_TO_KG_FACTOR).toFixed(2)}kg`;
            document.querySelector(`label[for="${color}"]`).textContent = `${color.charAt(0).toUpperCase() + color.slice(1)} (${weightDisplay}):`;
        }
    }

    function getSelectedLoadUnit() {
        let selectedLoadUnit = 'lbs';
        loadUnitRadios.forEach(radio => {
            if (radio.checked) {
                selectedLoadUnit = radio.value;
            }
        });
        return selectedLoadUnit;
    }

    function updateLoadLabel() {
        const currentLoadUnit = getSelectedLoadUnit();
        document.querySelector('label[for="loadInput"]').textContent = `Carga (${currentLoadUnit}):`;
    }

    function calculateTotalWeight() {
        let totalWeightLbs = 0;

        // Get bar weight
        let selectedBarType = 'male';
        barTypeRadios.forEach(radio => {
            if (radio.checked) {
                selectedBarType = radio.value;
            }
        });
        totalWeightLbs += BAR_WEIGHTS_LBS[selectedBarType];

        // Add plate weights (each plate is added to both sides, so multiply by 2)
        for (const color in plateInputs) {
            const quantity = parseInt(plateInputs[color].value);
            if (!isNaN(quantity) && quantity > 0) {
                totalWeightLbs += (quantity * PLATE_WEIGHTS_LBS[color] * 2);
            }
        }

        const totalWeightKg = totalWeightLbs * LBS_TO_KG_FACTOR;

        totalLbsSpan.textContent = totalWeightLbs.toFixed(2);
        totalKgSpan.textContent = totalWeightKg.toFixed(2);

        // Calculate and display percentage of body weight
        const bodyWeightKg = parseFloat(bodyWeightKgInput.value);
        if (!isNaN(bodyWeightKg) && bodyWeightKg > 0) {
            const percentage = (totalWeightKg / bodyWeightKg) * 100;
            bodyWeightPercentageSpan.textContent = `${percentage.toFixed(2)}%`;
        } else {
            bodyWeightPercentageSpan.textContent = '0%';
        }

        // Calculate and display percentages
        percent25LbsSpan.textContent = (totalWeightLbs * 0.25).toFixed(2);
        percent25KgSpan.textContent = (totalWeightKg * 0.25).toFixed(2);
        percent50LbsSpan.textContent = (totalWeightLbs * 0.50).toFixed(2);
        percent50KgSpan.textContent = (totalWeightKg * 0.50).toFixed(2);
        percent75LbsSpan.textContent = (totalWeightLbs * 0.75).toFixed(2);
        percent75KgSpan.textContent = (totalWeightKg * 0.75).toFixed(2);

        updateLabels(); // Update labels after calculation
    }

    function saveResult() {
        const currentLbs = parseFloat(totalLbsSpan.textContent);
        const currentKg = parseFloat(totalKgSpan.textContent);
        const savedResults = JSON.parse(localStorage.getItem('lpoResults')) || [];

        const selectedMovement = movementSelect.value;
        if(selectedMovement === 'all') {
            return;
        }
        
        const bodyWeightKg = parseFloat(bodyWeightKgInput.value);
        const loadValue = parseFloat(loadInput.value);
        const selectedLoadUnit = getSelectedLoadUnit();

        let loadLbs = 0;
        let loadKg = 0;

        if (!isNaN(loadValue)) {
            if (selectedLoadUnit === 'lbs') {
                loadLbs = loadValue;
                loadKg = loadValue * LBS_TO_KG_FACTOR;
            } else { // kg
                loadKg = loadValue;
                loadLbs = loadValue / LBS_TO_KG_FACTOR;
            }
        }

        const newResult = {
            movement: selectedMovement,
            lbs: currentLbs,
            kg: currentKg,
            bodyWeightKg: bodyWeightKg, // Save body weight
            loadLbs: loadLbs, // Save load in lbs
            loadKg: loadKg, // Save load in kg
            date: new Date().toLocaleString()
        };

        savedResults.push(newResult);
        localStorage.setItem('lpoResults', JSON.stringify(savedResults));
        loadSavedResults(); // Refresh the displayed list
    }

    function loadSavedResults() {
        const tbody = savedResultsTable.querySelector('tbody');
        tbody.innerHTML = ''; // Clear current table body

        const savedResults = JSON.parse(localStorage.getItem('lpoResults')) || [];
        const selectedFilterMovement = movementSelect.value; // Use movementSelect for filtering

        const movements = new Set();
        movements.add('all'); // Add "Todos os Movimentos" option

        let filteredResults = savedResults;
        if (selectedFilterMovement !== 'all') {
            filteredResults = savedResults.filter(result => result.movement === selectedFilterMovement);
        }

        if (filteredResults.length === 0) {
            const tr = document.createElement('tr');
            const td = document.createElement('td');
            td.colSpan = 5; // Span all columns (Data, Movimento, Peso Corporal, Carga lbs, Carga kg)
            td.textContent = 'Nenhum resultado salvo ainda para este filtro.';
            tr.appendChild(td);
            tbody.appendChild(tr);
        } else {
            filteredResults.forEach(result => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${result.date}</td>
                    <td>${result.movement}</td>
                    <td>${result.bodyWeightKg ? result.bodyWeightKg.toFixed(1) : 'N/A'}</td>
                    <td>${result.loadLbs ? result.loadLbs.toFixed(2) : 'N/A'}</td>
                    <td>${result.loadKg ? result.loadKg.toFixed(2) : 'N/A'}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Update chart data
        const chartLabels = filteredResults.map(result => new Date(result.date).toDateString());
        console.log(filteredResults)
        const chartData = filteredResults.map(result => result.loadKg);

        if (loadChart) {
            loadChart.data.labels = chartLabels;
            loadChart.data.datasets[0].data = chartData;
            loadChart.update();
        } else {
            // This part should ideally not be reached if chart is initialized on DOMContentLoaded
            // but as a fallback or if chart is created dynamically
            loadChart = new Chart(loadEvolutionChartCanvas, {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'Carga (kg)',
                        data: chartData,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: 'category',
                            title: {
                                display: true,
                                text: 'Data'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Carga (kg)'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Populate filter dropdown with unique movements (still using movementSelect)
        savedResults.forEach(result => movements.add(result.movement));
        // movementSelect.innerHTML = ''; // Clear existing options
        // movements.forEach(movement => {
        //     const option = document.createElement('option');
        //     option.value = movement;
        //     option.textContent = movement === 'all' ? 'Todos os Movimentos' : movement;
        //     movementSelect.appendChild(option);
        // });
        // movementSelect.value = selectedFilterMovement; // Keep the selected filter
    }

    function clearSavedResults() {
        localStorage.removeItem('lpoResults');
        loadSavedResults(); // Clear the displayed list
    }

    // Add event listeners to bar type radios
    barTypeRadios.forEach(radio => {
        radio.addEventListener('change', calculateTotalWeight);
    });

    // Add event listeners to plate inputs
    for (const color in plateInputs) {
        plateInputs[color].addEventListener('input', calculateTotalWeight);
    }

    // Add event listeners to unit radios
    unitRadios.forEach(radio => {
        radio.addEventListener('change', calculateTotalWeight);
    });

    // Add event listeners for save/clear buttons
    saveResultButton.addEventListener('click', saveResult);
    clearSavedResultsButton.addEventListener('click', clearSavedResults);

    // Add event listener for movement select to filter results
    movementSelect.addEventListener('change', loadSavedResults);

    // Add event listener for body weight input
    bodyWeightKgInput.addEventListener('input', () => {
        localStorage.setItem('bodyWeightKg', bodyWeightKgInput.value); // Save body weight
        calculateTotalWeight(); // Recalculate on body weight change
    });

    // Add event listeners for plate increment/decrement buttons
    const plateButtons = document.querySelectorAll('.plate-btn');
    plateButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const plateColor = event.target.dataset.plate;
            const action = event.target.dataset.action;
            const plateInput = plateInputs[plateColor];
            let currentValue = parseInt(plateInput.value) || 0;

            if (action === 'increment') {
                currentValue++;
            } else if (action === 'decrement') {
                currentValue = Math.max(0, currentValue - 1);
            }
            plateInput.value = currentValue;
            calculateTotalWeight();
        });
    });

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    console.log('tabButtons:', tabButtons); // Debugging log
    console.log('tabContents:', tabContents); // Debugging log

    function showTab(tabId) {
        console.log('Showing tab:', tabId); // Debugging log
        tabContents.forEach(content => {
            content.classList.remove('active');
        });
        tabButtons.forEach(button => {
            button.classList.remove('active');
        });

        const targetTabContent = document.getElementById(tabId);
        const targetTabButton = document.querySelector(`.tab-button[data-tab="${tabId.replace('-tab', '')}"]`);

        if (targetTabContent) {
            targetTabContent.classList.add('active');
        }
        if (targetTabButton) {
            targetTabButton.classList.add('active');
        }

        if (tabId === 'history-tab') {
            loadSavedResults(); // Ensure history is loaded when tab is active
        }
    }

    tabButtons.forEach(button => {
        console.log('Attaching listener to button:', button); // Debugging log
        button.addEventListener('click', (event) => {
            const tabId = event.target.dataset.tab + '-tab';
            console.log('Tab button clicked, tabId:', tabId); // Debugging log
            showTab(tabId);
        });
    });

    // Add event listener for load unit radios
    loadUnitRadios.forEach(radio => {
        radio.addEventListener('change', updateLoadLabel);
    });

    // Initial setup on page load
    const savedBodyWeight = localStorage.getItem('bodyWeightKg');
    if (savedBodyWeight) {
        bodyWeightKgInput.value = savedBodyWeight;
    }
    calculateTotalWeight();
    updateLabels();
    updateLoadLabel(); // New: Update load label on page load

    // Initialize Chart.js
    loadChart = new Chart(loadEvolutionChartCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Carga (kg)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Data'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Carga (kg)'
                    },
                    beginAtZero: true
                }
            }
        }
    });

    showTab('calculator-tab'); // Show calculator tab by default
});
