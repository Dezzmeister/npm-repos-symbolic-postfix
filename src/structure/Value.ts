import Expression from "./Expression";
import Variable from "./Variable";
import { EqualComparable } from "@dezzmeister/data-structures";

/**
 * A known numeric constant. Is also an Expression.
 * 
 * @author Joe Desmond
 */
export default class Value implements Expression {

	public static readonly NEGATIVE_ONE = new Value(-1.0);
	public static readonly ZERO = new Value(0.0);
	public static readonly ONE = new Value(1.0);
	public static readonly TWO = new Value(2.0);

	/**
	 * The numeric value
	 */
	public readonly value: number;

	/**
	 * Constructs a Value object with the given numerical value.
	 * 
	 * @param {number} value the actual value
	 */
	public constructor(value: number) {
		this.value = value;
	}

	/**
	 * Returns false, because a constant value is not a function of any variable.
	 * 
	 * @param {string} variable variable name (unused)
	 * @return {boolean} false 
	 */
	public isFunctionOf(variable: string): boolean {
		return false;
	}

	/**
	 * Returns zero, because the derivative of a constant is zero.
	 * 
	 * @param {string} variable unused
	 * @return {Expression} zero (new Value with zero)
	 */
	public derivative(variable: string): Expression {
		return Value.ZERO;
	}
		
	/**
	 * Returns this Value, because a Value cannot be simplified.
	 * 
	 * @param {Map<Variable, Value} knowns unused
	 * @return {Expression} 'this'
	 */
	public simplify(knowns: Map<Variable, Value>): Expression {
		return this;
	}

	/**
	 * Returns false, because a single Value cannot have any unknowns.
	 * 
	 * @param {Map<Variable, Value} knowns known variables (unused)
	 * @return {boolean} false
	 */
	public hasUnknowns(knowns: Map<Variable, Value>): boolean {
		return false;
	}

	/**
	 * If 'other' is a Value, returns true if it has the same numerical value as this Value.
	 * If not, or if 'other' is not a Value, returns false.
	 * 
	 * @param {Expression} other another Expression
	 * @return {boolean} true if 'other' has the same numeric value as this value
	 */
	public structuralEquals(other: Expression): boolean {
		if (other instanceof Value) {
			let v = other as Value;
				return (this.value === v.value);
		}
			return false;
	}

	/**
	 * Returns this Value's numerical value as a string.
	 * 
	 * @return {string} value
	 */
	public toString(): string {
		return this.value.toString();
	}

	public hashcode(): number {
		return this.value;
	}

	public equals(other: EqualComparable): boolean {
		if (other instanceof Value) {
			return this.structuralEquals(other as Value);
		}

		return false;
	}
}