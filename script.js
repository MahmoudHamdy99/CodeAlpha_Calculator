(()=> {
    const expressionEl = document.getElementById('expression');
    const resultEl = document.getElementById('result');
    const keys = document.querySelectorAll('.key');

    let expression = '';
    let lastWasEval = false;

    function updateDisplay() {
        expressionEl.textContent = expression;
        resultEl.textContent = computePreview(expression);
    }

    function safeEval(expr) {
        const jsExpr = expr.replace(/÷/g, '/').replace(/×/g, '*').replace(/-/g, '-').replace(/%/g, '/100');
        if(!/^[0-9+\-*/().\s]*$/.test(jsExpr)){
            throw new Error('invalid expression');
        }
        if (!jsExpr.trim()){
            return "";
        }
        const fn = new Function(`return (${jsExpr});`);
        const val = fn();
        if (!isFinite(val)) {
            throw new Error('result is not finite');
        }
        return Math.round((val + Number.EPSILON) * 1e12) / 1e12;
    }

    function computePreview(expr) {
        try {
            const v = safeEval(expr);
            return String(v);
        } catch (e) {
            return '';
        }
    }

    function appendValue(val) {
        if (val === ".") {
            const lastToken = expression.split(/[\+\-×÷\*\/\(\)]/).pop();
            if (lastToken && lastToken.includes(".")) {
                return;
            }
            if (!lastToken) {
                expression += "0";
            }
        }
        if (lastWasEval && /[0-9.]/.test(val)) {
            if (/[\+\-×÷\*\/]$/.test(expression)) {
                 lastWasEval = false
            }else {
                expression = '';
                lastWasEval = false
            } 
            }else if (lastWasEval) {
                lastWasEval = false
            }
            expression += val;
            updateDisplay();
        }
    

    function clearAll() {
        expression = '';
        lastWasEval = false;
        updateDisplay();
    }

    function deleteLast() {
        if (!expression) {
            return;
        }
        expression = expression.slice(0,-1);
        updateDisplay();
    }

    function percentAction() {
        if (!expression) {
            return;
        }
        if (expression.endsWith('%')) {
            return;
        }
        expression += '%';
        updateDisplay();
    }

    function  calculateResult() {
        try {
            const res = safeEval(expression);
            resultEl.textContent = String(res);
            expression = String(res);
            lastWasEval = true;
        } catch (e) {
            resultEl.textContent = 'error';
            lastWasEval = true;
        }
        updateDisplay();
    }

    keys.forEach(k => {
        k.addEventListener('click', ()=> {
            const action = k.dataset.action;
            const val = k.dataset.value;
            if (action === 'clear') {
                return clearAll();
            }
            if (action === 'delete') {
                return deleteLast();
            }
            if (action === 'percent') {
                return percentAction();
            }
            if (action === 'calculate') {
                return calculateResult();
            }
            if (val) {
                appendValue(val);
            }
        })
    })

    window.addEventListener('keydown', (e)=> {
        const key = e.key;
        if (/^[0-9]$/.test(key)) {
            appendValue(key);
            e.preventDefault();
            return;
        }
        if (key === "." || key === ",") {
            appendValue(key);
            e.preventDefault();
            return;
        }
        if (key === "+" || key === "-") {
            appendValue(key);
            e.preventDefault();
            return;
        }
        if (key === "*" || key === "/") {
            appendValue(key === "*" ? "×" : "÷");
            e.preventDefault();
            return;
        }
        if (key === "Enter" || key === "=") {
            calculateResult();
            e.preventDefault();
            return;
        }
        if (key === "Backspaca") {
            deleteLast();
            e.preventDefault();
            return;
        }
        if (key === "Delete" || key.toLowerCase() === "c") {
            clearAll();
            e.preventDefault();
            return;
        }
        if (key === "(" || key === ")") {
            appendValue(key);
            e.preventDefault();
            return;
        }
        if (key === "%") {
            percentAction();
            e.preventDefault();
            return;
        }
    });
    updateDisplay();
})();