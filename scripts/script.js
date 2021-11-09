/**
 * The DOM-element is used to display a result of calculations or of an input.
 */
const elDisplayContainer = document.getElementById('result-display');
/**
 * The DOM-element is a container for the control-elements.
 */
const elControlsContainer = document.getElementById('controls');
/**
 * The collection of DOM-elements for the theme switches.
 */
const elThemes = document.getElementsByClassName('theme-switch');

/**
 * The matrix is used to fill-out the text-content of the control-elements.
 */
const controlsContent = [
    ['AC', '+/-', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '-'],
    ['0', '.', '='],
]

/**
 * An object-container which stores the references to the constructed
 * control-elements.
 */
var controlElements = {
    'screen':  document.getElementById('screen'),
};

/**
 * The variable is used as a storage of previous calculations or 
 * as a display of an input.
 */
var displayResult = '0'; 

/**
 * The variable stores the name of the last pressed arithmetic operator, which is used only
 * to add or remove the class 'active' on that operator.
 */
var lastOperator = '';

/**
 * The flag which indicates if the last control pressed was a digit or an
 * arithmetic operator. In the case when it's true we need to replace the last operator
 * with the current one.
 */
var operationMode = false;

/**
 * A storage of digits and operators, which are used for calculations.
 */
var inputHistory = [];

/**
 * A regex-pattern which is used to change a theme-element's class name.
 */
let patternTheme = /theme-\d+/;

/**
 * A regex-pattern which is used to validate a calculated result.
 */
let patternDigit = /\d+\.?\d*/;

/**
 * A regex-pattern which is used to check if the decimal part has repeating pattern.
 */
let patternRepeat = /\d+\.(\d){1,2}\1+$/ ; 


/**
 * The loop constructs control-elements, and adds them to the controls-container.
 */
for (let i = 0; i < controlsContent.length; i++) {
    for (let j = 0; j < controlsContent[i].length; j++) {
        let control = document.createElement('button');
        let controlType = '';
        let controlName = controlsContent[i][j];

        let classValue = '';

        if (j == controlsContent[i].length - 1) {
            classValue = 'operator';
        } else {
            if (i == 0) {
                classValue = 'modifier';
            } else {
                classValue  = 'digit';
            }
        }

        controlType = classValue;

        classValue += ' btn '
        
        if (controlName == '0') {
            classValue += 'col-6';
        } else {
            classValue += 'col'
        }

        classValue += ' '

        classValue += 'theme-1';

        control.className = classValue;
        control.textContent = controlName;

        control.addEventListener('click', () => {
            handleInput(controlType, controlName);
        });

        controlElements[control.textContent] = control;
        elControlsContainer.appendChild(control);
    }
}

/**
 * The lines below are adding keyboard-support for the controls.
 */

let altIsPressed = false; // used to detect the shortcut "alt/option + '-'"
document.body.addEventListener('keydown', (e) => {
    let keyValue = e.key.toUpperCase(); // grab the key

    /**
     * Check for the key modifiers being pressed
     * If it's 'SHIFT' we don't need to handle it,
     * if it's 'ALT' we just set our flag variable to 'true'.
     */
    if (keyValue == 'ALT') {
        altIsPressed = true;
        return;
    }

    if (keyValue == 'SHIFT') {
        return;
    }

    
    /**
     * Handle the special keys which can be used as the secondary key for a control
     */
    if (keyValue == 'ENTER') {
        keyValue = '=';
    } else if (keyValue == 'ESCAPE' || keyValue == 'C') {
        if (keyValue == 'ESCAPE' && operationMode) { // User wants to undo the current operation
            // remove the focus from the current operator
            // ...
            operationMode = false;
            return;
        } else { // User wants to clear the display
            keyValue = 'AC';
        }
    /**
     * A hidden control which doesn't have an associated button
     * and has to be invoked manually.
     */
    } else if (keyValue == 'BACKSPACE') {
        keyValue = 'Remove';
        handleInput('modifier', keyValue);
    }

    /**
     * Check for the special control '+/-, which can be triggered only with 
     * the shortcut 'Alt(Windows) or Option(Mac)' key pressed and the '-' key.
     */
    if (altIsPressed && keyValue == '–') {
        keyValue = '+/-';
    }
    
    if (Object.keys(controlElements).includes(keyValue)) { // Validate the key
        controlElements[keyValue].click(); 
    }
});

