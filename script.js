document.addEventListener('DOMContentLoaded', () => {
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

        // Calculate and display percentages
        percent25LbsSpan.textContent = (totalWeightLbs * 0.25).toFixed(2);
        percent25KgSpan.textContent = (totalWeightKg * 0.25).toFixed(2);
        percent50LbsSpan.textContent = (totalWeightLbs * 0.50).toFixed(2);
        percent50KgSpan.textContent = (totalWeightKg * 0.50).toFixed(2);
        percent75LbsSpan.textContent = (totalWeightLbs * 0.75).toFixed(2);
        percent75KgSpan.textContent = (totalWeightKg * 0.75).toFixed(2);

        updateLabels(); // Update labels after calculation
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

    // Initial calculation and label update on page load
    calculateTotalWeight();
    updateLabels();
});
