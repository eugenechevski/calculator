const controlsContent = [
    ['C', '+/-', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '+'],
    ['1', '2', '3', '-'],
    ['0', '.', '=']
]
const controlsContainer = document.getElementById('controls');
var controlElements = [document.getElementById('screen')];



// Draw the calculator
for (let i = 0; i < controlsContent.length; i++) {
    for (let j = 0; j < controlsContent[i].length; j++) {
        // Construct the element
        // Things to include:
        // 1. class attribute value
        // 2. event listener
        // 3. group id
        let control = document.createElement('button');

        // Determine what type of control it is
        // and add a corresponding class, so we can
        // select by that class in CSS
        if (j === controlsContent[i].length - 1) {
            // Only if it's the last iteration 
            // of the inner loop
            control.id = 'operators-2';
        } else {
            // The first 3 will always have the 'digits' class
            // except when it's the first iteration and
            // in that case, it's the 'operators-1' class
            if (i === 0) {
                control.id = 'operators-1';
            } else {
                control.id = 'digits';
            }
        }

        // Construct the class
        let classValue = 'btn';

        classValue += ' ';

        // Determine what type of column it is
        if (controlsContent[i][j] === '0') {
            classValue += 'col-6';
        } else {
            classValue += 'col'
        }

        classValue += ' '

        // Add the theme
        classValue += 'theme-1';

        // ...

        // Set the class value
        control.className = classValue;

        // Set the text content
        control.textContent = controlsContent[i][j];

        // # DEBUG
        console.log(control);

        // Store the element for further use
        controlElements.push(control);

        // Append the element to the container
        controlsContainer.appendChild(control);
    }
}


// Helper for setting a theme
function setTheme(themeName) {
    controlElements.forEach(control => {
        // Remove the last theme-2
        control.className.replace('theme-\d+', themeName);
    });
}




