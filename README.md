# odin-project-calculator
My solution to the Odin Project Calculator challenge.

Assignment:
    
    1. Your calculator is going to contain functions for all of the basic math operators you typically find on simple calculators, so start by creating functions for the following items and testing them in your browser’s console.
    
        * add
        * subtract
        * multiply
        * divide

    2. Create a new function operate that takes an operator and 2 numbers and then calls one of the above functions on the numbers.

    3. Create a basic HTML calculator with buttons for each digit, each of the above functions and an “Equals” key.

    4. Add a “clear” button.

    5. You’ll need to store the first number that is input into the calculator when a user presses an operator, and also save which operation has been chosen and then operate() on them when the user presses the “=” key.
    You should already have the code that can populate the display, so once operate() has been called, update the display with the ‘solution’ to the operation.

    6. Gotchas: watch out for and fix these bugs if they show up in your code:

       * Users should be able to string together several operations and get the right answer, with each pair of numbers being  evaluated at a time. Your calculator should not evaluate more than a single pair of numbers at a time. If you enter a number then an operator and another number that calculation should be displayed if your next input is an operator. The result of the calculation should be used as the first number in your new calculation.

       * You should round answers with long decimals so that they don’t overflow the screen.

       * Pressing = before entering all of the numbers or an operator could cause problems.

       * Pressing “clear” should wipe out any existing data.

       * Display an error message if the user tries to divide by 0.

    7. Users can get floating point numbers if they do the math required to get one, but they can’t type them in yet. Add a . button and let users input decimals. Make sure you don’t let them type more than one.
       
    8. Make it look nice.

    9. Add a “backspace”, so the user can undo if they click the wrong number.

    10. Add keyboard support!





