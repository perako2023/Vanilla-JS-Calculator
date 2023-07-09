'use strict';

const $keys = document.querySelector('.keys');
const $displayTop = document.querySelector('#display-top');
const $displayMain = document.querySelector('#display-main');

const $clearKey = document.querySelector('[value="clear"]');

let expression = '';
let shouldClearAll = true;

const operatorsRegex = /([+\-*/%])/g; //* all operators excluding parenthesis "( )"

const predictedExpression = () => {
  let result = expression;
  const count =
    (result.match(/\(/g) || '').length - (result.match(/\)/g) || '').length;

  if (count === 0) return expression;

  for (let i = count; i > 0; i--) result += ')';
  return result;
};
const lastTerm = () => expression.match(/[^\D][\d.]*[^\D]?$/) + '';
const endsWithOperator = () => /[+\-*/%]$/.test(expression); //* = true if it ends with operator
const canCalculate = () =>
  expression.match(operatorsRegex) &&
  !endsWithOperator() && //* = true if operators exist but not at the end
  !predictedExpression().match(/\(\)/); //* = true if '()' don't exist
const formatExpression = (expr) =>
  (expr || predictedExpression())
    .replace(operatorsRegex, ' $1 ') //* adding space between operatorsRegex
    .replaceAll('*', '×')
    .replaceAll('/', '÷')
    .replaceAll('-', '–') + '';

$keys.addEventListener('click', (e) => {
  if (!e.target.classList.contains('key')) return; // * making sure key is clicked

  const keyValue = e.target.value;
  const keyClass = e.target.classList.value;
  const keyType = keyClass.match(/function|operator|key/g).slice(-1)[0];

  switch (keyType) {
    case 'function': {
      if (expression === '') return; //* prevent calculator function call if expression is empty
      if (keyValue === 'clear') shouldClearAll ? clear() : erase();
      else if (keyValue === '=') {
        if (calculate()) {
          $clearKey.textContent = 'AC';
          shouldClearAll = true;
        }
        return;
      }
      break;
    }

    case 'operator': {
      if (expression === '' && keyValue.match(operatorsRegex)) return; //* return if expression is empty and keyValue is an operator
      if (expression.endsWith('(')) return;
      if (
        keyValue === ')' &&
        (expression.match(/\(/g) || '').length ===
          (expression.match(/\)/g) || '').length
      )
        return;

      if (
        keyValue === '(' &&
        !endsWithOperator() &&
        expression !== '' && //* expression is not empty
        !expression.match(/\($/) //* expression does NOT end with '('
      ) {
        appendValue('*');
      } else if (endsWithOperator() && keyValue !== '(') erase();

      appendValue(keyValue);
      break;
    }

    default: {
      if (keyValue === '.') {
        if (
          expression === '' || //* expression is empty then return
          expression.endsWith('.') || //* prevent adding '.' after '.'
          endsWithOperator() || //* = true, then return
          lastTerm().includes('.') //* if it already has '.', then return
        )
          return;
      }
      if (expression.endsWith(')')) appendValue('*');

      appendValue(keyValue);
      break;
    }
  }

  expression.length > 2 ||
    ($clearKey.textContent =
      expression.length > 0
        ? ((shouldClearAll = false), 'CE')
        : ((shouldClearAll = true), 'AC'));
});

function appendValue(string) {
  expression += string;
  updateDisplays();
}

function updateDisplays(textTop, textMain) {
  textTop ||= `answer = ${getAnswer()}`;
  textMain ||= formatExpression() || 0;

  $displayTop.textContent = textTop;
  $displayMain.textContent = textMain;

  if (
    (expression.match(/\(/g) || '').length >
    (expression.match(/\)/g) || '').length //* checking if there's more '(' than ')'
  ) {
    textMain =
      formatExpression(expression) +
      predictedExpression()
        .slice(expression.length)
        .replace(/(\)+)$/g, '<span class="auto-closer">$1</span>');
    $displayMain.innerHTML = textMain;
  }
}

function erase() {
  expression = expression.slice(0, -1);
  updateDisplays();
}

function clear() {
  expression = '';
  updateDisplays();
}

function calculate() {
  if (!canCalculate()) return;

  const tTop = formatExpression() + ' =';
  const tMain = getAnswer() || expression;

  updateDisplays(tTop, tMain);
  expression = tMain;

  return 'success';
}

function getAnswer() {
  if (canCalculate()) return eval(predictedExpression()) + '';
  else return '';
}
