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

        if (displayResult >= Number.MAX_SAFE_INTEGER) {
            displayResult = '0';
        }
    }
}

// Helper to modify the result
function modify(operation) {
    // Check if can modify the result if the result is '0', 
    // then we don't have to perform any modifications
    // or we're trying to modify non-digit string
    if (displayResult === '0' || (displayResult.match(/\d+/) === null && operation != 'C')) {
        return;
    }

    switch (operation) {
        // Remove the last number
        case 'Remove':
            // Can remove no more characters
            if (displayResult.length === 1) {
                displayResult = '0';
            } else {
                displayResult = displayResult.slice(0, -1);
            }

            break;
            // Reset the display and
        case 'C':
            // clear the input history
            displayResult = '0';
            controlElements['C'].textContent = 'AC';
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
                displayResult = 'Not a number';
            } else {
                displayResult /= 100
            }
            break;
    }
}

// Handle an arithmetic operation('/', '*', '+', '-', '=')
function operate(operation) {
    // We can't operate on not a digit
    if (displayResult.match(/\d+/) === null) { 
        return; 
    // Special condition when the user invoke the '=' operator, which 
    // requires the special handling
    } else if (operation === '=') {
        // Ensure the user isn't trying to push a number after division by zero
        if (inputHistory.slice(1) === ['/', '0']){
            displayResult = 'Not a number';
        // The user tries to calculate the number on itself
        } else if (inputHistory.length === 0) {
            return;
        // A special case when the user inputted an operator after an operand
        // and then invoked the '=' operator, in this case we're simply using
        // the first operand as the second operand: operand1 -> operator -> '=' -> operand1 operator operand1.
        // After that we're removing the result from the input history array, in the case if the user decides
        // to invoke the '=' operator again, then we can use the first operand to calculate the new result based 
        // on the previous result: operand1 -> operator -> '=' -> calculate([operand1 operator operand1]) ->
        // '=' -> calculate([operand1 operator (operand1 operator operand1)]).
        } else if (inputHistory.length === 2 && !canOperate) {
            inputHistory.push(displayResult);
            displayResult = calculate(inputHistory);

            if (displayResult.match(/\d+/) != null) {
                inputHistory.pop();
            }
        // The most common case when the user has inputted operand1 -> operator -> operand2
        // and invoked the '=' operator to get the result.
        } else {
            // The first time the user has invoked the '=' operator
            if (inputHistory.length === 2) {
                inputHistory.push(displayResult);
            }

            displayResult = calculate(inputHistory);
            if (displayResult.match(/\d+/) != null) {
                // Here we're substituting the first operand with the the result 
                // just in case if the user decides to invoke the '=' operator again
                // in that case we'll be simply calculating the result with the same
                // second operand.
                inputHistory[0] = displayResult;
            }
        }
    // One of the operators('/', '*', '+', '-') was invoked after an input of an operand
    } else if (canOperate) {
        // In the case when the user is invoking an operation after the '=' operation
        // or the user divided by zero, we need to clean the input history array
        if (inputHistory.length === 3) {
            inputHistory.splice(0, 3);
        }

        // Add the new inputted operand
        inputHistory.push(displayResult);

        // See if we're ready to calculate the result
        if (inputHistory.length === 3) {
            displayResult = calculate(inputHistory);

            // If the calculation is successful clean the array, then 
            // add the result of the calculation and the current operator
            if (displayResult.match(/\d+/) != null) {
                inputHistory.splice(0, 3);
                inputHistory.push(displayResult);
            } else {
                return;
            }
        }
        
        inputHistory.push(operation);

        // Set the state to not operable, so the user can't
        // add two operation consecutively
        canOperate = false;
    } else {
        // User invokes an operation after an operation,
        // just substitute the last operation with the current one.
        inputHistory.pop();
        inputHistory.push(operation);
    }

}

// The place where the calculation is done
function calculate(input) {
    let output = '';

    // Immediately check if we have division by zero
    if (input.splice(1) === ['/', '0']){
        output = 'Not a number';
    } else {
        let a = inputHistory[0];
        let operation = inputHistory[1];
        let b = inputHistory[2];
        
        switch(operation) {
            case '/':
                if (a / b < Number.MIN_SAFE_INTEGER || a / b > Number.MAX_SAFE_INTEGER) {
                    output = 'Sorry, your number is out boundaries :(';
                } else {
                    output = a / b;
                }
                break;
            case '*':
                if (a * b < Number.MIN_SAFE_INTEGER || a / b * Number.MAX_SAFE_INTEGER) {
                    output = 'Sorry, your number is out boundaries :(';
                } else {
                    output = a * b;
                }
                break;
            case '+':
                if (a + b < Number.MIN_SAFE_INTEGER || a + b > Number.MAX_SAFE_INTEGER) {
                    output = 'Sorry, your number is out boundaries :(';
                } else {
                    output = a + b;
                }
                break;
            case '-':
                if (a - b < Number.MIN_SAFE_INTEGER || a - b > Number.MAX_SAFE_INTEGER) {
                    output = 'Sorry, your number is out boundaries :(';
                } else {
                    output = a - b;
                }
                break;
        }

    }

    return output;
}

// Helper which updates the display
function updateDisplay() {
    
    /*
    // Check for the length of the result displayed
    // in order to dynamically fit the content

    // Check if the max number of characters
    // was reached, if yes reset the display and ...
    if (displayResult.length === 50) {
        displayResult = '0';
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

    */

    if (controlElements['C'].textContent === 'AC') {
        controlElements['C'].textContent = 'C';
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




