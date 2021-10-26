// Grab the elements

const displayContainer = document.getElementById('result-display');
const controlsContainer = document.getElementById('controls');
const themeSwitches = document.getElementsByClassName('theme-switch');

// Variables and constants

const controlsContent = [
    ['C', '+/-', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '-'],
    ['0', '.', '='],
]

var controlElements = {
    'screen':  document.getElementById('screen'),
};

var displayResult = '';
var displayFontSize = 2;
var canOperate = true;
var invalidOperation = false;
var inputHistory = [];


// Draw the calculator
for (let i = 0; i < controlsContent.length; i++) {
    for (let j = 0; j < controlsContent[i].length; j++) {
        // Construct the element
        // Things to include:
        // 1. class attribute value
        // 2. event listener
        // 3. group id
        let control = document.createElement('button');
        let controlType = '';
        let controlName = controlsContent[i][j];
        
        // Construct the class
        let classValue = '';

        // Determine what type of control it is
        // and add a corresponding class, so we can
        // select by that class in CSS
        if (j === controlsContent[i].length - 1) {
            // Only if it's the last iteration 
            // of the inner loop
            classValue = 'operator';
        } else {
            // The first 3 will always have the 'digits' class
            // except when it's the first iteration and
            // in that case, it's the 'operators-1' class
            if (i === 0) {
                classValue = 'modificator';
            } else {
                classValue  = 'digit';
            }
        }

        controlType = classValue;

        classValue += ' btn '
        
        // Determine what type of column it is
        if (controlName === '0') {
            classValue += 'col-6';
        } else {
            classValue += 'col'
        }

        classValue += ' '

        // Add the theme
        classValue += 'theme-1';

        // Set the class value
        control.className = classValue;

        // Set the text content
        control.textContent = controlName;

        // Add the event listener
        control.addEventListener('click', () => {
            // Forward the handling of the input to the handler
            handleInput(controlType, controlName);
        });

        // Store the element for further use
        controlElements[control.textContent] = control;

        // Append the element to the container
        controlsContainer.appendChild(control);
    }
}

// Get ready to listen for events
controlElements['0'].focus();

// Add the keyboard-event listener

let altIsPressed = false;
controlsContainer.addEventListener('keydown', (e) => {
    let keyValue = e.key.toUpperCase();

    // Check for the key modifiers being pressed

    if (keyValue === 'ALT') {
        altIsPressed = true;
        return;
    }

    if (keyValue === 'SHIFT') {
        return;
    }

    // Check for the controls which have two keys
    // which can invoke the control

    if (keyValue === 'ENTER') {
        keyValue = '=';
    } else if (keyValue === 'ESCAPE') {
        keyValue = 'C';
    // A hidden control which doesn't have an associated button
    // and has to be invoked manually
    } else if (keyValue === 'BACKSPACE') {
        keyValue = 'Remove';
        handleInput('modificator', keyValue);
    }

    // Check for the special control '+/-, which can be triggered only with 
    // the shortcut 'Alt(Windows) or Option(Mac)' key pressed and the '-' key.
    if (altIsPressed && keyValue === '–') {
        keyValue = '+/-';
    }
    
    // Check if the key is associated with any of the controls
    if (Object.keys(controlElements).includes(keyValue)) {
        controlElements[keyValue].focus();
        controlElements[keyValue].click();
    }
});

// Add the key-event listener to reset the state of the flag 
// when the key-modifier 'Alt(Windows) or Option(Mac)' is being released
controlsContainer.addEventListener('keyup', (e) => {
    if (e.key.toUpperCase() === 'ALT') {
        altIsPressed = false;
    }
});

// Add the event listener for the theme switches
for (let i = 0; i < themeSwitches.length; i++) {
    themeSwitches[i].addEventListener('click', () => {
        setTheme(themeSwitches[i].id);
    });
}

// Handles a click event of any control
function handleInput(controlTypeName, controlName) {
     // Check the input type

     if (controlTypeName === 'digit') {
        operand(controlName);
    } else if (controlTypeName === 'modificator') {
        modify(controlName);
    } else if (controlTypeName === 'operator') {
        operate(controlName);
    } else {
        // Error
    }

    updateDisplay();
}

// Helper to read the input from 'digit' controls
function operand(inputValue) {
    // Check if the input is being made after an operation
    if (canOperate === false) {
        displayResult = '0';
        canOperate = true;
    }

    // Check for attempting to input more than one '.' in a row
    // Also check for attempting to input more than one leading zero
    if (inputValue === '.' && displayResult.slice(-1) === '.' ||
        inputValue === '0' && displayResult === '0') {
            return;
    } else {
        // Check if the input is the first digit
        if (displayResult === '0') {
            displayResult = '';
        }

        // Append the input to the result
        displayResult += inputValue;
    }
}

// Helper to modify the result
function modify(operation) {
    // Check if can modify the result if the result is '0', 
    // then we don't have to perform any modifications
    // or we trying to modify the 'Not a number' display string
    if (displayResult === '0' || (displayResult === 'Not a number' && operation != 'C')) {
        return;
    }

    switch (operation) {
        case 'Remove':
            // Can remove no more characters
            if (displayResult.length === 1) {
                displayResult = '0';
            } else {
                displayResult = displayResult.slice(0, -1);
            }

            break;
        case 'C':
            // Reset the display and
            // clear the input history
            displayResult = '0';
            inputHistory.splice(0, inputHistory.length);
            
            break;
        case '+/-':
            // Reflect the display by multiplying by -1
            displayResult *= -1;
            break;
        case '%':
            // Convert to percentages by dividing by 100
            
            // First check if the division doesn't cause to exceed the limit 
            if (displayResult / 100 <= 1 * (10 ** (-95))) {
                invalidOperation = true;
                canOperate = false;
            } else {
                displayResult /= 100
            }
            break;
    }
}

// Helper to operate on the result
function operate(operation) {
    // TODO

    if (canOperate){

        if (invalidOperation) {
            invalidOperation = false;
        }

    } else {
        inputHistory.push(operation);
    }


}

// Helper which performs the calculation
function calculate(input) {
    // TODO
}

// Helper which updates the display
function updateDisplay() {
    // Check for the length of the result displayed
    // in order to dynamically fit the content

    // Check if the max number of characters
    // was reached, if yes reset the display and ...
    if (displayResult.length === 50) {
        displayResult = '0';
    } else if(invalidOperation && !canOperate) {
        displayResult = 'Not a number';
    }

    // Check if we need to reset the standdart font size
    // when the number of characters is less than 16 again
    if (displayResult.length <= 16 && displayFontSize < 2) {
        displayFontSize = 2;
        displayContainer.style.fontSize = displayFontSize + 'rem';
    } 

    // Check if the content fits on the display
    // if not adjust the font size and check again
    while (displayContainer.clientWidth > (controlElements['screen'].clientWidth * 0.9)) {
        displayContainer.style.fontSize = displayFontSize + 'rem';
        displayFontSize -= 0.01;
    }

    displayContainer.textContent = displayResult;
}

// Helper for setting a theme
function setTheme(themeName) {
    for (key in controlElements) {
        let control = controlElements[key];
        // Replace the current theme with the new one
        let pattern = /theme-\d+/;
        let newClass = control.className.replace(pattern, themeName);
        control.className = newClass;
    }
}




