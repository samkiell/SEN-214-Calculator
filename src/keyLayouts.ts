import { KeyDef } from './components/Keypad';

/**
 * The standard basic-calculator rows (numbers + 4 operations).
 * These are always shown, in both Basic and Scientific mode.
 */
export const BASIC_ROWS: KeyDef[][] = [
  [
    { label: 'AC', variant: 'utility', action: 'clear' },
    { label: 'DEL', variant: 'utility', action: 'delete' },
    { label: '(', variant: 'operator', insert: '(' },
    { label: ')', variant: 'operator', insert: ')' },
  ],
  [
    { label: '7', insert: '7' },
    { label: '8', insert: '8' },
    { label: '9', insert: '9' },
    { label: '÷', variant: 'operator', insert: '/' },
  ],
  [
    { label: '4', insert: '4' },
    { label: '5', insert: '5' },
    { label: '6', insert: '6' },
    { label: '×', variant: 'operator', insert: '*' },
  ],
  [
    { label: '1', insert: '1' },
    { label: '2', insert: '2' },
    { label: '3', insert: '3' },
    { label: '−', variant: 'operator', insert: '-' },
  ],
  [
    { label: '0', insert: '0', flex: 2 },
    { label: '.', insert: '.' },
    { label: '+', variant: 'operator', insert: '+' },
  ],
  [{ label: '=', variant: 'equals', action: 'equals', flex: 1 }],
];

/**
 * Extra scientific rows, shown ABOVE the basic layout when in Scientific mode.
 * `insert` values map onto the tokens the math engine understands
 * (functions append "name(" so the user can type the argument).
 */
export const SCIENTIFIC_ROWS: KeyDef[][] = [
  [
    { label: 'sin', variant: 'function', insert: 'sin(' },
    { label: 'cos', variant: 'function', insert: 'cos(' },
    { label: 'tan', variant: 'function', insert: 'tan(' },
    { label: 'π', variant: 'function', insert: 'pi' },
    { label: 'e', variant: 'function', insert: 'e' },
  ],
  [
    { label: 'sin⁻¹', variant: 'function', insert: 'asin(' },
    { label: 'cos⁻¹', variant: 'function', insert: 'acos(' },
    { label: 'tan⁻¹', variant: 'function', insert: 'atan(' },
    { label: 'x²', variant: 'function', insert: '^2' },
    { label: 'xʸ', variant: 'function', insert: '^' },
  ],
  [
    { label: 'sinh', variant: 'function', insert: 'sinh(' },
    { label: 'cosh', variant: 'function', insert: 'cosh(' },
    { label: 'tanh', variant: 'function', insert: 'tanh(' },
    { label: '√', variant: 'function', insert: 'sqrt(' },
    { label: 'n!', variant: 'function', insert: '!' },
  ],
  [
    { label: 'log', variant: 'function', insert: 'log(' },
    { label: 'ln', variant: 'function', insert: 'ln(' },
    { label: 'nPr', variant: 'function', action: 'nPr' },
    { label: 'nCr', variant: 'function', action: 'nCr' },
    { label: 'x̄', variant: 'function', action: 'stats-mean' },
  ],
  [
    { label: 'σ²', variant: 'function', action: 'stats-var' },
    { label: 'σ', variant: 'function', action: 'stats-std' },
  ],
];
