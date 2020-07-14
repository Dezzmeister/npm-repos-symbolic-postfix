import Variable from "./Variable";
import Value from "./Value";
import { Hashable, EqualComparable } from "@dezzmeister/data-structures";

/**
 * A high-level mathematical expression. Has a recursive structure consisting of Values, Variables, and Functions.
 * 
 * @author Joe Desmond
 */
export default interface Expression extends Hashable {

	/**
	 * Returns true if this Expression is a function of the given variable.
	 * 
	 * @param {string} variable variable name
	 * @return {boolean} true if this Expression depends on 'variable'
	 */
	isFunctionOf(variable: string): boolean;
		
	/**
	 * Returns the symbolic derivative of this Expression with respect to the given variable.
	 * 
	 * @param {string} variable variable to differentiate with respect to
	 * @return {Expression} the derivative of this expression with respect to 'variable'
	 */
	derivative(variable: string): Expression;

	/**
	 * Simplifies this Expression given a set of known variables.
	 * 
	 * @param {Map<Variable, Value>} knowns known variables
	 * @return {Expression} simplified version of this Expression
	 */
	simplify(knowns: Map<Variable, Value>): Expression;

	/**
	 * Returns true if this Expression has any unknowns (i.e., variables without mappings
	 * in 'knowns'). If this function returns false, then 'simplify()' should return a single Value.
	 * 
	 * @param {Map<Variable, Value>} knowns known variables
	 * @return {boolean} true if this Expression contains any unknown variables
	 */
	hasUnknowns(knowns: Map<Variable, Value>): boolean;

	/**
	 * Returns true if this Expression has the same structure as 'other',
	 * and the same value (without evaluating).
	 * 
	 * @param {Expression} other other Expression to check equality with
	 * @return {boolean} true if 'other' is structurally equal to this Expression
	 */
	structuralEquals(other: Expression): boolean;

	/**
	 * Returns a string representing the expression.
	 * 
	 * @return {string} human-readable version of this Expression
	 */
	toString(): string;
	
	/**
	 * Calculates a hashcode for this Expression. Inherited from Hashable.
	 * 
	 * @return {number} hashcode
	 */
	hashcode(): number;
	
	/**
	 * Returns true if this Expression is equal to another. Equality may be determined using 
	 * 'structuralEquals()' or another method. Inherited from Hashable.
	 * 
	 * @param {EqualComparable} other another object
	 * @return {boolean} true if this is logically equal to 'other' 
	 */
	equals(other: EqualComparable): boolean;
}