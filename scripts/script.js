const controlsContent = [
    ['C', '+/-', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '-'],
    ['0', '.', '=']
]

const controlsContainer = document.getElementById('controls');
// # DEBUG
console.log(controlsContainer);

// Draw the calculator
document.body.onload = () => {
    for (let i = 0; i < controlsContent.length; i++) {
        for (let j = 0; j < controlsContent[i].length; j++) {
            // Construct the element
            // Things to include:
            // 1. class attribute value
            // 2. event listener
            // 3. ...
            let control = document.createElement('button');
            let classValue = 'btn ';
            
            // Determine what type of column it is
            if (controlsContent[i][j] === '0') {
                classValue += 'col-6';
            } else {
                classValue += 'col'
            }

            classValue += ' ';
            
            // Determine what type of control it is
            // and add a corresponding class, so we can
            // select by that class in CSS
            if (j === controlsContent.length - 1) {
                // Only if it's the last iteration 
                // of the inner loop
                classValue += 'operators-2';
            } else {
                // The first 3 will always have the 'digits' class
                // except when it's the first iteration and
                // in that case, it's the 'operators-1' class
                if (i === 0) {
                    classValue += 'operators-1';
                } else {
                    classValue += 'digits';
                }
            }

            // Add the class value
            control.className = classValue;

            // Add the text content
            control.textContent = controlsContent[i][j];

            // Append the element to the container
            controlsContainer.appendChild(control);
        }
    }
};

// # DEBUG
console.log(controlsContainer);