/**
 * The key-event listener to reset the state of the flag 
 * when the key-modifier 'Alt(Windows) or Option(Mac)' is being released.
 */
document.body.addEventListener('keyup', (e) => {
    if (e.key.toUpperCase() == 'ALT') {
        altIsPressed = false;
    }
});

/**
 * The event listener for the theme switches
 */
for (let i = 0; i < elThemes.length; i++) {
    elThemes[i].addEventListener('click', () => {
        setTheme(elThemes[i].id);
    });
}

/**
 * Helper for setting a theme, which iterates over the control elements
 * and replaces a theme substring of a class name with a new theme substring.
 */
function setTheme(themeName) {
    for (key in controlElements) {
        let control = controlElements[key];
        let newClass = control.className.replace(patternTheme, themeName);
        control.className = newClass;
    }
}


/**
 * The main control center, which receives an input and redirects it to an appropriate handler
 * The mechanics is simple: 
 *       user presses one of the controls -> 
 *       event being fired on the corresponding control -> 
 *       the data of the control is passed to the handler below ->  
 *       the control input value is then being passed to an appropriate sub-handler -> 
 *       the input is being handled -> 
 *       the state of the script is updated ->
 *       the display is updated
 */
function handleInput(controlTypeName, controlName) {
     if (controlTypeName == 'digit') {
        handleDigit(controlName);
    } else if (controlTypeName == 'modifier') {
        handleModifier(controlName);
    } else if (controlTypeName == 'operator') {
        handleArithmetic(controlName);
    }

    updateDisplay(controlName);
}

/**
 * The sub-handler which handles all the digit inputs 0, 1, 3, 4, 5, 6, 7, 8, 9 and '.'.
 * It receives an input in form of a digit and then adds it to a variable which stores
 * a result being display.
 */
function handleDigit(inputValue) {
    if (operationMode || !isDigit(displayResult)) { // Reset the variables for the new input
        displayResult = '0';
        operationMode = false;
    }

    if (inputValue == '.' && displayResult.slice(-1) == '.' || // Validate the input
        inputValue == '0' && displayResult == '0') {
            return;
    } else {
        if (displayResult == '0' && inputValue != '.') {
            displayResult = '';
        }

        displayResult += inputValue; // Append the input

        if (displayResult >= Number.MAX_SAFE_INTEGER) {
            displayResult = 'Sorry, your number is out of boundaries :(';
        }
    }
}

/**
 * The sub-handler for modifying the current input.
 * It receives an operation-modifier like 'C', '+/-', '%' or 'Remove', 
 */
function handleModifier(operation) {
    if (operation != 'AC' && (displayResult == '0' || !isDigit(displayResult))){
        return;
    }

    switch (operation) {
        case 'Remove':
            if (displayResult.length == 1) {
                displayResult = '0';
            } else {
                displayResult = displayResult.slice(0, -1);
            }
            break;
        case 'AC':
            displayResult = '0';
            inputHistory.splice(0, inputHistory.length);
            break;
        case '+/-':
            displayResult *= -1;
            break;
        case '%':
            if (displayResult / 100 <= 1 * (10 ** (-95))) {
                displayResult = NaN;
            } else {
                displayResult /= 100
            }
            break;
    }
}

/**
 * The sub-handler which handles the arithmetic operations like +, -, *, / and =.
 * When being called the handler determines the operation:
 * There are two conditions when determining the operation:
 *      1. If the operator is '=', the special operator which requires a special handling; 
 *      2. If the operator is '*', '/', '+', or '-'.
 */
