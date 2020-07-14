import Expression from "./Expression";
import Variable from "./Variable";
import Value from "./Value";
import { HashableArray, EqualComparable } from "@dezzmeister/data-structures";

/**
 * A data type representing the components of a Function. This type can be used to extract
 * coefficients from a multiplication, values from an addition, etc.
 */
export type SplitFunction = {

	/**
	 * The symbolic and unsolvable components of the function
	 */
	expressions: HashableArray<Expression>

	/**
	 * The known component of the function (may be zero)
	 */
	value: Value;
}

/**
 * A function with zero or more arguments. Can be used to implement operations such as addition and multiplication.
 * 
 * @author Joe Desmond
 */
export default abstract class Function implements Expression {

	/**
	 * The name of this function
	 */
	public readonly name: string;

	/**
	 * The arguments to this function (mutable; arguments can be added with {@link this#addArgument})
	 */
	public args: HashableArray<Expression>;

	/**
	 * Minimum number of arguments allowed to this Function
	 */
	public readonly minArgs: number;

	/**
	 * Maximum number of arguments allowed to this Function
	 */
	public readonly maxArgs: number;

	/**
	 * True if the order of the arguments doesn't matter
	 */
	public readonly commutativeArgs: boolean;

	/**
	 * Creates a function object with the given name, arguments, minimum allowed arguments, and maximum allowed arguments.
	 * A boolean flag determines if the arguments to the function are commutative.
	 * 
	 * @param name name of this function
	 * @param args arguments to this function
	 * @param minArgs minimum allowed arguments to this function (inclusive)
	 * @param maxArgs maximum allowed arguments to this function (inclusive)
	 * @param commutativeArgs true if the arguments are commutative, false if not
	 */
	protected constructor(name: string, args: HashableArray<Expression>, minArgs: number, maxArgs: number, commutativeArgs: boolean) {
		this.name = name;

		if ((maxArgs < minArgs) || (maxArgs < 0)) {
			throw new RangeError('\'maxArgs\' cannot be less than zero!');
		} 

		this.minArgs = minArgs;
		this.maxArgs = maxArgs;

		if (args.length > maxArgs) {
			throw new RangeError('size of \'args\' must be less than or equal to \'maxArgs\'!');
		}

		if (args.length < minArgs) {
			throw new RangeError('size of \'args\' must be greater than or equal to \'minArgs\'!');
		}

		this.args = args;
		this.commutativeArgs = commutativeArgs;
	}

	/**
	 * Tries to add an argument to this function's argument list. Returns true if the operation is successful.
	 * 
	 * The operation will fail if the maximum number of arguments to this Function has already been reached. 
	 * 
	 * @param {Expression} arg additional argument to function
	 * @return {boolean} true if this operation succeeded, false if not
	 */
	public addArgument(arg: Expression): boolean {
		if (this.args.length < this.maxArgs) {
			this.args.push(arg);
			return true;
		}

		return false;
	}

	/**
	 * Returns true if any of the arguments to this Function are a function of 'variable'.
	 * Traverses the Expression tree and returns true if a Variable object exists with the given name.
	 * 
	 * @param {string} variable variable known
	 * @return {boolean} true if this Function is a function of 'variable'
	 */
	public isFunctionOf(variable: string): boolean {
		for (let i = 0; i < this.args.length; i++) {
			if (this.args[i].isFunctionOf(variable)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Splits this Function into a known value component and unknown symbolic component.
	 * 
	 * @param {Map<Variable, Value>} knowns known variables
	 * @return {SplitFunction} this Function, split into symbolic and valued components
	 */
	public abstract split(known: Map<Variable, Value>): SplitFunction;
		
	public abstract derivative(variable: string): Expression;

	public abstract simplify(knowns: Map<Variable, Value>): Expression;

	public abstract toString(): string;

	/**
	 * Returns true if any of the arguments to this function contain unknowns, given the known variables in 'knowns'.
	 * (Calls 'hasUnknowns()' on each argument)
	 * 
	 * @param {Map<Variable, Value>} knowns known variables
	 * @return true if any of the arguments contain unknowns
	 */
	public hasUnknowns(knowns: Map<Variable, Value>): boolean {
		for (let i = 0; i < this.args.length; i++) {
			if (this.args[i].hasUnknowns(knowns)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Returns true if the other Expression is a Function and has the same arguments 
	 * 
	 * @param {Expression} other another Expression 
	 */
	public structuralEquals(other: Expression): boolean {

		// Ensure that the other expression is a Function
		if (!(other instanceof Function)) {
			return false;
		}

		let otherFunction = other as Function;
			
		// Ensure that both functions have the same number of arguments, and the same names
		if ((this.args.length !== otherFunction.args.length) || (this.name !== otherFunction.name)) {
			return false;
		}

		if (!this.commutativeArgs) {

			// Make sure that the other function has the same arguments in the same order
			for (let i = 0; i < this.args.length; i++) {
				if (this.args[i].structuralEquals(otherFunction.args[i])) {
					return false;
				}
			}

			return true;
		} else {
			// Make sure that the other function has the same arguments in this one, in no particular order.
			// A single Map could be used here; but keys are generated with toString(), which could cause issues.
			// Unfortunately this is an O(n^2) solution

			let argsMap0 = new Map<Expression, boolean>();
			let argsMap1 = new Map<Expression, boolean>();

			for (let i = 0; i < this.args.length; i++) {
				argsMap0.set(this.args[i], false);
				argsMap1.set(otherFunction.args[i], false);
			}

			for (let i = 0; i < otherFunction.args.length; i++) {
				let expr0 = this.args[i];

				let exprMatched = false;
				for (let j = 0; j < otherFunction.args.length; j++) {
					let expr1 = otherFunction.args[j];

					if (expr0.structuralEquals(expr1)) {
						argsMap0.set(expr0, true);
						argsMap1.set(expr1, true);
						exprMatched = true;
						break;
					}
				}

				if (!exprMatched) {
					return false;
				}
			}

			for (let i = 0; i < this.args.length; i++) {
				let expr0 = this.args[i];
				let expr1 = otherFunction.args[i];

				if (!(argsMap0.get(expr0) && argsMap1.get(expr1))) {
					return false;
				}
			}

			return true;
		}			
	}

	public hashcode(): number {
		let sum = 0;

		for (let i = 0; i < this.args.length; i++) {
			sum += this.args[i].hashcode();
		}

		return sum;
	}

	public equals(other: EqualComparable): boolean {
		if (other instanceof Function) {
			return this.structuralEquals(other as Function);
		}

		return false;
	}
}