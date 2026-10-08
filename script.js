// =====================================================
// AI MATHS SOLVER
// JavaScript - Version 1
// =====================================================


// =====================================================
// 1. GET HTML ELEMENTS
// =====================================================

const questionInput = document.getElementById("question");
const solutionBox = document.getElementById("solution");
const languageSelect = document.getElementById("language");

const solveButton = document.getElementById("solveBtn");
const clearButton = document.getElementById("clearBtn");
const explainButton = document.getElementById("explainBtn");

const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const ocrButton = document.getElementById("ocrBtn");
const ocrStatus = document.getElementById("ocrStatus");


// =====================================================
// 2. HELPER FUNCTION
// =====================================================

function cleanText(text) {
    return text
        .trim()
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/−/g, "-")
        .replace(/²/g, "^2");
}


// =====================================================
// 3. BASIC CALCULATOR
// =====================================================

function calculateExpression(expression) {

    let exp = cleanText(expression);

    // Allow only mathematical characters
    if (!/^[0-9+\-*/().%\s^]+$/.test(exp)) {
        return null;
    }

    try {

        // Convert ^ into **
        exp = exp.replace(/\^/g, "**");

        const result = Function(
            `"use strict"; return (${exp})`
        )();

        if (
            typeof result !== "number" ||
            !Number.isFinite(result)
        ) {
            return null;
        }

        return result;

    } catch (error) {

        return null;
    }
}


// =====================================================
// 4. PERCENTAGE SOLVER
// Example: 25% of 200
// =====================================================

function solvePercentage(text) {

    const match = text.match(
        /(\d+(?:\.\d+)?)\s*%\s*(?:of|का)\s*(\d+(?:\.\d+)?)/i
    );

    if (!match) {
        return null;
    }

    const percentage = parseFloat(match[1]);
    const number = parseFloat(match[2]);

    const result = (percentage / 100) * number;

    return {
        type: "percentage",
        percentage,
        number,
        result
    };
}


// =====================================================
// 5. GREATEST COMMON DIVISOR
// =====================================================

function gcd(a, b) {

    a = Math.abs(a);
    b = Math.abs(b);

    while (b !== 0) {

        const temp = b;
        b = a % b;
        a = temp;
    }

    return a;
}


// =====================================================
// 6. FRACTION SOLVER
// Example: 1/2 + 1/3
// =====================================================

function solveFraction(text) {

    const match = text.match(
        /^\s*(-?\d+)\s*\/\s*(\d+)\s*([+\-*/])\s*(-?\d+)\s*\/\s*(\d+)\s*$/
    );

    if (!match) {
        return null;
    }

    const a = parseInt(match[1]);
    const b = parseInt(match[2]);

    const operator = match[3];

    const c = parseInt(match[4]);
    const d = parseInt(match[5]);

    if (b === 0 || d === 0) {
        return null;
    }

    let numerator;
    let denominator;


    // Addition
    if (operator === "+") {

        numerator = (a * d) + (c * b);
        denominator = b * d;
    }


    // Subtraction
    else if (operator === "-") {

        numerator = (a * d) - (c * b);
        denominator = b * d;
    }


    // Multiplication
    else if (operator === "*") {

        numerator = a * c;
        denominator = b * d;
    }


    // Division
    else if (operator === "/") {

        if (c === 0) {
            return null;
        }

        numerator = a * d;
        denominator = b * c;
    }


    // Simplify fraction
    const divisor = gcd(numerator, denominator);

    numerator /= divisor;
    denominator /= divisor;


    // Keep denominator positive
    if (denominator < 0) {

        numerator *= -1;
        denominator *= -1;
    }


    return {
        type: "fraction",
        numerator,
        denominator
    };
}


// =====================================================
// 7. LINEAR EQUATION SOLVER
// Examples:
// 2x + 5 = 15
// 3x - 7 = 11
// x + 5 = 10
// =====================================================

