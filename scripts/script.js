// Grab the elements

const displayContainer = document.getElementById('result-display');
const controlsContainer = document.getElementById('controls');
const themeSwitches = document.getElementsByClassName('theme-switch');

// Variables and constants

const controlsContent = [
    ['AC', '+/-', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '-'],
    ['0', '.', '='],
]

var controlElements = {
    'screen':  document.getElementById('screen'),
};

var displayResult = '0';
var operationMode = false;
var inputHistory = [];

let regex = /\d+\.?\d*/g;

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

// Add the keyboard-event listener

let altIsPressed = false;
document.body.addEventListener('keydown', (e) => {
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
    } else if (keyValue === 'ESCAPE' || keyValue === 'C') {
        // User wants to undo the current operation
        if (operationMode) {
            operationMode = false;
            return;
        } 
        // User wants to clear the display
        keyValue = 'AC';
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
document.body.addEventListener('keyup', (e) => {
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

     if (controlTypeName == 'digit') {
        operand(controlName);
    } else if (controlTypeName == 'modificator') {
        modify(controlName);
    } else if (controlTypeName == 'operator') {
        operate(controlName);
    } else {
        // Error
    }

    updateDisplay();
}

// Helper to read the input from 'digit' controls
function operand(inputValue) {
    // Reset the variables for the new input
    if (operationMode || !isDigit(displayResult)) {
        displayResult = '0';
        operationMode = false;
    }

    // Check for attempting to input more than one '.' in a row
    // Also check for attempting to input more than one leading zero
    if (inputValue == '.' && displayResult.slice(-1) == '.' ||
        inputValue == '0' && displayResult == '0') {
            return;
    } else {
        // Check if the input is the first digit
        if (displayResult == '0' && inputValue != '.') {
            displayResult = '';
        }

        // Append the input to the result
        displayResult += inputValue;

        if (displayResult >= Number.MAX_SAFE_INTEGER) {
            displayResult = 'Sorry, your number is out of boundaries :(';
        }
    }
}

// Helper to modify the result
function modify(operation) {
    // Check if can modify the result if the result is '0', 
    // then we don't have to perform any modifications
    // or we're trying to modify non-digit string
    if (displayResult == '0' || (!isDigit(displayResult) && operation != 'AC')) {
        return;
    }

    switch (operation) {
        // Remove the last number
        case 'Remove':
            // Can remove no more characters
            if (displayResult.length == 1) {
                displayResult = '0';
            } else {
                displayResult = displayResult.slice(0, -1);
            }

            break;
        // Reset the display and
        case 'AC':
            // clear everything
            displayResult = '0';
            inputHistory.splice(0, inputHistory.length);
            break;
        // Reflect the display by multiplying by -1
        case '+/-':
            displayResult *= -1;
            break;
        // Convert to percentages by dividing by 100
        case '%':
            // First check if the division doesn't cause to exceed the limit 
            if (displayResult / 100 <= 1 * (10 ** (-95))) {
                displayResult = NaN;
            } else {
                displayResult /= 100
            }
            break;
    }
}

// Handle an arithmetic operation('/', '*', '+', '-', '=')
function operate(operation) {
    if (!isDigit(displayResult)) {
        return;
    }

    if (operation == '=') {
        if (inputHistory.length == 0) { 
            return; 
        } else {
            if (inputHistory.slice(-1) == '=') {
                inputHistory.pop(); // remove the '='
                displayResult = calculate(inputHistory); 
                inputHistory[0] = displayResult; // update the 1st operand
                inputHistory.push('='); // add the '='
            } else {
                // push the current input
                if (inputHistory.slice(-1)[0] instanceof Array) {
                    inputHistory.slice(-1)[0].push(Number(displayResult));
                } else {
                    inputHistory.push(Number(displayResult)); 
                }

                displayResult = calculate(inputHistory);
                
                // Validate
                if (isDigit(displayResult)) {
                    // reconstruct the array
                    if (inputHistory.slice(-1)[0] instanceof Array) {
                        inputHistory.splice(0, inputHistory.length - 1)
                        inputHistory.push(inputHistory[0].slice(-2, -1)[0]);
                        inputHistory.push(inputHistory[0].slice(-1)[0]);
                        inputHistory[0] = displayResult;
                    } else {
                        inputHistory.splice(0, inputHistory.length - 2)
                        inputHistory.unshift(displayResult);
                    }   

                    inputHistory.push('='); // add the '='
                }
            }
        } 
    } else {
        if (inputHistory.length > 0) {
            if (inputHistory.slice(-1) == '=') {
                inputHistory.splice(0, inputHistory.length);
            } else if (operationMode) {
                if (inputHistory.slice(-1)[0] instanceof Array) {
                    inputHistory.slice(-1)[0][inputHistory.slice(-1)[0].length - 1] = operation;
                } else {
                    inputHistory[inputHistory.length - 1] = operation;
                }
                return;
            }
        }
        

        // The first priority operators 
        if (operation == '*' || operation == '/') {
            // Check if it's the first operation in the subarray
            if (inputHistory.length > 0 && !(inputHistory.slice(-1)[0] instanceof Array)) {
                inputHistory.push(new Array());
            } 
            
            // Check if we're dealing with the subarray or not
            if (inputHistory.slice(-1)[0] instanceof Array) {
                // Push the result
                inputHistory.slice(-1)[0].push(Number(displayResult));

                // Check if we can calculate
                if (inputHistory.slice(-1)[0].length >= 3) {
                    displayResult = calculate(inputHistory.slice(-1)[0]);
    
                }

                // Validate the result and add the current operator
                if (isDigit(displayResult)) {
                    inputHistory.slice(-1)[0].push(operation);
                }
            // If this type of operator is the first, then we can just add
            // everything to the array itself
            } else {
                inputHistory.push(Number(displayResult));
                displayResult = calculate(inputHistory);

                if (isDigit(displayResult)) {
                    inputHistory.push(operation);
                }
            }
        // The second priority operators
        } else {            
            // Check if the current input belongs to the part of the 
            // calculation with the higher priority or not
            if (inputHistory.slice(-1)[0] instanceof Array) {
                inputHistory.slice(-1)[0].push(Number(displayResult));
            } else {
                inputHistory.push(Number(displayResult));
            }

            // Check if we can calculate
            if (inputHistory.length >= 3 || inputHistory[0].length >= 3) {
                displayResult = calculate(inputHistory);
            }

            // Validate the result and add the current operator
            if (isDigit(displayResult)) {
                inputHistory.push(operation);
            }
        }

        // Reset the calculation state
        operationMode = true;
    }
}

// The top-level function to iterate through the input and do a calculation
function calculate(input) {
    let result = input[0];

    for (let i = 1; i < input.length - 1; i += 2) {
        if (input[i + 1] instanceof Array) {
            let subResult = calculate(input[i + 1]);
            
            if (input[i] == '+') {
                result += subResult;
            } else {
                result -= subResult;
            }
        } else {
            result = evaluate(result, input[i], input[i + 1]);
        }
    }

    return result;
}

// Sub-component of the function above.
// The main purpose is to do the actual calculation.
function evaluate(a, op, b) {
    let output;
    
    if (op == '/' && b == 0) {
        output = NaN;
    } else {
        let res;
        switch (op) {
            case '/':
                res = String(a / b);
                break;
            case '*':
                res = String(a * b);
                break;
            case '+':
                res = String(a + b);
                break;
            case '-':
                res = String(a - b);
                break;
        }

        if (res < Number.MIN_SAFE_INTEGER || res > Number.MAX_SAFE_INTEGER) {
            output = 'Sorry, your number is out of boundaries :(';
        } else {
            output = res;
        }
    }

    return Number(output);
}

// Helper which updates the display
function updateDisplay() {
    // Update the text content of the 'AC' button
    if (displayResult.length == 1 && inputHistory.length == 0) {
        controlElements['AC'].textContent = 'C';
    } else if (displayResult == '0' && inputHistory.length == 0) {
        controlElements['AC'].textContent = 'AC';
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

// Helper to check if the string is digit
function isDigit(targetStr) {
    return targetStr.toString().match(regex) != null;
}
