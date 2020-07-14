import Addition from "../operations/Addition";
import Expression from "../Expression";
import Multiplication from "../operations/Multiplication";
import { HashableArray } from "@dezzmeister/data-structures";

/*
	Shorthand functions to help build Expression trees.
*/

/**
 * Multiplies the given arguments.
 * 
 * @param {Array<Expression>} args operands
 * @return {Multiplication} the operands, multiplied together
 */
export function multiply(args: Array<Expression>): Multiplication {
	return new Multiplication(HashableArray.from(args));
}

/**
 * Adds the given arguments.
 * 
 * @param {Array<Expression} args addends
 * @return {Addition} the addends, added together
 */
export function plus(args: Array<Expression>): Addition {
	return new Addition(HashableArray.from(args));
}