function handleArithmetic(operation) {
    if (!isDigit(displayResult)) {
        return;
    }

    if (operation == '=') {
        if (inputHistory.length == 0) { 
            return; 
        } else if (inputHistory.slice(-1) == '=') {
            inputHistory.pop();
            displayResult = helpCalculate(inputHistory);
            inputHistory[0] = displayResult;
            inputHistory.push('=');
        } else {
            if (inputHistory.slice(-1)[0] instanceof Array) {
                inputHistory.slice(-1)[0].push(Number(displayResult));
            } else {
                inputHistory.push(Number(displayResult)); 
            }

            displayResult = helpCalculate(inputHistory);
            
            if (isDigit(displayResult)) {
                if (inputHistory.slice(-1)[0] instanceof Array) {
                    inputHistory.splice(0, inputHistory.length - 1);
                    inputHistory.push(inputHistory[0].slice(-2, -1)[0]);
                    inputHistory.push(inputHistory[0].slice(-1)[0]);
                    inputHistory[0] = displayResult;
                } else {
                    inputHistory.splice(0, inputHistory.length - 2)
                    inputHistory.unshift(displayResult);
                }   
            }
                
            inputHistory.push('=');
            operationMode = true;
        }  
        
    } else {
        if (inputHistory.length > 0) {
            if (inputHistory.slice(-1) == '=') {
                inputHistory.splice(0, inputHistory.length);
            } else if (operationMode) {
                if (inputHistory.slice(-1)[0] instanceof Array) {
                    inputHistory.slice(-1)[0][inputHistory.slice(-1)[0].length - 1] = operation;
                } else {
                    if (operation == '/' || operation == '*') {
                        inputHistory.splice(0, inputHistory.length - 1); 
                        inputHistory.unshift(displayResult);
                    }
                    inputHistory[inputHistory.length - 1] = operation;
                }
                return;
            }
        }

        if (operation == '*' || operation == '/') {
            if (inputHistory.length > 0 && !(inputHistory.slice(-1)[0] instanceof Array)) {
                inputHistory.push(new Array());
            } 
            
            if (inputHistory.slice(-1)[0] instanceof Array) {
                inputHistory.slice(-1)[0].push(Number(displayResult));

                if (inputHistory.slice(-1)[0].length >= 3) {
                    displayResult = helpCalculate(inputHistory.slice(-1)[0]); 
    
                }

                if (isDigit(displayResult)) {
                    inputHistory.slice(-1)[0].push(operation);
                }
            } else {
                inputHistory.push(Number(displayResult));
                displayResult = helpCalculate(inputHistory);

                if (isDigit(displayResult)) {
                    inputHistory.push(operation);
                }
            }
        } else {            
            if (inputHistory.slice(-1)[0] instanceof Array) {
                inputHistory.slice(-1)[0].push(Number(displayResult));
            } else {
                inputHistory.push(Number(displayResult));
            }

            if (inputHistory.length >= 3 || inputHistory[0].length >= 3) {
                displayResult = helpCalculate(inputHistory);
            }

            if (isDigit(displayResult)) {
                inputHistory.push(operation);
            }
        }

        operationMode = true;
    }
}

/**
 * The helper iterates through an input-array and evaluates the result.
 */
function helpCalculate(input) {
    let result = input[0];

    for (let i = 1; i < input.length - 1; i += 2) {
        if (input[i + 1] instanceof Array) {
            let subResult = helpCalculate(input[i + 1]);
            
            if (input[i] == '+') {
                result += subResult;
            } else {
                result -= subResult;
            }
        } else {
            result = helpEvaluate(result, input[i], input[i + 1]);
        }
    }

    return result;
    
}

/**
 * The helper evaluates an expression of the form 'a (operator) b' and validates the result.
 */
function helpEvaluate(a, op, b) {
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

/**
 * The specific-purpose function which updates content of the DOM-elements.
 */
function updateDisplay(currentInput) {
    if (displayResult == '0' && inputHistory.length == 0) {
        controlElements['AC'].textContent = 'AC';
    } else {
        controlElements['AC'].textContent = 'C';
    }

    if (lastOperator != '') {
        controlElements[lastOperator].classList.remove('active');
    }

    if (operationMode) {
        if (currentInput == '/' || currentInput == '*' || 
            currentInput == '+' || currentInput == '-' || currentInput == '=') {

            controlElements[currentInput].classList.add('active');
            lastOperator = currentInput;
        } else {
            lastOperator = '';
        }
    }

    if (isDigit(displayResult)) {
        if (!Number.isInteger(Number(displayResult))) {
            if (isRepeating(displayResult)) {
                displayResult = Number(displayResult).toFixed(2).toString();
            } else if (displayResult.length > 16) {
                let decimalLength = 16 - displayResult.slice(0, displayResult.indexOf('.')).length - 1;
                displayResult = Number(displayResult).toFixed(decimalLength).toString();
            }
        }
    }

    elDisplayContainer.textContent = displayResult;
}

/**
 * Validates if the given string is digit.
 */
function isDigit(targetStr) {
    return targetStr.toString().match(patternDigit) != null;
}

/**
 * Checks if the decimal part has repeating pattern
 */
function isRepeating(targetStr) {
    return targetStr.toString().match(patternRepeat) != null;
}