function solveLinear(text) {

    const equation = cleanText(text)
        .replace(/\s+/g, "");

    if (!equation.includes("=")) {
        return null;
    }

    const parts = equation.split("=");

    if (parts.length !== 2) {
        return null;
    }

    const left = parts[0];
    const right = parts[1];


    // Match ax + b
    const match = left.match(
        /^([+-]?\d*\.?\d*)x([+-]\d*\.?\d*)?$/
    );

    if (!match) {
        return null;
    }


    // Coefficient of x
    let coefficient = match[1];

    if (
        coefficient === "" ||
        coefficient === "+"
    ) {
        coefficient = 1;
    }

    else if (coefficient === "-") {
        coefficient = -1;
    }

    else {
        coefficient = parseFloat(coefficient);
    }


    // Constant
    let constant = 0;

    if (match[2]) {
        constant = parseFloat(match[2]);
    }


    const rightValue = parseFloat(right);

    if (!Number.isFinite(rightValue)) {
        return null;
    }

    if (coefficient === 0) {
        return null;
    }


    // Solve x
    const x = (rightValue - constant) / coefficient;


    return {
        type: "linear",
        coefficient,
        constant,
        rightValue,
        x
    };
}


// =====================================================
// 8. QUADRATIC EQUATION SOLVER
// Example:
// x² + 5x + 6 = 0
// =====================================================

function solveQuadratic(text) {

    let equation = cleanText(text)
        .replace(/\s+/g, "")
        .replace(/x²/g, "x^2");


    if (!equation.includes("=")) {
        return null;
    }

    const parts = equation.split("=");

    if (parts.length !== 2) {
        return null;
    }


    let left = parts[0];
    const right = parseFloat(parts[1]);

    if (!Number.isFinite(right)) {
        return null;
    }


    // Convert x^2 to X2
    left = left.replace(/x\^2/g, "X2");


    let a = 0;
    let b = 0;
    let c = -right;


    // Find coefficient of x²
    const aMatch = left.match(
        /([+-]?\d*\.?\d*)X2/
    );

    if (aMatch) {

        let value = aMatch[1];

        if (
            value === "" ||
            value === "+"
        ) {
            a = 1;
        }

        else if (value === "-") {
            a = -1;
        }

        else {
            a = parseFloat(value);
        }
    }


    // Remove x² term
    let remaining = left.replace(
        /[+-]?\d*\.?\d*X2/,
        ""
    );


    // Find coefficient of x
    const bMatch = remaining.match(
        /([+-]?\d*\.?\d*)x/
    );

    if (bMatch) {

        let value = bMatch[1];

        if (
            value === "" ||
            value === "+"
        ) {
            b = 1;
        }

        else if (value === "-") {
            b = -1;
        }

        else {
            b = parseFloat(value);
        }
    }


    // Find constant
    const cMatch = remaining.match(
        /([+-]\d*\.?\d+)$/
    );

    if (cMatch) {
        c += parseFloat(cMatch[1]);
    }


    if (a === 0) {
        return null;
    }


    // Discriminant
    const discriminant =
        (b * b) - (4 * a * c);


    // No real roots
    if (discriminant < 0) {

        return {
            type: "quadratic",
            a,
            b,
            c,
            discriminant,
            real: false
        };
    }


    // Roots
    const sqrtD = Math.sqrt(discriminant);

    const x1 =
        (-b + sqrtD) / (2 * a);

    const x2 =
        (-b - sqrtD) / (2 * a);


    return {
        type: "quadratic",
        a,
        b,
        c,
        discriminant,
        x1,
        x2,
        real: true
    };
}


// =====================================================
// 9. SMART SOLVER
// =====================================================

function smartSolve(text) {

    const cleanedText = cleanText(text);


    // ---------- Percentage ----------

    const percentageResult =
        solvePercentage(cleanedText);

    if (percentageResult) {
        return percentageResult;
    }


    // ---------- Fraction ----------

    const fractionResult =
        solveFraction(cleanedText);

    if (fractionResult) {
        return fractionResult;
    }


    // ---------- Quadratic Equation ----------

    if (
        cleanedText.includes("x²") ||
        cleanedText.includes("x^2")
    ) {

        const quadraticResult =
            solveQuadratic(cleanedText);

        if (quadraticResult) {
            return quadraticResult;
        }
    }


    // ---------- Linear Equation ----------

    if (
        cleanedText.includes("=") &&
        cleanedText.includes("x")
    ) {

        const linearResult =
            solveLinear(cleanedText);

        if (linearResult) {
            return linearResult;
        }
    }


    // ---------- Normal Calculation ----------

    const calculationResult =
        calculateExpression(cleanedText);

    if (calculationResult !== null) {

        return {
            type: "calculation",
            result: calculationResult
        };
    }


    return null;
}


