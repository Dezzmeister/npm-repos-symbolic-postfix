import Expression from "../Expression";
import Function from "../Function";
import {SplitFunction} from "../Function";
import Variable from "../Variable";
import Value from "../Value";
import Multiplication from "./Multiplication";
import { HashMap, HashableArray } from "@dezzmeister/data-structures";

/**
 * The addition operation, with any number of addends.
 * 
 * @author Joe Desmond
 */
export default class Addition extends Function {

	/**
	 * Maximum number of allowed addends
	 */
	public static readonly MAX_ALLOWED_ARGS:number = 200;

	/**
	 * Creates an instance of the addition operation with the given arguments. At least two arguments are
	 * required, and the number of arguments must not exceed {@link Addition#MAX_ALLOWED_ARGS}.
	 * 
	 * @param {HashableArray<Expression>} args arguments to the addition operation 
	 */
	public constructor(args: HashableArray<Expression>) {
		super("+", args, 2, Addition.MAX_ALLOWED_ARGS, true);
	}

	/**
	 * The derivative of a sum is the sum of the individual derivatives.
	 * 
	 * @param {string} variable variable with which to calculate derivative
	 * @return {Expression} derivative of this Addition 
	 */
	public derivative(variable: string): Expression {
		let derivs = new HashableArray<Expression>();

		for (let i = 0; i < this.args.length; i++) {
			derivs[i] = this.args[i].derivative(variable);
		}

		return new Addition(derivs);
	}

	/**
	 * Traverses the argument tree and tries to extract nested addition operations.
	 * Simplification is not performed on Addition arguments.
	 * 
	 * @param {Map<Variable, Value>} knowns known variables (unused)
	 * @return {SplitFunction} split components of this Addition 
	 */
	public split(knowns: Map<Variable, Value>): SplitFunction {
		let numericalResult = 0;
		let symbolicResult = new HashableArray<Expression>();

		for (let i = 0; i < this.args.length; i++) {
			let arg = this.args[i];

			if (arg instanceof Value) {
				numericalResult += (arg as Value).value;
			} else if (arg instanceof Addition) {
				let nextArgs = (arg as Addition).split(knowns);
				numericalResult += nextArgs.value.value;

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
	 * Simplifies all operands and adds anything that simplifies to a value. If the entire operation can be simplified
	 * to a value, returns a Value. Otherwise returns either an Addition or some other Expression.
	 * 
	 * @param {Map<Variable, Value>} knowns known variables
	 * @return {Expression} simplified version of this addition
	 */
	public simplify(knowns: Map<Variable, Value>): Expression {
		let simplArgs = new HashableArray<Expression>();
		
		for (let i = 0; i < this.args.length; i++) {
			let arg = this.args[i];

			if (arg instanceof Addition) {
				simplArgs.push(arg);
			} else {
				simplArgs.push(arg.simplify(knowns));
			}
		}

		// A version of this Addition with all arguments simplified
		let simplAddition = new Addition(simplArgs);

		// Check if the operation can be fully evaluated
		if (!simplAddition.hasUnknowns(knowns)) {
			let sum = 0;

			for (let i = 0; i < simplArgs.length; i++) {
				sum += (simplArgs[i].simplify(knowns) as Value).value;
			}

			return new Value(sum);
		}

		// Now we need to split the arguments and try to group them

		let splitArgs = simplAddition.split(knowns);
		let exprs = splitArgs.expressions;

		let groups = new HashMap<Expression, number>();

		for (let i = 0; i < exprs.length; i++) {
			let arg = exprs[i];

			if (!groups.has(arg)) {
				groups.put(arg, 1);
			} else {
				let count = groups.get(arg) as number;
				groups.put(arg, count + 1);
			}
		}

		let groupedArgs = new HashableArray<Expression>(groups.size());
		let keys = groups.keys();

		for (let i = 0; i < keys.length; i++) {
			let expr = keys[i];
			let count = groups.get(expr) as number;

			if (count === 1) {
				groupedArgs[i] = expr.simplify(knowns);
			} else {
				groupedArgs[i] = new Multiplication(HashableArray.from([new Value(count), expr])).simplify(knowns);
			}
		}


		if (groupedArgs.length === 0) {
			return splitArgs.value;
		} else {
			if (splitArgs.value.value !== 0) {
				groupedArgs.push(splitArgs.value);
			}

			return new Addition(groupedArgs).groupLikeTerms(knowns);
		}
	}

	private groupLikeTerms(knowns: Map<Variable, Value>): Expression {
		let groups = new HashMap<HashableArray<Expression>, Value>();
		let otherExprs = new HashableArray<Expression>();

		for (let i = 0; i < this.args.length; i++) {
			let arg = this.args[i];

			if (arg instanceof Multiplication) {
				let splitArgs = arg.split(knowns);
				let exprs = splitArgs.expressions;
				let value = splitArgs.value;

				if (!groups.has(exprs)) {
					groups.put(exprs, value);
				} else {
					let oldValue = groups.get(exprs) as Value;
					let newValue = value.value + oldValue.value;

					groups.put(exprs, new Value(newValue));
				}
			} else {
				otherExprs.push(arg);
			}
		}

		let exprsOut = new HashableArray<Expression>();

		for (let entry of groups.keys()) {
			let value = groups.get(entry) as Value;

			if (value.equals(Value.ZERO)) {
				continue;
			} else if (value.equals(Value.ONE)) {
				exprsOut.push(new Multiplication(entry));
			} else {
				let argsOut = new HashableArray<Expression>();
				argsOut.push(value);
				
				for (let i = 0; i < entry.length; i++) {
					argsOut.push(entry[i]);
				}

				exprsOut.push(new Multiplication(argsOut));
			}
		}

		for (let expr of otherExprs) {
			exprsOut.push(expr);
		}

		return new Addition(exprsOut);
	}

	/**
	 * Returns a string containing expressions joined by "+" as an infix operator.
	 * 
	 * @return {string} string representing this addition
	 */
	public toString(): string {
		let out = "(" + this.args[0].toString();

		for (let i = 1; i < this.args.length; i++) {
			out = out + " + " + this.args[i].toString();
		}

		out += ")";

		return out;
	}
}