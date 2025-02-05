import {NumberUtil} from "../util";

export default class Vector2 {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	distanceTo(v: Vector2) {
		return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
	}

	equalsTo(v: Vector2) {
		return (v) ? this.x === v.x && this.y === v.y : false;
	}

	size() {
		return this.distanceTo(new Vector2(0, 0));
	}

	inSize(size: number): Vector2 {
		const currentSize = this.size();
		if (currentSize !== 0) {
			const ratio = size / currentSize;
			return new Vector2(this.x * ratio, this.y * ratio);
		}
		return this;
	}

	round(): Vector2 {
		return new Vector2(Math.round(this.x), Math.round(this.y));
	}

	add(v: Vector2): Vector2 {
		return new Vector2(this.x + v.x, this.y + v.y);
	}

	multiply(s: number): Vector2 {
		return new Vector2(this.x * s, this.y * s);
	}

	subtract(v: Vector2): Vector2 {
		return new Vector2(this.x - v.x, this.y - v.y);
	}

	sub(v: Vector2): Vector2 {
		return this.subtract(v);
	}

	toArray(): number[] {
		return [this.x, this.y];
	}

	static fromArray(arr: number[]) {
		if (typeof arr === 'object' && arr.length === 2) {
			return new Vector2(arr[0], arr[1]);
		}
	}

	clone(): Vector2 {
		return new Vector2(this.x, this.y);
	}

	/***
	 * Return angle between AB and Y axis in radians
	 * @param {Vector2} b
	 * @returns {number}
	 */
	getAngleToYAxis(b: Vector2): number {
		const diff = b.subtract(this);
		const down = diff.y < 0;
		const sinX = diff.x / diff.size();
		const angle = Math.asin(sinX);
		const result = down ?
			Math.PI - angle :
			angle;
		return result || 0;
	}

	getNeighborPositions(size = 1, includeCenter = false) {
		const neighbors = [];
		const maxX = this.x + size;
		for (let x = this.x - size; x <= maxX; x++) {
			const maxY = this.y + size;
			for (let y = this.y - size; y <= maxY; y++) {
				const n = new Vector2(x, y);
				if (includeCenter || !this.equalsTo(n)) {
					neighbors.push(n);
				}
			}
		}
		return neighbors;
	}

	getClosest(positions: Vector2[]): Vector2 | null {
		if ((!positions) || positions.length === 0) return null;
		if (positions.length === 1) return positions[0];
		let closest = positions[0];
		let distance = this.distanceTo(closest);
		for (let i = 1, max = positions.length; i < max; i++) {
			const d = this.distanceTo(positions[i]);
			if (d < distance) {
				closest = positions[i];
				distance = d;
			}
		}
		return closest;
	}

	toString(decimals = 2) {
		return `[${NumberUtil.round(this.x, decimals)},${NumberUtil.round(this.y, decimals)}]`;
	}
}