// =====================================================
// 10. DISPLAY SOLUTION
// =====================================================

function displaySolution(data) {

    const selectedLanguage =
        languageSelect.value;


    // =================================================
    // ENGLISH
    // =================================================

    if (selectedLanguage === "English") {


        // Basic calculation
        if (data.type === "calculation") {

            solutionBox.innerHTML = `
                <strong>Answer:</strong><br><br>
                ${data.result}
            `;

            return;
        }


        // Percentage
        if (data.type === "percentage") {

            solutionBox.innerHTML = `
                <strong>Step 1:</strong>
                Convert percentage into decimal.<br>

                ${data.percentage}% =
                ${data.percentage / 100}

                <br><br>

                <strong>Step 2:</strong>
                Multiply by the number.<br>

                ${data.percentage / 100}
                × ${data.number}

                <br><br>

                <strong>Answer:</strong>
                ${data.result}
            `;

            return;
        }


        // Fraction
        if (data.type === "fraction") {

            solutionBox.innerHTML = `
                <strong>Step 1:</strong>
                Find the common denominator.

                <br><br>

                <strong>Step 2:</strong>
                Perform the fraction operation.

                <br><br>

                <strong>Answer:</strong><br>

                ${data.numerator}/${data.denominator}
            `;

            return;
        }


        // Linear equation
        if (data.type === "linear") {

            solutionBox.innerHTML = `
                <strong>Given:</strong><br>

                ${data.coefficient}x
                + ${data.constant}
                = ${data.rightValue}

                <br><br>

                <strong>Step 1:</strong>
                Move the constant to the other side.

                <br><br>

                <strong>Step 2:</strong>
                Divide by the coefficient of x.

                <br><br>

                <strong>Answer:</strong><br>

                x = ${data.x}
            `;

            return;
        }


        // Quadratic equation
        if (data.type === "quadratic") {

            if (!data.real) {

                solutionBox.innerHTML = `
                    <strong>Discriminant:</strong><br>

                    D = ${data.discriminant}

                    <br><br>

                    Since D &lt; 0,
                    there are no real roots.
                `;

                return;
            }


            solutionBox.innerHTML = `
                <strong>Quadratic Equation:</strong><br>

                ${data.a}x² +
                ${data.b}x +
                ${data.c} = 0

                <br><br>

                <strong>Step 1:</strong><br>

                Calculate the discriminant.

                <br>

                D = b² - 4ac

                <br>

                D = ${data.discriminant}

                <br><br>

                <strong>Step 2:</strong><br>

                Use the quadratic formula.

                <br><br>

                <strong>Answer:</strong><br>

                x₁ = ${data.x1}<br>
                x₂ = ${data.x2}
            `;

            return;
        }
    }


    // =================================================
    // HINDI
    // =================================================

    if (selectedLanguage === "Hindi") {


        // Basic calculation
        if (data.type === "calculation") {

            solutionBox.innerHTML = `
                <strong>उत्तर:</strong><br><br>
                ${data.result}
            `;

            return;
        }


        // Percentage
        if (data.type === "percentage") {

            solutionBox.innerHTML = `
                <strong>चरण 1:</strong>
                प्रतिशत को दशमलव में बदलें।

                <br>

                ${data.percentage}% =
                ${data.percentage / 100}

                <br><br>

                <strong>चरण 2:</strong>
                संख्या से गुणा करें।

                <br>

                ${data.percentage / 100}
                × ${data.number}

                <br><br>

                <strong>उत्तर:</strong>
                ${data.result}
            `;

            return;
        }


        // Fraction
        if (data.type === "fraction") {

            solutionBox.innerHTML = `
                <strong>चरण 1:</strong>
                समान हर ज्ञात करें।

                <br><br>

                <strong>चरण 2:</strong>
                भिन्नों की गणना करें।

                <br><br>

                <strong>उत्तर:</strong><br>

                ${data.numerator}/${data.denominator}
            `;

            return;
        }


        // Linear equation
        if (data.type === "linear") {

            solutionBox.innerHTML = `
                <strong>दिया गया है:</strong><br>

                ${data.coefficient}x
                + ${data.constant}
                = ${data.rightValue}

                <br><br>

                <strong>चरण 1:</strong>
                स्थिर संख्या को दूसरी तरफ ले जाएँ।

                <br><br>

                <strong>चरण 2:</strong>
                x के coefficient से भाग दें।

                <br><br>

                <strong>उत्तर:</strong><br>

                x = ${data.x}
            `;

            return;
        }


        // Quadratic equation
        if (data.type === "quadratic") {

            if (!data.real) {

                solutionBox.innerHTML = `
                    <strong>विभेदक:</strong><br>

                    D = ${data.discriminant}

                    <br><br>

                    क्योंकि D &lt; 0 है,
                    इसलिए वास्तविक मूल नहीं हैं।
                `;

                return;
            }


            solutionBox.innerHTML = `
                <strong>द्विघात समीकरण:</strong><br>

                ${data.a}x² +
                ${data.b}x +
                ${data.c} = 0

                <br><br>

                <strong>चरण 1:</strong><br>

                विभेदक ज्ञात करें।

                <br>

                D = b² - 4ac

                <br>

                D = ${data.discriminant}

                <br><br>

                <strong>चरण 2:</strong><br>

                द्विघात सूत्र का प्रयोग करें।

                <br><br>

                <strong>उत्तर:</strong><br>

                x₁ = ${data.x1}<br>
                x₂ = ${data.x2}
            `;

            return;
        }
    }
}


