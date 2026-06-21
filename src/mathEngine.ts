/**
 * mathEngine.ts
 *
 * A self-contained expression evaluator for the calculator.
 * Uses only JavaScript's built-in Math object — no external math libraries.
 *
 * Pipeline:  tokenize -> shunting-yard (to RPN) -> evaluate RPN
 *
 * Supports:
 *   - + - * / ^  with correct precedence and associativity
 *   - parentheses
 *   - unary minus (e.g. -5, 3 * -2)
 *   - functions: sin cos tan asin acos atan sinh cosh tanh
 *                sqrt log ln  (log = base 10, ln = natural)
 *   - postfix factorial: 5!
 *   - constants: pi, e
 *   - trig works in DEGREES (per the PRD)
 *
 * Anything malformed throws; the caller catches and shows "Error".
 */

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

type TokenType =
  | 'number'
  | 'operator'
  | 'function'
  | 'lparen'
  | 'rparen'
  | 'constant'
  | 'factorial';

interface Token {
  type: TokenType;
  value: string;
}

// Functions take one argument. Trig functions assume degrees.
const FUNCTIONS: Record<string, (x: number) => number> = {
  sin: (x) => Math.sin(x * DEG_TO_RAD),
  cos: (x) => Math.cos(x * DEG_TO_RAD),
  tan: (x) => Math.tan(x * DEG_TO_RAD),
  asin: (x) => Math.asin(x) * RAD_TO_DEG,
  acos: (x) => Math.acos(x) * RAD_TO_DEG,
  atan: (x) => Math.atan(x) * RAD_TO_DEG,
  sinh: (x) => Math.sinh(x),
  cosh: (x) => Math.cosh(x),
  tanh: (x) => Math.tanh(x),
  sqrt: (x) => Math.sqrt(x),
  log: (x) => Math.log10(x),
  ln: (x) => Math.log(x),
};

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
};

interface OpInfo {
  precedence: number;
  rightAssociative: boolean;
  apply: (a: number, b: number) => number;
}

const OPERATORS: Record<string, OpInfo> = {
  '+': { precedence: 2, rightAssociative: false, apply: (a, b) => a + b },
  '-': { precedence: 2, rightAssociative: false, apply: (a, b) => a - b },
  '*': { precedence: 3, rightAssociative: false, apply: (a, b) => a * b },
  '/': {
    precedence: 3,
    rightAssociative: false,
    apply: (a, b) => {
      if (b === 0) throw new Error('Division by zero');
      return a / b;
    },
  },
  '^': { precedence: 4, rightAssociative: true, apply: (a, b) => Math.pow(a, b) },
  // Internal-only unary minus, produced during tokenizing.
  'u-': { precedence: 5, rightAssociative: true, apply: (_a, b) => -b },
};

/** Whitelist of single characters we accept as operators in the raw string. */
function isOperatorChar(ch: string): boolean {
  return ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^';
}

/**
 * Break the expression string into tokens.
 * Handles implicit "unary minus" detection based on the previous token.
 */
