import Expression from "../Expression";
import Function from "../Function";
import { SplitFunction } from "../Function";
import Variable from "../Variable";
import Value from "../Value";
import { plus, multiply } from "../builder/ShorthandFunctions";
import { HashableArray } from "@dezzmeister/data-structures";

/**
 * The multiplication operation, with any number of operands.
 * 
 * @author Joe Desmond
 */
export default class Multiplication extends Function {

	/**
	 * Maximum number of allowed operands
	 */
	public static readonly MAX_ALLOWED_ARGS:number = 200;

	/**
	 * Creates an instance of the multiplication operation with the given arguments. At least two arguments are
	 * required, and the number of arguments must not exceed {@link Multiplication#MAX_ALLOWED_ARGS}.
	 * 
	 * @param {HashableArray<Expression>} args arguments to the multiplication operation 
	 */
	public constructor(args: HashableArray<Expression>) {
		super("*", args, 2, Multiplication.MAX_ALLOWED_ARGS, true);
	}

	/**
	 * Returns the derivative of this multiplication chain, calculated by extending the product rule
	 * to expressions with an arbitrary number of terms.
	 * 
	 * @param {string} variable variable to calculate derivative with respect to
	 * @return {Expression} the unsimplified derivative of this Multiplication
	 */
	public derivative(variable: string): Expression {		
		let derivTerms = new HashableArray<Expression>();
		
		for (let i = 0; i < this.args.length; i++) {
			let operands = new HashableArray<Expression>();

			for (let j = 0; j < this.args.length; j++) {
				if (j === i) {
					operands[j] = this.args[i].derivative(variable);
				} else {
					operands[j] = this.args[i];
				}
			}

			derivTerms[i] = multiply(operands);
		}

		return plus(derivTerms);
	}

	/**
	 * Traverses the argument tree and tries to extract nested multiplication operations.
	 * Simplification is not performed on Multiplication arguments.
	 * 
	 * @param {Map<Variable, Value>} knowns known variables (unused)
	 * @return {SplitFunction} split components of this Addition 
	 */
	public split(knowns: Map<Variable, Value>): SplitFunction {
		let numericalResult = 1;
		let symbolicResult = new HashableArray<Expression>();

		for (let i = 0; i < this.args.length; i++) {
			let arg = this.args[i];

			if (arg instanceof Value) {
				numericalResult *= (arg as Value).value;
			} else if (arg instanceof Multiplication) {
				let nextArgs = (arg as Multiplication).split(knowns);
				numericalResult *= nextArgs.value.value;

				for (let j = 0; j < nextArgs.expressions.length; j++) {
					symbolicResult.push(nextArgs.expressions[j]);
				}
			} else {
				symbolicResult.push(arg.simplify(knowns));
			}
		}

		let out:SplitFunction = {
			expressions: symbolicResult,
			value: new Value(numericalResult)
		};

		return out;
	}

	/**
	 * TODO: Implement this
	 * 
	 * @param {Map<Variable, Value>} knowns known variables
	 * @return {Expression} simplified version of this multiplication
	 */
	public simplify(knowns: Map<Variable, Value>): Expression {
		let simplArgs = new HashableArray<Expression>();
		
		for (let i = 0; i < this.args.length; i++) {
			let arg = this.args[i];

			if (arg instanceof Multiplication) {
				simplArgs.push(arg);
			} else {
				simplArgs.push(arg.simplify(knowns));
			}
		}

		// A version of this Multiplication with all arguments simplified
		let simplMult = new Multiplication(simplArgs);

		// Check if the operation can be fully evaluated
		if (!simplMult.hasUnknowns(knowns)) {
			let product = 0;

			for (let i = 0; i < simplArgs.length; i++) {
				product *= (simplArgs[i].simplify(knowns) as Value).value;
			}

			return new Value(product);
		}

		let splitArgs = simplMult.split(knowns);
		let exprs = splitArgs.expressions;

		if (splitArgs.value.value === 0) {
			return Value.ZERO;
		}

		if (exprs.length === 0) {
			return splitArgs.value;
		} else if (exprs.length === 1) {
			if (splitArgs.value.value === 1) {
				return exprs[0];
			}

			exprs.push(splitArgs.value);
			return new Multiplication(exprs);
		} else {
			if (splitArgs.value.value === 1) {
				return new Multiplication(exprs);
			}

			exprs.push(splitArgs.value);
			return new Multiplication(exprs);
		}
	}

	/**
	 * Returns a string containing expressions joined by "*" as an infix operator.
	 * 
	 * @return {string} string representing this multiplication
	 */
	public toString(): string {
		let out = "(" + this.args[0].toString();

		for (let i = 1; i < this.args.length; i++) {
			out = out + " * " + this.args[i].toString();
		}

		out += ")";

		return out;
	}
}