// =====================================================
// 11. SOLVE BUTTON
// =====================================================

solveButton.addEventListener("click", function () {

    const text =
        questionInput.value.trim();


    // Empty question
    if (text === "") {

        solutionBox.innerHTML = `
            <strong>
                Please enter a maths question.
            </strong>
        `;

        return;
    }


    // Solve question
    const result =
        smartSolve(text);


    // Unsupported question
    if (!result) {

        solutionBox.innerHTML = `
            <strong>Sorry!</strong>
            <br><br>

            This question is not supported
            in Version 1.

            <br><br>

            Try:

            <br>
            • 25 + 10 × 2
            <br>
            • 25% of 200
            <br>
            • 1/2 + 1/3
            <br>
            • 2x + 5 = 15
            <br>
            • x² + 5x + 6 = 0
        `;

        return;
    }


    // Display result
    displaySolution(result);
});


// =====================================================
// 12. CLEAR BUTTON
// =====================================================

clearButton.addEventListener("click", function () {

    questionInput.value = "";

    solutionBox.innerHTML = `
        Your step-by-step solution
        will appear here.
    `;

    imageInput.value = "";

    imagePreview.src = "";

    imagePreview.style.display = "none";

    ocrStatus.textContent = "";
});


// =====================================================
// 13. EXPLAIN MORE BUTTON
// =====================================================

explainButton.addEventListener("click", function () {

    const text =
        questionInput.value.trim();


    if (text === "") {

        solutionBox.innerHTML = `
            Please enter a maths question first.
        `;

        return;
    }


    solutionBox.innerHTML += `
        <hr>

        <strong>💡 Explanation:</strong>

        <br><br>

        The solver identifies the type of
        mathematical problem and applies
        the appropriate formula or
        calculation method step by step.
    `;
});


// =====================================================
// 14. IMAGE PREVIEW
// =====================================================

imageInput.addEventListener("change", function () {

    const file =
        imageInput.files[0];


    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload = function (event) {

        imagePreview.src =
            event.target.result;

        imagePreview.style.display =
            "block";
    };


    reader.readAsDataURL(file);
});


// =====================================================
// 15. OCR - READ QUESTION FROM IMAGE
// =====================================================

ocrButton.addEventListener("click", async function () {

    const file =
        imageInput.files[0];


    // Check image
    if (!file) {

        ocrStatus.textContent =
            "Please upload an image first.";

        return;
    }


    // Check Tesseract
    if (typeof Tesseract === "undefined") {

        ocrStatus.textContent =
            "OCR library could not be loaded.";

        return;
    }


    ocrStatus.textContent =
        "Reading question... Please wait.";


    try {

        const result =
            await Tesseract.recognize(
                file,
                "eng"
            );


        const text =
            result.data.text.trim();


        if (text === "") {

            ocrStatus.textContent =
                "No text found in the image.";

            return;
        }


        // Put OCR text into textarea
        questionInput.value =
            text;


        ocrStatus.textContent =
            "Question successfully read!";


    } catch (error) {

        console.error(error);

        ocrStatus.textContent =
            "Could not read the image. Please try again.";
    }
});


// =====================================================
// AI MATHS SOLVER - END
// =====================================================