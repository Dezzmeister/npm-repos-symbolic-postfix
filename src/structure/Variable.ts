import Expression from "./Expression";
import Value from "./Value";
import { EqualComparable } from "@dezzmeister/data-structures";

/**
 * An unknown variable.
 * 
 * @author Joe Desmond
 */
export default class Variable implements Expression {

	/**
	 * The name of this Variable
	 */
	public readonly name: string;

	/**
	 * Creates a Variable with the given case-sensitive name.
	 * 
	 * @param {string} name name of this variable 
	 */
	public constructor(name: string) {
		this.name = name;
	}

	/**
	 * Returns true if this Variable has the name given by the string parameter.
	 * 
	 * @param {string} variable variable name
	 * @return {boolean} true if this Variable is a function of 'variable' (they have the same name)
	 */
	public isFunctionOf(variable: string): boolean {
		return (this.name === variable);
	}

	/**
	 * Returns one if this Variable has the same name as the given variable, and zero if not.
	 * 
	 * @param {string} variable variable to differentiate with respect to
	 * @return {Expression} one or zero
	 */
	public derivative(variable: string): Expression {
		if (this.name === variable) {
			return Value.ONE;
		} else {
			return Value.ZERO;
		}
	}
		
	/**
	 * If a mapping for this Variable exists in 'knowns', returns the mapping.
	 * Otherwise returns this Variable.
	 * 
	 * @param {Map<Variable, Value} knowns known variables
	 * @return {Expression} simplified version of this Variable based on values set in 'knowns'
	 */
	public simplify(knowns: Map<Variable, Value>): Expression {
		if (knowns.has(this)) {
			return knowns.get(this) as Value;
		} else {
			return this;
		}
	}

	/**
	 * Returns true if the provided map does not contain a mapping for this Variable.
	 * 
	 * @param {Map<Variable, Value>} knowns known variables
	 * @return {boolean} false if this Variable exists in the provided map 
	 */
	public hasUnknowns(knowns: Map<Variable, Value>): boolean {
		return !knowns.has(this);
	}

	/**
	 * Returns true if 'other' is also a Variable, and has the same name as this Variable.
	 * 
	 * @param {Expression} other another Expression
	 * @return {boolean} true if 'other' is the same variable as 'this' 
	 */
	public structuralEquals(other: Expression): boolean {
		if (other instanceof Variable) {
			let v = other as Variable;

			return v.name === this.name;
		}

		return false;
	}

	/**
	 * Returns the name of this variable.
	 * 
	 * @return {string} the name of this variable
	 */
	public toString(): string {
		return this.name;
	}

	public hashcode(): number {
		let sum = 0;

		for (let i = 0; i < this.name.length; i++) {
			let code = this.name.charCodeAt(i);

			sum += code;
		}

		return sum;
	}

	public equals(other: EqualComparable): boolean {
		if (other instanceof Variable) {
			return this.structuralEquals(other as Variable);
		}

		return false;
	}
}