function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const prevMeaningful = (): Token | undefined => tokens[tokens.length - 1];

  while (i < expr.length) {
    const ch = expr[i];

    // Skip whitespace.
    if (ch === ' ') {
      i++;
      continue;
    }

    // Numbers (with optional decimal point).
    if ((ch >= '0' && ch <= '9') || ch === '.') {
      let num = '';
      let dotSeen = false;
      while (
        i < expr.length &&
        ((expr[i] >= '0' && expr[i] <= '9') || expr[i] === '.')
      ) {
        if (expr[i] === '.') {
          if (dotSeen) throw new Error('Malformed number');
          dotSeen = true;
        }
        num += expr[i];
        i++;
      }
      if (num === '.') throw new Error('Malformed number');
      tokens.push({ type: 'number', value: num });
      continue;
    }

    // Identifiers: function names or constants (letters).
    if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) {
      let name = '';
      while (
        i < expr.length &&
        ((expr[i] >= 'a' && expr[i] <= 'z') ||
          (expr[i] >= 'A' && expr[i] <= 'Z'))
      ) {
        name += expr[i];
        i++;
      }
      const lower = name.toLowerCase();
      if (lower in FUNCTIONS) {
        tokens.push({ type: 'function', value: lower });
      } else if (lower in CONSTANTS) {
        tokens.push({ type: 'constant', value: lower });
      } else {
        throw new Error(`Unknown identifier: ${name}`);
      }
      continue;
    }

    // Parentheses.
    if (ch === '(') {
      tokens.push({ type: 'lparen', value: '(' });
      i++;
      continue;
    }
    if (ch === ')') {
      tokens.push({ type: 'rparen', value: ')' });
      i++;
      continue;
    }

    // Factorial (postfix).
    if (ch === '!') {
      tokens.push({ type: 'factorial', value: '!' });
      i++;
      continue;
    }

    // Operators.
    if (isOperatorChar(ch)) {
      const prev = prevMeaningful();
      const isUnary =
        ch === '-' &&
        (prev === undefined ||
          prev.type === 'operator' ||
          prev.type === 'lparen' ||
          prev.type === 'function');
      tokens.push({ type: 'operator', value: isUnary ? 'u-' : ch });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: ${ch}`);
  }

  return tokens;
}

/** factorial for non-negative integers (uses Math via Gamma-free loop). */
function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) throw new Error('Invalid factorial');
  if (n > 170) return Infinity; // Beyond double precision range.
  let result = 1;
  for (let k = 2; k <= n; k++) result *= k;
  return result;
}

/** Shunting-yard: convert the token stream to Reverse Polish Notation. */
function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];

  for (const token of tokens) {
    switch (token.type) {
      case 'number':
      case 'constant':
        output.push(token);
        break;

      case 'function':
        stack.push(token);
        break;

      case 'factorial':
        // Postfix operator: applies immediately to the operand already output.
        output.push(token);
        break;

      case 'operator': {
        const o1 = OPERATORS[token.value];
        while (stack.length > 0) {
          const top = stack[stack.length - 1];
          if (top.type === 'function') {
            output.push(stack.pop()!);
            continue;
          }
          if (top.type === 'operator') {
            const o2 = OPERATORS[top.value];
            if (
              o2.precedence > o1.precedence ||
              (o2.precedence === o1.precedence && !o1.rightAssociative)
            ) {
              output.push(stack.pop()!);
              continue;
            }
          }
          break;
        }
        stack.push(token);
        break;
      }

      case 'lparen':
        stack.push(token);
        break;

      case 'rparen': {
        let foundLeft = false;
        while (stack.length > 0) {
          const top = stack.pop()!;
          if (top.type === 'lparen') {
            foundLeft = true;
            break;
          }
          output.push(top);
        }
        if (!foundLeft) throw new Error('Mismatched parentheses');
        // If a function sits on top of the stack, pop it onto output.
        if (
          stack.length > 0 &&
          stack[stack.length - 1].type === 'function'
        ) {
          output.push(stack.pop()!);
        }
        break;
      }
    }
  }

  while (stack.length > 0) {
    const top = stack.pop()!;
    if (top.type === 'lparen' || top.type === 'rparen') {
      throw new Error('Mismatched parentheses');
    }
    output.push(top);
  }

  return output;
}

/** Evaluate an RPN token list to a single number. */
function evalRPN(rpn: Token[]): number {
  const stack: number[] = [];

  for (const token of rpn) {
    switch (token.type) {
      case 'number':
        stack.push(parseFloat(token.value));
        break;

      case 'constant':
        stack.push(CONSTANTS[token.value]);
        break;

      case 'function': {
        if (stack.length < 1) throw new Error('Malformed expression');
        const arg = stack.pop()!;
        stack.push(FUNCTIONS[token.value](arg));
        break;
      }

      case 'factorial': {
        if (stack.length < 1) throw new Error('Malformed expression');
        const arg = stack.pop()!;
        stack.push(factorial(arg));
        break;
      }

      case 'operator': {
        const op = OPERATORS[token.value];
        if (token.value === 'u-') {
          if (stack.length < 1) throw new Error('Malformed expression');
          const b = stack.pop()!;
          stack.push(op.apply(0, b));
        } else {
          if (stack.length < 2) throw new Error('Malformed expression');
          const b = stack.pop()!;
          const a = stack.pop()!;
          stack.push(op.apply(a, b));
        }
        break;
      }

      default:
        throw new Error('Unexpected token in evaluation');
    }
  }

  if (stack.length !== 1) throw new Error('Malformed expression');
  return stack[0];
}

/**
 * Public: evaluate a full expression string.
 * Throws on any malformed input or math error (incl. divide by zero).
 */
export function evaluate(expr: string): number {
  const trimmed = expr.trim();
  if (trimmed === '') throw new Error('Empty expression');

  const tokens = tokenize(trimmed);
  const rpn = toRPN(tokens);
  const result = evalRPN(rpn);

  if (Number.isNaN(result) || !Number.isFinite(result)) {
    throw new Error('Math error');
  }
  return result;
}

/* ------------------------------------------------------------------ *
 *  Standalone scientific helpers (used by single-tap buttons that    *
 *  compute on the current value rather than going into the           *
 *  expression string).                                               *
 * ------------------------------------------------------------------ */

/** Permutations: nPr = n! / (n - r)! */
export function nPr(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) {
    throw new Error('Invalid nPr');
  }
  let result = 1;
  for (let k = n - r + 1; k <= n; k++) result *= k;
  return result;
}

/** Combinations: nCr = n! / (r! (n - r)!) */
export function nCr(n: number, r: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(r) || n < 0 || r < 0 || r > n) {
    throw new Error('Invalid nCr');
  }
  // Use the smaller r for fewer multiplications and better stability.
  const rr = Math.min(r, n - r);
  let numerator = 1;
  let denominator = 1;
  for (let k = 1; k <= rr; k++) {
    numerator *= n - rr + k;
    denominator *= k;
  }
  return Math.round(numerator / denominator);
}

/** Parse a comma/space separated list of numbers for statistics. */
export function parseNumberList(input: string): number[] {
  const parts = input
    .split(/[,\s]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (parts.length === 0) throw new Error('No numbers provided');
  const nums = parts.map((p) => {
    const n = Number(p);
    if (Number.isNaN(n)) throw new Error(`Invalid number: ${p}`);
    return n;
  });
  return nums;
}

export function mean(nums: number[]): number {
  if (nums.length === 0) throw new Error('No data');
  return nums.reduce((sum, x) => sum + x, 0) / nums.length;
}

/** Population variance (divides by N). */
export function variance(nums: number[]): number {
  if (nums.length === 0) throw new Error('No data');
  const m = mean(nums);
  return nums.reduce((sum, x) => sum + (x - m) * (x - m), 0) / nums.length;
}

/** Population standard deviation. */
export function stdDev(nums: number[]): number {
  return Math.sqrt(variance(nums));
}

/**
 * Format a numeric result for display: trims floating-point noise,
 * avoids "-0", and falls back to exponential for very large/small values.
 */
export function formatResult(value: number): string {
  if (Number.isNaN(value) || !Number.isFinite(value)) return 'Error';
  if (value === 0) return '0';

  const abs = Math.abs(value);
  // Use exponential notation outside a comfortable readable range.
  if (abs >= 1e15 || abs < 1e-9) {
    return value.toExponential(6).replace(/\.?0+e/, 'e');
  }

  // Round to ~10 significant-ish digits to kill float noise like 0.30000000004.
  const rounded = parseFloat(value.toPrecision(12));
  let str = String(rounded);
  // Normalise away a stray "-0".
  if (str === '-0') str = '0';
  return str;
}
